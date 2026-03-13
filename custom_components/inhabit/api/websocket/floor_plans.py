"""WebSocket handlers for floor plan operations."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...models.floor_plan import FloorPlan
from ._helpers import _remove_device, _require_admin, _safe_engine_op


def register(hass: HomeAssistant) -> None:
    """Register floor plan WebSocket commands."""
    websocket_api.async_register_command(hass, ws_floor_plans_list)
    websocket_api.async_register_command(hass, ws_floor_plans_get)
    websocket_api.async_register_command(hass, ws_floor_plans_create)
    websocket_api.async_register_command(hass, ws_floor_plans_update)
    websocket_api.async_register_command(hass, ws_floor_plans_delete)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/floor_plans/list",
    }
)
@callback
def ws_floor_plans_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all floor plans."""
    store = hass.data[DOMAIN]["store"]
    floor_plans = store.get_floor_plans()
    connection.send_result(msg["id"], [fp.to_dict() for fp in floor_plans])


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/floor_plans/get",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_floor_plans_get(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get a floor plan by ID."""
    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if floor_plan:
        connection.send_result(msg["id"], floor_plan.to_dict())
    else:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/floor_plans/create",
        vol.Required("name"): str,
        vol.Optional("unit", default="cm"): str,
        vol.Optional("grid_size", default=10.0): vol.Coerce(float),
    }
)
@callback
def ws_floor_plans_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a new floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    floor_plan = FloorPlan(
        name=msg["name"],
        unit=msg["unit"],
        grid_size=msg["grid_size"],
    )
    created = store.create_floor_plan(floor_plan)
    connection.send_result(msg["id"], created.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/floor_plans/update",
        vol.Required("floor_plan_id"): str,
        vol.Optional("name"): str,
        vol.Optional("unit"): str,
        vol.Optional("grid_size"): vol.Coerce(float),
    }
)
@callback
def ws_floor_plans_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if not floor_plan:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")
        return

    if "name" in msg:
        floor_plan.name = msg["name"]
    if "unit" in msg:
        floor_plan.unit = msg["unit"]
    if "grid_size" in msg:
        floor_plan.grid_size = msg["grid_size"]

    updated = store.update_floor_plan(floor_plan)
    if updated:
        connection.send_result(msg["id"], updated.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update floor plan")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/floor_plans/delete",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_floor_plans_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if not floor_plan:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")
        return

    # Collect all region IDs (rooms and zones) before deleting
    sensor_engine = hass.data[DOMAIN]["sensor_engine"]
    region_ids = [room.id for room in floor_plan.get_all_rooms()]
    for floor in floor_plan.floors:
        region_ids.extend(zone.id for zone in floor.zones)

    # Remove sensors from the engine and clean up devices
    for region_id in region_ids:
        hass.async_create_task(
            _safe_engine_op(
                sensor_engine.async_remove_room(region_id),
                "remove",
                region_id,
            )
        )
        _remove_device(hass, region_id)

    store.delete_floor_plan(msg["floor_plan_id"])
    connection.send_result(msg["id"], {"success": True})
