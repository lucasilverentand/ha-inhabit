"""Entity platforms for Inhabit."""

from .binary_sensor import VirtualOccupancySensor
from .button import OccupancyOverrideButton
from .const import ENTITY_PREFIX, SUFFIX_OCCUPANCY, SUFFIX_OVERRIDE

__all__ = [
    "VirtualOccupancySensor",
    "OccupancyOverrideButton",
    "ENTITY_PREFIX",
    "SUFFIX_OCCUPANCY",
    "SUFFIX_OVERRIDE",
]
