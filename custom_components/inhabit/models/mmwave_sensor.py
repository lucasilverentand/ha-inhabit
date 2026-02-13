"""mmWave sensor placement and target mapping models."""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any

from .floor_plan import _generate_id


@dataclass
class MmwaveTargetMapping:
    """Maps a target index to its x/y entity IDs."""

    target_index: int = 0
    x_entity_id: str = ""
    y_entity_id: str = ""

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "target_index": self.target_index,
            "x_entity_id": self.x_entity_id,
            "y_entity_id": self.y_entity_id,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> MmwaveTargetMapping:
        """Create from dictionary."""
        return cls(
            target_index=int(data.get("target_index", 0)),
            x_entity_id=data.get("x_entity_id", ""),
            y_entity_id=data.get("y_entity_id", ""),
        )


@dataclass
class MmwavePlacement:
    """An mmWave sensor placed on a wall edge."""

    id: str = field(default_factory=_generate_id)
    floor_plan_id: str = ""
    floor_id: str = ""
    edge_id: str = ""
    position_on_edge: float = 0.5  # 0.0-1.0 along the edge
    angle: float = 0.0  # Offset from wall normal (degrees)
    field_of_view: float = 120.0  # FOV cone (degrees)
    detection_range: float = 500.0  # Max range (cm)
    target_mappings: list[MmwaveTargetMapping] = field(default_factory=list)

    # Computed from edge geometry at load time
    mount_x: float = 0.0
    mount_y: float = 0.0
    wall_normal_angle: float = 0.0

    def compute_mount_position(
        self,
        start_x: float,
        start_y: float,
        end_x: float,
        end_y: float,
    ) -> None:
        """Compute mount position and wall normal from edge endpoints."""
        t = self.position_on_edge
        self.mount_x = start_x + t * (end_x - start_x)
        self.mount_y = start_y + t * (end_y - start_y)

        # Wall direction angle
        dx = end_x - start_x
        dy = end_y - start_y
        wall_angle = math.atan2(dy, dx)
        # Normal points "inward" (rotate -90deg from wall direction)
        self.wall_normal_angle = math.degrees(wall_angle - math.pi / 2)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "floor_plan_id": self.floor_plan_id,
            "floor_id": self.floor_id,
            "edge_id": self.edge_id,
            "position_on_edge": self.position_on_edge,
            "angle": self.angle,
            "field_of_view": self.field_of_view,
            "detection_range": self.detection_range,
            "target_mappings": [m.to_dict() for m in self.target_mappings],
            "mount_x": self.mount_x,
            "mount_y": self.mount_y,
            "wall_normal_angle": self.wall_normal_angle,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> MmwavePlacement:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            floor_plan_id=data.get("floor_plan_id", ""),
            floor_id=data.get("floor_id", ""),
            edge_id=data.get("edge_id", ""),
            position_on_edge=float(data.get("position_on_edge", 0.5)),
            angle=float(data.get("angle", 0.0)),
            field_of_view=float(data.get("field_of_view", 120.0)),
            detection_range=float(data.get("detection_range", 500.0)),
            target_mappings=[
                MmwaveTargetMapping.from_dict(m)
                for m in data.get("target_mappings", [])
            ],
            mount_x=float(data.get("mount_x", 0.0)),
            mount_y=float(data.get("mount_y", 0.0)),
            wall_normal_angle=float(data.get("wall_normal_angle", 0.0)),
        )
