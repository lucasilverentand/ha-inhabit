"""mmWave sensor placement model — simplified free-placement with direction/range."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .floor_plan import Coordinates, _generate_id


@dataclass
class MmwaveCalibration:
    """Calibration metadata for a placed mmWave sensor."""

    enabled: bool = True
    target_index: int = 0
    map_point: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    raw_mean: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    raw_stddev: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    raw_bias: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    jitter_radius: float = 0.0
    sample_count: int = 0
    calibrated_at: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "enabled": self.enabled,
            "target_index": self.target_index,
            "map_point": self.map_point.to_dict(),
            "raw_mean": self.raw_mean.to_dict(),
            "raw_stddev": self.raw_stddev.to_dict(),
            "raw_bias": self.raw_bias.to_dict(),
            "jitter_radius": self.jitter_radius,
            "sample_count": self.sample_count,
            "calibrated_at": self.calibrated_at,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> MmwaveCalibration | None:
        """Create from dictionary."""
        if not data:
            return None

        return cls(
            enabled=bool(data.get("enabled", True)),
            target_index=int(data.get("target_index", 0)),
            map_point=Coordinates.from_dict(data.get("map_point") or {"x": 0, "y": 0}),
            raw_mean=Coordinates.from_dict(data.get("raw_mean") or {"x": 0, "y": 0}),
            raw_stddev=Coordinates.from_dict(
                data.get("raw_stddev") or {"x": 0, "y": 0}
            ),
            raw_bias=Coordinates.from_dict(data.get("raw_bias") or {"x": 0, "y": 0}),
            jitter_radius=float(data.get("jitter_radius", 0.0)),
            sample_count=int(data.get("sample_count", 0)),
            calibrated_at=data.get("calibrated_at"),
        )


@dataclass
class MmwavePlacement:
    """An mmWave sensor placed freely on a floor plan."""

    id: str = field(default_factory=_generate_id)
    floor_plan_id: str = ""
    floor_id: str = ""
    room_id: str | None = None
    position: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    angle: float = 0.0  # Facing direction (degrees)
    field_of_view: float = 120.0  # FOV cone (degrees)
    detection_range: float = 500.0  # Max range (canvas units)
    label: str | None = None
    targets: list[dict[str, str]] = field(default_factory=list)
    calibration: MmwaveCalibration | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        result = {
            "id": self.id,
            "floor_plan_id": self.floor_plan_id,
            "floor_id": self.floor_id,
            "room_id": self.room_id,
            "position": self.position.to_dict(),
            "angle": self.angle,
            "field_of_view": self.field_of_view,
            "detection_range": self.detection_range,
            "label": self.label,
            "targets": self.targets,
        }
        if self.calibration:
            result["calibration"] = self.calibration.to_dict()
        return result

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
            position=Coordinates.from_dict(position or {"x": 0, "y": 0}),
            angle=float(data.get("angle", 0.0)),
            field_of_view=float(data.get("field_of_view", 120.0)),
            detection_range=float(data.get("detection_range", 500.0)),
            label=data.get("label"),
            targets=data.get("targets", []),
            calibration=MmwaveCalibration.from_dict(data.get("calibration")),
        )
