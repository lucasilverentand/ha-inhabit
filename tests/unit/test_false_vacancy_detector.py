"""Unit tests for the false vacancy detector."""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.engine.false_vacancy_detector import (
    LARGE_BUMP,
    MAX_CHECKING_TIMEOUT,
    MIN_CHECKING_TIMEOUT,
    MIN_TRANSITIONS_FOR_RATE,
    RAPID_REOCCUPANCY_WINDOW,
    SMALL_BUMP,
    FalseVacancyDetector,
    FalseVacancyEvent,
    RoomVacancyStats,
)

STATE_ON = "on"
STATE_OFF = "off"


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = MagicMock()
    hass.bus = MagicMock()
    return hass


@pytest.fixture
def detector(mock_hass):
    """Create a FalseVacancyDetector instance."""
    return FalseVacancyDetector(mock_hass)


class TestFalseVacancyDetection:
    """Tests for detecting false vacancy events."""

    def test_rapid_reoccupancy_detected_within_window(self, detector):
        """VACANT -> OCCUPIED within 30s should be detected as false vacancy."""
        # Go vacant
        result = detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.VACANT,
            previous_state=OccupancyState.CHECKING,
            checking_timeout=30,
        )
        assert result is None

        # Immediately go occupied (within the window)
        result = detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.OCCUPIED,
            previous_state=OccupancyState.VACANT,
            checking_timeout=30,
        )
        assert result is not None
        assert result.room_id == "room1"
        assert result.gap_seconds <= RAPID_REOCCUPANCY_WINDOW

    def test_reoccupancy_outside_window_not_flagged(self, detector):
        """VACANT -> OCCUPIED after 60s should NOT be detected."""
        # Go vacant
        detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.VACANT,
            previous_state=OccupancyState.CHECKING,
            checking_timeout=30,
        )

        # Simulate time passing beyond the window
        past_time = datetime.now() - timedelta(seconds=60)
        detector._last_vacant_time["room1"] = past_time

        result = detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.OCCUPIED,
            previous_state=OccupancyState.VACANT,
            checking_timeout=30,
        )
        assert result is None

    def test_non_vacant_to_occupied_not_flagged(self, detector):
        """CHECKING -> OCCUPIED should NOT be detected as false vacancy."""
        result = detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.OCCUPIED,
            previous_state=OccupancyState.CHECKING,
            checking_timeout=30,
        )
        assert result is None

    def test_vacancy_transition_counted(self, detector):
        """Each transition to VACANT should increment total_vacancy_transitions."""
        for _ in range(5):
            detector.on_state_change(
                room_id="room1",
                new_state=OccupancyState.VACANT,
                previous_state=OccupancyState.CHECKING,
                checking_timeout=30,
            )

        stats = detector.get_stats("room1")
        assert stats is not None
        assert stats.total_vacancy_transitions == 5


class TestCheckingTimeoutBump:
    """Tests for the checking timeout bump logic."""

    def test_false_vacancy_bumps_checking_timeout(self, detector):
        """A false vacancy should bump checking timeout by SMALL_BUMP."""
        detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.VACANT,
            previous_state=OccupancyState.CHECKING,
            checking_timeout=30,
        )
        detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.OCCUPIED,
            previous_state=OccupancyState.VACANT,
            checking_timeout=30,
        )

        bump = detector.get_checking_timeout_bump("room1")
        assert bump == SMALL_BUMP

    def test_high_rate_bumps_aggressively(self, detector):
        """Rate > 15% with enough transitions should use LARGE_BUMP."""
        # Build up enough transitions to have a meaningful rate
        # We need total_vacancy_transitions >= MIN_TRANSITIONS_FOR_RATE
        # and false_vacancy_count / total > HIGH_RATE_THRESHOLD

        stats = detector._get_or_create_stats("room1")
        # Set up state so rate will be high: 5 false / 25 total = 20% > 15%
        stats.total_vacancy_transitions = 25
        stats.false_vacancy_count = 5

        # Now record another false vacancy — rate will be 5/25 = 20%
        detector._last_vacant_time["room1"] = datetime.now()
        result = detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.OCCUPIED,
            previous_state=OccupancyState.VACANT,
            checking_timeout=30,
        )

        assert result is not None
        # The rate at the time of check was 20% (before incrementing false_vacancy_count)
        # After recording: false_vacancy_count = 6, but rate is computed from the stats
        # which already had 5/25=20%. The increment happens, then rate is checked.
        # Actually, the false_vacancy_count is incremented *first*, then rate is computed.
        # So: 6/25 = 24% > 15% => LARGE_BUMP
        assert stats.checking_timeout_bump == LARGE_BUMP

    def test_converged_rate_stops_bumping(self, detector):
        """Rate < 5% with enough data should NOT bump."""
        stats = detector._get_or_create_stats("room1")
        # Set up: 0 false out of 100 transitions = 0% (converged)
        stats.total_vacancy_transitions = 100
        stats.false_vacancy_count = 0

        detector._last_vacant_time["room1"] = datetime.now()
        result = detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.OCCUPIED,
            previous_state=OccupancyState.VACANT,
            checking_timeout=30,
        )

        assert result is not None
        # 1/100 = 1% < 5%, converged => bump = 0
        assert stats.checking_timeout_bump == 0

    def test_bump_clamped_at_maximum(self, detector):
        """Bump should not exceed MAX_CHECKING_TIMEOUT - MIN_CHECKING_TIMEOUT."""
        stats = detector._get_or_create_stats("room1")
        # Set the bump very high already
        stats.checking_timeout_bump = MAX_CHECKING_TIMEOUT - MIN_CHECKING_TIMEOUT - 1

        detector._last_vacant_time["room1"] = datetime.now()
        detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.OCCUPIED,
            previous_state=OccupancyState.VACANT,
            checking_timeout=30,
        )

        max_bump = MAX_CHECKING_TIMEOUT - MIN_CHECKING_TIMEOUT
        assert stats.checking_timeout_bump <= max_bump


class TestFalseVacancyRate:
    """Tests for the false vacancy rate calculation."""

    def test_false_vacancy_rate_calculation(self):
        """Rate should be false_count / total."""
        stats = RoomVacancyStats(
            room_id="room1",
            total_vacancy_transitions=40,
            false_vacancy_count=8,
        )
        assert stats.false_vacancy_rate == pytest.approx(0.2)

    def test_rate_requires_minimum_transitions(self):
        """Rate should return 0.0 with < MIN_TRANSITIONS_FOR_RATE transitions."""
        stats = RoomVacancyStats(
            room_id="room1",
            total_vacancy_transitions=MIN_TRANSITIONS_FOR_RATE - 1,
            false_vacancy_count=5,
        )
        assert stats.false_vacancy_rate == 0.0


class TestPersistence:
    """Tests for save/load data round-trip."""

    def test_persistence_round_trip(self, detector):
        """save_data/load_data should preserve all state."""
        # Create some state
        detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.VACANT,
            previous_state=OccupancyState.CHECKING,
            checking_timeout=30,
        )
        detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.OCCUPIED,
            previous_state=OccupancyState.VACANT,
            checking_timeout=30,
        )

        # Save
        data = detector.save_data()

        # Create a new detector and load
        new_hass = MagicMock()
        new_hass.bus = MagicMock()
        new_detector = FalseVacancyDetector(new_hass)
        new_detector.load_data(data)

        # Verify stats survived
        stats = new_detector.get_stats("room1")
        assert stats is not None
        assert stats.total_vacancy_transitions == 1
        assert stats.false_vacancy_count == 1
        assert stats.checking_timeout_bump == SMALL_BUMP

        # Verify events survived
        assert "room1" in new_detector._false_vacancy_events
        assert len(new_detector._false_vacancy_events["room1"]) == 1

    def test_event_history_bounded(self, detector):
        """Event deque should respect maxlen=50."""
        for i in range(60):
            detector._last_vacant_time["room1"] = datetime.now()
            # Go vacant
            detector.on_state_change(
                room_id="room1",
                new_state=OccupancyState.VACANT,
                previous_state=OccupancyState.OCCUPIED,
                checking_timeout=30,
            )
            # Rapidly re-occupy
            detector.on_state_change(
                room_id="room1",
                new_state=OccupancyState.OCCUPIED,
                previous_state=OccupancyState.VACANT,
                checking_timeout=30,
            )

        events = detector._false_vacancy_events.get("room1")
        assert events is not None
        assert len(events) == 50  # maxlen respected


class TestHAEvent:
    """Tests for Home Assistant event firing."""

    def test_ha_event_fired(self, mock_hass, detector):
        """inhabit_false_vacancy_detected event should be fired on detection."""
        detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.VACANT,
            previous_state=OccupancyState.CHECKING,
            checking_timeout=30,
        )
        detector.on_state_change(
            room_id="room1",
            new_state=OccupancyState.OCCUPIED,
            previous_state=OccupancyState.VACANT,
            checking_timeout=30,
        )

        mock_hass.bus.async_fire.assert_called_once()
        call_args = mock_hass.bus.async_fire.call_args
        assert call_args[0][0] == "inhabit_false_vacancy_detected"
        event_data = call_args[0][1]
        assert event_data["room_id"] == "room1"
        assert "gap_seconds" in event_data
        assert "checking_timeout_bump" in event_data
        assert "false_vacancy_rate" in event_data


class TestStateMachineBumpIntegration:
    """Tests for the checking_timeout_bump on the state machine."""

    def test_bump_applied_to_state_machine(self, mock_hass):
        """checking_timeout_bump setter should work on the state machine."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )
        from custom_components.inhabit.models.virtual_sensor import (
            SensorBinding,
            VirtualSensorConfig,
        )

        config = VirtualSensorConfig(
            room_id="test_room",
            floor_plan_id="test_fp",
            enabled=True,
            checking_timeout=30,
            motion_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.test_motion",
                    sensor_type="motion",
                    weight=1.0,
                ),
            ],
        )

        changes = []
        machine = OccupancyStateMachine(
            mock_hass, config, lambda state, reason="": changes.append(state.state)
        )

        assert machine.checking_timeout_bump == 0
        machine.checking_timeout_bump = 15
        assert machine.checking_timeout_bump == 15

    def test_bump_affects_checking_timer(self, mock_hass):
        """The bump should be added to the checking timeout when starting timer."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )
        from custom_components.inhabit.models.virtual_sensor import (
            SensorBinding,
            VirtualSensorConfig,
        )

        config = VirtualSensorConfig(
            room_id="test_room",
            floor_plan_id="test_fp",
            enabled=True,
            checking_timeout=30,
            motion_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.test_motion",
                    sensor_type="motion",
                    weight=1.0,
                ),
            ],
        )

        changes = []
        machine = OccupancyStateMachine(
            mock_hass, config, lambda state, reason="": changes.append(state.state)
        )
        machine.checking_timeout_bump = 10

        scheduled_calls = []

        def mock_async_call_later(hass, delay, callback):
            cancel = MagicMock()
            scheduled_calls.append((delay, callback, cancel))
            return cancel

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            mock_async_call_later,
        ):
            machine._state.state = OccupancyState.OCCUPIED
            machine._transition_to_checking("test")

            assert len(scheduled_calls) > 0
            delay, _callback, _cancel = scheduled_calls[-1]
            # checking_timeout (30) + bump (10) = 40
            assert delay == 40


class TestFalseVacancyEventDataclass:
    """Tests for FalseVacancyEvent serialization."""

    def test_event_to_dict_and_from_dict(self):
        """FalseVacancyEvent should round-trip through dict."""
        event = FalseVacancyEvent(
            room_id="room1",
            timestamp="2026-02-25T10:00:00",
            gap_seconds=12.5,
            checking_timeout_at_time=30,
        )
        data = event.to_dict()
        restored = FalseVacancyEvent.from_dict(data)
        assert restored.room_id == "room1"
        assert restored.timestamp == "2026-02-25T10:00:00"
        assert restored.gap_seconds == 12.5
        assert restored.checking_timeout_at_time == 30

    def test_event_from_dict_default_timeout(self):
        """FalseVacancyEvent.from_dict should default checking_timeout_at_time to 30."""
        data = {
            "room_id": "room1",
            "timestamp": "2026-02-25T10:00:00",
            "gap_seconds": 5.0,
        }
        event = FalseVacancyEvent.from_dict(data)
        assert event.checking_timeout_at_time == 30


class TestRoomVacancyStatsDataclass:
    """Tests for RoomVacancyStats serialization."""

    def test_stats_to_dict_and_from_dict(self):
        """RoomVacancyStats should round-trip through dict."""
        stats = RoomVacancyStats(
            room_id="room1",
            total_vacancy_transitions=50,
            false_vacancy_count=8,
            checking_timeout_bump=15,
        )
        data = stats.to_dict()
        restored = RoomVacancyStats.from_dict(data)
        assert restored.room_id == "room1"
        assert restored.total_vacancy_transitions == 50
        assert restored.false_vacancy_count == 8
        assert restored.checking_timeout_bump == 15
