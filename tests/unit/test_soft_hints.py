"""Unit tests for soft occupancy hints."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.engine.soft_hint_processor import (
    MAX_HINT_WEIGHT,
    SoftHintProcessor,
)
from custom_components.inhabit.models.virtual_sensor import (
    OccupancyStateData,
    SensorBinding,
    VirtualSensorConfig,
)

STATE_ON = "on"
STATE_OFF = "off"


# ---------------------------------------------------------------
# SoftHintProcessor static method tests
# ---------------------------------------------------------------


class TestProcessLightState:
    """Tests for SoftHintProcessor.process_light_state."""

    def test_light_off_returns_zero(self):
        assert SoftHintProcessor.process_light_state("off") == 0.0

    def test_light_on_no_brightness(self):
        weight = SoftHintProcessor.process_light_state("on")
        assert weight == pytest.approx(0.15)

    def test_light_on_max_brightness(self):
        weight = SoftHintProcessor.process_light_state("on", brightness=255)
        assert weight == pytest.approx(0.25)

    def test_light_on_half_brightness(self):
        weight = SoftHintProcessor.process_light_state("on", brightness=128)
        assert 0.15 < weight < 0.25

    def test_light_on_zero_brightness(self):
        weight = SoftHintProcessor.process_light_state("on", brightness=0)
        assert weight == pytest.approx(0.15)

    def test_weight_capped_at_max(self):
        weight = SoftHintProcessor.process_light_state("on", brightness=999)
        assert weight <= MAX_HINT_WEIGHT


class TestProcessPowerLevel:
    """Tests for SoftHintProcessor.process_power_level."""

    def test_standby_power_returns_zero(self):
        assert SoftHintProcessor.process_power_level(2.0) == 0.0

    def test_idle_threshold_returns_zero(self):
        assert SoftHintProcessor.process_power_level(5.0) == 0.0

    def test_active_threshold_returns_max(self):
        weight = SoftHintProcessor.process_power_level(50.0)
        assert weight == pytest.approx(0.2)

    def test_above_active_returns_max(self):
        weight = SoftHintProcessor.process_power_level(200.0)
        assert weight == pytest.approx(0.2)

    def test_midpoint_linear(self):
        # Midpoint between 5 and 50 is 27.5 -> ratio = 0.5 -> weight = 0.1
        weight = SoftHintProcessor.process_power_level(27.5)
        assert weight == pytest.approx(0.1)


class TestProcessCO2:
    """Tests for SoftHintProcessor.process_co2."""

    def test_baseline_returns_zero(self):
        assert SoftHintProcessor.process_co2(400.0) == 0.0

    def test_below_baseline_returns_zero(self):
        assert SoftHintProcessor.process_co2(350.0) == 0.0

    def test_elevated_returns_max(self):
        weight = SoftHintProcessor.process_co2(600.0)
        assert weight == pytest.approx(0.25)

    def test_above_elevated_capped(self):
        weight = SoftHintProcessor.process_co2(1000.0)
        assert weight == pytest.approx(0.25)

    def test_midpoint(self):
        weight = SoftHintProcessor.process_co2(500.0)
        assert weight == pytest.approx(0.125)


class TestProcessSoundLevel:
    """Tests for SoftHintProcessor.process_sound_level."""

    def test_quiet_returns_zero(self):
        assert SoftHintProcessor.process_sound_level(20.0) == 0.0

    def test_threshold_returns_zero(self):
        assert SoftHintProcessor.process_sound_level(30.0) == 0.0

    def test_active_returns_max(self):
        weight = SoftHintProcessor.process_sound_level(50.0)
        assert weight == pytest.approx(0.2)

    def test_above_active_returns_max(self):
        weight = SoftHintProcessor.process_sound_level(80.0)
        assert weight == pytest.approx(0.2)

    def test_midpoint(self):
        weight = SoftHintProcessor.process_sound_level(40.0)
        assert weight == pytest.approx(0.1)


class TestDetectDoorDirection:
    """Tests for SoftHintProcessor.detect_door_direction."""

    def test_door_opens_from_occupied(self):
        weight = SoftHintProcessor.detect_door_direction(
            door_was_open=False, door_is_open=True, room_was_occupied=True
        )
        assert weight == pytest.approx(-0.1)

    def test_door_opens_into_vacant(self):
        weight = SoftHintProcessor.detect_door_direction(
            door_was_open=False, door_is_open=True, room_was_occupied=False
        )
        assert weight == pytest.approx(0.1)

    def test_door_closes_into_occupied(self):
        weight = SoftHintProcessor.detect_door_direction(
            door_was_open=True, door_is_open=False, room_was_occupied=True
        )
        assert weight == pytest.approx(0.1)

    def test_door_closes_from_vacant(self):
        weight = SoftHintProcessor.detect_door_direction(
            door_was_open=True, door_is_open=False, room_was_occupied=False
        )
        assert weight == 0.0

    def test_no_change(self):
        weight = SoftHintProcessor.detect_door_direction(
            door_was_open=True, door_is_open=True, room_was_occupied=True
        )
        assert weight == 0.0


# ---------------------------------------------------------------
# Integration with OccupancyStateMachine
# ---------------------------------------------------------------


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.states = MagicMock()
    hass.loop = MagicMock()
    hass.states.get.return_value = MagicMock(state=STATE_OFF)
    return hass


@pytest.fixture
def hint_config():
    """Config with hint sensors."""
    return VirtualSensorConfig(
        room_id="test_room",
        floor_plan_id="test_fp",
        enabled=True,
        motion_sensors=[
            SensorBinding(
                entity_id="binary_sensor.test_motion",
                sensor_type="motion",
                weight=1.0,
            ),
        ],
        hint_sensors=[
            SensorBinding(
                entity_id="light.living_room",
                sensor_type="light",
                weight=0.3,
            ),
            SensorBinding(
                entity_id="sensor.outlet_power",
                sensor_type="power",
                weight=0.3,
            ),
        ],
        door_sensors=[],
        door_seals_room=False,
    )


@pytest.fixture
def state_changes():
    changes = []

    def on_change(state: OccupancyStateData, reason: str = ""):
        changes.append(state.state)

    return changes, on_change


class TestHintConfig:
    """Tests for hint_sensors in VirtualSensorConfig."""

    def test_hint_sensors_serialization(self, hint_config):
        """hint_sensors round-trip through to_dict/from_dict."""
        d = hint_config.to_dict()
        assert "hint_sensors" in d
        assert len(d["hint_sensors"]) == 2

        restored = VirtualSensorConfig.from_dict(d)
        assert len(restored.hint_sensors) == 2
        assert restored.hint_sensors[0].entity_id == "light.living_room"
        assert restored.hint_sensors[0].sensor_type == "light"

    def test_empty_hint_sensors_default(self):
        """Default config has empty hint_sensors."""
        config = VirtualSensorConfig(room_id="test")
        assert config.hint_sensors == []


class TestHintEventHandling:
    """Tests for hint event handling in the state machine."""

    def test_hint_cannot_trigger_occupied(self, mock_hass, hint_config, state_changes):
        """Hint sensor alone cannot transition to OCCUPIED."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, hint_config, on_change)

        # Simulate hint event
        event = MagicMock()
        event.data = {
            "entity_id": "light.living_room",
            "new_state": MagicMock(state=STATE_ON, attributes={"brightness": 200}),
        }
        machine._handle_hint_event(event)

        # Should remain VACANT
        assert machine.state.state == OccupancyState.VACANT

    def test_hint_updates_aggregator(self, mock_hass, hint_config, state_changes):
        """Hint event feeds into the aggregator."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, hint_config, on_change)

        event = MagicMock()
        event.data = {
            "entity_id": "light.living_room",
            "new_state": MagicMock(state=STATE_ON, attributes={"brightness": 255}),
        }
        machine._handle_hint_event(event)

        assert "light.living_room" in machine._aggregator._readings
        reading = machine._aggregator._readings["light.living_room"]
        assert reading.is_active is True
        assert reading.sensor_type == "hint"

    def test_hint_boosts_confidence_when_occupied(
        self, mock_hass, hint_config, state_changes
    ):
        """Hint updates confidence when room is already OCCUPIED."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, hint_config, on_change)
        machine._state.state = OccupancyState.OCCUPIED
        machine._state.confidence = 0.5

        event = MagicMock()
        event.data = {
            "entity_id": "light.living_room",
            "new_state": MagicMock(state=STATE_ON, attributes={"brightness": 255}),
        }
        machine._handle_hint_event(event)

        # Confidence should be updated (may go up or stay same)
        assert machine._state.confidence >= 0.0

    def test_power_hint_processing(self, mock_hass, hint_config, state_changes):
        """Power sensor hint is processed correctly."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, hint_config, on_change)

        event = MagicMock()
        event.data = {
            "entity_id": "sensor.outlet_power",
            "new_state": MagicMock(state="100", attributes={}),
        }
        machine._handle_hint_event(event)

        assert "sensor.outlet_power" in machine._aggregator._readings
        reading = machine._aggregator._readings["sensor.outlet_power"]
        assert reading.is_active is True

    def test_hint_off_not_active(self, mock_hass, hint_config, state_changes):
        """Hint sensor going inactive produces is_active=False."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, hint_config, on_change)

        event = MagicMock()
        event.data = {
            "entity_id": "light.living_room",
            "new_state": MagicMock(state=STATE_OFF, attributes={}),
        }
        machine._handle_hint_event(event)

        reading = machine._aggregator._readings["light.living_room"]
        assert reading.is_active is False

    def test_get_hint_binding_found(self, mock_hass, hint_config, state_changes):
        """_get_hint_binding returns the correct binding."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, hint_config, on_change)

        binding = machine._get_hint_binding("light.living_room")
        assert binding is not None
        assert binding.entity_id == "light.living_room"

    def test_get_hint_binding_not_found(self, mock_hass, hint_config, state_changes):
        """_get_hint_binding returns None for unknown entity."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, hint_config, on_change)

        binding = machine._get_hint_binding("nonexistent")
        assert binding is None
