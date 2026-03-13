"""WebSocket handlers for edge and node operations."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...models.floor_plan import Edge, Floor, Node
from ._helpers import _require_admin

SNAP_THRESHOLD = 1.0  # 1cm snap distance for node dedup


def register(hass: HomeAssistant) -> None:
    """Register edge and node WebSocket commands."""
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
