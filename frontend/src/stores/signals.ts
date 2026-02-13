/**
 * Cross-bundle shared signals.
 *
 * Both panel.js (editor) and viewer.js load their own copy of every module,
 * but they share the same window object.  By storing signals on the window we
 * guarantee that both bundles – and the single `fpb-canvas` custom element
 * registered by whichever bundle loads first – always reference the same
 * reactive state.
 */

import { signal, type Signal } from "@preact/signals-core";
import type {
  FloorPlan,
  Floor,
  ToolType,
  CanvasMode,
  LayerConfig,
  ViewBox,
  SelectionState,
  DevicePlacement,
  MmwavePlacement,
} from "../types";
import type { ConstraintViolation } from "../utils/wall-solver";

interface InhabitSignals {
  currentFloorPlan: Signal<FloorPlan | null>;
  currentFloor: Signal<Floor | null>;
  canvasMode: Signal<CanvasMode>;
  activeTool: Signal<ToolType>;
  selection: Signal<SelectionState>;
  viewBox: Signal<ViewBox>;
  gridSize: Signal<number>;
  snapToGrid: Signal<boolean>;
  showGrid: Signal<boolean>;
  layers: Signal<LayerConfig[]>;
  devicePlacements: Signal<DevicePlacement[]>;
  constraintConflicts: Signal<Map<string, ConstraintViolation[]>>;
  focusedRoomId: Signal<string | null>;
  occupancyPanelTarget: Signal<{ id: string; name: string; type: "room" | "zone" } | null>;
  mmwavePlacements: Signal<MmwavePlacement[]>;
  _reloadFloorData: (() => Promise<void>) | null;
}

declare global {
  interface Window {
    __inhabit_signals?: InhabitSignals;
  }
}

function createSignals(): InhabitSignals {
  return {
    currentFloorPlan: signal<FloorPlan | null>(null),
    currentFloor: signal<Floor | null>(null),
    canvasMode: signal<CanvasMode>("walls"),
    activeTool: signal<ToolType>("select"),
    selection: signal<SelectionState>({ type: "none", ids: [] }),
    viewBox: signal<ViewBox>({ x: 0, y: 0, width: 1000, height: 800 }),
    gridSize: signal<number>(10),
    snapToGrid: signal<boolean>(true),
    showGrid: signal<boolean>(true),
    layers: signal<LayerConfig[]>([
      { id: "background", name: "Background", visible: true, locked: false, opacity: 1 },
      { id: "structure", name: "Structure", visible: true, locked: false, opacity: 1 },
      { id: "furniture", name: "Furniture", visible: true, locked: false, opacity: 1 },
      { id: "devices", name: "Devices", visible: true, locked: false, opacity: 1 },
      { id: "coverage", name: "Coverage", visible: true, locked: false, opacity: 0.5 },
      { id: "labels", name: "Labels", visible: true, locked: false, opacity: 1 },
      { id: "automation", name: "Automation", visible: true, locked: false, opacity: 0.7 },
    ]),
    devicePlacements: signal<DevicePlacement[]>([]),
    constraintConflicts: signal<Map<string, ConstraintViolation[]>>(new Map()),
    focusedRoomId: signal<string | null>(null),
    occupancyPanelTarget: signal<{ id: string; name: string; type: "room" | "zone" } | null>(null),
    mmwavePlacements: signal<MmwavePlacement[]>([]),
    _reloadFloorData: null,
  };
}

// Lazy-init: first bundle to load creates the signals, second reuses them.
if (!window.__inhabit_signals) {
  window.__inhabit_signals = createSignals();
}

const s = window.__inhabit_signals;

// Re-export individual signals for ergonomic imports
export const currentFloorPlan = s.currentFloorPlan;
export const currentFloor = s.currentFloor;
export const canvasMode = s.canvasMode;
export const activeTool = s.activeTool;
export const selection = s.selection;
export const viewBox = s.viewBox;
export const gridSize = s.gridSize;
export const snapToGrid = s.snapToGrid;
export const showGrid = s.showGrid;
export const layers = s.layers;
export const devicePlacements = s.devicePlacements;
export const constraintConflicts = s.constraintConflicts;
export const focusedRoomId = s.focusedRoomId;
export const occupancyPanelTarget = s.occupancyPanelTarget;
export const mmwavePlacements = s.mmwavePlacements;

export function setCanvasMode(mode: CanvasMode): void {
  canvasMode.value = mode;
  activeTool.value = "select";
  selection.value = { type: "none", ids: [] };
}

export function setReloadFunction(fn: () => Promise<void>): void {
  s._reloadFloorData = fn;
}

export async function reloadFloorData(): Promise<void> {
  if (s._reloadFloorData) {
    await s._reloadFloorData();
  }
}

/**
 * Reset all signals to defaults.  Called by each panel's connectedCallback
 * so stale state from a previous panel doesn't bleed through.
 */
export function resetSignals(): void {
  currentFloorPlan.value = null;
  currentFloor.value = null;
  canvasMode.value = "walls";
  activeTool.value = "select";
  selection.value = { type: "none", ids: [] };
  viewBox.value = { x: 0, y: 0, width: 1000, height: 800 };
  gridSize.value = 10;
  snapToGrid.value = true;
  showGrid.value = true;
  layers.value = [
    { id: "background", name: "Background", visible: true, locked: false, opacity: 1 },
    { id: "structure", name: "Structure", visible: true, locked: false, opacity: 1 },
    { id: "furniture", name: "Furniture", visible: true, locked: false, opacity: 1 },
    { id: "devices", name: "Devices", visible: true, locked: false, opacity: 1 },
    { id: "coverage", name: "Coverage", visible: true, locked: false, opacity: 0.5 },
    { id: "labels", name: "Labels", visible: true, locked: false, opacity: 1 },
    { id: "automation", name: "Automation", visible: true, locked: false, opacity: 0.7 },
  ];
  devicePlacements.value = [];
  constraintConflicts.value = new Map();
  focusedRoomId.value = null;
  occupancyPanelTarget.value = null;
  mmwavePlacements.value = [];
  s._reloadFloorData = null;
}
