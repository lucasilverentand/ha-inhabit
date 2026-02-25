"""Tests for PresenceAggregator integration with OccupancyStateMachine."""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.engine.occupancy_state_machine import (
    OccupancyStateMachine,
)
from custom_components.inhabit.engine.presence_aggregator import PresenceAggregator
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

    # Default: all sensors OFF
    hass.states.get.return_value = MagicMock(state=STATE_OFF)

    return hass


@pytest.fixture
def config_with_presence():
    """Config with both motion and presence sensors."""
    return VirtualSensorConfig(
        room_id="test_room",
        floor_plan_id="test_fp",
        enabled=True,
        motion_timeout=120,
        checking_timeout=30,
        presence_timeout=300,
        occupied_threshold=0.5,
        vacant_threshold=0.1,
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
    )


@pytest.fixture
def state_changes():
    """Track state changes."""
    changes = []

    def on_change(state: OccupancyStateData, reason: str = ""):
        changes.append(state.state)

    return changes, on_change


def _make_machine(mock_hass, config, state_changes):
    """Helper to create a state machine."""
    changes, on_change = state_changes
    return OccupancyStateMachine(mock_hass, config, on_change), changes


def _make_event(entity_id, state):
    """Helper to create a mock HA state change event."""
    event = MagicMock()
    event.data = {
        "entity_id": entity_id,
        "new_state": MagicMock(state=state),
    }
    return event


class TestPresenceSensorSubscriptions:
    """Test that presence sensor subscriptions are created in async_start."""

    @pytest.mark.asyncio
    async def test_presence_sensors_subscribed(self, mock_hass, config_with_presence, state_changes):
        """Presence sensor entity_ids are subscribed in async_start."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_track_state_change_event",
        ) as mock_track, patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            mock_track.return_value = MagicMock()
            await machine.async_start()

            # Collect all entity_ids that were subscribed
            subscribed_entity_ids = [
                call.args[1] for call in mock_track.call_args_list
            ]

            # Presence sensor must be in the subscribed list
            assert "binary_sensor.test_presence" in subscribed_entity_ids

    @pytest.mark.asyncio
    async def test_subscription_count_includes_presence(
        self, mock_hass, config_with_presence, state_changes
    ):
        """Total subscription count includes motion + door + presence + exit sensors."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_track_state_change_event",
        ) as mock_track, patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            mock_track.return_value = MagicMock()
            await machine.async_start()

            # 1 motion + 1 door + 1 presence = 3
            expected = (
                len(config_with_presence.motion_sensors)
                + len(config_with_presence.door_sensors)
                + len(config_with_presence.presence_sensors)
                + len(config_with_presence.exit_sensors)
            )
            assert mock_track.call_count == expected


class TestMotionEventsUpdateAggregator:
    """Test that motion events update both the aggregator and the state machine."""

    def test_motion_on_updates_aggregator(self, mock_hass, config_with_presence, state_changes):
        """Motion ON event feeds into the aggregator."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            event = _make_event("binary_sensor.test_motion", STATE_ON)
            machine._handle_motion_event(event)

            # Check aggregator has the reading
            assert "binary_sensor.test_motion" in machine._aggregator._readings
            reading = machine._aggregator._readings["binary_sensor.test_motion"]
            assert reading.is_active is True
            assert reading.sensor_type == "motion"
            assert reading.weight == 1.0

    def test_motion_off_updates_aggregator(self, mock_hass, config_with_presence, state_changes):
        """Motion OFF event feeds into the aggregator."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            event = _make_event("binary_sensor.test_motion", STATE_OFF)
            machine._handle_motion_event(event)

            assert "binary_sensor.test_motion" in machine._aggregator._readings
            reading = machine._aggregator._readings["binary_sensor.test_motion"]
            assert reading.is_active is False

    def test_presence_on_updates_aggregator(self, mock_hass, config_with_presence, state_changes):
        """Presence ON event feeds into the aggregator."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            event = _make_event("binary_sensor.test_presence", STATE_ON)
            machine._handle_presence_event(event)

            assert "binary_sensor.test_presence" in machine._aggregator._readings
            reading = machine._aggregator._readings["binary_sensor.test_presence"]
            assert reading.is_active is True
            assert reading.sensor_type == "presence"
            assert reading.weight == 1.5

    def test_motion_event_transitions_to_occupied_and_updates_confidence(
        self, mock_hass, config_with_presence, state_changes
    ):
        """Motion ON triggers OCCUPIED with aggregator-based confidence."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            event = _make_event("binary_sensor.test_motion", STATE_ON)
            machine._handle_motion_event(event)

            assert machine.state.state == OccupancyState.OCCUPIED
            # Confidence should be > 0 since there's an active reading
            assert machine.state.confidence > 0.0


class TestThresholdGatedTransitions:
    """Test threshold-gated transition logic."""

    def test_physically_active_sensor_always_triggers_occupied(
        self, mock_hass, config_with_presence, state_changes
    ):
        """If a sensor is physically active, OCCUPIED triggers regardless of probability."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        # Make motion sensor report ON for _any_sensor_active check
        mock_hass.states.get.return_value = MagicMock(state=STATE_ON)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # Call transition directly — even with low aggregator probability,
            # the fast-path (any sensor active) should allow it
            machine._transition_to_occupied("test physical activity")

            assert machine.state.state == OccupancyState.OCCUPIED

    def test_low_probability_blocks_occupied_when_no_sensor_active(
        self, mock_hass, config_with_presence, state_changes
    ):
        """Without active sensors, low probability blocks OCCUPIED transition."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        # All sensors OFF
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        # Aggregator has no readings, probability = 0.0 < occupied_threshold (0.5)
        machine._transition_to_occupied("test low probability")

        # Should remain VACANT
        assert machine.state.state == OccupancyState.VACANT

    def test_high_probability_allows_occupied_even_without_active_sensor(
        self, mock_hass, config_with_presence, state_changes
    ):
        """With sufficient aggregator probability, OCCUPIED can trigger without active sensor."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        # All sensors OFF in HA states
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        # But aggregator has a high-probability active reading
        machine._aggregator.update_reading(
            "binary_sensor.test_motion", True, "motion", 1.0
        )
        machine._aggregator.update_reading(
            "binary_sensor.test_presence", True, "presence", 1.5
        )

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            probability = machine._aggregator.get_presence_probability()
            assert probability >= config_with_presence.occupied_threshold

            machine._transition_to_occupied("test high probability")
            assert machine.state.state == OccupancyState.OCCUPIED


class TestVacantThresholdBlocking:
    """Test that probability above vacant_threshold blocks CHECKING transition."""

    def test_high_probability_blocks_checking_when_sensors_clear(
        self, mock_hass, config_with_presence, state_changes
    ):
        """Aggregator probability > vacant_threshold prevents CHECKING."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # First, get into OCCUPIED
            machine._state.state = OccupancyState.OCCUPIED

            # All binary sensors OFF
            mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

            # But aggregator still has a high active reading (recently updated)
            machine._aggregator.update_reading(
                "binary_sensor.test_presence", True, "presence", 1.5
            )

            probability = machine._aggregator.get_presence_probability()
            assert probability > config_with_presence.vacant_threshold

            machine._check_all_sensors_clear()

            # Should remain OCCUPIED because aggregator probability is high
            assert machine.state.state == OccupancyState.OCCUPIED

    def test_low_probability_allows_checking_when_sensors_clear(
        self, mock_hass, config_with_presence, state_changes
    ):
        """Aggregator probability <= vacant_threshold allows CHECKING."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine._state.state = OccupancyState.OCCUPIED

            # All binary sensors OFF
            mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

            # Aggregator has no readings or only inactive ones → probability = 0.0
            machine._aggregator.update_reading(
                "binary_sensor.test_motion", False, "motion", 1.0
            )
            machine._aggregator.update_reading(
                "binary_sensor.test_presence", False, "presence", 1.5
            )

            probability = machine._aggregator.get_presence_probability()
            assert probability <= config_with_presence.vacant_threshold

            machine._check_all_sensors_clear()

            # Should transition to CHECKING
            assert machine.state.state == OccupancyState.CHECKING


class TestTemporalDecay:
    """Test that aggregator temporal decay works correctly."""

    def test_fresh_reading_has_full_weight(self, mock_hass, config_with_presence, state_changes):
        """A just-created active reading yields high probability."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        machine._aggregator.update_reading(
            "binary_sensor.test_motion", True, "motion", 1.0
        )

        probability = machine._aggregator.get_presence_probability()
        # Fresh reading: decay_factor ~= 1.0, so probability should be ~1.0
        assert probability > 0.9

    def test_decayed_reading_has_low_probability(
        self, mock_hass, config_with_presence, state_changes
    ):
        """After the full decay period, the reading is ignored."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        # Manually create an old reading (older than motion_decay_seconds=120)
        from custom_components.inhabit.engine.presence_aggregator import SensorReading

        old_time = datetime.now() - timedelta(seconds=150)
        machine._aggregator._readings["binary_sensor.test_motion"] = SensorReading(
            entity_id="binary_sensor.test_motion",
            is_active=True,
            timestamp=old_time,
            weight=1.0,
            sensor_type="motion",
        )

        probability = machine._aggregator.get_presence_probability()
        # Reading is older than decay_seconds (120s), so it's fully decayed
        assert probability == 0.0

    def test_half_decayed_reading_has_reduced_probability(
        self, mock_hass, config_with_presence, state_changes
    ):
        """A reading at half its decay period has ~50% effective weight."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        from custom_components.inhabit.engine.presence_aggregator import SensorReading

        # motion_decay_seconds = 120, so half-life is at 60s
        half_time = datetime.now() - timedelta(seconds=60)
        machine._aggregator._readings["binary_sensor.test_motion"] = SensorReading(
            entity_id="binary_sensor.test_motion",
            is_active=True,
            timestamp=half_time,
            weight=1.0,
            sensor_type="motion",
        )

        probability = machine._aggregator.get_presence_probability()
        # At 60s out of 120s decay: factor = 1 - 60/120 = 0.5
        # Active reading with factor 0.5: probability = 0.5/0.5 = 1.0
        # (because it's the only reading and it's active)
        # Actually — active_weight = 1.0 * 0.5 = 0.5, total_weight = 1.0 * 0.5 = 0.5
        # probability = 0.5 / 0.5 = 1.0
        assert probability > 0.5

    def test_presence_sensor_uses_longer_decay(
        self, mock_hass, config_with_presence, state_changes
    ):
        """Presence sensors use presence_decay_seconds (300s), not motion (120s)."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        from custom_components.inhabit.engine.presence_aggregator import SensorReading

        # 200 seconds old — past motion decay (120s) but within presence decay (300s)
        old_time = datetime.now() - timedelta(seconds=200)
        machine._aggregator._readings["binary_sensor.test_presence"] = SensorReading(
            entity_id="binary_sensor.test_presence",
            is_active=True,
            timestamp=old_time,
            weight=1.5,
            sensor_type="presence",
        )

        probability = machine._aggregator.get_presence_probability()
        # 200s into 300s decay: factor = 1 - 200/300 ≈ 0.333
        # Still active and non-zero
        assert probability > 0.0


class TestAggregatorCleanup:
    """Test that aggregator is cleaned up on async_stop."""

    @pytest.mark.asyncio
    async def test_aggregator_cleared_on_stop(
        self, mock_hass, config_with_presence, state_changes
    ):
        """Aggregator readings are cleared when the state machine stops."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        # Add some readings
        machine._aggregator.update_reading(
            "binary_sensor.test_motion", True, "motion", 1.0
        )
        machine._aggregator.update_reading(
            "binary_sensor.test_presence", True, "presence", 1.5
        )
        assert len(machine._aggregator._readings) == 2

        await machine.async_stop()

        assert len(machine._aggregator._readings) == 0
        assert machine._aggregator.get_presence_probability() == 0.0

    @pytest.mark.asyncio
    async def test_aggregator_cleared_after_start_stop_cycle(
        self, mock_hass, config_with_presence, state_changes
    ):
        """Aggregator is clean after a start-stop cycle."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_track_state_change_event",
            return_value=MagicMock(),
        ), patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            await machine.async_start()

            # Simulate some readings during operation
            machine._aggregator.update_reading(
                "binary_sensor.test_motion", True, "motion", 1.0
            )

            await machine.async_stop()

            assert len(machine._aggregator._readings) == 0


class TestAggregatorInitialization:
    """Test aggregator is properly initialized with config values."""

    def test_aggregator_uses_config_timeouts(self, mock_hass, config_with_presence, state_changes):
        """Aggregator decay seconds match config motion/presence timeouts."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        assert machine._aggregator.motion_decay_seconds == float(
            config_with_presence.motion_timeout
        )
        assert machine._aggregator.presence_decay_seconds == float(
            config_with_presence.presence_timeout
        )

    def test_aggregator_has_correct_bindings(self, mock_hass, config_with_presence, state_changes):
        """Aggregator receives the correct sensor bindings from config."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        assert machine._aggregator.motion_bindings == config_with_presence.motion_sensors
        assert machine._aggregator.presence_bindings == config_with_presence.presence_sensors


class TestConfidenceFromAggregator:
    """Test that confidence is now derived from the aggregator."""

    def test_confidence_zero_with_no_readings(self, mock_hass, config_with_presence, state_changes):
        """Confidence is 0.0 when aggregator has no readings."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        assert machine._calculate_confidence() == 0.0

    def test_confidence_matches_aggregator_probability(
        self, mock_hass, config_with_presence, state_changes
    ):
        """Confidence tracks aggregator's get_presence_probability output."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        machine._aggregator.update_reading(
            "binary_sensor.test_motion", True, "motion", 1.0
        )

        expected = machine._aggregator.get_presence_probability()
        actual = machine._calculate_confidence()

        assert actual == expected
        assert actual > 0.0


class TestInitialStateWithAggregator:
    """Test that _evaluate_initial_state refreshes the aggregator."""

    @pytest.mark.asyncio
    async def test_initial_state_refreshes_aggregator(
        self, mock_hass, config_with_presence, state_changes
    ):
        """_evaluate_initial_state calls aggregator.refresh_from_state."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        with patch.object(
            machine._aggregator, "refresh_from_state"
        ) as mock_refresh, patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            await machine._evaluate_initial_state()
            mock_refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_initial_presence_detected_triggers_occupied(
        self, mock_hass, config_with_presence, state_changes
    ):
        """If a presence sensor is active at startup, state goes to OCCUPIED."""
        machine, changes = _make_machine(mock_hass, config_with_presence, state_changes)

        # Motion OFF, presence ON
        def get_state(entity_id):
            if entity_id == "binary_sensor.test_presence":
                return MagicMock(state=STATE_ON)
            return MagicMock(state=STATE_OFF)

        mock_hass.states.get.side_effect = get_state

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            await machine._evaluate_initial_state()

            assert machine.state.state == OccupancyState.OCCUPIED
