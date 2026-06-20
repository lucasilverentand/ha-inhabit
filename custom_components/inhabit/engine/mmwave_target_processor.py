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
from ..models.device_placement import FanPlacement
from ..models.floor_plan import Coordinates
from ..models.mmwave_sensor import MmwavePlacement

if TYPE_CHECKING:
    from homeassistant.core import Event

    from ..store.floor_plan_store import FloorPlanStore

_LOGGER = logging.getLogger(__name__)

SIGNAL_MMWAVE_TARGETS_UPDATED = f"{DOMAIN}_mmwave_targets_updated"
DEFAULT_FAN_DEADZONE_RADIUS_CM = 75.0
DEFAULT_FAN_DEADZONE_MIN_RADIUS_CM = 0.0


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
        self._excluded_target_positions: dict[str, dict[int, Coordinates]] = {}
        self._filtered_target_positions: dict[str, dict[int, Coordinates]] = {}
        # region hits: {placement_id: {target_index: list of region_ids}}
        self._region_hits: dict[str, dict[int, list[str]]] = {}
        self._unsub_listeners: dict[str, list[Callable[[], None]]] = {}
        self._unsub_fan_listener: Callable[[], None] | None = None
        self._fan_listener_entity_ids: set[str] = set()
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

        self._setup_fan_listeners()

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
        if self._unsub_fan_listener:
            self._unsub_fan_listener()
            self._unsub_fan_listener = None
        self._fan_listener_entity_ids.clear()
        self._placements.clear()
        self._target_positions.clear()
        self._excluded_target_positions.clear()
        self._filtered_target_positions.clear()
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
        self._clear_placement_presence(placement_id)
        self._placements.pop(placement_id, None)
        self._target_positions.pop(placement_id, None)
        self._excluded_target_positions.pop(placement_id, None)
        self._filtered_target_positions.pop(placement_id, None)
        self._region_hits.pop(placement_id, None)
        for unsub in self._unsub_listeners.pop(placement_id, []):
            unsub()

    @callback
    def refresh_fan_deadzones(self) -> None:
        """Refresh fan listeners and recalculate target region hits."""
        self._setup_fan_listeners()
        self._recalculate_region_hits()

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
        self._excluded_target_positions[placement.id] = {}
        self._filtered_target_positions[placement.id] = {}
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
    def _handle_fan_state_change(self, event: Event) -> None:
        """Recalculate region hits when a fan starts, stops, or changes speed."""
        self._recalculate_region_hits()

    def _setup_fan_listeners(self) -> None:
        """Subscribe to fan entity changes used by automatic deadzones."""
        entity_ids = self._fan_entity_ids()
        if entity_ids == self._fan_listener_entity_ids:
            return

        if self._unsub_fan_listener:
            self._unsub_fan_listener()
            self._unsub_fan_listener = None

        self._fan_listener_entity_ids = entity_ids
        if not entity_ids:
            return

        self._unsub_fan_listener = async_track_state_change_event(
            self.hass,
            list(entity_ids),
            self._handle_fan_state_change,
        )

    def _fan_entity_ids(self) -> set[str]:
        """Return all placed fan entity ids for the current store."""
        get_fans = getattr(self._store, "get_fan_placements", None)
        if not callable(get_fans):
            return set()

        entity_ids: set[str] = set()
        for fp in self._store.get_floor_plans():
            for fan in get_fans(fp.id):
                if fan.entity_id:
                    entity_ids.add(fan.entity_id)
        return entity_ids

    def _recalculate_region_hits(self) -> None:
        """Recalculate existing target region hits after fan deadzone changes."""
        for placement_id, targets in list(self._target_positions.items()):
            placement = self._placements.get(placement_id)
            if not placement:
                continue

            for target_index, point in list(targets.items()):
                if self._is_inside_fan_deadzone(placement, point):
                    self._target_positions[placement_id].pop(target_index, None)
                    self._excluded_target_positions.setdefault(placement_id, {})[
                        target_index
                    ] = point
                    region_ids = []
                else:
                    region_ids = self._find_containing_regions(placement, point)
                previous = self._region_hits.setdefault(placement_id, {}).get(
                    target_index,
                    [],
                )
                if previous == region_ids:
                    continue

                self._region_hits[placement_id][target_index] = region_ids
                async_dispatcher_send(
                    self.hass,
                    SIGNAL_MMWAVE_TARGETS_UPDATED,
                    placement_id,
                    target_index,
                    point,
                    region_ids,
                )
        for placement_id, targets in list(self._excluded_target_positions.items()):
            placement = self._placements.get(placement_id)
            if not placement:
                continue

            for target_index, point in list(targets.items()):
                if self._is_inside_fan_deadzone(placement, point):
                    continue

                self._excluded_target_positions[placement_id].pop(target_index, None)
                self._target_positions.setdefault(placement_id, {})[
                    target_index
                ] = point
                region_ids = self._find_containing_regions(placement, point)
                previous = self._region_hits.setdefault(placement_id, {}).get(
                    target_index,
                    [],
                )
                if previous == region_ids:
                    continue

                self._region_hits[placement_id][target_index] = region_ids
                async_dispatcher_send(
                    self.hass,
                    SIGNAL_MMWAVE_TARGETS_UPDATED,
                    placement_id,
                    target_index,
                    point,
                    region_ids,
                )

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
            self._clear_target_presence(placement_id, target_index)
            return

        try:
            local_x = float(x_state.state)
            local_y = float(y_state.state)
        except (ValueError, TypeError):
            self._clear_target_presence(placement_id, target_index)
            return
        if not math.isfinite(local_x) or not math.isfinite(local_y):
            self._clear_target_presence(placement_id, target_index)
            return

        # Zero readings mean the sensor has no target detected — clear this target
        if local_x == 0.0 and local_y == 0.0:
            self._clear_target_presence(placement_id, target_index)
            return

        world_pos = self._calibrated_world_position(placement, local_x, local_y)
        world_pos = self._filter_world_position(placement, target_index, world_pos)

        if self._is_inside_fan_deadzone(placement, world_pos):
            self._target_positions.get(placement_id, {}).pop(target_index, None)
            self._excluded_target_positions.setdefault(placement_id, {})[
                target_index
            ] = world_pos
            region_ids: list[str] = []
        else:
            self._excluded_target_positions.get(placement_id, {}).pop(
                target_index, None
            )
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

    def _clear_placement_presence(self, placement_id: str) -> None:
        """Clear every active target for a placement before removing it."""
        target_indexes = set(self._region_hits.get(placement_id, {}))
        target_indexes.update(self._target_positions.get(placement_id, {}))
        target_indexes.update(self._excluded_target_positions.get(placement_id, {}))
        target_indexes.update(self._filtered_target_positions.get(placement_id, {}))
        for target_index in sorted(target_indexes):
            self._clear_target_presence(placement_id, target_index)

    def _clear_target_presence(
        self, placement_id: str, target_index: int, point: Coordinates | None = None
    ) -> None:
        """Clear a target and route an empty region list if it was active."""
        self._target_positions.get(placement_id, {}).pop(target_index, None)
        self._excluded_target_positions.get(placement_id, {}).pop(target_index, None)
        self._filtered_target_positions.get(placement_id, {}).pop(target_index, None)
        old_regions = self._region_hits.get(placement_id, {}).pop(target_index, [])
        if old_regions:
            async_dispatcher_send(
                self.hass,
                SIGNAL_MMWAVE_TARGETS_UPDATED,
                placement_id,
                target_index,
                point or Coordinates(x=0, y=0),
                [],
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

    def _apply_calibration(
        self, placement: MmwavePlacement, raw_x: float, raw_y: float
    ) -> tuple[float, float]:
        """Apply persisted raw x/y calibration bias."""
        calibration = placement.calibration
        if not calibration or not calibration.enabled:
            return raw_x, raw_y

        return (
            raw_x - calibration.raw_bias.x,
            raw_y - calibration.raw_bias.y,
        )

    def _calibrated_world_position(
        self, placement: MmwavePlacement, raw_x: float, raw_y: float
    ) -> Coordinates:
        """Apply calibration and map raw sensor coordinates to world coordinates."""
        calibration = placement.calibration
        if calibration and calibration.enabled and calibration.world_transform:
            transform = calibration.world_transform
            return Coordinates(
                x=transform.a * raw_x + transform.b * raw_y + transform.c,
                y=transform.d * raw_x + transform.e * raw_y + transform.f,
            )

        local_x, local_y = self._apply_calibration(placement, raw_x, raw_y)

        # Convert mm (sensor unit) to floor plan units
        scale = self._get_mm_to_unit_scale(placement.floor_plan_id)
        local_x *= scale
        local_y *= scale

        # Transform from sensor-local to world coordinates
        return self._transform_to_world(placement, local_x, local_y)

    def _filter_world_position(
        self, placement: MmwavePlacement, target_index: int, point: Coordinates
    ) -> Coordinates:
        """Smooth jitter inside the calibrated jitter radius."""
        calibration = placement.calibration
        if not calibration or not calibration.enabled or calibration.jitter_radius <= 0:
            return point

        previous = self._filtered_target_positions.setdefault(placement.id, {}).get(
            target_index
        )
        if previous is None:
            self._filtered_target_positions[placement.id][target_index] = point
            return point

        distance = math.hypot(point.x - previous.x, point.y - previous.y)
        if distance > calibration.jitter_radius:
            self._filtered_target_positions[placement.id][target_index] = point
            return point

        alpha = 0.25
        filtered = Coordinates(
            x=previous.x + (point.x - previous.x) * alpha,
            y=previous.y + (point.y - previous.y) * alpha,
        )
        self._filtered_target_positions[placement.id][target_index] = filtered
        return filtered

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

        if self._is_inside_fan_deadzone(placement, point):
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

    def _is_inside_fan_deadzone(
        self, placement: MmwavePlacement, point: Coordinates
    ) -> bool:
        """Return whether a world point should be ignored because it is near a fan."""
        get_fans = getattr(self._store, "get_fan_placements", None)
        if not callable(get_fans):
            return False

        for fan in get_fans(placement.floor_plan_id):
            if fan.floor_id != placement.floor_id:
                continue
            radius = self._fan_deadzone_radius(placement.floor_plan_id, fan)
            if radius <= 0:
                continue
            distance = math.hypot(point.x - fan.position.x, point.y - fan.position.y)
            if distance <= radius and self._fan_deadzone_covers_point(fan, point):
                return True
        return False

    @staticmethod
    def _fan_deadzone_covers_point(fan: FanPlacement, point: Coordinates) -> bool:
        """Return whether a point falls inside the fan's configured angle sector."""
        if fan.oscillation_start is None or fan.oscillation_end is None:
            return True

        dx = point.x - fan.position.x
        dy = point.y - fan.position.y
        if dx == 0 and dy == 0:
            return True

        point_angle = (math.degrees(math.atan2(dy, dx)) + 90.0) % 360.0
        start = fan.oscillation_start % 360.0
        end = fan.oscillation_end % 360.0
        sweep = (end - start) % 360.0
        if sweep == 0:
            return abs(((point_angle - start + 180.0) % 360.0) - 180.0) <= 1.0

        return ((point_angle - start) % 360.0) <= sweep

    def _fan_deadzone_radius(self, floor_plan_id: str, fan: FanPlacement) -> float:
        """Return the fan deadzone radius in the floor plan's unit."""
        if not fan.deadzone_enabled:
            return 0.0

        max_radius = self._fan_deadzone_config_radius(
            floor_plan_id,
            fan.deadzone_radius,
            DEFAULT_FAN_DEADZONE_RADIUS_CM,
        )
        if not fan.deadzone_dynamic:
            return max_radius if self._fan_blow_factor(fan) > 0 else 0.0

        blow_factor = self._fan_blow_factor(fan)
        if blow_factor <= 0:
            return 0.0

        min_radius = min(
            max_radius,
            self._fan_deadzone_config_radius(
                floor_plan_id,
                fan.deadzone_min_radius,
                DEFAULT_FAN_DEADZONE_MIN_RADIUS_CM,
            ),
        )
        return min_radius + ((max_radius - min_radius) * blow_factor)

    def _fan_deadzone_config_radius(
        self, floor_plan_id: str, value: float | None, default_cm: float
    ) -> float:
        """Return a configured fan deadzone radius in the floor plan's unit."""
        if value is not None:
            return max(0.0, value)

        fp = self._store.get_floor_plan(floor_plan_id)
        unit = fp.unit if fp else "cm"
        return max(0.0, self._convert_cm_to_floor_unit(default_cm, unit))

    @staticmethod
    def _convert_cm_to_floor_unit(value_cm: float, unit: str) -> float:
        """Convert a centimeter value into the floor plan's unit."""
        return {
            "cm": value_cm,
            "m": value_cm / 100,
            "in": value_cm / 2.54,
            "ft": value_cm / 30.48,
        }.get(unit, value_cm)

    def _fan_blow_factor(self, fan: FanPlacement) -> float:
        """Return how strongly the fan is blowing, from 0.0 to 1.0."""
        state = self.hass.states.get(fan.entity_id)
        if not state or state.state != "on":
            return 0.0

        percentage = self._float_attribute(state.attributes.get("percentage"))
        if percentage is not None:
            return max(0.0, min(1.0, percentage / 100))

        for attr_name in ("speed", "fan_speed"):
            speed = self._float_attribute(state.attributes.get(attr_name))
            if speed is not None:
                return max(0.0, min(1.0, speed / 100))

        return 1.0

    @staticmethod
    def _float_attribute(value: Any) -> float | None:
        """Return a float HA attribute value when it is numeric."""
        if value is None:
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None
