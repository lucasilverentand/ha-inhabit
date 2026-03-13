"""WebSocket handlers for visual rule operations."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...models.automation_rule import VisualRule
from ._helpers import _require_admin


def register(hass: HomeAssistant) -> None:
    """Register visual rule WebSocket commands."""
    websocket_api.async_register_command(hass, ws_rules_list)
    websocket_api.async_register_command(hass, ws_rules_create)
    websocket_api.async_register_command(hass, ws_rules_update)
    websocket_api.async_register_command(hass, ws_rules_delete)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/rules/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_rules_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all visual rules for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    rules = store.get_visual_rules(msg["floor_plan_id"])
    connection.send_result(msg["id"], [r.to_dict() for r in rules])


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/rules/create",
        vol.Required("floor_plan_id"): str,
        vol.Required("name"): str,
        vol.Required("trigger_type"): str,
        vol.Optional("description", default=""): str,
        vol.Optional("trigger_room_id"): vol.Any(str, None),
        vol.Optional("trigger_entity_id"): vol.Any(str, None),
        vol.Optional("trigger_state"): vol.Any(str, None),
        vol.Optional("trigger_for"): vol.Any(int, None),
        vol.Optional("conditions", default=[]): list,
        vol.Optional("actions", default=[]): list,
        vol.Optional("source_room_id"): vol.Any(str, None),
        vol.Optional("target_entity_ids", default=[]): list,
        vol.Optional("color", default="#3b82f6"): str,
    }
)
@callback
def ws_rules_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create a visual rule."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    rule = VisualRule.from_dict(
        {
            "floor_plan_id": msg["floor_plan_id"],
            "name": msg["name"],
            "description": msg.get("description", ""),
            "trigger_type": msg["trigger_type"],
            "trigger_room_id": msg.get("trigger_room_id"),
            "trigger_entity_id": msg.get("trigger_entity_id"),
            "trigger_state": msg.get("trigger_state"),
            "trigger_for": msg.get("trigger_for"),
            "conditions": msg.get("conditions", []),
            "actions": msg.get("actions", []),
            "source_room_id": msg.get("source_room_id"),
            "target_entity_ids": msg.get("target_entity_ids", []),
            "color": msg.get("color", "#3b82f6"),
        }
    )
    result = store.create_visual_rule(rule)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/rules/update",
        vol.Required("rule_id"): str,
        vol.Optional("name"): str,
        vol.Optional("description"): str,
        vol.Optional("enabled"): bool,
        vol.Optional("trigger_type"): str,
        vol.Optional("trigger_room_id"): vol.Any(str, None),
        vol.Optional("trigger_entity_id"): vol.Any(str, None),
        vol.Optional("trigger_state"): vol.Any(str, None),
        vol.Optional("trigger_for"): vol.Any(int, None),
        vol.Optional("conditions"): list,
        vol.Optional("actions"): list,
        vol.Optional("source_room_id"): vol.Any(str, None),
        vol.Optional("target_entity_ids"): list,
        vol.Optional("color"): str,
    }
)
@callback
def ws_rules_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a visual rule."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    rule = store.get_visual_rule(msg["rule_id"])
    if not rule:
        connection.send_error(msg["id"], "not_found", "Rule not found")
        return

    for key in [
        "name",
        "description",
        "enabled",
        "trigger_type",
        "trigger_room_id",
        "trigger_entity_id",
        "trigger_state",
        "trigger_for",
        "conditions",
        "actions",
        "source_room_id",
        "target_entity_ids",
        "color",
    ]:
        if key in msg:
            setattr(rule, key, msg[key])

    result = store.update_visual_rule(rule)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update rule")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/rules/delete",
        vol.Required("rule_id"): str,
    }
)
@callback
def ws_rules_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a visual rule."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if store.delete_visual_rule(msg["rule_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Rule not found")
