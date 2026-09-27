"""Tests for the installed logic simulator."""

from __future__ import annotations

from custom_components.inhabit.const import OccupancyState
from custom_components.inhabit.engine.logic_simulator import (
    LOGIC_SIMULATOR_PRESETS,
    logic_simulator_presets_payload,
    run_logic_simulation,
)


def test_logic_simulator_presets_include_open_door_close_case():
    """The product simulator exposes the door-left-open regression scenario."""
    payload = logic_simulator_presets_payload()

    assert "door_left_open_shower_then_close" in payload["presets"]


def test_logic_simulator_topology_exposes_natural_room_aliases():
    """The standalone UI can parse natural room terms without exposing real names."""
    payload = logic_simulator_presets_payload()
    rooms = {room["id"]: room for room in payload["topology"]["rooms"]}

    assert "hallway" in rooms["transit_hall"]["aliases"]
    assert "toilet" in rooms["short_stay"]["aliases"]
    assert "kitchen" in rooms["open_east"]["aliases"]


def test_door_left_open_then_closed_checks_for_motion_before_clearing():
    """Closing after a long open-door stay keeps occupancy on for post-close checks."""
    result = run_logic_simulation(
        LOGIC_SIMULATOR_PRESETS["door_left_open_shower_then_close"]["actions"]
    )

    assert result["ok"] is True
    assert result["errors"] == []
    expectations = {
        (item["room_id"], item["at_seconds"]): item for item in result["expectations"]
    }
    assert (
        expectations[("short_stay", 240.0)]["actual_state"] == OccupancyState.OCCUPIED
    )
    assert (
        expectations[("short_stay", 254.0)]["actual_state"] == OccupancyState.OCCUPIED
    )
    assert result["final"]["short_stay"]["state"] == OccupancyState.OCCUPIED
    assert result["final"]["short_stay"]["sealed"] is True


def test_logic_simulator_reports_failed_expectations_without_throwing():
    """Scenario expectations are returned as simulator output for the UI."""
    result = run_logic_simulation(
        [
            {"type": "expect_room", "room_id": "short_stay", "state": "occupied"},
        ]
    )

    assert result["ok"] is False
    assert result["errors"] == []
    assert result["expectations"][0]["passed"] is False
    assert result["expectations"][0]["actual_state"] == OccupancyState.VACANT


def test_logic_simulator_accepts_timeline_note_actions():
    """Timeline notes let the standalone UI describe non-logic events."""
    result = run_logic_simulation(
        [
            {"type": "note", "label": "light on in Short Stay"},
        ]
    )

    assert result["ok"] is True
    assert result["errors"] == []
    assert result["timeline"][-1]["label"] == "light on in Short Stay"


def test_logic_simulator_tracks_observed_light_state():
    """Light events are visible in the simulator timeline without affecting occupancy."""
    result = run_logic_simulation(
        [
            {"type": "set_light", "room_id": "short_stay", "active": True},
            {"type": "set_light", "room_id": "short_stay", "active": False},
        ]
    )

    assert result["ok"] is True
    assert result["timeline"][0]["lights"]["short_stay"] == "off"
    assert result["timeline"][1]["lights"]["short_stay"] == "on"
    assert result["timeline"][2]["lights"]["short_stay"] == "off"
    assert result["final_lights"]["short_stay"] == "off"
    assert result["final"]["short_stay"]["state"] == OccupancyState.VACANT


def test_logic_simulator_reports_light_expectations():
    """Light expectations let UI scenarios assert observed light state."""
    result = run_logic_simulation(
        [
            {"type": "set_light", "room_id": "short_stay", "active": True},
            {"type": "expect_light", "room_id": "short_stay", "state": "on"},
            {"type": "expect_light", "room_id": "short_stay", "state": "off"},
        ]
    )

    assert result["ok"] is False
    assert result["errors"] == []
    assert result["expectations"][0]["kind"] == "light"
    assert result["expectations"][0]["passed"] is True
    assert result["expectations"][0]["actual_state"] == "on"
    assert result["expectations"][1]["passed"] is False
    assert result["expectations"][1]["expected_state"] == "off"
    assert result["expectations"][1]["actual_state"] == "on"


def test_logic_simulator_maps_actions_to_generated_timeline_ranges():
    """Multi-sensor actions expose the timeline entries they generated."""
    result = run_logic_simulation(
        [
            {"type": "enter_room", "room_id": "short_stay", "person_id": "person"},
        ]
    )

    assert result["ok"] is True
    assert result["errors"] == []
    assert result["action_timeline"] == [
        {"index": 0, "start_timeline_index": 1, "end_timeline_index": 2}
    ]
    assert result["timeline"][1]["label"] == "spatial short_stay=1"
    assert result["timeline"][2]["label"] == "person enters short_stay"
