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
from ...models.mmwave_sensor import (
    MmwaveCalibration,
    MmwaveCalibrationPoint,
    MmwaveCalibrationTransform,
    MmwavePlacement,
)
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
        vol.Optional("target_index"): vol.Coerce(int),
        vol.Optional("map_point"): dict,
        vol.Optional("samples"): list,
        vol.Optional("points"): list,
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

    scale = _get_mm_to_unit_scale(store, placement.floor_plan_id)
    points = _calibration_points_from_msg(connection, msg, placement, scale)
    if points is None:
        return

    first_point = points[0]
    raw_bias = _mean([point.raw_bias for point in points])
    raw_mean = _mean([point.raw_mean for point in points])
    raw_stddev = _mean([point.raw_stddev for point in points])
    total_samples = sum(point.sample_count for point in points)
    transform = _fit_world_transform(points)
    jitter_radius = _calibration_jitter_radius(
        raw_stddev,
        transform,
        scale,
    )

    placement.calibration = MmwaveCalibration(
        enabled=True,
        target_index=first_point.target_index,
        map_point=first_point.map_point,
        raw_mean=raw_mean,
        raw_stddev=raw_stddev,
        raw_bias=raw_bias,
        jitter_radius=jitter_radius,
        sample_count=total_samples,
        calibrated_at=datetime.now(UTC).isoformat(),
        points=points,
        world_transform=transform,
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


def _calibration_points_from_msg(
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    placement: MmwavePlacement,
    scale: float,
) -> list[MmwaveCalibrationPoint] | None:
    """Build validated calibration points from single- or multi-point payloads."""
    point_payloads = msg.get("points")
    if point_payloads is None:
        if "target_index" not in msg or "map_point" not in msg or "samples" not in msg:
            connection.send_error(
                msg["id"],
                "invalid_points",
                "Calibration requires at least one point",
            )
            return None
        point_payloads = [
            {
                "target_index": msg["target_index"],
                "map_point": msg["map_point"],
                "samples": msg["samples"],
            }
        ]

    if not isinstance(point_payloads, list) or not point_payloads:
        connection.send_error(
            msg["id"], "invalid_points", "Calibration requires at least one point"
        )
        return None

    points: list[MmwaveCalibrationPoint] = []
    for payload in point_payloads:
        if not isinstance(payload, dict) or "map_point" not in payload:
            connection.send_error(
                msg["id"], "invalid_points", "Calibration point is invalid"
            )
            return None

        try:
            target_index = int(payload.get("target_index", msg.get("target_index", 0)))
        except (TypeError, ValueError):
            connection.send_error(
                msg["id"], "invalid_target", "Target index is invalid"
            )
            return None

        if target_index < 0 or target_index >= len(placement.targets):
            connection.send_error(
                msg["id"], "invalid_target", "Target index is invalid"
            )
            return None

        try:
            map_point = Coordinates.from_dict(payload["map_point"])
        except (KeyError, TypeError, ValueError):
            connection.send_error(
                msg["id"], "invalid_points", "Calibration point is invalid"
            )
            return None

        computed = _point_from_samples(
            payload, target_index, map_point, placement, scale
        )
        if computed is None:
            connection.send_error(
                msg["id"],
                "invalid_samples",
                f"At least {MIN_CALIBRATION_SAMPLES} non-zero numeric samples are required",
            )
            return None
        points.append(computed)

    return points


def _point_from_samples(
    payload: dict[str, Any],
    target_index: int,
    map_point: Coordinates,
    placement: MmwavePlacement,
    scale: float,
) -> MmwaveCalibrationPoint | None:
    """Build a calibration point from raw samples or saved point diagnostics."""
    samples = _valid_calibration_samples(payload.get("samples", []))
    if samples:
        if len(samples) < MIN_CALIBRATION_SAMPLES:
            return None
        raw_mean = _mean(samples)
        raw_stddev = _stddev(samples, raw_mean)
        sample_count = len(samples)
    else:
        try:
            raw_mean = Coordinates.from_dict(payload["raw_mean"])
            raw_stddev = Coordinates.from_dict(
                payload.get("raw_stddev") or {"x": 0, "y": 0}
            )
            sample_count = int(payload.get("sample_count", 0))
        except (KeyError, TypeError, ValueError):
            return None
        if sample_count < MIN_CALIBRATION_SAMPLES:
            return None

    expected_raw = _expected_raw_for_map_point(placement, map_point, scale)
    raw_bias = Coordinates(
        x=raw_mean.x - expected_raw.x,
        y=raw_mean.y - expected_raw.y,
    )
    return MmwaveCalibrationPoint(
        target_index=target_index,
        map_point=map_point,
        raw_mean=raw_mean,
        raw_stddev=raw_stddev,
        raw_bias=raw_bias,
        sample_count=sample_count,
    )


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


def _fit_world_transform(
    points: list[MmwaveCalibrationPoint],
) -> MmwaveCalibrationTransform | None:
    """Fit raw sensor coordinates directly to floor-plan coordinates."""
    if len(points) < 2:
        return None

    transform = _fit_affine_transform(points) if len(points) >= 3 else None
    if transform is None:
        transform = _fit_similarity_transform(points)
    if transform is None:
        return None

    transform.residual_error = _mean_residual_error(points, transform)
    return transform


def _fit_similarity_transform(
    points: list[MmwaveCalibrationPoint],
) -> MmwaveCalibrationTransform | None:
    """Fit translation, rotation, and uniform scale from raw to map coordinates."""
    raw_centroid = _mean([point.raw_mean for point in points])
    map_centroid = _mean([point.map_point for point in points])
    numerator_a = 0.0
    numerator_b = 0.0
    denominator = 0.0

    for point in points:
        x = point.raw_mean.x - raw_centroid.x
        y = point.raw_mean.y - raw_centroid.y
        u = point.map_point.x - map_centroid.x
        v = point.map_point.y - map_centroid.y
        numerator_a += x * u + y * v
        numerator_b += x * v - y * u
        denominator += x * x + y * y

    if denominator <= 1e-9:
        return None

    a = numerator_a / denominator
    b = numerator_b / denominator
    return MmwaveCalibrationTransform(
        type="similarity",
        a=a,
        b=-b,
        c=map_centroid.x - a * raw_centroid.x + b * raw_centroid.y,
        d=b,
        e=a,
        f=map_centroid.y - b * raw_centroid.x - a * raw_centroid.y,
    )


def _fit_affine_transform(
    points: list[MmwaveCalibrationPoint],
) -> MmwaveCalibrationTransform | None:
    """Least-squares affine transform from raw to map coordinates."""
    ata = [[0.0, 0.0, 0.0] for _ in range(3)]
    atx = [0.0, 0.0, 0.0]
    aty = [0.0, 0.0, 0.0]

    for point in points:
        row = [point.raw_mean.x, point.raw_mean.y, 1.0]
        for i in range(3):
            atx[i] += row[i] * point.map_point.x
            aty[i] += row[i] * point.map_point.y
            for j in range(3):
                ata[i][j] += row[i] * row[j]

    coeff_x = _solve_3x3(ata, atx)
    coeff_y = _solve_3x3(ata, aty)
    if coeff_x is None or coeff_y is None:
        return None

    return MmwaveCalibrationTransform(
        type="affine",
        a=coeff_x[0],
        b=coeff_x[1],
        c=coeff_x[2],
        d=coeff_y[0],
        e=coeff_y[1],
        f=coeff_y[2],
    )


def _solve_3x3(matrix: list[list[float]], values: list[float]) -> list[float] | None:
    """Solve a 3x3 linear system using Gaussian elimination."""
    rows = [matrix[i][:] + [values[i]] for i in range(3)]
    for col in range(3):
        pivot = max(range(col, 3), key=lambda row: abs(rows[row][col]))
        if abs(rows[pivot][col]) < 1e-9:
            return None
        rows[col], rows[pivot] = rows[pivot], rows[col]
        pivot_value = rows[col][col]
        for idx in range(col, 4):
            rows[col][idx] /= pivot_value
        for row in range(3):
            if row == col:
                continue
            factor = rows[row][col]
            for idx in range(col, 4):
                rows[row][idx] -= factor * rows[col][idx]

    return [rows[i][3] for i in range(3)]


def _mean_residual_error(
    points: list[MmwaveCalibrationPoint], transform: MmwaveCalibrationTransform
) -> float:
    """Return mean map-space error after applying a fitted transform."""
    errors = []
    for point in points:
        mapped = _apply_world_transform(transform, point.raw_mean)
        errors.append(
            math.hypot(mapped.x - point.map_point.x, mapped.y - point.map_point.y)
        )
    return sum(errors) / len(errors) if errors else 0.0


def _apply_world_transform(
    transform: MmwaveCalibrationTransform, raw: Coordinates
) -> Coordinates:
    """Apply a raw sensor to world transform."""
    return Coordinates(
        x=transform.a * raw.x + transform.b * raw.y + transform.c,
        y=transform.d * raw.x + transform.e * raw.y + transform.f,
    )


def _calibration_jitter_radius(
    raw_stddev: Coordinates,
    transform: MmwaveCalibrationTransform | None,
    scale: float,
) -> float:
    """Convert raw sample jitter to map units."""
    if transform:
        linear_scale = max(
            math.hypot(transform.a, transform.d),
            math.hypot(transform.b, transform.e),
        )
    else:
        linear_scale = scale
    return math.hypot(raw_stddev.x, raw_stddev.y) * linear_scale * 2


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
