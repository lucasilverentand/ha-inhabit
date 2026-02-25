"""Unit tests for sensor correlation tracker."""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.engine.sensor_reliability import (
    CORRELATION_WINDOW,
    CorrelationRecord,
    SensorCorrelationTracker,
    SensorAccuracyRecord,
    MIN_WEIGHT_MULTIPLIER,
)
from custom_components.inhabit.models.virtual_sensor import (
    SensorBinding,
    VirtualSensorConfig,
)


class TestCorrelationRecord:
    """Tests for CorrelationRecord dataclass."""

    def test_new_record_defaults(self):
        """New records have zero counts."""
        record = CorrelationRecord(entity_id="binary_sensor.motion")
        assert record.co_fires == 0
        assert record.solo_fires == 0

    def test_total_fires(self):
        """Total fires sums co and solo."""
        record = CorrelationRecord(
            entity_id="sensor.test",
            co_fires=5,
            solo_fires=3,
        )
        assert record.total_fires == 8

    def test_solo_fire_rate_new_sensor(self):
        """New sensors with no fires have rate 0.0."""
        record = CorrelationRecord(entity_id="sensor.new")
        assert record.solo_fire_rate == 0.0

    def test_solo_fire_rate_all_solo(self):
        """All-solo sensor has rate 1.0."""
        record = CorrelationRecord(
            entity_id="sensor.lonely",
            co_fires=0,
            solo_fires=10,
        )
        assert record.solo_fire_rate == 1.0

    def test_solo_fire_rate_all_co(self):
        """All-co-fire sensor has rate 0.0."""
        record = CorrelationRecord(
            entity_id="sensor.social",
            co_fires=10,
            solo_fires=0,
        )
        assert record.solo_fire_rate == 0.0

    def test_solo_fire_rate_mixed(self):
        """Mixed fires give proportional rate."""
        record = CorrelationRecord(
            entity_id="sensor.mixed",
            co_fires=6,
            solo_fires=4,
        )
        assert record.solo_fire_rate == pytest.approx(0.4)

    def test_to_dict(self):
        """Test serialization to dict."""
        record = CorrelationRecord(
            entity_id="sensor.test",
            co_fires=5,
            solo_fires=3,
        )
        d = record.to_dict()
        assert d["entity_id"] == "sensor.test"
        assert d["co_fires"] == 5
        assert d["solo_fires"] == 3

    def test_from_dict(self):
        """Test deserialization from dict."""
        data = {
            "entity_id": "sensor.test",
            "co_fires": 5,
            "solo_fires": 3,
        }
        record = CorrelationRecord.from_dict(data)
        assert record.entity_id == "sensor.test"
        assert record.co_fires == 5
        assert record.solo_fires == 3

    def test_from_dict_defaults(self):
        """Test deserialization with missing fields uses defaults."""
        record = CorrelationRecord.from_dict({})
        assert record.entity_id == ""
        assert record.co_fires == 0
        assert record.solo_fires == 0


class TestSensorCorrelationTracker:
    """Tests for SensorCorrelationTracker."""

    def test_unknown_sensor_solo_rate(self):
        """Unknown sensors return solo-fire rate 0.0."""
        tracker = SensorCorrelationTracker()
        assert tracker.get_solo_fire_rate("sensor.unknown") == 0.0

    def test_co_fire_within_window(self):
        """Two sensors firing within window both get co_fire."""
        tracker = SensorCorrelationTracker(window=10.0)

        tracker.on_sensor_activation("sensor.a")
        tracker.on_sensor_activation("sensor.b")

        records = tracker.get_all_records()
        # sensor.b co-fired with sensor.a -> both get co_fires
        assert records["sensor.a"].co_fires >= 1
        assert records["sensor.b"].co_fires >= 1

    def test_solo_fire_after_window_expires(self):
        """Single sensor activation without co-fire within window becomes solo_fire."""
        # Use a very short window
        tracker = SensorCorrelationTracker(window=0.0)

        tracker.on_sensor_activation("sensor.lonely")
        # Fire another sensor - triggers expiry of first
        tracker.on_sensor_activation("sensor.other")

        records = tracker.get_all_records()
        assert records["sensor.lonely"].solo_fires >= 1

    def test_three_sensors_co_fire(self):
        """Three sensors firing within window all get co_fires."""
        tracker = SensorCorrelationTracker(window=10.0)

        tracker.on_sensor_activation("sensor.a")
        tracker.on_sensor_activation("sensor.b")
        tracker.on_sensor_activation("sensor.c")

        records = tracker.get_all_records()
        # All should have at least one co-fire
        assert records["sensor.a"].co_fires >= 1
        assert records["sensor.b"].co_fires >= 1
        assert records["sensor.c"].co_fires >= 1

    def test_same_sensor_repeated_not_co_fire(self):
        """Same sensor firing twice doesn't co-fire with itself."""
        tracker = SensorCorrelationTracker(window=10.0)

        tracker.on_sensor_activation("sensor.a")
        tracker.on_sensor_activation("sensor.a")

        records = tracker.get_all_records()
        # Should have no co-fires (can't co-fire with itself)
        assert records["sensor.a"].co_fires == 0

    def test_persistence_round_trip(self):
        """save_records / load_records preserves data."""
        tracker = SensorCorrelationTracker()

        tracker._records["sensor.a"] = CorrelationRecord(
            entity_id="sensor.a",
            co_fires=10,
            solo_fires=5,
        )
        tracker._records["sensor.b"] = CorrelationRecord(
            entity_id="sensor.b",
            co_fires=20,
            solo_fires=0,
        )

        saved = tracker.save_records()

        tracker2 = SensorCorrelationTracker()
        tracker2.load_records(saved)

        records = tracker2.get_all_records()
        assert records["sensor.a"].co_fires == 10
        assert records["sensor.a"].solo_fires == 5
        assert records["sensor.b"].co_fires == 20
        assert records["sensor.b"].solo_fires == 0

    def test_get_record_known(self):
        """get_record returns record for known sensor."""
        tracker = SensorCorrelationTracker()
        tracker._records["sensor.a"] = CorrelationRecord(
            entity_id="sensor.a", co_fires=5, solo_fires=2
        )
        record = tracker.get_record("sensor.a")
        assert record is not None
        assert record.co_fires == 5

    def test_get_record_unknown(self):
        """get_record returns None for unknown sensor."""
        tracker = SensorCorrelationTracker()
        assert tracker.get_record("sensor.unknown") is None

    def test_get_all_records_returns_copy(self):
        """get_all_records returns a new dict, not the internal one."""
        tracker = SensorCorrelationTracker()
        tracker._records["sensor.x"] = CorrelationRecord(entity_id="sensor.x")

        records = tracker.get_all_records()
        records["sensor.y"] = CorrelationRecord(entity_id="sensor.y")

        assert "sensor.y" not in tracker._records


class TestCorrelationInStateMachine:
    """Tests for correlation tracker integration with state machine."""

    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        hass = MagicMock()
        hass.states = MagicMock()
        hass.loop = MagicMock()

        hass._scheduled_callbacks = []

        def mock_call_later(delay, callback):
            cancel = MagicMock()
            hass._scheduled_callbacks.append((delay, callback, cancel))
            return cancel

        hass.loop.call_later = mock_call_later

        return hass

    @pytest.fixture
    def multi_sensor_config(self):
        """Config with two motion sensors for correlation testing."""
        return VirtualSensorConfig(
            room_id="test_room",
            floor_plan_id="test_fp",
            enabled=True,
            motion_timeout=120,
            checking_timeout=30,
            motion_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.motion_a",
                    sensor_type="motion",
                    weight=1.0,
                ),
                SensorBinding(
                    entity_id="binary_sensor.motion_b",
                    sensor_type="motion",
                    weight=1.0,
                ),
            ],
            door_sensors=[],
            door_seals_room=False,
        )

    @pytest.fixture
    def state_changes(self):
        """Track state changes."""
        changes = []

        def on_change(state, reason=""):
            changes.append(state)

        return changes, on_change

    def test_state_machine_has_correlation_tracker(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """State machine creates a correlation tracker."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, multi_sensor_config, on_change)

        assert machine.correlation_tracker is not None
        assert isinstance(machine.correlation_tracker, SensorCorrelationTracker)

    def test_motion_event_feeds_correlation_tracker(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """Motion events feed the correlation tracker."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        STATE_ON = "on"
        STATE_OFF = "off"

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, multi_sensor_config, on_change)

        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        event = MagicMock()
        event.data = {
            "entity_id": "binary_sensor.motion_a",
            "new_state": MagicMock(state=STATE_ON),
        }

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._handle_motion_event(event)

        records = machine.correlation_tracker.get_all_records()
        assert "binary_sensor.motion_a" in records

    def test_high_solo_rate_reduces_confidence(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """Sensors with high solo-fire rate reduce confidence."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, multi_sensor_config, on_change)

        # Set motion_a as a solo-fire sensor (high noise, unreliable)
        machine._correlation_tracker._records["binary_sensor.motion_a"] = (
            CorrelationRecord(
                entity_id="binary_sensor.motion_a",
                co_fires=0,
                solo_fires=100,
            )
        )
        # motion_b has no correlation data (solo_rate = 0.0, factor = 1.0)

        machine._state.contributing_sensors = ["binary_sensor.motion_a"]

        confidence = machine._calculate_confidence()

        # motion_a: weight=1.0 * reliability=1.0 * correlation_factor=(1 - 1.0*0.5) = 0.5
        # motion_b: weight=1.0 * reliability=1.0 * correlation_factor=1.0 = 1.0
        # active = 0.5 (only motion_a is contributing)
        # total = 0.5 + 1.0 = 1.5
        # reliability_confidence = 0.5 / 1.5 = 0.333
        expected = 0.5 / 1.5
        assert confidence == pytest.approx(expected, abs=0.01)

    def test_zero_solo_rate_no_penalty(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """Sensors with zero solo-fire rate have no penalty."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, multi_sensor_config, on_change)

        # Set both sensors as perfect co-firers
        machine._correlation_tracker._records["binary_sensor.motion_a"] = (
            CorrelationRecord(
                entity_id="binary_sensor.motion_a",
                co_fires=50,
                solo_fires=0,
            )
        )
        machine._correlation_tracker._records["binary_sensor.motion_b"] = (
            CorrelationRecord(
                entity_id="binary_sensor.motion_b",
                co_fires=50,
                solo_fires=0,
            )
        )

        machine._state.contributing_sensors = [
            "binary_sensor.motion_a",
            "binary_sensor.motion_b",
        ]

        confidence = machine._calculate_confidence()

        # Both sensors: weight=1.0 * reliability=1.0 * correlation=1.0 = 1.0
        # active = 2.0, total = 2.0
        # reliability_confidence = 1.0
        assert confidence == pytest.approx(1.0, abs=0.01)
