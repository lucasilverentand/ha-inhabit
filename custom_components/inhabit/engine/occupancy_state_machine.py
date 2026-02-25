"""Door-seal-aware occupancy state machine."""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import datetime
from typing import TYPE_CHECKING, Any

from homeassistant.const import STATE_ON, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant, State, callback
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
)

from ..const import EVENT_CHECKING_RESOLVED, EVENT_CHECKING_STARTED, OccupancyState
from ..models.virtual_sensor import OccupancyStateData, VirtualSensorConfig

if TYPE_CHECKING:
    from homeassistant.core import Event

_LOGGER = logging.getLogger(__name__)


class OccupancyStateMachine:
    """
    State machine for room occupancy with door-seal logic.

    States:
        VACANT: Room is unoccupied
        OCCUPIED: Room is occupied (motion or presence detected)
        CHECKING: Motion cleared, waiting to confirm vacancy

    Door Seal:
        A room is "sealed" when someone was detected inside and ALL doors
        have remained closed since that detection.  A sealed room cannot
        transition to VACANT because the occupant physically cannot have
        left.  The seal is broken when any door opens, any door sensor
        becomes unavailable, or the safety-valve timer expires.

    Long-Stay Zones:
        Zones marked long_stay (couch, bed, dining table) get a longer
        seal expiry so mmWave dropouts during extended sitting/sleeping
        don't cause false vacancy.

    Hold-Until-Exit (bed/couch mode):
        When hold_until_exit is True, the zone stays OCCUPIED after
        detection even when its own sensors clear.  It only transitions
        to CHECKING when an *exit sensor* fires — an external sensor
        that proves the occupant left (e.g. the bedroom's motion sensor
        for a bed zone).  This inverts the detection model: instead of
        "detect someone here," it becomes "detect that they left."
    """

    def __init__(
        self,
        hass: HomeAssistant,
        config: VirtualSensorConfig,
        on_state_change: Callable[[OccupancyStateData], None],
        can_go_vacant: Callable[[str], bool] | None = None,
        is_occupied_by_children: Callable[[str], bool] | None = None,
    ) -> None:
        """Initialize the state machine.

        Args:
            hass: Home Assistant instance.
            config: Virtual sensor configuration.
            on_state_change: Callback for state changes.
            can_go_vacant: Optional house-level guard callback. Returns False
                to block vacancy (e.g. house is sealed and this is the last
                occupied room).
            is_occupied_by_children: Optional callback that returns True if any
                child zone with occupies_parent is currently occupied.
        """
        self.hass = hass
        self.config = config
        self._on_state_change = on_state_change
        self._can_go_vacant = can_go_vacant
        self._is_occupied_by_children = is_occupied_by_children
        self._state = OccupancyStateData(state=OccupancyState.VACANT)
        self._unsub_state_listeners: list[Callable[[], None]] = []
        self._checking_timer: Callable[[], None] | None = None
        self._seal_expiry_timer: Callable[[], None] | None = None
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

        # Subscribe to door sensors
        for binding in self.config.door_sensors:
            unsub = async_track_state_change_event(
                self.hass,
                binding.entity_id,
                self._handle_door_event,
            )
            self._unsub_state_listeners.append(unsub)

        # Subscribe to exit sensors (hold-until-exit mode)
        for binding in self.config.exit_sensors:
            unsub = async_track_state_change_event(
                self.hass,
                binding.entity_id,
                self._handle_exit_sensor_event,
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

        self._cancel_checking_timer()
        self._cancel_seal_expiry_timer()

        for unsub in self._unsub_state_listeners:
            try:
                unsub()
            except Exception:
                _LOGGER.exception(
                    "Error unsubscribing listener for room %s",
                    self.config.room_id,
                )
        self._unsub_state_listeners.clear()

    def set_state(self, new_state: str, reason: str = "") -> None:
        """Manually set the state (e.g. from SimulatedTargetProcessor)."""
        if new_state not in (
            OccupancyState.VACANT,
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        ):
            _LOGGER.warning("Invalid state: %s", new_state)
            return

        old_state = self._state.state
        self._state.state = new_state

        if new_state == OccupancyState.OCCUPIED:
            self._cancel_checking_timer()
            self._state.checking_started_at = None
            self._evaluate_seal("manual override")
        elif new_state == OccupancyState.CHECKING:
            self._state.checking_started_at = datetime.now()
            self._break_seal("manual override to CHECKING")
            self._start_checking_timer()
        else:
            # VACANT
            self._state.checking_started_at = None
            self._break_seal("manual override to VACANT")
            self._cancel_checking_timer()
            self._state.confidence = 0.0
            self._state.contributing_sensors = []

        _LOGGER.info(
            "Room %s state: %s → %s (%s)",
            self.config.room_id,
            old_state,
            new_state,
            reason,
        )
        self._notify_state_change(reason, old_state)

    # ------------------------------------------------------------------
    # Initial state evaluation
    # ------------------------------------------------------------------

    async def _evaluate_initial_state(self) -> None:
        """Evaluate initial state based on current sensor values."""
        for binding in self.config.motion_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                self._transition_to_occupied("initial motion detected")
                return

        _LOGGER.debug(
            "Room %s initial state: VACANT (no activity)", self.config.room_id
        )

    # ------------------------------------------------------------------
    # Sensor event handlers
    # ------------------------------------------------------------------

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

        self._state.last_door_event_at = datetime.now()

        # Door sensor became unavailable — break the seal (can't trust it)
        if new_state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            _LOGGER.warning(
                "Room %s: door sensor %s became %s, breaking seal",
                self.config.room_id,
                entity_id,
                new_state.state,
            )
            if self._state.sealed:
                self._break_seal(f"door sensor {entity_id} unavailable")
                if (
                    self._state.state == OccupancyState.OCCUPIED
                    and not self._any_sensor_active()
                ):
                    self._transition_to_checking(
                        "seal broken (sensor unavailable), sensors clear"
                    )
            return

        is_open = self._is_sensor_active(new_state, binding.inverted)
        _LOGGER.debug(
            "Room %s door event: %s = %s (open=%s, sealed=%s)",
            self.config.room_id,
            entity_id,
            new_state.state,
            is_open,
            self._state.sealed,
        )

        if is_open:
            # Door opened — break the seal
            if self._state.sealed:
                self._break_seal(f"door {entity_id} opened")

                # If sensors are already clear, transition to CHECKING now
                if (
                    self._state.state == OccupancyState.OCCUPIED
                    and not self._any_sensor_active()
                ):
                    self._transition_to_checking(
                        "seal broken, sensors already clear"
                    )
        else:
            # Door closed — try to re-establish seal if currently occupied
            # with active sensors
            if (
                self._state.state == OccupancyState.OCCUPIED
                and self._all_doors_closed()
                and self._any_sensor_active()
            ):
                self._establish_seal("door closed while sensors active")

    @callback
    def _handle_exit_sensor_event(self, event: Event) -> None:
        """Handle exit sensor state change (hold-until-exit mode).

        Exit sensors are external sensors (e.g. bedroom motion sensor for
        a bed zone) that prove the occupant left the zone.  When an exit
        sensor fires while the zone is OCCUPIED in hold-until-exit mode,
        it triggers the transition to CHECKING.
        """
        if not self.config.hold_until_exit:
            return

        if self._state.state != OccupancyState.OCCUPIED:
            return

        new_state: State | None = event.data.get("new_state")
        if not new_state:
            return

        entity_id = event.data.get("entity_id", "")
        binding = self._get_exit_binding(entity_id)
        if not binding:
            return

        is_active = self._is_sensor_active(new_state, binding.inverted)
        if not is_active:
            return

        _LOGGER.info(
            "Room %s: exit sensor %s fired, releasing hold",
            self.config.room_id,
            entity_id,
        )

        # Break seal if active (exit sensor overrides the seal — the
        # person is provably no longer in the zone)
        if self._state.sealed:
            self._break_seal(f"exit sensor {entity_id} fired")

        self._transition_to_checking(f"exit sensor {entity_id}")

    # ------------------------------------------------------------------
    # Door seal logic
    # ------------------------------------------------------------------

    def _evaluate_seal(self, reason: str) -> None:
        """Evaluate whether the room should be sealed right now."""
        if not self.config.door_seals_room or not self.config.door_sensors:
            return

        if self._all_doors_closed() and not self._any_door_unavailable():
            self._establish_seal(reason)
        else:
            # Door is open or unavailable at detection time — no seal
            self._snapshot_door_states()

    def _establish_seal(self, reason: str) -> None:
        """Establish a door seal on the room."""
        if not self.config.door_seals_room:
            return

        self._state.sealed = True
        self._state.sealed_since = datetime.now()
        self._state.seal_broken_at = None
        self._snapshot_door_states()
        self._start_seal_expiry_timer()
        _LOGGER.info(
            "Room %s: seal established (%s)", self.config.room_id, reason
        )

    def _break_seal(self, reason: str) -> None:
        """Break the door seal on the room."""
        if not self._state.sealed:
            return

        self._state.sealed = False
        self._state.seal_broken_at = datetime.now()
        self._cancel_seal_expiry_timer()
        _LOGGER.info(
            "Room %s: seal broken (%s)", self.config.room_id, reason
        )

    def _snapshot_door_states(self) -> None:
        """Record current open/closed state of all doors."""
        states: dict[str, bool] = {}
        for binding in self.config.door_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                states[binding.entity_id] = self._is_sensor_active(
                    state, binding.inverted
                )
            else:
                states[binding.entity_id] = True  # Treat unknown as "open"
        self._state.door_states_at_detection = states

    def _start_seal_expiry_timer(self) -> None:
        """Start the safety-valve timer that forces seal expiry."""
        self._cancel_seal_expiry_timer()

        duration = self.config.effective_seal_max_duration

        @callback
        def _seal_expired(_now: Any) -> None:
            self._seal_expiry_timer = None
            if self._state.sealed:
                _LOGGER.info(
                    "Room %s: seal expired after %ds (safety valve)",
                    self.config.room_id,
                    duration,
                )
                self._break_seal(f"expired after {duration}s")
                if (
                    self._state.state == OccupancyState.OCCUPIED
                    and not self._any_sensor_active()
                ):
                    self._transition_to_checking("seal expired, sensors clear")

        self._seal_expiry_timer = async_call_later(
            self.hass, duration, _seal_expired
        )

    def _cancel_seal_expiry_timer(self) -> None:
        """Cancel the seal expiry timer."""
        if self._seal_expiry_timer:
            self._seal_expiry_timer()
            self._seal_expiry_timer = None

    # ------------------------------------------------------------------
    # State transitions
    # ------------------------------------------------------------------

    def _transition_to_occupied(self, reason: str) -> None:
        """Transition to OCCUPIED state."""
        if self._state.state == OccupancyState.OCCUPIED:
            # Already occupied — but re-evaluate seal on new detection
            if not self._state.sealed and self.config.door_seals_room:
                self._evaluate_seal(f"re-detection: {reason}")
            # Reset seal expiry timer on new activity
            if self._state.sealed:
                self._start_seal_expiry_timer()
            return

        self._cancel_checking_timer()
        old_state = self._state.state
        self._state.state = OccupancyState.OCCUPIED
        self._state.checking_started_at = None
        self._state.confidence = self._calculate_confidence()

        # Fire checking_resolved event when re-occupying from CHECKING
        if old_state == OccupancyState.CHECKING:
            self.hass.bus.async_fire(
                EVENT_CHECKING_RESOLVED,
                {
                    "room_id": self.config.room_id,
                    "floor_plan_id": self.config.floor_plan_id,
                    "result": "occupied",
                },
            )

        # Evaluate seal on entering OCCUPIED
        self._evaluate_seal(reason)

        _LOGGER.info(
            "Room %s: %s → OCCUPIED (%s, sealed=%s)",
            self.config.room_id,
            old_state,
            reason,
            self._state.sealed,
        )
        self._notify_state_change(reason, old_state)

    def _transition_to_checking(self, reason: str) -> None:
        """Transition to CHECKING state."""
        if self._state.state != OccupancyState.OCCUPIED:
            return

        old_state = self._state.state
        self._state.state = OccupancyState.CHECKING
        self._state.checking_started_at = datetime.now()
        self._start_checking_timer()

        effective_timeout = self.config.checking_timeout
        self.hass.bus.async_fire(
            EVENT_CHECKING_STARTED,
            {
                "room_id": self.config.room_id,
                "floor_plan_id": self.config.floor_plan_id,
                "reason": reason,
                "checking_timeout": effective_timeout,
            },
        )

        _LOGGER.info(
            "Room %s: OCCUPIED → CHECKING (%s)",
            self.config.room_id,
            reason,
        )
        self._notify_state_change(reason, old_state)

    def _transition_to_vacant(self, reason: str) -> None:
        """Transition to VACANT state."""
        # Room-level seal check
        if self._state.sealed:
            _LOGGER.debug(
                "Room %s: vacancy blocked by door seal (sealed since %s)",
                self.config.room_id,
                self._state.sealed_since,
            )
            return

        # Child zone check — child zones with occupies_parent keep parent occupied
        if (
            self._is_occupied_by_children
            and self._is_occupied_by_children(self.config.room_id)
        ):
            _LOGGER.debug(
                "Room %s: vacancy blocked by occupied child zone",
                self.config.room_id,
            )
            return

        # House-level guard check
        if self._can_go_vacant and not self._can_go_vacant(self.config.room_id):
            _LOGGER.debug(
                "Room %s: vacancy blocked by house guard",
                self.config.room_id,
            )
            return

        self._cancel_checking_timer()
        self._cancel_seal_expiry_timer()
        old_state = self._state.state
        self._state.state = OccupancyState.VACANT
        self._state.checking_started_at = None
        self._state.confidence = 0.0
        self._state.contributing_sensors = []
        self._state.sealed = False
        self._state.sealed_since = None

        # Fire checking_resolved event when going vacant from CHECKING
        if old_state == OccupancyState.CHECKING:
            self.hass.bus.async_fire(
                EVENT_CHECKING_RESOLVED,
                {
                    "room_id": self.config.room_id,
                    "floor_plan_id": self.config.floor_plan_id,
                    "result": "vacant",
                },
            )

        _LOGGER.info(
            "Room %s: %s → VACANT (%s)",
            self.config.room_id,
            old_state,
            reason,
        )
        self._notify_state_change(reason, old_state)

    def _check_all_sensors_clear(self) -> None:
        """Check if all sensors are clear and handle the transition."""
        if self._state.state != OccupancyState.OCCUPIED:
            return

        if self._any_sensor_active():
            return

        # Hold-until-exit mode: own sensors clearing is ignored; only exit
        # sensors can release the hold.
        if self.config.hold_until_exit and self.config.exit_sensors:
            _LOGGER.debug(
                "Room %s: sensors clear but hold_until_exit active, "
                "waiting for exit sensor",
                self.config.room_id,
            )
            return

        # Child zones with occupies_parent keep parent room OCCUPIED
        if (
            self._is_occupied_by_children
            and self._is_occupied_by_children(self.config.room_id)
        ):
            _LOGGER.debug(
                "Room %s: sensors clear but child zone is occupied, "
                "staying OCCUPIED",
                self.config.room_id,
            )
            return

        # All sensors clear — but if sealed, stay OCCUPIED
        if self._state.sealed:
            _LOGGER.debug(
                "Room %s: all sensors clear but room is sealed, staying OCCUPIED",
                self.config.room_id,
            )
            return

        self._transition_to_checking("all sensors clear")

    # ------------------------------------------------------------------
    # Checking timer
    # ------------------------------------------------------------------

    def _start_checking_timer(self) -> None:
        """Start the checking state timeout timer."""
        self._cancel_checking_timer()

        @callback
        def _checking_timeout(_now: Any) -> None:
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

    # ------------------------------------------------------------------
    # Sensor helpers
    # ------------------------------------------------------------------

    def _any_sensor_active(self) -> bool:
        """Check if any motion sensor is currently active."""
        for binding in self.config.motion_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                return True
        return False

    def _all_doors_closed(self) -> bool:
        """Check if all door sensors indicate closed doors."""
        if not self.config.door_sensors:
            return False

        for binding in self.config.door_sensors:
            state = self.hass.states.get(binding.entity_id)
            if not state:
                return False  # Unknown = not sealed
            if state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                return False
            if self._is_sensor_active(state, binding.inverted):
                return False  # At least one door is open

        return True

    def _any_door_unavailable(self) -> bool:
        """Check if any door sensor is unavailable."""
        for binding in self.config.door_sensors:
            state = self.hass.states.get(binding.entity_id)
            if not state or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                return True
        return False

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

    def _get_exit_binding(self, entity_id: str) -> Any:
        """Get exit sensor binding by entity ID."""
        for binding in self.config.exit_sensors:
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

        if total_weight == 0:
            return 0.5 if self._state.contributing_sensors else 0.0

        return min(1.0, active_weight / total_weight)

    def _notify_state_change(
        self, reason: str = "", previous_state: str | None = None
    ) -> None:
        """Notify listeners of state change."""
        self._state.transition_reason = reason
        self._state.previous_state = previous_state
        self._on_state_change(self._state)
