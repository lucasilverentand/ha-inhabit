"""Tests for the real-code occupancy algorithm simulator."""

from __future__ import annotations

from custom_components.inhabit.const import DEFAULT_TRANSIT_PHANTOM_HOLD, OccupancyState
from tests.fake_house.algorithm_simulator import AlgorithmScenarioSimulator


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

        sim.enter_room("subject", "level0_open_area", spatial_targets=1)
        sim.open_door("level0_open_area", "level0_transit")
        sim.enter_room("subject", "level0_transit", spatial_targets=1)
        sim.clear_room("level0_open_area")

        sim.open_door("level0_transit", "level0_short_stay")
        sim.enter_room("subject", "level0_short_stay", spatial_targets=1)
        sim.clear_room("level0_transit")

        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("level0_transit", OccupancyState.CHECKING, sealed=False)

        sim.wait(90)
        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.close_door("level0_transit", "level0_short_stay")
        sim.clear_pir("level0_short_stay")
        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.set_spatial_targets("level0_short_stay", 1, source="post_close_mmwave")
        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=True)
        sim.assert_room("level0_transit", OccupancyState.VACANT, sealed=False)
        sim.assert_room("level0_open_area", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_quick_exit_after_settled_occupancy_checks_empty():
    """A quick door open/close after settled occupancy runs the delayed exit check."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("level0_transit", "level0_short_stay")
        sim.enter_room("subject", "level0_short_stay", spatial_targets=1)
        sim.close_door("level0_transit", "level0_short_stay")
        sim.set_spatial_targets("level0_short_stay", 1, source="post_close_mmwave")
        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.wait(180)
        sim.open_door("level0_transit", "level0_short_stay")
        sim.close_door("level0_transit", "level0_short_stay")
        sim.clear_room("level0_short_stay")

        sim.wait(14)
        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(1)
        sim.assert_room("level0_short_stay", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("level0_short_stay", OccupancyState.VACANT, sealed=False)

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("level0_transit", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_closed_door_override_waits_for_door_open():
    """A closed-door override is not cleared by the safety timer."""
    with AlgorithmScenarioSimulator.anonymized_local_home(
        policy_overrides_by_room={"level0_short_stay": {"override_safety_timeout": 5}}
    ) as sim:
        sim.override_room("level0_short_stay")
        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.wait(10)
        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.open_door("level0_transit", "level0_short_stay")
        sim.assert_room("level0_short_stay", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("level0_short_stay", OccupancyState.VACANT, sealed=False)

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("level0_transit", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_open_door_override_safety_timer_clears():
    """An open-door override is bounded by the override safety timer."""
    with AlgorithmScenarioSimulator.anonymized_local_home(
        policy_overrides_by_room={"level0_short_stay": {"override_safety_timeout": 5}}
    ) as sim:
        sim.open_door("level0_transit", "level0_short_stay")
        sim.override_room("level0_short_stay")
        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(5)
        sim.assert_room("level0_short_stay", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("level0_short_stay", OccupancyState.VACANT, sealed=False)

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("level0_transit", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_vertical_transit_phantom_expires():
    """Moving through the vertical link creates and clears transit phantoms."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("level0_transit", "vertical_link")
        sim.enter_room(
            "subject",
            "vertical_link",
            pir=False,
            mmwave=True,
            spatial_targets=1,
        )
        sim.clear_room("vertical_link")

        sim.assert_room("vertical_link", OccupancyState.CHECKING, sealed=False)
        sim.assert_room("level0_transit", OccupancyState.OCCUPIED, sealed=False)

        assert sim.transition_predictor is not None
        assert sim.transition_predictor.has_active_phantom("level0_transit")

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD)
        sim.assert_room("level0_transit", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("level0_transit", OccupancyState.VACANT, sealed=False)
