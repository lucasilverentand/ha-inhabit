"""Visual automation rule models."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4


def _generate_id() -> str:
    """Generate a unique ID."""
    return uuid4().hex[:8]


@dataclass
class RuleCondition:
    """Condition for a visual automation rule."""

    type: str  # entity_state, room_occupancy, time, sun, numeric_state
    entity_id: str | None = None
    room_id: str | None = None
    state: str | None = None
    above: float | None = None
    below: float | None = None
    after: str | None = None  # Time in HH:MM format
    before: str | None = None  # Time in HH:MM format
    weekday: list[str] | None = None  # mon, tue, wed, thu, fri, sat, sun

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        data: dict[str, Any] = {"type": self.type}
        if self.entity_id:
            data["entity_id"] = self.entity_id
        if self.room_id:
            data["room_id"] = self.room_id
        if self.state is not None:
            data["state"] = self.state
        if self.above is not None:
            data["above"] = self.above
        if self.below is not None:
            data["below"] = self.below
        if self.after:
            data["after"] = self.after
        if self.before:
            data["before"] = self.before
        if self.weekday:
            data["weekday"] = self.weekday
        return data

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> RuleCondition:
        """Create from dictionary."""
        return cls(
            type=data.get("type", "entity_state"),
            entity_id=data.get("entity_id"),
            room_id=data.get("room_id"),
            state=data.get("state"),
            above=data.get("above"),
            below=data.get("below"),
            after=data.get("after"),
            before=data.get("before"),
            weekday=data.get("weekday"),
        )

    def to_ha_condition(self) -> dict[str, Any]:
        """Convert to Home Assistant automation condition format."""
        if self.type == "entity_state":
            return {
                "condition": "state",
                "entity_id": self.entity_id,
                "state": self.state,
            }
        elif self.type == "room_occupancy":
            return {
                "condition": "state",
                "entity_id": f"binary_sensor.fp_{self.room_id}_occupancy",
                "state": self.state,
            }
        elif self.type == "numeric_state":
            condition: dict[str, Any] = {
                "condition": "numeric_state",
                "entity_id": self.entity_id,
            }
            if self.above is not None:
                condition["above"] = self.above
            if self.below is not None:
                condition["below"] = self.below
            return condition
        elif self.type == "time":
            condition = {"condition": "time"}
            if self.after:
                condition["after"] = self.after
            if self.before:
                condition["before"] = self.before
            if self.weekday:
                condition["weekday"] = self.weekday
            return condition
        elif self.type == "sun":
            return {
                "condition": "sun",
                "after": self.after,
                "before": self.before,
            }
        return {"condition": "state", "entity_id": self.entity_id, "state": self.state}


@dataclass
class RuleAction:
    """Action for a visual automation rule."""

    type: str  # service_call, delay, wait
    service: str | None = None
    entity_id: str | None = None
    data: dict[str, Any] | None = None
    delay_seconds: float | None = None
    wait_template: str | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        result: dict[str, Any] = {"type": self.type}
        if self.service:
            result["service"] = self.service
        if self.entity_id:
            result["entity_id"] = self.entity_id
        if self.data:
            result["data"] = self.data
        if self.delay_seconds is not None:
            result["delay_seconds"] = self.delay_seconds
        if self.wait_template:
            result["wait_template"] = self.wait_template
        return result

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> RuleAction:
        """Create from dictionary."""
        return cls(
            type=data.get("type", "service_call"),
            service=data.get("service"),
            entity_id=data.get("entity_id"),
            data=data.get("data"),
            delay_seconds=data.get("delay_seconds"),
            wait_template=data.get("wait_template"),
        )

    def to_ha_action(self) -> dict[str, Any]:
        """Convert to Home Assistant automation action format."""
        if self.type == "service_call":
            action: dict[str, Any] = {"service": self.service}
            if self.entity_id:
                action["target"] = {"entity_id": self.entity_id}
            if self.data:
                action["data"] = self.data
            return action
        elif self.type == "delay":
            return {"delay": {"seconds": self.delay_seconds}}
        elif self.type == "wait":
            return {"wait_template": self.wait_template}
        return {"service": self.service}


@dataclass
class VisualRule:
    """Visual automation rule that can be rendered on the floor plan."""

    id: str = field(default_factory=_generate_id)
    name: str = ""
    description: str = ""
    enabled: bool = True
    floor_plan_id: str = ""

    # Trigger
    trigger_type: str = "room_occupancy"  # room_occupancy, entity_state, time, sun
    trigger_room_id: str | None = None
    trigger_entity_id: str | None = None
    trigger_state: str | None = None  # on, off, occupied, vacant
    trigger_for: int | None = None  # Duration in seconds

    # Conditions (all must be true)
    conditions: list[RuleCondition] = field(default_factory=list)

    # Actions
    actions: list[RuleAction] = field(default_factory=list)

    # Visual representation
    source_room_id: str | None = None  # Room where automation originates
    target_entity_ids: list[str] = field(default_factory=list)  # Entities affected
    color: str = "#3b82f6"  # Visual color for the rule

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "enabled": self.enabled,
            "floor_plan_id": self.floor_plan_id,
            "trigger_type": self.trigger_type,
            "trigger_room_id": self.trigger_room_id,
            "trigger_entity_id": self.trigger_entity_id,
            "trigger_state": self.trigger_state,
            "trigger_for": self.trigger_for,
            "conditions": [c.to_dict() for c in self.conditions],
            "actions": [a.to_dict() for a in self.actions],
            "source_room_id": self.source_room_id,
            "target_entity_ids": self.target_entity_ids,
            "color": self.color,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> VisualRule:
        """Create from dictionary."""
        return cls(
            id=data.get("id", _generate_id()),
            name=data.get("name", ""),
            description=data.get("description", ""),
            enabled=data.get("enabled", True),
            floor_plan_id=data.get("floor_plan_id", ""),
            trigger_type=data.get("trigger_type", "room_occupancy"),
            trigger_room_id=data.get("trigger_room_id"),
            trigger_entity_id=data.get("trigger_entity_id"),
            trigger_state=data.get("trigger_state"),
            trigger_for=data.get("trigger_for"),
            conditions=[RuleCondition.from_dict(c) for c in data.get("conditions", [])],
            actions=[RuleAction.from_dict(a) for a in data.get("actions", [])],
            source_room_id=data.get("source_room_id"),
            target_entity_ids=data.get("target_entity_ids", []),
            color=data.get("color", "#3b82f6"),
        )

    def to_ha_automation(self) -> dict[str, Any]:
        """Convert to Home Assistant automation format."""
        automation: dict[str, Any] = {
            "alias": self.name,
            "description": self.description,
            "mode": "single",
        }

        # Build trigger
        if self.trigger_type == "room_occupancy":
            trigger: dict[str, Any] = {
                "platform": "state",
                "entity_id": f"binary_sensor.fp_{self.trigger_room_id}_occupancy",
                "to": self.trigger_state,
            }
            if self.trigger_for:
                trigger["for"] = {"seconds": self.trigger_for}
            automation["trigger"] = [trigger]
        elif self.trigger_type == "entity_state":
            trigger = {
                "platform": "state",
                "entity_id": self.trigger_entity_id,
                "to": self.trigger_state,
            }
            if self.trigger_for:
                trigger["for"] = {"seconds": self.trigger_for}
            automation["trigger"] = [trigger]
        elif self.trigger_type == "time":
            automation["trigger"] = [{"platform": "time", "at": self.trigger_state}]
        elif self.trigger_type == "sun":
            automation["trigger"] = [{"platform": "sun", "event": self.trigger_state}]

        # Build conditions
        if self.conditions:
            automation["condition"] = [c.to_ha_condition() for c in self.conditions]

        # Build actions
        automation["action"] = [a.to_ha_action() for a in self.actions]

        return automation
