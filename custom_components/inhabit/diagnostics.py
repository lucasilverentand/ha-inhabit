"""Structured diagnostics for occupancy decisions."""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from uuid import uuid4

DIAGNOSTIC_TRACE_MAXLEN = 500


@dataclass
class DiagnosticEvent:
    """AI-readable diagnostic event emitted by the occupancy engine."""

    category: str
    event: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    id: str = field(default_factory=lambda: uuid4().hex)
    room_id: str | None = None
    region_id: str | None = None
    previous_state: str | None = None
    new_state: str | None = None
    reason: str | None = None
    confidence: float | None = None
    probability: float | None = None
    thresholds: dict[str, float] | None = None
    contributing_sensors: list[str] = field(default_factory=list)
    blockers: list[str] = field(default_factory=list)
    target_count: int | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Serialize to the public diagnostics shape."""
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "category": self.category,
            "event": self.event,
            "room_id": self.room_id,
            "region_id": self.region_id,
            "previous_state": self.previous_state,
            "new_state": self.new_state,
            "reason": self.reason,
            "confidence": self.confidence,
            "probability": self.probability,
            "thresholds": self.thresholds,
            "contributing_sensors": self.contributing_sensors,
            "blockers": self.blockers,
            "target_count": self.target_count,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> DiagnosticEvent:
        """Deserialize a persisted diagnostic event."""
        return cls(
            id=str(data.get("id") or uuid4().hex),
            timestamp=str(data.get("timestamp") or datetime.now().isoformat()),
            category=str(data.get("category") or "unknown"),
            event=str(data.get("event") or "unknown"),
            room_id=_optional_str(data.get("room_id")),
            region_id=_optional_str(data.get("region_id")),
            previous_state=_optional_str(data.get("previous_state")),
            new_state=_optional_str(data.get("new_state")),
            reason=_optional_str(data.get("reason")),
            confidence=_optional_float(data.get("confidence")),
            probability=_optional_float(data.get("probability")),
            thresholds=_float_dict_or_none(data.get("thresholds")),
            contributing_sensors=_str_list(data.get("contributing_sensors")),
            blockers=_str_list(data.get("blockers")),
            target_count=_optional_int(data.get("target_count")),
            metadata=_dict_or_empty(data.get("metadata")),
        )


def _optional_str(value: Any) -> str | None:
    """Return value as a string when present."""
    return None if value is None else str(value)


def _optional_float(value: Any) -> float | None:
    """Return value as a float when possible."""
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _optional_int(value: Any) -> int | None:
    """Return value as an int when possible."""
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _str_list(value: Any) -> list[str]:
    """Return a list of strings for persisted list fields."""
    if not isinstance(value, list):
        return []
    return [str(item) for item in value]


def _dict_or_empty(value: Any) -> dict[str, Any]:
    """Return a dict for persisted metadata."""
    return dict(value) if isinstance(value, dict) else {}


def _float_dict_or_none(value: Any) -> dict[str, float] | None:
    """Return a float-valued dict for persisted threshold fields."""
    if not isinstance(value, dict):
        return None
    result: dict[str, float] = {}
    for key, item in value.items():
        try:
            result[str(key)] = float(item)
        except (TypeError, ValueError):
            continue
    return result or None


class DiagnosticTrace:
    """Bounded in-memory trace of recent occupancy diagnostics."""

    def __init__(self, maxlen: int = DIAGNOSTIC_TRACE_MAXLEN) -> None:
        self._events: deque[DiagnosticEvent] = deque(maxlen=maxlen)

    def record(self, **kwargs: Any) -> DiagnosticEvent:
        """Record and return a diagnostic event."""
        event = DiagnosticEvent(**kwargs)
        self._events.append(event)
        return event

    def load_events(self, entries: list[dict[str, Any]]) -> None:
        """Replace the current trace with persisted diagnostic events."""
        self._events.clear()
        maxlen = self._events.maxlen or DIAGNOSTIC_TRACE_MAXLEN
        for entry in entries[-maxlen:]:
            if not isinstance(entry, dict):
                continue
            self._events.append(DiagnosticEvent.from_dict(entry))

    def list_events(
        self,
        *,
        room_id: str | None = None,
        region_id: str | None = None,
        category: str | None = None,
        limit: int = 100,
    ) -> list[DiagnosticEvent]:
        """Return recent events filtered by room/region/category."""
        bounded_limit = max(1, min(limit, DIAGNOSTIC_TRACE_MAXLEN))
        events = list(self._events)
        if room_id:
            events = [
                event
                for event in events
                if event.room_id == room_id or event.region_id == room_id
            ]
        if region_id:
            events = [event for event in events if event.region_id == region_id]
        if category:
            events = [event for event in events if event.category == category]
        return events[-bounded_limit:]

    def to_dicts(self, **kwargs: Any) -> list[dict[str, Any]]:
        """Return serialized recent events."""
        return [event.to_dict() for event in self.list_events(**kwargs)]
