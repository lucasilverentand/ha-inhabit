"""WebSocket handlers for room operations."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...models.floor_plan import BackgroundLayer, Polygon, Room
from ...models.virtual_sensor import VirtualSensorConfig
from ._helpers import (
    _disable_region_sensor,
    _normalize_ha_area_id,
    _remove_device,
    _require_admin,
    _safe_engine_op,
    _sync_region_device_area,
    _sync_region_device_name,
    _validate_unique_ha_area,
)


def register(hass: HomeAssistant) -> None:
    """Register room WebSocket commands."""
    websocket_api.async_register_command(hass, ws_rooms_add)
    websocket_api.async_register_command(hass, ws_rooms_update)
    websocket_api.async_register_command(hass, ws_rooms_delete)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/rooms/add",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("name"): str,
        vol.Required("polygon"): dict,
        vol.Optional("color", default="#e8e8e8"): str,
        vol.Optional("occupancy_sensor_enabled", default=True): bool,
        vol.Optional("motion_timeout", default=120): int,
        vol.Optional("checking_timeout", default=30): int,
        vol.Optional("long_stay", default=False): bool,
        vol.Optional("ha_area_id"): vol.Any(str, None),
    }
)
@callback
def ws_rooms_add(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a room to a floor."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    ha_area_id = _normalize_ha_area_id(msg.get("ha_area_id"))
    if not _validate_unique_ha_area(
        connection,
        msg,
        store=store,
        floor_plan_id=msg["floor_plan_id"],
        ha_area_id=ha_area_id,
    ):
        return

    room = Room(
        name=msg["name"],
        polygon=Polygon.from_dict(msg["polygon"]),
        color=msg["color"],
        occupancy_sensor_enabled=msg["occupancy_sensor_enabled"],
        motion_timeout=msg["motion_timeout"],
        checking_timeout=msg["checking_timeout"],
        long_stay=msg["long_stay"],
        ha_area_id=ha_area_id,
    )
    result = store.add_room(msg["floor_plan_id"], msg["floor_id"], room)
    if result:
        # Add room to sensor engine if enabled
        if room.occupancy_sensor_enabled:
            sensor_engine = hass.data[DOMAIN]["sensor_engine"]
            hass.async_create_task(
                _safe_engine_op(
                    sensor_engine.async_add_room(
                        VirtualSensorConfig(
                            room_id=room.id,
                            floor_plan_id=msg["floor_plan_id"],
                            motion_timeout=room.motion_timeout,
                            checking_timeout=room.checking_timeout,
                            long_stay=room.long_stay,
                            phantom_hold_seconds=room.phantom_hold_seconds,
                        )
                    ),
                    "add",
                    room.id,
                )
            )
        if ha_area_id:
            _sync_region_device_area(hass, room.id, ha_area_id)
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "not_found", "Floor not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/rooms/update",
        vol.Required("floor_plan_id"): str,
        vol.Required("room_id"): str,
        vol.Optional("name"): str,
        vol.Optional("polygon"): dict,
        vol.Optional("color"): str,
        vol.Optional("occupancy_sensor_enabled"): bool,
        vol.Optional("motion_timeout"): int,
        vol.Optional("checking_timeout"): int,
        vol.Optional("is_transit"): vol.Any(bool, None),
        vol.Optional("long_stay"): bool,
        vol.Optional("phantom_hold_seconds"): int,
        vol.Optional("ha_area_id"): vol.Any(str, None),
        vol.Optional("background_layers"): [dict],
    }
)
@callback
def ws_rooms_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a room."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    room = store.get_room(msg["floor_plan_id"], msg["room_id"])
    if not room:
        connection.send_error(msg["id"], "not_found", "Room not found")
        return

    if "name" in msg:
        room.name = msg["name"]
    if "polygon" in msg:
        room.polygon = Polygon.from_dict(msg["polygon"])
    if "color" in msg:
        room.color = msg["color"]
    if "occupancy_sensor_enabled" in msg:
        room.occupancy_sensor_enabled = msg["occupancy_sensor_enabled"]
    if "motion_timeout" in msg:
        room.motion_timeout = msg["motion_timeout"]
    if "checking_timeout" in msg:
        room.checking_timeout = msg["checking_timeout"]
    if "is_transit" in msg:
        room.is_transit = msg["is_transit"]
    if "long_stay" in msg:
        room.long_stay = msg["long_stay"]
    if "phantom_hold_seconds" in msg:
        room.phantom_hold_seconds = msg["phantom_hold_seconds"]
    if "ha_area_id" in msg:
        next_ha_area_id = _normalize_ha_area_id(msg["ha_area_id"])
        if not _validate_unique_ha_area(
            connection,
            msg,
            store=store,
            floor_plan_id=msg["floor_plan_id"],
            ha_area_id=next_ha_area_id,
            exclude_room_id=room.id,
        ):
            return
        room.ha_area_id = next_ha_area_id
    if "background_layers" in msg:
        room.background_layers = [
            BackgroundLayer.from_dict(layer) for layer in msg["background_layers"]
        ]

    result = store.update_room(msg["floor_plan_id"], room)
    if result:
        # Sync HA area and name to device registry
        if "ha_area_id" in msg:
            _sync_region_device_area(hass, room.id, room.ha_area_id)
        if "name" in msg:
            _sync_region_device_name(hass, room.id, room.name)
        # Sync room config fields to sensor config when occupancy is active
        room_config_fields = {
            "motion_timeout",
            "checking_timeout",
            "long_stay",
            "phantom_hold_seconds",
        }
        if room.occupancy_sensor_enabled and room_config_fields & msg.keys():
            config = store.get_sensor_config(room.id)
            if config:
                config.motion_timeout = room.motion_timeout
                config.checking_timeout = room.checking_timeout
                config.long_stay = room.long_stay
                config.phantom_hold_seconds = room.phantom_hold_seconds
                sensor_engine = hass.data[DOMAIN]["sensor_engine"]
                hass.async_create_task(
                    _safe_engine_op(
                        sensor_engine.async_update_room(config),
                        "update",
                        room.id,
                    )
                )
        # Sync occupancy toggle with sensor engine
        if "occupancy_sensor_enabled" in msg:
            sensor_engine = hass.data[DOMAIN]["sensor_engine"]
            if room.occupancy_sensor_enabled:
                # Ensure sensor config exists, then add to engine
                config = store.get_sensor_config(room.id)
                if not config:
                    config = VirtualSensorConfig(
                        room_id=room.id,
                        floor_plan_id=msg["floor_plan_id"],
                        motion_timeout=room.motion_timeout,
                        checking_timeout=room.checking_timeout,
                        long_stay=room.long_stay,
                        phantom_hold_seconds=room.phantom_hold_seconds,
                    )
                    store.create_sensor_config(config)
                hass.async_create_task(
                    _safe_engine_op(
                        sensor_engine.async_add_room(config),
                        "add",
                        room.id,
                    )
                )
            else:
                hass.async_create_task(
                    _disable_region_sensor(sensor_engine, store, room.id)
                )
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update room")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/rooms/delete",
        vol.Required("floor_plan_id"): str,
        vol.Required("room_id"): str,
    }
)
@callback
def ws_rooms_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a room."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]

    # Remove from sensor engine and clean up device
    sensor_engine = hass.data[DOMAIN]["sensor_engine"]
    hass.async_create_task(
        _safe_engine_op(
            sensor_engine.async_remove_room(msg["room_id"]),
            "remove",
            msg["room_id"],
        )
    )
    _remove_device(hass, msg["room_id"])

    if store.delete_room(msg["floor_plan_id"], msg["room_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Room not found")
