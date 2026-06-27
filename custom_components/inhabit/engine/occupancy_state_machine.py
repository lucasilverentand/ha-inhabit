"""Door-seal-aware occupancy state machine with post-close confirmation."""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from homeassistant.const import STATE_ON, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant, State, callback
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
)

from ..const import EVENT_CHECKING_RESOLVED, EVENT_CHECKING_STARTED, OccupancyState
from ..models.virtual_sensor import OccupancyStateData, VirtualSensorConfig
from .adaptive_timeout import AdaptiveTimeoutManager
from .presence_aggregator import PresenceAggregator
from .seal_probability import SealProbabilityTracker
from .sensor_reliability import SensorCorrelationTracker, SensorReliabilityTracker
from .soft_hint_processor import MAX_HINT_WEIGHT, SoftHintProcessor

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

    Door Seal (Wasp-in-box):
        A room is "sealed" only after ALL doors are closed and a fresh motion,
        presence, occupancy, or spatial-presence detection happens while they
        remain closed.  A door-close event by itself never establishes the seal
        because motion sensors can still be active from someone leaving.  Once
        confirmed, the seal blocks vacancy until a door opens, the door sensor
        becomes unavailable, or a manual override sets the room vacant.

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
        on_diagnostic: Callable[..., None] | None = None,
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
        self._on_diagnostic = on_diagnostic
        self._state = OccupancyStateData(state=OccupancyState.VACANT)
        self._unsub_state_listeners: list[Callable[[], None]] = []
        self._checking_timer: Callable[[], None] | None = None
        self._unsealed_activity_timer: Callable[[], None] | None = None
        self._post_close_hold_timer: Callable[[], None] | None = None
        self._override_safety_timer: Callable[[], None] | None = None
        self._checking_timeout_bump: int = 0
        self._running = False
        self._occupied_since: datetime | None = None
        self._last_unsealed_activity_at: datetime | None = None
        self._last_sustained_activity_at: datetime | None = None
        self._post_close_hold_until: datetime | None = None
        self._sensor_last_triggered: dict[str, datetime] = {}
        self._last_known_door_states: dict[str, bool] = {}  # entity_id -> was_open
        self._awaiting_seal_confirmation = False

        # Presence aggregator for weighted temporal-decay probability
        self._aggregator = PresenceAggregator(
            hass,
            config.motion_sensors,
            config.presence_sensors,
            motion_decay_seconds=float(config.motion_timeout),
            presence_decay_seconds=float(config.presence_timeout),
            occupancy_bindings=config.occupancy_sensors,
            occupancy_decay_seconds=float(config.presence_timeout),
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

    def _diagnose(self, event: str, **kwargs: Any) -> None:
        """Emit an optional structured diagnostic event."""
        if not self._on_diagnostic:
            return
        self._on_diagnostic(
            category=kwargs.pop("category", "state_machine"),
            event=event,
            room_id=self.config.room_id,
            confidence=kwargs.pop("confidence", self._state.confidence),
            probability=kwargs.pop("probability", None),
            thresholds=kwargs.pop(
                "thresholds",
                {
                    "occupied": self.config.occupied_threshold,
                    "vacant": self.config.vacant_threshold,
                },
            ),
            contributing_sensors=kwargs.pop(
                "contributing_sensors", list(self._state.contributing_sensors)
            ),
            **kwargs,
        )

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

        # Subscribe to occupancy sensors
        for binding in self.config.occupancy_sensors:
            unsub = async_track_state_change_event(
                self.hass,
                binding.entity_id,
                self._handle_occupancy_event,
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
        if self.config.override_trigger_entity:
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
        self._cancel_unsealed_activity_timer()
        self._cancel_post_close_hold()
        self._cancel_override_safety_timer()

        for unsub in self._unsub_state_listeners:
            try:
                unsub()
            except Exception:
                _LOGGER.exception(
                    "Error unsubscribing listener for room %s",
                    self.config.room_id,
                )
        self._unsub_state_listeners.clear()

        # Clear aggregator and cached state
        self._aggregator.clear()
        self._last_known_door_states.clear()

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
        is_override = "override" in reason

        if new_state == OccupancyState.OCCUPIED:
            self._cancel_checking_timer()
            self._state.checking_started_at = None
            if (
                is_override
                and self.config.door_seals_room
                and self.config.door_sensors
                and self._all_doors_closed()
                and not self._any_door_unavailable()
            ):
                self._establish_seal(reason)
            else:
                self._evaluate_seal(reason or "manual state set", fresh_detection=False)
            if is_override and not self._seal_blocks_vacancy():
                self._record_unsealed_activity("override")
            if is_override:
                self._start_override_safety_timer()
        elif new_state == OccupancyState.CHECKING:
            self._state.checking_started_at = datetime.now()
            self._break_seal("manual override to CHECKING")
            self._cancel_unsealed_activity_timer()
            self._cancel_post_close_hold()
            self._start_checking_timer()
            if is_override:
                self._start_override_safety_timer()
        else:
            # VACANT
            self._state.checking_started_at = None
            self._break_seal("manual override to VACANT")
            self._seal_tracker.reset()
            self._cancel_checking_timer()
            self._cancel_unsealed_activity_timer()
            self._state.confidence = 0.0
            self._state.seal_probability = 0.0
            self._state.contributing_sensors = []
            self._last_unsealed_activity_at = None
            self._last_sustained_activity_at = None
            self._cancel_post_close_hold()
            if is_override:
                self._start_override_safety_timer()
            else:
                self._cancel_override_safety_timer()

        _LOGGER.info(
            "Room %s state: %s → %s (%s)",
            self.config.room_id,
            old_state,
            new_state,
            reason,
        )
        self._diagnose(
            "manual_state_set",
            previous_state=old_state,
            new_state=new_state,
            reason=reason,
        )
        self._notify_state_change(reason, old_state)

    # ------------------------------------------------------------------
    # Spatial presence (mmWave)
    # ------------------------------------------------------------------

    def update_spatial_presence(
        self, target_count: int, source: str = "mmwave"
    ) -> None:
        """Update occupancy based on spatial presence targets (e.g., mmWave).

        Spatial presence is treated as a high-confidence signal (weight=2.0)
        fed into the contributing sensors list as a virtual presence reading.
        """
        is_active = target_count > 0
        virtual_entity = f"_spatial_{source}_{self.config.room_id}"

        # Update contributing sensors
        self._update_contributing_sensors(virtual_entity, add=is_active)
        self._aggregator.update_reading(virtual_entity, is_active, "presence", 2.0)
        self._diagnose(
            "spatial_presence_update",
            category="spatial",
            reason=f"{target_count} targets from {source}",
            target_count=target_count,
            metadata={"source": source, "virtual_entity": virtual_entity},
        )

        if is_active:
            self._state.last_presence_at = datetime.now()
            self._sensor_last_triggered[virtual_entity] = self._state.last_presence_at
            self._record_unsealed_activity("spatial")
            self._transition_to_occupied(
                f"spatial presence: {target_count} targets from {source}",
                fresh_detection=True,
                physical_activity=True,
            )
        else:
            self._check_all_sensors_clear()

    # ------------------------------------------------------------------
    # Initial state evaluation
    # ------------------------------------------------------------------

    async def _evaluate_initial_state(self) -> None:
        """Evaluate initial state based on current sensor values."""
        self.recalculate_from_current_state("initial state evaluation")

    def recalculate_from_current_state(
        self, reason: str = "current state refresh"
    ) -> None:
        """Recalculate occupancy from current HA state without synthetic events."""
        active_motion, active_presence, active_occupancy = (
            self._refresh_current_sensor_snapshot()
        )

        if active_motion:
            self._record_unsealed_activity("motion")
            self._transition_to_occupied(
                f"{reason}: motion active",
                fresh_detection=False,
                physical_activity=True,
            )
            return

        if active_presence:
            self._record_unsealed_activity("presence")
            self._transition_to_occupied(
                f"{reason}: presence active",
                fresh_detection=False,
                physical_activity=True,
            )
            return

        if active_occupancy:
            self._record_unsealed_activity("occupancy")
            self._transition_to_occupied(
                f"{reason}: occupancy active",
                fresh_detection=False,
                physical_activity=True,
            )
            return

        # Check aggregator probability as a fallback (e.g. decaying readings)
        probability = self._aggregator.get_presence_probability()
        if probability >= self.config.occupied_threshold:
            self._transition_to_occupied(
                f"{reason}: aggregator probability {probability:.2f}",
                fresh_detection=False,
            )
            return

        if self._state.state == OccupancyState.OCCUPIED:
            self._check_all_sensors_clear()
        elif self._state.state == OccupancyState.CHECKING:
            self._resolve_checking_without_activity(reason)
        elif self._state.state == OccupancyState.VACANT:
            self._state.confidence = 0.0

        _LOGGER.debug(
            "Room %s current state refresh: %s (no activity)",
            self.config.room_id,
            self._state.state,
        )

    def _resolve_checking_without_activity(self, reason: str) -> None:
        """Resolve or re-arm a stale CHECKING state during state refresh."""
        if self._state.state != OccupancyState.CHECKING:
            return

        if self._has_phantom_hold and self._has_phantom_hold(self.config.room_id):
            return

        checking_started_at = self._state.checking_started_at
        if checking_started_at is None:
            self._state.checking_started_at = datetime.now()
            self._start_checking_timer()
            return

        effective_timeout = (
            self._timeout_manager.get_effective_checking_timeout()
            + self._checking_timeout_bump
        )
        elapsed = (datetime.now() - checking_started_at).total_seconds()
        remaining = effective_timeout - elapsed

        if remaining <= 0:
            self._transition_to_vacant(f"{reason}: checking timeout elapsed")
        elif self._checking_timer is None:
            self._start_checking_timer(delay_seconds=remaining)

    def _refresh_current_sensor_snapshot(self) -> tuple[bool, bool, bool]:
        """Sync aggregator and contributing sensors from current HA states."""
        self._aggregator.refresh_from_state()

        active_motion = False
        for binding in self.config.motion_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                active_motion = True
                if binding.entity_id not in self._state.contributing_sensors:
                    self._state.last_motion_at = datetime.now()
                    self._sensor_last_triggered[binding.entity_id] = datetime.now()
                self._update_contributing_sensors(binding.entity_id, add=True)
            else:
                self._update_contributing_sensors(binding.entity_id, add=False)

        active_presence = False
        for binding in self.config.presence_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                active_presence = True
                if binding.entity_id not in self._state.contributing_sensors:
                    self._state.last_presence_at = datetime.now()
                    self._sensor_last_triggered[binding.entity_id] = datetime.now()
                self._update_contributing_sensors(binding.entity_id, add=True)
            else:
                self._update_contributing_sensors(binding.entity_id, add=False)

        active_occupancy = False
        for binding in self.config.occupancy_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                active_occupancy = True
                if binding.entity_id not in self._state.contributing_sensors:
                    self._state.last_presence_at = datetime.now()
                    self._sensor_last_triggered[binding.entity_id] = datetime.now()
                self._update_contributing_sensors(binding.entity_id, add=True)
            else:
                self._update_contributing_sensors(binding.entity_id, add=False)

        for binding in self.config.hint_sensors:
            state = self.hass.states.get(binding.entity_id)
            weight = self._compute_hint_weight(state, binding) if state else 0.0
            is_active = weight > 0.0
            self._aggregator.update_reading(
                binding.entity_id,
                is_active,
                "hint",
                min(weight, MAX_HINT_WEIGHT),
            )
            self._update_contributing_sensors(binding.entity_id, add=is_active)

        return active_motion, active_presence, active_occupancy

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
        self._diagnose(
            "sensor_event",
            category="sensor",
            reason=f"motion {new_state.state}",
            metadata={
                "entity_id": entity_id,
                "sensor_type": "motion",
                "raw_state": new_state.state,
                "active": is_active,
                "weight": binding.weight,
            },
        )

        # Feed into aggregator
        self._aggregator.update_reading(entity_id, is_active, "motion", binding.weight)

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
            self._record_unsealed_activity("motion")
            self._transition_to_occupied(
                f"motion from {entity_id}",
                fresh_detection=True,
                physical_activity=True,
            )
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
        self._diagnose(
            "sensor_event",
            category="sensor",
            reason=f"presence {new_state.state}",
            metadata={
                "entity_id": entity_id,
                "sensor_type": "presence",
                "raw_state": new_state.state,
                "active": is_active,
                "weight": binding.weight,
            },
        )

        # Feed into aggregator
        self._aggregator.update_reading(
            entity_id, is_active, "presence", binding.weight
        )

        if is_active:
            self._state.last_presence_at = datetime.now()
            self._sensor_last_triggered[entity_id] = datetime.now()
            self._update_contributing_sensors(entity_id, add=True)
            self._record_unsealed_activity("presence")
            self._transition_to_occupied(
                f"presence from {entity_id}",
                fresh_detection=True,
                physical_activity=True,
            )
        else:
            self._update_contributing_sensors(entity_id, add=False)
            self._check_all_sensors_clear()

    @callback
    def _handle_occupancy_event(self, event: Event) -> None:
        """Handle occupancy sensor state change."""
        new_state: State | None = event.data.get("new_state")
        if not new_state:
            return

        entity_id = event.data.get("entity_id", "")
        binding = self._get_occupancy_binding(entity_id)
        if not binding:
            return

        is_active = self._is_sensor_active(new_state, binding.inverted)
        _LOGGER.debug(
            "Room %s occupancy event: %s = %s (active=%s)",
            self.config.room_id,
            entity_id,
            new_state.state,
            is_active,
        )
        self._diagnose(
            "sensor_event",
            category="sensor",
            reason=f"occupancy {new_state.state}",
            metadata={
                "entity_id": entity_id,
                "sensor_type": "occupancy",
                "raw_state": new_state.state,
                "active": is_active,
                "weight": binding.weight,
            },
        )

        # Feed into aggregator
        self._aggregator.update_reading(
            entity_id, is_active, "occupancy", binding.weight
        )

        if is_active:
            self._state.last_presence_at = datetime.now()
            self._sensor_last_triggered[entity_id] = datetime.now()
            self._update_contributing_sensors(entity_id, add=True)
            self._record_unsealed_activity("occupancy")
            self._transition_to_occupied(
                f"occupancy from {entity_id}",
                fresh_detection=True,
                physical_activity=True,
            )
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

        # Cache last known good door state for unavailability fallback
        if new_state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            self._last_known_door_states[entity_id] = self._is_sensor_active(
                new_state, binding.inverted
            )

        # Door sensor became unavailable — break the seal (can't trust it)
        if new_state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            message = "Room %s: door sensor %s became %s"
            if self._seal_tracker.is_sealed:
                _LOGGER.warning(
                    message + ", breaking seal",
                    self.config.room_id,
                    entity_id,
                    new_state.state,
                )
            else:
                _LOGGER.debug(
                    message + " while unsealed",
                    self.config.room_id,
                    entity_id,
                    new_state.state,
                )
            self._diagnose(
                "sensor_unavailable",
                category="sensor",
                reason=f"door sensor {entity_id} {new_state.state}",
                blockers=["door_unavailable"],
                metadata={"entity_id": entity_id, "raw_state": new_state.state},
            )
            if self._seal_tracker.is_sealed:
                self._break_seal(f"door sensor {entity_id} unavailable")
                if (
                    self._state.state == OccupancyState.OCCUPIED
                    and not self._any_occupancy_signal_active()
                ):
                    self._transition_to_checking(
                        "seal broken (sensor unavailable), sensors clear"
                    )
                elif self._state.state == OccupancyState.OCCUPIED:
                    self._restart_unsealed_timer_from_active_signals()
            self._awaiting_seal_confirmation = False
            self._cancel_post_close_hold()
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
        self._diagnose(
            "door_event",
            category="sensor",
            reason=f"door {'open' if is_open else 'closed'}",
            probability=self._seal_tracker.probability,
            metadata={
                "entity_id": entity_id,
                "raw_state": new_state.state,
                "open": is_open,
                "sealed": self._seal_tracker.is_sealed,
            },
        )

        if is_open:
            # Door opened — break the seal
            self._awaiting_seal_confirmation = False
            self._cancel_post_close_hold()
            self._cancel_override_safety_timer()
            if self._seal_tracker.is_sealed:
                self._break_seal(f"door {entity_id} opened")

                # If sensors are already clear, transition to CHECKING now
                if (
                    self._state.state == OccupancyState.OCCUPIED
                    and not self._any_occupancy_signal_active()
                ):
                    self._transition_to_checking("seal broken, sensors already clear")
                elif self._state.state == OccupancyState.OCCUPIED:
                    self._restart_unsealed_timer_from_active_signals()
        else:
            # Door closed — wait for a fresh in-room detection before sealing.
            if self.config.door_seals_room and self._all_doors_closed():
                self._awaiting_seal_confirmation = True
                self._snapshot_door_states()
                _LOGGER.info(
                    "Room %s: all doors closed, waiting for fresh detection to seal",
                    self.config.room_id,
                )
                self._diagnose(
                    "seal_waiting_for_detection",
                    category="seal",
                    reason=f"door {entity_id} closed",
                    metadata={"door_states": self._state.door_states_at_detection},
                )
                if (
                    self._state.state == OccupancyState.OCCUPIED
                    and not self._seal_tracker.is_sealed
                    and self._any_occupancy_signal_active()
                ):
                    if self._recent_active_occupancy_signal():
                        self._establish_seal(
                            f"recent activity carried through door {entity_id} close"
                        )
                    else:
                        self._start_post_close_hold(f"door {entity_id} closed")

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
        self._diagnose(
            "exit_sensor_released_hold",
            category="sensor",
            reason=f"exit sensor {entity_id}",
            metadata={"entity_id": entity_id},
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

        action = self.config.override_trigger_action.strip()
        entity_id = self.config.override_trigger_entity

        # Event entities: action is in event_type attribute
        # Action sensors: action is the state value
        event_type = new_state.attributes.get("event_type", "")
        observed_action = event_type or new_state.state
        if entity_id.startswith("button."):
            observed_action = "press"
        matched = not action or event_type == action or new_state.state == action
        if entity_id.startswith("button.") and action in ("", "press", "pressed"):
            matched = True
        if not matched:
            return

        if self._state.state in (OccupancyState.OCCUPIED, OccupancyState.CHECKING):
            new = OccupancyState.VACANT
        else:
            new = OccupancyState.OCCUPIED

        _LOGGER.info(
            "Room %s: override trigger %s fired (%s), %s → %s",
            self.config.room_id,
            entity_id,
            action or observed_action or "any",
            self._state.state,
            new,
        )
        self._diagnose(
            "override_trigger",
            previous_state=self._state.state,
            new_state=new,
            reason=f"override trigger {entity_id}",
            metadata={
                "entity_id": entity_id,
                "expected_action": action,
                "observed_action": observed_action,
            },
        )
        self.set_state(
            new, f"override trigger {entity_id} ({action or observed_action or 'any'})"
        )

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
        self._diagnose(
            "sensor_event",
            category="sensor",
            reason=f"hint {new_state.state}",
            metadata={
                "entity_id": entity_id,
                "sensor_type": binding.sensor_type,
                "raw_state": new_state.state,
                "active": is_active,
                "weight": weight,
            },
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
        if state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return 0.0

        sensor_type = binding.sensor_type

        if sensor_type == "light":
            brightness = (
                state.attributes.get("brightness")
                if hasattr(state, "attributes")
                else None
            )
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

    def _evaluate_seal(self, reason: str, *, fresh_detection: bool) -> None:
        """Evaluate whether the room should be sealed right now."""
        if not self.config.door_seals_room or not self.config.door_sensors:
            return

        if self._all_doors_closed() and not self._any_door_unavailable():
            if not fresh_detection:
                self._awaiting_seal_confirmation = True
                self._snapshot_door_states()
                _LOGGER.debug(
                    "Room %s: doors closed but seal requires a fresh detection (%s)",
                    self.config.room_id,
                    reason,
                )
                self._diagnose(
                    "seal_waiting_for_detection",
                    category="seal",
                    reason=reason,
                    metadata={"door_states": self._state.door_states_at_detection},
                )
                return
            self._establish_seal(reason)
        else:
            # Door is open or unavailable at detection time — no seal
            self._awaiting_seal_confirmation = False
            self._snapshot_door_states()

    def _establish_seal(self, reason: str) -> None:
        """Establish a door seal on the room."""
        if not self.config.door_seals_room:
            return

        self._seal_tracker.establish()
        self._awaiting_seal_confirmation = False
        self._cancel_unsealed_activity_timer()
        self._cancel_post_close_hold()
        self._sync_seal_state()
        self._state.seal_broken_at = None
        self._snapshot_door_states()
        _LOGGER.info(
            "Room %s: seal established (%s, probability=%.2f)",
            self.config.room_id,
            reason,
            self._seal_tracker.probability,
        )
        self._diagnose(
            "seal_established",
            category="seal",
            reason=reason,
            probability=self._seal_tracker.probability,
            metadata={"door_states": self._state.door_states_at_detection},
        )

    def _break_seal(self, reason: str) -> None:
        """Break the door seal on the room."""
        if not self._seal_tracker.is_sealed:
            self._awaiting_seal_confirmation = False
            self._cancel_post_close_hold()
            return

        self._seal_tracker.break_seal()
        self._awaiting_seal_confirmation = False
        self._cancel_post_close_hold()
        self._state.sealed = False
        self._state.seal_probability = 0.0
        self._state.seal_broken_at = datetime.now()
        _LOGGER.info("Room %s: seal broken (%s)", self.config.room_id, reason)
        self._diagnose("seal_broken", category="seal", reason=reason)

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
        self._state.sealed = self._seal_tracker.is_sealed
        self._state.seal_probability = self._seal_tracker.probability
        self._state.sealed_since = self._seal_tracker.sealed_since

    # ------------------------------------------------------------------
    # State transitions
    # ------------------------------------------------------------------

    def _transition_to_occupied(
        self,
        reason: str,
        *,
        fresh_detection: bool = True,
        physical_activity: bool = False,
    ) -> None:
        """Transition to OCCUPIED state.

        Uses threshold-gated logic: only transitions if the aggregator
        probability meets occupied_threshold OR any sensor is physically
        active (fast-path safety net).
        """
        if self._state.state == OccupancyState.OCCUPIED:
            # Already occupied — update confidence and re-evaluate seal
            self._state.confidence = self._calculate_confidence()
            if (
                fresh_detection
                and not self._seal_tracker.is_sealed
                and self.config.door_seals_room
            ):
                self._evaluate_seal(f"re-detection: {reason}", fresh_detection=True)
            # Re-establish seal on new activity (refreshes diagnostic probability)
            if fresh_detection and self._seal_tracker.is_sealed:
                self._seal_tracker.establish()
                self._cancel_unsealed_activity_timer()
                self._sync_seal_state()
            return

        # Threshold gate: require physical activity OR sufficient probability
        probability = self._aggregator.get_presence_probability()
        if (
            not physical_activity
            and not self._any_sensor_active()
            and not self._any_presence_sensor_active()
        ):
            if probability < self.config.occupied_threshold:
                _LOGGER.debug(
                    "Room %s: transition to OCCUPIED blocked — "
                    "probability %.2f < threshold %.2f and no sensor active",
                    self.config.room_id,
                    probability,
                    self.config.occupied_threshold,
                )
                self._diagnose(
                    "transition_blocked",
                    previous_state=self._state.state,
                    new_state=OccupancyState.OCCUPIED,
                    reason="probability below occupied threshold and no sensor active",
                    probability=probability,
                    blockers=["occupied_threshold"],
                )
                return

        self._cancel_checking_timer()
        self._cancel_override_safety_timer()
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
        self._evaluate_seal(reason, fresh_detection=fresh_detection)

        _LOGGER.info(
            "Room %s: %s → OCCUPIED (%s, sealed=%s, confidence=%.2f, seal_p=%.2f)",
            self.config.room_id,
            old_state,
            reason,
            self._seal_tracker.is_sealed,
            self._state.confidence,
            self._seal_tracker.probability,
        )
        self._diagnose(
            "state_transition",
            previous_state=old_state,
            new_state=OccupancyState.OCCUPIED,
            reason=reason,
            probability=probability,
            metadata={
                "sealed": self._seal_tracker.is_sealed,
                "seal_probability": self._seal_tracker.probability,
            },
        )
        self._notify_state_change(reason, old_state)

    def _transition_to_checking(self, reason: str) -> None:
        """Transition to CHECKING state."""
        if self._state.state != OccupancyState.OCCUPIED:
            return

        old_state = self._state.state
        self._state.state = OccupancyState.CHECKING
        self._state.checking_started_at = datetime.now()
        self._cancel_unsealed_activity_timer()
        self._cancel_post_close_hold()
        self._start_checking_timer()

        effective_timeout = (
            self._timeout_manager.get_effective_checking_timeout()
            + self._checking_timeout_bump
        )
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
        self._diagnose(
            "state_transition",
            previous_state=old_state,
            new_state=OccupancyState.CHECKING,
            reason=reason,
            metadata={"checking_timeout": effective_timeout},
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
            self._diagnose(
                "transition_blocked",
                previous_state=self._state.state,
                new_state=OccupancyState.VACANT,
                reason="phantom hold active",
                blockers=["phantom_hold"],
            )
            return

        # Room-level seal check
        if self._seal_blocks_vacancy():
            _LOGGER.debug(
                "Room %s: vacancy blocked by confirmed closed-door seal "
                "(probability=%.2f)",
                self.config.room_id,
                self._seal_tracker.probability,
            )
            self._diagnose(
                "transition_blocked",
                category="seal",
                previous_state=self._state.state,
                new_state=OccupancyState.VACANT,
                reason="confirmed closed-door seal blocks vacancy",
                probability=self._seal_tracker.probability,
                blockers=["seal"],
            )
            return

        # Child zone check — child zones with occupies_parent keep parent occupied
        if self._is_occupied_by_children and self._is_occupied_by_children(
            self.config.room_id
        ):
            _LOGGER.debug(
                "Room %s: vacancy blocked by occupied child zone",
                self.config.room_id,
            )
            self._diagnose(
                "transition_blocked",
                previous_state=self._state.state,
                new_state=OccupancyState.VACANT,
                reason="occupied child zone",
                blockers=["child_zone"],
            )
            return

        # House-level guard check
        if self._can_go_vacant and not self._can_go_vacant(self.config.room_id):
            _LOGGER.debug(
                "Room %s: vacancy blocked by house guard",
                self.config.room_id,
            )
            self._diagnose(
                "transition_blocked",
                previous_state=self._state.state,
                new_state=OccupancyState.VACANT,
                reason="house guard blocked vacancy",
                blockers=["house_guard"],
            )
            return

        self._cancel_checking_timer()
        self._cancel_unsealed_activity_timer()
        self._cancel_post_close_hold()
        self._cancel_override_safety_timer()
        self._seal_tracker.reset()
        self._awaiting_seal_confirmation = False
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
        self._last_unsealed_activity_at = None
        self._last_sustained_activity_at = None

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
        self._diagnose(
            "state_transition",
            previous_state=old_state,
            new_state=OccupancyState.VACANT,
            reason=reason,
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
            self._diagnose(
                "transition_blocked",
                new_state=OccupancyState.CHECKING,
                reason="hold_until_exit waits for exit sensor",
                blockers=["hold_until_exit"],
            )
            return

        # Child zones with occupies_parent keep parent room OCCUPIED
        if self._is_occupied_by_children and self._is_occupied_by_children(
            self.config.room_id
        ):
            _LOGGER.debug(
                "Room %s: sensors clear but child zone is occupied, staying OCCUPIED",
                self.config.room_id,
            )
            self._diagnose(
                "transition_blocked",
                new_state=OccupancyState.CHECKING,
                reason="occupied child zone",
                blockers=["child_zone"],
            )
            return

        # Phantom hold — transition prediction keeps room OCCUPIED
        if self._has_phantom_hold and self._has_phantom_hold(self.config.room_id):
            _LOGGER.debug(
                "Room %s: sensors clear but phantom hold active, staying OCCUPIED",
                self.config.room_id,
            )
            self._diagnose(
                "transition_blocked",
                new_state=OccupancyState.CHECKING,
                reason="phantom hold active",
                blockers=["phantom_hold"],
            )
            return

        # All sensors clear — but if seal is still effective, stay OCCUPIED
        if self._seal_blocks_vacancy():
            _LOGGER.debug(
                "Room %s: all sensors clear but room has confirmed closed-door seal "
                "(probability=%.2f), staying OCCUPIED",
                self.config.room_id,
                self._seal_tracker.probability,
            )
            self._diagnose(
                "transition_blocked",
                category="seal",
                new_state=OccupancyState.CHECKING,
                reason="confirmed closed-door seal blocks checking",
                probability=self._seal_tracker.probability,
                blockers=["seal"],
            )
            return

        if self._post_close_hold_active():
            _LOGGER.debug(
                "Room %s: all sensors clear during post-close confirmation hold, "
                "staying OCCUPIED",
                self.config.room_id,
            )
            self._diagnose(
                "transition_blocked",
                category="seal",
                new_state=OccupancyState.CHECKING,
                reason="post-close confirmation hold active",
                blockers=["post_close_hold"],
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
            self._diagnose(
                "transition_blocked",
                new_state=OccupancyState.CHECKING,
                reason="probability above vacant threshold",
                probability=probability,
                blockers=["vacant_threshold"],
            )
            return

        self._transition_to_checking("all sensors clear")

    # ------------------------------------------------------------------
    # Unsealed activity timer
    # ------------------------------------------------------------------

    def _record_unsealed_activity(self, signal_type: str) -> None:
        """Record a fresh unsealed activity signal and arm the inactivity timer."""
        now = datetime.now()
        self._last_unsealed_activity_at = now
        if signal_type in ("presence", "occupancy", "spatial"):
            self._last_sustained_activity_at = now
        self._start_unsealed_activity_timer()

    def _restart_unsealed_timer_from_active_signals(self) -> None:
        """Start unsealed timeout coverage after a seal is released."""
        if self._state.state != OccupancyState.OCCUPIED or self._seal_blocks_vacancy():
            return

        if self._current_sustained_signal_active():
            self._record_unsealed_activity("presence")
        elif self._any_sensor_active():
            self._record_unsealed_activity("motion")

    def _start_unsealed_activity_timer(self, delay: float | None = None) -> None:
        """Start the unsealed inactivity timeout timer."""
        self._cancel_unsealed_activity_timer()
        timeout = self._unsealed_activity_timeout()
        scheduled_delay = max(1.0, delay if delay is not None else timeout)

        @callback
        def _unsealed_activity_timeout(_now: Any) -> None:
            self._unsealed_activity_timer = None
            self._handle_unsealed_activity_timeout()

        self._unsealed_activity_timer = async_call_later(
            self.hass,
            scheduled_delay,
            _unsealed_activity_timeout,
        )

    def _cancel_unsealed_activity_timer(self) -> None:
        """Cancel the unsealed inactivity timeout timer."""
        if self._unsealed_activity_timer:
            self._unsealed_activity_timer()
            self._unsealed_activity_timer = None

    def _handle_unsealed_activity_timeout(self) -> None:
        """Move unsealed rooms to CHECKING when all evidence is stale."""
        if self._state.state != OccupancyState.OCCUPIED:
            return

        if self._seal_blocks_vacancy():
            self._diagnose(
                "unsealed_activity_timer_ignored",
                category="seal",
                blockers=["seal"],
                reason="confirmed seal active",
            )
            return

        # Hold-until-exit zones require an explicit exit signal.
        if self.config.hold_until_exit and self.config.exit_sensors:
            return

        if self._is_occupied_by_children and self._is_occupied_by_children(
            self.config.room_id
        ):
            self._start_unsealed_activity_timer()
            return

        if self._has_phantom_hold and self._has_phantom_hold(self.config.room_id):
            self._start_unsealed_activity_timer()
            return

        now = datetime.now()
        post_close_remaining = self._post_close_hold_remaining(now)
        if post_close_remaining > 0:
            return

        if self._spatial_presence_active():
            self._last_unsealed_activity_at = now
            self._last_sustained_activity_at = now
            self._state.confidence = self._calculate_confidence()
            self._start_unsealed_activity_timer()
            self._diagnose(
                "transition_blocked",
                new_state=OccupancyState.CHECKING,
                reason="sustained presence still active",
                blockers=["sustained_presence"],
            )
            return

        activity_remaining = self._unsealed_activity_remaining(now)
        if activity_remaining > 0:
            self._start_unsealed_activity_timer(activity_remaining)
            return

        sustained_valid, sustained_remaining = self._sustained_activity_remaining(now)
        if sustained_valid:
            self._start_unsealed_activity_timer(sustained_remaining)
            return

        self._transition_to_checking("unsealed activity timeout")

    def _start_post_close_hold(self, reason: str) -> None:
        """Hold occupancy briefly after closing a previously unsealed room."""
        self._cancel_post_close_hold()
        timeout = self._exit_check_delay()
        self._post_close_hold_until = datetime.now() + timedelta(seconds=timeout)

        @callback
        def _post_close_hold_timeout(_now: Any) -> None:
            self._post_close_hold_timer = None
            self._post_close_hold_until = None
            if (
                self._state.state == OccupancyState.OCCUPIED
                and self._awaiting_seal_confirmation
                and not self._seal_blocks_vacancy()
            ):
                if not self._any_occupancy_signal_active():
                    self._transition_to_checking("post-close exit check")
                    return
                self._handle_unsealed_activity_timeout()

        self._post_close_hold_timer = async_call_later(
            self.hass,
            timeout,
            _post_close_hold_timeout,
        )
        self._diagnose(
            "post_close_hold_started",
            category="seal",
            reason=reason,
            metadata={"timeout": timeout},
        )

    def _cancel_post_close_hold(self) -> None:
        """Cancel a pending post-close confirmation hold."""
        if self._post_close_hold_timer:
            self._post_close_hold_timer()
            self._post_close_hold_timer = None
        self._post_close_hold_until = None

    def _post_close_hold_active(self) -> bool:
        """Return whether a post-close hold is currently blocking checking."""
        return self._post_close_hold_remaining(datetime.now()) > 0

    def _post_close_hold_remaining(self, now: datetime) -> float:
        """Return seconds remaining on the post-close confirmation hold."""
        if self._post_close_hold_until is None:
            return 0.0
        remaining = (self._post_close_hold_until - now).total_seconds()
        if remaining <= 0:
            self._post_close_hold_until = None
            return 0.0
        return remaining

    def _recent_active_occupancy_signal(self, now: datetime | None = None) -> bool:
        """Return whether active evidence is fresh enough to carry through close."""
        if not self._any_occupancy_signal_active():
            return False

        now = now or datetime.now()
        recent_window = max(
            self._exit_check_delay(),
            min(30.0, self._unsealed_activity_timeout()),
        )
        timestamps: list[datetime] = []

        for binding in (
            *self.config.motion_sensors,
            *self.config.presence_sensors,
            *self.config.occupancy_sensors,
        ):
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                triggered = self._sensor_last_triggered.get(binding.entity_id)
                if triggered is not None:
                    timestamps.append(triggered)

        if self._spatial_presence_active() and self._last_sustained_activity_at:
            for sensor_id in self._state.contributing_sensors:
                if sensor_id.startswith("_spatial_"):
                    triggered = self._sensor_last_triggered.get(sensor_id)
                    if triggered is not None:
                        timestamps.append(triggered)

        return any(
            (now - timestamp).total_seconds() <= recent_window
            for timestamp in timestamps
        )

    def _unsealed_activity_remaining(self, now: datetime) -> float:
        """Return seconds of unsealed activity trust still remaining."""
        if self._last_unsealed_activity_at is None:
            return 0.0
        age = (now - self._last_unsealed_activity_at).total_seconds()
        return self._unsealed_activity_timeout() - age

    def _sustained_activity_remaining(self, now: datetime) -> tuple[bool, float]:
        """Return whether sustained presence is still fresh enough to trust."""
        if self._last_sustained_activity_at is None:
            return False, 0.0
        if not self._current_sustained_signal_active():
            return False, 0.0

        timeout = max(1.0, float(getattr(self.config, "presence_timeout", 300)))
        age = (now - self._last_sustained_activity_at).total_seconds()
        remaining = timeout - age
        return remaining > 0, remaining

    def _current_sustained_signal_active(self) -> bool:
        """Check whether presence, occupancy, or spatial presence is active."""
        if self._any_presence_sensor_active():
            return True

        return self._spatial_presence_active()

    def _spatial_presence_active(self) -> bool:
        """Check whether any spatial presence source currently has a target."""
        return any(
            sensor_id.startswith("_spatial_")
            for sensor_id in self._state.contributing_sensors
        )

    def _unsealed_activity_timeout(self) -> float:
        """Configured inactivity timeout for unsealed rooms."""
        return max(1.0, float(getattr(self.config, "unsealed_activity_timeout", 120)))

    def _exit_check_delay(self) -> float:
        """Configured delay before checking a likely exit after door close."""
        return max(1.0, float(getattr(self.config, "exit_check_delay", 15)))

    # ------------------------------------------------------------------
    # Override safety timer
    # ------------------------------------------------------------------

    def _start_override_safety_timer(self) -> None:
        """Start a bounded safety timer for physical override states."""
        self._cancel_override_safety_timer()
        timeout = max(
            1.0,
            float(getattr(self.config, "override_safety_timeout", 30 * 60)),
        )

        @callback
        def _override_safety_timeout(_now: Any) -> None:
            self._override_safety_timer = None
            self._handle_override_safety_timeout()

        self._override_safety_timer = async_call_later(
            self.hass,
            timeout,
            _override_safety_timeout,
        )
        self._diagnose(
            "override_safety_timer_started",
            reason="override safety timer armed",
            metadata={"timeout": timeout},
        )

    def _cancel_override_safety_timer(self) -> None:
        """Cancel a pending override safety timer."""
        if self._override_safety_timer:
            self._override_safety_timer()
            self._override_safety_timer = None

    def _handle_override_safety_timeout(self) -> None:
        """Release an override-created state back to sensor-derived logic."""
        if self._state.state == OccupancyState.OCCUPIED:
            if self._any_occupancy_signal_active():
                self.recalculate_from_current_state("override safety timeout")
                return
            if self._seal_blocks_vacancy():
                self._diagnose(
                    "transition_blocked",
                    category="seal",
                    new_state=OccupancyState.CHECKING,
                    reason="override safety timeout blocked by closed-door seal",
                    blockers=["seal"],
                )
                return
            if self._seal_tracker.is_sealed:
                self._break_seal("override safety timeout")
            self._transition_to_checking("override safety timeout")
            return

        self.recalculate_from_current_state("override safety timeout")

    # ------------------------------------------------------------------
    # Checking timer
    # ------------------------------------------------------------------

    def _start_checking_timer(self, delay_seconds: float | None = None) -> None:
        """Start the checking state timeout timer."""
        self._cancel_checking_timer()
        effective_timeout = (
            self._timeout_manager.get_effective_checking_timeout()
            + self._checking_timeout_bump
        )
        delay = effective_timeout if delay_seconds is None else max(0.0, delay_seconds)

        @callback
        def _checking_timeout(_now: Any) -> None:
            self._checking_timer = None
            if self._state.state == OccupancyState.CHECKING:
                self._transition_to_vacant("checking timeout")

        self._checking_timer = async_call_later(
            self.hass,
            delay,
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

    def _any_occupancy_signal_active(self) -> bool:
        """Check if any motion, presence, occupancy, or spatial source is active."""
        return self._any_sensor_active() or self._any_presence_sensor_active()

    def _seal_blocks_vacancy(self) -> bool:
        """Return whether a confirmed closed-door seal should block vacancy."""
        return (
            self.config.door_seals_room
            and self._seal_tracker.is_sealed
            and self._all_doors_closed()
            and not self._any_door_unavailable()
        )

    def _any_presence_sensor_active(self) -> bool:
        """Check if any presence or occupancy sensor is currently active."""
        for binding in self.config.presence_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                return True
        for binding in self.config.occupancy_sensors:
            state = self.hass.states.get(binding.entity_id)
            if state and self._is_sensor_active(state, binding.inverted):
                return True
        return False

    def _all_doors_closed(self) -> bool:
        """Check if all door sensors indicate closed doors.

        When a door sensor is unavailable, falls back to the last known
        state.  If the last known state was closed, the door is treated
        as closed so the seal is not broken by transient sensor outages.
        If the sensor was never seen, we assume open (safe default).
        """
        if not self.config.door_sensors:
            return False

        for binding in self.config.door_sensors:
            state = self.hass.states.get(binding.entity_id)
            if not state or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                # Fallback to last known state
                last_known_open = self._last_known_door_states.get(binding.entity_id)
                if last_known_open is None or last_known_open:
                    return False  # Never seen or last known open
                _LOGGER.debug(
                    "Room %s: door %s unavailable, using last known closed",
                    self.config.room_id,
                    binding.entity_id,
                )
                continue  # Last known state was closed
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
        if state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return False
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

    def _get_occupancy_binding(self, entity_id: str) -> Any:
        """Get occupancy sensor binding by entity ID."""
        for binding in self.config.occupancy_sensors:
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
        """Update list of contributing sensors (copy-on-write for safety)."""
        current = self._state.contributing_sensors
        if add:
            if entity_id not in current:
                self._state.contributing_sensors = [*current, entity_id]
        else:
            if entity_id in current:
                self._state.contributing_sensors = [
                    s for s in current if s != entity_id
                ]

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
            solo_rate = self._correlation_tracker.get_solo_fire_rate(binding.entity_id)
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

        for binding in self.config.occupancy_sensors:
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
                "sensor_type": "occupancy",
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
