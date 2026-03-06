"""Door-seal-aware occupancy state machine with probabilistic seal decay."""

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
from .adaptive_timeout import AdaptiveTimeoutManager, TimeOfDayProfile
from .presence_aggregator import PresenceAggregator
from .seal_probability import SealProbabilityTracker
from .sensor_reliability import SensorCorrelationTracker, SensorReliabilityTracker
from .soft_hint_processor import MAX_HINT_WEIGHT, SoftHintProcessor

if TYPE_CHECKING:
    from homeassistant.core import Event

_LOGGER = logging.getLogger(__name__)


class OccupancyStateMachine:
    """
    State machine for room occupancy with probabilistic door-seal logic.

    States:
        VACANT: Room is unoccupied
        OCCUPIED: Room is occupied (motion or presence detected)
        CHECKING: Motion cleared, waiting to confirm vacancy

    Door Seal (Probabilistic Decay):
        A room is "sealed" when someone was detected inside and ALL doors
        have remained closed since that detection.  Instead of a binary
        sealed/not-sealed, the probability that someone is still inside
        decays exponentially over time: p = 0.5^(t / half_life).
        The seal blocks vacancy transitions as long as p > threshold (0.1).
        The seal is immediately broken when any door opens or any door
        sensor becomes unavailable.  A hard max_duration safety valve
        ensures probability reaches 0.0 even without decay.

    Long-Stay Zones:
        Zones marked long_stay (couch, bed, dining table) get a longer
        half-life (2 hours vs 1 hour) so mmWave dropouts during extended
        sitting/sleeping don't cause false vacancy.

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
        on_state_change: Callable[[OccupancyStateData, str], None],
        can_go_vacant: Callable[[str], bool] | None = None,
        is_occupied_by_children: Callable[[str], bool] | None = None,
        has_phantom_hold: Callable[[str], bool] | None = None,
    ) -> None:
        """Initialize the state machine.

        Args:
            hass: Home Assistant instance.
            config: Virtual sensor configuration.
            on_state_change: Callback for state changes. Receives the state
                data and a reason string describing what caused the change.
            can_go_vacant: Optional house-level guard callback. Returns False
                to block vacancy (e.g. house is sealed and this is the last
                occupied room).
            is_occupied_by_children: Optional callback that returns True if any
                child zone with occupies_parent is currently occupied.
            has_phantom_hold: Optional callback that returns True if a phantom
                presence hold is active on this room (transition prediction).
        """
        self.hass = hass
        self._config = config
        self._on_state_change = on_state_change
        self._can_go_vacant = can_go_vacant
        self._is_occupied_by_children = is_occupied_by_children
        self._has_phantom_hold = has_phantom_hold
        self._state = OccupancyStateData(state=OccupancyState.VACANT)
        self._unsub_state_listeners: list[Callable[[], None]] = []
        self._checking_timer: Callable[[], None] | None = None
        self._checking_timeout_bump: int = 0
        self._running = False
        self._occupied_since: datetime | None = None
        self._sensor_last_triggered: dict[str, datetime] = {}

        # Presence aggregator for weighted temporal-decay probability
        self._aggregator = PresenceAggregator(
            hass,
            config.motion_sensors,
            config.presence_sensors,
        )

        # Adaptive timeout manager
        self._timeout_manager = AdaptiveTimeoutManager(
            hass=hass,
            room_id=config.room_id,
            base_checking_timeout=config.checking_timeout,
            base_motion_timeout=getattr(config, "motion_timeout", 120),
            time_of_day_profiles=getattr(config, "time_of_day_profiles", None),
            adaptive_enabled=getattr(config, "adaptive_timeout", False),
        )

        # Probabilistic seal tracker
        self._seal_tracker = SealProbabilityTracker(
            half_life_seconds=float(config.effective_seal_half_life),
            vacancy_threshold=getattr(config, "seal_vacancy_threshold", 0.1),
            _max_duration=float(config.effective_seal_max_duration),
        )

        # Sensor reliability tracker
        self._reliability_tracker = SensorReliabilityTracker()

        # Sensor correlation tracker (co-fires vs solo-fires)
        self._correlation_tracker = SensorCorrelationTracker()

    @property
    def state(self) -> OccupancyStateData:
        """Get current state data."""
        return self._state

    @property
    def config(self) -> VirtualSensorConfig:
        """Get sensor configuration."""
        return self._config

    @property
    def is_occupied(self) -> bool:
        """Check if room is considered occupied."""
        return self._state.state in (
            OccupancyState.OCCUPIED,
            OccupancyState.CHECKING,
        )

    @property
    def timeout_manager(self) -> AdaptiveTimeoutManager:
        """Get the adaptive timeout manager."""
        return self._timeout_manager

    @property
    def reliability_tracker(self) -> SensorReliabilityTracker:
        """Get the sensor reliability tracker."""
        return self._reliability_tracker

    @property
    def correlation_tracker(self) -> SensorCorrelationTracker:
        """Get the sensor correlation tracker."""
        return self._correlation_tracker

    @property
    def checking_timeout_bump(self) -> int:
        """Get the current checking timeout bump (added by false vacancy detector)."""
        return self._checking_timeout_bump

    @checking_timeout_bump.setter
    def checking_timeout_bump(self, value: int) -> None:
        """Set the checking timeout bump."""
        self._checking_timeout_bump = value

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

        # Subscribe to presence sensors
        for binding in self.config.presence_sensors:
            unsub = async_track_state_change_event(
                self.hass,
                binding.entity_id,
                self._handle_presence_event,
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

        # Subscribe to hint sensors (soft signals)
        for binding in self.config.hint_sensors:
            unsub = async_track_state_change_event(
                self.hass,
                binding.entity_id,
                self._handle_hint_event,
            )
            self._unsub_state_listeners.append(unsub)

        # Subscribe to override trigger (physical button)
        if self.config.override_trigger_entity and self.config.override_trigger_action:
            unsub = async_track_state_change_event(
                self.hass,
                self.config.override_trigger_entity,
                self._handle_override_trigger_event,
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

        for unsub in self._unsub_state_listeners:
            try:
                unsub()
            except Exception:
                _LOGGER.exception(
                    "Error unsubscribing listener for room %s",
                    self.config.room_id,
                )
        self._unsub_state_listeners.clear()

        # Clear aggregator state
        self._aggregator.clear()

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
            self._seal_tracker.reset()
            self._cancel_checking_timer()
            self._state.confidence = 0.0
            self._state.seal_probability = 0.0
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
    # Spatial presence (mmWave)
    # ------------------------------------------------------------------

    def update_spatial_presence(self, target_count: int, source: str = "mmwave") -> None:
        """Update occupancy based on spatial presence targets (e.g., mmWave).

        Spatial presence is treated as a high-confidence signal (weight=2.0)
        fed into the contributing sensors list as a virtual presence reading.
        """
        is_active = target_count > 0
        virtual_entity = f"_spatial_{source}_{self.config.room_id}"

        # Update contributing sensors
        self._update_contributing_sensors(virtual_entity, add=is_active)

        if is_active:
            self._state.last_presence_at = datetime.now()
            self._transition_to_occupied(
                f"spatial presence: {target_count} targets from {source}"
            )
        else:
            self._check_all_sensors_clear()

    # ------------------------------------------------------------------
    # Initial state evaluation
    # ------------------------------------------------------------------

    async def _evaluate_initial_state(self) -> None:
        """Evaluate initial state based on current sensor values."""
        # Refresh aggregator from current HA states
        self._aggregator.refresh_from_state()

        for binding in self.config.motion_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                self._transition_to_occupied("initial motion detected")
                return

        for binding in self.config.presence_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                self._transition_to_occupied("initial presence detected")
                return

        # Check aggregator probability as a fallback (e.g. decaying readings)
        probability = self._aggregator.get_presence_probability()
        if probability >= self.config.occupied_threshold:
            self._transition_to_occupied(
                f"initial aggregator probability {probability:.2f}"
            )
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

        # Feed into aggregator
        self._aggregator.update_reading(
            entity_id, is_active, "motion", binding.weight
        )

        # Feed the reliability tracker
        if is_active:
            self._reliability_tracker.on_sensor_activation(entity_id)
            self._correlation_tracker.on_sensor_activation(entity_id)
        else:
            self._reliability_tracker.on_sensor_deactivation(entity_id)

        if is_active:
            self._state.last_motion_at = datetime.now()
            self._sensor_last_triggered[entity_id] = datetime.now()
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

        # Feed into aggregator
        self._aggregator.update_reading(
            entity_id, is_active, "presence", binding.weight
        )

        if is_active:
            self._state.last_presence_at = datetime.now()
            self._sensor_last_triggered[entity_id] = datetime.now()
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
            if self._seal_tracker.is_sealed:
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
            "Room %s door event: %s = %s (open=%s, sealed=%s, probability=%.2f)",
            self.config.room_id,
            entity_id,
            new_state.state,
            is_open,
            self._seal_tracker.is_sealed,
            self._seal_tracker.probability,
        )

        if is_open:
            # Door opened — break the seal
            if self._seal_tracker.is_sealed:
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
        if self._seal_tracker.is_sealed:
            self._break_seal(f"exit sensor {entity_id} fired")

        self._transition_to_checking(f"exit sensor {entity_id}")

    @callback
    def _handle_override_trigger_event(self, event: Event) -> None:
        """Handle override trigger event (physical button press).

        Supports both HA event entities (event_type attribute) and
        legacy Z2M action sensors (state value).
        """
        new_state: State | None = event.data.get("new_state")
        if not new_state:
            return

        action = self.config.override_trigger_action

        # Event entities: action is in event_type attribute
        # Action sensors: action is the state value
        event_type = new_state.attributes.get("event_type", "")
        matched = event_type == action or new_state.state == action
        if not matched:
            return

        entity_id = self.config.override_trigger_entity

        if self._state.state in (OccupancyState.OCCUPIED, OccupancyState.CHECKING):
            new = OccupancyState.VACANT
        else:
            new = OccupancyState.OCCUPIED

        _LOGGER.info(
            "Room %s: override trigger %s fired (%s), %s → %s",
            self.config.room_id,
            entity_id,
            action,
            self._state.state,
            new,
        )
        self.set_state(new, f"override trigger {entity_id} ({action})")

    @callback
    def _handle_hint_event(self, event: Event) -> None:
        """Handle a soft hint sensor state change.

        Hints feed into the aggregator with capped weight. They can sustain
        or boost confidence in an already-occupied room but CANNOT trigger
        a transition to OCCUPIED on their own.
        """
        new_state: State | None = event.data.get("new_state")
        if not new_state:
            return

        entity_id = event.data.get("entity_id", "")
        binding = self._get_hint_binding(entity_id)
        if not binding:
            return

        weight = self._compute_hint_weight(new_state, binding)

        is_active = weight > 0.0
        _LOGGER.debug(
            "Room %s hint event: %s = %s (weight=%.3f, active=%s)",
            self.config.room_id,
            entity_id,
            new_state.state,
            weight,
            is_active,
        )

        # Feed into aggregator with "hint" type — capped weight
        self._aggregator.update_reading(
            entity_id, is_active, "hint", min(weight, MAX_HINT_WEIGHT)
        )

        # Hints can sustain occupancy but never trigger it alone.
        # If already occupied, re-evaluate confidence.
        if self._state.state == OccupancyState.OCCUPIED:
            self._state.confidence = self._calculate_confidence()

    def _compute_hint_weight(self, state: State, binding: Any) -> float:
        """Compute the hint weight from a sensor state.

        The sensor_type on the binding determines which processor to use:
        - 'light': process_light_state
        - 'power': process_power_level
        - 'co2': process_co2
        - 'sound': process_sound_level
        - default: simple on/off with binding.weight capped at MAX_HINT_WEIGHT
        """
        sensor_type = binding.sensor_type

        if sensor_type == "light":
            brightness = state.attributes.get("brightness") if hasattr(state, "attributes") else None
            return SoftHintProcessor.process_light_state(state.state, brightness)
        elif sensor_type == "power":
            try:
                power = float(state.state)
            except (ValueError, TypeError):
                return 0.0
            return SoftHintProcessor.process_power_level(power)
        elif sensor_type == "co2":
            try:
                co2 = float(state.state)
            except (ValueError, TypeError):
                return 0.0
            return SoftHintProcessor.process_co2(co2)
        elif sensor_type == "sound":
            try:
                db = float(state.state)
            except (ValueError, TypeError):
                return 0.0
            return SoftHintProcessor.process_sound_level(db)
        else:
            # Generic on/off hint
            is_on = state.state in (STATE_ON, "on", "detected", "open", "true", "1")
            if binding.inverted:
                is_on = not is_on
            return min(binding.weight, MAX_HINT_WEIGHT) if is_on else 0.0

    def _get_hint_binding(self, entity_id: str) -> Any:
        """Get hint sensor binding by entity ID."""
        for binding in self.config.hint_sensors:
            if binding.entity_id == entity_id:
                return binding
        return None

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

        self._seal_tracker.establish()
        self._sync_seal_state()
        self._state.seal_broken_at = None
        self._snapshot_door_states()
        _LOGGER.info(
            "Room %s: seal established (%s, probability=%.2f)",
            self.config.room_id,
            reason,
            self._seal_tracker.probability,
        )

    def _break_seal(self, reason: str) -> None:
        """Break the door seal on the room."""
        if not self._seal_tracker.is_sealed:
            return

        self._seal_tracker.break_seal()
        self._state.sealed = False
        self._state.seal_probability = 0.0
        self._state.seal_broken_at = datetime.now()
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

    def _sync_seal_state(self) -> None:
        """Sync _state fields from the seal tracker for backward compatibility."""
        self._state.sealed = self._seal_tracker.is_effective
        self._state.seal_probability = self._seal_tracker.probability
        self._state.sealed_since = self._seal_tracker.sealed_since

    # ------------------------------------------------------------------
    # State transitions
    # ------------------------------------------------------------------

    def _transition_to_occupied(self, reason: str) -> None:
        """Transition to OCCUPIED state.

        Uses threshold-gated logic: only transitions if the aggregator
        probability meets occupied_threshold OR any sensor is physically
        active (fast-path safety net).
        """
        if self._state.state == OccupancyState.OCCUPIED:
            # Already occupied — update confidence and re-evaluate seal
            self._state.confidence = self._calculate_confidence()
            if not self._seal_tracker.is_sealed and self.config.door_seals_room:
                self._evaluate_seal(f"re-detection: {reason}")
            # Re-establish seal on new activity (resets decay timer)
            if self._seal_tracker.is_sealed:
                self._seal_tracker.establish()
                self._sync_seal_state()
            return

        # Threshold gate: require physical activity OR sufficient probability
        probability = self._aggregator.get_presence_probability()
        if not self._any_sensor_active() and not self._any_presence_sensor_active():
            if probability < self.config.occupied_threshold:
                _LOGGER.debug(
                    "Room %s: transition to OCCUPIED blocked — "
                    "probability %.2f < threshold %.2f and no sensor active",
                    self.config.room_id,
                    probability,
                    self.config.occupied_threshold,
                )
                return

        self._cancel_checking_timer()
        old_state = self._state.state
        self._state.state = OccupancyState.OCCUPIED
        self._state.checking_started_at = None
        self._state.confidence = self._calculate_confidence()
        self._occupied_since = datetime.now()

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
            "Room %s: %s → OCCUPIED (%s, sealed=%s, confidence=%.2f, seal_p=%.2f)",
            self.config.room_id,
            old_state,
            reason,
            self._seal_tracker.is_sealed,
            self._state.confidence,
            self._seal_tracker.probability,
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

        effective_timeout = self._timeout_manager.get_effective_checking_timeout() + self._checking_timeout_bump
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
        # Phantom hold — transition prediction keeps room from going VACANT
        if self._has_phantom_hold and self._has_phantom_hold(self.config.room_id):
            _LOGGER.debug(
                "Room %s: vacancy blocked by phantom hold",
                self.config.room_id,
            )
            return

        # Room-level seal check (probabilistic)
        if self._seal_tracker.is_effective:
            _LOGGER.debug(
                "Room %s: vacancy blocked by seal (probability=%.2f)",
                self.config.room_id,
                self._seal_tracker.probability,
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
        self._seal_tracker.reset()
        old_state = self._state.state

        # Record session for adaptive learning
        if self._occupied_since is not None:
            self._timeout_manager.record_occupancy_session(
                started_at=self._occupied_since,
                ended_at=datetime.now(),
            )

        self._state.state = OccupancyState.VACANT
        self._state.checking_started_at = None
        self._state.confidence = 0.0
        self._state.contributing_sensors = []
        self._state.sealed = False
        self._state.seal_probability = 0.0
        self._state.sealed_since = None
        self._occupied_since = None

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
        """Check if all sensors are clear and handle the transition.

        Uses the aggregator probability alongside binary sensor checks.
        The room goes to CHECKING only if all sensors are clear AND the
        probability is below the vacant threshold.
        """
        if self._state.state != OccupancyState.OCCUPIED:
            return

        if self._any_sensor_active() or self._any_presence_sensor_active():
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

        # Phantom hold — transition prediction keeps room OCCUPIED
        if self._has_phantom_hold and self._has_phantom_hold(self.config.room_id):
            _LOGGER.debug(
                "Room %s: sensors clear but phantom hold active, "
                "staying OCCUPIED",
                self.config.room_id,
            )
            return

        # All sensors clear — but if seal is still effective, stay OCCUPIED
        if self._seal_tracker.is_effective:
            _LOGGER.debug(
                "Room %s: all sensors clear but room is sealed "
                "(probability=%.2f), staying OCCUPIED",
                self.config.room_id,
                self._seal_tracker.probability,
            )
            return

        # Check aggregator probability — stay OCCUPIED if still above vacant threshold
        probability = self._aggregator.get_presence_probability()
        if probability > self.config.vacant_threshold:
            _LOGGER.debug(
                "Room %s: sensors clear but aggregator probability %.2f "
                "> vacant threshold %.2f, staying OCCUPIED",
                self.config.room_id,
                probability,
                self.config.vacant_threshold,
            )
            # Update confidence to reflect current probability
            self._state.confidence = self._calculate_confidence()
            return

        self._transition_to_checking("all sensors clear")

    # ------------------------------------------------------------------
    # Checking timer
    # ------------------------------------------------------------------

    def _start_checking_timer(self) -> None:
        """Start the checking state timeout timer."""
        self._cancel_checking_timer()
        effective_timeout = (
            self._timeout_manager.get_effective_checking_timeout()
            + self._checking_timeout_bump
        )

        @callback
        def _checking_timeout(_now: Any) -> None:
            self._checking_timer = None
            if self._state.state == OccupancyState.CHECKING:
                self._transition_to_vacant("checking timeout")

        self._checking_timer = async_call_later(
            self.hass,
            effective_timeout,
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
        """Check if any motion sensor or spatial presence source is active."""
        for binding in self.config.motion_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                return True

        # Spatial presence virtual entities are tracked in contributing_sensors
        for sensor_id in self._state.contributing_sensors:
            if sensor_id.startswith("_spatial_"):
                return True

        return False

    def _any_presence_sensor_active(self) -> bool:
        """Check if any presence sensor is currently active."""
        for binding in self.config.presence_sensors:
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
        """Calculate occupancy confidence using the presence aggregator.

        Uses the aggregator's weighted temporal-decay probability as the
        base value, then blends in reliability-adjusted weights so that
        sensors with poor track records contribute less to confidence.
        """
        aggregator_probability = self._aggregator.get_presence_probability()

        # Also compute reliability-weighted confidence
        total_weight = 0.0
        active_weight = 0.0

        for binding in self.config.motion_sensors:
            effective_weight = self._reliability_tracker.get_effective_weight(
                binding.entity_id, binding.weight
            )
            # Penalize sensors with high solo-fire rate (discount by up to 50%)
            solo_rate = self._correlation_tracker.get_solo_fire_rate(
                binding.entity_id
            )
            correlation_factor = 1.0 - (solo_rate * 0.5)
            effective_weight *= correlation_factor

            total_weight += effective_weight
            if binding.entity_id in self._state.contributing_sensors:
                active_weight += effective_weight

        if total_weight == 0:
            return aggregator_probability

        reliability_confidence = min(1.0, active_weight / total_weight)

        # Blend: aggregator is primary, reliability adjusts it
        return max(aggregator_probability, reliability_confidence)

    def _build_sensor_diagnostics(self) -> dict[str, dict]:
        """Build per-sensor diagnostic records.

        Returns a dict mapping entity_id to a diagnostic record with fields:
        - active: bool
        - base_weight: float
        - effective_weight: float
        - reliability: float
        - sensor_type: str
        - last_triggered: str | None (ISO timestamp)
        """
        diagnostics: dict[str, dict] = {}

        for binding in self.config.motion_sensors:
            eid = binding.entity_id
            is_active = eid in self._state.contributing_sensors
            reliability = self._reliability_tracker.get_reliability(eid)
            effective_weight = self._reliability_tracker.get_effective_weight(
                eid, binding.weight
            )
            last_triggered = self._sensor_last_triggered.get(eid)
            diagnostics[eid] = {
                "active": is_active,
                "base_weight": binding.weight,
                "effective_weight": effective_weight,
                "reliability": reliability,
                "sensor_type": "motion",
                "last_triggered": (
                    last_triggered.isoformat() if last_triggered else None
                ),
            }

        for binding in self.config.presence_sensors:
            eid = binding.entity_id
            is_active = eid in self._state.contributing_sensors
            reliability = self._reliability_tracker.get_reliability(eid)
            effective_weight = self._reliability_tracker.get_effective_weight(
                eid, binding.weight
            )
            last_triggered = self._sensor_last_triggered.get(eid)
            diagnostics[eid] = {
                "active": is_active,
                "base_weight": binding.weight,
                "effective_weight": effective_weight,
                "reliability": reliability,
                "sensor_type": "presence",
                "last_triggered": (
                    last_triggered.isoformat() if last_triggered else None
                ),
            }

        for binding in self.config.hint_sensors:
            eid = binding.entity_id
            is_active = eid in self._state.contributing_sensors
            diagnostics[eid] = {
                "active": is_active,
                "base_weight": binding.weight,
                "effective_weight": min(binding.weight, MAX_HINT_WEIGHT),
                "reliability": 1.0,
                "sensor_type": "hint",
                "last_triggered": None,
            }

        return diagnostics

    def _notify_state_change(
        self, reason: str = "", previous_state: str | None = None
    ) -> None:
        """Notify listeners of state change."""
        # Update sensor reliability data in state
        self._state.sensor_reliability = {
            entity_id: self._reliability_tracker.get_reliability(entity_id)
            for entity_id in self._state.contributing_sensors
        }
        # Update per-sensor diagnostics
        self._state.sensor_diagnostics = self._build_sensor_diagnostics()
        self._state.transition_reason = reason
        self._state.previous_state = previous_state
        self._on_state_change(self._state, reason)
