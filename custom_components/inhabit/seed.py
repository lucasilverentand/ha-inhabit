"""Seed a demo house with HA areas and an Inhabit floor plan."""

from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar

from .models import Coordinates, Floor, FloorPlan, Polygon, Room
from .models.floor_plan import Edge, Node
from .store import FloorPlanStore

_LOGGER = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Layout constants (cm)
# ---------------------------------------------------------------------------
# Apartment grid (origin top-left):
#
#   0,0 ─────────────────────────────── 1200,0
#    │  Hallway   │  Kitchen  │ Toilet  │
#    │  (0-240)   │ (240-600) │(600-780)│
#    │            │           │         │
#  0,300 ─────────┤           ├─ 780,300│
#    │  Living    │           │ Shower  │
#    │  Room      │           │(600-780)│
#    │  (0-600)   ├─ 600,420 ─┤         │
#    │            │           │         │
#    │            │  Bathroom │ Storage │
#    │            │ (600-780) │(780-960)│
#  0,720 ────────┼───────────┼─────────┤
#    │  Bedroom   │  Office   │         │
#    │  (0-480)   │(480-780)  │         │
#    │            │           │         │
#  0,1020────────┴───────────┘  960,720
#                780,1020
#
# Rooms from the configuration.yaml:
#   Living Room, Kitchen, Bedroom, Bathroom, Hallway, Office, Toilet, Shower, Storage

ROOMS = {
    "hallway":     {"x1":   0, "y1":   0, "x2": 240, "y2": 300},
    "kitchen":     {"x1": 240, "y1":   0, "x2": 600, "y2": 420},
    "living_room": {"x1":   0, "y1": 300, "x2": 600, "y2": 720},
    "toilet":      {"x1": 600, "y1":   0, "x2": 780, "y2": 300},
    "shower":      {"x1": 600, "y1": 300, "x2": 780, "y2": 480},
    "bathroom":    {"x1": 600, "y1": 480, "x2": 780, "y2": 720},
    "storage":     {"x1": 780, "y1": 480, "x2": 960, "y2": 720},
    "bedroom":     {"x1":   0, "y1": 720, "x2": 480, "y2": 1020},
    "office":      {"x1": 480, "y1": 720, "x2": 780, "y2": 1020},
}

ROOM_LABELS = {
    "hallway": "Hallway",
    "kitchen": "Kitchen",
    "living_room": "Living Room",
    "toilet": "Toilet",
    "shower": "Shower",
    "bathroom": "Bathroom",
    "storage": "Storage",
    "bedroom": "Bedroom",
    "office": "Office",
}

ROOM_COLORS = {
    "hallway": "#d4c5a9",
    "kitchen": "#b8d4e3",
    "living_room": "#c5d4b8",
    "toilet": "#e3d4b8",
    "shower": "#b8c5e3",
    "bathroom": "#d4b8c5",
    "storage": "#c5c5c5",
    "bedroom": "#d4c5e3",
    "office": "#e3e3b8",
}

# Doors: (node_a_coords, node_b_coords, entity_id)
# Each door is an edge between two nodes on a shared wall.
DOORS: list[dict] = [
    # Front door (hallway exterior, left wall)
    {"x1": 0, "y1": 100, "x2": 0, "y2": 180, "entity": "binary_sensor.front_door", "exterior": True},
    # Hallway → Living Room
    {"x1": 0, "y1": 300, "x2": 80, "y2": 300, "entity": "binary_sensor.living_room_door_1"},
    # Kitchen → Living Room
    {"x1": 240, "y1": 300, "x2": 240, "y2": 420, "entity": "binary_sensor.living_room_door_2"},
    # Bedroom door (from living room)
    {"x1": 160, "y1": 720, "x2": 240, "y2": 720, "entity": "binary_sensor.bedroom_door"},
    # Office door (from living room)
    {"x1": 480, "y1": 720, "x2": 560, "y2": 720, "entity": "binary_sensor.office_door"},
    # Toilet door (from kitchen)
    {"x1": 600, "y1": 100, "x2": 600, "y2": 180, "entity": "binary_sensor.toilet_door"},
    # Shower door (from bathroom side)
    {"x1": 600, "y1": 380, "x2": 600, "y2": 460, "entity": "binary_sensor.shower_door"},
    # Bathroom door (from living room)
    {"x1": 600, "y1": 560, "x2": 600, "y2": 640, "entity": "binary_sensor.bathroom_door"},
    # Storage door (from bathroom)
    {"x1": 780, "y1": 560, "x2": 780, "y2": 640, "entity": "binary_sensor.storage_door"},
]

# Windows: (node_a_coords, node_b_coords)
WINDOWS: list[dict] = [
    # Living room south wall (3 windows)
    {"x1": 60,  "y1": 720, "x2": 120, "y2": 720},
    {"x1": 320, "y1": 720, "x2": 400, "y2": 720},
    {"x1": 420, "y1": 720, "x2": 480, "y2": 720},
    # Bedroom south wall (3 windows)
    {"x1": 60,  "y1": 1020, "x2": 140, "y2": 1020},
    {"x1": 200, "y1": 1020, "x2": 280, "y2": 1020},
    {"x1": 340, "y1": 1020, "x2": 420, "y2": 1020},
]


def _rect_polygon(x1: float, y1: float, x2: float, y2: float) -> Polygon:
    """Create a rectangular polygon from two corners."""
    return Polygon(
        vertices=[
            Coordinates(x1, y1),
            Coordinates(x2, y1),
            Coordinates(x2, y2),
            Coordinates(x1, y2),
        ]
    )


def _collect_wall_segments(rooms: dict[str, dict]) -> list[tuple[float, float, float, float]]:
    """Derive exterior wall segments from room rectangles.

    Returns deduplicated list of (x1, y1, x2, y2) wall segments that form the
    outer boundary of the apartment. Interior shared walls are also included.
    """
    segments: set[tuple[float, float, float, float]] = set()
    for rect in rooms.values():
        x1, y1, x2, y2 = rect["x1"], rect["y1"], rect["x2"], rect["y2"]
        # 4 edges of rectangle
        edges = [
            (x1, y1, x2, y1),  # top
            (x2, y1, x2, y2),  # right
            (x1, y2, x2, y2),  # bottom
            (x1, y1, x1, y2),  # left
        ]
        for seg in edges:
            # Normalise so (min, min) comes first
            norm = (min(seg[0], seg[2]), min(seg[1], seg[3]),
                    max(seg[0], seg[2]), max(seg[1], seg[3]))
            segments.add(norm)
    return list(segments)


async def async_seed_demo_house(hass: HomeAssistant, store: FloorPlanStore) -> None:
    """Create HA areas and a demo floor plan if no floor plans exist yet."""
    if store.get_floor_plans():
        return

    _LOGGER.info("Seeding demo house with areas and floor plan")

    # ------------------------------------------------------------------
    # 1. Create HA areas
    # ------------------------------------------------------------------
    area_reg = ar.async_get(hass)
    area_ids: dict[str, str] = {}
    for key, label in ROOM_LABELS.items():
        area = area_reg.async_get_or_create(label)
        area_ids[key] = area.id

    # ------------------------------------------------------------------
    # 2. Create floor plan
    # ------------------------------------------------------------------
    floor_plan = store.create_floor_plan(FloorPlan(name="Demo Apartment"))

    # ------------------------------------------------------------------
    # 3. Create floor (ground floor, level 0)
    # ------------------------------------------------------------------
    floor = store.add_floor(floor_plan.id, Floor(name="Ground Floor", level=0))
    assert floor is not None
    floor_id = floor.id

    # ------------------------------------------------------------------
    # 4. Build node graph and edges (walls, doors, windows)
    # ------------------------------------------------------------------
    # We need nodes at every unique (x, y) endpoint used by walls, doors, and windows.
    # We'll collect all segments first, then deduplicate points to build nodes.

    # Gather all wall segments from room rectangles
    wall_segs = _collect_wall_segments(ROOMS)

    # Gather door / window endpoints
    door_segs = [(d["x1"], d["y1"], d["x2"], d["y2"]) for d in DOORS]
    window_segs = [(w["x1"], w["y1"], w["x2"], w["y2"]) for w in WINDOWS]

    # Collect all unique points
    all_points: set[tuple[float, float]] = set()
    for seg in wall_segs + door_segs + window_segs:
        all_points.add((seg[0], seg[1]))
        all_points.add((seg[2], seg[3]))

    # Create nodes, building a lookup {(x, y): node_id}
    node_lookup: dict[tuple[float, float], str] = {}
    nodes: list[Node] = []
    for x, y in sorted(all_points):
        node = Node(x=x, y=y)
        nodes.append(node)
        node_lookup[(x, y)] = node.id

    # Helper to find or create a node
    def _node_id(x: float, y: float) -> str:
        key = (float(x), float(y))
        return node_lookup[key]

    # Build wall edges – split wall segments at door/window locations
    # For simplicity, we add walls for the full room edges and then add
    # door/window edges separately. The frontend renders overlapping edges
    # correctly (doors/windows punch through walls).
    edges: list[Edge] = []

    # Add wall edges for every room side
    for seg in wall_segs:
        x1, y1, x2, y2 = seg
        # Determine if this is an exterior wall (on the bounding box of the apartment)
        all_x = [r["x1"] for r in ROOMS.values()] + [r["x2"] for r in ROOMS.values()]
        all_y = [r["y1"] for r in ROOMS.values()] + [r["y2"] for r in ROOMS.values()]
        min_x, max_x = min(all_x), max(all_x)
        min_y, max_y = min(all_y), max(all_y)
        is_ext = (
            (x1 == x2 and x1 in (min_x, max_x))
            or (y1 == y2 and y1 in (min_y, max_y))
        )
        direction = "horizontal" if y1 == y2 else "vertical" if x1 == x2 else "free"
        edges.append(
            Edge(
                start_node=_node_id(x1, y1),
                end_node=_node_id(x2, y2),
                type="wall",
                is_exterior=is_ext,
                direction=direction,
            )
        )

    # Add door edges
    for door in DOORS:
        edges.append(
            Edge(
                start_node=_node_id(door["x1"], door["y1"]),
                end_node=_node_id(door["x2"], door["y2"]),
                type="door",
                entity_id=door["entity"],
                is_exterior=door.get("exterior", False),
                opening_parts="single",
                opening_type="swing",
            )
        )

    # Add window edges
    for window in WINDOWS:
        edges.append(
            Edge(
                start_node=_node_id(window["x1"], window["y1"]),
                end_node=_node_id(window["x2"], window["y2"]),
                type="window",
                is_exterior=True,
            )
        )

    # Attach nodes and edges to the floor directly, then persist
    floor_plan = store.get_floor_plan(floor_plan.id)
    assert floor_plan is not None
    fl = floor_plan.get_floor(floor_id)
    assert fl is not None
    fl.nodes = nodes
    fl.edges = edges
    store.update_floor_plan(floor_plan)

    # ------------------------------------------------------------------
    # 5. Create rooms (auto-creates VirtualSensorConfig for each)
    # ------------------------------------------------------------------
    for key, rect in ROOMS.items():
        room = Room(
            name=ROOM_LABELS[key],
            polygon=_rect_polygon(rect["x1"], rect["y1"], rect["x2"], rect["y2"]),
            color=ROOM_COLORS[key],
            occupancy_sensor_enabled=True,
            ha_area_id=area_ids[key],
        )
        store.add_room(floor_plan.id, floor_id, room)

    await store.async_save()
    _LOGGER.info("Demo house seeded: %d rooms, %d nodes, %d edges",
                 len(ROOMS), len(nodes), len(edges))
