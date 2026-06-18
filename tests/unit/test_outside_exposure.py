"""Unit tests for outside exposure detection."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock

if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from homeassistant.const import STATE_OFF, STATE_ON, STATE_UNKNOWN

from custom_components.inhabit.engine.outside_exposure import (
    find_rooms_exposed_to_outside,
)
from custom_components.inhabit.models.floor_plan import (
    Coordinates,
    Edge,
    Floor,
    FloorPlan,
    Node,
    Polygon,
    Room,
)


def _room(room_id: str, name: str, min_x: float, max_x: float) -> Room:
    """Build a rectangular test room."""
    return Room(
        id=room_id,
        name=name,
        polygon=Polygon(
            vertices=[
                Coordinates(min_x, 0),
                Coordinates(max_x, 0),
                Coordinates(max_x, 100),
                Coordinates(min_x, 100),
            ]
        ),
    )


def _state_lookup(open_entities: set[str]):
    """Build a HA state lookup for opening entities."""

    def get_state(entity_id: str):
        state = STATE_ON if entity_id in open_entities else STATE_OFF
        return MagicMock(state=state)

    return get_state


def _floor_plan() -> FloorPlan:
    """Build two rooms connected by an interior door plus exterior openings."""
    floor = Floor(
        id="floor_1",
        name="Ground",
        rooms=[
            _room("living", "Living", 0, 100),
            _room("hall", "Hall", 100, 200),
        ],
        nodes=[
            Node(id="front_a", x=0, y=40),
            Node(id="front_b", x=0, y=60),
            Node(id="between_a", x=100, y=40),
            Node(id="between_b", x=100, y=60),
            Node(id="window_a", x=200, y=40),
            Node(id="window_b", x=200, y=60),
        ],
        edges=[
            Edge(
                id="front_door",
                start_node="front_a",
                end_node="front_b",
                type="door",
                is_exterior=True,
                entity_id="binary_sensor.front_door",
            ),
            Edge(
                id="living_hall",
                start_node="between_a",
                end_node="between_b",
                type="door",
                is_exterior=False,
                entity_id="binary_sensor.living_hall_door",
            ),
            Edge(
                id="hall_window",
                start_node="window_a",
                end_node="window_b",
                type="window",
                is_exterior=True,
                entity_id="binary_sensor.hall_window",
            ),
        ],
    )
    return FloorPlan(id="fp_1", name="Home", floors=[floor])


class TestFindRoomsExposedToOutside:
    """Tests for room exposure topology."""

    def test_closed_exterior_openings_expose_no_rooms(self):
        """Closed exterior openings produce off states for all rooms."""
        states = find_rooms_exposed_to_outside([_floor_plan()], _state_lookup(set()))

        assert states["living"].exposed is False
        assert states["hall"].exposed is False

    def test_open_exterior_door_exposes_adjacent_room(self):
        """An open exterior door directly exposes the adjacent room."""
        states = find_rooms_exposed_to_outside(
            [_floor_plan()],
            _state_lookup({"binary_sensor.front_door"}),
        )

        assert states["living"].exposed is True
        assert states["living"].direct_exposure is True
        assert states["living"].exterior_openings == ("binary_sensor.front_door",)
        assert states["living"].interior_openings == ()
        assert states["hall"].exposed is False

    def test_open_interior_door_propagates_exposure(self):
        """Exposure propagates through open interior doors."""
        states = find_rooms_exposed_to_outside(
            [_floor_plan()],
            _state_lookup(
                {
                    "binary_sensor.front_door",
                    "binary_sensor.living_hall_door",
                }
            ),
        )

        assert states["living"].exposed is True
        assert states["hall"].exposed is True
        assert states["hall"].direct_exposure is False
        assert states["hall"].exterior_openings == ("binary_sensor.front_door",)
        assert states["hall"].interior_openings == ("binary_sensor.living_hall_door",)

    def test_open_exterior_window_exposes_adjacent_room(self):
        """Exterior windows count as outside exposure sources."""
        states = find_rooms_exposed_to_outside(
            [_floor_plan()],
            _state_lookup({"binary_sensor.hall_window"}),
        )

        assert states["living"].exposed is False
        assert states["hall"].exposed is True
        assert states["hall"].direct_exposure is True
        assert states["hall"].exterior_openings == ("binary_sensor.hall_window",)

    def test_unknown_opening_state_is_not_treated_as_open(self):
        """Unknown opening states do not expose rooms."""

        def get_state(_entity_id: str):
            return MagicMock(state=STATE_UNKNOWN)

        states = find_rooms_exposed_to_outside([_floor_plan()], get_state)

        assert states["living"].exposed is False
        assert states["hall"].exposed is False
