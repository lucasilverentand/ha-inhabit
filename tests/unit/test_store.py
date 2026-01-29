"""Unit tests for FloorPlanStore."""
from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.inhabit.models.floor_plan import (
    Coordinates,
    Door,
    Floor,
    FloorPlan,
    Polygon,
    Room,
    Wall,
    Window,
)
from custom_components.inhabit.models.device_placement import DevicePlacement
from custom_components.inhabit.models.virtual_sensor import (
    SensorBinding,
    VirtualSensorConfig,
)
from custom_components.inhabit.models.automation_rule import (
    RuleAction,
    VisualRule,
)
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
                polygon=Polygon(vertices=[
                    Coordinates(0, 0),
                    Coordinates(500, 0),
                    Coordinates(500, 400),
                    Coordinates(0, 400),
                ]),
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
                fp.id, floor.id,
                Room(name="Room", polygon=Polygon(vertices=[Coordinates(0, 0)]))
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
                fp.id, floor.id,
                Room(name="Room", polygon=Polygon(vertices=[Coordinates(0, 0)]))
            )

            deleted = store.delete_room(fp.id, room.id)
            assert deleted is True


class TestWallOperations:
    """Test wall operations."""

    @pytest.mark.asyncio
    async def test_add_wall(self, mock_hass):
        """Test adding a wall."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))

            wall = Wall(
                start=Coordinates(0, 0),
                end=Coordinates(500, 0),
                thickness=10,
            )
            added = store.add_wall(fp.id, floor.id, wall)

            assert added is not None
            assert added.thickness == 10


class TestDoorOperations:
    """Test door operations."""

    @pytest.mark.asyncio
    async def test_add_door(self, mock_hass):
        """Test adding a door."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))
            wall = store.add_wall(
                fp.id, floor.id,
                Wall(start=Coordinates(0, 0), end=Coordinates(500, 0))
            )

            door = Door(
                position=Coordinates(100, 0),
                width=80,
                wall_id=wall.id,
            )
            added = store.add_door(fp.id, floor.id, door)

            assert added is not None
            assert added.width == 80


class TestWindowOperations:
    """Test window operations."""

    @pytest.mark.asyncio
    async def test_add_window(self, mock_hass):
        """Test adding a window."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))
            wall = store.add_wall(
                fp.id, floor.id,
                Wall(start=Coordinates(0, 0), end=Coordinates(500, 0))
            )

            window = Window(
                position=Coordinates(200, 0),
                width=120,
                height=100,
                wall_id=wall.id,
            )
            added = store.add_window(fp.id, floor.id, window)

            assert added is not None
            assert added.width == 120


class TestDevicePlacementOperations:
    """Test device placement operations."""

    @pytest.mark.asyncio
    async def test_place_device(self, mock_hass):
        """Test placing a device."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))

            device = DevicePlacement(
                entity_id="light.living_room",
                floor_id=floor.id,
                position=Coordinates(250, 200),
            )
            placed = store.place_device(fp.id, device)

            assert placed is not None
            assert placed.entity_id == "light.living_room"

    @pytest.mark.asyncio
    async def test_get_device_placements(self, mock_hass):
        """Test getting device placements."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))

            store.place_device(fp.id, DevicePlacement(
                entity_id="light.1", floor_id=floor.id, position=Coordinates(0, 0)
            ))
            store.place_device(fp.id, DevicePlacement(
                entity_id="light.2", floor_id=floor.id, position=Coordinates(100, 0)
            ))

            collection = store.get_device_placements(fp.id)
            assert len(collection.devices) == 2

    @pytest.mark.asyncio
    async def test_update_device_placement(self, mock_hass):
        """Test updating a device placement."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))
            device = store.place_device(fp.id, DevicePlacement(
                entity_id="light.test", floor_id=floor.id, position=Coordinates(0, 0)
            ))

            device.position = Coordinates(100, 100)
            device.rotation = 45
            updated = store.update_device_placement(fp.id, device)

            assert updated.position.x == 100
            assert updated.rotation == 45

    @pytest.mark.asyncio
    async def test_remove_device_placement(self, mock_hass):
        """Test removing a device placement."""
        with patch(
            "custom_components.inhabit.store.floor_plan_store.Store",
            return_value=create_mock_store(),
        ):
            store = FloorPlanStore(mock_hass)
            await store.async_load()

            fp = store.create_floor_plan(FloorPlan(name="House"))
            floor = store.add_floor(fp.id, Floor(name="Ground", level=0))
            device = store.place_device(fp.id, DevicePlacement(
                entity_id="light.test", floor_id=floor.id, position=Coordinates(0, 0)
            ))

            removed = store.remove_device_placement(fp.id, device.id)
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

            store.create_sensor_config(VirtualSensorConfig(
                room_id="room_1",
                floor_plan_id="fp_1",
            ))

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

            config = store.create_sensor_config(VirtualSensorConfig(
                room_id="room_1",
                floor_plan_id="fp_1",
                motion_timeout=60,
            ))

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

            store.create_sensor_config(VirtualSensorConfig(
                room_id="room_1",
                floor_plan_id="fp_1",
            ))

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

            store.create_visual_rule(VisualRule(
                name="Rule 1",
                description="",
                floor_plan_id="fp_1",
                trigger_type="room_occupancy",
                trigger_room_id="room_1",
                trigger_state="on",
                conditions=[],
                actions=[],
            ))
            store.create_visual_rule(VisualRule(
                name="Rule 2",
                description="",
                floor_plan_id="fp_1",
                trigger_type="room_occupancy",
                trigger_room_id="room_2",
                trigger_state="off",
                conditions=[],
                actions=[],
            ))

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

            rule = store.create_visual_rule(VisualRule(
                name="To Delete",
                description="",
                floor_plan_id="fp_1",
                trigger_type="room_occupancy",
                trigger_room_id="room_1",
                trigger_state="on",
                conditions=[],
                actions=[],
            ))

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
