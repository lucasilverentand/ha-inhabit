"""Transition predictor for zone-chaining and phantom presence.

When a person disappears from one room (mmWave/motion clears), the
TransitionPredictor injects temporary "phantom presence" into adjacent
rooms to keep them active. This prevents lights turning off prematurely
in hallways and corridors when someone moves between rooms.

Key features:
- Topology-weighted prediction (dead-end rooms get higher phantom weight)
- Transit room detection (hallways get shorter hold times)
- Seal-aware suppression (sealed rooms suppress phantom in neighbours)
- Door event re-activation (door opening instantly creates phantom)
- Zone-to-zone prediction via polygon proximity
"""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass, field
from datetime import datetime
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_call_later

from ..const import (
    DEFAULT_TRANSIT_PHANTOM_HOLD,
    PHANTOM_ZONE_PROXIMITY_THRESHOLD,
    OccupancyState,
)

if TYPE_CHECKING:
    from collections.abc import Callable

    from ..models.floor_plan import Floor
    from ..store.floor_plan_store import FloorPlanStore

_LOGGER = logging.getLogger(__name__)


@dataclass
class PhantomPresence:
    """A temporary predicted presence injected into a room/zone."""

    source_id: str  # Room/zone where the person was last detected
    target_id: str  # Room/zone that gets phantom presence
    probability: float  # Initial probability (topology-weighted, 0.0-1.0)
    hold_seconds: float  # How long phantom stays active
    created_at: datetime = field(default_factory=datetime.now)
    reason: str = ""

    @property
    def elapsed(self) -> float:
        """Seconds since phantom was created."""
        return (datetime.now() - self.created_at).total_seconds()

    @property
    def remaining(self) -> float:
        """Seconds remaining before phantom expires."""
        return max(0.0, self.hold_seconds - self.elapsed)

    @property
    def is_expired(self) -> bool:
        """Check if phantom has expired."""
        return self.elapsed >= self.hold_seconds

    @property
    def current_probability(self) -> float:
        """Get decaying probability (linear decay over hold_seconds)."""
        if self.is_expired:
            return 0.0
        return self.probability * (1.0 - self.elapsed / self.hold_seconds)


@dataclass
class DoorLink:
    """A door that connects two rooms/zones."""

    door_edge_id: str
    entity_id: str | None  # HA door sensor entity
    room_a: str  # Room/zone ID on one side
    room_b: str  # Room/zone ID on the other side

    def other_side(self, room_id: str) -> str | None:
        """Get the room on the other side of this door."""
        if room_id == self.room_a:
            return self.room_b
        if room_id == self.room_b:
            return self.room_a
        return None


class TransitionPredictor:
    """Predicts occupancy transitions and manages phantom presence.

    Sits alongside the MultiRoomReasoner in the VirtualSensorEngine.
    While MultiRoomReasoner does backward inference (room B occupied →
    room A was probably left), TransitionPredictor does forward prediction
    (room A being left → rooms B,C might be entered next).
    """

    def __init__(
        self,
        hass: HomeAssistant,
        store: FloorPlanStore,
        get_seal_state: Callable[[str], bool] | None = None,
        set_room_occupied: Callable[[str, str], None] | None = None,
        get_learned_weight: Callable[[str, str, int | None], float] | None = None,
    ) -> None:
        """Initialize the transition predictor.

        Args:
            hass: Home Assistant instance.
            store: Floor plan store for topology data.
            get_seal_state: Callback returning True if a room is sealed.
            set_room_occupied: Callback to push a room to OCCUPIED state.
            get_learned_weight: Callback to get learned transition weight.
        """
        self.hass = hass
        self._store = store
        self._get_seal_state = get_seal_state
        self._set_room_occupied = set_room_occupied
        self._get_learned_weight = get_learned_weight

        # Active phantom presences: target_id -> PhantomPresence
        self._phantoms: dict[str, PhantomPresence] = {}

        # Phantom expiry timers: target_id -> cancel callback
        self._phantom_timers: dict[str, Callable[[], None]] = {}

        # Door-room mapping: door_entity_id -> DoorLink
        self._door_links: dict[str, DoorLink] = {}

        # All door links (including those without entity_ids): edge_id -> DoorLink
        self._all_door_links: dict[str, DoorLink] = {}

        # Adjacency graph: room_id -> set of adjacent room_ids
        self._adjacency: dict[str, set[str]] = {}

        # Transit room detection cache: room_id -> bool
        self._transit_cache: dict[str, bool] = {}

        # Room config cache: room_id -> (is_transit_override, phantom_hold_seconds)
        self._room_config: dict[str, tuple[bool | None, int]] = {}

        # Zone adjacency (derived from polygon proximity)
        self._zone_adjacency: dict[str, set[str]] = {}

        # Current room states for reasoning
        self._room_states: dict[str, str] = {}

        self._running = False

    @property
    def phantoms(self) -> dict[str, PhantomPresence]:
        """Get active phantom presences."""
        return dict(self._phantoms)

    @property
    def door_links(self) -> dict[str, DoorLink]:
        """Get door-room links (keyed by entity_id)."""
        return dict(self._door_links)

    async def async_start(self) -> None:
        """Start the predictor: build topology data."""
        if self._running:
            return
        self._running = True
        self._build_topology()
        _LOGGER.info(
            "TransitionPredictor started: %d door links, %d rooms in adjacency, "
            "%d zone adjacency pairs",
            len(self._all_door_links),
            len(self._adjacency),
            sum(len(v) for v in self._zone_adjacency.values()) // 2,
        )

    async def async_stop(self) -> None:
        """Stop the predictor and cancel all timers."""
        if not self._running:
            return
        self._running = False

        for cancel in self._phantom_timers.values():
            cancel()
        self._phantom_timers.clear()
        self._phantoms.clear()
        self._door_links.clear()
        self._all_door_links.clear()
        self._adjacency.clear()
        self._transit_cache.clear()
        self._room_config.clear()
        self._zone_adjacency.clear()
        self._room_states.clear()

    def refresh_topology(self) -> None:
        """Rebuild topology data from current floor plan."""
        self._build_topology()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def has_active_phantom(self, room_id: str) -> bool:
        """Check if a room has an active (non-expired) phantom hold."""
        phantom = self._phantoms.get(room_id)
        if phantom is None:
            return False
        if phantom.is_expired:
            self._expire_phantom(room_id)
            return False
        return True

    def on_room_state_changed(
        self,
        room_id: str,
        old_state: str,
        new_state: str,
        confidence: float = 0.0,
    ) -> None:
        """Handle a room state transition.

        Creates phantom presence in adjacent rooms when appropriate.
        """
        self._room_states[room_id] = new_state

        # Room just became OCCUPIED — cancel any phantom on this room
        # (real presence replaces phantom)
        if new_state == OccupancyState.OCCUPIED:
            if room_id in self._phantoms:
                self._expire_phantom(room_id)

        # Room went OCCUPIED → CHECKING: sensors cleared, person may have
        # moved to an adjacent room. Create phantom holds on neighbours.
        if (
            old_state == OccupancyState.OCCUPIED
            and new_state == OccupancyState.CHECKING
        ):
            self._predict_forward(room_id)

        # Room became OCCUPIED and an adjacent room is CHECKING:
        # the adjacent room might need a phantom hold (the person passed
        # through it to get here).
        if new_state == OccupancyState.OCCUPIED:
            self._predict_backward(room_id)

    def on_door_event(self, entity_id: str, is_open: bool) -> None:
        """Handle a door sensor event.

        When a door opens between two rooms and one side is sealed/occupied,
        create phantom presence on the other side.
        """
        if not is_open:
            return

        link = self._door_links.get(entity_id)
        if not link:
            return

        # Determine which side the person is likely on
        state_a = self._room_states.get(link.room_a, OccupancyState.VACANT)
        state_b = self._room_states.get(link.room_b, OccupancyState.VACANT)

        occupied_side = None
        vacant_side = None

        if state_a in (OccupancyState.OCCUPIED, OccupancyState.CHECKING):
            occupied_side = link.room_a
            vacant_side = link.room_b
        elif state_b in (OccupancyState.OCCUPIED, OccupancyState.CHECKING):
            occupied_side = link.room_b
            vacant_side = link.room_a

        if occupied_side and vacant_side:
            hold = self._get_phantom_hold(vacant_side)
            _LOGGER.info(
                "Door %s opened: phantom presence %s → %s (hold=%ds)",
                entity_id,
                occupied_side,
                vacant_side,
                hold,
            )
            self._inject_phantom(
                source_id=occupied_side,
                target_id=vacant_side,
                probability=1.0,  # Full strength for door events
                hold_seconds=hold,
                reason=f"door {entity_id} opened between {occupied_side} and {vacant_side}",
            )

    def is_transit_room(self, room_id: str) -> bool:
        """Check if a room is a transit zone (hallway/corridor).

        Uses manual override if set, otherwise auto-detects based on topology:
        a room with 2+ connections, no long-stay zones, and no presence sensors
        is likely a transit zone.
        """
        if room_id in self._transit_cache:
            return self._transit_cache[room_id]

        result = self._detect_transit(room_id)
        self._transit_cache[room_id] = result
        return result

    def get_zone_neighbours(self, zone_id: str) -> set[str]:
        """Get adjacent zones (derived from polygon proximity)."""
        return self._zone_adjacency.get(zone_id, set())

    # ------------------------------------------------------------------
    # Forward/backward prediction
    # ------------------------------------------------------------------

    def _predict_forward(self, source_id: str) -> None:
        """Create phantom presence in rooms the person might move to.

        Called when source_id goes OCCUPIED → CHECKING.
        """
        # If source is sealed, suppress phantom (person is still inside)
        if self._get_seal_state and self._get_seal_state(source_id):
            _LOGGER.debug(
                "Room %s is sealed — suppressing phantom prediction",
                source_id,
            )
            return

        neighbours = self._get_all_neighbours(source_id)
        if not neighbours:
            return

        for target_id in neighbours:
            target_state = self._room_states.get(target_id, OccupancyState.VACANT)

            # Don't create phantom on already-occupied rooms
            if target_state == OccupancyState.OCCUPIED:
                continue

            # Calculate topology weight, blended with learned patterns
            topo_weight = self._topology_weight(source_id, target_id, neighbours)

            learned_weight = 0.0
            if self._get_learned_weight:
                learned_weight = self._get_learned_weight(source_id, target_id, None)

            # Blend: 60% topology + 40% learned (if available)
            if learned_weight > 0:
                weight = topo_weight * 0.6 + learned_weight * 0.4
            else:
                weight = topo_weight

            hold = self._get_phantom_hold(target_id)

            self._inject_phantom(
                source_id=source_id,
                target_id=target_id,
                probability=weight,
                hold_seconds=hold,
                reason=f"forward prediction from {source_id}",
            )

    def _predict_backward(self, newly_occupied_id: str) -> None:
        """Create phantom hold on transit rooms the person passed through.

        Called when newly_occupied_id just became OCCUPIED. If an adjacent
        transit room is CHECKING, create a phantom hold on it (the person
        walked through it to get here).
        """
        neighbours = self._get_all_neighbours(newly_occupied_id)

        for adj_id in neighbours:
            adj_state = self._room_states.get(adj_id, OccupancyState.VACANT)
            if adj_state != OccupancyState.CHECKING:
                continue

            # Only create backward phantom for transit rooms
            if not self.is_transit_room(adj_id):
                continue

            hold = self._get_phantom_hold(adj_id)
            self._inject_phantom(
                source_id=newly_occupied_id,
                target_id=adj_id,
                probability=0.7,  # Lower than forward prediction
                hold_seconds=hold,
                reason=f"backward prediction: {newly_occupied_id} occupied, {adj_id} was transit",
            )

    # ------------------------------------------------------------------
    # Phantom lifecycle
    # ------------------------------------------------------------------

    def _inject_phantom(
        self,
        source_id: str,
        target_id: str,
        probability: float,
        hold_seconds: float,
        reason: str,
    ) -> None:
        """Create or refresh a phantom presence on a target room."""
        existing = self._phantoms.get(target_id)

        # If there's already a stronger phantom, keep it
        if existing and not existing.is_expired:
            if existing.current_probability >= probability:
                _LOGGER.debug(
                    "Phantom on %s already stronger (%.2f >= %.2f), skipping",
                    target_id,
                    existing.current_probability,
                    probability,
                )
                return

        # Cancel existing timer
        if target_id in self._phantom_timers:
            self._phantom_timers[target_id]()
            del self._phantom_timers[target_id]

        phantom = PhantomPresence(
            source_id=source_id,
            target_id=target_id,
            probability=probability,
            hold_seconds=hold_seconds,
            reason=reason,
        )
        self._phantoms[target_id] = phantom

        _LOGGER.info(
            "Phantom injected: %s → %s (p=%.2f, hold=%ds, reason=%s)",
            source_id,
            target_id,
            probability,
            hold_seconds,
            reason,
        )

        # Push target room to OCCUPIED if it's currently VACANT
        target_state = self._room_states.get(target_id, OccupancyState.VACANT)
        if target_state == OccupancyState.VACANT and self._set_room_occupied:
            self._set_room_occupied(target_id, f"phantom: {reason}")

        # Schedule expiry
        @callback
        def _on_phantom_expired(_now: Any) -> None:
            self._phantom_timers.pop(target_id, None)
            self._expire_phantom(target_id)

        self._phantom_timers[target_id] = async_call_later(
            self.hass,
            hold_seconds,
            _on_phantom_expired,
        )

    def _expire_phantom(self, target_id: str) -> None:
        """Remove a phantom presence from a room."""
        phantom = self._phantoms.pop(target_id, None)
        if phantom:
            _LOGGER.info(
                "Phantom expired: %s (was from %s, held %ds)",
                target_id,
                phantom.source_id,
                phantom.hold_seconds,
            )

        # Cancel timer if still running
        cancel = self._phantom_timers.pop(target_id, None)
        if cancel:
            cancel()

    # ------------------------------------------------------------------
    # Topology analysis
    # ------------------------------------------------------------------

    def _build_topology(self) -> None:
        """Build adjacency graph, door links, and zone adjacency from floor plan data."""
        self._adjacency.clear()
        self._door_links.clear()
        self._all_door_links.clear()
        self._transit_cache.clear()
        self._room_config.clear()
        self._zone_adjacency.clear()

        for fp in self._store.get_floor_plans():
            for floor in fp.floors:
                self._build_floor_adjacency(floor)
                self._build_door_links(floor)
                self._build_zone_adjacency(floor)
                self._cache_room_config(floor)

    def _build_floor_adjacency(self, floor: Floor) -> None:
        """Build adjacency graph from room connected_rooms."""
        for room in floor.rooms:
            if room.id not in self._adjacency:
                self._adjacency[room.id] = set()
            for connected_id in room.connected_rooms:
                self._adjacency[room.id].add(connected_id)
                self._adjacency.setdefault(connected_id, set()).add(room.id)

    def _build_door_links(self, floor: Floor) -> None:
        """Derive door-room connections from floor plan geometry.

        For each door edge, sample points on both sides of the door and
        check which room polygons contain them.
        """
        node_map: dict[str, Any] = {}
        for node in floor.nodes:
            node_map[node.id] = node

        for edge in floor.edges:
            if edge.type != "door":
                continue

            start = node_map.get(edge.start_node)
            end = node_map.get(edge.end_node)
            if not start or not end:
                continue

            # Midpoint and normal of the door edge
            mid_x = (start.x + end.x) / 2.0
            mid_y = (start.y + end.y) / 2.0
            dx = end.x - start.x
            dy = end.y - start.y
            length = math.sqrt(dx * dx + dy * dy)
            if length < 1e-6:
                continue

            # Normal vector (perpendicular to door edge)
            nx = -dy / length
            ny = dx / length

            # Sample points 20 units (cm) on each side of the door
            from ..models.floor_plan import Coordinates

            offset = 20.0
            point_a = Coordinates(x=mid_x + nx * offset, y=mid_y + ny * offset)
            point_b = Coordinates(x=mid_x - nx * offset, y=mid_y - ny * offset)

            # Find which rooms contain each sample point
            room_a_id = self._find_room_at_point(floor, point_a)
            room_b_id = self._find_room_at_point(floor, point_b)

            if not room_a_id or not room_b_id or room_a_id == room_b_id:
                # Also try zones
                if not room_a_id:
                    room_a_id = self._find_zone_at_point(floor, point_a)
                if not room_b_id:
                    room_b_id = self._find_zone_at_point(floor, point_b)

            if not room_a_id or not room_b_id or room_a_id == room_b_id:
                continue

            link = DoorLink(
                door_edge_id=edge.id,
                entity_id=edge.entity_id,
                room_a=room_a_id,
                room_b=room_b_id,
            )
            self._all_door_links[edge.id] = link

            if edge.entity_id:
                self._door_links[edge.entity_id] = link

            _LOGGER.debug(
                "Door link: edge %s (%s) connects %s ↔ %s",
                edge.id,
                edge.entity_id or "no sensor",
                room_a_id,
                room_b_id,
            )

    def _find_room_at_point(self, floor: Floor, point: Any) -> str | None:
        """Find which room contains a point."""
        for room in floor.rooms:
            if room.polygon and room.polygon.contains_point(point):
                return room.id
        return None

    def _find_zone_at_point(self, floor: Floor, point: Any) -> str | None:
        """Find which zone contains a point."""
        for zone in floor.zones:
            if zone.polygon and zone.polygon.contains_point(point):
                return zone.id
        return None

    def _build_zone_adjacency(self, floor: Floor) -> None:
        """Build zone-to-zone adjacency based on polygon proximity.

        Zones whose polygons have vertices within the proximity threshold
        are considered adjacent.
        """
        zones = [z for z in floor.zones if z.polygon and z.polygon.vertices]

        for i, zone_a in enumerate(zones):
            for zone_b in zones[i + 1 :]:
                # Only consider zones in the same room (or overlapping rooms)
                if zone_a.room_id != zone_b.room_id:
                    continue

                if self._polygons_are_close(
                    zone_a.polygon.vertices,
                    zone_b.polygon.vertices,
                    PHANTOM_ZONE_PROXIMITY_THRESHOLD,
                ):
                    self._zone_adjacency.setdefault(zone_a.id, set()).add(zone_b.id)
                    self._zone_adjacency.setdefault(zone_b.id, set()).add(zone_a.id)

    @staticmethod
    def _polygons_are_close(
        verts_a: list[Any], verts_b: list[Any], threshold: float
    ) -> bool:
        """Check if two polygons have any vertices within threshold distance."""
        threshold_sq = threshold * threshold
        for va in verts_a:
            for vb in verts_b:
                dx = va.x - vb.x
                dy = va.y - vb.y
                if dx * dx + dy * dy <= threshold_sq:
                    return True
        return False

    def _cache_room_config(self, floor: Floor) -> None:
        """Cache room transit/phantom config for quick lookups."""
        for room in floor.rooms:
            self._room_config[room.id] = (room.is_transit, room.phantom_hold_seconds)
        for zone in floor.zones:
            self._room_config[zone.id] = (None, zone.phantom_hold_seconds)

    def _detect_transit(self, room_id: str) -> bool:
        """Auto-detect whether a room is a transit zone.

        A room is considered transit if:
        - Manual override says so (is_transit = True)
        - OR: has 2+ connections AND no long-stay zones inside AND
          no presence sensors configured
        """
        config = self._room_config.get(room_id)
        if config:
            override, _ = config
            if override is not None:
                return override

        # Check topology: needs 2+ connections
        connections = self._adjacency.get(room_id, set())
        if len(connections) < 2:
            return False

        # Check if room has long-stay zones
        for fp in self._store.get_floor_plans():
            for floor in fp.floors:
                for zone in floor.zones:
                    if zone.room_id == room_id and zone.long_stay:
                        return False

        # Check if room has presence sensors (mmWave, presence)
        sensor_config = self._store.get_sensor_config(room_id)
        if sensor_config and sensor_config.presence_sensors:
            return False

        return True

    def _topology_weight(
        self, source_id: str, target_id: str, all_neighbours: set[str]
    ) -> float:
        """Calculate topology-weighted phantom probability.

        Dead-end rooms (only one exit) get high weight (0.9).
        Rooms with multiple exits split the weight.
        """
        # How many exits does the source have? If target is the only adjacent
        # room (dead-end), high probability the person went there.
        target_exits = self._adjacency.get(target_id, set())

        # Count exits from the source (excluding the target)
        source_exits = all_neighbours - {target_id}

        if len(source_exits) == 0:
            # Source is a dead-end — person must go to target
            return 0.9

        if len(target_exits) <= 1:
            # Target is a dead-end — if person left source, they might be
            # returning through target (hallway)
            return 0.7

        # Multiple paths: split weight
        n = len(all_neighbours)
        return max(0.3, 0.9 / n)

    def _get_phantom_hold(self, target_id: str) -> float:
        """Get phantom hold duration for a target room."""
        config = self._room_config.get(target_id)
        if config:
            _, hold_seconds = config
            if hold_seconds > 0:
                return float(hold_seconds)

        if self.is_transit_room(target_id):
            return float(DEFAULT_TRANSIT_PHANTOM_HOLD)

        # Non-transit: use the room's checking timeout as hold time
        sensor_config = self._store.get_sensor_config(target_id)
        if sensor_config:
            return float(sensor_config.checking_timeout)

        return float(DEFAULT_TRANSIT_PHANTOM_HOLD)

    def _get_all_neighbours(self, room_id: str) -> set[str]:
        """Get all adjacent rooms and zones for a given room/zone."""
        neighbours: set[str] = set()

        # Room adjacency (from connected_rooms)
        neighbours.update(self._adjacency.get(room_id, set()))

        # Zone adjacency (from polygon proximity)
        neighbours.update(self._zone_adjacency.get(room_id, set()))

        return neighbours
