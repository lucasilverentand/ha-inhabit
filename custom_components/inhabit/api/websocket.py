"""WebSocket API for Inhabit Floor Plan Builder."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr

from ..const import DOMAIN, WS_PREFIX
from ..engine.mmwave_target_processor import MmwaveTargetProcessor
from ..engine.simulated_target_processor import SimulatedTargetProcessor
from ..models.automation_rule import VisualRule
from ..models.device_placement import (
    ButtonPlacement,
    LightPlacement,
    OtherPlacement,
    SwitchPlacement,
)
from ..models.floor_plan import (
    BackgroundLayer,
    Coordinates,
    Edge,
    Floor,
    FloorPlan,
    Node,
    Polygon,
    Room,
    _generate_id,
)
from ..models.mmwave_sensor import MmwavePlacement
from ..models.virtual_sensor import SensorBinding, VirtualSensorConfig
from ..models.zone import Zone

_LOGGER = logging.getLogger(__name__)


def _sync_region_device_area(
    hass: HomeAssistant, region_id: str, ha_area_id: str | None
) -> None:
    """Sync the HA area of a region's device in the device registry."""
    dev_reg = dr.async_get(hass)
    device = dev_reg.async_get_device(identifiers={(DOMAIN, region_id)})
    if device:
        dev_reg.async_update_device(device.id, area_id=ha_area_id or "")
        _LOGGER.debug(
            "Synced device area for region %s to %s", region_id, ha_area_id
        )


def _normalize_ha_area_id(value: str | None) -> str | None:
    """Normalize empty HA area values to None."""
    if not value:
        return None
    return value


def _validate_unique_ha_area(
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    *,
    store: Any,
    floor_plan_id: str,
    ha_area_id: str | None,
    exclude_room_id: str | None = None,
    exclude_zone_id: str | None = None,
) -> bool:
    """Ensure an HA area is not already assigned within the floor plan."""
    if not ha_area_id:
        return True

    assignment = store.find_ha_area_assignment(
        floor_plan_id,
        ha_area_id,
        exclude_room_id=exclude_room_id,
        exclude_zone_id=exclude_zone_id,
    )
    if not assignment:
        return True

    assignment_type, assignment_id, assignment_name = assignment
    connection.send_error(
        msg["id"],
        "duplicate_ha_area",
        (
            f"HA area '{ha_area_id}' is already assigned to "
            f"{assignment_type} '{assignment_name}' ({assignment_id})"
        ),
    )
    return False


def _require_admin(
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> bool:
    """Check if the user is an admin. Sends an error and returns False if not."""
    if not connection.user.is_admin:
        connection.send_error(msg["id"], "unauthorized", "Admin access required")
        return False
    return True


def _remove_device(hass: HomeAssistant, region_id: str) -> None:
    """Remove the HA device for a room or zone."""
    dev_reg = dr.async_get(hass)
    device = dev_reg.async_get_device(identifiers={(DOMAIN, region_id)})
    if device:
        _LOGGER.debug("Removing device for region %s", region_id)
        dev_reg.async_remove_device(device.id)


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
    websocket_api.async_register_command(hass, ws_floors_export)
    websocket_api.async_register_command(hass, ws_floors_import)
    websocket_api.async_register_command(hass, ws_rooms_add)
    websocket_api.async_register_command(hass, ws_rooms_update)
    websocket_api.async_register_command(hass, ws_rooms_delete)
    websocket_api.async_register_command(hass, ws_zones_add)
    websocket_api.async_register_command(hass, ws_zones_update)
    websocket_api.async_register_command(hass, ws_zones_delete)
    websocket_api.async_register_command(hass, ws_edges_add)
    websocket_api.async_register_command(hass, ws_edges_update)
    websocket_api.async_register_command(hass, ws_edges_delete)
    websocket_api.async_register_command(hass, ws_edges_link)
    websocket_api.async_register_command(hass, ws_edges_unlink)
    websocket_api.async_register_command(hass, ws_edges_collinear_link)
    websocket_api.async_register_command(hass, ws_edges_collinear_unlink)
    websocket_api.async_register_command(hass, ws_edges_angle_link)
    websocket_api.async_register_command(hass, ws_edges_angle_unlink)
    websocket_api.async_register_command(hass, ws_edges_split)
    websocket_api.async_register_command(hass, ws_nodes_update)
    websocket_api.async_register_command(hass, ws_nodes_merge)
    websocket_api.async_register_command(hass, ws_nodes_dissolve)
    websocket_api.async_register_command(hass, ws_edges_split_at_point)
    websocket_api.async_register_command(hass, ws_lights_place)
    websocket_api.async_register_command(hass, ws_lights_update)
    websocket_api.async_register_command(hass, ws_lights_remove)
    websocket_api.async_register_command(hass, ws_lights_list)
    websocket_api.async_register_command(hass, ws_switches_place)
    websocket_api.async_register_command(hass, ws_switches_update)
    websocket_api.async_register_command(hass, ws_switches_remove)
    websocket_api.async_register_command(hass, ws_switches_list)
    websocket_api.async_register_command(hass, ws_buttons_place)
    websocket_api.async_register_command(hass, ws_buttons_update)
    websocket_api.async_register_command(hass, ws_buttons_remove)
    websocket_api.async_register_command(hass, ws_buttons_list)
    websocket_api.async_register_command(hass, ws_others_place)
    websocket_api.async_register_command(hass, ws_others_update)
    websocket_api.async_register_command(hass, ws_others_remove)
    websocket_api.async_register_command(hass, ws_others_list)
    websocket_api.async_register_command(hass, ws_sensor_config_get)
    websocket_api.async_register_command(hass, ws_sensor_config_update)
    websocket_api.async_register_command(hass, ws_rules_list)
    websocket_api.async_register_command(hass, ws_rules_create)
    websocket_api.async_register_command(hass, ws_rules_update)
    websocket_api.async_register_command(hass, ws_rules_delete)
    websocket_api.async_register_command(hass, ws_occupancy_states)
    websocket_api.async_register_command(hass, ws_occupancy_history)
    websocket_api.async_register_command(hass, ws_mmwave_place)
    websocket_api.async_register_command(hass, ws_mmwave_update)
    websocket_api.async_register_command(hass, ws_mmwave_delete)
    websocket_api.async_register_command(hass, ws_mmwave_list)
    websocket_api.async_register_command(hass, ws_simulate_target_add)
    websocket_api.async_register_command(hass, ws_simulate_target_move)
    websocket_api.async_register_command(hass, ws_simulate_target_remove)
    websocket_api.async_register_command(hass, ws_simulate_target_clear)
    websocket_api.async_register_command(hass, ws_simulate_target_list)
    websocket_api.async_register_command(hass, ws_phantom_states)
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
        hass.async_create_task(sensor_engine.async_remove_room(region_id))
        _remove_device(hass, region_id)

    store.delete_floor_plan(msg["floor_plan_id"])
    connection.send_result(msg["id"], {"success": True})


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
        hass.async_create_task(sensor_engine.async_remove_room(room.id))
        _remove_device(hass, room.id)
    for zone in floor.zones:
        hass.async_create_task(sensor_engine.async_remove_room(zone.id))
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
                sensor_engine.async_add_room(
                    VirtualSensorConfig(
                        room_id=room.id,
                        floor_plan_id=msg["floor_plan_id"],
                        motion_timeout=room.motion_timeout,
                        checking_timeout=room.checking_timeout,
                        long_stay=room.long_stay,
                    )
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
        # Sync HA area to device registry
        if "ha_area_id" in msg:
            _sync_region_device_area(hass, room.id, room.ha_area_id)
        # Sync room config fields to sensor config when occupancy is active
        room_config_fields = {
            "motion_timeout",
            "checking_timeout",
            "long_stay",
        }
        if room.occupancy_sensor_enabled and room_config_fields & msg.keys():
            config = store.get_sensor_config(room.id)
            if config:
                config.motion_timeout = room.motion_timeout
                config.checking_timeout = room.checking_timeout
                config.long_stay = room.long_stay
                sensor_engine = hass.data[DOMAIN]["sensor_engine"]
                hass.async_create_task(sensor_engine.async_update_room(config))
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
                    )
                    store.create_sensor_config(config)
                hass.async_create_task(sensor_engine.async_add_room(config))
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
    hass.async_create_task(sensor_engine.async_remove_room(msg["room_id"]))
    _remove_device(hass, msg["room_id"])

    if store.delete_room(msg["floor_plan_id"], msg["room_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Room not found")


# ==================== Zones ====================


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
                sensor_engine.async_add_room(
                    VirtualSensorConfig(
                        room_id=zone.id,
                        floor_plan_id=msg["floor_plan_id"],
                        motion_timeout=zone.motion_timeout,
                        checking_timeout=zone.checking_timeout,
                        long_stay=zone.long_stay,
                        occupies_parent=zone.occupies_parent,
                    )
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

    result = store.update_zone(msg["floor_plan_id"], zone)
    if result:
        # Sync HA area to device registry
        if "ha_area_id" in msg:
            _sync_region_device_area(hass, zone.id, zone.ha_area_id)
        # Sync zone config fields to sensor config when occupancy is active
        zone_config_fields = {
            "motion_timeout",
            "checking_timeout",
            "long_stay",
            "occupies_parent",
        }
        if zone.occupancy_sensor_enabled and zone_config_fields & msg.keys():
            config = store.get_sensor_config(zone.id)
            if config:
                config.motion_timeout = zone.motion_timeout
                config.checking_timeout = zone.checking_timeout
                config.long_stay = zone.long_stay
                config.occupies_parent = zone.occupies_parent
                sensor_engine = hass.data[DOMAIN]["sensor_engine"]
                hass.async_create_task(sensor_engine.async_update_room(config))

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
                    )
                    store.create_sensor_config(config)
                hass.async_create_task(sensor_engine.async_add_room(config))
            else:
                hass.async_create_task(sensor_engine.async_remove_room(zone.id))
                store.delete_sensor_config(zone.id)
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
    hass.async_create_task(sensor_engine.async_remove_room(msg["zone_id"]))
    _remove_device(hass, msg["zone_id"])

    if store.delete_zone(msg["floor_plan_id"], msg["zone_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Zone not found")


# ==================== Edges & Nodes ====================

SNAP_THRESHOLD = 1.0  # 1cm snap distance for node dedup


def _find_nearby_node(floor: Floor, x: float, y: float) -> Node | None:
    """Find an existing node within snap threshold."""
    import math

    for node in floor.nodes:
        dist = math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2)
        if dist <= SNAP_THRESHOLD:
            return node
    return None


def _get_or_create_node(floor: Floor, x: float, y: float) -> Node:
    """Get existing nearby node or create a new one."""
    existing = _find_nearby_node(floor, x, y)
    if existing:
        return existing
    node = Node(x=x, y=y)
    floor.nodes.append(node)
    return node


def _split_edges_at_node(floor: Floor, node: Node) -> None:
    """If a node lies on an existing edge (not at its endpoints), split that edge."""
    import math

    to_split: list[tuple[int, Edge]] = []
    for i, edge in enumerate(floor.edges):
        if edge.start_node == node.id or edge.end_node == node.id:
            continue
        sn = next((n for n in floor.nodes if n.id == edge.start_node), None)
        en = next((n for n in floor.nodes if n.id == edge.end_node), None)
        if not sn or not en:
            continue
        # Check if node is collinear and between start/end
        dx = en.x - sn.x
        dy = en.y - sn.y
        length_sq = dx * dx + dy * dy
        if length_sq == 0:
            continue
        t = ((node.x - sn.x) * dx + (node.y - sn.y) * dy) / length_sq
        if t <= 0.01 or t >= 0.99:
            continue
        # Project and check distance
        proj_x = sn.x + t * dx
        proj_y = sn.y + t * dy
        dist = math.sqrt((node.x - proj_x) ** 2 + (node.y - proj_y) ** 2)
        if dist <= SNAP_THRESHOLD:
            to_split.append((i, edge))

    # Split in reverse index order to preserve indices
    for i, edge in reversed(to_split):
        edge1 = Edge(
            start_node=edge.start_node,
            end_node=node.id,
            type=edge.type,
            thickness=edge.thickness,
            is_exterior=edge.is_exterior,
            length_locked=edge.length_locked,
            direction=edge.direction,
            angle_group=edge.angle_group,
        )
        edge2 = Edge(
            start_node=node.id,
            end_node=edge.end_node,
            type=edge.type,
            thickness=edge.thickness,
            is_exterior=edge.is_exterior,
            length_locked=edge.length_locked,
            direction=edge.direction,
            angle_group=edge.angle_group,
        )
        floor.edges[i : i + 1] = [edge1, edge2]


def _cleanup_orphan_nodes(floor: Floor) -> list[str]:
    """Remove nodes that are not referenced by any edge. Returns removed IDs."""
    referenced = set()
    for edge in floor.edges:
        referenced.add(edge.start_node)
        referenced.add(edge.end_node)
    new_nodes = []
    removed = []
    for n in floor.nodes:
        if n.id in referenced:
            new_nodes.append(n)
        else:
            removed.append(n.id)
    floor.nodes = new_nodes
    return removed


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/add",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("start"): dict,
        vol.Required("end"): dict,
        vol.Optional("edge_type", default="wall"): str,
        vol.Optional("thickness", default=10.0): vol.Coerce(float),
        vol.Optional("is_exterior", default=False): bool,
        vol.Optional("length_locked", default=False): bool,
        vol.Optional("direction", default="free"): str,
        vol.Optional("angle_group", default=None): vol.Any(str, None),
    }
)
@callback
def ws_edges_add(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add an edge to a floor, auto-snapping to nearby nodes."""
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

    start_coords = msg["start"]
    end_coords = msg["end"]
    start_node = _get_or_create_node(
        floor, float(start_coords["x"]), float(start_coords["y"])
    )
    end_node = _get_or_create_node(
        floor, float(end_coords["x"]), float(end_coords["y"])
    )

    # Split any existing edges that the new nodes land on
    _split_edges_at_node(floor, start_node)
    _split_edges_at_node(floor, end_node)

    edge = Edge(
        start_node=start_node.id,
        end_node=end_node.id,
        type=msg["edge_type"],
        thickness=msg["thickness"],
        is_exterior=msg["is_exterior"],
        length_locked=msg["length_locked"],
        direction=msg["direction"],
        angle_group=msg["angle_group"],
    )
    floor.edges.append(edge)

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(
            msg["id"],
            {
                "edge": edge.to_dict(),
                "nodes": [start_node.to_dict(), end_node.to_dict()],
            },
        )
    else:
        connection.send_error(msg["id"], "add_failed", "Failed to add edge")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/update",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("edge_id"): str,
        vol.Optional("edge_type"): str,
        vol.Optional("thickness"): vol.Coerce(float),
        vol.Optional("is_exterior"): bool,
        vol.Optional("length_locked"): bool,
        vol.Optional("direction"): str,
        vol.Optional("angle_group"): vol.Any(str, None),
        vol.Optional("link_group"): vol.Any(str, None),
        vol.Optional("collinear_group"): vol.Any(str, None),
        vol.Optional("opening_parts"): vol.Any(str, None),
        vol.Optional("opening_type"): vol.Any(str, None),
        vol.Optional("swing_direction"): vol.Any(str, None),
        vol.Optional("entity_id"): vol.Any(str, None),
        vol.Optional("height"): vol.Any(vol.Coerce(float), None),
        vol.Optional("swap_nodes"): bool,
    }
)
@callback
def ws_edges_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update an edge's properties."""
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

    edge = floor.get_edge(msg["edge_id"])
    if not edge:
        connection.send_error(msg["id"], "not_found", "Edge not found")
        return

    if msg.get("swap_nodes"):
        edge.start_node, edge.end_node = edge.end_node, edge.start_node
    if "edge_type" in msg:
        edge.type = msg["edge_type"]
    if "thickness" in msg:
        edge.thickness = msg["thickness"]
    if "is_exterior" in msg:
        edge.is_exterior = msg["is_exterior"]
    if "length_locked" in msg:
        edge.length_locked = msg["length_locked"]
    if "direction" in msg:
        edge.direction = msg["direction"]
    if "angle_group" in msg:
        edge.angle_group = msg["angle_group"]
    if "opening_parts" in msg:
        edge.opening_parts = msg["opening_parts"]
    if "opening_type" in msg:
        edge.opening_type = msg["opening_type"]
    if "swing_direction" in msg:
        edge.swing_direction = msg["swing_direction"]
    if "entity_id" in msg:
        new_entity_id = msg["entity_id"]
        if new_entity_id is not None:
            for other in floor.edges:
                if other.id != edge.id and other.entity_id == new_entity_id:
                    connection.send_error(
                        msg["id"],
                        "duplicate_sensor",
                        f"Sensor {new_entity_id} is already assigned to another edge",
                    )
                    return
        edge.entity_id = new_entity_id
    if "height" in msg:
        edge.height = msg["height"]
    if "link_group" in msg:
        edge.link_group = msg["link_group"]
    if "collinear_group" in msg:
        edge.collinear_group = msg["collinear_group"]

    # Propagate mirrored props to sibling edges in same link group
    _LINKED_PROPS = {"thickness", "is_exterior", "direction", "length_locked"}
    if edge.link_group is not None:
        changed = {k for k in _LINKED_PROPS if k in msg}
        if changed:
            for sibling in floor.edges:
                if sibling.id != edge.id and sibling.link_group == edge.link_group:
                    for prop in changed:
                        setattr(sibling, prop, getattr(edge, prop))

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(msg["id"], edge.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update edge")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/delete",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("edge_id"): str,
    }
)
@callback
def ws_edges_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete an edge and clean up orphan nodes."""
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

    edge_idx = next(
        (i for i, e in enumerate(floor.edges) if e.id == msg["edge_id"]), None
    )
    if edge_idx is None:
        connection.send_error(msg["id"], "not_found", "Edge not found")
        return

    deleted_edge = floor.edges.pop(edge_idx)

    # If deleted edge was in a link group and only 1 remains, clear that singleton
    if deleted_edge.link_group:
        siblings = [e for e in floor.edges if e.link_group == deleted_edge.link_group]
        if len(siblings) == 1:
            siblings[0].link_group = None

    # Same for collinear group
    if deleted_edge.collinear_group:
        siblings = [
            e for e in floor.edges if e.collinear_group == deleted_edge.collinear_group
        ]
        if len(siblings) == 1:
            siblings[0].collinear_group = None

    # Same for angle group
    if deleted_edge.angle_group:
        siblings = [e for e in floor.edges if e.angle_group == deleted_edge.angle_group]
        if len(siblings) == 1:
            siblings[0].angle_group = None

    removed_nodes = _cleanup_orphan_nodes(floor)

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(
            msg["id"],
            {
                "success": True,
                "removed_node_ids": removed_nodes,
            },
        )
    else:
        connection.send_error(msg["id"], "delete_failed", "Failed to delete edge")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/link",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("edge_ids"): [str],
    }
)
@callback
def ws_edges_link(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Link edges so property changes propagate between them."""
    if not _require_admin(connection, msg):
        return
    from uuid import uuid4

    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if not floor_plan:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")
        return

    floor = floor_plan.get_floor(msg["floor_id"])
    if not floor:
        connection.send_error(msg["id"], "not_found", "Floor not found")
        return

    edge_ids = msg["edge_ids"]
    if len(edge_ids) < 2:
        connection.send_error(msg["id"], "invalid", "At least 2 edges required")
        return

    edges = [floor.get_edge(eid) for eid in edge_ids]
    if any(e is None for e in edges):
        connection.send_error(msg["id"], "not_found", "One or more edges not found")
        return

    link_group = uuid4().hex[:8]
    source = edges[0]
    for edge in edges:
        edge.link_group = link_group
        edge.thickness = source.thickness
        edge.is_exterior = source.is_exterior
        edge.direction = source.direction
        edge.length_locked = source.length_locked

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(
            msg["id"],
            {
                "link_group": link_group,
                "edge_ids": edge_ids,
            },
        )
    else:
        connection.send_error(msg["id"], "link_failed", "Failed to link edges")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/unlink",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("edge_ids"): [str],
    }
)
@callback
def ws_edges_unlink(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Unlink edges from their link groups."""
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

    # Collect affected groups before clearing
    affected_groups: set[str] = set()
    for eid in msg["edge_ids"]:
        edge = floor.get_edge(eid)
        if edge and edge.link_group:
            affected_groups.add(edge.link_group)
            edge.link_group = None

    # For each affected group, if only 1 edge remains, clear its link_group too
    for group in affected_groups:
        siblings = [e for e in floor.edges if e.link_group == group]
        if len(siblings) == 1:
            siblings[0].link_group = None

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "unlink_failed", "Failed to unlink edges")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/collinear_link",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("edge_ids"): [str],
    }
)
@callback
def ws_edges_collinear_link(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Link edges into a collinear group so they stay on the same line."""
    if not _require_admin(connection, msg):
        return
    from uuid import uuid4

    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if not floor_plan:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")
        return

    floor = floor_plan.get_floor(msg["floor_id"])
    if not floor:
        connection.send_error(msg["id"], "not_found", "Floor not found")
        return

    edge_ids = msg["edge_ids"]
    if len(edge_ids) < 2:
        connection.send_error(msg["id"], "invalid", "At least 2 edges required")
        return

    edges = [floor.get_edge(eid) for eid in edge_ids]
    if any(e is None for e in edges):
        connection.send_error(msg["id"], "not_found", "One or more edges not found")
        return

    collinear_group = uuid4().hex[:8]
    for edge in edges:
        edge.collinear_group = collinear_group

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(
            msg["id"],
            {
                "collinear_group": collinear_group,
                "edge_ids": edge_ids,
            },
        )
    else:
        connection.send_error(
            msg["id"], "link_failed", "Failed to collinear link edges"
        )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/collinear_unlink",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("edge_ids"): [str],
    }
)
@callback
def ws_edges_collinear_unlink(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove edges from their collinear groups."""
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

    # Collect affected groups before clearing
    affected_groups: set[str] = set()
    for eid in msg["edge_ids"]:
        edge = floor.get_edge(eid)
        if edge and edge.collinear_group:
            affected_groups.add(edge.collinear_group)
            edge.collinear_group = None

    # For each affected group, if only 1 edge remains, clear its collinear_group too
    for group in affected_groups:
        siblings = [e for e in floor.edges if e.collinear_group == group]
        if len(siblings) == 1:
            siblings[0].collinear_group = None

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(
            msg["id"], "unlink_failed", "Failed to collinear unlink edges"
        )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/angle_link",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("edge_ids"): [str],
    }
)
@callback
def ws_edges_angle_link(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Link exactly 2 edges into an angle group (must share a common node)."""
    if not _require_admin(connection, msg):
        return
    from uuid import uuid4

    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if not floor_plan:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")
        return

    floor = floor_plan.get_floor(msg["floor_id"])
    if not floor:
        connection.send_error(msg["id"], "not_found", "Floor not found")
        return

    edge_ids = msg["edge_ids"]
    if len(edge_ids) != 2:
        connection.send_error(msg["id"], "invalid", "Exactly 2 edges required")
        return

    edges = [floor.get_edge(eid) for eid in edge_ids]
    if any(e is None for e in edges):
        connection.send_error(msg["id"], "not_found", "One or more edges not found")
        return

    # Validate the two edges share a common node
    nodes_a = {edges[0].start_node, edges[0].end_node}
    nodes_b = {edges[1].start_node, edges[1].end_node}
    shared = nodes_a & nodes_b
    if not shared:
        connection.send_error(msg["id"], "invalid", "Edges must share a common node")
        return

    angle_group = uuid4().hex[:8]
    for edge in edges:
        edge.angle_group = angle_group

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(
            msg["id"],
            {
                "angle_group": angle_group,
                "edge_ids": edge_ids,
            },
        )
    else:
        connection.send_error(msg["id"], "link_failed", "Failed to angle link edges")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/angle_unlink",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("edge_ids"): [str],
    }
)
@callback
def ws_edges_angle_unlink(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove edges from their angle groups."""
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

    # Collect affected groups before clearing
    affected_groups: set[str] = set()
    for eid in msg["edge_ids"]:
        edge = floor.get_edge(eid)
        if edge and edge.angle_group:
            affected_groups.add(edge.angle_group)
            edge.angle_group = None

    # For each affected group, if only 1 edge remains, clear its angle_group too
    for group in affected_groups:
        siblings = [e for e in floor.edges if e.angle_group == group]
        if len(siblings) == 1:
            siblings[0].angle_group = None

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(
            msg["id"], "unlink_failed", "Failed to angle unlink edges"
        )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/split",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("edge_id"): str,
        vol.Required("position"): vol.Coerce(float),
        vol.Required("new_type"): str,
        vol.Optional("width", default=80.0): vol.Coerce(float),
        vol.Optional("opening_parts"): vol.Any(str, None),
        vol.Optional("opening_type"): vol.Any(str, None),
        vol.Optional("swing_direction"): vol.Any(str, None),
        vol.Optional("entity_id"): vol.Any(str, None),
        vol.Optional("height"): vol.Any(vol.Coerce(float), None),
    }
)
@callback
def ws_edges_split(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Split an edge to insert a door or window."""
    if not _require_admin(connection, msg):
        return
    import math

    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if not floor_plan:
        connection.send_error(msg["id"], "not_found", "Floor plan not found")
        return

    floor = floor_plan.get_floor(msg["floor_id"])
    if not floor:
        connection.send_error(msg["id"], "not_found", "Floor not found")
        return

    edge = floor.get_edge(msg["edge_id"])
    if not edge:
        connection.send_error(msg["id"], "not_found", "Edge not found")
        return

    start_node = floor.get_node(edge.start_node)
    end_node = floor.get_node(edge.end_node)
    if not start_node or not end_node:
        connection.send_error(msg["id"], "invalid_state", "Edge nodes not found")
        return

    dx = end_node.x - start_node.x
    dy = end_node.y - start_node.y
    edge_length = math.sqrt(dx * dx + dy * dy)
    if edge_length == 0:
        connection.send_error(msg["id"], "invalid_state", "Edge has zero length")
        return

    position = msg["position"]
    width = msg["width"]
    half_w = width / edge_length / 2.0
    t_start = max(0.0, position - half_w)
    t_end = min(1.0, position + half_w)

    # Create the two boundary nodes
    n1 = Node(x=start_node.x + t_start * dx, y=start_node.y + t_start * dy)
    n2 = Node(x=start_node.x + t_end * dx, y=start_node.y + t_end * dy)
    floor.nodes.extend([n1, n2])

    # All replacement edges share a collinear group so the solver keeps them
    # on the same line.  Re-use the original group if one existed, otherwise
    # create a new one (only needed when there will be > 1 replacement edge).
    from uuid import uuid4

    has_before = t_start > 1e-9
    has_after = t_end < 1.0 - 1e-9
    num_edges = 1 + int(has_before) + int(has_after)
    collinear = edge.collinear_group
    if collinear is None and num_edges > 1:
        collinear = uuid4().hex[:8]

    # Build the 3 replacement edges
    new_edges = []
    if has_before:
        new_edges.append(
            Edge(
                start_node=edge.start_node,
                end_node=n1.id,
                type="wall",
                thickness=edge.thickness,
                is_exterior=edge.is_exterior,
                direction=edge.direction,
                link_group=edge.link_group,
                collinear_group=collinear,
            )
        )
    opening_edge = Edge(
        start_node=n1.id,
        end_node=n2.id,
        type=msg["new_type"],
        thickness=edge.thickness,
        is_exterior=edge.is_exterior,
        direction=edge.direction,
        collinear_group=collinear,
        opening_parts=msg.get("opening_parts", "single"),
        opening_type=msg.get("opening_type", "swing"),
        swing_direction=msg.get("swing_direction"),
        entity_id=msg.get("entity_id"),
        height=msg.get("height"),
    )
    new_edges.append(opening_edge)
    if has_after:
        new_edges.append(
            Edge(
                start_node=n2.id,
                end_node=edge.end_node,
                type="wall",
                thickness=edge.thickness,
                is_exterior=edge.is_exterior,
                direction=edge.direction,
                link_group=edge.link_group,
                collinear_group=collinear,
            )
        )

    # Replace old edge with new edges
    floor.edges = [e for e in floor.edges if e.id != edge.id] + new_edges
    _cleanup_orphan_nodes(floor)

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(
            msg["id"],
            {
                "edges": [e.to_dict() for e in new_edges],
                "nodes": [n1.to_dict(), n2.to_dict()],
            },
        )
    else:
        connection.send_error(msg["id"], "split_failed", "Failed to split edge")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/nodes/update",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("updates"): list,
    }
)
@callback
def ws_nodes_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update node positions atomically."""
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

    updated_nodes = []
    for update in msg["updates"]:
        node = floor.get_node(update["node_id"])
        if not node:
            connection.send_error(
                msg["id"], "not_found", f"Node {update['node_id']} not found"
            )
            return
        node.x = float(update["x"])
        node.y = float(update["y"])
        if "pinned" in update:
            node.pinned = update["pinned"]
        updated_nodes.append(node)

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(msg["id"], [n.to_dict() for n in updated_nodes])
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update nodes")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/nodes/merge",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("node_id_keep"): str,
        vol.Required("node_id_remove"): str,
    }
)
@callback
def ws_nodes_merge(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Merge two nodes, rewriting edges and removing degenerate ones."""
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

    keep_id = msg["node_id_keep"]
    remove_id = msg["node_id_remove"]

    if not floor.get_node(keep_id):
        connection.send_error(msg["id"], "not_found", "Keep node not found")
        return
    if not floor.get_node(remove_id):
        connection.send_error(msg["id"], "not_found", "Remove node not found")
        return

    # Rewrite all edges referencing the removed node
    for edge in floor.edges:
        if edge.start_node == remove_id:
            edge.start_node = keep_id
        if edge.end_node == remove_id:
            edge.end_node = keep_id

    # Remove degenerate edges (start == end)
    floor.edges = [e for e in floor.edges if e.start_node != e.end_node]

    # Remove the merged-away node
    floor.nodes = [n for n in floor.nodes if n.id != remove_id]

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(
            msg["id"], {"success": True, "removed_node_id": remove_id}
        )
    else:
        connection.send_error(msg["id"], "merge_failed", "Failed to merge nodes")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/nodes/dissolve",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("node_id"): str,
    }
)
@callback
def ws_nodes_dissolve(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Dissolve a node: remove it and merge the two connected edges into one."""
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

    node_id = msg["node_id"]
    node = floor.get_node(node_id)
    if not node:
        connection.send_error(msg["id"], "not_found", "Node not found")
        return

    # Find all edges connected to this node
    connected = [
        e for e in floor.edges if e.start_node == node_id or e.end_node == node_id
    ]

    if len(connected) != 2:
        connection.send_error(
            msg["id"],
            "invalid_state",
            f"Node must have exactly 2 connected edges to dissolve, found {len(connected)}",
        )
        return

    e1, e2 = connected
    # Find the "other" node for each edge
    other1 = e1.end_node if e1.start_node == node_id else e1.start_node
    other2 = e2.end_node if e2.start_node == node_id else e2.start_node

    if other1 == other2:
        connection.send_error(
            msg["id"],
            "invalid_state",
            "Cannot dissolve: both edges connect to the same node",
        )
        return

    # Create merged edge inheriting properties from the first wall-type edge
    base = e1 if e1.type == "wall" else e2
    merged = Edge(
        start_node=other1,
        end_node=other2,
        type="wall",
        thickness=base.thickness,
        is_exterior=base.is_exterior,
        length_locked=False,
        direction="free",
    )

    # Remove old edges, add merged
    old_ids = {e1.id, e2.id}
    floor.edges = [e for e in floor.edges if e.id not in old_ids]
    floor.edges.append(merged)

    # Remove the dissolved node
    floor.nodes = [n for n in floor.nodes if n.id != node_id]

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(
            msg["id"],
            {
                "success": True,
                "merged_edge": merged.to_dict(),
                "removed_edge_ids": list(old_ids),
                "removed_node_id": node_id,
            },
        )
    else:
        connection.send_error(msg["id"], "dissolve_failed", "Failed to dissolve node")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/split_at_point",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("edge_id"): str,
        vol.Required("point"): dict,
    }
)
@callback
def ws_edges_split_at_point(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Split an edge at a specific point, creating a new node and two edges."""
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

    edge = floor.get_edge(msg["edge_id"])
    if not edge:
        connection.send_error(msg["id"], "not_found", "Edge not found")
        return

    start_node = floor.get_node(edge.start_node)
    end_node = floor.get_node(edge.end_node)
    if not start_node or not end_node:
        connection.send_error(msg["id"], "invalid_state", "Edge nodes not found")
        return

    # Project the click point onto the edge to get exact split position
    px = float(msg["point"]["x"])
    py = float(msg["point"]["y"])
    dx = end_node.x - start_node.x
    dy = end_node.y - start_node.y
    length_sq = dx * dx + dy * dy
    if length_sq == 0:
        connection.send_error(msg["id"], "invalid_state", "Edge has zero length")
        return

    t = ((px - start_node.x) * dx + (py - start_node.y) * dy) / length_sq
    t = max(0.05, min(0.95, t))  # Clamp to avoid degenerate edges

    split_x = start_node.x + t * dx
    split_y = start_node.y + t * dy

    # Create new node at split point
    new_node = Node(x=split_x, y=split_y)
    floor.nodes.append(new_node)

    # Create two replacement edges
    edge1 = Edge(
        start_node=edge.start_node,
        end_node=new_node.id,
        type=edge.type,
        thickness=edge.thickness,
        is_exterior=edge.is_exterior,
        length_locked=False,
        direction=edge.direction,
        link_group=edge.link_group,
    )
    edge2 = Edge(
        start_node=new_node.id,
        end_node=edge.end_node,
        type=edge.type,
        thickness=edge.thickness,
        is_exterior=edge.is_exterior,
        length_locked=False,
        direction=edge.direction,
        link_group=edge.link_group,
    )

    # Replace old edge
    floor.edges = [e for e in floor.edges if e.id != edge.id]
    floor.edges.extend([edge1, edge2])
    _cleanup_orphan_nodes(floor)

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(
            msg["id"],
            {
                "new_node": new_node.to_dict(),
                "edges": [edge1.to_dict(), edge2.to_dict()],
                "removed_edge_id": edge.id,
            },
        )
    else:
        connection.send_error(msg["id"], "split_failed", "Failed to split edge")


# ==================== Light Placements ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/lights/place",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("entity_id"): str,
        vol.Required("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_lights_place(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Place a light on a floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    light = LightPlacement(
        entity_id=msg["entity_id"],
        floor_id=msg["floor_id"],
        room_id=msg.get("room_id"),
        position=Coordinates.from_dict(msg["position"]),
        label=msg.get("label"),
    )
    result = store.place_light(msg["floor_plan_id"], light)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/lights/update",
        vol.Required("light_id"): str,
        vol.Optional("entity_id"): str,
        vol.Optional("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_lights_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a light placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    light = store.get_light_placement(msg["light_id"])
    if not light:
        connection.send_error(msg["id"], "not_found", "Light not found")
        return

    if "entity_id" in msg:
        light.entity_id = msg["entity_id"]
    if "position" in msg:
        light.position = Coordinates.from_dict(msg["position"])
    if "room_id" in msg:
        light.room_id = msg["room_id"]
    if "label" in msg:
        light.label = msg["label"]

    result = store.update_light_placement(light)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update light")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/lights/remove",
        vol.Required("light_id"): str,
    }
)
@callback
def ws_lights_remove(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a light placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if store.remove_light_placement(msg["light_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Light not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/lights/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_lights_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all light placements for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    placements = store.get_light_placements(msg["floor_plan_id"])
    connection.send_result(msg["id"], [p.to_dict() for p in placements])


# ==================== Switch Placements ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/switches/place",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("entity_id"): str,
        vol.Required("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_switches_place(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Place a switch on a floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    switch = SwitchPlacement(
        entity_id=msg["entity_id"],
        floor_id=msg["floor_id"],
        room_id=msg.get("room_id"),
        position=Coordinates.from_dict(msg["position"]),
        label=msg.get("label"),
    )
    result = store.place_switch(msg["floor_plan_id"], switch)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/switches/update",
        vol.Required("switch_id"): str,
        vol.Optional("entity_id"): str,
        vol.Optional("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_switches_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a switch placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    switch = store.get_switch_placement(msg["switch_id"])
    if not switch:
        connection.send_error(msg["id"], "not_found", "Switch not found")
        return

    if "entity_id" in msg:
        switch.entity_id = msg["entity_id"]
    if "position" in msg:
        switch.position = Coordinates.from_dict(msg["position"])
    if "room_id" in msg:
        switch.room_id = msg["room_id"]
    if "label" in msg:
        switch.label = msg["label"]

    result = store.update_switch_placement(switch)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update switch")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/switches/remove",
        vol.Required("switch_id"): str,
    }
)
@callback
def ws_switches_remove(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a switch placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if store.remove_switch_placement(msg["switch_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Switch not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/switches/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_switches_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all switch placements for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    placements = store.get_switch_placements(msg["floor_plan_id"])
    connection.send_result(msg["id"], [p.to_dict() for p in placements])


# ==================== Button Placements ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/buttons/place",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("entity_id"): str,
        vol.Required("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_buttons_place(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Place a button on a floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    button = ButtonPlacement(
        entity_id=msg["entity_id"],
        floor_id=msg["floor_id"],
        room_id=msg.get("room_id"),
        position=Coordinates.from_dict(msg["position"]),
        label=msg.get("label"),
    )
    result = store.place_button(msg["floor_plan_id"], button)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/buttons/update",
        vol.Required("button_id"): str,
        vol.Optional("entity_id"): str,
        vol.Optional("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_buttons_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a button placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    button = store.get_button_placement(msg["button_id"])
    if not button:
        connection.send_error(msg["id"], "not_found", "Button not found")
        return

    if "entity_id" in msg:
        button.entity_id = msg["entity_id"]
    if "position" in msg:
        button.position = Coordinates.from_dict(msg["position"])
    if "room_id" in msg:
        button.room_id = msg["room_id"]
    if "label" in msg:
        button.label = msg["label"]

    result = store.update_button_placement(button)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update button")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/buttons/remove",
        vol.Required("button_id"): str,
    }
)
@callback
def ws_buttons_remove(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a button placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if store.remove_button_placement(msg["button_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Button not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/buttons/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_buttons_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all button placements for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    placements = store.get_button_placements(msg["floor_plan_id"])
    connection.send_result(msg["id"], [p.to_dict() for p in placements])


# ==================== Other Placements ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/others/place",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("entity_id"): str,
        vol.Required("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_others_place(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Place an other device on a floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    other = OtherPlacement(
        entity_id=msg["entity_id"],
        floor_id=msg["floor_id"],
        room_id=msg.get("room_id"),
        position=Coordinates.from_dict(msg["position"]),
        label=msg.get("label"),
    )
    result = store.place_other(msg["floor_plan_id"], other)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/others/update",
        vol.Required("other_id"): str,
        vol.Optional("entity_id"): str,
        vol.Optional("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_others_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update an other placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    other = store.get_other_placement(msg["other_id"])
    if not other:
        connection.send_error(msg["id"], "not_found", "Other placement not found")
        return

    if "entity_id" in msg:
        other.entity_id = msg["entity_id"]
    if "position" in msg:
        other.position = Coordinates.from_dict(msg["position"])
    if "room_id" in msg:
        other.room_id = msg["room_id"]
    if "label" in msg:
        other.label = msg["label"]

    result = store.update_other_placement(other)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(
            msg["id"], "update_failed", "Failed to update other placement"
        )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/others/remove",
        vol.Required("other_id"): str,
    }
)
@callback
def ws_others_remove(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove an other placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if store.remove_other_placement(msg["other_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Other placement not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/others/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_others_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all other placements for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    placements = store.get_other_placements(msg["floor_plan_id"])
    connection.send_result(msg["id"], [p.to_dict() for p in placements])


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
    """Get sensor configuration for a room (auto-creates if not found)."""
    store = hass.data[DOMAIN]["store"]
    config = store.get_sensor_config(msg["room_id"])
    if not config:
        # Auto-create a default (disabled) config for this room/zone
        floor_plan_id = store.find_floor_plan_id_for_room(msg["room_id"])
        if not floor_plan_id:
            connection.send_error(
                msg["id"], "not_found", "Room or zone not found in any floor plan"
            )
            return
        config = VirtualSensorConfig(
            room_id=msg["room_id"],
            floor_plan_id=floor_plan_id,
            enabled=False,
        )
        store.create_sensor_config(config)
    connection.send_result(msg["id"], config.to_dict())


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
        vol.Optional("exit_sensors"): list,
        vol.Optional("hold_until_exit"): bool,
        vol.Optional("occupies_parent"): bool,
        vol.Optional("presence_affects"): bool,
        vol.Optional("door_seals_room"): bool,
        vol.Optional("seal_max_duration"): int,
        vol.Optional("long_stay"): bool,
        vol.Optional("override_trigger_entity"): str,
        vol.Optional("override_trigger_action"): str,
        vol.Optional("door_blocks_vacancy"): bool,  # Legacy, maps to door_seals_room
        vol.Optional("door_open_resets_checking"): bool,  # Legacy
        vol.Optional("occupied_threshold"): vol.Coerce(float),
        vol.Optional("vacant_threshold"): vol.Coerce(float),
    }
)
@callback
def ws_sensor_config_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update sensor configuration for a room (creates if not found)."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    config = store.get_sensor_config(msg["room_id"])
    if not config:
        # Auto-create a default config for this room/zone
        floor_plan_id = store.find_floor_plan_id_for_room(msg["room_id"])
        if not floor_plan_id:
            connection.send_error(
                msg["id"], "not_found", "Room or zone not found in any floor plan"
            )
            return
        config = VirtualSensorConfig(
            room_id=msg["room_id"],
            floor_plan_id=floor_plan_id,
        )
        store.create_sensor_config(config)

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
    if "exit_sensors" in msg:
        config.exit_sensors = [SensorBinding.from_dict(s) for s in msg["exit_sensors"]]
    if "hold_until_exit" in msg:
        config.hold_until_exit = msg["hold_until_exit"]
    if "occupies_parent" in msg:
        config.occupies_parent = msg["occupies_parent"]
    if "presence_affects" in msg:
        config.presence_affects = msg["presence_affects"]
    if "door_seals_room" in msg:
        config.door_seals_room = msg["door_seals_room"]
        config.door_blocks_vacancy = msg["door_seals_room"]  # Keep in sync
    if "seal_max_duration" in msg:
        config.seal_max_duration = msg["seal_max_duration"]
    if "long_stay" in msg:
        config.long_stay = msg["long_stay"]
    if "override_trigger_entity" in msg:
        config.override_trigger_entity = msg["override_trigger_entity"]
    if "override_trigger_action" in msg:
        config.override_trigger_action = msg["override_trigger_action"]
    # Legacy field: map to door_seals_room
    if "door_blocks_vacancy" in msg and "door_seals_room" not in msg:
        config.door_seals_room = msg["door_blocks_vacancy"]
        config.door_blocks_vacancy = msg["door_blocks_vacancy"]
    if "door_open_resets_checking" in msg:
        config.door_open_resets_checking = msg["door_open_resets_checking"]
    if "occupied_threshold" in msg:
        config.occupied_threshold = msg["occupied_threshold"]
    if "vacant_threshold" in msg:
        config.vacant_threshold = msg["vacant_threshold"]

    # Validate threshold bounds
    if not (0.0 <= config.vacant_threshold <= config.occupied_threshold <= 1.0):
        connection.send_error(
            msg["id"],
            "invalid_thresholds",
            "Thresholds must satisfy: 0.0 <= vacant_threshold <= occupied_threshold <= 1.0",
        )
        return

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
    if not _require_admin(connection, msg):
        return
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
    if not _require_admin(connection, msg):
        return
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
    if not _require_admin(connection, msg):
        return
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


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/occupancy_history",
        vol.Optional("room_id"): str,
        vol.Optional("limit", default=100): int,
    }
)
@callback
def ws_occupancy_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get occupancy history, optionally filtered by room_id."""
    sensor_engine = hass.data[DOMAIN]["sensor_engine"]
    room_id = msg.get("room_id")
    limit = msg.get("limit", 100)
    history = sensor_engine.get_occupancy_history(room_id=room_id, limit=limit)
    connection.send_result(
        msg["id"],
        {"history": [e.to_dict() for e in history]},
    )


# ==================== Phantom Presence (Transition Prediction) ====================


@websocket_api.websocket_command({vol.Required("type"): f"{WS_PREFIX}/phantom_states"})
@callback
def ws_phantom_states(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get active phantom presence states and transition predictor diagnostics."""
    sensor_engine = hass.data[DOMAIN]["sensor_engine"]
    predictor = sensor_engine.transition_predictor
    learner = sensor_engine.transition_learner

    phantoms = {}
    for target_id, phantom in predictor.phantoms.items():
        phantoms[target_id] = {
            "source_id": phantom.source_id,
            "target_id": phantom.target_id,
            "probability": phantom.probability,
            "current_probability": phantom.current_probability,
            "hold_seconds": phantom.hold_seconds,
            "remaining_seconds": phantom.remaining,
            "reason": phantom.reason,
        }

    door_links = {}
    for entity_id, link in predictor.door_links.items():
        door_links[entity_id] = {
            "room_a": link.room_a,
            "room_b": link.room_b,
            "edge_id": link.door_edge_id,
        }

    connection.send_result(
        msg["id"],
        {
            "phantoms": phantoms,
            "door_links": door_links,
            "transition_counts": dict(learner._total_counts),
        },
    )


# ==================== mmWave Placements ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/mmwave/place",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("angle", default=0.0): vol.Coerce(float),
        vol.Optional("field_of_view", default=120.0): vol.Coerce(float),
        vol.Optional("detection_range", default=500.0): vol.Coerce(float),
        vol.Optional("label"): vol.Any(str, None),
        vol.Optional("targets", default=[]): list,
    }
)
@callback
def ws_mmwave_place(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Place an mmWave sensor freely on the canvas."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    placement = MmwavePlacement(
        floor_plan_id=msg["floor_plan_id"],
        floor_id=msg["floor_id"],
        room_id=msg.get("room_id"),
        position=Coordinates.from_dict(msg["position"]),
        angle=msg["angle"],
        field_of_view=msg["field_of_view"],
        detection_range=msg["detection_range"],
        label=msg.get("label"),
        targets=msg.get("targets", []),
    )
    result = store.create_mmwave_placement(placement)

    # Notify the processor so it subscribes to entity states immediately
    processor: MmwaveTargetProcessor = hass.data[DOMAIN]["mmwave_processor"]
    hass.async_create_task(processor.async_add_placement(result))

    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/mmwave/update",
        vol.Required("placement_id"): str,
        vol.Optional("position"): dict,
        vol.Optional("angle"): vol.Coerce(float),
        vol.Optional("field_of_view"): vol.Coerce(float),
        vol.Optional("detection_range"): vol.Coerce(float),
        vol.Optional("label"): vol.Any(str, None),
        vol.Optional("targets"): list,
    }
)
@callback
def ws_mmwave_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update an mmWave placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    placement = store.get_mmwave_placement(msg["placement_id"])
    if not placement:
        connection.send_error(msg["id"], "not_found", "mmWave placement not found")
        return

    if "position" in msg:
        placement.position = Coordinates.from_dict(msg["position"])
    if "angle" in msg:
        placement.angle = msg["angle"]
    if "field_of_view" in msg:
        placement.field_of_view = msg["field_of_view"]
    if "detection_range" in msg:
        placement.detection_range = msg["detection_range"]
    if "label" in msg:
        placement.label = msg["label"]
    if "targets" in msg:
        placement.targets = msg["targets"]

    result = store.update_mmwave_placement(placement)
    if result:
        # Notify the processor so it re-subscribes with updated config
        processor: MmwaveTargetProcessor = hass.data[DOMAIN]["mmwave_processor"]
        hass.async_create_task(processor.async_update_placement(result))

        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(
            msg["id"], "update_failed", "Failed to update mmWave placement"
        )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/mmwave/delete",
        vol.Required("placement_id"): str,
    }
)
@callback
def ws_mmwave_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete an mmWave placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if store.delete_mmwave_placement(msg["placement_id"]):
        # Notify the processor so it unsubscribes from entity states
        processor: MmwaveTargetProcessor = hass.data[DOMAIN]["mmwave_processor"]
        hass.async_create_task(processor.async_remove_placement(msg["placement_id"]))

        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "mmWave placement not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/mmwave/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_mmwave_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all mmWave placements for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    placements = store.get_mmwave_placements(msg["floor_plan_id"])
    connection.send_result(msg["id"], [p.to_dict() for p in placements])


# ==================== Simulated Targets ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/target/add",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("position"): dict,
        vol.Optional("hitbox", default=True): bool,
    }
)
@callback
def ws_simulate_target_add(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a simulated target at a position."""
    if not _require_admin(connection, msg):
        return
    sim: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    target = sim.add_target(
        msg["floor_plan_id"],
        msg["floor_id"],
        Coordinates.from_dict(msg["position"]),
        hitbox=msg["hitbox"],
    )
    connection.send_result(msg["id"], target.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/target/move",
        vol.Required("target_id"): str,
        vol.Required("position"): dict,
        vol.Optional("hitbox", default=True): bool,
    }
)
@callback
def ws_simulate_target_move(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Move a simulated target to a new position."""
    if not _require_admin(connection, msg):
        return
    sim: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    target = sim.move_target(
        msg["target_id"],
        Coordinates.from_dict(msg["position"]),
        hitbox=msg["hitbox"],
    )
    if target:
        connection.send_result(msg["id"], target.to_dict())
    else:
        connection.send_error(msg["id"], "not_found", "Simulated target not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/target/remove",
        vol.Required("target_id"): str,
    }
)
@callback
def ws_simulate_target_remove(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a simulated target."""
    if not _require_admin(connection, msg):
        return
    sim: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    if sim.remove_target(msg["target_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Simulated target not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/target/clear",
    }
)
@callback
def ws_simulate_target_clear(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Clear all simulated targets."""
    if not _require_admin(connection, msg):
        return
    sim: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    sim.clear_all()
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/target/list",
    }
)
@callback
def ws_simulate_target_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all simulated targets."""
    sim: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    targets = sim.get_targets()
    connection.send_result(msg["id"], [t.to_dict() for t in targets])
