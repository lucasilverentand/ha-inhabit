"""Device placement data models."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4

from .floor_plan import Coordinates, Polygon


def _generate_id() -> str:
    """Generate a unique ID."""
    return uuid4().hex[:8]


@dataclass
class SensorCoverage:
    """Sensor coverage definition for visualization."""

    type: str = "cone"  # cone, circle, polygon
    angle: float = 90.0  # For cone type
    range: float = 500.0  # Coverage range in floor plan units
    direction: float = 0.0  # Direction in degrees (0 = right, 90 = down)
    polygon: Polygon | None = None  # For custom polygon coverage

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "type": self.type,
            "angle": self.angle,
            "range": self.range,
            "direction": self.direction,
            "polygon": self.polygon.to_dict() if self.polygon else None,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> SensorCoverage:
        """Create from dictionary."""
        polygon_data = data.get("polygon")
        return cls(
            type=data.get("type", "cone"),
            angle=float(data.get("angle", 90.0)),
            range=float(data.get("range", 500.0)),
            direction=float(data.get("direction", 0.0)),
            polygon=Polygon.from_dict(polygon_data) if polygon_data else None,
        )


@dataclass
class DevicePlacement:
    """Device placement on a floor plan."""

    id: str = field(default_factory=_generate_id)
    entity_id: str = ""
    floor_id: str = ""
    room_id: str | None = None
    position: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    rotation: float = 0.0  # Rotation in degrees
    scale: float = 1.0
    label: str | None = None  # Custom label override
    show_state: bool = True
    show_label: bool = False
    coverage: SensorCoverage | None = None
    contributes_to_occupancy: bool = False

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "entity_id": self.entity_id,
            "floor_id": self.floor_id,
            "room_id": self.room_id,
            "position": self.position.to_dict(),
            "rotation": self.rotation,
            "scale": self.scale,
            "label": self.label,
            "show_state": self.show_state,
            "show_label": self.show_label,
            "coverage": self.coverage.to_dict() if self.coverage else None,
            "contributes_to_occupancy": self.contributes_to_occupancy,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> DevicePlacement:
        """Create from dictionary."""
        coverage_data = data.get("coverage")
        return cls(
            id=data.get("id", _generate_id()),
            entity_id=data.get("entity_id", ""),
            floor_id=data.get("floor_id", ""),
            room_id=data.get("room_id"),
            position=Coordinates.from_dict(data.get("position", {"x": 0, "y": 0})),
            rotation=float(data.get("rotation", 0.0)),
            scale=float(data.get("scale", 1.0)),
            label=data.get("label"),
            show_state=data.get("show_state", True),
            show_label=data.get("show_label", False),
            coverage=SensorCoverage.from_dict(coverage_data) if coverage_data else None,
            contributes_to_occupancy=data.get("contributes_to_occupancy", False),
        )


@dataclass
class DevicePlacementCollection:
    """Collection of device placements for a floor plan."""

    floor_plan_id: str = ""
    devices: list[DevicePlacement] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "floor_plan_id": self.floor_plan_id,
            "devices": [d.to_dict() for d in self.devices],
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> DevicePlacementCollection:
        """Create from dictionary."""
        return cls(
            floor_plan_id=data.get("floor_plan_id", ""),
            devices=[DevicePlacement.from_dict(d) for d in data.get("devices", [])],
        )

    def get_device(self, device_id: str) -> DevicePlacement | None:
        """Get device by ID."""
        for device in self.devices:
            if device.id == device_id:
                return device
        return None

    def get_devices_by_entity(self, entity_id: str) -> list[DevicePlacement]:
        """Get all placements for an entity."""
        return [d for d in self.devices if d.entity_id == entity_id]

    def get_devices_in_room(self, room_id: str) -> list[DevicePlacement]:
        """Get all devices placed in a room."""
        return [d for d in self.devices if d.room_id == room_id]

    def get_devices_on_floor(self, floor_id: str) -> list[DevicePlacement]:
        """Get all devices on a floor."""
        return [d for d in self.devices if d.floor_id == floor_id]

    def get_occupancy_contributors(self, room_id: str) -> list[DevicePlacement]:
        """Get devices that contribute to room occupancy."""
        return [
            d
            for d in self.devices
            if d.room_id == room_id and d.contributes_to_occupancy
        ]

    def add_device(self, device: DevicePlacement) -> None:
        """Add a device placement."""
        self.devices.append(device)

    def remove_device(self, device_id: str) -> bool:
        """Remove a device placement. Returns True if found and removed."""
        for i, device in enumerate(self.devices):
            if device.id == device_id:
                self.devices.pop(i)
                return True
        return False

    def update_device(self, device: DevicePlacement) -> bool:
        """Update a device placement. Returns True if found and updated."""
        for i, existing in enumerate(self.devices):
            if existing.id == device.id:
                self.devices[i] = device
                return True
        return False
