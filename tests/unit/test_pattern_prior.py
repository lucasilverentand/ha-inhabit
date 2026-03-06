"""Unit tests for occupancy pattern priors."""

from __future__ import annotations

import sys
from datetime import datetime
from unittest.mock import MagicMock

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.engine.pattern_prior import OccupancyPatternPrior
from custom_components.inhabit.engine.presence_aggregator import PresenceAggregator


class TestOccupancyPatternPrior:
    """Tests for OccupancyPatternPrior."""

    def test_initial_prior_is_neutral(self):
        """With no observations, prior is ~0.5 (Bayesian smoothing)."""
        prior = OccupancyPatternPrior(room_id="room_1")
        # (0 + 1) / (0 + 2) = 0.5
        ts = datetime(2024, 6, 1, 12, 0)  # Saturday
        assert prior.get_prior(ts) == pytest.approx(0.5)

    def test_all_occupied_observations(self):
        """All occupied observations push prior toward 1.0."""
        prior = OccupancyPatternPrior(room_id="room_1")
        ts = datetime(2024, 6, 3, 14, 0)  # Monday 14:00

        for _ in range(100):
            prior.record_observation(ts, is_occupied=True)

        # (100 + 1) / (100 + 2) = 101/102 ≈ 0.99
        assert prior.get_prior(ts) > 0.95

    def test_all_vacant_observations(self):
        """All vacant observations push prior toward 0.0."""
        prior = OccupancyPatternPrior(room_id="room_1")
        ts = datetime(2024, 6, 3, 3, 0)  # Monday 3:00 AM

        for _ in range(100):
            prior.record_observation(ts, is_occupied=False)

        # (0 + 1) / (100 + 2) = 1/102 ≈ 0.01
        assert prior.get_prior(ts) < 0.05

    def test_mixed_observations(self):
        """Mixed observations give proportional prior."""
        prior = OccupancyPatternPrior(room_id="room_1")
        ts = datetime(2024, 6, 3, 10, 0)  # Monday 10:00

        for _ in range(60):
            prior.record_observation(ts, is_occupied=True)
        for _ in range(40):
            prior.record_observation(ts, is_occupied=False)

        # (60 + 1) / (100 + 2) = 61/102 ≈ 0.598
        result = prior.get_prior(ts)
        assert 0.55 < result < 0.65

    def test_different_hours_independent(self):
        """Observations at different hours are independent."""
        prior = OccupancyPatternPrior(room_id="room_1")
        ts_morning = datetime(2024, 6, 3, 8, 0)
        ts_evening = datetime(2024, 6, 3, 20, 0)

        for _ in range(50):
            prior.record_observation(ts_morning, is_occupied=True)
            prior.record_observation(ts_evening, is_occupied=False)

        assert prior.get_prior(ts_morning) > 0.8
        assert prior.get_prior(ts_evening) < 0.2

    def test_different_days_independent(self):
        """Observations on different days of week are independent."""
        prior = OccupancyPatternPrior(room_id="room_1")
        monday = datetime(2024, 6, 3, 12, 0)  # Monday
        saturday = datetime(2024, 6, 8, 12, 0)  # Saturday

        for _ in range(50):
            prior.record_observation(monday, is_occupied=True)
            prior.record_observation(saturday, is_occupied=False)

        assert prior.get_prior(monday) > 0.8
        assert prior.get_prior(saturday) < 0.2

    def test_total_observations(self):
        """get_total_observations counts all observations."""
        prior = OccupancyPatternPrior(room_id="room_1")
        assert prior.get_total_observations() == 0

        prior.record_observation(datetime(2024, 6, 3, 12, 0), True)
        prior.record_observation(datetime(2024, 6, 3, 13, 0), False)
        assert prior.get_total_observations() == 2

    def test_serialization_round_trip(self):
        """Prior serializes and deserializes correctly."""
        prior = OccupancyPatternPrior(room_id="room_1")
        ts = datetime(2024, 6, 3, 10, 0)

        for _ in range(50):
            prior.record_observation(ts, is_occupied=True)

        d = prior.to_dict()
        restored = OccupancyPatternPrior.from_dict(d)

        assert restored.room_id == "room_1"
        assert restored.get_prior(ts) == pytest.approx(prior.get_prior(ts))
        assert restored.get_total_observations() == prior.get_total_observations()


class TestPresenceAggregatorPriorBlending:
    """Tests for prior blending in PresenceAggregator."""

    @pytest.fixture
    def mock_hass(self):
        hass = MagicMock()
        hass.states = MagicMock()
        return hass

    def test_set_prior(self, mock_hass):
        """set_prior clamps to [0.0, 1.0]."""
        agg = PresenceAggregator(mock_hass, [], [])
        agg.set_prior(0.8)
        assert agg._prior == 0.8

        agg.set_prior(-0.5)
        assert agg._prior == 0.0

        agg.set_prior(1.5)
        assert agg._prior == 1.0

    def test_prior_blended_into_probability(self, mock_hass):
        """Prior is blended into get_presence_probability."""
        agg = PresenceAggregator(mock_hass, [], [])
        agg.set_prior(0.8)

        # No sensor readings -> sensor_prob = 0.0
        # result = 0.0 * (1 - 0.15) + 0.8 * 0.15 = 0.12
        prob = agg.get_presence_probability()
        assert prob == pytest.approx(0.12)

    def test_high_prior_with_active_sensor(self, mock_hass):
        """High prior boosts probability when sensors are active."""
        agg = PresenceAggregator(mock_hass, [], [])
        agg.set_prior(0.9)

        agg.update_reading("sensor.a", True, "motion", 1.0)
        prob = agg.get_presence_probability()

        # sensor_prob = 1.0, prior = 0.9
        # result = 1.0 * 0.85 + 0.9 * 0.15 = 0.985
        assert prob == pytest.approx(0.985)

    def test_low_prior_with_no_activity(self, mock_hass):
        """Low prior gives low probability with no activity."""
        agg = PresenceAggregator(mock_hass, [], [])
        agg.set_prior(0.1)

        prob = agg.get_presence_probability()
        # 0.0 * 0.85 + 0.1 * 0.15 = 0.015
        assert prob == pytest.approx(0.015)

    def test_default_prior_is_neutral(self, mock_hass):
        """Default prior of 0.5 gives moderate baseline."""
        agg = PresenceAggregator(mock_hass, [], [])
        # Default prior = 0.5
        prob = agg.get_presence_probability()
        # 0.0 * 0.85 + 0.5 * 0.15 = 0.075
        assert prob == pytest.approx(0.075)
