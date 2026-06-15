import type { CanvasMode, LayerType, ToolType } from "../types";

export interface MapModeDefinition {
  mode: CanvasMode;
  label: string;
  icon: string;
  accent: string;
  tools: ToolType[];
  layers: LayerType[];
  showNormalDevices: boolean;
  showMmwave: boolean;
  showMmwaveCoverage: boolean;
  showWallEditing: boolean;
  showOpeningEditing: boolean;
  showZoneEditing: boolean;
  showDrawingPreview: boolean;
}

export const MAP_MODE_DEFINITIONS: Record<CanvasMode, MapModeDefinition> = {
  viewing: {
    mode: "viewing",
    label: "View",
    icon: "mdi:home-outline",
    accent: "#2e7d32",
    tools: [],
    layers: ["background", "structure", "devices"],
    showNormalDevices: true,
    showMmwave: true,
    showMmwaveCoverage: false,
    showWallEditing: false,
    showOpeningEditing: false,
    showZoneEditing: false,
    showDrawingPreview: false,
  },
  walls: {
    mode: "walls",
    label: "Rooms",
    icon: "mdi:wall",
    accent: "#455a64",
    tools: ["wall"],
    layers: ["background", "structure", "labels"],
    showNormalDevices: false,
    showMmwave: false,
    showMmwaveCoverage: false,
    showWallEditing: true,
    showOpeningEditing: false,
    showZoneEditing: false,
    showDrawingPreview: true,
  },
  openings: {
    mode: "openings",
    label: "Openings",
    icon: "mdi:door-open",
    accent: "#6d4c41",
    tools: ["door", "window"],
    layers: ["background", "structure", "labels"],
    showNormalDevices: false,
    showMmwave: false,
    showMmwaveCoverage: false,
    showWallEditing: false,
    showOpeningEditing: true,
    showZoneEditing: false,
    showDrawingPreview: true,
  },
  furniture: {
    mode: "furniture",
    label: "Zones",
    icon: "mdi:vector-square",
    accent: "#00897b",
    tools: ["zone"],
    layers: ["background", "structure", "furniture", "labels"],
    showNormalDevices: false,
    showMmwave: false,
    showMmwaveCoverage: false,
    showWallEditing: false,
    showOpeningEditing: false,
    showZoneEditing: true,
    showDrawingPreview: true,
  },
  placement: {
    mode: "placement",
    label: "Devices",
    icon: "mdi:devices",
    accent: "#1565c0",
    tools: ["light", "switch", "button", "mmwave", "other"],
    layers: ["background", "structure", "devices", "coverage", "labels"],
    showNormalDevices: true,
    showMmwave: true,
    showMmwaveCoverage: true,
    showWallEditing: false,
    showOpeningEditing: false,
    showZoneEditing: false,
    showDrawingPreview: true,
  },
  occupancy: {
    mode: "occupancy",
    label: "Occupancy",
    icon: "mdi:motion-sensor",
    accent: "#ef6c00",
    tools: [],
    layers: ["background", "structure", "furniture", "automation"],
    showNormalDevices: false,
    showMmwave: true,
    showMmwaveCoverage: false,
    showWallEditing: false,
    showOpeningEditing: false,
    showZoneEditing: false,
    showDrawingPreview: false,
  },
};

export function getMapModeDefinition(mode: CanvasMode): MapModeDefinition {
  return MAP_MODE_DEFINITIONS[mode];
}

export function getMapModeDefinitions(): MapModeDefinition[] {
  return [
    MAP_MODE_DEFINITIONS.viewing,
    MAP_MODE_DEFINITIONS.walls,
    MAP_MODE_DEFINITIONS.openings,
    MAP_MODE_DEFINITIONS.furniture,
    MAP_MODE_DEFINITIONS.placement,
    MAP_MODE_DEFINITIONS.occupancy,
  ];
}

export function getModeTools(mode: CanvasMode): ToolType[] {
  return getMapModeDefinition(mode).tools;
}

export function shouldShowLayer(
  mode: CanvasMode,
  layer: LayerType,
  calibrationActive = false,
): boolean {
  if (calibrationActive) {
    return (
      layer === "background" || layer === "structure" || layer === "devices"
    );
  }
  return getMapModeDefinition(mode).layers.includes(layer);
}

export function getCanvasModePolicy(
  mode: CanvasMode,
  calibrationActive = false,
): MapModeDefinition {
  if (!calibrationActive) return getMapModeDefinition(mode);
  return {
    ...MAP_MODE_DEFINITIONS.placement,
    tools: [],
    layers: ["background", "structure", "devices"],
    showNormalDevices: false,
    showMmwave: true,
    showMmwaveCoverage: false,
    showWallEditing: false,
    showOpeningEditing: false,
    showZoneEditing: false,
    showDrawingPreview: false,
  };
}
