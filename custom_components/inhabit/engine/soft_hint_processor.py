"""Soft occupancy hint processor for indirect presence signals.

Soft hints are environmental signals that suggest occupancy but cannot
confirm it alone. Examples: lights on, elevated CO2, power draw on
outlets, ambient sound levels, door open/close direction.

These signals are blended into the aggregator with capped weights
so they can sustain or boost an OCCUPIED state but never trigger it
on their own.
"""

from __future__ import annotations

import logging

_LOGGER = logging.getLogger(__name__)

# Maximum weight a hint can contribute (prevents hints from triggering
# OCCUPIED alone when combined with the occupied_threshold gate).
MAX_HINT_WEIGHT = 0.3


class SoftHintProcessor:
    """Static methods for processing soft occupancy hints."""

    @staticmethod
    def process_light_state(
        state: str,
        brightness: int | None = None,
    ) -> float:
        """Process a light entity state into a hint weight.

        - Light ON: 0.15 base, scaled up to 0.25 by brightness
        - Light OFF: 0.0
        """
        if state not in ("on", "true", "1"):
            return 0.0

        base = 0.15
        if brightness is not None and brightness > 0:
            # Scale from 0.15 to 0.25 based on brightness (0-255)
            brightness_factor = min(brightness / 255.0, 1.0)
            return min(MAX_HINT_WEIGHT, base + 0.10 * brightness_factor)
        return base

    @staticmethod
    def process_power_level(
        power_watts: float,
        idle_threshold: float = 5.0,
        active_threshold: float = 50.0,
    ) -> float:
        """Process power draw from a smart plug into a hint weight.

        - Below idle_threshold: 0.0 (standby)
        - Between idle and active: linearly scaled 0.0 to 0.2
        - Above active_threshold: 0.2
        """
        if power_watts <= idle_threshold:
            return 0.0

        if power_watts >= active_threshold:
            return 0.2

        # Linear interpolation
        ratio = (power_watts - idle_threshold) / (active_threshold - idle_threshold)
        return 0.2 * ratio

    @staticmethod
    def process_co2(
        co2_ppm: float,
        baseline_ppm: float = 400.0,
        elevated_ppm: float = 600.0,
    ) -> float:
        """Process CO2 level into a hint weight.

        - At or below baseline: 0.0
        - Between baseline and elevated: linearly scaled to 0.25
        - Above elevated: 0.25 (capped)
        """
        if co2_ppm <= baseline_ppm:
            return 0.0

        if co2_ppm >= elevated_ppm:
            return 0.25

        ratio = (co2_ppm - baseline_ppm) / (elevated_ppm - baseline_ppm)
        return 0.25 * ratio

    @staticmethod
    def process_sound_level(
        sound_db: float,
        quiet_threshold: float = 30.0,
        active_threshold: float = 50.0,
    ) -> float:
        """Process ambient sound level into a hint weight.

        - Below quiet_threshold: 0.0
        - Between quiet and active: linearly scaled to 0.2
        - Above active_threshold: 0.2
        """
        if sound_db <= quiet_threshold:
            return 0.0

        if sound_db >= active_threshold:
            return 0.2

        ratio = (sound_db - quiet_threshold) / (active_threshold - quiet_threshold)
        return 0.2 * ratio

    @staticmethod
    def detect_door_direction(
        door_was_open: bool,
        door_is_open: bool,
        room_was_occupied: bool,
    ) -> float:
        """Infer occupancy direction from a door state change.

        - Door opened from occupied room: might be leaving (-0.1)
        - Door closed into occupied room: might be staying (0.1)
        - Door opened into vacant room: might be entering (0.1)
        - Door closed from vacant room: ambiguous (0.0)
        """
        if not door_was_open and door_is_open:
            # Door just opened
            if room_was_occupied:
                return -0.1  # Might be leaving
            else:
                return 0.1  # Might be entering
        elif door_was_open and not door_is_open:
            # Door just closed
            if room_was_occupied:
                return 0.1  # Might be staying
            else:
                return 0.0  # Ambiguous
        return 0.0
