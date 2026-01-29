"""Inhabit Floor Plan Builder integration for Home Assistant."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry

from homeassistant.components.frontend import async_register_built_in_panel

try:
    from homeassistant.components.http import StaticPathConfig

    HAS_STATIC_PATH_CONFIG = True
except ImportError:
    # Home Assistant < 2024.7
    HAS_STATIC_PATH_CONFIG = False
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .api import http as http_api
from .api import services
from .api import websocket as ws_api
from .const import DOMAIN
from .engine.virtual_sensor_engine import VirtualSensorEngine
from .store import FloorPlanStore, ImageStore

_LOGGER = logging.getLogger(__name__)

PLATFORMS_LIST: list[Platform] = [Platform.BINARY_SENSOR]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Inhabit component."""
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Inhabit from a config entry."""
    _LOGGER.info("Setting up Inhabit Floor Plan Builder")

    # Initialize stores
    floor_plan_store = FloorPlanStore(hass)
    await floor_plan_store.async_load()

    image_store = ImageStore(hass)
    await image_store.async_setup()

    # Initialize virtual sensor engine
    sensor_engine = VirtualSensorEngine(hass, floor_plan_store)

    # Store references
    hass.data[DOMAIN] = {
        "store": floor_plan_store,
        "image_store": image_store,
        "sensor_engine": sensor_engine,
        "entry": entry,
    }

    # Register WebSocket API
    ws_api.async_register_websocket_commands(hass)

    # Register HTTP endpoints
    http_api.async_register_http_handlers(hass)

    # Register services
    await services.async_register_services(hass)

    # Register panel static path
    panel_path = hass.config.path("custom_components/inhabit/frontend/dist/panel.js")
    if HAS_STATIC_PATH_CONFIG:
        # Home Assistant 2024.7+
        await hass.http.async_register_static_paths(
            [StaticPathConfig("/inhabit/panel.js", panel_path, cache_headers=False)]
        )
    else:
        # Home Assistant < 2024.7 (deprecated)
        hass.http.register_static_path(
            "/inhabit/panel.js", panel_path, cache_headers=False
        )

    # Register panel (only if not already registered)
    panels = hass.data.get("frontend_panels", {})
    if "inhabit" not in panels:
        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title="Floor Plan",
            sidebar_icon="mdi:floor-plan",
            frontend_url_path="inhabit",
            require_admin=False,
            config={
                "_panel_custom": {
                    "name": "ha-floorplan-builder",
                    "module_url": "/inhabit/panel.js",
                }
            },
        )

    # Set up platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS_LIST)

    # Start the sensor engine
    await sensor_engine.async_start()

    _LOGGER.info("Inhabit Floor Plan Builder setup complete")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading Inhabit Floor Plan Builder")

    # Stop sensor engine
    sensor_engine: VirtualSensorEngine = hass.data[DOMAIN]["sensor_engine"]
    await sensor_engine.async_stop()

    # Unload platforms
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS_LIST)

    if unload_ok:
        hass.data.pop(DOMAIN)

    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)
