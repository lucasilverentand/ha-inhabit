"""Tests for the built-in anonymized local simulator house."""

from __future__ import annotations

from custom_components.inhabit.const import DEFAULT_TRANSIT_PHANTOM_HOLD
from custom_components.inhabit.fixtures.local_simulator_house import (
    LOCAL_SIMULATOR_FLOOR_PLAN_ID,
    LOCAL_SIMULATOR_TRANSIT_ROOM_IDS,
    build_local_simulator_house,
    local_simulator_door_entity,
    local_simulator_house_summary,
)


def test_local_simulator_house_builds_two_floor_floorplan() -> None:
    """The browser-loadable fixture mirrors the CLI simulator topology."""
    floor_plan, configs, mmwave = build_local_simulator_house()
    level0 = floor_plan.get_floor("level_0")

    assert floor_plan.id == LOCAL_SIMULATOR_FLOOR_PLAN_ID
    assert [floor.id for floor in floor_plan.floors] == ["level_0", "level_1"]
    assert len(floor_plan.get_all_rooms()) == 16
    assert level0 is not None
    assert any(
        edge.type == "door"
        and edge.entity_id
        == local_simulator_door_entity("level0_transit", "level0_short_stay")
        for edge in level0.edges
    )
    assert len(configs) == 16
    assert {placement.id for placement in mmwave} >= {
        "sim_mmwave_hallway_ceiling_mmwave",
        "sim_mmwave_hallway_wall_mmwave",
        "sim_mmwave_short_stay_mmwave",
    }


def test_local_simulator_configs_enable_spatial_target_testing() -> None:
    """Every room can be driven by simulated target hitboxes."""
    _floor_plan, configs, _mmwave = build_local_simulator_house()

    configs_by_room = {config.room_id: config for config in configs}
    transit = configs_by_room["level0_transit"]
    short_stay = configs_by_room["level0_short_stay"]

    assert transit.presence_affects is True
    assert transit.spatial_presence_delay == 0
    assert transit.phantom_hold_seconds == DEFAULT_TRANSIT_PHANTOM_HOLD
    assert short_stay.door_seals_room is True
    assert short_stay.override_trigger_entity == "button.sim_level0_short_stay_override"
    assert local_simulator_door_entity(
        "level0_transit",
        "level0_short_stay",
    ) in {binding.entity_id for binding in short_stay.door_sensors}


def test_local_simulator_summary_matches_transit_hold() -> None:
    """The summary used by CLI tests reports the same transit hold."""
    summary = local_simulator_house_summary()
    rooms = {room["id"]: room for room in summary["rooms"]}

    assert set(summary["transit_room_ids"]) == set(LOCAL_SIMULATOR_TRANSIT_ROOM_IDS)
    for room_id in LOCAL_SIMULATOR_TRANSIT_ROOM_IDS:
        assert (
            rooms[room_id]["transit_phantom_hold_seconds"]
            == DEFAULT_TRANSIT_PHANTOM_HOLD
        )
