"""Constants for the Inhabit Floor Plan Builder integration."""

from typing import Final

DOMAIN: Final = "inhabit"

# Storage keys
STORAGE_KEY: Final = "inhabit.floor_plans"
STORAGE_VERSION: Final = 1

# Platform types
PLATFORMS: Final = ["binary_sensor", "button"]


# Occupancy states
class OccupancyState:
    """Occupancy state machine states."""

    VACANT: Final = "vacant"
    OCCUPIED: Final = "occupied"
    CHECKING: Final = "checking"


# Default timing (seconds)
DEFAULT_CHECKING_TIMEOUT: Final = 30
DEFAULT_MOTION_TIMEOUT: Final = 120
DEFAULT_PRESENCE_TIMEOUT: Final = 300
DEFAULT_SEAL_MAX_DURATION: Final = 14400  # 4 hours
DEFAULT_LONG_STAY_SEAL_MAX_DURATION: Final = 28800  # 8 hours
DEFAULT_SEAL_HALF_LIFE: Final = 3600  # 1 hour
DEFAULT_HOUSE_GUARD_MAX_DURATION: Final = 86400  # 24 hours

# Phantom presence (transition prediction)
DEFAULT_TRANSIT_PHANTOM_HOLD: Final = 300  # 5 minutes for hallways/corridors
DEFAULT_PHANTOM_HOLD: Final = 0  # 0 = use room's checking_timeout (non-transit default)
PHANTOM_ZONE_PROXIMITY_THRESHOLD: Final = 50.0  # cm — zones closer than this are adjacent
TRANSITION_LEARNER_HISTORY_DAYS: Final = 14
TRANSITION_LEARNER_MIN_TRANSITIONS: Final = 50


# Device categories
class DeviceCategory:
    """Device category constants."""

    LIGHT: Final = "light"
    SWITCH: Final = "switch"
    MMWAVE: Final = "mmwave"
    BUTTON: Final = "button"
    OTHER: Final = "other"


# Sensor types for occupancy detection
MOTION_SENSOR_CLASSES: Final = ["motion", "occupancy", "presence"]
DOOR_SENSOR_CLASSES: Final = ["door", "opening", "garage_door"]
PRESENCE_SENSOR_CLASSES: Final = ["presence", "occupancy"]

# WebSocket commands
WS_PREFIX: Final = "inhabit"

# Services
SERVICE_SET_ROOM_OCCUPANCY: Final = "set_room_occupancy"
SERVICE_REFRESH_SENSORS: Final = "refresh_sensors"
SERVICE_EXPORT_AUTOMATION: Final = "export_automation"
SERVICE_EXPORT_CARD: Final = "export_card"

# Attributes
ATTR_FLOOR_PLAN_ID: Final = "floor_plan_id"
ATTR_ROOM_ID: Final = "room_id"
ATTR_STATE_MACHINE_STATE: Final = "state_machine_state"
ATTR_CONFIDENCE: Final = "confidence"
ATTR_LAST_MOTION_AT: Final = "last_motion_at"
ATTR_LAST_PRESENCE_AT: Final = "last_presence_at"
ATTR_CONTRIBUTING_SENSORS: Final = "contributing_sensors"
ATTR_SEALED: Final = "sealed"
ATTR_SEALED_SINCE: Final = "sealed_since"
ATTR_SEAL_PROBABILITY: Final = "seal_probability"
ATTR_HOUSE_SEALED: Final = "house_sealed"
ATTR_SENSOR_DIAGNOSTICS: Final = "sensor_diagnostics"

# Events
EVENT_CHECKING_STARTED: Final = f"{DOMAIN}_checking_started"
EVENT_CHECKING_RESOLVED: Final = f"{DOMAIN}_checking_resolved"
EVENT_OVERRIDE_RECORDED: Final = f"{DOMAIN}_override_recorded"

# Layer names for frontend
LAYER_BACKGROUND: Final = "background"
LAYER_STRUCTURE: Final = "structure"
LAYER_FURNITURE: Final = "furniture"
LAYER_DEVICES: Final = "devices"
LAYER_COVERAGE: Final = "coverage"
LAYER_LABELS: Final = "labels"
LAYER_AUTOMATION: Final = "automation"

LAYERS: Final = [
    LAYER_BACKGROUND,
    LAYER_STRUCTURE,
    LAYER_FURNITURE,
    LAYER_DEVICES,
    LAYER_COVERAGE,
    LAYER_LABELS,
    LAYER_AUTOMATION,
]

# Events
EVENT_FALSE_VACANCY_DETECTED: Final = f"{DOMAIN}_false_vacancy_detected"
