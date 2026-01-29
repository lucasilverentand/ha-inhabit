"""Data models for Inhabit Floor Plan Builder."""
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
from .device_placement import DevicePlacement, SensorCoverage
from .virtual_sensor import OccupancyStateData, VirtualSensorConfig
from .automation_rule import RuleAction, RuleCondition, VisualRule

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
