"""Schema migration utilities for Inhabit storage."""
from __future__ import annotations

import logging
from typing import Any

_LOGGER = logging.getLogger(__name__)


def migrate_data(data: dict[str, Any], from_version: int, to_version: int) -> dict[str, Any]:
    """Migrate data between schema versions."""
    if from_version == to_version:
        return data

    _LOGGER.info("Migrating data from version %d to %d", from_version, to_version)

    current_version = from_version
    while current_version < to_version:
        migration_func = MIGRATIONS.get(current_version + 1)
        if migration_func:
            data = migration_func(data)
            _LOGGER.debug("Applied migration to version %d", current_version + 1)
        current_version += 1

    return data


def _migrate_to_v2(data: dict[str, Any]) -> dict[str, Any]:
    """Migrate from v1 to v2."""
    # Example migration: Add new fields with defaults
    for fp_data in data.get("floor_plans", {}).values():
        # Add grid_size if missing
        if "grid_size" not in fp_data:
            fp_data["grid_size"] = 10.0

        # Add unit if missing
        if "unit" not in fp_data:
            fp_data["unit"] = "cm"

        # Update rooms with new fields
        for floor_data in fp_data.get("floors", []):
            for room_data in floor_data.get("rooms", []):
                if "motion_timeout" not in room_data:
                    room_data["motion_timeout"] = 120
                if "checking_timeout" not in room_data:
                    room_data["checking_timeout"] = 30
                if "connected_rooms" not in room_data:
                    room_data["connected_rooms"] = []

    return data


# Map of version number to migration function
MIGRATIONS: dict[int, Any] = {
    2: _migrate_to_v2,
}
