"""Tests for AI-readable diagnostics and config patch tools."""

from __future__ import annotations

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.config_patch import (
    apply_sensor_config_patch,
    preview_sensor_config_patch,
)
from custom_components.inhabit.diagnostics import DiagnosticTrace
from custom_components.inhabit.engine.occupancy_state_machine import (
    OccupancyStateMachine,
)
from custom_components.inhabit.engine.virtual_sensor_engine import VirtualSensorEngine
from custom_components.inhabit.models.floor_plan import Coordinates
from custom_components.inhabit.models.virtual_sensor import VirtualSensorConfig


def _store_with_config(config: VirtualSensorConfig | None = None) -> MagicMock:
    store = MagicMock()
    store.find_floor_plan_id_for_room.return_value = "fp_test"
    store.get_sensor_config.return_value = config
    store.get_all_sensor_configs.return_value = [config] if config else []
    store.update_sensor_config.side_effect = lambda cfg: cfg
    store.create_sensor_config.side_effect = lambda cfg: cfg
    return store


def _engine_store(config: VirtualSensorConfig) -> MagicMock:
    store = _store_with_config(config)
    store.get_floor_plans.return_value = []
    store.get_occupancy_history.return_value = []
    store.get_false_vacancy_data.return_value = {}
    store.get_feedback_data.return_value = {}
    store.get_timeout_history.return_value = {}
    store.get_sensor_reliability.return_value = {}
    store.get_pattern_priors.return_value = {}
    store.get_transition_learner_data.return_value = {}
    store.get_diagnostic_trace.return_value = []
    store.save_diagnostic_trace = MagicMock()
    return store


class TestDiagnosticTrace:
    def test_filters_and_limits_events(self):
        trace = DiagnosticTrace(maxlen=3)
        trace.record(category="state", event="a", room_id="room_a")
        trace.record(category="sensor", event="b", room_id="room_b")
        trace.record(category="state", event="c", room_id="room_a")
        trace.record(category="state", event="d", room_id="room_a")

        events = trace.to_dicts(room_id="room_a", category="state", limit=2)

        assert [event["event"] for event in events] == ["c", "d"]
        assert all(event["room_id"] == "room_a" for event in events)

    def test_loads_persisted_events(self):
        trace = DiagnosticTrace(maxlen=3)

        trace.load_events(
            [
                {
                    "category": "state",
                    "event": "persisted",
                    "room_id": "room_a",
                    "confidence": "0.75",
                    "contributing_sensors": ["binary_sensor.motion"],
                    "metadata": {"source": "storage"},
                },
                "invalid",
            ]
        )

        events = trace.to_dicts(room_id="room_a")
        assert len(events) == 1
        assert events[0]["event"] == "persisted"
        assert events[0]["confidence"] == 0.75
        assert events[0]["metadata"] == {"source": "storage"}


class TestConfigPatchTools:
    def test_preview_rejects_unknown_fields(self):
        config = VirtualSensorConfig(room_id="room_a", floor_plan_id="fp_test")
        store = _store_with_config(config)

        result = preview_sensor_config_patch(
            store,
            "room_a",
            {"not_a_field": True},
        )

        assert result.valid is False
        assert "unknown fields" in result.errors[0]

    def test_preview_returns_clear_diff(self):
        config = VirtualSensorConfig(
            room_id="room_a",
            floor_plan_id="fp_test",
            checking_timeout=30,
            occupied_threshold=0.5,
        )
        store = _store_with_config(config)

        result = preview_sensor_config_patch(
            store,
            "room_a",
            {"checking_timeout": 45, "occupied_threshold": 0.6},
        )

        assert result.valid is True
        assert {
            "field": "checking_timeout",
            "before": 30,
            "after": 45,
        } in result.diff
        assert {
            "field": "occupied_threshold",
            "before": 0.5,
            "after": 0.6,
        } in result.diff
        assert result.proposed["policy_overrides"]["checking_timeout"] == 45

    def test_preview_policy_overrides_apply_after_profile(self):
        config = VirtualSensorConfig(room_id="room_a", floor_plan_id="fp_test")
        store = _store_with_config(config)

        result = preview_sensor_config_patch(
            store,
            "room_a",
            {
                "occupancy_profile": "transit",
                "policy_overrides": {
                    "motion_timeout": 90,
                    "door_seals_room": True,
                    "unsupported": "ignored",
                },
            },
        )

        assert result.valid is True
        assert result.proposed["occupancy_profile"] == "transit"
        assert result.proposed["motion_timeout"] == 90
        assert result.proposed["door_seals_room"] is True
        assert result.proposed["policy_overrides"] == {
            "motion_timeout": 90,
            "door_seals_room": True,
        }

    def test_preview_rejects_invalid_threshold_order(self):
        config = VirtualSensorConfig(room_id="room_a", floor_plan_id="fp_test")
        store = _store_with_config(config)

        result = preview_sensor_config_patch(
            store,
            "room_a",
            {"vacant_threshold": 0.8, "occupied_threshold": 0.4},
        )

        assert result.valid is False
        assert "thresholds must satisfy" in result.errors[0]

    @pytest.mark.asyncio
    async def test_apply_updates_store_and_engine(self):
        config = VirtualSensorConfig(room_id="room_a", floor_plan_id="fp_test")
        store = _store_with_config(config)
        sensor_engine = MagicMock()
        sensor_engine.async_update_room = AsyncMock()

        result = await apply_sensor_config_patch(
            store,
            sensor_engine,
            "room_a",
            {"checking_timeout": 55},
        )

        assert result.valid is True
        assert result.config is not None
        assert result.config.checking_timeout == 55
        store.update_sensor_config.assert_called_once()
        sensor_engine.async_update_room.assert_awaited_once()


class TestStateMachineDiagnostics:
    def test_blocked_transition_records_diagnostic(self, mock_hass):
        diagnostics = []
        config = VirtualSensorConfig(
            room_id="room_a",
            floor_plan_id="fp_test",
            occupied_threshold=0.9,
            door_seals_room=False,
        )
        machine = OccupancyStateMachine(
            mock_hass,
            config,
            lambda _state, _reason="": None,
            on_diagnostic=lambda **event: diagnostics.append(event),
        )

        machine._transition_to_occupied("aggregator only", fresh_detection=False)

        assert diagnostics[-1]["event"] == "transition_blocked"
        assert diagnostics[-1]["blockers"] == ["occupied_threshold"]

    def test_spatial_presence_records_diagnostic(self, mock_hass):
        diagnostics = []
        config = VirtualSensorConfig(
            room_id="room_a",
            floor_plan_id="fp_test",
            presence_affects=True,
            door_seals_room=False,
        )
        machine = OccupancyStateMachine(
            mock_hass,
            config,
            lambda _state, _reason="": None,
            on_diagnostic=lambda **event: diagnostics.append(event),
        )

        machine.update_spatial_presence(1)

        assert any(event["event"] == "spatial_presence_update" for event in diagnostics)


class TestEngineDiagnostics:
    @pytest.mark.asyncio
    async def test_loads_persisted_diagnostic_trace(self, mock_hass):
        config = VirtualSensorConfig(room_id="room_a", floor_plan_id="fp_test")
        store = _engine_store(config)
        store.get_diagnostic_trace.return_value = [
            {
                "category": "state",
                "event": "restored_trace",
                "room_id": "room_a",
                "reason": "loaded from storage",
            }
        ]
        engine = VirtualSensorEngine(mock_hass, store)

        await engine.async_start()

        result = engine.get_diagnostics(room_id="room_a", category="state")
        assert result["event_count"] == 1
        assert result["events"][0]["event"] == "restored_trace"

    def test_get_diagnostics_includes_state_and_config(self, mock_hass):
        config = VirtualSensorConfig(room_id="room_a", floor_plan_id="fp_test")
        store = _engine_store(config)
        engine = VirtualSensorEngine(mock_hass, store)
        engine.record_diagnostic(category="state", event="test", room_id="room_a")

        result = engine.get_diagnostics(
            room_id="room_a",
            category="state",
            include_config=True,
        )

        assert result["event_count"] == 1
        assert result["events"][0]["event"] == "test"
        assert result["config"]["room_id"] == "room_a"
        store.save_diagnostic_trace.assert_called()

    def test_record_diagnostic_persists_trace(self, mock_hass):
        config = VirtualSensorConfig(room_id="room_a", floor_plan_id="fp_test")
        store = _engine_store(config)
        engine = VirtualSensorEngine(mock_hass, store)

        engine.record_diagnostic(category="state", event="test", room_id="room_a")

        store.save_diagnostic_trace.assert_called_once()
        saved = store.save_diagnostic_trace.call_args.args[0]
        assert saved[-1]["event"] == "test"

    def test_mmwave_routing_records_diagnostics(self, mock_hass):
        config = VirtualSensorConfig(
            room_id="room_a",
            floor_plan_id="fp_test",
            presence_affects=True,
        )
        store = _engine_store(config)
        engine = VirtualSensorEngine(mock_hass, store)
        machine = MagicMock()
        engine._state_machines["room_a"] = machine

        engine._handle_mmwave_target_update(
            "placement_a",
            0,
            Coordinates(x=1, y=2),
            ["room_a"],
        )

        events = engine.get_diagnostics(room_id="room_a", category="spatial")["events"]
        assert any(event["event"] == "target_entered_region" for event in events)
        assert any(event["event"] == "spatial_presence_routed" for event in events)
        machine.update_spatial_presence.assert_called_once_with(1)

    def test_pending_spatial_presence_cancellation_records_diagnostic(self, mock_hass):
        config = VirtualSensorConfig(
            room_id="zone_a",
            floor_plan_id="fp_test",
            presence_affects=True,
            spatial_presence_delay=5,
        )
        store = _engine_store(config)
        engine = VirtualSensorEngine(mock_hass, store)

        with patch(
            "custom_components.inhabit.engine.virtual_sensor_engine.async_call_later",
            return_value=MagicMock(),
        ):
            engine._handle_mmwave_target_update(
                "placement_a",
                0,
                Coordinates(x=1, y=2),
                ["zone_a"],
            )
            engine._handle_mmwave_target_update(
                "placement_a",
                0,
                Coordinates(x=0, y=0),
                [],
            )

        events = engine.get_diagnostics(room_id="zone_a", category="spatial")["events"]
        assert any(event["event"] == "target_pending_region" for event in events)
        assert any(event["event"] == "target_pending_cancelled" for event in events)
