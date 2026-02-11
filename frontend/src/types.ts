/**
 * Type definitions for Inhabit Floor Plan Builder
 */

// Home Assistant types
export interface HomeAssistant {
  states: Record<string, HassEntity>;
  services: Record<string, Record<string, object>>;
  user: HassUser;
  language: string;
  callService(domain: string, service: string, data?: object): Promise<void>;
  callWS<T>(msg: object): Promise<T>;
  connection: {
    subscribeEvents(callback: (event: HassEvent) => void, eventType: string): Promise<() => void>;
    subscribeMessage<T>(callback: (msg: T) => void, msg: object): Promise<() => void>;
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
export type WallDirection = 'free' | 'horizontal' | 'vertical';

// Node (shared vertex in the graph)
export interface Node {
  id: string;
  x: number;
  y: number;
  pinned: boolean;
}

// Edge type
export type EdgeType = 'wall' | 'door' | 'window';

// Edge (replaces Wall, Door, Window)
export interface Edge {
  id: string;
  start_node: string; // Node ID
  end_node: string;   // Node ID
  type: EdgeType;
  thickness: number;
  is_exterior: boolean;
  length_locked: boolean;
  direction: WallDirection;
  angle_group?: string;
  link_group?: string;
  collinear_group?: string;
  // Opening properties (door & window)
  opening_parts?: 'single' | 'double';
  opening_type?: 'swing' | 'sliding' | 'tilt';
  swing_direction?: 'left' | 'right';
  entity_id?: string;
  // Window-specific
  height?: number;
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
export interface SensorCoverage {
  type: "cone" | "circle" | "polygon";
  angle: number;
  range: number;
  direction: number;
  polygon?: Polygon;
}

export interface DevicePlacement {
  id: string;
  entity_id: string;
  floor_id: string;
  room_id?: string;
  position: Coordinates;
  rotation: number;
  scale: number;
  label?: string;
  show_state: boolean;
  show_label: boolean;
  coverage?: SensorCoverage;
  contributes_to_occupancy: boolean;
}

// Virtual sensor types
export type OccupancyState = "vacant" | "occupied" | "checking";

export interface SensorBinding {
  entity_id: string;
  sensor_type: "motion" | "presence" | "door";
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
  motion_sensors: SensorBinding[];
  presence_sensors: SensorBinding[];
  door_sensors: SensorBinding[];
  door_blocks_vacancy: boolean;
  door_open_resets_checking: boolean;
}

export interface OccupancyStateData {
  state: OccupancyState;
  confidence: number;
  last_motion_at?: string;
  last_presence_at?: string;
  last_door_event_at?: string;
  contributing_sensors: string[];
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
export type CanvasMode = "viewing" | "walls" | "placement";

// Tool types
export type ToolType =
  | "select"
  | "wall"
  | "door"
  | "window"
  | "device";

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
  type: "none" | "room" | "edge" | "device" | "shape";
  ids: string[];
}
