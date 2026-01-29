"""Door-aware occupancy state machine."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import TYPE_CHECKING, Any, Callable

from homeassistant.const import STATE_ON, STATE_OFF
from homeassistant.core import HomeAssistant, State, callback
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_call_later,
)

from ..const import OccupancyState
from ..models.virtual_sensor import OccupancyStateData, VirtualSensorConfig

if TYPE_CHECKING:
    from homeassistant.core import Event

_LOGGER = logging.getLogger(__name__)


class OccupancyStateMachine:
    """
    State machine for room occupancy with door-aware logic.

    States:
        VACANT: Room is unoccupied
        OCCUPIED: Room is occupied (motion or presence detected)
        CHECKING: Motion cleared, waiting to confirm vacancy

    Transitions:
        VACANT → OCCUPIED: Motion or presence detected
        OCCUPIED → CHECKING: All sensors clear
        CHECKING → OCCUPIED: Motion or presence detected
        CHECKING → VACANT: Timeout reached (door-aware)
    """

    def __init__(
        self,
        hass: HomeAssistant,
        config: VirtualSensorConfig,
        on_state_change: Callable[[OccupancyStateData], None],
    ) -> None:
        """Initialize the state machine."""
        self.hass = hass
        self.config = config
        self._on_state_change = on_state_change
        self._state = OccupancyStateData(state=OccupancyState.VACANT)
        self._unsub_state_listeners: list[Callable[[], None]] = []
        self._checking_timer: Callable[[], None] | None = None
        self._running = False

    @property
    def state(self) -> OccupancyStateData:
        """Get current state."""
        return self._state

    @property
    def is_occupied(self) -> bool:
        """Check if room is considered occupied."""
        return self._state.state in (OccupancyState.OCCUPIED, OccupancyState.CHECKING)

    async def async_start(self) -> None:
        """Start the state machine and subscribe to sensors."""
        if self._running:
            return

        self._running = True
        _LOGGER.debug(
            "Starting occupancy state machine for room %s", self.config.room_id
        )

        # Subscribe to motion sensors
        for binding in self.config.motion_sensors:
            unsub = async_track_state_change_event(
                self.hass,
                binding.entity_id,
                self._handle_motion_event,
            )
            self._unsub_state_listeners.append(unsub)

        # Subscribe to presence sensors
        for binding in self.config.presence_sensors:
            unsub = async_track_state_change_event(
                self.hass,
                binding.entity_id,
                self._handle_presence_event,
            )
            self._unsub_state_listeners.append(unsub)

        # Subscribe to door sensors
        for binding in self.config.door_sensors:
            unsub = async_track_state_change_event(
                self.hass,
                binding.entity_id,
                self._handle_door_event,
            )
            self._unsub_state_listeners.append(unsub)

        # Check initial state
        await self._evaluate_initial_state()

    async def async_stop(self) -> None:
        """Stop the state machine and unsubscribe from sensors."""
        self._running = False
        _LOGGER.debug(
            "Stopping occupancy state machine for room %s", self.config.room_id
        )

        # Cancel checking timer
        self._cancel_checking_timer()

        # Unsubscribe from all sensors
        for unsub in self._unsub_state_listeners:
            unsub()
        self._unsub_state_listeners.clear()

    def set_state(self, new_state: str, reason: str = "") -> None:
        """Manually set the state."""
        if new_state not in (
            OccupancyState.VACANT,
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        ):
            _LOGGER.warning("Invalid state: %s", new_state)
            return

        old_state = self._state.state
        self._state.state = new_state

        if new_state == OccupancyState.CHECKING:
            self._state.checking_started_at = datetime.now()
            self._start_checking_timer()
        else:
            self._state.checking_started_at = None
            self._cancel_checking_timer()

        _LOGGER.info(
            "Room %s state: %s → %s (%s)",
            self.config.room_id,
            old_state,
            new_state,
            reason,
        )
        self._notify_state_change()

    async def _evaluate_initial_state(self) -> None:
        """Evaluate initial state based on current sensor values."""
        # Check if any motion sensors are active
        for binding in self.config.motion_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                self._transition_to_occupied("initial motion detected")
                return

        # Check if any presence sensors are active
        for binding in self.config.presence_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                self._transition_to_occupied("initial presence detected")
                return

        # No activity detected
        _LOGGER.debug(
            "Room %s initial state: VACANT (no activity)", self.config.room_id
        )

    @callback
    def _handle_motion_event(self, event: Event) -> None:
        """Handle motion sensor state change."""
        new_state: State | None = event.data.get("new_state")
        if not new_state:
            return

        entity_id = event.data.get("entity_id", "")
        binding = self._get_motion_binding(entity_id)
        if not binding:
            return

        is_active = self._is_sensor_active(new_state, binding.inverted)
        _LOGGER.debug(
            "Room %s motion event: %s = %s (active=%s)",
            self.config.room_id,
            entity_id,
            new_state.state,
            is_active,
        )

        if is_active:
            self._state.last_motion_at = datetime.now()
            self._update_contributing_sensors(entity_id, add=True)
            self._transition_to_occupied(f"motion from {entity_id}")
        else:
            self._update_contributing_sensors(entity_id, add=False)
            self._check_all_sensors_clear()

    @callback
    def _handle_presence_event(self, event: Event) -> None:
        """Handle presence sensor state change."""
        new_state: State | None = event.data.get("new_state")
        if not new_state:
            return

        entity_id = event.data.get("entity_id", "")
        binding = self._get_presence_binding(entity_id)
        if not binding:
            return

        is_active = self._is_sensor_active(new_state, binding.inverted)
        _LOGGER.debug(
            "Room %s presence event: %s = %s (active=%s)",
            self.config.room_id,
            entity_id,
            new_state.state,
            is_active,
        )

        if is_active:
            self._state.last_presence_at = datetime.now()
            self._update_contributing_sensors(entity_id, add=True)
            self._transition_to_occupied(f"presence from {entity_id}")
        else:
            self._update_contributing_sensors(entity_id, add=False)
            self._check_all_sensors_clear()

    @callback
    def _handle_door_event(self, event: Event) -> None:
        """Handle door sensor state change."""
        new_state: State | None = event.data.get("new_state")
        if not new_state:
            return

        entity_id = event.data.get("entity_id", "")
        binding = self._get_door_binding(entity_id)
        if not binding:
            return

        is_open = self._is_sensor_active(new_state, binding.inverted)
        self._state.last_door_event_at = datetime.now()

        _LOGGER.debug(
            "Room %s door event: %s = %s (open=%s)",
            self.config.room_id,
            entity_id,
            new_state.state,
            is_open,
        )

        # Door opening while checking can reset timer or trigger transition
        if is_open and self._state.state == OccupancyState.CHECKING:
            if self.config.door_open_resets_checking:
                _LOGGER.debug(
                    "Room %s: door opened during CHECKING, resetting timer",
                    self.config.room_id,
                )
                self._start_checking_timer()

    def _transition_to_occupied(self, reason: str) -> None:
        """Transition to OCCUPIED state."""
        if self._state.state == OccupancyState.OCCUPIED:
            return

        self._cancel_checking_timer()
        old_state = self._state.state
        self._state.state = OccupancyState.OCCUPIED
        self._state.checking_started_at = None
        self._state.confidence = self._calculate_confidence()

        _LOGGER.info(
            "Room %s: %s → OCCUPIED (%s)",
            self.config.room_id,
            old_state,
            reason,
        )
        self._notify_state_change()

    def _transition_to_checking(self, reason: str) -> None:
        """Transition to CHECKING state."""
        if self._state.state != OccupancyState.OCCUPIED:
            return

        self._state.state = OccupancyState.CHECKING
        self._state.checking_started_at = datetime.now()
        self._start_checking_timer()

        _LOGGER.info(
            "Room %s: OCCUPIED → CHECKING (%s)",
            self.config.room_id,
            reason,
        )
        self._notify_state_change()

    def _transition_to_vacant(self, reason: str) -> None:
        """Transition to VACANT state."""
        # Check door-aware vacancy blocking
        if self.config.door_blocks_vacancy and self._are_all_doors_closed():
            _LOGGER.debug(
                "Room %s: vacancy blocked by closed doors",
                self.config.room_id,
            )
            return

        self._cancel_checking_timer()
        old_state = self._state.state
        self._state.state = OccupancyState.VACANT
        self._state.checking_started_at = None
        self._state.confidence = 0.0
        self._state.contributing_sensors = []

        _LOGGER.info(
            "Room %s: %s → VACANT (%s)",
            self.config.room_id,
            old_state,
            reason,
        )
        self._notify_state_change()

    def _check_all_sensors_clear(self) -> None:
        """Check if all sensors are clear and transition to CHECKING if so."""
        if self._state.state != OccupancyState.OCCUPIED:
            return

        # Check motion sensors
        for binding in self.config.motion_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                return

        # Check presence sensors
        for binding in self.config.presence_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                return

        # All sensors clear
        self._transition_to_checking("all sensors clear")

    def _start_checking_timer(self) -> None:
        """Start the checking state timeout timer."""
        self._cancel_checking_timer()

        @callback
        def _checking_timeout(_now: Any) -> None:
            """Handle checking timeout."""
            self._checking_timer = None
            if self._state.state == OccupancyState.CHECKING:
                self._transition_to_vacant("checking timeout")

        self._checking_timer = async_call_later(
            self.hass,
            self.config.checking_timeout,
            _checking_timeout,
        )

    def _cancel_checking_timer(self) -> None:
        """Cancel the checking state timeout timer."""
        if self._checking_timer:
            self._checking_timer()
            self._checking_timer = None

    def _are_all_doors_closed(self) -> bool:
        """Check if all door sensors indicate closed doors."""
        if not self.config.door_sensors:
            return False

        for binding in self.config.door_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                return False  # At least one door is open

        return True

    def _is_sensor_active(self, state: State, inverted: bool) -> bool:
        """Check if a sensor is in an active state."""
        is_on = state.state in (STATE_ON, "on", "detected", "open", "true", "1")
        return not is_on if inverted else is_on

    def _get_motion_binding(self, entity_id: str) -> Any:
        """Get motion sensor binding by entity ID."""
        for binding in self.config.motion_sensors:
            if binding.entity_id == entity_id:
                return binding
        return None

    def _get_presence_binding(self, entity_id: str) -> Any:
        """Get presence sensor binding by entity ID."""
        for binding in self.config.presence_sensors:
            if binding.entity_id == entity_id:
                return binding
        return None

    def _get_door_binding(self, entity_id: str) -> Any:
        """Get door sensor binding by entity ID."""
        for binding in self.config.door_sensors:
            if binding.entity_id == entity_id:
                return binding
        return None

    def _update_contributing_sensors(self, entity_id: str, add: bool) -> None:
        """Update list of contributing sensors."""
        if add:
            if entity_id not in self._state.contributing_sensors:
                self._state.contributing_sensors.append(entity_id)
        else:
            if entity_id in self._state.contributing_sensors:
                self._state.contributing_sensors.remove(entity_id)

    def _calculate_confidence(self) -> float:
        """Calculate occupancy confidence based on contributing sensors."""
        if not self._state.contributing_sensors:
            return 0.0

        total_weight = 0.0
        active_weight = 0.0

        for binding in self.config.motion_sensors:
            total_weight += binding.weight
            if binding.entity_id in self._state.contributing_sensors:
                active_weight += binding.weight

        for binding in self.config.presence_sensors:
            total_weight += binding.weight * 1.5  # Presence sensors weighted higher
            if binding.entity_id in self._state.contributing_sensors:
                active_weight += binding.weight * 1.5

        if total_weight == 0:
            return 0.5 if self._state.contributing_sensors else 0.0

        return min(1.0, active_weight / total_weight)

    def _notify_state_change(self) -> None:
        """Notify listeners of state change."""
        self._on_state_change(self._state)
