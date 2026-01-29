"""Virtual occupancy sensor entity."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from ..const import (
    ATTR_CONFIDENCE,
    ATTR_CONTRIBUTING_SENSORS,
    ATTR_LAST_MOTION_AT,
    ATTR_LAST_PRESENCE_AT,
    ATTR_STATE_MACHINE_STATE,
    DOMAIN,
    OccupancyState,
)
from ..engine.virtual_sensor_engine import SIGNAL_OCCUPANCY_STATE_CHANGED
from ..models.virtual_sensor import OccupancyStateData

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up virtual occupancy sensors from a config entry."""
    store = hass.data[DOMAIN]["store"]

    # Create entities for all existing rooms
    entities: list[VirtualOccupancySensor] = []
    for floor_plan in store.get_floor_plans():
        for room in floor_plan.get_all_rooms():
            if room.occupancy_sensor_enabled:
                config = store.get_sensor_config(room.id)
                if config:
                    entities.append(
                        VirtualOccupancySensor(
                            hass,
                            floor_plan.id,
                            floor_plan.name,
                            room.id,
                            room.name,
                        )
                    )

    if entities:
        async_add_entities(entities)
        _LOGGER.info("Added %d virtual occupancy sensors", len(entities))

    # Listen for new sensors being added
    @callback
    def async_add_sensor(room_id: str) -> None:
        """Handle new sensor being added."""
        # Find the room
        for floor_plan in store.get_floor_plans():
            result = floor_plan.get_room(room_id)
            if result:
                floor, room = result
                async_add_entities(
                    [
                        VirtualOccupancySensor(
                            hass,
                            floor_plan.id,
                            floor_plan.name,
                            room.id,
                            room.name,
                        )
                    ]
                )
                _LOGGER.info("Added virtual occupancy sensor for room %s", room.name)
                return

    async_dispatcher_connect(
        hass,
        f"{DOMAIN}_sensor_added",
        async_add_sensor,
    )


class VirtualOccupancySensor(BinarySensorEntity):
    """Virtual occupancy sensor for a room."""

    _attr_device_class = BinarySensorDeviceClass.OCCUPANCY
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        hass: HomeAssistant,
        floor_plan_id: str,
        floor_plan_name: str,
        room_id: str,
        room_name: str,
    ) -> None:
        """Initialize the sensor."""
        self.hass = hass
        self._floor_plan_id = floor_plan_id
        self._room_id = room_id

        # Entity attributes
        self._attr_unique_id = f"fp_{room_id}_occupancy"
        self._attr_name = f"{room_name} Occupancy"

        # Device info - group sensors by floor plan
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, floor_plan_id)},
            name=f"{floor_plan_name} Floor Plan",
            manufacturer="Inhabit",
            model="Virtual Floor Plan",
        )

        # State
        self._state_data = OccupancyStateData()

    @property
    def is_on(self) -> bool:
        """Return true if the room is occupied."""
        return self._state_data.state in (
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        )

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional state attributes."""
        attrs = {
            ATTR_STATE_MACHINE_STATE: self._state_data.state,
            ATTR_CONFIDENCE: self._state_data.confidence,
            ATTR_CONTRIBUTING_SENSORS: self._state_data.contributing_sensors,
        }

        if self._state_data.last_motion_at:
            attrs[ATTR_LAST_MOTION_AT] = self._state_data.last_motion_at.isoformat()

        if self._state_data.last_presence_at:
            attrs[ATTR_LAST_PRESENCE_AT] = self._state_data.last_presence_at.isoformat()

        return attrs

    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        await super().async_added_to_hass()

        # Get initial state from engine
        sensor_engine = self.hass.data[DOMAIN]["sensor_engine"]
        state = sensor_engine.get_state(self._room_id)
        if state:
            self._state_data = state

        # Subscribe to state changes
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                SIGNAL_OCCUPANCY_STATE_CHANGED,
                self._handle_state_change,
            )
        )

    @callback
    def _handle_state_change(self, room_id: str, state: OccupancyStateData) -> None:
        """Handle state change from the sensor engine."""
        if room_id != self._room_id:
            return

        self._state_data = state
        self.async_write_ha_state()
