"""Standalone tests that don't require homeassistant installation."""
from __future__ import annotations

import sys
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from unittest.mock import MagicMock

import pytest

# Mock homeassistant modules before importing our code
sys.modules["homeassistant"] = MagicMock()
sys.modules["homeassistant.core"] = MagicMock()
sys.modules["homeassistant.const"] = MagicMock()
sys.modules["homeassistant.const"].STATE_ON = "on"
sys.modules["homeassistant.const"].STATE_OFF = "off"
sys.modules["homeassistant.config_entries"] = MagicMock()
sys.modules["homeassistant.helpers"] = MagicMock()
sys.modules["homeassistant.helpers.storage"] = MagicMock()
sys.modules["homeassistant.helpers.event"] = MagicMock()
sys.modules["homeassistant.helpers.dispatcher"] = MagicMock()
sys.modules["homeassistant.helpers.entity"] = MagicMock()
sys.modules["homeassistant.helpers.entity_platform"] = MagicMock()
sys.modules["homeassistant.helpers.typing"] = MagicMock()
sys.modules["homeassistant.components"] = MagicMock()
sys.modules["homeassistant.components.websocket_api"] = MagicMock()
sys.modules["homeassistant.components.http"] = MagicMock()
sys.modules["homeassistant.components.binary_sensor"] = MagicMock()
sys.modules["voluptuous"] = MagicMock()
sys.modules["aiohttp"] = MagicMock()

STATE_ON = "on"
STATE_OFF = "off"


class TestFloorPlanModels:
    """Test floor plan data models."""

    def test_coordinates_creation(self):
        """Test Coordinates dataclass."""
        from custom_components.inhabit.models.floor_plan import Coordinates

        coord = Coordinates(x=100.5, y=200.5)
        assert coord.x == 100.5
        assert coord.y == 200.5

    def test_coordinates_to_dict(self):
        """Test Coordinates serialization."""
        from custom_components.inhabit.models.floor_plan import Coordinates

        coord = Coordinates(x=100, y=200)
        data = coord.to_dict()
        assert data == {"x": 100, "y": 200}

    def test_coordinates_from_dict(self):
        """Test Coordinates deserialization."""
        from custom_components.inhabit.models.floor_plan import Coordinates

        coord = Coordinates.from_dict({"x": 150, "y": 250})
        assert coord.x == 150
        assert coord.y == 250

    def test_bounding_box_properties(self):
        """Test BoundingBox calculations."""
        from custom_components.inhabit.models.floor_plan import BoundingBox

        bbox = BoundingBox(min_x=0, min_y=0, max_x=100, max_y=50)
        assert bbox.width == 100
        assert bbox.height == 50
        assert bbox.center.x == 50
        assert bbox.center.y == 25

    def test_polygon_bounding_box(self):
        """Test Polygon bounding box calculation."""
        from custom_components.inhabit.models.floor_plan import Coordinates, Polygon

        polygon = Polygon(
            vertices=[
                Coordinates(10, 20),
                Coordinates(110, 20),
                Coordinates(110, 80),
                Coordinates(10, 80),
            ]
        )
        bbox = polygon.bounding_box
        assert bbox is not None
        assert bbox.min_x == 10
        assert bbox.min_y == 20
        assert bbox.max_x == 110
        assert bbox.max_y == 80

    def test_polygon_contains_point(self):
        """Test point-in-polygon check."""
        from custom_components.inhabit.models.floor_plan import Coordinates, Polygon

        polygon = Polygon(
            vertices=[
                Coordinates(0, 0),
                Coordinates(100, 0),
                Coordinates(100, 100),
                Coordinates(0, 100),
            ]
        )

        # Point inside
        assert polygon.contains_point(Coordinates(50, 50)) is True

        # Point outside
        assert polygon.contains_point(Coordinates(150, 50)) is False

        # Point on edge (edge cases may vary)
        assert polygon.contains_point(Coordinates(-10, -10)) is False

    def test_wall_creation(self):
        """Test Wall dataclass."""
        from custom_components.inhabit.models.floor_plan import Coordinates, Wall

        wall = Wall(
            start=Coordinates(0, 0),
            end=Coordinates(100, 0),
            thickness=10,
            is_exterior=True,
        )
        assert wall.start.x == 0
        assert wall.end.x == 100
        assert wall.thickness == 10
        assert wall.is_exterior is True

    def test_room_creation(self):
        """Test Room dataclass."""
        from custom_components.inhabit.models.floor_plan import (
            Coordinates,
            Polygon,
            Room,
        )

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
            color="#e8f5e9",
            occupancy_sensor_enabled=True,
            motion_timeout=120,
            checking_timeout=30,
        )

        assert room.name == "Living Room"
        assert len(room.polygon.vertices) == 4
        assert room.occupancy_sensor_enabled is True

    def test_floor_plan_serialization(self):
        """Test FloorPlan serialization round-trip."""
        from custom_components.inhabit.models.floor_plan import (
            Coordinates,
            Floor,
            FloorPlan,
            Polygon,
            Room,
        )

        room = Room(
            name="Kitchen",
            polygon=Polygon(
                vertices=[
                    Coordinates(0, 0),
                    Coordinates(300, 0),
                    Coordinates(300, 250),
                    Coordinates(0, 250),
                ]
            ),
        )

        floor = Floor(name="Ground", level=0, rooms=[room])

        fp = FloorPlan(
            name="Test House",
            unit="cm",
            grid_size=10,
            floors=[floor],
        )

        # Serialize
        data = fp.to_dict()
        assert data["name"] == "Test House"
        assert len(data["floors"]) == 1
        assert len(data["floors"][0]["rooms"]) == 1

        # Deserialize
        restored = FloorPlan.from_dict(data)
        assert restored.name == "Test House"
        assert len(restored.floors) == 1
        assert restored.floors[0].rooms[0].name == "Kitchen"

    def test_floor_plan_get_room(self):
        """Test getting room from floor plan."""
        from custom_components.inhabit.models.floor_plan import (
            Coordinates,
            Floor,
            FloorPlan,
            Polygon,
            Room,
        )

        room = Room(id="room_1", name="Bedroom", polygon=Polygon())
        floor = Floor(id="floor_1", name="First Floor", rooms=[room])
        fp = FloorPlan(name="House", floors=[floor])

        result = fp.get_room("room_1")
        assert result is not None
        found_floor, found_room = result
        assert found_room.name == "Bedroom"

        # Non-existent room
        assert fp.get_room("nonexistent") is None


class TestDevicePlacementModels:
    """Test device placement models."""

    def test_device_placement_creation(self):
        """Test DevicePlacement dataclass."""
        from custom_components.inhabit.models.device_placement import DevicePlacement
        from custom_components.inhabit.models.floor_plan import Coordinates

        device = DevicePlacement(
            entity_id="light.living_room",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(250, 200),
            rotation=45,
            show_state=True,
            contributes_to_occupancy=False,
        )

        assert device.entity_id == "light.living_room"
        assert device.position.x == 250
        assert device.rotation == 45

    def test_sensor_coverage_creation(self):
        """Test SensorCoverage dataclass."""
        from custom_components.inhabit.models.device_placement import SensorCoverage

        coverage = SensorCoverage(
            type="cone",
            angle=90,
            range=500,
            direction=0,
        )

        assert coverage.type == "cone"
        assert coverage.angle == 90
        assert coverage.range == 500

    def test_device_placement_collection(self):
        """Test DevicePlacementCollection operations."""
        from custom_components.inhabit.models.device_placement import (
            DevicePlacement,
            DevicePlacementCollection,
        )
        from custom_components.inhabit.models.floor_plan import Coordinates

        collection = DevicePlacementCollection(floor_plan_id="fp_1")

        device1 = DevicePlacement(
            id="dev_1",
            entity_id="light.room1",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(100, 100),
        )
        device2 = DevicePlacement(
            id="dev_2",
            entity_id="sensor.room1_temp",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(200, 100),
            contributes_to_occupancy=True,
        )

        collection.add_device(device1)
        collection.add_device(device2)

        assert len(collection.devices) == 2
        assert collection.get_device("dev_1") is not None
        assert len(collection.get_devices_in_room("room_1")) == 2
        assert len(collection.get_occupancy_contributors("room_1")) == 1

        # Remove device
        assert collection.remove_device("dev_1") is True
        assert len(collection.devices) == 1


class TestVirtualSensorModels:
    """Test virtual sensor models."""

    def test_sensor_binding_creation(self):
        """Test SensorBinding dataclass."""
        from custom_components.inhabit.models.virtual_sensor import SensorBinding

        binding = SensorBinding(
            entity_id="binary_sensor.motion",
            sensor_type="motion",
            weight=1.5,
            inverted=False,
        )

        assert binding.entity_id == "binary_sensor.motion"
        assert binding.weight == 1.5
        assert binding.inverted is False

    def test_virtual_sensor_config(self):
        """Test VirtualSensorConfig dataclass."""
        from custom_components.inhabit.models.virtual_sensor import (
            SensorBinding,
            VirtualSensorConfig,
        )

        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
            enabled=True,
            motion_timeout=120,
            checking_timeout=30,
            motion_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.motion1",
                    sensor_type="motion",
                    weight=1.0,
                ),
            ],
            door_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.door1",
                    sensor_type="door",
                    weight=1.0,
                ),
            ],
            door_blocks_vacancy=True,
        )

        assert config.room_id == "room_1"
        assert len(config.motion_sensors) == 1
        assert len(config.door_sensors) == 1
        assert config.door_blocks_vacancy is True

        # Get all entity IDs
        all_ids = config.get_all_sensor_entity_ids()
        assert "binary_sensor.motion1" in all_ids
        assert "binary_sensor.door1" in all_ids


class TestAutomationRuleModels:
    """Test automation rule models."""

    def test_rule_condition_creation(self):
        """Test RuleCondition dataclass."""
        from custom_components.inhabit.models.automation_rule import RuleCondition

        condition = RuleCondition(
            type="entity_state",
            entity_id="light.living_room",
            state="on",
        )

        assert condition.type == "entity_state"
        assert condition.entity_id == "light.living_room"

    def test_rule_condition_to_ha(self):
        """Test converting RuleCondition to HA format."""
        from custom_components.inhabit.models.automation_rule import RuleCondition

        condition = RuleCondition(
            type="room_occupancy",
            room_id="room_living",
            state="on",
        )

        ha_condition = condition.to_ha_condition()
        assert ha_condition["condition"] == "state"
        assert "fp_room_living_occupancy" in ha_condition["entity_id"]

    def test_rule_action_creation(self):
        """Test RuleAction dataclass."""
        from custom_components.inhabit.models.automation_rule import RuleAction

        action = RuleAction(
            type="service_call",
            service="light.turn_on",
            entity_id="light.living_room",
            data={"brightness": 255},
        )

        assert action.type == "service_call"
        assert action.service == "light.turn_on"

    def test_rule_action_to_ha(self):
        """Test converting RuleAction to HA format."""
        from custom_components.inhabit.models.automation_rule import RuleAction

        action = RuleAction(
            type="service_call",
            service="light.turn_on",
            entity_id="light.living_room",
        )

        ha_action = action.to_ha_action()
        assert ha_action["service"] == "light.turn_on"
        assert ha_action["target"]["entity_id"] == "light.living_room"

    def test_visual_rule_to_automation(self):
        """Test converting VisualRule to HA automation."""
        from custom_components.inhabit.models.automation_rule import (
            RuleAction,
            VisualRule,
        )

        rule = VisualRule(
            name="Living Room Lights",
            description="Turn on lights when occupied",
            floor_plan_id="fp_1",
            trigger_type="room_occupancy",
            trigger_room_id="room_living",
            trigger_state="on",
            actions=[
                RuleAction(
                    type="service_call",
                    service="light.turn_on",
                    entity_id="light.living_room",
                ),
            ],
        )

        automation = rule.to_ha_automation()
        assert automation["alias"] == "Living Room Lights"
        assert "trigger" in automation
        assert "action" in automation
        assert len(automation["action"]) == 1


class TestFakeHouseSimulator:
    """Test the fake house simulator."""

    def test_simulator_setup(self):
        """Test that simulator creates correct structure."""
        from tests.fake_house.house_simulator import FakeHouseSimulator

        mock_hass = MagicMock()
        simulator = FakeHouseSimulator(mock_hass)

        # Check rooms exist
        assert "ground_living" in simulator.rooms
        assert "ground_kitchen" in simulator.rooms
        assert "first_bedroom1" in simulator.rooms
        assert "basement_garage" in simulator.rooms

        # Check sensors exist
        assert "binary_sensor.ground_living_motion" in simulator.sensors
        assert "binary_sensor.ground_living_presence" in simulator.sensors

    def test_add_person(self):
        """Test adding a person to simulator."""
        from tests.fake_house.house_simulator import FakeHouseSimulator

        mock_hass = MagicMock()
        simulator = FakeHouseSimulator(mock_hass)

        person = simulator.add_person("person1", "John")
        assert person.id == "person1"
        assert person.name == "John"
        assert person.current_room is None

    def test_move_person_triggers_sensors(self):
        """Test that moving a person triggers sensors."""
        from tests.fake_house.house_simulator import FakeHouseSimulator

        mock_hass = MagicMock()
        simulator = FakeHouseSimulator(mock_hass)
        simulator.add_person("person1", "John")

        # Initial state - all sensors off
        assert simulator.sensors["binary_sensor.ground_living_motion"].state == STATE_OFF

        # Move person to living room
        simulator.move_person_to_room("person1", "ground_living")

        # Sensors should be on
        assert simulator.sensors["binary_sensor.ground_living_motion"].state == STATE_ON
        assert simulator.sensors["binary_sensor.ground_living_presence"].state == STATE_ON

    def test_person_becomes_still(self):
        """Test that PIR clears but presence maintains when still."""
        from tests.fake_house.house_simulator import FakeHouseSimulator

        mock_hass = MagicMock()
        simulator = FakeHouseSimulator(mock_hass)
        simulator.add_person("person1", "John")

        # Move to room
        simulator.move_person_to_room("person1", "ground_living")
        assert simulator.sensors["binary_sensor.ground_living_motion"].state == STATE_ON

        # Become still
        simulator.person_becomes_still("person1")

        # PIR should clear, presence should remain
        assert simulator.sensors["binary_sensor.ground_living_motion"].state == STATE_OFF
        assert simulator.sensors["binary_sensor.ground_living_presence"].state == STATE_ON

    def test_person_leaves_room(self):
        """Test that all sensors clear when person leaves."""
        from tests.fake_house.house_simulator import FakeHouseSimulator

        mock_hass = MagicMock()
        simulator = FakeHouseSimulator(mock_hass)
        simulator.add_person("person1", "John")

        simulator.move_person_to_room("person1", "ground_living")
        simulator.person_leaves_room("person1")

        assert simulator.sensors["binary_sensor.ground_living_motion"].state == STATE_OFF
        assert simulator.sensors["binary_sensor.ground_living_presence"].state == STATE_OFF

    def test_door_operations(self):
        """Test door open/close operations."""
        from tests.fake_house.house_simulator import FakeHouseSimulator

        mock_hass = MagicMock()
        simulator = FakeHouseSimulator(mock_hass)

        # Find door between living room and kitchen
        door_id = simulator._find_door_sensor("ground_living", "ground_kitchen")
        assert door_id is not None

        # Open door
        simulator.open_door("ground_living", "ground_kitchen")
        assert simulator.sensors[door_id].state == STATE_ON

        # Close door
        simulator.close_door("ground_living", "ground_kitchen")
        assert simulator.sensors[door_id].state == STATE_OFF


class TestScenarioRunner:
    """Test the scenario runner."""

    @pytest.mark.asyncio
    async def test_run_basic_scenario(self):
        """Test running a basic scenario."""
        from tests.fake_house.house_simulator import FakeHouseSimulator
        from tests.fake_house.scenario_runner import ScenarioRunner

        mock_hass = MagicMock()
        simulator = FakeHouseSimulator(mock_hass)
        simulator.add_person("person1", "John")

        runner = ScenarioRunner(simulator)
        scenarios = runner.get_predefined_scenarios()

        # Run first scenario (person enters and sits)
        result = await runner.run_scenario(scenarios[0])

        assert result["success"] is True
        assert result["failed"] == 0

    @pytest.mark.asyncio
    async def test_run_movement_scenario(self):
        """Test person movement scenario."""
        from tests.fake_house.house_simulator import FakeHouseSimulator
        from tests.fake_house.scenario_runner import ScenarioRunner

        mock_hass = MagicMock()
        simulator = FakeHouseSimulator(mock_hass)
        simulator.add_person("person1", "John")

        runner = ScenarioRunner(simulator)
        scenarios = runner.get_predefined_scenarios()

        # Run movement scenario
        result = await runner.run_scenario(scenarios[1])

        assert result["success"] is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
