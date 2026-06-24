"""Anonymized multi-room house fixture for local simulator testing."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..const import DEFAULT_TRANSIT_PHANTOM_HOLD
from ..models.floor_plan import Coordinates, Edge, Floor, FloorPlan, Node, Polygon, Room
from ..models.mmwave_sensor import MmwavePlacement
from ..models.virtual_sensor import SensorBinding, VirtualSensorConfig
from ..occupancy_policy import (
    PROFILE_LONG_STAY,
    PROFILE_OPEN_AREA,
    PROFILE_SHORT_STAY,
    PROFILE_SLEEP,
    PROFILE_TRANSIT,
    PROFILE_UTILITY,
    apply_occupancy_profile,
    apply_occupancy_profile_to_region,
)

LOCAL_SIMULATOR_FLOOR_PLAN_ID = "local_simulator_home"
LOCAL_SIMULATOR_FLOOR_PLAN_NAME = "Inhabit Local Simulator"


@dataclass(frozen=True)
class LocalSimulatorRoomSpec:
    """An anonymized room in the local simulator fixture."""

    id: str
    name: str
    floor: str
    connected_rooms: tuple[str, ...]
    profile: str
    rect: tuple[float, float, float, float]
    mmwave_sources: tuple[str, ...] = ()


LOCAL_SIMULATOR_ROOM_SPECS: tuple[LocalSimulatorRoomSpec, ...] = (
    LocalSimulatorRoomSpec(
        "level0_entry",
        "Entry Node",
        "level_0",
        ("level0_front_hall",),
        PROFILE_TRANSIT,
        (20, 180, 120, 280),
    ),
    LocalSimulatorRoomSpec(
        "level0_front_hall",
        "Front Transit",
        "level_0",
        ("level0_entry", "level0_transit", "level0_utility"),
        PROFILE_TRANSIT,
        (120, 180, 260, 280),
    ),
    LocalSimulatorRoomSpec(
        "level0_transit",
        "Main Transit",
        "level_0",
        (
            "level0_front_hall",
            "level0_open_area",
            "level0_cooking",
            "level0_dining",
            "level0_short_stay_lobby",
            "level0_short_stay",
            "vertical_link",
        ),
        PROFILE_TRANSIT,
        (260, 150, 450, 300),
        ("hallway_ceiling_mmwave", "hallway_wall_mmwave"),
    ),
    LocalSimulatorRoomSpec(
        "level0_short_stay_lobby",
        "Short Stay Approach",
        "level_0",
        ("level0_transit", "level0_short_stay"),
        PROFILE_TRANSIT,
        (450, 300, 540, 390),
    ),
    LocalSimulatorRoomSpec(
        "level0_open_area",
        "Open Area Alpha",
        "level_0",
        ("level0_transit", "level0_cooking", "level0_dining"),
        PROFILE_LONG_STAY,
        (260, 20, 450, 150),
        ("open_area_mmwave",),
    ),
    LocalSimulatorRoomSpec(
        "level0_cooking",
        "Open Area Beta",
        "level_0",
        ("level0_transit", "level0_open_area", "level0_dining"),
        PROFILE_OPEN_AREA,
        (450, 20, 620, 150),
        ("cooking_mmwave",),
    ),
    LocalSimulatorRoomSpec(
        "level0_dining",
        "Open Area Gamma",
        "level_0",
        ("level0_transit", "level0_open_area", "level0_cooking"),
        PROFILE_OPEN_AREA,
        (620, 20, 780, 150),
    ),
    LocalSimulatorRoomSpec(
        "level0_short_stay",
        "Short Stay Alpha",
        "level_0",
        ("level0_transit", "level0_short_stay_lobby"),
        PROFILE_SHORT_STAY,
        (450, 150, 600, 300),
        ("short_stay_mmwave",),
    ),
    LocalSimulatorRoomSpec(
        "level0_utility",
        "Utility Alpha",
        "level_0",
        ("level0_front_hall",),
        PROFILE_UTILITY,
        (120, 280, 260, 390),
    ),
    LocalSimulatorRoomSpec(
        "vertical_link",
        "Vertical Link",
        "level_0",
        ("level0_transit", "level1_transit"),
        PROFILE_TRANSIT,
        (260, 300, 450, 390),
    ),
    LocalSimulatorRoomSpec(
        "level1_transit",
        "Upper Transit",
        "level_1",
        (
            "vertical_link",
            "level1_sleep_primary",
            "level1_sleep_secondary",
            "level1_work",
            "level1_short_stay",
            "level1_wash",
        ),
        PROFILE_TRANSIT,
        (260, 150, 450, 300),
        ("upper_hallway_mmwave",),
    ),
    LocalSimulatorRoomSpec(
        "level1_sleep_primary",
        "Sleep Zone Alpha",
        "level_1",
        ("level1_transit",),
        PROFILE_SLEEP,
        (20, 20, 260, 180),
        ("sleep_primary_mmwave",),
    ),
    LocalSimulatorRoomSpec(
        "level1_sleep_secondary",
        "Sleep Zone Beta",
        "level_1",
        ("level1_transit",),
        PROFILE_SLEEP,
        (20, 180, 260, 340),
    ),
    LocalSimulatorRoomSpec(
        "level1_work",
        "Work Zone Alpha",
        "level_1",
        ("level1_transit",),
        PROFILE_LONG_STAY,
        (450, 20, 650, 160),
    ),
    LocalSimulatorRoomSpec(
        "level1_short_stay",
        "Short Stay Beta",
        "level_1",
        ("level1_transit",),
        PROFILE_SHORT_STAY,
        (450, 150, 650, 260),
        ("upper_short_stay_mmwave",),
    ),
    LocalSimulatorRoomSpec(
        "level1_wash",
        "Wash Zone Alpha",
        "level_1",
        ("level1_transit",),
        PROFILE_SHORT_STAY,
        (450, 260, 650, 380),
    ),
)

LOCAL_SIMULATOR_TRANSIT_ROOM_IDS: frozenset[str] = frozenset(
    spec.id for spec in LOCAL_SIMULATOR_ROOM_SPECS if spec.profile == PROFILE_TRANSIT
)


def _rect_polygon(rect: tuple[float, float, float, float]) -> Polygon:
    """Build a rectangular polygon from x1, y1, x2, y2 coordinates."""
    x1, y1, x2, y2 = rect
    return Polygon(
        vertices=[
            Coordinates(x1, y1),
            Coordinates(x2, y1),
            Coordinates(x2, y2),
            Coordinates(x1, y2),
        ]
    )


def _room_center(spec: LocalSimulatorRoomSpec) -> Coordinates:
    """Return the center point of a room rectangle."""
    x1, y1, x2, y2 = spec.rect
    return Coordinates((x1 + x2) / 2, (y1 + y2) / 2)


def local_simulator_door_entity(room_id: str, connected_room_id: str) -> str:
    """Return the stable synthetic door entity for a room pair."""
    first, second = sorted((room_id, connected_room_id))
    return f"binary_sensor.sim_door_{first}_to_{second}"


def _sensor_config(
    spec: LocalSimulatorRoomSpec,
    *,
    floor_plan_id: str,
) -> VirtualSensorConfig:
    """Build the virtual sensor config for one simulated room."""
    config = VirtualSensorConfig(
        room_id=spec.id,
        floor_plan_id=floor_plan_id,
        enabled=True,
        occupancy_profile=spec.profile,
        motion_sensors=[
            SensorBinding(
                entity_id=f"binary_sensor.sim_{spec.id}_pir",
                sensor_type="motion",
                weight=1.0,
            )
        ],
        presence_sensors=[
            SensorBinding(
                entity_id=f"binary_sensor.sim_{spec.id}_presence",
                sensor_type="presence",
                weight=1.5,
            )
        ],
        door_sensors=[
            SensorBinding(
                entity_id=local_simulator_door_entity(spec.id, connected_id),
                sensor_type="door",
                weight=1.0,
            )
            for connected_id in spec.connected_rooms
        ],
        presence_affects=True,
        spatial_presence_delay=0,
        override_trigger_entity=f"button.sim_{spec.id}_override",
        override_trigger_action="press",
    )
    apply_occupancy_profile(config, spec.profile)
    config.presence_affects = True
    config.spatial_presence_delay = 0
    if spec.profile == PROFILE_TRANSIT:
        config.phantom_hold_seconds = DEFAULT_TRANSIT_PHANTOM_HOLD
    return config


def _mmwave_placements(
    specs: tuple[LocalSimulatorRoomSpec, ...],
    *,
    floor_plan_id: str,
) -> list[MmwavePlacement]:
    """Build visible mmWave placements for rooms with modeled sources."""
    placements: list[MmwavePlacement] = []
    for spec in specs:
        if not spec.mmwave_sources:
            continue
        center = _room_center(spec)
        for index, source in enumerate(spec.mmwave_sources):
            offset = (index - (len(spec.mmwave_sources) - 1) / 2) * 28
            placements.append(
                MmwavePlacement(
                    id=f"sim_mmwave_{source}",
                    floor_plan_id=floor_plan_id,
                    floor_id=spec.floor,
                    room_id=spec.id,
                    position=Coordinates(center.x + offset, center.y),
                    angle=90 if spec.floor == "level_0" else 270,
                    field_of_view=120,
                    detection_range=260,
                    label=source.replace("_", " ").title(),
                    targets=[
                        {
                            "x_entity_id": f"sensor.sim_{source}_target_1_x",
                            "y_entity_id": f"sensor.sim_{source}_target_1_y",
                        }
                    ],
                )
            )
    return placements


def _door_geometry(
    floor_id: str,
    specs: list[LocalSimulatorRoomSpec],
) -> tuple[list[Node], list[Edge]]:
    """Build synthetic door edges between same-floor rooms with shared walls."""
    nodes: list[Node] = []
    edges: list[Edge] = []
    specs_by_id = {spec.id: spec for spec in specs}
    handled_pairs: set[tuple[str, str]] = set()

    def add_node(x: float, y: float) -> str:
        node = Node(
            id=f"sim_node_{floor_id}_{len(nodes) + 1:03d}",
            x=x,
            y=y,
            pinned=True,
        )
        nodes.append(node)
        return node.id

    for spec in specs:
        x1, y1, x2, y2 = spec.rect
        for connected_id in spec.connected_rooms:
            connected = specs_by_id.get(connected_id)
            if not connected:
                continue
            pair = tuple(sorted((spec.id, connected_id)))
            if pair in handled_pairs:
                continue
            handled_pairs.add(pair)
            cx1, cy1, cx2, cy2 = connected.rect

            if abs(x2 - cx1) < 0.001 or abs(cx2 - x1) < 0.001:
                x = x2 if abs(x2 - cx1) < 0.001 else x1
                overlap_start = max(y1, cy1)
                overlap_end = min(y2, cy2)
                if overlap_end - overlap_start < 30:
                    continue
                center = (overlap_start + overlap_end) / 2
                start_id = add_node(x, center - 20)
                end_id = add_node(x, center + 20)
            elif abs(y2 - cy1) < 0.001 or abs(cy2 - y1) < 0.001:
                y = y2 if abs(y2 - cy1) < 0.001 else y1
                overlap_start = max(x1, cx1)
                overlap_end = min(x2, cx2)
                if overlap_end - overlap_start < 30:
                    continue
                center = (overlap_start + overlap_end) / 2
                start_id = add_node(center - 20, y)
                end_id = add_node(center + 20, y)
            else:
                continue

            edges.append(
                Edge(
                    id=f"sim_door_edge_{floor_id}_{len(edges) + 1:03d}",
                    start_node=start_id,
                    end_node=end_id,
                    type="door",
                    opening_parts="single",
                    opening_type="swing",
                    swing_direction="left",
                    entity_id=local_simulator_door_entity(spec.id, connected_id),
                )
            )

    return nodes, edges


def build_local_simulator_house(
    *, floor_plan_id: str = LOCAL_SIMULATOR_FLOOR_PLAN_ID
) -> tuple[FloorPlan, list[VirtualSensorConfig], list[MmwavePlacement]]:
    """Build the anonymized local simulator house as persisted models."""
    floors: list[Floor] = []
    for floor_id, name, level in (
        ("level_0", "Level 0", 0),
        ("level_1", "Level 1", 1),
    ):
        room_specs = [
            spec for spec in LOCAL_SIMULATOR_ROOM_SPECS if spec.floor == floor_id
        ]
        nodes, edges = _door_geometry(floor_id, room_specs)
        rooms: list[Room] = []
        for spec in room_specs:
            room = Room(
                id=spec.id,
                name=spec.name,
                floor_id=floor_id,
                polygon=_rect_polygon(spec.rect),
                color="#dce8ef" if spec.profile == PROFILE_TRANSIT else "#e7ece3",
                occupancy_sensor_enabled=True,
                occupancy_profile=spec.profile,
                connected_rooms=list(spec.connected_rooms),
                is_transit=spec.profile == PROFILE_TRANSIT,
                phantom_hold_seconds=(
                    DEFAULT_TRANSIT_PHANTOM_HOLD
                    if spec.profile == PROFILE_TRANSIT
                    else 0
                ),
            )
            apply_occupancy_profile_to_region(room, spec.profile)
            if spec.profile == PROFILE_TRANSIT:
                room.phantom_hold_seconds = DEFAULT_TRANSIT_PHANTOM_HOLD
            rooms.append(room)

        floors.append(
            Floor(
                id=floor_id,
                name=name,
                level=level,
                rooms=rooms,
                nodes=nodes,
                edges=edges,
            )
        )

    floor_plan = FloorPlan(
        id=floor_plan_id,
        name=LOCAL_SIMULATOR_FLOOR_PLAN_NAME,
        unit="cm",
        grid_size=10,
        floors=floors,
    )
    configs = [
        _sensor_config(spec, floor_plan_id=floor_plan_id)
        for spec in LOCAL_SIMULATOR_ROOM_SPECS
    ]
    placements = _mmwave_placements(
        LOCAL_SIMULATOR_ROOM_SPECS,
        floor_plan_id=floor_plan_id,
    )
    return floor_plan, configs, placements


def local_simulator_house_summary() -> dict[str, Any]:
    """Return a serializable description of the anonymized simulator house."""
    return {
        "floor_plan_id": LOCAL_SIMULATOR_FLOOR_PLAN_ID,
        "floor_plan_name": LOCAL_SIMULATOR_FLOOR_PLAN_NAME,
        "rooms": [
            {
                "id": spec.id,
                "name": spec.name,
                "floor": spec.floor,
                "connected_rooms": list(spec.connected_rooms),
                "profile": spec.profile,
                "rect": list(spec.rect),
                "mmwave_sources": list(spec.mmwave_sources),
                "transit_phantom_hold_seconds": (
                    DEFAULT_TRANSIT_PHANTOM_HOLD
                    if spec.id in LOCAL_SIMULATOR_TRANSIT_ROOM_IDS
                    else 0
                ),
            }
            for spec in LOCAL_SIMULATOR_ROOM_SPECS
        ],
        "transit_room_ids": sorted(LOCAL_SIMULATOR_TRANSIT_ROOM_IDS),
    }
