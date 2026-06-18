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
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from ..const import (
    ATTR_CONFIDENCE,
    ATTR_CONTRIBUTING_SENSORS,
    ATTR_DIRECT_OUTSIDE_EXPOSURE,
    ATTR_EXTERIOR_OPENINGS,
    ATTR_FLOOR_PLAN_ID,
    ATTR_INTERIOR_OPENINGS,
    ATTR_LAST_MOTION_AT,
    ATTR_LAST_PRESENCE_AT,
    ATTR_ROOM_ID,
    ATTR_SEAL_PROBABILITY,
    ATTR_SEALED,
    ATTR_SEALED_SINCE,
    ATTR_SENSOR_DIAGNOSTICS,
    ATTR_STATE_MACHINE_STATE,
    DOMAIN,
    OccupancyState,
)
from ..engine.outside_exposure import (
    SIGNAL_OUTSIDE_EXPOSURE_CHANGED,
    SIGNAL_OUTSIDE_EXPOSURE_ROOM_ADDED,
    SIGNAL_OUTSIDE_EXPOSURE_ROOM_REMOVED,
    OutsideExposureState,
)
from ..engine.virtual_sensor_engine import SIGNAL_OCCUPANCY_STATE_CHANGED
from ..models.virtual_sensor import OccupancyStateData
from .const import ENTITY_PREFIX, SUFFIX_OCCUPANCY, SUFFIX_OUTSIDE_EXPOSURE

_LOGGER = logging.getLogger(__name__)

_VALID_OCCUPANCY_STATES = {
    OccupancyState.VACANT,
    OccupancyState.OCCUPIED,
    OccupancyState.CHECKING,
}


def _restored_occupancy_state_data(restored_state: Any) -> OccupancyStateData | None:
    """Convert a restored HA state into occupancy state data."""
    attributes = dict(restored_state.attributes or {})
    state = attributes.get(ATTR_STATE_MACHINE_STATE)
    if state not in _VALID_OCCUPANCY_STATES:
        state = (
            OccupancyState.OCCUPIED
            if restored_state.state == "on"
            else OccupancyState.VACANT
        )

    attributes["state"] = state
    try:
        return OccupancyStateData.from_dict(attributes)
    except (TypeError, ValueError):
        return OccupancyStateData(state=state)


def _restored_outside_exposure_state(
    room_id: str,
    restored_state: Any,
) -> OutsideExposureState:
    """Convert a restored HA state into outside exposure state data."""
    attributes = dict(restored_state.attributes or {})
    return OutsideExposureState(
        room_id=room_id,
        exposed=restored_state.state == "on",
        direct_exposure=bool(attributes.get(ATTR_DIRECT_OUTSIDE_EXPOSURE, False)),
        exterior_openings=tuple(attributes.get(ATTR_EXTERIOR_OPENINGS, [])),
        interior_openings=tuple(attributes.get(ATTR_INTERIOR_OPENINGS, [])),
    )


@callback
def _sync_new_device_area(
    hass: HomeAssistant, region_id: str, ha_area_id: str | None
) -> None:
    """Sync the HA area for a newly created device."""
    if not ha_area_id:
        return
    dev_reg = dr.async_get(hass)
    device = dev_reg.async_get_device(identifiers={(DOMAIN, region_id)})
    if device:
        dev_reg.async_update_device(device.id, area_id=ha_area_id)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up virtual occupancy sensors from a config entry."""
    store = hass.data[DOMAIN]["store"]

    # Track entities by region_id for removal
    occupancy_entity_map: dict[str, VirtualOccupancySensor] = {}
    outside_entity_map: dict[str, VirtualOutsideExposureSensor] = {}

    # Create entities for all existing rooms and zones with occupancy enabled
    entities: list[BinarySensorEntity] = []
    for floor_plan in store.get_floor_plans():
        for room in floor_plan.get_all_rooms():
            if room.occupancy_sensor_enabled:
                config = store.get_sensor_config(room.id)
                if config:
                    entity = VirtualOccupancySensor(
                        hass,
                        floor_plan.id,
                        floor_plan.name,
                        room.id,
                        room.name,
                    )
                    entities.append(entity)
                    occupancy_entity_map[room.id] = entity
            outside_entity = VirtualOutsideExposureSensor(
                hass,
                floor_plan.id,
                floor_plan.name,
                room.id,
                room.name,
            )
            entities.append(outside_entity)
            outside_entity_map[room.id] = outside_entity
        for floor in floor_plan.floors:
            for zone in floor.zones:
                if zone.occupancy_sensor_enabled:
                    config = store.get_sensor_config(zone.id)
                    if config:
                        entity = VirtualOccupancySensor(
                            hass,
                            floor_plan.id,
                            floor_plan.name,
                            zone.id,
                            zone.name,
                        )
                        entities.append(entity)
                        occupancy_entity_map[zone.id] = entity

    if entities:
        async_add_entities(entities)
        _LOGGER.info("Added %d virtual binary sensors", len(entities))

    # Listen for new sensors being added (rooms or zones)
    @callback
    def async_add_sensor(region_id: str) -> None:
        """Handle new sensor being added for a room or zone."""
        for floor_plan in store.get_floor_plans():
            # Check rooms
            result = floor_plan.get_room(region_id)
            if result:
                _floor, room = result
                entity = VirtualOccupancySensor(
                    hass,
                    floor_plan.id,
                    floor_plan.name,
                    room.id,
                    room.name,
                )
                occupancy_entity_map[room.id] = entity
                async_add_entities([entity])
                _sync_new_device_area(hass, room.id, room.ha_area_id)
                _LOGGER.info("Added virtual occupancy sensor for room %s", room.name)
                return
            # Check zones
            for floor in floor_plan.floors:
                zone = floor.get_zone(region_id)
                if zone:
                    entity = VirtualOccupancySensor(
                        hass,
                        floor_plan.id,
                        floor_plan.name,
                        zone.id,
                        zone.name,
                    )
                    occupancy_entity_map[zone.id] = entity
                    async_add_entities([entity])
                    _sync_new_device_area(hass, zone.id, zone.ha_area_id)
                    _LOGGER.info(
                        "Added virtual occupancy sensor for zone %s", zone.name
                    )
                    return

    config_entry.async_on_unload(
        async_dispatcher_connect(
            hass,
            f"{DOMAIN}_sensor_added",
            async_add_sensor,
        )
    )

    # Listen for sensors being removed (rooms or zones deleted / occupancy disabled)
    @callback
    def async_remove_sensor(region_id: str) -> None:
        """Handle sensor removal for a room or zone."""
        entity = occupancy_entity_map.pop(region_id, None)
        if entity:
            _LOGGER.info("Removing virtual occupancy sensor for region %s", region_id)
            hass.async_create_task(entity.async_remove())

    config_entry.async_on_unload(
        async_dispatcher_connect(
            hass,
            f"{DOMAIN}_sensor_removed",
            async_remove_sensor,
        )
    )

    @callback
    def async_add_outside_exposure_sensor(room_id: str) -> None:
        """Handle outside exposure sensor being added for a room."""
        if room_id in outside_entity_map:
            return
        for floor_plan in store.get_floor_plans():
            result = floor_plan.get_room(room_id)
            if not result:
                continue
            _floor, room = result
            entity = VirtualOutsideExposureSensor(
                hass,
                floor_plan.id,
                floor_plan.name,
                room.id,
                room.name,
            )
            outside_entity_map[room.id] = entity
            async_add_entities([entity])
            _sync_new_device_area(hass, room.id, room.ha_area_id)
            _LOGGER.info("Added outside exposure sensor for room %s", room.name)
            return

    config_entry.async_on_unload(
        async_dispatcher_connect(
            hass,
            SIGNAL_OUTSIDE_EXPOSURE_ROOM_ADDED,
            async_add_outside_exposure_sensor,
        )
    )

    @callback
    def async_remove_outside_exposure_sensor(room_id: str) -> None:
        """Handle outside exposure sensor removal for a room."""
        entity = outside_entity_map.pop(room_id, None)
        if entity:
            _LOGGER.info("Removing outside exposure sensor for room %s", room_id)
            hass.async_create_task(entity.async_remove())

    config_entry.async_on_unload(
        async_dispatcher_connect(
            hass,
            SIGNAL_OUTSIDE_EXPOSURE_ROOM_REMOVED,
            async_remove_outside_exposure_sensor,
        )
    )


class VirtualOccupancySensor(RestoreEntity, BinarySensorEntity):
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
        self._attr_unique_id = f"{ENTITY_PREFIX}{room_id}{SUFFIX_OCCUPANCY}"
        self._attr_name = "Occupancy"

        # Device info - one device per sensor
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, room_id)},
            name=room_name,
            manufacturer="Inhabit",
            model="Virtual Occupancy Sensor",
            via_device=(DOMAIN, floor_plan_id),
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
            ATTR_SEALED: self._state_data.sealed,
            ATTR_SEAL_PROBABILITY: self._state_data.seal_probability,
        }

        if self._state_data.last_motion_at:
            attrs[ATTR_LAST_MOTION_AT] = self._state_data.last_motion_at.isoformat()

        if self._state_data.last_presence_at:
            attrs[ATTR_LAST_PRESENCE_AT] = self._state_data.last_presence_at.isoformat()

        if self._state_data.sealed_since:
            attrs[ATTR_SEALED_SINCE] = self._state_data.sealed_since.isoformat()

        if self._state_data.sensor_diagnostics:
            attrs[ATTR_SENSOR_DIAGNOSTICS] = self._state_data.sensor_diagnostics

        return attrs

    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        await super().async_added_to_hass()

        restored_state = await self.async_get_last_state()
        restored_state_data = None
        if restored_state:
            restored_state_data = _restored_occupancy_state_data(restored_state)
            if restored_state_data:
                self._state_data = restored_state_data

        # Get initial state from engine. Keep restored occupied/checking states
        # until the startup settle reconciliation republishes current engine state.
        sensor_engine = self.hass.data[DOMAIN]["sensor_engine"]
        state = sensor_engine.get_state(self._room_id)
        if state and (
            restored_state_data is None or state.state != OccupancyState.VACANT
        ):
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


class VirtualOutsideExposureSensor(RestoreEntity, BinarySensorEntity):
    """Virtual outside exposure sensor for a room."""

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
        self._state_data = OutsideExposureState(room_id=room_id)

        self._attr_unique_id = f"{ENTITY_PREFIX}{room_id}{SUFFIX_OUTSIDE_EXPOSURE}"
        self._attr_name = "Outside Exposure"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, room_id)},
            name=room_name,
            manufacturer="Inhabit",
            model="Outside Exposure Sensor",
            via_device=(DOMAIN, floor_plan_id),
        )

    @property
    def is_on(self) -> bool:
        """Return true if the room is exposed to outside air."""
        return self._state_data.exposed

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional state attributes."""
        return {
            ATTR_FLOOR_PLAN_ID: self._floor_plan_id,
            ATTR_ROOM_ID: self._room_id,
            ATTR_DIRECT_OUTSIDE_EXPOSURE: self._state_data.direct_exposure,
            ATTR_EXTERIOR_OPENINGS: list(self._state_data.exterior_openings),
            ATTR_INTERIOR_OPENINGS: list(self._state_data.interior_openings),
        }

    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        await super().async_added_to_hass()

        restored_state = await self.async_get_last_state()
        if restored_state:
            self._state_data = _restored_outside_exposure_state(
                self._room_id,
                restored_state,
            )

        outside_exposure_engine = self.hass.data[DOMAIN]["outside_exposure_engine"]
        state = outside_exposure_engine.get_state(self._room_id)
        if state:
            self._state_data = state

        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                SIGNAL_OUTSIDE_EXPOSURE_CHANGED,
                self._handle_state_change,
            )
        )

    @callback
    def _handle_state_change(self, room_id: str, state: OutsideExposureState) -> None:
        """Handle state change from the outside exposure engine."""
        if room_id != self._room_id:
            return

        self._state_data = state
        self.async_write_ha_state()
