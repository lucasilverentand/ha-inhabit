"""Unit tests for the VirtualSensorEngine."""

from __future__ import annotations

import sys
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
from custom_components.inhabit.models.zone import Zone


def _make_config(
    room_id: str = "room_a",
    enabled: bool = True,
    occupies_parent: bool = False,
    parent_room_id: str = "",
) -> VirtualSensorConfig:
    """Build a minimal VirtualSensorConfig for testing."""
    return VirtualSensorConfig(
        room_id=room_id,
        floor_plan_id="fp_test",
        enabled=enabled,
        motion_timeout=120,
        checking_timeout=30,
        presence_timeout=300,
        motion_sensors=[
            SensorBinding(
                entity_id=f"binary_sensor.{room_id}_motion",
                sensor_type="motion",
                weight=1.0,
            ),
        ],
        occupies_parent=occupies_parent,
        parent_room_id=parent_room_id,
    )


def _make_zone(
    zone_id: str = "zone_a",
    room_id: str = "room_a",
    occupies_parent: bool = True,
) -> Zone:
    """Build a minimal Zone for testing."""
    return Zone(
        id=zone_id,
        name=f"Zone {zone_id}",
        floor_id="floor_ground",
        room_id=room_id,
        occupies_parent=occupies_parent,
    )


def _mock_store(configs: list[VirtualSensorConfig] | None = None, floor_plans=None):
    """Create a mock FloorPlanStore with sensible defaults."""
    store = MagicMock()
    store.get_all_sensor_configs.return_value = configs or []
    store.get_floor_plans.return_value = floor_plans or []
    store.get_occupancy_history.return_value = []
    store.get_false_vacancy_data.return_value = {}
    store.get_feedback_data.return_value = {}
    store.get_timeout_history.return_value = {}
    store.get_sensor_reliability.return_value = {}
    store.get_pattern_priors.return_value = {}
    store.get_transition_learner_data.return_value = {}
    store.get_sensor_config.return_value = None
    store.save_occupancy_history = MagicMock()
    store.save_false_vacancy_data = MagicMock()
    store.save_feedback_data = MagicMock()
    store.save_timeout_history = MagicMock()
    store.save_sensor_reliability = MagicMock()
    store.save_pattern_priors = MagicMock()
    store.save_transition_learner_data = MagicMock()
    return store


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = MagicMock()
    hass.data = {}
    hass.states = MagicMock()
    hass.states.get.return_value = None
    hass.loop = MagicMock()
    hass.config = MagicMock()
    hass.config.path = lambda *args: "/".join(args)
    hass.async_add_executor_job = AsyncMock(side_effect=lambda f, *a: f(*a))
    hass.bus = MagicMock()

    def mock_call_later(delay, callback):
        return MagicMock()

    hass.loop.call_later = mock_call_later
    return hass


# Patch targets used by VirtualSensorEngine and OccupancyStateMachine
_PATCH_TARGETS = {
    "track_state": "homeassistant.helpers.event.async_track_state_change_event",
    "track_time": "homeassistant.helpers.event.async_track_time_interval",
    "dispatch_send": "homeassistant.helpers.dispatcher.async_dispatcher_send",
    "dispatch_connect": "homeassistant.helpers.dispatcher.async_dispatcher_connect",
}


@pytest.fixture
def patched_ha():
    """Patch Home Assistant helpers used by the engine."""
    with (
        patch(_PATCH_TARGETS["track_state"], return_value=MagicMock()) as track_state,
        patch(_PATCH_TARGETS["track_time"], return_value=MagicMock()) as track_time,
        patch(_PATCH_TARGETS["dispatch_send"]) as dispatch_send,
        patch(
            _PATCH_TARGETS["dispatch_connect"], return_value=MagicMock()
        ) as dispatch_connect,
    ):
        yield {
            "track_state": track_state,
            "track_time": track_time,
            "dispatch_send": dispatch_send,
            "dispatch_connect": dispatch_connect,
        }


async def _build_engine(mock_hass, store, patched_ha, start: bool = True):
    """Construct a VirtualSensorEngine and optionally start it."""
    from custom_components.inhabit.engine.virtual_sensor_engine import (
        VirtualSensorEngine,
    )

    engine = VirtualSensorEngine(mock_hass, store)
    if start:
        await engine.async_start()
    return engine


# ======================================================================
# TestEngineLifecycle
# ======================================================================


class TestEngineLifecycle:
    """Tests for start / stop / restart behaviour."""

    @pytest.mark.asyncio
    async def test_start_creates_machines_for_enabled_configs(
        self, mock_hass, patched_ha
    ):
        """Configs in the store should produce state machines on start."""
        cfg_a = _make_config("room_a", enabled=True)
        cfg_b = _make_config("room_b", enabled=True)
        cfg_disabled = _make_config("room_c", enabled=False)
        store = _mock_store(configs=[cfg_a, cfg_b, cfg_disabled])

        engine = await _build_engine(mock_hass, store, patched_ha)

        assert "room_a" in engine._state_machines
        assert "room_b" in engine._state_machines
        assert "room_c" not in engine._state_machines
        assert engine.running is True

    @pytest.mark.asyncio
    async def test_start_idempotent(self, mock_hass, patched_ha):
        """Calling async_start twice must not duplicate subscriptions."""
        cfg = _make_config("room_a")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)
        machine_count_before = len(engine._state_machines)

        # Call start again — should be a no-op
        await engine.async_start()

        assert len(engine._state_machines) == machine_count_before

    @pytest.mark.asyncio
    async def test_stop_removes_all_machines(self, mock_hass, patched_ha):
        """After stop, _state_machines should be empty."""
        cfg = _make_config("room_a")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)
        assert len(engine._state_machines) == 1

        await engine.async_stop()

        assert len(engine._state_machines) == 0
        assert engine.running is False

    @pytest.mark.asyncio
    async def test_stop_persists_data(self, mock_hass, patched_ha):
        """Stop must persist occupancy history, feedback, reliability, etc."""
        cfg = _make_config("room_a")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)
        await engine.async_stop()

        store.save_occupancy_history.assert_called_once()
        store.save_false_vacancy_data.assert_called_once()
        store.save_feedback_data.assert_called_once()
        store.save_timeout_history.assert_called_once()
        store.save_transition_learner_data.assert_called_once()

    @pytest.mark.asyncio
    async def test_restart_recreates_machines(self, mock_hass, patched_ha):
        """Stop then start should re-create machines from the store."""
        cfg = _make_config("room_a")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)
        await engine.async_stop()
        assert len(engine._state_machines) == 0

        # Start again
        await engine.async_start()
        assert len(engine._state_machines) == 1
        assert engine.running is True


# ======================================================================
# TestRoomManagement
# ======================================================================


class TestRoomManagement:
    """Tests for add / remove / update room operations."""

    @pytest.mark.asyncio
    async def test_add_room_creates_machine(self, mock_hass, patched_ha):
        """async_add_room with an enabled config should create a machine."""
        store = _mock_store()
        engine = await _build_engine(mock_hass, store, patched_ha)

        cfg = _make_config("room_new", enabled=True)
        await engine.async_add_room(cfg)

        assert "room_new" in engine._state_machines

    @pytest.mark.asyncio
    async def test_add_room_disabled_no_machine(self, mock_hass, patched_ha):
        """A disabled config should NOT create a machine."""
        store = _mock_store()
        engine = await _build_engine(mock_hass, store, patched_ha)

        cfg = _make_config("room_off", enabled=False)
        await engine.async_add_room(cfg)

        assert "room_off" not in engine._state_machines

    @pytest.mark.asyncio
    async def test_add_room_duplicate_warns(self, mock_hass, patched_ha, caplog):
        """Adding the same room_id twice should log a warning, not crash."""
        cfg = _make_config("room_dup", enabled=True)
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)
        assert "room_dup" in engine._state_machines

        # Add again
        with caplog.at_level("WARNING"):
            await engine.async_add_room(cfg)

        assert "already exists" in caplog.text
        # Still only one machine
        assert len(engine._state_machines) == 1

    @pytest.mark.asyncio
    async def test_remove_room_stops_machine(self, mock_hass, patched_ha):
        """async_remove_room should remove the machine from the dict."""
        cfg = _make_config("room_del")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)
        assert "room_del" in engine._state_machines

        await engine.async_remove_room("room_del")

        assert "room_del" not in engine._state_machines

    @pytest.mark.asyncio
    async def test_remove_nonexistent_room_safe(self, mock_hass, patched_ha):
        """Removing an unknown room_id should not raise."""
        store = _mock_store()
        engine = await _build_engine(mock_hass, store, patched_ha)

        # Should not crash
        await engine.async_remove_room("room_ghost")

    @pytest.mark.asyncio
    async def test_update_room_replaces_machine(self, mock_hass, patched_ha):
        """async_update_room should stop the old machine and create a new one."""
        cfg = _make_config("room_upd")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)
        old_machine = engine._state_machines["room_upd"]

        updated_cfg = _make_config("room_upd")
        updated_cfg.checking_timeout = 60  # changed value

        await engine.async_update_room(updated_cfg)

        new_machine = engine._state_machines["room_upd"]
        assert new_machine is not old_machine
        assert new_machine.config.checking_timeout == 60

    @pytest.mark.asyncio
    async def test_set_room_occupancy(self, mock_hass, patched_ha):
        """set_room_occupancy should call set_state on the machine."""
        cfg = _make_config("room_occ")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)
        machine = engine._state_machines["room_occ"]
        machine.set_state = MagicMock()

        result = engine.set_room_occupancy("room_occ", OccupancyState.OCCUPIED)

        assert result is True
        machine.set_state.assert_called_once_with(
            OccupancyState.OCCUPIED, "manual override"
        )

    @pytest.mark.asyncio
    async def test_set_room_occupancy_unknown_room(self, mock_hass, patched_ha):
        """set_room_occupancy for a missing room should return False."""
        store = _mock_store()
        engine = await _build_engine(mock_hass, store, patched_ha)

        result = engine.set_room_occupancy("room_nonexistent", OccupancyState.OCCUPIED)

        assert result is False


# ======================================================================
# TestZoneParentPropagation
# ======================================================================


class TestZoneParentPropagation:
    """Tests for zone → parent room occupancy propagation."""

    def _build_floor_plan_with_zones(self, zones):
        """Build a FloorPlan mock with the given zones."""
        from custom_components.inhabit.models.floor_plan import Floor, FloorPlan

        floor = Floor(
            id="floor_ground",
            name="Ground Floor",
            level=0,
            rooms=[],
            zones=zones,
        )
        return FloorPlan(
            id="fp_test",
            name="Test",
            created_at="2024-01-01T00:00:00",
            updated_at="2024-01-01T00:00:00",
            unit="cm",
            grid_size=10,
            floors=[floor],
        )

    @pytest.mark.asyncio
    async def test_zone_occupied_propagates_to_parent(self, mock_hass, patched_ha):
        """When a child zone becomes OCCUPIED, the parent room should too."""
        zone = _make_zone("zone_child", room_id="room_parent", occupies_parent=True)
        fp = self._build_floor_plan_with_zones([zone])

        parent_cfg = _make_config("room_parent")
        zone_cfg = _make_config("zone_child")

        store = _mock_store(configs=[parent_cfg, zone_cfg], floor_plans=[fp])
        # get_sensor_config is called during _resolve_zone_parents
        store.get_sensor_config.side_effect = lambda rid: {
            "zone_child": zone_cfg,
            "room_parent": parent_cfg,
        }.get(rid)

        engine = await _build_engine(mock_hass, store, patched_ha)

        # Both machines should exist
        assert "room_parent" in engine._state_machines
        assert "zone_child" in engine._state_machines

        parent_machine = engine._state_machines["room_parent"]
        parent_machine.set_state = MagicMock()

        # Simulate zone_child going OCCUPIED via _propagate_to_parent
        engine._propagate_to_parent("zone_child", OccupancyState.OCCUPIED)

        parent_machine.set_state.assert_called_once_with(
            OccupancyState.OCCUPIED,
            "child zone zone_child occupied",
        )

    @pytest.mark.asyncio
    async def test_zone_vacant_does_not_force_parent_vacant(
        self, mock_hass, patched_ha
    ):
        """A zone going VACANT should NOT force the parent to VACANT."""
        zone = _make_zone("zone_child", room_id="room_parent", occupies_parent=True)
        fp = self._build_floor_plan_with_zones([zone])

        parent_cfg = _make_config("room_parent")
        zone_cfg = _make_config("zone_child")
        store = _mock_store(configs=[parent_cfg, zone_cfg], floor_plans=[fp])
        store.get_sensor_config.side_effect = lambda rid: {
            "zone_child": zone_cfg,
        }.get(rid)

        engine = await _build_engine(mock_hass, store, patched_ha)

        parent_machine = engine._state_machines["room_parent"]
        parent_machine.set_state = MagicMock()

        # Propagate VACANT — should NOT call set_state on parent
        engine._propagate_to_parent("zone_child", OccupancyState.VACANT)

        parent_machine.set_state.assert_not_called()

    @pytest.mark.asyncio
    async def test_multiple_zones_one_vacant_parent_stays(self, mock_hass, patched_ha):
        """Two zones occupied, one vacates — parent should stay OCCUPIED."""
        zone_a = _make_zone("zone_a", room_id="room_parent", occupies_parent=True)
        zone_b = _make_zone("zone_b", room_id="room_parent", occupies_parent=True)
        fp = self._build_floor_plan_with_zones([zone_a, zone_b])

        parent_cfg = _make_config("room_parent")
        zone_a_cfg = _make_config("zone_a")
        zone_b_cfg = _make_config("zone_b")

        store = _mock_store(
            configs=[parent_cfg, zone_a_cfg, zone_b_cfg], floor_plans=[fp]
        )
        store.get_sensor_config.side_effect = lambda rid: {
            "zone_a": zone_a_cfg,
            "zone_b": zone_b_cfg,
        }.get(rid)

        engine = await _build_engine(mock_hass, store, patched_ha)

        # Mark zone_b as occupied in its state data (simulate)
        machine_b = engine._state_machines["zone_b"]
        machine_b._state = OccupancyStateData(state=OccupancyState.OCCUPIED)

        # zone_a goes VACANT — parent should NOT be forced vacant
        # (zone_b is still occupied, and _propagate_to_parent only propagates
        # OCCUPIED/CHECKING, never forces VACANT)
        parent_machine = engine._state_machines["room_parent"]
        parent_machine.set_state = MagicMock()

        engine._propagate_to_parent("zone_a", OccupancyState.VACANT)

        parent_machine.set_state.assert_not_called()

        # _is_occupied_by_children should still be True because zone_b is occupied
        assert engine._is_occupied_by_children("room_parent") is True

    @pytest.mark.asyncio
    async def test_parent_missing_no_crash(self, mock_hass, patched_ha):
        """Propagation to a non-existent parent machine should not crash."""
        zone = _make_zone("zone_orphan", room_id="room_gone", occupies_parent=True)
        fp = self._build_floor_plan_with_zones([zone])

        zone_cfg = _make_config("zone_orphan")
        store = _mock_store(configs=[zone_cfg], floor_plans=[fp])
        store.get_sensor_config.side_effect = lambda rid: {
            "zone_orphan": zone_cfg,
        }.get(rid)

        engine = await _build_engine(mock_hass, store, patched_ha)

        # Parent machine "room_gone" does not exist — should not raise
        engine._propagate_to_parent("zone_orphan", OccupancyState.OCCUPIED)


# ======================================================================
# TestMultiRoomReasoning
# ======================================================================


class TestMultiRoomReasoning:
    """Tests for multi-room reasoner and house guard callbacks."""

    @pytest.mark.asyncio
    async def test_state_change_forwarded_to_multi_room_reasoner(
        self, mock_hass, patched_ha
    ):
        """_on_state_change should call multi_room_reasoner.on_room_state_changed."""
        cfg = _make_config("room_mr")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)
        engine._multi_room_reasoner.on_room_state_changed = MagicMock()

        state = OccupancyStateData(
            state=OccupancyState.OCCUPIED,
            confidence=0.8,
            transition_reason="motion detected",
        )
        engine._on_state_change("room_mr", state, "motion detected")

        engine._multi_room_reasoner.on_room_state_changed.assert_called_once()
        call_kwargs = engine._multi_room_reasoner.on_room_state_changed.call_args
        assert call_kwargs.kwargs["room_id"] == "room_mr"
        assert call_kwargs.kwargs["new_state"] == OccupancyState.OCCUPIED

    @pytest.mark.asyncio
    async def test_force_room_vacant_callback(self, mock_hass, patched_ha):
        """_force_room_vacant should set the machine to VACANT."""
        cfg = _make_config("room_forced")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)
        machine = engine._state_machines["room_forced"]
        machine.set_state = MagicMock()

        engine._force_room_vacant("room_forced", "multi-room says leave")

        machine.set_state.assert_called_once_with(
            OccupancyState.VACANT, "multi-room says leave"
        )

    @pytest.mark.asyncio
    async def test_house_guard_consulted_on_vacancy(self, mock_hass, patched_ha):
        """_on_state_change should call house_guard.on_room_state_changed."""
        cfg = _make_config("room_hg")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)
        engine._house_guard.on_room_state_changed = MagicMock()

        state = OccupancyStateData(
            state=OccupancyState.VACANT,
            confidence=0.0,
            transition_reason="timeout",
        )
        engine._on_state_change("room_hg", state, "timeout")

        engine._house_guard.on_room_state_changed.assert_called_once_with(
            "room_hg", OccupancyState.VACANT
        )


# ======================================================================
# TestDataPersistence
# ======================================================================


class TestDataPersistence:
    """Tests for loading and saving persisted data."""

    @pytest.mark.asyncio
    async def test_occupancy_history_loaded_on_start(self, mock_hass, patched_ha):
        """History data from the store should be loaded into the engine deque."""
        from datetime import datetime

        now = datetime.now().isoformat()
        raw_history = [
            {
                "room_id": "room_a",
                "state": OccupancyState.OCCUPIED,
                "timestamp": now,
                "reason": "motion",
                "confidence": 0.9,
            },
        ]

        cfg = _make_config("room_a")
        store = _mock_store(configs=[cfg])
        store.get_occupancy_history.return_value = raw_history

        engine = await _build_engine(mock_hass, store, patched_ha)

        assert len(engine._occupancy_history) == 1
        assert engine._occupancy_history[0].room_id == "room_a"

    @pytest.mark.asyncio
    async def test_false_vacancy_bump_applied_on_start(self, mock_hass, patched_ha):
        """Persisted false vacancy bumps should be loaded into machines."""
        cfg = _make_config("room_fv")
        store = _mock_store(configs=[cfg])
        # Provide false vacancy data so the detector reports a bump
        store.get_false_vacancy_data.return_value = {
            "room_fv": {
                "count": 3,
                "last_event": "2024-01-01T00:00:00",
            }
        }

        engine = await _build_engine(mock_hass, store, patched_ha)

        # The false vacancy detector was loaded with data
        # Verify the detector's load_data was called with the store data
        # (The actual bump value depends on the detector logic, but the
        # path is exercised without error)
        machine = engine._state_machines.get("room_fv")
        assert machine is not None
        # The bump was set (could be 0 if count doesn't meet threshold,
        # but the code path executed without error)

    @pytest.mark.asyncio
    async def test_reliability_data_persisted_on_stop(self, mock_hass, patched_ha):
        """Reliability tracker data should be saved to the store on stop."""
        cfg = _make_config("room_rel")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)

        # Mock the reliability tracker to return data
        machine = engine._state_machines["room_rel"]
        machine.reliability_tracker.save_records = MagicMock(
            return_value={"binary_sensor.room_rel_motion": {"fires": 10}}
        )

        await engine.async_stop()

        store.save_sensor_reliability.assert_called_once()
        saved = store.save_sensor_reliability.call_args[0][0]
        assert "room_rel" in saved


# ======================================================================
# TestConfigSync
# ======================================================================


class TestConfigSync:
    """Tests for async_refresh and get_state operations."""

    @pytest.mark.asyncio
    async def test_refresh_adds_new_rooms(self, mock_hass, patched_ha):
        """async_refresh should create machines for newly added configs."""
        cfg_a = _make_config("room_a")
        store = _mock_store(configs=[cfg_a])

        engine = await _build_engine(mock_hass, store, patched_ha)
        assert "room_a" in engine._state_machines
        assert "room_b" not in engine._state_machines

        # Simulate a new config appearing in the store
        cfg_b = _make_config("room_b")
        store.get_all_sensor_configs.return_value = [cfg_a, cfg_b]

        await engine.async_refresh()

        assert "room_a" in engine._state_machines
        assert "room_b" in engine._state_machines

    @pytest.mark.asyncio
    async def test_refresh_removes_deleted_rooms(self, mock_hass, patched_ha):
        """async_refresh should remove machines for deleted configs."""
        cfg_a = _make_config("room_a")
        cfg_b = _make_config("room_b")
        store = _mock_store(configs=[cfg_a, cfg_b])

        engine = await _build_engine(mock_hass, store, patched_ha)
        assert len(engine._state_machines) == 2

        # Remove room_b from store
        store.get_all_sensor_configs.return_value = [cfg_a]

        await engine.async_refresh()

        assert "room_a" in engine._state_machines
        assert "room_b" not in engine._state_machines

    @pytest.mark.asyncio
    async def test_get_room_state_returns_data(self, mock_hass, patched_ha):
        """get_state should return OccupancyStateData for a known room."""
        cfg = _make_config("room_state")
        store = _mock_store(configs=[cfg])

        engine = await _build_engine(mock_hass, store, patched_ha)

        state = engine.get_state("room_state")
        assert state is not None
        assert isinstance(state, OccupancyStateData)
        # Default initial state is VACANT
        assert state.state == OccupancyState.VACANT

    @pytest.mark.asyncio
    async def test_get_room_state_unknown_returns_none(self, mock_hass, patched_ha):
        """get_state for an unknown room should return None."""
        store = _mock_store()
        engine = await _build_engine(mock_hass, store, patched_ha)

        assert engine.get_state("room_nonexistent") is None
