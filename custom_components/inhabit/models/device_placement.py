"""Device placement data models — typed placements for lights and switches."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .floor_plan import Coordinates, _generate_id


@dataclass
class LightPlacement:
    """A light entity placed on a floor plan."""

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
    def from_dict(cls, data: dict[str, Any]) -> LightPlacement:
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
class SwitchPlacement:
    """A switch entity placed on a floor plan."""

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
    def from_dict(cls, data: dict[str, Any]) -> SwitchPlacement:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            entity_id=data.get("entity_id", ""),
            floor_id=data.get("floor_id", ""),
            room_id=data.get("room_id"),
            position=Coordinates.from_dict(data.get("position", {"x": 0, "y": 0})),
            label=data.get("label"),
        )
