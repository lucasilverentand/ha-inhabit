# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Inhabit is a Home Assistant custom integration for creating visual floor plans with device placement and virtual occupancy sensors. It's a full-stack project with a Python backend (Home Assistant integration) and TypeScript/Lit 3.x frontend.

## Common Commands

### Backend

```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run all tests with coverage
pytest tests/ -v --cov=custom_components/inhabit

# Run unit tests only
pytest tests/unit tests/test_standalone.py -v

# Run integration tests only
pytest tests/integration -v

# Lint
ruff check custom_components/ tests/
black --check custom_components/ tests/
isort --check-only --profile black custom_components/ tests/

# Format
black custom_components/ tests/
isort --profile black custom_components/ tests/
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build (outputs to custom_components/inhabit/frontend/dist/panel.js)
npm run build

# Watch mode for development
npm run watch

# Lint
npm run lint

# Test
npm test
```

## Architecture

### Backend (`custom_components/inhabit/`)

- **`__init__.py`**: Integration entry point - registers panels, WebSocket/HTTP APIs, services, and platforms
- **`models/`**: Dataclasses for FloorPlan, DevicePlacement, AutomationRule, VirtualSensor
- **`store/`**: Persistence layer (FloorPlanStore, ImageStore) using Home Assistant storage
- **`engine/`**: Occupancy detection logic
  - `occupancy_state_machine.py`: 3-state machine (VACANT → OCCUPIED → CHECKING → VACANT)
  - `presence_aggregator.py`: Combines multiple sensor inputs
  - `virtual_sensor_engine.py`: Creates/manages binary_sensor entities for rooms
- **`api/`**: WebSocket commands (`websocket.py`), HTTP endpoints (`http.py`), HA services (`services.py`)
- **`generators/`**: Export automation YAML and Lovelace cards
- **`entities/`**: Home Assistant entity platform implementations

### Frontend (`frontend/src/`)

- **`ha-floorplan-builder.ts`**: Main Lit 3.x Web Component
- Uses Preact Signals for reactive state management
- 7 canvas layers: background, structure, furniture, devices, coverage, labels, automation

### Key Data Flow

1. Frontend sends WebSocket commands to backend
2. Backend persists via FloorPlanStore
3. VirtualSensorEngine creates binary_sensor entities for room occupancy
4. State machine monitors motion/presence sensors and manages VACANT/OCCUPIED/CHECKING states

## Testing

- **`tests/fake_house/`**: House simulator for controlled testing scenarios
- **`tests/unit/`**: Unit tests for models, store, engine
- **`tests/integration/`**: Full Home Assistant integration tests
- Tests use pytest-asyncio with `asyncio_mode=auto`
- Socket/timeout restrictions enforced via pytest plugins

## Key Files

- `manifest.json`: Integration metadata (domain: `inhabit`, version, dependencies)
- `const.py`: Constants including occupancy states, sensor classes, layer definitions
- `services.yaml`: Home Assistant service definitions
