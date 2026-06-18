"""Unit tests for Dyson fan angle service payloads."""

from __future__ import annotations

from custom_components.inhabit.api.websocket.devices import _dyson_angle_payload
from custom_components.inhabit.models.device_placement import FanPlacement


def test_dyson_angle_payload_uses_saved_begin_and_end() -> None:
    """Saved fan angle bounds become dyson_local.set_angle fields."""
    fan = FanPlacement(
        entity_id="fan.bedroom",
        oscillation_start=10,
        oscillation_end=350,
    )

    assert _dyson_angle_payload(fan) == {
        "entity_id": "fan.bedroom",
        "angle_low": 10,
        "angle_high": 350,
    }


def test_dyson_angle_payload_allows_fixed_angle() -> None:
    """Dyson accepts equal angle bounds as a fixed direction."""
    fan = FanPlacement(
        entity_id="fan.bedroom",
        oscillation_start=180,
        oscillation_end=180,
    )

    assert _dyson_angle_payload(fan) == {
        "entity_id": "fan.bedroom",
        "angle_low": 180,
        "angle_high": 180,
    }


def test_dyson_angle_payload_rejects_invalid_short_span() -> None:
    """Dyson rejects non-fixed spans below its 30 degree minimum."""
    fan = FanPlacement(
        entity_id="fan.bedroom",
        oscillation_start=180,
        oscillation_end=200,
    )

    assert _dyson_angle_payload(fan) is None


def test_dyson_angle_payload_rejects_missing_bounds() -> None:
    """No service call is built until both angle bounds are configured."""
    fan = FanPlacement(entity_id="fan.bedroom", oscillation_start=180)

    assert _dyson_angle_payload(fan) is None
