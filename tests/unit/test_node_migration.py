"""Unit tests for Floor.from_dict() migration from old wall format to node-graph."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock

# Mock homeassistant modules before importing our code
if "homeassistant" not in sys.modules or isinstance(sys.modules["homeassistant"], MagicMock):
    sys.modules.setdefault("homeassistant", MagicMock())
    sys.modules.setdefault("homeassistant.core", MagicMock())
    sys.modules.setdefault("homeassistant.const", MagicMock())
    sys.modules.setdefault("homeassistant.config_entries", MagicMock())
    sys.modules.setdefault("homeassistant.helpers", MagicMock())
    sys.modules.setdefault("homeassistant.helpers.storage", MagicMock())
    sys.modules.setdefault("homeassistant.helpers.event", MagicMock())
    sys.modules.setdefault("homeassistant.helpers.dispatcher", MagicMock())
    sys.modules.setdefault("homeassistant.helpers.entity", MagicMock())
    sys.modules.setdefault("homeassistant.helpers.entity_platform", MagicMock())
    sys.modules.setdefault("homeassistant.helpers.typing", MagicMock())
    sys.modules.setdefault("homeassistant.components", MagicMock())
    sys.modules.setdefault("homeassistant.components.websocket_api", MagicMock())
    sys.modules.setdefault("homeassistant.components.http", MagicMock())
    sys.modules.setdefault("homeassistant.components.binary_sensor", MagicMock())
    sys.modules.setdefault("homeassistant.components.frontend", MagicMock())
    sys.modules.setdefault("homeassistant.components.panel_custom", MagicMock())
    sys.modules.setdefault("voluptuous", MagicMock())
    sys.modules.setdefault("aiohttp", MagicMock())

from custom_components.inhabit.models.floor_plan import Edge, Floor, Node


class TestOldFormatMigration:
    """Test migration from old wall/door/window format to node-graph."""

    def test_isolated_walls(self):
        """Two isolated walls with no shared endpoints produce 4 nodes and 2 edges."""
        data = {
            "id": "f1",
            "name": "Test Floor",
            "walls": [
                {"id": "w1", "start": {"x": 0, "y": 0}, "end": {"x": 100, "y": 0}},
                {"id": "w2", "start": {"x": 200, "y": 200}, "end": {"x": 300, "y": 200}},
            ],
        }
        floor = Floor.from_dict(data)

        assert len(floor.nodes) == 4
        assert len(floor.edges) == 2
        # All edges should be type "wall"
        assert all(e.type == "wall" for e in floor.edges)

    def test_l_shape_shared_endpoint(self):
        """Two walls sharing one endpoint produce 3 nodes (deduped) and 2 edges."""
        data = {
            "id": "f1",
            "name": "L-Shape",
            "walls": [
                {"id": "w1", "start": {"x": 0, "y": 0}, "end": {"x": 100, "y": 0}},
                {"id": "w2", "start": {"x": 100, "y": 0}, "end": {"x": 100, "y": 100}},
            ],
        }
        floor = Floor.from_dict(data)

        assert len(floor.nodes) == 3
        assert len(floor.edges) == 2

        # The shared node should be referenced by both edges
        node_ids = {n.id for n in floor.nodes}
        for edge in floor.edges:
            assert edge.start_node in node_ids
            assert edge.end_node in node_ids

        # Find the shared node at (100, 0)
        shared = [n for n in floor.nodes if round(n.x) == 100 and round(n.y) == 0]
        assert len(shared) == 1

    def test_t_junction(self):
        """Three walls sharing one endpoint produce 4 nodes and 3 edges."""
        data = {
            "id": "f1",
            "name": "T-Junction",
            "walls": [
                {"id": "w1", "start": {"x": 0, "y": 0}, "end": {"x": 100, "y": 0}},
                {"id": "w2", "start": {"x": 100, "y": 0}, "end": {"x": 200, "y": 0}},
                {"id": "w3", "start": {"x": 100, "y": 0}, "end": {"x": 100, "y": 100}},
            ],
        }
        floor = Floor.from_dict(data)

        assert len(floor.nodes) == 4
        assert len(floor.edges) == 3

    def test_rectangle(self):
        """Four walls forming a closed loop produce 4 nodes and 4 edges."""
        data = {
            "id": "f1",
            "name": "Rectangle",
            "walls": [
                {"id": "w1", "start": {"x": 0, "y": 0}, "end": {"x": 100, "y": 0}},
                {"id": "w2", "start": {"x": 100, "y": 0}, "end": {"x": 100, "y": 80}},
                {"id": "w3", "start": {"x": 100, "y": 80}, "end": {"x": 0, "y": 80}},
                {"id": "w4", "start": {"x": 0, "y": 80}, "end": {"x": 0, "y": 0}},
            ],
        }
        floor = Floor.from_dict(data)

        assert len(floor.nodes) == 4
        assert len(floor.edges) == 4

    def test_wall_with_door(self):
        """A wall with a door produces 3 edges (wall, door, wall) and extra nodes."""
        data = {
            "id": "f1",
            "name": "Door Test",
            "walls": [
                {"id": "w1", "start": {"x": 0, "y": 0}, "end": {"x": 500, "y": 0}, "thickness": 10},
            ],
            "doors": [
                {"id": "d1", "wall_id": "w1", "position": 0.5, "width": 80, "swing_direction": "left"},
            ],
        }
        floor = Floor.from_dict(data)

        # Should have: 2 original nodes + 2 door boundary nodes = 4 nodes
        assert len(floor.nodes) == 4

        # Should have: wall_before + door + wall_after = 3 edges
        assert len(floor.edges) == 3

        door_edges = [e for e in floor.edges if e.type == "door"]
        wall_edges = [e for e in floor.edges if e.type == "wall"]
        assert len(door_edges) == 1
        assert len(wall_edges) == 2
        assert door_edges[0].swing_direction == "left"

    def test_wall_with_window(self):
        """A wall with a window produces 3 edges (wall, window, wall) and extra nodes."""
        data = {
            "id": "f1",
            "name": "Window Test",
            "walls": [
                {"id": "w1", "start": {"x": 0, "y": 0}, "end": {"x": 400, "y": 0}, "thickness": 12},
            ],
            "windows": [
                {"id": "win1", "wall_id": "w1", "position": 0.5, "width": 100, "height": 120},
            ],
        }
        floor = Floor.from_dict(data)

        assert len(floor.nodes) == 4
        assert len(floor.edges) == 3

        window_edges = [e for e in floor.edges if e.type == "window"]
        assert len(window_edges) == 1
        assert window_edges[0].height == 120

    def test_wall_with_door_preserves_wall_properties(self):
        """Door split preserves parent wall's thickness and is_exterior."""
        data = {
            "id": "f1",
            "name": "Props Test",
            "walls": [
                {"id": "w1", "start": {"x": 0, "y": 0}, "end": {"x": 500, "y": 0},
                 "thickness": 15, "is_exterior": True},
            ],
            "doors": [
                {"id": "d1", "wall_id": "w1", "position": 0.5, "width": 80},
            ],
        }
        floor = Floor.from_dict(data)

        for edge in floor.edges:
            assert edge.thickness == 15
            assert edge.is_exterior is True

    def test_wall_properties_preserved(self):
        """Wall properties like length_locked and direction are preserved in edges."""
        data = {
            "id": "f1",
            "name": "Test",
            "walls": [
                {"id": "w1", "start": {"x": 0, "y": 0}, "end": {"x": 100, "y": 0},
                 "length_locked": True, "direction": "horizontal", "angle_locked": True},
            ],
        }
        floor = Floor.from_dict(data)

        assert len(floor.edges) == 1
        edge = floor.edges[0]
        assert edge.length_locked is True
        assert edge.direction == "horizontal"
        assert edge.angle_locked is True

    def test_empty_floor_no_walls(self):
        """Floor with no walls produces empty nodes and edges."""
        data = {"id": "f1", "name": "Empty", "walls": []}
        floor = Floor.from_dict(data)

        assert len(floor.nodes) == 0
        assert len(floor.edges) == 0

    def test_no_walls_key_no_nodes_key(self):
        """Floor with neither walls nor nodes key produces empty lists."""
        data = {"id": "f1", "name": "Bare"}
        floor = Floor.from_dict(data)

        assert len(floor.nodes) == 0
        assert len(floor.edges) == 0


class TestNewFormatPassthrough:
    """Test that new-format data passes through without migration."""

    def test_new_format_passthrough(self):
        """Data with 'nodes' key is deserialized directly without migration."""
        n1 = {"id": "n1", "x": 0.0, "y": 0.0}
        n2 = {"id": "n2", "x": 100.0, "y": 0.0}
        e1 = {
            "id": "e1",
            "start_node": "n1",
            "end_node": "n2",
            "type": "wall",
            "thickness": 10.0,
        }
        data = {
            "id": "f1",
            "name": "New Format",
            "nodes": [n1, n2],
            "edges": [e1],
        }
        floor = Floor.from_dict(data)

        assert len(floor.nodes) == 2
        assert len(floor.edges) == 1
        assert floor.nodes[0].id == "n1"
        assert floor.nodes[1].id == "n2"
        assert floor.edges[0].id == "e1"
        assert floor.edges[0].start_node == "n1"
        assert floor.edges[0].end_node == "n2"

    def test_new_format_with_door_edge(self):
        """Door edge in new format has correct attributes."""
        data = {
            "id": "f1",
            "name": "Door Edge",
            "nodes": [
                {"id": "n1", "x": 0, "y": 0},
                {"id": "n2", "x": 50, "y": 0},
            ],
            "edges": [
                {
                    "id": "e1",
                    "start_node": "n1",
                    "end_node": "n2",
                    "type": "door",
                    "swing_direction": "right",
                    "entity_id": "binary_sensor.door",
                },
            ],
        }
        floor = Floor.from_dict(data)

        assert floor.edges[0].type == "door"
        assert floor.edges[0].swing_direction == "right"
        assert floor.edges[0].entity_id == "binary_sensor.door"

    def test_new_format_with_window_edge(self):
        """Window edge in new format has correct attributes."""
        data = {
            "id": "f1",
            "name": "Window Edge",
            "nodes": [
                {"id": "n1", "x": 0, "y": 0},
                {"id": "n2", "x": 80, "y": 0},
            ],
            "edges": [
                {
                    "id": "e1",
                    "start_node": "n1",
                    "end_node": "n2",
                    "type": "window",
                    "height": 140.0,
                },
            ],
        }
        floor = Floor.from_dict(data)

        assert floor.edges[0].type == "window"
        assert floor.edges[0].height == 140.0


class TestFloorRoundTrip:
    """Test that Floor.to_dict() -> Floor.from_dict() round-trips correctly."""

    def test_round_trip(self):
        """Serialized floor can be deserialized back identically."""
        floor = Floor(
            id="f1",
            name="Test",
            nodes=[
                Node(id="n1", x=0, y=0),
                Node(id="n2", x=100, y=0),
                Node(id="n3", x=100, y=80),
            ],
            edges=[
                Edge(id="e1", start_node="n1", end_node="n2", type="wall", thickness=12),
                Edge(id="e2", start_node="n2", end_node="n3", type="door",
                     swing_direction="left", entity_id="sensor.door"),
            ],
        )
        data = floor.to_dict()
        restored = Floor.from_dict(data)

        assert len(restored.nodes) == 3
        assert len(restored.edges) == 2
        assert restored.nodes[0].id == "n1"
        assert restored.edges[0].start_node == "n1"
        assert restored.edges[1].type == "door"
        assert restored.edges[1].swing_direction == "left"
