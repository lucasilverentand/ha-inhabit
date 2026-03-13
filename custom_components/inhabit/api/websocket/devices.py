"""WebSocket handlers for device placement operations (lights, switches, buttons, others)."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from ...const import DOMAIN, WS_PREFIX
from ...models.device_placement import (
    ButtonPlacement,
    LightPlacement,
    OtherPlacement,
    SwitchPlacement,
)
from ...models.floor_plan import Coordinates
from ._helpers import _require_admin


def register(hass: HomeAssistant) -> None:
    """Register device placement WebSocket commands."""
    websocket_api.async_register_command(hass, ws_lights_place)
    websocket_api.async_register_command(hass, ws_lights_update)
    websocket_api.async_register_command(hass, ws_lights_remove)
    websocket_api.async_register_command(hass, ws_lights_list)
    websocket_api.async_register_command(hass, ws_switches_place)
    websocket_api.async_register_command(hass, ws_switches_update)
    websocket_api.async_register_command(hass, ws_switches_remove)
    websocket_api.async_register_command(hass, ws_switches_list)
    websocket_api.async_register_command(hass, ws_buttons_place)
    websocket_api.async_register_command(hass, ws_buttons_update)
    websocket_api.async_register_command(hass, ws_buttons_remove)
    websocket_api.async_register_command(hass, ws_buttons_list)
    websocket_api.async_register_command(hass, ws_others_place)
    websocket_api.async_register_command(hass, ws_others_update)
    websocket_api.async_register_command(hass, ws_others_remove)
    websocket_api.async_register_command(hass, ws_others_list)


# ==================== Light Placements ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/lights/place",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("entity_id"): str,
        vol.Required("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_lights_place(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Place a light on a floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    light = LightPlacement(
        entity_id=msg["entity_id"],
        floor_id=msg["floor_id"],
        room_id=msg.get("room_id"),
        position=Coordinates.from_dict(msg["position"]),
        label=msg.get("label"),
    )
    result = store.place_light(msg["floor_plan_id"], light)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/lights/update",
        vol.Required("light_id"): str,
        vol.Optional("entity_id"): str,
        vol.Optional("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_lights_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a light placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    light = store.get_light_placement(msg["light_id"])
    if not light:
        connection.send_error(msg["id"], "not_found", "Light not found")
        return

    if "entity_id" in msg:
        light.entity_id = msg["entity_id"]
    if "position" in msg:
        light.position = Coordinates.from_dict(msg["position"])
    if "room_id" in msg:
        light.room_id = msg["room_id"]
    if "label" in msg:
        light.label = msg["label"]

    result = store.update_light_placement(light)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update light")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/lights/remove",
        vol.Required("light_id"): str,
    }
)
@callback
def ws_lights_remove(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a light placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if store.remove_light_placement(msg["light_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Light not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/lights/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_lights_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all light placements for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    placements = store.get_light_placements(msg["floor_plan_id"])
    connection.send_result(msg["id"], [p.to_dict() for p in placements])


# ==================== Switch Placements ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/switches/place",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("entity_id"): str,
        vol.Required("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_switches_place(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Place a switch on a floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    switch = SwitchPlacement(
        entity_id=msg["entity_id"],
        floor_id=msg["floor_id"],
        room_id=msg.get("room_id"),
        position=Coordinates.from_dict(msg["position"]),
        label=msg.get("label"),
    )
    result = store.place_switch(msg["floor_plan_id"], switch)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/switches/update",
        vol.Required("switch_id"): str,
        vol.Optional("entity_id"): str,
        vol.Optional("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_switches_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a switch placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    switch = store.get_switch_placement(msg["switch_id"])
    if not switch:
        connection.send_error(msg["id"], "not_found", "Switch not found")
        return

    if "entity_id" in msg:
        switch.entity_id = msg["entity_id"]
    if "position" in msg:
        switch.position = Coordinates.from_dict(msg["position"])
    if "room_id" in msg:
        switch.room_id = msg["room_id"]
    if "label" in msg:
        switch.label = msg["label"]

    result = store.update_switch_placement(switch)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update switch")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/switches/remove",
        vol.Required("switch_id"): str,
    }
)
@callback
def ws_switches_remove(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a switch placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if store.remove_switch_placement(msg["switch_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Switch not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/switches/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_switches_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all switch placements for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    placements = store.get_switch_placements(msg["floor_plan_id"])
    connection.send_result(msg["id"], [p.to_dict() for p in placements])


# ==================== Button Placements ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/buttons/place",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("entity_id"): str,
        vol.Required("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_buttons_place(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Place a button on a floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    button = ButtonPlacement(
        entity_id=msg["entity_id"],
        floor_id=msg["floor_id"],
        room_id=msg.get("room_id"),
        position=Coordinates.from_dict(msg["position"]),
        label=msg.get("label"),
    )
    result = store.place_button(msg["floor_plan_id"], button)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/buttons/update",
        vol.Required("button_id"): str,
        vol.Optional("entity_id"): str,
        vol.Optional("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_buttons_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update a button placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    button = store.get_button_placement(msg["button_id"])
    if not button:
        connection.send_error(msg["id"], "not_found", "Button not found")
        return

    if "entity_id" in msg:
        button.entity_id = msg["entity_id"]
    if "position" in msg:
        button.position = Coordinates.from_dict(msg["position"])
    if "room_id" in msg:
        button.room_id = msg["room_id"]
    if "label" in msg:
        button.label = msg["label"]

    result = store.update_button_placement(button)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(msg["id"], "update_failed", "Failed to update button")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/buttons/remove",
        vol.Required("button_id"): str,
    }
)
@callback
def ws_buttons_remove(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a button placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if store.remove_button_placement(msg["button_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Button not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/buttons/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_buttons_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all button placements for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    placements = store.get_button_placements(msg["floor_plan_id"])
    connection.send_result(msg["id"], [p.to_dict() for p in placements])


# ==================== Other Placements ====================


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/others/place",
        vol.Required("floor_plan_id"): str,
        vol.Required("floor_id"): str,
        vol.Required("entity_id"): str,
        vol.Required("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_others_place(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Place an other device on a floor plan."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    other = OtherPlacement(
        entity_id=msg["entity_id"],
        floor_id=msg["floor_id"],
        room_id=msg.get("room_id"),
        position=Coordinates.from_dict(msg["position"]),
        label=msg.get("label"),
    )
    result = store.place_other(msg["floor_plan_id"], other)
    connection.send_result(msg["id"], result.to_dict())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/others/update",
        vol.Required("other_id"): str,
        vol.Optional("entity_id"): str,
        vol.Optional("position"): dict,
        vol.Optional("room_id"): vol.Any(str, None),
        vol.Optional("label"): vol.Any(str, None),
    }
)
@callback
def ws_others_update(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update an other placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    other = store.get_other_placement(msg["other_id"])
    if not other:
        connection.send_error(msg["id"], "not_found", "Other placement not found")
        return

    if "entity_id" in msg:
        other.entity_id = msg["entity_id"]
    if "position" in msg:
        other.position = Coordinates.from_dict(msg["position"])
    if "room_id" in msg:
        other.room_id = msg["room_id"]
    if "label" in msg:
        other.label = msg["label"]

    result = store.update_other_placement(other)
    if result:
        connection.send_result(msg["id"], result.to_dict())
    else:
        connection.send_error(
            msg["id"], "update_failed", "Failed to update other placement"
        )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/others/remove",
        vol.Required("other_id"): str,
    }
)
@callback
def ws_others_remove(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove an other placement."""
    if not _require_admin(connection, msg):
        return
    store = hass.data[DOMAIN]["store"]
    if store.remove_other_placement(msg["other_id"]):
        connection.send_result(msg["id"], {"success": True})
    else:
        connection.send_error(msg["id"], "not_found", "Other placement not found")


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{WS_PREFIX}/others/list",
        vol.Required("floor_plan_id"): str,
    }
)
@callback
def ws_others_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List all other placements for a floor plan."""
    store = hass.data[DOMAIN]["store"]
    placements = store.get_other_placements(msg["floor_plan_id"])
    connection.send_result(msg["id"], [p.to_dict() for p in placements])
