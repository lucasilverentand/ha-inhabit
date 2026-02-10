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
    Edge,
    Floor,
    FloorPlan,
    Node,
    Polygon,
    Room,
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
    store = hass.data[DOMAIN]["store"]
    room = Room(
        name=msg["name"],
        polygon=Polygon.from_dict(msg["polygon"]),
        color=msg["color"],
        occupancy_sensor_enabled=msg["occupancy_sensor_enabled"],
        motion_timeout=msg["motion_timeout"],
        checking_timeout=msg["checking_timeout"],
        ha_area_id=msg.get("ha_area_id"),
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
        vol.Optional("ha_area_id"): vol.Any(str, None),
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
    if "ha_area_id" in msg:
        room.ha_area_id = msg["ha_area_id"]

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
        floor.edges[i:i + 1] = [edge1, edge2]


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
    start_node = _get_or_create_node(floor, float(start_coords["x"]), float(start_coords["y"]))
    end_node = _get_or_create_node(floor, float(end_coords["x"]), float(end_coords["y"]))

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
        connection.send_result(msg["id"], {
            "edge": edge.to_dict(),
            "nodes": [start_node.to_dict(), end_node.to_dict()],
        })
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
        vol.Optional("swing_direction"): vol.Any(str, None),
        vol.Optional("entity_id"): vol.Any(str, None),
        vol.Optional("height"): vol.Any(vol.Coerce(float), None),
    }
)
@callback
def ws_edges_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update an edge's properties."""
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
    if "swing_direction" in msg:
        edge.swing_direction = msg["swing_direction"]
    if "entity_id" in msg:
        edge.entity_id = msg["entity_id"]
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
        siblings = [e for e in floor.edges if e.collinear_group == deleted_edge.collinear_group]
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
        connection.send_result(msg["id"], {
            "success": True,
            "removed_node_ids": removed_nodes,
        })
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
        connection.send_result(msg["id"], {
            "link_group": link_group,
            "edge_ids": edge_ids,
        })
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
        connection.send_result(msg["id"], {
            "collinear_group": collinear_group,
            "edge_ids": edge_ids,
        })
    else:
        connection.send_error(msg["id"], "link_failed", "Failed to collinear link edges")


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
        connection.send_error(msg["id"], "unlink_failed", "Failed to collinear unlink edges")


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
        connection.send_result(msg["id"], {
            "angle_group": angle_group,
            "edge_ids": edge_ids,
        })
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
        connection.send_error(msg["id"], "unlink_failed", "Failed to angle unlink edges")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/edges/split",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("edge_id"): str,
        vol.Required("position"): vol.Coerce(float),
        vol.Required("new_type"): str,
        vol.Optional("width", default=80.0): vol.Coerce(float),
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

    # Build the 3 replacement edges
    new_edges = []
    if t_start > 1e-9:
        new_edges.append(Edge(
            start_node=edge.start_node,
            end_node=n1.id,
            type="wall",
            thickness=edge.thickness,
            is_exterior=edge.is_exterior,
            link_group=edge.link_group,
        ))
    opening_edge = Edge(
        start_node=n1.id,
        end_node=n2.id,
        type=msg["new_type"],
        thickness=edge.thickness,
        is_exterior=edge.is_exterior,
        swing_direction=msg.get("swing_direction"),
        entity_id=msg.get("entity_id"),
        height=msg.get("height"),
    )
    new_edges.append(opening_edge)
    if t_end < 1.0 - 1e-9:
        new_edges.append(Edge(
            start_node=n2.id,
            end_node=edge.end_node,
            type="wall",
            thickness=edge.thickness,
            is_exterior=edge.is_exterior,
            link_group=edge.link_group,
        ))

    # Replace old edge with new edges
    floor.edges = [e for e in floor.edges if e.id != edge.id] + new_edges
    _cleanup_orphan_nodes(floor)

    result = store.update_floor_plan(floor_plan)
    if result:
        connection.send_result(msg["id"], {
            "edges": [e.to_dict() for e in new_edges],
            "nodes": [n1.to_dict(), n2.to_dict()],
        })
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
        connection.send_result(msg["id"], {"success": True, "removed_node_id": remove_id})
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
    connected = [e for e in floor.edges if e.start_node == node_id or e.end_node == node_id]

    if len(connected) != 2:
        connection.send_error(
            msg["id"], "invalid_state",
            f"Node must have exactly 2 connected edges to dissolve, found {len(connected)}"
        )
        return

    e1, e2 = connected
    # Find the "other" node for each edge
    other1 = e1.end_node if e1.start_node == node_id else e1.start_node
    other2 = e2.end_node if e2.start_node == node_id else e2.start_node

    if other1 == other2:
        connection.send_error(msg["id"], "invalid_state", "Cannot dissolve: both edges connect to the same node")
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
        connection.send_result(msg["id"], {
            "success": True,
            "merged_edge": merged.to_dict(),
            "removed_edge_ids": list(old_ids),
            "removed_node_id": node_id,
        })
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
        connection.send_result(msg["id"], {
            "new_node": new_node.to_dict(),
            "edges": [edge1.to_dict(), edge2.to_dict()],
            "removed_edge_id": edge.id,
        })
    else:
        connection.send_error(msg["id"], "split_failed", "Failed to split edge")


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
