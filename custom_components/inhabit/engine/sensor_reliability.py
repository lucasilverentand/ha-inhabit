"""Sensor reliability tracker for dynamic weight adjustment."""

from __future__ import annotations

import logging
from collections import deque
from dataclasses import dataclass
from datetime import datetime

_LOGGER = logging.getLogger(__name__)

# Time window to confirm an activation (seconds)
CONFIRMATION_WINDOW = 30.0
# Minimum weight multiplier (never fully disable a sensor)
MIN_WEIGHT_MULTIPLIER = 0.3
# Maximum history entries per sensor
MAX_HISTORY_SIZE = 200
# Co-fire window for sensor correlation tracking (seconds)
CORRELATION_WINDOW = 10.0


@dataclass
class SensorAccuracyRecord:
    """Tracks accuracy metrics for a single sensor."""

    entity_id: str
    true_positives: int = 0
    false_positives: int = 0
    true_negatives: int = 0
    false_negatives: int = 0
    unavailable_count: int = 0

    @property
    def total_events(self) -> int:
        """Total number of classified events."""
        return (
            self.true_positives
            + self.false_positives
            + self.true_negatives
            + self.false_negatives
        )

    @property
    def accuracy(self) -> float:
        """0.0-1.0 accuracy score. New sensors start at 1.0."""
        if self.total_events == 0:
            return 1.0
        return (self.true_positives + self.true_negatives) / self.total_events

    @property
    def effective_weight_multiplier(self) -> float:
        """Scale from MIN_WEIGHT_MULTIPLIER (unreliable) to 1.0 (perfect)."""
        return max(MIN_WEIGHT_MULTIPLIER, self.accuracy)

    def to_dict(self) -> dict:
        """Serialize to dictionary."""
        return {
            "entity_id": self.entity_id,
            "true_positives": self.true_positives,
            "false_positives": self.false_positives,
            "true_negatives": self.true_negatives,
            "false_negatives": self.false_negatives,
            "unavailable_count": self.unavailable_count,
        }

    @classmethod
    def from_dict(cls, data: dict) -> SensorAccuracyRecord:
        """Deserialize from dictionary."""
        return cls(
            entity_id=data.get("entity_id", ""),
            true_positives=int(data.get("true_positives", 0)),
            false_positives=int(data.get("false_positives", 0)),
            true_negatives=int(data.get("true_negatives", 0)),
            false_negatives=int(data.get("false_negatives", 0)),
            unavailable_count=int(data.get("unavailable_count", 0)),
        )


@dataclass
class PendingActivation:
    """An activation waiting for confirmation from another sensor."""

    entity_id: str
    activated_at: datetime
    confirmed: bool = False


class SensorReliabilityTracker:
    """Tracks sensor reliability and adjusts weights based on historical accuracy.

    When a sensor activates, we start a confirmation window. If another sensor
    in the same room also activates within that window, both get a true_positive.
    If the first sensor's window expires without confirmation, it gets a false_positive.
    """

    def __init__(self, confirmation_window: float = CONFIRMATION_WINDOW) -> None:
        self._confirmation_window = confirmation_window
        self._records: dict[str, SensorAccuracyRecord] = {}
        self._pending: deque[PendingActivation] = deque(maxlen=100)

    def on_sensor_activation(self, entity_id: str) -> None:
        """Record a sensor activation. Starts confirmation window and checks pending."""
        self._ensure_record(entity_id)

        # Check if this confirms any pending activations from OTHER sensors
        now = datetime.now()
        for pending in self._pending:
            if pending.entity_id != entity_id and not pending.confirmed:
                age = (now - pending.activated_at).total_seconds()
                if age <= self._confirmation_window:
                    pending.confirmed = True
                    self._records[pending.entity_id].true_positives += 1
                    self._records[entity_id].true_positives += 1

        # Add this as a new pending activation
        self._pending.append(PendingActivation(entity_id=entity_id, activated_at=now))

        # Expire old pending activations
        self._expire_pending(now)

    def on_sensor_deactivation(self, entity_id: str) -> None:
        """Record a sensor deactivation (for true_negative tracking)."""
        self._ensure_record(entity_id)

    def get_effective_weight(self, entity_id: str, base_weight: float) -> float:
        """Get weight adjusted for reliability."""
        record = self._records.get(entity_id)
        if not record:
            return base_weight
        return base_weight * record.effective_weight_multiplier

    def get_reliability(self, entity_id: str) -> float:
        """Get reliability score (0.0-1.0) for a sensor."""
        record = self._records.get(entity_id)
        return record.accuracy if record else 1.0

    def get_all_records(self) -> dict[str, SensorAccuracyRecord]:
        """Get all accuracy records (for persistence/diagnostics)."""
        return dict(self._records)

    def load_records(self, data: dict[str, dict]) -> None:
        """Load persisted records."""
        for entity_id, record_data in data.items():
            self._records[entity_id] = SensorAccuracyRecord.from_dict(record_data)

    def save_records(self) -> dict[str, dict]:
        """Save records for persistence."""
        return {
            entity_id: record.to_dict() for entity_id, record in self._records.items()
        }

    def _ensure_record(self, entity_id: str) -> None:
        """Ensure an accuracy record exists for the given entity."""
        if entity_id not in self._records:
            self._records[entity_id] = SensorAccuracyRecord(entity_id=entity_id)

    def _expire_pending(self, now: datetime) -> None:
        """Expire old pending activations. Unconfirmed = false positive."""
        while self._pending and not self._pending[0].confirmed:
            oldest = self._pending[0]
            age = (now - oldest.activated_at).total_seconds()
            if age > self._confirmation_window:
                self._records[oldest.entity_id].false_positives += 1
                self._pending.popleft()
            else:
                break
        # Also remove confirmed entries that are old
        while self._pending and self._pending[0].confirmed:
            oldest = self._pending[0]
            age = (now - oldest.activated_at).total_seconds()
            if age > self._confirmation_window:
                self._pending.popleft()
            else:
                break


@dataclass
class CorrelationRecord:
    """Tracks co-fire / solo-fire statistics for a single sensor."""

    entity_id: str
    co_fires: int = 0
    solo_fires: int = 0

    @property
    def total_fires(self) -> int:
        """Total number of fire events (co + solo)."""
        return self.co_fires + self.solo_fires

    @property
    def solo_fire_rate(self) -> float:
        """Fraction of fires that were solo (0.0-1.0). New sensors return 0.0."""
        if self.total_fires == 0:
            return 0.0
        return self.solo_fires / self.total_fires

    def to_dict(self) -> dict:
        """Serialize to dictionary."""
        return {
            "entity_id": self.entity_id,
            "co_fires": self.co_fires,
            "solo_fires": self.solo_fires,
        }

    @classmethod
    def from_dict(cls, data: dict) -> CorrelationRecord:
        """Deserialize from dictionary."""
        return cls(
            entity_id=data.get("entity_id", ""),
            co_fires=int(data.get("co_fires", 0)),
            solo_fires=int(data.get("solo_fires", 0)),
        )


class SensorCorrelationTracker:
    """Tracks co-fire vs solo-fire patterns between sensors in a room.

    When a sensor activates, we record a pending activation. If another
    sensor in the same room also activates within CORRELATION_WINDOW seconds,
    both get a co_fire. If the window expires without any other sensor
    activating, the original sensor gets a solo_fire.

    A high solo-fire rate indicates the sensor is unreliable or noisy --
    real occupancy events usually trigger multiple sensors.
    """

    def __init__(self, window: float = CORRELATION_WINDOW) -> None:
        self._window = window
        self._records: dict[str, CorrelationRecord] = {}
        self._pending: deque[tuple[str, datetime]] = deque(maxlen=200)

    def on_sensor_activation(self, entity_id: str) -> None:
        """Record a sensor activation. Checks for co-fires and starts window."""
        self._ensure_record(entity_id)

        now = datetime.now()

        # Check if this co-fires with any pending activations from OTHER sensors
        co_fired_entities: set[str] = set()
        for pending_entity, pending_time in self._pending:
            if pending_entity == entity_id:
                continue
            age = (now - pending_time).total_seconds()
            if age <= self._window:
                co_fired_entities.add(pending_entity)

        if co_fired_entities:
            # This sensor co-fired with at least one other sensor
            self._records[entity_id].co_fires += 1
            for eid in co_fired_entities:
                self._ensure_record(eid)
                self._records[eid].co_fires += 1

        # Add this activation as pending
        self._pending.append((entity_id, now))

        # Expire old pending activations
        self._expire_pending(now)

    def get_solo_fire_rate(self, entity_id: str) -> float:
        """Get the solo-fire rate (0.0-1.0) for a sensor."""
        record = self._records.get(entity_id)
        return record.solo_fire_rate if record else 0.0

    def get_record(self, entity_id: str) -> CorrelationRecord | None:
        """Get the correlation record for a sensor."""
        return self._records.get(entity_id)

    def get_all_records(self) -> dict[str, CorrelationRecord]:
        """Get all correlation records (for diagnostics)."""
        return dict(self._records)

    def save_records(self) -> dict[str, dict]:
        """Save records for persistence."""
        return {
            entity_id: record.to_dict() for entity_id, record in self._records.items()
        }

    def load_records(self, data: dict[str, dict]) -> None:
        """Load persisted records."""
        for entity_id, record_data in data.items():
            self._records[entity_id] = CorrelationRecord.from_dict(record_data)

    def _ensure_record(self, entity_id: str) -> None:
        """Ensure a correlation record exists for the given entity."""
        if entity_id not in self._records:
            self._records[entity_id] = CorrelationRecord(entity_id=entity_id)

    def _expire_pending(self, now: datetime) -> None:
        """Expire old pending activations. Unmatched = solo fire."""
        while self._pending:
            pending_entity, pending_time = self._pending[0]
            age = (now - pending_time).total_seconds()
            if age > self._window:
                # Check if this pending activation was ever co-fired
                # (it's a solo fire if it hasn't been counted as a co-fire
                # in this round -- we track co-fires at activation time,
                # so an expired pending that wasn't bumped is solo)
                # We need to check: was this entity's co_fires bumped
                # since it was pending? We can't easily track that, so
                # we use a different strategy: track if ANY other entity
                # fired within the window of this pending activation.
                was_cofired = False
                for other_entity, other_time in self._pending:
                    if other_entity == pending_entity:
                        continue
                    delta = abs((other_time - pending_time).total_seconds())
                    if delta <= self._window:
                        was_cofired = True
                        break
                if not was_cofired:
                    self._ensure_record(pending_entity)
                    self._records[pending_entity].solo_fires += 1
                self._pending.popleft()
            else:
                break
