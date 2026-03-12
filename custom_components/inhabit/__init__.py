"""Inhabit Floor Plan Builder integration for Home Assistant."""

from __future__ import annotations

import logging

from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.config_entries import ConfigEntry

try:
    from homeassistant.components.http import StaticPathConfig

    HAS_STATIC_PATH_CONFIG = True
except ImportError:
    # Home Assistant < 2024.7
    HAS_STATIC_PATH_CONFIG = False
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.typing import ConfigType

from .api import http as http_api
from .api import services
from .api import websocket as ws_api
from .const import DOMAIN
from .engine.mmwave_target_processor import MmwaveTargetProcessor
from .engine.simulated_target_processor import SimulatedTargetProcessor
from .engine.virtual_sensor_engine import VirtualSensorEngine
from .store import FloorPlanStore, ImageStore

_LOGGER = logging.getLogger(__name__)

PLATFORMS_LIST: list[Platform] = [Platform.BINARY_SENSOR, Platform.BUTTON]


def _sync_all_device_areas(
    hass: HomeAssistant,
    store: FloorPlanStore,
    dev_reg: dr.DeviceRegistry,
) -> None:
    """Sync HA area assignments from stored rooms/zones to the device registry."""
    synced = 0
    for fp in store.get_floor_plans():
        for room in fp.get_all_rooms():
            if not room.occupancy_sensor_enabled:
                continue
            device = dev_reg.async_get_device(identifiers={(DOMAIN, room.id)})
            if device and device.area_id != (room.ha_area_id or ""):
                dev_reg.async_update_device(
                    device.id, area_id=room.ha_area_id or ""
                )
                synced += 1
        for floor in fp.floors:
            for zone in floor.zones:
                if not zone.occupancy_sensor_enabled:
                    continue
                device = dev_reg.async_get_device(identifiers={(DOMAIN, zone.id)})
                if device and device.area_id != (zone.ha_area_id or ""):
                    dev_reg.async_update_device(
                        device.id, area_id=zone.ha_area_id or ""
                    )
                    synced += 1
    if synced:
        _LOGGER.info("Synced HA area for %d occupancy sensor devices", synced)


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

    # Clean up orphaned sensor configs (rooms/zones deleted in a previous session)
    orphaned = floor_plan_store.cleanup_orphaned_sensor_configs()
    if orphaned:
        _LOGGER.info(
            "Cleaned up %d orphaned sensor configs: %s", len(orphaned), orphaned
        )

    # Clean up orphaned entity and device registry entries
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    valid_ids = set()
    for fp in floor_plan_store.get_floor_plans():
        for room in fp.get_all_rooms():
            valid_ids.add(room.id)
        for floor in fp.floors:
            for zone in floor.zones:
                valid_ids.add(zone.id)

    def _is_orphaned(unique_id: str) -> bool:
        """Check if a unique_id belongs to a region that no longer exists."""
        if not unique_id.startswith("fp_"):
            return False
        for suffix in ("_occupancy", "_occupancy_override"):
            if unique_id.endswith(suffix):
                region_id = unique_id[3 : -len(suffix)]
                return region_id not in valid_ids
        return False

    orphaned_entities = [
        ent
        for ent in er.async_entries_for_config_entry(ent_reg, entry.entry_id)
        if _is_orphaned(ent.unique_id)
    ]
    for ent in orphaned_entities:
        _LOGGER.info("Removing orphaned entity %s (%s)", ent.entity_id, ent.unique_id)
        ent_reg.async_remove(ent.entity_id)

    # Clean up orphaned devices (devices whose region_id no longer exists)
    for device in dr.async_entries_for_config_entry(dev_reg, entry.entry_id):
        for _, identifier in device.identifiers:
            if identifier not in valid_ids:
                _LOGGER.info("Removing orphaned device %s (%s)", device.name, device.id)
                dev_reg.async_remove_device(device.id)
                break

    # Initialize virtual sensor engine
    sensor_engine = VirtualSensorEngine(hass, floor_plan_store)

    # Initialize mmWave target processor
    mmwave_processor = MmwaveTargetProcessor(hass, floor_plan_store)

    # Initialize simulated target processor
    sim_processor = SimulatedTargetProcessor(hass, floor_plan_store, sensor_engine)

    # Store references
    hass.data[DOMAIN] = {
        "store": floor_plan_store,
        "image_store": image_store,
        "sensor_engine": sensor_engine,
        "mmwave_processor": mmwave_processor,
        "sim_processor": sim_processor,
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
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig("/inhabit/panel.js", panel_path, cache_headers=False),
            ]
        )
    else:
        hass.http.register_static_path(
            "/inhabit/panel.js", panel_path, cache_headers=False
        )

    # Register panel (only if not already registered)
    panels = hass.data.get("frontend_panels", {})

    if "inhabit" not in panels:
        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title="Floorplan",
            sidebar_icon="mdi:floor-plan",
            frontend_url_path="inhabit",
            require_admin=False,
            config={
                "_panel_custom": {
                    "name": "ha-floorplan-panel",
                    "module_url": "/inhabit/panel.js",
                }
            },
        )

    # Set up platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS_LIST)

    # Sync device areas from stored model to device registry
    _sync_all_device_areas(hass, floor_plan_store, dev_reg)

    # Start the sensor engine
    await sensor_engine.async_start()

    # Start mmWave target processor (after sensor engine, so subscriptions are ready)
    await mmwave_processor.async_start()

    _LOGGER.info("Inhabit Floor Plan Builder setup complete")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading Inhabit Floor Plan Builder")

    # Stop mmWave target processor
    mmwave_processor: MmwaveTargetProcessor = hass.data[DOMAIN]["mmwave_processor"]
    await mmwave_processor.async_stop()

    # Clear simulated targets
    sim_processor: SimulatedTargetProcessor = hass.data[DOMAIN]["sim_processor"]
    sim_processor.clear_all()

    # Stop sensor engine
    sensor_engine: VirtualSensorEngine = hass.data[DOMAIN]["sensor_engine"]
    await sensor_engine.async_stop()

    # Flush any pending delayed saves to prevent data loss
    store: FloorPlanStore = hass.data[DOMAIN]["store"]
    await store.async_save()

    # Unload platforms
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS_LIST)

    if unload_ok:
        hass.data.pop(DOMAIN)

    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)
