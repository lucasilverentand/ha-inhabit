"""Floor plan storage with persistence to HA .storage."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from ..const import STORAGE_KEY, STORAGE_VERSION
from ..models.automation_rule import VisualRule
from ..models.device_placement import LightPlacement, SwitchPlacement
from ..models.floor_plan import Door, Edge, Floor, FloorPlan, Node, Room, Wall, Window
from ..models.mmwave_sensor import MmwavePlacement
from ..models.virtual_sensor import VirtualSensorConfig
from ..models.zone import Zone

_LOGGER = logging.getLogger(__name__)


class FloorPlanStore:
    """Manages floor plan data persistence."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the store."""
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] = {
            "floor_plans": {},
            "light_placements": {},
            "switch_placements": {},
            "sensor_configs": {},
            "visual_rules": {},
            "mmwave_placements": {},
        }
        self._loaded = False

    async def async_load(self) -> None:
        """Load data from storage."""
        if self._loaded:
            return

        data = await self._store.async_load()
        if data:
            self._data = data
        self._loaded = True
        _LOGGER.debug(
            "Loaded floor plan data: %d floor plans",
            len(self._data.get("floor_plans", {})),
        )

    async def async_save(self) -> None:
        """Save data to storage immediately."""
        await self._store.async_save(self._data)

    def async_delay_save(self) -> None:
        """Schedule a delayed save (debounced)."""
        self._store.async_delay_save(lambda: self._data, 1.0)

    # ==================== Floor Plans ====================

    def get_floor_plans(self) -> list[FloorPlan]:
        """Get all floor plans."""
        floor_plans = []
        for fp_data in self._data.get("floor_plans", {}).values():
            floor_plans.append(FloorPlan.from_dict(fp_data))
        return floor_plans

    def get_floor_plan(self, floor_plan_id: str) -> FloorPlan | None:
        """Get a floor plan by ID."""
        fp_data = self._data.get("floor_plans", {}).get(floor_plan_id)
        if fp_data:
            return FloorPlan.from_dict(fp_data)
        return None

    def create_floor_plan(self, floor_plan: FloorPlan) -> FloorPlan:
        """Create a new floor plan."""
        now = datetime.now().isoformat()
        floor_plan.created_at = now
        floor_plan.updated_at = now

        if "floor_plans" not in self._data:
            self._data["floor_plans"] = {}

        self._data["floor_plans"][floor_plan.id] = floor_plan.to_dict()
        self.async_delay_save()

        _LOGGER.info("Created floor plan: %s", floor_plan.id)
        return floor_plan

    def update_floor_plan(self, floor_plan: FloorPlan) -> FloorPlan | None:
        """Update an existing floor plan."""
        if floor_plan.id not in self._data.get("floor_plans", {}):
            return None

        floor_plan.updated_at = datetime.now().isoformat()
        self._data["floor_plans"][floor_plan.id] = floor_plan.to_dict()
        self.async_delay_save()

        _LOGGER.debug("Updated floor plan: %s", floor_plan.id)
        return floor_plan

    def delete_floor_plan(self, floor_plan_id: str) -> bool:
        """Delete a floor plan and associated data."""
        if floor_plan_id not in self._data.get("floor_plans", {}):
            return False

        del self._data["floor_plans"][floor_plan_id]

        # Clean up associated data
        for key in ("light_placements", "switch_placements"):
            placements = self._data.get(key, {})
            to_del = [k for k, v in placements.items() if v.get("floor_plan_id") == floor_plan_id]
            for k in to_del:
                del placements[k]

        # Clean up sensor configs for rooms in this floor plan
        sensor_configs = self._data.get("sensor_configs", {})
        to_delete = [
            k
            for k, v in sensor_configs.items()
            if v.get("floor_plan_id") == floor_plan_id
        ]
        for key in to_delete:
            del sensor_configs[key]

        # Clean up visual rules
        visual_rules = self._data.get("visual_rules", {})
        to_delete = [
            k
            for k, v in visual_rules.items()
            if v.get("floor_plan_id") == floor_plan_id
        ]
        for key in to_delete:
            del visual_rules[key]

        self.async_delay_save()
        _LOGGER.info("Deleted floor plan: %s", floor_plan_id)
        return True

    # ==================== Floors ====================

    def add_floor(self, floor_plan_id: str, floor: Floor) -> Floor | None:
        """Add a floor to a floor plan."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return None

        floor.id = floor.id or self._generate_id()
        floor_plan.floors.append(floor)
        self.update_floor_plan(floor_plan)
        return floor

    def update_floor(self, floor_plan_id: str, floor: Floor) -> Floor | None:
        """Update a floor in a floor plan."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return None

        for i, existing in enumerate(floor_plan.floors):
            if existing.id == floor.id:
                floor_plan.floors[i] = floor
                self.update_floor_plan(floor_plan)
                return floor
        return None

    def delete_floor(self, floor_plan_id: str, floor_id: str) -> bool:
        """Delete a floor from a floor plan."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return False

        for i, floor in enumerate(floor_plan.floors):
            if floor.id == floor_id:
                floor_plan.floors.pop(i)
                self.update_floor_plan(floor_plan)
                return True
        return False

    # ==================== Rooms ====================

    def add_room(self, floor_plan_id: str, floor_id: str, room: Room) -> Room | None:
        """Add a room to a floor."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return None

        floor = floor_plan.get_floor(floor_id)
        if not floor:
            return None

        room.floor_id = floor_id
        floor.rooms.append(room)
        self.update_floor_plan(floor_plan)

        # Create default sensor config for the room
        if room.occupancy_sensor_enabled:
            self.create_sensor_config(
                VirtualSensorConfig(
                    room_id=room.id,
                    floor_plan_id=floor_plan_id,
                    motion_timeout=room.motion_timeout,
                    checking_timeout=room.checking_timeout,
                )
            )

        return room

    def update_room(self, floor_plan_id: str, room: Room) -> Room | None:
        """Update a room."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return None

        for floor in floor_plan.floors:
            for i, existing in enumerate(floor.rooms):
                if existing.id == room.id:
                    floor.rooms[i] = room
                    self.update_floor_plan(floor_plan)
                    return room
        return None

    def delete_room(self, floor_plan_id: str, room_id: str) -> bool:
        """Delete a room."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return False

        for floor in floor_plan.floors:
            for i, room in enumerate(floor.rooms):
                if room.id == room_id:
                    floor.rooms.pop(i)
                    self.update_floor_plan(floor_plan)

                    # Remove associated sensor config
                    self.delete_sensor_config(room_id)

                    return True
        return False

    def get_room(self, floor_plan_id: str, room_id: str) -> Room | None:
        """Get a room by ID."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return None

        result = floor_plan.get_room(room_id)
        if result:
            return result[1]
        return None

    # ==================== Zones ====================

    def add_zone(
        self, floor_plan_id: str, floor_id: str, zone: Zone
    ) -> Zone | None:
        """Add a zone to a floor."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return None

        floor = floor_plan.get_floor(floor_id)
        if not floor:
            return None

        zone.floor_id = floor_id
        floor.zones.append(zone)
        self.update_floor_plan(floor_plan)

        if zone.occupancy_sensor_enabled:
            self.create_sensor_config(
                VirtualSensorConfig(
                    room_id=zone.id,
                    floor_plan_id=floor_plan_id,
                    motion_timeout=zone.motion_timeout,
                    checking_timeout=zone.checking_timeout,
                )
            )

        return zone

    def update_zone(self, floor_plan_id: str, zone: Zone) -> Zone | None:
        """Update a zone."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return None

        for floor in floor_plan.floors:
            for i, existing in enumerate(floor.zones):
                if existing.id == zone.id:
                    floor.zones[i] = zone
                    self.update_floor_plan(floor_plan)
                    return zone
        return None

    def delete_zone(self, floor_plan_id: str, zone_id: str) -> bool:
        """Delete a zone."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return False

        for floor in floor_plan.floors:
            for i, zone in enumerate(floor.zones):
                if zone.id == zone_id:
                    floor.zones.pop(i)
                    self.update_floor_plan(floor_plan)
                    self.delete_sensor_config(zone_id)
                    return True
        return False

    def get_zone(self, floor_plan_id: str, zone_id: str) -> Zone | None:
        """Get a zone by ID."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return None

        for floor in floor_plan.floors:
            zone = floor.get_zone(zone_id)
            if zone:
                return zone
        return None

    # ==================== Edges ====================

    def add_edge(self, floor_plan_id: str, floor_id: str, edge: Edge) -> Edge | None:
        """Add an edge to a floor."""
        floor_plan = self.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return None

        floor = floor_plan.get_floor(floor_id)
        if not floor:
            return None

        floor.edges.append(edge)
        self.update_floor_plan(floor_plan)
        return edge

    # ==================== Light Placements ====================

    def get_light_placements(self, floor_plan_id: str) -> list[LightPlacement]:
        """Get all light placements for a floor plan."""
        placements = []
        for data in self._data.get("light_placements", {}).values():
            if data.get("floor_plan_id") == floor_plan_id:
                placements.append(LightPlacement.from_dict(data))
        return placements

    def place_light(
        self, floor_plan_id: str, light: LightPlacement
    ) -> LightPlacement:
        """Place a light on a floor plan."""
        if "light_placements" not in self._data:
            self._data["light_placements"] = {}
        data = light.to_dict()
        data["floor_plan_id"] = floor_plan_id
        self._data["light_placements"][light.id] = data
        self.async_delay_save()
        return light

    def update_light_placement(
        self, light: LightPlacement
    ) -> LightPlacement | None:
        """Update a light placement."""
        if light.id not in self._data.get("light_placements", {}):
            return None
        fp_id = self._data["light_placements"][light.id].get("floor_plan_id", "")
        data = light.to_dict()
        data["floor_plan_id"] = fp_id
        self._data["light_placements"][light.id] = data
        self.async_delay_save()
        return light

    def remove_light_placement(self, light_id: str) -> bool:
        """Remove a light placement."""
        if light_id in self._data.get("light_placements", {}):
            del self._data["light_placements"][light_id]
            self.async_delay_save()
            return True
        return False

    def get_light_placement(self, light_id: str) -> LightPlacement | None:
        """Get a single light placement by ID."""
        data = self._data.get("light_placements", {}).get(light_id)
        if data:
            return LightPlacement.from_dict(data)
        return None

    # ==================== Switch Placements ====================

    def get_switch_placements(self, floor_plan_id: str) -> list[SwitchPlacement]:
        """Get all switch placements for a floor plan."""
        placements = []
        for data in self._data.get("switch_placements", {}).values():
            if data.get("floor_plan_id") == floor_plan_id:
                placements.append(SwitchPlacement.from_dict(data))
        return placements

    def place_switch(
        self, floor_plan_id: str, switch: SwitchPlacement
    ) -> SwitchPlacement:
        """Place a switch on a floor plan."""
        if "switch_placements" not in self._data:
            self._data["switch_placements"] = {}
        data = switch.to_dict()
        data["floor_plan_id"] = floor_plan_id
        self._data["switch_placements"][switch.id] = data
        self.async_delay_save()
        return switch

    def update_switch_placement(
        self, switch: SwitchPlacement
    ) -> SwitchPlacement | None:
        """Update a switch placement."""
        if switch.id not in self._data.get("switch_placements", {}):
            return None
        fp_id = self._data["switch_placements"][switch.id].get("floor_plan_id", "")
        data = switch.to_dict()
        data["floor_plan_id"] = fp_id
        self._data["switch_placements"][switch.id] = data
        self.async_delay_save()
        return switch

    def remove_switch_placement(self, switch_id: str) -> bool:
        """Remove a switch placement."""
        if switch_id in self._data.get("switch_placements", {}):
            del self._data["switch_placements"][switch_id]
            self.async_delay_save()
            return True
        return False

    def get_switch_placement(self, switch_id: str) -> SwitchPlacement | None:
        """Get a single switch placement by ID."""
        data = self._data.get("switch_placements", {}).get(switch_id)
        if data:
            return SwitchPlacement.from_dict(data)
        return None

    # ==================== Sensor Configs ====================

    def find_floor_plan_id_for_room(self, room_id: str) -> str | None:
        """Find the floor plan ID that contains a given room or zone."""
        for fp in self.get_floor_plans():
            for floor in fp.floors:
                for room in floor.rooms:
                    if room.id == room_id:
                        return fp.id
                for zone in floor.zones:
                    if zone.id == room_id:
                        return fp.id
        return None

    def get_sensor_config(self, room_id: str) -> VirtualSensorConfig | None:
        """Get sensor configuration for a room."""
        data = self._data.get("sensor_configs", {}).get(room_id)
        if data:
            return VirtualSensorConfig.from_dict(data)
        return None

    def get_all_sensor_configs(self) -> list[VirtualSensorConfig]:
        """Get all sensor configurations."""
        configs = []
        for data in self._data.get("sensor_configs", {}).values():
            configs.append(VirtualSensorConfig.from_dict(data))
        return configs

    def create_sensor_config(self, config: VirtualSensorConfig) -> VirtualSensorConfig:
        """Create a sensor configuration."""
        if "sensor_configs" not in self._data:
            self._data["sensor_configs"] = {}

        self._data["sensor_configs"][config.room_id] = config.to_dict()
        self.async_delay_save()
        return config

    def update_sensor_config(
        self, config: VirtualSensorConfig
    ) -> VirtualSensorConfig | None:
        """Update a sensor configuration."""
        if config.room_id not in self._data.get("sensor_configs", {}):
            return None

        self._data["sensor_configs"][config.room_id] = config.to_dict()
        self.async_delay_save()
        return config

    def delete_sensor_config(self, room_id: str) -> bool:
        """Delete a sensor configuration."""
        if room_id in self._data.get("sensor_configs", {}):
            del self._data["sensor_configs"][room_id]
            self.async_delay_save()
            return True
        return False

    # ==================== Visual Rules ====================

    def get_visual_rules(self, floor_plan_id: str) -> list[VisualRule]:
        """Get all visual rules for a floor plan."""
        rules = []
        for data in self._data.get("visual_rules", {}).values():
            if data.get("floor_plan_id") == floor_plan_id:
                rules.append(VisualRule.from_dict(data))
        return rules

    def get_visual_rule(self, rule_id: str) -> VisualRule | None:
        """Get a visual rule by ID."""
        data = self._data.get("visual_rules", {}).get(rule_id)
        if data:
            return VisualRule.from_dict(data)
        return None

    def create_visual_rule(self, rule: VisualRule) -> VisualRule:
        """Create a visual rule."""
        if "visual_rules" not in self._data:
            self._data["visual_rules"] = {}

        self._data["visual_rules"][rule.id] = rule.to_dict()
        self.async_delay_save()
        return rule

    def update_visual_rule(self, rule: VisualRule) -> VisualRule | None:
        """Update a visual rule."""
        if rule.id not in self._data.get("visual_rules", {}):
            return None

        self._data["visual_rules"][rule.id] = rule.to_dict()
        self.async_delay_save()
        return rule

    def delete_visual_rule(self, rule_id: str) -> bool:
        """Delete a visual rule."""
        if rule_id in self._data.get("visual_rules", {}):
            del self._data["visual_rules"][rule_id]
            self.async_delay_save()
            return True
        return False

    # ==================== mmWave Placements ====================

    def get_mmwave_placements(self, floor_plan_id: str) -> list[MmwavePlacement]:
        """Get all mmWave placements for a floor plan."""
        placements = []
        for data in self._data.get("mmwave_placements", {}).values():
            if data.get("floor_plan_id") == floor_plan_id:
                placements.append(MmwavePlacement.from_dict(data))
        return placements

    def get_mmwave_placement(self, placement_id: str) -> MmwavePlacement | None:
        """Get a single mmWave placement by ID."""
        data = self._data.get("mmwave_placements", {}).get(placement_id)
        if data:
            return MmwavePlacement.from_dict(data)
        return None

    def create_mmwave_placement(self, placement: MmwavePlacement) -> MmwavePlacement:
        """Create an mmWave placement."""
        if "mmwave_placements" not in self._data:
            self._data["mmwave_placements"] = {}

        self._data["mmwave_placements"][placement.id] = placement.to_dict()
        self.async_delay_save()
        return placement

    def update_mmwave_placement(
        self, placement: MmwavePlacement
    ) -> MmwavePlacement | None:
        """Update an mmWave placement."""
        if placement.id not in self._data.get("mmwave_placements", {}):
            return None

        self._data["mmwave_placements"][placement.id] = placement.to_dict()
        self.async_delay_save()
        return placement

    def delete_mmwave_placement(self, placement_id: str) -> bool:
        """Delete an mmWave placement."""
        if placement_id in self._data.get("mmwave_placements", {}):
            del self._data["mmwave_placements"][placement_id]
            self.async_delay_save()
            return True
        return False

    # ==================== Utilities ====================

    def _generate_id(self) -> str:
        """Generate a unique ID."""
        import uuid

        return uuid.uuid4().hex[:8]
