"""Transition pattern learner for occupancy prediction.

Records room-to-room transitions over time and builds a time-of-day
weighted model that improves phantom presence predictions. After
sufficient observations (50+ transitions per path), learned weights
are blended into the TransitionPredictor's topology weights.

History is retained for 14 days. Transitions are bucketed into 24
hourly slots for time-of-day awareness (e.g., "bedroom → hallway at
7am is very common" vs. "bedroom → hallway at 3am is rare").
"""

from __future__ import annotations

import logging
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any

from ..const import TRANSITION_LEARNER_HISTORY_DAYS, TRANSITION_LEARNER_MIN_TRANSITIONS

_LOGGER = logging.getLogger(__name__)

# 24 hourly buckets for time-of-day weighting
NUM_HOUR_BUCKETS = 24


@dataclass
class TransitionRecord:
    """A single observed transition between two rooms."""

    from_room: str
    to_room: str
    timestamp: str  # ISO format
    hour_bucket: int  # 0-23

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "from_room": self.from_room,
            "to_room": self.to_room,
            "timestamp": self.timestamp,
            "hour_bucket": self.hour_bucket,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> TransitionRecord:
        """Create from dictionary."""
        return cls(
            from_room=data["from_room"],
            to_room=data["to_room"],
            timestamp=data["timestamp"],
            hour_bucket=int(data.get("hour_bucket", 0)),
        )


class TransitionLearner:
    """Learns room-to-room transition patterns from occupancy history.

    Tracks which rooms people move between and when, building a model
    that predicts likely next rooms at a given time of day.
    """

    def __init__(self) -> None:
        """Initialize the learner."""
        # Raw transition records (pruned to HISTORY_DAYS)
        self._records: list[TransitionRecord] = []

        # Aggregated counts: (from_room, to_room) -> hourly counts (24 buckets)
        self._hourly_counts: dict[tuple[str, str], list[int]] = defaultdict(
            lambda: [0] * NUM_HOUR_BUCKETS
        )

        # Total transitions per path: (from_room, to_room) -> total count
        self._total_counts: dict[tuple[str, str], int] = defaultdict(int)

        # Last room that went OCCUPIED (for inferring transitions)
        self._last_occupied_room: str | None = None
        self._last_occupied_time: datetime | None = None

    def record_transition(
        self, from_room: str, to_room: str, timestamp: datetime | None = None
    ) -> None:
        """Record an observed transition between two rooms."""
        if from_room == to_room:
            return

        now = timestamp or datetime.now()
        hour = now.hour

        record = TransitionRecord(
            from_room=from_room,
            to_room=to_room,
            timestamp=now.isoformat(),
            hour_bucket=hour,
        )
        self._records.append(record)

        # Update aggregated counts
        key = (from_room, to_room)
        self._hourly_counts[key][hour] += 1
        self._total_counts[key] += 1

        _LOGGER.debug(
            "Transition recorded: %s → %s at hour %d (total: %d)",
            from_room,
            to_room,
            hour,
            self._total_counts[key],
        )

    def on_room_occupied(self, room_id: str, timestamp: datetime | None = None) -> None:
        """Called when a room becomes OCCUPIED. Infers a transition from the
        last occupied room (if recent enough).
        """
        now = timestamp or datetime.now()

        if (
            self._last_occupied_room
            and self._last_occupied_room != room_id
            and self._last_occupied_time
        ):
            elapsed = (now - self._last_occupied_time).total_seconds()
            # Only count as a transition if the rooms changed within 5 minutes
            if elapsed <= 300:
                self.record_transition(self._last_occupied_room, room_id, now)

        self._last_occupied_room = room_id
        self._last_occupied_time = now

    def get_transition_weight(
        self, from_room: str, to_room: str, hour: int | None = None
    ) -> float:
        """Get learned transition weight for a path at a given hour.

        Returns 0.0 if insufficient data (< MIN_TRANSITIONS observations).
        Returns a value between 0.0 and 1.0 representing how common this
        transition is relative to all transitions from the source room.

        The weight is time-of-day aware: transitions that are common at
        the current hour are weighted higher.
        """
        key = (from_room, to_room)
        total = self._total_counts.get(key, 0)

        if total < TRANSITION_LEARNER_MIN_TRANSITIONS:
            return 0.0

        if hour is None:
            hour = datetime.now().hour

        # Get all transitions from this room
        all_from_room: dict[str, int] = {}
        for (fr, to), count in self._total_counts.items():
            if fr == from_room and count >= TRANSITION_LEARNER_MIN_TRANSITIONS:
                all_from_room[to] = count

        if not all_from_room:
            return 0.0

        total_from = sum(all_from_room.values())
        if total_from == 0:
            return 0.0

        # Base weight from overall frequency
        base_weight = all_from_room.get(to_room, 0) / total_from

        # Time-of-day modifier: how much more/less common is this path at this hour?
        hourly = self._hourly_counts.get(key)
        if hourly:
            hour_count = hourly[hour]
            avg_per_hour = total / NUM_HOUR_BUCKETS
            if avg_per_hour > 0:
                tod_modifier = min(2.0, hour_count / avg_per_hour)
            else:
                tod_modifier = 1.0
        else:
            tod_modifier = 1.0

        # Blend: 70% base frequency + 30% time-of-day adjusted
        return min(1.0, base_weight * (0.7 + 0.3 * tod_modifier))

    def get_likely_destinations(
        self, from_room: str, hour: int | None = None, min_weight: float = 0.1
    ) -> list[tuple[str, float]]:
        """Get likely destination rooms from a source room, sorted by weight.

        Returns list of (room_id, weight) tuples.
        """
        destinations: list[tuple[str, float]] = []

        for (fr, to), count in self._total_counts.items():
            if fr != from_room:
                continue
            if count < TRANSITION_LEARNER_MIN_TRANSITIONS:
                continue

            weight = self.get_transition_weight(from_room, to, hour)
            if weight >= min_weight:
                destinations.append((to, weight))

        destinations.sort(key=lambda x: x[1], reverse=True)
        return destinations

    def prune_history(self) -> int:
        """Remove transition records older than HISTORY_DAYS. Returns count removed."""
        cutoff = datetime.now() - timedelta(days=TRANSITION_LEARNER_HISTORY_DAYS)
        original_count = len(self._records)

        kept: list[TransitionRecord] = []
        for record in self._records:
            try:
                ts = datetime.fromisoformat(record.timestamp)
                if ts >= cutoff:
                    kept.append(record)
            except ValueError:
                pass  # Drop malformed records

        removed = original_count - len(kept)
        if removed > 0:
            self._records = kept
            self._rebuild_counts()
            _LOGGER.debug(
                "Pruned %d transition records (kept %d)", removed, len(kept)
            )

        return removed

    def _rebuild_counts(self) -> None:
        """Rebuild aggregated counts from raw records."""
        self._hourly_counts.clear()
        self._total_counts.clear()

        for record in self._records:
            key = (record.from_room, record.to_room)
            if key not in self._hourly_counts:
                self._hourly_counts[key] = [0] * NUM_HOUR_BUCKETS
            self._hourly_counts[key][record.hour_bucket] += 1
            self._total_counts[key] += 1

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save_data(self) -> dict[str, Any]:
        """Serialize learner state for persistence."""
        return {
            "records": [r.to_dict() for r in self._records],
        }

    def load_data(self, data: dict[str, Any]) -> None:
        """Load learner state from persisted data."""
        self._records = []
        for item in data.get("records", []):
            try:
                self._records.append(TransitionRecord.from_dict(item))
            except (KeyError, ValueError):
                _LOGGER.debug("Skipping invalid transition record: %s", item)

        self._rebuild_counts()
        self.prune_history()

        _LOGGER.debug(
            "Loaded %d transition records, %d unique paths",
            len(self._records),
            len(self._total_counts),
        )
