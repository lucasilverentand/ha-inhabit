"""Comprehensive unit tests for all data models."""

from __future__ import annotations

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.models.automation_rule import (
    RuleAction,
    RuleCondition,
    VisualRule,
)
from custom_components.inhabit.models.device_placement import (
    LightPlacement,
    SwitchPlacement,
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
from custom_components.inhabit.models.mmwave_sensor import MmwavePlacement
from custom_components.inhabit.models.virtual_sensor import (
    OccupancyStateData,
    SensorBinding,
    VirtualSensorConfig,
)
from custom_components.inhabit.models.zone import Zone


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


class TestLightPlacement:
    """Test LightPlacement model."""

    def test_creation(self):
        """Test basic creation."""
        light = LightPlacement(
            entity_id="light.living_room",
            floor_id="floor_1",
            position=Coordinates(100, 100),
        )
        assert light.entity_id == "light.living_room"

    def test_creation_with_all_fields(self):
        """Test creation with all fields."""
        light = LightPlacement(
            id="light_1",
            entity_id="light.bedroom",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(50, 50),
            label="Bedroom Light",
        )
        assert light.room_id == "room_1"
        assert light.label == "Bedroom Light"

    def test_to_dict(self):
        """Test serialization."""
        light = LightPlacement(
            entity_id="light.fan",
            floor_id="floor_1",
            position=Coordinates(0, 0),
        )
        data = light.to_dict()
        assert data["entity_id"] == "light.fan"

    def test_from_dict(self):
        """Test deserialization."""
        data = {
            "id": "light_1",
            "entity_id": "light.test",
            "floor_id": "floor_1",
            "position": {"x": 10, "y": 20},
        }
        light = LightPlacement.from_dict(data)
        assert light.position.x == 10
        assert light.position.y == 20


class TestSwitchPlacement:
    """Test SwitchPlacement model."""

    def test_round_trip(self):
        """Test round-trip serialization."""
        switch = SwitchPlacement(
            entity_id="switch.test",
            floor_id="floor_1",
            position=Coordinates(0, 0),
        )
        data = switch.to_dict()
        restored = SwitchPlacement.from_dict(data)
        assert restored.entity_id == "switch.test"


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

    def test_to_ha_condition_entity_state(self):
        """Test conversion to HA condition - entity_state type."""
        condition = RuleCondition(
            type="entity_state",
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


class TestZone:
    """Test Zone model."""

    def test_creation(self):
        """Test basic creation."""
        zone = Zone(
            name="Couch Area",
            floor_id="floor_1",
            room_id="room_1",
            polygon=Polygon(
                vertices=[
                    Coordinates(0, 0),
                    Coordinates(200, 0),
                    Coordinates(200, 150),
                    Coordinates(0, 150),
                ]
            ),
        )
        assert zone.name == "Couch Area"
        assert zone.floor_id == "floor_1"
        assert zone.room_id == "room_1"

    def test_default_values(self):
        """Test default field values."""
        zone = Zone()
        assert zone.name == ""
        assert zone.floor_id == ""
        assert zone.room_id is None
        assert zone.color == "#e0e0e0"
        assert zone.rotation == 0.0
        assert zone.ha_area_id is None
        assert zone.occupancy_sensor_enabled is False
        assert zone.motion_timeout == 120
        assert zone.checking_timeout == 30
        assert zone.long_stay is False
        assert zone.occupies_parent is False
        assert zone.phantom_hold_seconds == 0

    def test_to_dict(self):
        """Test serialization."""
        zone = Zone(
            id="zone_1",
            name="Bed Zone",
            floor_id="floor_1",
            room_id="room_1",
            polygon=Polygon(vertices=[Coordinates(10, 20)]),
            color="#ff0000",
            rotation=45.0,
            ha_area_id="area_bedroom",
            occupancy_sensor_enabled=True,
            motion_timeout=180,
            checking_timeout=60,
            long_stay=True,
            occupies_parent=True,
            phantom_hold_seconds=600,
        )
        data = zone.to_dict()
        assert data["id"] == "zone_1"
        assert data["name"] == "Bed Zone"
        assert data["floor_id"] == "floor_1"
        assert data["room_id"] == "room_1"
        assert data["color"] == "#ff0000"
        assert data["rotation"] == 45.0
        assert data["ha_area_id"] == "area_bedroom"
        assert data["occupancy_sensor_enabled"] is True
        assert data["motion_timeout"] == 180
        assert data["checking_timeout"] == 60
        assert data["long_stay"] is True
        assert data["occupies_parent"] is True
        assert data["phantom_hold_seconds"] == 600

    def test_from_dict(self):
        """Test deserialization."""
        data = {
            "id": "zone_1",
            "name": "Desk Zone",
            "floor_id": "floor_1",
            "room_id": "room_1",
            "polygon": {"vertices": [{"x": 0, "y": 0}, {"x": 100, "y": 0}]},
            "color": "#00ff00",
            "rotation": 90.0,
            "ha_area_id": "area_office",
            "occupancy_sensor_enabled": True,
            "motion_timeout": 240,
            "checking_timeout": 45,
            "long_stay": True,
            "occupies_parent": True,
            "phantom_hold_seconds": 900,
        }
        zone = Zone.from_dict(data)
        assert zone.id == "zone_1"
        assert zone.name == "Desk Zone"
        assert zone.floor_id == "floor_1"
        assert zone.room_id == "room_1"
        assert len(zone.polygon.vertices) == 2
        assert zone.color == "#00ff00"
        assert zone.rotation == 90.0
        assert zone.ha_area_id == "area_office"
        assert zone.occupancy_sensor_enabled is True
        assert zone.motion_timeout == 240
        assert zone.checking_timeout == 45
        assert zone.long_stay is True
        assert zone.occupies_parent is True
        assert zone.phantom_hold_seconds == 900

    def test_from_dict_defaults(self):
        """Test deserialization falls back to defaults for missing fields."""
        data = {
            "id": "zone_2",
            "name": "Minimal Zone",
        }
        zone = Zone.from_dict(data)
        assert zone.name == "Minimal Zone"
        assert zone.room_id is None
        assert zone.color == "#e0e0e0"
        assert zone.rotation == 0.0
        assert zone.ha_area_id is None
        assert zone.occupancy_sensor_enabled is False
        assert zone.motion_timeout == 120
        assert zone.checking_timeout == 30
        assert zone.long_stay is False
        assert zone.occupies_parent is False
        assert zone.phantom_hold_seconds == 0

    def test_serialization_round_trip(self):
        """Test full serialization and deserialization cycle."""
        original = Zone(
            id="zone_rt",
            name="Round Trip Zone",
            floor_id="floor_1",
            room_id="room_1",
            polygon=Polygon(
                vertices=[
                    Coordinates(0, 0),
                    Coordinates(100, 0),
                    Coordinates(100, 80),
                    Coordinates(0, 80),
                ]
            ),
            color="#abcdef",
            rotation=30.0,
            ha_area_id="area_test",
            occupancy_sensor_enabled=True,
            motion_timeout=300,
            checking_timeout=60,
            long_stay=True,
            occupies_parent=True,
            phantom_hold_seconds=450,
        )
        data = original.to_dict()
        restored = Zone.from_dict(data)

        assert restored.id == original.id
        assert restored.name == original.name
        assert restored.floor_id == original.floor_id
        assert restored.room_id == original.room_id
        assert len(restored.polygon.vertices) == len(original.polygon.vertices)
        for rv, ov in zip(restored.polygon.vertices, original.polygon.vertices):
            assert rv.x == ov.x
            assert rv.y == ov.y
        assert restored.color == original.color
        assert restored.rotation == original.rotation
        assert restored.ha_area_id == original.ha_area_id
        assert restored.occupancy_sensor_enabled == original.occupancy_sensor_enabled
        assert restored.motion_timeout == original.motion_timeout
        assert restored.checking_timeout == original.checking_timeout
        assert restored.long_stay == original.long_stay
        assert restored.occupies_parent == original.occupies_parent
        assert restored.phantom_hold_seconds == original.phantom_hold_seconds


class TestMmwavePlacement:
    """Test MmwavePlacement model."""

    def test_creation(self):
        """Test basic creation."""
        mmwave = MmwavePlacement(
            floor_plan_id="fp_1",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(250, 300),
            angle=90.0,
            field_of_view=110.0,
            detection_range=600.0,
            label="Hallway Sensor",
        )
        assert mmwave.floor_plan_id == "fp_1"
        assert mmwave.floor_id == "floor_1"
        assert mmwave.room_id == "room_1"
        assert mmwave.position.x == 250
        assert mmwave.position.y == 300
        assert mmwave.angle == 90.0
        assert mmwave.field_of_view == 110.0
        assert mmwave.detection_range == 600.0
        assert mmwave.label == "Hallway Sensor"

    def test_default_values(self):
        """Test default field values."""
        mmwave = MmwavePlacement()
        assert mmwave.floor_plan_id == ""
        assert mmwave.floor_id == ""
        assert mmwave.room_id is None
        assert mmwave.position.x == 0
        assert mmwave.position.y == 0
        assert mmwave.angle == 0.0
        assert mmwave.field_of_view == 120.0
        assert mmwave.detection_range == 500.0
        assert mmwave.label is None
        assert mmwave.targets == []

    def test_to_dict(self):
        """Test serialization."""
        mmwave = MmwavePlacement(
            id="mmw_1",
            floor_plan_id="fp_1",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(100, 200),
            angle=45.0,
            field_of_view=90.0,
            detection_range=400.0,
            label="Living Room Sensor",
            targets=[{"entity_id": "binary_sensor.presence_1", "type": "presence"}],
        )
        data = mmwave.to_dict()
        assert data["id"] == "mmw_1"
        assert data["floor_plan_id"] == "fp_1"
        assert data["floor_id"] == "floor_1"
        assert data["room_id"] == "room_1"
        assert data["position"] == {"x": 100, "y": 200}
        assert data["angle"] == 45.0
        assert data["field_of_view"] == 90.0
        assert data["detection_range"] == 400.0
        assert data["label"] == "Living Room Sensor"
        assert len(data["targets"]) == 1

    def test_from_dict(self):
        """Test deserialization."""
        data = {
            "id": "mmw_2",
            "floor_plan_id": "fp_1",
            "floor_id": "floor_1",
            "room_id": "room_1",
            "position": {"x": 50, "y": 75},
            "angle": 180.0,
            "field_of_view": 60.0,
            "detection_range": 300.0,
            "label": "Corner Sensor",
            "targets": [{"entity_id": "binary_sensor.mmwave_1", "type": "motion"}],
        }
        mmwave = MmwavePlacement.from_dict(data)
        assert mmwave.id == "mmw_2"
        assert mmwave.position.x == 50
        assert mmwave.position.y == 75
        assert mmwave.angle == 180.0
        assert mmwave.field_of_view == 60.0
        assert mmwave.detection_range == 300.0
        assert mmwave.label == "Corner Sensor"
        assert len(mmwave.targets) == 1

    def test_from_dict_defaults(self):
        """Test deserialization falls back to defaults for missing fields."""
        data = {"id": "mmw_3"}
        mmwave = MmwavePlacement.from_dict(data)
        assert mmwave.floor_plan_id == ""
        assert mmwave.floor_id == ""
        assert mmwave.room_id is None
        assert mmwave.position.x == 0
        assert mmwave.position.y == 0
        assert mmwave.angle == 0.0
        assert mmwave.field_of_view == 120.0
        assert mmwave.detection_range == 500.0
        assert mmwave.label is None
        assert mmwave.targets == []

    def test_legacy_mount_x_mount_y_migration(self):
        """Test from_dict migrates legacy mount_x/mount_y to position."""
        data = {
            "id": "mmw_legacy",
            "floor_plan_id": "fp_1",
            "floor_id": "floor_1",
            "mount_x": 150,
            "mount_y": 250,
            "angle": 90.0,
        }
        mmwave = MmwavePlacement.from_dict(data)
        assert mmwave.position.x == 150
        assert mmwave.position.y == 250

    def test_legacy_mount_partial_x_only(self):
        """Test legacy migration with only mount_x present."""
        data = {
            "id": "mmw_legacy_x",
            "mount_x": 100,
        }
        mmwave = MmwavePlacement.from_dict(data)
        assert mmwave.position.x == 100
        assert mmwave.position.y == 0

    def test_legacy_mount_partial_y_only(self):
        """Test legacy migration with only mount_y present."""
        data = {
            "id": "mmw_legacy_y",
            "mount_y": 200,
        }
        mmwave = MmwavePlacement.from_dict(data)
        assert mmwave.position.x == 0
        assert mmwave.position.y == 200

    def test_position_takes_precedence_over_legacy(self):
        """Test that position field takes precedence over legacy mount_x/mount_y."""
        data = {
            "id": "mmw_both",
            "position": {"x": 500, "y": 600},
            "mount_x": 100,
            "mount_y": 200,
        }
        mmwave = MmwavePlacement.from_dict(data)
        assert mmwave.position.x == 500
        assert mmwave.position.y == 600

    def test_serialization_round_trip(self):
        """Test full serialization and deserialization cycle."""
        original = MmwavePlacement(
            id="mmw_rt",
            floor_plan_id="fp_1",
            floor_id="floor_1",
            room_id="room_1",
            position=Coordinates(123, 456),
            angle=270.0,
            field_of_view=100.0,
            detection_range=350.0,
            label="Test Sensor",
            targets=[
                {"entity_id": "binary_sensor.mmwave_a", "type": "presence"},
                {"entity_id": "binary_sensor.mmwave_b", "type": "motion"},
            ],
        )
        data = original.to_dict()
        restored = MmwavePlacement.from_dict(data)

        assert restored.id == original.id
        assert restored.floor_plan_id == original.floor_plan_id
        assert restored.floor_id == original.floor_id
        assert restored.room_id == original.room_id
        assert restored.position.x == original.position.x
        assert restored.position.y == original.position.y
        assert restored.angle == original.angle
        assert restored.field_of_view == original.field_of_view
        assert restored.detection_range == original.detection_range
        assert restored.label == original.label
        assert restored.targets == original.targets
