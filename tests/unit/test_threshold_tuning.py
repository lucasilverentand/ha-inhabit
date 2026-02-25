"""Unit tests for threshold auto-tuning in the feedback controller."""

from __future__ import annotations

from datetime import datetime, timedelta
from unittest.mock import MagicMock

import pytest

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.engine.feedback_controller import (
    MAX_OCCUPIED_THRESHOLD,
    MIN_COOLDOWN_SECONDS,
    MIN_VACANT_THRESHOLD,
    THRESHOLD_OCCUPIED_STEP,
    THRESHOLD_TUNING_MIN_TRANSITIONS,
    THRESHOLD_VACANT_STEP,
    FeedbackController,
    ThresholdState,
)


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.bus = MagicMock()
    return hass


@pytest.fixture
def controller(mock_hass):
    return FeedbackController(mock_hass)


class TestThresholdState:
    """Tests for the ThresholdState dataclass."""

    def test_default_values(self):
        ts = ThresholdState(room_id="room_1")
        assert ts.occupied_threshold == 0.5
        assert ts.vacant_threshold == 0.1
        assert ts.false_positive_count == 0
        assert ts.false_negative_count == 0
        assert ts.total_transitions == 0

    def test_false_positive_rate_no_transitions(self):
        ts = ThresholdState(room_id="room_1")
        assert ts.false_positive_rate == 0.0

    def test_false_positive_rate(self):
        ts = ThresholdState(
            room_id="room_1",
            false_positive_count=5,
            total_transitions=100,
        )
        assert ts.false_positive_rate == pytest.approx(0.05)

    def test_false_negative_rate(self):
        ts = ThresholdState(
            room_id="room_1",
            false_negative_count=10,
            total_transitions=50,
        )
        assert ts.false_negative_rate == pytest.approx(0.2)

    def test_serialization_round_trip(self):
        ts = ThresholdState(
            room_id="room_1",
            occupied_threshold=0.6,
            vacant_threshold=0.08,
            false_positive_count=3,
            false_negative_count=2,
            total_transitions=50,
        )
        d = ts.to_dict()
        restored = ThresholdState.from_dict(d)
        assert restored.room_id == "room_1"
        assert restored.occupied_threshold == pytest.approx(0.6)
        assert restored.vacant_threshold == pytest.approx(0.08)
        assert restored.false_positive_count == 3
        assert restored.false_negative_count == 2
        assert restored.total_transitions == 50


class TestTuneThresholds:
    """Tests for the tune_thresholds method."""

    def test_tuning_skipped_below_min_transitions(self, controller):
        """Tuning is skipped when total_transitions < 20."""
        ts = controller._get_or_create_threshold_state("room_1")
        ts.total_transitions = 10
        ts.false_positive_count = 5
        original = ts.occupied_threshold

        controller.tune_thresholds("room_1")
        assert ts.occupied_threshold == original  # No change

    def test_false_positive_raises_occupied_threshold(self, controller):
        """High false positives raise occupied_threshold."""
        ts = controller._get_or_create_threshold_state("room_1")
        ts.total_transitions = 25
        ts.false_positive_count = 3
        original = ts.occupied_threshold

        controller.tune_thresholds("room_1")
        assert ts.occupied_threshold == pytest.approx(
            original + THRESHOLD_OCCUPIED_STEP
        )

    def test_false_negative_lowers_vacant_threshold(self, controller):
        """High false negatives lower vacant_threshold."""
        ts = controller._get_or_create_threshold_state("room_1")
        ts.total_transitions = 25
        ts.false_negative_count = 3
        original = ts.vacant_threshold

        controller.tune_thresholds("room_1")
        assert ts.vacant_threshold == pytest.approx(
            original - THRESHOLD_VACANT_STEP
        )

    def test_occupied_threshold_clamped_at_max(self, controller):
        """occupied_threshold is clamped at MAX_OCCUPIED_THRESHOLD."""
        ts = controller._get_or_create_threshold_state("room_1")
        ts.total_transitions = 100
        ts.false_positive_count = 50
        ts.occupied_threshold = MAX_OCCUPIED_THRESHOLD - 0.01

        controller.tune_thresholds("room_1")
        assert ts.occupied_threshold <= MAX_OCCUPIED_THRESHOLD

    def test_vacant_threshold_clamped_at_min(self, controller):
        """vacant_threshold is clamped at MIN_VACANT_THRESHOLD."""
        ts = controller._get_or_create_threshold_state("room_1")
        ts.total_transitions = 100
        ts.false_negative_count = 50
        ts.vacant_threshold = MIN_VACANT_THRESHOLD + 0.01

        controller.tune_thresholds("room_1")
        assert ts.vacant_threshold >= MIN_VACANT_THRESHOLD

    def test_both_counts_tune_both_thresholds(self, controller):
        """Both false positive and false negative counts adjust both thresholds."""
        ts = controller._get_or_create_threshold_state("room_1")
        ts.total_transitions = 30
        ts.false_positive_count = 2
        ts.false_negative_count = 2
        orig_occ = ts.occupied_threshold
        orig_vac = ts.vacant_threshold

        controller.tune_thresholds("room_1")
        assert ts.occupied_threshold > orig_occ
        assert ts.vacant_threshold < orig_vac


class TestTuningTriggeredByOverride:
    """Tests that overrides trigger threshold tuning."""

    def test_override_records_false_positive(self, controller):
        """false_occupancy override increments false_positive_count."""
        ts = controller._get_or_create_threshold_state("room_1")
        ts.total_transitions = 25

        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.0,
            contributing_sensors=[],
        )

        assert ts.false_positive_count == 1

    def test_override_records_false_negative(self, controller):
        """false_vacancy override increments false_negative_count."""
        ts = controller._get_or_create_threshold_state("room_1")
        ts.total_transitions = 25

        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.VACANT,
            new_state=OccupancyState.OCCUPIED,
            confidence=0.0,
            seal_probability=0.0,
            contributing_sensors=[],
        )

        assert ts.false_negative_count == 1


class TestThresholdPersistence:
    """Tests for threshold state persistence."""

    def test_threshold_state_persisted(self, controller):
        """Threshold states are included in save_data."""
        ts = controller._get_or_create_threshold_state("room_1")
        ts.total_transitions = 30
        ts.false_positive_count = 5
        ts.occupied_threshold = 0.55

        data = controller.save_data()
        assert "threshold_states" in data
        assert "room_1" in data["threshold_states"]
        assert data["threshold_states"]["room_1"]["occupied_threshold"] == 0.55

    def test_threshold_state_loaded(self, mock_hass):
        """Threshold states are restored from load_data."""
        data = {
            "threshold_states": {
                "room_1": {
                    "room_id": "room_1",
                    "occupied_threshold": 0.6,
                    "vacant_threshold": 0.05,
                    "false_positive_count": 10,
                    "false_negative_count": 3,
                    "total_transitions": 50,
                },
            },
        }
        controller = FeedbackController(mock_hass)
        controller.load_data(data)

        ts = controller.get_threshold_state("room_1")
        assert ts is not None
        assert ts.occupied_threshold == pytest.approx(0.6)
        assert ts.vacant_threshold == pytest.approx(0.05)
        assert ts.false_positive_count == 10
