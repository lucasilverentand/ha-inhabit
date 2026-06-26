"""Run anonymized local-home occupancy scenarios from the command line."""

from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

if "homeassistant" not in sys.modules:
    from tests.conftest import *  # noqa: F401, F403

from custom_components.inhabit.const import DEFAULT_TRANSIT_PHANTOM_HOLD, OccupancyState
from tests.fake_house.algorithm_simulator import AlgorithmScenarioSimulator
from tests.fake_house.local_home_layout import (
    LOCAL_HOME_PHANTOM_HOLD_SECONDS_BY_ROOM,
    local_home_layout_summary,
)

LOCAL_TRANSIT_PHANTOM_HOLD = LOCAL_HOME_PHANTOM_HOLD_SECONDS_BY_ROOM.get(
    "transit_hall",
    DEFAULT_TRANSIT_PHANTOM_HOLD,
)


@dataclass(frozen=True)
class LocalScenario:
    """A named local-home scenario."""

    id: str
    description: str
    run: Callable[[], dict[str, Any]]


def _final_states(sim: AlgorithmScenarioSimulator) -> dict[str, dict[str, Any]]:
    return {
        room_id: {
            "state": machine.state.state,
            "sealed": machine.state.sealed,
            "confidence": machine.state.confidence,
            "contributing_sensors": list(machine.state.contributing_sensors),
        }
        for room_id, machine in sim.machines.items()
    }


def _timeline(sim: AlgorithmScenarioSimulator) -> list[dict[str, Any]]:
    return [
        {
            "at_seconds": entry.at_seconds,
            "label": entry.label,
            "rooms": entry.rooms,
        }
        for entry in sim.timeline
    ]


def _result(sim: AlgorithmScenarioSimulator, scenario_id: str) -> dict[str, Any]:
    return {
        "scenario": scenario_id,
        "elapsed_seconds": sim.elapsed_seconds,
        "final_states": _final_states(sim),
        "transitions": sim.transitions,
        "timeline": _timeline(sim),
    }


def _local_connection_pairs() -> list[tuple[str, str]]:
    pairs: set[tuple[str, str]] = set()
    for spec in local_home_layout_summary()["rooms"]:
        room_id = spec["id"]
        for connected_id in spec["connected_rooms"]:
            pairs.add(tuple(sorted((room_id, connected_id))))
    return sorted(pairs)


def _local_directed_routes() -> list[tuple[str, str]]:
    routes: set[tuple[str, str]] = set()
    for source_id, target_id in _local_connection_pairs():
        routes.add((source_id, target_id))
        routes.add((target_id, source_id))
    return sorted(routes)


def hallway_to_short_stay() -> dict[str, Any]:
    """Walk from an open area into transit, then into a short-stay room."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.enter_room("subject", "open_east", spatial_targets=1)
        sim.open_door("open_east", "transit_hall")
        sim.enter_room("subject", "transit_hall", spatial_targets=1)
        sim.clear_room("open_east")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.clear_room("transit_hall")
        sim.wait(90)

        sim.close_door("transit_hall", "short_stay")
        sim.clear_pir("short_stay")
        sim.set_spatial_targets("short_stay", 1, source="post_close_mmwave")

        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)
        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        sim.assert_room("open_east", OccupancyState.VACANT, sealed=False)
        return _result(sim, "hallway_to_short_stay")


def hallway_left_open_to_short_stay_then_close() -> dict[str, Any]:
    """Walk through the hallway into a short-stay room, leaving the door open."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.enter_room("subject", "entry_nook", spatial_targets=1)
        sim.open_door("entry_nook", "transit_hall")
        sim.enter_room("subject", "transit_hall", spatial_targets=1)
        sim.clear_room("entry_nook")

        sim.set_spatial_targets("transit_hall", 1, source="hall_mmwave_east")
        sim.set_spatial_targets("transit_hall", 1, source="hall_mmwave_west")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.set_spatial_targets("transit_hall", 0, source="hall_mmwave_east")
        sim.set_spatial_targets("transit_hall", 0, source="hall_mmwave_west")
        sim.clear_room("transit_hall")

        sim.wait(90)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.close_door("transit_hall", "short_stay")
        sim.clear_pir("short_stay")
        sim.set_spatial_targets("short_stay", 1, source="short_stay_spatial")

        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)
        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        sim.assert_room("entry_nook", OccupancyState.VACANT, sealed=False)
        return _result(sim, "hallway_left_open_to_short_stay_then_close")


def hallway_multi_mmwave_clears_after_last_target() -> dict[str, Any]:
    """Multiple hallway mmWave sources keep occupancy until all targets clear."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.enter_room("subject", "transit_hall", spatial_targets=1)
        sim.set_spatial_targets("transit_hall", 1, source="hall_mmwave_east")
        sim.set_spatial_targets("transit_hall", 1, source="hall_mmwave_west")
        sim.set_spatial_targets("transit_hall", 0, source="scenario")
        sim.clear_pir("transit_hall")
        sim.set_mmwave("transit_hall", False, spatial_targets=None)

        sim.wait(120)
        sim.assert_room("transit_hall", OccupancyState.OCCUPIED)

        sim.set_spatial_targets("transit_hall", 0, source="hall_mmwave_east")
        sim.wait(120)
        sim.assert_room("transit_hall", OccupancyState.OCCUPIED)

        sim.set_spatial_targets("transit_hall", 0, source="hall_mmwave_west")
        sim.wait(15)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "hallway_multi_mmwave_clears_after_last_target")


def short_stay_exit_back_to_hallway() -> dict[str, Any]:
    """Leave a short-stay room into the hallway and verify both rooms settle."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.close_door("transit_hall", "short_stay")
        sim.set_spatial_targets("short_stay", 1, source="short_stay_spatial")
        sim.wait(180)

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "transit_hall", spatial_targets=1)
        sim.set_spatial_targets("transit_hall", 1, source="hall_mmwave_east")
        sim.clear_room("short_stay")
        sim.close_door("transit_hall", "short_stay")

        sim.wait(15)
        sim.assert_room("short_stay", OccupancyState.CHECKING, sealed=False)
        sim.assert_room("transit_hall", OccupancyState.OCCUPIED)

        sim.wait(30)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)

        sim.set_spatial_targets("transit_hall", 0, source="hall_mmwave_east")
        sim.clear_room("transit_hall")
        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "short_stay_exit_back_to_hallway")


def quick_exit_after_settled_occupancy() -> dict[str, Any]:
    """Open and close a door after settled occupancy, then clear mmWave."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.close_door("transit_hall", "short_stay")
        sim.set_spatial_targets("short_stay", 1, source="post_close_mmwave")
        sim.wait(180)

        sim.open_door("transit_hall", "short_stay")
        sim.close_door("transit_hall", "short_stay")
        sim.clear_room("short_stay")
        sim.wait(15)

        sim.assert_room("short_stay", OccupancyState.CHECKING, sealed=False)
        sim.wait(30)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)
        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "quick_exit_after_settled_occupancy")


def door_bounce_person_remains_after_settled_occupancy() -> dict[str, Any]:
    """A quick door bounce must not clear a room when mmWave still sees someone."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.close_door("transit_hall", "short_stay")
        sim.set_spatial_targets("short_stay", 1, source="post_close_mmwave")
        sim.wait(180)

        sim.open_door("transit_hall", "short_stay")
        sim.close_door("transit_hall", "short_stay")
        sim.clear_pir("short_stay")
        sim.set_spatial_targets("short_stay", 1, source="person_still_inside")

        sim.wait(15)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)
        sim.wait(120)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "door_bounce_person_remains_after_settled_occupancy")


def repeated_door_bounces_do_not_wake_hallway() -> dict[str, Any]:
    """Repeated door bounces must not accumulate stale hallway occupancy."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.close_door("transit_hall", "short_stay")
        sim.set_spatial_targets("short_stay", 1, source="post_close_mmwave")
        sim.wait(180)

        for index in range(3):
            sim.open_door("transit_hall", "short_stay")
            sim.close_door("transit_hall", "short_stay")
            sim.clear_pir("short_stay")
            sim.set_spatial_targets(
                "short_stay",
                1,
                source=f"person_still_inside_{index}",
            )

            sim.wait(
                LOCAL_TRANSIT_PHANTOM_HOLD + sim.configs["short_stay"].checking_timeout
            )
            sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)
            sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)

        return _result(sim, "repeated_door_bounces_do_not_wake_hallway")


def door_left_open_mmwave_keeps_short_stay_occupied() -> dict[str, Any]:
    """An open door and cleared PIR must not turn off a room with mmWave presence."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.clear_pir("short_stay")
        sim.set_spatial_targets("short_stay", 1, source="open_door_mmwave")

        sim.wait(180)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)

        sim.close_door("transit_hall", "short_stay")
        sim.set_spatial_targets("short_stay", 1, source="post_close_mmwave")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)
        return _result(sim, "door_left_open_mmwave_keeps_short_stay_occupied")


def door_left_open_exit_clears_after_unsealed_check() -> dict[str, Any]:
    """A settled room should clear after exit even when the door is left open."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.close_door("transit_hall", "short_stay")
        sim.set_spatial_targets("short_stay", 1, source="post_close_mmwave")
        sim.wait(180)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "transit_hall", spatial_targets=1)
        sim.set_spatial_targets("transit_hall", 1, source="hall_mmwave_east")
        sim.clear_room("short_stay")

        sim.assert_room("short_stay", OccupancyState.CHECKING, sealed=False)

        sim.wait(sim.configs["short_stay"].checking_timeout)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)

        sim.set_spatial_targets("transit_hall", 0, source="hall_mmwave_east")
        sim.clear_room("transit_hall")
        sim.wait(
            LOCAL_TRANSIT_PHANTOM_HOLD + sim.configs["transit_hall"].checking_timeout
        )
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "door_left_open_exit_clears_after_unsealed_check")


def door_sensor_unavailable_recovers_with_active_presence() -> dict[str, Any]:
    """A door sensor outage should not clear a room with active mmWave presence."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.close_door("transit_hall", "short_stay")
        sim.set_spatial_targets("short_stay", 1, source="post_close_mmwave")
        sim.wait(180)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.set_door_unavailable("transit_hall", "short_stay")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.clear_pir("short_stay")
        sim.set_spatial_targets("short_stay", 1, source="person_still_inside")
        sim.wait(sim.configs["short_stay"].presence_timeout)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.close_door("transit_hall", "short_stay")
        sim.set_spatial_targets("short_stay", 1, source="door_recovered_presence")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        return _result(sim, "door_sensor_unavailable_recovers_with_active_presence")


def multi_target_partial_exit_keeps_source_occupied() -> dict[str, Any]:
    """One person can leave a multi-target room while another remains inside."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("alpha", "Subject Alpha")
        sim.add_person("beta", "Subject Beta")

        sim.enter_room("alpha", "open_west", spatial_targets=2)
        sim.enter_room("beta", "open_west", spatial_targets=2)
        sim.set_spatial_targets("open_west", 1, source="wide_mmwave_west_remaining")
        sim.assert_room("open_west", OccupancyState.OCCUPIED, sealed=False)

        sim.open_door("open_west", "service_room")
        sim.enter_room("alpha", "service_room", spatial_targets=1)
        sim.set_spatial_targets("open_west", 0, source="scenario")
        sim.set_spatial_targets("open_west", 1, source="wide_mmwave_west_remaining")
        sim.clear_pir("open_west")
        sim.close_door("open_west", "service_room")
        sim.set_spatial_targets("service_room", 1, source="service_room_confirmed")

        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("open_west", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("service_room", OccupancyState.OCCUPIED, sealed=True)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)

        sim.open_door("open_west", "service_room")
        sim.clear_room("service_room")
        sim.wait(sim.configs["service_room"].checking_timeout)
        sim.assert_room("service_room", OccupancyState.VACANT, sealed=False)
        sim.assert_room("open_west", OccupancyState.OCCUPIED, sealed=False)

        return _result(sim, "multi_target_partial_exit_keeps_source_occupied")


def two_people_cross_hallway_independently() -> dict[str, Any]:
    """Two people moving through transit should not strand hallway occupancy."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("alpha", "Subject Alpha")
        sim.add_person("beta", "Subject Beta")

        sim.open_door("entry_nook", "transit_hall")
        sim.enter_room("alpha", "transit_hall", spatial_targets=1)
        sim.set_spatial_targets("transit_hall", 1, source="hall_mmwave_east")

        sim.open_door("open_west", "transit_hall")
        sim.enter_room("beta", "transit_hall", spatial_targets=1)
        sim.set_spatial_targets("transit_hall", 1, source="hall_mmwave_west")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("alpha", "short_stay", spatial_targets=1)
        sim.close_door("transit_hall", "short_stay")
        sim.set_spatial_targets("short_stay", 1, source="short_stay_spatial")
        sim.set_spatial_targets("transit_hall", 0, source="hall_mmwave_east")

        sim.open_door("transit_hall", "open_east")
        sim.enter_room("beta", "open_east", spatial_targets=1)
        sim.set_spatial_targets("transit_hall", 0, source="hall_mmwave_west")
        sim.clear_room("transit_hall")

        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)
        sim.assert_room("open_east", OccupancyState.OCCUPIED, sealed=False)
        return _result(sim, "two_people_cross_hallway_independently")


def transit_reentry_during_phantom_keeps_hallway_live() -> dict[str, Any]:
    """Real hallway re-entry should work after high-degree transit clears."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("open_west", "transit_hall")
        sim.enter_room("subject", "transit_hall", spatial_targets=1)
        sim.open_door("transit_hall", "open_east")
        sim.enter_room("subject", "open_east", spatial_targets=1)
        sim.clear_room("transit_hall")

        assert sim.transition_predictor is not None
        assert not sim.transition_predictor.has_active_phantom("transit_hall")
        sim.wait(20)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)

        sim.enter_room("subject", "transit_hall", spatial_targets=1)
        sim.set_spatial_targets("transit_hall", 1, source="hall_mmwave_east")
        sim.wait(20)
        sim.assert_room("transit_hall", OccupancyState.OCCUPIED, sealed=False)

        sim.set_spatial_targets("transit_hall", 0, source="hall_mmwave_east")
        sim.clear_room("transit_hall")
        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "transit_reentry_during_phantom_keeps_hallway_live")


def all_direct_routes_settle_without_stuck_hallway() -> dict[str, Any]:
    """Every direct local route should settle vacant without stale hallway occupancy."""
    connection_pairs = _local_connection_pairs()
    directed_routes = _local_directed_routes()
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")
        max_checking_timeout = max(
            config.checking_timeout for config in sim.configs.values()
        )

        for index, (source_id, target_id) in enumerate(directed_routes):
            for room_a, room_b in connection_pairs:
                sim.close_door(room_a, room_b)

            sim.enter_room("subject", source_id, spatial_targets=1)
            sim.assert_room(source_id, OccupancyState.OCCUPIED)

            sim.open_door(source_id, target_id)
            sim.enter_room("subject", target_id, spatial_targets=1)
            sim.clear_room(source_id)
            sim.close_door(source_id, target_id)

            sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 1)
            if target_id != "transit_hall":
                sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)

            sim.open_door(source_id, target_id)
            sim.clear_room(target_id)
            sim.wait(max_checking_timeout + LOCAL_TRANSIT_PHANTOM_HOLD + 1)

            for room_id in sim.room_ids:
                sim.assert_room(room_id, OccupancyState.VACANT, sealed=False)

            assert sim.transition_predictor is not None
            assert not any(
                sim.transition_predictor.has_active_phantom(room_id)
                for room_id in sim.room_ids
            ), f"route {index}: {source_id}->{target_id} left active phantom"

        return _result(sim, "all_direct_routes_settle_without_stuck_hallway")


def startup_clear_sensors_stays_vacant() -> dict[str, Any]:
    """Startup with closed doors and clear sensors must not create occupancy."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.recalculate_all("startup refresh")

        for room_id in sim.room_ids:
            sim.assert_room(room_id, OccupancyState.VACANT, sealed=False)
        return _result(sim, "startup_clear_sensors_stays_vacant")


def startup_open_doors_clear_sensors_stays_vacant() -> dict[str, Any]:
    """Startup with open restored doors and clear sensors must stay vacant."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        for room_a, room_b in _local_connection_pairs():
            sim.set_door_snapshot(room_a, room_b, open=True)
        sim.recalculate_all("startup refresh")

        for room_id in sim.room_ids:
            sim.assert_room(room_id, OccupancyState.VACANT, sealed=False)
        return _result(sim, "startup_open_doors_clear_sensors_stays_vacant")


def startup_single_room_presence_does_not_wake_hallway() -> dict[str, Any]:
    """Restored room presence on startup must not synthesize hallway occupancy."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.set_sensor_snapshot("short_stay", pir=False, mmwave=True)
        sim.recalculate_all("startup refresh")

        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        sim.set_mmwave("short_stay", False, spatial_targets=0)
        sim.wait(
            sim.configs["short_stay"].checking_timeout + LOCAL_TRANSIT_PHANTOM_HOLD
        )
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "startup_single_room_presence_does_not_wake_hallway")


def startup_hallway_presence_clears_without_waking_rooms() -> dict[str, Any]:
    """Startup-restored hallway presence must clear without waking adjacent rooms."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.set_sensor_snapshot("transit_hall", pir=False, mmwave=True)
        sim.recalculate_all("startup refresh")

        sim.assert_room("transit_hall", OccupancyState.OCCUPIED, sealed=False)
        sim.set_mmwave("transit_hall", False, spatial_targets=0)
        sim.wait(sim.configs["transit_hall"].checking_timeout + 1)

        for room_id in sim.room_ids:
            sim.assert_room(room_id, OccupancyState.VACANT, sealed=False)

        return _result(sim, "startup_hallway_presence_clears_without_waking_rooms")


def startup_each_room_presence_clears_without_cross_room_wake() -> dict[str, Any]:
    """Each restored room presence should clear without waking another room."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        max_checking_timeout = max(
            config.checking_timeout for config in sim.configs.values()
        )

        for room_id in sim.room_ids:
            sim.set_sensor_snapshot(room_id, pir=False, mmwave=True)
            sim.recalculate_all(f"startup refresh {room_id}")
            sim.assert_room(room_id, OccupancyState.OCCUPIED)

            sim.set_mmwave(room_id, False, spatial_targets=0)
            sim.wait(max_checking_timeout + LOCAL_TRANSIT_PHANTOM_HOLD + 1)

            for candidate_id in sim.room_ids:
                sim.assert_room(candidate_id, OccupancyState.VACANT, sealed=False)

            assert sim.transition_predictor is not None
            assert not any(
                sim.transition_predictor.has_active_phantom(candidate_id)
                for candidate_id in sim.room_ids
            ), f"startup restore for {room_id} left active phantom"

        return _result(
            sim,
            "startup_each_room_presence_clears_without_cross_room_wake",
        )


def startup_multiple_room_presence_clears_independently() -> dict[str, Any]:
    """Multiple restored room presences should clear without cross-room wake."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        max_checking_timeout = max(
            config.checking_timeout for config in sim.configs.values()
        )

        sim.set_sensor_snapshot("short_stay", pir=False, mmwave=True)
        sim.set_sensor_snapshot("open_east", pir=False, mmwave=True)
        sim.recalculate_all("startup refresh")

        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("open_east", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)

        sim.set_mmwave("short_stay", False, spatial_targets=0)
        sim.wait(max_checking_timeout + LOCAL_TRANSIT_PHANTOM_HOLD + 1)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)
        sim.assert_room("open_east", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)

        sim.set_mmwave("open_east", False, spatial_targets=0)
        sim.wait(max_checking_timeout + LOCAL_TRANSIT_PHANTOM_HOLD + 1)
        for room_id in sim.room_ids:
            sim.assert_room(room_id, OccupancyState.VACANT, sealed=False)

        return _result(sim, "startup_multiple_room_presence_clears_independently")


def startup_restored_presence_door_open_wakes_hallway() -> dict[str, Any]:
    """A real door open after startup-restored presence should still predict exit."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.set_sensor_snapshot("short_stay", pir=False, mmwave=True)
        sim.recalculate_all("startup refresh")

        sim.open_door("transit_hall", "short_stay")
        sim.assert_room("transit_hall", OccupancyState.OCCUPIED, sealed=False)

        sim.clear_room("short_stay")
        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "startup_restored_presence_door_open_wakes_hallway")


def open_door_override_real_activity_survives_safety_timer() -> dict[str, Any]:
    """Real activity after an open-door override should survive safety expiry."""
    with AlgorithmScenarioSimulator.anonymized_local_home(
        policy_overrides_by_room={"short_stay": {"override_safety_timeout": 5}}
    ) as sim:
        sim.add_person("subject", "Subject")
        sim.open_door("transit_hall", "short_stay")
        sim.override_room("short_stay")
        sim.wait(4)

        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.wait(5)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.clear_room("short_stay")
        sim.wait(sim.configs["short_stay"].checking_timeout * 2)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)
        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "open_door_override_real_activity_survives_safety_timer")


def closed_door_override_hold() -> dict[str, Any]:
    """Trigger an override behind a closed door and verify door-open release."""
    with AlgorithmScenarioSimulator.anonymized_local_home(
        policy_overrides_by_room={"short_stay": {"override_safety_timeout": 5}}
    ) as sim:
        sim.override_room("short_stay")
        sim.wait(10)

        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.open_door("transit_hall", "short_stay")
        sim.assert_room("short_stay", OccupancyState.CHECKING, sealed=False)
        sim.wait(30)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)
        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "closed_door_override_hold")


def open_door_override_safety() -> dict[str, Any]:
    """Trigger an override with an open door and verify timer release."""
    with AlgorithmScenarioSimulator.anonymized_local_home(
        policy_overrides_by_room={"short_stay": {"override_safety_timeout": 5}}
    ) as sim:
        sim.open_door("transit_hall", "short_stay")
        sim.override_room("short_stay")
        sim.wait(5)

        sim.assert_room("short_stay", OccupancyState.CHECKING, sealed=False)
        sim.wait(30)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)
        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "open_door_override_safety")


def vertical_transit_phantom() -> dict[str, Any]:
    """Cross through high-degree transit without fanning out phantoms."""
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

        assert sim.transition_predictor is not None
        assert not sim.transition_predictor.has_active_phantom("transit_hall")
        sim.assert_room("transit_hall", OccupancyState.CHECKING, sealed=False)

        sim.wait(20)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        return _result(sim, "vertical_transit_phantom")


SCENARIOS: dict[str, LocalScenario] = {
    "hallway_to_short_stay": LocalScenario(
        id="hallway_to_short_stay",
        description="Open area -> transit -> short-stay room, door left open, then closed with mmWave confirmation.",
        run=hallway_to_short_stay,
    ),
    "quick_exit_after_settled_occupancy": LocalScenario(
        id="quick_exit_after_settled_occupancy",
        description="Short-stay room occupied for minutes, quick door open/close, then clear empty signal.",
        run=quick_exit_after_settled_occupancy,
    ),
    "door_bounce_person_remains_after_settled_occupancy": LocalScenario(
        id="door_bounce_person_remains_after_settled_occupancy",
        description="Short-stay room occupied for minutes, quick door bounce, but mmWave still sees the person.",
        run=door_bounce_person_remains_after_settled_occupancy,
    ),
    "repeated_door_bounces_do_not_wake_hallway": LocalScenario(
        id="repeated_door_bounces_do_not_wake_hallway",
        description="Repeated short-stay door bounces while mmWave remains active do not leave hallway occupied.",
        run=repeated_door_bounces_do_not_wake_hallway,
    ),
    "door_left_open_mmwave_keeps_short_stay_occupied": LocalScenario(
        id="door_left_open_mmwave_keeps_short_stay_occupied",
        description="Short-stay door is left open while PIR clears but mmWave remains active.",
        run=door_left_open_mmwave_keeps_short_stay_occupied,
    ),
    "door_left_open_exit_clears_after_unsealed_check": LocalScenario(
        id="door_left_open_exit_clears_after_unsealed_check",
        description="Settled short-stay occupancy exits with the door left open and clears after the unsealed check.",
        run=door_left_open_exit_clears_after_unsealed_check,
    ),
    "door_sensor_unavailable_recovers_with_active_presence": LocalScenario(
        id="door_sensor_unavailable_recovers_with_active_presence",
        description="Short-stay door sensor outage breaks seal but active mmWave keeps occupancy until the door recovers.",
        run=door_sensor_unavailable_recovers_with_active_presence,
    ),
    "multi_target_partial_exit_keeps_source_occupied": LocalScenario(
        id="multi_target_partial_exit_keeps_source_occupied",
        description="One person leaves a multi-target open area while another target keeps the source room occupied.",
        run=multi_target_partial_exit_keeps_source_occupied,
    ),
    "two_people_cross_hallway_independently": LocalScenario(
        id="two_people_cross_hallway_independently",
        description="Two people independently cross the transit hallway without stranding hallway occupancy.",
        run=two_people_cross_hallway_independently,
    ),
    "transit_reentry_during_phantom_keeps_hallway_live": LocalScenario(
        id="transit_reentry_during_phantom_keeps_hallway_live",
        description="A real hallway re-entry during an existing transit phantom keeps hallway occupancy live until clear.",
        run=transit_reentry_during_phantom_keeps_hallway_live,
    ),
    "all_direct_routes_settle_without_stuck_hallway": LocalScenario(
        id="all_direct_routes_settle_without_stuck_hallway",
        description="Every direct route in the anonymized local layout settles without stale hallway occupancy.",
        run=all_direct_routes_settle_without_stuck_hallway,
    ),
    "startup_clear_sensors_stays_vacant": LocalScenario(
        id="startup_clear_sensors_stays_vacant",
        description="Startup/reload snapshot with clear sensors and closed doors leaves every room vacant.",
        run=startup_clear_sensors_stays_vacant,
    ),
    "startup_open_doors_clear_sensors_stays_vacant": LocalScenario(
        id="startup_open_doors_clear_sensors_stays_vacant",
        description="Startup/reload snapshot with open doors and clear sensors leaves every room vacant.",
        run=startup_open_doors_clear_sensors_stays_vacant,
    ),
    "startup_single_room_presence_does_not_wake_hallway": LocalScenario(
        id="startup_single_room_presence_does_not_wake_hallway",
        description="Startup/reload snapshot with one active room presence does not synthesize hallway occupancy.",
        run=startup_single_room_presence_does_not_wake_hallway,
    ),
    "startup_hallway_presence_clears_without_waking_rooms": LocalScenario(
        id="startup_hallway_presence_clears_without_waking_rooms",
        description="Startup/reload snapshot with hallway presence clears without waking adjacent rooms.",
        run=startup_hallway_presence_clears_without_waking_rooms,
    ),
    "startup_each_room_presence_clears_without_cross_room_wake": LocalScenario(
        id="startup_each_room_presence_clears_without_cross_room_wake",
        description="Each startup-restored room presence clears without waking another room.",
        run=startup_each_room_presence_clears_without_cross_room_wake,
    ),
    "startup_multiple_room_presence_clears_independently": LocalScenario(
        id="startup_multiple_room_presence_clears_independently",
        description="Multiple startup-restored room presences clear independently without waking transit.",
        run=startup_multiple_room_presence_clears_independently,
    ),
    "startup_restored_presence_door_open_wakes_hallway": LocalScenario(
        id="startup_restored_presence_door_open_wakes_hallway",
        description="Startup-restored room occupancy still creates hallway prediction after a real door-open event.",
        run=startup_restored_presence_door_open_wakes_hallway,
    ),
    "open_door_override_real_activity_survives_safety_timer": LocalScenario(
        id="open_door_override_real_activity_survives_safety_timer",
        description="Open-door override converts back to sensor-derived occupancy when real activity appears before safety expiry.",
        run=open_door_override_real_activity_survives_safety_timer,
    ),
    "hallway_left_open_to_short_stay_then_close": LocalScenario(
        id="hallway_left_open_to_short_stay_then_close",
        description="Entry -> transit hallway -> short-stay room with the door left open, then closed and resealed by mmWave.",
        run=hallway_left_open_to_short_stay_then_close,
    ),
    "hallway_multi_mmwave_clears_after_last_target": LocalScenario(
        id="hallway_multi_mmwave_clears_after_last_target",
        description="Two hallway mmWave sources keep transit occupied until both clear.",
        run=hallway_multi_mmwave_clears_after_last_target,
    ),
    "short_stay_exit_back_to_hallway": LocalScenario(
        id="short_stay_exit_back_to_hallway",
        description="Settled short-stay occupancy exits into the hallway and both rooms settle cleanly.",
        run=short_stay_exit_back_to_hallway,
    ),
    "closed_door_override_hold": LocalScenario(
        id="closed_door_override_hold",
        description="Closed-door override survives safety expiry and releases when the door opens.",
        run=closed_door_override_hold,
    ),
    "open_door_override_safety": LocalScenario(
        id="open_door_override_safety",
        description="Open-door override releases through the safety timer.",
        run=open_door_override_safety,
    ),
    "vertical_transit_phantom": LocalScenario(
        id="vertical_transit_phantom",
        description="Movement through the mirrored transit hallway creates a phantom that expires cleanly.",
        run=vertical_transit_phantom,
    ),
}


def _print_text(results: list[dict[str, Any]]) -> None:
    for result in results:
        print(f"PASS {result['scenario']} ({result['elapsed_seconds']:g}s)")
        interesting = {
            key: value
            for key, value in result["final_states"].items()
            if value["state"] != OccupancyState.VACANT
        }
        for room_id, state in interesting.items():
            print(
                f"  {room_id}: {state['state']}, "
                f"sealed={state['sealed']}, confidence={state['confidence']:.2f}"
            )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--scenario",
        choices=["all", *SCENARIOS],
        default="all",
        help="Scenario to run.",
    )
    parser.add_argument(
        "--format",
        choices=["text", "json"],
        default="text",
        help="Output format.",
    )
    parser.add_argument(
        "--show-layout",
        action="store_true",
        help="Print the anonymized local-house layout instead of running scenarios.",
    )
    args = parser.parse_args(argv)

    if args.show_layout:
        print(json.dumps(local_home_layout_summary(), indent=2, sort_keys=True))
        return 0

    selected = (
        list(SCENARIOS.values())
        if args.scenario == "all"
        else [SCENARIOS[args.scenario]]
    )
    results = [scenario.run() for scenario in selected]

    if args.format == "json":
        print(json.dumps(results, indent=2, sort_keys=True))
    else:
        _print_text(results)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
