"""Tests for mmWave spatial presence integration with the occupancy engine."""

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


# --------------------------------------------------------------------------
# Fixtures
# --------------------------------------------------------------------------


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = MagicMock()
    hass.states = MagicMock()
    hass.loop = MagicMock()

    def mock_call_later(delay, callback):
        return MagicMock()

    hass.loop.call_later = mock_call_later
    return hass


@pytest.fixture
def state_changes():
    """Track state changes."""
    changes = []

    def on_change(state: OccupancyStateData, reason: str = ""):
        changes.append(state.state)

    return changes, on_change


@pytest.fixture
def spatial_config():
    """Config with spatial presence (presence_affects) enabled."""
    return VirtualSensorConfig(
        room_id="mmwave_room",
        floor_plan_id="test_fp",
        enabled=True,
        checking_timeout=30,
        motion_sensors=[
            SensorBinding(
                entity_id="binary_sensor.room_motion",
                sensor_type="motion",
                weight=1.0,
            ),
        ],
        presence_affects=True,
        door_seals_room=False,
    )


@pytest.fixture
def spatial_config_disabled():
    """Config with spatial presence disabled."""
    return VirtualSensorConfig(
        room_id="no_spatial_room",
        floor_plan_id="test_fp",
        enabled=True,
        checking_timeout=30,
        motion_sensors=[
            SensorBinding(
                entity_id="binary_sensor.room_motion",
                sensor_type="motion",
                weight=1.0,
            ),
        ],
        presence_affects=False,
        door_seals_room=False,
    )


def _make_machine(mock_hass, config, state_changes):
    from custom_components.inhabit.engine.occupancy_state_machine import (
        OccupancyStateMachine,
    )

    changes, on_change = state_changes
    return OccupancyStateMachine(mock_hass, config, on_change), changes


# --------------------------------------------------------------------------
# OccupancyStateMachine.update_spatial_presence tests
# --------------------------------------------------------------------------


class TestSpatialPresenceOnStateMachine:
    """Tests for update_spatial_presence on OccupancyStateMachine."""

    def test_targets_present_triggers_occupied(
        self, mock_hass, spatial_config, state_changes
    ):
        """Spatial targets (count > 0) should transition room to OCCUPIED."""
        mock_hass.states.get.return_value = None
        machine, changes = _make_machine(mock_hass, spatial_config, state_changes)

        assert machine.state.state == OccupancyState.VACANT

        machine.update_spatial_presence(target_count=2)

        assert machine.state.state == OccupancyState.OCCUPIED
        assert OccupancyState.OCCUPIED in changes

    def test_targets_clear_triggers_checking(
        self, mock_hass, spatial_config, state_changes
    ):
        """Spatial targets clearing (count = 0) should trigger CHECKING
        when no other sensors are active."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, changes = _make_machine(mock_hass, spatial_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # First occupy via spatial presence
            machine.update_spatial_presence(target_count=1)
            assert machine.state.state == OccupancyState.OCCUPIED

            # Then clear spatial presence
            machine.update_spatial_presence(target_count=0)
            assert machine.state.state == OccupancyState.CHECKING

    def test_spatial_virtual_entity_in_contributing_sensors(
        self, mock_hass, spatial_config, state_changes
    ):
        """Spatial presence should add a virtual entity to contributing sensors."""
        mock_hass.states.get.return_value = None
        machine, changes = _make_machine(mock_hass, spatial_config, state_changes)

        machine.update_spatial_presence(target_count=1)

        virtual_entity = f"_spatial_mmwave_{spatial_config.room_id}"
        assert virtual_entity in machine.state.contributing_sensors

    def test_spatial_clears_removes_from_contributing(
        self, mock_hass, spatial_config, state_changes
    ):
        """Clearing spatial presence removes the virtual entity from contributing."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, changes = _make_machine(mock_hass, spatial_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            machine.update_spatial_presence(target_count=1)
            virtual_entity = f"_spatial_mmwave_{spatial_config.room_id}"
            assert virtual_entity in machine.state.contributing_sensors

            machine.update_spatial_presence(target_count=0)
            assert virtual_entity not in machine.state.contributing_sensors

    def test_spatial_updates_last_presence_at(
        self, mock_hass, spatial_config, state_changes
    ):
        """Spatial presence should set last_presence_at timestamp."""
        mock_hass.states.get.return_value = None
        machine, changes = _make_machine(mock_hass, spatial_config, state_changes)

        assert machine.state.last_presence_at is None

        machine.update_spatial_presence(target_count=1)
        assert machine.state.last_presence_at is not None

    def test_custom_source_name(self, mock_hass, spatial_config, state_changes):
        """Custom source name should appear in virtual entity ID."""
        mock_hass.states.get.return_value = None
        machine, changes = _make_machine(mock_hass, spatial_config, state_changes)

        machine.update_spatial_presence(target_count=1, source="ld2450")

        virtual_entity = f"_spatial_ld2450_{spatial_config.room_id}"
        assert virtual_entity in machine.state.contributing_sensors


# --------------------------------------------------------------------------
# Coexistence: motion sensor + spatial presence
# --------------------------------------------------------------------------


class TestSpatialMotionCoexistence:
    """Tests for coexistence of motion sensors and spatial presence."""

    def test_motion_clears_but_spatial_keeps_occupied(
        self, mock_hass, spatial_config, state_changes
    ):
        """Room stays OCCUPIED when motion clears but spatial presence remains."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, changes = _make_machine(mock_hass, spatial_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # Occupy via spatial presence
            machine.update_spatial_presence(target_count=2)
            assert machine.state.state == OccupancyState.OCCUPIED

            # Motion sensor fires and then clears
            machine._update_contributing_sensors("binary_sensor.room_motion", add=True)
            machine._transition_to_occupied("motion from binary_sensor.room_motion")

            # Motion clears — _any_sensor_active still True because spatial
            machine._update_contributing_sensors("binary_sensor.room_motion", add=False)
            machine._check_all_sensors_clear()

            # Should still be OCCUPIED because spatial presence virtual entity
            # is still in contributing_sensors
            assert machine.state.state == OccupancyState.OCCUPIED

    def test_both_clear_transitions_to_checking(
        self, mock_hass, spatial_config, state_changes
    ):
        """Room transitions to CHECKING only when both motion and spatial clear."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, changes = _make_machine(mock_hass, spatial_config, state_changes)

        with patch(
            "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
            lambda hass, delay, cb: MagicMock(),
        ):
            # Occupy via both
            machine.update_spatial_presence(target_count=1)
            machine._update_contributing_sensors("binary_sensor.room_motion", add=True)

            # Motion clears
            machine._update_contributing_sensors("binary_sensor.room_motion", add=False)
            machine._check_all_sensors_clear()
            assert (
                machine.state.state == OccupancyState.OCCUPIED
            )  # Spatial still active

            # Spatial clears
            machine.update_spatial_presence(target_count=0)
            assert machine.state.state == OccupancyState.CHECKING

    def test_spatial_keeps_occupied_through_any_sensor_active(
        self, mock_hass, spatial_config, state_changes
    ):
        """_any_sensor_active returns True when spatial virtual entity is contributing."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        machine, changes = _make_machine(mock_hass, spatial_config, state_changes)

        # No sensors active initially
        assert machine._any_sensor_active() is False

        # Add spatial presence
        machine.update_spatial_presence(target_count=1)
        assert machine._any_sensor_active() is True

        # Clear spatial presence
        machine.update_spatial_presence(target_count=0)
        assert machine._any_sensor_active() is False


# --------------------------------------------------------------------------
# presence_affects flag
# --------------------------------------------------------------------------


class TestPresenceAffectsFlag:
    """Tests for the presence_affects configuration flag."""

    def test_presence_affects_defaults_to_false(self):
        """presence_affects should default to False."""
        config = VirtualSensorConfig(room_id="test")
        assert config.presence_affects is False

    def test_presence_affects_serialization_roundtrip(self):
        """presence_affects should survive to_dict/from_dict roundtrip."""
        config = VirtualSensorConfig(room_id="test", presence_affects=True)
        data = config.to_dict()
        assert data["presence_affects"] is True

        restored = VirtualSensorConfig.from_dict(data)
        assert restored.presence_affects is True


# --------------------------------------------------------------------------
# VirtualSensorEngine mmWave routing
# --------------------------------------------------------------------------


class TestVirtualSensorEngineRouting:
    """Tests for VirtualSensorEngine routing mmWave targets to state machines."""

    @pytest.fixture
    def mock_store(self, spatial_config, spatial_config_disabled):
        """Create a mock store with sensor configs."""
        store = MagicMock()

        config_map = {
            "mmwave_room": spatial_config,
            "no_spatial_room": spatial_config_disabled,
        }

        def get_sensor_config(room_id):
            return config_map.get(room_id)

        store.get_sensor_config = get_sensor_config
        store.get_all_sensor_configs.return_value = []
        store.get_floor_plans.return_value = []
        return store

    def test_routes_targets_to_correct_machine(self, mock_hass, mock_store):
        """Engine routes mmWave targets to the matching state machine."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        engine = VirtualSensorEngine(mock_hass, mock_store)

        # Create a mock state machine for the spatial room
        mock_machine = MagicMock()
        engine._state_machines["mmwave_room"] = mock_machine

        # Simulate a target entering mmwave_room
        engine._handle_mmwave_target_update(
            placement_id="sensor1",
            target_index=0,
            world_pos=MagicMock(x=100, y=100),
            region_ids=["mmwave_room"],
        )

        mock_machine.update_spatial_presence.assert_called_once_with(1)

    def test_does_not_route_to_disabled_room(self, mock_hass, mock_store):
        """Engine does NOT route targets to rooms with presence_affects=False."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        engine = VirtualSensorEngine(mock_hass, mock_store)

        mock_machine = MagicMock()
        engine._state_machines["no_spatial_room"] = mock_machine

        engine._handle_mmwave_target_update(
            placement_id="sensor1",
            target_index=0,
            world_pos=MagicMock(x=100, y=100),
            region_ids=["no_spatial_room"],
        )

        mock_machine.update_spatial_presence.assert_not_called()

    def test_tracks_multiple_targets_per_region(self, mock_hass, mock_store):
        """Engine correctly tracks multiple targets in one region."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        engine = VirtualSensorEngine(mock_hass, mock_store)

        mock_machine = MagicMock()
        engine._state_machines["mmwave_room"] = mock_machine

        # Target 0 enters
        engine._handle_mmwave_target_update("sensor1", 0, MagicMock(), ["mmwave_room"])
        mock_machine.update_spatial_presence.assert_called_with(1)

        # Target 1 enters same region
        engine._handle_mmwave_target_update("sensor1", 1, MagicMock(), ["mmwave_room"])
        mock_machine.update_spatial_presence.assert_called_with(2)

    def test_target_leaving_region_decrements_count(self, mock_hass, mock_store):
        """Target leaving a region decrements the count and calls update."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        engine = VirtualSensorEngine(mock_hass, mock_store)

        mock_machine = MagicMock()
        engine._state_machines["mmwave_room"] = mock_machine

        # Two targets enter
        engine._handle_mmwave_target_update("sensor1", 0, MagicMock(), ["mmwave_room"])
        engine._handle_mmwave_target_update("sensor1", 1, MagicMock(), ["mmwave_room"])

        # Target 0 leaves the region (goes to empty list)
        engine._handle_mmwave_target_update("sensor1", 0, MagicMock(), [])
        mock_machine.update_spatial_presence.assert_called_with(1)

    def test_last_target_leaves_region_calls_with_zero(self, mock_hass, mock_store):
        """When the last target leaves a region, count is 0."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        engine = VirtualSensorEngine(mock_hass, mock_store)

        mock_machine = MagicMock()
        engine._state_machines["mmwave_room"] = mock_machine

        # Target enters
        engine._handle_mmwave_target_update("sensor1", 0, MagicMock(), ["mmwave_room"])
        # Target leaves
        engine._handle_mmwave_target_update("sensor1", 0, MagicMock(), [])

        # Last call should be with 0
        mock_machine.update_spatial_presence.assert_called_with(0)

    def test_target_moving_between_regions(self, mock_hass, mock_store, spatial_config):
        """Target moving from one region to another updates both."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        # Add a second spatial room to the store
        config2 = VirtualSensorConfig(
            room_id="other_room",
            floor_plan_id="test_fp",
            enabled=True,
            presence_affects=True,
        )
        original_get = mock_store.get_sensor_config

        def patched_get(room_id):
            if room_id == "other_room":
                return config2
            return original_get(room_id)

        mock_store.get_sensor_config = patched_get

        engine = VirtualSensorEngine(mock_hass, mock_store)

        machine_a = MagicMock()
        machine_b = MagicMock()
        engine._state_machines["mmwave_room"] = machine_a
        engine._state_machines["other_room"] = machine_b

        # Target enters room A
        engine._handle_mmwave_target_update("sensor1", 0, MagicMock(), ["mmwave_room"])
        machine_a.update_spatial_presence.assert_called_with(1)

        # Target moves to room B
        engine._handle_mmwave_target_update("sensor1", 0, MagicMock(), ["other_room"])
        # Room A should get 0, room B should get 1
        machine_a.update_spatial_presence.assert_called_with(0)
        machine_b.update_spatial_presence.assert_called_with(1)

    def test_same_region_no_duplicate_calls(self, mock_hass, mock_store):
        """Target staying in the same region does not trigger duplicate calls."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        engine = VirtualSensorEngine(mock_hass, mock_store)

        mock_machine = MagicMock()
        engine._state_machines["mmwave_room"] = mock_machine

        # Target enters region
        engine._handle_mmwave_target_update("sensor1", 0, MagicMock(), ["mmwave_room"])
        assert mock_machine.update_spatial_presence.call_count == 1

        # Target moves within same region
        engine._handle_mmwave_target_update("sensor1", 0, MagicMock(), ["mmwave_room"])
        # Should still be 1 — no new call
        assert mock_machine.update_spatial_presence.call_count == 1

    def test_target_in_overlapping_room_and_zone(self, mock_hass, mock_store, spatial_config):
        """A single target triggers both a room and an overlapping zone."""
        from custom_components.inhabit.engine.virtual_sensor_engine import (
            VirtualSensorEngine,
        )

        # Add a zone config
        zone_config = VirtualSensorConfig(
            room_id="zone_inside_room",
            floor_plan_id="test_fp",
            enabled=True,
            presence_affects=True,
        )
        original_get = mock_store.get_sensor_config

        def patched_get(room_id):
            if room_id == "zone_inside_room":
                return zone_config
            return original_get(room_id)

        mock_store.get_sensor_config = patched_get

        engine = VirtualSensorEngine(mock_hass, mock_store)

        room_machine = MagicMock()
        zone_machine = MagicMock()
        engine._state_machines["mmwave_room"] = room_machine
        engine._state_machines["zone_inside_room"] = zone_machine

        # Target enters both room and zone simultaneously
        engine._handle_mmwave_target_update(
            "sensor1", 0, MagicMock(),
            ["mmwave_room", "zone_inside_room"],
        )

        room_machine.update_spatial_presence.assert_called_with(1)
        zone_machine.update_spatial_presence.assert_called_with(1)


# --------------------------------------------------------------------------
# MmwaveTargetProcessor unit-conversion and zero-handling
# --------------------------------------------------------------------------


class TestMmwaveTargetProcessor:
    """Tests for MmwaveTargetProcessor coordinate conversion."""

    @pytest.fixture
    def mock_store(self):
        """Create a mock store with a floor plan that has rooms."""
        from custom_components.inhabit.models.floor_plan import (
            Coordinates,
            Floor,
            FloorPlan,
            Polygon,
            Room,
        )

        room = Room(
            id="room1",
            name="Living Room",
            polygon=Polygon(vertices=[
                Coordinates(x=0, y=0),
                Coordinates(x=500, y=0),
                Coordinates(x=500, y=500),
                Coordinates(x=0, y=500),
            ]),
        )
        floor = Floor(id="floor1", name="Ground", rooms=[room])
        fp = FloorPlan(id="fp1", name="Home", unit="cm", floors=[floor])

        store = MagicMock()
        store.get_floor_plans.return_value = [fp]
        store.get_floor_plan.return_value = fp
        store.get_mmwave_placements.return_value = []
        return store

    def test_mm_to_cm_conversion(self, mock_hass, mock_store):
        """Sensor values in mm are converted to cm before world transform."""
        from custom_components.inhabit.engine.mmwave_target_processor import (
            MmwaveTargetProcessor,
        )
        from custom_components.inhabit.models.floor_plan import Coordinates
        from custom_components.inhabit.models.mmwave_sensor import MmwavePlacement

        processor = MmwaveTargetProcessor(mock_hass, mock_store)

        placement = MmwavePlacement(
            id="p1",
            floor_plan_id="fp1",
            floor_id="floor1",
            position=Coordinates(x=250, y=250),
            angle=0.0,
            targets=[{"x_entity_id": "sensor.x", "y_entity_id": "sensor.y"}],
        )
        processor._placements["p1"] = placement
        processor._target_positions["p1"] = {}
        processor._region_hits["p1"] = {}

        # Simulate sensor reading of 500mm x, 1000mm y
        def mock_state(entity_id):
            states = {
                "sensor.x": MagicMock(state="500"),
                "sensor.y": MagicMock(state="1000"),
            }
            return states.get(entity_id)

        mock_hass.states.get.side_effect = mock_state

        with patch(
            "custom_components.inhabit.engine.mmwave_target_processor.async_dispatcher_send"
        ):
            processor._process_target("p1", 0)

        # After mm→cm conversion: local_x=50, local_y=100
        # With angle=0: world_x = 250 + 100*1 - 50*0 = 350
        #               world_y = 250 + 100*0 + 50*1 = 300
        pos = processor._target_positions["p1"][0]
        assert abs(pos.x - 350) < 0.01
        assert abs(pos.y - 300) < 0.01

    def test_zero_reading_clears_target(self, mock_hass, mock_store):
        """A (0,0) sensor reading should clear the target from regions."""
        from custom_components.inhabit.engine.mmwave_target_processor import (
            MmwaveTargetProcessor,
        )
        from custom_components.inhabit.models.floor_plan import Coordinates
        from custom_components.inhabit.models.mmwave_sensor import MmwavePlacement

        processor = MmwaveTargetProcessor(mock_hass, mock_store)

        placement = MmwavePlacement(
            id="p1",
            floor_plan_id="fp1",
            floor_id="floor1",
            position=Coordinates(x=250, y=250),
            angle=0.0,
            targets=[{"x_entity_id": "sensor.x", "y_entity_id": "sensor.y"}],
        )
        processor._placements["p1"] = placement
        processor._target_positions["p1"] = {0: Coordinates(x=300, y=300)}
        processor._region_hits["p1"] = {0: ["room1"]}

        # Sensor reads (0, 0) — target disappeared
        mock_hass.states.get.side_effect = lambda eid: MagicMock(state="0")

        with patch(
            "custom_components.inhabit.engine.mmwave_target_processor.async_dispatcher_send"
        ) as mock_dispatch:
            processor._process_target("p1", 0)

        # Target position should be cleared
        assert 0 not in processor._target_positions.get("p1", {})
        assert 0 not in processor._region_hits.get("p1", {})

        # Signal should be dispatched with empty region list
        mock_dispatch.assert_called_once()
        call_args = mock_dispatch.call_args[0]
        assert call_args[5] == []  # region_ids = []

    def test_target_hits_multiple_overlapping_regions(self, mock_hass):
        """A target inside overlapping room and zone hits both."""
        from custom_components.inhabit.engine.mmwave_target_processor import (
            MmwaveTargetProcessor,
        )
        from custom_components.inhabit.models.floor_plan import (
            Coordinates,
            Floor,
            FloorPlan,
            Polygon,
            Room,
        )
        from custom_components.inhabit.models.mmwave_sensor import MmwavePlacement
        from custom_components.inhabit.models.zone import Zone

        room = Room(
            id="room1",
            polygon=Polygon(vertices=[
                Coordinates(x=0, y=0),
                Coordinates(x=1000, y=0),
                Coordinates(x=1000, y=1000),
                Coordinates(x=0, y=1000),
            ]),
        )
        zone = Zone(
            id="zone1",
            polygon=Polygon(vertices=[
                Coordinates(x=200, y=200),
                Coordinates(x=800, y=200),
                Coordinates(x=800, y=800),
                Coordinates(x=200, y=800),
            ]),
        )
        floor = Floor(id="floor1", rooms=[room], zones=[zone])
        fp = FloorPlan(id="fp1", unit="cm", floors=[floor])

        store = MagicMock()
        store.get_floor_plans.return_value = [fp]
        store.get_floor_plan.return_value = fp
        store.get_mmwave_placements.return_value = []

        processor = MmwaveTargetProcessor(mock_hass, store)

        placement = MmwavePlacement(
            id="p1",
            floor_plan_id="fp1",
            floor_id="floor1",
            position=Coordinates(x=500, y=100),
            angle=0.0,
            targets=[{"x_entity_id": "sensor.x", "y_entity_id": "sensor.y"}],
        )
        processor._placements["p1"] = placement
        processor._target_positions["p1"] = {}
        processor._region_hits["p1"] = {}

        # Target at 0mm lateral, 4000mm forward → 0cm lateral, 400cm forward
        # world = (500 + 400*cos(0) - 0*sin(0), 100 + 400*sin(0) + 0*cos(0))
        #       = (900, 100) — nope, that's outside zone y range
        # Let's use 0mm x, 4000mm y → world = (500 + 400, 100 + 0) = (900, 100)
        # That's inside room but not zone. Let me use values that land in both.
        # Target at 0mm lateral, 4000mm forward → world = (500+400, 100+0) = (900, 100)
        # Hmm the y-value 100 is below zone (200-800). Let me reposition.
        # placement at (500, 0), angle=90° (facing down/positive y)
        # Target at 0mm x, 5000mm y → 0cm x, 500cm y
        # world_x = 500 + 500*cos(90°) - 0*sin(90°) = 500 + 0 - 0 = 500
        # world_y = 0 + 500*sin(90°) + 0*cos(90°) = 0 + 500 + 0 = 500
        # (500, 500) is inside both room and zone!

        placement.position = Coordinates(x=500, y=0)
        placement.angle = 90.0

        def mock_state(entity_id):
            states = {
                "sensor.x": MagicMock(state="0"),    # 0mm lateral
                "sensor.y": MagicMock(state="5000"),  # 5000mm forward
            }
            return states.get(entity_id)

        mock_hass.states.get.side_effect = mock_state

        dispatched_regions = []

        def capture_dispatch(hass, signal, *args):
            if "mmwave_targets_updated" in signal:
                dispatched_regions.extend(args[3])  # region_ids

        with patch(
            "custom_components.inhabit.engine.mmwave_target_processor.async_dispatcher_send",
            side_effect=capture_dispatch,
        ):
            processor._process_target("p1", 0)

        assert "room1" in dispatched_regions
        assert "zone1" in dispatched_regions
