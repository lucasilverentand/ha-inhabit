"""WebSocket handlers for zone operations."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...models.floor_plan import Polygon
from ...models.virtual_sensor import VirtualSensorConfig
from ...models.zone import Zone
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
    """Register zone WebSocket commands."""
    websocket_api.async_register_command(hass, ws_zones_add)
    websocket_api.async_register_command(hass, ws_zones_update)
    websocket_api.async_register_command(hass, ws_zones_delete)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/zones/add",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("name"): str,
        vol.Required("polygon"): dict,
        vol.Optional("color", default="#e0e0e0"): str,
        vol.Optional("rotation", default=0.0): vol.Coerce(float),
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("ha_area_id"): vol.Any(str, None),
        vol.Optional("occupancy_sensor_enabled", default=False): bool,
        vol.Optional("motion_timeout", default=120): int,
        vol.Optional("checking_timeout", default=30): int,
        vol.Optional("long_stay", default=False): bool,
        vol.Optional("occupies_parent", default=False): bool,
    }
)
@callback
def ws_zones_add(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a zone to a floor."""
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

    zone = Zone(
        name=msg["name"],
        polygon=Polygon.from_dict(msg["polygon"]),
        color=msg["color"],
        rotation=msg["rotation"],
        room_id=msg.get("room_id"),
        ha_area_id=ha_area_id,
        occupancy_sensor_enabled=msg["occupancy_sensor_enabled"],
        motion_timeout=msg["motion_timeout"],
        checking_timeout=msg["checking_timeout"],
        long_stay=msg["long_stay"],
        occupies_parent=msg["occupies_parent"],
    )
    result = store.add_zone(msg["floor_plan_id"], msg["floor_id"], zone)
    if result:
        if zone.occupancy_sensor_enabled:
            sensor_engine = hass.data[DOMAIN]["sensor_engine"]
            hass.async_create_task(
                _safe_engine_op(
                    sensor_engine.async_add_room(
                        VirtualSensorConfig(
                            room_id=zone.id,
                            floor_plan_id=msg["floor_plan_id"],
                            motion_timeout=zone.motion_timeout,
                            checking_timeout=zone.checking_timeout,
                            long_stay=zone.long_stay,
                            occupies_parent=zone.occupies_parent,
                            phantom_hold_seconds=zone.phantom_hold_seconds,
                        )
                    ),
                    "add",
                    zone.id,
                )
            )
        if ha_area_id:
            _sync_region_device_area(hass, zone.id, ha_area_id)
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "not_found", "Floor not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/zones/update",
        vol.Required("floor_plan_id"): str,
        vol.Required("zone_id"): str,
        vol.Optional("name"): str,
        vol.Optional("polygon"): dict,
        vol.Optional("color"): str,
        vol.Optional("rotation"): vol.Coerce(float),
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("ha_area_id"): vol.Any(str, None),
        vol.Optional("occupancy_sensor_enabled"): bool,
        vol.Optional("motion_timeout"): int,
        vol.Optional("checking_timeout"): int,
        vol.Optional("long_stay"): bool,
        vol.Optional("occupies_parent"): bool,
        vol.Optional("phantom_hold_seconds"): int,
    }
)
@callback
def ws_zones_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a zone."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    zone = store.get_zone(msg["floor_plan_id"], msg["zone_id"])
    if not zone:
        connection.send_error(msg["id"], "not_found", "Zone not found")
        return

    if "name" in msg:
        zone.name = msg["name"]
    if "polygon" in msg:
        zone.polygon = Polygon.from_dict(msg["polygon"])
    if "color" in msg:
        zone.color = msg["color"]
    if "rotation" in msg:
        zone.rotation = msg["rotation"]
    if "room_id" in msg:
        zone.room_id = msg["room_id"]
    if "ha_area_id" in msg:
        next_ha_area_id = _normalize_ha_area_id(msg["ha_area_id"])
        if not _validate_unique_ha_area(
            connection,
            msg,
            store=store,
            floor_plan_id=msg["floor_plan_id"],
            ha_area_id=next_ha_area_id,
            exclude_zone_id=zone.id,
        ):
            return
        zone.ha_area_id = next_ha_area_id
    if "occupancy_sensor_enabled" in msg:
        zone.occupancy_sensor_enabled = msg["occupancy_sensor_enabled"]
    if "motion_timeout" in msg:
        zone.motion_timeout = msg["motion_timeout"]
    if "checking_timeout" in msg:
        zone.checking_timeout = msg["checking_timeout"]
    if "long_stay" in msg:
        zone.long_stay = msg["long_stay"]
    if "occupies_parent" in msg:
        zone.occupies_parent = msg["occupies_parent"]
    if "phantom_hold_seconds" in msg:
        zone.phantom_hold_seconds = msg["phantom_hold_seconds"]

    result = store.update_zone(msg["floor_plan_id"], zone)
    if result:
        # Sync HA area and name to device registry
        if "ha_area_id" in msg:
            _sync_region_device_area(hass, zone.id, zone.ha_area_id)
        if "name" in msg:
            _sync_region_device_name(hass, zone.id, zone.name)
        # Sync zone config fields to sensor config when occupancy is active
        zone_config_fields = {
            "motion_timeout",
            "checking_timeout",
            "long_stay",
            "occupies_parent",
            "phantom_hold_seconds",
        }
        if zone.occupancy_sensor_enabled and zone_config_fields & msg.keys():
            config = store.get_sensor_config(zone.id)
            if config:
                config.motion_timeout = zone.motion_timeout
                config.checking_timeout = zone.checking_timeout
                config.long_stay = zone.long_stay
                config.occupies_parent = zone.occupies_parent
                config.phantom_hold_seconds = zone.phantom_hold_seconds
                sensor_engine = hass.data[DOMAIN]["sensor_engine"]
                hass.async_create_task(
                    _safe_engine_op(
                        sensor_engine.async_update_room(config),
                        "update",
                        zone.id,
                    )
                )

        # Sync occupancy toggle with sensor engine
        if "occupancy_sensor_enabled" in msg:
            sensor_engine = hass.data[DOMAIN]["sensor_engine"]
            if zone.occupancy_sensor_enabled:
                config = store.get_sensor_config(zone.id)
                if not config:
                    config = VirtualSensorConfig(
                        room_id=zone.id,
                        floor_plan_id=msg["floor_plan_id"],
                        motion_timeout=zone.motion_timeout,
                        checking_timeout=zone.checking_timeout,
                        long_stay=zone.long_stay,
                        occupies_parent=zone.occupies_parent,
                        phantom_hold_seconds=zone.phantom_hold_seconds,
                    )
                    store.create_sensor_config(config)
                hass.async_create_task(
                    _safe_engine_op(
                        sensor_engine.async_add_room(config),
                        "add",
                        zone.id,
                    )
                )
            else:
                hass.async_create_task(
                    _disable_region_sensor(sensor_engine, store, zone.id)
                )
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update zone")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/zones/delete",
        vol.Required("floor_plan_id"): str,
        vol.Required("zone_id"): str,
    }
)
@callback
def ws_zones_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a zone."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]

    # Remove from sensor engine and clean up device
    sensor_engine = hass.data[DOMAIN]["sensor_engine"]
    hass.async_create_task(
        _safe_engine_op(
            sensor_engine.async_remove_room(msg["zone_id"]),
            "remove",
            msg["zone_id"],
        )
    )
    _remove_device(hass, msg["zone_id"])

    if store.delete_zone(msg["floor_plan_id"], msg["zone_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Zone not found")
