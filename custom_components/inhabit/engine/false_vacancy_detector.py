"""False vacancy detection and adaptive checking timeout bumping."""

from __future__ import annotations

import logging
from collections import deque
from dataclasses import dataclass
from datetime import datetime

_LOGGER = logging.getLogger(__name__)

RAPID_REOCCUPANCY_WINDOW = 30.0  # seconds
MIN_CHECKING_TIMEOUT = 10
MAX_CHECKING_TIMEOUT = 300
SMALL_BUMP = 5  # seconds
LARGE_BUMP = 10  # seconds
LOW_RATE_THRESHOLD = 0.05  # Below 5% = stop bumping
HIGH_RATE_THRESHOLD = 0.15  # Above 15% = bump aggressively
MIN_TRANSITIONS_FOR_RATE = 20  # Need enough data before computing rate


@dataclass
class FalseVacancyEvent:
    """Record of a detected false vacancy."""

    room_id: str
    timestamp: str  # ISO
    gap_seconds: float  # Time between VACANT and re-OCCUPIED
    checking_timeout_at_time: int

    def to_dict(self) -> dict:
        return {
            "room_id": self.room_id,
            "timestamp": self.timestamp,
            "gap_seconds": self.gap_seconds,
            "checking_timeout_at_time": self.checking_timeout_at_time,
        }

    @classmethod
    def from_dict(cls, data: dict) -> FalseVacancyEvent:
        return cls(
            room_id=data["room_id"],
            timestamp=data["timestamp"],
            gap_seconds=data["gap_seconds"],
            checking_timeout_at_time=data.get("checking_timeout_at_time", 30),
        )


@dataclass
class RoomVacancyStats:
    """Per-room false vacancy statistics."""

    room_id: str
    total_vacancy_transitions: int = 0
    false_vacancy_count: int = 0
    checking_timeout_bump: int = 0  # Accumulated bump (added to base)

    @property
    def false_vacancy_rate(self) -> float:
        if self.total_vacancy_transitions < MIN_TRANSITIONS_FOR_RATE:
            return 0.0  # Not enough data
        return self.false_vacancy_count / self.total_vacancy_transitions

    def to_dict(self) -> dict:
        return {
            "room_id": self.room_id,
            "total_vacancy_transitions": self.total_vacancy_transitions,
            "false_vacancy_count": self.false_vacancy_count,
            "checking_timeout_bump": self.checking_timeout_bump,
        }

    @classmethod
    def from_dict(cls, data: dict) -> RoomVacancyStats:
        return cls(
            room_id=data["room_id"],
            total_vacancy_transitions=data.get("total_vacancy_transitions", 0),
            false_vacancy_count=data.get("false_vacancy_count", 0),
            checking_timeout_bump=data.get("checking_timeout_bump", 0),
        )


class FalseVacancyDetector:
    """Detects rapid re-occupancy (VACANT->OCCUPIED within 30s) and auto-bumps
    the checking_timeout to prevent future false vacancies.

    Convergence logic:
    - If false vacancy rate < 5%: stop bumping (system has converged)
    - If false vacancy rate > 15%: bump aggressively (+10s instead of +5s)
    - Otherwise: standard bump (+5s)
    - All bumps clamped to [MIN_CHECKING_TIMEOUT, MAX_CHECKING_TIMEOUT]
    """

    def __init__(self, hass):
        self._hass = hass
        self._room_stats: dict[str, RoomVacancyStats] = {}
        self._last_vacant_time: dict[str, datetime] = (
            {}
        )  # room_id -> when it went vacant
        self._false_vacancy_events: dict[str, deque[FalseVacancyEvent]] = {}

    def on_state_change(
        self,
        room_id: str,
        new_state: str,
        previous_state: str | None,
        checking_timeout: int,
    ) -> FalseVacancyEvent | None:
        """Called on every state transition. Returns a FalseVacancyEvent if detected.

        Args:
            room_id: The room that changed state
            new_state: The new occupancy state
            previous_state: The previous occupancy state
            checking_timeout: The current effective checking timeout for this room
        """
        from ..const import OccupancyState

        # Track when rooms go vacant
        if new_state == OccupancyState.VACANT:
            self._last_vacant_time[room_id] = datetime.now()
            stats = self._get_or_create_stats(room_id)
            stats.total_vacancy_transitions += 1
            return None

        # Check for rapid re-occupancy
        if (
            new_state == OccupancyState.OCCUPIED
            and previous_state == OccupancyState.VACANT
        ):
            last_vacant = self._last_vacant_time.get(room_id)
            if last_vacant is None:
                return None

            gap = (datetime.now() - last_vacant).total_seconds()
            if gap <= RAPID_REOCCUPANCY_WINDOW:
                return self._record_false_vacancy(room_id, gap, checking_timeout)

        return None

    def _record_false_vacancy(
        self, room_id: str, gap: float, checking_timeout: int
    ) -> FalseVacancyEvent:
        """Record a false vacancy and bump checking timeout."""
        event = FalseVacancyEvent(
            room_id=room_id,
            timestamp=datetime.now().isoformat(),
            gap_seconds=gap,
            checking_timeout_at_time=checking_timeout,
        )

        events = self._false_vacancy_events.setdefault(room_id, deque(maxlen=50))
        events.append(event)

        stats = self._get_or_create_stats(room_id)
        stats.false_vacancy_count += 1

        # Determine bump size based on convergence
        rate = stats.false_vacancy_rate
        if rate >= HIGH_RATE_THRESHOLD:
            bump = LARGE_BUMP
        elif (
            rate < LOW_RATE_THRESHOLD
            and stats.total_vacancy_transitions >= MIN_TRANSITIONS_FOR_RATE
        ):
            bump = 0  # Converged
        else:
            bump = SMALL_BUMP

        if bump > 0:
            stats.checking_timeout_bump = min(
                MAX_CHECKING_TIMEOUT - MIN_CHECKING_TIMEOUT,
                stats.checking_timeout_bump + bump,
            )
            _LOGGER.info(
                "Room %s: false vacancy detected (gap=%.1fs), "
                "bumped checking_timeout by +%ds (total bump: +%ds, rate: %.1f%%)",
                room_id,
                gap,
                bump,
                stats.checking_timeout_bump,
                rate * 100,
            )

        # Fire HA event for observability
        self._hass.bus.async_fire(
            "inhabit_false_vacancy_detected",
            {
                "room_id": room_id,
                "gap_seconds": round(gap, 1),
                "checking_timeout_bump": stats.checking_timeout_bump,
                "false_vacancy_rate": round(rate, 3),
            },
        )

        return event

    def get_checking_timeout_bump(self, room_id: str) -> int:
        """Get the accumulated checking timeout bump for a room."""
        stats = self._room_stats.get(room_id)
        return stats.checking_timeout_bump if stats else 0

    def get_stats(self, room_id: str) -> RoomVacancyStats | None:
        return self._room_stats.get(room_id)

    def _get_or_create_stats(self, room_id: str) -> RoomVacancyStats:
        if room_id not in self._room_stats:
            self._room_stats[room_id] = RoomVacancyStats(room_id=room_id)
        return self._room_stats[room_id]

    # Persistence
    def save_data(self) -> dict:
        return {
            "room_stats": {
                room_id: stats.to_dict() for room_id, stats in self._room_stats.items()
            },
            "false_vacancy_events": {
                room_id: [e.to_dict() for e in events]
                for room_id, events in self._false_vacancy_events.items()
            },
        }

    def load_data(self, data: dict) -> None:
        for room_id, stats_data in data.get("room_stats", {}).items():
            self._room_stats[room_id] = RoomVacancyStats.from_dict(stats_data)
        for room_id, events_data in data.get("false_vacancy_events", {}).items():
            self._false_vacancy_events[room_id] = deque(
                (FalseVacancyEvent.from_dict(e) for e in events_data), maxlen=50
            )
