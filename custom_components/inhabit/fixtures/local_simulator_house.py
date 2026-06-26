"""Anonymized local house fixture for simulator testing.

The fixture mirrors the structural shape of the Amsterdam Inhabit floor plan
without storing real room names or real entity ids.  It preserves the parts that
matter for occupancy logic: room graph, one-sided/shared door bindings, zones,
sensor role counts, timing policy, and mmWave placement coverage.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..models.floor_plan import Coordinates, Edge, Floor, FloorPlan, Node, Polygon, Room
from ..models.mmwave_sensor import MmwavePlacement
from ..models.virtual_sensor import SensorBinding, VirtualSensorConfig
from ..models.zone import Zone
from ..occupancy_policy import (
    OCCUPANCY_PROFILES,
    PROFILE_LONG_STAY,
    PROFILE_OPEN_AREA,
    PROFILE_SHORT_STAY,
    PROFILE_TRANSIT,
    PROFILE_UTILITY,
    apply_occupancy_profile,
    apply_occupancy_profile_to_region,
)

LOCAL_SIMULATOR_FLOOR_PLAN_ID = "local_simulator_home"
LOCAL_SIMULATOR_FLOOR_PLAN_NAME = "Inhabit Local Simulator"
LOCAL_SIMULATOR_FLOOR_ID = "level_0"


@dataclass(frozen=True)
class LocalSimulatorRoomSpec:
    """An anonymized room in the local simulator fixture."""

    id: str
    name: str
    floor: str
    connected_rooms: tuple[str, ...]
    profile: str
    rect: tuple[float, float, float, float]
    motion_sensor_count: int = 1
    presence_sensor_count: int = 0
    door_sensor_connected_rooms: tuple[str, ...] = ()
    motion_timeout: int = 120
    checking_timeout: int = 30
    presence_timeout: int = 300
    unsealed_activity_timeout: int | None = None
    is_transit: bool | None = None
    phantom_hold_seconds: int = 0
    mmwave_sources: tuple[str, ...] = ()


@dataclass(frozen=True)
class LocalSimulatorZoneSpec:
    """An anonymized zone in the local simulator fixture."""

    id: str
    name: str
    room_id: str
    rect: tuple[float, float, float, float]
    occupancy_enabled: bool = False
    profile: str = PROFILE_OPEN_AREA
    motion_sensor_count: int = 0
    presence_sensor_count: int = 0
    unsealed_activity_timeout: int | None = None


@dataclass(frozen=True)
class LocalSimulatorDoorSpec:
    """A visual door edge and optional synthetic contact binding."""

    id: str
    room_ids: tuple[str, str]
    center: tuple[float, float]
    orientation: str
    sensor_room_ids: tuple[str, ...] = ()


@dataclass(frozen=True)
class _Segment:
    """Axis-aligned structural segment."""

    x1: float
    y1: float
    x2: float
    y2: float
    room_id: str | None = None


LOCAL_SIMULATOR_ROOM_SPECS: tuple[LocalSimulatorRoomSpec, ...] = (
    LocalSimulatorRoomSpec(
        "entry_nook",
        "Entry Nook",
        LOCAL_SIMULATOR_FLOOR_ID,
        ("transit_hall",),
        PROFILE_SHORT_STAY,
        (-71.0, 381.1, 23.0, 536.5),
        door_sensor_connected_rooms=(),
    ),
    LocalSimulatorRoomSpec(
        "side_room_alpha",
        "Side Room Alpha",
        LOCAL_SIMULATOR_FLOOR_ID,
        ("transit_hall",),
        PROFILE_SHORT_STAY,
        (-338.2, 86.2, -82.3, 280.2),
        door_sensor_connected_rooms=("transit_hall",),
    ),
    LocalSimulatorRoomSpec(
        "short_stay",
        "Short Stay",
        LOCAL_SIMULATOR_FLOOR_ID,
        ("transit_hall",),
        PROFILE_SHORT_STAY,
        (-286.5, 381.1, -70.9, 536.5),
        door_sensor_connected_rooms=("transit_hall",),
    ),
    LocalSimulatorRoomSpec(
        "service_room",
        "Service Room",
        LOCAL_SIMULATOR_FLOOR_ID,
        ("open_west",),
        PROFILE_UTILITY,
        (-378.6, 381.1, -286.4, 536.5),
        door_sensor_connected_rooms=("open_west",),
    ),
    LocalSimulatorRoomSpec(
        "open_east",
        "Open Area East",
        LOCAL_SIMULATOR_FLOOR_ID,
        ("transit_hall",),
        PROFILE_LONG_STAY,
        (23.0, 73.9, 702.3, 536.5),
        motion_sensor_count=0,
        presence_sensor_count=1,
        door_sensor_connected_rooms=("transit_hall",),
        unsealed_activity_timeout=120,
        mmwave_sources=("wide_mmwave_east",),
    ),
    LocalSimulatorRoomSpec(
        "transit_hall",
        "Transit Hall",
        LOCAL_SIMULATOR_FLOOR_ID,
        (
            "entry_nook",
            "side_room_alpha",
            "short_stay",
            "open_east",
            "open_west",
        ),
        PROFILE_TRANSIT,
        (-228.2, 280.2, 104.0, 381.1),
        door_sensor_connected_rooms=("open_east", "open_west"),
        motion_timeout=45,
        checking_timeout=15,
        is_transit=True,
        mmwave_sources=("hall_mmwave_east", "hall_mmwave_west"),
    ),
    LocalSimulatorRoomSpec(
        "open_west",
        "Open Area West",
        LOCAL_SIMULATOR_FLOOR_ID,
        ("transit_hall", "service_room"),
        PROFILE_OPEN_AREA,
        (-776.2, 86.2, -228.1, 536.5),
        motion_sensor_count=2,
        presence_sensor_count=1,
        door_sensor_connected_rooms=("transit_hall",),
        unsealed_activity_timeout=120,
        mmwave_sources=("wide_mmwave_west",),
    ),
)

LOCAL_SIMULATOR_ZONE_SPECS: tuple[LocalSimulatorZoneSpec, ...] = (
    LocalSimulatorZoneSpec(
        "east_zone_alpha",
        "East Zone Alpha",
        "open_east",
        (360.0, 280.3, 691.9, 536.5),
    ),
    LocalSimulatorZoneSpec(
        "east_zone_beta",
        "East Zone Beta",
        "open_east",
        (23.0, 381.1, 360.0, 536.5),
        occupancy_enabled=True,
        motion_sensor_count=1,
    ),
    LocalSimulatorZoneSpec(
        "east_zone_gamma",
        "East Zone Gamma",
        "open_east",
        (214.0, 73.9, 531.0, 280.3),
    ),
    LocalSimulatorZoneSpec(
        "east_zone_delta",
        "East Zone Delta",
        "open_east",
        (531.0, 74.0, 702.3, 280.3),
        occupancy_enabled=True,
        unsealed_activity_timeout=120,
    ),
    LocalSimulatorZoneSpec(
        "west_zone_alpha",
        "West Zone Alpha",
        "open_west",
        (-490.0, 86.2, -338.2, 280.2),
        occupancy_enabled=True,
        motion_sensor_count=1,
    ),
    LocalSimulatorZoneSpec(
        "west_zone_beta",
        "West Zone Beta",
        "open_west",
        (-550.0, 380.0, -378.6, 536.5),
        occupancy_enabled=True,
    ),
    LocalSimulatorZoneSpec(
        "west_zone_gamma",
        "West Zone Gamma",
        "open_west",
        (-670.0, 86.2, -490.0, 280.0),
        occupancy_enabled=True,
        presence_sensor_count=1,
    ),
    LocalSimulatorZoneSpec(
        "west_zone_delta",
        "West Zone Delta",
        "open_west",
        (-776.2, 86.2, -670.0, 280.0),
        occupancy_enabled=True,
        motion_sensor_count=1,
    ),
    LocalSimulatorZoneSpec(
        "west_zone_epsilon",
        "West Zone Epsilon",
        "open_west",
        (-768.6, 380.0, -550.0, 536.5),
        occupancy_enabled=True,
        presence_sensor_count=1,
    ),
)

LOCAL_SIMULATOR_DOOR_SPECS: tuple[LocalSimulatorDoorSpec, ...] = (
    LocalSimulatorDoorSpec(
        "open_east_secondary",
        ("transit_hall", "open_east"),
        (-1.7, 280.2),
        "horizontal",
    ),
    LocalSimulatorDoorSpec(
        "open_east_primary",
        ("transit_hall", "open_east"),
        (104.0, 330.7),
        "vertical",
        sensor_room_ids=("transit_hall", "open_east"),
    ),
    LocalSimulatorDoorSpec(
        "entry_nook_opening",
        ("transit_hall", "entry_nook"),
        (-24.2, 381.1),
        "horizontal",
    ),
    LocalSimulatorDoorSpec(
        "short_stay_opening",
        ("transit_hall", "short_stay"),
        (-176.8, 381.1),
        "horizontal",
        sensor_room_ids=("short_stay",),
    ),
    LocalSimulatorDoorSpec(
        "side_room_opening",
        ("transit_hall", "side_room_alpha"),
        (-174.3, 280.2),
        "horizontal",
        sensor_room_ids=("side_room_alpha",),
    ),
    LocalSimulatorDoorSpec(
        "open_west_primary",
        ("transit_hall", "open_west"),
        (-228.1, 332.0),
        "vertical",
        sensor_room_ids=("transit_hall", "open_west"),
    ),
    LocalSimulatorDoorSpec(
        "service_room_opening",
        ("open_west", "service_room"),
        (-331.8, 381.1),
        "horizontal",
        sensor_room_ids=("service_room",),
    ),
)

LOCAL_SIMULATOR_TRANSIT_ROOM_IDS: frozenset[str] = frozenset(
    spec.id
    for spec in LOCAL_SIMULATOR_ROOM_SPECS
    if spec.profile == PROFILE_TRANSIT or spec.is_transit is True
)


def _effective_room_phantom_hold(spec: LocalSimulatorRoomSpec) -> int:
    """Return explicit room phantom hold or the selected profile default."""
    if spec.phantom_hold_seconds:
        return spec.phantom_hold_seconds
    return OCCUPANCY_PROFILES[spec.profile].phantom_hold_seconds


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


def _sensor_bindings(
    region_id: str,
    role: str,
    count: int,
    *,
    weight: float,
) -> list[SensorBinding]:
    """Build stable synthetic bindings for a role."""
    if count <= 0:
        return []
    suffix = {"motion": "pir", "presence": "presence"}[role]
    return [
        SensorBinding(
            entity_id=(
                f"binary_sensor.sim_{region_id}_{suffix}"
                if index == 1
                else f"binary_sensor.sim_{region_id}_{suffix}_{index}"
            ),
            sensor_type=role,
            weight=weight,
        )
        for index in range(1, count + 1)
    ]


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
        motion_timeout=spec.motion_timeout,
        checking_timeout=spec.checking_timeout,
        presence_timeout=spec.presence_timeout,
        motion_sensors=_sensor_bindings(
            spec.id,
            "motion",
            spec.motion_sensor_count,
            weight=1.0,
        ),
        presence_sensors=_sensor_bindings(
            spec.id,
            "presence",
            spec.presence_sensor_count,
            weight=1.5,
        ),
        door_sensors=[
            SensorBinding(
                entity_id=local_simulator_door_entity(spec.id, connected_id),
                sensor_type="door",
                weight=1.0,
            )
            for connected_id in spec.door_sensor_connected_rooms
        ],
        presence_affects=True,
        spatial_presence_delay=0,
        override_trigger_entity=f"button.sim_{spec.id}_override",
        override_trigger_action="press",
    )
    apply_occupancy_profile(config, spec.profile)
    config.motion_timeout = spec.motion_timeout
    config.checking_timeout = spec.checking_timeout
    config.presence_timeout = spec.presence_timeout
    config.unsealed_activity_timeout = (
        spec.unsealed_activity_timeout
        if spec.unsealed_activity_timeout is not None
        else config.unsealed_activity_timeout
    )
    config.presence_affects = True
    config.spatial_presence_delay = 0
    if spec.phantom_hold_seconds:
        config.phantom_hold_seconds = spec.phantom_hold_seconds
    config.door_sensors = [
        SensorBinding(
            entity_id=local_simulator_door_entity(spec.id, connected_id),
            sensor_type="door",
            weight=1.0,
        )
        for connected_id in spec.door_sensor_connected_rooms
    ]
    return config


def _zone_sensor_config(
    spec: LocalSimulatorZoneSpec,
    *,
    floor_plan_id: str,
) -> VirtualSensorConfig:
    """Build the virtual sensor config for one simulated zone."""
    config = VirtualSensorConfig(
        room_id=spec.id,
        floor_plan_id=floor_plan_id,
        enabled=True,
        occupancy_profile=spec.profile,
        motion_sensors=_sensor_bindings(
            spec.id,
            "motion",
            spec.motion_sensor_count,
            weight=1.0,
        ),
        presence_sensors=_sensor_bindings(
            spec.id,
            "presence",
            spec.presence_sensor_count,
            weight=1.5,
        ),
        presence_affects=True,
        spatial_presence_delay=0,
        occupies_parent=True,
        parent_room_id=spec.room_id,
    )
    apply_occupancy_profile(config, spec.profile)
    if spec.unsealed_activity_timeout is not None:
        config.unsealed_activity_timeout = spec.unsealed_activity_timeout
    config.presence_affects = True
    config.spatial_presence_delay = 0
    config.occupies_parent = True
    config.parent_room_id = spec.room_id
    return config


def _mmwave_placements(
    specs: tuple[LocalSimulatorRoomSpec, ...],
    *,
    floor_plan_id: str,
) -> list[MmwavePlacement]:
    """Build visible mmWave placements that mirror the real local coverage."""
    return [
        MmwavePlacement(
            id="sim_mmwave_wide_east",
            floor_plan_id=floor_plan_id,
            floor_id=LOCAL_SIMULATOR_FLOOR_ID,
            room_id=None,
            position=Coordinates(404.3, 74.0),
            angle=90,
            field_of_view=170,
            detection_range=600,
            label="Wide Mmwave East",
            targets=[
                {
                    "x_entity_id": f"sensor.sim_wide_east_target_{index}_x",
                    "y_entity_id": f"sensor.sim_wide_east_target_{index}_y",
                }
                for index in range(1, 4)
            ],
        ),
        MmwavePlacement(
            id="sim_mmwave_wide_west",
            floor_plan_id=floor_plan_id,
            floor_id=LOCAL_SIMULATOR_FLOOR_ID,
            room_id=None,
            position=Coordinates(-548.4, 536.5),
            angle=270,
            field_of_view=170,
            detection_range=500,
            label="Wide Mmwave West",
            targets=[
                {
                    "x_entity_id": f"sensor.sim_wide_west_target_{index}_x",
                    "y_entity_id": f"sensor.sim_wide_west_target_{index}_y",
                }
                for index in range(1, 4)
            ],
        ),
    ]


GEOMETRY_TOLERANCE = 0.5
DOOR_WIDTH = 40.0


def _round_coord(value: float) -> float:
    """Normalize coordinates enough to merge anonymized sub-centimeter seams."""
    return round(value / GEOMETRY_TOLERANCE) * GEOMETRY_TOLERANCE


def _segment_orientation(segment: _Segment) -> str:
    """Return the segment orientation."""
    return (
        "vertical"
        if abs(segment.x1 - segment.x2) <= GEOMETRY_TOLERANCE
        else "horizontal"
    )


def _normalized_segment_key(segment: _Segment) -> tuple[float, float, float, float]:
    """Return a stable key independent of segment direction."""
    x1 = _round_coord(segment.x1)
    y1 = _round_coord(segment.y1)
    x2 = _round_coord(segment.x2)
    y2 = _round_coord(segment.y2)
    start = (x1, y1)
    end = (x2, y2)
    if end < start:
        start, end = end, start
    return (*start, *end)


def _door_segment(door: LocalSimulatorDoorSpec) -> _Segment:
    """Build the physical door/opening segment."""
    center_x, center_y = door.center
    half = DOOR_WIDTH / 2
    if door.orientation == "vertical":
        return _Segment(center_x, center_y - half, center_x, center_y + half)
    return _Segment(center_x - half, center_y, center_x + half, center_y)


def _rect_boundary_segments(spec: LocalSimulatorRoomSpec) -> tuple[_Segment, ...]:
    """Return the four boundary segments for a room rectangle."""
    x1, y1, x2, y2 = spec.rect
    return (
        _Segment(x1, y1, x2, y1, spec.id),
        _Segment(x2, y1, x2, y2, spec.id),
        _Segment(x2, y2, x1, y2, spec.id),
        _Segment(x1, y2, x1, y1, spec.id),
    )


def _door_on_segment(door_segment: _Segment, wall_segment: _Segment) -> bool:
    """Return whether a door lies on a wall segment."""
    orientation = _segment_orientation(wall_segment)
    if _segment_orientation(door_segment) != orientation:
        return False

    if orientation == "vertical":
        if abs(door_segment.x1 - wall_segment.x1) > GEOMETRY_TOLERANCE:
            return False
        wall_min, wall_max = sorted((wall_segment.y1, wall_segment.y2))
        door_min, door_max = sorted((door_segment.y1, door_segment.y2))
    else:
        if abs(door_segment.y1 - wall_segment.y1) > GEOMETRY_TOLERANCE:
            return False
        wall_min, wall_max = sorted((wall_segment.x1, wall_segment.x2))
        door_min, door_max = sorted((door_segment.x1, door_segment.x2))

    return (
        door_min >= wall_min - GEOMETRY_TOLERANCE
        and door_max <= wall_max + GEOMETRY_TOLERANCE
    )


def _subsegment_for_interval(
    wall_segment: _Segment,
    start: float,
    end: float,
) -> _Segment:
    """Build a subsegment on the same line as a wall boundary."""
    orientation = _segment_orientation(wall_segment)
    if orientation == "vertical":
        return _Segment(
            wall_segment.x1, start, wall_segment.x1, end, wall_segment.room_id
        )
    return _Segment(start, wall_segment.y1, end, wall_segment.y1, wall_segment.room_id)


def _door_covers_interval(
    door_segment: _Segment,
    wall_segment: _Segment,
    start: float,
    end: float,
) -> bool:
    """Return whether a split wall interval is the door opening."""
    if not _door_on_segment(door_segment, wall_segment):
        return False

    orientation = _segment_orientation(wall_segment)
    if orientation == "vertical":
        door_min, door_max = sorted((door_segment.y1, door_segment.y2))
    else:
        door_min, door_max = sorted((door_segment.x1, door_segment.x2))
    return (
        start >= door_min - GEOMETRY_TOLERANCE and end <= door_max + GEOMETRY_TOLERANCE
    )


def _structure_geometry(
    room_specs: tuple[LocalSimulatorRoomSpec, ...],
    door_specs: tuple[LocalSimulatorDoorSpec, ...],
) -> tuple[list[Node], list[Edge]]:
    """Build walls and door openings from the anonymized room rectangles."""
    nodes: list[Node] = []
    edges: list[Edge] = []
    node_ids: dict[tuple[float, float], str] = {}
    edge_segments: dict[
        tuple[float, float, float, float], tuple[_Segment, str, int]
    ] = {}
    door_segments = {door.id: _door_segment(door) for door in door_specs}
    door_by_id = {door.id: door for door in door_specs}

    def add_node(x: float, y: float) -> str:
        key = (_round_coord(x), _round_coord(y))
        if key in node_ids:
            return node_ids[key]
        node = Node(
            id=f"sim_node_{LOCAL_SIMULATOR_FLOOR_ID}_{len(nodes) + 1:03d}",
            x=key[0],
            y=key[1],
            pinned=True,
        )
        nodes.append(node)
        node_ids[key] = node.id
        return node.id

    def add_edge_segment(segment: _Segment, edge_type: str, owner_count: int) -> None:
        key = _normalized_segment_key(segment)
        existing = edge_segments.get(key)
        if existing:
            existing_segment, existing_type, existing_count = existing
            if existing_type == "door" or edge_type != "door":
                edge_segments[key] = (
                    existing_segment,
                    existing_type,
                    existing_count + owner_count,
                )
                return
        edge_segments[key] = (segment, edge_type, owner_count)

    for room_spec in room_specs:
        for wall_segment in _rect_boundary_segments(room_spec):
            orientation = _segment_orientation(wall_segment)
            if orientation == "vertical":
                start_axis, end_axis = sorted((wall_segment.y1, wall_segment.y2))
            else:
                start_axis, end_axis = sorted((wall_segment.x1, wall_segment.x2))

            cuts = {start_axis, end_axis}
            matching_doors: list[tuple[LocalSimulatorDoorSpec, _Segment]] = []
            for door in door_specs:
                door_segment = door_segments[door.id]
                if not _door_on_segment(door_segment, wall_segment):
                    continue
                matching_doors.append((door, door_segment))
                if orientation == "vertical":
                    cuts.update((door_segment.y1, door_segment.y2))
                else:
                    cuts.update((door_segment.x1, door_segment.x2))

            sorted_cuts = sorted(
                cut
                for cut in cuts
                if start_axis - GEOMETRY_TOLERANCE
                <= cut
                <= end_axis + GEOMETRY_TOLERANCE
            )
            for start, end in zip(sorted_cuts, sorted_cuts[1:], strict=False):
                if end - start < GEOMETRY_TOLERANCE:
                    continue
                subsegment = _subsegment_for_interval(wall_segment, start, end)
                door_match = next(
                    (
                        door
                        for door, door_segment in matching_doors
                        if _door_covers_interval(door_segment, wall_segment, start, end)
                    ),
                    None,
                )
                add_edge_segment(
                    subsegment,
                    f"door:{door_match.id}" if door_match else "wall",
                    1,
                )

    for _key, (segment, edge_type, owner_count) in sorted(edge_segments.items()):
        start_id = add_node(segment.x1, segment.y1)
        end_id = add_node(segment.x2, segment.y2)
        direction = _segment_orientation(segment)
        if edge_type.startswith("door:"):
            door = door_by_id[edge_type.removeprefix("door:")]
            sensor_entity = (
                local_simulator_door_entity(*door.room_ids)
                if door.sensor_room_ids
                else None
            )
            edges.append(
                Edge(
                    id=f"sim_door_edge_{door.id}",
                    start_node=start_id,
                    end_node=end_id,
                    type="door",
                    direction=direction,
                    opening_parts="single",
                    opening_type="swing",
                    swing_direction="left",
                    entity_id=sensor_entity,
                )
            )
            continue

        edges.append(
            Edge(
                id=f"sim_wall_edge_{len(edges) + 1:03d}",
                start_node=start_id,
                end_node=end_id,
                type="wall",
                direction=direction,
                is_exterior=owner_count == 1,
            )
        )

    return nodes, edges


def build_local_simulator_house(
    *, floor_plan_id: str = LOCAL_SIMULATOR_FLOOR_PLAN_ID
) -> tuple[FloorPlan, list[VirtualSensorConfig], list[MmwavePlacement]]:
    """Build the anonymized local simulator house as persisted models."""
    rooms: list[Room] = []
    for spec in LOCAL_SIMULATOR_ROOM_SPECS:
        room = Room(
            id=spec.id,
            name=spec.name,
            floor_id=LOCAL_SIMULATOR_FLOOR_ID,
            polygon=_rect_polygon(spec.rect),
            color="#dce8ef" if spec.profile == PROFILE_TRANSIT else "#e7ece3",
            occupancy_sensor_enabled=True,
            occupancy_profile=spec.profile,
            motion_timeout=spec.motion_timeout,
            checking_timeout=spec.checking_timeout,
            connected_rooms=list(spec.connected_rooms),
            is_transit=spec.is_transit,
            phantom_hold_seconds=spec.phantom_hold_seconds,
        )
        apply_occupancy_profile_to_region(room, spec.profile)
        room.motion_timeout = spec.motion_timeout
        room.checking_timeout = spec.checking_timeout
        room.connected_rooms = list(spec.connected_rooms)
        room.is_transit = spec.is_transit
        if spec.phantom_hold_seconds:
            room.phantom_hold_seconds = spec.phantom_hold_seconds
        rooms.append(room)

    zones = [
        Zone(
            id=spec.id,
            name=spec.name,
            floor_id=LOCAL_SIMULATOR_FLOOR_ID,
            room_id=spec.room_id,
            polygon=_rect_polygon(spec.rect),
            color="#eef0d9",
            occupancy_sensor_enabled=spec.occupancy_enabled,
            occupancy_profile=spec.profile,
            occupies_parent=True,
        )
        for spec in LOCAL_SIMULATOR_ZONE_SPECS
    ]

    nodes, edges = _structure_geometry(
        LOCAL_SIMULATOR_ROOM_SPECS,
        LOCAL_SIMULATOR_DOOR_SPECS,
    )
    floor_plan = FloorPlan(
        id=floor_plan_id,
        name=LOCAL_SIMULATOR_FLOOR_PLAN_NAME,
        unit="cm",
        grid_size=10,
        floors=[
            Floor(
                id=LOCAL_SIMULATOR_FLOOR_ID,
                name="Level 0",
                level=0,
                rooms=rooms,
                nodes=nodes,
                edges=edges,
                zones=zones,
            )
        ],
    )
    configs = [
        _sensor_config(spec, floor_plan_id=floor_plan_id)
        for spec in LOCAL_SIMULATOR_ROOM_SPECS
    ]
    configs.extend(
        _zone_sensor_config(spec, floor_plan_id=floor_plan_id)
        for spec in LOCAL_SIMULATOR_ZONE_SPECS
        if spec.occupancy_enabled
    )
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
        "source": "anonymized_amsterdam_structure",
        "rooms": [
            {
                "id": spec.id,
                "name": spec.name,
                "floor": spec.floor,
                "connected_rooms": list(spec.connected_rooms),
                "door_sensor_connected_rooms": list(spec.door_sensor_connected_rooms),
                "profile": spec.profile,
                "rect": list(spec.rect),
                "motion_sensor_count": spec.motion_sensor_count,
                "presence_sensor_count": spec.presence_sensor_count,
                "motion_timeout": spec.motion_timeout,
                "checking_timeout": spec.checking_timeout,
                "presence_timeout": spec.presence_timeout,
                "unsealed_activity_timeout": spec.unsealed_activity_timeout,
                "is_transit": spec.is_transit,
                "mmwave_sources": list(spec.mmwave_sources),
                "transit_phantom_hold_seconds": _effective_room_phantom_hold(spec),
            }
            for spec in LOCAL_SIMULATOR_ROOM_SPECS
        ],
        "zones": [
            {
                "id": spec.id,
                "name": spec.name,
                "room_id": spec.room_id,
                "rect": list(spec.rect),
                "occupancy_enabled": spec.occupancy_enabled,
                "motion_sensor_count": spec.motion_sensor_count,
                "presence_sensor_count": spec.presence_sensor_count,
            }
            for spec in LOCAL_SIMULATOR_ZONE_SPECS
        ],
        "doors": [
            {
                "id": spec.id,
                "room_ids": list(spec.room_ids),
                "sensor_room_ids": list(spec.sensor_room_ids),
                "center": list(spec.center),
                "orientation": spec.orientation,
            }
            for spec in LOCAL_SIMULATOR_DOOR_SPECS
        ],
        "transit_room_ids": sorted(LOCAL_SIMULATOR_TRANSIT_ROOM_IDS),
        "mmwave_placements": [
            {
                "id": placement.id,
                "room_id": placement.room_id,
                "position": placement.position.to_dict(),
                "angle": placement.angle,
                "field_of_view": placement.field_of_view,
                "detection_range": placement.detection_range,
                "target_count": len(placement.targets),
            }
            for placement in _mmwave_placements(
                LOCAL_SIMULATOR_ROOM_SPECS,
                floor_plan_id=LOCAL_SIMULATOR_FLOOR_PLAN_ID,
            )
        ],
    }
