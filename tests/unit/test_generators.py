"""Unit tests for automation and card generators."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from custom_components.inhabit.generators.automation_generator import (
    AutomationGenerator,
)
from custom_components.inhabit.generators.card_exporter import CardExporter
from custom_components.inhabit.models.automation_rule import (
    RuleAction,
    VisualRule,
)
from custom_components.inhabit.models.device_placement import (
    Coordinates,
    DevicePlacement,
)
from custom_components.inhabit.models.floor_plan import Coordinates as FPCoordinates
from custom_components.inhabit.models.floor_plan import (
    Floor,
    FloorPlan,
    Polygon,
    Room,
)


class TestAutomationGenerator:
    """Test AutomationGenerator."""

    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        return MagicMock()

    @pytest.fixture
    def mock_store(self):
        """Create a mock store."""
        return MagicMock()

    @pytest.fixture
    def generator(self, mock_hass, mock_store):
        """Create an automation generator."""
        return AutomationGenerator(mock_hass, mock_store)

    def test_generate_occupancy_automation_turn_on(self, generator):
        """Test generating turn-on automation."""
        automation = generator.generate_occupancy_automation(
            room_id="living_room",
            room_name="Living Room",
            target_entity_ids=["light.living_room"],
            turn_on=True,
        )

        assert automation["alias"] == "Living Room Lights On on Occupancy"
        assert automation["mode"] == "single"
        assert len(automation["trigger"]) == 1
        assert automation["trigger"][0]["platform"] == "state"
        assert (
            automation["trigger"][0]["entity_id"]
            == "binary_sensor.fp_living_room_occupancy"
        )
        assert automation["trigger"][0]["to"] == "on"
        assert len(automation["action"]) == 1
        assert automation["action"][0]["service"] == "light.turn_on"

    def test_generate_occupancy_automation_turn_off(self, generator):
        """Test generating turn-off automation."""
        automation = generator.generate_occupancy_automation(
            room_id="bedroom",
            room_name="Bedroom",
            target_entity_ids=["light.bedroom"],
            turn_on=False,
        )

        assert automation["alias"] == "Bedroom Lights Off on Vacancy"
        assert automation["trigger"][0]["to"] == "off"
        assert automation["action"][0]["service"] == "light.turn_off"

    def test_generate_occupancy_automation_with_timeout(self, generator):
        """Test generating automation with timeout."""
        automation = generator.generate_occupancy_automation(
            room_id="kitchen",
            room_name="Kitchen",
            target_entity_ids=["light.kitchen"],
            turn_on=False,
            timeout_seconds=300,
        )

        assert "for" in automation["trigger"][0]
        assert automation["trigger"][0]["for"]["seconds"] == 300

    def test_generate_occupancy_automation_no_timeout_on_turn_on(self, generator):
        """Test that timeout is ignored for turn_on."""
        automation = generator.generate_occupancy_automation(
            room_id="kitchen",
            room_name="Kitchen",
            target_entity_ids=["light.kitchen"],
            turn_on=True,
            timeout_seconds=300,
        )

        # Timeout should not be added for turn_on
        assert "for" not in automation["trigger"][0]

    def test_generate_occupancy_automation_multiple_entities(self, generator):
        """Test generating automation with multiple target entities."""
        automation = generator.generate_occupancy_automation(
            room_id="office",
            room_name="Office",
            target_entity_ids=["light.office_main", "light.office_desk", "switch.fan"],
            turn_on=True,
        )

        assert len(automation["action"]) == 3
        assert automation["action"][0]["service"] == "light.turn_on"
        assert automation["action"][0]["target"]["entity_id"] == "light.office_main"
        assert automation["action"][1]["service"] == "light.turn_on"
        assert automation["action"][1]["target"]["entity_id"] == "light.office_desk"
        assert automation["action"][2]["service"] == "switch.turn_on"
        assert automation["action"][2]["target"]["entity_id"] == "switch.fan"

    def test_generate_presence_lighting_pair(self, generator):
        """Test generating presence lighting pair."""
        automations = generator.generate_presence_lighting_pair(
            room_id="bathroom",
            room_name="Bathroom",
            light_entity_ids=["light.bathroom"],
            off_delay_seconds=180,
        )

        assert len(automations) == 2

        # First automation should be turn on
        assert automations[0]["alias"] == "Bathroom Lights On on Occupancy"
        assert automations[0]["trigger"][0]["to"] == "on"

        # Second automation should be turn off with delay
        assert automations[1]["alias"] == "Bathroom Lights Off on Vacancy"
        assert automations[1]["trigger"][0]["to"] == "off"
        assert automations[1]["trigger"][0]["for"]["seconds"] == 180

    def test_generate_automation_from_visual_rule(self, generator):
        """Test generating automation from visual rule."""
        rule = VisualRule(
            id="rule_1",
            name="Test Rule",
            floor_plan_id="fp_1",
            trigger_type="room_occupancy",
            trigger_room_id="room_1",
            trigger_state="on",
            actions=[
                RuleAction(
                    type="service_call",
                    service="light.turn_on",
                    entity_id="light.room_1",
                )
            ],
        )

        automation = generator.generate_automation(rule)
        assert automation["alias"] == "Test Rule"
        assert "trigger" in automation
        assert "action" in automation

    def test_generate_all_automations(self, generator, mock_store):
        """Test generating all automations for a floor plan."""
        rule1 = VisualRule(
            id="rule_1",
            name="Rule 1",
            floor_plan_id="fp_1",
            enabled=True,
            trigger_type="room_occupancy",
            trigger_room_id="room_1",
            trigger_state="on",
            actions=[
                RuleAction(
                    type="service_call",
                    service="light.turn_on",
                    entity_id="light.room_1",
                )
            ],
        )
        rule2 = VisualRule(
            id="rule_2",
            name="Rule 2",
            floor_plan_id="fp_1",
            enabled=False,  # Disabled rule
            trigger_type="room_occupancy",
            trigger_room_id="room_2",
            trigger_state="on",
            actions=[
                RuleAction(
                    type="service_call",
                    service="light.turn_on",
                    entity_id="light.room_2",
                )
            ],
        )
        mock_store.get_visual_rules.return_value = [rule1, rule2]

        automations = generator.generate_all_automations("fp_1")

        # Only enabled rules should be included
        assert len(automations) == 1
        mock_store.get_visual_rules.assert_called_once_with("fp_1")

    def test_export_yaml(self, generator, mock_store):
        """Test exporting automations as YAML."""
        rule = VisualRule(
            id="rule_1",
            name="Test Rule",
            floor_plan_id="fp_1",
            enabled=True,
            trigger_type="room_occupancy",
            trigger_room_id="room_1",
            trigger_state="on",
            actions=[
                RuleAction(
                    type="service_call",
                    service="light.turn_on",
                    entity_id="light.room_1",
                )
            ],
        )
        mock_store.get_visual_rules.return_value = [rule]

        yaml_str = generator.export_yaml("fp_1")

        assert "# Generated by Inhabit Floor Plan Builder" in yaml_str
        assert "# Do not edit manually" in yaml_str


class TestCardExporter:
    """Test CardExporter."""

    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        hass = MagicMock()
        hass.states = MagicMock()
        return hass

    @pytest.fixture
    def mock_store(self):
        """Create a mock store."""
        return MagicMock()

    @pytest.fixture
    def exporter(self, mock_hass, mock_store):
        """Create a card exporter."""
        return CardExporter(mock_hass, mock_store)

    def test_export_room_card_floor_plan_not_found(self, exporter, mock_store):
        """Test export when floor plan not found."""
        mock_store.get_floor_plan.return_value = None

        result = exporter.export_room_card("fp_unknown", "room_1")

        assert result == {"error": "Floor plan not found"}

    def test_export_room_card_room_not_found(self, exporter, mock_store):
        """Test export when room not found."""
        floor_plan = MagicMock()
        floor_plan.get_room.return_value = None
        mock_store.get_floor_plan.return_value = floor_plan

        result = exporter.export_room_card("fp_1", "room_unknown")

        assert result == {"error": "Room not found"}

    def test_export_room_card_success(self, exporter, mock_store, mock_hass):
        """Test successful room card export."""
        room = Room(id="room_1", name="Living Room", polygon=Polygon(vertices=[]))
        floor = Floor(id="floor_1", name="Ground", level=0, rooms=[room])
        floor_plan = FloorPlan(id="fp_1", name="My House", floors=[floor])

        mock_store.get_floor_plan.return_value = floor_plan

        # Mock device placements
        collection = MagicMock()
        collection.get_devices_in_room.return_value = []
        mock_store.get_device_placements.return_value = collection

        result = exporter.export_room_card("fp_1", "room_1")

        assert result["type"] == "entities"
        assert result["title"] == "Living Room"
        assert result["state_color"] is True
        # Should have occupancy sensor
        assert len(result["entities"]) == 1
        assert result["entities"][0]["entity"] == "binary_sensor.fp_room_1_occupancy"

    def test_export_room_card_with_devices(self, exporter, mock_store, mock_hass):
        """Test room card export with devices."""
        room = Room(id="room_1", name="Bedroom", polygon=Polygon(vertices=[]))
        floor = Floor(id="floor_1", name="Ground", level=0, rooms=[room])
        floor_plan = FloorPlan(id="fp_1", name="My House", floors=[floor])

        mock_store.get_floor_plan.return_value = floor_plan

        # Mock device placements
        device = DevicePlacement(
            id="d1",
            entity_id="light.bedroom",
            position=Coordinates(100, 100),
            floor_id="floor_1",
            room_id="room_1",
        )
        collection = MagicMock()
        collection.get_devices_in_room.return_value = [device]
        mock_store.get_device_placements.return_value = collection

        # Mock entity state
        mock_state = MagicMock()
        mock_state.attributes = {"friendly_name": "Bedroom Light"}
        mock_hass.states.get.return_value = mock_state

        result = exporter.export_room_card("fp_1", "room_1")

        assert len(result["entities"]) == 2
        assert result["entities"][1]["entity"] == "light.bedroom"
        assert result["entities"][1]["name"] == "Bedroom Light"

    def test_export_summary_card(self, exporter, mock_store):
        """Test summary card export."""
        room1 = Room(id="room_1", name="Living Room", polygon=Polygon(vertices=[]))
        room2 = Room(id="room_2", name="Kitchen", polygon=Polygon(vertices=[]))
        floor = Floor(id="floor_1", name="Ground", level=0, rooms=[room1, room2])
        floor_plan = FloorPlan(id="fp_1", name="My House", floors=[floor])

        mock_store.get_floor_plan.return_value = floor_plan

        result = exporter.export_summary_card("fp_1")

        assert result["type"] == "entities"
        assert result["title"] == "My House - Occupancy"
        assert len(result["entities"]) == 2
        assert result["entities"][0]["entity"] == "binary_sensor.fp_room_1_occupancy"
        assert result["entities"][0]["name"] == "Living Room"
        assert result["entities"][1]["entity"] == "binary_sensor.fp_room_2_occupancy"
        assert result["entities"][1]["name"] == "Kitchen"

    def test_export_summary_card_not_found(self, exporter, mock_store):
        """Test summary card when floor plan not found."""
        mock_store.get_floor_plan.return_value = None

        result = exporter.export_summary_card("fp_unknown")

        assert result == {"error": "Floor plan not found"}

    def test_is_toggleable(self, exporter):
        """Test toggleable entity check."""
        assert exporter._is_toggleable("light.bedroom") is True
        assert exporter._is_toggleable("switch.fan") is True
        assert exporter._is_toggleable("fan.ceiling") is True
        assert exporter._is_toggleable("cover.blinds") is True
        assert exporter._is_toggleable("lock.front_door") is True
        assert exporter._is_toggleable("input_boolean.toggle") is True
        assert exporter._is_toggleable("automation.test") is True
        assert exporter._is_toggleable("script.run") is True

        # Non-toggleable
        assert exporter._is_toggleable("sensor.temperature") is False
        assert exporter._is_toggleable("binary_sensor.motion") is False
        assert exporter._is_toggleable("climate.hvac") is False

    def test_export_yaml_summary(self, exporter, mock_store):
        """Test YAML export for summary card."""
        room = Room(id="room_1", name="Room", polygon=Polygon(vertices=[]))
        floor = Floor(id="floor_1", name="Ground", level=0, rooms=[room])
        floor_plan = FloorPlan(id="fp_1", name="House", floors=[floor])
        mock_store.get_floor_plan.return_value = floor_plan

        yaml_str = exporter.export_yaml("fp_1", card_type="summary")

        assert "# Generated by Inhabit Floor Plan Builder" in yaml_str
        assert "entities:" in yaml_str

    def test_export_floor_plan_card_not_found(self, exporter, mock_store):
        """Test floor plan card when not found."""
        mock_store.get_floor_plan.return_value = None

        result = exporter.export_floor_plan_card("fp_unknown")

        assert result == {"error": "Floor plan not found"}

    def test_export_floor_plan_card_single_floor(self, exporter, mock_store, mock_hass):
        """Test floor plan card with single floor."""
        room = Room(
            id="room_1",
            name="Room",
            polygon=Polygon(
                vertices=[
                    FPCoordinates(0, 0),
                    FPCoordinates(100, 0),
                    FPCoordinates(100, 100),
                    FPCoordinates(0, 100),
                ]
            ),
        )
        floor = Floor(id="floor_1", name="Ground", level=0, rooms=[room])
        floor_plan = FloorPlan(id="fp_1", name="House", floors=[floor])

        mock_store.get_floor_plan.return_value = floor_plan

        # Mock device placements
        collection = MagicMock()
        collection.get_devices_on_floor.return_value = []
        mock_store.get_device_placements.return_value = collection

        result = exporter.export_floor_plan_card("fp_1")

        # Single floor returns just the card, not a stack
        assert result["type"] == "picture-elements"
        assert result["title"] == "Ground"
        assert len(result["elements"]) == 1  # Room label

    def test_export_floor_plan_card_multi_floor(self, exporter, mock_store, mock_hass):
        """Test floor plan card with multiple floors."""
        room1 = Room(id="room_1", name="Living", polygon=Polygon(vertices=[]))
        room2 = Room(id="room_2", name="Bedroom", polygon=Polygon(vertices=[]))
        floor1 = Floor(id="floor_1", name="Ground", level=0, rooms=[room1])
        floor2 = Floor(id="floor_2", name="First", level=1, rooms=[room2])
        floor_plan = FloorPlan(id="fp_1", name="House", floors=[floor1, floor2])

        mock_store.get_floor_plan.return_value = floor_plan

        # Mock device placements
        collection = MagicMock()
        collection.get_devices_on_floor.return_value = []
        mock_store.get_device_placements.return_value = collection

        result = exporter.export_floor_plan_card("fp_1")

        # Multiple floors returns vertical stack
        assert result["type"] == "vertical-stack"
        assert result["title"] == "House"
        assert len(result["cards"]) == 2
