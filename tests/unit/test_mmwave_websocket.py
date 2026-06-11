"""Tests for mmWave websocket calibration handlers."""

from __future__ import annotations

import importlib
import sys
import types
from unittest.mock import MagicMock

websocket_api = sys.modules["homeassistant.components.websocket_api"]
sys.modules["homeassistant.core"].callback = lambda fn: fn
sys.modules.setdefault("homeassistant.helpers.device_registry", MagicMock())
websocket_api.websocket_command = lambda _schema: lambda fn: fn
components_module = types.ModuleType("homeassistant.components")
components_module.websocket_api = websocket_api
components_module.frontend = sys.modules["homeassistant.components.frontend"]
sys.modules["homeassistant.components"] = components_module

mmwave_ws = importlib.import_module("custom_components.inhabit.api.websocket.mmwave")
mmwave_ws = importlib.reload(mmwave_ws)
from custom_components.inhabit.const import DOMAIN  # noqa: E402
from custom_components.inhabit.models.floor_plan import (  # noqa: E402
    Coordinates,
    FloorPlan,
)
from custom_components.inhabit.models.mmwave_sensor import (  # noqa: E402
    MmwavePlacement,
)


def _connection() -> MagicMock:
    connection = MagicMock()
    connection.user.is_admin = True
    return connection


def _hass_with_store(store: MagicMock) -> MagicMock:
    processor = MagicMock()
    hass = MagicMock()
    hass.data = {DOMAIN: {"store": store, "mmwave_processor": processor}}
    return hass


def test_expected_raw_for_map_point_uses_inverse_transform():
    """Known map point is converted back to raw sensor coordinates."""
    placement = MmwavePlacement(
        position=Coordinates(x=250, y=250),
        angle=0,
    )

    raw = mmwave_ws._expected_raw_for_map_point(
        placement, Coordinates(x=350, y=300), scale=0.1
    )

    assert raw.x == 500
    assert raw.y == 1000


def test_valid_calibration_samples_filters_bad_and_zero_values():
    """Only finite non-zero numeric samples are accepted."""
    samples = mmwave_ws._valid_calibration_samples(
        [
            {"x": "520", "y": "1030"},
            {"x": 0, "y": 0},
            {"x": "nan", "y": 1},
            {"x": "bad", "y": 1},
            {},
        ]
    )

    assert len(samples) == 1
    assert samples[0].x == 520
    assert samples[0].y == 1030


def test_calibrate_command_computes_and_saves_bias():
    """Calibration command persists bias, jitter, and sample diagnostics."""
    placement = MmwavePlacement(
        id="p1",
        floor_plan_id="fp1",
        floor_id="floor1",
        position=Coordinates(x=250, y=250),
        angle=0,
        targets=[{"x_entity_id": "sensor.x", "y_entity_id": "sensor.y"}],
    )
    store = MagicMock()
    store.get_mmwave_placement.return_value = placement
    store.get_floor_plan.return_value = FloorPlan(id="fp1", unit="cm")
    store.update_mmwave_placement.side_effect = lambda p: p
    hass = _hass_with_store(store)
    connection = _connection()

    mmwave_ws.ws_mmwave_calibrate(
        hass,
        connection,
        {
            "id": 1,
            "type": "inhabit/mmwave/calibrate",
            "placement_id": "p1",
            "target_index": 0,
            "map_point": {"x": 350, "y": 300},
            "samples": [{"x": 520, "y": 1030} for _ in range(10)],
        },
    )

    saved = store.update_mmwave_placement.call_args[0][0]
    assert saved.calibration is not None
    assert saved.calibration.raw_mean.x == 520
    assert saved.calibration.raw_mean.y == 1030
    assert saved.calibration.raw_bias.x == 20
    assert saved.calibration.raw_bias.y == 30
    assert saved.calibration.sample_count == 10
    assert saved.calibration.jitter_radius == 0
    connection.send_result.assert_called_once()
    connection.send_error.assert_not_called()
    hass.async_create_task.assert_called_once()


def test_calibrate_command_rejects_invalid_target():
    """Calibration rejects target indexes not present on the placement."""
    placement = MmwavePlacement(id="p1", targets=[])
    store = MagicMock()
    store.get_mmwave_placement.return_value = placement
    hass = _hass_with_store(store)
    connection = _connection()

    mmwave_ws.ws_mmwave_calibrate(
        hass,
        connection,
        {
            "id": 1,
            "type": "inhabit/mmwave/calibrate",
            "placement_id": "p1",
            "target_index": 0,
            "map_point": {"x": 350, "y": 300},
            "samples": [{"x": 520, "y": 1030} for _ in range(10)],
        },
    )

    connection.send_error.assert_called_once_with(
        1, "invalid_target", "Target index is invalid"
    )
    store.update_mmwave_placement.assert_not_called()


def test_calibrate_command_rejects_too_few_valid_samples():
    """Calibration rejects zero-only or too-short samples."""
    placement = MmwavePlacement(
        id="p1",
        targets=[{"x_entity_id": "sensor.x", "y_entity_id": "sensor.y"}],
    )
    store = MagicMock()
    store.get_mmwave_placement.return_value = placement
    hass = _hass_with_store(store)
    connection = _connection()

    mmwave_ws.ws_mmwave_calibrate(
        hass,
        connection,
        {
            "id": 1,
            "type": "inhabit/mmwave/calibrate",
            "placement_id": "p1",
            "target_index": 0,
            "map_point": {"x": 350, "y": 300},
            "samples": [{"x": 0, "y": 0} for _ in range(10)],
        },
    )

    args = connection.send_error.call_args[0]
    assert args[0] == 1
    assert args[1] == "invalid_samples"
    store.update_mmwave_placement.assert_not_called()


def test_clear_calibration_command_removes_saved_calibration():
    """Clear command removes calibration and refreshes the processor."""
    placement = MmwavePlacement(
        id="p1",
        targets=[{"x_entity_id": "sensor.x", "y_entity_id": "sensor.y"}],
    )
    placement.calibration = MagicMock()
    store = MagicMock()
    store.get_mmwave_placement.return_value = placement
    store.update_mmwave_placement.side_effect = lambda p: p
    hass = _hass_with_store(store)
    connection = _connection()

    mmwave_ws.ws_mmwave_clear_calibration(
        hass,
        connection,
        {
            "id": 1,
            "type": "inhabit/mmwave/clear_calibration",
            "placement_id": "p1",
        },
    )

    saved = store.update_mmwave_placement.call_args[0][0]
    assert saved.calibration is None
    connection.send_result.assert_called_once()
    connection.send_error.assert_not_called()
    hass.async_create_task.assert_called_once()
