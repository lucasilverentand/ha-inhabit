"""mmWave sensor placement model — simplified free-placement with direction/range."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .floor_plan import Coordinates, _generate_id


@dataclass
class MmwavePlacement:
    """An mmWave sensor placed freely on a floor plan."""

    id: str = field(default_factory=_generate_id)
    floor_plan_id: str = ""
    floor_id: str = ""
    room_id: str | None = None
    entity_id: str | None = None
    position: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    angle: float = 0.0  # Facing direction (degrees)
    field_of_view: float = 120.0  # FOV cone (degrees)
    detection_range: float = 500.0  # Max range (canvas units)
    label: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "floor_plan_id": self.floor_plan_id,
            "floor_id": self.floor_id,
            "room_id": self.room_id,
            "entity_id": self.entity_id,
            "position": self.position.to_dict(),
            "angle": self.angle,
            "field_of_view": self.field_of_view,
            "detection_range": self.detection_range,
            "label": self.label,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> MmwavePlacement:
        """Create from dictionary."""
        # Support legacy format with mount_x/mount_y
        position = data.get("position")
        if position is None and ("mount_x" in data or "mount_y" in data):
            position = {"x": data.get("mount_x", 0), "y": data.get("mount_y", 0)}
        return cls(
            id=data.get("id", _generate_id()),
            floor_plan_id=data.get("floor_plan_id", ""),
            floor_id=data.get("floor_id", ""),
            room_id=data.get("room_id"),
            entity_id=data.get("entity_id"),
            position=Coordinates.from_dict(position or {"x": 0, "y": 0}),
            angle=float(data.get("angle", 0.0)),
            field_of_view=float(data.get("field_of_view", 120.0)),
            detection_range=float(data.get("detection_range", 500.0)),
            label=data.get("label"),
        )
