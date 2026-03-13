"""WebSocket handlers for simulated target operations."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...engine.simulated_target_processor import SimulatedTargetProcessor
from ...models.floor_plan import Coordinates
from ._helpers import _require_admin


def register(hass: HomeAssistant) -> None:
    """Register simulation WebSocket commands."""
    websocket_api.async_register_command(hass, ws_simulate_target_add)
    websocket_api.async_register_command(hass, ws_simulate_target_move)
    websocket_api.async_register_command(hass, ws_simulate_target_remove)
    websocket_api.async_register_command(hass, ws_simulate_target_clear)
    websocket_api.async_register_command(hass, ws_simulate_target_list)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/target/add",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("position"): dict,
        vol.Optional("hitbox", default=True): bool,
    }
)
@callback
def ws_simulate_target_add(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Add a simulated target at a position."""
    if not _require_admin(connection, msg):
        return
    sim: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    target = sim.add_target(
        msg["floor_plan_id"],
        msg["floor_id"],
        Coordinates.from_dict(msg["position"]),
        hitbox=msg["hitbox"],
    )
    connection.send_result(msg["id"], target.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/target/move",
        vol.Required("target_id"): str,
        vol.Required("position"): dict,
        vol.Optional("hitbox", default=True): bool,
    }
)
@callback
def ws_simulate_target_move(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Move a simulated target to a new position."""
    if not _require_admin(connection, msg):
        return
    sim: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    target = sim.move_target(
        msg["target_id"],
        Coordinates.from_dict(msg["position"]),
        hitbox=msg["hitbox"],
    )
    if target:
        connection.send_result(msg["id"], target.to_dict())
    else:
        connection.send_error(msg["id"], "not_found", "Simulated target not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/target/remove",
        vol.Required("target_id"): str,
    }
)
@callback
def ws_simulate_target_remove(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a simulated target."""
    if not _require_admin(connection, msg):
        return
    sim: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    if sim.remove_target(msg["target_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Simulated target not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/target/clear",
    }
)
@callback
def ws_simulate_target_clear(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Clear all simulated targets."""
    if not _require_admin(connection, msg):
        return
    sim: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    sim.clear_all()
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/target/list",
    }
)
@callback
def ws_simulate_target_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all simulated targets."""
    sim: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    targets = sim.get_targets()
    connection.send_result(msg["id"], [t.to_dict() for t in targets])
