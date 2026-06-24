"""Global occupancy policy profiles.

Profiles are the user-facing policy layer.  The engine still consumes the
lower-level VirtualSensorConfig fields, and this module is the single mapping
between both concepts.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Final

PROFILE_TRANSIT: Final = "transit"
PROFILE_SHORT_STAY: Final = "short_stay"
PROFILE_LONG_STAY: Final = "long_stay"
PROFILE_OPEN_AREA: Final = "open_area"
PROFILE_SLEEP: Final = "sleep"
PROFILE_UTILITY: Final = "utility"

DEFAULT_ROOM_PROFILE: Final = PROFILE_SHORT_STAY
DEFAULT_ZONE_PROFILE: Final = PROFILE_OPEN_AREA

EXIT_CHECK_DELAY_SECONDS: Final = 15
OVERRIDE_SAFETY_TIMEOUT_SECONDS: Final = 30 * 60
CLOSED_DOOR_HYBRID_CHECK_SECONDS: Final = 10 * 60
RESTART_HISTORY_LOOKBACK_SECONDS: Final = 5 * 60

POLICY_OVERRIDE_FIELDS: Final = frozenset(
    {
        "motion_timeout",
        "checking_timeout",
        "presence_timeout",
        "unsealed_activity_timeout",
        "exit_check_delay",
        "override_safety_timeout",
        "closed_door_hybrid_check",
        "door_seals_room",
        "long_stay",
        "hold_until_exit",
        "phantom_hold_seconds",
    }
)

_POLICY_BOOL_FIELDS: Final = frozenset(
    {"door_seals_room", "long_stay", "hold_until_exit"}
)


@dataclass(frozen=True)
class OccupancyProfile:
    """Concrete settings for one occupancy profile."""

    id: str
    label: str
    description: str
    motion_timeout: int
    checking_timeout: int
    presence_timeout: int
    unsealed_activity_timeout: int
    door_seals_room: bool
    long_stay: bool = False
    hold_until_exit: bool = False
    phantom_hold_seconds: int = 0

    def to_dict(self) -> dict[str, Any]:
        """Serialize for API/UI use."""
        return {
            "id": self.id,
            "label": self.label,
            "description": self.description,
            "motion_timeout": self.motion_timeout,
            "checking_timeout": self.checking_timeout,
            "presence_timeout": self.presence_timeout,
            "unsealed_activity_timeout": self.unsealed_activity_timeout,
            "door_seals_room": self.door_seals_room,
            "long_stay": self.long_stay,
            "hold_until_exit": self.hold_until_exit,
            "phantom_hold_seconds": self.phantom_hold_seconds,
            "exit_check_delay": EXIT_CHECK_DELAY_SECONDS,
            "override_safety_timeout": OVERRIDE_SAFETY_TIMEOUT_SECONDS,
            "closed_door_hybrid_check": CLOSED_DOOR_HYBRID_CHECK_SECONDS,
        }


OCCUPANCY_PROFILES: Final[dict[str, OccupancyProfile]] = {
    PROFILE_TRANSIT: OccupancyProfile(
        id=PROFILE_TRANSIT,
        label="Transit",
        description="Fast hallway and pass-through behavior with a short path hold.",
        motion_timeout=30,
        checking_timeout=15,
        presence_timeout=60,
        unsealed_activity_timeout=30,
        door_seals_room=False,
        phantom_hold_seconds=30,
    ),
    PROFILE_SHORT_STAY: OccupancyProfile(
        id=PROFILE_SHORT_STAY,
        label="Short Stay",
        description="Bathroom/toilet behavior with door-aware confirmation.",
        motion_timeout=45,
        checking_timeout=30,
        presence_timeout=300,
        unsealed_activity_timeout=45,
        door_seals_room=True,
    ),
    PROFILE_LONG_STAY: OccupancyProfile(
        id=PROFILE_LONG_STAY,
        label="Long Stay",
        description="Living/dining behavior that tolerates quiet occupied periods.",
        motion_timeout=120,
        checking_timeout=60,
        presence_timeout=600,
        unsealed_activity_timeout=300,
        door_seals_room=True,
        long_stay=True,
    ),
    PROFILE_OPEN_AREA: OccupancyProfile(
        id=PROFILE_OPEN_AREA,
        label="Open Area",
        description="Doorless spaces using evidence decay instead of sealing.",
        motion_timeout=120,
        checking_timeout=30,
        presence_timeout=300,
        unsealed_activity_timeout=180,
        door_seals_room=False,
    ),
    PROFILE_SLEEP: OccupancyProfile(
        id=PROFILE_SLEEP,
        label="Sleep",
        description="Bedroom/bed behavior that holds until an exit signal.",
        motion_timeout=300,
        checking_timeout=60,
        presence_timeout=1800,
        unsealed_activity_timeout=600,
        door_seals_room=True,
        long_stay=True,
        hold_until_exit=True,
    ),
    PROFILE_UTILITY: OccupancyProfile(
        id=PROFILE_UTILITY,
        label="Utility",
        description="Fast but safe behavior for closets and utility rooms.",
        motion_timeout=30,
        checking_timeout=15,
        presence_timeout=120,
        unsealed_activity_timeout=60,
        door_seals_room=True,
    ),
}

SUPPORTED_OCCUPANCY_PROFILES: Final = tuple(OCCUPANCY_PROFILES)


def normalize_occupancy_profile(
    profile: str | None, *, default: str = DEFAULT_ROOM_PROFILE
) -> str:
    """Return a supported profile id."""
    if profile in OCCUPANCY_PROFILES:
        return profile
    if default in OCCUPANCY_PROFILES:
        return default
    return DEFAULT_ROOM_PROFILE


def occupancy_profiles_payload() -> dict[str, Any]:
    """Return the API payload for available profiles and global policy values."""
    return {
        "profiles": [profile.to_dict() for profile in OCCUPANCY_PROFILES.values()],
        "editable_fields": sorted(POLICY_OVERRIDE_FIELDS),
        "defaults": {
            "room": DEFAULT_ROOM_PROFILE,
            "zone": DEFAULT_ZONE_PROFILE,
            "exit_check_delay": EXIT_CHECK_DELAY_SECONDS,
            "override_safety_timeout": OVERRIDE_SAFETY_TIMEOUT_SECONDS,
            "closed_door_hybrid_check": CLOSED_DOOR_HYBRID_CHECK_SECONDS,
            "restart_history_lookback": RESTART_HISTORY_LOOKBACK_SECONDS,
        },
    }


def normalize_policy_overrides(overrides: Any) -> dict[str, Any]:
    """Return supported policy overrides with predictable value types."""
    if not isinstance(overrides, dict):
        return {}

    normalized: dict[str, Any] = {}
    for key, value in overrides.items():
        if key not in POLICY_OVERRIDE_FIELDS:
            continue
        if key in _POLICY_BOOL_FIELDS:
            normalized[key] = bool(value)
        else:
            normalized[key] = max(0, int(value))
    return normalized


def apply_occupancy_profile(config: Any, profile: str | None = None) -> Any:
    """Apply a profile to a config-like object in place and return it."""
    selected_id = normalize_occupancy_profile(
        profile if profile is not None else getattr(config, "occupancy_profile", None)
    )
    selected = OCCUPANCY_PROFILES[selected_id]

    config.occupancy_profile = selected_id
    config.motion_timeout = selected.motion_timeout
    config.checking_timeout = selected.checking_timeout
    config.presence_timeout = selected.presence_timeout
    config.unsealed_activity_timeout = selected.unsealed_activity_timeout
    config.door_seals_room = selected.door_seals_room
    config.door_blocks_vacancy = selected.door_seals_room
    config.long_stay = selected.long_stay
    config.hold_until_exit = selected.hold_until_exit
    config.phantom_hold_seconds = selected.phantom_hold_seconds
    config.exit_check_delay = EXIT_CHECK_DELAY_SECONDS
    config.override_safety_timeout = OVERRIDE_SAFETY_TIMEOUT_SECONDS
    config.closed_door_hybrid_check = CLOSED_DOOR_HYBRID_CHECK_SECONDS
    config.restart_history_lookback = RESTART_HISTORY_LOOKBACK_SECONDS
    policy_overrides = normalize_policy_overrides(
        getattr(config, "policy_overrides", {})
    )
    config.policy_overrides = policy_overrides
    for key, value in policy_overrides.items():
        setattr(config, key, value)
    config.door_blocks_vacancy = config.door_seals_room
    return config


def apply_occupancy_profile_to_region(
    region: Any,
    profile: str | None = None,
    *,
    default: str = DEFAULT_ROOM_PROFILE,
) -> Any:
    """Apply profile-derived fields to a Room/Zone-like object."""
    selected_id = normalize_occupancy_profile(
        profile if profile is not None else getattr(region, "occupancy_profile", None),
        default=default,
    )
    selected = OCCUPANCY_PROFILES[selected_id]
    region.occupancy_profile = selected_id
    region.motion_timeout = selected.motion_timeout
    region.checking_timeout = selected.checking_timeout
    region.long_stay = selected.long_stay
    region.phantom_hold_seconds = selected.phantom_hold_seconds
    if hasattr(region, "is_transit"):
        region.is_transit = selected_id == PROFILE_TRANSIT
    return region
