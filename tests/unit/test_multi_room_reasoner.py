"""Unit tests for the multi-room reasoner."""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.engine.multi_room_reasoner import (
    TRANSITION_WINDOW_SECONDS,
    MultiRoomReasoner,
    build_adjacency_graph,
)


def _make_mock_store(rooms_with_connections: dict[str, list[str]] | None = None):
    """Create a mock FloorPlanStore with connected rooms.

    Args:
        rooms_with_connections: Dict of room_id -> list of connected room_ids.
    """
    store = MagicMock()
    if rooms_with_connections is None:
        rooms_with_connections = {}

    mock_rooms = []
    for room_id, connections in rooms_with_connections.items():
        room = MagicMock()
        room.id = room_id
        room.connected_rooms = connections
        mock_rooms.append(room)

    mock_floor = MagicMock()
    mock_floor.rooms = mock_rooms
    mock_floor.zones = []

    mock_fp = MagicMock()
    mock_fp.floors = [mock_floor]

    store.get_floor_plans.return_value = [mock_fp]
    return store


class TestBuildAdjacencyGraph:
    """Tests for building the adjacency graph from floor plan data."""

    def test_empty_store(self):
        """Empty store produces empty graph."""
        store = MagicMock()
        store.get_floor_plans.return_value = []
        graph = build_adjacency_graph(store)
        assert graph == {}

    def test_single_room_no_connections(self):
        """Single room with no connections."""
        store = _make_mock_store({"room_a": []})
        graph = build_adjacency_graph(store)
        assert "room_a" in graph
        assert graph["room_a"] == set()

    def test_two_rooms_connected(self):
        """Two connected rooms form a symmetric graph."""
        store = _make_mock_store({
            "room_a": ["room_b"],
            "room_b": ["room_a"],
        })
        graph = build_adjacency_graph(store)
        assert "room_b" in graph["room_a"]
        assert "room_a" in graph["room_b"]

    def test_one_directional_connection_becomes_symmetric(self):
        """A one-directional connection is made symmetric."""
        store = _make_mock_store({
            "room_a": ["room_b"],
            "room_b": [],
        })
        graph = build_adjacency_graph(store)
        assert "room_b" in graph["room_a"]
        assert "room_a" in graph["room_b"]

    def test_three_room_chain(self):
        """A -> B -> C chain."""
        store = _make_mock_store({
            "room_a": ["room_b"],
            "room_b": ["room_a", "room_c"],
            "room_c": ["room_b"],
        })
        graph = build_adjacency_graph(store)
        assert graph["room_a"] == {"room_b"}
        assert graph["room_b"] == {"room_a", "room_c"}
        assert graph["room_c"] == {"room_b"}


class TestMultiRoomReasonerLifecycle:
    """Tests for reasoner start/stop lifecycle."""

    @pytest.mark.asyncio
    async def test_start_builds_graph(self):
        """Starting the reasoner builds the adjacency graph."""
        store = _make_mock_store({
            "room_a": ["room_b"],
            "room_b": ["room_a"],
        })
        reasoner = MultiRoomReasoner(store)
        await reasoner.async_start()
        assert len(reasoner.adjacency_graph) == 2
        await reasoner.async_stop()

    @pytest.mark.asyncio
    async def test_stop_clears_state(self):
        """Stopping the reasoner clears all state."""
        store = _make_mock_store({"room_a": ["room_b"], "room_b": ["room_a"]})
        reasoner = MultiRoomReasoner(store)
        await reasoner.async_start()
        reasoner.on_room_state_changed("room_a", OccupancyState.VACANT, OccupancyState.OCCUPIED)
        await reasoner.async_stop()
        assert reasoner.adjacency_graph == {}
        assert reasoner.room_states == {}


class TestTransitionInference:
    """Tests for transition inference logic."""

    def test_adjacent_checking_pushed_to_vacant(self):
        """Room A CHECKING + adjacent B OCCUPIED -> A pushed VACANT."""
        forced = []

        def force_vacant(room_id, reason):
            forced.append((room_id, reason))

        store = _make_mock_store({
            "room_a": ["room_b"],
            "room_b": ["room_a"],
        })
        reasoner = MultiRoomReasoner(store, force_vacant_callback=force_vacant)
        reasoner._adjacency = build_adjacency_graph(store)
        reasoner._running = True

        # Room A goes to CHECKING
        reasoner.on_room_state_changed(
            "room_a", OccupancyState.OCCUPIED, OccupancyState.CHECKING
        )
        assert reasoner.room_states["room_a"] == OccupancyState.CHECKING

        # Room B goes OCCUPIED within window -> A should be pushed VACANT
        reasoner.on_room_state_changed(
            "room_b", OccupancyState.VACANT, OccupancyState.OCCUPIED
        )
        assert len(forced) == 1
        assert forced[0][0] == "room_a"
        assert "transition inference" in forced[0][1]

    def test_non_adjacent_rooms_not_inferred(self):
        """Non-adjacent rooms don't trigger transition inference."""
        forced = []

        def force_vacant(room_id, reason):
            forced.append((room_id, reason))

        store = _make_mock_store({
            "room_a": ["room_b"],
            "room_b": ["room_a"],
            "room_c": [],
        })
        reasoner = MultiRoomReasoner(store, force_vacant_callback=force_vacant)
        reasoner._adjacency = build_adjacency_graph(store)
        reasoner._running = True

        # Room A checking
        reasoner.on_room_state_changed(
            "room_a", OccupancyState.OCCUPIED, OccupancyState.CHECKING
        )

        # Room C (not adjacent to A) goes occupied
        reasoner.on_room_state_changed(
            "room_c", OccupancyState.VACANT, OccupancyState.OCCUPIED
        )

        assert len(forced) == 0

    def test_outside_transition_window_not_inferred(self):
        """Transitions outside the window are not inferred."""
        forced = []

        def force_vacant(room_id, reason):
            forced.append((room_id, reason))

        store = _make_mock_store({
            "room_a": ["room_b"],
            "room_b": ["room_a"],
        })
        reasoner = MultiRoomReasoner(store, force_vacant_callback=force_vacant)
        reasoner._adjacency = build_adjacency_graph(store)
        reasoner._running = True

        # Room A goes CHECKING
        reasoner.on_room_state_changed(
            "room_a", OccupancyState.OCCUPIED, OccupancyState.CHECKING
        )

        # Backdate the checking timestamp beyond the window
        reasoner._checking_since["room_a"] = datetime.now() - timedelta(
            seconds=TRANSITION_WINDOW_SECONDS + 5
        )

        # Room B goes OCCUPIED - but A has been CHECKING too long
        reasoner.on_room_state_changed(
            "room_b", OccupancyState.VACANT, OccupancyState.OCCUPIED
        )

        assert len(forced) == 0


class TestPersonCountConstraint:
    """Tests for person count constraint."""

    def test_excess_rooms_pushed_vacant(self):
        """More occupied rooms than people -> excess pushed to VACANT."""
        forced = []

        def force_vacant(room_id, reason):
            forced.append((room_id, reason))

        store = _make_mock_store({
            "room_a": [],
            "room_b": [],
            "room_c": [],
        })
        reasoner = MultiRoomReasoner(store, force_vacant_callback=force_vacant)
        reasoner._adjacency = build_adjacency_graph(store)
        reasoner._running = True

        # Three rooms occupied
        reasoner.on_room_state_changed("room_a", OccupancyState.VACANT, OccupancyState.OCCUPIED)
        reasoner.on_room_state_changed("room_b", OccupancyState.VACANT, OccupancyState.OCCUPIED)
        reasoner.on_room_state_changed("room_c", OccupancyState.VACANT, OccupancyState.OCCUPIED)

        # Set person count to 1 -> 2 rooms should be pushed vacant
        reasoner.set_person_count(1)
        assert len(forced) == 2

    def test_no_constraint_without_person_count(self):
        """No enforcement when person_count is None."""
        forced = []

        def force_vacant(room_id, reason):
            forced.append((room_id, reason))

        store = _make_mock_store({"room_a": [], "room_b": []})
        reasoner = MultiRoomReasoner(store, force_vacant_callback=force_vacant)
        reasoner._adjacency = build_adjacency_graph(store)
        reasoner._running = True

        reasoner.on_room_state_changed("room_a", OccupancyState.VACANT, OccupancyState.OCCUPIED)
        reasoner.on_room_state_changed("room_b", OccupancyState.VACANT, OccupancyState.OCCUPIED)

        assert len(forced) == 0  # No person count set

    def test_checking_rooms_evicted_first(self):
        """CHECKING rooms are evicted before OCCUPIED rooms."""
        forced = []

        def force_vacant(room_id, reason):
            forced.append((room_id, reason))

        store = _make_mock_store({"room_a": [], "room_b": [], "room_c": []})
        reasoner = MultiRoomReasoner(store, force_vacant_callback=force_vacant)
        reasoner._adjacency = build_adjacency_graph(store)
        reasoner._running = True

        # room_a OCCUPIED, room_b CHECKING, room_c OCCUPIED
        reasoner._room_states["room_a"] = OccupancyState.OCCUPIED
        reasoner._room_states["room_b"] = OccupancyState.CHECKING
        reasoner._room_states["room_c"] = OccupancyState.OCCUPIED

        reasoner.set_person_count(1)

        # room_b (CHECKING) should be evicted first
        assert forced[0][0] == "room_b"


class TestPathPlausibility:
    """Tests for path plausibility checks."""

    def test_adjacent_rooms_plausible(self):
        """Adjacent rooms are plausible transitions."""
        store = _make_mock_store({
            "room_a": ["room_b"],
            "room_b": ["room_a"],
        })
        reasoner = MultiRoomReasoner(store)
        reasoner._adjacency = build_adjacency_graph(store)

        assert reasoner.is_transition_plausible("room_a", "room_b") is True

    def test_non_adjacent_rooms_not_plausible(self):
        """Non-adjacent rooms are not plausible transitions."""
        store = _make_mock_store({
            "room_a": ["room_b"],
            "room_b": ["room_a"],
            "room_c": [],
        })
        reasoner = MultiRoomReasoner(store)
        reasoner._adjacency = build_adjacency_graph(store)

        assert reasoner.is_transition_plausible("room_a", "room_c") is False

    def test_unknown_room_always_plausible(self):
        """Unknown rooms (not in graph) are always plausible."""
        store = _make_mock_store({"room_a": []})
        reasoner = MultiRoomReasoner(store)
        reasoner._adjacency = build_adjacency_graph(store)

        assert reasoner.is_transition_plausible("room_a", "unknown") is True
        assert reasoner.is_transition_plausible("unknown", "room_a") is True


class TestGetOccupiedRooms:
    """Tests for getting occupied rooms."""

    def test_returns_occupied_and_checking(self):
        """Both OCCUPIED and CHECKING rooms are returned."""
        store = _make_mock_store({})
        reasoner = MultiRoomReasoner(store)
        reasoner._room_states = {
            "room_a": OccupancyState.OCCUPIED,
            "room_b": OccupancyState.CHECKING,
            "room_c": OccupancyState.VACANT,
        }
        occupied = reasoner.get_occupied_rooms()
        assert "room_a" in occupied
        assert "room_b" in occupied
        assert "room_c" not in occupied

    def test_empty_states(self):
        """No rooms returns empty list."""
        store = _make_mock_store({})
        reasoner = MultiRoomReasoner(store)
        assert reasoner.get_occupied_rooms() == []
