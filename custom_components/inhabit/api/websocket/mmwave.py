"""WebSocket handlers for mmWave sensor placement operations."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...engine.mmwave_target_processor import MmwaveTargetProcessor
from ...models.floor_plan import Coordinates
from ...models.mmwave_sensor import MmwavePlacement
from ._helpers import _require_admin, _validate_placement_location


def register(hass: HomeAssistant) -> None:
    """Register mmWave WebSocket commands."""
    websocket_api.async_register_command(hass, ws_mmwave_place)
    websocket_api.async_register_command(hass, ws_mmwave_update)
    websocket_api.async_register_command(hass, ws_mmwave_delete)
    websocket_api.async_register_command(hass, ws_mmwave_list)


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
