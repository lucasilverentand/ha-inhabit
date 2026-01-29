"""Data models for Inhabit Floor Plan Builder."""

from .automation_rule import RuleAction, RuleCondition, VisualRule
from .device_placement import DevicePlacement, SensorCoverage
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

__all__ = [
    "BoundingBox",
    "Coordinates",
    "DevicePlacement",
    "Door",
    "Floor",
    "FloorPlan",
    "OccupancyStateData",
    "Polygon",
    "Room",
    "RuleAction",
    "RuleCondition",
    "SensorCoverage",
    "VirtualSensorConfig",
    "VisualRule",
    "Wall",
    "Window",
]
