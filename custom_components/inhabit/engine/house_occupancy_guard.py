"""House-level occupancy guard using exterior door sensors."""

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

from ..const import DEFAULT_HOUSE_GUARD_MAX_DURATION, OccupancyState

if TYPE_CHECKING:
    from homeassistant.core import Event

    from ..models.virtual_sensor import SensorBinding
    from ..store.floor_plan_store import FloorPlanStore

_LOGGER = logging.getLogger(__name__)


class HouseOccupancyGuard:
    """
    House-level occupancy constraint.

    Prevents the entire house from going VACANT when exterior doors have
    not opened since the last detection.  If someone was detected inside
    and no exterior door has opened, at least one person must still be home.

    This acts as a constraint, not a state machine — it does not own any
    entity.  Room-level state machines consult it via can_room_go_vacant().
    """

    def __init__(
        self,
        hass: HomeAssistant,
        store: FloorPlanStore,
        max_duration: int = DEFAULT_HOUSE_GUARD_MAX_DURATION,
    ) -> None:
        """Initialize the house guard."""
        self.hass = hass
        self._store = store
        self._max_duration = max_duration

        # State
        self._sealed = False
        self._last_detection_at: datetime | None = None
        self._last_exterior_door_at: datetime | None = None
        self._sealed_since: datetime | None = None

        # Track which rooms are occupied
        self._occupied_rooms: set[str] = set()

        # Exterior door bindings (auto-discovered from floor plan edges)
        self._exterior_door_bindings: list[SensorBinding] = []
        self._unsub_listeners: list[Callable[[], None]] = []
        self._expiry_timer: Callable[[], None] | None = None
        self._running = False

    @property
    def sealed(self) -> bool:
        """Check if the house is sealed."""
        return self._sealed

    @property
    def anyone_home(self) -> bool:
        """Check if anyone is considered home."""
        return len(self._occupied_rooms) > 0

    async def async_start(self) -> None:
        """Start the house guard, discovering exterior doors from floor plan."""
        if self._running:
            return

        self._running = True
        self._discover_exterior_doors()

        # Subscribe to exterior door sensors
        for binding in self._exterior_door_bindings:
            unsub = async_track_state_change_event(
                self.hass,
                binding.entity_id,
                self._handle_exterior_door_event,
            )
            self._unsub_listeners.append(unsub)

        _LOGGER.info(
            "House guard started with %d exterior door sensors: %s",
            len(self._exterior_door_bindings),
            [b.entity_id for b in self._exterior_door_bindings],
        )

    async def async_stop(self) -> None:
        """Stop the house guard."""
        self._running = False
        self._cancel_expiry_timer()

        for unsub in self._unsub_listeners:
            try:
                unsub()
            except Exception:
                _LOGGER.exception("Error unsubscribing house guard listener")
        self._unsub_listeners.clear()

        self._sealed = False
        self._occupied_rooms.clear()
        _LOGGER.info("House guard stopped")

    def on_room_state_changed(self, room_id: str, state: str) -> None:
        """Notify the guard that a room's occupancy state changed."""
        if state in (OccupancyState.OCCUPIED, OccupancyState.CHECKING):
            was_empty = len(self._occupied_rooms) == 0
            self._occupied_rooms.add(room_id)

            if was_empty:
                self._last_detection_at = datetime.now()

            # Try to establish seal if not already sealed
            if not self._sealed and self._all_exterior_doors_closed():
                self._establish_seal("room became occupied")
        else:
            # Room went VACANT
            self._occupied_rooms.discard(room_id)

            if not self._occupied_rooms:
                # Last room went vacant — house is empty
                self._sealed = False
                self._cancel_expiry_timer()
                _LOGGER.info("House guard: house is now empty")

    def can_room_go_vacant(self, room_id: str) -> bool:
        """Check if a room is allowed to go vacant.

        Returns False only if this is the last occupied room and the house
        is sealed (no exterior door has opened).
        """
        if not self._sealed:
            return True

        if not self._exterior_door_bindings:
            return True  # No exterior doors configured

        # Would this room going vacant make the house empty?
        remaining = self._occupied_rooms - {room_id}
        if remaining:
            return True  # Other rooms are still occupied

        # This is the last room and the house is sealed
        _LOGGER.info(
            "House guard: blocking vacancy for room %s "
            "(last occupied room, house sealed since %s)",
            room_id,
            self._sealed_since,
        )
        return False

    # ------------------------------------------------------------------
    # Exterior door handling
    # ------------------------------------------------------------------

    def _discover_exterior_doors(self) -> None:
        """Auto-discover exterior door sensors from floor plan edges."""
        from ..models.virtual_sensor import SensorBinding

        self._exterior_door_bindings = []
        seen: set[str] = set()

        for fp in self._store.get_floor_plans():
            for floor in fp.floors:
                for edge in floor.edges:
                    if (
                        edge.type == "door"
                        and edge.is_exterior
                        and edge.entity_id
                        and edge.entity_id not in seen
                    ):
                        self._exterior_door_bindings.append(
                            SensorBinding(
                                entity_id=edge.entity_id,
                                sensor_type="door",
                            )
                        )
                        seen.add(edge.entity_id)

        if not self._exterior_door_bindings:
            _LOGGER.debug("House guard: no exterior door sensors found in floor plan")

    @callback
    def _handle_exterior_door_event(self, event: Event) -> None:
        """Handle exterior door sensor state change."""
        new_state: State | None = event.data.get("new_state")
        if not new_state:
            return

        entity_id = event.data.get("entity_id", "")
        self._last_exterior_door_at = datetime.now()

        # Unavailable sensor — break seal
        if new_state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            if self._sealed:
                _LOGGER.warning(
                    "House guard: exterior door %s became %s, breaking seal",
                    entity_id,
                    new_state.state,
                )
                self._break_seal(f"exterior door {entity_id} unavailable")
            return

        binding = self._get_binding(entity_id)
        if not binding:
            return

        is_open = self._is_sensor_active(new_state, binding.inverted)

        if is_open:
            if self._sealed:
                self._break_seal(f"exterior door {entity_id} opened")
        else:
            # Door closed — re-establish seal if there are occupied rooms
            if (
                not self._sealed
                and self._occupied_rooms
                and self._all_exterior_doors_closed()
            ):
                self._establish_seal(f"exterior door {entity_id} closed")

    # ------------------------------------------------------------------
    # Seal management
    # ------------------------------------------------------------------

    def _establish_seal(self, reason: str) -> None:
        """Establish the house-level seal."""
        self._sealed = True
        self._sealed_since = datetime.now()
        self._start_expiry_timer()
        _LOGGER.info("House guard: seal established (%s)", reason)

    def _break_seal(self, reason: str) -> None:
        """Break the house-level seal."""
        if not self._sealed:
            return
        self._sealed = False
        self._cancel_expiry_timer()
        _LOGGER.info("House guard: seal broken (%s)", reason)

    def _start_expiry_timer(self) -> None:
        """Start the safety-valve timer."""
        self._cancel_expiry_timer()

        @callback
        def _expired(_now: Any) -> None:
            self._expiry_timer = None
            if self._sealed:
                _LOGGER.info(
                    "House guard: seal expired after %ds (safety valve)",
                    self._max_duration,
                )
                self._break_seal(f"expired after {self._max_duration}s")

        self._expiry_timer = async_call_later(self.hass, self._max_duration, _expired)

    def _cancel_expiry_timer(self) -> None:
        """Cancel the expiry timer."""
        if self._expiry_timer:
            self._expiry_timer()
            self._expiry_timer = None

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _all_exterior_doors_closed(self) -> bool:
        """Check if all exterior doors are closed."""
        for binding in self._exterior_door_bindings:
            state = self.hass.states.get(binding.entity_id)
            if not state or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                return False
            if self._is_sensor_active(state, binding.inverted):
                return False  # Open
        return True

    def _get_binding(self, entity_id: str) -> SensorBinding | None:
        """Get binding by entity ID."""
        for binding in self._exterior_door_bindings:
            if binding.entity_id == entity_id:
                return binding
        return None

    def _is_sensor_active(self, state: State, inverted: bool) -> bool:
        """Check if a sensor is in an active state."""
        is_on = state.state in (STATE_ON, "on", "detected", "open", "true", "1")
        return not is_on if inverted else is_on
