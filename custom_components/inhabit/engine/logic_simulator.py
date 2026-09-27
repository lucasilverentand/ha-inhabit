"""Deterministic simulator for the real occupancy state machine."""

from __future__ import annotations

from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from types import SimpleNamespace
from typing import Any
from unittest.mock import patch

from homeassistant.const import STATE_OFF, STATE_ON, STATE_UNAVAILABLE

from ..const import DEFAULT_TRANSIT_PHANTOM_HOLD, OccupancyState
from ..fixtures.local_simulator_house import (
    LOCAL_SIMULATOR_ROOM_SPECS,
    LOCAL_SIMULATOR_TRANSIT_ROOM_IDS,
)
from ..models.virtual_sensor import (
    OccupancyStateData,
    SensorBinding,
    VirtualSensorConfig,
)
from ..occupancy_policy import apply_occupancy_profile
from .occupancy_state_machine import OccupancyStateMachine
from .transition_predictor import DoorLink, PhantomPresence, TransitionPredictor


@dataclass(frozen=True)
class LogicRoomSpec:
    """Small room topology spec used by deterministic simulations."""

    id: str
    name: str
    floor: str
    connected_rooms: tuple[str, ...] = ()
    door_sensor_connected_rooms: tuple[str, ...] | None = None
    profile: str = ""
    motion_sensor_count: int = 1
    presence_sensor_count: int = 1
    motion_timeout: int = 120
    checking_timeout: int = 30
    presence_timeout: int = 300
    unsealed_activity_timeout: int | None = None
    is_transit: bool | None = None
    phantom_hold_seconds: int = 0


@dataclass
class _LogicSensor:
    entity_id: str
    sensor_type: str
    room_id: str
    state: str = STATE_OFF
    attributes: dict[str, Any] = field(default_factory=dict)


@dataclass
class _LogicRoom:
    id: str
    name: str
    floor: str
    connected_rooms: tuple[str, ...]
    sensors: list[_LogicSensor] = field(default_factory=list)


@dataclass
class _LogicPerson:
    id: str
    name: str
    current_room: str | None = None


@dataclass
class _ScheduledCallback:
    due_at: datetime
    callback: Callable[[Any], None]
    sequence: int
    cancelled: bool = False


@dataclass
class LogicTimelineEntry:
    """Snapshot of all simulated room states after one action."""

    at_seconds: float
    label: str
    rooms: dict[str, dict[str, Any]]
    lights: dict[str, str]

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-safe timeline entry."""
        return {
            "at_seconds": self.at_seconds,
            "label": self.label,
            "rooms": self.rooms,
            "lights": self.lights,
        }


class _FakeBus:
    def __init__(self) -> None:
        self.events: list[dict[str, Any]] = []

    def async_fire(
        self, event_type: str, event_data: dict[str, Any] | None = None
    ) -> None:
        self.events.append({"event_type": event_type, "data": event_data or {}})


class _FakeStates:
    def __init__(self, house: _LogicHouse) -> None:
        self._house = house

    def get(self, entity_id: str) -> SimpleNamespace | None:
        sensor = self._house.sensors.get(entity_id)
        if sensor is None:
            return None
        return SimpleNamespace(state=sensor.state, attributes=sensor.attributes)


class _FakeHass:
    def __init__(self, house: _LogicHouse) -> None:
        self.bus = _FakeBus()
        self.states = _FakeStates(house)


class _FakeClock:
    """Minimal fake clock for Home Assistant async_call_later callbacks."""

    def __init__(self, start: datetime | None = None) -> None:
        self.now = start or datetime(2026, 1, 1, 12, 0, 0)
        self._sequence = 0
        self._scheduled: list[_ScheduledCallback] = []

    def async_call_later(
        self, _hass: Any, delay: float, callback: Callable[[Any], None]
    ) -> Callable[[], None]:
        """Schedule a callback against fake time."""
        self._sequence += 1
        scheduled = _ScheduledCallback(
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


class _FakeDateTime(datetime):
    _clock: _FakeClock

    @classmethod
    def now(cls, tz: Any = None) -> datetime:
        current = cls._clock.now
        if tz is not None:
            return current.astimezone(tz)
        return current


class _LogicHouse:
    """Small fake house that emits Home Assistant-like state changes."""

    def __init__(self, room_specs: Iterable[LogicRoomSpec]) -> None:
        self.rooms: dict[str, _LogicRoom] = {}
        self.sensors: dict[str, _LogicSensor] = {}
        self.persons: dict[str, _LogicPerson] = {}
        self._state_change_callbacks: list[Callable[[str, str], None]] = []
        self._room_specs_by_id = {spec.id: spec for spec in room_specs}

        for spec in room_specs:
            self._add_room(spec)
        self._add_door_sensors()

    def _add_room(self, spec: LogicRoomSpec) -> None:
        room = _LogicRoom(
            id=spec.id,
            name=spec.name,
            floor=spec.floor,
            connected_rooms=tuple(spec.connected_rooms),
        )
        sensors = [
            _LogicSensor(
                entity_id=f"binary_sensor.{spec.id}_motion",
                sensor_type="motion",
                room_id=spec.id,
                attributes={"device_class": "motion"},
            ),
            _LogicSensor(
                entity_id=f"binary_sensor.{spec.id}_presence",
                sensor_type="presence",
                room_id=spec.id,
                attributes={"device_class": "presence"},
            ),
        ]
        for sensor in sensors:
            room.sensors.append(sensor)
            self.sensors[sensor.entity_id] = sensor
        self.rooms[spec.id] = room

    def _add_door_sensors(self) -> None:
        added_pairs: set[tuple[str, str]] = set()
        for room in self.rooms.values():
            for connected_id in room.connected_rooms:
                if not self._pair_has_door_sensor(room.id, connected_id):
                    continue
                pair = tuple(sorted((room.id, connected_id)))
                if pair in added_pairs:
                    continue
                added_pairs.add(pair)
                sensor = _LogicSensor(
                    entity_id=self.door_entity_id(room.id, connected_id),
                    sensor_type="door",
                    room_id=room.id,
                    attributes={"device_class": "door"},
                )
                self.sensors[sensor.entity_id] = sensor

    def _pair_has_door_sensor(self, room1_id: str, room2_id: str) -> bool:
        for room_id, connected_id in ((room1_id, room2_id), (room2_id, room1_id)):
            spec = self._room_specs_by_id.get(room_id)
            if spec is None:
                continue
            if spec.door_sensor_connected_rooms is None:
                return True
            if connected_id in spec.door_sensor_connected_rooms:
                return True
        return False

    def add_person(self, person_id: str, name: str) -> None:
        self.persons[person_id] = _LogicPerson(person_id, name)

    def on_state_change(
        self, callback: Callable[[str, str], None]
    ) -> Callable[[], None]:
        self._state_change_callbacks.append(callback)
        return lambda: self._state_change_callbacks.remove(callback)

    def set_sensor_state(self, entity_id: str, state: str) -> None:
        sensor = self.sensors.get(entity_id)
        if sensor is None:
            return
        sensor.state = state
        for callback in list(self._state_change_callbacks):
            callback(entity_id, state)

    def door_entity_id(self, room1_id: str, room2_id: str) -> str:
        first, second = sorted((room1_id, room2_id))
        return f"binary_sensor.door_{first}_to_{second}"

    def find_door_sensor(self, room1_id: str, room2_id: str) -> str | None:
        entity_id = self.door_entity_id(room1_id, room2_id)
        return entity_id if entity_id in self.sensors else None


class LogicScenarioSimulator:
    """Scenario simulator wired into the production occupancy state machine."""

    def __init__(
        self,
        room_specs: list[LogicRoomSpec],
        *,
        room_ids: list[str] | None = None,
        enable_transition_predictor: bool = True,
        transit_room_ids: set[str] | None = None,
        profile_by_room: dict[str, str] | None = None,
        phantom_hold_seconds_by_room: dict[str, int] | None = None,
        policy_overrides_by_room: dict[str, dict[str, Any]] | None = None,
    ) -> None:
        self.clock = _FakeClock()
        self._start_time = self.clock.now
        _FakeDateTime._clock = self.clock
        self._patches = [
            patch(
                "custom_components.inhabit.engine.occupancy_state_machine.async_call_later",
                self.clock.async_call_later,
            ),
            patch(
                "custom_components.inhabit.engine.occupancy_state_machine.datetime",
                _FakeDateTime,
            ),
            patch(
                "custom_components.inhabit.engine.presence_aggregator.datetime",
                _FakeDateTime,
            ),
            patch(
                "custom_components.inhabit.engine.transition_predictor.async_call_later",
                self.clock.async_call_later,
            ),
            patch(
                "custom_components.inhabit.engine.transition_predictor.datetime",
                _FakeDateTime,
            ),
        ]
        for active_patch in self._patches:
            active_patch.start()

        self.house = _LogicHouse(room_specs)
        self.hass = _FakeHass(self.house)
        self._room_specs_by_id = {spec.id: spec for spec in room_specs}
        self.room_ids = room_ids or list(self.house.rooms)
        self.transit_room_ids = transit_room_ids or set()
        self.profile_by_room = profile_by_room or {}
        self.phantom_hold_seconds_by_room = phantom_hold_seconds_by_room or {}
        self.policy_overrides_by_room = policy_overrides_by_room or {}
        self.configs: dict[str, VirtualSensorConfig] = {}
        self.machines: dict[str, OccupancyStateMachine] = {}
        self.transitions: list[dict[str, Any]] = []
        self.timeline: list[LogicTimelineEntry] = []
        self.light_states: dict[str, str] = dict.fromkeys(self.room_ids, STATE_OFF)
        self._spatial_sources_by_room: dict[str, set[str]] = {}
        self._transition_prediction_ready = True

        self.house.on_state_change(self._route_sensor_change)
        for room_id in self.room_ids:
            self.configs[room_id] = self._make_config(room_id)

        self.transition_predictor: TransitionPredictor | None = None
        if enable_transition_predictor:
            self.transition_predictor = TransitionPredictor(
                self.hass,  # type: ignore[arg-type]
                self._make_predictor_store(),
                set_room_occupied=self._set_room_occupied,
                on_phantom_expired=self._handle_phantom_expired,
            )
            self.transition_predictor._running = True
            self.transition_predictor.refresh_topology()
            self._install_fake_door_links()

        for room_id in self.room_ids:
            self.machines[room_id] = OccupancyStateMachine(
                self.hass,  # type: ignore[arg-type]
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
    def local_home(
        cls,
        *,
        policy_overrides_by_room: dict[str, dict[str, Any]] | None = None,
    ) -> LogicScenarioSimulator:
        """Create the anonymized local-home simulator topology."""
        specs = [
            LogicRoomSpec(
                id=spec.id,
                name=spec.name,
                floor=spec.floor,
                connected_rooms=tuple(spec.connected_rooms),
                door_sensor_connected_rooms=tuple(spec.door_sensor_connected_rooms),
                profile=spec.profile,
                motion_sensor_count=spec.motion_sensor_count,
                presence_sensor_count=spec.presence_sensor_count,
                motion_timeout=spec.motion_timeout,
                checking_timeout=spec.checking_timeout,
                presence_timeout=spec.presence_timeout,
                unsealed_activity_timeout=spec.unsealed_activity_timeout,
                is_transit=spec.is_transit,
                phantom_hold_seconds=spec.phantom_hold_seconds,
            )
            for spec in LOCAL_SIMULATOR_ROOM_SPECS
        ]
        profile_by_room = {spec.id: spec.profile for spec in LOCAL_SIMULATOR_ROOM_SPECS}
        phantom_hold_seconds_by_room = {
            spec.id: spec.phantom_hold_seconds or DEFAULT_TRANSIT_PHANTOM_HOLD
            for spec in LOCAL_SIMULATOR_ROOM_SPECS
            if spec.id in LOCAL_SIMULATOR_TRANSIT_ROOM_IDS
        }
        return cls(
            specs,
            enable_transition_predictor=True,
            transit_room_ids=set(LOCAL_SIMULATOR_TRANSIT_ROOM_IDS),
            profile_by_room=profile_by_room,
            phantom_hold_seconds_by_room=phantom_hold_seconds_by_room,
            policy_overrides_by_room=policy_overrides_by_room,
        )

    def close(self) -> None:
        """Stop global patches owned by this simulator."""
        for active_patch in reversed(self._patches):
            active_patch.stop()

    def __enter__(self) -> LogicScenarioSimulator:
        return self

    def __exit__(self, *_args: Any) -> None:
        self.close()

    @property
    def elapsed_seconds(self) -> float:
        """Seconds elapsed since the scenario started."""
        return (self.clock.now - self._start_time).total_seconds()

    def run_actions(self, actions: list[dict[str, Any]]) -> dict[str, Any]:
        """Run serializable scenario actions and return snapshots plus transitions."""
        errors: list[dict[str, Any]] = []
        expectations: list[dict[str, Any]] = []
        action_timeline: list[dict[str, int]] = []
        for index, action in enumerate(actions):
            start_timeline_index = len(self.timeline)
            try:
                expectation = self.run_action(action)
                if expectation is not None:
                    expectations.append({"index": index, **expectation})
                action_timeline.append(
                    {
                        "index": index,
                        "start_timeline_index": start_timeline_index,
                        "end_timeline_index": max(
                            start_timeline_index, len(self.timeline) - 1
                        ),
                    }
                )
            except Exception as err:  # noqa: BLE001 - surfaced in simulator output
                errors.append(
                    {
                        "index": index,
                        "action": action,
                        "error": str(err),
                    }
                )
                self.record(f"error action {index}: {err}")
                break
        return {
            "ok": not errors and all(item["passed"] for item in expectations),
            "errors": errors,
            "expectations": expectations,
            "action_timeline": action_timeline,
            "timeline": [entry.to_dict() for entry in self.timeline],
            "transitions": self.transitions,
            "final": self.snapshot(),
            "final_lights": self.light_snapshot(),
        }

    def run_action(self, action: dict[str, Any]) -> dict[str, Any] | None:
        """Run one serializable action."""
        action_type = action.get("type")
        if action_type == "add_person":
            self.add_person(
                action.get("person_id", "person"), action.get("name", "Person")
            )
        elif action_type == "enter_room":
            self.enter_room(
                action.get("person_id", "person"),
                self._require_room(action),
                pir=bool(action.get("pir", True)),
                mmwave=bool(action.get("mmwave", True)),
                spatial_targets=int(action.get("spatial_targets", 1)),
            )
        elif action_type == "clear_room":
            self.clear_room(self._require_room(action))
        elif action_type == "set_pir":
            self.set_pir(self._require_room(action), bool(action.get("active", True)))
            self.record(f"pir {action['room_id']}={bool(action.get('active', True))}")
        elif action_type == "clear_pir":
            self.set_pir(self._require_room(action), False)
            self.record(f"pir clear {action['room_id']}")
        elif action_type == "set_mmwave":
            self.set_mmwave(
                self._require_room(action),
                bool(action.get("active", True)),
                spatial_targets=action.get("spatial_targets"),
            )
            self.record(
                f"mmwave {action['room_id']}={bool(action.get('active', True))}"
            )
        elif action_type == "spatial_targets":
            self.set_spatial_targets(
                self._require_room(action),
                int(action.get("count", 0)),
                source=action.get("source", "scenario"),
            )
        elif action_type == "open_door":
            self.open_door(
                self._require_room(action, "room1_id"),
                self._require_room(action, "room2_id"),
            )
        elif action_type == "close_door":
            self.close_door(
                self._require_room(action, "room1_id"),
                self._require_room(action, "room2_id"),
            )
        elif action_type == "door_snapshot":
            self.set_door_snapshot(
                self._require_room(action, "room1_id"),
                self._require_room(action, "room2_id"),
                open=bool(action.get("open", False)),
            )
        elif action_type == "door_unavailable":
            self.set_door_state(
                self._require_room(action, "room1_id"),
                self._require_room(action, "room2_id"),
                STATE_UNAVAILABLE,
            )
        elif action_type == "override_room":
            self.override_room(
                self._require_room(action),
                action.get("state", OccupancyState.OCCUPIED),
            )
        elif action_type == "set_light":
            self.set_light(
                self._require_room(action),
                bool(action.get("active", True)),
            )
        elif action_type == "wait":
            self.wait(float(action.get("seconds", 0)))
        elif action_type == "recalculate":
            self.recalculate_all(action.get("reason", "scenario refresh"))
        elif action_type == "expect_room":
            return self.expect_room(
                self._require_room(action),
                action.get("state", OccupancyState.OCCUPIED),
                sealed=action.get("sealed"),
            )
        elif action_type == "expect_light":
            return self.expect_light(
                self._require_room(action),
                action.get("state", STATE_ON),
            )
        elif action_type == "note":
            self.record(str(action.get("label", "note")))
        else:
            raise ValueError(f"unsupported action type: {action_type!r}")
        return None

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
        if person_id not in self.house.persons:
            self.house.add_person(person_id, person_id)
        self.house.persons[person_id].current_room = room_id
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
        self.house.set_sensor_state(
            f"binary_sensor.{room_id}_motion", STATE_ON if active else STATE_OFF
        )

    def set_mmwave(
        self, room_id: str, active: bool, *, spatial_targets: int | None = None
    ) -> None:
        """Set a room mmWave binary presence sensor and optional target count."""
        self.house.set_sensor_state(
            f"binary_sensor.{room_id}_presence", STATE_ON if active else STATE_OFF
        )
        if spatial_targets is not None:
            self.set_spatial_targets(room_id, int(spatial_targets))

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
        self.set_door_state(room1_id, room2_id, STATE_ON)
        self.record(f"open {room1_id}<->{room2_id}")

    def close_door(self, room1_id: str, room2_id: str) -> None:
        """Close the door between two rooms."""
        self.set_door_state(room1_id, room2_id, STATE_OFF)
        self.record(f"close {room1_id}<->{room2_id}")

    def set_door_state(self, room1_id: str, room2_id: str, state: str) -> None:
        """Set a door state and fire the matching door event."""
        door_id = self.house.find_door_sensor(room1_id, room2_id)
        if door_id is None:
            raise ValueError(f"no door sensor for {room1_id}<->{room2_id}")
        self.house.set_sensor_state(door_id, state)

    def set_door_snapshot(self, room1_id: str, room2_id: str, *, open: bool) -> None:
        """Set a door state without firing events, as if HA restored it."""
        door_id = self.house.find_door_sensor(room1_id, room2_id)
        if door_id is None:
            raise ValueError(f"no door sensor for {room1_id}<->{room2_id}")
        self.house.sensors[door_id].state = STATE_ON if open else STATE_OFF
        self.record(f"snapshot door {room1_id}<->{room2_id}")

    def override_room(self, room_id: str, state: str = OccupancyState.OCCUPIED) -> None:
        """Apply a manual occupancy override to a simulated room."""
        self.machines[room_id].set_state(state, "manual override")
        self.record(f"override {room_id}={state}")

    def set_light(self, room_id: str, active: bool) -> None:
        """Record observed room light state for simulator diagnostics."""
        self.light_states[room_id] = STATE_ON if active else STATE_OFF
        self.record(f"light {room_id}={active}")

    def wait(self, seconds: float) -> None:
        """Advance fake time and process due timers."""
        self.clock.advance(seconds)
        self.record(f"wait {seconds:g}s")

    def recalculate_all(self, reason: str = "scenario refresh") -> None:
        """Ask every room state machine to re-read current sensor snapshots."""
        self._transition_prediction_ready = False
        for machine in self.machines.values():
            machine.recalculate_from_current_state(reason)
        if self.transition_predictor:
            self.transition_predictor.clear_phantoms()
            for room_id, machine in self.machines.items():
                self.transition_predictor.sync_room_state(
                    room_id,
                    machine.state.state,
                    suppress_next_forward_prediction=True,
                )
        self._transition_prediction_ready = True
        self.record(reason)

    def expect_room(
        self, room_id: str, expected_state: str, *, sealed: bool | None = None
    ) -> dict[str, Any]:
        """Record a state expectation without raising."""
        state = self.machines[room_id].state
        passed = state.state == expected_state and (
            sealed is None or state.sealed is sealed
        )
        result = {
            "kind": "occupancy",
            "room_id": room_id,
            "expected_state": expected_state,
            "actual_state": state.state,
            "expected_sealed": sealed,
            "actual_sealed": state.sealed,
            "passed": passed,
            "at_seconds": self.elapsed_seconds,
        }
        self.record(
            f"expect {room_id}={expected_state}"
            + ("" if sealed is None else f" sealed={sealed}")
        )
        return result

    def expect_light(self, room_id: str, expected_state: str) -> dict[str, Any]:
        """Record a light-state expectation without raising."""
        normalized_expected = STATE_ON if expected_state in {True, STATE_ON, "true"} else STATE_OFF
        actual_state = self.light_states.get(room_id, STATE_OFF)
        result = {
            "kind": "light",
            "room_id": room_id,
            "expected_state": normalized_expected,
            "actual_state": actual_state,
            "expected_sealed": None,
            "actual_sealed": None,
            "passed": actual_state == normalized_expected,
            "at_seconds": self.elapsed_seconds,
        }
        self.record(f"expect light {room_id}={normalized_expected}")
        return result

    def snapshot(self) -> dict[str, dict[str, Any]]:
        """Return a compact state snapshot for every room."""
        return {
            room_id: {
                "state": machine.state.state,
                "sealed": machine.state.sealed,
                "confidence": machine.state.confidence,
                "contributing_sensors": list(machine.state.contributing_sensors),
                "motion_active": self.house.sensors[
                    f"binary_sensor.{room_id}_motion"
                ].state
                == STATE_ON,
                "presence_active": self.house.sensors[
                    f"binary_sensor.{room_id}_presence"
                ].state
                == STATE_ON,
                "spatial_presence_active": bool(
                    self._spatial_sources_by_room.get(room_id)
                ),
                "spatial_presence_sources": sorted(
                    self._spatial_sources_by_room.get(room_id, set())
                ),
                "post_close_hold_active": machine._post_close_hold_until is not None,
                "checking_active": machine._checking_timer is not None,
            }
            for room_id, machine in self.machines.items()
        }

    def light_snapshot(self) -> dict[str, str]:
        """Return the simulated light state for every room."""
        return dict(self.light_states)

    def record(self, label: str) -> None:
        """Record a compact state snapshot for debugging scenarios."""
        self.timeline.append(
            LogicTimelineEntry(
                at_seconds=self.elapsed_seconds,
                label=label,
                rooms=self.snapshot(),
                lights=self.light_snapshot(),
            )
        )

    def _make_config(self, room_id: str) -> VirtualSensorConfig:
        spec = self._room_specs_by_id[room_id]
        door_sensors = [
            SensorBinding(
                entity_id=self.house.door_entity_id(room_id, connected_id),
                sensor_type="door",
                weight=1.0,
            )
            for connected_id in (spec.door_sensor_connected_rooms or ())
            if self.house.find_door_sensor(room_id, connected_id)
        ]
        config = VirtualSensorConfig(
            room_id=room_id,
            floor_plan_id="logic_simulator",
            enabled=True,
            occupancy_profile=self.profile_by_room.get(room_id, spec.profile),
            policy_overrides=self.policy_overrides_by_room.get(room_id, {}),
            motion_timeout=spec.motion_timeout,
            checking_timeout=spec.checking_timeout,
            presence_timeout=spec.presence_timeout,
            unsealed_activity_timeout=spec.unsealed_activity_timeout or 120,
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
        if config.occupancy_profile:
            apply_occupancy_profile(config, config.occupancy_profile)
        config.motion_timeout = spec.motion_timeout
        config.checking_timeout = spec.checking_timeout
        config.presence_timeout = spec.presence_timeout
        if spec.unsealed_activity_timeout is not None:
            config.unsealed_activity_timeout = spec.unsealed_activity_timeout
        if spec.phantom_hold_seconds:
            config.phantom_hold_seconds = spec.phantom_hold_seconds
        config.door_sensors = door_sensors
        return config

    def _make_predictor_store(self) -> SimpleNamespace:
        rooms = []
        for room_id in self.room_ids:
            spec = self._room_specs_by_id[room_id]
            rooms.append(
                SimpleNamespace(
                    id=room_id,
                    connected_rooms=list(spec.connected_rooms),
                    is_transit=True if room_id in self.transit_room_ids else None,
                    long_stay=False,
                    phantom_hold_seconds=self.phantom_hold_seconds_by_room.get(
                        room_id, 0
                    ),
                    polygon=None,
                )
            )
        floor = SimpleNamespace(rooms=rooms, zones=[], nodes=[], edges=[])
        floor_plan = SimpleNamespace(floors=[floor])
        return SimpleNamespace(
            get_floor_plans=lambda: [floor_plan],
            get_sensor_config=lambda room_id: self.configs.get(room_id),
        )

    def _install_fake_door_links(self) -> None:
        if not self.transition_predictor:
            return
        added_pairs: set[tuple[str, str]] = set()
        for room in self.house.rooms.values():
            for connected_id in room.connected_rooms:
                pair = tuple(sorted((room.id, connected_id)))
                if pair in added_pairs:
                    continue
                added_pairs.add(pair)
                door_id = self.house.find_door_sensor(room.id, connected_id)
                if door_id is None:
                    continue
                link = DoorLink(
                    door_edge_id=f"logic_{pair[0]}_{pair[1]}",
                    entity_id=door_id,
                    room_a=room.id,
                    room_b=connected_id,
                )
                self.transition_predictor._door_links[door_id] = link
                self.transition_predictor._all_door_links[link.door_edge_id] = link

    def _set_room_occupied(self, room_id: str, reason: str) -> None:
        machine = self.machines.get(room_id)
        if machine and machine.state.state == OccupancyState.VACANT:
            machine.set_state(OccupancyState.OCCUPIED, reason)

    def _handle_phantom_expired(self, room_id: str, _phantom: PhantomPresence) -> None:
        machine = self.machines.get(room_id)
        if machine:
            machine.recalculate_from_current_state("phantom expired")

    def _make_state_callback(
        self, room_id: str
    ) -> Callable[[OccupancyStateData, str], None]:
        def on_change(state: OccupancyStateData, reason: str = "") -> None:
            if self.transition_predictor and self._transition_prediction_ready:
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

    def _route_sensor_change(self, entity_id: str, state: str) -> None:
        sensor = self.house.sensors.get(entity_id)
        if sensor is None:
            return
        event = SimpleNamespace(
            data={
                "entity_id": entity_id,
                "new_state": SimpleNamespace(state=state, attributes=sensor.attributes),
            }
        )
        if sensor.sensor_type == "motion":
            machine = self.machines.get(sensor.room_id)
            if machine:
                machine._handle_motion_event(event)
        elif sensor.sensor_type == "presence":
            machine = self.machines.get(sensor.room_id)
            if machine:
                machine._handle_presence_event(event)
        elif sensor.sensor_type == "door":
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

    def _require_room(self, action: dict[str, Any], key: str = "room_id") -> str:
        room_id = action.get(key)
        if not isinstance(room_id, str) or room_id not in self.machines:
            raise ValueError(f"unknown {key}: {room_id!r}")
        return room_id


LOGIC_SIMULATOR_PRESETS: dict[str, dict[str, Any]] = {
    "door_left_open_shower_then_close": {
        "label": "Door left open, occupied for a while, then closed",
        "actions": [
            {"type": "add_person", "person_id": "subject", "name": "Subject"},
            {"type": "open_door", "room1_id": "transit_hall", "room2_id": "short_stay"},
            {
                "type": "enter_room",
                "person_id": "subject",
                "room_id": "short_stay",
                "pir": True,
                "mmwave": True,
                "spatial_targets": 1,
            },
            {"type": "clear_pir", "room_id": "short_stay"},
            {"type": "wait", "seconds": 240},
            {
                "type": "close_door",
                "room1_id": "transit_hall",
                "room2_id": "short_stay",
            },
            {
                "type": "expect_room",
                "room_id": "short_stay",
                "state": OccupancyState.OCCUPIED,
                "sealed": False,
            },
            {"type": "wait", "seconds": 14},
            {
                "type": "expect_room",
                "room_id": "short_stay",
                "state": OccupancyState.OCCUPIED,
                "sealed": False,
            },
            {
                "type": "spatial_targets",
                "room_id": "short_stay",
                "count": 1,
                "source": "post_close_mmwave",
            },
            {
                "type": "expect_room",
                "room_id": "short_stay",
                "state": OccupancyState.OCCUPIED,
                "sealed": True,
            },
        ],
    },
    "hallway_to_closed_short_stay_and_back": {
        "label": "Transit hall to short-stay room and back",
        "actions": [
            {"type": "add_person", "person_id": "subject", "name": "Subject"},
            {
                "type": "enter_room",
                "person_id": "subject",
                "room_id": "transit_hall",
                "spatial_targets": 1,
            },
            {"type": "open_door", "room1_id": "transit_hall", "room2_id": "short_stay"},
            {
                "type": "enter_room",
                "person_id": "subject",
                "room_id": "short_stay",
                "spatial_targets": 1,
            },
            {"type": "clear_room", "room_id": "transit_hall"},
            {"type": "wait", "seconds": 90},
            {
                "type": "close_door",
                "room1_id": "transit_hall",
                "room2_id": "short_stay",
            },
            {"type": "clear_pir", "room_id": "short_stay"},
            {
                "type": "spatial_targets",
                "room_id": "short_stay",
                "count": 1,
                "source": "post_close_mmwave",
            },
            {
                "type": "expect_room",
                "room_id": "short_stay",
                "state": OccupancyState.OCCUPIED,
                "sealed": True,
            },
            {"type": "open_door", "room1_id": "transit_hall", "room2_id": "short_stay"},
            {
                "type": "enter_room",
                "person_id": "subject",
                "room_id": "transit_hall",
                "spatial_targets": 1,
            },
            {"type": "clear_room", "room_id": "short_stay"},
            {"type": "wait", "seconds": 45},
            {
                "type": "expect_room",
                "room_id": "short_stay",
                "state": OccupancyState.VACANT,
            },
        ],
    },
}


def logic_simulator_presets_payload() -> dict[str, Any]:
    """Return available scenario presets."""
    return {"presets": LOGIC_SIMULATOR_PRESETS, "topology": logic_simulator_topology()}


def logic_simulator_topology() -> dict[str, Any]:
    """Return the anonymized local-home topology used by the simulator."""
    rooms = [
        {
            "id": spec.id,
            "name": spec.name,
            "profile": spec.profile,
            "aliases": list(spec.aliases),
            "connected_rooms": list(spec.connected_rooms),
            "door_sensor_connected_rooms": list(spec.door_sensor_connected_rooms),
            "is_transit": spec.id in LOCAL_SIMULATOR_TRANSIT_ROOM_IDS,
        }
        for spec in LOCAL_SIMULATOR_ROOM_SPECS
    ]
    room_by_id = {room["id"]: room for room in rooms}
    doors: list[dict[str, Any]] = []
    added_pairs: set[tuple[str, str]] = set()
    for spec in LOCAL_SIMULATOR_ROOM_SPECS:
        for connected_id in spec.door_sensor_connected_rooms:
            if connected_id not in room_by_id:
                continue
            pair = tuple(sorted((spec.id, connected_id)))
            if pair in added_pairs:
                continue
            added_pairs.add(pair)
            doors.append(
                {
                    "id": f"{pair[0]}__{pair[1]}",
                    "room1_id": pair[0],
                    "room2_id": pair[1],
                    "label": (
                        f"{room_by_id[pair[0]]['name']} - "
                        f"{room_by_id[pair[1]]['name']}"
                    ),
                }
            )
    return {"rooms": rooms, "doors": doors}


def run_logic_simulation(
    actions: list[dict[str, Any]],
    *,
    policy_overrides_by_room: dict[str, dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Run a deterministic local-home state-machine scenario."""
    with LogicScenarioSimulator.local_home(
        policy_overrides_by_room=policy_overrides_by_room
    ) as simulator:
        return simulator.run_actions(actions)
