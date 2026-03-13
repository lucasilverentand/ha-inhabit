"""Occupancy override button entity."""

from __future__ import annotations

import logging

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from ..const import DOMAIN, OccupancyState
from .const import ENTITY_PREFIX, SUFFIX_OVERRIDE

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up occupancy override buttons from a config entry."""
    store = hass.data[DOMAIN]["store"]

    entity_map: dict[str, OccupancyOverrideButton] = {}

    entities: list[OccupancyOverrideButton] = []
    for floor_plan in store.get_floor_plans():
        for room in floor_plan.get_all_rooms():
            if room.occupancy_sensor_enabled:
                config = store.get_sensor_config(room.id)
                if config:
                    entity = OccupancyOverrideButton(
                        hass,
                        floor_plan.id,
                        floor_plan.name,
                        room.id,
                        room.name,
                    )
                    entities.append(entity)
                    entity_map[room.id] = entity
        for floor in floor_plan.floors:
            for zone in floor.zones:
                if zone.occupancy_sensor_enabled:
                    config = store.get_sensor_config(zone.id)
                    if config:
                        entity = OccupancyOverrideButton(
                            hass,
                            floor_plan.id,
                            floor_plan.name,
                            zone.id,
                            zone.name,
                        )
                        entities.append(entity)
                        entity_map[zone.id] = entity

    if entities:
        async_add_entities(entities)
        _LOGGER.info("Added %d occupancy override buttons", len(entities))

    @callback
    def async_add_button(region_id: str) -> None:
        """Handle new sensor being added for a room or zone."""
        for floor_plan in store.get_floor_plans():
            result = floor_plan.get_room(region_id)
            if result:
                _floor, room = result
                entity = OccupancyOverrideButton(
                    hass,
                    floor_plan.id,
                    floor_plan.name,
                    room.id,
                    room.name,
                )
                entity_map[room.id] = entity
                async_add_entities([entity])
                _LOGGER.info("Added occupancy override button for room %s", room.name)
                return
            for floor in floor_plan.floors:
                zone = floor.get_zone(region_id)
                if zone:
                    entity = OccupancyOverrideButton(
                        hass,
                        floor_plan.id,
                        floor_plan.name,
                        zone.id,
                        zone.name,
                    )
                    entity_map[zone.id] = entity
                    async_add_entities([entity])
                    _LOGGER.info(
                        "Added occupancy override button for zone %s", zone.name
                    )
                    return

    async_dispatcher_connect(
        hass,
        f"{DOMAIN}_sensor_added",
        async_add_button,
    )

    @callback
    def async_remove_button(region_id: str) -> None:
        """Handle sensor removal for a room or zone."""
        entity = entity_map.pop(region_id, None)
        if entity:
            _LOGGER.info("Removing occupancy override button for region %s", region_id)
            hass.async_create_task(entity.async_remove())

    async_dispatcher_connect(
        hass,
        f"{DOMAIN}_sensor_removed",
        async_remove_button,
    )


class OccupancyOverrideButton(ButtonEntity):
    """Button to toggle occupancy override for a room."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_icon = "mdi:account-switch"

    def __init__(
        self,
        hass: HomeAssistant,
        floor_plan_id: str,
        floor_plan_name: str,
        room_id: str,
        room_name: str,
    ) -> None:
        """Initialize the button."""
        self.hass = hass
        self._floor_plan_id = floor_plan_id
        self._room_id = room_id

        self._attr_unique_id = f"{ENTITY_PREFIX}{room_id}{SUFFIX_OVERRIDE}"
        self._attr_name = "Occupancy override"

        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, room_id)},
            name=room_name,
            manufacturer="Inhabit",
            model="Virtual Occupancy Sensor",
            via_device=(DOMAIN, floor_plan_id),
        )

    async def async_press(self) -> None:
        """Toggle the room's occupancy state."""
        sensor_engine = self.hass.data[DOMAIN]["sensor_engine"]
        current = sensor_engine.get_state(self._room_id)

        if current and current.state in (
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        ):
            new_state = OccupancyState.VACANT
        else:
            new_state = OccupancyState.OCCUPIED

        _LOGGER.info(
            "Occupancy override button pressed for %s: %s → %s",
            self._room_id,
            current.state if current else "unknown",
            new_state,
        )
        sensor_engine.set_room_occupancy(self._room_id, new_state)
