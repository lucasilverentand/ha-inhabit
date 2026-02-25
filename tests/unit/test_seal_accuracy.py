"""Unit tests for seal accuracy learning."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.engine.feedback_controller import (
    MAX_SEAL_HALF_LIFE,
    MIN_SEAL_HALF_LIFE,
    SEAL_ACCURACY_MIN_EVENTS,
    SEAL_HALF_LIFE_ADJUST_FACTOR,
    FeedbackController,
    SealAccuracyTracker,
)
from custom_components.inhabit.const import OccupancyState


class TestSealAccuracyTracker:
    """Tests for SealAccuracyTracker dataclass."""

    def test_new_tracker_defaults(self):
        """New trackers have zero counts and no adjusted half-life."""
        tracker = SealAccuracyTracker(room_id="room_1")
        assert tracker.false_seal_count == 0
        assert tracker.false_break_count == 0
        assert tracker.correct_seal_count == 0
        assert tracker.correct_break_count == 0
        assert tracker.adjusted_half_life is None

    def test_total_events(self):
        """Total events sums all categories."""
        tracker = SealAccuracyTracker(
            room_id="room_1",
            false_seal_count=2,
            false_break_count=3,
            correct_seal_count=10,
            correct_break_count=5,
        )
        assert tracker.total_events == 20

    def test_seal_accuracy_new_room(self):
        """New rooms with no events have accuracy 1.0."""
        tracker = SealAccuracyTracker(room_id="room_1")
        assert tracker.seal_accuracy == 1.0

    def test_seal_accuracy_perfect(self):
        """All correct events give accuracy 1.0."""
        tracker = SealAccuracyTracker(
            room_id="room_1",
            correct_seal_count=10,
            correct_break_count=10,
        )
        assert tracker.seal_accuracy == 1.0

    def test_seal_accuracy_all_wrong(self):
        """All wrong events give accuracy 0.0."""
        tracker = SealAccuracyTracker(
            room_id="room_1",
            false_seal_count=5,
            false_break_count=5,
        )
        assert tracker.seal_accuracy == 0.0

    def test_seal_accuracy_mixed(self):
        """Mixed results give proportional accuracy."""
        tracker = SealAccuracyTracker(
            room_id="room_1",
            false_seal_count=2,
            false_break_count=3,
            correct_seal_count=10,
            correct_break_count=5,
        )
        # 15 correct out of 20
        assert tracker.seal_accuracy == pytest.approx(0.75)

    def test_false_seal_rate(self):
        """False seal rate is correct proportion."""
        tracker = SealAccuracyTracker(
            room_id="room_1",
            false_seal_count=4,
            correct_seal_count=16,
        )
        assert tracker.false_seal_rate == pytest.approx(0.2)

    def test_false_break_rate(self):
        """False break rate is correct proportion."""
        tracker = SealAccuracyTracker(
            room_id="room_1",
            false_break_count=3,
            correct_break_count=7,
        )
        assert tracker.false_break_rate == pytest.approx(0.3)

    def test_rates_zero_with_no_events(self):
        """Rates are 0.0 with no events."""
        tracker = SealAccuracyTracker(room_id="room_1")
        assert tracker.false_seal_rate == 0.0
        assert tracker.false_break_rate == 0.0

    def test_to_dict(self):
        """Test serialization to dict."""
        tracker = SealAccuracyTracker(
            room_id="room_1",
            false_seal_count=2,
            false_break_count=3,
            correct_seal_count=10,
            correct_break_count=5,
            adjusted_half_life=2400.0,
        )
        d = tracker.to_dict()
        assert d["room_id"] == "room_1"
        assert d["false_seal_count"] == 2
        assert d["false_break_count"] == 3
        assert d["correct_seal_count"] == 10
        assert d["correct_break_count"] == 5
        assert d["adjusted_half_life"] == 2400.0

    def test_from_dict(self):
        """Test deserialization from dict."""
        data = {
            "room_id": "room_1",
            "false_seal_count": 2,
            "false_break_count": 3,
            "correct_seal_count": 10,
            "correct_break_count": 5,
            "adjusted_half_life": 2400.0,
        }
        tracker = SealAccuracyTracker.from_dict(data)
        assert tracker.room_id == "room_1"
        assert tracker.false_seal_count == 2
        assert tracker.false_break_count == 3
        assert tracker.correct_seal_count == 10
        assert tracker.correct_break_count == 5
        assert tracker.adjusted_half_life == 2400.0

    def test_from_dict_defaults(self):
        """Test deserialization with missing fields uses defaults."""
        tracker = SealAccuracyTracker.from_dict({})
        assert tracker.room_id == ""
        assert tracker.false_seal_count == 0
        assert tracker.adjusted_half_life is None

    def test_from_dict_none_half_life(self):
        """Test deserialization with None adjusted_half_life."""
        tracker = SealAccuracyTracker.from_dict(
            {"room_id": "room_1", "adjusted_half_life": None}
        )
        assert tracker.adjusted_half_life is None


class TestFeedbackControllerSealAccuracy:
    """Tests for seal accuracy integration in FeedbackController."""

    @pytest.fixture
    def mock_hass(self):
        hass = MagicMock()
        hass.bus = MagicMock()
        return hass

    def test_record_seal_override_increments_false_seal(self, mock_hass):
        """record_seal_override increments false_seal_count."""
        controller = FeedbackController(mock_hass)
        controller.record_seal_override("room_1")

        tracker = controller.get_seal_accuracy("room_1")
        assert tracker is not None
        assert tracker.false_seal_count == 1

    def test_record_seal_break_reoccupancy_increments_false_break(self, mock_hass):
        """record_seal_break_reoccupancy increments false_break_count."""
        controller = FeedbackController(mock_hass)
        controller.record_seal_break_reoccupancy("room_1")

        tracker = controller.get_seal_accuracy("room_1")
        assert tracker is not None
        assert tracker.false_break_count == 1

    def test_record_seal_correct(self, mock_hass):
        """record_seal_correct increments correct counts."""
        controller = FeedbackController(mock_hass)
        controller.record_seal_correct("room_1", was_sealed=True)
        controller.record_seal_correct("room_1", was_sealed=False)

        tracker = controller.get_seal_accuracy("room_1")
        assert tracker.correct_seal_count == 1
        assert tracker.correct_break_count == 1

    def test_get_seal_accuracy_unknown_room(self, mock_hass):
        """get_seal_accuracy returns None for unknown room."""
        controller = FeedbackController(mock_hass)
        assert controller.get_seal_accuracy("unknown") is None

    def test_tuning_skipped_below_min_events(self, mock_hass):
        """Seal half-life tuning is skipped until minimum events reached."""
        controller = FeedbackController(mock_hass)

        # Record less than minimum events
        for _ in range(SEAL_ACCURACY_MIN_EVENTS - 1):
            controller.record_seal_override("room_1")

        tracker = controller.get_seal_accuracy("room_1")
        # adjusted_half_life should still be None (no tuning happened)
        assert tracker.adjusted_half_life is None

    def test_false_seal_shortens_half_life(self, mock_hass):
        """Many false seals shorten the half-life."""
        controller = FeedbackController(mock_hass)

        # Fill with enough events for tuning to kick in
        # Start with some correct events so we hit the threshold
        controller._seal_accuracy["room_1"] = SealAccuracyTracker(
            room_id="room_1",
            false_seal_count=8,
            correct_seal_count=2,
        )
        # Record one more false seal to trigger tuning
        controller.record_seal_override("room_1")

        tracker = controller.get_seal_accuracy("room_1")
        assert tracker.adjusted_half_life is not None
        # Should be shorter than default 3600s
        assert tracker.adjusted_half_life < 3600.0

    def test_false_break_lengthens_half_life(self, mock_hass):
        """Many false breaks lengthen the half-life."""
        controller = FeedbackController(mock_hass)

        # Start with enough events that include more false breaks
        controller._seal_accuracy["room_1"] = SealAccuracyTracker(
            room_id="room_1",
            false_break_count=8,
            correct_break_count=2,
        )
        # Record one more false break to trigger tuning
        controller.record_seal_break_reoccupancy("room_1")

        tracker = controller.get_seal_accuracy("room_1")
        assert tracker.adjusted_half_life is not None
        # Should be longer than default 3600s
        assert tracker.adjusted_half_life > 3600.0

    def test_half_life_clamped_to_min(self, mock_hass):
        """Adjusted half-life is clamped to MIN_SEAL_HALF_LIFE."""
        controller = FeedbackController(mock_hass)

        # Set an already-low half-life and trigger many false seals
        controller._seal_accuracy["room_1"] = SealAccuracyTracker(
            room_id="room_1",
            false_seal_count=100,
            correct_seal_count=5,
            adjusted_half_life=float(MIN_SEAL_HALF_LIFE),
        )
        controller.record_seal_override("room_1")

        tracker = controller.get_seal_accuracy("room_1")
        assert tracker.adjusted_half_life >= MIN_SEAL_HALF_LIFE

    def test_half_life_clamped_to_max(self, mock_hass):
        """Adjusted half-life is clamped to MAX_SEAL_HALF_LIFE."""
        controller = FeedbackController(mock_hass)

        # Set an already-high half-life and trigger many false breaks
        controller._seal_accuracy["room_1"] = SealAccuracyTracker(
            room_id="room_1",
            false_break_count=100,
            correct_break_count=5,
            adjusted_half_life=float(MAX_SEAL_HALF_LIFE),
        )
        controller.record_seal_break_reoccupancy("room_1")

        tracker = controller.get_seal_accuracy("room_1")
        assert tracker.adjusted_half_life <= MAX_SEAL_HALF_LIFE

    def test_get_adjusted_seal_half_life_default(self, mock_hass):
        """get_adjusted_seal_half_life returns base when no learning."""
        controller = FeedbackController(mock_hass)
        result = controller.get_adjusted_seal_half_life("room_1", 3600.0)
        assert result == 3600.0

    def test_get_adjusted_seal_half_life_learned(self, mock_hass):
        """get_adjusted_seal_half_life returns learned value."""
        controller = FeedbackController(mock_hass)
        controller._seal_accuracy["room_1"] = SealAccuracyTracker(
            room_id="room_1",
            adjusted_half_life=2400.0,
        )
        result = controller.get_adjusted_seal_half_life("room_1", 3600.0)
        assert result == 2400.0

    def test_get_adjusted_seal_half_life_clamps(self, mock_hass):
        """get_adjusted_seal_half_life clamps to valid range."""
        controller = FeedbackController(mock_hass)

        # Too low
        controller._seal_accuracy["room_1"] = SealAccuracyTracker(
            room_id="room_1",
            adjusted_half_life=100.0,
        )
        result = controller.get_adjusted_seal_half_life("room_1", 100.0)
        assert result == MIN_SEAL_HALF_LIFE

        # Too high
        controller._seal_accuracy["room_2"] = SealAccuracyTracker(
            room_id="room_2",
            adjusted_half_life=99999.0,
        )
        result = controller.get_adjusted_seal_half_life("room_2", 99999.0)
        assert result == MAX_SEAL_HALF_LIFE

    def test_override_with_seal_triggers_seal_accuracy(self, mock_hass):
        """Override with active seal records false_seal via record_override."""
        controller = FeedbackController(mock_hass)

        # Override from OCCUPIED->VACANT while sealed (seal_probability > 0)
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.6,
            contributing_sensors=["sensor.a"],
        )

        tracker = controller.get_seal_accuracy("room_1")
        assert tracker is not None
        assert tracker.false_seal_count == 1

    def test_override_false_vacancy_triggers_false_break(self, mock_hass):
        """Override from VACANT->OCCUPIED records false_break."""
        controller = FeedbackController(mock_hass)

        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.VACANT,
            new_state=OccupancyState.OCCUPIED,
            confidence=0.0,
            seal_probability=0.0,
            contributing_sensors=[],
        )

        tracker = controller.get_seal_accuracy("room_1")
        assert tracker is not None
        assert tracker.false_break_count == 1

    def test_override_without_seal_no_false_seal(self, mock_hass):
        """Override from OCCUPIED->VACANT without seal doesn't record false_seal."""
        controller = FeedbackController(mock_hass)

        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.5,
            seal_probability=0.0,  # No seal active
            contributing_sensors=["sensor.a"],
        )

        tracker = controller.get_seal_accuracy("room_1")
        # Should exist (created by false_break path? No -- false_occupancy with no seal)
        # Actually the seal accuracy tracker was not created because seal_probability=0.0
        # so the false_seal path is skipped, and it's a false_occupancy not false_vacancy
        # so the false_break path is also skipped
        assert tracker is None

    def test_persistence_round_trip(self, mock_hass):
        """seal_accuracy data is persisted and restored."""
        controller = FeedbackController(mock_hass)

        controller._seal_accuracy["room_1"] = SealAccuracyTracker(
            room_id="room_1",
            false_seal_count=3,
            false_break_count=2,
            correct_seal_count=10,
            correct_break_count=5,
            adjusted_half_life=2400.0,
        )

        saved = controller.save_data()

        controller2 = FeedbackController(mock_hass)
        controller2.load_data(saved)

        tracker = controller2.get_seal_accuracy("room_1")
        assert tracker is not None
        assert tracker.false_seal_count == 3
        assert tracker.false_break_count == 2
        assert tracker.correct_seal_count == 10
        assert tracker.correct_break_count == 5
        assert tracker.adjusted_half_life == 2400.0
