# Inhabit Floor Plan Builder

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/v/release/lucasilverentand/ha-inhabit)](https://github.com/lucasilverentand/ha-inhabit/releases)
[![License](https://img.shields.io/github/license/lucasilverentand/ha-inhabit)](LICENSE)

A HACS-compatible Home Assistant integration for creating visual floor plans, placing devices, and generating virtual occupancy sensors with intelligent door-aware state machine logic.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=lucasilverentand&repository=ha-inhabit&category=integration)

## Features

- **Visual Floor Plan Editor**: Draw multi-floor home layouts with an SVG-based canvas
- **Device Placement**: Drag and drop Home Assistant entities onto your floor plan
- **Virtual Occupancy Sensors**: Create room-level occupancy sensors that combine multiple physical sensors
- **Door-Aware Logic**: Intelligent state machine that considers door states for accurate occupancy detection
- **Spatial Automations**: Create visual automation rules based on room occupancy
- **Lovelace Export**: Generate Lovelace cards from your floor plans

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click "Integrations"
3. Click the three dots menu and select "Custom repositories"
4. Add this repository URL and select "Integration" as the category
5. Search for "Inhabit Floor Plan Builder" and install it
6. Restart Home Assistant

### Manual Installation

1. Download the latest release
2. Copy the `custom_components/inhabit` directory to your Home Assistant's `custom_components` directory
3. Restart Home Assistant

## Configuration

1. Go to Settings → Devices & Services
2. Click "Add Integration"
3. Search for "Inhabit Floor Plan Builder"
4. Follow the setup wizard

## Usage

### Creating a Floor Plan

1. Navigate to the Inhabit panel in the sidebar
2. Click "Create Floor Plan"
3. Use the drawing tools to create rooms:
   - **Room Tool**: Click to place vertices, close the polygon to create a room
   - **Wall Tool**: Draw individual walls
   - **Door/Window Tools**: Place doors and windows on walls

### Placing Devices

1. Open the Entities panel in the sidebar
2. Filter by domain (light, sensor, etc.)
3. Drag entities from the list onto the floor plan
4. Configure device properties in the Properties panel

### Virtual Occupancy Sensors

Each room automatically gets a virtual occupancy sensor (`binary_sensor.fp_{room_id}_occupancy`) with:

- **State Machine States**:
  - `VACANT`: No presence detected
  - `OCCUPIED`: Motion or presence detected
  - `CHECKING`: Sensors cleared, waiting to confirm vacancy

- **Door-Aware Logic**: A fresh detection after doors close confirms a room should stay occupied until a door opens or becomes unavailable

- **Configurable Timeouts**:
  - Motion timeout: Time after last motion before entering CHECKING
  - Checking timeout: Time in CHECKING before transitioning to VACANT

### Creating Automations

1. Open a floor plan
2. Select a room
3. Create a visual rule in the Automation panel
4. Configure triggers, conditions, and actions
5. Export as Home Assistant automation YAML

## Services

### `inhabit.set_room_occupancy`
Manually set a room's occupancy state.

```yaml
service: inhabit.set_room_occupancy
data:
  room_id: "living_room"
  state: "occupied"  # vacant, occupied, checking
```

### `inhabit.refresh_sensors`
Refresh all virtual occupancy sensors.

```yaml
service: inhabit.refresh_sensors
```

### `inhabit.export_automation`
Export a visual rule as Home Assistant automation YAML.

### `inhabit.export_card`
Export a floor plan or room as Lovelace card YAML.

## Development

### Prerequisites

- Python 3.11+
- Node.js 20+
- Home Assistant development environment

### Setup

```bash
# Clone the repository
git clone https://github.com/lucasilverentand/ha-inhabit.git
cd ha-inhabit

# Install Python dependencies
pip install -r requirements-dev.txt

# Install frontend dependencies
cd frontend
npm install

# Build frontend
npm run build
```

### Running Tests

```bash
# Backend tests
pytest tests/ -v --cov=custom_components/inhabit

# Frontend tests
cd frontend
npm test
```

### Local Occupancy Simulator

The deterministic simulator in `tests/fake_house` drives the production
occupancy state machine and transition predictor with an anonymized multi-area
home layout. Use it for hallway, door, and mmWave-style scenarios without
touching a live Home Assistant instance.

```bash
uv run --no-sync python -m tests.fake_house.local_home_scenarios --scenario all
uv run --no-sync python -m tests.fake_house.local_home_scenarios --show-layout
```

Available scenarios:

- `hallway_to_short_stay`: open area -> transit -> short-stay room, door left
  open, then closed with spatial confirmation.
- `hallway_left_open_to_short_stay_then_close`: entry -> transit hallway ->
  short-stay room with the door left open, then closed and resealed by mmWave.
- `hallway_multi_mmwave_clears_after_last_target`: hallway occupancy stays on
  while any hallway mmWave source still has a target and clears after the last
  target drops.
- `short_stay_exit_back_to_hallway`: settled short-stay occupancy exits into
  the hallway and both rooms settle cleanly.
- `quick_exit_after_settled_occupancy`: settled occupancy, quick door
  open/close, then an empty signal.
- `door_bounce_person_remains_after_settled_occupancy`: settled occupancy,
  quick door bounce, and mmWave still seeing a person inside.
- `repeated_door_bounces_do_not_wake_hallway`: repeated short-stay door bounces
  do not leave the hallway occupied.
- `door_left_open_mmwave_keeps_short_stay_occupied`: open door with PIR clear
  keeps the short-stay room occupied while mmWave remains active.
- `door_left_open_exit_clears_after_unsealed_check`: settled short-stay
  occupancy exits with the door left open and clears after the empty check.
- `door_sensor_unavailable_recovers_with_active_presence`: door sensor outage
  breaks the seal but active mmWave keeps occupancy until the door recovers.
- `multi_target_partial_exit_keeps_source_occupied`: one target leaves a
  multi-target open area while another target keeps the source occupied.
- `two_people_cross_hallway_independently`: two independent hallway crossings
  settle without stranding transit occupancy.
- `transit_reentry_during_phantom_keeps_hallway_live`: a real hallway re-entry
  still works after high-degree transit clears.
- `all_direct_routes_settle_without_stuck_hallway`: every direct local route,
  in both directions, settles without stale hallway occupancy.
- `startup_clear_sensors_stays_vacant`: startup/reload with clear sensors
  leaves all rooms vacant.
- `startup_open_doors_clear_sensors_stays_vacant`: startup/reload with
  restored open doors and clear sensors leaves all rooms vacant.
- `startup_single_room_presence_does_not_wake_hallway`: restored room presence
  does not synthesize hallway occupancy on startup.
- `startup_hallway_presence_clears_without_waking_rooms`: restored hallway
  presence clears without waking adjacent rooms.
- `startup_each_room_presence_clears_without_cross_room_wake`: each restored
  room presence clears without waking another room.
- `startup_multiple_room_presence_clears_independently`: multiple restored room
  presences clear independently without waking transit.
- `startup_restored_presence_door_open_wakes_hallway`: restored room presence
  still predicts a hallway exit after a real door-open event.
- `open_door_override_real_activity_survives_safety_timer`: open-door override
  converts back to sensor-derived occupancy when real activity appears.
- `closed_door_override_hold`: closed-door override survives safety expiry and
  releases when the door opens.
- `open_door_override_safety`: open-door override releases through the safety
  timer.
- `vertical_transit_phantom`: mirrored transit phantom creation and expiry.

### Project Structure

```
ha-inhabit/
├── custom_components/inhabit/
│   ├── models/          # Data models (dataclasses)
│   ├── store/           # Persistence layer
│   ├── engine/          # Occupancy state machine
│   ├── generators/      # Automation & card generators
│   ├── api/             # WebSocket & HTTP APIs
│   └── entities/        # Entity platforms
├── frontend/
│   └── src/             # Lit 3.x frontend components
└── tests/
    ├── fake_house/      # House simulator for testing
    ├── unit/            # Unit tests
    └── integration/     # Integration tests
```

## Architecture

### Occupancy State Machine

```
VACANT ──[motion/presence]──► OCCUPIED
                                  │
                          [all sensors clear]
                                  ▼
                              CHECKING ──[timeout]──► VACANT
                                  │
                          [motion/presence]
                                  │
                                  └──────────────► OCCUPIED
```

### Frontend Layers

1. **Background**: Floor plan images
2. **Structure**: Walls, doors, windows
3. **Furniture**: Furniture shapes
4. **Devices**: Entity markers
5. **Coverage**: Sensor coverage zones
6. **Labels**: Room names
7. **Automation**: Visual rule indicators

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
