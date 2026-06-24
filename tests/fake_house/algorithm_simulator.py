"""Deterministic simulator that drives the real occupancy algorithm."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any
from unittest.mock import MagicMock, patch

from homeassistant.const import STATE_OFF, STATE_ON

from custom_components.inhabit.const import DEFAULT_TRANSIT_PHANTOM_HOLD, OccupancyState
from custom_components.inhabit.engine.occupancy_state_machine import (
    OccupancyStateMachine,
)
from custom_components.inhabit.engine.transition_predictor import (
    PhantomPresence,
    TransitionPredictor,
)
from custom_components.inhabit.models.virtual_sensor import (
    OccupancyStateData,
    SensorBinding,
    VirtualSensorConfig,
)
from custom_components.inhabit.occupancy_policy import (
    PROFILE_LONG_STAY,
    PROFILE_OPEN_AREA,
    PROFILE_SHORT_STAY,
    PROFILE_SLEEP,
    PROFILE_TRANSIT,
    PROFILE_UTILITY,
    apply_occupancy_profile,
)

from .house_simulator import FakeHouseSimulator, FakeRoomSpec, SensorType


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
        room_specs: list[FakeRoomSpec] | None = None,
        enable_transition_predictor: bool = False,
        transit_room_ids: set[str] | None = None,
        presence_room_ids: set[str] | None = None,
        phantom_hold_seconds_by_room: dict[str, int] | None = None,
        profile_by_room: dict[str, str] | None = None,
        policy_overrides_by_room: dict[str, dict[str, Any]] | None = None,
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
            patch(
                "custom_components.inhabit.engine.transition_predictor.async_call_later",
                self.clock.async_call_later,
            ),
            patch(
                "custom_components.inhabit.engine.transition_predictor.datetime",
                self._fake_datetime,
            ),
        ]
        for active_patch in self._patches:
            active_patch.start()

        self.hass = MagicMock()
        self.hass.bus.async_fire = MagicMock()
        self.house = FakeHouseSimulator(self.hass, room_specs=room_specs)
        self.hass.states.get.side_effect = self._get_state

        self.room_ids = room_ids or list(self.house.rooms)
        self.transit_room_ids = transit_room_ids or set()
        self.presence_room_ids = presence_room_ids
        self.phantom_hold_seconds_by_room = phantom_hold_seconds_by_room or {}
        self.profile_by_room = profile_by_room or {}
        self.policy_overrides_by_room = policy_overrides_by_room or {}
        self.configs: dict[str, VirtualSensorConfig] = {}
        self.machines: dict[str, OccupancyStateMachine] = {}
        self.transitions: list[dict[str, Any]] = []
        self.timeline: list[TimelineEntry] = []
        self._spatial_sources_by_room: dict[str, set[str]] = {}
        self.house.on_state_change(self._route_sensor_change)

        for room_id in self.room_ids:
            self.configs[room_id] = self._make_config(
                room_id,
                unsealed_activity_timeout=unsealed_activity_timeout,
                motion_timeout=motion_timeout,
                checking_timeout=checking_timeout,
                presence_timeout=presence_timeout,
            )

        self.transition_predictor: TransitionPredictor | None = None
        if enable_transition_predictor:
            self.transition_predictor = TransitionPredictor(
                self.hass,
                self._make_predictor_store(),
                set_room_occupied=self._set_room_occupied,
                on_phantom_expired=self._handle_phantom_expired,
            )
            self.transition_predictor._running = True
            self.transition_predictor.refresh_topology()

        for room_id in self.room_ids:
            self.machines[room_id] = OccupancyStateMachine(
                self.hass,
                self.configs[room_id],
                self._make_state_callback(room_id),
                has_phantom_hold=(
                    self.transition_predictor.has_active_phantom
                    if self.transition_predictor
                    else None
                ),
            )
        self.record("initial")

    @classmethod
    def anonymized_transit_home(cls) -> AlgorithmScenarioSimulator:
        """Create a neutral topology that mirrors the transit-hallway logic."""
        room_specs = [
            FakeRoomSpec(
                "transit_core",
                "Transit Core",
                "level_0",
                [
                    "zone_alpha",
                    "zone_beta",
                    "zone_gamma",
                    "zone_delta",
                    "zone_epsilon",
                ],
            ),
            FakeRoomSpec("zone_alpha", "Zone Alpha", "level_0", ["transit_core"]),
            FakeRoomSpec("zone_beta", "Zone Beta", "level_0", ["transit_core"]),
            FakeRoomSpec("zone_gamma", "Zone Gamma", "level_0", ["transit_core"]),
            FakeRoomSpec("zone_delta", "Zone Delta", "level_0", ["transit_core"]),
            FakeRoomSpec(
                "zone_epsilon",
                "Zone Epsilon",
                "level_0",
                ["transit_core", "zone_zeta"],
            ),
            FakeRoomSpec("zone_zeta", "Zone Zeta", "level_0", ["zone_epsilon"]),
        ]
        return cls(
            room_ids=[spec.id for spec in room_specs],
            room_specs=room_specs,
            enable_transition_predictor=True,
            transit_room_ids={"transit_core"},
            presence_room_ids={"zone_alpha", "zone_epsilon"},
            phantom_hold_seconds_by_room={"transit_core": DEFAULT_TRANSIT_PHANTOM_HOLD},
            motion_timeout=45,
            checking_timeout=15,
            unsealed_activity_timeout=120,
        )

    @classmethod
    def anonymized_local_home(
        cls,
        *,
        policy_overrides_by_room: dict[str, dict[str, Any]] | None = None,
    ) -> AlgorithmScenarioSimulator:
        """Create a neutral multi-area topology for local house-level testing."""
        room_specs = [
            FakeRoomSpec(
                "level0_entry",
                "Entry Node",
                "level_0",
                ["level0_transit"],
            ),
            FakeRoomSpec(
                "level0_transit",
                "Transit Core",
                "level_0",
                [
                    "level0_entry",
                    "level0_open_area",
                    "level0_cooking",
                    "level0_short_stay",
                    "level0_utility",
                    "vertical_link",
                ],
            ),
            FakeRoomSpec(
                "level0_open_area",
                "Open Area Alpha",
                "level_0",
                ["level0_transit", "level0_cooking"],
            ),
            FakeRoomSpec(
                "level0_cooking",
                "Open Area Beta",
                "level_0",
                ["level0_transit", "level0_open_area"],
            ),
            FakeRoomSpec(
                "level0_short_stay",
                "Short Stay Alpha",
                "level_0",
                ["level0_transit"],
            ),
            FakeRoomSpec(
                "level0_utility",
                "Utility Alpha",
                "level_0",
                ["level0_transit"],
            ),
            FakeRoomSpec(
                "vertical_link",
                "Vertical Link",
                "level_0",
                ["level0_transit", "level1_transit"],
            ),
            FakeRoomSpec(
                "level1_transit",
                "Transit Upper",
                "level_1",
                [
                    "vertical_link",
                    "level1_sleep_primary",
                    "level1_sleep_secondary",
                    "level1_short_stay",
                    "level1_wash",
                ],
            ),
            FakeRoomSpec(
                "level1_sleep_primary",
                "Sleep Zone Alpha",
                "level_1",
                ["level1_transit"],
            ),
            FakeRoomSpec(
                "level1_sleep_secondary",
                "Sleep Zone Beta",
                "level_1",
                ["level1_transit"],
            ),
            FakeRoomSpec(
                "level1_short_stay",
                "Short Stay Beta",
                "level_1",
                ["level1_transit"],
            ),
            FakeRoomSpec(
                "level1_wash",
                "Wash Zone Alpha",
                "level_1",
                ["level1_transit"],
            ),
        ]
        profile_by_room = {
            "level0_entry": PROFILE_TRANSIT,
            "level0_transit": PROFILE_TRANSIT,
            "level0_open_area": PROFILE_LONG_STAY,
            "level0_cooking": PROFILE_OPEN_AREA,
            "level0_short_stay": PROFILE_SHORT_STAY,
            "level0_utility": PROFILE_UTILITY,
            "vertical_link": PROFILE_TRANSIT,
            "level1_transit": PROFILE_TRANSIT,
            "level1_sleep_primary": PROFILE_SLEEP,
            "level1_sleep_secondary": PROFILE_SLEEP,
            "level1_short_stay": PROFILE_SHORT_STAY,
            "level1_wash": PROFILE_SHORT_STAY,
        }
        return cls(
            room_ids=[spec.id for spec in room_specs],
            room_specs=room_specs,
            enable_transition_predictor=True,
            transit_room_ids={
                "level0_entry",
                "level0_transit",
                "vertical_link",
                "level1_transit",
            },
            presence_room_ids={spec.id for spec in room_specs},
            phantom_hold_seconds_by_room={
                "level0_entry": DEFAULT_TRANSIT_PHANTOM_HOLD,
                "level0_transit": DEFAULT_TRANSIT_PHANTOM_HOLD,
                "vertical_link": DEFAULT_TRANSIT_PHANTOM_HOLD,
                "level1_transit": DEFAULT_TRANSIT_PHANTOM_HOLD,
            },
            profile_by_room=profile_by_room,
            policy_overrides_by_room=policy_overrides_by_room,
        )

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

        presence_sensors = []
        if self.presence_room_ids is None or room_id in self.presence_room_ids:
            presence_sensors.append(
                SensorBinding(
                    entity_id=f"binary_sensor.{room_id}_presence",
                    sensor_type="presence",
                    weight=1.5,
                )
            )

        config = VirtualSensorConfig(
            room_id=room_id,
            floor_plan_id="algorithm_simulator",
            enabled=True,
            occupancy_profile=self.profile_by_room.get(room_id, ""),
            policy_overrides=self.policy_overrides_by_room.get(room_id, {}),
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
            presence_sensors=presence_sensors,
            door_sensors=door_sensors,
            door_seals_room=True,
            door_blocks_vacancy=True,
            door_open_resets_checking=True,
        )
        if room_id in self.profile_by_room:
            apply_occupancy_profile(config)
        return config

    def _make_predictor_store(self) -> MagicMock:
        """Create a minimal FloorPlanStore facade for the real predictor."""
        rooms = []
        for room_id in self.room_ids:
            source = self.house.rooms[room_id]
            room = MagicMock()
            room.id = room_id
            room.connected_rooms = list(source.connected_rooms)
            room.is_transit = True if room_id in self.transit_room_ids else None
            room.long_stay = False
            room.phantom_hold_seconds = self.phantom_hold_seconds_by_room.get(
                room_id, 0
            )
            room.polygon = None
            rooms.append(room)

        floor = MagicMock()
        floor.rooms = rooms
        floor.zones = []
        floor.nodes = []
        floor.edges = []

        floor_plan = MagicMock()
        floor_plan.floors = [floor]

        store = MagicMock()
        store.get_floor_plans.return_value = [floor_plan]
        store.get_sensor_config.side_effect = lambda room_id: self.configs.get(room_id)
        return store

    def _set_room_occupied(self, room_id: str, reason: str) -> None:
        """Push a simulated room to occupied from the transition predictor."""
        machine = self.machines.get(room_id)
        if machine and machine.state.state == OccupancyState.VACANT:
            machine.set_state(OccupancyState.OCCUPIED, reason)

    def _handle_phantom_expired(self, room_id: str, _phantom: PhantomPresence) -> None:
        """Re-evaluate simulated occupancy after a phantom naturally expires."""
        machine = self.machines.get(room_id)
        if machine:
            machine.recalculate_from_current_state("phantom expired")

    def _make_state_callback(
        self, room_id: str
    ) -> Callable[[OccupancyStateData, str], None]:
        def on_change(state: OccupancyStateData, reason: str = "") -> None:
            if self.transition_predictor:
                self.transition_predictor.on_room_state_changed(
                    room_id=room_id,
                    old_state=state.previous_state or OccupancyState.VACANT,
                    new_state=state.state,
                    confidence=state.confidence,
                )
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
        for source in list(self._spatial_sources_by_room.get(room_id, set())):
            self.set_spatial_targets(room_id, 0, source=source)
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
        sources = self._spatial_sources_by_room.setdefault(room_id, set())
        if target_count > 0:
            sources.add(source)
        else:
            sources.discard(source)
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

    def override_room(self, room_id: str, state: str = OccupancyState.OCCUPIED) -> None:
        """Apply a manual occupancy override to a simulated room."""
        self.machines[room_id].set_state(state, "manual override")
        self.record(f"override {room_id}={state}")

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
            if self.transition_predictor:
                self.transition_predictor.on_door_event(
                    entity_id, is_open=state == STATE_ON
                )

    @staticmethod
    def _make_event(entity_id: str, state: str) -> MagicMock:
        event = MagicMock()
        event.data = {
            "entity_id": entity_id,
            "new_state": MagicMock(state=state, attributes={}),
        }
        return event
