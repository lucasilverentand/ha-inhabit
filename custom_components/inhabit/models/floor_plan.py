"""Floor plan data models."""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4


def _generate_id() -> str:
    """Generate a unique ID."""
    return uuid4().hex[:8]


@dataclass
class Coordinates:
    """2D coordinate point."""

    x: float
    y: float

    def to_dict(self) -> dict[str, float]:
        """Convert to dictionary."""
        return {"x": self.x, "y": self.y}

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Coordinates:
        """Create from dictionary."""
        return cls(x=float(data["x"]), y=float(data["y"]))


@dataclass
class BoundingBox:
    """Axis-aligned bounding box."""

    min_x: float
    min_y: float
    max_x: float
    max_y: float

    @property
    def width(self) -> float:
        """Get width."""
        return self.max_x - self.min_x

    @property
    def height(self) -> float:
        """Get height."""
        return self.max_y - self.min_y

    @property
    def center(self) -> Coordinates:
        """Get center point."""
        return Coordinates(
            x=(self.min_x + self.max_x) / 2,
            y=(self.min_y + self.max_y) / 2,
        )

    def to_dict(self) -> dict[str, float]:
        """Convert to dictionary."""
        return {
            "min_x": self.min_x,
            "min_y": self.min_y,
            "max_x": self.max_x,
            "max_y": self.max_y,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> BoundingBox:
        """Create from dictionary."""
        return cls(
            min_x=float(data["min_x"]),
            min_y=float(data["min_y"]),
            max_x=float(data["max_x"]),
            max_y=float(data["max_y"]),
        )


@dataclass
class Polygon:
    """Polygon defined by vertices."""

    vertices: list[Coordinates] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {"vertices": [v.to_dict() for v in self.vertices]}

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Polygon:
        """Create from dictionary."""
        return cls(
            vertices=[Coordinates.from_dict(v) for v in data.get("vertices", [])]
        )

    @property
    def bounding_box(self) -> BoundingBox | None:
        """Calculate bounding box."""
        if not self.vertices:
            return None
        xs = [v.x for v in self.vertices]
        ys = [v.y for v in self.vertices]
        return BoundingBox(
            min_x=min(xs),
            min_y=min(ys),
            max_x=max(xs),
            max_y=max(ys),
        )

    def contains_point(self, point: Coordinates) -> bool:
        """Check if point is inside polygon using ray casting."""
        if not self.vertices or len(self.vertices) < 3:
            return False

        n = len(self.vertices)
        inside = False
        j = n - 1

        for i in range(n):
            vi = self.vertices[i]
            vj = self.vertices[j]

            if (vi.y > point.y) != (vj.y > point.y):
                slope = (point.y - vi.y) / (vj.y - vi.y)
                x_intersect = vi.x + slope * (vj.x - vi.x)
                if point.x < x_intersect:
                    inside = not inside
            j = i

        return inside


@dataclass
class Wall:
    """Wall segment between two points."""

    id: str = field(default_factory=_generate_id)
    start: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    end: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    thickness: float = 10.0
    is_exterior: bool = False
    length_locked: bool = False
    direction: str = "free"  # "free", "horizontal", "vertical"
    angle_locked: bool = False

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "start": self.start.to_dict(),
            "end": self.end.to_dict(),
            "thickness": self.thickness,
            "is_exterior": self.is_exterior,
            "length_locked": self.length_locked,
            "direction": self.direction,
            "angle_locked": self.angle_locked,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Wall:
        """Create from dictionary."""
        # Migration: convert old 'constraint' field to new fields
        length_locked = data.get("length_locked", False)
        direction = data.get("direction", "free")

        if "constraint" in data and "length_locked" not in data:
            old_constraint = data["constraint"]
            if old_constraint == "length":
                length_locked = True
            elif old_constraint in ("horizontal", "vertical"):
                direction = old_constraint

        return cls(
            id=data.get("id", _generate_id()),
            start=Coordinates.from_dict(data["start"]),
            end=Coordinates.from_dict(data["end"]),
            thickness=float(data.get("thickness", 10.0)),
            is_exterior=bool(data.get("is_exterior", False)),
            length_locked=bool(length_locked),
            direction=direction,
            angle_locked=bool(data.get("angle_locked", False)),
        )


@dataclass
class Door:
    """Door placed on a wall."""

    id: str = field(default_factory=_generate_id)
    wall_id: str = ""
    position: float = 0.5  # Position along wall (0.0-1.0)
    width: float = 80.0
    swing_direction: str = "left"  # left, right, double, sliding
    entity_id: str | None = None  # Associated door sensor

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "wall_id": self.wall_id,
            "position": self.position,
            "width": self.width,
            "swing_direction": self.swing_direction,
            "entity_id": self.entity_id,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Door:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            wall_id=data.get("wall_id", ""),
            position=float(data.get("position", 0.5)),
            width=float(data.get("width", 80.0)),
            swing_direction=data.get("swing_direction", "left"),
            entity_id=data.get("entity_id"),
        )


@dataclass
class Window:
    """Window placed on a wall."""

    id: str = field(default_factory=_generate_id)
    wall_id: str = ""
    position: float = 0.5  # Position along wall (0.0-1.0)
    width: float = 100.0
    height: float = 120.0

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "wall_id": self.wall_id,
            "position": self.position,
            "width": self.width,
            "height": self.height,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Window:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            wall_id=data.get("wall_id", ""),
            position=float(data.get("position", 0.5)),
            width=float(data.get("width", 100.0)),
            height=float(data.get("height", 120.0)),
        )


@dataclass
class Node:
    """Shared vertex point in the floor plan graph."""

    id: str = field(default_factory=_generate_id)
    x: float = 0.0
    y: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {"id": self.id, "x": self.x, "y": self.y}

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Node:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            x=float(data["x"]),
            y=float(data["y"]),
        )


@dataclass
class Edge:
    """Edge connecting two nodes. Type can be wall, door, or window."""

    id: str = field(default_factory=_generate_id)
    start_node: str = ""  # Node ID
    end_node: str = ""  # Node ID
    type: str = "wall"  # "wall" | "door" | "window"
    thickness: float = 10.0
    is_exterior: bool = False
    length_locked: bool = False
    direction: str = "free"  # "free", "horizontal", "vertical"
    angle_locked: bool = False
    # Door-specific
    swing_direction: str | None = None
    entity_id: str | None = None
    # Window-specific
    height: float | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        result: dict[str, Any] = {
            "id": self.id,
            "start_node": self.start_node,
            "end_node": self.end_node,
            "type": self.type,
            "thickness": self.thickness,
            "is_exterior": self.is_exterior,
            "length_locked": self.length_locked,
            "direction": self.direction,
            "angle_locked": self.angle_locked,
        }
        if self.swing_direction is not None:
            result["swing_direction"] = self.swing_direction
        if self.entity_id is not None:
            result["entity_id"] = self.entity_id
        if self.height is not None:
            result["height"] = self.height
        return result

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Edge:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            start_node=data.get("start_node", ""),
            end_node=data.get("end_node", ""),
            type=data.get("type", "wall"),
            thickness=float(data.get("thickness", 10.0)),
            is_exterior=bool(data.get("is_exterior", False)),
            length_locked=bool(data.get("length_locked", False)),
            direction=data.get("direction", "free"),
            angle_locked=bool(data.get("angle_locked", False)),
            swing_direction=data.get("swing_direction"),
            entity_id=data.get("entity_id"),
            height=data.get("height"),
        )


@dataclass
class Room:
    """Room definition with polygon boundary."""

    id: str = field(default_factory=_generate_id)
    name: str = ""
    polygon: Polygon = field(default_factory=Polygon)
    floor_id: str = ""
    color: str = "#e8e8e8"
    occupancy_sensor_enabled: bool = True
    motion_timeout: int = 120  # Seconds before CHECKING state
    checking_timeout: int = 30  # Seconds in CHECKING before VACANT
    connected_rooms: list[str] = field(
        default_factory=list
    )  # Room IDs connected via doors
    ha_area_id: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "polygon": self.polygon.to_dict(),
            "floor_id": self.floor_id,
            "color": self.color,
            "occupancy_sensor_enabled": self.occupancy_sensor_enabled,
            "motion_timeout": self.motion_timeout,
            "checking_timeout": self.checking_timeout,
            "connected_rooms": self.connected_rooms,
            "ha_area_id": self.ha_area_id,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Room:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            name=data.get("name", ""),
            polygon=Polygon.from_dict(data.get("polygon", {})),
            floor_id=data.get("floor_id", ""),
            color=data.get("color", "#e8e8e8"),
            occupancy_sensor_enabled=data.get("occupancy_sensor_enabled", True),
            motion_timeout=int(data.get("motion_timeout", 120)),
            checking_timeout=int(data.get("checking_timeout", 30)),
            connected_rooms=data.get("connected_rooms", []),
            ha_area_id=data.get("ha_area_id"),
        )


@dataclass
class Floor:
    """Floor in a multi-story building."""

    id: str = field(default_factory=_generate_id)
    name: str = ""
    level: int = 0  # 0 = ground, negative = basement, positive = upper floors
    background_image: str | None = None
    background_scale: float = 1.0
    background_offset: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    rooms: list[Room] = field(default_factory=list)
    nodes: list[Node] = field(default_factory=list)
    edges: list[Edge] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "level": self.level,
            "background_image": self.background_image,
            "background_scale": self.background_scale,
            "background_offset": self.background_offset.to_dict(),
            "rooms": [r.to_dict() for r in self.rooms],
            "nodes": [n.to_dict() for n in self.nodes],
            "edges": [e.to_dict() for e in self.edges],
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Floor:
        """Create from dictionary."""
        # Detect old format: has 'walls' key with items containing start/end dicts,
        # and no 'nodes' key
        has_old_walls = (
            "walls" in data
            and data["walls"]
            and isinstance(data["walls"][0], dict)
            and "start" in data["walls"][0]
            and "nodes" not in data
        )

        if has_old_walls:
            nodes, edges = _migrate_walls_to_graph(data)
        elif "nodes" in data:
            nodes = [Node.from_dict(n) for n in data["nodes"]]
            edges = [Edge.from_dict(e) for e in data.get("edges", [])]
        else:
            nodes = []
            edges = []

        return cls(
            id=data.get("id", _generate_id()),
            name=data.get("name", ""),
            level=int(data.get("level", 0)),
            background_image=data.get("background_image"),
            background_scale=float(data.get("background_scale", 1.0)),
            background_offset=Coordinates.from_dict(
                data.get("background_offset", {"x": 0, "y": 0})
            ),
            rooms=[Room.from_dict(r) for r in data.get("rooms", [])],
            nodes=nodes,
            edges=edges,
        )

    def get_room(self, room_id: str) -> Room | None:
        """Get room by ID."""
        for room in self.rooms:
            if room.id == room_id:
                return room
        return None

    def get_node(self, node_id: str) -> Node | None:
        """Get node by ID."""
        for node in self.nodes:
            if node.id == node_id:
                return node
        return None

    def get_edge(self, edge_id: str) -> Edge | None:
        """Get edge by ID."""
        for edge in self.edges:
            if edge.id == edge_id:
                return edge
        return None


def _migrate_walls_to_graph(
    data: dict[str, Any],
) -> tuple[list[Node], list[Edge]]:
    """Migrate old wall/door/window format to node-graph format."""
    walls = [Wall.from_dict(w) for w in data.get("walls", [])]
    doors = [Door.from_dict(d) for d in data.get("doors", [])]
    windows = [Window.from_dict(w) for w in data.get("windows", [])]

    # Build unique nodes from wall endpoints using rounded coords as dedup key
    node_map: dict[tuple[float, float], Node] = {}

    def _get_or_create_node(x: float, y: float) -> Node:
        key = (round(x), round(y))
        if key not in node_map:
            node_map[key] = Node(x=x, y=y)
        return node_map[key]

    # First pass: create nodes and basic wall edges
    wall_id_to_edge: dict[str, Edge] = {}
    edges: list[Edge] = []

    for wall in walls:
        start_node = _get_or_create_node(wall.start.x, wall.start.y)
        end_node = _get_or_create_node(wall.end.x, wall.end.y)
        edge = Edge(
            start_node=start_node.id,
            end_node=end_node.id,
            type="wall",
            thickness=wall.thickness,
            is_exterior=wall.is_exterior,
            length_locked=wall.length_locked,
            direction=wall.direction,
            angle_locked=wall.angle_locked,
        )
        wall_id_to_edge[wall.id] = edge
        edges.append(edge)

    # Process doors and windows - they split their parent wall edge
    openings: list[tuple[str, str, float, float, dict[str, Any]]] = []
    # Collect all openings: (wall_id, type, position, width, extra_attrs)
    for door in doors:
        openings.append((
            door.wall_id,
            "door",
            door.position,
            door.width,
            {
                "swing_direction": door.swing_direction,
                "entity_id": door.entity_id,
            },
        ))
    for window in windows:
        openings.append((
            window.wall_id,
            "window",
            window.position,
            window.width,
            {"height": window.height},
        ))

    # Group openings by wall_id
    openings_by_wall: dict[str, list[tuple[str, float, float, dict[str, Any]]]] = {}
    for wall_id, opening_type, position, width, extra in openings:
        openings_by_wall.setdefault(wall_id, []).append(
            (opening_type, position, width, extra)
        )

    # Process each wall that has openings
    for wall_id, wall_openings in openings_by_wall.items():
        if wall_id not in wall_id_to_edge:
            continue

        parent_edge = wall_id_to_edge[wall_id]
        wall = next(w for w in walls if w.id == wall_id)
        wall_dx = wall.end.x - wall.start.x
        wall_dy = wall.end.y - wall.start.y
        wall_length = math.sqrt(wall_dx * wall_dx + wall_dy * wall_dy)
        if wall_length == 0:
            continue

        # Sort openings by position along wall
        wall_openings.sort(key=lambda o: o[1])

        # Remove the original edge
        edges.remove(parent_edge)

        # Build segments: alternating wall and opening segments
        start_node_id = parent_edge.start_node
        end_node_id = parent_edge.end_node

        # Unit vector along wall
        ux = wall_dx / wall_length
        uy = wall_dy / wall_length

        segments: list[tuple[str, float, float, dict[str, Any]]] = []
        # segments: (type, start_t, end_t, extra_attrs)

        for opening_type, position, width, extra in wall_openings:
            half_w = width / wall_length / 2.0
            t_start = max(0.0, position - half_w)
            t_end = min(1.0, position + half_w)
            segments.append((opening_type, t_start, t_end, extra))

        # Build edges from segments, filling gaps with wall segments
        current_t = 0.0
        current_node_id = start_node_id

        for opening_type, t_start, t_end, extra in segments:
            # Wall segment before the opening
            if t_start > current_t + 1e-9:
                nx = wall.start.x + t_start * wall_dx
                ny = wall.start.y + t_start * wall_dy
                new_node = _get_or_create_node(nx, ny)
                edges.append(Edge(
                    start_node=current_node_id,
                    end_node=new_node.id,
                    type="wall",
                    thickness=parent_edge.thickness,
                    is_exterior=parent_edge.is_exterior,
                ))
                current_node_id = new_node.id
            elif t_start <= current_t + 1e-9:
                # Opening starts at current position, no gap
                pass

            # Opening nodes
            if abs(t_start - current_t) > 1e-9 or current_node_id == start_node_id:
                # Need a node at t_start if we don't already have one there
                nx = wall.start.x + t_start * wall_dx
                ny = wall.start.y + t_start * wall_dy
                opening_start_node = _get_or_create_node(nx, ny)
                if opening_start_node.id != current_node_id:
                    current_node_id = opening_start_node.id
            opening_start_node_id = current_node_id

            nx = wall.start.x + t_end * wall_dx
            ny = wall.start.y + t_end * wall_dy
            opening_end_node = _get_or_create_node(nx, ny)

            # Create the opening edge
            opening_edge = Edge(
                start_node=opening_start_node_id,
                end_node=opening_end_node.id,
                type=opening_type,
                thickness=parent_edge.thickness,
                is_exterior=parent_edge.is_exterior,
                swing_direction=extra.get("swing_direction"),
                entity_id=extra.get("entity_id"),
                height=extra.get("height"),
            )
            edges.append(opening_edge)
            current_node_id = opening_end_node.id
            current_t = t_end

        # Remaining wall segment after last opening
        if current_t < 1.0 - 1e-9:
            edges.append(Edge(
                start_node=current_node_id,
                end_node=end_node_id,
                type="wall",
                thickness=parent_edge.thickness,
                is_exterior=parent_edge.is_exterior,
            ))

    nodes = list(node_map.values())
    return nodes, edges


@dataclass
class FloorPlan:
    """Complete floor plan with multiple floors."""

    id: str = field(default_factory=_generate_id)
    name: str = ""
    created_at: str = ""
    updated_at: str = ""
    unit: str = "cm"  # cm, m, in, ft
    grid_size: float = 10.0
    floors: list[Floor] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "unit": self.unit,
            "grid_size": self.grid_size,
            "floors": [f.to_dict() for f in self.floors],
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> FloorPlan:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            name=data.get("name", ""),
            created_at=data.get("created_at", ""),
            updated_at=data.get("updated_at", ""),
            unit=data.get("unit", "cm"),
            grid_size=float(data.get("grid_size", 10.0)),
            floors=[Floor.from_dict(f) for f in data.get("floors", [])],
        )

    def get_floor(self, floor_id: str) -> Floor | None:
        """Get floor by ID."""
        for floor in self.floors:
            if floor.id == floor_id:
                return floor
        return None

    def get_room(self, room_id: str) -> tuple[Floor, Room] | None:
        """Get room by ID across all floors."""
        for floor in self.floors:
            room = floor.get_room(room_id)
            if room:
                return floor, room
        return None

    def get_all_rooms(self) -> list[Room]:
        """Get all rooms across all floors."""
        rooms = []
        for floor in self.floors:
            rooms.extend(floor.rooms)
        return rooms
