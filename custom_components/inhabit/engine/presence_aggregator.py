"""Multi-sensor presence aggregation."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime
from typing import TYPE_CHECKING

from homeassistant.const import STATE_ON
from homeassistant.core import HomeAssistant, State

if TYPE_CHECKING:
    from ..models.virtual_sensor import SensorBinding

_LOGGER = logging.getLogger(__name__)


@dataclass
class SensorReading:
    """Individual sensor reading with timestamp."""

    entity_id: str
    is_active: bool
    timestamp: datetime
    weight: float
    sensor_type: str  # motion, presence


class PresenceAggregator:
    """
    Aggregates readings from multiple sensors to determine room presence.

    Uses weighted voting with temporal decay to combine multiple sensor
    readings into a single presence probability.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        motion_bindings: list[SensorBinding],
        presence_bindings: list[SensorBinding],
        motion_decay_seconds: float = 120.0,
        presence_decay_seconds: float = 300.0,
    ) -> None:
        """Initialize the aggregator."""
        self.hass = hass
        self.motion_bindings = motion_bindings
        self.presence_bindings = presence_bindings
        self.motion_decay_seconds = motion_decay_seconds
        self.presence_decay_seconds = presence_decay_seconds
        self._readings: dict[str, SensorReading] = {}

    def update_reading(
        self,
        entity_id: str,
        is_active: bool,
        sensor_type: str,
        weight: float = 1.0,
    ) -> None:
        """Update a sensor reading."""
        self._readings[entity_id] = SensorReading(
            entity_id=entity_id,
            is_active=is_active,
            timestamp=datetime.now(),
            weight=weight,
            sensor_type=sensor_type,
        )

    def get_presence_probability(self) -> float:
        """
        Calculate presence probability from all sensors.

        Returns a value between 0.0 (definitely vacant) and 1.0 (definitely occupied).
        """
        now = datetime.now()
        total_weight = 0.0
        active_weight = 0.0

        for reading in self._readings.values():
            # Calculate temporal decay
            age = (now - reading.timestamp).total_seconds()

            if reading.sensor_type == "motion":
                decay_seconds = self.motion_decay_seconds
            else:
                decay_seconds = self.presence_decay_seconds

            # Skip readings that have fully decayed
            if age > decay_seconds:
                continue

            # Calculate decay factor (1.0 at t=0, 0.0 at t=decay_seconds)
            decay_factor = max(0.0, 1.0 - (age / decay_seconds))
            effective_weight = reading.weight * decay_factor

            total_weight += effective_weight
            if reading.is_active:
                active_weight += effective_weight

        if total_weight == 0:
            return 0.0

        return active_weight / total_weight

    def get_active_sensors(self) -> list[str]:
        """Get list of currently active sensor entity IDs."""
        active = []
        for entity_id, reading in self._readings.items():
            if reading.is_active:
                active.append(entity_id)
        return active

    def is_any_sensor_active(self) -> bool:
        """Check if any sensor is currently active."""
        for reading in self._readings.values():
            if reading.is_active:
                return True
        return False

    def get_last_activity_time(self) -> datetime | None:
        """Get the timestamp of the most recent activity."""
        last_time = None
        for reading in self._readings.values():
            if reading.is_active:
                if last_time is None or reading.timestamp > last_time:
                    last_time = reading.timestamp
        return last_time

    def refresh_from_state(self) -> None:
        """Refresh all readings from current entity states."""
        for binding in self.motion_bindings:
            state = self.hass.states.get(binding.entity_id)
            if state:
                is_active = self._is_sensor_active(state, binding.inverted)
                self.update_reading(
                    binding.entity_id, is_active, "motion", binding.weight
                )

        for binding in self.presence_bindings:
            state = self.hass.states.get(binding.entity_id)
            if state:
                is_active = self._is_sensor_active(state, binding.inverted)
                self.update_reading(
                    binding.entity_id, is_active, "presence", binding.weight
                )

    def _is_sensor_active(self, state: State, inverted: bool) -> bool:
        """Check if a sensor is in an active state."""
        is_on = state.state in (STATE_ON, "on", "detected", "open", "true", "1")
        return not is_on if inverted else is_on

    def clear(self) -> None:
        """Clear all readings."""
        self._readings.clear()
