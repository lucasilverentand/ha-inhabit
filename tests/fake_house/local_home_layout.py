"""Anonymized local-house topology for deterministic occupancy simulations."""

from __future__ import annotations

from typing import Any

from custom_components.inhabit.fixtures.local_simulator_house import (
    LOCAL_SIMULATOR_ROOM_SPECS,
    LOCAL_SIMULATOR_TRANSIT_ROOM_IDS,
    local_simulator_house_summary,
)

from .house_simulator import FakeRoomSpec

LOCAL_HOME_ROOM_SPECS: list[FakeRoomSpec] = [
    FakeRoomSpec(
        spec.id,
        spec.name,
        spec.floor,
        list(spec.connected_rooms),
        list(spec.door_sensor_connected_rooms),
    )
    for spec in LOCAL_SIMULATOR_ROOM_SPECS
]

LOCAL_HOME_PROFILE_BY_ROOM: dict[str, str] = {
    spec.id: spec.profile for spec in LOCAL_SIMULATOR_ROOM_SPECS
}

LOCAL_HOME_TRANSIT_ROOM_IDS: set[str] = set(LOCAL_SIMULATOR_TRANSIT_ROOM_IDS)

LOCAL_HOME_PHANTOM_HOLD_SECONDS_BY_ROOM: dict[str, int] = {
    room["id"]: room["transit_phantom_hold_seconds"]
    for room in local_simulator_house_summary()["rooms"]
    if room["transit_phantom_hold_seconds"]
}

LOCAL_HOME_MMWAVE_SOURCES_BY_ROOM: dict[str, list[str]] = {
    spec.id: list(spec.mmwave_sources)
    for spec in LOCAL_SIMULATOR_ROOM_SPECS
    if spec.mmwave_sources
}


def local_home_layout_summary() -> dict[str, Any]:
    """Return a serializable view of the anonymized local-house fixture."""
    return local_simulator_house_summary()
