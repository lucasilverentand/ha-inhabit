"""mmWave sensor placement model — simplified free-placement with direction/range."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .floor_plan import Coordinates, _generate_id


@dataclass
class MmwaveCalibrationPoint:
    """One measured calibration point for a placed mmWave sensor."""

    target_index: int = 0
    map_point: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    raw_mean: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    raw_stddev: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    raw_bias: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    sample_count: int = 0

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "target_index": self.target_index,
            "map_point": self.map_point.to_dict(),
            "raw_mean": self.raw_mean.to_dict(),
            "raw_stddev": self.raw_stddev.to_dict(),
            "raw_bias": self.raw_bias.to_dict(),
            "sample_count": self.sample_count,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> MmwaveCalibrationPoint:
        """Create from dictionary."""
        return cls(
            target_index=int(data.get("target_index", 0)),
            map_point=Coordinates.from_dict(data.get("map_point") or {"x": 0, "y": 0}),
            raw_mean=Coordinates.from_dict(data.get("raw_mean") or {"x": 0, "y": 0}),
            raw_stddev=Coordinates.from_dict(
                data.get("raw_stddev") or {"x": 0, "y": 0}
            ),
            raw_bias=Coordinates.from_dict(data.get("raw_bias") or {"x": 0, "y": 0}),
            sample_count=int(data.get("sample_count", 0)),
        )


@dataclass
class MmwaveCalibrationTransform:
    """Raw sensor x/y to floor-plan world transform."""

    type: str = "affine"
    a: float = 1.0
    b: float = 0.0
    c: float = 0.0
    d: float = 0.0
    e: float = 1.0
    f: float = 0.0
    residual_error: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "type": self.type,
            "a": self.a,
            "b": self.b,
            "c": self.c,
            "d": self.d,
            "e": self.e,
            "f": self.f,
            "residual_error": self.residual_error,
        }

    @classmethod
    def from_dict(
        cls, data: dict[str, Any] | None
    ) -> MmwaveCalibrationTransform | None:
        """Create from dictionary."""
        if not data:
            return None
        return cls(
            type=str(data.get("type", "affine")),
            a=float(data.get("a", 1.0)),
            b=float(data.get("b", 0.0)),
            c=float(data.get("c", 0.0)),
            d=float(data.get("d", 0.0)),
            e=float(data.get("e", 1.0)),
            f=float(data.get("f", 0.0)),
            residual_error=float(data.get("residual_error", 0.0)),
        )


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
    points: list[MmwaveCalibrationPoint] = field(default_factory=list)
    world_transform: MmwaveCalibrationTransform | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        result = {
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
        if self.points:
            result["points"] = [point.to_dict() for point in self.points]
        if self.world_transform:
            result["world_transform"] = self.world_transform.to_dict()
        return result

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> MmwaveCalibration | None:
        """Create from dictionary."""
        if not data:
            return None

        points = [
            MmwaveCalibrationPoint.from_dict(point)
            for point in data.get("points", [])
            if isinstance(point, dict)
        ]

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
            points=points,
            world_transform=MmwaveCalibrationTransform.from_dict(
                data.get("world_transform")
            ),
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
