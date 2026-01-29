"""Pytest configuration and fixtures for Inhabit tests."""
from __future__ import annotations

import sys
from collections.abc import Generator
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Try to import homeassistant, mock if not available
try:
    from homeassistant.const import STATE_OFF, STATE_ON
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.storage import Store
    HAS_HOMEASSISTANT = True
except ImportError:
    HAS_HOMEASSISTANT = False
    STATE_ON = "on"
    STATE_OFF = "off"
    HomeAssistant = MagicMock
    Store = MagicMock

    # Mock homeassistant modules
    sys.modules["homeassistant"] = MagicMock()
    sys.modules["homeassistant.core"] = MagicMock()
    sys.modules["homeassistant.const"] = MagicMock()
    sys.modules["homeassistant.const"].STATE_ON = STATE_ON
    sys.modules["homeassistant.const"].STATE_OFF = STATE_OFF
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


@pytest.fixture
def hass() -> Generator[Any, None, None]:
    """Create a mock Home Assistant instance."""
    hass = MagicMock()
    hass.data = {}
    hass.states = MagicMock()
    hass.loop = MagicMock()
    hass.config = MagicMock()
    hass.config.path = lambda *args: "/".join(args)
    hass.async_add_executor_job = AsyncMock(side_effect=lambda f, *a: f(*a))

    # Mock call_later for timers
    def mock_call_later(delay, callback):
        cancel = MagicMock()
        return cancel

    hass.loop.call_later = mock_call_later

    yield hass


@pytest.fixture
def sample_floor_plan() -> FloorPlan:
    """Create a sample floor plan for testing."""
    living_room = Room(
        id="room_living",
        name="Living Room",
        polygon=Polygon(
            vertices=[
                Coordinates(0, 0),
                Coordinates(500, 0),
                Coordinates(500, 400),
                Coordinates(0, 400),
            ]
        ),
        floor_id="floor_ground",
        color="#e8f5e9",
        occupancy_sensor_enabled=True,
        motion_timeout=120,
        checking_timeout=30,
    )

    kitchen = Room(
        id="room_kitchen",
        name="Kitchen",
        polygon=Polygon(
            vertices=[
                Coordinates(500, 0),
                Coordinates(800, 0),
                Coordinates(800, 300),
                Coordinates(500, 300),
            ]
        ),
        floor_id="floor_ground",
        color="#fff3e0",
        occupancy_sensor_enabled=True,
        motion_timeout=90,
        checking_timeout=20,
    )

    hallway = Room(
        id="room_hallway",
        name="Hallway",
        polygon=Polygon(
            vertices=[
                Coordinates(0, 400),
                Coordinates(200, 400),
                Coordinates(200, 600),
                Coordinates(0, 600),
            ]
        ),
        floor_id="floor_ground",
        color="#e0e0e0",
        occupancy_sensor_enabled=True,
        motion_timeout=60,
        checking_timeout=15,
    )

    ground_floor = Floor(
        id="floor_ground",
        name="Ground Floor",
        level=0,
        rooms=[living_room, kitchen, hallway],
    )

    bedroom = Room(
        id="room_bedroom",
        name="Master Bedroom",
        polygon=Polygon(
            vertices=[
                Coordinates(0, 0),
                Coordinates(400, 0),
                Coordinates(400, 350),
                Coordinates(0, 350),
            ]
        ),
        floor_id="floor_first",
        color="#e3f2fd",
        occupancy_sensor_enabled=True,
        motion_timeout=180,
        checking_timeout=60,
    )

    first_floor = Floor(
        id="floor_first",
        name="First Floor",
        level=1,
        rooms=[bedroom],
    )

    return FloorPlan(
        id="fp_main",
        name="Main House",
        created_at="2024-01-01T00:00:00",
        updated_at="2024-01-01T00:00:00",
        unit="cm",
        grid_size=10,
        floors=[ground_floor, first_floor],
    )


@pytest.fixture
def sample_sensor_config() -> VirtualSensorConfig:
    """Create a sample sensor configuration."""
    return VirtualSensorConfig(
        room_id="room_living",
        floor_plan_id="fp_main",
        enabled=True,
        motion_timeout=120,
        checking_timeout=30,
        presence_timeout=300,
        motion_sensors=[
            SensorBinding(
                entity_id="binary_sensor.living_room_motion",
                sensor_type="motion",
                weight=1.0,
            ),
        ],
        presence_sensors=[
            SensorBinding(
                entity_id="binary_sensor.living_room_presence",
                sensor_type="presence",
                weight=1.5,
            ),
        ],
        door_sensors=[
            SensorBinding(
                entity_id="binary_sensor.living_room_door",
                sensor_type="door",
                weight=1.0,
            ),
        ],
        door_blocks_vacancy=True,
        door_open_resets_checking=True,
    )


@pytest.fixture
def mock_entity_states() -> dict[str, Any]:
    """Create mock entity states for testing."""
    return {
        "binary_sensor.living_room_motion": MagicMock(state=STATE_OFF),
        "binary_sensor.living_room_presence": MagicMock(state=STATE_OFF),
        "binary_sensor.living_room_door": MagicMock(state=STATE_OFF),
        "binary_sensor.kitchen_motion": MagicMock(state=STATE_OFF),
        "binary_sensor.hallway_motion": MagicMock(state=STATE_OFF),
        "binary_sensor.bedroom_motion": MagicMock(state=STATE_OFF),
        "light.living_room": MagicMock(state=STATE_OFF),
        "light.kitchen": MagicMock(state=STATE_OFF),
        "climate.living_room": MagicMock(state="heat"),
    }
