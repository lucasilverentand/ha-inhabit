"""Unit tests for per-sensor diagnostics."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock, patch

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.const import ATTR_SENSOR_DIAGNOSTICS, OccupancyState
from custom_components.inhabit.engine.sensor_reliability import SensorAccuracyRecord
from custom_components.inhabit.models.virtual_sensor import (
    OccupancyStateData,
    SensorBinding,
    VirtualSensorConfig,
)

STATE_ON = "on"
STATE_OFF = "off"


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.states = MagicMock()
    hass.loop = MagicMock()
    hass.states.get.return_value = MagicMock(state=STATE_OFF)
    return hass


@pytest.fixture
def multi_sensor_config():
    """Config with two motion sensors and one presence sensor."""
    return VirtualSensorConfig(
        room_id="test_room",
        floor_plan_id="test_fp",
        enabled=True,
        motion_timeout=120,
        checking_timeout=30,
        motion_sensors=[
            SensorBinding(
                entity_id="binary_sensor.motion_a",
                sensor_type="motion",
                weight=1.0,
            ),
            SensorBinding(
                entity_id="binary_sensor.motion_b",
                sensor_type="motion",
                weight=2.0,
            ),
        ],
        presence_sensors=[
            SensorBinding(
                entity_id="binary_sensor.presence_1",
                sensor_type="presence",
                weight=1.5,
            ),
        ],
        hint_sensors=[
            SensorBinding(
                entity_id="light.room",
                sensor_type="light",
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
        changes.append(state)

    return changes, on_change


def _make_machine(mock_hass, config, state_changes):
    from custom_components.inhabit.engine.occupancy_state_machine import (
        OccupancyStateMachine,
    )

    changes, on_change = state_changes
    return OccupancyStateMachine(mock_hass, config, on_change), changes


class TestBuildSensorDiagnostics:
    """Tests for _build_sensor_diagnostics."""

    def test_diagnostics_include_all_sensors(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """Diagnostics include motion, presence, and hint sensors."""
        machine, changes = _make_machine(mock_hass, multi_sensor_config, state_changes)
        diagnostics = machine._build_sensor_diagnostics()

        assert "binary_sensor.motion_a" in diagnostics
        assert "binary_sensor.motion_b" in diagnostics
        assert "binary_sensor.presence_1" in diagnostics
        assert "light.room" in diagnostics

    def test_diagnostics_fields(self, mock_hass, multi_sensor_config, state_changes):
        """Each diagnostic record has the expected fields."""
        machine, changes = _make_machine(mock_hass, multi_sensor_config, state_changes)
        diagnostics = machine._build_sensor_diagnostics()

        for eid, record in diagnostics.items():
            assert "active" in record
            assert "base_weight" in record
            assert "effective_weight" in record
            assert "reliability" in record
            assert "sensor_type" in record
            assert "last_triggered" in record

    def test_motion_sensor_base_weight(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """Motion sensor base_weight matches config."""
        machine, changes = _make_machine(mock_hass, multi_sensor_config, state_changes)
        diagnostics = machine._build_sensor_diagnostics()

        assert diagnostics["binary_sensor.motion_a"]["base_weight"] == 1.0
        assert diagnostics["binary_sensor.motion_b"]["base_weight"] == 2.0

    def test_inactive_sensors(self, mock_hass, multi_sensor_config, state_changes):
        """Sensors not in contributing_sensors are marked inactive."""
        machine, changes = _make_machine(mock_hass, multi_sensor_config, state_changes)
        diagnostics = machine._build_sensor_diagnostics()

        assert diagnostics["binary_sensor.motion_a"]["active"] is False
        assert diagnostics["binary_sensor.motion_b"]["active"] is False

    def test_active_sensor(self, mock_hass, multi_sensor_config, state_changes):
        """Sensors in contributing_sensors are marked active."""
        machine, changes = _make_machine(mock_hass, multi_sensor_config, state_changes)
        machine._state.contributing_sensors.append("binary_sensor.motion_a")
        diagnostics = machine._build_sensor_diagnostics()

        assert diagnostics["binary_sensor.motion_a"]["active"] is True

    def test_reliability_affects_effective_weight(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """Unreliable sensor has reduced effective_weight."""
        machine, changes = _make_machine(mock_hass, multi_sensor_config, state_changes)

        machine._reliability_tracker._records["binary_sensor.motion_a"] = (
            SensorAccuracyRecord(
                entity_id="binary_sensor.motion_a",
                true_positives=5,
                false_positives=5,
            )
        )

        diagnostics = machine._build_sensor_diagnostics()
        record = diagnostics["binary_sensor.motion_a"]
        assert record["reliability"] == pytest.approx(0.5)
        assert record["effective_weight"] == pytest.approx(0.5)  # 1.0 * 0.5

    def test_last_triggered_initially_none(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """last_triggered is None before any activation."""
        machine, changes = _make_machine(mock_hass, multi_sensor_config, state_changes)
        diagnostics = machine._build_sensor_diagnostics()

        assert diagnostics["binary_sensor.motion_a"]["last_triggered"] is None

    def test_last_triggered_updated_on_motion(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """last_triggered is updated when motion fires."""
        machine, changes = _make_machine(mock_hass, multi_sensor_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            event = MagicMock()
            event.data = {
                "entity_id": "binary_sensor.motion_a",
                "new_state": MagicMock(state=STATE_ON),
            }
            machine._handle_motion_event(event)

        diagnostics = machine._build_sensor_diagnostics()
        assert diagnostics["binary_sensor.motion_a"]["last_triggered"] is not None

    def test_hint_sensor_type(self, mock_hass, multi_sensor_config, state_changes):
        """Hint sensors have sensor_type='hint'."""
        machine, changes = _make_machine(mock_hass, multi_sensor_config, state_changes)
        diagnostics = machine._build_sensor_diagnostics()

        assert diagnostics["light.room"]["sensor_type"] == "hint"

    def test_presence_sensor_type(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """Presence sensors have sensor_type='presence'."""
        machine, changes = _make_machine(mock_hass, multi_sensor_config, state_changes)
        diagnostics = machine._build_sensor_diagnostics()

        assert diagnostics["binary_sensor.presence_1"]["sensor_type"] == "presence"


class TestDiagnosticsInStateChange:
    """Tests that diagnostics are included in state change notifications."""

    def test_diagnostics_set_on_notify(
        self, mock_hass, multi_sensor_config, state_changes
    ):
        """sensor_diagnostics is populated on _notify_state_change."""
        machine, changes = _make_machine(mock_hass, multi_sensor_config, state_changes)
        machine._notify_state_change("test")

        assert len(changes) == 1
        state_data = changes[0]
        assert len(state_data.sensor_diagnostics) > 0
        assert "binary_sensor.motion_a" in state_data.sensor_diagnostics

    def test_diagnostics_in_state_data_to_dict(self):
        """sensor_diagnostics serializes in to_dict."""
        state = OccupancyStateData(
            sensor_diagnostics={
                "sensor.a": {
                    "active": True,
                    "base_weight": 1.0,
                    "effective_weight": 0.8,
                    "reliability": 0.8,
                    "sensor_type": "motion",
                    "last_triggered": None,
                }
            }
        )
        d = state.to_dict()
        assert "sensor_diagnostics" in d
        assert "sensor.a" in d["sensor_diagnostics"]


class TestAttrSensorDiagnosticsConstant:
    """Test the ATTR_SENSOR_DIAGNOSTICS constant exists."""

    def test_constant_value(self):
        assert ATTR_SENSOR_DIAGNOSTICS == "sensor_diagnostics"
