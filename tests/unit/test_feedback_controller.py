"""Unit tests for the feedback controller."""

from __future__ import annotations

from datetime import datetime, timedelta
from unittest.mock import MagicMock

import pytest

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.engine.feedback_controller import (
    EVENT_OVERRIDE_RECORDED,
    MAX_CHECKING_TIMEOUT,
    MAX_OCCUPIED_THRESHOLD,
    MAX_SEAL_HALF_LIFE,
    MAX_VACANT_THRESHOLD,
    MIN_COOLDOWN_SECONDS,
    MIN_MOTION_TIMEOUT,
    MIN_SEAL_HALF_LIFE,
    FeedbackController,
    OverrideEvent,
    RoomAdjustmentState,
)


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = MagicMock()
    hass.bus = MagicMock()
    return hass


@pytest.fixture
def controller(mock_hass):
    """Create a FeedbackController."""
    return FeedbackController(mock_hass)


class TestOverrideRecording:
    """Tests for recording override events."""

    def test_false_occupancy_override_recorded(self, controller):
        """OCCUPIED -> VACANT override creates a false_occupancy event."""
        event = controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.0,
            contributing_sensors=["binary_sensor.motion_1"],
        )
        assert event is not None
        assert event.override_type == "false_occupancy"
        assert event.room_id == "room_1"
        assert event.previous_state == OccupancyState.OCCUPIED
        assert event.new_state == OccupancyState.VACANT
        assert event.confidence_at_override == 0.8
        assert "binary_sensor.motion_1" in event.contributing_sensors

    def test_false_occupancy_from_checking(self, controller):
        """CHECKING -> VACANT override creates a false_occupancy event."""
        event = controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.CHECKING,
            new_state=OccupancyState.VACANT,
            confidence=0.3,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        assert event is not None
        assert event.override_type == "false_occupancy"

    def test_false_vacancy_override_recorded(self, controller):
        """VACANT -> OCCUPIED override creates a false_vacancy event."""
        event = controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.VACANT,
            new_state=OccupancyState.OCCUPIED,
            confidence=0.0,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        assert event is not None
        assert event.override_type == "false_vacancy"
        assert event.previous_state == OccupancyState.VACANT
        assert event.new_state == OccupancyState.OCCUPIED

    def test_non_override_transition_ignored(self, controller):
        """Normal state changes (e.g. OCCUPIED -> CHECKING) don't record."""
        event = controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.CHECKING,
            confidence=0.5,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        assert event is None

    def test_same_state_transition_ignored(self, controller):
        """Transition to the same state is ignored."""
        event = controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.OCCUPIED,
            confidence=0.8,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        assert event is None

    def test_override_fires_event(self, mock_hass, controller):
        """Override recording fires a HA bus event."""
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        mock_hass.bus.async_fire.assert_called_once()
        call_args = mock_hass.bus.async_fire.call_args
        assert call_args[0][0] == EVENT_OVERRIDE_RECORDED
        assert call_args[0][1]["room_id"] == "room_1"
        assert call_args[0][1]["override_type"] == "false_occupancy"

    def test_override_counts_tracked(self, controller):
        """Override counts are tracked on the adjustment state."""
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.VACANT,
            new_state=OccupancyState.OCCUPIED,
            confidence=0.0,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        state = controller.get_adjustment_state("room_1")
        assert state is not None
        assert state.total_overrides == 2
        assert state.false_occupancy_count == 1
        assert state.false_vacancy_count == 1


class TestFalseOccupancyAdjustments:
    """Tests for adjustments triggered by false occupancy overrides."""

    def test_false_occupancy_nudges_vacant_threshold_up(self, controller):
        """False occupancy raises vacant_threshold_delta."""
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        state = controller.get_adjustment_state("room_1")
        assert state is not None
        assert state.vacant_threshold_delta > 0.0
        assert state.vacant_threshold_delta == pytest.approx(0.02)

    def test_false_occupancy_shortens_seal_half_life(self, controller):
        """False occupancy decreases seal_half_life_factor."""
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        state = controller.get_adjustment_state("room_1")
        assert state is not None
        assert state.seal_half_life_factor < 1.0
        assert state.seal_half_life_factor == pytest.approx(0.9)

    def test_false_occupancy_reduces_motion_timeout(self, controller):
        """False occupancy decreases motion_timeout_delta."""
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        state = controller.get_adjustment_state("room_1")
        assert state is not None
        assert state.motion_timeout_delta < 0
        assert state.motion_timeout_delta == -5


class TestFalseVacancyAdjustments:
    """Tests for adjustments triggered by false vacancy overrides."""

    def test_false_vacancy_nudges_checking_timeout_up(self, controller):
        """False vacancy increases checking_timeout_delta."""
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.VACANT,
            new_state=OccupancyState.OCCUPIED,
            confidence=0.0,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        state = controller.get_adjustment_state("room_1")
        assert state is not None
        assert state.checking_timeout_delta > 0
        assert state.checking_timeout_delta == 5

    def test_false_vacancy_extends_seal_half_life(self, controller):
        """False vacancy increases seal_half_life_factor."""
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.VACANT,
            new_state=OccupancyState.OCCUPIED,
            confidence=0.0,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        state = controller.get_adjustment_state("room_1")
        assert state is not None
        assert state.seal_half_life_factor > 1.0
        assert state.seal_half_life_factor == pytest.approx(1.1)


class TestCooldown:
    """Tests for the cooldown mechanism."""

    def test_cooldown_prevents_rapid_adjustments(self, controller):
        """No adjustment within 10 min of the last one."""
        # First override applies adjustments
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        state = controller.get_adjustment_state("room_1")
        first_delta = state.vacant_threshold_delta

        # Second override within cooldown should NOT apply further adjustments
        # (but the event is still recorded and counts updated)
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.7,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        state = controller.get_adjustment_state("room_1")
        assert state.vacant_threshold_delta == first_delta  # No change
        assert state.total_overrides == 2  # But event still counted
        assert state.false_occupancy_count == 2

    def test_cooldown_expires_allows_new_adjustment(self, controller):
        """After cooldown expires, adjustments are applied again."""
        # First override
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        state = controller.get_adjustment_state("room_1")
        first_delta = state.vacant_threshold_delta

        # Manually set last_adjustment_at to the past (beyond cooldown)
        past_time = datetime.now() - timedelta(seconds=MIN_COOLDOWN_SECONDS + 1)
        state.last_adjustment_at = past_time.isoformat()

        # Second override should now apply
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.7,
            seal_probability=0.0,
            contributing_sensors=[],
        )
        assert state.vacant_threshold_delta > first_delta


class TestBounds:
    """Tests for adjustment bounds clamping."""

    def test_adjustments_respect_bounds(self, controller):
        """All deltas are clamped to safe bounds after many overrides."""
        state = controller._get_or_create_state("room_1")

        # Simulate many false occupancy overrides (push deltas to extremes)
        for _ in range(200):
            # Reset cooldown each time to allow adjustments
            state.last_adjustment_at = (
                datetime.now() - timedelta(seconds=MIN_COOLDOWN_SECONDS + 1)
            ).isoformat()
            controller.record_override(
                room_id="room_1",
                previous_state=OccupancyState.OCCUPIED,
                new_state=OccupancyState.VACANT,
                confidence=0.9,
                seal_probability=0.0,
                contributing_sensors=[],
            )

        # vacant_threshold_delta should be capped
        assert state.vacant_threshold_delta <= MAX_VACANT_THRESHOLD - 0.1

        # seal_half_life_factor should be floored
        assert state.seal_half_life_factor >= MIN_SEAL_HALF_LIFE / 3600.0

        # motion_timeout_delta should be floored
        assert state.motion_timeout_delta >= MIN_MOTION_TIMEOUT - 120

        # Now simulate many false vacancy overrides
        state_v = controller._get_or_create_state("room_2")
        for _ in range(200):
            state_v.last_adjustment_at = (
                datetime.now() - timedelta(seconds=MIN_COOLDOWN_SECONDS + 1)
            ).isoformat()
            controller.record_override(
                room_id="room_2",
                previous_state=OccupancyState.VACANT,
                new_state=OccupancyState.OCCUPIED,
                confidence=0.0,
                seal_probability=0.0,
                contributing_sensors=[],
            )

        # checking_timeout_delta should be capped
        assert state_v.checking_timeout_delta <= MAX_CHECKING_TIMEOUT - 30

        # seal_half_life_factor should be capped
        assert state_v.seal_half_life_factor <= MAX_SEAL_HALF_LIFE / 3600.0


class TestGetAdjustedConfig:
    """Tests for applying adjustments to config."""

    def test_get_adjusted_config_applies_deltas(self, controller):
        """Config dict is modified correctly with adjustments."""
        # Record an override to create adjustments
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.0,
            contributing_sensors=[],
        )

        base_config = {
            "checking_timeout": 30,
            "motion_timeout": 120,
            "vacant_threshold": 0.1,
            "occupied_threshold": 0.5,
            "seal_half_life": 3600,
        }

        adjusted = controller.get_adjusted_config("room_1", base_config)

        # False occupancy: vacant_threshold up, motion_timeout down, seal shorter
        assert adjusted["vacant_threshold"] > base_config["vacant_threshold"]
        assert adjusted["motion_timeout"] < base_config["motion_timeout"]
        assert adjusted["seal_half_life"] < base_config["seal_half_life"]
        # checking_timeout should be unchanged (false_occupancy doesn't adjust it)
        assert adjusted["checking_timeout"] == base_config["checking_timeout"]

    def test_get_adjusted_config_no_adjustments(self, controller):
        """Config is returned unchanged when no adjustments exist."""
        base_config = {
            "checking_timeout": 30,
            "motion_timeout": 120,
            "vacant_threshold": 0.1,
            "occupied_threshold": 0.5,
            "seal_half_life": 3600,
        }

        adjusted = controller.get_adjusted_config("unknown_room", base_config)
        assert adjusted == base_config

    def test_get_adjusted_config_clamped(self, controller):
        """Adjusted config values are clamped to bounds."""
        # Create extreme adjustments manually
        state = controller._get_or_create_state("room_1")
        state.checking_timeout_delta = 9999
        state.motion_timeout_delta = -9999
        state.vacant_threshold_delta = 9.0
        state.occupied_threshold_delta = 9.0
        state.seal_half_life_factor = 99.0

        base_config = {
            "checking_timeout": 30,
            "motion_timeout": 120,
            "vacant_threshold": 0.1,
            "occupied_threshold": 0.5,
            "seal_half_life": 3600,
        }

        adjusted = controller.get_adjusted_config("room_1", base_config)

        assert adjusted["checking_timeout"] <= MAX_CHECKING_TIMEOUT
        assert adjusted["motion_timeout"] >= MIN_MOTION_TIMEOUT
        assert adjusted["vacant_threshold"] <= MAX_VACANT_THRESHOLD
        assert adjusted["occupied_threshold"] <= MAX_OCCUPIED_THRESHOLD
        assert adjusted["seal_half_life"] <= MAX_SEAL_HALF_LIFE


class TestPersistence:
    """Tests for save/load round-trip."""

    def test_persistence_round_trip(self, controller):
        """save_data/load_data preserves state."""
        # Record some overrides
        controller.record_override(
            room_id="room_1",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence=0.8,
            seal_probability=0.5,
            contributing_sensors=["sensor_a", "sensor_b"],
        )
        controller.record_override(
            room_id="room_2",
            previous_state=OccupancyState.VACANT,
            new_state=OccupancyState.OCCUPIED,
            confidence=0.0,
            seal_probability=0.0,
            contributing_sensors=[],
        )

        # Save
        data = controller.save_data()

        # Create a new controller and load
        mock_hass = MagicMock()
        mock_hass.bus = MagicMock()
        new_controller = FeedbackController(mock_hass)
        new_controller.load_data(data)

        # Verify adjustment states restored
        state1 = new_controller.get_adjustment_state("room_1")
        assert state1 is not None
        assert state1.false_occupancy_count == 1
        assert state1.total_overrides == 1
        assert state1.vacant_threshold_delta > 0.0

        state2 = new_controller.get_adjustment_state("room_2")
        assert state2 is not None
        assert state2.false_vacancy_count == 1
        assert state2.checking_timeout_delta > 0

        # Verify history restored
        history1 = new_controller.get_override_history("room_1")
        assert len(history1) == 1
        assert history1[0].override_type == "false_occupancy"
        assert history1[0].confidence_at_override == 0.8
        assert history1[0].contributing_sensors == ["sensor_a", "sensor_b"]

        history2 = new_controller.get_override_history("room_2")
        assert len(history2) == 1
        assert history2[0].override_type == "false_vacancy"


class TestOverrideHistory:
    """Tests for the override history deque."""

    def test_override_history_bounded(self, controller):
        """Override history maxlen=100 is respected."""
        state = controller._get_or_create_state("room_1")

        for i in range(150):
            # Reset cooldown
            state.last_adjustment_at = (
                datetime.now() - timedelta(seconds=MIN_COOLDOWN_SECONDS + 1)
            ).isoformat()
            controller.record_override(
                room_id="room_1",
                previous_state=OccupancyState.OCCUPIED,
                new_state=OccupancyState.VACANT,
                confidence=0.5,
                seal_probability=0.0,
                contributing_sensors=[],
            )

        history = controller.get_override_history("room_1")
        assert len(history) == 100
        # Oldest events should have been dropped
        assert state.total_overrides == 150


class TestDataclassSerialization:
    """Tests for OverrideEvent and RoomAdjustmentState serialization."""

    def test_override_event_round_trip(self):
        """OverrideEvent serializes and deserializes correctly."""
        event = OverrideEvent(
            room_id="room_1",
            timestamp="2024-06-01T12:00:00",
            override_type="false_occupancy",
            previous_state=OccupancyState.OCCUPIED,
            new_state=OccupancyState.VACANT,
            confidence_at_override=0.75,
            seal_probability_at_override=0.3,
            contributing_sensors=["sensor_a"],
        )
        data = event.to_dict()
        restored = OverrideEvent.from_dict(data)

        assert restored.room_id == event.room_id
        assert restored.timestamp == event.timestamp
        assert restored.override_type == event.override_type
        assert restored.previous_state == event.previous_state
        assert restored.new_state == event.new_state
        assert restored.confidence_at_override == event.confidence_at_override
        assert (
            restored.seal_probability_at_override == event.seal_probability_at_override
        )
        assert restored.contributing_sensors == event.contributing_sensors

    def test_room_adjustment_state_round_trip(self):
        """RoomAdjustmentState serializes and deserializes correctly."""
        state = RoomAdjustmentState(
            room_id="room_1",
            checking_timeout_delta=10,
            motion_timeout_delta=-5,
            vacant_threshold_delta=0.04,
            occupied_threshold_delta=0.0,
            seal_half_life_factor=0.81,
            last_adjustment_at="2024-06-01T12:00:00",
            false_occupancy_count=3,
            false_vacancy_count=1,
            total_overrides=4,
        )
        data = state.to_dict()
        restored = RoomAdjustmentState.from_dict(data)

        assert restored.room_id == state.room_id
        assert restored.checking_timeout_delta == state.checking_timeout_delta
        assert restored.motion_timeout_delta == state.motion_timeout_delta
        assert restored.vacant_threshold_delta == pytest.approx(
            state.vacant_threshold_delta
        )
        assert restored.occupied_threshold_delta == state.occupied_threshold_delta
        assert restored.seal_half_life_factor == pytest.approx(
            state.seal_half_life_factor
        )
        assert restored.last_adjustment_at == state.last_adjustment_at
        assert restored.false_occupancy_count == state.false_occupancy_count
        assert restored.false_vacancy_count == state.false_vacancy_count
        assert restored.total_overrides == state.total_overrides
