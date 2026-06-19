"""Shared preview/apply helpers for AI-readable sensor config edits."""

from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from .models.virtual_sensor import SensorBinding, VirtualSensorConfig

if TYPE_CHECKING:
    from .store.floor_plan_store import FloorPlanStore


CONFIG_PATCH_FIELDS = {
    "enabled",
    "motion_timeout",
    "checking_timeout",
    "presence_timeout",
    "unsealed_activity_timeout",
    "motion_sensors",
    "presence_sensors",
    "occupancy_sensors",
    "door_sensors",
    "hint_sensors",
    "exit_sensors",
    "hold_until_exit",
    "occupies_parent",
    "presence_affects",
    "spatial_presence_delay",
    "door_seals_room",
    "seal_max_duration",
    "seal_half_life",
    "long_stay",
    "override_trigger_entity",
    "override_trigger_action",
    "door_blocks_vacancy",
    "door_open_resets_checking",
    "occupied_threshold",
    "vacant_threshold",
    "time_of_day_profiles",
    "adaptive_timeouts",
}

_SENSOR_LIST_FIELDS = {
    "motion_sensors",
    "presence_sensors",
    "occupancy_sensors",
    "door_sensors",
    "hint_sensors",
    "exit_sensors",
}


@dataclass
class ConfigPatchResult:
    """Result of previewing or applying a sensor config patch."""

    valid: bool
    current: dict[str, Any]
    proposed: dict[str, Any]
    diff: list[dict[str, Any]]
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)
    config: VirtualSensorConfig | None = None

    def to_dict(self) -> dict[str, Any]:
        """Serialize for services and WebSocket responses."""
        result = {
            "valid": self.valid,
            "current": self.current,
            "proposed": self.proposed,
            "diff": self.diff,
            "warnings": self.warnings,
            "errors": self.errors,
        }
        if self.config is not None:
            result["config"] = self.config.to_dict()
        return result


def preview_sensor_config_patch(
    store: FloorPlanStore,
    room_id: str,
    patch: dict[str, Any],
) -> ConfigPatchResult:
    """Preview a sensor config patch without persisting it."""
    errors: list[str] = []
    warnings: list[str] = []

    if not isinstance(patch, dict):
        return ConfigPatchResult(
            valid=False,
            current={},
            proposed={},
            diff=[],
            errors=["patch must be an object"],
        )

    floor_plan_id = store.find_floor_plan_id_for_room(room_id)
    if not floor_plan_id:
        return ConfigPatchResult(
            valid=False,
            current={},
            proposed={},
            diff=[],
            errors=["room or zone not found in any floor plan"],
        )

    unknown_fields = sorted(set(patch) - CONFIG_PATCH_FIELDS)
    if unknown_fields:
        errors.append(f"unknown fields: {', '.join(unknown_fields)}")

    current_config = store.get_sensor_config(room_id) or VirtualSensorConfig(
        room_id=room_id,
        floor_plan_id=floor_plan_id,
        enabled=False,
    )
    current = current_config.to_dict()
    proposed = deepcopy(current)

    for key, value in patch.items():
        if key in unknown_fields:
            continue
        if key == "spatial_presence_delay":
            proposed[key] = None if value is None else max(0, int(value))
        elif key in _SENSOR_LIST_FIELDS:
            if not isinstance(value, list):
                errors.append(f"{key} must be a list")
                continue
            proposed[key] = [SensorBinding.from_dict(item).to_dict() for item in value]
        else:
            proposed[key] = value

    if "door_blocks_vacancy" in patch and "door_seals_room" not in patch:
        proposed["door_seals_room"] = bool(proposed["door_blocks_vacancy"])
        warnings.append("door_blocks_vacancy is legacy; mapped to door_seals_room")
    proposed["door_blocks_vacancy"] = bool(proposed.get("door_seals_room", True))

    try:
        config = VirtualSensorConfig.from_dict(proposed)
    except (TypeError, ValueError) as err:
        config = None
        errors.append(f"invalid config values: {err}")

    if config and not (0.0 <= config.vacant_threshold <= config.occupied_threshold <= 1.0):
        errors.append(
            "thresholds must satisfy 0.0 <= vacant_threshold <= occupied_threshold <= 1.0"
        )

    diff = [
        {"field": key, "before": current.get(key), "after": proposed.get(key)}
        for key in sorted(proposed)
        if current.get(key) != proposed.get(key)
    ]

    return ConfigPatchResult(
        valid=not errors,
        current=current,
        proposed=proposed,
        diff=diff,
        warnings=warnings,
        errors=errors,
        config=config if not errors else None,
    )


async def apply_sensor_config_patch(
    store: FloorPlanStore,
    sensor_engine: Any,
    room_id: str,
    patch: dict[str, Any],
) -> ConfigPatchResult:
    """Validate, persist, and activate a sensor config patch."""
    result = preview_sensor_config_patch(store, room_id, patch)
    if not result.valid or result.config is None:
        return result

    existing = store.get_sensor_config(room_id)
    if existing is None:
        stored = store.create_sensor_config(result.config)
    else:
        stored = store.update_sensor_config(result.config)

    if stored is None:
        result.valid = False
        result.errors.append("failed to update sensor config")
        result.config = None
        return result

    await sensor_engine.async_update_room(stored)
    result.config = stored
    result.proposed = stored.to_dict()
    return result
