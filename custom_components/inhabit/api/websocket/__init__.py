"""WebSocket API for Inhabit Floor Plan Builder."""

from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant

from . import (
    devices,
    edges,
    floor_plans,
    floors,
    mmwave,
    rooms,
    rules,
    sensors,
    simulation,
    zones,
)

_LOGGER = logging.getLogger(__name__)


def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register WebSocket commands."""
    floor_plans.register(hass)
    floors.register(hass)
    rooms.register(hass)
    zones.register(hass)
    edges.register(hass)
    devices.register(hass)
    sensors.register(hass)
    rules.register(hass)
    mmwave.register(hass)
    simulation.register(hass)
    _LOGGER.debug("Registered WebSocket commands")
