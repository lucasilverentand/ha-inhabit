"""Unit tests for presence aggregator."""

from __future__ import annotations

from datetime import datetime
from unittest.mock import MagicMock

import pytest

from custom_components.inhabit.engine.presence_aggregator import (
    PresenceAggregator,
    SensorReading,
)
from custom_components.inhabit.models.virtual_sensor import SensorBinding


class TestSensorReading:
    """Test SensorReading dataclass."""

    def test_create_reading(self):
        """Test creating a sensor reading."""
        now = datetime.now()
        reading = SensorReading(
            entity_id="binary_sensor.motion",
            is_active=True,
            timestamp=now,
            weight=1.0,
            sensor_type="motion",
        )

        assert reading.entity_id == "binary_sensor.motion"
        assert reading.is_active is True
        assert reading.timestamp == now
        assert reading.weight == 1.0
        assert reading.sensor_type == "motion"

    def test_inactive_reading(self):
        """Test inactive reading."""
        reading = SensorReading(
            entity_id="binary_sensor.presence",
            is_active=False,
            timestamp=datetime.now(),
            weight=1.5,
            sensor_type="presence",
        )

        assert reading.is_active is False
        assert reading.sensor_type == "presence"


class TestPresenceAggregator:
    """Test PresenceAggregator class."""

    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        hass = MagicMock()
        hass.states = MagicMock()
        return hass

    @pytest.fixture
    def motion_bindings(self):
        """Create motion sensor bindings."""
        return [
            SensorBinding(
                entity_id="binary_sensor.motion1", sensor_type="motion", weight=1.0
            ),
            SensorBinding(
                entity_id="binary_sensor.motion2", sensor_type="motion", weight=1.0
            ),
        ]

    @pytest.fixture
    def presence_bindings(self):
        """Create presence sensor bindings."""
        return [
            SensorBinding(
                entity_id="binary_sensor.presence1", sensor_type="presence", weight=1.5
            ),
        ]

    @pytest.fixture
    def aggregator(self, mock_hass, motion_bindings, presence_bindings):
        """Create an aggregator."""
        return PresenceAggregator(
            hass=mock_hass,
            motion_bindings=motion_bindings,
            presence_bindings=presence_bindings,
            motion_decay_seconds=120.0,
            presence_decay_seconds=300.0,
        )

    def test_init(self, aggregator, motion_bindings, presence_bindings):
        """Test aggregator initialization."""
        assert aggregator.motion_bindings == motion_bindings
        assert aggregator.presence_bindings == presence_bindings
        assert aggregator.motion_decay_seconds == 120.0
        assert aggregator.presence_decay_seconds == 300.0

    def test_update_reading(self, aggregator):
        """Test updating a sensor reading."""
        aggregator.update_reading(
            entity_id="binary_sensor.motion1",
            is_active=True,
            sensor_type="motion",
            weight=1.0,
        )

        assert "binary_sensor.motion1" in aggregator._readings
        assert aggregator._readings["binary_sensor.motion1"].is_active is True

    def test_update_reading_overwrites(self, aggregator):
        """Test that updating a reading overwrites the previous value."""
        aggregator.update_reading("binary_sensor.motion1", True, "motion", 1.0)
        aggregator.update_reading("binary_sensor.motion1", False, "motion", 1.0)

        assert aggregator._readings["binary_sensor.motion1"].is_active is False

    def test_get_active_sensors_empty(self, aggregator):
        """Test getting active sensors when none are active."""
        active = aggregator.get_active_sensors()
        assert active == []

    def test_get_active_sensors_with_active(self, aggregator):
        """Test getting active sensors."""
        aggregator.update_reading("binary_sensor.motion1", True, "motion", 1.0)
        aggregator.update_reading("binary_sensor.motion2", False, "motion", 1.0)
        aggregator.update_reading("binary_sensor.presence1", True, "presence", 1.5)

        active = aggregator.get_active_sensors()
        assert len(active) == 2
        assert "binary_sensor.motion1" in active
        assert "binary_sensor.presence1" in active

    def test_is_any_sensor_active_false(self, aggregator):
        """Test no sensors active."""
        aggregator.update_reading("binary_sensor.motion1", False, "motion", 1.0)
        aggregator.update_reading("binary_sensor.motion2", False, "motion", 1.0)

        assert aggregator.is_any_sensor_active() is False

    def test_is_any_sensor_active_true(self, aggregator):
        """Test at least one sensor active."""
        aggregator.update_reading("binary_sensor.motion1", False, "motion", 1.0)
        aggregator.update_reading("binary_sensor.motion2", True, "motion", 1.0)

        assert aggregator.is_any_sensor_active() is True

    def test_get_last_activity_time_none(self, aggregator):
        """Test getting last activity time with no active sensors."""
        aggregator.update_reading("binary_sensor.motion1", False, "motion", 1.0)

        assert aggregator.get_last_activity_time() is None

    def test_get_last_activity_time_single(self, aggregator):
        """Test getting last activity time with one active sensor."""
        aggregator.update_reading("binary_sensor.motion1", True, "motion", 1.0)

        last_time = aggregator.get_last_activity_time()
        assert last_time is not None
        assert isinstance(last_time, datetime)

    def test_clear(self, aggregator):
        """Test clearing all readings."""
        aggregator.update_reading("binary_sensor.motion1", True, "motion", 1.0)
        aggregator.update_reading("binary_sensor.motion2", True, "motion", 1.0)

        aggregator.clear()

        assert len(aggregator._readings) == 0

    def test_get_presence_probability_no_readings(self, aggregator):
        """Test probability with no readings."""
        probability = aggregator.get_presence_probability()
        assert probability == 0.0

    def test_get_presence_probability_all_active(self, aggregator):
        """Test probability with all sensors active."""
        aggregator.update_reading("binary_sensor.motion1", True, "motion", 1.0)
        aggregator.update_reading("binary_sensor.motion2", True, "motion", 1.0)

        probability = aggregator.get_presence_probability()
        # All active, so should be close to 1.0
        assert probability > 0.9

    def test_get_presence_probability_none_active(self, aggregator):
        """Test probability with no sensors active."""
        aggregator.update_reading("binary_sensor.motion1", False, "motion", 1.0)
        aggregator.update_reading("binary_sensor.motion2", False, "motion", 1.0)

        probability = aggregator.get_presence_probability()
        assert probability == 0.0

    def test_get_presence_probability_half_active(self, aggregator):
        """Test probability with half sensors active."""
        aggregator.update_reading("binary_sensor.motion1", True, "motion", 1.0)
        aggregator.update_reading("binary_sensor.motion2", False, "motion", 1.0)

        probability = aggregator.get_presence_probability()
        # Half active with equal weights should be around 0.5
        assert 0.4 < probability < 0.6

    def test_get_presence_probability_weighted(self, aggregator):
        """Test probability with weighted sensors."""
        # Higher weight sensor active
        aggregator.update_reading("binary_sensor.motion1", True, "motion", 2.0)
        aggregator.update_reading("binary_sensor.motion2", False, "motion", 1.0)

        probability = aggregator.get_presence_probability()
        # 2.0 active out of 3.0 total weight = ~0.67
        assert probability > 0.6


class TestPresenceAggregatorIsSensorActive:
    """Test _is_sensor_active method."""

    @pytest.fixture
    def aggregator(self):
        """Create an aggregator."""
        mock_hass = MagicMock()
        return PresenceAggregator(
            hass=mock_hass,
            motion_bindings=[],
            presence_bindings=[],
        )

    def test_on_state(self, aggregator):
        """Test 'on' state is active."""
        state = MagicMock()
        state.state = "on"

        assert aggregator._is_sensor_active(state, False) is True
        assert aggregator._is_sensor_active(state, True) is False

    def test_off_state(self, aggregator):
        """Test 'off' state is inactive."""
        state = MagicMock()
        state.state = "off"

        assert aggregator._is_sensor_active(state, False) is False
        assert aggregator._is_sensor_active(state, True) is True

    def test_detected_state(self, aggregator):
        """Test 'detected' state is active."""
        state = MagicMock()
        state.state = "detected"

        assert aggregator._is_sensor_active(state, False) is True

    def test_open_state(self, aggregator):
        """Test 'open' state is active."""
        state = MagicMock()
        state.state = "open"

        assert aggregator._is_sensor_active(state, False) is True

    def test_true_state(self, aggregator):
        """Test 'true' state is active."""
        state = MagicMock()
        state.state = "true"

        assert aggregator._is_sensor_active(state, False) is True

    def test_one_state(self, aggregator):
        """Test '1' state is active."""
        state = MagicMock()
        state.state = "1"

        assert aggregator._is_sensor_active(state, False) is True

    def test_unknown_state(self, aggregator):
        """Test unknown state is inactive."""
        state = MagicMock()
        state.state = "unknown"

        assert aggregator._is_sensor_active(state, False) is False


class TestPresenceAggregatorRefreshFromState:
    """Test refresh_from_state method."""

    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        hass = MagicMock()
        hass.states = MagicMock()
        return hass

    def test_refresh_updates_readings(self, mock_hass):
        """Test that refresh updates readings from state."""
        motion_bindings = [
            SensorBinding(
                entity_id="binary_sensor.motion", sensor_type="motion", weight=1.0
            ),
        ]
        presence_bindings = [
            SensorBinding(
                entity_id="binary_sensor.presence", sensor_type="presence", weight=1.5
            ),
        ]

        # Mock states
        motion_state = MagicMock()
        motion_state.state = "on"
        presence_state = MagicMock()
        presence_state.state = "off"

        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": motion_state,
            "binary_sensor.presence": presence_state,
        }.get(eid)

        aggregator = PresenceAggregator(
            hass=mock_hass,
            motion_bindings=motion_bindings,
            presence_bindings=presence_bindings,
        )

        aggregator.refresh_from_state()

        assert aggregator._readings["binary_sensor.motion"].is_active is True
        assert aggregator._readings["binary_sensor.presence"].is_active is False

    def test_refresh_handles_missing_state(self, mock_hass):
        """Test that refresh handles missing entity states gracefully."""
        motion_bindings = [
            SensorBinding(
                entity_id="binary_sensor.missing", sensor_type="motion", weight=1.0
            ),
        ]

        mock_hass.states.get.return_value = None

        aggregator = PresenceAggregator(
            hass=mock_hass,
            motion_bindings=motion_bindings,
            presence_bindings=[],
        )

        aggregator.refresh_from_state()

        # Should not raise and should not have the missing sensor in readings
        assert "binary_sensor.missing" not in aggregator._readings
