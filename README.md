# Inhabit Floor Plan Builder

A HACS-compatible Home Assistant integration for creating visual floor plans, placing devices, and generating virtual occupancy sensors with intelligent door-aware state machine logic.

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

- **Door-Aware Logic**: Closed doors can block vacancy transitions to prevent false negatives

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
