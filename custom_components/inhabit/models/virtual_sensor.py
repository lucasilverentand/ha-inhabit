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

    # Door seal state
    sealed: bool = False
    sealed_since: datetime | None = None
    seal_broken_at: datetime | None = None
    door_states_at_detection: dict[str, bool] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "state": self.state,
            "confidence": self.confidence,
            "last_motion_at": (
                self.last_motion_at.isoformat() if self.last_motion_at else None
            ),
            "last_presence_at": (
                self.last_presence_at.isoformat() if self.last_presence_at else None
            ),
            "last_door_event_at": (
                self.last_door_event_at.isoformat() if self.last_door_event_at else None
            ),
            "checking_started_at": (
                self.checking_started_at.isoformat()
                if self.checking_started_at
                else None
            ),
            "contributing_sensors": self.contributing_sensors,
            "sealed": self.sealed,
            "sealed_since": (
                self.sealed_since.isoformat() if self.sealed_since else None
            ),
            "seal_broken_at": (
                self.seal_broken_at.isoformat() if self.seal_broken_at else None
            ),
            "door_states_at_detection": self.door_states_at_detection,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> OccupancyStateData:
        """Create from dictionary."""
        return cls(
            state=data.get("state", OccupancyState.VACANT),
            confidence=float(data.get("confidence", 0.0)),
            last_motion_at=(
                datetime.fromisoformat(data["last_motion_at"])
                if data.get("last_motion_at")
                else None
            ),
            last_presence_at=(
                datetime.fromisoformat(data["last_presence_at"])
                if data.get("last_presence_at")
                else None
            ),
            last_door_event_at=(
                datetime.fromisoformat(data["last_door_event_at"])
                if data.get("last_door_event_at")
                else None
            ),
            checking_started_at=(
                datetime.fromisoformat(data["checking_started_at"])
                if data.get("checking_started_at")
                else None
            ),
            contributing_sensors=data.get("contributing_sensors", []),
            sealed=data.get("sealed", False),
            sealed_since=(
                datetime.fromisoformat(data["sealed_since"])
                if data.get("sealed_since")
                else None
            ),
            seal_broken_at=(
                datetime.fromisoformat(data["seal_broken_at"])
                if data.get("seal_broken_at")
                else None
            ),
            door_states_at_detection=data.get("door_states_at_detection", {}),
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

    # Spatial presence detection
    presence_affects: bool = False  # Spatial presence targets affect this room/zone

    # Parent room propagation — when occupied, also mark parent room as occupied
    occupies_parent: bool = False
    parent_room_id: str = ""  # Set by engine from Zone.room_id

    # Exit sensors — external sensors that prove the occupant left (e.g. bedroom
    # motion sensor configured as exit sensor for a bed zone).  When hold_until_exit
    # is True, the zone stays OCCUPIED until an exit sensor fires, ignoring its own
    # sensors clearing.
    exit_sensors: list[SensorBinding] = field(default_factory=list)
    hold_until_exit: bool = False

    # Door seal logic
    door_seals_room: bool = True  # Enable door seal (closed doors prevent vacancy)
    seal_max_duration: int = 14400  # Max seconds a seal holds (safety valve, 4h default)
    long_stay: bool = False  # Zone where occupants stay for hours (couch, bed, etc.)

    # Legacy door-aware logic (mapped to door_seals_room on load)
    door_blocks_vacancy: bool = True  # Deprecated: use door_seals_room
    door_open_resets_checking: bool = True  # Deprecated: kept for backward compat

    # Confidence thresholds
    occupied_threshold: float = 0.5  # Minimum confidence to be OCCUPIED
    vacant_threshold: float = 0.1  # Maximum confidence to be VACANT

    @property
    def effective_seal_max_duration(self) -> int:
        """Get effective seal max duration, accounting for long-stay zones."""
        from ..const import DEFAULT_LONG_STAY_SEAL_MAX_DURATION, DEFAULT_SEAL_MAX_DURATION

        if self.long_stay and self.seal_max_duration == DEFAULT_SEAL_MAX_DURATION:
            return DEFAULT_LONG_STAY_SEAL_MAX_DURATION
        return self.seal_max_duration

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
            "exit_sensors": [s.to_dict() for s in self.exit_sensors],
            "hold_until_exit": self.hold_until_exit,
            "occupies_parent": self.occupies_parent,
            "parent_room_id": self.parent_room_id,
            "presence_affects": self.presence_affects,
            "door_seals_room": self.door_seals_room,
            "seal_max_duration": self.seal_max_duration,
            "long_stay": self.long_stay,
            # Legacy fields kept for backward compatibility
            "door_blocks_vacancy": self.door_seals_room,
            "door_open_resets_checking": self.door_open_resets_checking,
            "occupied_threshold": self.occupied_threshold,
            "vacant_threshold": self.vacant_threshold,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> VirtualSensorConfig:
        """Create from dictionary."""
        # Migrate legacy field: door_blocks_vacancy -> door_seals_room
        door_seals_room = data.get("door_seals_room")
        if door_seals_room is None:
            door_seals_room = data.get("door_blocks_vacancy", True)

        return cls(
            room_id=data.get("room_id", ""),
            floor_plan_id=data.get("floor_plan_id", ""),
            enabled=data.get("enabled", True),
            motion_timeout=int(data.get("motion_timeout", 120)),
            checking_timeout=int(data.get("checking_timeout", 30)),
            presence_timeout=int(data.get("presence_timeout", 300)),
            motion_sensors=[
                SensorBinding.from_dict(s) for s in data.get("motion_sensors", [])
            ],
            presence_sensors=[
                SensorBinding.from_dict(s) for s in data.get("presence_sensors", [])
            ],
            door_sensors=[
                SensorBinding.from_dict(s) for s in data.get("door_sensors", [])
            ],
            exit_sensors=[
                SensorBinding.from_dict(s) for s in data.get("exit_sensors", [])
            ],
            hold_until_exit=data.get("hold_until_exit", False),
            occupies_parent=data.get("occupies_parent", False),
            parent_room_id=data.get("parent_room_id", ""),
            presence_affects=data.get("presence_affects", False),
            door_seals_room=door_seals_room,
            seal_max_duration=int(data.get("seal_max_duration", 14400)),
            long_stay=data.get("long_stay", False),
            door_blocks_vacancy=door_seals_room,
            door_open_resets_checking=data.get("door_open_resets_checking", True),
            occupied_threshold=float(data.get("occupied_threshold", 0.5)),
            vacant_threshold=float(data.get("vacant_threshold", 0.1)),
        )

    def get_all_sensor_entity_ids(self) -> list[str]:
        """Get all entity IDs for sensors bound to this room.

        Note: presence_sensors are excluded — presence is now spatial (hitbox-based).
        """
        entity_ids = []
        for binding in self.motion_sensors:
            entity_ids.append(binding.entity_id)
        for binding in self.door_sensors:
            entity_ids.append(binding.entity_id)
        for binding in self.exit_sensors:
            entity_ids.append(binding.entity_id)
        return entity_ids
