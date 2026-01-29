"""Fake house simulator for testing occupancy scenarios."""
from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Callable
from unittest.mock import MagicMock

from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import HomeAssistant


class SensorType(Enum):
    """Types of sensors in the fake house."""

    MOTION_PIR = "motion_pir"
    MOTION_MMWAVE = "motion_mmwave"
    PRESENCE_MMWAVE = "presence_mmwave"
    DOOR_CONTACT = "door_contact"
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"


@dataclass
class FakeSensor:
    """Fake sensor in the house."""

    entity_id: str
    sensor_type: SensorType
    room_id: str
    state: str = STATE_OFF
    attributes: dict[str, Any] = field(default_factory=dict)


@dataclass
class FakeRoom:
    """Fake room in the house."""

    id: str
    name: str
    floor: str
    sensors: list[FakeSensor] = field(default_factory=list)
    connected_rooms: list[str] = field(default_factory=list)


@dataclass
class FakePerson:
    """Fake person moving through the house."""

    id: str
    name: str
    current_room: str | None = None


class FakeHouseSimulator:
    """
    Simulates a multi-floor house with sensors for testing.

    House layout:
    - Basement: Utility room, Garage
    - Ground Floor: Living room, Kitchen, Hallway, Bathroom
    - First Floor: 2 Bedrooms, Bathroom, Hallway

    Each room has:
    - Temperature sensor
    - Humidity sensor
    - Motion sensor (PIR)
    - mmWave presence sensor

    Doors have contact sensors connecting rooms.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the simulator."""
        self.hass = hass
        self.rooms: dict[str, FakeRoom] = {}
        self.sensors: dict[str, FakeSensor] = {}
        self.persons: dict[str, FakePerson] = {}
        self._state_change_callbacks: list[Callable] = []
        self._setup_house()

    def _setup_house(self) -> None:
        """Set up the fake house structure."""
        # Basement
        self._add_room("basement_utility", "Utility Room", "basement", ["basement_garage"])
        self._add_room("basement_garage", "Garage", "basement", ["basement_utility", "ground_hallway"])

        # Ground Floor
        self._add_room(
            "ground_living", "Living Room", "ground",
            ["ground_hallway", "ground_kitchen"]
        )
        self._add_room(
            "ground_kitchen", "Kitchen", "ground",
            ["ground_living", "ground_hallway"]
        )
        self._add_room(
            "ground_hallway", "Hallway", "ground",
            ["ground_living", "ground_kitchen", "ground_bathroom", "first_hallway", "basement_garage"]
        )
        self._add_room("ground_bathroom", "Bathroom", "ground", ["ground_hallway"])

        # First Floor
        self._add_room(
            "first_bedroom1", "Master Bedroom", "first",
            ["first_hallway"]
        )
        self._add_room(
            "first_bedroom2", "Bedroom 2", "first",
            ["first_hallway"]
        )
        self._add_room(
            "first_hallway", "Upstairs Hallway", "first",
            ["first_bedroom1", "first_bedroom2", "first_bathroom", "ground_hallway"]
        )
        self._add_room("first_bathroom", "Upstairs Bathroom", "first", ["first_hallway"])

        # Add door sensors between connected rooms
        self._add_door_sensors()

    def _add_room(
        self, room_id: str, name: str, floor: str, connected: list[str]
    ) -> None:
        """Add a room with standard sensors."""
        room = FakeRoom(
            id=room_id,
            name=name,
            floor=floor,
            connected_rooms=connected,
        )

        # Add sensors to room
        sensors = [
            FakeSensor(
                entity_id=f"sensor.{room_id}_temperature",
                sensor_type=SensorType.TEMPERATURE,
                room_id=room_id,
                state="21.5",
                attributes={"unit_of_measurement": "°C"},
            ),
            FakeSensor(
                entity_id=f"sensor.{room_id}_humidity",
                sensor_type=SensorType.HUMIDITY,
                room_id=room_id,
                state="45",
                attributes={"unit_of_measurement": "%"},
            ),
            FakeSensor(
                entity_id=f"binary_sensor.{room_id}_motion",
                sensor_type=SensorType.MOTION_PIR,
                room_id=room_id,
                state=STATE_OFF,
                attributes={"device_class": "motion"},
            ),
            FakeSensor(
                entity_id=f"binary_sensor.{room_id}_presence",
                sensor_type=SensorType.PRESENCE_MMWAVE,
                room_id=room_id,
                state=STATE_OFF,
                attributes={"device_class": "presence"},
            ),
        ]

        for sensor in sensors:
            room.sensors.append(sensor)
            self.sensors[sensor.entity_id] = sensor

        self.rooms[room_id] = room

    def _add_door_sensors(self) -> None:
        """Add door contact sensors between connected rooms."""
        added_pairs: set[tuple[str, str]] = set()

        for room in self.rooms.values():
            for connected_id in room.connected_rooms:
                # Avoid duplicates
                pair = tuple(sorted([room.id, connected_id]))
                if pair in added_pairs:
                    continue
                added_pairs.add(pair)

                sensor = FakeSensor(
                    entity_id=f"binary_sensor.door_{room.id}_to_{connected_id}",
                    sensor_type=SensorType.DOOR_CONTACT,
                    room_id=room.id,
                    state=STATE_OFF,  # closed
                    attributes={"device_class": "door"},
                )
                self.sensors[sensor.entity_id] = sensor

    def add_person(self, person_id: str, name: str) -> FakePerson:
        """Add a person to the simulation."""
        person = FakePerson(id=person_id, name=name)
        self.persons[person_id] = person
        return person

    def get_mock_states(self) -> dict[str, MagicMock]:
        """Get mock states dict for Home Assistant."""
        states = {}
        for sensor in self.sensors.values():
            mock_state = MagicMock()
            mock_state.state = sensor.state
            mock_state.attributes = sensor.attributes
            states[sensor.entity_id] = mock_state
        return states

    def set_sensor_state(self, entity_id: str, state: str) -> None:
        """Set a sensor state and trigger callbacks."""
        if entity_id in self.sensors:
            self.sensors[entity_id].state = state
            self._notify_state_change(entity_id, state)

    def _notify_state_change(self, entity_id: str, state: str) -> None:
        """Notify callbacks of state change."""
        for callback in self._state_change_callbacks:
            callback(entity_id, state)

    def on_state_change(self, callback: Callable[[str, str], None]) -> Callable[[], None]:
        """Register a callback for state changes. Returns unsubscribe function."""
        self._state_change_callbacks.append(callback)
        return lambda: self._state_change_callbacks.remove(callback)

    def move_person_to_room(self, person_id: str, room_id: str) -> None:
        """
        Move a person to a room, triggering appropriate sensors.

        This simulates:
        1. Door opening (if moving to adjacent room)
        2. Motion detection in new room
        3. Presence detection in new room
        4. Motion clearing in old room (after delay)
        5. Door closing
        """
        person = self.persons.get(person_id)
        if not person:
            return

        old_room_id = person.current_room
        new_room = self.rooms.get(room_id)
        if not new_room:
            return

        # Trigger door sensor if rooms are connected
        if old_room_id and old_room_id in new_room.connected_rooms:
            door_id = self._find_door_sensor(old_room_id, room_id)
            if door_id:
                self.set_sensor_state(door_id, STATE_ON)  # Door open

        # Trigger motion and presence in new room
        self.set_sensor_state(f"binary_sensor.{room_id}_motion", STATE_ON)
        self.set_sensor_state(f"binary_sensor.{room_id}_presence", STATE_ON)

        # Update person location
        person.current_room = room_id

    def person_becomes_still(self, person_id: str) -> None:
        """
        Simulate a person becoming still (e.g., sitting down reading).

        This clears PIR motion but maintains mmWave presence.
        """
        person = self.persons.get(person_id)
        if not person or not person.current_room:
            return

        room_id = person.current_room
        self.set_sensor_state(f"binary_sensor.{room_id}_motion", STATE_OFF)
        # Presence remains ON

    def person_leaves_room(self, person_id: str) -> None:
        """
        Simulate a person leaving their current room.

        Clears all presence in the room.
        """
        person = self.persons.get(person_id)
        if not person or not person.current_room:
            return

        room_id = person.current_room
        self.set_sensor_state(f"binary_sensor.{room_id}_motion", STATE_OFF)
        self.set_sensor_state(f"binary_sensor.{room_id}_presence", STATE_OFF)

        person.current_room = None

    def close_door(self, room1_id: str, room2_id: str) -> None:
        """Close a door between two rooms."""
        door_id = self._find_door_sensor(room1_id, room2_id)
        if door_id:
            self.set_sensor_state(door_id, STATE_OFF)

    def open_door(self, room1_id: str, room2_id: str) -> None:
        """Open a door between two rooms."""
        door_id = self._find_door_sensor(room1_id, room2_id)
        if door_id:
            self.set_sensor_state(door_id, STATE_ON)

    def _find_door_sensor(self, room1_id: str, room2_id: str) -> str | None:
        """Find the door sensor between two rooms."""
        option1 = f"binary_sensor.door_{room1_id}_to_{room2_id}"
        option2 = f"binary_sensor.door_{room2_id}_to_{room1_id}"

        if option1 in self.sensors:
            return option1
        if option2 in self.sensors:
            return option2
        return None

    def get_room_sensors(self, room_id: str) -> list[FakeSensor]:
        """Get all sensors in a room."""
        room = self.rooms.get(room_id)
        if room:
            return room.sensors
        return []

    def reset_all_sensors(self) -> None:
        """Reset all sensors to default state."""
        for sensor in self.sensors.values():
            if sensor.sensor_type in (
                SensorType.MOTION_PIR,
                SensorType.MOTION_MMWAVE,
                SensorType.PRESENCE_MMWAVE,
                SensorType.DOOR_CONTACT,
            ):
                sensor.state = STATE_OFF
