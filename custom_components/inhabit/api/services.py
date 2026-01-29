"""Service handlers for Inhabit Floor Plan Builder."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv

from ..const import (
    ATTR_FLOOR_PLAN_ID,
    ATTR_ROOM_ID,
    DOMAIN,
    OccupancyState,
    SERVICE_EXPORT_AUTOMATION,
    SERVICE_EXPORT_CARD,
    SERVICE_REFRESH_SENSORS,
    SERVICE_SET_ROOM_OCCUPANCY,
)

_LOGGER = logging.getLogger(__name__)

SET_ROOM_OCCUPANCY_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ROOM_ID): cv.string,
        vol.Required("state"): vol.In([
            OccupancyState.VACANT,
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        ]),
    }
)

EXPORT_AUTOMATION_SCHEMA = vol.Schema(
    {
        vol.Required("rule_id"): cv.string,
    }
)

EXPORT_CARD_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_FLOOR_PLAN_ID): cv.string,
        vol.Optional(ATTR_ROOM_ID): cv.string,
    }
)


async def async_register_services(hass: HomeAssistant) -> None:
    """Register services."""

    async def handle_set_room_occupancy(call: ServiceCall) -> None:
        """Handle set_room_occupancy service call."""
        room_id = call.data[ATTR_ROOM_ID]
        state = call.data["state"]

        sensor_engine = hass.data[DOMAIN]["sensor_engine"]
        if not sensor_engine.set_room_occupancy(room_id, state):
            _LOGGER.warning("Failed to set occupancy for room %s", room_id)

    async def handle_refresh_sensors(call: ServiceCall) -> None:
        """Handle refresh_sensors service call."""
        sensor_engine = hass.data[DOMAIN]["sensor_engine"]
        await sensor_engine.async_refresh()

    async def handle_export_automation(call: ServiceCall) -> dict[str, Any]:
        """Handle export_automation service call."""
        rule_id = call.data["rule_id"]
        store = hass.data[DOMAIN]["store"]

        rule = store.get_visual_rule(rule_id)
        if not rule:
            _LOGGER.warning("Rule not found: %s", rule_id)
            return {"error": "Rule not found"}

        return rule.to_ha_automation()

    async def handle_export_card(call: ServiceCall) -> dict[str, Any]:
        """Handle export_card service call."""
        floor_plan_id = call.data[ATTR_FLOOR_PLAN_ID]
        room_id = call.data.get(ATTR_ROOM_ID)
        store = hass.data[DOMAIN]["store"]

        floor_plan = store.get_floor_plan(floor_plan_id)
        if not floor_plan:
            return {"error": "Floor plan not found"}

        # Generate Lovelace card YAML
        from ..generators.card_exporter import CardExporter
        exporter = CardExporter(hass, store)

        if room_id:
            return exporter.export_room_card(floor_plan_id, room_id)
        else:
            return exporter.export_floor_plan_card(floor_plan_id)

    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_ROOM_OCCUPANCY,
        handle_set_room_occupancy,
        schema=SET_ROOM_OCCUPANCY_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_REFRESH_SENSORS,
        handle_refresh_sensors,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_EXPORT_AUTOMATION,
        handle_export_automation,
        schema=EXPORT_AUTOMATION_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_EXPORT_CARD,
        handle_export_card,
        schema=EXPORT_CARD_SCHEMA,
    )

    _LOGGER.debug("Registered services")
