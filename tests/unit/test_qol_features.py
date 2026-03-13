"""Unit tests for Stream 8a+8b: CHECKING events and occupancy history."""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.const import (
    EVENT_CHECKING_RESOLVED,
    EVENT_CHECKING_STARTED,
    OccupancyState,
)
from custom_components.inhabit.models.virtual_sensor import (
    OccupancyHistoryEntry,
    OccupancyStateData,
    SensorBinding,
    VirtualSensorConfig,
)

STATE_ON = "on"
STATE_OFF = "off"


@pytest.fixture
def basic_config():
    """Create a basic sensor configuration."""
    return VirtualSensorConfig(
        room_id="test_room",
        floor_plan_id="test_fp",
        enabled=True,
        motion_timeout=120,
        checking_timeout=30,
        motion_sensors=[
            SensorBinding(
                entity_id="binary_sensor.test_motion",
                sensor_type="motion",
                weight=1.0,
            ),
        ],
    )


@pytest.fixture
def state_changes():
    """Track state changes."""
    changes = []

    def on_change(state: OccupancyStateData, reason: str = ""):
        changes.append(
            {
                "state": state.state,
                "reason": state.transition_reason,
                "previous_state": state.previous_state,
                "confidence": state.confidence,
            }
        )

    return changes, on_change


def _make_machine(mock_hass, config, state_changes):
    """Helper to create a state machine."""
    from custom_components.inhabit.engine.occupancy_state_machine import (
        OccupancyStateMachine,
    )

    changes, on_change = state_changes
    return OccupancyStateMachine(mock_hass, config, on_change), changes


# ==================== 8a: CHECKING state notification events ====================


class TestCheckingEvents:
    """Tests for CHECKING state event firing."""

    def test_checking_started_event_fired(self, mock_hass, basic_config, state_changes):
        """CHECKING_STARTED event is fired with correct data."""
        machine, changes = _make_machine(mock_hass, basic_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # Move to OCCUPIED first
            machine._state.state = OccupancyState.OCCUPIED
            machine._transition_to_checking("all sensors clear")

        # Find the checking_started event
        events = [
            e for e in mock_hass._fired_events if e["type"] == EVENT_CHECKING_STARTED
        ]
        assert len(events) == 1

        data = events[0]["data"]
        assert data["room_id"] == "test_room"
        assert data["floor_plan_id"] == "test_fp"
        assert data["reason"] == "all sensors clear"
        assert data["checking_timeout"] == 30

    def test_checking_resolved_vacant_event_fired(
        self, mock_hass, basic_config, state_changes
    ):
        """CHECKING_RESOLVED event fired with 'vacant' result on vacancy."""
        machine, changes = _make_machine(mock_hass, basic_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._state.state = OccupancyState.CHECKING
            machine._transition_to_vacant("checking timeout")

        events = [
            e for e in mock_hass._fired_events if e["type"] == EVENT_CHECKING_RESOLVED
        ]
        assert len(events) == 1

        data = events[0]["data"]
        assert data["room_id"] == "test_room"
        assert data["floor_plan_id"] == "test_fp"
        assert data["result"] == "vacant"

    def test_checking_resolved_occupied_event_fired(
        self, mock_hass, basic_config, state_changes
    ):
        """CHECKING_RESOLVED event fired with 'occupied' result on re-detection."""
        # Sensor must be active so the threshold gate allows the transition
        mock_hass.states.get.return_value = MagicMock(state="on")
        machine, changes = _make_machine(mock_hass, basic_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # Start in CHECKING
            machine._state.state = OccupancyState.CHECKING
            machine._transition_to_occupied("motion re-detected")

        events = [
            e for e in mock_hass._fired_events if e["type"] == EVENT_CHECKING_RESOLVED
        ]
        assert len(events) == 1

        data = events[0]["data"]
        assert data["room_id"] == "test_room"
        assert data["floor_plan_id"] == "test_fp"
        assert data["result"] == "occupied"

    def test_no_checking_resolved_from_vacant_to_occupied(
        self, mock_hass, basic_config, state_changes
    ):
        """No CHECKING_RESOLVED event when going VACANT -> OCCUPIED."""
        # Sensor must be active so the threshold gate allows the transition
        mock_hass.states.get.return_value = MagicMock(state="on")
        machine, changes = _make_machine(mock_hass, basic_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._transition_to_occupied("motion detected")

        events = [
            e for e in mock_hass._fired_events if e["type"] == EVENT_CHECKING_RESOLVED
        ]
        assert len(events) == 0

    def test_no_checking_resolved_from_occupied_to_vacant(
        self, mock_hass, basic_config, state_changes
    ):
        """No CHECKING_RESOLVED event when going OCCUPIED -> VACANT directly."""
        machine, changes = _make_machine(mock_hass, basic_config, state_changes)

        # Force OCCUPIED (not through CHECKING)
        machine._state.state = OccupancyState.OCCUPIED
        machine._transition_to_vacant("manual override")

        events = [
            e for e in mock_hass._fired_events if e["type"] == EVENT_CHECKING_RESOLVED
        ]
        assert len(events) == 0

    def test_event_constants_correct(self):
        """Event name constants are correct."""
        assert EVENT_CHECKING_STARTED == "inhabit_checking_started"
        assert EVENT_CHECKING_RESOLVED == "inhabit_checking_resolved"


# ==================== 8b: Occupancy history tracking ====================


class TestOccupancyHistoryEntry:
    """Tests for the OccupancyHistoryEntry dataclass."""

    def test_creation(self):
        """OccupancyHistoryEntry dataclass creation."""
        entry = OccupancyHistoryEntry(
            room_id="room1",
            state=OccupancyState.OCCUPIED,
            timestamp="2026-02-25T10:00:00",
            reason="motion detected",
            confidence=0.8,
            previous_state=OccupancyState.VACANT,
            duration_seconds=120.5,
        )
        assert entry.room_id == "room1"
        assert entry.state == OccupancyState.OCCUPIED
        assert entry.timestamp == "2026-02-25T10:00:00"
        assert entry.reason == "motion detected"
        assert entry.confidence == 0.8
        assert entry.previous_state == OccupancyState.VACANT
        assert entry.duration_seconds == 120.5

    def test_creation_defaults(self):
        """OccupancyHistoryEntry with default optional fields."""
        entry = OccupancyHistoryEntry(
            room_id="room1",
            state=OccupancyState.OCCUPIED,
            timestamp="2026-02-25T10:00:00",
            reason="motion",
            confidence=0.5,
        )
        assert entry.previous_state is None
        assert entry.duration_seconds is None

    def test_to_dict(self):
        """History entry serializes to dict correctly."""
        entry = OccupancyHistoryEntry(
            room_id="room1",
            state="occupied",
            timestamp="2026-02-25T10:00:00",
            reason="motion detected",
            confidence=0.8,
            previous_state="vacant",
            duration_seconds=120.5,
        )
        d = entry.to_dict()
        assert d["room_id"] == "room1"
        assert d["state"] == "occupied"
        assert d["timestamp"] == "2026-02-25T10:00:00"
        assert d["reason"] == "motion detected"
        assert d["confidence"] == 0.8
        assert d["previous_state"] == "vacant"
        assert d["duration_seconds"] == 120.5

    def test_from_dict(self):
        """History entry deserializes from dict correctly."""
        data = {
            "room_id": "room1",
            "state": "occupied",
            "timestamp": "2026-02-25T10:00:00",
            "reason": "motion detected",
            "confidence": 0.8,
            "previous_state": "vacant",
            "duration_seconds": 120.5,
        }
        entry = OccupancyHistoryEntry.from_dict(data)
        assert entry.room_id == "room1"
        assert entry.state == "occupied"
        assert entry.timestamp == "2026-02-25T10:00:00"
        assert entry.reason == "motion detected"
        assert entry.confidence == 0.8
        assert entry.previous_state == "vacant"
        assert entry.duration_seconds == 120.5

    def test_serialization_round_trip(self):
        """History entry round-trips through to_dict/from_dict."""
        original = OccupancyHistoryEntry(
            room_id="test_room",
            state="checking",
            timestamp="2026-02-25T12:30:00",
            reason="all sensors clear",
            confidence=0.0,
            previous_state="occupied",
            duration_seconds=55.3,
        )
        restored = OccupancyHistoryEntry.from_dict(original.to_dict())
        assert restored.room_id == original.room_id
        assert restored.state == original.state
        assert restored.timestamp == original.timestamp
        assert restored.reason == original.reason
        assert restored.confidence == original.confidence
        assert restored.previous_state == original.previous_state
        assert restored.duration_seconds == original.duration_seconds

    def test_from_dict_missing_optional_fields(self):
        """from_dict handles missing optional fields."""
        data = {
            "room_id": "room1",
            "state": "vacant",
            "timestamp": "2026-02-25T10:00:00",
            "reason": "timeout",
            "confidence": 0.0,
        }
        entry = OccupancyHistoryEntry.from_dict(data)
        assert entry.previous_state is None
        assert entry.duration_seconds is None


class TestOccupancyHistoryTracking:
    """Tests for history tracking in VirtualSensorEngine."""

    def test_history_entries_recorded_on_state_transitions(
        self, mock_hass, basic_config, state_changes
    ):
        """History entries are recorded on state transitions."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        store = MagicMock()
        store.get_occupancy_history.return_value = []
        engine = VirtualSensorEngine(mock_hass, store)

        # Simulate a state change callback
        state = OccupancyStateData(
            state=OccupancyState.OCCUPIED,
            confidence=0.8,
            transition_reason="motion detected",
            previous_state=OccupancyState.VACANT,
        )
        engine._on_state_change("room1", state)

        history = engine.get_occupancy_history()
        assert len(history) == 1
        assert history[0].room_id == "room1"
        assert history[0].state == OccupancyState.OCCUPIED
        assert history[0].reason == "motion detected"
        assert history[0].confidence == 0.8
        assert history[0].previous_state == OccupancyState.VACANT

    def test_history_includes_correct_previous_state_and_duration(
        self, mock_hass, basic_config
    ):
        """History entries include correct previous_state and duration."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        store = MagicMock()
        store.get_occupancy_history.return_value = []
        engine = VirtualSensorEngine(mock_hass, store)

        # First transition
        state1 = OccupancyStateData(
            state=OccupancyState.OCCUPIED,
            confidence=0.8,
            transition_reason="motion",
            previous_state=OccupancyState.VACANT,
        )
        engine._on_state_change("room1", state1)

        # Second transition (some time later)
        state2 = OccupancyStateData(
            state=OccupancyState.CHECKING,
            confidence=0.0,
            transition_reason="sensors clear",
            previous_state=OccupancyState.OCCUPIED,
        )
        engine._on_state_change("room1", state2)

        history = engine.get_occupancy_history()
        assert len(history) == 2

        # First entry should have no duration (no previous transition)
        assert history[0].duration_seconds is None

        # Second entry should have a duration >= 0
        assert history[1].duration_seconds is not None
        assert history[1].duration_seconds >= 0
        assert history[1].previous_state == OccupancyState.OCCUPIED

    def test_history_filtered_by_room_id(self, mock_hass):
        """History is filtered by room_id correctly."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        store = MagicMock()
        store.get_occupancy_history.return_value = []
        engine = VirtualSensorEngine(mock_hass, store)

        # Add entries for different rooms
        for room_id in ["room1", "room2", "room1", "room3", "room1"]:
            state = OccupancyStateData(
                state=OccupancyState.OCCUPIED,
                confidence=0.5,
                transition_reason="test",
                previous_state=None,
            )
            engine._on_state_change(room_id, state)

        # Filter by room1
        room1_history = engine.get_occupancy_history(room_id="room1")
        assert len(room1_history) == 3
        assert all(e.room_id == "room1" for e in room1_history)

        # Filter by room2
        room2_history = engine.get_occupancy_history(room_id="room2")
        assert len(room2_history) == 1

        # No filter
        all_history = engine.get_occupancy_history()
        assert len(all_history) == 5

    def test_history_limit_parameter(self, mock_hass):
        """History limit parameter works correctly."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        store = MagicMock()
        store.get_occupancy_history.return_value = []
        engine = VirtualSensorEngine(mock_hass, store)

        # Add 10 entries
        for i in range(10):
            state = OccupancyStateData(
                state=OccupancyState.OCCUPIED,
                confidence=0.5,
                transition_reason=f"test_{i}",
                previous_state=None,
            )
            engine._on_state_change("room1", state)

        # Limit to 3 (should return the last 3)
        limited = engine.get_occupancy_history(limit=3)
        assert len(limited) == 3
        assert limited[0].reason == "test_7"
        assert limited[1].reason == "test_8"
        assert limited[2].reason == "test_9"

    def test_history_limit_with_room_filter(self, mock_hass):
        """Limit works combined with room_id filter."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        store = MagicMock()
        store.get_occupancy_history.return_value = []
        engine = VirtualSensorEngine(mock_hass, store)

        # Add entries alternating rooms
        for i in range(10):
            room = "room1" if i % 2 == 0 else "room2"
            state = OccupancyStateData(
                state=OccupancyState.OCCUPIED,
                confidence=0.5,
                transition_reason=f"test_{i}",
                previous_state=None,
            )
            engine._on_state_change(room, state)

        # room1 should have 5 entries (0, 2, 4, 6, 8), limit to 2
        limited = engine.get_occupancy_history(room_id="room1", limit=2)
        assert len(limited) == 2
        assert limited[0].reason == "test_6"
        assert limited[1].reason == "test_8"

    def test_history_pruning_on_load(self, mock_hass):
        """History pruning keeps only entries from the last 7 days."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        now = datetime.now()
        old_entry = {
            "room_id": "room1",
            "state": "occupied",
            "timestamp": (now - timedelta(days=10)).isoformat(),
            "reason": "old",
            "confidence": 0.5,
        }
        recent_entry = {
            "room_id": "room1",
            "state": "vacant",
            "timestamp": (now - timedelta(days=1)).isoformat(),
            "reason": "recent",
            "confidence": 0.0,
        }
        very_recent_entry = {
            "room_id": "room1",
            "state": "occupied",
            "timestamp": now.isoformat(),
            "reason": "now",
            "confidence": 0.8,
        }

        store = MagicMock()
        store.get_occupancy_history.return_value = [
            old_entry,
            recent_entry,
            very_recent_entry,
        ]

        engine = VirtualSensorEngine(mock_hass, store)

        # Manually call _load_history (normally called in async_start)
        import asyncio

        loop = asyncio.new_event_loop()
        try:
            loop.run_until_complete(engine._load_history())
        finally:
            loop.close()

        # Old entry should be pruned
        history = engine.get_occupancy_history(limit=100)
        assert len(history) == 2
        assert history[0].reason == "recent"
        assert history[1].reason == "now"

    def test_history_deque_maxlen(self, mock_hass):
        """History deque respects maxlen of 2000."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        store = MagicMock()
        store.get_occupancy_history.return_value = []
        engine = VirtualSensorEngine(mock_hass, store)

        assert engine._occupancy_history.maxlen == 2000


class TestTransitionMetadata:
    """Tests for transition reason and previous_state metadata on state callbacks."""

    def test_transition_reason_passed_through_callback(
        self, mock_hass, basic_config, state_changes
    ):
        """Transition reason is set on OccupancyStateData before callback."""
        # Sensor must be active so the threshold gate allows the transition
        mock_hass.states.get.return_value = MagicMock(state="on")
        machine, changes = _make_machine(mock_hass, basic_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._transition_to_occupied("motion from binary_sensor.test_motion")

        assert len(changes) == 1
        assert changes[0]["reason"] == "motion from binary_sensor.test_motion"
        assert changes[0]["previous_state"] == OccupancyState.VACANT

    def test_previous_state_set_on_checking_transition(
        self, mock_hass, basic_config, state_changes
    ):
        """Previous state is set when transitioning to CHECKING."""
        machine, changes = _make_machine(mock_hass, basic_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._state.state = OccupancyState.OCCUPIED
            machine._transition_to_checking("sensors clear")

        assert len(changes) == 1
        assert changes[0]["state"] == OccupancyState.CHECKING
        assert changes[0]["previous_state"] == OccupancyState.OCCUPIED
        assert changes[0]["reason"] == "sensors clear"

    def test_previous_state_set_on_vacant_transition(
        self, mock_hass, basic_config, state_changes
    ):
        """Previous state is set when transitioning to VACANT."""
        machine, changes = _make_machine(mock_hass, basic_config, state_changes)

        machine._state.state = OccupancyState.CHECKING
        machine._transition_to_vacant("checking timeout")

        assert len(changes) == 1
        assert changes[0]["state"] == OccupancyState.VACANT
        assert changes[0]["previous_state"] == OccupancyState.CHECKING
        assert changes[0]["reason"] == "checking timeout"

    def test_manual_set_state_passes_metadata(
        self, mock_hass, basic_config, state_changes
    ):
        """Manual set_state passes reason and previous_state."""
        machine, changes = _make_machine(mock_hass, basic_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine.set_state(OccupancyState.OCCUPIED, "manual override")

        assert len(changes) == 1
        assert changes[0]["reason"] == "manual override"
        assert changes[0]["previous_state"] == OccupancyState.VACANT
