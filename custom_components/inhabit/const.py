"""Constants for the Inhabit Floor Plan Builder integration."""
from typing import Final

DOMAIN: Final = "inhabit"

# Storage keys
STORAGE_KEY: Final = "inhabit.floor_plans"
STORAGE_VERSION: Final = 1

# Platform types
PLATFORMS: Final = ["binary_sensor"]

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

# Device categories
class DeviceCategory:
    """Device category constants."""
    LIGHT: Final = "light"
    SWITCH: Final = "switch"
    SENSOR: Final = "sensor"
    BINARY_SENSOR: Final = "binary_sensor"
    CLIMATE: Final = "climate"
    FAN: Final = "fan"
    COVER: Final = "cover"
    CAMERA: Final = "camera"
    MEDIA_PLAYER: Final = "media_player"
    VACUUM: Final = "vacuum"
    LOCK: Final = "lock"

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
