"""Binary sensor platform for Inhabit.

This module re-exports the platform setup from entities/binary_sensor.py
following Home Assistant's expected platform discovery pattern.
"""

from .entities.binary_sensor import (
    VirtualOccupancySensor,
    async_setup_entry,
)

__all__ = ["async_setup_entry", "VirtualOccupancySensor"]
