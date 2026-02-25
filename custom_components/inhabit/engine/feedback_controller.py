"""Override feedback controller that records overrides and auto-tunes parameters."""

from __future__ import annotations

import logging
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime
from typing import TYPE_CHECKING, Any

from ..const import EVENT_OVERRIDE_RECORDED, OccupancyState

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

# Adjustment bounds
MIN_CHECKING_TIMEOUT = 10
MAX_CHECKING_TIMEOUT = 300
MIN_MOTION_TIMEOUT = 30
MAX_MOTION_TIMEOUT = 600
MIN_VACANT_THRESHOLD = 0.02
MAX_VACANT_THRESHOLD = 0.3
MIN_OCCUPIED_THRESHOLD = 0.2
MAX_OCCUPIED_THRESHOLD = 0.8
MIN_SEAL_HALF_LIFE = 600  # 10 minutes
MAX_SEAL_HALF_LIFE = 14400  # 4 hours
MIN_COOLDOWN_SECONDS = 600  # 10 min between adjustments per room


@dataclass
class OverrideEvent:
    """Record of an override event."""

    room_id: str
    timestamp: str  # ISO
    override_type: str  # "false_occupancy" or "false_vacancy"
    previous_state: str
    new_state: str
    confidence_at_override: float
    seal_probability_at_override: float
    contributing_sensors: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "room_id": self.room_id,
            "timestamp": self.timestamp,
            "override_type": self.override_type,
            "previous_state": self.previous_state,
            "new_state": self.new_state,
            "confidence_at_override": self.confidence_at_override,
            "seal_probability_at_override": self.seal_probability_at_override,
            "contributing_sensors": list(self.contributing_sensors),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> OverrideEvent:
        """Create from dictionary."""
        return cls(
            room_id=data.get("room_id", ""),
            timestamp=data.get("timestamp", ""),
            override_type=data.get("override_type", ""),
            previous_state=data.get("previous_state", ""),
            new_state=data.get("new_state", ""),
            confidence_at_override=float(data.get("confidence_at_override", 0.0)),
            seal_probability_at_override=float(
                data.get("seal_probability_at_override", 0.0)
            ),
            contributing_sensors=list(data.get("contributing_sensors", [])),
        )


@dataclass
class RoomAdjustmentState:
    """Tracks the current learned adjustments for a room."""

    room_id: str
    checking_timeout_delta: int = 0  # Added to base
    motion_timeout_delta: int = 0  # Added to base
    vacant_threshold_delta: float = 0.0  # Added to base
    occupied_threshold_delta: float = 0.0  # Added to base
    seal_half_life_factor: float = 1.0  # Multiplied with base
    last_adjustment_at: str | None = None  # ISO, for cooldown
    false_occupancy_count: int = 0
    false_vacancy_count: int = 0
    total_overrides: int = 0

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "room_id": self.room_id,
            "checking_timeout_delta": self.checking_timeout_delta,
            "motion_timeout_delta": self.motion_timeout_delta,
            "vacant_threshold_delta": self.vacant_threshold_delta,
            "occupied_threshold_delta": self.occupied_threshold_delta,
            "seal_half_life_factor": self.seal_half_life_factor,
            "last_adjustment_at": self.last_adjustment_at,
            "false_occupancy_count": self.false_occupancy_count,
            "false_vacancy_count": self.false_vacancy_count,
            "total_overrides": self.total_overrides,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> RoomAdjustmentState:
        """Create from dictionary."""
        return cls(
            room_id=data.get("room_id", ""),
            checking_timeout_delta=int(data.get("checking_timeout_delta", 0)),
            motion_timeout_delta=int(data.get("motion_timeout_delta", 0)),
            vacant_threshold_delta=float(data.get("vacant_threshold_delta", 0.0)),
            occupied_threshold_delta=float(data.get("occupied_threshold_delta", 0.0)),
            seal_half_life_factor=float(data.get("seal_half_life_factor", 1.0)),
            last_adjustment_at=data.get("last_adjustment_at"),
            false_occupancy_count=int(data.get("false_occupancy_count", 0)),
            false_vacancy_count=int(data.get("false_vacancy_count", 0)),
            total_overrides=int(data.get("total_overrides", 0)),
        )


class FeedbackController:
    """Central learning coordinator that records overrides and auto-tunes parameters.

    When a user overrides the occupancy state, this controller:
    1. Records the event as a "false_occupancy" or "false_vacancy"
    2. Nudges the room's parameters to prevent the same error:
       - false_occupancy (system said OCCUPIED, user says VACANT):
         Raise vacant_threshold, shorten seal half-life, reduce motion timeout
       - false_vacancy (system said VACANT, user says OCCUPIED):
         Increase checking_timeout, extend seal half-life
    3. Respects cooldown (10 min between adjustments per room) to prevent oscillation
    4. Clamps all adjustments to safe bounds
    """

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the feedback controller."""
        self._hass = hass
        self._override_history: dict[str, deque[OverrideEvent]] = {}
        self._adjustment_states: dict[str, RoomAdjustmentState] = {}

    def record_override(
        self,
        room_id: str,
        previous_state: str,
        new_state: str,
        confidence: float,
        seal_probability: float,
        contributing_sensors: list[str],
    ) -> OverrideEvent | None:
        """Record an override event and apply adjustments.

        Returns the created OverrideEvent, or None if no override detected.
        """
        # Determine override type
        if previous_state in (
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        ) and new_state == OccupancyState.VACANT:
            override_type = "false_occupancy"
        elif previous_state == OccupancyState.VACANT and new_state in (
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        ):
            override_type = "false_vacancy"
        else:
            return None

        event = OverrideEvent(
            room_id=room_id,
            timestamp=datetime.now().isoformat(),
            override_type=override_type,
            previous_state=previous_state,
            new_state=new_state,
            confidence_at_override=confidence,
            seal_probability_at_override=seal_probability,
            contributing_sensors=list(contributing_sensors),
        )

        history = self._override_history.setdefault(room_id, deque(maxlen=100))
        history.append(event)

        state = self._get_or_create_state(room_id)
        state.total_overrides += 1
        if override_type == "false_occupancy":
            state.false_occupancy_count += 1
        else:
            state.false_vacancy_count += 1

        self._apply_adjustments(event)

        # Fire event for external observability
        self._hass.bus.async_fire(
            EVENT_OVERRIDE_RECORDED,
            {
                "room_id": room_id,
                "override_type": override_type,
                "previous_state": previous_state,
                "new_state": new_state,
            },
        )

        return event

    def _apply_adjustments(self, event: OverrideEvent) -> None:
        """Apply parameter nudges based on the override type."""
        state = self._get_or_create_state(event.room_id)

        # Cooldown check
        if state.last_adjustment_at:
            last = datetime.fromisoformat(state.last_adjustment_at)
            if (datetime.now() - last).total_seconds() < MIN_COOLDOWN_SECONDS:
                _LOGGER.debug(
                    "Room %s: skipping adjustment (cooldown active)",
                    event.room_id,
                )
                return

        if event.override_type == "false_occupancy":
            # System was too aggressive -- make it easier to go vacant
            state.vacant_threshold_delta = min(
                MAX_VACANT_THRESHOLD - 0.1,  # delta relative to base
                state.vacant_threshold_delta + 0.02,
            )
            state.seal_half_life_factor = max(
                MIN_SEAL_HALF_LIFE / 3600.0,
                state.seal_half_life_factor * 0.9,
            )
            state.motion_timeout_delta = max(
                MIN_MOTION_TIMEOUT - 120,
                state.motion_timeout_delta - 5,
            )
        elif event.override_type == "false_vacancy":
            # System let it go vacant too easily
            state.checking_timeout_delta = min(
                MAX_CHECKING_TIMEOUT - 30,
                state.checking_timeout_delta + 5,
            )
            state.seal_half_life_factor = min(
                MAX_SEAL_HALF_LIFE / 3600.0,
                state.seal_half_life_factor * 1.1,
            )

        state.last_adjustment_at = datetime.now().isoformat()
        _LOGGER.info(
            "Room %s: applied %s adjustment (vacant_threshold_delta=%.3f, "
            "seal_factor=%.3f, motion_delta=%d, checking_delta=%d)",
            event.room_id,
            event.override_type,
            state.vacant_threshold_delta,
            state.seal_half_life_factor,
            state.motion_timeout_delta,
            state.checking_timeout_delta,
        )

    def get_adjusted_config(self, room_id: str, base_config: dict[str, Any]) -> dict[str, Any]:
        """Apply learned adjustments to a base config dict.

        Returns a new dict with adjusted values (does not modify original).
        """
        state = self._adjustment_states.get(room_id)
        if not state:
            return base_config

        adjusted = dict(base_config)
        adjusted["checking_timeout"] = max(
            MIN_CHECKING_TIMEOUT,
            min(
                MAX_CHECKING_TIMEOUT,
                base_config.get("checking_timeout", 30) + state.checking_timeout_delta,
            ),
        )
        adjusted["motion_timeout"] = max(
            MIN_MOTION_TIMEOUT,
            min(
                MAX_MOTION_TIMEOUT,
                base_config.get("motion_timeout", 120) + state.motion_timeout_delta,
            ),
        )
        adjusted["vacant_threshold"] = max(
            MIN_VACANT_THRESHOLD,
            min(
                MAX_VACANT_THRESHOLD,
                base_config.get("vacant_threshold", 0.1) + state.vacant_threshold_delta,
            ),
        )
        adjusted["occupied_threshold"] = max(
            MIN_OCCUPIED_THRESHOLD,
            min(
                MAX_OCCUPIED_THRESHOLD,
                base_config.get("occupied_threshold", 0.5)
                + state.occupied_threshold_delta,
            ),
        )
        adjusted["seal_half_life"] = max(
            MIN_SEAL_HALF_LIFE,
            min(
                MAX_SEAL_HALF_LIFE,
                int(
                    base_config.get("seal_half_life", 3600)
                    * state.seal_half_life_factor
                ),
            ),
        )
        return adjusted

    def get_adjustment_state(self, room_id: str) -> RoomAdjustmentState | None:
        """Get the current adjustment state for a room."""
        return self._adjustment_states.get(room_id)

    def get_override_history(self, room_id: str) -> list[OverrideEvent]:
        """Get the override history for a room."""
        history = self._override_history.get(room_id)
        if history:
            return list(history)
        return []

    def _get_or_create_state(self, room_id: str) -> RoomAdjustmentState:
        """Get or create an adjustment state for a room."""
        if room_id not in self._adjustment_states:
            self._adjustment_states[room_id] = RoomAdjustmentState(room_id=room_id)
        return self._adjustment_states[room_id]

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save_data(self) -> dict[str, Any]:
        """Serialize all feedback data for persistence."""
        return {
            "override_history": {
                room_id: [e.to_dict() for e in events]
                for room_id, events in self._override_history.items()
            },
            "adjustment_states": {
                room_id: state.to_dict()
                for room_id, state in self._adjustment_states.items()
            },
        }

    def load_data(self, data: dict[str, Any]) -> None:
        """Load persisted feedback data."""
        for room_id, events in data.get("override_history", {}).items():
            self._override_history[room_id] = deque(
                (OverrideEvent.from_dict(e) for e in events), maxlen=100
            )
        for room_id, state_data in data.get("adjustment_states", {}).items():
            self._adjustment_states[room_id] = RoomAdjustmentState.from_dict(
                state_data
            )
