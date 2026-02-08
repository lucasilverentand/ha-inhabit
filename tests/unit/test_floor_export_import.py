"""Unit tests for floor export/import functionality."""

from __future__ import annotations

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Mock homeassistant modules before importing our code
# (matches pattern from test_standalone.py for environments without HA installed)
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

from custom_components.inhabit.models.automation_rule import (
    RuleAction,
    RuleCondition,
    VisualRule,
)
from custom_components.inhabit.models.device_placement import DevicePlacement
from custom_components.inhabit.models.floor_plan import (
    Coordinates,
    Door,
    Edge,
    Floor,
    FloorPlan,
    Node,
    Polygon,
    Room,
    Wall,
    Window,
)
from custom_components.inhabit.models.virtual_sensor import (
    SensorBinding,
    VirtualSensorConfig,
)
from custom_components.inhabit.store.floor_plan_store import FloorPlanStore


def create_mock_store():
    """Create a mock Store class with proper async methods."""
    mock_store = MagicMock()
    mock_store.async_load = AsyncMock(return_value=None)
    mock_store.async_save = AsyncMock()
    mock_store.async_delay_save = MagicMock()
    return mock_store


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = MagicMock()
    hass.data = {}
    hass.config = MagicMock()
    hass.config.path = lambda *args: "/".join(args)
    return hass


@pytest.fixture
def store(mock_hass):
    """Create a FloorPlanStore with mocked storage."""
    with patch(
        "custom_components.inhabit.store.floor_plan_store.Store",
        return_value=create_mock_store(),
    ):
        s = FloorPlanStore(mock_hass)
        s._loaded = True
        return s


def _make_floor_plan(store: FloorPlanStore) -> FloorPlan:
    """Create a basic floor plan with one floor containing structure.

    Uses node-graph format: 2 wall edges with a door split on the first
    and a window split on the second.
    Node layout:
      n1(0,0) --[wall]-- n3(210,0) --[door,w=80]-- n4(290,0) --[wall]-- n2(500,0)
      n2(500,0) --[wall]-- n5(500,100) --[window,w=120]-- n6(500,220) --[wall]-- n7(500,400)
    """
    fp = FloorPlan(name="Test Home")
    store.create_floor_plan(fp)
    floor = Floor(
        name="Ground Floor",
        level=0,
        nodes=[
            Node(id="n1", x=0, y=0),
            Node(id="n2", x=500, y=0),
            Node(id="n3", x=210, y=0),       # door start
            Node(id="n4", x=290, y=0),       # door end
            Node(id="n5", x=500, y=100),     # window start
            Node(id="n6", x=500, y=220),     # window end
            Node(id="n7", x=500, y=400),
        ],
        edges=[
            # First wall (n1->n2) split by door at center
            Edge(id="e1", start_node="n1", end_node="n3", type="wall",
                 thickness=10, is_exterior=True),
            Edge(id="e2", start_node="n3", end_node="n4", type="door",
                 thickness=10, is_exterior=True, swing_direction="left"),
            Edge(id="e3", start_node="n4", end_node="n2", type="wall",
                 thickness=10, is_exterior=True),
            # Second wall (n2->n7) split by window
            Edge(id="e4", start_node="n2", end_node="n5", type="wall", thickness=10),
            Edge(id="e5", start_node="n5", end_node="n6", type="window",
                 thickness=10, height=140),
            Edge(id="e6", start_node="n6", end_node="n7", type="wall", thickness=10),
        ],
        rooms=[
            Room(
                id="r1",
                name="Living Room",
                polygon=Polygon(
                    vertices=[
                        Coordinates(0, 0),
                        Coordinates(250, 0),
                        Coordinates(250, 400),
                        Coordinates(0, 400),
                    ]
                ),
                color="#aabbcc",
                ha_area_id="living_room",
            ),
            Room(
                id="r2",
                name="Kitchen",
                polygon=Polygon(
                    vertices=[
                        Coordinates(250, 0),
                        Coordinates(500, 0),
                        Coordinates(500, 400),
                        Coordinates(250, 400),
                    ]
                ),
            ),
        ],
    )
    store.add_floor(fp.id, floor)
    return store.get_floor_plan(fp.id)


class TestExportFloor:
    """Test floor export functionality."""

    def test_export_empty_floor(self, store):
        """Test exporting an empty floor."""
        fp = FloorPlan(name="Empty Home")
        store.create_floor_plan(fp)
        floor = Floor(name="Empty Floor", level=0)
        store.add_floor(fp.id, floor)

        fp = store.get_floor_plan(fp.id)
        result = store.export_floor(fp.id, fp.floors[0].id)

        assert result is not None
        assert result["inhabit_version"] == "1.0"
        assert result["export_type"] == "floor"
        assert "exported_at" in result
        assert result["floor"]["name"] == "Empty Floor"
        assert result["floor"]["level"] == 0
        assert result["floor"]["background_image"] is None
        assert result["floor"]["walls"] == []
        assert result["floor"]["rooms"] == []
        assert result["floor"]["doors"] == []
        assert result["floor"]["windows"] == []
        assert result["device_placements"] == []
        assert result["sensor_configs"] == []
        assert result["visual_rules"] == []

    def test_export_floor_with_structure(self, store):
        """Test exporting a floor with walls, rooms, doors, windows."""
        fp = _make_floor_plan(store)
        floor = fp.floors[0]

        result = store.export_floor(fp.id, floor.id)
        assert result is not None

        # Walls should have no IDs
        assert len(result["floor"]["walls"]) == 2
        wall0 = result["floor"]["walls"][0]
        assert "id" not in wall0
        assert wall0["start"] == {"x": 0, "y": 0}
        assert wall0["end"] == {"x": 500, "y": 0}
        assert wall0["is_exterior"] is True

        # Rooms should have no IDs, no connected_rooms, no floor_id
        assert len(result["floor"]["rooms"]) == 2
        room0 = result["floor"]["rooms"][0]
        assert "id" not in room0
        assert "floor_id" not in room0
        assert "connected_rooms" not in room0
        assert room0["name"] == "Living Room"
        assert room0["color"] == "#aabbcc"
        assert room0["ha_area_id"] == "living_room"

        # Doors should reference walls by index
        assert len(result["floor"]["doors"]) == 1
        door0 = result["floor"]["doors"][0]
        assert "id" not in door0
        assert "wall_id" not in door0
        assert door0["wall_ref"] == 0  # References first wall
        assert door0["position"] == 0.5

        # Windows should reference walls by index
        assert len(result["floor"]["windows"]) == 1
        win0 = result["floor"]["windows"][0]
        assert "id" not in win0
        assert "wall_id" not in win0
        assert win0["wall_ref"] == 1  # References second wall
        assert win0["width"] == 120

    def test_export_floor_with_devices(self, store):
        """Test exporting a floor with device placements."""
        fp = _make_floor_plan(store)
        floor = fp.floors[0]

        store.place_device(
            fp.id,
            DevicePlacement(
                entity_id="light.living",
                floor_id=floor.id,
                room_id="r1",
                position=Coordinates(100, 200),
            ),
        )
        store.place_device(
            fp.id,
            DevicePlacement(
                entity_id="sensor.temp",
                floor_id=floor.id,
                room_id="r2",
                position=Coordinates(300, 200),
                contributes_to_occupancy=True,
            ),
        )
        # Device on a different floor (should not appear)
        store.place_device(
            fp.id,
            DevicePlacement(
                entity_id="light.upstairs",
                floor_id="other_floor",
                position=Coordinates(50, 50),
            ),
        )

        result = store.export_floor(fp.id, floor.id)
        assert len(result["device_placements"]) == 2
        dp0 = result["device_placements"][0]
        assert dp0["entity_id"] == "light.living"
        assert dp0["room_ref"] == 0  # r1 is index 0
        dp1 = result["device_placements"][1]
        assert dp1["entity_id"] == "sensor.temp"
        assert dp1["room_ref"] == 1  # r2 is index 1
        assert dp1["contributes_to_occupancy"] is True

    def test_export_floor_with_sensor_configs(self, store):
        """Test exporting a floor with sensor configs."""
        fp = _make_floor_plan(store)
        floor = fp.floors[0]

        store.create_sensor_config(
            VirtualSensorConfig(
                room_id="r1",
                floor_plan_id=fp.id,
                enabled=True,
                motion_timeout=90,
                motion_sensors=[
                    SensorBinding(entity_id="binary_sensor.motion_1", sensor_type="motion")
                ],
            )
        )

        result = store.export_floor(fp.id, floor.id)
        assert len(result["sensor_configs"]) == 1
        sc0 = result["sensor_configs"][0]
        assert sc0["room_ref"] == 0
        assert sc0["enabled"] is True
        assert sc0["motion_timeout"] == 90
        assert len(sc0["motion_sensors"]) == 1

    def test_export_floor_with_visual_rules(self, store):
        """Test exporting a floor with visual rules."""
        fp = _make_floor_plan(store)
        floor = fp.floors[0]

        store.create_visual_rule(
            VisualRule(
                name="Lights On",
                floor_plan_id=fp.id,
                trigger_type="room_occupancy",
                trigger_room_id="r1",
                source_room_id="r1",
                target_entity_ids=["light.living"],
                color="#ff0000",
            )
        )

        result = store.export_floor(fp.id, floor.id)
        assert len(result["visual_rules"]) == 1
        vr0 = result["visual_rules"][0]
        assert vr0["name"] == "Lights On"
        assert vr0["source_room_ref"] == 0
        assert vr0["trigger_room_ref"] == 0
        assert vr0["target_entity_ids"] == ["light.living"]

    def test_export_nonexistent_floor(self, store):
        """Test exporting a non-existent floor returns None."""
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)
        assert store.export_floor(fp.id, "nonexistent") is None

    def test_export_nonexistent_floor_plan(self, store):
        """Test exporting from a non-existent floor plan returns None."""
        assert store.export_floor("nonexistent", "floor1") is None

    def test_export_background_image_nulled(self, store):
        """Test that background_image is always null in export."""
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)
        floor = Floor(name="F1", background_image="/local/image.png")
        store.add_floor(fp.id, floor)
        fp = store.get_floor_plan(fp.id)

        result = store.export_floor(fp.id, fp.floors[0].id)
        assert result["floor"]["background_image"] is None


class TestImportFloor:
    """Test floor import functionality."""

    def _minimal_envelope(self, **overrides) -> dict:
        """Create a minimal valid export envelope."""
        data = {
            "inhabit_version": "1.0",
            "export_type": "floor",
            "exported_at": "2026-01-01T00:00:00",
            "floor": {
                "name": "Imported Floor",
                "level": 1,
                "background_image": None,
                "background_scale": 1.0,
                "background_offset": {"x": 0, "y": 0},
                "walls": [],
                "rooms": [],
                "doors": [],
                "windows": [],
            },
            "device_placements": [],
            "sensor_configs": [],
            "visual_rules": [],
        }
        data.update(overrides)
        return data

    def test_import_minimal_floor(self, store):
        """Test importing a minimal floor."""
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)

        data = self._minimal_envelope()
        floor = store.import_floor(fp.id, data)

        assert floor is not None
        assert floor.name == "Imported Floor"
        assert floor.level == 1
        assert floor.id  # Should have a fresh ID
        assert len(floor.nodes) == 0
        assert len(floor.edges) == 0
        assert len(floor.rooms) == 0

        # Verify floor was added to floor plan
        fp = store.get_floor_plan(fp.id)
        assert len(fp.floors) == 1
        assert fp.floors[0].id == floor.id

    def test_import_floor_with_structure(self, store):
        """Test importing a floor with walls, rooms, doors, windows.

        The import system creates floors using old-format wall/door/window
        references which get migrated to nodes+edges on deserialization.
        """
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)

        data = self._minimal_envelope()
        data["floor"]["walls"] = [
            {"start": {"x": 0, "y": 0}, "end": {"x": 300, "y": 0}, "thickness": 12, "is_exterior": True},
            {"start": {"x": 300, "y": 0}, "end": {"x": 300, "y": 200}, "thickness": 10},
        ]
        data["floor"]["rooms"] = [
            {
                "name": "Room A",
                "polygon": {"vertices": [{"x": 0, "y": 0}, {"x": 300, "y": 0}, {"x": 300, "y": 200}, {"x": 0, "y": 200}]},
                "color": "#112233",
                "ha_area_id": "room_a",
            },
        ]
        data["floor"]["doors"] = [
            {"wall_ref": 0, "position": 0.4, "width": 90},
        ]
        data["floor"]["windows"] = [
            {"wall_ref": 1, "position": 0.6, "width": 110, "height": 130},
        ]

        floor = store.import_floor(fp.id, data)

        assert len(floor.rooms) == 1
        assert floor.rooms[0].name == "Room A"
        assert floor.rooms[0].color == "#112233"
        assert floor.rooms[0].ha_area_id == "room_a"
        assert floor.rooms[0].floor_id == floor.id
        assert floor.rooms[0].connected_rooms == []

        # After migration, structure is nodes+edges
        assert len(floor.nodes) > 0
        assert len(floor.edges) > 0

        # Should have door and window type edges
        door_edges = [e for e in floor.edges if e.type == "door"]
        window_edges = [e for e in floor.edges if e.type == "window"]
        assert len(door_edges) == 1
        assert len(window_edges) == 1

        # Room IDs should be fresh
        assert floor.rooms[0].id != "r1"

    def test_import_floor_with_devices(self, store):
        """Test importing a floor with device placements."""
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)

        data = self._minimal_envelope()
        data["floor"]["rooms"] = [
            {"name": "Room", "polygon": {"vertices": [{"x": 0, "y": 0}, {"x": 100, "y": 0}, {"x": 100, "y": 100}, {"x": 0, "y": 100}]}},
        ]
        data["device_placements"] = [
            {"entity_id": "light.test", "room_ref": 0, "position": {"x": 50, "y": 50}, "rotation": 45.0},
        ]

        floor = store.import_floor(fp.id, data)
        collection = store.get_device_placements(fp.id)
        devices = collection.get_devices_on_floor(floor.id)
        assert len(devices) == 1
        assert devices[0].entity_id == "light.test"
        assert devices[0].room_id == floor.rooms[0].id
        assert devices[0].rotation == 45.0

    def test_import_floor_with_sensor_configs(self, store):
        """Test importing a floor with sensor configs."""
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)

        data = self._minimal_envelope()
        data["floor"]["rooms"] = [
            {"name": "Room", "polygon": {"vertices": [{"x": 0, "y": 0}, {"x": 100, "y": 0}, {"x": 100, "y": 100}, {"x": 0, "y": 100}]}},
        ]
        data["sensor_configs"] = [
            {
                "room_ref": 0,
                "enabled": True,
                "motion_timeout": 60,
                "checking_timeout": 15,
                "presence_timeout": 200,
                "motion_sensors": [{"entity_id": "binary_sensor.motion_1", "sensor_type": "motion"}],
                "presence_sensors": [],
                "door_sensors": [],
            },
        ]

        floor = store.import_floor(fp.id, data)
        config = store.get_sensor_config(floor.rooms[0].id)
        assert config is not None
        assert config.motion_timeout == 60
        assert config.checking_timeout == 15
        assert len(config.motion_sensors) == 1

    def test_import_floor_with_visual_rules(self, store):
        """Test importing a floor with visual rules."""
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)

        data = self._minimal_envelope()
        data["floor"]["rooms"] = [
            {"name": "Room", "polygon": {"vertices": [{"x": 0, "y": 0}, {"x": 100, "y": 0}, {"x": 100, "y": 100}, {"x": 0, "y": 100}]}},
        ]
        data["visual_rules"] = [
            {
                "name": "Test Rule",
                "trigger_type": "room_occupancy",
                "trigger_room_ref": 0,
                "source_room_ref": 0,
                "target_entity_ids": ["light.test"],
                "color": "#ff0000",
            },
        ]

        floor = store.import_floor(fp.id, data)
        rules = store.get_visual_rules(fp.id)
        assert len(rules) == 1
        assert rules[0].name == "Test Rule"
        assert rules[0].trigger_room_id == floor.rooms[0].id
        assert rules[0].source_room_id == floor.rooms[0].id

    def test_import_invalid_version(self, store):
        """Test importing with invalid version raises ValueError."""
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)

        data = self._minimal_envelope(inhabit_version="2.0")
        with pytest.raises(ValueError, match="Unsupported inhabit_version"):
            store.import_floor(fp.id, data)

    def test_import_invalid_export_type(self, store):
        """Test importing with wrong export_type raises ValueError."""
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)

        data = self._minimal_envelope(export_type="room")
        with pytest.raises(ValueError, match="Invalid export_type"):
            store.import_floor(fp.id, data)

    def test_import_missing_floor_data(self, store):
        """Test importing with missing floor data raises ValueError."""
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)

        data = {"inhabit_version": "1.0", "export_type": "floor"}
        with pytest.raises(ValueError, match="Missing floor data"):
            store.import_floor(fp.id, data)

    def test_import_out_of_bounds_wall_ref(self, store):
        """Test importing with out-of-bounds wall_ref raises ValueError."""
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)

        data = self._minimal_envelope()
        data["floor"]["walls"] = [
            {"start": {"x": 0, "y": 0}, "end": {"x": 100, "y": 0}},
        ]
        data["floor"]["doors"] = [
            {"wall_ref": 5, "position": 0.5},  # Out of bounds
        ]

        with pytest.raises(ValueError, match="Invalid wall_ref"):
            store.import_floor(fp.id, data)

    def test_import_out_of_bounds_room_ref(self, store):
        """Test importing with out-of-bounds room_ref raises ValueError."""
        fp = FloorPlan(name="Test")
        store.create_floor_plan(fp)

        data = self._minimal_envelope()
        data["device_placements"] = [
            {"entity_id": "light.test", "room_ref": 99, "position": {"x": 0, "y": 0}},
        ]

        with pytest.raises(ValueError, match="Invalid room_ref"):
            store.import_floor(fp.id, data)

    def test_import_nonexistent_floor_plan(self, store):
        """Test importing into non-existent floor plan returns None."""
        data = self._minimal_envelope()
        assert store.import_floor("nonexistent", data) is None


class TestExportImportRoundTrip:
    """Test export -> import -> export round-trip."""

    def test_round_trip(self, store):
        """Export a floor, import it, export again - structures should match."""
        fp = _make_floor_plan(store)
        floor = fp.floors[0]

        # Add devices
        store.place_device(
            fp.id,
            DevicePlacement(
                entity_id="light.living",
                floor_id=floor.id,
                room_id="r1",
                position=Coordinates(100, 200),
                show_label=True,
            ),
        )

        # Add sensor config
        store.create_sensor_config(
            VirtualSensorConfig(
                room_id="r1",
                floor_plan_id=fp.id,
                motion_timeout=90,
                motion_sensors=[
                    SensorBinding(entity_id="binary_sensor.m1", sensor_type="motion")
                ],
            )
        )

        # Add visual rule
        store.create_visual_rule(
            VisualRule(
                name="Auto Light",
                floor_plan_id=fp.id,
                trigger_type="room_occupancy",
                trigger_room_id="r1",
                source_room_id="r1",
                target_entity_ids=["light.living"],
            )
        )

        # Export
        export1 = store.export_floor(fp.id, floor.id)
        assert export1 is not None

        # Import into a new floor plan
        fp2 = FloorPlan(name="Test 2")
        store.create_floor_plan(fp2)
        imported_floor = store.import_floor(fp2.id, export1)
        assert imported_floor is not None

        # Export again
        export2 = store.export_floor(fp2.id, imported_floor.id)
        assert export2 is not None

        # Compare structures (ignoring timestamps and IDs which differ)
        assert export1["floor"]["name"] == export2["floor"]["name"]
        assert export1["floor"]["level"] == export2["floor"]["level"]
        assert len(export1["floor"]["walls"]) == len(export2["floor"]["walls"])
        assert len(export1["floor"]["rooms"]) == len(export2["floor"]["rooms"])
        assert len(export1["floor"]["doors"]) == len(export2["floor"]["doors"])
        assert len(export1["floor"]["windows"]) == len(export2["floor"]["windows"])

        # Compare wall details
        for w1, w2 in zip(export1["floor"]["walls"], export2["floor"]["walls"]):
            assert w1["start"] == w2["start"]
            assert w1["end"] == w2["end"]
            assert w1["thickness"] == w2["thickness"]

        # Compare room details
        for r1, r2 in zip(export1["floor"]["rooms"], export2["floor"]["rooms"]):
            assert r1["name"] == r2["name"]
            assert r1["polygon"] == r2["polygon"]
            assert r1["color"] == r2["color"]

        # Compare doors
        for d1, d2 in zip(export1["floor"]["doors"], export2["floor"]["doors"]):
            assert d1["wall_ref"] == d2["wall_ref"]
            assert d1["position"] == d2["position"]

        # Compare windows
        for win1, win2 in zip(export1["floor"]["windows"], export2["floor"]["windows"]):
            assert win1["wall_ref"] == win2["wall_ref"]
            assert win1["position"] == win2["position"]

        # Compare device placements
        assert len(export1["device_placements"]) == len(export2["device_placements"])
        for dp1, dp2 in zip(export1["device_placements"], export2["device_placements"]):
            assert dp1["entity_id"] == dp2["entity_id"]
            assert dp1["room_ref"] == dp2["room_ref"]
            assert dp1["position"] == dp2["position"]

        # Compare sensor configs
        assert len(export1["sensor_configs"]) == len(export2["sensor_configs"])
        for sc1, sc2 in zip(export1["sensor_configs"], export2["sensor_configs"]):
            assert sc1["room_ref"] == sc2["room_ref"]
            assert sc1["motion_timeout"] == sc2["motion_timeout"]

        # Compare visual rules
        assert len(export1["visual_rules"]) == len(export2["visual_rules"])
        for vr1, vr2 in zip(export1["visual_rules"], export2["visual_rules"]):
            assert vr1["name"] == vr2["name"]
            assert vr1["source_room_ref"] == vr2["source_room_ref"]
