"""Pytest configuration and fixtures for Inhabit tests."""

from __future__ import annotations

import sys
from collections.abc import Generator
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

# Mock homeassistant if not installed (allows running standalone tests)
if "homeassistant" not in sys.modules:
    sys.modules["homeassistant"] = MagicMock()
    _core_mock = MagicMock()
    # callback decorator must be a pass-through, not a MagicMock wrapper
    _core_mock.callback = lambda fn: fn
    sys.modules["homeassistant.core"] = _core_mock
    _const_mock = MagicMock()
    _const_mock.STATE_ON = "on"
    _const_mock.STATE_OFF = "off"
    _const_mock.STATE_UNAVAILABLE = "unavailable"
    _const_mock.STATE_UNKNOWN = "unknown"
    sys.modules["homeassistant.const"] = _const_mock

    # ConfigFlow needs to be a real class so InhabitConfigFlow can inherit from it
    class _ConfigFlow:
        """Stub ConfigFlow that accepts domain= in subclass definitions."""

        def __init_subclass__(cls, *, domain: str = "", **kwargs: Any) -> None:
            super().__init_subclass__(**kwargs)

    _config_entries_mock = MagicMock()
    _config_entries_mock.ConfigFlow = _ConfigFlow
    sys.modules["homeassistant.config_entries"] = _config_entries_mock
    sys.modules["homeassistant.helpers"] = MagicMock()
    sys.modules["homeassistant.helpers.storage"] = MagicMock()
    sys.modules["homeassistant.helpers.event"] = MagicMock()
    sys.modules["homeassistant.helpers.dispatcher"] = MagicMock()
    sys.modules["homeassistant.helpers.entity"] = MagicMock()
    sys.modules["homeassistant.helpers.entity_platform"] = MagicMock()
    sys.modules["homeassistant.helpers.typing"] = MagicMock()
    sys.modules["homeassistant.components"] = MagicMock()
    sys.modules["homeassistant.components.frontend"] = MagicMock()
    sys.modules["homeassistant.components.websocket_api"] = MagicMock()
    sys.modules["homeassistant.components.http"] = MagicMock()
    sys.modules["homeassistant.components.binary_sensor"] = MagicMock()
    sys.modules["homeassistant.components.button"] = MagicMock()
    sys.modules["homeassistant.helpers.entity_registry"] = MagicMock()

    # data_entry_flow needs real AbortFlow / FlowResultType for config flow tests
    import enum as _enum

    class _FlowResultType(str, _enum.Enum):
        FORM = "form"
        CREATE_ENTRY = "create_entry"
        ABORT = "abort"

    class _AbortFlow(Exception):
        def __init__(self, reason: str) -> None:
            self.reason = reason
            super().__init__(reason)

    _def_mock = MagicMock()
    _def_mock.AbortFlow = _AbortFlow
    _def_mock.FlowResultType = _FlowResultType
    _def_mock.FlowResult = dict
    sys.modules["homeassistant.data_entry_flow"] = _def_mock

    sys.modules["aiohttp"] = MagicMock()
    sys.modules["aiohttp.web"] = MagicMock()

from homeassistant.const import STATE_OFF

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
def mock_hass() -> Generator[Any, None, None]:
    """Create a mock Home Assistant instance for unit tests."""
    hass = MagicMock()
    hass.data = {}
    hass.states = MagicMock()
    hass.loop = MagicMock()
    hass.config = MagicMock()
    hass.config.path = lambda *args: "/".join(args)
    hass.async_add_executor_job = AsyncMock(side_effect=lambda f, *a: f(*a))
    hass.async_create_task = AsyncMock()

    # Event bus with tracking
    hass.bus = MagicMock()
    hass._fired_events: list[dict[str, Any]] = []

    def mock_fire(event_type: str, data: dict | None = None) -> None:
        hass._fired_events.append({"type": event_type, "data": data or {}})

    hass.bus.async_fire = mock_fire

    # Mock call_later for timers with callback tracking
    hass._scheduled_callbacks: list[tuple] = []

    def mock_call_later(delay, callback):
        cancel = MagicMock()
        hass._scheduled_callbacks.append((delay, callback, cancel))
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
