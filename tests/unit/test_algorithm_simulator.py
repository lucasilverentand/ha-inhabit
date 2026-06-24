"""Tests for the real-code occupancy algorithm simulator."""

from __future__ import annotations

from custom_components.inhabit.const import DEFAULT_TRANSIT_PHANTOM_HOLD, OccupancyState
from tests.fake_house.algorithm_simulator import AlgorithmScenarioSimulator
from tests.fake_house.local_home_layout import local_home_layout_summary
from tests.fake_house.local_home_scenarios import (
    hallway_left_open_to_short_stay_then_close,
    hallway_multi_mmwave_clears_after_last_target,
    short_stay_exit_back_to_hallway,
)


def test_open_toilet_door_hallway_walk_in_then_close_with_mmwave_reseals():
    """A hallway-to-toilet walk with the door left open uses the real algorithm."""
    with AlgorithmScenarioSimulator(
        room_ids=["ground_hallway", "ground_toilet"],
        unsealed_activity_timeout=120,
    ) as sim:
        sim.add_person("person1", "Luca")

        sim.enter_room("person1", "ground_hallway", spatial_targets=1)
        sim.assert_room("ground_hallway", OccupancyState.OCCUPIED, sealed=True)

        sim.open_door("ground_hallway", "ground_toilet")
        sim.enter_room("person1", "ground_toilet", spatial_targets=1)
        sim.clear_room("ground_hallway")

        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("ground_hallway", OccupancyState.CHECKING, sealed=False)

        sim.wait(90)
        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)

        sim.close_door("ground_hallway", "ground_toilet")
        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)
        assert (
            sim.machines["ground_toilet"]._post_close_hold_until is not None
        ), sim.timeline

        sim.clear_pir("ground_toilet")
        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)

        sim.set_spatial_targets("ground_toilet", 1, source="post_close_mmwave")
        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=True)


def test_toilet_mmwave_dropout_after_open_door_close_uses_post_close_hold():
    """A mmWave dropout right after door close does not immediately clear occupancy."""
    with AlgorithmScenarioSimulator(
        room_ids=["ground_hallway", "ground_toilet"],
        unsealed_activity_timeout=120,
    ) as sim:
        sim.add_person("person1", "Luca")

        sim.open_door("ground_hallway", "ground_toilet")
        sim.enter_room("person1", "ground_toilet", spatial_targets=1)
        sim.wait(90)

        sim.close_door("ground_hallway", "ground_toilet")
        sim.clear_pir("ground_toilet")
        sim.set_mmwave("ground_toilet", False, spatial_targets=0)

        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(14)
        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(1)
        sim.assert_room("ground_toilet", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("ground_toilet", OccupancyState.VACANT, sealed=False)


def test_anonymized_transit_phantom_expires_and_rechecks_clear_sensors():
    """A phantom transit hold clears without using real home names or entities."""
    with AlgorithmScenarioSimulator.anonymized_transit_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("transit_core", "zone_alpha")
        sim.enter_room(
            "subject",
            "zone_alpha",
            pir=False,
            mmwave=True,
            spatial_targets=1,
        )
        sim.clear_room("zone_alpha")

        sim.assert_room("zone_alpha", OccupancyState.CHECKING, sealed=False)
        sim.assert_room("transit_core", OccupancyState.OCCUPIED, sealed=False)
        assert sim.transition_predictor is not None
        assert sim.transition_predictor.has_active_phantom("transit_core")

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD - 1)
        sim.assert_room("transit_core", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(1)
        sim.assert_room("transit_core", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("transit_core", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_walks_from_open_area_to_short_stay():
    """The local home fixture mirrors hallway-to-short-stay door behavior."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.enter_room("subject", "open_east", spatial_targets=1)
        sim.open_door("open_east", "transit_hall")
        sim.enter_room("subject", "transit_hall", spatial_targets=1)
        sim.clear_room("open_east")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.clear_room("transit_hall")

        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("transit_hall", OccupancyState.CHECKING, sealed=False)

        sim.wait(90)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.close_door("transit_hall", "short_stay")
        sim.clear_pir("short_stay")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.set_spatial_targets("short_stay", 1, source="post_close_mmwave")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        sim.assert_room("open_east", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_quick_exit_after_settled_occupancy_checks_empty():
    """A quick door open/close after settled occupancy runs the delayed exit check."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.close_door("transit_hall", "short_stay")
        sim.set_spatial_targets("short_stay", 1, source="post_close_mmwave")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.wait(180)
        sim.open_door("transit_hall", "short_stay")
        sim.close_door("transit_hall", "short_stay")
        sim.clear_room("short_stay")

        sim.wait(14)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(1)
        sim.assert_room("short_stay", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_closed_door_override_waits_for_door_open():
    """A closed-door override is not cleared by the safety timer."""
    with AlgorithmScenarioSimulator.anonymized_local_home(
        policy_overrides_by_room={"short_stay": {"override_safety_timeout": 5}}
    ) as sim:
        sim.override_room("short_stay")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.wait(10)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.open_door("transit_hall", "short_stay")
        sim.assert_room("short_stay", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_open_door_override_safety_timer_clears():
    """An open-door override is bounded by the override safety timer."""
    with AlgorithmScenarioSimulator.anonymized_local_home(
        policy_overrides_by_room={"short_stay": {"override_safety_timeout": 5}}
    ) as sim:
        sim.open_door("transit_hall", "short_stay")
        sim.override_room("short_stay")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(5)
        sim.assert_room("short_stay", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_transit_phantom_expires():
    """Moving through the mirrored transit hall creates and clears phantoms."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("open_west", "transit_hall")
        sim.enter_room(
            "subject",
            "transit_hall",
            pir=False,
            mmwave=True,
            spatial_targets=1,
        )
        sim.open_door("transit_hall", "open_east")
        sim.enter_room("subject", "open_east", spatial_targets=1)
        sim.clear_room("transit_hall")

        sim.assert_room("transit_hall", OccupancyState.CHECKING, sealed=False)

        assert sim.transition_predictor is not None
        assert sim.transition_predictor.has_active_phantom("transit_hall")

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD - 1)
        sim.assert_room("transit_hall", OccupancyState.CHECKING, sealed=False)

        sim.wait(20)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_layout_has_segmented_hallways_and_mmwave_sources():
    """The local fixture mirrors the hallway topology needed for regressions."""
    layout = local_home_layout_summary()
    rooms = {room["id"]: room for room in layout["rooms"]}

    assert "transit_hall" in rooms
    assert "short_stay" in rooms["transit_hall"]["connected_rooms"]
    assert "side_room_alpha" in rooms["transit_hall"]["connected_rooms"]
    assert "open_east" in rooms["transit_hall"]["door_sensor_connected_rooms"]
    assert "open_west" in rooms["transit_hall"]["door_sensor_connected_rooms"]
    assert "short_stay" not in rooms["transit_hall"]["door_sensor_connected_rooms"]
    assert rooms["transit_hall"]["mmwave_sources"] == [
        "hall_mmwave_east",
        "hall_mmwave_west",
    ]


def test_local_home_scenario_hallway_left_open_to_short_stay_then_close():
    """A door-left-open walk into short stay settles the hallway."""
    result = hallway_left_open_to_short_stay_then_close()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.OCCUPIED
    assert result["final_states"]["short_stay"]["sealed"] is True
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_hallway_multi_mmwave_clears_after_last_target():
    """A multi-mmWave hallway only clears when the last target source clears."""
    result = hallway_multi_mmwave_clears_after_last_target()

    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_short_stay_exit_back_to_hallway():
    """A settled short-stay exit does not leave hallway occupancy stuck."""
    result = short_stay_exit_back_to_hallway()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.VACANT
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT
