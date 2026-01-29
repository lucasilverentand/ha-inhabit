"""Virtual sensor configuration and state models."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from ..const import OccupancyState


@dataclass
class OccupancyStateData:
    """Current state data for an occupancy state machine."""

    state: str = OccupancyState.VACANT
    confidence: float = 0.0  # 0.0-1.0 confidence in occupancy
    last_motion_at: datetime | None = None
    last_presence_at: datetime | None = None
    last_door_event_at: datetime | None = None
    checking_started_at: datetime | None = None
    contributing_sensors: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "state": self.state,
            "confidence": self.confidence,
            "last_motion_at": self.last_motion_at.isoformat() if self.last_motion_at else None,
            "last_presence_at": self.last_presence_at.isoformat() if self.last_presence_at else None,
            "last_door_event_at": self.last_door_event_at.isoformat() if self.last_door_event_at else None,
            "checking_started_at": self.checking_started_at.isoformat() if self.checking_started_at else None,
            "contributing_sensors": self.contributing_sensors,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> OccupancyStateData:
        """Create from dictionary."""
        return cls(
            state=data.get("state", OccupancyState.VACANT),
            confidence=float(data.get("confidence", 0.0)),
            last_motion_at=datetime.fromisoformat(data["last_motion_at"]) if data.get("last_motion_at") else None,
            last_presence_at=datetime.fromisoformat(data["last_presence_at"]) if data.get("last_presence_at") else None,
            last_door_event_at=datetime.fromisoformat(data["last_door_event_at"]) if data.get("last_door_event_at") else None,
            checking_started_at=datetime.fromisoformat(data["checking_started_at"]) if data.get("checking_started_at") else None,
            contributing_sensors=data.get("contributing_sensors", []),
        )


@dataclass
class SensorBinding:
    """Binding between a physical sensor and a room."""

    entity_id: str
    sensor_type: str  # motion, presence, door
    weight: float = 1.0  # Contribution weight to occupancy confidence
    inverted: bool = False  # For sensors where "on" means no presence

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "entity_id": self.entity_id,
            "sensor_type": self.sensor_type,
            "weight": self.weight,
            "inverted": self.inverted,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> SensorBinding:
        """Create from dictionary."""
        return cls(
            entity_id=data.get("entity_id", ""),
            sensor_type=data.get("sensor_type", "motion"),
            weight=float(data.get("weight", 1.0)),
            inverted=bool(data.get("inverted", False)),
        )


@dataclass
class VirtualSensorConfig:
    """Configuration for a virtual occupancy sensor."""

    room_id: str = ""
    floor_plan_id: str = ""
    enabled: bool = True

    # Timing configuration
    motion_timeout: int = 120  # Seconds after last motion to start CHECKING
    checking_timeout: int = 30  # Seconds in CHECKING before VACANT
    presence_timeout: int = 300  # Seconds to trust presence sensor alone

    # Sensor bindings
    motion_sensors: list[SensorBinding] = field(default_factory=list)
    presence_sensors: list[SensorBinding] = field(default_factory=list)
    door_sensors: list[SensorBinding] = field(default_factory=list)

    # Door-aware logic
    door_blocks_vacancy: bool = True  # Closed door prevents VACANT transition
    door_open_resets_checking: bool = True  # Door opening resets CHECKING timer

    # Confidence thresholds
    occupied_threshold: float = 0.5  # Minimum confidence to be OCCUPIED
    vacant_threshold: float = 0.1  # Maximum confidence to be VACANT

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "room_id": self.room_id,
            "floor_plan_id": self.floor_plan_id,
            "enabled": self.enabled,
            "motion_timeout": self.motion_timeout,
            "checking_timeout": self.checking_timeout,
            "presence_timeout": self.presence_timeout,
            "motion_sensors": [s.to_dict() for s in self.motion_sensors],
            "presence_sensors": [s.to_dict() for s in self.presence_sensors],
            "door_sensors": [s.to_dict() for s in self.door_sensors],
            "door_blocks_vacancy": self.door_blocks_vacancy,
            "door_open_resets_checking": self.door_open_resets_checking,
            "occupied_threshold": self.occupied_threshold,
            "vacant_threshold": self.vacant_threshold,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> VirtualSensorConfig:
        """Create from dictionary."""
        return cls(
            room_id=data.get("room_id", ""),
            floor_plan_id=data.get("floor_plan_id", ""),
            enabled=data.get("enabled", True),
            motion_timeout=int(data.get("motion_timeout", 120)),
            checking_timeout=int(data.get("checking_timeout", 30)),
            presence_timeout=int(data.get("presence_timeout", 300)),
            motion_sensors=[SensorBinding.from_dict(s) for s in data.get("motion_sensors", [])],
            presence_sensors=[SensorBinding.from_dict(s) for s in data.get("presence_sensors", [])],
            door_sensors=[SensorBinding.from_dict(s) for s in data.get("door_sensors", [])],
            door_blocks_vacancy=data.get("door_blocks_vacancy", True),
            door_open_resets_checking=data.get("door_open_resets_checking", True),
            occupied_threshold=float(data.get("occupied_threshold", 0.5)),
            vacant_threshold=float(data.get("vacant_threshold", 0.1)),
        )

    def get_all_sensor_entity_ids(self) -> list[str]:
        """Get all entity IDs for sensors bound to this room."""
        entity_ids = []
        for binding in self.motion_sensors:
            entity_ids.append(binding.entity_id)
        for binding in self.presence_sensors:
            entity_ids.append(binding.entity_id)
        for binding in self.door_sensors:
            entity_ids.append(binding.entity_id)
        return entity_ids
