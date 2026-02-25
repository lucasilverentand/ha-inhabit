"""Probabilistic seal decay model for occupancy detection.

Replaces the binary sealed/not-sealed approach with an exponential decay
curve that models the probability someone is still inside a sealed room.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class SealProbabilityTracker:
    """Tracks seal confidence with exponential decay.

    Instead of a binary sealed/not-sealed, the probability that someone
    is still inside decays over time: p = 0.5^(t / half_life)

    At t=0 (just sealed): p = 1.0
    At t=half_life: p = 0.5
    At t=2*half_life: p = 0.25
    At t=3*half_life: p = 0.125
    """

    half_life_seconds: float = 3600.0  # 1 hour default
    vacancy_threshold: float = 0.1  # Below this, treat as unsealed
    _sealed_at: datetime | None = field(default=None, repr=False)
    _broken: bool = field(default=False, repr=False)
    _max_duration: float = 14400.0  # Hard safety valve (4 hours)

    def establish(self) -> None:
        """Establish a new seal. Resets decay timer."""
        self._sealed_at = datetime.now()
        self._broken = False

    def break_seal(self) -> None:
        """Immediately break the seal (door opened, etc)."""
        self._broken = True
        self._sealed_at = None

    @property
    def probability(self) -> float:
        """Current probability that person is still inside."""
        if self._broken or self._sealed_at is None:
            return 0.0
        age = (datetime.now() - self._sealed_at).total_seconds()
        if age >= self._max_duration:
            return 0.0  # Hard cutoff
        return math.pow(0.5, age / self.half_life_seconds)

    @property
    def is_effective(self) -> bool:
        """Whether the seal should still block vacancy transitions."""
        return self.probability > self.vacancy_threshold

    @property
    def is_sealed(self) -> bool:
        """Whether a seal has been established and not broken (regardless of probability)."""
        return self._sealed_at is not None and not self._broken

    @property
    def sealed_since(self) -> datetime | None:
        """When the seal was established."""
        return self._sealed_at

    def reset(self) -> None:
        """Reset all state."""
        self._sealed_at = None
        self._broken = False
