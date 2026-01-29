"""Floor plan data models."""
from __future__ import annotations

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

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "start": self.start.to_dict(),
            "end": self.end.to_dict(),
            "thickness": self.thickness,
            "is_exterior": self.is_exterior,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Wall:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            start=Coordinates.from_dict(data["start"]),
            end=Coordinates.from_dict(data["end"]),
            thickness=float(data.get("thickness", 10.0)),
            is_exterior=bool(data.get("is_exterior", False)),
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
    connected_rooms: list[str] = field(default_factory=list)  # Room IDs connected via doors

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
    walls: list[Wall] = field(default_factory=list)
    doors: list[Door] = field(default_factory=list)
    windows: list[Window] = field(default_factory=list)

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
            "walls": [w.to_dict() for w in self.walls],
            "doors": [d.to_dict() for d in self.doors],
            "windows": [w.to_dict() for w in self.windows],
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Floor:
        """Create from dictionary."""
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
            walls=[Wall.from_dict(w) for w in data.get("walls", [])],
            doors=[Door.from_dict(d) for d in data.get("doors", [])],
            windows=[Window.from_dict(w) for w in data.get("windows", [])],
        )

    def get_room(self, room_id: str) -> Room | None:
        """Get room by ID."""
        for room in self.rooms:
            if room.id == room_id:
                return room
        return None


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
