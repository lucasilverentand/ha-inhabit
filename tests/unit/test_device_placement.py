"""Unit tests for device placement models."""
from __future__ import annotations

import pytest

from custom_components.inhabit.models.device_placement import (
    SensorCoverage,
    DevicePlacement,
    DevicePlacementCollection,
    Coordinates,
)
from custom_components.inhabit.models.floor_plan import Polygon, Coordinates as FPCoordinates


class TestSensorCoverage:
    """Test SensorCoverage model."""

    def test_default_values(self):
        """Test default values."""
        coverage = SensorCoverage()

        assert coverage.type == "cone"
        assert coverage.angle == 90.0
        assert coverage.range == 500.0
        assert coverage.direction == 0.0
        assert coverage.polygon is None

    def test_cone_coverage(self):
        """Test cone coverage type."""
        coverage = SensorCoverage(
            type="cone",
            angle=120.0,
            range=300.0,
            direction=45.0,
        )

        assert coverage.type == "cone"
        assert coverage.angle == 120.0
        assert coverage.range == 300.0
        assert coverage.direction == 45.0

    def test_circle_coverage(self):
        """Test circle coverage type."""
        coverage = SensorCoverage(
            type="circle",
            range=200.0,
        )

        assert coverage.type == "circle"
        assert coverage.range == 200.0

    def test_polygon_coverage(self):
        """Test polygon coverage type."""
        polygon = Polygon(vertices=[
            FPCoordinates(0, 0),
            FPCoordinates(100, 0),
            FPCoordinates(100, 100),
            FPCoordinates(0, 100),
        ])
        coverage = SensorCoverage(
            type="polygon",
            polygon=polygon,
        )

        assert coverage.type == "polygon"
        assert coverage.polygon is not None
        assert len(coverage.polygon.vertices) == 4

    def test_to_dict_without_polygon(self):
        """Test serialization without polygon."""
        coverage = SensorCoverage(
            type="cone",
            angle=90.0,
            range=400.0,
            direction=180.0,
        )
        data = coverage.to_dict()

        assert data["type"] == "cone"
        assert data["angle"] == 90.0
        assert data["range"] == 400.0
        assert data["direction"] == 180.0
        assert data["polygon"] is None

    def test_to_dict_with_polygon(self):
        """Test serialization with polygon."""
        polygon = Polygon(vertices=[
            FPCoordinates(0, 0),
            FPCoordinates(50, 0),
            FPCoordinates(50, 50),
        ])
        coverage = SensorCoverage(type="polygon", polygon=polygon)
        data = coverage.to_dict()

        assert data["type"] == "polygon"
        assert data["polygon"] is not None
        assert "vertices" in data["polygon"]

    def test_from_dict_without_polygon(self):
        """Test deserialization without polygon."""
        data = {
            "type": "circle",
            "angle": 45.0,
            "range": 250.0,
            "direction": 90.0,
        }
        coverage = SensorCoverage.from_dict(data)

        assert coverage.type == "circle"
        assert coverage.angle == 45.0
        assert coverage.range == 250.0
        assert coverage.direction == 90.0
        assert coverage.polygon is None

    def test_from_dict_with_polygon(self):
        """Test deserialization with polygon."""
        data = {
            "type": "polygon",
            "polygon": {
                "vertices": [
                    {"x": 0, "y": 0},
                    {"x": 100, "y": 0},
                    {"x": 100, "y": 100},
                ],
            },
        }
        coverage = SensorCoverage.from_dict(data)

        assert coverage.type == "polygon"
        assert coverage.polygon is not None
        assert len(coverage.polygon.vertices) == 3


class TestDevicePlacement:
    """Test DevicePlacement model."""

    def test_default_values(self):
        """Test default values."""
        device = DevicePlacement()

        assert device.entity_id == ""
        assert device.floor_id == ""
        assert device.room_id is None
        assert device.rotation == 0.0
        assert device.scale == 1.0
        assert device.label is None
        assert device.show_state is True
        assert device.show_label is False
        assert device.coverage is None
        assert device.contributes_to_occupancy is False

    def test_full_device(self):
        """Test device with all fields."""
        device = DevicePlacement(
            id="dev_1",
            entity_id="light.living_room",
            floor_id="floor_ground",
            room_id="room_living",
            position=Coordinates(150, 200),
            rotation=45.0,
            scale=1.5,
            label="Main Light",
            show_state=True,
            show_label=True,
            coverage=SensorCoverage(type="circle", range=100.0),
            contributes_to_occupancy=False,
        )

        assert device.id == "dev_1"
        assert device.entity_id == "light.living_room"
        assert device.position.x == 150
        assert device.position.y == 200
        assert device.rotation == 45.0
        assert device.label == "Main Light"
        assert device.coverage is not None

    def test_to_dict(self):
        """Test serialization."""
        device = DevicePlacement(
            id="dev_1",
            entity_id="sensor.motion",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(100, 100),
            rotation=90.0,
            scale=2.0,
            label="Motion Sensor",
            show_state=False,
            show_label=True,
            coverage=SensorCoverage(type="cone", angle=120.0, range=300.0),
            contributes_to_occupancy=True,
        )
        data = device.to_dict()

        assert data["id"] == "dev_1"
        assert data["entity_id"] == "sensor.motion"
        assert data["floor_id"] == "floor_1"
        assert data["room_id"] == "room_1"
        assert data["position"]["x"] == 100
        assert data["position"]["y"] == 100
        assert data["rotation"] == 90.0
        assert data["scale"] == 2.0
        assert data["label"] == "Motion Sensor"
        assert data["show_state"] is False
        assert data["show_label"] is True
        assert data["coverage"]["type"] == "cone"
        assert data["contributes_to_occupancy"] is True

    def test_from_dict(self):
        """Test deserialization."""
        data = {
            "id": "dev_2",
            "entity_id": "binary_sensor.presence",
            "floor_id": "floor_1",
            "room_id": "room_2",
            "position": {"x": 200, "y": 300},
            "rotation": 180.0,
            "scale": 0.8,
            "label": "Presence",
            "show_state": True,
            "show_label": False,
            "coverage": {"type": "circle", "range": 250.0},
            "contributes_to_occupancy": True,
        }
        device = DevicePlacement.from_dict(data)

        assert device.id == "dev_2"
        assert device.entity_id == "binary_sensor.presence"
        assert device.position.x == 200
        assert device.rotation == 180.0
        assert device.coverage.type == "circle"

    def test_from_dict_minimal(self):
        """Test deserialization with minimal data."""
        data = {}
        device = DevicePlacement.from_dict(data)

        assert device.entity_id == ""
        assert device.position.x == 0
        assert device.position.y == 0
        assert device.rotation == 0.0
        assert device.coverage is None


class TestDevicePlacementCollection:
    """Test DevicePlacementCollection model."""

    @pytest.fixture
    def sample_devices(self):
        """Create sample devices."""
        return [
            DevicePlacement(
                id="dev_1",
                entity_id="light.living",
                floor_id="floor_1",
                room_id="room_1",
                position=Coordinates(100, 100),
                contributes_to_occupancy=False,
            ),
            DevicePlacement(
                id="dev_2",
                entity_id="binary_sensor.motion",
                floor_id="floor_1",
                room_id="room_1",
                position=Coordinates(200, 100),
                contributes_to_occupancy=True,
            ),
            DevicePlacement(
                id="dev_3",
                entity_id="light.kitchen",
                floor_id="floor_1",
                room_id="room_2",
                position=Coordinates(300, 100),
                contributes_to_occupancy=False,
            ),
            DevicePlacement(
                id="dev_4",
                entity_id="light.bedroom",
                floor_id="floor_2",
                room_id="room_3",
                position=Coordinates(100, 100),
                contributes_to_occupancy=False,
            ),
        ]

    @pytest.fixture
    def collection(self, sample_devices):
        """Create a collection with sample devices."""
        return DevicePlacementCollection(
            floor_plan_id="fp_1",
            devices=sample_devices,
        )

    def test_default_values(self):
        """Test default values."""
        collection = DevicePlacementCollection()

        assert collection.floor_plan_id == ""
        assert collection.devices == []

    def test_to_dict(self, collection):
        """Test serialization."""
        data = collection.to_dict()

        assert data["floor_plan_id"] == "fp_1"
        assert len(data["devices"]) == 4

    def test_from_dict(self):
        """Test deserialization."""
        data = {
            "floor_plan_id": "fp_2",
            "devices": [
                {
                    "id": "dev_1",
                    "entity_id": "light.test",
                    "floor_id": "floor_1",
                    "position": {"x": 50, "y": 50},
                },
            ],
        }
        collection = DevicePlacementCollection.from_dict(data)

        assert collection.floor_plan_id == "fp_2"
        assert len(collection.devices) == 1
        assert collection.devices[0].entity_id == "light.test"

    def test_get_device_found(self, collection):
        """Test getting device by ID."""
        device = collection.get_device("dev_1")

        assert device is not None
        assert device.id == "dev_1"
        assert device.entity_id == "light.living"

    def test_get_device_not_found(self, collection):
        """Test getting device that doesn't exist."""
        device = collection.get_device("nonexistent")

        assert device is None

    def test_get_devices_by_entity(self, collection):
        """Test getting devices by entity ID."""
        devices = collection.get_devices_by_entity("light.living")

        assert len(devices) == 1
        assert devices[0].id == "dev_1"

    def test_get_devices_by_entity_none(self, collection):
        """Test getting devices for entity that doesn't exist."""
        devices = collection.get_devices_by_entity("light.nonexistent")

        assert devices == []

    def test_get_devices_in_room(self, collection):
        """Test getting devices in room."""
        devices = collection.get_devices_in_room("room_1")

        assert len(devices) == 2
        entity_ids = [d.entity_id for d in devices]
        assert "light.living" in entity_ids
        assert "binary_sensor.motion" in entity_ids

    def test_get_devices_in_room_none(self, collection):
        """Test getting devices in room that doesn't exist."""
        devices = collection.get_devices_in_room("nonexistent_room")

        assert devices == []

    def test_get_devices_on_floor(self, collection):
        """Test getting devices on floor."""
        devices = collection.get_devices_on_floor("floor_1")

        assert len(devices) == 3

    def test_get_devices_on_floor_none(self, collection):
        """Test getting devices on floor that doesn't exist."""
        devices = collection.get_devices_on_floor("nonexistent_floor")

        assert devices == []

    def test_get_occupancy_contributors(self, collection):
        """Test getting occupancy contributors."""
        contributors = collection.get_occupancy_contributors("room_1")

        assert len(contributors) == 1
        assert contributors[0].entity_id == "binary_sensor.motion"

    def test_get_occupancy_contributors_none(self, collection):
        """Test getting occupancy contributors for room without any."""
        contributors = collection.get_occupancy_contributors("room_2")

        assert contributors == []

    def test_add_device(self, collection):
        """Test adding a device."""
        new_device = DevicePlacement(
            id="dev_5",
            entity_id="switch.new",
            floor_id="floor_1",
            room_id="room_1",
        )
        collection.add_device(new_device)

        assert len(collection.devices) == 5
        assert collection.get_device("dev_5") is not None

    def test_remove_device_found(self, collection):
        """Test removing a device that exists."""
        result = collection.remove_device("dev_1")

        assert result is True
        assert len(collection.devices) == 3
        assert collection.get_device("dev_1") is None

    def test_remove_device_not_found(self, collection):
        """Test removing a device that doesn't exist."""
        result = collection.remove_device("nonexistent")

        assert result is False
        assert len(collection.devices) == 4

    def test_update_device_found(self, collection):
        """Test updating a device that exists."""
        updated_device = DevicePlacement(
            id="dev_1",
            entity_id="light.living_updated",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(999, 999),
        )
        result = collection.update_device(updated_device)

        assert result is True
        device = collection.get_device("dev_1")
        assert device.entity_id == "light.living_updated"
        assert device.position.x == 999

    def test_update_device_not_found(self, collection):
        """Test updating a device that doesn't exist."""
        new_device = DevicePlacement(
            id="nonexistent",
            entity_id="light.new",
            floor_id="floor_1",
        )
        result = collection.update_device(new_device)

        assert result is False
