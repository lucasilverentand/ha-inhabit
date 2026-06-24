"""Anonymized local-house topology for deterministic occupancy simulations."""

from __future__ import annotations

from typing import Any

from custom_components.inhabit.const import DEFAULT_TRANSIT_PHANTOM_HOLD
from custom_components.inhabit.occupancy_policy import (
    PROFILE_LONG_STAY,
    PROFILE_OPEN_AREA,
    PROFILE_SHORT_STAY,
    PROFILE_SLEEP,
    PROFILE_TRANSIT,
    PROFILE_UTILITY,
)

from .house_simulator import FakeRoomSpec

LOCAL_HOME_ROOM_SPECS: list[FakeRoomSpec] = [
    FakeRoomSpec(
        "level0_entry",
        "Entry Node",
        "level_0",
        ["level0_front_hall"],
    ),
    FakeRoomSpec(
        "level0_front_hall",
        "Front Transit",
        "level_0",
        ["level0_entry", "level0_transit", "level0_utility"],
    ),
    FakeRoomSpec(
        "level0_transit",
        "Main Transit",
        "level_0",
        [
            "level0_front_hall",
            "level0_open_area",
            "level0_cooking",
            "level0_dining",
            "level0_short_stay_lobby",
            "level0_short_stay",
            "vertical_link",
        ],
    ),
    FakeRoomSpec(
        "level0_short_stay_lobby",
        "Short Stay Approach",
        "level_0",
        ["level0_transit", "level0_short_stay"],
    ),
    FakeRoomSpec(
        "level0_open_area",
        "Open Area Alpha",
        "level_0",
        ["level0_transit", "level0_cooking", "level0_dining"],
    ),
    FakeRoomSpec(
        "level0_cooking",
        "Open Area Beta",
        "level_0",
        ["level0_transit", "level0_open_area", "level0_dining"],
    ),
    FakeRoomSpec(
        "level0_dining",
        "Open Area Gamma",
        "level_0",
        ["level0_transit", "level0_open_area", "level0_cooking"],
    ),
    FakeRoomSpec(
        "level0_short_stay",
        "Short Stay Alpha",
        "level_0",
        ["level0_transit", "level0_short_stay_lobby"],
    ),
    FakeRoomSpec(
        "level0_utility",
        "Utility Alpha",
        "level_0",
        ["level0_front_hall"],
    ),
    FakeRoomSpec(
        "vertical_link",
        "Vertical Link",
        "level_0",
        ["level0_transit", "level1_transit"],
    ),
    FakeRoomSpec(
        "level1_transit",
        "Upper Transit",
        "level_1",
        [
            "vertical_link",
            "level1_sleep_primary",
            "level1_sleep_secondary",
            "level1_work",
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
        "level1_work",
        "Work Zone Alpha",
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

LOCAL_HOME_PROFILE_BY_ROOM: dict[str, str] = {
    "level0_entry": PROFILE_TRANSIT,
    "level0_front_hall": PROFILE_TRANSIT,
    "level0_transit": PROFILE_TRANSIT,
    "level0_short_stay_lobby": PROFILE_TRANSIT,
    "level0_open_area": PROFILE_LONG_STAY,
    "level0_cooking": PROFILE_OPEN_AREA,
    "level0_dining": PROFILE_OPEN_AREA,
    "level0_short_stay": PROFILE_SHORT_STAY,
    "level0_utility": PROFILE_UTILITY,
    "vertical_link": PROFILE_TRANSIT,
    "level1_transit": PROFILE_TRANSIT,
    "level1_sleep_primary": PROFILE_SLEEP,
    "level1_sleep_secondary": PROFILE_SLEEP,
    "level1_work": PROFILE_LONG_STAY,
    "level1_short_stay": PROFILE_SHORT_STAY,
    "level1_wash": PROFILE_SHORT_STAY,
}

LOCAL_HOME_TRANSIT_ROOM_IDS: set[str] = {
    "level0_entry",
    "level0_front_hall",
    "level0_transit",
    "level0_short_stay_lobby",
    "vertical_link",
    "level1_transit",
}

LOCAL_HOME_PHANTOM_HOLD_SECONDS_BY_ROOM: dict[str, int] = {
    room_id: DEFAULT_TRANSIT_PHANTOM_HOLD for room_id in LOCAL_HOME_TRANSIT_ROOM_IDS
}

LOCAL_HOME_MMWAVE_SOURCES_BY_ROOM: dict[str, list[str]] = {
    "level0_transit": ["hallway_ceiling_mmwave", "hallway_wall_mmwave"],
    "level0_short_stay": ["short_stay_mmwave"],
    "level0_open_area": ["open_area_mmwave"],
    "level0_cooking": ["cooking_mmwave"],
    "level1_transit": ["upper_hallway_mmwave"],
    "level1_sleep_primary": ["sleep_primary_mmwave"],
    "level1_short_stay": ["upper_short_stay_mmwave"],
}


def local_home_layout_summary() -> dict[str, Any]:
    """Return a serializable view of the anonymized local-house fixture."""
    return {
        "rooms": [
            {
                "id": spec.id,
                "name": spec.name,
                "floor": spec.floor,
                "connected_rooms": list(spec.connected_rooms),
                "profile": LOCAL_HOME_PROFILE_BY_ROOM[spec.id],
                "mmwave_sources": LOCAL_HOME_MMWAVE_SOURCES_BY_ROOM.get(
                    spec.id, [f"{spec.id}_mmwave"]
                ),
                "transit_phantom_hold_seconds": (
                    LOCAL_HOME_PHANTOM_HOLD_SECONDS_BY_ROOM.get(spec.id, 0)
                ),
            }
            for spec in LOCAL_HOME_ROOM_SPECS
        ],
        "transit_room_ids": sorted(LOCAL_HOME_TRANSIT_ROOM_IDS),
    }
