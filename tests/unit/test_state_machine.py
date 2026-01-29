"""Unit tests for the occupancy state machine."""
from __future__ import annotations

import sys
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.models.virtual_sensor import (
    OccupancyStateData,
    SensorBinding,
    VirtualSensorConfig,
)

STATE_ON = "on"
STATE_OFF = "off"


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = MagicMock()
    hass.states = MagicMock()
    hass.loop = MagicMock()

    # Track call_later callbacks for testing
    hass._scheduled_callbacks = []

    def mock_call_later(delay, callback):
        cancel = MagicMock()
        hass._scheduled_callbacks.append((delay, callback, cancel))
        return cancel

    hass.loop.call_later = mock_call_later

    return hass


@pytest.fixture
def basic_config():
    """Create a basic sensor configuration."""
    return VirtualSensorConfig(
        room_id="test_room",
        floor_plan_id="test_fp",
        enabled=True,
        motion_timeout=120,
        checking_timeout=30,
        presence_timeout=300,
        motion_sensors=[
            SensorBinding(
                entity_id="binary_sensor.test_motion",
                sensor_type="motion",
                weight=1.0,
            ),
        ],
        presence_sensors=[
            SensorBinding(
                entity_id="binary_sensor.test_presence",
                sensor_type="presence",
                weight=1.5,
            ),
        ],
        door_sensors=[
            SensorBinding(
                entity_id="binary_sensor.test_door",
                sensor_type="door",
                weight=1.0,
            ),
        ],
        door_blocks_vacancy=True,
        door_open_resets_checking=True,
    )


@pytest.fixture
def state_changes():
    """Track state changes."""
    changes = []

    def on_change(state: OccupancyStateData):
        changes.append(state.state)

    return changes, on_change


class TestOccupancyStateMachineBasic:
    """Basic tests for OccupancyStateMachine that don't require HA runtime."""

    def test_occupancy_state_data_creation(self):
        """Test OccupancyStateData creation."""
        state = OccupancyStateData()
        assert state.state == OccupancyState.VACANT
        assert state.confidence == 0.0
        assert state.contributing_sensors == []

    def test_occupancy_state_data_to_dict(self):
        """Test OccupancyStateData serialization."""
        state = OccupancyStateData(
            state=OccupancyState.OCCUPIED,
            confidence=0.8,
            contributing_sensors=["sensor1", "sensor2"],
        )
        data = state.to_dict()
        assert data["state"] == OccupancyState.OCCUPIED
        assert data["confidence"] == 0.8
        assert "sensor1" in data["contributing_sensors"]

    def test_sensor_config_get_all_entity_ids(self, basic_config):
        """Test getting all entity IDs from config."""
        entity_ids = basic_config.get_all_sensor_entity_ids()
        assert "binary_sensor.test_motion" in entity_ids
        assert "binary_sensor.test_presence" in entity_ids
        assert "binary_sensor.test_door" in entity_ids

    def test_sensor_binding_inverted(self):
        """Test inverted sensor binding."""
        binding = SensorBinding(
            entity_id="binary_sensor.test",
            sensor_type="motion",
            weight=1.0,
            inverted=True,
        )
        assert binding.inverted is True

    def test_config_door_settings(self, basic_config):
        """Test door-related settings in config."""
        assert basic_config.door_blocks_vacancy is True
        assert basic_config.door_open_resets_checking is True

    def test_config_timeouts(self, basic_config):
        """Test timeout settings in config."""
        assert basic_config.motion_timeout == 120
        assert basic_config.checking_timeout == 30
        assert basic_config.presence_timeout == 300


class TestOccupancyStateMachineWithMocks:
    """Tests using mock Home Assistant."""

    def test_state_machine_creation(self, mock_hass, basic_config, state_changes):
        """Test state machine creation."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)

        assert machine.state.state == OccupancyState.VACANT
        assert not machine.is_occupied

    def test_manual_state_override(self, mock_hass, basic_config, state_changes):
        """Test manual state override."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)

        machine.set_state(OccupancyState.OCCUPIED, "manual test")
        assert machine.state.state == OccupancyState.OCCUPIED
        assert machine.is_occupied

        machine.set_state(OccupancyState.VACANT, "manual test")
        assert machine.state.state == OccupancyState.VACANT
        assert not machine.is_occupied

    def test_transition_to_checking(self, mock_hass, basic_config, state_changes):
        """Test transition to checking state."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)

        # Start in occupied
        machine._state.state = OccupancyState.OCCUPIED
        machine._transition_to_checking("test")

        assert machine.state.state == OccupancyState.CHECKING
        assert machine.is_occupied  # Still considered occupied
        assert machine.state.checking_started_at is not None

    def test_is_sensor_active(self, mock_hass, basic_config, state_changes):
        """Test sensor active detection."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)

        # Test normal sensor
        mock_state = MagicMock()
        mock_state.state = STATE_ON
        assert machine._is_sensor_active(mock_state, False) is True

        mock_state.state = STATE_OFF
        assert machine._is_sensor_active(mock_state, False) is False

        # Test inverted sensor
        mock_state.state = STATE_ON
        assert machine._is_sensor_active(mock_state, True) is False

        mock_state.state = STATE_OFF
        assert machine._is_sensor_active(mock_state, True) is True

    def test_contributing_sensors_update(self, mock_hass, basic_config, state_changes):
        """Test contributing sensors list updates."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)

        # Add sensor
        machine._update_contributing_sensors("sensor1", add=True)
        assert "sensor1" in machine.state.contributing_sensors

        # Add duplicate (should not add again)
        machine._update_contributing_sensors("sensor1", add=True)
        assert machine.state.contributing_sensors.count("sensor1") == 1

        # Remove sensor
        machine._update_contributing_sensors("sensor1", add=False)
        assert "sensor1" not in machine.state.contributing_sensors

    def test_confidence_calculation(self, mock_hass, basic_config, state_changes):
        """Test confidence calculation."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)

        # No contributing sensors
        assert machine._calculate_confidence() == 0.0

        # Add motion sensor
        machine._state.contributing_sensors = ["binary_sensor.test_motion"]
        confidence = machine._calculate_confidence()
        assert 0 < confidence <= 1

    def test_checking_timer_scheduled(self, mock_hass, basic_config, state_changes):
        """Test that checking timer is scheduled."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)

        # Mock async_call_later
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

            # Timer should be scheduled
            assert len(scheduled_calls) > 0
            delay, callback, cancel = scheduled_calls[-1]
            assert delay == basic_config.checking_timeout

    def test_door_blocks_vacancy(self, mock_hass, basic_config, state_changes):
        """Test door blocks vacancy when closed."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)

        # All doors closed
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        assert machine._are_all_doors_closed() is True

        # At least one door open
        mock_hass.states.get.return_value = MagicMock(state=STATE_ON)
        assert machine._are_all_doors_closed() is False

    def test_get_bindings(self, mock_hass, basic_config, state_changes):
        """Test getting sensor bindings."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)

        motion = machine._get_motion_binding("binary_sensor.test_motion")
        assert motion is not None
        assert motion.entity_id == "binary_sensor.test_motion"

        presence = machine._get_presence_binding("binary_sensor.test_presence")
        assert presence is not None

        door = machine._get_door_binding("binary_sensor.test_door")
        assert door is not None

        # Non-existent
        assert machine._get_motion_binding("nonexistent") is None


class TestPresenceAggregator:
    """Tests for presence aggregator."""

    def test_aggregator_creation(self, mock_hass, basic_config):
        """Test aggregator creation."""
        from custom_components.inhabit.engine.presence_aggregator import (
            PresenceAggregator,
        )

        aggregator = PresenceAggregator(
            mock_hass,
            basic_config.motion_sensors,
            basic_config.presence_sensors,
        )

        assert aggregator.hass == mock_hass

    def test_update_reading(self, mock_hass, basic_config):
        """Test updating sensor readings."""
        from custom_components.inhabit.engine.presence_aggregator import (
            PresenceAggregator,
        )

        aggregator = PresenceAggregator(
            mock_hass,
            basic_config.motion_sensors,
            basic_config.presence_sensors,
        )

        aggregator.update_reading("sensor1", True, "motion", 1.0)
        assert "sensor1" in aggregator._readings
        assert aggregator._readings["sensor1"].is_active is True

    def test_is_any_sensor_active(self, mock_hass, basic_config):
        """Test checking if any sensor is active."""
        from custom_components.inhabit.engine.presence_aggregator import (
            PresenceAggregator,
        )

        aggregator = PresenceAggregator(
            mock_hass,
            basic_config.motion_sensors,
            basic_config.presence_sensors,
        )

        assert aggregator.is_any_sensor_active() is False

        aggregator.update_reading("sensor1", True, "motion", 1.0)
        assert aggregator.is_any_sensor_active() is True

    def test_get_active_sensors(self, mock_hass, basic_config):
        """Test getting active sensor list."""
        from custom_components.inhabit.engine.presence_aggregator import (
            PresenceAggregator,
        )

        aggregator = PresenceAggregator(
            mock_hass,
            basic_config.motion_sensors,
            basic_config.presence_sensors,
        )

        aggregator.update_reading("sensor1", True, "motion", 1.0)
        aggregator.update_reading("sensor2", False, "motion", 1.0)
        aggregator.update_reading("sensor3", True, "presence", 1.5)

        active = aggregator.get_active_sensors()
        assert "sensor1" in active
        assert "sensor2" not in active
        assert "sensor3" in active

    def test_clear_readings(self, mock_hass, basic_config):
        """Test clearing all readings."""
        from custom_components.inhabit.engine.presence_aggregator import (
            PresenceAggregator,
        )

        aggregator = PresenceAggregator(
            mock_hass,
            basic_config.motion_sensors,
            basic_config.presence_sensors,
        )

        aggregator.update_reading("sensor1", True, "motion", 1.0)
        aggregator.clear()

        assert len(aggregator._readings) == 0
        assert aggregator.is_any_sensor_active() is False
