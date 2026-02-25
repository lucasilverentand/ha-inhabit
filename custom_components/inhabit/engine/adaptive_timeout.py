"""Adaptive timeout manager that learns from occupancy patterns."""

from __future__ import annotations

import logging
import statistics
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

# Adaptive learning constants
MAX_SESSION_HISTORY = 200
MIN_SESSIONS_FOR_ADAPTIVE = 5
ADAPTIVE_MIN_TIMEOUT = 10  # seconds
ADAPTIVE_MAX_TIMEOUT = 600  # 10 minutes
HOUR_WINDOW_SIZE = 4  # hours per window


@dataclass
class TimeOfDayProfile:
    """Timeout overrides for a time window."""

    start_hour: int  # 0-23
    end_hour: int  # 0-23
    checking_timeout: int | None = None
    motion_timeout: int | None = None

    def matches(self, hour: int) -> bool:
        """Check if the given hour falls within this profile's time window.

        Handles windows that span midnight (e.g. start_hour=22, end_hour=6).
        """
        if self.start_hour <= self.end_hour:
            # Simple range: e.g. 8-17
            return self.start_hour <= hour < self.end_hour
        else:
            # Spans midnight: e.g. 22-6 means 22,23,0,1,2,3,4,5
            return hour >= self.start_hour or hour < self.end_hour

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "start_hour": self.start_hour,
            "end_hour": self.end_hour,
            "checking_timeout": self.checking_timeout,
            "motion_timeout": self.motion_timeout,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> TimeOfDayProfile:
        """Create from dictionary."""
        return cls(
            start_hour=int(data.get("start_hour", 0)),
            end_hour=int(data.get("end_hour", 0)),
            checking_timeout=(
                int(data["checking_timeout"])
                if data.get("checking_timeout") is not None
                else None
            ),
            motion_timeout=(
                int(data["motion_timeout"])
                if data.get("motion_timeout") is not None
                else None
            ),
        )


@dataclass
class OccupancyDurationRecord:
    """Record of a completed occupancy session."""

    room_id: str
    started_at: str  # ISO format
    ended_at: str  # ISO format
    duration_seconds: float
    hour_of_day: int

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "room_id": self.room_id,
            "started_at": self.started_at,
            "ended_at": self.ended_at,
            "duration_seconds": self.duration_seconds,
            "hour_of_day": self.hour_of_day,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> OccupancyDurationRecord:
        """Create from dictionary."""
        return cls(
            room_id=data.get("room_id", ""),
            started_at=data.get("started_at", ""),
            ended_at=data.get("ended_at", ""),
            duration_seconds=float(data.get("duration_seconds", 0.0)),
            hour_of_day=int(data.get("hour_of_day", 0)),
        )


def _hour_to_window(hour: int) -> int:
    """Map an hour (0-23) to its 4-hour window start.

    Windows: 0-3, 4-7, 8-11, 12-15, 16-19, 20-23
    """
    return (hour // HOUR_WINDOW_SIZE) * HOUR_WINDOW_SIZE


class AdaptiveTimeoutManager:
    """Manages adaptive timeouts that learn from occupancy patterns.

    Supports time-of-day profiles (explicit user overrides) and adaptive
    learning from historical occupancy sessions.

    Priority for timeout resolution:
        1. Time-of-day profile override (if current time matches)
        2. Learned median from historical sessions (if adaptive and enough data)
        3. Base timeout (fallback)
    """

    def __init__(
        self,
        hass: HomeAssistant,
        room_id: str,
        base_checking_timeout: int,
        base_motion_timeout: int,
        time_of_day_profiles: list[TimeOfDayProfile] | None = None,
        adaptive_enabled: bool = False,
    ) -> None:
        """Initialize the adaptive timeout manager.

        Args:
            hass: Home Assistant instance.
            room_id: Room identifier.
            base_checking_timeout: Default checking timeout in seconds.
            base_motion_timeout: Default motion timeout in seconds.
            time_of_day_profiles: Optional list of time-of-day overrides.
            adaptive_enabled: Whether adaptive learning is enabled.
        """
        self._hass = hass
        self._room_id = room_id
        self._base_checking_timeout = base_checking_timeout
        self._base_motion_timeout = base_motion_timeout
        self._time_of_day_profiles = time_of_day_profiles or []
        self._adaptive_enabled = adaptive_enabled
        self._session_history: deque[OccupancyDurationRecord] = deque(
            maxlen=MAX_SESSION_HISTORY
        )

    @property
    def room_id(self) -> str:
        """Get the room ID."""
        return self._room_id

    def record_occupancy_session(
        self, started_at: datetime, ended_at: datetime
    ) -> None:
        """Record a completed occupancy session for learning.

        Args:
            started_at: When the occupancy session started.
            ended_at: When the occupancy session ended.
        """
        duration = (ended_at - started_at).total_seconds()
        if duration <= 0:
            return

        record = OccupancyDurationRecord(
            room_id=self._room_id,
            started_at=started_at.isoformat(),
            ended_at=ended_at.isoformat(),
            duration_seconds=duration,
            hour_of_day=started_at.hour,
        )

        self._session_history.append(record)
        _LOGGER.debug(
            "Room %s: recorded occupancy session (%.0fs, hour=%d, total=%d)",
            self._room_id,
            duration,
            started_at.hour,
            len(self._session_history),
        )

    def get_effective_checking_timeout(self) -> int:
        """Get timeout adjusted for time-of-day and learned patterns.

        Priority:
            1. Time-of-day profile override (first match wins)
            2. Learned median from historical sessions for current hour window
            3. Base checking_timeout (fallback)
        """
        now = datetime.now()
        current_hour = now.hour

        # 1. Time-of-day profile override
        for profile in self._time_of_day_profiles:
            if profile.matches(current_hour) and profile.checking_timeout is not None:
                _LOGGER.debug(
                    "Room %s: using time-of-day checking timeout %ds (hour=%d)",
                    self._room_id,
                    profile.checking_timeout,
                    current_hour,
                )
                return profile.checking_timeout

        # 2. Adaptive learning
        if self._adaptive_enabled:
            learned = self._get_learned_timeout(current_hour)
            if learned is not None:
                _LOGGER.debug(
                    "Room %s: using adaptive checking timeout %ds (hour=%d)",
                    self._room_id,
                    learned,
                    current_hour,
                )
                return learned

        # 3. Base fallback
        return self._base_checking_timeout

    def get_effective_motion_timeout(self) -> int:
        """Get motion timeout adjusted for time-of-day.

        Priority:
            1. Time-of-day profile override (first match wins)
            2. Learned median from historical sessions for current hour window
            3. Base motion_timeout (fallback)
        """
        now = datetime.now()
        current_hour = now.hour

        # 1. Time-of-day profile override
        for profile in self._time_of_day_profiles:
            if profile.matches(current_hour) and profile.motion_timeout is not None:
                _LOGGER.debug(
                    "Room %s: using time-of-day motion timeout %ds (hour=%d)",
                    self._room_id,
                    profile.motion_timeout,
                    current_hour,
                )
                return profile.motion_timeout

        # 2. Adaptive learning (use same learned timeout for motion)
        if self._adaptive_enabled:
            learned = self._get_learned_timeout(current_hour)
            if learned is not None:
                _LOGGER.debug(
                    "Room %s: using adaptive motion timeout %ds (hour=%d)",
                    self._room_id,
                    learned,
                    current_hour,
                )
                return learned

        # 3. Base fallback
        return self._base_motion_timeout

    def get_session_history(self) -> list[OccupancyDurationRecord]:
        """Get recorded history for persistence."""
        return list(self._session_history)

    def load_session_history(self, records: list[dict[str, Any]]) -> None:
        """Load history from persisted storage.

        Args:
            records: List of serialized OccupancyDurationRecord dicts.
        """
        self._session_history.clear()
        for record_data in records:
            try:
                record = OccupancyDurationRecord.from_dict(record_data)
                self._session_history.append(record)
            except (KeyError, ValueError, TypeError):
                _LOGGER.warning(
                    "Room %s: skipping invalid session record: %s",
                    self._room_id,
                    record_data,
                )

        _LOGGER.debug(
            "Room %s: loaded %d session history records",
            self._room_id,
            len(self._session_history),
        )

    def _get_learned_timeout(self, current_hour: int) -> int | None:
        """Get learned timeout from session history for the current time window.

        Groups sessions by 4-hour windows and computes the median duration.
        Requires at least MIN_SESSIONS_FOR_ADAPTIVE sessions in the window.
        Result is clamped between ADAPTIVE_MIN_TIMEOUT and ADAPTIVE_MAX_TIMEOUT.

        Returns:
            Learned timeout in seconds, or None if insufficient data.
        """
        current_window = _hour_to_window(current_hour)

        # Collect durations for sessions in the same time window
        window_durations = [
            record.duration_seconds
            for record in self._session_history
            if _hour_to_window(record.hour_of_day) == current_window
        ]

        if len(window_durations) < MIN_SESSIONS_FOR_ADAPTIVE:
            return None

        median_duration = statistics.median(window_durations)
        clamped = max(
            ADAPTIVE_MIN_TIMEOUT, min(ADAPTIVE_MAX_TIMEOUT, int(median_duration))
        )

        return clamped
