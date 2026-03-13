"""Unit tests for the house occupancy guard."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock, patch

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from homeassistant.const import STATE_OFF, STATE_ON, STATE_UNAVAILABLE

from custom_components.inhabit.const import (
    OccupancyState,
)
from custom_components.inhabit.engine.house_occupancy_guard import HouseOccupancyGuard
from custom_components.inhabit.models.floor_plan import Edge, Floor, FloorPlan

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_door_event(entity_id: str, state_value: str) -> MagicMock:
    """Build a mock Event for a door state change."""
    new_state = MagicMock()
    new_state.state = state_value
    event = MagicMock()
    event.data = {"new_state": new_state, "entity_id": entity_id}
    return event


def _make_store(*floor_plans: FloorPlan) -> MagicMock:
    """Build a mock FloorPlanStore that returns the given floor plans."""
    store = MagicMock()
    store.get_floor_plans.return_value = list(floor_plans)
    return store


def _make_floor_plan_with_edges(edges: list[Edge]) -> FloorPlan:
    """Build a FloorPlan containing one floor with the given edges."""
    floor = Floor(id="floor_1", name="Ground", level=0, edges=edges)
    return FloorPlan(
        id="fp_1",
        name="Test",
        created_at="2025-01-01T00:00:00",
        updated_at="2025-01-01T00:00:00",
        floors=[floor],
    )


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = MagicMock()
    hass.states = MagicMock()
    hass.loop = MagicMock()
    return hass


@pytest.fixture
def empty_store():
    """Store with no floor plans (no exterior doors)."""
    return _make_store()


@pytest.fixture
def store_with_front_door():
    """Store with a single exterior door."""
    edge = Edge(
        id="edge_front",
        type="door",
        is_exterior=True,
        entity_id="binary_sensor.front_door",
    )
    return _make_store(_make_floor_plan_with_edges([edge]))


# ---------------------------------------------------------------------------
# TestHouseGuardBasic
# ---------------------------------------------------------------------------


class TestHouseGuardBasic:
    """Fundamental seal and door logic."""

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_no_exterior_doors_allows_all_vacancy(
        self, _mock_timer, mock_hass, empty_store
    ):
        """Guard with no exterior door bindings always allows vacancy."""
        guard = HouseOccupancyGuard(mock_hass, empty_store)
        guard._discover_exterior_doors()

        # Even after marking a room occupied the guard should allow vacancy
        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
        assert guard.can_room_go_vacant("room_a") is True

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_seal_established_when_room_becomes_occupied(
        self, mock_timer, mock_hass, store_with_front_door
    ):
        """Room becomes occupied + all exterior doors closed -> sealed."""
        # All doors report OFF (closed)
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
        guard._discover_exterior_doors()

        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)

        assert guard.sealed is True
        mock_timer.assert_called_once()

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_seal_not_established_when_door_open(
        self, mock_timer, mock_hass, store_with_front_door
    ):
        """Room becomes occupied but exterior door is open -> not sealed."""
        # Door sensor reports ON (open)
        mock_hass.states.get.return_value = MagicMock(state=STATE_ON)

        guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
        guard._discover_exterior_doors()

        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)

        assert guard.sealed is False
        mock_timer.assert_not_called()

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_exterior_door_open_breaks_seal(
        self, mock_timer, mock_hass, store_with_front_door
    ):
        """Door event with STATE_ON breaks existing seal."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
        guard._discover_exterior_doors()
        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
        assert guard.sealed is True

        # Door opens
        event = _make_door_event("binary_sensor.front_door", STATE_ON)
        guard._handle_exterior_door_event(event)

        assert guard.sealed is False

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_exterior_door_unavailable_breaks_seal(
        self, mock_timer, mock_hass, store_with_front_door
    ):
        """Door event with STATE_UNAVAILABLE breaks existing seal."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
        guard._discover_exterior_doors()
        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
        assert guard.sealed is True

        event = _make_door_event("binary_sensor.front_door", STATE_UNAVAILABLE)
        guard._handle_exterior_door_event(event)

        assert guard.sealed is False

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_door_close_reestablishes_seal(
        self, mock_timer, mock_hass, store_with_front_door
    ):
        """After seal is broken, door closing with occupied rooms re-seals."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
        guard._discover_exterior_doors()
        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
        assert guard.sealed is True

        # Break the seal by opening the door
        event_open = _make_door_event("binary_sensor.front_door", STATE_ON)
        guard._handle_exterior_door_event(event_open)
        assert guard.sealed is False

        # Close the door -> re-seal (hass.states.get still returns OFF)
        event_close = _make_door_event("binary_sensor.front_door", STATE_OFF)
        guard._handle_exterior_door_event(event_close)
        assert guard.sealed is True


# ---------------------------------------------------------------------------
# TestHouseGuardVacancyBlocking
# ---------------------------------------------------------------------------


class TestHouseGuardVacancyBlocking:
    """Tests around can_room_go_vacant logic."""

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_last_room_blocked_when_sealed(
        self, _mock_timer, mock_hass, store_with_front_door
    ):
        """Last occupied room cannot go vacant while house is sealed."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
        guard._discover_exterior_doors()
        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
        assert guard.sealed is True

        assert guard.can_room_go_vacant("room_a") is False

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_non_last_room_allowed_when_sealed(
        self, _mock_timer, mock_hass, store_with_front_door
    ):
        """When multiple rooms are occupied any one of them can go vacant."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
        guard._discover_exterior_doors()
        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
        guard.on_room_state_changed("room_b", OccupancyState.OCCUPIED)
        assert guard.sealed is True

        assert guard.can_room_go_vacant("room_a") is True
        assert guard.can_room_go_vacant("room_b") is True

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_last_room_allowed_when_not_sealed(
        self, _mock_timer, mock_hass, store_with_front_door
    ):
        """Without a seal the last room is allowed to go vacant."""
        # Door open -> no seal can form
        mock_hass.states.get.return_value = MagicMock(state=STATE_ON)

        guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
        guard._discover_exterior_doors()
        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
        assert guard.sealed is False

        assert guard.can_room_go_vacant("room_a") is True

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_multiple_rooms_occupied_one_vacates(
        self, _mock_timer, mock_hass, store_with_front_door
    ):
        """First room vacates fine, second (last) is blocked."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
        guard._discover_exterior_doors()
        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
        guard.on_room_state_changed("room_b", OccupancyState.OCCUPIED)

        # First room can go vacant
        assert guard.can_room_go_vacant("room_a") is True
        guard.on_room_state_changed("room_a", OccupancyState.VACANT)

        # Now room_b is the last room -> blocked
        assert guard.can_room_go_vacant("room_b") is False


# ---------------------------------------------------------------------------
# TestHouseGuardExpiry
# ---------------------------------------------------------------------------


class TestHouseGuardExpiry:
    """Tests around the safety-valve expiry timer."""

    def test_seal_expires_after_max_duration(self, mock_hass, store_with_front_door):
        """The safety valve timer callback breaks the seal."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        captured_callback = None

        def fake_call_later(_hass, _duration, cb):
            nonlocal captured_callback
            captured_callback = cb
            return MagicMock()

        with patch(
            "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
            side_effect=fake_call_later,
        ):
            guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
            guard._discover_exterior_doors()
            guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
            assert guard.sealed is True

            # Fire the expiry callback
            assert captured_callback is not None
            captured_callback(None)

            assert guard.sealed is False

    def test_expiry_timer_cancelled_on_seal_break(
        self, mock_hass, store_with_front_door
    ):
        """Breaking the seal cancels the expiry timer."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        cancel_fn = MagicMock()

        with patch(
            "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
            return_value=cancel_fn,
        ):
            guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
            guard._discover_exterior_doors()
            guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
            assert guard.sealed is True
            cancel_fn.reset_mock()

            # Break seal via door open
            event = _make_door_event("binary_sensor.front_door", STATE_ON)
            guard._handle_exterior_door_event(event)

            cancel_fn.assert_called_once()

    @pytest.mark.asyncio
    async def test_expiry_timer_cancelled_on_stop(
        self, mock_hass, store_with_front_door
    ):
        """async_stop cancels any active expiry timer."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)
        cancel_fn = MagicMock()

        with (
            patch(
                "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
                return_value=cancel_fn,
            ),
            patch(
                "custom_components.inhabit.engine.house_occupancy_guard.async_track_state_change_event",
                return_value=MagicMock(),
            ),
        ):
            guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
            await guard.async_start()
            guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
            assert guard.sealed is True
            cancel_fn.reset_mock()

            await guard.async_stop()

            # Timer cancel should have been called during stop
            cancel_fn.assert_called_once()
            assert guard.sealed is False


# ---------------------------------------------------------------------------
# TestHouseGuardDiscovery
# ---------------------------------------------------------------------------


class TestHouseGuardDiscovery:
    """Tests around _discover_exterior_doors."""

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_discovers_exterior_doors_from_edges(self, _mock_timer, mock_hass):
        """Exterior door edges with entity_id are discovered as bindings."""
        edge = Edge(
            id="e1",
            type="door",
            is_exterior=True,
            entity_id="binary_sensor.front_door",
        )
        store = _make_store(_make_floor_plan_with_edges([edge]))
        guard = HouseOccupancyGuard(mock_hass, store)
        guard._discover_exterior_doors()

        assert len(guard._exterior_door_bindings) == 1
        assert guard._exterior_door_bindings[0].entity_id == "binary_sensor.front_door"
        assert guard._exterior_door_bindings[0].sensor_type == "door"

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_ignores_non_door_exterior_edges(self, _mock_timer, mock_hass):
        """Window edges that are exterior should not be discovered."""
        edge = Edge(
            id="e1",
            type="window",
            is_exterior=True,
            entity_id="binary_sensor.window_1",
        )
        store = _make_store(_make_floor_plan_with_edges([edge]))
        guard = HouseOccupancyGuard(mock_hass, store)
        guard._discover_exterior_doors()

        assert len(guard._exterior_door_bindings) == 0

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_ignores_interior_doors(self, _mock_timer, mock_hass):
        """Interior door edges should not be discovered."""
        edge = Edge(
            id="e1",
            type="door",
            is_exterior=False,
            entity_id="binary_sensor.interior_door",
        )
        store = _make_store(_make_floor_plan_with_edges([edge]))
        guard = HouseOccupancyGuard(mock_hass, store)
        guard._discover_exterior_doors()

        assert len(guard._exterior_door_bindings) == 0

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_deduplicates_door_entity_ids(self, _mock_timer, mock_hass):
        """Same entity_id on multiple edges should only produce one binding."""
        edges = [
            Edge(
                id="e1",
                type="door",
                is_exterior=True,
                entity_id="binary_sensor.front_door",
            ),
            Edge(
                id="e2",
                type="door",
                is_exterior=True,
                entity_id="binary_sensor.front_door",
            ),
            Edge(
                id="e3",
                type="door",
                is_exterior=True,
                entity_id="binary_sensor.back_door",
            ),
        ]
        store = _make_store(_make_floor_plan_with_edges(edges))
        guard = HouseOccupancyGuard(mock_hass, store)
        guard._discover_exterior_doors()

        assert len(guard._exterior_door_bindings) == 2
        ids = {b.entity_id for b in guard._exterior_door_bindings}
        assert ids == {"binary_sensor.front_door", "binary_sensor.back_door"}


# ---------------------------------------------------------------------------
# TestHouseGuardEdgeCases
# ---------------------------------------------------------------------------


class TestHouseGuardEdgeCases:
    """Edge cases and lifecycle tests."""

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_room_going_vacant_then_occupied_quickly(
        self, _mock_timer, mock_hass, store_with_front_door
    ):
        """Rapid OCCUPIED -> VACANT -> OCCUPIED keeps seal consistent."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
        guard._discover_exterior_doors()

        # Occupied -> sealed
        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
        assert guard.sealed is True
        assert guard.anyone_home is True

        # Vacant -> house empty -> seal dropped
        guard.on_room_state_changed("room_a", OccupancyState.VACANT)
        assert guard.sealed is False
        assert guard.anyone_home is False

        # Occupied again -> sealed again
        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
        assert guard.sealed is True
        assert guard.anyone_home is True

    @patch(
        "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
        return_value=MagicMock(),
    )
    def test_house_empty_clears_seal(
        self, _mock_timer, mock_hass, store_with_front_door
    ):
        """All rooms going vacant drops the seal."""
        mock_hass.states.get.return_value = MagicMock(state=STATE_OFF)

        guard = HouseOccupancyGuard(mock_hass, store_with_front_door)
        guard._discover_exterior_doors()

        guard.on_room_state_changed("room_a", OccupancyState.OCCUPIED)
        guard.on_room_state_changed("room_b", OccupancyState.OCCUPIED)
        assert guard.sealed is True

        guard.on_room_state_changed("room_a", OccupancyState.VACANT)
        # Still one room occupied
        assert guard.sealed is True
        assert guard.anyone_home is True

        guard.on_room_state_changed("room_b", OccupancyState.VACANT)
        assert guard.sealed is False
        assert guard.anyone_home is False

    @pytest.mark.asyncio
    async def test_start_stop_idempotent(self, mock_hass, store_with_front_door):
        """Calling async_start or async_stop twice is safe."""
        with (
            patch(
                "custom_components.inhabit.engine.house_occupancy_guard.async_call_later",
                return_value=MagicMock(),
            ),
            patch(
                "custom_components.inhabit.engine.house_occupancy_guard.async_track_state_change_event",
                return_value=MagicMock(),
            ) as mock_track,
        ):
            guard = HouseOccupancyGuard(mock_hass, store_with_front_door)

            # Start twice — second call should be a no-op
            await guard.async_start()
            first_call_count = mock_track.call_count
            await guard.async_start()
            assert (
                mock_track.call_count == first_call_count
            )  # no additional subscriptions

            # Stop twice — should not raise
            await guard.async_stop()
            await guard.async_stop()

            assert guard.sealed is False
            assert guard.anyone_home is False
