"""Detect rooms that are currently exposed to the outside."""

from __future__ import annotations

import logging
import math
from collections import deque
from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from homeassistant.const import STATE_ON, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant, State, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_state_change_event

from ..const import DOMAIN
from ..models.floor_plan import Coordinates

if TYPE_CHECKING:
    from ..models.floor_plan import Edge, Floor, FloorPlan
    from ..store.floor_plan_store import FloorPlanStore

_LOGGER = logging.getLogger(__name__)

SIGNAL_OUTSIDE_EXPOSURE_CHANGED = f"{DOMAIN}_outside_exposure_changed"
SIGNAL_OUTSIDE_EXPOSURE_ROOM_ADDED = f"{DOMAIN}_outside_exposure_room_added"
SIGNAL_OUTSIDE_EXPOSURE_ROOM_REMOVED = f"{DOMAIN}_outside_exposure_room_removed"

OPENING_EDGE_TYPES = {"door", "window"}
OPEN_STATES = {STATE_ON, "on", "open", "detected", "true", "1"}
UNKNOWN_STATES = {STATE_UNAVAILABLE, STATE_UNKNOWN}
SAMPLE_OFFSET = 20.0


@dataclass(frozen=True)
class OutsideExposureState:
    """Current outside exposure state for a room."""

    room_id: str
    exposed: bool = False
    direct_exposure: bool = False
    exterior_openings: tuple[str, ...] = field(default_factory=tuple)
    interior_openings: tuple[str, ...] = field(default_factory=tuple)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "room_id": self.room_id,
            "exposed": self.exposed,
            "direct_exposure": self.direct_exposure,
            "exterior_openings": list(self.exterior_openings),
            "interior_openings": list(self.interior_openings),
        }


def _opening_key(edge: Edge) -> str:
    """Return a stable identifier for an opening edge."""
    return edge.entity_id or edge.id


def _is_open_state(state: State | None) -> bool:
    """Return whether a HA state means an opening is open."""
    if state is None or state.state in UNKNOWN_STATES:
        return False
    return state.state in OPEN_STATES


def _rooms_on_sides(floor: Floor, edge: Edge) -> tuple[str | None, str | None]:
    """Find rooms on both sides of an edge by sampling across its normal."""
    node_map = {node.id: node for node in floor.nodes}
    start = node_map.get(edge.start_node)
    end = node_map.get(edge.end_node)
    if not start or not end:
        return (None, None)

    mid_x = (start.x + end.x) / 2.0
    mid_y = (start.y + end.y) / 2.0
    dx = end.x - start.x
    dy = end.y - start.y
    length = math.sqrt(dx * dx + dy * dy)
    if length < 1e-6:
        return (None, None)

    nx = -dy / length
    ny = dx / length
    point_a = Coordinates(x=mid_x + nx * SAMPLE_OFFSET, y=mid_y + ny * SAMPLE_OFFSET)
    point_b = Coordinates(x=mid_x - nx * SAMPLE_OFFSET, y=mid_y - ny * SAMPLE_OFFSET)

    return (
        _find_room_at_point(floor, point_a),
        _find_room_at_point(floor, point_b),
    )


def _find_room_at_point(floor: Floor, point: Coordinates) -> str | None:
    """Find which room contains a point."""
    for room in floor.rooms:
        if room.polygon and room.polygon.contains_point(point):
            return room.id
    return None


def find_rooms_exposed_to_outside(
    floor_plans: Iterable[FloorPlan],
    get_state: Callable[[str], State | None],
) -> dict[str, OutsideExposureState]:
    """Find rooms exposed to outside through open exterior/interior openings.

    A room is exposed when an exterior door/window is open into it. Exposure
    then propagates through open interior doors/windows to connected rooms.
    Openings without an entity state are treated as closed because their live
    open/closed condition is unknown.
    """
    room_ids: set[str] = set()
    direct_openings: dict[str, set[str]] = {}
    adjacency: dict[str, list[tuple[str, str]]] = {}

    for floor_plan in floor_plans:
        for floor in floor_plan.floors:
            for room in floor.rooms:
                room_ids.add(room.id)

            for edge in floor.edges:
                if edge.type not in OPENING_EDGE_TYPES or not edge.entity_id:
                    continue
                if not _is_open_state(get_state(edge.entity_id)):
                    continue

                room_a, room_b = _rooms_on_sides(floor, edge)
                rooms = {room_id for room_id in (room_a, room_b) if room_id}
                if not rooms:
                    continue

                opening = _opening_key(edge)
                if edge.is_exterior:
                    for room_id in rooms:
                        direct_openings.setdefault(room_id, set()).add(opening)
                    continue

                if room_a and room_b and room_a != room_b:
                    adjacency.setdefault(room_a, []).append((room_b, opening))
                    adjacency.setdefault(room_b, []).append((room_a, opening))

    exposed_origins: dict[str, set[str]] = {
        room_id: set(openings) for room_id, openings in direct_openings.items()
    }
    exposed_via: dict[str, set[str]] = {room_id: set() for room_id in direct_openings}
    queue = deque(direct_openings)

    while queue:
        room_id = queue.popleft()
        origins = exposed_origins.get(room_id, set())
        via = exposed_via.get(room_id, set())
        for next_room_id, opening in adjacency.get(room_id, []):
            next_origins = exposed_origins.setdefault(next_room_id, set())
            next_via = exposed_via.setdefault(next_room_id, set())
            before = (len(next_origins), len(next_via))
            next_origins.update(origins)
            next_via.update(via)
            next_via.add(opening)
            after = (len(next_origins), len(next_via))
            if after != before:
                queue.append(next_room_id)

    return {
        room_id: OutsideExposureState(
            room_id=room_id,
            exposed=room_id in exposed_origins,
            direct_exposure=room_id in direct_openings,
            exterior_openings=tuple(sorted(exposed_origins.get(room_id, set()))),
            interior_openings=tuple(sorted(exposed_via.get(room_id, set()))),
        )
        for room_id in sorted(room_ids)
    }


class OutsideExposureEngine:
    """Tracks room outside exposure and publishes state changes."""

    def __init__(self, hass: HomeAssistant, store: FloorPlanStore) -> None:
        """Initialize the engine."""
        self.hass = hass
        self._store = store
        self._states: dict[str, OutsideExposureState] = {}
        self._room_ids: set[str] = set()
        self._room_ids_initialized = False
        self._unsub_openings: list[Callable[[], None]] = []
        self._running = False

    @property
    def running(self) -> bool:
        """Check if the engine is running."""
        return self._running

    async def async_start(self) -> None:
        """Start tracking outside exposure."""
        if self._running:
            return
        self._running = True
        await self.async_refresh()
        _LOGGER.info(
            "Outside exposure engine started with %d rooms and %d opening sensors",
            len(self._room_ids),
            len(self._unsub_openings),
        )

    async def async_stop(self) -> None:
        """Stop tracking outside exposure."""
        self._running = False
        self._unsubscribe_openings()
        self._states.clear()
        self._room_ids.clear()
        self._room_ids_initialized = False
        _LOGGER.info("Outside exposure engine stopped")

    async def async_refresh(self) -> None:
        """Refresh topology subscriptions and recompute exposure states."""
        if not self._running:
            return
        self._reconcile_room_entities()
        self._subscribe_openings()
        self.refresh_state()

    def refresh_state(self) -> None:
        """Recompute exposure states from current HA opening states."""
        new_states = find_rooms_exposed_to_outside(
            self._store.get_floor_plans(),
            self.hass.states.get,
        )
        old_states = self._states
        removed = set(self._states) - set(new_states)
        self._states = new_states

        for room_id in removed:
            async_dispatcher_send(
                self.hass,
                SIGNAL_OUTSIDE_EXPOSURE_ROOM_REMOVED,
                room_id,
            )

        for room_id, state in new_states.items():
            if old_states.get(room_id) == state:
                continue
            async_dispatcher_send(
                self.hass,
                SIGNAL_OUTSIDE_EXPOSURE_CHANGED,
                room_id,
                state,
            )

    def get_state(self, room_id: str) -> OutsideExposureState | None:
        """Get current exposure state for a room."""
        return self._states.get(room_id)

    def get_all_states(self) -> dict[str, OutsideExposureState]:
        """Get all exposure states."""
        return dict(self._states)

    def republish_current_states(self) -> None:
        """Dispatch current state for every managed room."""
        for room_id, state in self._states.items():
            async_dispatcher_send(
                self.hass,
                SIGNAL_OUTSIDE_EXPOSURE_CHANGED,
                room_id,
                state,
            )

    def _reconcile_room_entities(self) -> None:
        """Notify the platform when room-backed exposure sensors change."""
        next_room_ids = {
            room.id
            for floor_plan in self._store.get_floor_plans()
            for floor in floor_plan.floors
            for room in floor.rooms
        }
        if self._room_ids_initialized:
            for room_id in sorted(next_room_ids - self._room_ids):
                async_dispatcher_send(
                    self.hass,
                    SIGNAL_OUTSIDE_EXPOSURE_ROOM_ADDED,
                    room_id,
                )
            for room_id in sorted(self._room_ids - next_room_ids):
                async_dispatcher_send(
                    self.hass,
                    SIGNAL_OUTSIDE_EXPOSURE_ROOM_REMOVED,
                    room_id,
                )

        self._room_ids = next_room_ids
        self._room_ids_initialized = True

    def _subscribe_openings(self) -> None:
        """Subscribe to all opening entities that can affect exposure."""
        self._unsubscribe_openings()
        entity_ids = sorted(
            {
                edge.entity_id
                for floor_plan in self._store.get_floor_plans()
                for floor in floor_plan.floors
                for edge in floor.edges
                if edge.type in OPENING_EDGE_TYPES and edge.entity_id
            }
        )
        for entity_id in entity_ids:
            self._unsub_openings.append(
                async_track_state_change_event(
                    self.hass,
                    entity_id,
                    self._handle_opening_event,
                )
            )

    def _unsubscribe_openings(self) -> None:
        """Unsubscribe from tracked opening entities."""
        for unsub in self._unsub_openings:
            try:
                unsub()
            except Exception:
                _LOGGER.exception("Error unsubscribing outside exposure listener")
        self._unsub_openings.clear()

    @callback
    def _handle_opening_event(self, _event: Any) -> None:
        """Handle opening state changes."""
        if self._running:
            self.refresh_state()
