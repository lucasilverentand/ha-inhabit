"""Virtual sensor engine that manages all room occupancy state machines."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send

from ..const import DOMAIN
from ..models.virtual_sensor import OccupancyStateData, VirtualSensorConfig
from .occupancy_state_machine import OccupancyStateMachine

if TYPE_CHECKING:
    from ..store.floor_plan_store import FloorPlanStore

_LOGGER = logging.getLogger(__name__)

SIGNAL_OCCUPANCY_STATE_CHANGED = f"{DOMAIN}_occupancy_state_changed"


class VirtualSensorEngine:
    """
    Manages virtual occupancy sensors for all rooms.

    Creates and manages OccupancyStateMachine instances for each room
    that has occupancy detection enabled.
    """

    def __init__(self, hass: HomeAssistant, store: FloorPlanStore) -> None:
        """Initialize the virtual sensor engine."""
        self.hass = hass
        self._store = store
        self._state_machines: dict[str, OccupancyStateMachine] = {}
        self._running = False

    @property
    def running(self) -> bool:
        """Check if the engine is running."""
        return self._running

    async def async_start(self) -> None:
        """Start the engine and create state machines for all configured rooms."""
        if self._running:
            return

        self._running = True
        _LOGGER.info("Starting virtual sensor engine")

        # Load all sensor configs and create state machines
        configs = self._store.get_all_sensor_configs()
        for config in configs:
            if config.enabled:
                await self._create_state_machine(config)

        _LOGGER.info(
            "Virtual sensor engine started with %d state machines",
            len(self._state_machines),
        )

    async def async_stop(self) -> None:
        """Stop the engine and all state machines."""
        if not self._running:
            return

        _LOGGER.info("Stopping virtual sensor engine")
        self._running = False

        # Stop all state machines
        for _room_id, machine in list(self._state_machines.items()):
            await machine.async_stop()

        self._state_machines.clear()
        _LOGGER.info("Virtual sensor engine stopped")

    async def async_refresh(self) -> None:
        """Refresh all state machines from current configuration."""
        _LOGGER.debug("Refreshing virtual sensor engine")

        # Get current configs
        configs = self._store.get_all_sensor_configs()
        config_map = {c.room_id: c for c in configs if c.enabled}

        # Remove state machines for rooms that no longer exist or are disabled
        for room_id in list(self._state_machines.keys()):
            if room_id not in config_map:
                await self._remove_state_machine(room_id)

        # Add or update state machines
        for room_id, config in config_map.items():
            if room_id in self._state_machines:
                # Update existing machine
                await self._update_state_machine(room_id, config)
            else:
                # Create new machine
                await self._create_state_machine(config)

    async def async_add_room(self, config: VirtualSensorConfig) -> None:
        """Add a new room to the engine."""
        if config.room_id in self._state_machines:
            _LOGGER.warning("State machine already exists for room %s", config.room_id)
            return

        if config.enabled:
            await self._create_state_machine(config)

    async def async_remove_room(self, room_id: str) -> None:
        """Remove a room from the engine."""
        await self._remove_state_machine(room_id)

    async def async_update_room(self, config: VirtualSensorConfig) -> None:
        """Update a room's configuration."""
        if config.room_id in self._state_machines:
            if config.enabled:
                await self._update_state_machine(config.room_id, config)
            else:
                await self._remove_state_machine(config.room_id)
        elif config.enabled:
            await self._create_state_machine(config)

    def get_state(self, room_id: str) -> OccupancyStateData | None:
        """Get the current state for a room."""
        machine = self._state_machines.get(room_id)
        if machine:
            return machine.state
        return None

    def get_all_states(self) -> dict[str, OccupancyStateData]:
        """Get all room states."""
        return {
            room_id: machine.state for room_id, machine in self._state_machines.items()
        }

    def set_room_occupancy(self, room_id: str, state: str) -> bool:
        """Manually set a room's occupancy state."""
        machine = self._state_machines.get(room_id)
        if not machine:
            _LOGGER.warning("No state machine found for room %s", room_id)
            return False

        machine.set_state(state, "manual override")
        return True

    async def _create_state_machine(self, config: VirtualSensorConfig) -> None:
        """Create a state machine for a room."""
        _LOGGER.debug("Creating state machine for room %s", config.room_id)

        machine = OccupancyStateMachine(
            self.hass,
            config,
            lambda state, room_id=config.room_id: self._on_state_change(room_id, state),
        )

        self._state_machines[config.room_id] = machine
        await machine.async_start()

        # Notify that a new sensor is available
        async_dispatcher_send(
            self.hass,
            f"{DOMAIN}_sensor_added",
            config.room_id,
        )

    async def _remove_state_machine(self, room_id: str) -> None:
        """Remove a state machine for a room."""
        machine = self._state_machines.pop(room_id, None)
        if machine:
            _LOGGER.debug("Removing state machine for room %s", room_id)
            await machine.async_stop()

            # Notify that the sensor is being removed
            async_dispatcher_send(
                self.hass,
                f"{DOMAIN}_sensor_removed",
                room_id,
            )

    async def _update_state_machine(
        self, room_id: str, config: VirtualSensorConfig
    ) -> None:
        """Update a state machine with new configuration."""
        _LOGGER.debug("Updating state machine for room %s", room_id)

        # Stop the old machine
        old_machine = self._state_machines.pop(room_id, None)
        if old_machine:
            await old_machine.async_stop()

        # Create a new machine with updated config
        await self._create_state_machine(config)

    @callback
    def _on_state_change(self, room_id: str, state: OccupancyStateData) -> None:
        """Handle state change from a state machine."""
        _LOGGER.debug(
            "Room %s state changed: %s (confidence: %.2f)",
            room_id,
            state.state,
            state.confidence,
        )

        # Dispatch signal for entity updates
        async_dispatcher_send(
            self.hass,
            SIGNAL_OCCUPANCY_STATE_CHANGED,
            room_id,
            state,
        )
