"""WebSocket handlers for floor operations."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...models.device_placement import LightPlacement, SwitchPlacement
from ...models.floor_plan import Floor, _generate_id
from ...models.virtual_sensor import VirtualSensorConfig
from ._helpers import _remove_device, _require_admin, _safe_engine_op


def register(hass: HomeAssistant) -> None:
    """Register floor WebSocket commands."""
    websocket_api.async_register_command(hass, ws_floors_add)
    websocket_api.async_register_command(hass, ws_floors_update)
    websocket_api.async_register_command(hass, ws_floors_delete)
    websocket_api.async_register_command(hass, ws_floors_export)
    websocket_api.async_register_command(hass, ws_floors_import)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/floors/add",
        vol.Required("floor_plan_id"): str,
        vol.Required("name"): str,
        vol.Optional("level", default=0): int,
    }
)
@callback
def ws_floors_add(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a floor to a floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    floor = Floor(name=msg["name"], level=msg["level"])
    result = store.add_floor(msg["floor_plan_id"], floor)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/floors/update",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Optional("name"): str,
        vol.Optional("level"): int,
        vol.Optional("background_image"): vol.Any(str, None),
        vol.Optional("background_scale"): vol.Coerce(float),
    }
)
@callback
def ws_floors_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a floor."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if not floor_plan:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")
        return

    floor = floor_plan.get_floor(msg["floor_id"])
    if not floor:
        connection.send_error(msg["id"], "not_found", "Floor not found")
        return

    if "name" in msg:
        floor.name = msg["name"]
    if "level" in msg:
        floor.level = msg["level"]
    if "background_image" in msg:
        floor.background_image = msg["background_image"]
    if "background_scale" in msg:
        floor.background_scale = msg["background_scale"]

    result = store.update_floor(msg["floor_plan_id"], floor)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update floor")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/floors/delete",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
    }
)
@callback
def ws_floors_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a floor."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if not floor_plan:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")
        return

    floor = floor_plan.get_floor(msg["floor_id"])
    if not floor:
        connection.send_error(msg["id"], "not_found", "Floor not found")
        return

    # Remove sensors and devices for all rooms and zones on this floor
    sensor_engine = hass.data[DOMAIN]["sensor_engine"]
    for room in floor.rooms:
        hass.async_create_task(
            _safe_engine_op(sensor_engine.async_remove_room(room.id), "remove", room.id)
        )
        _remove_device(hass, room.id)
    for zone in floor.zones:
        hass.async_create_task(
            _safe_engine_op(sensor_engine.async_remove_room(zone.id), "remove", zone.id)
        )
        _remove_device(hass, zone.id)

    if store.delete_floor(msg["floor_plan_id"], msg["floor_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Floor not found")


# ==================== Floor Export / Import ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/floors/export",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
    }
)
@callback
def ws_floors_export(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Export a single floor with device placements and sensor configs."""
    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if not floor_plan:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")
        return

    floor = floor_plan.get_floor(msg["floor_id"])
    if not floor:
        connection.send_error(msg["id"], "not_found", "Floor not found")
        return

    # Gather light and switch placements on this floor
    lights = [
        d.to_dict()
        for d in store.get_light_placements(msg["floor_plan_id"])
        if d.floor_id == floor.id
    ]
    switches = [
        d.to_dict()
        for d in store.get_switch_placements(msg["floor_plan_id"])
        if d.floor_id == floor.id
    ]

    # Gather sensor configs for rooms on this floor
    room_ids = {r.id for r in floor.rooms}
    sensor_configs = []
    for room_id in room_ids:
        cfg = store.get_sensor_config(room_id)
        if cfg:
            sensor_configs.append(cfg.to_dict())

    connection.send_result(
        msg["id"],
        {
            "inhabit_version": "1.0",
            "export_type": "floor",
            "floor": floor.to_dict(),
            "lights": lights,
            "switches": switches,
            "sensor_configs": sensor_configs,
        },
    )


def _remap_floor_ids(floor: Floor) -> dict[str, str]:
    """Assign fresh IDs to all objects in a floor, returning old->new mapping."""
    id_map: dict[str, str] = {}

    # Floor ID
    old_floor_id = floor.id
    floor.id = _generate_id()
    id_map[old_floor_id] = floor.id

    # Node IDs
    for node in floor.nodes:
        old_id = node.id
        node.id = _generate_id()
        id_map[old_id] = node.id

    # Edge IDs + remap node references
    for edge in floor.edges:
        old_id = edge.id
        edge.id = _generate_id()
        id_map[old_id] = edge.id
        edge.start_node = id_map.get(edge.start_node, edge.start_node)
        edge.end_node = id_map.get(edge.end_node, edge.end_node)

    # Room IDs: first pass assigns new IDs
    for room in floor.rooms:
        old_id = room.id
        room.id = _generate_id()
        id_map[old_id] = room.id

    # Room references: second pass remaps floor_id and connected_rooms
    for room in floor.rooms:
        room.floor_id = floor.id
        room.connected_rooms = [id_map.get(cid, cid) for cid in room.connected_rooms]

    # Zone IDs
    for zone in floor.zones:
        old_id = zone.id
        zone.id = _generate_id()
        id_map[old_id] = zone.id
        zone.floor_id = floor.id
        if zone.room_id:
            zone.room_id = id_map.get(zone.room_id, zone.room_id)

    return id_map


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/floors/import",
        vol.Required("floor_plan_id"): str,
        vol.Required("data"): dict,
    }
)
@callback
def ws_floors_import(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Import a floor with device placements and sensor configs."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    floor_plan_id = msg["floor_plan_id"]
    floor_plan = store.get_floor_plan(floor_plan_id)
    if not floor_plan:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")
        return

    data = msg["data"]
    floor_data = data.get("floor")
    if not floor_data or not isinstance(floor_data, dict):
        connection.send_error(
            msg["id"], "invalid_format", "Missing 'floor' key in import data"
        )
        return

    # Parse floor and remap all IDs to avoid collisions
    floor = Floor.from_dict(floor_data)
    id_map = _remap_floor_ids(floor)

    result = store.add_floor(floor_plan_id, floor)
    if not result:
        connection.send_error(msg["id"], "import_failed", "Failed to import floor")
        return

    # Import light placements
    for dev_data in data.get("lights", []):
        light = LightPlacement.from_dict(dev_data)
        light.id = _generate_id()
        light.floor_id = floor.id
        light.room_id = (
            id_map.get(light.room_id, light.room_id) if light.room_id else None
        )
        store.place_light(floor_plan_id, light)

    # Import switch placements
    for dev_data in data.get("switches", []):
        switch = SwitchPlacement.from_dict(dev_data)
        switch.id = _generate_id()
        switch.floor_id = floor.id
        switch.room_id = (
            id_map.get(switch.room_id, switch.room_id) if switch.room_id else None
        )
        store.place_switch(floor_plan_id, switch)

    # Import sensor configs
    for cfg_data in data.get("sensor_configs", []):
        cfg = VirtualSensorConfig.from_dict(cfg_data)
        old_room_id = cfg.room_id
        cfg.room_id = id_map.get(old_room_id, old_room_id)
        cfg.floor_plan_id = floor_plan_id
        store.create_sensor_config(cfg)

    connection.send_result(msg["id"], result.to_dict())
