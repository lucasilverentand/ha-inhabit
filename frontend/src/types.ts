/**
 * Type definitions for Inhabit Floor Plan Builder
 */

// Home Assistant types
export interface HomeAssistant {
  states: Record<string, HassEntity>;
  services: Record<string, Record<string, object>>;
  user: HassUser;
  language: string;
  auth: { data: { access_token: string } };
  callService(domain: string, service: string, data?: object): Promise<void>;
  callWS<T>(msg: object): Promise<T>;
  connection: {
    subscribeEvents(
      callback: (event: HassEvent) => void,
      eventType: string,
    ): Promise<() => void>;
    subscribeMessage<T>(
      callback: (msg: T) => void,
      msg: object,
    ): Promise<() => void>;
  };
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

export interface HassUser {
  id: string;
  name: string;
  is_admin: boolean;
}

export interface HassEvent {
  event_type: string;
  data: Record<string, unknown>;
}

// Geometry types
export interface Coordinates {
  x: number;
  y: number;
}

export interface BoundingBox {
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
}

export interface Polygon {
  vertices: Coordinates[];
}

// Floor plan types
export type WallDirection = "free" | "horizontal" | "vertical";

// Node (shared vertex in the graph)
export interface Node {
  id: string;
  x: number;
  y: number;
  pinned: boolean;
}

// Edge type
export type EdgeType = "wall" | "door" | "window";

// Edge (replaces Wall, Door, Window)
export interface Edge {
  id: string;
  start_node: string; // Node ID
  end_node: string; // Node ID
  type: EdgeType;
  thickness: number;
  is_exterior: boolean;
  length_locked: boolean;
  direction: WallDirection;
  angle_group?: string;
  link_group?: string;
  collinear_group?: string;
  // Opening properties (door & window)
  opening_parts?: "single" | "double";
  opening_type?: "swing" | "sliding" | "tilt";
  swing_direction?: "left" | "right";
  entity_id?: string;
  // Window-specific
  height?: number;
}

export interface BackgroundLayer {
  id: string;
  name: string;
  url: string;
  offset_x: number;
  offset_y: number;
  scale: number;
  opacity: number;
  visible: boolean;
}

export interface Room {
  id: string;
  name: string;
  polygon: Polygon;
  floor_id: string;
  color: string;
  occupancy_sensor_enabled: boolean;
  motion_timeout: number;
  checking_timeout: number;
  connected_rooms: string[];
  ha_area_id?: string;
  background_layers: BackgroundLayer[];
}

export interface Zone {
  id: string;
  name: string;
  floor_id: string;
  room_id?: string;
  polygon: Polygon;
  color: string;
  rotation: number;
  ha_area_id?: string;
  occupancy_sensor_enabled: boolean;
  motion_timeout: number;
  checking_timeout: number;
  spatial_presence_delay?: number | null;
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  background_image?: string;
  background_scale: number;
  background_offset: Coordinates;
  rooms: Room[];
  nodes: Node[];
  edges: Edge[];
  zones: Zone[];
}

export interface FloorPlan {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  unit: "cm" | "m" | "in" | "ft";
  grid_size: number;
  floors: Floor[];
}

// Device placement types
export interface BasePlacement {
  id: string;
  entity_id: string;
  floor_id: string;
  room_id?: string;
  position: Coordinates;
  label?: string;
}

export interface LightPlacement extends BasePlacement {}

export interface SwitchPlacement extends BasePlacement {}

export interface FanPlacement extends BasePlacement {
  orientation: number;
  oscillation_start?: number | null;
  oscillation_end?: number | null;
  deadzone_radius?: number | null;
  deadzone_min_radius?: number | null;
  deadzone_enabled?: boolean;
  deadzone_dynamic?: boolean;
  draggable_always?: boolean;
}

export interface ButtonPlacement extends BasePlacement {}

export interface OtherPlacement extends BasePlacement {}

// Virtual sensor types
export type OccupancyState = "vacant" | "occupied" | "checking";

export interface SensorBinding {
  entity_id: string;
  sensor_type: string;
  weight: number;
  inverted: boolean;
}

export interface VirtualSensorConfig {
  room_id: string;
  floor_plan_id: string;
  enabled: boolean;
  motion_timeout: number;
  checking_timeout: number;
  presence_timeout: number;
  unsealed_activity_timeout: number;
  motion_sensors: SensorBinding[];
  presence_sensors: SensorBinding[];
  occupancy_sensors: SensorBinding[];
  door_sensors: SensorBinding[];
  hint_sensors?: SensorBinding[];
  exit_sensors?: SensorBinding[];
  hold_until_exit?: boolean;
  occupies_parent?: boolean;
  presence_affects: boolean;
  spatial_presence_delay?: number | null;
  door_seals_room: boolean;
  seal_max_duration: number;
  seal_half_life: number;
  long_stay: boolean;
  door_blocks_vacancy: boolean;
  door_open_resets_checking: boolean;
  override_trigger_entity: string;
  override_trigger_action: string;
  occupied_threshold: number;
  vacant_threshold: number;
}

export interface OccupancyStateData {
  state: OccupancyState;
  confidence: number;
  last_motion_at?: string;
  last_presence_at?: string;
  last_door_event_at?: string;
  checking_started_at?: string;
  contributing_sensors: string[];
  sealed: boolean;
  sealed_since?: string;
  seal_broken_at?: string;
  seal_probability: number;
  door_states_at_detection: Record<string, boolean>;
  sensor_reliability?: Record<string, number>;
  sensor_diagnostics?: Record<string, unknown>;
}

export interface OccupancyDiagnosticEvent {
  id: string;
  timestamp: string;
  category: string;
  event: string;
  room_id?: string | null;
  region_id?: string | null;
  previous_state?: string | null;
  new_state?: string | null;
  reason?: string | null;
  confidence?: number | null;
  probability?: number | null;
  thresholds?: Record<string, number> | null;
  contributing_sensors: string[];
  blockers: string[];
  target_count?: number | null;
  metadata: Record<string, unknown>;
}

export interface OccupancyDiagnosticsResponse {
  generated_at: string;
  event_count: number;
  events: OccupancyDiagnosticEvent[];
  state?: OccupancyStateData | null;
  config?: VirtualSensorConfig | null;
}

export interface SensorConfigPatchDiff {
  field: string;
  before: unknown;
  after: unknown;
}

export interface SensorConfigPatchResult {
  valid: boolean;
  current: Record<string, unknown>;
  proposed: Record<string, unknown>;
  diff: SensorConfigPatchDiff[];
  warnings: string[];
  errors: string[];
  config?: VirtualSensorConfig;
  diagnostic_event_id?: string;
}

// mmWave sensor types
export interface MmwaveCalibration {
  enabled: boolean;
  target_index: number;
  map_point: Coordinates;
  raw_mean: Coordinates;
  raw_stddev: Coordinates;
  raw_bias: Coordinates;
  jitter_radius: number;
  sample_count: number;
  calibrated_at?: string;
  points?: MmwaveCalibrationPoint[];
  world_transform?: MmwaveCalibrationTransform;
}

export interface MmwaveCalibrationPoint {
  target_index: number;
  map_point: Coordinates;
  raw_mean: Coordinates;
  raw_stddev: Coordinates;
  raw_bias: Coordinates;
  sample_count: number;
}

export interface MmwaveCalibrationTransform {
  type: "affine" | "similarity";
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  residual_error: number;
}

export interface MmwavePlacement {
  id: string;
  floor_plan_id: string;
  floor_id: string;
  room_id?: string;
  position: Coordinates;
  angle: number;
  field_of_view: number;
  detection_range: number;
  label?: string;
  targets: Array<{ x_entity_id: string; y_entity_id: string }>;
  calibration?: MmwaveCalibration;
}

// Visual rule types
export interface RuleCondition {
  type: "entity_state" | "room_occupancy" | "time" | "sun" | "numeric_state";
  entity_id?: string;
  room_id?: string;
  state?: string;
  above?: number;
  below?: number;
  after?: string;
  before?: string;
  weekday?: string[];
}

export interface RuleAction {
  type: "service_call" | "delay" | "wait";
  service?: string;
  entity_id?: string;
  data?: Record<string, unknown>;
  delay_seconds?: number;
  wait_template?: string;
}

export interface VisualRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  floor_plan_id: string;
  trigger_type: "room_occupancy" | "entity_state" | "time" | "sun";
  trigger_room_id?: string;
  trigger_entity_id?: string;
  trigger_state?: string;
  trigger_for?: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
  source_room_id?: string;
  target_entity_ids: string[];
  color: string;
}

// Canvas mode types
export type CanvasMode =
  | "viewing"
  | "walls"
  | "openings"
  | "furniture"
  | "placement"
  | "occupancy";

// Simulated target types
export interface SimulatedTarget {
  id: string;
  floor_plan_id: string;
  floor_id: string;
  position: Coordinates;
  region_id: string | null;
  region_name: string | null;
}

// Tool types
export type ToolType =
  | "select"
  | "wall"
  | "opening"
  | "door"
  | "window"
  | "device"
  | "light"
  | "switch"
  | "mmwave"
  | "button"
  | "other"
  | "zone";

export type ToolState = "ready" | "drawing" | "dragging";

// Layer types
export type LayerType =
  | "background"
  | "structure"
  | "furniture"
  | "devices"
  | "coverage"
  | "labels"
  | "automation";

export interface LayerConfig {
  id: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
}

// Canvas types
export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CanvasEvent {
  type: string;
  point: Coordinates;
  originalEvent: PointerEvent;
}

// Selection types
export interface SelectionState {
  type:
    | "none"
    | "room"
    | "edge"
    | "light"
    | "switch"
    | "fan"
    | "mmwave"
    | "button"
    | "other"
    | "shape"
    | "zone";
  ids: string[];
}
