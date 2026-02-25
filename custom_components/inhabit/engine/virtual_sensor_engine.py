"""Virtual sensor engine that manages all room occupancy state machines."""

from __future__ import annotations

import logging
from collections import deque
from datetime import datetime, timedelta
from typing import TYPE_CHECKING

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)

from ..const import DOMAIN, OccupancyState
from ..models.virtual_sensor import (
    OccupancyHistoryEntry,
    OccupancyStateData,
    VirtualSensorConfig,
)
from .feedback_controller import FeedbackController
from .house_occupancy_guard import HouseOccupancyGuard
from .mmwave_target_processor import SIGNAL_MMWAVE_TARGETS_UPDATED
from .occupancy_state_machine import OccupancyStateMachine

if TYPE_CHECKING:
    from collections.abc import Callable

    from ..models.floor_plan import Coordinates
    from ..store.floor_plan_store import FloorPlanStore

_LOGGER = logging.getLogger(__name__)

SIGNAL_OCCUPANCY_STATE_CHANGED = f"{DOMAIN}_occupancy_state_changed"


class VirtualSensorEngine:
    """
    Manages virtual occupancy sensors for all rooms.

    Creates and manages OccupancyStateMachine instances for each room
    that has occupancy detection enabled, plus a HouseOccupancyGuard
    that prevents the entire house from going vacant when no exterior
    door has opened.

    Zones with occupies_parent propagate their occupancy up to their
    parent room — the parent stays OCCUPIED as long as any child zone is.
    """

    def __init__(self, hass: HomeAssistant, store: FloorPlanStore) -> None:
        """Initialize the virtual sensor engine."""
        self.hass = hass
        self._store = store
        self._state_machines: dict[str, OccupancyStateMachine] = {}
        self._house_guard = HouseOccupancyGuard(hass, store)
        self._feedback_controller = FeedbackController(hass)
        self._running = False
        self._unsub_mmwave: Callable[[], None] | None = None

        # Per-region target tracking: {region_id: set of "placement_id:target_index" keys}
        self._mmwave_target_keys_per_region: dict[str, set[str]] = {}

        # Occupancy history tracking
        self._occupancy_history: deque[OccupancyHistoryEntry] = deque(maxlen=2000)
        # Tracks when each room last transitioned (for duration calculation)
        self._last_transition_time: dict[str, datetime] = {}

        # Parent-child zone mapping: parent_room_id → set of zone_ids
        self._parent_zones: dict[str, set[str]] = {}

    @property
    def running(self) -> bool:
        """Check if the engine is running."""
        return self._running

    @property
    def house_guard(self) -> HouseOccupancyGuard:
        """Get the house occupancy guard."""
        return self._house_guard

    @property
    def feedback_controller(self) -> FeedbackController:
        """Get the feedback controller."""
        return self._feedback_controller

    async def async_start(self) -> None:
        """Start the engine and create state machines for all configured rooms."""
        if self._running:
            return

        self._running = True
        _LOGGER.info("Starting virtual sensor engine")

        # Load persisted occupancy history
        await self._load_history()

        # Load feedback data
        self._feedback_controller.load_data(self._store.get_feedback_data())

        # Start house guard first (discovers exterior doors)
        await self._house_guard.async_start()

        # Resolve parent_room_id for zones with occupies_parent
        self._resolve_zone_parents()

        # Subscribe to mmWave target updates
        self._unsub_mmwave = async_dispatcher_connect(
            self.hass,
            SIGNAL_MMWAVE_TARGETS_UPDATED,
            self._handle_mmwave_target_update,
        )

        # Load all sensor configs and create state machines
        configs = self._store.get_all_sensor_configs()
        for config in configs:
            if config.enabled:
                await self._create_state_machine(config)

        # Load persisted timeout histories
        self._load_timeout_histories()

        # Load persisted sensor reliability data
        self._load_reliability_data()

        _LOGGER.info(
            "Virtual sensor engine started with %d state machines",
            len(self._state_machines),
        )

    async def async_stop(self) -> None:
        """Stop the engine and all state machines."""
        if not self._running:
            return

        _LOGGER.info("Stopping virtual sensor engine")

        # Save sensor reliability data before stopping
        self._save_reliability_data()

        self._running = False

        # Save timeout histories before stopping
        self._save_timeout_histories()

        # Persist occupancy history before stopping
        await self._save_history()

        # Unsubscribe from mmWave target updates
        if self._unsub_mmwave:
            self._unsub_mmwave()
            self._unsub_mmwave = None
        self._mmwave_target_keys_per_region.clear()

        # Save feedback data before stopping
        self._store.save_feedback_data(self._feedback_controller.save_data())

        # Stop all state machines
        for _room_id, machine in list(self._state_machines.items()):
            await machine.async_stop()

        self._state_machines.clear()
        self._parent_zones.clear()
        self._last_transition_time.clear()

        # Stop house guard
        await self._house_guard.async_stop()

        _LOGGER.info("Virtual sensor engine stopped")

    async def async_refresh(self) -> None:
        """Refresh all state machines from current configuration."""
        _LOGGER.debug("Refreshing virtual sensor engine")

        # Re-resolve zone parents
        self._resolve_zone_parents()

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
            self._resolve_zone_parents()
            await self._create_state_machine(config)

    async def async_remove_room(self, room_id: str) -> None:
        """Remove a room from the engine."""
        await self._remove_state_machine(room_id)

    async def async_update_room(self, config: VirtualSensorConfig) -> None:
        """Update a room's configuration."""
        self._resolve_zone_parents()
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

    # ------------------------------------------------------------------
    # Zone → parent room propagation
    # ------------------------------------------------------------------

    def _resolve_zone_parents(self) -> None:
        """Build the parent_room_id → zone_ids mapping from floor plan data."""
        self._parent_zones.clear()

        for fp in self._store.get_floor_plans():
            for floor in fp.floors:
                for zone in floor.zones:
                    if not zone.occupies_parent or not zone.room_id:
                        continue

                    # Update the sensor config's parent_room_id
                    config = self._store.get_sensor_config(zone.id)
                    if config:
                        config.occupies_parent = True
                        config.parent_room_id = zone.room_id

                    self._parent_zones.setdefault(zone.room_id, set()).add(
                        zone.id
                    )

        if self._parent_zones:
            _LOGGER.debug(
                "Zone parent mapping: %s",
                {k: list(v) for k, v in self._parent_zones.items()},
            )

    def _is_occupied_by_children(self, room_id: str) -> bool:
        """Check if any child zone with occupies_parent is occupied."""
        child_zones = self._parent_zones.get(room_id)
        if not child_zones:
            return False

        for zone_id in child_zones:
            machine = self._state_machines.get(zone_id)
            if machine and machine.is_occupied:
                return True

        return False

    def _propagate_to_parent(self, zone_id: str, state: str) -> None:
        """Propagate zone occupancy to parent room."""
        # Find the parent room for this zone
        parent_room_id = None
        for parent_id, zone_ids in self._parent_zones.items():
            if zone_id in zone_ids:
                parent_room_id = parent_id
                break

        if not parent_room_id:
            return

        parent_machine = self._state_machines.get(parent_room_id)
        if not parent_machine:
            return

        if state in (OccupancyState.OCCUPIED, OccupancyState.CHECKING):
            # Zone is occupied → parent must be occupied
            if parent_machine.state.state != OccupancyState.OCCUPIED:
                _LOGGER.info(
                    "Propagating occupancy from zone %s to parent room %s",
                    zone_id,
                    parent_room_id,
                )
                parent_machine.set_state(
                    OccupancyState.OCCUPIED,
                    f"child zone {zone_id} occupied",
                )

    # ------------------------------------------------------------------
    # Timeout history persistence
    # ------------------------------------------------------------------

    def _save_timeout_histories(self) -> None:
        """Save all timeout histories to the store for persistence."""
        timeout_history: dict[str, list[dict]] = {}

        for room_id, machine in self._state_machines.items():
            records = machine.timeout_manager.get_session_history()
            if records:
                timeout_history[room_id] = [r.to_dict() for r in records]

        self._store.save_timeout_history(timeout_history)
        _LOGGER.debug(
            "Saved timeout histories for %d rooms", len(timeout_history)
        )

    def _load_timeout_histories(self) -> None:
        """Load timeout histories from the store and distribute to managers."""
        timeout_history = self._store.get_timeout_history()
        if not timeout_history:
            return

        loaded_count = 0
        for room_id, records in timeout_history.items():
            machine = self._state_machines.get(room_id)
            if machine and records:
                machine.timeout_manager.load_session_history(records)
                loaded_count += 1

        _LOGGER.debug(
            "Loaded timeout histories for %d rooms", loaded_count
        )

    # ------------------------------------------------------------------
    # mmWave spatial presence
    # ------------------------------------------------------------------

    @callback
    def _handle_mmwave_target_update(
        self,
        placement_id: str,
        target_index: int,
        world_pos: Coordinates,
        region_id: str | None,
    ) -> None:
        """Handle an mmWave target position update from MmwaveTargetProcessor.

        Tracks which targets are in which regions and feeds the target count
        into each region's state machine via update_spatial_presence().
        """
        target_key = f"{placement_id}:{target_index}"

        # Find the old region this target was in (if any)
        old_region: str | None = None
        for rid, target_keys in self._mmwave_target_keys_per_region.items():
            if target_key in target_keys:
                old_region = rid
                break

        if old_region == region_id:
            # Target stayed in the same region — nothing to do
            return

        # Remove target from old region
        if old_region:
            self._mmwave_target_keys_per_region[old_region].discard(target_key)
            old_count = len(self._mmwave_target_keys_per_region[old_region])
            if old_count == 0:
                del self._mmwave_target_keys_per_region[old_region]
            self._route_spatial_presence(old_region, old_count)

        # Add target to new region
        if region_id:
            self._mmwave_target_keys_per_region.setdefault(region_id, set()).add(
                target_key
            )
            new_count = len(self._mmwave_target_keys_per_region[region_id])
            self._route_spatial_presence(region_id, new_count)

    def _route_spatial_presence(self, region_id: str, target_count: int) -> None:
        """Route a spatial presence update to the correct state machine.

        Only affects rooms/zones with presence_affects enabled.
        """
        config = self._store.get_sensor_config(region_id)
        if not config or not config.enabled or not config.presence_affects:
            return

        machine = self._state_machines.get(region_id)
        if not machine:
            return

        machine.update_spatial_presence(target_count)
        _LOGGER.debug(
            "Routed spatial presence to %s: %d targets", region_id, target_count
        )

    # Sensor reliability persistence
    # ------------------------------------------------------------------

    def _load_reliability_data(self) -> None:
        """Load persisted reliability data and distribute to state machines."""
        reliability_data = self._store.get_sensor_reliability()
        if not reliability_data:
            return

        for room_id, sensor_records in reliability_data.items():
            machine = self._state_machines.get(room_id)
            if machine:
                machine.reliability_tracker.load_records(sensor_records)
                _LOGGER.debug(
                    "Loaded reliability data for room %s (%d sensors)",
                    room_id,
                    len(sensor_records),
                )

    def _save_reliability_data(self) -> None:
        """Save reliability data from all state machines to the store."""
        reliability_data: dict[str, dict] = {}

        for room_id, machine in self._state_machines.items():
            records = machine.reliability_tracker.save_records()
            if records:
                reliability_data[room_id] = records

        if reliability_data:
            self._store.save_sensor_reliability(reliability_data)
            _LOGGER.debug(
                "Saved reliability data for %d rooms", len(reliability_data)
            )

    # ------------------------------------------------------------------
    # State machine lifecycle
    # ------------------------------------------------------------------

    async def _create_state_machine(self, config: VirtualSensorConfig) -> None:
        """Create a state machine for a room."""
        _LOGGER.debug("Creating state machine for room %s", config.room_id)

        machine = OccupancyStateMachine(
            self.hass,
            config,
            lambda state, reason, room_id=config.room_id: self._on_state_change(
                room_id, state, reason
            ),
            can_go_vacant=self._house_guard.can_room_go_vacant,
            is_occupied_by_children=self._is_occupied_by_children,
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

            # Update house guard
            self._house_guard.on_room_state_changed(room_id, OccupancyState.VACANT)

            # Clean up parent zone mapping
            for zone_ids in self._parent_zones.values():
                zone_ids.discard(room_id)

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
    def _on_state_change(
        self, room_id: str, state: OccupancyStateData, reason: str = ""
    ) -> None:
        """Handle state change from a state machine."""
        _LOGGER.debug(
            "Room %s state changed: %s (confidence: %.2f, sealed: %s, reason: %s)",
            room_id,
            state.state,
            state.confidence,
            state.sealed,
            reason,
        )

        # Record history entry
        now = datetime.now()
        duration: float | None = None
        last_time = self._last_transition_time.get(room_id)
        if last_time is not None:
            duration = (now - last_time).total_seconds()
        self._last_transition_time[room_id] = now

        entry = OccupancyHistoryEntry(
            room_id=room_id,
            state=state.state,
            timestamp=now.isoformat(),
            reason=state.transition_reason,
            confidence=state.confidence,
            previous_state=state.previous_state,
            duration_seconds=duration,
        )
        self._occupancy_history.append(entry)

        # Record override events for feedback learning
        if "manual override" in reason or "override trigger" in reason:
            # Determine the previous state from the transition
            # The state machine has already transitioned, so we infer the previous
            # state from the override direction
            machine = self._state_machines.get(room_id)
            if machine:
                # For manual overrides, the previous state was the opposite direction
                # We can determine it from the new state:
                # - If new state is VACANT, previous was OCCUPIED or CHECKING
                # - If new state is OCCUPIED, previous was VACANT
                if state.state == OccupancyState.VACANT:
                    previous_state = OccupancyState.OCCUPIED
                elif state.state == OccupancyState.OCCUPIED:
                    previous_state = OccupancyState.VACANT
                else:
                    previous_state = OccupancyState.OCCUPIED

                self._feedback_controller.record_override(
                    room_id=room_id,
                    previous_state=previous_state,
                    new_state=state.state,
                    confidence=state.confidence,
                    seal_probability=0.0,
                    contributing_sensors=list(state.contributing_sensors),
                )

        # Update house guard
        self._house_guard.on_room_state_changed(room_id, state.state)

        # Propagate zone occupancy to parent room
        self._propagate_to_parent(room_id, state.state)

        # Dispatch signal for entity updates
        async_dispatcher_send(
            self.hass,
            SIGNAL_OCCUPANCY_STATE_CHANGED,
            room_id,
            state,
        )

    def get_occupancy_history(
        self, room_id: str | None = None, limit: int = 100
    ) -> list[OccupancyHistoryEntry]:
        """Get occupancy history, optionally filtered by room."""
        entries = list(self._occupancy_history)
        if room_id:
            entries = [e for e in entries if e.room_id == room_id]
        return entries[-limit:]

    async def _load_history(self) -> None:
        """Load occupancy history from the store."""
        raw = self._store.get_occupancy_history()
        if not raw:
            return

        cutoff = datetime.now() - timedelta(days=7)
        for item in raw:
            try:
                entry = OccupancyHistoryEntry.from_dict(item)
                # Prune entries older than 7 days
                ts = datetime.fromisoformat(entry.timestamp)
                if ts >= cutoff:
                    self._occupancy_history.append(entry)
            except (ValueError, KeyError):
                _LOGGER.debug("Skipping invalid history entry: %s", item)

        _LOGGER.debug(
            "Loaded %d occupancy history entries", len(self._occupancy_history)
        )

    async def _save_history(self) -> None:
        """Save occupancy history to the store."""
        entries = [e.to_dict() for e in self._occupancy_history]
        self._store.save_occupancy_history(entries)
        _LOGGER.debug("Saved %d occupancy history entries", len(entries))
