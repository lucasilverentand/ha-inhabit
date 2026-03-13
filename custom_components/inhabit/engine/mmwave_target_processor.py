"""mmWave target processor — transforms sensor-local coords to world coords."""

from __future__ import annotations

import logging
import math
from collections.abc import Callable
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_state_change_event

from ..const import DOMAIN
from ..models.floor_plan import Coordinates
from ..models.mmwave_sensor import MmwavePlacement

if TYPE_CHECKING:
    from homeassistant.core import Event

    from ..store.floor_plan_store import FloorPlanStore

_LOGGER = logging.getLogger(__name__)

SIGNAL_MMWAVE_TARGETS_UPDATED = f"{DOMAIN}_mmwave_targets_updated"


class MmwaveTargetProcessor:
    """Processes mmWave sensor target positions into world coordinates.

    For each placement, subscribes to x/y entity state changes for each target
    mapping. Transforms sensor-local coords into world coords using the mount
    position and angle. Tests each target against room/zone polygons and updates
    virtual presence entities.
    """

    def __init__(self, hass: HomeAssistant, store: FloorPlanStore) -> None:
        self.hass = hass
        self._store = store
        self._placements: dict[str, MmwavePlacement] = {}
        # target positions: {placement_id: {target_index: Coordinates}}
        self._target_positions: dict[str, dict[int, Coordinates]] = {}
        # region hits: {placement_id: {target_index: list of region_ids}}
        self._region_hits: dict[str, dict[int, list[str]]] = {}
        self._unsub_listeners: dict[str, list[Callable[[], None]]] = {}
        self._running = False

    async def async_start(self) -> None:
        """Start the processor, loading all placements."""
        if self._running:
            return
        self._running = True

        for fp in self._store.get_floor_plans():
            placements = self._store.get_mmwave_placements(fp.id)
            for p in placements:
                await self._setup_placement(p)

        _LOGGER.info(
            "mmWave target processor started with %d placements",
            len(self._placements),
        )

    async def async_stop(self) -> None:
        """Stop the processor."""
        if not self._running:
            return
        self._running = False

        for unsubs in self._unsub_listeners.values():
            for unsub in unsubs:
                unsub()
        self._unsub_listeners.clear()
        self._placements.clear()
        self._target_positions.clear()
        self._region_hits.clear()
        _LOGGER.info("mmWave target processor stopped")

    async def async_add_placement(self, placement: MmwavePlacement) -> None:
        """Add a new placement to the processor."""
        if placement.id in self._placements:
            await self.async_remove_placement(placement.id)
        await self._setup_placement(placement)

    async def async_update_placement(self, placement: MmwavePlacement) -> None:
        """Update an existing placement."""
        await self.async_remove_placement(placement.id)
        await self._setup_placement(placement)

    async def async_remove_placement(self, placement_id: str) -> None:
        """Remove a placement from the processor."""
        self._placements.pop(placement_id, None)
        self._target_positions.pop(placement_id, None)
        self._region_hits.pop(placement_id, None)
        for unsub in self._unsub_listeners.pop(placement_id, []):
            unsub()

    def get_target_positions(
        self,
    ) -> dict[str, dict[int, dict[str, Any]]]:
        """Get all current target world positions with region info."""
        result: dict[str, dict[int, dict[str, Any]]] = {}
        for pid, targets in self._target_positions.items():
            result[pid] = {}
            for tidx, coord in targets.items():
                region_ids = self._region_hits.get(pid, {}).get(tidx, [])
                result[pid][tidx] = {
                    "world_x": coord.x,
                    "world_y": coord.y,
                    "region_ids": region_ids,
                    # Keep backward compat: first region or None
                    "region_id": region_ids[0] if region_ids else None,
                }
        return result

    def get_regions_with_targets(self) -> dict[str, set[str]]:
        """Return {region_id: set of placement_ids that have targets inside}."""
        regions: dict[str, set[str]] = {}
        for pid, hits in self._region_hits.items():
            for _tidx, region_ids in hits.items():
                for region_id in region_ids:
                    regions.setdefault(region_id, set()).add(pid)
        return regions

    async def _setup_placement(self, placement: MmwavePlacement) -> None:
        """Set up listeners for a single placement."""
        self._placements[placement.id] = placement
        self._target_positions[placement.id] = {}
        self._region_hits[placement.id] = {}
        unsubs = []

        for idx, target in enumerate(placement.targets):
            entity_ids = [target.get("x_entity_id", ""), target.get("y_entity_id", "")]
            entity_ids = [eid for eid in entity_ids if eid]
            if not entity_ids:
                continue

            unsub = async_track_state_change_event(
                self.hass,
                entity_ids,
                self._make_state_handler(placement.id, idx),
            )
            unsubs.append(unsub)

            # Read initial state
            self._process_target(placement.id, idx)

        self._unsub_listeners[placement.id] = unsubs

    def _make_state_handler(self, placement_id: str, target_index: int):
        """Create a state change handler for a specific target."""

        @callback
        def handler(event: Event) -> None:
            self._process_target(placement_id, target_index)

        return handler

    @callback
    def _process_target(self, placement_id: str, target_index: int) -> None:
        """Process a target's current x/y state and update world position."""
        placement = self._placements.get(placement_id)
        if not placement:
            return

        if target_index >= len(placement.targets):
            return
        target = placement.targets[target_index]

        # Read current x/y from HA state
        x_entity_id = target.get("x_entity_id", "")
        y_entity_id = target.get("y_entity_id", "")
        if not x_entity_id or not y_entity_id:
            return

        x_state = self.hass.states.get(x_entity_id)
        y_state = self.hass.states.get(y_entity_id)
        if not x_state or not y_state:
            return

        try:
            local_x = float(x_state.state)
            local_y = float(y_state.state)
        except (ValueError, TypeError):
            return

        # Zero readings mean the sensor has no target detected — clear this target
        if local_x == 0.0 and local_y == 0.0:
            self._target_positions.get(placement_id, {}).pop(target_index, None)
            old_regions = self._region_hits.get(placement_id, {}).pop(target_index, [])
            if old_regions:
                async_dispatcher_send(
                    self.hass,
                    SIGNAL_MMWAVE_TARGETS_UPDATED,
                    placement_id,
                    target_index,
                    Coordinates(x=0, y=0),
                    [],
                )
            return

        # Convert mm (sensor unit) to floor plan units
        scale = self._get_mm_to_unit_scale(placement.floor_plan_id)
        local_x *= scale
        local_y *= scale

        # Transform from sensor-local to world coordinates
        world_pos = self._transform_to_world(placement, local_x, local_y)
        self._target_positions[placement_id][target_index] = world_pos

        # Test against all rooms/zones
        region_ids = self._find_containing_regions(placement, world_pos)
        self._region_hits.setdefault(placement_id, {})[target_index] = region_ids

        # Dispatch update signal with all matching regions
        async_dispatcher_send(
            self.hass,
            SIGNAL_MMWAVE_TARGETS_UPDATED,
            placement_id,
            target_index,
            world_pos,
            region_ids,
        )

    def _get_mm_to_unit_scale(self, floor_plan_id: str) -> float:
        """Return the multiplier to convert mm (sensor output) to floor-plan units."""
        fp = self._store.get_floor_plan(floor_plan_id)
        unit = fp.unit if fp else "cm"
        return {
            "cm": 0.1,  # 1 mm = 0.1 cm
            "m": 0.001,  # 1 mm = 0.001 m
            "in": 1 / 25.4,
            "ft": 1 / 304.8,
        }.get(unit, 0.1)

    def _transform_to_world(
        self, placement: MmwavePlacement, local_x: float, local_y: float
    ) -> Coordinates:
        """Transform sensor-local coordinates to world coordinates.

        The sensor reports target positions relative to itself:
        - local_x: distance to the left/right of the sensor
        - local_y: distance forward from the sensor

        We rotate by the sensor's facing angle (wall normal + offset) and
        translate to mount position.
        """
        facing_rad = math.radians(placement.angle)
        cos_a = math.cos(facing_rad)
        sin_a = math.sin(facing_rad)

        # local_y = forward (along facing direction), local_x = lateral
        world_x = placement.position.x + (local_y * cos_a - local_x * sin_a)
        world_y = placement.position.y + (local_y * sin_a + local_x * cos_a)

        return Coordinates(x=world_x, y=world_y)

    def _find_containing_regions(
        self, placement: MmwavePlacement, point: Coordinates
    ) -> list[str]:
        """Find all rooms and zones that contain the given world point."""
        floor_plan = self._store.get_floor_plan(placement.floor_plan_id)
        if not floor_plan:
            return []

        floor = floor_plan.get_floor(placement.floor_id)
        if not floor:
            return []

        region_ids: list[str] = []

        # Check zones
        for zone in floor.zones:
            if zone.polygon and zone.polygon.contains_point(point):
                region_ids.append(zone.id)

        # Check rooms
        for room in floor.rooms:
            if room.polygon and room.polygon.contains_point(point):
                region_ids.append(room.id)

        return region_ids
