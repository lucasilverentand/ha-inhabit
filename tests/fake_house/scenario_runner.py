"""Scenario runner for testing occupancy scenarios."""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from enum import Enum
from typing import Any, Callable

from homeassistant.const import STATE_OFF, STATE_ON

from .house_simulator import FakeHouseSimulator


class ActionType(Enum):
    """Types of actions in a scenario."""

    MOVE_PERSON = "move_person"
    PERSON_STILL = "person_still"
    PERSON_LEAVES = "person_leaves"
    OPEN_DOOR = "open_door"
    CLOSE_DOOR = "close_door"
    SET_SENSOR = "set_sensor"
    WAIT = "wait"
    ASSERT_STATE = "assert_state"
    ASSERT_OCCUPANCY = "assert_occupancy"


@dataclass
class ScenarioAction:
    """Single action in a scenario."""

    action_type: ActionType
    params: dict[str, Any]


@dataclass
class Scenario:
    """Test scenario definition."""

    name: str
    description: str
    actions: list[ScenarioAction]


class ScenarioRunner:
    """Runs predefined test scenarios."""

    def __init__(self, simulator: FakeHouseSimulator) -> None:
        """Initialize the scenario runner."""
        self.simulator = simulator
        self._occupancy_states: dict[str, str] = {}
        self._assertions_passed = 0
        self._assertions_failed = 0

    def set_occupancy_callback(
        self, callback: Callable[[str, str], None]
    ) -> None:
        """Set callback to track occupancy state changes."""
        # This would be connected to the virtual sensor engine
        pass

    def update_occupancy_state(self, room_id: str, state: str) -> None:
        """Update tracked occupancy state."""
        self._occupancy_states[room_id] = state

    async def run_scenario(self, scenario: Scenario) -> dict[str, Any]:
        """Run a scenario and return results."""
        self._assertions_passed = 0
        self._assertions_failed = 0
        errors: list[str] = []

        print(f"\n=== Running Scenario: {scenario.name} ===")
        print(f"Description: {scenario.description}\n")

        for i, action in enumerate(scenario.actions):
            print(f"Step {i + 1}: {action.action_type.value} - {action.params}")

            try:
                await self._execute_action(action)
            except AssertionError as e:
                errors.append(f"Step {i + 1}: {str(e)}")
                self._assertions_failed += 1

        results = {
            "scenario": scenario.name,
            "passed": self._assertions_passed,
            "failed": self._assertions_failed,
            "errors": errors,
            "success": self._assertions_failed == 0,
        }

        print(f"\nResults: {self._assertions_passed} passed, {self._assertions_failed} failed")
        return results

    async def _execute_action(self, action: ScenarioAction) -> None:
        """Execute a single scenario action."""
        params = action.params

        if action.action_type == ActionType.MOVE_PERSON:
            self.simulator.move_person_to_room(params["person_id"], params["room_id"])

        elif action.action_type == ActionType.PERSON_STILL:
            self.simulator.person_becomes_still(params["person_id"])

        elif action.action_type == ActionType.PERSON_LEAVES:
            self.simulator.person_leaves_room(params["person_id"])

        elif action.action_type == ActionType.OPEN_DOOR:
            self.simulator.open_door(params["room1_id"], params["room2_id"])

        elif action.action_type == ActionType.CLOSE_DOOR:
            self.simulator.close_door(params["room1_id"], params["room2_id"])

        elif action.action_type == ActionType.SET_SENSOR:
            self.simulator.set_sensor_state(params["entity_id"], params["state"])

        elif action.action_type == ActionType.WAIT:
            await asyncio.sleep(params.get("seconds", 0.1))

        elif action.action_type == ActionType.ASSERT_STATE:
            entity_id = params["entity_id"]
            expected = params["expected"]
            actual = self.simulator.sensors[entity_id].state
            if actual != expected:
                raise AssertionError(
                    f"{entity_id}: expected {expected}, got {actual}"
                )
            self._assertions_passed += 1

        elif action.action_type == ActionType.ASSERT_OCCUPANCY:
            room_id = params["room_id"]
            expected = params["expected"]
            actual = self._occupancy_states.get(room_id, "unknown")
            if actual != expected:
                raise AssertionError(
                    f"Room {room_id} occupancy: expected {expected}, got {actual}"
                )
            self._assertions_passed += 1

    @staticmethod
    def get_predefined_scenarios() -> list[Scenario]:
        """Get list of predefined test scenarios."""
        return [
            Scenario(
                name="Person enters and sits",
                description="Person enters living room, triggers motion, then sits still (PIR clears, presence maintains)",
                actions=[
                    ScenarioAction(
                        ActionType.MOVE_PERSON,
                        {"person_id": "person1", "room_id": "ground_living"},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                    ScenarioAction(
                        ActionType.ASSERT_STATE,
                        {"entity_id": "binary_sensor.ground_living_motion", "expected": STATE_ON},
                    ),
                    ScenarioAction(
                        ActionType.ASSERT_STATE,
                        {"entity_id": "binary_sensor.ground_living_presence", "expected": STATE_ON},
                    ),
                    ScenarioAction(
                        ActionType.PERSON_STILL,
                        {"person_id": "person1"},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                    ScenarioAction(
                        ActionType.ASSERT_STATE,
                        {"entity_id": "binary_sensor.ground_living_motion", "expected": STATE_OFF},
                    ),
                    ScenarioAction(
                        ActionType.ASSERT_STATE,
                        {"entity_id": "binary_sensor.ground_living_presence", "expected": STATE_ON},
                    ),
                ],
            ),
            Scenario(
                name="Person moves between rooms",
                description="Person moves from living room to kitchen via door",
                actions=[
                    ScenarioAction(
                        ActionType.MOVE_PERSON,
                        {"person_id": "person1", "room_id": "ground_living"},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                    ScenarioAction(
                        ActionType.MOVE_PERSON,
                        {"person_id": "person1", "room_id": "ground_kitchen"},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                    ScenarioAction(
                        ActionType.ASSERT_STATE,
                        {"entity_id": "binary_sensor.ground_kitchen_motion", "expected": STATE_ON},
                    ),
                    ScenarioAction(
                        ActionType.ASSERT_STATE,
                        {"entity_id": "binary_sensor.ground_kitchen_presence", "expected": STATE_ON},
                    ),
                ],
            ),
            Scenario(
                name="Person leaves room completely",
                description="Person enters room, then leaves - all sensors clear",
                actions=[
                    ScenarioAction(
                        ActionType.MOVE_PERSON,
                        {"person_id": "person1", "room_id": "ground_living"},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                    ScenarioAction(
                        ActionType.PERSON_LEAVES,
                        {"person_id": "person1"},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                    ScenarioAction(
                        ActionType.ASSERT_STATE,
                        {"entity_id": "binary_sensor.ground_living_motion", "expected": STATE_OFF},
                    ),
                    ScenarioAction(
                        ActionType.ASSERT_STATE,
                        {"entity_id": "binary_sensor.ground_living_presence", "expected": STATE_OFF},
                    ),
                ],
            ),
            Scenario(
                name="Door interaction",
                description="Test door opening and closing between rooms",
                actions=[
                    ScenarioAction(
                        ActionType.OPEN_DOOR,
                        {"room1_id": "ground_living", "room2_id": "ground_kitchen"},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                    ScenarioAction(
                        ActionType.CLOSE_DOOR,
                        {"room1_id": "ground_living", "room2_id": "ground_kitchen"},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                ],
            ),
            Scenario(
                name="Multiple floors",
                description="Person goes from ground floor to first floor",
                actions=[
                    ScenarioAction(
                        ActionType.MOVE_PERSON,
                        {"person_id": "person1", "room_id": "ground_hallway"},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                    ScenarioAction(
                        ActionType.MOVE_PERSON,
                        {"person_id": "person1", "room_id": "first_hallway"},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                    ScenarioAction(
                        ActionType.MOVE_PERSON,
                        {"person_id": "person1", "room_id": "first_bedroom1"},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                    ScenarioAction(
                        ActionType.ASSERT_STATE,
                        {"entity_id": "binary_sensor.first_bedroom1_motion", "expected": STATE_ON},
                    ),
                ],
            ),
            Scenario(
                name="Simultaneous sensors",
                description="Multiple motion sensors trigger simultaneously",
                actions=[
                    ScenarioAction(
                        ActionType.SET_SENSOR,
                        {"entity_id": "binary_sensor.ground_living_motion", "state": STATE_ON},
                    ),
                    ScenarioAction(
                        ActionType.SET_SENSOR,
                        {"entity_id": "binary_sensor.ground_kitchen_motion", "state": STATE_ON},
                    ),
                    ScenarioAction(ActionType.WAIT, {"seconds": 0.1}),
                    ScenarioAction(
                        ActionType.ASSERT_STATE,
                        {"entity_id": "binary_sensor.ground_living_motion", "expected": STATE_ON},
                    ),
                    ScenarioAction(
                        ActionType.ASSERT_STATE,
                        {"entity_id": "binary_sensor.ground_kitchen_motion", "expected": STATE_ON},
                    ),
                ],
            ),
        ]
