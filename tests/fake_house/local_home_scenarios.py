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


def hallway_to_short_stay() -> dict[str, Any]:
    """Walk from an open area into transit, then into a short-stay room."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.enter_room("subject", "level0_open_area", spatial_targets=1)
        sim.open_door("level0_open_area", "level0_transit")
        sim.enter_room("subject", "level0_transit", spatial_targets=1)
        sim.clear_room("level0_open_area")

        sim.open_door("level0_transit", "level0_short_stay")
        sim.enter_room("subject", "level0_short_stay", spatial_targets=1)
        sim.clear_room("level0_transit")
        sim.wait(90)

        sim.close_door("level0_transit", "level0_short_stay")
        sim.clear_pir("level0_short_stay")
        sim.set_spatial_targets("level0_short_stay", 1, source="post_close_mmwave")

        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=True)
        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=True)
        sim.assert_room("level0_transit", OccupancyState.VACANT, sealed=False)
        sim.assert_room("level0_open_area", OccupancyState.VACANT, sealed=False)
        return _result(sim, "hallway_to_short_stay")


def quick_exit_after_settled_occupancy() -> dict[str, Any]:
    """Open and close a door after settled occupancy, then clear mmWave."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("level0_transit", "level0_short_stay")
        sim.enter_room("subject", "level0_short_stay", spatial_targets=1)
        sim.close_door("level0_transit", "level0_short_stay")
        sim.set_spatial_targets("level0_short_stay", 1, source="post_close_mmwave")
        sim.wait(180)

        sim.open_door("level0_transit", "level0_short_stay")
        sim.close_door("level0_transit", "level0_short_stay")
        sim.clear_room("level0_short_stay")
        sim.wait(15)

        sim.assert_room("level0_short_stay", OccupancyState.CHECKING, sealed=False)
        sim.wait(30)
        sim.assert_room("level0_short_stay", OccupancyState.VACANT, sealed=False)
        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("level0_transit", OccupancyState.VACANT, sealed=False)
        return _result(sim, "quick_exit_after_settled_occupancy")


def closed_door_override_hold() -> dict[str, Any]:
    """Trigger an override behind a closed door and verify door-open release."""
    with AlgorithmScenarioSimulator.anonymized_local_home(
        policy_overrides_by_room={"level0_short_stay": {"override_safety_timeout": 5}}
    ) as sim:
        sim.override_room("level0_short_stay")
        sim.wait(10)

        sim.assert_room("level0_short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.open_door("level0_transit", "level0_short_stay")
        sim.assert_room("level0_short_stay", OccupancyState.CHECKING, sealed=False)
        sim.wait(30)
        sim.assert_room("level0_short_stay", OccupancyState.VACANT, sealed=False)
        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("level0_transit", OccupancyState.VACANT, sealed=False)
        return _result(sim, "closed_door_override_hold")


def open_door_override_safety() -> dict[str, Any]:
    """Trigger an override with an open door and verify timer release."""
    with AlgorithmScenarioSimulator.anonymized_local_home(
        policy_overrides_by_room={"level0_short_stay": {"override_safety_timeout": 5}}
    ) as sim:
        sim.open_door("level0_transit", "level0_short_stay")
        sim.override_room("level0_short_stay")
        sim.wait(5)

        sim.assert_room("level0_short_stay", OccupancyState.CHECKING, sealed=False)
        sim.wait(30)
        sim.assert_room("level0_short_stay", OccupancyState.VACANT, sealed=False)
        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("level0_transit", OccupancyState.VACANT, sealed=False)
        return _result(sim, "open_door_override_safety")


def vertical_transit_phantom() -> dict[str, Any]:
    """Cross the vertical link and verify transit phantom expiry."""
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

        assert sim.transition_predictor is not None
        assert sim.transition_predictor.has_active_phantom("level0_transit")
        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD)

        sim.assert_room("level0_transit", OccupancyState.CHECKING, sealed=False)
        sim.wait(30)
        sim.assert_room("level0_transit", OccupancyState.VACANT, sealed=False)
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
        description="Movement through vertical transit creates a hallway phantom that expires cleanly.",
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
    args = parser.parse_args(argv)

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
