"""Zone data model for zones on the floor plan."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .floor_plan import Polygon, _generate_id


@dataclass
class Zone:
    """Zone within a floor — a named polygonal area."""

    id: str = field(default_factory=_generate_id)
    name: str = ""
    floor_id: str = ""
    room_id: str | None = None
    polygon: Polygon = field(default_factory=Polygon)
    color: str = "#e0e0e0"
    rotation: float = 0.0
    ha_area_id: str | None = None
    occupancy_sensor_enabled: bool = False
    motion_timeout: int = 120
    checking_timeout: int = 30

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "floor_id": self.floor_id,
            "room_id": self.room_id,
            "polygon": self.polygon.to_dict(),
            "color": self.color,
            "rotation": self.rotation,
            "ha_area_id": self.ha_area_id,
            "occupancy_sensor_enabled": self.occupancy_sensor_enabled,
            "motion_timeout": self.motion_timeout,
            "checking_timeout": self.checking_timeout,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Zone:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            name=data.get("name", ""),
            floor_id=data.get("floor_id", ""),
            room_id=data.get("room_id"),
            polygon=Polygon.from_dict(data.get("polygon", {})),
            color=data.get("color", "#e0e0e0"),
            rotation=float(data.get("rotation", 0.0)),
            ha_area_id=data.get("ha_area_id"),
            occupancy_sensor_enabled=data.get("occupancy_sensor_enabled", False),
            motion_timeout=int(data.get("motion_timeout", 120)),
            checking_timeout=int(data.get("checking_timeout", 30)),
        )
