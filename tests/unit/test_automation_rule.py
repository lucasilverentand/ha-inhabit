"""Unit tests for automation rule models."""

from __future__ import annotations

from custom_components.inhabit.models.automation_rule import (
    RuleAction,
    RuleCondition,
    VisualRule,
)


class TestRuleCondition:
    """Test RuleCondition model."""

    def test_entity_state_condition(self):
        """Test entity state condition."""
        condition = RuleCondition(
            type="entity_state",
            entity_id="light.living_room",
            state="on",
        )

        assert condition.type == "entity_state"
        assert condition.entity_id == "light.living_room"
        assert condition.state == "on"

    def test_room_occupancy_condition(self):
        """Test room occupancy condition."""
        condition = RuleCondition(
            type="room_occupancy",
            room_id="living_room",
            state="on",
        )

        assert condition.type == "room_occupancy"
        assert condition.room_id == "living_room"

    def test_numeric_state_condition(self):
        """Test numeric state condition."""
        condition = RuleCondition(
            type="numeric_state",
            entity_id="sensor.temperature",
            above=20.0,
            below=30.0,
        )

        assert condition.above == 20.0
        assert condition.below == 30.0

    def test_time_condition(self):
        """Test time condition."""
        condition = RuleCondition(
            type="time",
            after="08:00",
            before="22:00",
            weekday=["mon", "tue", "wed", "thu", "fri"],
        )

        assert condition.after == "08:00"
        assert condition.before == "22:00"
        assert len(condition.weekday) == 5

    def test_sun_condition(self):
        """Test sun condition."""
        condition = RuleCondition(
            type="sun",
            after="sunset",
            before="sunrise",
        )

        assert condition.after == "sunset"
        assert condition.before == "sunrise"

    def test_to_dict(self):
        """Test condition serialization."""
        condition = RuleCondition(
            type="entity_state",
            entity_id="light.test",
            state="on",
        )
        data = condition.to_dict()

        assert data["type"] == "entity_state"
        assert data["entity_id"] == "light.test"
        assert data["state"] == "on"

    def test_from_dict(self):
        """Test condition deserialization."""
        data = {
            "type": "numeric_state",
            "entity_id": "sensor.temp",
            "above": 25.0,
        }
        condition = RuleCondition.from_dict(data)

        assert condition.type == "numeric_state"
        assert condition.entity_id == "sensor.temp"
        assert condition.above == 25.0

    def test_to_ha_condition_entity_state(self):
        """Test conversion to HA condition for entity state."""
        condition = RuleCondition(
            type="entity_state",
            entity_id="light.test",
            state="on",
        )
        ha_condition = condition.to_ha_condition()

        assert ha_condition["condition"] == "state"
        assert ha_condition["entity_id"] == "light.test"
        assert ha_condition["state"] == "on"

    def test_to_ha_condition_room_occupancy(self):
        """Test conversion to HA condition for room occupancy."""
        condition = RuleCondition(
            type="room_occupancy",
            room_id="bedroom",
            state="on",
        )
        ha_condition = condition.to_ha_condition()

        assert ha_condition["condition"] == "state"
        assert ha_condition["entity_id"] == "binary_sensor.fp_bedroom_occupancy"
        assert ha_condition["state"] == "on"

    def test_to_ha_condition_numeric_state(self):
        """Test conversion to HA condition for numeric state."""
        condition = RuleCondition(
            type="numeric_state",
            entity_id="sensor.temp",
            above=20.0,
            below=25.0,
        )
        ha_condition = condition.to_ha_condition()

        assert ha_condition["condition"] == "numeric_state"
        assert ha_condition["entity_id"] == "sensor.temp"
        assert ha_condition["above"] == 20.0
        assert ha_condition["below"] == 25.0

    def test_to_ha_condition_time(self):
        """Test conversion to HA condition for time."""
        condition = RuleCondition(
            type="time",
            after="08:00",
            before="22:00",
            weekday=["mon", "fri"],
        )
        ha_condition = condition.to_ha_condition()

        assert ha_condition["condition"] == "time"
        assert ha_condition["after"] == "08:00"
        assert ha_condition["before"] == "22:00"
        assert ha_condition["weekday"] == ["mon", "fri"]

    def test_to_ha_condition_sun(self):
        """Test conversion to HA condition for sun."""
        condition = RuleCondition(
            type="sun",
            after="sunset",
            before="sunrise",
        )
        ha_condition = condition.to_ha_condition()

        assert ha_condition["condition"] == "sun"
        assert ha_condition["after"] == "sunset"
        assert ha_condition["before"] == "sunrise"


class TestRuleAction:
    """Test RuleAction model."""

    def test_service_call_action(self):
        """Test service call action."""
        action = RuleAction(
            type="service_call",
            service="light.turn_on",
            entity_id="light.living_room",
        )

        assert action.type == "service_call"
        assert action.service == "light.turn_on"
        assert action.entity_id == "light.living_room"

    def test_service_call_with_data(self):
        """Test service call action with data."""
        action = RuleAction(
            type="service_call",
            service="light.turn_on",
            entity_id="light.living_room",
            data={"brightness": 255, "color_temp": 400},
        )

        assert action.data["brightness"] == 255
        assert action.data["color_temp"] == 400

    def test_delay_action(self):
        """Test delay action."""
        action = RuleAction(
            type="delay",
            delay_seconds=30.0,
        )

        assert action.type == "delay"
        assert action.delay_seconds == 30.0

    def test_wait_action(self):
        """Test wait action."""
        action = RuleAction(
            type="wait",
            wait_template="{{ states('sensor.motion') == 'on' }}",
        )

        assert action.type == "wait"
        assert "states" in action.wait_template

    def test_to_dict(self):
        """Test action serialization."""
        action = RuleAction(
            type="service_call",
            service="light.turn_off",
            entity_id="light.test",
        )
        data = action.to_dict()

        assert data["type"] == "service_call"
        assert data["service"] == "light.turn_off"
        assert data["entity_id"] == "light.test"

    def test_from_dict(self):
        """Test action deserialization."""
        data = {
            "type": "delay",
            "delay_seconds": 60.0,
        }
        action = RuleAction.from_dict(data)

        assert action.type == "delay"
        assert action.delay_seconds == 60.0

    def test_to_ha_action_service_call(self):
        """Test conversion to HA action for service call."""
        action = RuleAction(
            type="service_call",
            service="light.turn_on",
            entity_id="light.test",
            data={"brightness": 100},
        )
        ha_action = action.to_ha_action()

        assert ha_action["service"] == "light.turn_on"
        assert ha_action["target"]["entity_id"] == "light.test"
        assert ha_action["data"]["brightness"] == 100

    def test_to_ha_action_service_call_no_data(self):
        """Test conversion to HA action for service call without data."""
        action = RuleAction(
            type="service_call",
            service="light.turn_off",
            entity_id="light.test",
        )
        ha_action = action.to_ha_action()

        assert ha_action["service"] == "light.turn_off"
        assert ha_action["target"]["entity_id"] == "light.test"
        assert "data" not in ha_action

    def test_to_ha_action_delay(self):
        """Test conversion to HA action for delay."""
        action = RuleAction(
            type="delay",
            delay_seconds=45.0,
        )
        ha_action = action.to_ha_action()

        assert ha_action["delay"]["seconds"] == 45.0

    def test_to_ha_action_wait(self):
        """Test conversion to HA action for wait."""
        action = RuleAction(
            type="wait",
            wait_template="{{ is_state('sensor.motion', 'on') }}",
        )
        ha_action = action.to_ha_action()

        assert "wait_template" in ha_action


class TestVisualRule:
    """Test VisualRule model."""

    def test_default_values(self):
        """Test default values."""
        rule = VisualRule()

        assert rule.enabled is True
        assert rule.trigger_type == "room_occupancy"
        assert rule.color == "#3b82f6"

    def test_full_rule(self):
        """Test full rule with all fields."""
        rule = VisualRule(
            id="rule_1",
            name="Living Room Lights",
            description="Turn on lights when occupied",
            floor_plan_id="fp_1",
            trigger_type="room_occupancy",
            trigger_room_id="living_room",
            trigger_state="on",
            trigger_for=5,
            conditions=[
                RuleCondition(type="time", after="18:00", before="23:00"),
            ],
            actions=[
                RuleAction(
                    type="service_call",
                    service="light.turn_on",
                    entity_id="light.living",
                ),
            ],
            source_room_id="living_room",
            target_entity_ids=["light.living"],
        )

        assert rule.name == "Living Room Lights"
        assert rule.trigger_for == 5
        assert len(rule.conditions) == 1
        assert len(rule.actions) == 1

    def test_to_dict(self):
        """Test rule serialization."""
        rule = VisualRule(
            id="rule_1",
            name="Test Rule",
            floor_plan_id="fp_1",
            trigger_type="entity_state",
            trigger_entity_id="binary_sensor.motion",
            trigger_state="on",
        )
        data = rule.to_dict()

        assert data["id"] == "rule_1"
        assert data["name"] == "Test Rule"
        assert data["trigger_type"] == "entity_state"

    def test_from_dict(self):
        """Test rule deserialization."""
        data = {
            "id": "rule_2",
            "name": "Restored Rule",
            "floor_plan_id": "fp_1",
            "trigger_type": "room_occupancy",
            "trigger_room_id": "bedroom",
            "trigger_state": "off",
            "conditions": [],
            "actions": [
                {
                    "type": "service_call",
                    "service": "light.turn_off",
                    "entity_id": "light.bedroom",
                },
            ],
        }
        rule = VisualRule.from_dict(data)

        assert rule.id == "rule_2"
        assert rule.name == "Restored Rule"
        assert rule.trigger_room_id == "bedroom"
        assert len(rule.actions) == 1

    def test_to_ha_automation_room_occupancy(self):
        """Test conversion to HA automation for room occupancy trigger."""
        rule = VisualRule(
            name="Occupancy Light",
            floor_plan_id="fp_1",
            trigger_type="room_occupancy",
            trigger_room_id="kitchen",
            trigger_state="on",
            actions=[
                RuleAction(
                    type="service_call",
                    service="light.turn_on",
                    entity_id="light.kitchen",
                ),
            ],
        )
        automation = rule.to_ha_automation()

        assert automation["alias"] == "Occupancy Light"
        assert automation["mode"] == "single"
        assert automation["trigger"][0]["platform"] == "state"
        assert (
            automation["trigger"][0]["entity_id"]
            == "binary_sensor.fp_kitchen_occupancy"
        )
        assert automation["trigger"][0]["to"] == "on"
        assert len(automation["action"]) == 1

    def test_to_ha_automation_entity_state(self):
        """Test conversion to HA automation for entity state trigger."""
        rule = VisualRule(
            name="Motion Light",
            floor_plan_id="fp_1",
            trigger_type="entity_state",
            trigger_entity_id="binary_sensor.motion",
            trigger_state="on",
            trigger_for=10,
            actions=[
                RuleAction(
                    type="service_call", service="light.turn_on", entity_id="light.hall"
                ),
            ],
        )
        automation = rule.to_ha_automation()

        assert automation["trigger"][0]["entity_id"] == "binary_sensor.motion"
        assert automation["trigger"][0]["for"]["seconds"] == 10

    def test_to_ha_automation_time_trigger(self):
        """Test conversion to HA automation for time trigger."""
        rule = VisualRule(
            name="Morning Alarm",
            floor_plan_id="fp_1",
            trigger_type="time",
            trigger_state="07:00",
            actions=[
                RuleAction(type="service_call", service="script.morning_routine"),
            ],
        )
        automation = rule.to_ha_automation()

        assert automation["trigger"][0]["platform"] == "time"
        assert automation["trigger"][0]["at"] == "07:00"

    def test_to_ha_automation_sun_trigger(self):
        """Test conversion to HA automation for sun trigger."""
        rule = VisualRule(
            name="Sunset Lights",
            floor_plan_id="fp_1",
            trigger_type="sun",
            trigger_state="sunset",
            actions=[
                RuleAction(
                    type="service_call",
                    service="light.turn_on",
                    entity_id="light.outdoor",
                ),
            ],
        )
        automation = rule.to_ha_automation()

        assert automation["trigger"][0]["platform"] == "sun"
        assert automation["trigger"][0]["event"] == "sunset"

    def test_to_ha_automation_with_conditions(self):
        """Test conversion to HA automation with conditions."""
        rule = VisualRule(
            name="Conditional Light",
            floor_plan_id="fp_1",
            trigger_type="room_occupancy",
            trigger_room_id="living",
            trigger_state="on",
            conditions=[
                RuleCondition(type="time", after="18:00"),
            ],
            actions=[
                RuleAction(
                    type="service_call",
                    service="light.turn_on",
                    entity_id="light.living",
                ),
            ],
        )
        automation = rule.to_ha_automation()

        assert "condition" in automation
        assert len(automation["condition"]) == 1

    def test_disabled_rule(self):
        """Test disabled rule."""
        rule = VisualRule(
            name="Disabled Rule",
            floor_plan_id="fp_1",
            enabled=False,
        )

        assert rule.enabled is False
