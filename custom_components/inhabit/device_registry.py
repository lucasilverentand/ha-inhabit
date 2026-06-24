"""Device registry helpers for Inhabit."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from .const import DOMAIN


def ensure_floor_plan_device(
    hass: HomeAssistant,
    config_entry_id: str,
    floor_plan_id: str,
    floor_plan_name: str,
) -> None:
    """Ensure the parent floor-plan device exists for child via_device links."""
    try:
        dev_reg = dr.async_get(hass)
    except (AttributeError, KeyError):
        return
    try:
        dev_reg.async_get_or_create(
            config_entry_id=config_entry_id,
            identifiers={(DOMAIN, floor_plan_id)},
            manufacturer="Inhabit",
            model="Floor Plan",
            name=floor_plan_name,
        )
    except AttributeError:
        return
