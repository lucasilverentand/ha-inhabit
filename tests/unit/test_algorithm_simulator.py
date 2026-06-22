"""Tests for the real-code occupancy algorithm simulator."""

from __future__ import annotations

from custom_components.inhabit.const import OccupancyState
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

        sim.wait(119)
        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(1)
        sim.assert_room("ground_toilet", OccupancyState.CHECKING, sealed=False)
