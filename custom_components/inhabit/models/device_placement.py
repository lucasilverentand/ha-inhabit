"""Device placement data models."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Self

from .floor_plan import Coordinates, _generate_id


def _float_or_none(value: Any) -> float | None:
    """Return a finite-ish float value, preserving missing optional settings."""
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


@dataclass
class _BasePlacement:
    """Base dataclass for all device placements on a floor plan."""

    id: str = field(default_factory=_generate_id)
    entity_id: str = ""
    floor_id: str = ""
    room_id: str | None = None
    position: Coordinates = field(default_factory=lambda: Coordinates(0, 0))
    label: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "entity_id": self.entity_id,
            "floor_id": self.floor_id,
            "room_id": self.room_id,
            "position": self.position.to_dict(),
            "label": self.label,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Self:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            entity_id=data.get("entity_id", ""),
            floor_id=data.get("floor_id", ""),
            room_id=data.get("room_id"),
            position=Coordinates.from_dict(data.get("position", {"x": 0, "y": 0})),
            label=data.get("label"),
        )


@dataclass
class LightPlacement(_BasePlacement):
    """A light entity placed on a floor plan."""

    pass


@dataclass
class SwitchPlacement(_BasePlacement):
    """A switch entity placed on a floor plan."""

    pass


@dataclass
class FanPlacement(_BasePlacement):
    """A fan entity placed on a floor plan."""

    orientation: float = 0.0
    oscillation_start: float | None = None
    oscillation_end: float | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        data = super().to_dict()
        data.update(
            {
                "orientation": self.orientation,
                "oscillation_start": self.oscillation_start,
                "oscillation_end": self.oscillation_end,
            }
        )
        return data

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Self:
        """Create from dictionary."""
        base = super().from_dict(data)
        return cls(
            id=base.id,
            entity_id=base.entity_id,
            floor_id=base.floor_id,
            room_id=base.room_id,
            position=base.position,
            label=base.label,
            orientation=_float_or_none(data.get("orientation")) or 0.0,
            oscillation_start=_float_or_none(data.get("oscillation_start")),
            oscillation_end=_float_or_none(data.get("oscillation_end")),
        )


@dataclass
class ButtonPlacement(_BasePlacement):
    """A button entity placed on a floor plan."""

    pass


@dataclass
class OtherPlacement(_BasePlacement):
    """A generic entity placed on a floor plan."""

    pass
