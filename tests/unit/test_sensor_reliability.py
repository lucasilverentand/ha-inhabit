"""Unit tests for sensor reliability tracker."""

from __future__ import annotations

import time
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

from custom_components.inhabit.engine.sensor_reliability import (
    CONFIRMATION_WINDOW,
    MIN_WEIGHT_MULTIPLIER,
    PendingActivation,
    SensorAccuracyRecord,
    SensorReliabilityTracker,
)
from custom_components.inhabit.models.virtual_sensor import (
    SensorBinding,
    VirtualSensorConfig,
)

STATE_ON = "on"
STATE_OFF = "off"


class TestSensorAccuracyRecord:
    """Tests for SensorAccuracyRecord dataclass."""

    def test_new_record_defaults(self):
        """New records have zero counts."""
        record = SensorAccuracyRecord(entity_id="binary_sensor.motion")
        assert record.true_positives == 0
        assert record.false_positives == 0
        assert record.true_negatives == 0
        assert record.false_negatives == 0
        assert record.unavailable_count == 0

    def test_total_events(self):
        """Total events sums all classified events."""
        record = SensorAccuracyRecord(
            entity_id="sensor.test",
            true_positives=5,
            false_positives=2,
            true_negatives=10,
            false_negatives=3,
        )
        assert record.total_events == 20

    def test_accuracy_new_sensor(self):
        """New sensors with no events have accuracy 1.0."""
        record = SensorAccuracyRecord(entity_id="sensor.new")
        assert record.accuracy == 1.0

    def test_accuracy_perfect(self):
        """Perfect sensor has accuracy 1.0."""
        record = SensorAccuracyRecord(
            entity_id="sensor.perfect",
            true_positives=10,
            true_negatives=10,
        )
        assert record.accuracy == 1.0

    def test_accuracy_unreliable(self):
        """Unreliable sensor has low accuracy."""
        record = SensorAccuracyRecord(
            entity_id="sensor.bad",
            true_positives=1,
            false_positives=9,
        )
        assert record.accuracy == pytest.approx(0.1)

    def test_accuracy_mixed(self):
        """Mixed results give proportional accuracy."""
        record = SensorAccuracyRecord(
            entity_id="sensor.mixed",
            true_positives=3,
            false_positives=1,
            true_negatives=4,
            false_negatives=2,
        )
        # 7 correct out of 10
        assert record.accuracy == pytest.approx(0.7)

    def test_effective_weight_multiplier_perfect(self):
        """Perfect sensor gets multiplier 1.0."""
        record = SensorAccuracyRecord(
            entity_id="sensor.perfect",
            true_positives=10,
            true_negatives=10,
        )
        assert record.effective_weight_multiplier == 1.0

    def test_effective_weight_multiplier_clamped(self):
        """Very unreliable sensor is clamped at MIN_WEIGHT_MULTIPLIER."""
        record = SensorAccuracyRecord(
            entity_id="sensor.terrible",
            true_positives=0,
            false_positives=100,
        )
        assert record.accuracy == 0.0
        assert record.effective_weight_multiplier == MIN_WEIGHT_MULTIPLIER

    def test_effective_weight_multiplier_moderate(self):
        """Moderately reliable sensor gets proportional multiplier."""
        record = SensorAccuracyRecord(
            entity_id="sensor.ok",
            true_positives=6,
            false_positives=4,
        )
        # accuracy = 0.6, which is > MIN_WEIGHT_MULTIPLIER
        assert record.effective_weight_multiplier == pytest.approx(0.6)

    def test_to_dict(self):
        """Test serialization to dict."""
        record = SensorAccuracyRecord(
            entity_id="sensor.test",
            true_positives=5,
            false_positives=2,
            true_negatives=10,
            false_negatives=3,
            unavailable_count=1,
        )
        d = record.to_dict()
        assert d["entity_id"] == "sensor.test"
        assert d["true_positives"] == 5
        assert d["false_positives"] == 2
        assert d["true_negatives"] == 10
        assert d["false_negatives"] == 3
        assert d["unavailable_count"] == 1

    def test_from_dict(self):
        """Test deserialization from dict."""
        data = {
            "entity_id": "sensor.test",
            "true_positives": 5,
            "false_positives": 2,
            "true_negatives": 10,
            "false_negatives": 3,
            "unavailable_count": 1,
        }
        record = SensorAccuracyRecord.from_dict(data)
        assert record.entity_id == "sensor.test"
        assert record.true_positives == 5
        assert record.false_positives == 2
        assert record.true_negatives == 10
        assert record.false_negatives == 3
        assert record.unavailable_count == 1

    def test_from_dict_defaults(self):
        """Test deserialization with missing fields uses defaults."""
        record = SensorAccuracyRecord.from_dict({})
        assert record.entity_id == ""
        assert record.true_positives == 0
        assert record.false_positives == 0


class TestSensorReliabilityTracker:
    """Tests for SensorReliabilityTracker."""

    def test_new_sensor_reliability(self):
        """Unknown sensors return reliability 1.0."""
        tracker = SensorReliabilityTracker()
        assert tracker.get_reliability("sensor.unknown") == 1.0

    def test_new_sensor_effective_weight(self):
        """Unknown sensors return base weight unchanged."""
        tracker = SensorReliabilityTracker()
        assert tracker.get_effective_weight("sensor.unknown", 1.5) == 1.5

    def test_confirmed_activations(self):
        """Two sensors firing within window both get true_positive."""
        tracker = SensorReliabilityTracker(confirmation_window=30.0)

        tracker.on_sensor_activation("sensor.a")
        tracker.on_sensor_activation("sensor.b")

        records = tracker.get_all_records()
        assert records["sensor.a"].true_positives == 1
        assert records["sensor.b"].true_positives == 1

    def test_unconfirmed_activation_false_positive(self):
        """Single sensor activation without confirmation becomes false_positive."""
        # Use a very short window for testing
        tracker = SensorReliabilityTracker(confirmation_window=0.0)

        # First activation
        tracker.on_sensor_activation("sensor.lonely")

        # Trigger expiry by adding another activation after window
        tracker.on_sensor_activation("sensor.other")

        records = tracker.get_all_records()
        assert records["sensor.lonely"].false_positives == 1

    def test_confirmation_window_respected(self):
        """Activations outside the window don't confirm each other."""
        tracker = SensorReliabilityTracker(confirmation_window=0.0)

        tracker.on_sensor_activation("sensor.a")
        # Window is 0 seconds, so sensor.b is outside the window
        tracker.on_sensor_activation("sensor.b")

        records = tracker.get_all_records()
        # sensor.a should have been expired as false_positive since window=0
        assert records["sensor.a"].false_positives >= 1

    def test_effective_weight_applies_multiplier(self):
        """Effective weight = base_weight * multiplier."""
        tracker = SensorReliabilityTracker()

        # Manually create a record with known accuracy
        tracker._records["sensor.test"] = SensorAccuracyRecord(
            entity_id="sensor.test",
            true_positives=7,
            false_positives=3,
        )
        # accuracy = 0.7, so multiplier = 0.7
        effective = tracker.get_effective_weight("sensor.test", 2.0)
        assert effective == pytest.approx(1.4)

    def test_effective_weight_clamped(self):
        """Effective weight never drops below base_weight * MIN_WEIGHT_MULTIPLIER."""
        tracker = SensorReliabilityTracker()

        tracker._records["sensor.bad"] = SensorAccuracyRecord(
            entity_id="sensor.bad",
            true_positives=0,
            false_positives=100,
        )
        effective = tracker.get_effective_weight("sensor.bad", 2.0)
        assert effective == pytest.approx(2.0 * MIN_WEIGHT_MULTIPLIER)

    def test_get_reliability_known_sensor(self):
        """get_reliability returns accuracy for known sensors."""
        tracker = SensorReliabilityTracker()

        tracker._records["sensor.known"] = SensorAccuracyRecord(
            entity_id="sensor.known",
            true_positives=8,
            false_positives=2,
        )
        assert tracker.get_reliability("sensor.known") == pytest.approx(0.8)

    def test_get_reliability_unknown_sensor(self):
        """get_reliability returns 1.0 for unknown sensors."""
        tracker = SensorReliabilityTracker()
        assert tracker.get_reliability("sensor.never_seen") == 1.0

    def test_persistence_round_trip(self):
        """save_records / load_records preserves data."""
        tracker = SensorReliabilityTracker()

        tracker._records["sensor.a"] = SensorAccuracyRecord(
            entity_id="sensor.a",
            true_positives=10,
            false_positives=2,
            true_negatives=5,
            false_negatives=1,
            unavailable_count=3,
        )
        tracker._records["sensor.b"] = SensorAccuracyRecord(
            entity_id="sensor.b",
            true_positives=20,
        )

        saved = tracker.save_records()

        # Create a new tracker and load
        tracker2 = SensorReliabilityTracker()
        tracker2.load_records(saved)

        assert tracker2.get_reliability("sensor.a") == tracker.get_reliability("sensor.a")
        records2 = tracker2.get_all_records()
        assert records2["sensor.a"].true_positives == 10
        assert records2["sensor.a"].false_positives == 2
        assert records2["sensor.a"].true_negatives == 5
        assert records2["sensor.a"].false_negatives == 1
        assert records2["sensor.a"].unavailable_count == 3
        assert records2["sensor.b"].true_positives == 20

    def test_on_sensor_deactivation_creates_record(self):
        """Deactivation creates a record if one doesn't exist."""
        tracker = SensorReliabilityTracker()
        tracker.on_sensor_deactivation("sensor.new")
        assert "sensor.new" in tracker.get_all_records()

    def test_multiple_confirmations(self):
        """Multiple sensors confirming each other within window."""
        tracker = SensorReliabilityTracker(confirmation_window=30.0)

        tracker.on_sensor_activation("sensor.a")
        tracker.on_sensor_activation("sensor.b")
        tracker.on_sensor_activation("sensor.c")

        records = tracker.get_all_records()
        # sensor.a is confirmed by sensor.b -> a gets 1 TP
        # sensor.b confirms sensor.a (gets 1 TP from confirming a)
        # sensor.c confirms both pending unconfirmed (sensor.b) -> b gets 1 TP, c gets 1 TP
        # Note: sensor.a was already confirmed, so sensor.c only confirms sensor.b
        assert records["sensor.a"].true_positives == 1
        assert records["sensor.b"].true_positives >= 1
        assert records["sensor.c"].true_positives >= 1

    def test_get_all_records_returns_copy(self):
        """get_all_records returns a new dict, not the internal one."""
        tracker = SensorReliabilityTracker()
        tracker._records["sensor.x"] = SensorAccuracyRecord(entity_id="sensor.x")

        records = tracker.get_all_records()
        records["sensor.y"] = SensorAccuracyRecord(entity_id="sensor.y")

        # Internal records should not be affected
        assert "sensor.y" not in tracker._records

    def test_load_empty_records(self):
        """Loading empty data doesn't break anything."""
        tracker = SensorReliabilityTracker()
        tracker.load_records({})
        assert len(tracker.get_all_records()) == 0

    def test_save_empty_records(self):
        """Saving with no records returns empty dict."""
        tracker = SensorReliabilityTracker()
        saved = tracker.save_records()
        assert saved == {}


class TestSensorReliabilityInStateMachine:
    """Tests for reliability tracker integration with state machine."""

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
        """Config with two motion sensors for reliability testing."""
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

        def on_change(state):
            changes.append(state)

        return changes, on_change

    def test_state_machine_has_reliability_tracker(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """State machine creates a reliability tracker."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, multi_sensor_config, on_change)

        assert machine.reliability_tracker is not None
        assert isinstance(machine.reliability_tracker, SensorReliabilityTracker)

    def test_motion_event_feeds_tracker(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """Motion events feed the reliability tracker."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, multi_sensor_config, on_change)

        # Simulate motion event
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

        records = machine.reliability_tracker.get_all_records()
        assert "binary_sensor.motion_a" in records

    def test_reliability_affects_confidence(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """Unreliable sensors reduce confidence calculation."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, multi_sensor_config, on_change)

        # Set one sensor as unreliable
        machine._reliability_tracker._records["binary_sensor.motion_a"] = (
            SensorAccuracyRecord(
                entity_id="binary_sensor.motion_a",
                true_positives=0,
                false_positives=100,
            )
        )

        # Only the unreliable sensor is contributing
        machine._state.contributing_sensors = ["binary_sensor.motion_a"]

        confidence = machine._calculate_confidence()

        # With motion_a unreliable (weight * 0.3) and motion_b not contributing,
        # confidence = (1.0 * 0.3) / (1.0 * 0.3 + 1.0 * 1.0) = 0.3 / 1.3
        expected = (1.0 * MIN_WEIGHT_MULTIPLIER) / (
            1.0 * MIN_WEIGHT_MULTIPLIER + 1.0
        )
        assert confidence == pytest.approx(expected, abs=0.01)

    def test_state_change_includes_reliability(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """State change notifications include sensor reliability data."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, multi_sensor_config, on_change)

        # Set up contributing sensors and reliability
        machine._state.contributing_sensors = ["binary_sensor.motion_a"]
        machine._reliability_tracker._records["binary_sensor.motion_a"] = (
            SensorAccuracyRecord(
                entity_id="binary_sensor.motion_a",
                true_positives=8,
                false_positives=2,
            )
        )

        machine._notify_state_change()

        assert len(changes) == 1
        state_data = changes[0]
        assert "binary_sensor.motion_a" in state_data.sensor_reliability
        assert state_data.sensor_reliability["binary_sensor.motion_a"] == pytest.approx(
            0.8
        )
