"""Data models for Inhabit Floor Plan Builder."""

from .automation_rule import RuleAction, RuleCondition, VisualRule
from .device_placement import LightPlacement, SwitchPlacement
from .floor_plan import (
    BoundingBox,
    Coordinates,
    Door,
    Floor,
    FloorPlan,
    Polygon,
    Room,
    Wall,
    Window,
)
from .virtual_sensor import OccupancyStateData, VirtualSensorConfig
from .zone import Zone

__all__ = [
    "BoundingBox",
    "Coordinates",
    "LightPlacement",
    "SwitchPlacement",
    "Door",
    "Floor",
    "FloorPlan",
    "OccupancyStateData",
    "Polygon",
    "Room",
    "RuleAction",
    "RuleCondition",
    "VirtualSensorConfig",
    "VisualRule",
    "Wall",
    "Window",
    "Zone",
]
