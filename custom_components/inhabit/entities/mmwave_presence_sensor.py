"""mmWave virtual presence sensor entities."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo

from ..const import DOMAIN
from ..engine.mmwave_target_processor import SIGNAL_MMWAVE_TARGETS_UPDATED
from ..models.floor_plan import Coordinates

_LOGGER = logging.getLogger(__name__)


class MmwavePresenceSensor(BinarySensorEntity):
    """Virtual presence sensor for an mmWave placement + region pair.

    Turns on when at least one target from the placement is inside
    the region (room or zone).
    """

    _attr_device_class = BinarySensorDeviceClass.PRESENCE
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        hass: HomeAssistant,
        floor_plan_id: str,
        floor_plan_name: str,
        placement_id: str,
        region_id: str,
        region_name: str,
    ) -> None:
        self.hass = hass
        self._floor_plan_id = floor_plan_id
        self._placement_id = placement_id
        self._region_id = region_id

        self._attr_unique_id = f"mmwave_{placement_id}_{region_id}_presence"
        self._attr_name = f"mmWave {region_name} Presence"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, floor_plan_id)},
            name=f"{floor_plan_name} Floor Plan",
            manufacturer="Inhabit",
            model="Virtual Floor Plan",
        )

        self._target_count = 0

    @property
    def is_on(self) -> bool:
        """Return true if any target is inside this region."""
        return self._target_count > 0

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "placement_id": self._placement_id,
            "region_id": self._region_id,
            "target_count": self._target_count,
        }

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()

        # Get initial count from processor
        processor = self.hass.data[DOMAIN].get("mmwave_processor")
        if processor:
            regions = processor.get_regions_with_targets()
            placements_in_region = regions.get(self._region_id, set())
            if self._placement_id in placements_in_region:
                # Count targets from this placement in this region
                hits = processor._region_hits.get(self._placement_id, {})
                self._target_count = sum(
                    1 for rid in hits.values() if rid == self._region_id
                )

        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                SIGNAL_MMWAVE_TARGETS_UPDATED,
                self._handle_target_update,
            )
        )

    @callback
    def _handle_target_update(
        self,
        placement_id: str,
        target_index: int,
        world_pos: Coordinates,
        region_id: str | None,
    ) -> None:
        if placement_id != self._placement_id:
            return

        # Recount targets from this placement in our region
        processor = self.hass.data[DOMAIN].get("mmwave_processor")
        if not processor:
            return

        hits = processor._region_hits.get(self._placement_id, {})
        new_count = sum(1 for rid in hits.values() if rid == self._region_id)

        if new_count != self._target_count:
            self._target_count = new_count
            self.async_write_ha_state()
