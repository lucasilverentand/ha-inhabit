"""Tests for the real-code occupancy algorithm simulator."""

from __future__ import annotations

from custom_components.inhabit.const import DEFAULT_TRANSIT_PHANTOM_HOLD, OccupancyState
from tests.fake_house.algorithm_simulator import AlgorithmScenarioSimulator
from tests.fake_house.local_home_layout import (
    LOCAL_HOME_PHANTOM_HOLD_SECONDS_BY_ROOM,
    local_home_layout_summary,
)
from tests.fake_house.local_home_scenarios import (
    all_direct_routes_settle_without_stuck_hallway,
    door_bounce_person_remains_after_settled_occupancy,
    door_left_open_exit_clears_after_unsealed_check,
    door_left_open_mmwave_keeps_short_stay_occupied,
    door_sensor_unavailable_recovers_with_active_presence,
    hallway_left_open_to_short_stay_then_close,
    hallway_multi_mmwave_clears_after_last_target,
    multi_target_partial_exit_keeps_source_occupied,
    open_door_override_real_activity_survives_safety_timer,
    repeated_door_bounces_do_not_wake_hallway,
    short_stay_exit_back_to_hallway,
    startup_clear_sensors_stays_vacant,
    startup_each_room_presence_clears_without_cross_room_wake,
    startup_hallway_presence_clears_without_waking_rooms,
    startup_multiple_room_presence_clears_independently,
    startup_open_doors_clear_sensors_stays_vacant,
    startup_restored_presence_door_open_wakes_hallway,
    startup_single_room_presence_does_not_wake_hallway,
    transit_reentry_during_phantom_keeps_hallway_live,
    two_people_cross_hallway_independently,
)

LOCAL_TRANSIT_PHANTOM_HOLD = LOCAL_HOME_PHANTOM_HOLD_SECONDS_BY_ROOM.get(
    "transit_hall",
    DEFAULT_TRANSIT_PHANTOM_HOLD,
)


def test_open_toilet_door_hallway_walk_in_then_close_with_mmwave_reseals():
    """A hallway-to-toilet walk with the door left open uses the real algorithm."""
    with AlgorithmScenarioSimulator(
        room_ids=["ground_hallway", "ground_toilet"],
        unsealed_activity_timeout=120,
    ) as sim:
        sim.add_person("person1", "Luca")

        sim.enter_room("person1", "ground_hallway", spatial_targets=1)
        sim.assert_room("ground_hallway", OccupancyState.OCCUPIED, sealed=True)

        sim.open_door("ground_hallway", "ground_toilet")
        sim.enter_room("person1", "ground_toilet", spatial_targets=1)
        sim.clear_room("ground_hallway")

        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("ground_hallway", OccupancyState.CHECKING, sealed=False)

        sim.wait(90)
        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)

        sim.close_door("ground_hallway", "ground_toilet")
        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)
        assert (
            sim.machines["ground_toilet"]._post_close_hold_until is not None
        ), sim.timeline

        sim.clear_pir("ground_toilet")
        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)

        sim.set_spatial_targets("ground_toilet", 1, source="post_close_mmwave")
        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=True)


def test_toilet_mmwave_dropout_after_open_door_close_uses_post_close_hold():
    """A mmWave dropout right after door close does not immediately clear occupancy."""
    with AlgorithmScenarioSimulator(
        room_ids=["ground_hallway", "ground_toilet"],
        unsealed_activity_timeout=120,
    ) as sim:
        sim.add_person("person1", "Luca")

        sim.open_door("ground_hallway", "ground_toilet")
        sim.enter_room("person1", "ground_toilet", spatial_targets=1)
        sim.wait(90)

        sim.close_door("ground_hallway", "ground_toilet")
        sim.clear_pir("ground_toilet")
        sim.set_mmwave("ground_toilet", False, spatial_targets=0)

        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(14)
        sim.assert_room("ground_toilet", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(1)
        sim.assert_room("ground_toilet", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("ground_toilet", OccupancyState.VACANT, sealed=False)


def test_anonymized_transit_phantom_expires_and_rechecks_clear_sensors():
    """A phantom transit hold clears without using real home names or entities."""
    with AlgorithmScenarioSimulator.anonymized_transit_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("transit_core", "zone_alpha")
        sim.enter_room(
            "subject",
            "zone_alpha",
            pir=False,
            mmwave=True,
            spatial_targets=1,
        )
        sim.clear_room("zone_alpha")

        sim.assert_room("zone_alpha", OccupancyState.CHECKING, sealed=False)
        sim.assert_room("transit_core", OccupancyState.OCCUPIED, sealed=False)
        assert sim.transition_predictor is not None
        assert sim.transition_predictor.has_active_phantom("transit_core")

        sim.wait(DEFAULT_TRANSIT_PHANTOM_HOLD - 1)
        sim.assert_room("transit_core", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(1)
        sim.assert_room("transit_core", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("transit_core", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_walks_from_open_area_to_short_stay():
    """The local home fixture mirrors hallway-to-short-stay door behavior."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.enter_room("subject", "open_east", spatial_targets=1)
        sim.open_door("open_east", "transit_hall")
        sim.enter_room("subject", "transit_hall", spatial_targets=1)
        sim.clear_room("open_east")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.clear_room("transit_hall")

        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("transit_hall", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(90)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)

        sim.close_door("transit_hall", "short_stay")
        sim.clear_pir("short_stay")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.set_spatial_targets("short_stay", 1, source="post_close_mmwave")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)
        sim.assert_room("open_east", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_quick_exit_after_settled_occupancy_checks_empty():
    """A quick door open/close after settled occupancy runs the delayed exit check."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("transit_hall", "short_stay")
        sim.enter_room("subject", "short_stay", spatial_targets=1)
        sim.close_door("transit_hall", "short_stay")
        sim.set_spatial_targets("short_stay", 1, source="post_close_mmwave")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.wait(180)
        sim.open_door("transit_hall", "short_stay")
        sim.close_door("transit_hall", "short_stay")
        sim.clear_room("short_stay")

        sim.wait(14)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(1)
        sim.assert_room("short_stay", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)

        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_closed_door_override_waits_for_door_open():
    """A closed-door override is not cleared by the safety timer."""
    with AlgorithmScenarioSimulator.anonymized_local_home(
        policy_overrides_by_room={"short_stay": {"override_safety_timeout": 5}}
    ) as sim:
        sim.override_room("short_stay")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.wait(10)
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=True)

        sim.open_door("transit_hall", "short_stay")
        sim.assert_room("short_stay", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)

        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_open_door_override_safety_timer_clears():
    """An open-door override is bounded by the override safety timer."""
    with AlgorithmScenarioSimulator.anonymized_local_home(
        policy_overrides_by_room={"short_stay": {"override_safety_timeout": 5}}
    ) as sim:
        sim.open_door("transit_hall", "short_stay")
        sim.override_room("short_stay")
        sim.assert_room("short_stay", OccupancyState.OCCUPIED, sealed=False)

        sim.wait(5)
        sim.assert_room("short_stay", OccupancyState.CHECKING, sealed=False)

        sim.wait(30)
        sim.assert_room("short_stay", OccupancyState.VACANT, sealed=False)

        sim.wait(LOCAL_TRANSIT_PHANTOM_HOLD + 30)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_transit_phantom_expires():
    """Moving through the mirrored transit hall creates and clears phantoms."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        sim.add_person("subject", "Subject")

        sim.open_door("open_west", "transit_hall")
        sim.enter_room(
            "subject",
            "transit_hall",
            pir=False,
            mmwave=True,
            spatial_targets=1,
        )
        sim.open_door("transit_hall", "open_east")
        sim.enter_room("subject", "open_east", spatial_targets=1)
        sim.clear_room("transit_hall")

        sim.assert_room("transit_hall", OccupancyState.CHECKING, sealed=False)

        assert sim.transition_predictor is not None
        assert not sim.transition_predictor.has_active_phantom("transit_hall")

        sim.wait(20)
        sim.assert_room("transit_hall", OccupancyState.VACANT, sealed=False)


def test_anonymized_local_home_layout_has_segmented_hallways_and_mmwave_sources():
    """The local fixture mirrors the hallway topology needed for regressions."""
    layout = local_home_layout_summary()
    rooms = {room["id"]: room for room in layout["rooms"]}

    assert "transit_hall" in rooms
    assert "short_stay" in rooms["transit_hall"]["connected_rooms"]
    assert "side_room_alpha" in rooms["transit_hall"]["connected_rooms"]
    assert "open_east" in rooms["transit_hall"]["door_sensor_connected_rooms"]
    assert "open_west" in rooms["transit_hall"]["door_sensor_connected_rooms"]
    assert "short_stay" not in rooms["transit_hall"]["door_sensor_connected_rooms"]
    assert rooms["transit_hall"]["mmwave_sources"] == [
        "hall_mmwave_east",
        "hall_mmwave_west",
    ]


def test_anonymized_local_home_simulator_respects_missing_door_sensors():
    """The fake local house should not invent sensors for open passages."""
    with AlgorithmScenarioSimulator.anonymized_local_home() as sim:
        assert sim.house._find_door_sensor("entry_nook", "transit_hall") is None
        assert sim.house._find_door_sensor("short_stay", "transit_hall") is not None
        assert sim.house._find_door_sensor("open_east", "transit_hall") is not None


def test_local_home_scenario_hallway_left_open_to_short_stay_then_close():
    """A door-left-open walk into short stay settles the hallway."""
    result = hallway_left_open_to_short_stay_then_close()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.OCCUPIED
    assert result["final_states"]["short_stay"]["sealed"] is True
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_hallway_multi_mmwave_clears_after_last_target():
    """A multi-mmWave hallway only clears when the last target source clears."""
    result = hallway_multi_mmwave_clears_after_last_target()

    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_short_stay_exit_back_to_hallway():
    """A settled short-stay exit does not leave hallway occupancy stuck."""
    result = short_stay_exit_back_to_hallway()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.VACANT
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_door_bounce_person_remains_occupied():
    """A quick door bounce does not clear a room with active mmWave evidence."""
    result = door_bounce_person_remains_after_settled_occupancy()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.OCCUPIED
    assert result["final_states"]["short_stay"]["sealed"] is True
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_repeated_door_bounces_do_not_wake_hallway():
    """Repeated door bounces do not leave stale hallway occupancy."""
    result = repeated_door_bounces_do_not_wake_hallway()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.OCCUPIED
    assert result["final_states"]["short_stay"]["sealed"] is True
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_open_door_mmwave_keeps_short_stay_occupied():
    """A left-open door does not clear a room while mmWave remains active."""
    result = door_left_open_mmwave_keeps_short_stay_occupied()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.OCCUPIED
    assert result["final_states"]["short_stay"]["sealed"] is True
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_door_left_open_exit_clears_after_unsealed_check():
    """A room clears after exit even when the door is left open."""
    result = door_left_open_exit_clears_after_unsealed_check()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.VACANT
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_door_sensor_unavailable_recovers_with_presence():
    """A door outage does not clear a room while mmWave remains active."""
    result = door_sensor_unavailable_recovers_with_active_presence()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.OCCUPIED
    assert result["final_states"]["short_stay"]["sealed"] is True


def test_local_home_scenario_multi_target_partial_exit_keeps_source_occupied():
    """One target can leave while the source room remains occupied."""
    result = multi_target_partial_exit_keeps_source_occupied()

    assert result["final_states"]["open_west"]["state"] == OccupancyState.OCCUPIED
    assert result["final_states"]["service_room"]["state"] == OccupancyState.VACANT
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_two_people_cross_hallway_independently():
    """Multiple hallway travelers clear transit after all hallway sources clear."""
    result = two_people_cross_hallway_independently()

    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT
    assert result["final_states"]["short_stay"]["state"] == OccupancyState.OCCUPIED
    assert result["final_states"]["open_east"]["state"] == OccupancyState.OCCUPIED


def test_local_home_scenario_transit_reentry_during_phantom():
    """A real hallway re-entry during a phantom does not leave transit stuck."""
    result = transit_reentry_during_phantom_keeps_hallway_live()

    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_all_direct_routes_settle_without_stuck_hallway():
    """Every direct local route settles without stale hallway occupancy."""
    result = all_direct_routes_settle_without_stuck_hallway()

    assert all(
        state["state"] == OccupancyState.VACANT
        for state in result["final_states"].values()
    )


def test_local_home_scenario_startup_clear_sensors_stays_vacant():
    """A reload with all sensors clear does not synthesize occupancy."""
    result = startup_clear_sensors_stays_vacant()

    assert all(
        state["state"] == OccupancyState.VACANT
        for state in result["final_states"].values()
    )


def test_local_home_scenario_startup_open_doors_clear_sensors_stays_vacant():
    """A reload with restored open doors and clear sensors stays vacant."""
    result = startup_open_doors_clear_sensors_stays_vacant()

    assert all(
        state["state"] == OccupancyState.VACANT
        for state in result["final_states"].values()
    )


def test_local_home_scenario_startup_presence_does_not_wake_hallway():
    """Restored room presence on startup does not create hallway occupancy."""
    result = startup_single_room_presence_does_not_wake_hallway()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.VACANT
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_startup_hallway_presence_clears_without_waking_rooms():
    """Restored hallway presence clears without waking adjacent rooms."""
    result = startup_hallway_presence_clears_without_waking_rooms()

    assert all(
        state["state"] == OccupancyState.VACANT
        for state in result["final_states"].values()
    )


def test_local_home_scenario_startup_each_room_clears_without_cross_room_wake():
    """Each restored room presence clears without cross-room wakeup."""
    result = startup_each_room_presence_clears_without_cross_room_wake()

    assert all(
        state["state"] == OccupancyState.VACANT
        for state in result["final_states"].values()
    )


def test_local_home_scenario_startup_multiple_rooms_clear_independently():
    """Multiple restored room presences clear independently."""
    result = startup_multiple_room_presence_clears_independently()

    assert all(
        state["state"] == OccupancyState.VACANT
        for state in result["final_states"].values()
    )


def test_local_home_scenario_startup_presence_door_open_wakes_hallway():
    """Restored presence can still drive prediction after a real door event."""
    result = startup_restored_presence_door_open_wakes_hallway()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.VACANT
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT


def test_local_home_scenario_open_door_override_activity_survives_safety():
    """An open-door override survives safety expiry when real activity appears."""
    result = open_door_override_real_activity_survives_safety_timer()

    assert result["final_states"]["short_stay"]["state"] == OccupancyState.VACANT
    assert result["final_states"]["transit_hall"]["state"] == OccupancyState.VACANT
