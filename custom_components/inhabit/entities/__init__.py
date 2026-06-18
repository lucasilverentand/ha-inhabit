"""Entity platforms for Inhabit."""

from .binary_sensor import VirtualOccupancySensor, VirtualOutsideExposureSensor
from .button import OccupancyOverrideButton
from .const import (
    ENTITY_PREFIX,
    SUFFIX_OCCUPANCY,
    SUFFIX_OUTSIDE_EXPOSURE,
    SUFFIX_OVERRIDE,
)

__all__ = [
    "VirtualOccupancySensor",
    "VirtualOutsideExposureSensor",
    "OccupancyOverrideButton",
    "ENTITY_PREFIX",
    "SUFFIX_OCCUPANCY",
    "SUFFIX_OUTSIDE_EXPOSURE",
    "SUFFIX_OVERRIDE",
]
