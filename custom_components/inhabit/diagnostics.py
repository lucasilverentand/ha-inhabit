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


class DiagnosticTrace:
    """Bounded in-memory trace of recent occupancy diagnostics."""

    def __init__(self, maxlen: int = DIAGNOSTIC_TRACE_MAXLEN) -> None:
        self._events: deque[DiagnosticEvent] = deque(maxlen=maxlen)

    def record(self, **kwargs: Any) -> DiagnosticEvent:
        """Record and return a diagnostic event."""
        event = DiagnosticEvent(**kwargs)
        self._events.append(event)
        return event

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
