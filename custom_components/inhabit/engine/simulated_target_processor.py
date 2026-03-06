"""Simulated target processor for spatial occupancy testing."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any
from uuid import uuid4

from homeassistant.core import HomeAssistant

from ..const import OccupancyState
from ..models.floor_plan import Coordinates

if TYPE_CHECKING:
    from ..engine.virtual_sensor_engine import VirtualSensorEngine
    from ..store.floor_plan_store import FloorPlanStore

_LOGGER = logging.getLogger(__name__)


def _generate_id() -> str:
    """Generate a unique ID."""
    return uuid4().hex[:8]


@dataclass
class SimulatedTarget:
    """A virtual target placed on the floor plan canvas."""

    id: str = field(default_factory=_generate_id)
    floor_plan_id: str = ""
    floor_id: str = ""
    position: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    region_id: str | None = None
    region_name: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "floor_plan_id": self.floor_plan_id,
            "floor_id": self.floor_id,
            "position": self.position.to_dict(),
            "region_id": self.region_id,
            "region_name": self.region_name,
        }


class SimulatedTargetProcessor:
    """Processes simulated targets for spatial occupancy testing.

    Targets are ephemeral (in-memory only, not persisted). They provide
    visual dots on the canvas that use room/zone polygons as hitboxes
    to determine region membership. When a room/zone has presence_affects
    enabled, targets inside it drive the occupancy state machine.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        store: FloorPlanStore,
        sensor_engine: VirtualSensorEngine,
    ) -> None:
        """Initialize the processor."""
        self.hass = hass
        self._store = store
        self._sensor_engine = sensor_engine
        self._targets: dict[str, SimulatedTarget] = {}
        self._targets_per_region: dict[str, set[str]] = {}

    def _should_affect_occupancy(self, region_id: str) -> bool:
        """Check if a region has presence_affects enabled."""
        config = self._store.get_sensor_config(region_id)
        if not config:
            return False
        return config.enabled and config.presence_affects

    def _handle_region_enter(self, region_id: str, target_id: str) -> None:
        """Handle a target entering a region."""
        if not self._should_affect_occupancy(region_id):
            return

        if region_id not in self._targets_per_region:
            self._targets_per_region[region_id] = set()

        self._targets_per_region[region_id].add(target_id)
        self._sensor_engine.set_room_occupancy(region_id, OccupancyState.OCCUPIED)
        _LOGGER.debug(
            "Target %s entered region %s — set OCCUPIED (%d targets)",
            target_id,
            region_id,
            len(self._targets_per_region[region_id]),
        )

    def _handle_region_leave(self, region_id: str, target_id: str) -> None:
        """Handle a target leaving a region."""
        targets = self._targets_per_region.get(region_id)
        if not targets:
            return

        targets.discard(target_id)
        if not targets:
            del self._targets_per_region[region_id]
            if self._should_affect_occupancy(region_id):
                self._sensor_engine.set_room_occupancy(
                    region_id, OccupancyState.CHECKING
                )
                _LOGGER.debug(
                    "Last target left region %s — set CHECKING",
                    region_id,
                )

    def add_target(
        self,
        floor_plan_id: str,
        floor_id: str,
        position: Coordinates,
        hitbox: bool = True,
    ) -> SimulatedTarget:
        """Place a new target. If hitbox is True, detect containing region."""
        target = SimulatedTarget(
            floor_plan_id=floor_plan_id,
            floor_id=floor_id,
            position=position,
        )

        if hitbox:
            region = self._find_containing_region(floor_plan_id, floor_id, position)
            if region:
                target.region_id = region["id"]
                target.region_name = region["name"]
                self._handle_region_enter(region["id"], target.id)

        self._targets[target.id] = target
        _LOGGER.debug(
            "Added simulated target %s at (%.1f, %.1f) in region %s",
            target.id,
            position.x,
            position.y,
            target.region_name,
        )
        return target

    def move_target(
        self,
        target_id: str,
        position: Coordinates,
        hitbox: bool = True,
    ) -> SimulatedTarget | None:
        """Move a target. If hitbox is True, re-detect containing region."""
        target = self._targets.get(target_id)
        if not target:
            return None

        old_region_id = target.region_id
        target.position = position

        if hitbox:
            region = self._find_containing_region(
                target.floor_plan_id, target.floor_id, position
            )
            target.region_id = region["id"] if region else None
            target.region_name = region["name"] if region else None
        else:
            target.region_id = None
            target.region_name = None

        new_region_id = target.region_id

        # Handle region transitions
        if old_region_id != new_region_id:
            if old_region_id:
                self._handle_region_leave(old_region_id, target_id)
            if new_region_id:
                self._handle_region_enter(new_region_id, target_id)

        return target

    def remove_target(self, target_id: str) -> bool:
        """Remove a target."""
        target = self._targets.pop(target_id, None)
        if not target:
            return False

        if target.region_id:
            self._handle_region_leave(target.region_id, target_id)

        _LOGGER.debug("Removed simulated target %s", target_id)
        return True

    def clear_all(self) -> None:
        """Remove all targets."""
        # Trigger region leave for all tracked targets
        for region_id in list(self._targets_per_region.keys()):
            if self._should_affect_occupancy(region_id):
                self._sensor_engine.set_room_occupancy(
                    region_id, OccupancyState.CHECKING
                )
        self._targets_per_region.clear()
        self._targets.clear()
        _LOGGER.debug("Cleared all simulated targets")

    def get_targets(self) -> list[SimulatedTarget]:
        """Get all active targets."""
        return list(self._targets.values())

    def _find_containing_region(
        self, floor_plan_id: str, floor_id: str, point: Coordinates
    ) -> dict[str, str] | None:
        """Find the zone or room containing a point.

        Checks zones first (more specific), then rooms.
        Returns {"id": ..., "name": ...} or None.
        """
        floor_plan = self._store.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return None

        floor = floor_plan.get_floor(floor_id)
        if not floor:
            return None

        # Check zones first (more specific regions)
        for zone in floor.zones:
            if zone.polygon and zone.polygon.vertices:
                if zone.polygon.contains_point(point):
                    return {"id": zone.id, "name": zone.name}

        # Then check rooms
        for room in floor.rooms:
            if room.polygon and room.polygon.vertices:
                if room.polygon.contains_point(point):
                    return {"id": room.id, "name": room.name}

        return None
