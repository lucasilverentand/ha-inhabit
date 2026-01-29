"""Unit tests for engine components."""
from __future__ import annotations

import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.models.virtual_sensor import (
    OccupancyStateData,
    SensorBinding,
    VirtualSensorConfig,
)


class TestOccupancyStateData:
    """Test OccupancyStateData."""

    def test_default_values(self):
        """Test default values."""
        state = OccupancyStateData()
        assert state.state == OccupancyState.VACANT
        assert state.confidence == 0.0
        assert state.contributing_sensors == []
        assert state.last_motion_at is None
        assert state.last_presence_at is None
        assert state.last_door_event_at is None
        assert state.checking_started_at is None

    def test_with_values(self):
        """Test with custom values."""
        now = datetime.now()
        state = OccupancyStateData(
            state=OccupancyState.OCCUPIED,
            confidence=0.9,
            contributing_sensors=["sensor1", "sensor2"],
            last_motion_at=now,
        )
        assert state.state == OccupancyState.OCCUPIED
        assert state.confidence == 0.9
        assert len(state.contributing_sensors) == 2
        assert state.last_motion_at == now

    def test_to_dict(self):
        """Test to_dict method."""
        state = OccupancyStateData(
            state=OccupancyState.CHECKING,
            confidence=0.5,
            contributing_sensors=["sensor1"],
        )
        data = state.to_dict()
        assert data["state"] == OccupancyState.CHECKING
        assert data["confidence"] == 0.5
        assert "sensor1" in data["contributing_sensors"]


class TestVirtualSensorConfigAdvanced:
    """Advanced tests for VirtualSensorConfig."""

    def test_empty_sensors(self):
        """Test config with no sensors."""
        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
        )
        ids = config.get_all_sensor_entity_ids()
        assert ids == []

    def test_only_motion_sensors(self):
        """Test config with only motion sensors."""
        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
            motion_sensors=[
                SensorBinding(entity_id="binary_sensor.m1", sensor_type="motion", weight=1.0),
                SensorBinding(entity_id="binary_sensor.m2", sensor_type="motion", weight=1.0),
            ],
        )
        ids = config.get_all_sensor_entity_ids()
        assert len(ids) == 2
        assert "binary_sensor.m1" in ids
        assert "binary_sensor.m2" in ids

    def test_only_presence_sensors(self):
        """Test config with only presence sensors."""
        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
            presence_sensors=[
                SensorBinding(entity_id="binary_sensor.p1", sensor_type="presence", weight=1.5),
            ],
        )
        ids = config.get_all_sensor_entity_ids()
        assert len(ids) == 1

    def test_only_door_sensors(self):
        """Test config with only door sensors."""
        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
            door_sensors=[
                SensorBinding(entity_id="binary_sensor.d1", sensor_type="door", weight=1.0),
            ],
        )
        ids = config.get_all_sensor_entity_ids()
        assert len(ids) == 1

    def test_disabled_config(self):
        """Test disabled config."""
        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
            enabled=False,
        )
        assert config.enabled is False

    def test_timeouts(self):
        """Test timeout values."""
        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
            motion_timeout=60,
            checking_timeout=15,
            presence_timeout=180,
        )
        assert config.motion_timeout == 60
        assert config.checking_timeout == 15
        assert config.presence_timeout == 180

    def test_door_settings(self):
        """Test door-related settings."""
        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
            door_blocks_vacancy=True,
            door_open_resets_checking=True,
        )
        assert config.door_blocks_vacancy is True
        assert config.door_open_resets_checking is True

    def test_serialization_round_trip(self):
        """Test serialization and deserialization."""
        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
            enabled=True,
            motion_timeout=120,
            checking_timeout=30,
            presence_timeout=300,
            motion_sensors=[
                SensorBinding(entity_id="binary_sensor.m1", sensor_type="motion", weight=1.0),
            ],
            presence_sensors=[
                SensorBinding(entity_id="binary_sensor.p1", sensor_type="presence", weight=1.5),
            ],
            door_sensors=[
                SensorBinding(entity_id="binary_sensor.d1", sensor_type="door", weight=1.0),
            ],
            door_blocks_vacancy=True,
            door_open_resets_checking=True,
        )
        data = config.to_dict()
        restored = VirtualSensorConfig.from_dict(data)

        assert restored.room_id == config.room_id
        assert restored.motion_timeout == config.motion_timeout
        assert len(restored.motion_sensors) == 1
        assert len(restored.presence_sensors) == 1
        assert len(restored.door_sensors) == 1


class TestSensorBindingAdvanced:
    """Advanced tests for SensorBinding."""

    def test_default_values(self):
        """Test default values."""
        binding = SensorBinding(
            entity_id="binary_sensor.test",
            sensor_type="motion",
            weight=1.0,
        )
        assert binding.inverted is False

    def test_inverted_binding(self):
        """Test inverted binding."""
        binding = SensorBinding(
            entity_id="binary_sensor.no_motion",
            sensor_type="motion",
            weight=1.0,
            inverted=True,
        )
        assert binding.inverted is True

    def test_high_weight(self):
        """Test high weight value."""
        binding = SensorBinding(
            entity_id="binary_sensor.presence",
            sensor_type="presence",
            weight=2.5,
        )
        assert binding.weight == 2.5

    def test_serialization_round_trip(self):
        """Test serialization and deserialization."""
        binding = SensorBinding(
            entity_id="binary_sensor.test",
            sensor_type="motion",
            weight=1.5,
            inverted=True,
        )
        data = binding.to_dict()
        restored = SensorBinding.from_dict(data)

        assert restored.entity_id == binding.entity_id
        assert restored.sensor_type == binding.sensor_type
        assert restored.weight == binding.weight
        assert restored.inverted == binding.inverted


class TestOccupancyStateMachineScenarios:
    """Scenario tests for OccupancyStateMachine."""

    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        hass = MagicMock()
        hass.states = MagicMock()
        hass.loop = MagicMock()
        return hass

    @pytest.fixture
    def basic_config(self):
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

    def test_vacant_is_not_occupied(self, mock_hass, basic_config):
        """Test that VACANT state is not occupied."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        machine = OccupancyStateMachine(mock_hass, basic_config, lambda x: None)
        assert machine.state.state == OccupancyState.VACANT
        assert machine.is_occupied is False

    def test_occupied_is_occupied(self, mock_hass, basic_config):
        """Test that OCCUPIED state is occupied."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        machine = OccupancyStateMachine(mock_hass, basic_config, lambda x: None)
        machine.set_state(OccupancyState.OCCUPIED, "test")
        assert machine.is_occupied is True

    def test_checking_is_occupied(self, mock_hass, basic_config):
        """Test that CHECKING state is still considered occupied."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        machine = OccupancyStateMachine(mock_hass, basic_config, lambda x: None)
        machine._state.state = OccupancyState.OCCUPIED
        machine._transition_to_checking("test")
        assert machine.state.state == OccupancyState.CHECKING
        assert machine.is_occupied is True

    def test_state_change_callback(self, mock_hass, basic_config):
        """Test that state changes trigger callback."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes = []

        def on_change(state):
            changes.append(state.state)

        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)
        machine.set_state(OccupancyState.OCCUPIED, "test")

        assert len(changes) == 1
        assert changes[0] == OccupancyState.OCCUPIED

    def test_multiple_state_changes(self, mock_hass, basic_config):
        """Test multiple state changes."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes = []

        def on_change(state):
            changes.append(state.state)

        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)
        machine.set_state(OccupancyState.OCCUPIED, "enter")
        machine.set_state(OccupancyState.CHECKING, "leaving")
        machine.set_state(OccupancyState.VACANT, "left")

        assert len(changes) == 3
        assert changes == [OccupancyState.OCCUPIED, OccupancyState.CHECKING, OccupancyState.VACANT]

    def test_inverted_sensor(self, mock_hass, basic_config):
        """Test inverted sensor logic."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        machine = OccupancyStateMachine(mock_hass, basic_config, lambda x: None)

        # Normal sensor
        mock_state = MagicMock()
        mock_state.state = "on"
        assert machine._is_sensor_active(mock_state, False) is True
        assert machine._is_sensor_active(mock_state, True) is False

        mock_state.state = "off"
        assert machine._is_sensor_active(mock_state, False) is False
        assert machine._is_sensor_active(mock_state, True) is True

    def test_contributing_sensors_management(self, mock_hass, basic_config):
        """Test contributing sensors list management."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        machine = OccupancyStateMachine(mock_hass, basic_config, lambda x: None)

        # Add sensors
        machine._update_contributing_sensors("sensor1", add=True)
        machine._update_contributing_sensors("sensor2", add=True)
        assert "sensor1" in machine.state.contributing_sensors
        assert "sensor2" in machine.state.contributing_sensors

        # No duplicates
        machine._update_contributing_sensors("sensor1", add=True)
        assert machine.state.contributing_sensors.count("sensor1") == 1

        # Remove sensors
        machine._update_contributing_sensors("sensor1", add=False)
        assert "sensor1" not in machine.state.contributing_sensors
        assert "sensor2" in machine.state.contributing_sensors

    def test_confidence_empty_sensors(self, mock_hass, basic_config):
        """Test confidence with no contributing sensors."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        machine = OccupancyStateMachine(mock_hass, basic_config, lambda x: None)
        assert machine._calculate_confidence() == 0.0

    def test_confidence_with_sensors(self, mock_hass, basic_config):
        """Test confidence with contributing sensors."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        machine = OccupancyStateMachine(mock_hass, basic_config, lambda x: None)
        machine._state.contributing_sensors = ["binary_sensor.test_motion"]

        confidence = machine._calculate_confidence()
        assert confidence > 0.0
        assert confidence <= 1.0

    def test_get_bindings(self, mock_hass, basic_config):
        """Test getting sensor bindings."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        machine = OccupancyStateMachine(mock_hass, basic_config, lambda x: None)

        # Motion binding
        motion = machine._get_motion_binding("binary_sensor.test_motion")
        assert motion is not None
        assert motion.entity_id == "binary_sensor.test_motion"

        # Presence binding
        presence = machine._get_presence_binding("binary_sensor.test_presence")
        assert presence is not None

        # Door binding
        door = machine._get_door_binding("binary_sensor.test_door")
        assert door is not None

        # Non-existent bindings
        assert machine._get_motion_binding("nonexistent") is None
        assert machine._get_presence_binding("nonexistent") is None
        assert machine._get_door_binding("nonexistent") is None
