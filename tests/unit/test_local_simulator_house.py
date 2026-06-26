"""Tests for the built-in anonymized local simulator house."""

from __future__ import annotations

from custom_components.inhabit.fixtures.local_simulator_house import (
    LOCAL_SIMULATOR_FLOOR_PLAN_ID,
    LOCAL_SIMULATOR_TRANSIT_ROOM_IDS,
    build_local_simulator_house,
    local_simulator_door_entity,
    local_simulator_house_summary,
)


def test_local_simulator_house_builds_anonymized_amsterdam_floorplan() -> None:
    """The browser-loadable fixture mirrors the CLI simulator topology."""
    floor_plan, configs, mmwave = build_local_simulator_house()
    level0 = floor_plan.get_floor("level_0")

    assert floor_plan.id == LOCAL_SIMULATOR_FLOOR_PLAN_ID
    assert [floor.id for floor in floor_plan.floors] == ["level_0"]
    assert len(floor_plan.get_all_rooms()) == 7
    assert level0 is not None
    assert len(level0.zones) == 9
    assert sum(1 for edge in level0.edges if edge.type == "wall") >= 30
    assert sum(1 for edge in level0.edges if edge.type == "door") == 7
    assert len({edge.id for edge in level0.edges}) == len(level0.edges)
    assert any(
        edge.type == "door"
        and edge.entity_id == local_simulator_door_entity("transit_hall", "short_stay")
        for edge in level0.edges
    )
    assert len(configs) == 14
    assert {placement.id for placement in mmwave} == {
        "sim_mmwave_wide_east",
        "sim_mmwave_wide_west",
    }
    assert all(len(placement.targets) == 3 for placement in mmwave)


def test_local_simulator_configs_enable_spatial_target_testing() -> None:
    """Every room can be driven by simulated target hitboxes."""
    _floor_plan, configs, _mmwave = build_local_simulator_house()

    configs_by_room = {config.room_id: config for config in configs}
    transit = configs_by_room["transit_hall"]
    short_stay = configs_by_room["short_stay"]

    assert transit.presence_affects is True
    assert transit.spatial_presence_delay == 0
    assert transit.motion_timeout == 45
    assert transit.checking_timeout == 15
    assert short_stay.door_seals_room is True
    assert short_stay.override_trigger_entity == "button.sim_short_stay_override"
    assert local_simulator_door_entity(
        "transit_hall",
        "short_stay",
    ) in {binding.entity_id for binding in short_stay.door_sensors}
    assert local_simulator_door_entity(
        "transit_hall",
        "short_stay",
    ) not in {binding.entity_id for binding in transit.door_sensors}
    assert {binding.entity_id for binding in transit.door_sensors} == {
        local_simulator_door_entity("transit_hall", "open_east"),
        local_simulator_door_entity("transit_hall", "open_west"),
    }


def test_local_simulator_summary_reports_anonymized_structure() -> None:
    """The summary used by CLI tests reports the mirrored local structure."""
    summary = local_simulator_house_summary()
    rooms = {room["id"]: room for room in summary["rooms"]}

    assert summary["source"] == "anonymized_amsterdam_structure"
    assert set(summary["transit_room_ids"]) == set(LOCAL_SIMULATOR_TRANSIT_ROOM_IDS)
    assert rooms["transit_hall"]["is_transit"] is True
    assert rooms["transit_hall"]["door_sensor_connected_rooms"] == [
        "open_east",
        "open_west",
    ]
    assert len(summary["zones"]) == 9
    assert len(summary["doors"]) == 7
