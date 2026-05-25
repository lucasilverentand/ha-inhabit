"""Tests for floor import/export websocket handlers."""

from __future__ import annotations

import sys
import types
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

websocket_api = sys.modules["homeassistant.components.websocket_api"]
sys.modules.setdefault("homeassistant.helpers.device_registry", MagicMock())
websocket_api.websocket_command = lambda _schema: lambda fn: fn
components_module = types.ModuleType("homeassistant.components")
components_module.websocket_api = websocket_api
components_module.frontend = sys.modules["homeassistant.components.frontend"]
sys.modules["homeassistant.components"] = components_module

from custom_components.inhabit.api.websocket.floors import (  # noqa: E402
    _build_floor_export,
    _import_floor_data,
)
from custom_components.inhabit.const import DOMAIN  # noqa: E402
from custom_components.inhabit.models.device_placement import (  # noqa: E402
    ButtonPlacement,
    LightPlacement,
    OtherPlacement,
    SwitchPlacement,
)
from custom_components.inhabit.models.floor_plan import (  # noqa: E402
    Coordinates,
    Floor,
    FloorPlan,
    Polygon,
    Room,
)
from custom_components.inhabit.models.mmwave_sensor import MmwavePlacement  # noqa: E402
from custom_components.inhabit.models.virtual_sensor import (  # noqa: E402
    SensorBinding,
    VirtualSensorConfig,
)
from custom_components.inhabit.models.zone import Zone  # noqa: E402
from custom_components.inhabit.store.floor_plan_store import (  # noqa: E402
    FloorPlanStore,
)


def _mock_storage() -> MagicMock:
    storage = MagicMock()
    storage.async_load = AsyncMock(return_value=None)
    storage.async_save = AsyncMock()
    storage.async_delay_save = MagicMock()
    return storage


def _square() -> Polygon:
    return Polygon(
        vertices=[
            Coordinates(0, 0),
            Coordinates(100, 0),
            Coordinates(100, 100),
            Coordinates(0, 100),
        ]
    )


@pytest.mark.asyncio
async def test_floor_export_import_round_trips_all_placement_and_config_types(
    mock_hass,
):
    """Export and import all floor-scoped placement/config buckets."""
    with patch(
        "custom_components.inhabit.store.floor_plan_store.Store",
        return_value=_mock_storage(),
    ):
        store = FloorPlanStore(mock_hass)
        await store.async_load()

    source_floor = Floor(
        id="floor_source",
        name="Ground",
        level=0,
        rooms=[
            Room(
                id="room_living",
                name="Living",
                floor_id="floor_source",
                polygon=_square(),
            )
        ],
        zones=[
            Zone(
                id="zone_sofa",
                name="Sofa",
                floor_id="floor_source",
                room_id="room_living",
                polygon=_square(),
                occupancy_sensor_enabled=True,
            )
        ],
    )
    store.create_floor_plan(
        FloorPlan(id="fp_source", name="Source", floors=[source_floor])
    )
    store.create_floor_plan(FloorPlan(id="fp_target", name="Target"))

    store.place_light(
        "fp_source",
        LightPlacement(
            id="light_1",
            entity_id="light.living",
            floor_id="floor_source",
            room_id="room_living",
            position=Coordinates(10, 20),
            label="Ceiling",
        ),
    )
    store.place_switch(
        "fp_source",
        SwitchPlacement(
            id="switch_1",
            entity_id="switch.fan",
            floor_id="floor_source",
            room_id="room_living",
            position=Coordinates(20, 30),
        ),
    )
    store.place_button(
        "fp_source",
        ButtonPlacement(
            id="button_1",
            entity_id="button.scene",
            floor_id="floor_source",
            room_id="zone_sofa",
            position=Coordinates(30, 40),
        ),
    )
    store.place_other(
        "fp_source",
        OtherPlacement(
            id="other_1",
            entity_id="climate.living",
            floor_id="floor_source",
            room_id="room_living",
            position=Coordinates(40, 50),
        ),
    )
    store.create_mmwave_placement(
        MmwavePlacement(
            id="mmwave_1",
            floor_plan_id="fp_source",
            floor_id="floor_source",
            room_id="zone_sofa",
            position=Coordinates(50, 60),
            angle=45,
            field_of_view=90,
            detection_range=350,
            targets=[
                {
                    "x_entity_id": "sensor.mmwave_target_x",
                    "y_entity_id": "sensor.mmwave_target_y",
                }
            ],
        )
    )
    store.create_sensor_config(
        VirtualSensorConfig(
            room_id="room_living",
            floor_plan_id="fp_source",
            motion_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.living_motion",
                    sensor_type="motion",
                )
            ],
        )
    )
    store.create_sensor_config(
        VirtualSensorConfig(
            room_id="zone_sofa",
            floor_plan_id="fp_source",
            presence_affects=True,
            occupies_parent=True,
            parent_room_id="room_living",
            presence_sensors=[
                SensorBinding(
                    entity_id="binary_sensor.sofa_presence",
                    sensor_type="presence",
                )
            ],
        )
    )

    mock_hass.data[DOMAIN] = {"store": store}

    exported = _build_floor_export(store, "fp_source", source_floor)

    assert len(exported["lights"]) == 1
    assert len(exported["switches"]) == 1
    assert len(exported["buttons"]) == 1
    assert len(exported["others"]) == 1
    assert len(exported["mmwave_placements"]) == 1
    assert {cfg["room_id"] for cfg in exported["sensor_configs"]} == {
        "room_living",
        "zone_sofa",
    }

    imported = _import_floor_data(store, "fp_target", exported)
    assert imported is not None

    imported_floor = imported.to_dict()
    imported_floor_id = imported.id
    imported_room_id = imported.rooms[0].id
    imported_zone_id = imported.zones[0].id

    assert imported_floor_id != "floor_source"
    assert imported_room_id != "room_living"
    assert imported_zone_id != "zone_sofa"
    assert imported_floor["zones"][0]["room_id"] == imported_room_id

    assert store.get_light_placements("fp_target")[0].floor_id == imported_floor_id
    assert store.get_light_placements("fp_target")[0].room_id == imported_room_id
    assert store.get_switch_placements("fp_target")[0].room_id == imported_room_id
    assert store.get_button_placements("fp_target")[0].room_id == imported_zone_id
    assert store.get_other_placements("fp_target")[0].room_id == imported_room_id

    imported_mmwave = store.get_mmwave_placements("fp_target")[0]
    assert imported_mmwave.floor_plan_id == "fp_target"
    assert imported_mmwave.floor_id == imported_floor_id
    assert imported_mmwave.room_id == imported_zone_id
    assert imported_mmwave.targets == [
        {
            "x_entity_id": "sensor.mmwave_target_x",
            "y_entity_id": "sensor.mmwave_target_y",
        }
    ]

    room_config = store.get_sensor_config(imported_room_id)
    zone_config = store.get_sensor_config(imported_zone_id)
    assert room_config is not None
    assert zone_config is not None
    assert room_config.floor_plan_id == "fp_target"
    assert zone_config.floor_plan_id == "fp_target"
    assert zone_config.parent_room_id == imported_room_id
    assert zone_config.presence_sensors[0].entity_id == "binary_sensor.sofa_presence"
