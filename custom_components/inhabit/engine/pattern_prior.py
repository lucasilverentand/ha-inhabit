"""Occupancy pattern priors that learn time-of-day/day-of-week patterns.

Maintains a 7x24 matrix (day_of_week x hour) of occupancy observations
and provides a prior probability that a room is occupied at any given time.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

_LOGGER = logging.getLogger(__name__)


@dataclass
class OccupancyPatternPrior:
    """Learns occupancy patterns over a 7x24 matrix.

    Each cell tracks the number of occupied vs total observations for
    that day-of-week + hour combination.  The prior probability is the
    ratio of occupied observations to total observations, with a
    Bayesian smoothing term (adds 1 to both numerator and denominator)
    to avoid extreme priors with little data.
    """

    room_id: str = ""

    # 7x24 matrix: _counts[day_of_week][hour] = (occupied_count, total_count)
    _occupied_counts: list[list[int]] = field(default_factory=lambda: [
        [0] * 24 for _ in range(7)
    ])
    _total_counts: list[list[int]] = field(default_factory=lambda: [
        [0] * 24 for _ in range(7)
    ])

    def record_observation(self, timestamp: datetime, is_occupied: bool) -> None:
        """Record an occupancy observation at the given time.

        Args:
            timestamp: When the observation was made.
            is_occupied: Whether the room was occupied at that time.
        """
        day = timestamp.weekday()  # 0=Monday, 6=Sunday
        hour = timestamp.hour

        self._total_counts[day][hour] += 1
        if is_occupied:
            self._occupied_counts[day][hour] += 1

    def get_prior(self, timestamp: datetime) -> float:
        """Get the occupancy prior probability for the given time.

        Returns a value between 0.0 and 1.0.
        Uses Bayesian smoothing: (occupied + 1) / (total + 2) to avoid
        extreme 0.0 or 1.0 priors with limited data.
        """
        day = timestamp.weekday()
        hour = timestamp.hour

        occupied = self._occupied_counts[day][hour]
        total = self._total_counts[day][hour]

        # Bayesian smoothing (Laplace prior)
        return (occupied + 1) / (total + 2)

    def get_total_observations(self) -> int:
        """Get the total number of observations across all slots."""
        return sum(sum(row) for row in self._total_counts)

    def to_dict(self) -> dict[str, Any]:
        """Serialize to dictionary."""
        return {
            "room_id": self.room_id,
            "occupied_counts": [list(row) for row in self._occupied_counts],
            "total_counts": [list(row) for row in self._total_counts],
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> OccupancyPatternPrior:
        """Deserialize from dictionary."""
        prior = cls(room_id=data.get("room_id", ""))

        occupied = data.get("occupied_counts")
        if occupied and len(occupied) == 7:
            prior._occupied_counts = [
                list(row) if len(row) == 24 else [0] * 24
                for row in occupied
            ]

        total = data.get("total_counts")
        if total and len(total) == 7:
            prior._total_counts = [
                list(row) if len(row) == 24 else [0] * 24
                for row in total
            ]

        return prior
