"""Unit tests for the occupancy state machine."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock, patch

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

    def on_change(state: OccupancyStateData, reason: str = ""):
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
        assert "binary_sensor.test_door" in entity_ids
        assert "binary_sensor.test_presence" in entity_ids

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
        """Test confidence calculation delegates to aggregator."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)

        # No aggregator readings — only prior contributes (0.5 * 0.15 = 0.075)
        assert machine._calculate_confidence() == pytest.approx(0.075)

        # Add an active reading to the aggregator
        machine._aggregator.update_reading(
            "binary_sensor.test_motion", True, "motion", 1.0
        )
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

    def test_all_doors_closed(self, mock_hass, basic_config, state_changes):
        """Test door closed detection."""
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(mock_hass, basic_config, on_change)

        # All doors closed
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        assert machine._all_doors_closed() is True

        # At least one door open
        mock_hass.states.get.return_value = MagicMock(state=STATE_ON)
        assert machine._all_doors_closed() is False

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


class TestDoorSealLogic:
    """Tests for the door seal occupancy logic."""

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
        )

    def _make_machine(self, mock_hass, config, state_changes):
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        return OccupancyStateMachine(mock_hass, config, on_change), changes

    @staticmethod
    def _setup_sensor_states(mock_hass, motion_state=STATE_ON, door_state=STATE_OFF):
        """Set up per-entity mock states for seal tests.

        By default: motion active (ON), door closed (OFF).
        """

        def get_state(entity_id):
            if "motion" in entity_id:
                return MagicMock(state=motion_state)
            if "door" in entity_id:
                return MagicMock(state=door_state)
            return MagicMock(state=STATE_OFF)

        mock_hass.states.get.side_effect = get_state

    def test_seal_established_on_occupied_with_doors_closed(
        self, mock_hass, seal_config, state_changes
    ):
        """Seal is established when entering OCCUPIED with all doors closed."""
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        machine._aggregator.update_reading(
            "binary_sensor.room_motion", True, "motion", 1.0
        )
        machine._transition_to_occupied("motion detected")
        assert machine.state.state == OccupancyState.OCCUPIED
        assert machine.state.sealed is True
        assert machine.state.sealed_since is not None

    def test_no_seal_when_door_open_at_detection(
        self, mock_hass, seal_config, state_changes
    ):
        """No seal when door is open at the time of detection."""
        self._setup_sensor_states(mock_hass, motion_state=STATE_ON, door_state=STATE_ON)
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        machine._aggregator.update_reading(
            "binary_sensor.room_motion", True, "motion", 1.0
        )
        machine._transition_to_occupied("motion detected")
        assert machine.state.state == OccupancyState.OCCUPIED
        assert machine.state.sealed is False

    def test_sealed_room_stays_occupied_when_sensors_clear(
        self, mock_hass, seal_config, state_changes
    ):
        """A sealed room stays OCCUPIED when all sensors clear."""
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        # Enter occupied (seal established)
        machine._aggregator.update_reading(
            "binary_sensor.room_motion", True, "motion", 1.0
        )
        machine._transition_to_occupied("motion detected")
        assert machine.state.sealed is True

        # All sensors clear
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_OFF, door_state=STATE_OFF
        )
        machine._aggregator.update_reading(
            "binary_sensor.room_motion", False, "motion", 1.0
        )
        machine._check_all_sensors_clear()
        assert machine.state.state == OccupancyState.OCCUPIED

    def test_seal_broken_when_door_opens(self, mock_hass, seal_config, state_changes):
        """Seal is broken when the door opens."""
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        machine._aggregator.update_reading(
            "binary_sensor.room_motion", True, "motion", 1.0
        )
        machine._transition_to_occupied("motion detected")
        assert machine.state.sealed is True

        # Door opens
        machine._break_seal("door opened")
        assert machine.state.sealed is False
        assert machine.state.seal_broken_at is not None

    def test_seal_broken_then_sensors_clear_goes_to_checking(
        self, mock_hass, seal_config, state_changes
    ):
        """After seal breaks, sensors clearing transitions to CHECKING."""
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._transition_to_occupied("motion detected")
            assert machine.state.sealed is True

            # Break seal and clear sensors
            machine._break_seal("door opened")
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_OFF, door_state=STATE_OFF
            )
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", False, "motion", 1.0
            )
            machine._check_all_sensors_clear()
            assert machine.state.state == OccupancyState.CHECKING

    def test_door_open_close_detected_reseals(
        self, mock_hass, seal_config, state_changes
    ):
        """Door opens and closes with active sensor re-establishes seal."""
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._transition_to_occupied("motion detected")
            assert machine.state.sealed is True

            # Door opens — seal breaks
            machine._break_seal("door opened")
            assert machine.state.sealed is False

            # Motion re-detected with door still open — no seal
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_ON, door_state=STATE_ON
            )
            machine._transition_to_occupied("motion re-detected")
            assert machine.state.sealed is False

            # Door closes + re-detection
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
            )
            machine._transition_to_occupied("motion re-detected again")
            assert machine.state.sealed is True

    def test_no_seal_without_door_sensors(self, mock_hass, state_changes):
        """No seal logic when room has no door sensors."""
        config = VirtualSensorConfig(
            room_id="no_door_room",
            floor_plan_id="test_fp",
            enabled=True,
            motion_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.room_motion",
                    sensor_type="motion",
                    weight=1.0,
                ),
            ],
            door_sensors=[],
            door_seals_room=True,
        )
        mock_hass.states.get.return_value = MagicMock(state=STATE_ON)
        machine, changes = self._make_machine(mock_hass, config, state_changes)

        machine._aggregator.update_reading(
            "binary_sensor.room_motion", True, "motion", 1.0
        )
        machine._transition_to_occupied("motion detected")
        assert machine.state.sealed is False

    def test_no_seal_when_disabled(self, mock_hass, seal_config, state_changes):
        """No seal when door_seals_room is False."""
        seal_config.door_seals_room = False
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        machine._aggregator.update_reading(
            "binary_sensor.room_motion", True, "motion", 1.0
        )
        machine._transition_to_occupied("motion detected")
        assert machine.state.sealed is False

    def test_manual_vacant_override_clears_seal(
        self, mock_hass, seal_config, state_changes
    ):
        """Manual state override to VACANT clears the seal."""
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._transition_to_occupied("motion detected")
            assert machine.state.sealed is True

            machine.set_state(OccupancyState.VACANT, "manual override")
            assert machine.state.sealed is False
            assert machine.state.state == OccupancyState.VACANT

    def test_vacancy_blocked_by_seal(self, mock_hass, seal_config, state_changes):
        """Transition to VACANT is blocked when room is sealed."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._state.state = OccupancyState.OCCUPIED
            # Use the seal tracker (not raw state) to establish the seal
            machine._seal_tracker.establish()
            machine._state.sealed = True
            machine._state.sealed_since = machine._seal_tracker.sealed_since

            machine._transition_to_vacant("checking timeout")
            # Should be blocked — still OCCUPIED
            assert machine.state.state == OccupancyState.OCCUPIED

    def test_house_guard_blocks_vacancy(self, mock_hass, seal_config, state_changes):
        """House guard can block vacancy for the last occupied room."""
        mock_hass.states.get.return_value = MagicMock(
            state=STATE_ON
        )  # Door open (no seal)
        guard_called = []

        def mock_guard(room_id):
            guard_called.append(room_id)
            return False  # Block vacancy

        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        machine = OccupancyStateMachine(
            mock_hass, seal_config, on_change, can_go_vacant=mock_guard
        )

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._state.state = OccupancyState.CHECKING

            machine._transition_to_vacant("checking timeout")
            # Should be blocked by house guard
            assert machine.state.state == OccupancyState.CHECKING
            assert guard_called == ["sealed_room"]

    def test_long_stay_effective_seal_duration(self):
        """Long-stay zones get a longer seal max duration."""
        from custom_components.inhabit.const import (
            DEFAULT_LONG_STAY_SEAL_MAX_DURATION,
            DEFAULT_SEAL_MAX_DURATION,
        )

        config = VirtualSensorConfig(
            room_id="couch",
            floor_plan_id="test_fp",
            long_stay=True,
        )
        assert config.effective_seal_max_duration == DEFAULT_LONG_STAY_SEAL_MAX_DURATION

        # Non-long-stay uses default
        config2 = VirtualSensorConfig(
            room_id="hallway",
            floor_plan_id="test_fp",
            long_stay=False,
        )
        assert config2.effective_seal_max_duration == DEFAULT_SEAL_MAX_DURATION

        # Custom override takes precedence even for long_stay
        config3 = VirtualSensorConfig(
            room_id="bed",
            floor_plan_id="test_fp",
            long_stay=True,
            seal_max_duration=43200,  # 12h
        )
        assert config3.effective_seal_max_duration == 43200

    def test_door_states_snapshot(self, mock_hass, seal_config, state_changes):
        """Door states are snapshotted on entering OCCUPIED."""
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._transition_to_occupied("motion detected")
            assert "binary_sensor.room_door" in machine.state.door_states_at_detection
            # Door was closed (not active) at detection time
            assert (
                machine.state.door_states_at_detection["binary_sensor.room_door"]
                is False
            )


class TestHoldUntilExit:
    """Tests for hold-until-exit (bed/couch) mode."""

    @pytest.fixture
    def bed_config(self):
        """Config for a bed zone with hold-until-exit."""
        return VirtualSensorConfig(
            room_id="bed_zone",
            floor_plan_id="test_fp",
            enabled=True,
            checking_timeout=30,
            long_stay=True,
            hold_until_exit=True,
            motion_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.bed_mmwave",
                    sensor_type="motion",
                    weight=1.0,
                ),
            ],
            exit_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.bedroom_motion",
                    sensor_type="motion",
                    weight=1.0,
                ),
            ],
            door_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.bedroom_door",
                    sensor_type="door",
                    weight=1.0,
                ),
            ],
            door_seals_room=True,
        )

    def _make_machine(self, mock_hass, config, state_changes):
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        return OccupancyStateMachine(mock_hass, config, on_change), changes

    def _make_exit_event(self, entity_id, state):
        event = MagicMock()
        event.data = {
            "entity_id": entity_id,
            "new_state": MagicMock(state=state),
        }
        return event

    @staticmethod
    def _setup_sensor_states(mock_hass, mmwave_state=STATE_ON, door_state=STATE_OFF):
        """Set up per-entity mock states for hold-until-exit tests."""

        def get_state(entity_id):
            if "bed_mmwave" in entity_id:
                return MagicMock(state=mmwave_state)
            if "door" in entity_id:
                return MagicMock(state=door_state)
            return MagicMock(state=STATE_OFF)

        mock_hass.states.get.side_effect = get_state

    def test_bed_stays_occupied_when_mmwave_drops(
        self, mock_hass, bed_config, state_changes
    ):
        """Bed zone stays OCCUPIED when mmWave clears (hold_until_exit)."""
        self._setup_sensor_states(
            mock_hass, mmwave_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, bed_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._aggregator.update_reading(
                "binary_sensor.bed_mmwave", True, "motion", 1.0
            )
            machine._transition_to_occupied("mmwave detected")
            assert machine.state.state == OccupancyState.OCCUPIED

            # mmWave clears but hold_until_exit keeps OCCUPIED
            self._setup_sensor_states(
                mock_hass, mmwave_state=STATE_OFF, door_state=STATE_OFF
            )
            machine._aggregator.update_reading(
                "binary_sensor.bed_mmwave", False, "motion", 1.0
            )
            machine._check_all_sensors_clear()
            assert machine.state.state == OccupancyState.OCCUPIED

    def test_exit_sensor_releases_hold(self, mock_hass, bed_config, state_changes):
        """Exit sensor firing transitions bed to CHECKING."""
        self._setup_sensor_states(
            mock_hass, mmwave_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, bed_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._aggregator.update_reading(
                "binary_sensor.bed_mmwave", True, "motion", 1.0
            )
            machine._transition_to_occupied("mmwave detected")

            event = self._make_exit_event("binary_sensor.bedroom_motion", STATE_ON)
            machine._handle_exit_sensor_event(event)

            assert machine.state.state == OccupancyState.CHECKING
            assert machine.state.sealed is False

    def test_exit_sensor_off_ignored(self, mock_hass, bed_config, state_changes):
        """Exit sensor going OFF does not release hold."""
        self._setup_sensor_states(
            mock_hass, mmwave_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, bed_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._aggregator.update_reading(
                "binary_sensor.bed_mmwave", True, "motion", 1.0
            )
            machine._transition_to_occupied("mmwave detected")

            event = self._make_exit_event("binary_sensor.bedroom_motion", STATE_OFF)
            machine._handle_exit_sensor_event(event)

            assert machine.state.state == OccupancyState.OCCUPIED

    def test_exit_sensor_ignored_when_vacant(
        self, mock_hass, bed_config, state_changes
    ):
        """Exit sensor ignored when zone is VACANT."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, changes = self._make_machine(mock_hass, bed_config, state_changes)

        event = self._make_exit_event("binary_sensor.bedroom_motion", STATE_ON)
        machine._handle_exit_sensor_event(event)

        assert machine.state.state == OccupancyState.VACANT

    def test_hold_works_with_door_open(self, mock_hass, bed_config, state_changes):
        """Hold-until-exit keeps zone OCCUPIED even when door is open (no seal)."""
        self._setup_sensor_states(mock_hass, mmwave_state=STATE_ON, door_state=STATE_ON)
        machine, changes = self._make_machine(mock_hass, bed_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._aggregator.update_reading(
                "binary_sensor.bed_mmwave", True, "motion", 1.0
            )
            machine._transition_to_occupied("mmwave detected")
            assert machine.state.sealed is False  # Door open -> no seal

            # mmWave clears
            self._setup_sensor_states(
                mock_hass, mmwave_state=STATE_OFF, door_state=STATE_ON
            )
            machine._aggregator.update_reading(
                "binary_sensor.bed_mmwave", False, "motion", 1.0
            )
            machine._check_all_sensors_clear()
            assert machine.state.state == OccupancyState.OCCUPIED  # Still held

    def test_config_serialization(self, bed_config):
        """Hold-until-exit config round-trips through serialization."""
        d = bed_config.to_dict()
        config2 = VirtualSensorConfig.from_dict(d)
        assert config2.hold_until_exit is True
        assert len(config2.exit_sensors) == 1
        assert config2.exit_sensors[0].entity_id == "binary_sensor.bedroom_motion"


STATE_UNAVAILABLE = "unavailable"


class TestSensorUnavailability:
    """Tests for door sensor unavailability handling and cached state fallback."""

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
        )

    def _make_machine(self, mock_hass, config, state_changes):
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        return OccupancyStateMachine(mock_hass, config, on_change), changes

    @staticmethod
    def _setup_sensor_states(mock_hass, motion_state=STATE_ON, door_state=STATE_OFF):
        """Set up per-entity mock states."""

        def get_state(entity_id):
            if "motion" in entity_id:
                return MagicMock(state=motion_state)
            if "door" in entity_id:
                return MagicMock(state=door_state)
            return MagicMock(state=STATE_OFF)

        mock_hass.states.get.side_effect = get_state

    def test_door_unavailable_uses_last_known_closed(
        self, mock_hass, seal_config, state_changes
    ):
        """Door was closed, goes unavailable. _all_doors_closed() returns True."""
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        # Populate cache: door was closed (False = not open)
        machine._last_known_door_states["binary_sensor.room_door"] = False

        # Door sensor now returns unavailable
        mock_hass.states.get.return_value = MagicMock(state=STATE_UNAVAILABLE)

        assert machine._all_doors_closed() is True

    def test_door_unavailable_uses_last_known_open(
        self, mock_hass, seal_config, state_changes
    ):
        """Door was open, goes unavailable. _all_doors_closed() returns False."""
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        # Populate cache: door was open (True = was open)
        machine._last_known_door_states["binary_sensor.room_door"] = True

        # Door sensor now returns unavailable
        mock_hass.states.get.return_value = MagicMock(state=STATE_UNAVAILABLE)

        assert machine._all_doors_closed() is False

    def test_door_never_seen_unavailable_assumes_open(
        self, mock_hass, seal_config, state_changes
    ):
        """No cached state, sensor unavailable. _all_doors_closed() returns False."""
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        # No cached state at all
        assert machine._last_known_door_states == {}

        # Sensor returns None (not available in HA)
        mock_hass.states.get.return_value = None

        assert machine._all_doors_closed() is False

    def test_door_event_caches_state(self, mock_hass, seal_config, state_changes):
        """Door event with valid state populates _last_known_door_states cache."""
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        # Create a mock event with door closing (STATE_OFF = closed)
        event = MagicMock()
        event.data = {
            "entity_id": "binary_sensor.room_door",
            "new_state": MagicMock(state=STATE_OFF),
        }

        # Set up states.get for the _all_doors_closed / seal logic calls
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_OFF, door_state=STATE_OFF
        )

        machine._handle_door_event(event)

        # Cache should have False (not open = closed)
        assert machine._last_known_door_states["binary_sensor.room_door"] is False

    def test_door_event_unavailable_does_not_update_cache(
        self, mock_hass, seal_config, state_changes
    ):
        """Door going unavailable does NOT update the cache."""
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        # Pre-populate cache: door was closed
        machine._last_known_door_states["binary_sensor.room_door"] = False

        # Fire door event with STATE_UNAVAILABLE
        event = MagicMock()
        event.data = {
            "entity_id": "binary_sensor.room_door",
            "new_state": MagicMock(state=STATE_UNAVAILABLE),
        }

        machine._handle_door_event(event)

        # Cache should still have False (unchanged)
        assert machine._last_known_door_states["binary_sensor.room_door"] is False

    def test_motion_sensor_unavailable_while_occupied_stays_occupied(
        self, mock_hass, seal_config, state_changes
    ):
        """Motion goes unavailable while OCCUPIED + sealed, room stays OCCUPIED."""
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # Enter occupied with seal
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._transition_to_occupied("motion detected")
            assert machine.state.state == OccupancyState.OCCUPIED
            assert machine.state.sealed is True

            # Motion sensor goes unavailable — seal still holds
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_UNAVAILABLE, door_state=STATE_OFF
            )
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", False, "motion", 1.0
            )
            machine._check_all_sensors_clear()

            # Room stays OCCUPIED because seal is active
            assert machine.state.state == OccupancyState.OCCUPIED

    def test_all_sensors_unavailable_sealed_room_stays(
        self, mock_hass, seal_config, state_changes
    ):
        """All sensors unavailable but room is sealed -> stays OCCUPIED."""
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # Enter occupied with seal
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._transition_to_occupied("motion detected")
            assert machine.state.sealed is True

            # All sensors go unavailable but door cache says closed
            machine._last_known_door_states["binary_sensor.room_door"] = False

            def get_unavailable(entity_id):
                return MagicMock(state=STATE_UNAVAILABLE)

            mock_hass.states.get.side_effect = get_unavailable

            machine._aggregator.update_reading(
                "binary_sensor.room_motion", False, "motion", 1.0
            )
            machine._check_all_sensors_clear()

            # Room stays OCCUPIED because seal probability hasn't decayed
            assert machine.state.state == OccupancyState.OCCUPIED

    @pytest.mark.asyncio
    async def test_clear_cache_on_stop(self, mock_hass, seal_config, state_changes):
        """async_stop clears _last_known_door_states."""
        machine, _ = self._make_machine(mock_hass, seal_config, state_changes)

        # Populate cache
        machine._last_known_door_states["binary_sensor.room_door"] = False
        machine._last_known_door_states["binary_sensor.other_door"] = True
        assert len(machine._last_known_door_states) == 2

        await machine.async_stop()

        assert machine._last_known_door_states == {}


class TestRapidStateChanges:
    """Tests for rapid state change scenarios."""

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
        )

    def _make_machine(self, mock_hass, config, state_changes):
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        changes, on_change = state_changes
        return OccupancyStateMachine(mock_hass, config, on_change), changes

    @staticmethod
    def _setup_sensor_states(mock_hass, motion_state=STATE_ON, door_state=STATE_OFF):
        """Set up per-entity mock states."""

        def get_state(entity_id):
            if "motion" in entity_id:
                return MagicMock(state=motion_state)
            if "door" in entity_id:
                return MagicMock(state=door_state)
            return MagicMock(state=STATE_OFF)

        mock_hass.states.get.side_effect = get_state

    def test_rapid_on_off_motion_final_state_correct(
        self, mock_hass, seal_config, state_changes
    ):
        """Motion on/off/on — final state should be OCCUPIED."""
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # Motion ON
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._update_contributing_sensors("binary_sensor.room_motion", add=True)
            machine._transition_to_occupied("motion on")
            assert machine.state.state == OccupancyState.OCCUPIED

            # Motion OFF
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_OFF, door_state=STATE_OFF
            )
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", False, "motion", 1.0
            )
            machine._update_contributing_sensors("binary_sensor.room_motion", add=False)
            # Seal keeps it occupied, so _check_all_sensors_clear won't transition
            machine._check_all_sensors_clear()

            # Motion ON again
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
            )
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._update_contributing_sensors("binary_sensor.room_motion", add=True)
            machine._transition_to_occupied("motion on again")

            assert machine.state.state == OccupancyState.OCCUPIED

    def test_door_bouncing_seal_behavior(self, mock_hass, seal_config, state_changes):
        """Door open/close rapidly doesn't permanently break seal."""
        self._setup_sensor_states(
            mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
        )
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # Enter occupied with seal
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._update_contributing_sensors("binary_sensor.room_motion", add=True)
            machine._transition_to_occupied("motion detected")
            assert machine.state.sealed is True

            # Door opens — seal breaks
            machine._break_seal("door opened")
            assert machine.state.sealed is False

            # Door closes — seal re-establishes since motion still active
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_ON, door_state=STATE_OFF
            )
            machine._transition_to_occupied("motion re-detected")
            assert machine.state.sealed is True

    def test_checking_reoccupied_checking_cycle(
        self, mock_hass, seal_config, state_changes
    ):
        """OCCUPIED -> CHECKING -> OCCUPIED -> CHECKING cycle works correctly."""
        self._setup_sensor_states(mock_hass, motion_state=STATE_ON, door_state=STATE_ON)
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # Cycle 1: OCCUPIED
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._update_contributing_sensors("binary_sensor.room_motion", add=True)
            machine._transition_to_occupied("motion detected")
            assert machine.state.state == OccupancyState.OCCUPIED

            # Cycle 1: CHECKING
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_OFF, door_state=STATE_ON
            )
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", False, "motion", 1.0
            )
            machine._update_contributing_sensors("binary_sensor.room_motion", add=False)
            machine._transition_to_checking("sensors clear")
            assert machine.state.state == OccupancyState.CHECKING

            # Cycle 2: re-OCCUPIED
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_ON, door_state=STATE_ON
            )
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._update_contributing_sensors("binary_sensor.room_motion", add=True)
            machine._transition_to_occupied("motion re-detected")
            assert machine.state.state == OccupancyState.OCCUPIED

            # Cycle 2: CHECKING again
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_OFF, door_state=STATE_ON
            )
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", False, "motion", 1.0
            )
            machine._update_contributing_sensors("binary_sensor.room_motion", add=False)
            machine._transition_to_checking("sensors clear again")
            assert machine.state.state == OccupancyState.CHECKING

    def test_checking_timer_cancelled_on_reoccupied(
        self, mock_hass, seal_config, state_changes
    ):
        """Checking timer is cancelled when room re-enters OCCUPIED."""
        self._setup_sensor_states(mock_hass, motion_state=STATE_ON, door_state=STATE_ON)
        machine, changes = self._make_machine(mock_hass, seal_config, state_changes)

        cancel_calls = []

        def mock_async_call_later(hass, delay, callback):
            cancel = MagicMock()
            cancel_calls.append(cancel)
            return cancel

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            mock_async_call_later,
        ):
            # Enter OCCUPIED
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._update_contributing_sensors("binary_sensor.room_motion", add=True)
            machine._transition_to_occupied("motion detected")

            # Transition to CHECKING — timer is set
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_OFF, door_state=STATE_ON
            )
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", False, "motion", 1.0
            )
            machine._update_contributing_sensors("binary_sensor.room_motion", add=False)
            machine._transition_to_checking("sensors clear")
            assert machine.state.state == OccupancyState.CHECKING
            assert len(cancel_calls) > 0

            timer_cancel = cancel_calls[-1]

            # Re-enter OCCUPIED — timer should be cancelled
            self._setup_sensor_states(
                mock_hass, motion_state=STATE_ON, door_state=STATE_ON
            )
            machine._aggregator.update_reading(
                "binary_sensor.room_motion", True, "motion", 1.0
            )
            machine._update_contributing_sensors("binary_sensor.room_motion", add=True)
            machine._transition_to_occupied("motion re-detected")
            assert machine.state.state == OccupancyState.OCCUPIED

            # The cancel function for the checking timer should have been called
            timer_cancel.assert_called()


class TestContributingSensorsSafety:
    """Tests for contributing sensors copy-on-write safety."""

    def _make_machine(self, mock_hass, state_changes):
        from custom_components.inhabit.engine.occupancy_state_machine import (
            OccupancyStateMachine,
        )

        config = VirtualSensorConfig(
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
        )
        changes, on_change = state_changes
        return OccupancyStateMachine(mock_hass, config, on_change), changes

    def test_contributing_sensors_copy_on_write_add(self, mock_hass, state_changes):
        """Adding a sensor creates a new list, old reference unchanged."""
        machine, _ = self._make_machine(mock_hass, state_changes)

        old_list = machine.state.contributing_sensors
        assert old_list == []

        machine._update_contributing_sensors("sensor1", add=True)

        # Old reference should still be empty
        assert old_list == []
        # New list should have the sensor
        assert "sensor1" in machine.state.contributing_sensors
        # They should be different objects
        assert old_list is not machine.state.contributing_sensors

    def test_contributing_sensors_copy_on_write_remove(self, mock_hass, state_changes):
        """Removing a sensor creates a new list, old reference unchanged."""
        machine, _ = self._make_machine(mock_hass, state_changes)

        machine._update_contributing_sensors("sensor1", add=True)
        old_list = machine.state.contributing_sensors
        assert "sensor1" in old_list

        machine._update_contributing_sensors("sensor1", add=False)

        # Old reference should still have the sensor
        assert "sensor1" in old_list
        # New list should not have the sensor
        assert "sensor1" not in machine.state.contributing_sensors
        # They should be different objects
        assert old_list is not machine.state.contributing_sensors

    def test_contributing_sensors_duplicate_add_no_change(
        self, mock_hass, state_changes
    ):
        """Adding duplicate doesn't create new list — same object returned."""
        machine, _ = self._make_machine(mock_hass, state_changes)

        machine._update_contributing_sensors("sensor1", add=True)
        ref_after_first_add = machine.state.contributing_sensors

        machine._update_contributing_sensors("sensor1", add=True)

        # Should be the exact same object (no copy needed)
        assert ref_after_first_add is machine.state.contributing_sensors
        # Only one entry
        assert machine.state.contributing_sensors.count("sensor1") == 1
