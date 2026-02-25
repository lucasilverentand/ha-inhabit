"""Multi-room reasoner for cross-room occupancy inference."""

from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from collections.abc import Callable

    from ..store.floor_plan_store import FloorPlanStore

from ..const import OccupancyState

_LOGGER = logging.getLogger(__name__)

# Transition inference window: if room A goes CHECKING and room B goes
# OCCUPIED within this window, infer that A is now VACANT.
TRANSITION_WINDOW_SECONDS = 10.0


class MultiRoomReasoner:
    """Cross-room occupancy reasoner.

    Applies three inference strategies:
    1. Transition inference: adjacent room A goes CHECKING + room B goes
       OCCUPIED within 10s -> push A to VACANT.
    2. Person count constraint: at most N rooms occupied when N people are home.
    3. Path plausibility: occupancy transitions should follow the adjacency graph.
    """

    def __init__(
        self,
        store: FloorPlanStore,
        force_vacant_callback: Callable[[str, str], None] | None = None,
    ) -> None:
        """Initialize the multi-room reasoner.

        Args:
            store: Floor plan store for building the adjacency graph.
            force_vacant_callback: Called as force_vacant_callback(room_id, reason)
                to force a room to VACANT.
        """
        self._store = store
        self._force_vacant = force_vacant_callback

        # Adjacency graph: room_id -> set of adjacent room_ids
        self._adjacency: dict[str, set[str]] = {}

        # Current room states: room_id -> OccupancyState string
        self._room_states: dict[str, str] = {}

        # Timestamps for transition inference
        self._checking_since: dict[str, datetime] = {}

        # Person count constraint
        self._person_count: int | None = None

        self._running = False

    @property
    def adjacency_graph(self) -> dict[str, set[str]]:
        """Get the current adjacency graph."""
        return dict(self._adjacency)

    @property
    def person_count(self) -> int | None:
        """Get the current person count."""
        return self._person_count

    @property
    def room_states(self) -> dict[str, str]:
        """Get current room states."""
        return dict(self._room_states)

    async def async_start(self) -> None:
        """Start the reasoner and build the adjacency graph."""
        if self._running:
            return
        self._running = True
        self._adjacency = build_adjacency_graph(self._store)
        _LOGGER.debug(
            "Multi-room reasoner started with %d rooms in adjacency graph",
            len(self._adjacency),
        )

    async def async_stop(self) -> None:
        """Stop the reasoner and clear state."""
        self._running = False
        self._adjacency.clear()
        self._room_states.clear()
        self._checking_since.clear()
        self._person_count = None

    def refresh_graph(self) -> None:
        """Rebuild the adjacency graph from current floor plan data."""
        self._adjacency = build_adjacency_graph(self._store)

    def set_person_count(self, count: int) -> None:
        """Set the number of people at home.

        Immediately enforces the person count constraint if the number
        of currently occupied rooms exceeds the count.
        """
        self._person_count = count
        _LOGGER.debug("Person count set to %d", count)
        self._enforce_person_count()

    def on_room_state_changed(
        self,
        room_id: str,
        old_state: str,
        new_state: str,
        confidence: float = 0.0,
    ) -> None:
        """Called on every room state transition.

        Applies transition inference and person count constraints.
        """
        self._room_states[room_id] = new_state

        # Track when rooms enter CHECKING
        if new_state == OccupancyState.CHECKING:
            self._checking_since[room_id] = datetime.now()
        elif new_state != OccupancyState.CHECKING:
            self._checking_since.pop(room_id, None)

        # Transition inference: room goes OCCUPIED -> check if adjacent
        # rooms in CHECKING should be pushed to VACANT
        if new_state == OccupancyState.OCCUPIED:
            self._infer_transitions(room_id)

        # Person count constraint enforcement
        if new_state == OccupancyState.OCCUPIED:
            self._enforce_person_count()

    def is_transition_plausible(self, from_room: str, to_room: str) -> bool:
        """Check if a direct occupancy transition between two rooms is plausible.

        Returns True if the rooms are adjacent in the graph, or if either
        room is not in the graph (unknown rooms are always plausible).
        """
        if from_room not in self._adjacency or to_room not in self._adjacency:
            return True
        return to_room in self._adjacency.get(from_room, set())

    def get_occupied_rooms(self) -> list[str]:
        """Get list of currently occupied room IDs."""
        return [
            room_id
            for room_id, state in self._room_states.items()
            if state in (OccupancyState.OCCUPIED, OccupancyState.CHECKING)
        ]

    def _infer_transitions(self, newly_occupied_room: str) -> None:
        """Infer vacancy for adjacent rooms in CHECKING state.

        If room A is CHECKING and adjacent room B just became OCCUPIED
        within the transition window, push A to VACANT.
        """
        if not self._force_vacant:
            return

        now = datetime.now()
        adjacent = self._adjacency.get(newly_occupied_room, set())

        for adj_room in adjacent:
            if self._room_states.get(adj_room) != OccupancyState.CHECKING:
                continue

            checking_start = self._checking_since.get(adj_room)
            if checking_start is None:
                continue

            elapsed = (now - checking_start).total_seconds()
            if elapsed <= TRANSITION_WINDOW_SECONDS:
                reason = (
                    f"transition inference: adjacent room {newly_occupied_room} "
                    f"became occupied within {elapsed:.1f}s"
                )
                _LOGGER.info(
                    "Room %s: pushing to VACANT via transition inference "
                    "(adjacent %s occupied)",
                    adj_room,
                    newly_occupied_room,
                )
                self._force_vacant(adj_room, reason)
                self._room_states[adj_room] = OccupancyState.VACANT
                self._checking_since.pop(adj_room, None)

    def _enforce_person_count(self) -> None:
        """Enforce person count constraint.

        If more rooms are occupied than people are home, push the least
        confident rooms to VACANT (lowest confidence first).
        """
        if self._person_count is None or not self._force_vacant:
            return

        occupied = self.get_occupied_rooms()
        excess = len(occupied) - self._person_count

        if excess <= 0:
            return

        # Push CHECKING rooms first (they're already on their way out),
        # then OCCUPIED rooms
        checking_rooms = [
            r for r in occupied
            if self._room_states.get(r) == OccupancyState.CHECKING
        ]
        occupied_rooms = [
            r for r in occupied
            if self._room_states.get(r) == OccupancyState.OCCUPIED
        ]

        to_vacate = checking_rooms[:excess]
        remaining = excess - len(to_vacate)
        if remaining > 0:
            to_vacate.extend(occupied_rooms[:remaining])

        for room_id in to_vacate:
            reason = (
                f"person count constraint: {len(occupied)} rooms occupied "
                f"but only {self._person_count} people home"
            )
            _LOGGER.info(
                "Room %s: pushing to VACANT (person count constraint, "
                "%d occupied > %d people)",
                room_id,
                len(occupied),
                self._person_count,
            )
            self._force_vacant(room_id, reason)
            self._room_states[room_id] = OccupancyState.VACANT
            self._checking_since.pop(room_id, None)


def build_adjacency_graph(store: FloorPlanStore) -> dict[str, set[str]]:
    """Build an adjacency graph from room connected_rooms data in floor plans.

    Returns a dict mapping each room_id to a set of adjacent room_ids.
    The graph is undirected (symmetric).
    """
    graph: dict[str, set[str]] = defaultdict(set)

    for fp in store.get_floor_plans():
        for floor in fp.floors:
            for room in floor.rooms:
                # Ensure every room appears in the graph
                if room.id not in graph:
                    graph[room.id] = set()

                for connected_id in room.connected_rooms:
                    graph[room.id].add(connected_id)
                    graph[connected_id].add(room.id)

    return dict(graph)
