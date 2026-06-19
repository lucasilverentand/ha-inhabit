"""Service handlers for Inhabit Floor Plan Builder."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.helpers import config_validation as cv

from ..config_patch import apply_sensor_config_patch, preview_sensor_config_patch
from ..const import (
    ATTR_FLOOR_PLAN_ID,
    ATTR_ROOM_ID,
    DOMAIN,
    SERVICE_APPLY_SENSOR_CONFIG_PATCH,
    SERVICE_EXPORT_AUTOMATION,
    SERVICE_EXPORT_CARD,
    SERVICE_PREVIEW_SENSOR_CONFIG_PATCH,
    SERVICE_REFRESH_SENSORS,
    SERVICE_SET_ROOM_OCCUPANCY,
    OccupancyState,
)

_LOGGER = logging.getLogger(__name__)

SET_ROOM_OCCUPANCY_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ROOM_ID): cv.string,
        vol.Required("state"): vol.In(
            [
                OccupancyState.VACANT,
                OccupancyState.OCCUPIED,
                OccupancyState.CHECKING,
            ]
        ),
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

SENSOR_CONFIG_PATCH_PREVIEW_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ROOM_ID): cv.string,
        vol.Required("patch"): dict,
        vol.Optional("reason"): cv.string,
    }
)

SENSOR_CONFIG_PATCH_APPLY_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ROOM_ID): cv.string,
        vol.Required("patch"): dict,
        vol.Required("reason"): cv.string,
        vol.Required("confirm"): bool,
    }
)


async def async_register_services(hass: HomeAssistant) -> None:
    """Register services."""

    async def handle_set_room_occupancy(call: ServiceCall) -> None:
        """Handle set_room_occupancy service call."""
        room_id = call.data[ATTR_ROOM_ID]
        state = call.data["state"]

        sensor_engine = hass.data[DOMAIN]["sensor_engine"]
        try:
            if not sensor_engine.set_room_occupancy(room_id, state):
                _LOGGER.warning("Failed to set occupancy for room %s", room_id)
        except Exception:
            _LOGGER.exception(
                "Sensor engine 'set_room_occupancy' failed for region %s",
                room_id,
            )

    async def handle_refresh_sensors(call: ServiceCall) -> None:
        """Handle refresh_sensors service call."""
        sensor_engine = hass.data[DOMAIN]["sensor_engine"]
        try:
            await sensor_engine.async_refresh()
        except Exception:
            _LOGGER.exception(
                "Sensor engine 'async_refresh' failed",
            )

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

    async def handle_preview_sensor_config_patch(
        call: ServiceCall,
    ) -> dict[str, Any]:
        """Preview an AI-proposed occupancy sensor config patch."""
        store = hass.data[DOMAIN]["store"]
        result = preview_sensor_config_patch(
            store,
            call.data[ATTR_ROOM_ID],
            call.data["patch"],
        )
        return result.to_dict()

    async def handle_apply_sensor_config_patch(call: ServiceCall) -> dict[str, Any]:
        """Apply a confirmed AI-proposed occupancy sensor config patch."""
        if call.data["confirm"] is not True:
            return {"valid": False, "errors": ["confirm must be true"]}

        store = hass.data[DOMAIN]["store"]
        sensor_engine = hass.data[DOMAIN]["sensor_engine"]
        result = await apply_sensor_config_patch(
            store,
            sensor_engine,
            call.data[ATTR_ROOM_ID],
            call.data["patch"],
        )
        payload = result.to_dict()
        if result.valid and result.config is not None:
            diagnostic = sensor_engine.record_diagnostic(
                category="config",
                event="config_patch_applied",
                room_id=call.data[ATTR_ROOM_ID],
                reason=call.data["reason"],
                metadata={
                    "diff": result.diff,
                    "warnings": result.warnings,
                    "source": "service",
                },
            )
            payload["diagnostic_event_id"] = diagnostic.id
        return payload

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

    hass.services.async_register(
        DOMAIN,
        SERVICE_PREVIEW_SENSOR_CONFIG_PATCH,
        handle_preview_sensor_config_patch,
        schema=SENSOR_CONFIG_PATCH_PREVIEW_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_APPLY_SENSOR_CONFIG_PATCH,
        handle_apply_sensor_config_patch,
        schema=SENSOR_CONFIG_PATCH_APPLY_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )

    _LOGGER.debug("Registered services")
