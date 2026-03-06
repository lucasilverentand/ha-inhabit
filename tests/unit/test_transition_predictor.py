"""Unit tests for the TransitionPredictor and TransitionLearner."""

from __future__ import annotations

import sys
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

# Ensure mocks are set up before importing our modules
if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.engine.transition_predictor import (
    DoorLink,
    PhantomPresence,
    TransitionPredictor,
)
from custom_components.inhabit.engine.transition_learner import (
    TransitionLearner,
    TransitionRecord,
)
from custom_components.inhabit.models.floor_plan import Coordinates, Polygon


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------


def _make_room(room_id, connected=None, is_transit=None, phantom_hold=0):
    """Create a mock room."""
    room = MagicMock()
    room.id = room_id
    room.connected_rooms = connected or []
    room.is_transit = is_transit
    room.phantom_hold_seconds = phantom_hold
    room.polygon = None
    return room


def _make_zone(zone_id, room_id, vertices=None, long_stay=False, phantom_hold=0):
    """Create a mock zone."""
    zone = MagicMock()
    zone.id = zone_id
    zone.room_id = room_id
    zone.long_stay = long_stay
    zone.phantom_hold_seconds = phantom_hold
    zone.occupies_parent = False
    if vertices:
        zone.polygon = Polygon(vertices=[Coordinates(x, y) for x, y in vertices])
    else:
        zone.polygon = None
    return zone


def _make_store(rooms, zones=None, nodes=None, edges=None, sensor_configs=None):
    """Create a mock FloorPlanStore."""
    store = MagicMock()

    mock_floor = MagicMock()
    mock_floor.rooms = rooms
    mock_floor.zones = zones or []
    mock_floor.nodes = nodes or []
    mock_floor.edges = edges or []

    mock_fp = MagicMock()
    mock_fp.floors = [mock_floor]
    store.get_floor_plans.return_value = [mock_fp]

    configs = sensor_configs or {}
    store.get_sensor_config.side_effect = lambda rid: configs.get(rid)

    return store


def _make_node(node_id, x, y):
    """Create a mock node."""
    node = MagicMock()
    node.id = node_id
    node.x = x
    node.y = y
    return node


def _make_edge(edge_id, start_node, end_node, edge_type="wall", entity_id=None):
    """Create a mock edge."""
    edge = MagicMock()
    edge.id = edge_id
    edge.start_node = start_node
    edge.end_node = end_node
    edge.type = edge_type
    edge.entity_id = entity_id
    return edge


# ------------------------------------------------------------------
# PhantomPresence dataclass tests
# ------------------------------------------------------------------


class TestPhantomPresence:
    """Tests for the PhantomPresence dataclass."""

    def test_new_phantom_not_expired(self):
        """A freshly created phantom should not be expired."""
        phantom = PhantomPresence(
            source_id="room_a",
            target_id="room_b",
            probability=0.8,
            hold_seconds=300,
        )
        assert not phantom.is_expired
        assert phantom.remaining > 299
        assert phantom.current_probability > 0.79

    def test_expired_phantom(self):
        """A phantom with hold_seconds=0 should be expired immediately."""
        phantom = PhantomPresence(
            source_id="room_a",
            target_id="room_b",
            probability=0.8,
            hold_seconds=0,
            created_at=datetime.now() - timedelta(seconds=1),
        )
        assert phantom.is_expired
        assert phantom.current_probability == 0.0

    def test_probability_decays(self):
        """Probability should decay linearly over hold_seconds."""
        phantom = PhantomPresence(
            source_id="room_a",
            target_id="room_b",
            probability=1.0,
            hold_seconds=100,
            created_at=datetime.now() - timedelta(seconds=50),
        )
        # At 50% elapsed, probability should be ~0.5
        assert 0.4 <= phantom.current_probability <= 0.6


class TestDoorLink:
    """Tests for the DoorLink dataclass."""

    def test_other_side(self):
        """other_side returns the room on the opposite side."""
        link = DoorLink(
            door_edge_id="e1",
            entity_id="binary_sensor.door_1",
            room_a="hallway",
            room_b="bathroom",
        )
        assert link.other_side("hallway") == "bathroom"
        assert link.other_side("bathroom") == "hallway"
        assert link.other_side("kitchen") is None


# ------------------------------------------------------------------
# TransitionPredictor tests
# ------------------------------------------------------------------


class TestTransitionPredictorTopology:
    """Tests for topology building and transit detection."""

    @pytest.mark.asyncio
    async def test_builds_adjacency_from_connected_rooms(self):
        """Adjacency graph should match connected_rooms."""
        rooms = [
            _make_room("hallway", ["kitchen", "bathroom"]),
            _make_room("kitchen", ["hallway"]),
            _make_room("bathroom", ["hallway"]),
        ]
        store = _make_store(rooms)
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        assert "kitchen" in predictor._adjacency["hallway"]
        assert "bathroom" in predictor._adjacency["hallway"]
        assert "hallway" in predictor._adjacency["kitchen"]

    @pytest.mark.asyncio
    async def test_transit_detection_auto(self):
        """Room with 2+ connections and no presence sensors = transit."""
        rooms = [
            _make_room("hallway", ["kitchen", "bathroom"]),
            _make_room("kitchen", ["hallway"]),
            _make_room("bathroom", ["hallway"]),
        ]
        store = _make_store(rooms)
        store.get_sensor_config.return_value = None
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        assert predictor.is_transit_room("hallway") is True
        # Kitchen has only 1 connection — not transit
        assert predictor.is_transit_room("kitchen") is False

    @pytest.mark.asyncio
    async def test_transit_detection_manual_override(self):
        """Manual is_transit override should take precedence."""
        rooms = [
            _make_room("hallway", ["kitchen", "bathroom"], is_transit=False),
            _make_room("kitchen", ["hallway"]),
            _make_room("bathroom", ["hallway"]),
        ]
        store = _make_store(rooms)
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        # Manual override says not transit despite topology
        assert predictor.is_transit_room("hallway") is False

    @pytest.mark.asyncio
    async def test_transit_detection_with_presence_sensors(self):
        """Room with presence sensors should not be auto-detected as transit."""
        rooms = [
            _make_room("hallway", ["kitchen", "bathroom"]),
            _make_room("kitchen", ["hallway"]),
            _make_room("bathroom", ["hallway"]),
        ]
        config = MagicMock()
        config.presence_sensors = [MagicMock()]
        store = _make_store(rooms, sensor_configs={"hallway": config})
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        assert predictor.is_transit_room("hallway") is False


class TestTransitionPredictorPhantom:
    """Tests for phantom presence injection."""

    @pytest.mark.asyncio
    async def test_forward_prediction_creates_phantom(self):
        """When a room goes CHECKING, phantoms should be created in adjacent VACANT rooms."""
        rooms = [
            _make_room("hallway", ["bathroom"]),
            _make_room("bathroom", ["hallway"]),
        ]
        store = _make_store(rooms)
        set_occupied = MagicMock()
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store, set_room_occupied=set_occupied)
        await predictor.async_start()

        # Hallway goes OCCUPIED → CHECKING
        predictor.on_room_state_changed("hallway", OccupancyState.OCCUPIED, OccupancyState.CHECKING)

        assert predictor.has_active_phantom("bathroom")
        # Should have tried to push bathroom to OCCUPIED
        set_occupied.assert_called()

    @pytest.mark.asyncio
    async def test_phantom_not_created_on_occupied_neighbour(self):
        """Phantom should not be created on already-occupied rooms."""
        rooms = [
            _make_room("hallway", ["bathroom"]),
            _make_room("bathroom", ["hallway"]),
        ]
        store = _make_store(rooms)
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        # Bathroom is already occupied
        predictor._room_states["bathroom"] = OccupancyState.OCCUPIED

        predictor.on_room_state_changed("hallway", OccupancyState.OCCUPIED, OccupancyState.CHECKING)

        assert not predictor.has_active_phantom("bathroom")

    @pytest.mark.asyncio
    async def test_seal_suppresses_phantom(self):
        """Sealed room should not generate phantom predictions."""
        rooms = [
            _make_room("bathroom", ["hallway"]),
            _make_room("hallway", ["bathroom"]),
        ]
        store = _make_store(rooms)
        seal_check = MagicMock(return_value=True)  # bathroom is sealed
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store, get_seal_state=seal_check)
        await predictor.async_start()

        # Bathroom goes CHECKING but is sealed
        predictor.on_room_state_changed("bathroom", OccupancyState.OCCUPIED, OccupancyState.CHECKING)

        # No phantom should be created (person is still in bathroom)
        assert not predictor.has_active_phantom("hallway")

    @pytest.mark.asyncio
    async def test_real_presence_cancels_phantom(self):
        """Real occupancy detection should cancel phantom on that room."""
        rooms = [
            _make_room("hallway", ["bathroom"]),
            _make_room("bathroom", ["hallway"]),
        ]
        store = _make_store(rooms)
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        # Create phantom on bathroom
        predictor.on_room_state_changed("hallway", OccupancyState.OCCUPIED, OccupancyState.CHECKING)
        assert predictor.has_active_phantom("bathroom")

        # Real presence detected in bathroom
        predictor.on_room_state_changed("bathroom", OccupancyState.VACANT, OccupancyState.OCCUPIED)
        assert not predictor.has_active_phantom("bathroom")

    @pytest.mark.asyncio
    async def test_door_event_creates_phantom(self):
        """Door opening should create phantom on the other side."""
        rooms = [
            _make_room("hallway", ["bathroom"]),
            _make_room("bathroom", ["hallway"]),
        ]
        store = _make_store(rooms)
        set_occupied = MagicMock()
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store, set_room_occupied=set_occupied)
        await predictor.async_start()

        # Manually add a door link (normally built from geometry)
        predictor._door_links["binary_sensor.bathroom_door"] = DoorLink(
            door_edge_id="e1",
            entity_id="binary_sensor.bathroom_door",
            room_a="bathroom",
            room_b="hallway",
        )

        # Bathroom is occupied/sealed, hallway is vacant
        predictor._room_states["bathroom"] = OccupancyState.OCCUPIED
        predictor._room_states["hallway"] = OccupancyState.VACANT

        # Door opens
        predictor.on_door_event("binary_sensor.bathroom_door", is_open=True)

        assert predictor.has_active_phantom("hallway")
        set_occupied.assert_called()

    @pytest.mark.asyncio
    async def test_door_close_does_not_create_phantom(self):
        """Door closing should not create phantom."""
        rooms = [
            _make_room("hallway", ["bathroom"]),
            _make_room("bathroom", ["hallway"]),
        ]
        store = _make_store(rooms)
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        predictor._door_links["binary_sensor.door"] = DoorLink(
            door_edge_id="e1",
            entity_id="binary_sensor.door",
            room_a="bathroom",
            room_b="hallway",
        )
        predictor._room_states["bathroom"] = OccupancyState.OCCUPIED

        predictor.on_door_event("binary_sensor.door", is_open=False)

        assert not predictor.has_active_phantom("hallway")


class TestTransitionPredictorTopologyWeight:
    """Tests for topology-weighted prediction probabilities."""

    @pytest.mark.asyncio
    async def test_dead_end_high_weight(self):
        """Dead-end source (only 1 exit) should produce high weight."""
        rooms = [
            _make_room("bathroom", ["hallway"]),
            _make_room("hallway", ["bathroom", "kitchen"]),
            _make_room("kitchen", ["hallway"]),
        ]
        store = _make_store(rooms)
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        neighbours = predictor._get_all_neighbours("bathroom")
        weight = predictor._topology_weight("bathroom", "hallway", neighbours)
        assert weight >= 0.8  # Dead-end: very high weight

    @pytest.mark.asyncio
    async def test_multi_exit_split_weight(self):
        """Room with multiple exits should split weight among destinations."""
        rooms = [
            _make_room("hallway", ["kitchen", "bathroom", "bedroom"]),
            _make_room("kitchen", ["hallway", "dining"]),
            _make_room("bathroom", ["hallway", "laundry"]),
            _make_room("bedroom", ["hallway", "closet"]),
            _make_room("dining", ["kitchen"]),
            _make_room("laundry", ["bathroom"]),
            _make_room("closet", ["bedroom"]),
        ]
        store = _make_store(rooms)
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        neighbours = predictor._get_all_neighbours("hallway")
        # 3 neighbours, all with >1 exit → split weight
        weight = predictor._topology_weight("hallway", "kitchen", neighbours)
        assert weight < 0.5  # Multiple exits: split weight


class TestTransitionPredictorDoorGeometry:
    """Tests for door-room geometry resolution."""

    @pytest.mark.asyncio
    async def test_door_links_from_geometry(self):
        """Door edges should be linked to rooms via polygon containment."""
        # Create two rooms with polygons and a door between them
        room_a = _make_room("room_a", ["room_b"])
        room_a.polygon = Polygon(vertices=[
            Coordinates(0, 0), Coordinates(100, 0),
            Coordinates(100, 100), Coordinates(0, 100),
        ])
        room_b = _make_room("room_b", ["room_a"])
        room_b.polygon = Polygon(vertices=[
            Coordinates(100, 0), Coordinates(200, 0),
            Coordinates(200, 100), Coordinates(100, 100),
        ])

        # Door at x=100 (boundary between rooms)
        nodes = [
            _make_node("n1", 100, 30),
            _make_node("n2", 100, 70),
        ]
        edges = [
            _make_edge("door1", "n1", "n2", "door", "binary_sensor.door_1"),
        ]

        store = _make_store([room_a, room_b], nodes=nodes, edges=edges)
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        assert "binary_sensor.door_1" in predictor.door_links
        link = predictor.door_links["binary_sensor.door_1"]
        rooms_connected = {link.room_a, link.room_b}
        assert rooms_connected == {"room_a", "room_b"}


class TestTransitionPredictorZoneAdjacency:
    """Tests for zone-to-zone adjacency via polygon proximity."""

    @pytest.mark.asyncio
    async def test_close_zones_are_adjacent(self):
        """Zones with vertices within threshold should be adjacent."""
        zone_a = _make_zone("zone_a", "room_1", vertices=[(0, 0), (50, 0), (50, 50), (0, 50)])
        zone_b = _make_zone("zone_b", "room_1", vertices=[(50, 0), (100, 0), (100, 50), (50, 50)])

        rooms = [_make_room("room_1")]
        store = _make_store(rooms, zones=[zone_a, zone_b])
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        assert "zone_b" in predictor.get_zone_neighbours("zone_a")
        assert "zone_a" in predictor.get_zone_neighbours("zone_b")

    @pytest.mark.asyncio
    async def test_far_zones_not_adjacent(self):
        """Zones far apart should not be adjacent."""
        zone_a = _make_zone("zone_a", "room_1", vertices=[(0, 0), (50, 0), (50, 50), (0, 50)])
        zone_b = _make_zone("zone_b", "room_1", vertices=[(200, 200), (250, 200), (250, 250), (200, 250)])

        rooms = [_make_room("room_1")]
        store = _make_store(rooms, zones=[zone_a, zone_b])
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        assert "zone_b" not in predictor.get_zone_neighbours("zone_a")

    @pytest.mark.asyncio
    async def test_different_room_zones_not_adjacent(self):
        """Zones in different rooms should not be adjacent (even if close)."""
        zone_a = _make_zone("zone_a", "room_1", vertices=[(0, 0), (50, 0), (50, 50), (0, 50)])
        zone_b = _make_zone("zone_b", "room_2", vertices=[(50, 0), (100, 0), (100, 50), (50, 50)])

        rooms = [_make_room("room_1"), _make_room("room_2")]
        store = _make_store(rooms, zones=[zone_a, zone_b])
        hass = MagicMock()

        predictor = TransitionPredictor(hass, store)
        await predictor.async_start()

        assert "zone_b" not in predictor.get_zone_neighbours("zone_a")


# ------------------------------------------------------------------
# TransitionLearner tests
# ------------------------------------------------------------------


class TestTransitionLearner:
    """Tests for the TransitionLearner."""

    def test_record_transition(self):
        """Recording a transition should increment counts."""
        learner = TransitionLearner()
        learner.record_transition("hallway", "kitchen")
        assert learner._total_counts[("hallway", "kitchen")] == 1

    def test_same_room_transition_ignored(self):
        """Transitions from a room to itself should be ignored."""
        learner = TransitionLearner()
        learner.record_transition("hallway", "hallway")
        assert ("hallway", "hallway") not in learner._total_counts

    def test_weight_below_threshold(self):
        """Weight should be 0 with insufficient transitions."""
        learner = TransitionLearner()
        for _ in range(10):
            learner.record_transition("hallway", "kitchen")

        weight = learner.get_transition_weight("hallway", "kitchen")
        assert weight == 0.0  # Below MIN_TRANSITIONS (50)

    def test_weight_above_threshold(self):
        """Weight should be > 0 with sufficient transitions."""
        learner = TransitionLearner()
        for _ in range(60):
            learner.record_transition("hallway", "kitchen")

        weight = learner.get_transition_weight("hallway", "kitchen")
        assert weight > 0.0

    def test_weight_reflects_frequency(self):
        """More frequent transitions should have higher weight."""
        learner = TransitionLearner()
        for _ in range(100):
            learner.record_transition("hallway", "kitchen")
        for _ in range(50):
            learner.record_transition("hallway", "bathroom")

        w_kitchen = learner.get_transition_weight("hallway", "kitchen")
        w_bathroom = learner.get_transition_weight("hallway", "bathroom")
        assert w_kitchen > w_bathroom

    def test_likely_destinations(self):
        """get_likely_destinations should return sorted by weight."""
        learner = TransitionLearner()
        for _ in range(100):
            learner.record_transition("hallway", "kitchen")
        for _ in range(50):
            learner.record_transition("hallway", "bathroom")

        destinations = learner.get_likely_destinations("hallway")
        assert len(destinations) == 2
        assert destinations[0][0] == "kitchen"  # More frequent = first

    def test_on_room_occupied_infers_transition(self):
        """on_room_occupied should infer a transition from last occupied room."""
        learner = TransitionLearner()
        now = datetime.now()

        learner.on_room_occupied("hallway", now)
        learner.on_room_occupied("kitchen", now + timedelta(seconds=5))

        assert learner._total_counts[("hallway", "kitchen")] == 1

    def test_on_room_occupied_ignores_old_transition(self):
        """Transitions > 5 minutes apart should not be recorded."""
        learner = TransitionLearner()
        now = datetime.now()

        learner.on_room_occupied("hallway", now)
        learner.on_room_occupied("kitchen", now + timedelta(minutes=10))

        assert ("hallway", "kitchen") not in learner._total_counts

    def test_persistence_roundtrip(self):
        """save_data / load_data should preserve learner state."""
        learner = TransitionLearner()
        for _ in range(5):
            learner.record_transition("hallway", "kitchen")

        data = learner.save_data()

        learner2 = TransitionLearner()
        learner2.load_data(data)

        assert learner2._total_counts[("hallway", "kitchen")] == 5

    def test_prune_removes_old_records(self):
        """prune_history should remove records older than HISTORY_DAYS."""
        learner = TransitionLearner()
        old = datetime.now() - timedelta(days=30)
        recent = datetime.now()

        learner.record_transition("hallway", "kitchen", old)
        learner.record_transition("hallway", "bathroom", recent)

        removed = learner.prune_history()
        assert removed == 1
        assert learner._total_counts[("hallway", "kitchen")] == 0
        assert learner._total_counts[("hallway", "bathroom")] == 1

    def test_hourly_buckets(self):
        """Transitions should be bucketed by hour."""
        learner = TransitionLearner()
        morning = datetime(2024, 1, 1, 7, 0, 0)

        learner.record_transition("bedroom", "hallway", morning)

        assert learner._hourly_counts[("bedroom", "hallway")][7] == 1
        assert learner._hourly_counts[("bedroom", "hallway")][8] == 0
