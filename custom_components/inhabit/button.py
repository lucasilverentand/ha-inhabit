"""Button platform for Inhabit.

This module re-exports the platform setup from entities/button.py
following Home Assistant's expected platform discovery pattern.
"""

from .entities.button import (
    OccupancyOverrideButton,
    async_setup_entry,
)

__all__ = ["async_setup_entry", "OccupancyOverrideButton"]
