"""Deterministic simulator that drives the real occupancy algorithm."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any
from unittest.mock import MagicMock, patch

from homeassistant.const import STATE_OFF, STATE_ON

from custom_components.inhabit.engine.occupancy_state_machine import (
    OccupancyStateMachine,
)
from custom_components.inhabit.models.virtual_sensor import (
    OccupancyStateData,
    SensorBinding,
    VirtualSensorConfig,
)

from .house_simulator import FakeHouseSimulator, SensorType


@dataclass
class ScheduledCallback:
    """A scheduled callback controlled by the fake clock."""

    due_at: datetime
    callback: Callable[[Any], None]
    sequence: int
    cancelled: bool = False


class FakeClock:
    """Minimal fake clock for Home Assistant async_call_later callbacks."""

    def __init__(self, start: datetime | None = None) -> None:
        self.now = start or datetime(2026, 1, 1, 12, 0, 0)
        self._sequence = 0
        self._scheduled: list[ScheduledCallback] = []

    def async_call_later(
        self, _hass: Any, delay: float, callback: Callable[[Any], None]
    ) -> Callable[[], None]:
        """Schedule a callback against fake time."""
        self._sequence += 1
        scheduled = ScheduledCallback(
            due_at=self.now + timedelta(seconds=max(0.0, delay)),
            callback=callback,
            sequence=self._sequence,
        )
        self._scheduled.append(scheduled)

        def cancel() -> None:
            scheduled.cancelled = True

        return cancel

    def advance(self, seconds: float) -> None:
        """Advance fake time and run due callbacks in deterministic order."""
        target = self.now + timedelta(seconds=seconds)
        while True:
            due = [
                item
                for item in self._scheduled
                if not item.cancelled and item.due_at <= target
            ]
            if not due:
                break
            next_item = min(due, key=lambda item: (item.due_at, item.sequence))
            self.now = next_item.due_at
            next_item.cancelled = True
            next_item.callback(self.now)
        self.now = target


def _fake_datetime_class(clock: FakeClock) -> type[datetime]:
    """Create a datetime subclass whose now() follows the fake clock."""

    class FakeDateTime(datetime):
        @classmethod
        def now(cls, tz: Any = None) -> datetime:
            current = clock.now
            if tz is not None:
                return current.astimezone(tz)
            return current

    return FakeDateTime


@dataclass
class TimelineEntry:
    """Snapshot of algorithm state after a simulator action."""

    at_seconds: float
    label: str
    rooms: dict[str, dict[str, Any]]


class AlgorithmScenarioSimulator:
    """Scenario simulator wired into the production occupancy state machine."""

    def __init__(
        self,
        room_ids: list[str] | None = None,
        *,
        unsealed_activity_timeout: int = 120,
        motion_timeout: int = 120,
        checking_timeout: int = 30,
        presence_timeout: int = 300,
    ) -> None:
        self.clock = FakeClock()
        self._start_time = self.clock.now
        self._fake_datetime = _fake_datetime_class(self.clock)
        self._patches = [
            patch(
                "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
                self.clock.async_call_later,
            ),
            patch(
                "custom_components.inhabit.engine.occupancy_state_machine.datetime",
                self._fake_datetime,
            ),
            patch(
                "custom_components.inhabit.engine.presence_aggregator.datetime",
                self._fake_datetime,
            ),
        ]
        for active_patch in self._patches:
            active_patch.start()

        self.hass = MagicMock()
        self.hass.bus.async_fire = MagicMock()
        self.house = FakeHouseSimulator(self.hass)
        self.hass.states.get.side_effect = self._get_state

        self.room_ids = room_ids or list(self.house.rooms)
        self.machines: dict[str, OccupancyStateMachine] = {}
        self.transitions: list[dict[str, Any]] = []
        self.timeline: list[TimelineEntry] = []
        self.house.on_state_change(self._route_sensor_change)

        for room_id in self.room_ids:
            self.machines[room_id] = OccupancyStateMachine(
                self.hass,
                self._make_config(
                    room_id,
                    unsealed_activity_timeout=unsealed_activity_timeout,
                    motion_timeout=motion_timeout,
                    checking_timeout=checking_timeout,
                    presence_timeout=presence_timeout,
                ),
                self._make_state_callback(room_id),
            )
        self.record("initial")

    def close(self) -> None:
        """Stop global patches owned by this simulator."""
        for active_patch in reversed(self._patches):
            active_patch.stop()

    def __enter__(self) -> AlgorithmScenarioSimulator:
        return self

    def __exit__(self, *_args: Any) -> None:
        self.close()

    def _make_config(
        self,
        room_id: str,
        *,
        unsealed_activity_timeout: int,
        motion_timeout: int,
        checking_timeout: int,
        presence_timeout: int,
    ) -> VirtualSensorConfig:
        door_sensors = []
        for connected_id in self.house.rooms[room_id].connected_rooms:
            door_id = self.house._find_door_sensor(room_id, connected_id)
            if door_id:
                door_sensors.append(
                    SensorBinding(
                        entity_id=door_id,
                        sensor_type="door",
                        weight=1.0,
                    )
                )

        return VirtualSensorConfig(
            room_id=room_id,
            floor_plan_id="algorithm_simulator",
            enabled=True,
            motion_timeout=motion_timeout,
            checking_timeout=checking_timeout,
            presence_timeout=presence_timeout,
            unsealed_activity_timeout=unsealed_activity_timeout,
            motion_sensors=[
                SensorBinding(
                    entity_id=f"binary_sensor.{room_id}_motion",
                    sensor_type="motion",
                    weight=1.0,
                )
            ],
            presence_sensors=[
                SensorBinding(
                    entity_id=f"binary_sensor.{room_id}_presence",
                    sensor_type="presence",
                    weight=1.5,
                )
            ],
            door_sensors=door_sensors,
            door_seals_room=True,
            door_blocks_vacancy=True,
            door_open_resets_checking=True,
        )

    def _make_state_callback(
        self, room_id: str
    ) -> Callable[[OccupancyStateData, str], None]:
        def on_change(state: OccupancyStateData, reason: str = "") -> None:
            self.transitions.append(
                {
                    "time": self.elapsed_seconds,
                    "room_id": room_id,
                    "state": state.state,
                    "sealed": state.sealed,
                    "reason": reason,
                }
            )

        return on_change

    @property
    def elapsed_seconds(self) -> float:
        """Seconds elapsed since the scenario started."""
        return (self.clock.now - self._start_time).total_seconds()

    def add_person(self, person_id: str, name: str) -> None:
        """Add a simulated person."""
        self.house.add_person(person_id, name)
        self.record(f"add person {person_id}")

    def enter_room(
        self,
        person_id: str,
        room_id: str,
        *,
        pir: bool = True,
        mmwave: bool = True,
        spatial_targets: int = 1,
    ) -> None:
        """Move a person into a room and trigger the room sensors."""
        person = self.house.persons[person_id]
        person.current_room = room_id
        self.set_pir(room_id, pir)
        self.set_mmwave(room_id, mmwave, spatial_targets=spatial_targets)
        self.record(f"{person_id} enters {room_id}")

    def clear_room(self, room_id: str) -> None:
        """Clear PIR, mmWave, and spatial presence for a room."""
        self.set_pir(room_id, False)
        self.set_mmwave(room_id, False, spatial_targets=0)
        self.record(f"clear {room_id}")

    def set_pir(self, room_id: str, active: bool) -> None:
        """Set a room PIR motion sensor."""
        state = STATE_ON if active else STATE_OFF
        self.house.set_sensor_state(f"binary_sensor.{room_id}_motion", state)

    def clear_pir(self, room_id: str) -> None:
        """Clear a room PIR motion sensor."""
        self.set_pir(room_id, False)
        self.record(f"pir clear {room_id}")

    def set_mmwave(
        self, room_id: str, active: bool, *, spatial_targets: int | None = None
    ) -> None:
        """Set a room mmWave binary presence sensor and optional target count."""
        state = STATE_ON if active else STATE_OFF
        self.house.set_sensor_state(f"binary_sensor.{room_id}_presence", state)
        if spatial_targets is not None:
            self.set_spatial_targets(room_id, spatial_targets)

    def set_spatial_targets(
        self, room_id: str, target_count: int, source: str = "scenario"
    ) -> None:
        """Feed simulated mmWave target counts into the real spatial API."""
        self.machines[room_id].update_spatial_presence(target_count, source=source)
        self.record(f"spatial {room_id}={target_count}")

    def open_door(self, room1_id: str, room2_id: str) -> None:
        """Open the door between two rooms."""
        self.house.open_door(room1_id, room2_id)
        self.record(f"open {room1_id}<->{room2_id}")

    def close_door(self, room1_id: str, room2_id: str) -> None:
        """Close the door between two rooms."""
        self.house.close_door(room1_id, room2_id)
        self.record(f"close {room1_id}<->{room2_id}")

    def wait(self, seconds: float) -> None:
        """Advance fake time and process due timers."""
        self.clock.advance(seconds)
        self.record(f"wait {seconds:g}s")

    def assert_room(
        self,
        room_id: str,
        expected_state: str,
        *,
        sealed: bool | None = None,
    ) -> None:
        """Assert the real state machine state for a room."""
        state = self.machines[room_id].state
        assert (
            state.state == expected_state
        ), f"{room_id}: expected {expected_state}, got {state.state}"
        if sealed is not None:
            assert (
                state.sealed is sealed
            ), f"{room_id}: expected sealed={sealed}, got {state.sealed}"

    def record(self, label: str) -> None:
        """Record a compact state snapshot for debugging failed scenarios."""
        self.timeline.append(
            TimelineEntry(
                at_seconds=self.elapsed_seconds,
                label=label,
                rooms={
                    room_id: {
                        "state": machine.state.state,
                        "sealed": machine.state.sealed,
                        "confidence": machine.state.confidence,
                        "contributing_sensors": list(
                            machine.state.contributing_sensors
                        ),
                    }
                    for room_id, machine in self.machines.items()
                },
            )
        )

    def _get_state(self, entity_id: str) -> MagicMock | None:
        sensor = self.house.sensors.get(entity_id)
        if not sensor:
            return None
        state = MagicMock()
        state.state = sensor.state
        state.attributes = sensor.attributes
        return state

    def _route_sensor_change(self, entity_id: str, state: str) -> None:
        sensor = self.house.sensors.get(entity_id)
        if not sensor:
            return

        event = self._make_event(entity_id, state)
        if sensor.sensor_type == SensorType.MOTION_PIR:
            machine = self.machines.get(sensor.room_id)
            if machine:
                machine._handle_motion_event(event)
        elif sensor.sensor_type == SensorType.PRESENCE_MMWAVE:
            machine = self.machines.get(sensor.room_id)
            if machine:
                machine._handle_presence_event(event)
        elif sensor.sensor_type == SensorType.DOOR_CONTACT:
            for machine in self.machines.values():
                if any(
                    binding.entity_id == entity_id
                    for binding in machine.config.door_sensors
                ):
                    machine._handle_door_event(event)

    @staticmethod
    def _make_event(entity_id: str, state: str) -> MagicMock:
        event = MagicMock()
        event.data = {
            "entity_id": entity_id,
            "new_state": MagicMock(state=state, attributes={}),
        }
        return event
