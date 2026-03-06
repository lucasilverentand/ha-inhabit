"""Unit tests for FloorPlanStore."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.inhabit.models.automation_rule import (
    RuleAction,
    VisualRule,
)
from custom_components.inhabit.models.device_placement import LightPlacement
from custom_components.inhabit.models.floor_plan import (
    Coordinates,
    Edge,
    Floor,
    FloorPlan,
    Node,
    Polygon,
    Room,
)
from custom_components.inhabit.models.virtual_sensor import (
    SensorBinding,
    VirtualSensorConfig,
)
from custom_components.inhabit.models.zone import Zone
from custom_components.inhabit.store.floor_plan_store import FloorPlanStore


def create_mock_store():
    """Create a mock Store class with proper async methods."""
    mock_store = MagicMock()
    mock_store.async_load = AsyncMock(return_value=None)
    mock_store.async_save = AsyncMock()
    mock_store.async_delay_save = MagicMock()
    return mock_store


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = MagicMock()
    hass.data = {}
    hass.config = MagicMock()
    hass.config.path = lambda *args: "/".join(args)
    return hass


class TestFloorPlanStoreCRUD:
    """Test FloorPlanStore CRUD operations."""

    @pytest.mark.asyncio
    async def test_create_floor_plan(self, mock_hass):
        """Test creating a floor plan."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="Test House"))

            assert fp.id is not None
            assert fp.name == "Test House"
            assert fp.created_at is not None
            assert fp.updated_at is not None

    @pytest.mark.asyncio
    async def test_get_floor_plan(self, mock_hass):
        """Test getting a floor plan."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            created = store.create_floor_plan(FloorPlan(name="Test"))
            retrieved = store.get_floor_plan(created.id)

            assert retrieved is not None
            assert retrieved.name == "Test"

    @pytest.mark.asyncio
    async def test_get_floor_plan_not_found(self, mock_hass):
        """Test getting non-existent floor plan."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            retrieved = store.get_floor_plan("nonexistent")
            assert retrieved is None

    @pytest.mark.asyncio
    async def test_get_floor_plans(self, mock_hass):
        """Test getting all floor plans."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            store.create_floor_plan(FloorPlan(name="House 1"))
            store.create_floor_plan(FloorPlan(name="House 2"))

            plans = store.get_floor_plans()
            assert len(plans) == 2

    @pytest.mark.asyncio
    async def test_update_floor_plan(self, mock_hass):
        """Test updating a floor plan."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            created = store.create_floor_plan(FloorPlan(name="Old Name"))
            created.name = "New Name"
            updated = store.update_floor_plan(created)

            assert updated is not None
            assert updated.name == "New Name"

    @pytest.mark.asyncio
    async def test_delete_floor_plan(self, mock_hass):
        """Test deleting a floor plan."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            created = store.create_floor_plan(FloorPlan(name="To Delete"))
            deleted = store.delete_floor_plan(created.id)

            assert deleted is True
            assert store.get_floor_plan(created.id) is None

    @pytest.mark.asyncio
    async def test_delete_floor_plan_not_found(self, mock_hass):
        """Test deleting non-existent floor plan."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            deleted = store.delete_floor_plan("nonexistent")
            assert deleted is False


class TestFloorOperations:
    """Test floor operations."""

    @pytest.mark.asyncio
    async def test_add_floor(self, mock_hass):
        """Test adding a floor."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))

            assert floor is not None
            assert floor.name == "Ground"

            # Verify it was added
            retrieved = store.get_floor_plan(fp.id)
            assert len(retrieved.floors) == 1

    @pytest.mark.asyncio
    async def test_update_floor(self, mock_hass):
        """Test updating a floor."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))

            floor.name = "First Floor"
            floor.level = 1
            updated = store.update_floor(fp.id, floor)

            assert updated is not None
            assert updated.name == "First Floor"
            assert updated.level == 1

    @pytest.mark.asyncio
    async def test_delete_floor(self, mock_hass):
        """Test deleting a floor."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))

            deleted = store.delete_floor(fp.id, floor.id)
            assert deleted is True

            retrieved = store.get_floor_plan(fp.id)
            assert len(retrieved.floors) == 0


class TestRoomOperations:
    """Test room operations."""

    @pytest.mark.asyncio
    async def test_add_room(self, mock_hass):
        """Test adding a room."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))

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
            added = store.add_room(fp.id, floor.id, room)

            assert added is not None
            assert added.name == "Living Room"
            assert added.floor_id == floor.id

    @pytest.mark.asyncio
    async def test_update_room(self, mock_hass):
        """Test updating a room."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))
            room = store.add_room(
                fp.id,
                floor.id,
                Room(name="Room", polygon=Polygon(vertices=[Coordinates(0, 0)])),
            )

            room.name = "Updated Room"
            room.color = "#ff0000"
            updated = store.update_room(fp.id, room)

            assert updated is not None
            assert updated.name == "Updated Room"
            assert updated.color == "#ff0000"

    @pytest.mark.asyncio
    async def test_delete_room(self, mock_hass):
        """Test deleting a room."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))
            room = store.add_room(
                fp.id,
                floor.id,
                Room(name="Room", polygon=Polygon(vertices=[Coordinates(0, 0)])),
            )

            deleted = store.delete_room(fp.id, room.id)
            assert deleted is True


class TestHaAreaAssignments:
    """Test HA area assignment lookups."""

    @pytest.mark.asyncio
    async def test_find_ha_area_assignment_for_room(self, mock_hass):
        """Find an assignment linked to a room."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))
            store.add_room(
                fp.id,
                floor.id,
                Room(
                    name="Living",
                    polygon=Polygon(vertices=[Coordinates(0, 0)]),
                    ha_area_id="area_living",
                ),
            )

            assignment = store.find_ha_area_assignment(fp.id, "area_living")

            assert assignment is not None
            assert assignment[0] == "room"
            assert assignment[2] == "Living"

    @pytest.mark.asyncio
    async def test_find_ha_area_assignment_for_zone(self, mock_hass):
        """Find an assignment linked to a zone."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))
            store.add_zone(
                fp.id,
                floor.id,
                Zone(
                    name="Kitchen Zone",
                    polygon=Polygon(vertices=[Coordinates(1, 1)]),
                    ha_area_id="area_kitchen",
                ),
            )

            assignment = store.find_ha_area_assignment(fp.id, "area_kitchen")

            assert assignment is not None
            assert assignment[0] == "zone"
            assert assignment[2] == "Kitchen Zone"

    @pytest.mark.asyncio
    async def test_find_ha_area_assignment_excludes_entity(self, mock_hass):
        """Exclude the current room/zone when checking for duplicates."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))
            room = store.add_room(
                fp.id,
                floor.id,
                Room(
                    name="Bedroom",
                    polygon=Polygon(vertices=[Coordinates(2, 2)]),
                    ha_area_id="area_bedroom",
                ),
            )

            assignment = store.find_ha_area_assignment(
                fp.id,
                "area_bedroom",
                exclude_room_id=room.id,
            )

            assert assignment is None


class TestEdgeOperations:
    """Test edge operations."""

    @pytest.mark.asyncio
    async def test_add_wall_edge(self, mock_hass):
        """Test adding a wall edge."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(
                fp.id,
                Floor(
                    name="Ground",
                    level=0,
                    nodes=[Node(id="n1", x=0, y=0), Node(id="n2", x=500, y=0)],
                ),
            )

            edge = Edge(
                start_node="n1",
                end_node="n2",
                type="wall",
                thickness=10,
            )
            added = store.add_edge(fp.id, floor.id, edge)

            assert added is not None
            assert added.thickness == 10
            assert added.type == "wall"

    @pytest.mark.asyncio
    async def test_add_door_edge(self, mock_hass):
        """Test adding a door edge."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(
                fp.id,
                Floor(
                    name="Ground",
                    level=0,
                    nodes=[Node(id="n1", x=0, y=0), Node(id="n2", x=80, y=0)],
                ),
            )

            edge = Edge(
                start_node="n1",
                end_node="n2",
                type="door",
                swing_direction="left",
            )
            added = store.add_edge(fp.id, floor.id, edge)

            assert added is not None
            assert added.type == "door"
            assert added.swing_direction == "left"

    @pytest.mark.asyncio
    async def test_add_window_edge(self, mock_hass):
        """Test adding a window edge."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(
                fp.id,
                Floor(
                    name="Ground",
                    level=0,
                    nodes=[Node(id="n1", x=0, y=0), Node(id="n2", x=120, y=0)],
                ),
            )

            edge = Edge(
                start_node="n1",
                end_node="n2",
                type="window",
                height=100,
            )
            added = store.add_edge(fp.id, floor.id, edge)

            assert added is not None
            assert added.type == "window"
            assert added.height == 100


class TestLightPlacementOperations:
    """Test light placement operations."""

    @pytest.mark.asyncio
    async def test_place_light(self, mock_hass):
        """Test placing a light."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))

            light = LightPlacement(
                entity_id="light.living_room",
                floor_id=floor.id,
                position=Coordinates(250, 200),
            )
            placed = store.place_light(fp.id, light)

            assert placed is not None
            assert placed.entity_id == "light.living_room"

    @pytest.mark.asyncio
    async def test_get_light_placements(self, mock_hass):
        """Test getting light placements."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))

            store.place_light(
                fp.id,
                LightPlacement(
                    entity_id="light.1", floor_id=floor.id, position=Coordinates(0, 0)
                ),
            )
            store.place_light(
                fp.id,
                LightPlacement(
                    entity_id="light.2", floor_id=floor.id, position=Coordinates(100, 0)
                ),
            )

            lights = store.get_light_placements(fp.id)
            assert len(lights) == 2

    @pytest.mark.asyncio
    async def test_remove_light_placement(self, mock_hass):
        """Test removing a light placement."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))
            light = store.place_light(
                fp.id,
                LightPlacement(
                    entity_id="light.test",
                    floor_id=floor.id,
                    position=Coordinates(0, 0),
                ),
            )

            removed = store.remove_light_placement(light.id)
            assert removed is True


class TestSensorConfigOperations:
    """Test sensor config operations."""

    @pytest.mark.asyncio
    async def test_create_sensor_config(self, mock_hass):
        """Test creating sensor config."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            config = VirtualSensorConfig(
                room_id="room_1",
                floor_plan_id="fp_1",
                motion_timeout=120,
                motion_sensors=[
                    SensorBinding(
                        entity_id="binary_sensor.motion",
                        sensor_type="motion",
                        weight=1.0,
                    ),
                ],
            )
            created = store.create_sensor_config(config)

            assert created.room_id == "room_1"
            assert created.motion_timeout == 120

    @pytest.mark.asyncio
    async def test_get_sensor_config(self, mock_hass):
        """Test getting sensor config."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            store.create_sensor_config(
                VirtualSensorConfig(
                    room_id="room_1",
                    floor_plan_id="fp_1",
                )
            )

            retrieved = store.get_sensor_config("room_1")
            assert retrieved is not None

    @pytest.mark.asyncio
    async def test_get_sensor_config_not_found(self, mock_hass):
        """Test getting non-existent sensor config."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            retrieved = store.get_sensor_config("nonexistent")
            assert retrieved is None

    @pytest.mark.asyncio
    async def test_update_sensor_config(self, mock_hass):
        """Test updating sensor config."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            config = store.create_sensor_config(
                VirtualSensorConfig(
                    room_id="room_1",
                    floor_plan_id="fp_1",
                    motion_timeout=60,
                )
            )

            config.motion_timeout = 120
            updated = store.update_sensor_config(config)

            assert updated.motion_timeout == 120

    @pytest.mark.asyncio
    async def test_delete_sensor_config(self, mock_hass):
        """Test deleting sensor config."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            store.create_sensor_config(
                VirtualSensorConfig(
                    room_id="room_1",
                    floor_plan_id="fp_1",
                )
            )

            deleted = store.delete_sensor_config("room_1")
            assert deleted is True

            retrieved = store.get_sensor_config("room_1")
            assert retrieved is None


class TestVisualRuleOperations:
    """Test visual rule operations."""

    @pytest.mark.asyncio
    async def test_create_visual_rule(self, mock_hass):
        """Test creating visual rule."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

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
            created = store.create_visual_rule(rule)

            assert created.name == "Test Rule"

    @pytest.mark.asyncio
    async def test_get_visual_rules(self, mock_hass):
        """Test getting all visual rules."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            store.create_visual_rule(
                VisualRule(
                    name="Rule 1",
                    description="",
                    floor_plan_id="fp_1",
                    trigger_type="room_occupancy",
                    trigger_room_id="room_1",
                    trigger_state="on",
                    conditions=[],
                    actions=[],
                )
            )
            store.create_visual_rule(
                VisualRule(
                    name="Rule 2",
                    description="",
                    floor_plan_id="fp_1",
                    trigger_type="room_occupancy",
                    trigger_room_id="room_2",
                    trigger_state="off",
                    conditions=[],
                    actions=[],
                )
            )

            rules = store.get_visual_rules("fp_1")
            assert len(rules) == 2

    @pytest.mark.asyncio
    async def test_delete_visual_rule(self, mock_hass):
        """Test deleting visual rule."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            rule = store.create_visual_rule(
                VisualRule(
                    name="To Delete",
                    description="",
                    floor_plan_id="fp_1",
                    trigger_type="room_occupancy",
                    trigger_room_id="room_1",
                    trigger_state="on",
                    conditions=[],
                    actions=[],
                )
            )

            deleted = store.delete_visual_rule(rule.id)
            assert deleted is True


class TestStorePersistence:
    """Test store persistence."""

    @pytest.mark.asyncio
    async def test_async_save(self, mock_hass):
        """Test async save."""
        mock_store = create_mock_store()

        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=mock_store,
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            store.create_floor_plan(FloorPlan(name="Test"))
            await store.async_save()

            mock_store.async_save.assert_called()

    @pytest.mark.asyncio
    async def test_async_delay_save(self, mock_hass):
        """Test async delay save."""
        mock_store = create_mock_store()

        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=mock_store,
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            store.create_floor_plan(FloorPlan(name="Test"))
            store.async_delay_save()

            mock_store.async_delay_save.assert_called()

    @pytest.mark.asyncio
    async def test_load_existing_data(self, mock_hass):
        """Test loading existing data."""
        existing_data = {
            "floor_plans": {
                "fp_1": {
                    "id": "fp_1",
                    "name": "Existing House",
                    "floors": [],
                    "unit": "cm",
                    "grid_size": 10,
                }
            },
            "device_placements": {},
            "sensor_configs": {},
            "visual_rules": {},
        }

        mock_store = create_mock_store()
        mock_store.async_load = AsyncMock(return_value=existing_data)

        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=mock_store,
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            plans = store.get_floor_plans()
            assert len(plans) == 1
            assert plans[0].name == "Existing House"
