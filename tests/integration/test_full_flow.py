"""Integration tests for full workflow scenarios."""
from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.const import STATE_OFF, STATE_ON

from custom_components.inhabit.const import DOMAIN, OccupancyState
from custom_components.inhabit.models.floor_plan import (
    Coordinates,
    Floor,
    FloorPlan,
    Polygon,
    Room,
)
from custom_components.inhabit.models.virtual_sensor import (
    SensorBinding,
    VirtualSensorConfig,
)
from custom_components.inhabit.store.floor_plan_store import FloorPlanStore

from ..fake_house.house_simulator import FakeHouseSimulator
from ..fake_house.scenario_runner import ScenarioRunner


def create_mock_store():
    """Create a mock Store class with proper async methods."""
    mock_store = MagicMock()
    mock_store.async_load = AsyncMock(return_value=None)
    mock_store.async_save = AsyncMock()
    mock_store.async_delay_save = MagicMock()
    return mock_store


class TestFullWorkflow:
    """Test complete workflows end-to-end."""

    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        hass = MagicMock()
        hass.data = {}
        hass.states = MagicMock()
        hass.loop = MagicMock()
        hass.config = MagicMock()
        hass.config.path = lambda *args: "/".join(args)
        hass.async_add_executor_job = AsyncMock(side_effect=lambda f, *a: f(*a))

        def mock_call_later(delay, callback):
            return MagicMock()

        hass.loop.call_later = mock_call_later
        return hass

    @pytest.fixture
    def simulator(self, mock_hass):
        """Create a fake house simulator."""
        return FakeHouseSimulator(mock_hass)

    @pytest.mark.asyncio
    async def test_create_floor_plan_and_rooms(self, mock_hass):
        """Test creating a floor plan with rooms."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            # Create floor plan
            floor_plan = FloorPlan(
                name="Test House",
                unit="cm",
                grid_size=10,
            )
            created_fp = store.create_floor_plan(floor_plan)

            assert created_fp.id is not None
            assert created_fp.name == "Test House"

            # Add floor
            floor = Floor(name="Ground Floor", level=0)
            added_floor = store.add_floor(created_fp.id, floor)

            assert added_floor is not None
            assert added_floor.name == "Ground Floor"

            # Add room
            room = Room(
                name="Living Room",
                polygon=Polygon(
                    vertices=[
                        Coordinates(0, 0),
                        Coordinates(500, 0),
                        Coordinates(500, 400),
                        Coordinates(0, 400),
                    ]
                ),
                occupancy_sensor_enabled=True,
            )
            added_room = store.add_room(created_fp.id, added_floor.id, room)

            assert added_room is not None
            assert added_room.name == "Living Room"

            # Verify retrieval
            retrieved = store.get_floor_plan(created_fp.id)
            assert retrieved is not None
            assert len(retrieved.floors) == 1
            assert len(retrieved.floors[0].rooms) == 1

    @pytest.mark.asyncio
    async def test_sensor_config_crud(self, mock_hass):
        """Test sensor configuration CRUD operations."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            # Create sensor config
            config = VirtualSensorConfig(
                room_id="room_1",
                floor_plan_id="fp_1",
                enabled=True,
                motion_timeout=120,
                checking_timeout=30,
                motion_sensors=[
                    SensorBinding(
                        entity_id="binary_sensor.room_1_motion",
                        sensor_type="motion",
                        weight=1.0,
                    ),
                ],
            )
            created = store.create_sensor_config(config)

            assert created.room_id == "room_1"

            # Retrieve
            retrieved = store.get_sensor_config("room_1")
            assert retrieved is not None
            assert len(retrieved.motion_sensors) == 1

            # Update
            config.motion_timeout = 180
            updated = store.update_sensor_config(config)
            assert updated.motion_timeout == 180

            # Delete
            deleted = store.delete_sensor_config("room_1")
            assert deleted is True

            # Verify deletion
            retrieved = store.get_sensor_config("room_1")
            assert retrieved is None

    @pytest.mark.asyncio
    async def test_fake_house_basic_scenario(self, simulator):
        """Test basic scenario with fake house simulator."""
        # Add a person
        person = simulator.add_person("person1", "John")
        assert person.current_room is None

        # Move person to living room
        simulator.move_person_to_room("person1", "ground_living")

        # Check motion and presence triggered
        motion_state = simulator.sensors["binary_sensor.ground_living_motion"].state
        presence_state = simulator.sensors["binary_sensor.ground_living_presence"].state

        assert motion_state == STATE_ON
        assert presence_state == STATE_ON

        # Person becomes still
        simulator.person_becomes_still("person1")

        motion_state = simulator.sensors["binary_sensor.ground_living_motion"].state
        presence_state = simulator.sensors["binary_sensor.ground_living_presence"].state

        assert motion_state == STATE_OFF  # PIR clears
        assert presence_state == STATE_ON  # mmWave maintains

    @pytest.mark.asyncio
    async def test_scenario_runner_basic(self, simulator):
        """Test scenario runner with predefined scenarios."""
        # Add person for scenarios
        simulator.add_person("person1", "John")

        runner = ScenarioRunner(simulator)
        scenarios = runner.get_predefined_scenarios()

        # Run first scenario
        result = await runner.run_scenario(scenarios[0])

        assert "passed" in result
        assert "failed" in result
        assert result["success"] is True

    @pytest.mark.asyncio
    async def test_device_placement_workflow(self, mock_hass):
        """Test device placement CRUD workflow."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            from custom_components.inhabit.models.device_placement import (
                DevicePlacement,
            )
            from custom_components.inhabit.models.floor_plan import Coordinates

            store = FloorPlanStore(mock_hass)
            await store.async_load()

            # Create floor plan first
            fp = store.create_floor_plan(FloorPlan(name="Test"))
            floor = store.add_floor(fp.id, Floor(name="Ground"))

            # Place device
            device = DevicePlacement(
                entity_id="light.living_room",
                floor_id=floor.id,
                room_id=None,
                position=Coordinates(250, 200),
                rotation=0,
                scale=1,
                show_state=True,
                contributes_to_occupancy=False,
            )
            placed = store.place_device(fp.id, device)

            assert placed.entity_id == "light.living_room"

            # Get placements
            collection = store.get_device_placements(fp.id)
            assert len(collection.devices) == 1

            # Update placement
            device.position = Coordinates(300, 250)
            updated = store.update_device_placement(fp.id, device)
            assert updated.position.x == 300

            # Remove placement
            removed = store.remove_device_placement(fp.id, device.id)
            assert removed is True

    @pytest.mark.asyncio
    async def test_visual_rule_workflow(self, mock_hass):
        """Test visual automation rule workflow."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            from custom_components.inhabit.models.automation_rule import (
                RuleAction,
                RuleCondition,
                VisualRule,
            )

            store = FloorPlanStore(mock_hass)
            await store.async_load()

            # Create floor plan
            fp = store.create_floor_plan(FloorPlan(name="Test"))

            # Create visual rule
            rule = VisualRule(
                name="Living Room Lights",
                description="Turn on lights when occupied",
                floor_plan_id=fp.id,
                trigger_type="room_occupancy",
                trigger_room_id="room_living",
                trigger_state="on",
                conditions=[],
                actions=[
                    RuleAction(
                        type="service_call",
                        service="light.turn_on",
                        entity_id="light.living_room",
                    ),
                ],
                target_entity_ids=["light.living_room"],
            )
            created = store.create_visual_rule(rule)

            assert created.name == "Living Room Lights"

            # Convert to HA automation
            ha_automation = created.to_ha_automation()

            assert ha_automation["alias"] == "Living Room Lights"
            assert "trigger" in ha_automation
            assert "action" in ha_automation

            # Delete rule
            deleted = store.delete_visual_rule(created.id)
            assert deleted is True

    @pytest.mark.asyncio
    async def test_multi_floor_navigation(self, simulator):
        """Test person movement across multiple floors."""
        person = simulator.add_person("person1", "John")

        # Start in basement
        simulator.move_person_to_room("person1", "basement_utility")
        assert person.current_room == "basement_utility"

        # Move to ground floor via garage
        simulator.move_person_to_room("person1", "basement_garage")
        simulator.move_person_to_room("person1", "ground_hallway")
        assert person.current_room == "ground_hallway"

        # Go upstairs
        simulator.move_person_to_room("person1", "first_hallway")
        simulator.move_person_to_room("person1", "first_bedroom1")

        assert person.current_room == "first_bedroom1"
        assert simulator.sensors["binary_sensor.first_bedroom1_motion"].state == STATE_ON

    @pytest.mark.asyncio
    async def test_data_persistence_structure(self, mock_hass):
        """Test that data persists in correct structure."""
        stored_data = None

        async def capture_save(data):
            nonlocal stored_data
            stored_data = data

        mock_store = create_mock_store()
        mock_store.async_save = AsyncMock(side_effect=capture_save)

        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=mock_store,
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            # Create data
            fp = store.create_floor_plan(FloorPlan(name="Test"))
            await store.async_save()

            # Verify structure
            assert stored_data is not None
            assert "floor_plans" in stored_data
            assert fp.id in stored_data["floor_plans"]
