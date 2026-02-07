"""Comprehensive unit tests for all data models."""

from __future__ import annotations

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.models.automation_rule import (
    RuleAction,
    RuleCondition,
    VisualRule,
)
from custom_components.inhabit.models.device_placement import (
    DevicePlacement,
    DevicePlacementCollection,
)
from custom_components.inhabit.models.floor_plan import (
    BoundingBox,
    Coordinates,
    Door,
    Floor,
    FloorPlan,
    Polygon,
    Room,
    Wall,
    Window,
)
from custom_components.inhabit.models.virtual_sensor import (
    OccupancyStateData,
    SensorBinding,
    VirtualSensorConfig,
)


class TestCoordinates:
    """Test Coordinates model."""

    def test_creation(self):
        """Test basic creation."""
        coord = Coordinates(10, 20)
        assert coord.x == 10
        assert coord.y == 20

    def test_to_dict(self):
        """Test serialization."""
        coord = Coordinates(10, 20)
        data = coord.to_dict()
        assert data == {"x": 10, "y": 20}

    def test_from_dict(self):
        """Test deserialization."""
        coord = Coordinates.from_dict({"x": 10, "y": 20})
        assert coord.x == 10
        assert coord.y == 20

    def test_equality(self):
        """Test coordinate equality."""
        c1 = Coordinates(10, 20)
        c2 = Coordinates(10, 20)
        c3 = Coordinates(10, 30)
        assert c1.x == c2.x and c1.y == c2.y
        assert c1.x == c3.x and c1.y != c3.y


class TestBoundingBox:
    """Test BoundingBox model."""

    def test_creation(self):
        """Test basic creation."""
        bb = BoundingBox(min_x=0, min_y=0, max_x=100, max_y=50)
        assert bb.min_x == 0
        assert bb.min_y == 0
        assert bb.max_x == 100
        assert bb.max_y == 50

    def test_properties(self):
        """Test computed properties."""
        bb = BoundingBox(min_x=10, min_y=20, max_x=110, max_y=70)
        assert bb.width == 100
        assert bb.height == 50
        center = bb.center
        assert center.x == 60
        assert center.y == 45

    def test_to_dict(self):
        """Test serialization."""
        bb = BoundingBox(min_x=0, min_y=0, max_x=100, max_y=50)
        data = bb.to_dict()
        assert data == {"min_x": 0, "min_y": 0, "max_x": 100, "max_y": 50}

    def test_from_dict(self):
        """Test deserialization."""
        bb = BoundingBox.from_dict(
            {"min_x": 10, "min_y": 20, "max_x": 110, "max_y": 70}
        )
        assert bb.min_x == 10
        assert bb.min_y == 20


class TestPolygon:
    """Test Polygon model."""

    def test_creation(self):
        """Test basic creation."""
        vertices = [
            Coordinates(0, 0),
            Coordinates(100, 0),
            Coordinates(100, 100),
            Coordinates(0, 100),
        ]
        poly = Polygon(vertices=vertices)
        assert len(poly.vertices) == 4

    def test_bounding_box(self):
        """Test bounding box calculation."""
        vertices = [
            Coordinates(10, 20),
            Coordinates(110, 20),
            Coordinates(110, 70),
            Coordinates(10, 70),
        ]
        poly = Polygon(vertices=vertices)
        bb = poly.bounding_box
        assert bb.min_x == 10
        assert bb.min_y == 20
        assert bb.width == 100
        assert bb.height == 50

    def test_bounding_box_empty(self):
        """Test bounding box with empty polygon."""
        poly = Polygon(vertices=[])
        assert poly.bounding_box is None

    def test_contains_point_inside(self):
        """Test point inside polygon."""
        vertices = [
            Coordinates(0, 0),
            Coordinates(100, 0),
            Coordinates(100, 100),
            Coordinates(0, 100),
        ]
        poly = Polygon(vertices=vertices)
        assert poly.contains_point(Coordinates(50, 50)) is True

    def test_contains_point_outside(self):
        """Test point outside polygon."""
        vertices = [
            Coordinates(0, 0),
            Coordinates(100, 0),
            Coordinates(100, 100),
            Coordinates(0, 100),
        ]
        poly = Polygon(vertices=vertices)
        assert poly.contains_point(Coordinates(150, 50)) is False

    def test_contains_point_empty_polygon(self):
        """Test contains_point with empty polygon."""
        poly = Polygon(vertices=[])
        assert poly.contains_point(Coordinates(50, 50)) is False

    def test_to_dict(self):
        """Test serialization."""
        vertices = [Coordinates(0, 0), Coordinates(100, 0)]
        poly = Polygon(vertices=vertices)
        data = poly.to_dict()
        assert "vertices" in data
        assert len(data["vertices"]) == 2

    def test_from_dict(self):
        """Test deserialization."""
        data = {"vertices": [{"x": 0, "y": 0}, {"x": 100, "y": 0}]}
        poly = Polygon.from_dict(data)
        assert len(poly.vertices) == 2


class TestWall:
    """Test Wall model."""

    def test_creation(self):
        """Test basic creation."""
        wall = Wall(
            start=Coordinates(0, 0),
            end=Coordinates(100, 0),
            thickness=10,
        )
        assert wall.thickness == 10

    def test_creation_with_id(self):
        """Test creation with explicit ID."""
        wall = Wall(
            id="wall_1",
            start=Coordinates(0, 0),
            end=Coordinates(100, 0),
        )
        assert wall.id == "wall_1"

    def test_auto_id(self):
        """Test auto-generated ID."""
        wall = Wall(start=Coordinates(0, 0), end=Coordinates(100, 0))
        assert wall.id is not None
        assert len(wall.id) > 0

    def test_default_fields(self):
        """Test default field values."""
        wall = Wall(start=Coordinates(0, 0), end=Coordinates(100, 0))
        assert wall.length_locked is False
        assert wall.direction == "free"

    def test_length_locked(self):
        """Test wall with length locked."""
        wall = Wall(
            start=Coordinates(0, 0),
            end=Coordinates(100, 0),
            length_locked=True,
        )
        assert wall.length_locked is True
        assert wall.direction == "free"

    def test_direction_horizontal(self):
        """Test wall with horizontal direction."""
        wall = Wall(
            start=Coordinates(0, 0),
            end=Coordinates(100, 0),
            direction="horizontal",
        )
        assert wall.direction == "horizontal"
        assert wall.length_locked is False

    def test_direction_vertical(self):
        """Test wall with vertical direction."""
        wall = Wall(
            start=Coordinates(0, 0),
            end=Coordinates(0, 100),
            direction="vertical",
        )
        assert wall.direction == "vertical"

    def test_combined_length_locked_and_direction(self):
        """Test wall with both length_locked and direction."""
        wall = Wall(
            start=Coordinates(0, 0),
            end=Coordinates(100, 0),
            length_locked=True,
            direction="horizontal",
        )
        assert wall.length_locked is True
        assert wall.direction == "horizontal"

    def test_to_dict(self):
        """Test serialization."""
        wall = Wall(
            id="wall_1",
            start=Coordinates(0, 0),
            end=Coordinates(100, 0),
            thickness=10,
        )
        data = wall.to_dict()
        assert data["id"] == "wall_1"
        assert data["thickness"] == 10

    def test_to_dict_includes_new_fields(self):
        """Test serialization includes length_locked and direction."""
        wall = Wall(
            id="wall_1",
            start=Coordinates(0, 0),
            end=Coordinates(100, 0),
            length_locked=True,
            direction="horizontal",
        )
        data = wall.to_dict()
        assert data["length_locked"] is True
        assert data["direction"] == "horizontal"

    def test_from_dict(self):
        """Test deserialization."""
        data = {
            "id": "wall_1",
            "start": {"x": 0, "y": 0},
            "end": {"x": 100, "y": 0},
            "thickness": 15,
        }
        wall = Wall.from_dict(data)
        assert wall.id == "wall_1"
        assert wall.thickness == 15

    def test_from_dict_with_new_fields(self):
        """Test deserialization with new fields."""
        data = {
            "id": "wall_1",
            "start": {"x": 0, "y": 0},
            "end": {"x": 100, "y": 0},
            "thickness": 10,
            "length_locked": True,
            "direction": "vertical",
        }
        wall = Wall.from_dict(data)
        assert wall.length_locked is True
        assert wall.direction == "vertical"

    def test_from_dict_defaults(self):
        """Test deserialization defaults."""
        data = {
            "id": "wall_1",
            "start": {"x": 0, "y": 0},
            "end": {"x": 100, "y": 0},
        }
        wall = Wall.from_dict(data)
        assert wall.length_locked is False
        assert wall.direction == "free"

    def test_migration_from_old_constraint_length(self):
        """Test migration from old 'constraint: length' to length_locked."""
        data = {
            "id": "wall_1",
            "start": {"x": 0, "y": 0},
            "end": {"x": 100, "y": 0},
            "constraint": "length",
        }
        wall = Wall.from_dict(data)
        assert wall.length_locked is True
        assert wall.direction == "free"

    def test_migration_from_old_constraint_horizontal(self):
        """Test migration from old 'constraint: horizontal' to direction."""
        data = {
            "id": "wall_1",
            "start": {"x": 0, "y": 0},
            "end": {"x": 100, "y": 0},
            "constraint": "horizontal",
        }
        wall = Wall.from_dict(data)
        assert wall.length_locked is False
        assert wall.direction == "horizontal"

    def test_migration_from_old_constraint_vertical(self):
        """Test migration from old 'constraint: vertical' to direction."""
        data = {
            "id": "wall_1",
            "start": {"x": 0, "y": 0},
            "end": {"x": 0, "y": 100},
            "constraint": "vertical",
        }
        wall = Wall.from_dict(data)
        assert wall.length_locked is False
        assert wall.direction == "vertical"

    def test_migration_from_old_constraint_none(self):
        """Test migration from old 'constraint: none' to defaults."""
        data = {
            "id": "wall_1",
            "start": {"x": 0, "y": 0},
            "end": {"x": 100, "y": 0},
            "constraint": "none",
        }
        wall = Wall.from_dict(data)
        assert wall.length_locked is False
        assert wall.direction == "free"

    def test_migration_from_old_constraint_fixed(self):
        """Test migration from old 'constraint: fixed' to defaults."""
        data = {
            "id": "wall_1",
            "start": {"x": 0, "y": 0},
            "end": {"x": 100, "y": 0},
            "constraint": "fixed",
        }
        wall = Wall.from_dict(data)
        assert wall.length_locked is False
        assert wall.direction == "free"

    def test_migration_from_old_constraint_angle(self):
        """Test migration from old 'constraint: angle' to defaults."""
        data = {
            "id": "wall_1",
            "start": {"x": 0, "y": 0},
            "end": {"x": 100, "y": 100},
            "constraint": "angle",
        }
        wall = Wall.from_dict(data)
        assert wall.length_locked is False
        assert wall.direction == "free"

    def test_new_fields_take_precedence_over_old_constraint(self):
        """Test that new fields take precedence when both are present."""
        data = {
            "id": "wall_1",
            "start": {"x": 0, "y": 0},
            "end": {"x": 100, "y": 0},
            "constraint": "horizontal",
            "length_locked": True,
            "direction": "vertical",
        }
        wall = Wall.from_dict(data)
        assert wall.length_locked is True
        assert wall.direction == "vertical"

    def test_serialization_round_trip(self):
        """Test full serialization cycle preserves new fields."""
        original = Wall(
            id="wall_1",
            start=Coordinates(0, 0),
            end=Coordinates(100, 50),
            thickness=8,
            length_locked=True,
            direction="horizontal",
        )
        data = original.to_dict()
        restored = Wall.from_dict(data)

        assert restored.id == original.id
        assert restored.start.x == original.start.x
        assert restored.start.y == original.start.y
        assert restored.end.x == original.end.x
        assert restored.end.y == original.end.y
        assert restored.thickness == original.thickness
        assert restored.length_locked == original.length_locked
        assert restored.direction == original.direction


class TestDoor:
    """Test Door model."""

    def test_creation(self):
        """Test basic creation."""
        door = Door(
            position=Coordinates(50, 0),
            width=80,
            wall_id="wall_1",
        )
        assert door.width == 80

    def test_to_dict(self):
        """Test serialization."""
        door = Door(
            id="door_1",
            position=Coordinates(50, 0),
            width=80,
            wall_id="wall_1",
        )
        data = door.to_dict()
        assert data["width"] == 80
        assert data["wall_id"] == "wall_1"


class TestWindow:
    """Test Window model."""

    def test_creation(self):
        """Test basic creation."""
        window = Window(
            position=Coordinates(50, 0),
            width=100,
            height=120,
            wall_id="wall_1",
        )
        assert window.width == 100
        assert window.height == 120

    def test_to_dict(self):
        """Test serialization."""
        window = Window(
            id="window_1",
            position=Coordinates(50, 0),
            width=100,
            height=120,
            wall_id="wall_1",
        )
        data = window.to_dict()
        assert data["width"] == 100
        assert data["height"] == 120


class TestRoom:
    """Test Room model."""

    def test_creation(self):
        """Test basic creation."""
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
        )
        assert room.name == "Living Room"

    def test_creation_with_all_options(self):
        """Test creation with all options."""
        room = Room(
            id="room_1",
            name="Kitchen",
            polygon=Polygon(vertices=[Coordinates(0, 0), Coordinates(100, 0)]),
            floor_id="floor_1",
            color="#ffffff",
            occupancy_sensor_enabled=True,
            motion_timeout=120,
            checking_timeout=30,
        )
        assert room.occupancy_sensor_enabled is True
        assert room.motion_timeout == 120

    def test_to_dict(self):
        """Test serialization."""
        room = Room(
            name="Test",
            polygon=Polygon(vertices=[Coordinates(0, 0)]),
            occupancy_sensor_enabled=True,
        )
        data = room.to_dict()
        assert data["name"] == "Test"
        assert data["occupancy_sensor_enabled"] is True

    def test_from_dict(self):
        """Test deserialization."""
        data = {
            "id": "room_1",
            "name": "Bedroom",
            "polygon": {"vertices": [{"x": 0, "y": 0}]},
            "motion_timeout": 180,
        }
        room = Room.from_dict(data)
        assert room.name == "Bedroom"
        assert room.motion_timeout == 180


class TestFloor:
    """Test Floor model."""

    def test_creation(self):
        """Test basic creation."""
        floor = Floor(name="Ground Floor", level=0)
        assert floor.name == "Ground Floor"
        assert floor.level == 0
        assert floor.rooms == []

    def test_creation_with_rooms(self):
        """Test creation with rooms."""
        room = Room(name="Room", polygon=Polygon(vertices=[Coordinates(0, 0)]))
        floor = Floor(name="Floor 1", level=1, rooms=[room])
        assert len(floor.rooms) == 1

    def test_to_dict(self):
        """Test serialization."""
        floor = Floor(name="Test Floor", level=2)
        data = floor.to_dict()
        assert data["name"] == "Test Floor"
        assert data["level"] == 2

    def test_from_dict(self):
        """Test deserialization."""
        data = {
            "id": "floor_1",
            "name": "Basement",
            "level": -1,
            "rooms": [],
        }
        floor = Floor.from_dict(data)
        assert floor.level == -1


class TestFloorPlan:
    """Test FloorPlan model."""

    def test_creation(self):
        """Test basic creation."""
        fp = FloorPlan(name="My House")
        assert fp.name == "My House"
        assert fp.floors == []

    def test_creation_with_options(self):
        """Test creation with all options."""
        fp = FloorPlan(
            name="House",
            unit="m",
            grid_size=1,
        )
        assert fp.unit == "m"
        assert fp.grid_size == 1

    def test_get_room_found(self):
        """Test getting room by ID."""
        room = Room(id="room_1", name="Test", polygon=Polygon(vertices=[]))
        floor = Floor(name="Floor", level=0, rooms=[room])
        fp = FloorPlan(name="House", floors=[floor])

        found = fp.get_room("room_1")
        assert found is not None
        # get_room returns (floor, room) tuple
        if isinstance(found, tuple):
            assert found[1].name == "Test"  # room is second element
            assert found[0].name == "Floor"  # floor is first element
        else:
            assert found.name == "Test"

    def test_get_room_not_found(self):
        """Test getting non-existent room."""
        fp = FloorPlan(name="House")
        found = fp.get_room("nonexistent")
        assert found is None

    def test_get_floor_found(self):
        """Test getting floor by ID."""
        floor = Floor(id="floor_1", name="Test", level=0)
        fp = FloorPlan(name="House", floors=[floor])

        found = fp.get_floor("floor_1")
        assert found is not None

    def test_get_floor_not_found(self):
        """Test getting non-existent floor."""
        fp = FloorPlan(name="House")
        found = fp.get_floor("nonexistent")
        assert found is None

    def test_to_dict(self):
        """Test serialization."""
        fp = FloorPlan(name="Test", unit="ft", grid_size=5)
        data = fp.to_dict()
        assert data["name"] == "Test"
        assert data["unit"] == "ft"

    def test_from_dict(self):
        """Test deserialization."""
        data = {
            "id": "fp_1",
            "name": "Villa",
            "unit": "m",
            "grid_size": 10,
            "floors": [],
        }
        fp = FloorPlan.from_dict(data)
        assert fp.name == "Villa"
        assert fp.unit == "m"

    def test_full_serialization_cycle(self):
        """Test full serialization and deserialization cycle."""
        room = Room(
            id="room_1",
            name="Living Room",
            polygon=Polygon(
                vertices=[
                    Coordinates(0, 0),
                    Coordinates(100, 0),
                    Coordinates(100, 100),
                    Coordinates(0, 100),
                ]
            ),
            occupancy_sensor_enabled=True,
        )
        floor = Floor(id="floor_1", name="Ground", level=0, rooms=[room])
        fp = FloorPlan(id="fp_1", name="House", floors=[floor])

        data = fp.to_dict()
        restored = FloorPlan.from_dict(data)

        assert restored.name == "House"
        assert len(restored.floors) == 1
        assert len(restored.floors[0].rooms) == 1
        assert restored.floors[0].rooms[0].name == "Living Room"


class TestDevicePlacement:
    """Test DevicePlacement model."""

    def test_creation(self):
        """Test basic creation."""
        device = DevicePlacement(
            entity_id="light.living_room",
            floor_id="floor_1",
            position=Coordinates(100, 100),
        )
        assert device.entity_id == "light.living_room"

    def test_creation_with_options(self):
        """Test creation with all options."""
        device = DevicePlacement(
            entity_id="binary_sensor.motion",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(50, 50),
            rotation=45,
            scale=1.5,
            show_state=True,
            show_label=True,
            contributes_to_occupancy=True,
        )
        assert device.rotation == 45
        assert device.scale == 1.5
        assert device.contributes_to_occupancy is True

    def test_to_dict(self):
        """Test serialization."""
        device = DevicePlacement(
            entity_id="switch.fan",
            floor_id="floor_1",
            position=Coordinates(0, 0),
        )
        data = device.to_dict()
        assert data["entity_id"] == "switch.fan"

    def test_from_dict(self):
        """Test deserialization."""
        data = {
            "id": "dev_1",
            "entity_id": "light.test",
            "floor_id": "floor_1",
            "position": {"x": 10, "y": 20},
            "rotation": 90,
        }
        device = DevicePlacement.from_dict(data)
        assert device.rotation == 90


class TestDevicePlacementCollection:
    """Test DevicePlacementCollection model."""

    def test_creation(self):
        """Test basic creation."""
        collection = DevicePlacementCollection(floor_plan_id="fp_1")
        assert collection.floor_plan_id == "fp_1"
        assert collection.devices == []

    def test_add_device(self):
        """Test adding device."""
        collection = DevicePlacementCollection(floor_plan_id="fp_1")
        device = DevicePlacement(
            entity_id="light.test",
            floor_id="floor_1",
            position=Coordinates(0, 0),
        )
        collection.devices.append(device)
        assert len(collection.devices) == 1

    def test_to_dict(self):
        """Test serialization."""
        collection = DevicePlacementCollection(floor_plan_id="fp_1")
        data = collection.to_dict()
        assert data["floor_plan_id"] == "fp_1"


class TestSensorBinding:
    """Test SensorBinding model."""

    def test_creation(self):
        """Test basic creation."""
        binding = SensorBinding(
            entity_id="binary_sensor.motion",
            sensor_type="motion",
            weight=1.0,
        )
        assert binding.entity_id == "binary_sensor.motion"
        assert binding.weight == 1.0

    def test_inverted(self):
        """Test inverted sensor."""
        binding = SensorBinding(
            entity_id="binary_sensor.no_motion",
            sensor_type="motion",
            weight=1.0,
            inverted=True,
        )
        assert binding.inverted is True

    def test_to_dict(self):
        """Test serialization."""
        binding = SensorBinding(
            entity_id="binary_sensor.test",
            sensor_type="presence",
            weight=1.5,
        )
        data = binding.to_dict()
        assert data["weight"] == 1.5


class TestVirtualSensorConfig:
    """Test VirtualSensorConfig model."""

    def test_creation(self):
        """Test basic creation."""
        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
        )
        assert config.room_id == "room_1"
        assert config.enabled is True

    def test_get_all_entity_ids(self):
        """Test getting all entity IDs."""
        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
            motion_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.motion1", sensor_type="motion", weight=1.0
                ),
                SensorBinding(
                    entity_id="binary_sensor.motion2", sensor_type="motion", weight=1.0
                ),
            ],
            presence_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.presence1",
                    sensor_type="presence",
                    weight=1.5,
                ),
            ],
            door_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.door1", sensor_type="door", weight=1.0
                ),
            ],
        )
        ids = config.get_all_sensor_entity_ids()
        assert len(ids) == 4
        assert "binary_sensor.motion1" in ids
        assert "binary_sensor.presence1" in ids
        assert "binary_sensor.door1" in ids

    def test_to_dict(self):
        """Test serialization."""
        config = VirtualSensorConfig(
            room_id="room_1",
            floor_plan_id="fp_1",
            motion_timeout=120,
        )
        data = config.to_dict()
        assert data["motion_timeout"] == 120


class TestOccupancyStateData:
    """Test OccupancyStateData model."""

    def test_creation(self):
        """Test basic creation."""
        state = OccupancyStateData()
        assert state.state == OccupancyState.VACANT
        assert state.confidence == 0.0

    def test_creation_with_values(self):
        """Test creation with values."""
        state = OccupancyStateData(
            state=OccupancyState.OCCUPIED,
            confidence=0.8,
            contributing_sensors=["sensor1", "sensor2"],
        )
        assert state.state == OccupancyState.OCCUPIED
        assert state.confidence == 0.8
        assert len(state.contributing_sensors) == 2

    def test_to_dict(self):
        """Test serialization."""
        state = OccupancyStateData(
            state=OccupancyState.CHECKING,
            confidence=0.5,
        )
        data = state.to_dict()
        assert data["state"] == OccupancyState.CHECKING
        assert data["confidence"] == 0.5


class TestRuleCondition:
    """Test RuleCondition model."""

    def test_creation(self):
        """Test basic creation."""
        condition = RuleCondition(
            type="state",
            entity_id="light.living_room",
            state="on",
        )
        assert condition.type == "state"
        assert condition.entity_id == "light.living_room"

    def test_to_ha_condition_state(self):
        """Test conversion to HA condition - state type."""
        condition = RuleCondition(
            type="state",
            entity_id="binary_sensor.motion",
            state="on",
        )
        ha = condition.to_ha_condition()
        assert ha["condition"] == "state"
        assert ha["entity_id"] == "binary_sensor.motion"
        assert ha["state"] == "on"

    def test_to_ha_condition_time(self):
        """Test conversion to HA condition - time type."""
        condition = RuleCondition(
            type="time",
            after="08:00:00",
            before="22:00:00",
        )
        ha = condition.to_ha_condition()
        assert ha["condition"] == "time"
        assert ha["after"] == "08:00:00"
        assert ha["before"] == "22:00:00"


class TestRuleAction:
    """Test RuleAction model."""

    def test_creation(self):
        """Test basic creation."""
        action = RuleAction(
            type="service_call",
            service="light.turn_on",
            entity_id="light.living_room",
        )
        assert action.service == "light.turn_on"

    def test_to_ha_action_service(self):
        """Test conversion to HA action - service type."""
        action = RuleAction(
            type="service_call",
            service="light.turn_on",
            entity_id="light.bedroom",
        )
        ha = action.to_ha_action()
        assert ha["service"] == "light.turn_on"
        # Check for entity_id in target or directly
        assert "target" in ha or "entity_id" in ha


class TestVisualRule:
    """Test VisualRule model."""

    def test_creation(self):
        """Test basic creation."""
        rule = VisualRule(
            name="Test Rule",
            description="A test rule",
            floor_plan_id="fp_1",
            trigger_type="room_occupancy",
            trigger_room_id="room_1",
            trigger_state="on",
            conditions=[],
            actions=[
                RuleAction(
                    type="service_call",
                    service="light.turn_on",
                    entity_id="light.test",
                ),
            ],
        )
        assert rule.name == "Test Rule"
        assert rule.enabled is True

    def test_to_ha_automation(self):
        """Test conversion to HA automation."""
        rule = VisualRule(
            name="Lights On When Occupied",
            description="Turn on lights",
            floor_plan_id="fp_1",
            trigger_type="room_occupancy",
            trigger_room_id="room_living",
            trigger_state="on",
            conditions=[
                RuleCondition(
                    type="time",
                    after="18:00:00",
                    before="23:00:00",
                ),
            ],
            actions=[
                RuleAction(
                    type="service_call",
                    service="light.turn_on",
                    entity_id="light.living_room",
                ),
            ],
        )
        ha = rule.to_ha_automation()
        assert ha["alias"] == "Lights On When Occupied"
        assert "trigger" in ha
        assert "condition" in ha
        assert "action" in ha

    def test_disabled_rule(self):
        """Test disabled rule."""
        rule = VisualRule(
            name="Disabled Rule",
            description="",
            floor_plan_id="fp_1",
            trigger_type="room_occupancy",
            trigger_room_id="room_1",
            trigger_state="on",
            enabled=False,
            conditions=[],
            actions=[],
        )
        assert rule.enabled is False

    def test_to_dict(self):
        """Test serialization."""
        rule = VisualRule(
            name="Test",
            description="",
            floor_plan_id="fp_1",
            trigger_type="room_occupancy",
            trigger_room_id="room_1",
            trigger_state="on",
            conditions=[],
            actions=[],
        )
        data = rule.to_dict()
        assert data["name"] == "Test"
