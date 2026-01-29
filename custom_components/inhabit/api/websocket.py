"""WebSocket API for Inhabit Floor Plan Builder."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ..const import DOMAIN, WS_PREFIX
from ..models.automation_rule import VisualRule
from ..models.device_placement import DevicePlacement
from ..models.floor_plan import (
    Coordinates,
    Door,
    Floor,
    FloorPlan,
    Polygon,
    Room,
    Wall,
    Window,
)
from ..models.virtual_sensor import SensorBinding, VirtualSensorConfig

_LOGGER = logging.getLogger(__name__)


def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register WebSocket commands."""
    websocket_api.async_register_command(hass, ws_floor_plans_list)
    websocket_api.async_register_command(hass, ws_floor_plans_get)
    websocket_api.async_register_command(hass, ws_floor_plans_create)
    websocket_api.async_register_command(hass, ws_floor_plans_update)
    websocket_api.async_register_command(hass, ws_floor_plans_delete)
    websocket_api.async_register_command(hass, ws_floors_add)
    websocket_api.async_register_command(hass, ws_floors_update)
    websocket_api.async_register_command(hass, ws_floors_delete)
    websocket_api.async_register_command(hass, ws_rooms_add)
    websocket_api.async_register_command(hass, ws_rooms_update)
    websocket_api.async_register_command(hass, ws_rooms_delete)
    websocket_api.async_register_command(hass, ws_walls_add)
    websocket_api.async_register_command(hass, ws_walls_update)
    websocket_api.async_register_command(hass, ws_doors_add)
    websocket_api.async_register_command(hass, ws_windows_add)
    websocket_api.async_register_command(hass, ws_devices_place)
    websocket_api.async_register_command(hass, ws_devices_update)
    websocket_api.async_register_command(hass, ws_devices_remove)
    websocket_api.async_register_command(hass, ws_devices_list)
    websocket_api.async_register_command(hass, ws_sensor_config_get)
    websocket_api.async_register_command(hass, ws_sensor_config_update)
    websocket_api.async_register_command(hass, ws_rules_list)
    websocket_api.async_register_command(hass, ws_rules_create)
    websocket_api.async_register_command(hass, ws_rules_update)
    websocket_api.async_register_command(hass, ws_rules_delete)
    websocket_api.async_register_command(hass, ws_occupancy_states)

    _LOGGER.debug("Registered WebSocket commands")


# ==================== Floor Plans ====================


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
    store = hass.data[DOMAIN]["store"]
    if store.delete_floor_plan(msg["floor_plan_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")


# ==================== Floors ====================


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
    store = hass.data[DOMAIN]["store"]
    if store.delete_floor(msg["floor_plan_id"], msg["floor_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Floor not found")


# ==================== Rooms ====================


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
    }
)
@callback
def ws_rooms_add(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a room to a floor."""
    store = hass.data[DOMAIN]["store"]
    room = Room(
        name=msg["name"],
        polygon=Polygon.from_dict(msg["polygon"]),
        color=msg["color"],
        occupancy_sensor_enabled=msg["occupancy_sensor_enabled"],
        motion_timeout=msg["motion_timeout"],
        checking_timeout=msg["checking_timeout"],
    )
    result = store.add_room(msg["floor_plan_id"], msg["floor_id"], room)
    if result:
        # Add room to sensor engine if enabled
        if room.occupancy_sensor_enabled:
            sensor_engine = hass.data[DOMAIN]["sensor_engine"]
            hass.async_create_task(
                sensor_engine.async_add_room(
                    VirtualSensorConfig(
                        room_id=room.id,
                        floor_plan_id=msg["floor_plan_id"],
                        motion_timeout=room.motion_timeout,
                        checking_timeout=room.checking_timeout,
                    )
                )
            )
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
    }
)
@callback
def ws_rooms_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a room."""
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

    result = store.update_room(msg["floor_plan_id"], room)
    if result:
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
    store = hass.data[DOMAIN]["store"]

    # Remove from sensor engine
    sensor_engine = hass.data[DOMAIN]["sensor_engine"]
    hass.async_create_task(sensor_engine.async_remove_room(msg["room_id"]))

    if store.delete_room(msg["floor_plan_id"], msg["room_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Room not found")


# ==================== Walls, Doors, Windows ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/walls/add",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("start"): dict,
        vol.Required("end"): dict,
        vol.Optional("thickness", default=10.0): vol.Coerce(float),
        vol.Optional("is_exterior", default=False): bool,
    }
)
@callback
def ws_walls_add(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a wall to a floor."""
    store = hass.data[DOMAIN]["store"]
    wall = Wall(
        start=Coordinates.from_dict(msg["start"]),
        end=Coordinates.from_dict(msg["end"]),
        thickness=msg["thickness"],
        is_exterior=msg["is_exterior"],
    )
    result = store.add_wall(msg["floor_plan_id"], msg["floor_id"], wall)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "not_found", "Floor not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/walls/update",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("wall_id"): str,
        vol.Optional("start"): dict,
        vol.Optional("end"): dict,
        vol.Optional("thickness"): vol.Coerce(float),
    }
)
@callback
def ws_walls_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a wall."""
    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if not floor_plan:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")
        return

    floor = floor_plan.get_floor(msg["floor_id"])
    if not floor:
        connection.send_error(msg["id"], "not_found", "Floor not found")
        return

    wall = next((w for w in floor.walls if w.id == msg["wall_id"]), None)
    if not wall:
        connection.send_error(msg["id"], "not_found", "Wall not found")
        return

    if "start" in msg:
        wall.start = Coordinates.from_dict(msg["start"])
    if "end" in msg:
        wall.end = Coordinates.from_dict(msg["end"])
    if "thickness" in msg:
        wall.thickness = msg["thickness"]

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(msg["id"], wall.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update wall")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/doors/add",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("wall_id"): str,
        vol.Optional("position", default=0.5): vol.Coerce(float),
        vol.Optional("width", default=80.0): vol.Coerce(float),
        vol.Optional("swing_direction", default="left"): str,
        vol.Optional("entity_id"): vol.Any(str, None),
    }
)
@callback
def ws_doors_add(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a door to a floor."""
    store = hass.data[DOMAIN]["store"]
    door = Door(
        wall_id=msg["wall_id"],
        position=msg["position"],
        width=msg["width"],
        swing_direction=msg["swing_direction"],
        entity_id=msg.get("entity_id"),
    )
    result = store.add_door(msg["floor_plan_id"], msg["floor_id"], door)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "not_found", "Floor not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/windows/add",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("wall_id"): str,
        vol.Optional("position", default=0.5): vol.Coerce(float),
        vol.Optional("width", default=100.0): vol.Coerce(float),
        vol.Optional("height", default=120.0): vol.Coerce(float),
    }
)
@callback
def ws_windows_add(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a window to a floor."""
    store = hass.data[DOMAIN]["store"]
    window = Window(
        wall_id=msg["wall_id"],
        position=msg["position"],
        width=msg["width"],
        height=msg["height"],
    )
    result = store.add_window(msg["floor_plan_id"], msg["floor_id"], window)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "not_found", "Floor not found")


# ==================== Device Placements ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/devices/place",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("entity_id"): str,
        vol.Required("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("rotation", default=0.0): vol.Coerce(float),
        vol.Optional("scale", default=1.0): vol.Coerce(float),
        vol.Optional("show_state", default=True): bool,
        vol.Optional("show_label", default=False): bool,
        vol.Optional("contributes_to_occupancy", default=False): bool,
    }
)
@callback
def ws_devices_place(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Place a device on a floor plan."""
    store = hass.data[DOMAIN]["store"]
    device = DevicePlacement(
        entity_id=msg["entity_id"],
        floor_id=msg["floor_id"],
        room_id=msg.get("room_id"),
        position=Coordinates.from_dict(msg["position"]),
        rotation=msg["rotation"],
        scale=msg["scale"],
        show_state=msg["show_state"],
        show_label=msg["show_label"],
        contributes_to_occupancy=msg["contributes_to_occupancy"],
    )
    result = store.place_device(msg["floor_plan_id"], device)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/devices/update",
        vol.Required("floor_plan_id"): str,
        vol.Required("device_id"): str,
        vol.Optional("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("rotation"): vol.Coerce(float),
        vol.Optional("scale"): vol.Coerce(float),
        vol.Optional("show_state"): bool,
        vol.Optional("show_label"): bool,
        vol.Optional("contributes_to_occupancy"): bool,
    }
)
@callback
def ws_devices_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a device placement."""
    store = hass.data[DOMAIN]["store"]
    collection = store.get_device_placements(msg["floor_plan_id"])
    device = collection.get_device(msg["device_id"])
    if not device:
        connection.send_error(msg["id"], "not_found", "Device not found")
        return

    if "position" in msg:
        device.position = Coordinates.from_dict(msg["position"])
    if "room_id" in msg:
        device.room_id = msg["room_id"]
    if "rotation" in msg:
        device.rotation = msg["rotation"]
    if "scale" in msg:
        device.scale = msg["scale"]
    if "show_state" in msg:
        device.show_state = msg["show_state"]
    if "show_label" in msg:
        device.show_label = msg["show_label"]
    if "contributes_to_occupancy" in msg:
        device.contributes_to_occupancy = msg["contributes_to_occupancy"]

    result = store.update_device_placement(msg["floor_plan_id"], device)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update device")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/devices/remove",
        vol.Required("floor_plan_id"): str,
        vol.Required("device_id"): str,
    }
)
@callback
def ws_devices_remove(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a device placement."""
    store = hass.data[DOMAIN]["store"]
    if store.remove_device_placement(msg["floor_plan_id"], msg["device_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Device not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/devices/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_devices_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all device placements for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    collection = store.get_device_placements(msg["floor_plan_id"])
    connection.send_result(msg["id"], [d.to_dict() for d in collection.devices])


# ==================== Sensor Configuration ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/sensor_config/get",
        vol.Required("room_id"): str,
    }
)
@callback
def ws_sensor_config_get(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get sensor configuration for a room."""
    store = hass.data[DOMAIN]["store"]
    config = store.get_sensor_config(msg["room_id"])
    if config:
        connection.send_result(msg["id"], config.to_dict())
    else:
        connection.send_error(msg["id"], "not_found", "Sensor config not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/sensor_config/update",
        vol.Required("room_id"): str,
        vol.Optional("enabled"): bool,
        vol.Optional("motion_timeout"): int,
        vol.Optional("checking_timeout"): int,
        vol.Optional("presence_timeout"): int,
        vol.Optional("motion_sensors"): list,
        vol.Optional("presence_sensors"): list,
        vol.Optional("door_sensors"): list,
        vol.Optional("door_blocks_vacancy"): bool,
        vol.Optional("door_open_resets_checking"): bool,
    }
)
@callback
def ws_sensor_config_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update sensor configuration for a room."""
    store = hass.data[DOMAIN]["store"]
    config = store.get_sensor_config(msg["room_id"])
    if not config:
        connection.send_error(msg["id"], "not_found", "Sensor config not found")
        return

    if "enabled" in msg:
        config.enabled = msg["enabled"]
    if "motion_timeout" in msg:
        config.motion_timeout = msg["motion_timeout"]
    if "checking_timeout" in msg:
        config.checking_timeout = msg["checking_timeout"]
    if "presence_timeout" in msg:
        config.presence_timeout = msg["presence_timeout"]
    if "motion_sensors" in msg:
        config.motion_sensors = [
            SensorBinding.from_dict(s) for s in msg["motion_sensors"]
        ]
    if "presence_sensors" in msg:
        config.presence_sensors = [
            SensorBinding.from_dict(s) for s in msg["presence_sensors"]
        ]
    if "door_sensors" in msg:
        config.door_sensors = [SensorBinding.from_dict(s) for s in msg["door_sensors"]]
    if "door_blocks_vacancy" in msg:
        config.door_blocks_vacancy = msg["door_blocks_vacancy"]
    if "door_open_resets_checking" in msg:
        config.door_open_resets_checking = msg["door_open_resets_checking"]

    result = store.update_sensor_config(config)
    if result:
        # Update sensor engine
        sensor_engine = hass.data[DOMAIN]["sensor_engine"]
        hass.async_create_task(sensor_engine.async_update_room(config))
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(
            msg["id"], "update_failed", "Failed to update sensor config"
        )


# ==================== Visual Rules ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/rules/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_rules_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all visual rules for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    rules = store.get_visual_rules(msg["floor_plan_id"])
    connection.send_result(msg["id"], [r.to_dict() for r in rules])


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/rules/create",
        vol.Required("floor_plan_id"): str,
        vol.Required("name"): str,
        vol.Required("trigger_type"): str,
        vol.Optional("description", default=""): str,
        vol.Optional("trigger_room_id"): vol.Any(str, None),
        vol.Optional("trigger_entity_id"): vol.Any(str, None),
        vol.Optional("trigger_state"): vol.Any(str, None),
        vol.Optional("trigger_for"): vol.Any(int, None),
        vol.Optional("conditions", default=[]): list,
        vol.Optional("actions", default=[]): list,
        vol.Optional("source_room_id"): vol.Any(str, None),
        vol.Optional("target_entity_ids", default=[]): list,
        vol.Optional("color", default="#3b82f6"): str,
    }
)
@callback
def ws_rules_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a visual rule."""
    store = hass.data[DOMAIN]["store"]
    rule = VisualRule.from_dict(
        {
            "floor_plan_id": msg["floor_plan_id"],
            "name": msg["name"],
            "description": msg.get("description", ""),
            "trigger_type": msg["trigger_type"],
            "trigger_room_id": msg.get("trigger_room_id"),
            "trigger_entity_id": msg.get("trigger_entity_id"),
            "trigger_state": msg.get("trigger_state"),
            "trigger_for": msg.get("trigger_for"),
            "conditions": msg.get("conditions", []),
            "actions": msg.get("actions", []),
            "source_room_id": msg.get("source_room_id"),
            "target_entity_ids": msg.get("target_entity_ids", []),
            "color": msg.get("color", "#3b82f6"),
        }
    )
    result = store.create_visual_rule(rule)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/rules/update",
        vol.Required("rule_id"): str,
        vol.Optional("name"): str,
        vol.Optional("description"): str,
        vol.Optional("enabled"): bool,
        vol.Optional("trigger_type"): str,
        vol.Optional("trigger_room_id"): vol.Any(str, None),
        vol.Optional("trigger_entity_id"): vol.Any(str, None),
        vol.Optional("trigger_state"): vol.Any(str, None),
        vol.Optional("trigger_for"): vol.Any(int, None),
        vol.Optional("conditions"): list,
        vol.Optional("actions"): list,
        vol.Optional("source_room_id"): vol.Any(str, None),
        vol.Optional("target_entity_ids"): list,
        vol.Optional("color"): str,
    }
)
@callback
def ws_rules_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a visual rule."""
    store = hass.data[DOMAIN]["store"]
    rule = store.get_visual_rule(msg["rule_id"])
    if not rule:
        connection.send_error(msg["id"], "not_found", "Rule not found")
        return

    for key in [
        "name",
        "description",
        "enabled",
        "trigger_type",
        "trigger_room_id",
        "trigger_entity_id",
        "trigger_state",
        "trigger_for",
        "conditions",
        "actions",
        "source_room_id",
        "target_entity_ids",
        "color",
    ]:
        if key in msg:
            setattr(rule, key, msg[key])

    result = store.update_visual_rule(rule)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update rule")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/rules/delete",
        vol.Required("rule_id"): str,
    }
)
@callback
def ws_rules_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a visual rule."""
    store = hass.data[DOMAIN]["store"]
    if store.delete_visual_rule(msg["rule_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Rule not found")


# ==================== Occupancy States ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/occupancy_states",
    }
)
@callback
def ws_occupancy_states(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get all room occupancy states."""
    sensor_engine = hass.data[DOMAIN]["sensor_engine"]
    states = sensor_engine.get_all_states()
    connection.send_result(
        msg["id"],
        {room_id: state.to_dict() for room_id, state in states.items()},
    )
