"""WebSocket handlers for sensor configuration and occupancy state operations."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...models.virtual_sensor import SensorBinding, VirtualSensorConfig
from ._helpers import _require_admin


def register(hass: HomeAssistant) -> None:
    """Register sensor WebSocket commands."""
    websocket_api.async_register_command(hass, ws_sensor_config_get)
    websocket_api.async_register_command(hass, ws_sensor_config_update)
    websocket_api.async_register_command(hass, ws_occupancy_states)
    websocket_api.async_register_command(hass, ws_occupancy_history)
    websocket_api.async_register_command(hass, ws_phantom_states)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/sensor_config/get",
        vol.Required("room_id"): str,
    }
)
@callback
def ws_sensor_config_get(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get sensor configuration for a room (auto-creates if not found)."""
    store = hass.data[DOMAIN]["store"]
    config = store.get_sensor_config(msg["room_id"])
    if not config:
        # Auto-create a default (disabled) config for this room/zone
        floor_plan_id = store.find_floor_plan_id_for_room(msg["room_id"])
        if not floor_plan_id:
            connection.send_error(
                msg["id"], "not_found", "Room or zone not found in any floor plan"
            )
            return
        config = VirtualSensorConfig(
            room_id=msg["room_id"],
            floor_plan_id=floor_plan_id,
            enabled=False,
        )
        store.create_sensor_config(config)
    connection.send_result(msg["id"], config.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/sensor_config/update",
        vol.Required("room_id"): str,
        vol.Optional("enabled"): bool,
        vol.Optional("motion_timeout"): int,
        vol.Optional("checking_timeout"): int,
        vol.Optional("presence_timeout"): int,
        vol.Optional("motion_sensors"): list,
        vol.Optional("presence_sensors"): list,
        vol.Optional("occupancy_sensors"): list,
        vol.Optional("door_sensors"): list,
        vol.Optional("exit_sensors"): list,
        vol.Optional("hold_until_exit"): bool,
        vol.Optional("occupies_parent"): bool,
        vol.Optional("presence_affects"): bool,
        vol.Optional("door_seals_room"): bool,
        vol.Optional("seal_max_duration"): int,
        vol.Optional("long_stay"): bool,
        vol.Optional("override_trigger_entity"): str,
        vol.Optional("override_trigger_action"): str,
        vol.Optional("door_blocks_vacancy"): bool,  # Legacy, maps to door_seals_room
        vol.Optional("door_open_resets_checking"): bool,  # Legacy
        vol.Optional("occupied_threshold"): vol.Coerce(float),
        vol.Optional("vacant_threshold"): vol.Coerce(float),
    }
)
@callback
def ws_sensor_config_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update sensor configuration for a room (creates if not found)."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    config = store.get_sensor_config(msg["room_id"])
    if not config:
        # Auto-create a default config for this room/zone
        floor_plan_id = store.find_floor_plan_id_for_room(msg["room_id"])
        if not floor_plan_id:
            connection.send_error(
                msg["id"], "not_found", "Room or zone not found in any floor plan"
            )
            return
        config = VirtualSensorConfig(
            room_id=msg["room_id"],
            floor_plan_id=floor_plan_id,
        )
        store.create_sensor_config(config)

    if "enabled" in msg:
        config.enabled = msg["enabled"]
    if "motion_timeout" in msg:
        config.motion_timeout = msg["motion_timeout"]
    if "checking_timeout" in msg:
        config.checking_timeout = msg["checking_timeout"]
    if "presence_timeout" in msg:
        config.presence_timeout = msg["presence_timeout"]
    if "motion_sensors" in msg:
        config.motion_sensors = [
            SensorBinding.from_dict(s) for s in msg["motion_sensors"]
        ]
    if "presence_sensors" in msg:
        config.presence_sensors = [
            SensorBinding.from_dict(s) for s in msg["presence_sensors"]
        ]
    if "occupancy_sensors" in msg:
        config.occupancy_sensors = [
            SensorBinding.from_dict(s) for s in msg["occupancy_sensors"]
        ]
    if "door_sensors" in msg:
        config.door_sensors = [SensorBinding.from_dict(s) for s in msg["door_sensors"]]
    if "exit_sensors" in msg:
        config.exit_sensors = [SensorBinding.from_dict(s) for s in msg["exit_sensors"]]
    if "hold_until_exit" in msg:
        config.hold_until_exit = msg["hold_until_exit"]
    if "occupies_parent" in msg:
        config.occupies_parent = msg["occupies_parent"]
    if "presence_affects" in msg:
        config.presence_affects = msg["presence_affects"]
    if "door_seals_room" in msg:
        config.door_seals_room = msg["door_seals_room"]
    elif "door_blocks_vacancy" in msg:
        config.door_seals_room = msg["door_blocks_vacancy"]
    # Always keep legacy field in sync
    config.door_blocks_vacancy = config.door_seals_room
    if "seal_max_duration" in msg:
        config.seal_max_duration = msg["seal_max_duration"]
    if "long_stay" in msg:
        config.long_stay = msg["long_stay"]
    if "override_trigger_entity" in msg:
        config.override_trigger_entity = msg["override_trigger_entity"]
    if "override_trigger_action" in msg:
        config.override_trigger_action = msg["override_trigger_action"]
    if "door_open_resets_checking" in msg:
        config.door_open_resets_checking = msg["door_open_resets_checking"]
    if "occupied_threshold" in msg:
        config.occupied_threshold = msg["occupied_threshold"]
    if "vacant_threshold" in msg:
        config.vacant_threshold = msg["vacant_threshold"]

    # Validate threshold bounds
    if not (0.0 <= config.vacant_threshold <= config.occupied_threshold <= 1.0):
        connection.send_error(
            msg["id"],
            "invalid_thresholds",
            "Thresholds must satisfy: 0.0 <= vacant_threshold <= occupied_threshold <= 1.0",
        )
        return

    result = store.update_sensor_config(config)
    if result:
        # Update sensor engine
        sensor_engine = hass.data[DOMAIN]["sensor_engine"]
        hass.async_create_task(sensor_engine.async_update_room(config))
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(
            msg["id"], "update_failed", "Failed to update sensor config"
        )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/occupancy_states",
    }
)
@callback
def ws_occupancy_states(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get all room occupancy states."""
    sensor_engine = hass.data[DOMAIN]["sensor_engine"]
    states = sensor_engine.get_all_states()
    connection.send_result(
        msg["id"],
        {room_id: state.to_dict() for room_id, state in states.items()},
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/occupancy_history",
        vol.Optional("room_id"): str,
        vol.Optional("limit", default=100): int,
    }
)
@callback
def ws_occupancy_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get occupancy history, optionally filtered by room_id."""
    sensor_engine = hass.data[DOMAIN]["sensor_engine"]
    room_id = msg.get("room_id")
    limit = msg.get("limit", 100)
    history = sensor_engine.get_occupancy_history(room_id=room_id, limit=limit)
    connection.send_result(
        msg["id"],
        {"history": [e.to_dict() for e in history]},
    )


@websocket_api.websocket_command({vol.Required("type"): f"{WS_PREFIX}/phantom_states"})
@callback
def ws_phantom_states(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get active phantom presence states and transition predictor diagnostics."""
    sensor_engine = hass.data[DOMAIN]["sensor_engine"]
    predictor = sensor_engine.transition_predictor
    learner = sensor_engine.transition_learner

    phantoms = {}
    for target_id, phantom in predictor.phantoms.items():
        phantoms[target_id] = {
            "source_id": phantom.source_id,
            "target_id": phantom.target_id,
            "probability": phantom.probability,
            "current_probability": phantom.current_probability,
            "hold_seconds": phantom.hold_seconds,
            "remaining_seconds": phantom.remaining,
            "reason": phantom.reason,
        }

    door_links = {}
    for entity_id, link in predictor.door_links.items():
        door_links[entity_id] = {
            "room_a": link.room_a,
            "room_b": link.room_b,
            "edge_id": link.door_edge_id,
        }

    connection.send_result(
        msg["id"],
        {
            "phantoms": phantoms,
            "door_links": door_links,
            "transition_counts": dict(learner._total_counts),
        },
    )
