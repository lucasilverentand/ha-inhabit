"""Shared helpers for WebSocket command handlers."""

from __future__ import annotations

import logging
from collections.abc import Coroutine
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from ...const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def _safe_engine_op(
    coro: Coroutine[Any, Any, None],
    operation: str,
    region_id: str,
) -> None:
    """Run a sensor engine operation with error logging."""
    try:
        await coro
    except Exception:
        _LOGGER.exception(
            "Sensor engine '%s' failed for region %s",
            operation,
            region_id,
        )


async def _disable_region_sensor(
    engine,
    store,
    region_id: str,
) -> None:
    """Remove region from engine, then delete config from store."""
    try:
        await engine.async_remove_room(region_id)
    except Exception:
        _LOGGER.exception("Failed to remove region %s from sensor engine", region_id)
    store.delete_sensor_config(region_id)


def _sync_region_device(
    hass: HomeAssistant,
    region_id: str,
    **kwargs: Any,
) -> None:
    """Sync device registry fields for a region's device."""
    dev_reg = dr.async_get(hass)
    device = dev_reg.async_get_device(identifiers={(DOMAIN, region_id)})
    if device:
        dev_reg.async_update_device(device.id, **kwargs)


def _sync_region_device_area(
    hass: HomeAssistant, region_id: str, ha_area_id: str | None
) -> None:
    """Sync the HA area of a region's device in the device registry."""
    _sync_region_device(hass, region_id, area_id=ha_area_id or "")


def _sync_region_device_name(hass: HomeAssistant, region_id: str, name: str) -> None:
    """Sync the name of a region's device in the device registry."""
    _sync_region_device(hass, region_id, name_by_user=name)


def _normalize_ha_area_id(value: str | None) -> str | None:
    """Normalize empty HA area values to None."""
    if not value:
        return None
    return value


def _validate_unique_ha_area(
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    *,
    store: Any,
    floor_plan_id: str,
    ha_area_id: str | None,
    exclude_room_id: str | None = None,
    exclude_zone_id: str | None = None,
) -> bool:
    """Ensure an HA area is not already assigned within the floor plan."""
    if not ha_area_id:
        return True

    assignment = store.find_ha_area_assignment(
        floor_plan_id,
        ha_area_id,
        exclude_room_id=exclude_room_id,
        exclude_zone_id=exclude_zone_id,
    )
    if not assignment:
        return True

    assignment_type, assignment_id, assignment_name = assignment
    connection.send_error(
        msg["id"],
        "duplicate_ha_area",
        (
            f"HA area '{ha_area_id}' is already assigned to "
            f"{assignment_type} '{assignment_name}' ({assignment_id})"
        ),
    )
    return False


def _require_admin(
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> bool:
    """Check if the user is an admin. Sends an error and returns False if not."""
    if not connection.user.is_admin:
        connection.send_error(msg["id"], "unauthorized", "Admin access required")
        return False
    return True


def _validate_placement_location(
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    store: Any,
) -> bool:
    """Validate that floor_plan_id, floor_id, and optional room_id exist.

    Sends a ``not_found`` error on the connection and returns ``False`` when
    validation fails.
    """
    floor_plan = store.get_floor_plan(msg["floor_plan_id"])
    if not floor_plan:
        connection.send_error(
            msg["id"], "not_found", "Floor plan not found"
        )
        return False

    floor = floor_plan.get_floor(msg["floor_id"])
    if not floor:
        connection.send_error(
            msg["id"], "not_found", "Floor not found"
        )
        return False

    room_id = msg.get("room_id")
    if room_id:
        in_rooms = any(r.id == room_id for r in floor.rooms)
        in_zones = any(z.id == room_id for z in floor.zones)
        if not in_rooms and not in_zones:
            connection.send_error(
                msg["id"], "not_found", "Room or zone not found on floor"
            )
            return False

    return True


def _remove_device(hass: HomeAssistant, region_id: str) -> None:
    """Remove the HA device for a room or zone."""
    dev_reg = dr.async_get(hass)
    device = dev_reg.async_get_device(identifiers={(DOMAIN, region_id)})
    if device:
        _LOGGER.debug("Removing device for region %s", region_id)
        dev_reg.async_remove_device(device.id)
