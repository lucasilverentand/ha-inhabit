"""Unit tests for the probabilistic seal decay model."""

from __future__ import annotations

import math
import sys
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.engine.seal_probability import SealProbabilityTracker
from custom_components.inhabit.const import (
    DEFAULT_SEAL_HALF_LIFE,
    DEFAULT_SEAL_MAX_DURATION,
    DEFAULT_LONG_STAY_SEAL_MAX_DURATION,
)
from custom_components.inhabit.models.virtual_sensor import (
    OccupancyStateData,
    SensorBinding,
    VirtualSensorConfig,
)

STATE_ON = "on"
STATE_OFF = "off"


class TestSealProbabilityTracker:
    """Tests for the SealProbabilityTracker dataclass."""

    def test_initial_state(self):
        """Tracker starts with zero probability and not sealed."""
        tracker = SealProbabilityTracker()
        assert tracker.probability == 0.0
        assert tracker.is_effective is False
        assert tracker.is_sealed is False
        assert tracker.sealed_since is None

    def test_establish_sets_probability_to_one(self):
        """Establishing a seal sets probability near 1.0."""
        tracker = SealProbabilityTracker()
        tracker.establish()
        # Immediately after establishing, probability should be ~1.0
        assert tracker.probability > 0.99
        assert tracker.is_effective is True
        assert tracker.is_sealed is True
        assert tracker.sealed_since is not None

    def test_break_seal_zeroes_probability(self):
        """Breaking a seal immediately returns probability to 0.0."""
        tracker = SealProbabilityTracker()
        tracker.establish()
        assert tracker.probability > 0.99

        tracker.break_seal()
        assert tracker.probability == 0.0
        assert tracker.is_effective is False
        assert tracker.is_sealed is False

    def test_exponential_decay_at_half_life(self):
        """At t=half_life, probability should be ~0.5."""
        half_life = 3600.0
        tracker = SealProbabilityTracker(half_life_seconds=half_life)
        tracker.establish()

        # Mock datetime.now() to be half_life seconds in the future
        sealed_at = tracker._sealed_at
        future = sealed_at + timedelta(seconds=half_life)
        with patch(
            "custom_components.inhabit.engine.seal_probability.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = future
            prob = tracker.probability
            assert abs(prob - 0.5) < 0.01

    def test_exponential_decay_at_two_half_lives(self):
        """At t=2*half_life, probability should be ~0.25."""
        half_life = 3600.0
        tracker = SealProbabilityTracker(half_life_seconds=half_life)
        tracker.establish()

        sealed_at = tracker._sealed_at
        future = sealed_at + timedelta(seconds=half_life * 2)
        with patch(
            "custom_components.inhabit.engine.seal_probability.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = future
            prob = tracker.probability
            assert abs(prob - 0.25) < 0.01

    def test_exponential_decay_at_three_half_lives(self):
        """At t=3*half_life, probability should be ~0.125."""
        half_life = 3600.0
        tracker = SealProbabilityTracker(half_life_seconds=half_life)
        tracker.establish()

        sealed_at = tracker._sealed_at
        future = sealed_at + timedelta(seconds=half_life * 3)
        with patch(
            "custom_components.inhabit.engine.seal_probability.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = future
            prob = tracker.probability
            assert abs(prob - 0.125) < 0.01

    def test_is_effective_above_threshold(self):
        """is_effective returns True when probability > threshold."""
        tracker = SealProbabilityTracker(
            half_life_seconds=3600.0,
            vacancy_threshold=0.1,
        )
        tracker.establish()

        # At t=0, probability is ~1.0 — effective
        assert tracker.is_effective is True

        # At t=3*half_life, probability is ~0.125 — still above 0.1
        sealed_at = tracker._sealed_at
        future = sealed_at + timedelta(seconds=3600 * 3)
        with patch(
            "custom_components.inhabit.engine.seal_probability.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = future
            assert tracker.is_effective is True

    def test_is_effective_below_threshold(self):
        """is_effective returns False when probability < threshold."""
        tracker = SealProbabilityTracker(
            half_life_seconds=3600.0,
            vacancy_threshold=0.1,
        )
        tracker.establish()

        # At t ~= 3.32 * half_life, probability drops below 0.1
        # 0.5^(t/hl) = 0.1 => t/hl = log(0.1)/log(0.5) ≈ 3.3219
        sealed_at = tracker._sealed_at
        future = sealed_at + timedelta(seconds=3600 * 3.4)
        with patch(
            "custom_components.inhabit.engine.seal_probability.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = future
            assert tracker.is_effective is False

    def test_hard_cutoff_at_max_duration(self):
        """Probability returns 0.0 at max_duration regardless of half_life."""
        tracker = SealProbabilityTracker(
            half_life_seconds=100000.0,  # Very long half-life
            _max_duration=3600.0,  # But hard cutoff at 1 hour
        )
        tracker.establish()

        sealed_at = tracker._sealed_at
        future = sealed_at + timedelta(seconds=3600)
        with patch(
            "custom_components.inhabit.engine.seal_probability.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = future
            assert tracker.probability == 0.0
            assert tracker.is_effective is False

    def test_reset_clears_all_state(self):
        """reset() clears all state."""
        tracker = SealProbabilityTracker()
        tracker.establish()
        assert tracker.is_sealed is True

        tracker.reset()
        assert tracker.probability == 0.0
        assert tracker.is_sealed is False
        assert tracker.is_effective is False
        assert tracker.sealed_since is None

    def test_is_sealed_vs_is_effective(self):
        """is_sealed and is_effective are distinct concepts.

        is_sealed: whether a seal was established and not broken
        is_effective: whether probability is above the vacancy threshold
        """
        tracker = SealProbabilityTracker(
            half_life_seconds=3600.0,
            vacancy_threshold=0.1,
            _max_duration=14400.0,
        )
        tracker.establish()

        # Both true at start
        assert tracker.is_sealed is True
        assert tracker.is_effective is True

        # After enough time, is_sealed remains True but is_effective becomes False
        sealed_at = tracker._sealed_at
        future = sealed_at + timedelta(seconds=3600 * 4)  # 4 half-lives
        with patch(
            "custom_components.inhabit.engine.seal_probability.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = future
            # p = 0.5^4 = 0.0625 < 0.1
            assert tracker.is_sealed is True
            assert tracker.is_effective is False

    def test_break_seal_not_established(self):
        """Breaking a seal that was never established is a no-op."""
        tracker = SealProbabilityTracker()
        # Should not raise
        tracker.break_seal()
        assert tracker.probability == 0.0
        assert tracker.is_sealed is False

    def test_re_establish_resets_timer(self):
        """Re-establishing a seal resets the decay timer."""
        tracker = SealProbabilityTracker(half_life_seconds=3600.0)
        tracker.establish()

        first_sealed_at = tracker._sealed_at

        # Advance time
        future = first_sealed_at + timedelta(seconds=1800)
        with patch(
            "custom_components.inhabit.engine.seal_probability.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = future
            # Re-establish
            tracker.establish()

        second_sealed_at = tracker._sealed_at
        assert second_sealed_at > first_sealed_at

    def test_custom_threshold(self):
        """Custom vacancy threshold is respected."""
        tracker = SealProbabilityTracker(
            half_life_seconds=3600.0,
            vacancy_threshold=0.5,  # Higher threshold
        )
        tracker.establish()

        # At t=half_life, probability is 0.5 — equal to threshold, not effective
        sealed_at = tracker._sealed_at
        future = sealed_at + timedelta(seconds=3600)
        with patch(
            "custom_components.inhabit.engine.seal_probability.datetime"
        ) as mock_dt:
            mock_dt.now.return_value = future
            # 0.5 is not > 0.5, so not effective
            assert tracker.is_effective is False


class TestSealHalfLifeConfig:
    """Tests for seal_half_life in VirtualSensorConfig."""

    def test_default_half_life(self):
        """Default half-life is 3600s (1 hour)."""
        config = VirtualSensorConfig(room_id="test")
        assert config.seal_half_life == 3600

    def test_long_stay_gets_longer_half_life(self):
        """Long-stay rooms get 2x the default half-life."""
        config = VirtualSensorConfig(
            room_id="couch",
            long_stay=True,
        )
        assert config.effective_seal_half_life == 7200

    def test_regular_room_gets_default_half_life(self):
        """Regular rooms use the default half-life."""
        config = VirtualSensorConfig(
            room_id="hallway",
            long_stay=False,
        )
        assert config.effective_seal_half_life == 3600

    def test_custom_half_life_overrides_long_stay(self):
        """Custom seal_half_life takes precedence even for long_stay."""
        config = VirtualSensorConfig(
            room_id="bed",
            long_stay=True,
            seal_half_life=10800,  # 3 hours
        )
        assert config.effective_seal_half_life == 10800

    def test_half_life_serialization_round_trip(self):
        """seal_half_life round-trips through to_dict/from_dict."""
        config = VirtualSensorConfig(
            room_id="test",
            seal_half_life=5400,
        )
        d = config.to_dict()
        assert d["seal_half_life"] == 5400

        restored = VirtualSensorConfig.from_dict(d)
        assert restored.seal_half_life == 5400

    def test_half_life_default_in_from_dict(self):
        """Missing seal_half_life in dict defaults to 3600."""
        config = VirtualSensorConfig.from_dict({"room_id": "test"})
        assert config.seal_half_life == 3600


class TestSealProbabilityInStateData:
    """Tests for seal_probability in OccupancyStateData."""

    def test_default_seal_probability(self):
        """Default seal_probability is 0.0."""
        state = OccupancyStateData()
        assert state.seal_probability == 0.0

    def test_seal_probability_serialization(self):
        """seal_probability round-trips through to_dict/from_dict."""
        state = OccupancyStateData(seal_probability=0.75)
        d = state.to_dict()
        assert d["seal_probability"] == 0.75

        restored = OccupancyStateData.from_dict(d)
        assert restored.seal_probability == 0.75

    def test_seal_probability_default_in_from_dict(self):
        """Missing seal_probability in dict defaults to 0.0."""
        state = OccupancyStateData.from_dict({})
        assert state.seal_probability == 0.0


class TestStateMachineSealIntegration:
    """Integration tests for seal probability in the state machine."""

    @pytest.fixture
    def seal_config(self):
        """Config with door seal enabled."""
        return VirtualSensorConfig(
            room_id="sealed_room",
            floor_plan_id="test_fp",
            enabled=True,
            motion_timeout=120,
            checking_timeout=30,
            motion_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.room_motion",
                    sensor_type="motion",
                    weight=1.0,
                ),
            ],
            door_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.room_door",
                    sensor_type="door",
                    weight=1.0,
                ),
            ],
            door_seals_room=True,
            seal_half_life=3600,  # 1 hour
        )

    @pytest.fixture
    def long_stay_config(self):
        """Config for a long-stay zone."""
        return VirtualSensorConfig(
            room_id="couch_zone",
            floor_plan_id="test_fp",
            enabled=True,
            motion_timeout=120,
            checking_timeout=30,
            long_stay=True,
            motion_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.couch_mmwave",
                    sensor_type="motion",
                    weight=1.0,
                ),
            ],
            door_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.room_door",
                    sensor_type="door",
                    weight=1.0,
                ),
            ],
            door_seals_room=True,
        )

    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        hass = MagicMock()
        hass.states = MagicMock()
        hass.loop = MagicMock()
        return hass

    @pytest.fixture
    def state_changes(self):
        """Track state changes."""
        changes = []

        def on_change(state: OccupancyStateData):
            changes.append(state)

        return changes, on_change

    def _make_machine(self, mock_hass, config, state_changes):
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        return OccupancyStateMachine(mock_hass, config, on_change), changes

    def test_seal_tracker_created_with_correct_half_life(
        self, mock_hass, seal_config, state_changes
    ):
        """State machine creates tracker with config half-life."""
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)
        assert machine._seal_tracker.half_life_seconds == 3600.0

    def test_long_stay_tracker_has_longer_half_life(
        self, mock_hass, long_stay_config, state_changes
    ):
        """Long-stay zone gets 2x half-life."""
        machine, _ = self._make_machine(mock_hass, long_stay_config, state_changes)
        assert machine._seal_tracker.half_life_seconds == 7200.0

    def test_seal_probability_exposed_in_state(
        self, mock_hass, seal_config, state_changes
    ):
        """seal_probability is updated in state data when seal is established."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)  # Door closed
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._transition_to_occupied("motion detected")
            assert machine.state.sealed is True
            assert machine.state.seal_probability > 0.99

    def test_seal_probability_zero_after_break(
        self, mock_hass, seal_config, state_changes
    ):
        """seal_probability is 0.0 after seal is broken."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._transition_to_occupied("motion detected")
            machine._break_seal("door opened")
            assert machine.state.seal_probability == 0.0
            assert machine.state.sealed is False

    def test_decayed_seal_allows_vacancy(
        self, mock_hass, seal_config, state_changes
    ):
        """A seal that has decayed below threshold allows vacancy transition."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        from custom_components.inhabit.const import OccupancyState

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._transition_to_occupied("motion detected")
            assert machine.state.sealed is True

            # Fast-forward past the decay threshold
            # At 3.4 * half_life, p ≈ 0.095 < 0.1 threshold
            sealed_at = machine._seal_tracker._sealed_at
            future = sealed_at + timedelta(seconds=3600 * 3.4)
            with patch(
                "custom_components.inhabit.engine.seal_probability.datetime"
            ) as mock_dt:
                mock_dt.now.return_value = future

                # Move to CHECKING first (bypass seal since it has decayed)
                machine._state.state = OccupancyState.CHECKING
                machine._transition_to_vacant("checking timeout")

                # Should succeed — seal decayed below threshold
                assert machine.state.state == OccupancyState.VACANT

    def test_active_seal_blocks_vacancy(
        self, mock_hass, seal_config, state_changes
    ):
        """A seal that hasn't decayed blocks vacancy transition."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        from custom_components.inhabit.const import OccupancyState

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._transition_to_occupied("motion detected")

            # Try to go vacant immediately (seal probability ~1.0)
            machine._state.state = OccupancyState.CHECKING
            machine._transition_to_vacant("checking timeout")
            # Should be blocked
            assert machine.state.state == OccupancyState.CHECKING

    def test_no_expiry_timer_needed(
        self, mock_hass, seal_config, state_changes
    ):
        """The seal expiry timer is no longer used (replaced by decay)."""
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)
        assert not hasattr(machine, "_seal_expiry_timer")

    def test_re_detection_resets_decay(
        self, mock_hass, seal_config, state_changes
    ):
        """New detection while sealed resets the decay timer."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._transition_to_occupied("motion detected")
            first_sealed_at = machine._seal_tracker._sealed_at

            # Simulate time passing then re-detection
            future = first_sealed_at + timedelta(seconds=1800)
            with patch(
                "custom_components.inhabit.engine.seal_probability.datetime"
            ) as mock_dt:
                mock_dt.now.return_value = future
                machine._transition_to_occupied("motion re-detected")

            # sealed_at should be updated
            assert machine._seal_tracker._sealed_at > first_sealed_at

    def test_max_duration_safety_valve(
        self, mock_hass, seal_config, state_changes
    ):
        """Hard max_duration cutoff returns probability 0 regardless of half_life."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        from custom_components.inhabit.const import OccupancyState

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._transition_to_occupied("motion detected")

            # Fast-forward past max_duration (default 14400s = 4h)
            sealed_at = machine._seal_tracker._sealed_at
            future = sealed_at + timedelta(seconds=14400)
            with patch(
                "custom_components.inhabit.engine.seal_probability.datetime"
            ) as mock_dt:
                mock_dt.now.return_value = future
                assert machine._seal_tracker.probability == 0.0
                assert machine._seal_tracker.is_effective is False

                # Should now allow vacancy
                machine._state.state = OccupancyState.CHECKING
                machine._transition_to_vacant("checking timeout")
                assert machine.state.state == OccupancyState.VACANT
