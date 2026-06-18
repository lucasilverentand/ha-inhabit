"""Unit tests for device placement models."""

from __future__ import annotations

from custom_components.inhabit.models.device_placement import (
    ButtonPlacement,
    FanPlacement,
    LightPlacement,
    OtherPlacement,
    SwitchPlacement,
)
from custom_components.inhabit.models.floor_plan import Coordinates


class TestLightPlacement:
    """Test LightPlacement model."""

    def test_default_values(self):
        """Test default values."""
        light = LightPlacement()

        assert light.entity_id == ""
        assert light.floor_id == ""
        assert light.room_id is None
        assert light.label is None

    def test_full_creation(self):
        """Test creation with all fields."""
        light = LightPlacement(
            id="light_1",
            entity_id="light.living_room",
            floor_id="floor_ground",
            room_id="room_living",
            position=Coordinates(150, 200),
            label="Main Light",
        )

        assert light.id == "light_1"
        assert light.entity_id == "light.living_room"
        assert light.position.x == 150
        assert light.position.y == 200
        assert light.label == "Main Light"

    def test_to_dict(self):
        """Test serialization."""
        light = LightPlacement(
            id="light_1",
            entity_id="light.bedroom",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(100, 100),
            label="Bedroom Light",
        )
        data = light.to_dict()

        assert data["id"] == "light_1"
        assert data["entity_id"] == "light.bedroom"
        assert data["floor_id"] == "floor_1"
        assert data["room_id"] == "room_1"
        assert data["position"]["x"] == 100
        assert data["position"]["y"] == 100
        assert data["label"] == "Bedroom Light"

    def test_from_dict(self):
        """Test deserialization."""
        data = {
            "id": "light_2",
            "entity_id": "light.kitchen",
            "floor_id": "floor_1",
            "room_id": "room_2",
            "position": {"x": 200, "y": 300},
            "label": "Kitchen Light",
        }
        light = LightPlacement.from_dict(data)

        assert light.id == "light_2"
        assert light.entity_id == "light.kitchen"
        assert light.position.x == 200
        assert light.label == "Kitchen Light"

    def test_from_dict_minimal(self):
        """Test deserialization with minimal data."""
        data = {}
        light = LightPlacement.from_dict(data)

        assert light.entity_id == ""
        assert light.position.x == 0
        assert light.position.y == 0
        assert light.label is None


class TestSwitchPlacement:
    """Test SwitchPlacement model."""

    def test_creation_and_serialization(self):
        """Test creation and round-trip serialization."""
        switch = SwitchPlacement(
            id="sw_1",
            entity_id="switch.fan",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(50, 75),
            label="Fan Switch",
        )
        data = switch.to_dict()
        restored = SwitchPlacement.from_dict(data)

        assert restored.entity_id == "switch.fan"
        assert restored.position.x == 50
        assert restored.label == "Fan Switch"


class TestFanPlacement:
    """Test FanPlacement model."""

    def test_creation_and_serialization_with_map_settings(self):
        """Test fan placement round-trip serialization."""
        fan = FanPlacement(
            id="fan_1",
            entity_id="fan.dyson",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(75, 125),
            label="Dyson",
            orientation=45,
            oscillation_start=315,
            oscillation_end=90,
            deadzone_radius=80,
            deadzone_min_radius=20,
            deadzone_enabled=False,
            deadzone_dynamic=False,
        )
        data = fan.to_dict()
        restored = FanPlacement.from_dict(data)

        assert restored.entity_id == "fan.dyson"
        assert restored.position.x == 75
        assert restored.label == "Dyson"
        assert restored.orientation == 45
        assert restored.oscillation_start == 315
        assert restored.oscillation_end == 90
        assert restored.deadzone_radius == 80
        assert restored.deadzone_min_radius == 20
        assert restored.deadzone_enabled is False
        assert restored.deadzone_dynamic is False

    def test_from_dict_defaults_map_settings(self):
        """Test deserialization defaults for old/minimal data."""
        fan = FanPlacement.from_dict({"entity_id": "fan.dyson"})

        assert fan.orientation == 0
        assert fan.oscillation_start is None
        assert fan.oscillation_end is None
        assert fan.deadzone_radius is None
        assert fan.deadzone_min_radius is None
        assert fan.deadzone_enabled is True
        assert fan.deadzone_dynamic is True


class TestButtonPlacement:
    """Test ButtonPlacement model."""

    def test_creation_and_serialization(self):
        """Test creation and round-trip serialization."""
        button = ButtonPlacement(
            id="btn_1",
            entity_id="button.restart",
            floor_id="floor_1",
            position=Coordinates(10, 20),
        )
        data = button.to_dict()
        restored = ButtonPlacement.from_dict(data)

        assert restored.entity_id == "button.restart"
        assert restored.position.x == 10


class TestOtherPlacement:
    """Test OtherPlacement model."""

    def test_creation_and_serialization(self):
        """Test creation and round-trip serialization."""
        other = OtherPlacement(
            id="other_1",
            entity_id="climate.hvac",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(300, 150),
            label="HVAC",
        )
        data = other.to_dict()
        restored = OtherPlacement.from_dict(data)

        assert restored.entity_id == "climate.hvac"
        assert restored.position.x == 300
        assert restored.label == "HVAC"
