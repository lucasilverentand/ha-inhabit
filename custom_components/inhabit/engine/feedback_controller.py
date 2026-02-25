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


@dataclass
class ThresholdState:
    """Per-room auto-tuned thresholds.

    Thresholds are adjusted based on false positive / false negative
    rates observed over time. Tuning only kicks in after a minimum
    of 20 transitions to avoid premature adjustments.
    """

    room_id: str
    occupied_threshold: float = 0.5
    vacant_threshold: float = 0.1
    false_positive_count: int = 0  # system said OCCUPIED, wrong
    false_negative_count: int = 0  # system said VACANT, wrong
    total_transitions: int = 0

    @property
    def false_positive_rate(self) -> float:
        if self.total_transitions == 0:
            return 0.0
        return self.false_positive_count / self.total_transitions

    @property
    def false_negative_rate(self) -> float:
        if self.total_transitions == 0:
            return 0.0
        return self.false_negative_count / self.total_transitions

    def to_dict(self) -> dict[str, Any]:
        return {
            "room_id": self.room_id,
            "occupied_threshold": self.occupied_threshold,
            "vacant_threshold": self.vacant_threshold,
            "false_positive_count": self.false_positive_count,
            "false_negative_count": self.false_negative_count,
            "total_transitions": self.total_transitions,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ThresholdState:
        return cls(
            room_id=data.get("room_id", ""),
            occupied_threshold=float(data.get("occupied_threshold", 0.5)),
            vacant_threshold=float(data.get("vacant_threshold", 0.1)),
            false_positive_count=int(data.get("false_positive_count", 0)),
            false_negative_count=int(data.get("false_negative_count", 0)),
            total_transitions=int(data.get("total_transitions", 0)),
        )


# Threshold tuning constants
THRESHOLD_TUNING_MIN_TRANSITIONS = 20
THRESHOLD_OCCUPIED_STEP = 0.02
THRESHOLD_VACANT_STEP = 0.02

# Seal accuracy tuning constants
SEAL_ACCURACY_MIN_EVENTS = 10  # Minimum events before adjusting half-life
SEAL_HALF_LIFE_ADJUST_FACTOR = 0.1  # 10% adjustment per tuning call


@dataclass
class SealAccuracyTracker:
    """Tracks seal accuracy outcomes per room.

    false_seal: The room was sealed but the user overrode to VACANT
        (the seal kept someone falsely trapped as OCCUPIED).
    false_break: The seal was broken and the room went VACANT, but
        the user overrode back to OCCUPIED shortly after (the occupant
        was still inside -- the seal should have held).
    correct_seal: The seal correctly held occupancy (seal expired or
        door opened and room naturally went vacant without override).
    correct_break: The seal was correctly broken and the room went
        vacant as expected.
    """

    room_id: str
    false_seal_count: int = 0
    false_break_count: int = 0
    correct_seal_count: int = 0
    correct_break_count: int = 0
    adjusted_half_life: float | None = None  # None means use default

    @property
    def total_events(self) -> int:
        """Total number of seal-related events."""
        return (
            self.false_seal_count
            + self.false_break_count
            + self.correct_seal_count
            + self.correct_break_count
        )

    @property
    def seal_accuracy(self) -> float:
        """0.0-1.0 accuracy of seal decisions. New rooms return 1.0."""
        if self.total_events == 0:
            return 1.0
        correct = self.correct_seal_count + self.correct_break_count
        return correct / self.total_events

    @property
    def false_seal_rate(self) -> float:
        """Rate of false seals (seal held when it shouldn't have)."""
        if self.total_events == 0:
            return 0.0
        return self.false_seal_count / self.total_events

    @property
    def false_break_rate(self) -> float:
        """Rate of false breaks (seal broken when it should have held)."""
        if self.total_events == 0:
            return 0.0
        return self.false_break_count / self.total_events

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "room_id": self.room_id,
            "false_seal_count": self.false_seal_count,
            "false_break_count": self.false_break_count,
            "correct_seal_count": self.correct_seal_count,
            "correct_break_count": self.correct_break_count,
            "adjusted_half_life": self.adjusted_half_life,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> SealAccuracyTracker:
        """Create from dictionary."""
        return cls(
            room_id=data.get("room_id", ""),
            false_seal_count=int(data.get("false_seal_count", 0)),
            false_break_count=int(data.get("false_break_count", 0)),
            correct_seal_count=int(data.get("correct_seal_count", 0)),
            correct_break_count=int(data.get("correct_break_count", 0)),
            adjusted_half_life=(
                float(data["adjusted_half_life"])
                if data.get("adjusted_half_life") is not None
                else None
            ),
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
        self._threshold_states: dict[str, ThresholdState] = {}
        self._seal_accuracy: dict[str, SealAccuracyTracker] = {}

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

        # Update threshold tuning state
        ts = self._get_or_create_threshold_state(room_id)
        if override_type == "false_occupancy":
            ts.false_positive_count += 1
        else:
            ts.false_negative_count += 1
        self.tune_thresholds(room_id)

        # Update seal accuracy tracking
        if override_type == "false_occupancy" and seal_probability > 0.0:
            # Room was sealed and user overrode to VACANT -> false seal
            self.record_seal_override(room_id)
        elif override_type == "false_vacancy":
            # Room went VACANT but user says OCCUPIED -> possible false break
            self.record_seal_break_reoccupancy(room_id)

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
    # Threshold auto-tuning
    # ------------------------------------------------------------------

    def _get_or_create_threshold_state(self, room_id: str) -> ThresholdState:
        """Get or create a threshold state for a room."""
        if room_id not in self._threshold_states:
            self._threshold_states[room_id] = ThresholdState(room_id=room_id)
        return self._threshold_states[room_id]

    def get_threshold_state(self, room_id: str) -> ThresholdState | None:
        """Get the current threshold state for a room."""
        return self._threshold_states.get(room_id)

    def record_transition(self, room_id: str) -> None:
        """Record a normal transition for threshold tuning stats."""
        ts = self._get_or_create_threshold_state(room_id)
        ts.total_transitions += 1

    def tune_thresholds(self, room_id: str) -> None:
        """Auto-tune occupied/vacant thresholds based on override history.

        Called after overrides or false vacancy detections.

        - High false positive rate -> raise occupied_threshold (+0.02 per event)
        - High false negative rate -> lower vacant_threshold (-0.02 per event)
        - Minimum 20 transitions before tuning kicks in
        - Thresholds clamped to safe bounds
        """
        ts = self._get_or_create_threshold_state(room_id)

        if ts.total_transitions < THRESHOLD_TUNING_MIN_TRANSITIONS:
            _LOGGER.debug(
                "Room %s: threshold tuning skipped (%d transitions < %d min)",
                room_id,
                ts.total_transitions,
                THRESHOLD_TUNING_MIN_TRANSITIONS,
            )
            return

        # High false positive rate -> raise occupied_threshold
        if ts.false_positive_count > 0:
            ts.occupied_threshold = min(
                MAX_OCCUPIED_THRESHOLD,
                ts.occupied_threshold + THRESHOLD_OCCUPIED_STEP,
            )
            _LOGGER.debug(
                "Room %s: raised occupied_threshold to %.3f (FP rate: %.3f)",
                room_id,
                ts.occupied_threshold,
                ts.false_positive_rate,
            )

        # High false negative rate -> lower vacant_threshold
        if ts.false_negative_count > 0:
            ts.vacant_threshold = max(
                MIN_VACANT_THRESHOLD,
                ts.vacant_threshold - THRESHOLD_VACANT_STEP,
            )
            _LOGGER.debug(
                "Room %s: lowered vacant_threshold to %.3f (FN rate: %.3f)",
                room_id,
                ts.vacant_threshold,
                ts.false_negative_rate,
            )

    # ------------------------------------------------------------------
    # Seal accuracy learning
    # ------------------------------------------------------------------

    def _get_or_create_seal_accuracy(self, room_id: str) -> SealAccuracyTracker:
        """Get or create a seal accuracy tracker for a room."""
        if room_id not in self._seal_accuracy:
            self._seal_accuracy[room_id] = SealAccuracyTracker(room_id=room_id)
        return self._seal_accuracy[room_id]

    def record_seal_override(self, room_id: str) -> None:
        """Record a false seal event (seal held but user says VACANT).

        This means the seal was too aggressive -- the half-life should
        be shortened so the seal decays faster.
        """
        tracker = self._get_or_create_seal_accuracy(room_id)
        tracker.false_seal_count += 1
        self._tune_seal_half_life(room_id)
        _LOGGER.info(
            "Room %s: false seal recorded (total: %d)",
            room_id,
            tracker.false_seal_count,
        )

    def record_seal_break_reoccupancy(self, room_id: str) -> None:
        """Record a false break event (seal broke but person was still inside).

        This means the seal broke too easily -- the half-life should
        be lengthened so the seal decays more slowly.
        """
        tracker = self._get_or_create_seal_accuracy(room_id)
        tracker.false_break_count += 1
        self._tune_seal_half_life(room_id)
        _LOGGER.info(
            "Room %s: false break recorded (total: %d)",
            room_id,
            tracker.false_break_count,
        )

    def record_seal_correct(self, room_id: str, was_sealed: bool) -> None:
        """Record a correct seal outcome.

        Args:
            room_id: Room identifier.
            was_sealed: True if the room was sealed (correct_seal),
                        False if the seal was correctly broken (correct_break).
        """
        tracker = self._get_or_create_seal_accuracy(room_id)
        if was_sealed:
            tracker.correct_seal_count += 1
        else:
            tracker.correct_break_count += 1

    def get_seal_accuracy(self, room_id: str) -> SealAccuracyTracker | None:
        """Get the seal accuracy tracker for a room."""
        return self._seal_accuracy.get(room_id)

    def get_adjusted_seal_half_life(
        self, room_id: str, base_half_life: float
    ) -> float:
        """Get the adjusted seal half-life for a room.

        Returns the learned half-life if available, otherwise base_half_life.
        Always clamped to [MIN_SEAL_HALF_LIFE, MAX_SEAL_HALF_LIFE].
        """
        tracker = self._seal_accuracy.get(room_id)
        if tracker and tracker.adjusted_half_life is not None:
            return max(
                MIN_SEAL_HALF_LIFE,
                min(MAX_SEAL_HALF_LIFE, tracker.adjusted_half_life),
            )
        return max(
            MIN_SEAL_HALF_LIFE,
            min(MAX_SEAL_HALF_LIFE, base_half_life),
        )

    def _tune_seal_half_life(self, room_id: str) -> None:
        """Auto-tune the seal half-life based on false seal/break rates.

        - High false_seal_rate -> shorten half-life (seal decays faster)
        - High false_break_rate -> lengthen half-life (seal holds longer)
        - Minimum SEAL_ACCURACY_MIN_EVENTS before tuning kicks in
        - Half-life clamped to [MIN_SEAL_HALF_LIFE, MAX_SEAL_HALF_LIFE]
        """
        tracker = self._get_or_create_seal_accuracy(room_id)

        if tracker.total_events < SEAL_ACCURACY_MIN_EVENTS:
            _LOGGER.debug(
                "Room %s: seal tuning skipped (%d events < %d min)",
                room_id,
                tracker.total_events,
                SEAL_ACCURACY_MIN_EVENTS,
            )
            return

        # Start from current adjusted value or default (3600s = 1 hour)
        current = tracker.adjusted_half_life if tracker.adjusted_half_life is not None else 3600.0

        if tracker.false_seal_count > tracker.false_break_count:
            # Too many false seals -> shorten half-life
            current *= (1.0 - SEAL_HALF_LIFE_ADJUST_FACTOR)
        elif tracker.false_break_count > tracker.false_seal_count:
            # Too many false breaks -> lengthen half-life
            current *= (1.0 + SEAL_HALF_LIFE_ADJUST_FACTOR)

        # Clamp to bounds
        tracker.adjusted_half_life = max(
            float(MIN_SEAL_HALF_LIFE),
            min(float(MAX_SEAL_HALF_LIFE), current),
        )

        _LOGGER.info(
            "Room %s: seal half-life tuned to %.0fs (accuracy=%.2f, "
            "false_seal=%d, false_break=%d)",
            room_id,
            tracker.adjusted_half_life,
            tracker.seal_accuracy,
            tracker.false_seal_count,
            tracker.false_break_count,
        )

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
            "threshold_states": {
                room_id: state.to_dict()
                for room_id, state in self._threshold_states.items()
            },
            "seal_accuracy": {
                room_id: tracker.to_dict()
                for room_id, tracker in self._seal_accuracy.items()
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
        for room_id, state_data in data.get("threshold_states", {}).items():
            self._threshold_states[room_id] = ThresholdState.from_dict(
                state_data
            )
        for room_id, tracker_data in data.get("seal_accuracy", {}).items():
            self._seal_accuracy[room_id] = SealAccuracyTracker.from_dict(
                tracker_data
            )
