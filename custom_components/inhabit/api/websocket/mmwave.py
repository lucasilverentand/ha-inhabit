"""WebSocket handlers for mmWave sensor placement operations."""

from __future__ import annotations

import math
from datetime import UTC, datetime
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...engine.mmwave_target_processor import MmwaveTargetProcessor
from ...models.floor_plan import Coordinates
from ...models.mmwave_sensor import MmwaveCalibration, MmwavePlacement
from ._helpers import _require_admin, _validate_placement_location

MIN_CALIBRATION_SAMPLES = 10


def register(hass: HomeAssistant) -> None:
    """Register mmWave WebSocket commands."""
    websocket_api.async_register_command(hass, ws_mmwave_place)
    websocket_api.async_register_command(hass, ws_mmwave_update)
    websocket_api.async_register_command(hass, ws_mmwave_delete)
    websocket_api.async_register_command(hass, ws_mmwave_list)
    websocket_api.async_register_command(hass, ws_mmwave_calibrate)
    websocket_api.async_register_command(hass, ws_mmwave_clear_calibration)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/mmwave/place",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("angle", default=0.0): vol.Coerce(float),
        vol.Optional("field_of_view", default=120.0): vol.Coerce(float),
        vol.Optional("detection_range", default=500.0): vol.Coerce(float),
        vol.Optional("label"): vol.Any(str, None),
        vol.Optional("targets", default=[]): list,
    }
)
@callback
def ws_mmwave_place(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Place an mmWave sensor freely on the canvas."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if not _validate_placement_location(connection, msg, store):
        return
    placement = MmwavePlacement(
        floor_plan_id=msg["floor_plan_id"],
        floor_id=msg["floor_id"],
        room_id=msg.get("room_id"),
        position=Coordinates.from_dict(msg["position"]),
        angle=msg["angle"],
        field_of_view=msg["field_of_view"],
        detection_range=msg["detection_range"],
        label=msg.get("label"),
        targets=msg.get("targets", []),
    )
    result = store.create_mmwave_placement(placement)

    # Notify the processor so it subscribes to entity states immediately
    processor: MmwaveTargetProcessor = hass.data[DOMAIN]["mmwave_processor"]
    hass.async_create_task(processor.async_add_placement(result))

    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/mmwave/update",
        vol.Required("placement_id"): str,
        vol.Optional("position"): dict,
        vol.Optional("angle"): vol.Coerce(float),
        vol.Optional("field_of_view"): vol.Coerce(float),
        vol.Optional("detection_range"): vol.Coerce(float),
        vol.Optional("label"): vol.Any(str, None),
        vol.Optional("targets"): list,
    }
)
@callback
def ws_mmwave_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update an mmWave placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    placement = store.get_mmwave_placement(msg["placement_id"])
    if not placement:
        connection.send_error(msg["id"], "not_found", "mmWave placement not found")
        return

    if "position" in msg:
        placement.position = Coordinates.from_dict(msg["position"])
    if "angle" in msg:
        placement.angle = msg["angle"]
    if "field_of_view" in msg:
        placement.field_of_view = msg["field_of_view"]
    if "detection_range" in msg:
        placement.detection_range = msg["detection_range"]
    if "label" in msg:
        placement.label = msg["label"]
    if "targets" in msg:
        placement.targets = msg["targets"]

    result = store.update_mmwave_placement(placement)
    if result:
        # Notify the processor so it re-subscribes with updated config
        processor: MmwaveTargetProcessor = hass.data[DOMAIN]["mmwave_processor"]
        hass.async_create_task(processor.async_update_placement(result))

        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(
            msg["id"], "update_failed", "Failed to update mmWave placement"
        )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/mmwave/delete",
        vol.Required("placement_id"): str,
    }
)
@callback
def ws_mmwave_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete an mmWave placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if store.delete_mmwave_placement(msg["placement_id"]):
        # Notify the processor so it unsubscribes from entity states
        processor: MmwaveTargetProcessor = hass.data[DOMAIN]["mmwave_processor"]
        hass.async_create_task(processor.async_remove_placement(msg["placement_id"]))

        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "mmWave placement not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/mmwave/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_mmwave_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all mmWave placements for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    placements = store.get_mmwave_placements(msg["floor_plan_id"])
    connection.send_result(msg["id"], [p.to_dict() for p in placements])


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/mmwave/calibrate",
        vol.Required("placement_id"): str,
        vol.Required("target_index"): vol.Coerce(int),
        vol.Required("map_point"): dict,
        vol.Required("samples"): list,
    }
)
@callback
def ws_mmwave_calibrate(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Calibrate a placement from one known map point and sampled raw x/y data."""
    if not _require_admin(connection, msg):
        return

    store = hass.data[DOMAIN]["store"]
    placement = store.get_mmwave_placement(msg["placement_id"])
    if not placement:
        connection.send_error(msg["id"], "not_found", "mmWave placement not found")
        return

    target_index = msg["target_index"]
    if target_index < 0 or target_index >= len(placement.targets):
        connection.send_error(msg["id"], "invalid_target", "Target index is invalid")
        return

    samples = _valid_calibration_samples(msg.get("samples", []))
    if len(samples) < MIN_CALIBRATION_SAMPLES:
        connection.send_error(
            msg["id"],
            "invalid_samples",
            f"At least {MIN_CALIBRATION_SAMPLES} non-zero numeric samples are required",
        )
        return

    map_point = Coordinates.from_dict(msg["map_point"])
    scale = _get_mm_to_unit_scale(store, placement.floor_plan_id)
    expected_raw = _expected_raw_for_map_point(placement, map_point, scale)
    raw_mean = _mean(samples)
    raw_stddev = _stddev(samples, raw_mean)
    raw_bias = Coordinates(
        x=raw_mean.x - expected_raw.x,
        y=raw_mean.y - expected_raw.y,
    )
    jitter_radius = math.hypot(raw_stddev.x, raw_stddev.y) * scale * 2

    placement.calibration = MmwaveCalibration(
        enabled=True,
        target_index=target_index,
        map_point=map_point,
        raw_mean=raw_mean,
        raw_stddev=raw_stddev,
        raw_bias=raw_bias,
        jitter_radius=jitter_radius,
        sample_count=len(samples),
        calibrated_at=datetime.now(UTC).isoformat(),
    )

    result = store.update_mmwave_placement(placement)
    if not result:
        connection.send_error(
            msg["id"], "update_failed", "Failed to update mmWave placement"
        )
        return

    processor: MmwaveTargetProcessor = hass.data[DOMAIN]["mmwave_processor"]
    hass.async_create_task(processor.async_update_placement(result))
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/mmwave/clear_calibration",
        vol.Required("placement_id"): str,
    }
)
@callback
def ws_mmwave_clear_calibration(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Clear calibration from an mmWave placement."""
    if not _require_admin(connection, msg):
        return

    store = hass.data[DOMAIN]["store"]
    placement = store.get_mmwave_placement(msg["placement_id"])
    if not placement:
        connection.send_error(msg["id"], "not_found", "mmWave placement not found")
        return

    placement.calibration = None
    result = store.update_mmwave_placement(placement)
    if not result:
        connection.send_error(
            msg["id"], "update_failed", "Failed to update mmWave placement"
        )
        return

    processor: MmwaveTargetProcessor = hass.data[DOMAIN]["mmwave_processor"]
    hass.async_create_task(processor.async_update_placement(result))
    connection.send_result(msg["id"], result.to_dict())


def _valid_calibration_samples(samples: list[Any]) -> list[Coordinates]:
    """Return numeric, non-zero sample coordinates from raw payload data."""
    result: list[Coordinates] = []
    for sample in samples:
        if not isinstance(sample, dict):
            continue
        try:
            x = float(sample["x"])
            y = float(sample["y"])
        except (KeyError, TypeError, ValueError):
            continue
        if not math.isfinite(x) or not math.isfinite(y):
            continue
        if x == 0.0 and y == 0.0:
            continue
        result.append(Coordinates(x=x, y=y))
    return result


def _mean(samples: list[Coordinates]) -> Coordinates:
    """Compute arithmetic mean for calibration samples."""
    return Coordinates(
        x=sum(sample.x for sample in samples) / len(samples),
        y=sum(sample.y for sample in samples) / len(samples),
    )


def _stddev(samples: list[Coordinates], mean: Coordinates) -> Coordinates:
    """Compute population standard deviation for calibration samples."""
    return Coordinates(
        x=math.sqrt(sum((sample.x - mean.x) ** 2 for sample in samples) / len(samples)),
        y=math.sqrt(sum((sample.y - mean.y) ** 2 for sample in samples) / len(samples)),
    )


def _expected_raw_for_map_point(
    placement: MmwavePlacement, map_point: Coordinates, scale: float
) -> Coordinates:
    """Convert a known map point into expected raw sensor x/y values."""
    facing_rad = math.radians(placement.angle)
    cos_a = math.cos(facing_rad)
    sin_a = math.sin(facing_rad)
    dx = map_point.x - placement.position.x
    dy = map_point.y - placement.position.y

    local_x = -dx * sin_a + dy * cos_a
    local_y = dx * cos_a + dy * sin_a
    return Coordinates(x=local_x / scale, y=local_y / scale)


def _get_mm_to_unit_scale(store: Any, floor_plan_id: str) -> float:
    """Return the multiplier to convert mm into floor-plan units."""
    fp = store.get_floor_plan(floor_plan_id)
    unit = fp.unit if fp else "cm"
    return {
        "cm": 0.1,
        "m": 0.001,
        "in": 1 / 25.4,
        "ft": 1 / 304.8,
    }.get(unit, 0.1)
