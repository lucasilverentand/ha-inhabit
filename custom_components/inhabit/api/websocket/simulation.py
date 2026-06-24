"""WebSocket handlers for simulated target operations."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...engine.simulated_target_processor import SimulatedTargetProcessor
from ...fixtures.local_simulator_house import (
    LOCAL_SIMULATOR_FLOOR_PLAN_ID,
    LOCAL_SIMULATOR_FLOOR_PLAN_NAME,
    build_local_simulator_house,
    local_simulator_house_summary,
)
from ...models.floor_plan import Coordinates
from ._helpers import _require_admin


def register(hass: HomeAssistant) -> None:
    """Register simulation WebSocket commands."""
    websocket_api.async_register_command(hass, ws_simulate_local_house_get)
    websocket_api.async_register_command(hass, ws_simulate_local_house_create)
    websocket_api.async_register_command(hass, ws_simulate_target_add)
    websocket_api.async_register_command(hass, ws_simulate_target_move)
    websocket_api.async_register_command(hass, ws_simulate_target_remove)
    websocket_api.async_register_command(hass, ws_simulate_target_clear)
    websocket_api.async_register_command(hass, ws_simulate_target_list)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/local_house/get",
    }
)
@callback
def ws_simulate_local_house_get(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the anonymized local simulator house summary."""
    store = hass.data[DOMAIN]["store"]
    floor_plan = store.get_floor_plan(LOCAL_SIMULATOR_FLOOR_PLAN_ID)
    payload = local_simulator_house_summary()
    payload["installed"] = floor_plan is not None
    connection.send_result(msg["id"], payload)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/simulate/local_house/create",
        vol.Optional("replace_existing", default=False): bool,
    }
)
@callback
def ws_simulate_local_house_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create or refresh the anonymized local simulator house floor plan."""
    if not _require_admin(connection, msg):
        return

    store = hass.data[DOMAIN]["store"]
    existing = store.get_floor_plan(LOCAL_SIMULATOR_FLOOR_PLAN_ID)
    if existing and not msg["replace_existing"]:
        connection.send_result(
            msg["id"],
            {
                "created": False,
                "floor_plan": existing.to_dict(),
                "summary": local_simulator_house_summary(),
            },
        )
        return

    old_mmwave_ids: list[str] = []
    if existing:
        old_mmwave_ids = [
            placement.id
            for placement in store.get_mmwave_placements(LOCAL_SIMULATOR_FLOOR_PLAN_ID)
        ]
        store.delete_floor_plan(LOCAL_SIMULATOR_FLOOR_PLAN_ID)

    floor_plan, configs, mmwave_placements = build_local_simulator_house()
    created = store.create_floor_plan(floor_plan)
    for config in configs:
        store.create_sensor_config(config)
    for placement in mmwave_placements:
        store.create_mmwave_placement(placement)

    sim: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    sim.clear_all()

    sensor_engine = hass.data[DOMAIN].get("sensor_engine")
    if sensor_engine:
        hass.async_create_task(sensor_engine.async_refresh())

    mmwave_processor = hass.data[DOMAIN].get("mmwave_processor")
    if mmwave_processor:
        for placement_id in old_mmwave_ids:
            hass.async_create_task(
                mmwave_processor.async_remove_placement(placement_id)
            )
        for placement in mmwave_placements:
            hass.async_create_task(mmwave_processor.async_add_placement(placement))

    connection.send_result(
        msg["id"],
        {
            "created": True,
            "floor_plan": created.to_dict(),
            "summary": local_simulator_house_summary(),
            "message": f"Created {LOCAL_SIMULATOR_FLOOR_PLAN_NAME}",
        },
    )


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
