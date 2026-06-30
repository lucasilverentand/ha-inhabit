/**
 * Unified Floorplan Panel – viewer by default, editor mode for admins.
 */

import { css, html, LitElement, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import type {
  ButtonPlacement,
  FanPlacement,
  Floor,
  FloorPlan,
  HomeAssistant,
  LightPlacement,
  MmwavePlacement,
  OtherPlacement,
  SwitchPlacement,
} from "./types";

// Import sub-components
import "./components/canvas/fpb-canvas";
import "./components/toolbar/fpb-toolbar";
import "./components/dialogs/fpb-import-export-dialog";
import "./components/panels/fpb-occupancy-panel";
import "./components/panels/fpb-mmwave-panel";
import "./components/panels/fpb-device-panel";
import type { FpbImportExportDialog } from "./components/dialogs/fpb-import-export-dialog";
import { clearHistory } from "./stores/history-store";
import { polygonArea } from "./utils/geometry";
import type { ConstraintViolation } from "./utils/wall-solver";
import { validateConstraints } from "./utils/wall-solver";

// Re-export shared signals so existing imports from this module keep working
export {
  activeTool,
  buttonPlacements,
  canvasMode,
  constraintConflicts,
  currentFloor,
  currentFloorPlan,
  devicePanelTarget,
  fanPlacements,
  focusedRoomId,
  gridSize,
  layers,
  lightPlacements,
  mmwaveCalibrationTarget,
  mmwavePlacements,
  occupancyPanelTarget,
  otherPlacements,
  reloadFloorData,
  resetSignals,
  selection,
  setCanvasMode,
  setReloadFunction,
  showGrid,
  snapToGrid,
  switchPlacements,
  viewBox,
} from "./stores/signals";

import { effect } from "@preact/signals-core";
import {
  activeTool,
  buttonPlacements,
  canvasMode,
  constraintConflicts,
  currentFloor,
  currentFloorPlan,
  devicePanelTarget,
  fanPlacements,
  focusedRoomId,
  gridSize,
  lightPlacements,
  mmwaveCalibrationTarget,
  mmwavePlacements,
  occupancyPanelTarget,
  otherPlacements,
  resetSignals,
  selection,
  setReloadFunction,
  showGrid,
  switchPlacements,
} from "./stores/signals";

export class HaFloorplanPanel extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ type: Boolean })
  narrow = false;

  @state()
  private _floorPlans: FloorPlan[] = [];

  @state()
  private _loading = true;

  @state()
  private _error: string | null = null;

  @state()
  private _floorCount = 1;

  @state()
  private _haAreas: Array<{
    area_id: string;
    name: string;
    icon?: string | null;
  }> = [];

  @state()
  private _focusedRoomId: string | null = null;

  @state()
  private _occupancyPanelTarget: {
    id: string;
    name: string;
    type: "room" | "zone";
  } | null = null;

  @state()
  private _devicePanelTarget: {
    id: string;
    type: "light" | "switch" | "fan" | "mmwave" | "button" | "other";
  } | null = null;

  @state()
  private _editorMode = false;

  @state()
  private _calibrationCaptureActive = false;

  private _cleanupEffects: (() => void)[] = [];

  private get _isAdmin(): boolean {
    return this.hass?.user?.is_admin ?? false;
  }

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      --toolbar-height: var(--header-height, 48px);
    }

    .container {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    fpb-toolbar {
      flex-shrink: 0;
    }

    .canvas-container {
      flex: 1;
      position: relative;
      overflow: hidden;
      min-height: 0;
    }

    .loading,
    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
    }

    .error {
      color: var(--error-color);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
      padding: 32px;
      text-align: center;
    }

    .empty-state h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .empty-state p {
      margin: 0;
      color: var(--secondary-text-color);
      max-width: 400px;
    }

    .empty-state .init-form {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
    }

    .empty-state .init-form label {
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .empty-state .init-form input {
      width: 60px;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      font-size: 14px;
      text-align: center;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .empty-state .init-form input:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    .empty-state button {
      padding: 11px 24px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.15s, transform 0.1s;
    }

    .empty-state button:hover {
      opacity: 0.9;
    }

    .empty-state button:active {
      transform: scale(0.97);
    }

    .room-chips-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      background: var(--card-background-color, #fff);
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .room-chips-bar::-webkit-scrollbar {
      display: none;
    }

    .room-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      min-height: 32px;
      padding: 4px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 18px;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
    }

    .room-chip:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }

    .room-chip.active {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color, #03a9f4);
    }

    .floating-panel {
      position: absolute;
      bottom: 16px;
      right: 16px;
      width: 300px;
      max-height: calc(100% - 32px);
      overflow-y: auto;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
      z-index: 100;
      scrollbar-width: thin;
    }

    .viewer-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      height: var(--header-height, 48px);
      background: var(--card-background-color, #fff);
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .viewer-toolbar h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      flex: 1;
    }

    .floor-select {
      padding: 4px 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
    }

    .edit-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      min-height: 36px;
      padding: 4px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
    }

    .edit-toggle:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }

    .edit-toggle.active {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
      border-color: var(--primary-color, #03a9f4);
    }

    .calibration-hidden-panel {
      display: none;
    }

    @media (max-width: 900px), (hover: none) and (pointer: coarse) {
      :host {
        --toolbar-height: 52px;
      }

      .main-area {
        position: relative;
      }

      .container:not(.calibration-capture) .canvas-container {
        padding-bottom: calc(148px + env(safe-area-inset-bottom));
        box-sizing: border-box;
      }

      .viewer-toolbar {
        height: auto;
        min-height: 52px;
        padding: 8px 12px;
        gap: 8px;
      }

      .edit-toggle {
        min-width: 44px;
        min-height: 44px;
        justify-content: center;
        border-radius: 13px;
      }

      .floor-select {
        min-height: 40px;
      }

      .room-chips-bar {
        padding: 8px 10px;
      }

      .room-chip {
        min-height: 40px;
        border-radius: 20px;
        padding: 6px 14px;
      }

      .floating-panel {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        width: auto;
        max-height: min(76vh, 620px);
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -10px 30px rgba(0,0,0,0.22);
        padding-bottom: env(safe-area-inset-bottom);
        z-index: 300;
      }
    }

  `;

  override connectedCallback(): void {
    super.connectedCallback();
    resetSignals();
    this._applyMode();
    setReloadFunction(() => this._reloadCurrentFloor());
    this._loadFloorPlans();
    this._loadHaAreas();

    this._cleanupEffects.push(
      effect(() => {
        this._focusedRoomId = focusedRoomId.value;
      }),
      effect(() => {
        this._occupancyPanelTarget = occupancyPanelTarget.value;
      }),
      effect(() => {
        this._devicePanelTarget = devicePanelTarget.value;
      }),
      effect(() => {
        this._calibrationCaptureActive = mmwaveCalibrationTarget.value !== null;
      }),
      effect(() => {
        void currentFloor.value;
        this.requestUpdate();
      }),
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const cleanup of this._cleanupEffects) cleanup();
    this._cleanupEffects = [];
  }

  private _applyMode(): void {
    if (this._editorMode) {
      canvasMode.value = "walls";
      clearHistory();
    } else {
      canvasMode.value = "viewing";
      activeTool.value = "select";
      selection.value = { type: "none", ids: [] };
      showGrid.value = false;
      occupancyPanelTarget.value = null;
      devicePanelTarget.value = null;
    }
  }

  private _toggleEditorMode(): void {
    if (!this._isAdmin) return;
    this._editorMode = !this._editorMode;
    this._applyMode();
  }

  private async _loadHaAreas(): Promise<void> {
    if (!this.hass) return;
    try {
      const areas = await this.hass.callWS<
        Array<{ area_id: string; name: string; icon?: string | null }>
      >({
        type: "config/area_registry/list",
      });
      this._haAreas = areas;
    } catch (err) {
      console.error("Error loading HA areas:", err);
    }
  }

  private async _reloadCurrentFloor(): Promise<void> {
    if (!this.hass) return;

    const fp = currentFloorPlan.value;
    if (!fp) return;

    try {
      const result = await this.hass.callWS<FloorPlan[]>({
        type: "inhabit/floor_plans/list",
      });

      this._floorPlans = result;

      const updatedFp = result.find((p) => p.id === fp.id);
      if (updatedFp) {
        currentFloorPlan.value = updatedFp;

        const currentFloorId = currentFloor.value?.id;
        if (currentFloorId) {
          const updatedFloor = updatedFp.floors.find(
            (f) => f.id === currentFloorId,
          );
          if (updatedFloor) {
            currentFloor.value = updatedFloor;
          } else if (updatedFp.floors.length > 0) {
            currentFloor.value = updatedFp.floors[0];
          }
        } else if (updatedFp.floors.length > 0) {
          currentFloor.value = updatedFp.floors[0];
        }

        await this._loadDevicePlacements(updatedFp.id);
      }
    } catch (err) {
      console.error("Error reloading floor data:", err);
    }
  }

  private _detectFloorConflicts(floorPlan: FloorPlan): void {
    const conflicts = new Map<string, ConstraintViolation[]>();
    for (const floor of floorPlan.floors) {
      const violations = validateConstraints(floor.nodes, floor.edges);
      if (violations.length > 0) {
        conflicts.set(floor.id, violations);
        console.warn(
          `[inhabit] Detected ${violations.length} constraint conflict(s) on floor "${floor.id}":`,
          violations.map((v) => `${v.edgeId} (${v.type})`),
        );
      }
    }
    constraintConflicts.value = conflicts;
  }

  override updated(changedProps: PropertyValues): void {
    if (changedProps.has("hass") && this.hass) {
      this._updateEntityStates();
    }
  }

  private async _loadFloorPlans(): Promise<void> {
    if (!this.hass) {
      this._loading = false;
      this._error = "Home Assistant connection not available";
      return;
    }

    try {
      this._loading = true;
      this._error = null;

      const result = await this.hass.callWS<FloorPlan[]>({
        type: "inhabit/floor_plans/list",
      });

      this._floorPlans = result;

      if (result.length > 0) {
        currentFloorPlan.value = result[0];
        if (result[0].floors.length > 0) {
          currentFloor.value = result[0].floors[0];
          gridSize.value = result[0].grid_size;
        }

        this._detectFloorConflicts(result[0]);
        await this._loadDevicePlacements(result[0].id);
      }

      this._loading = false;
    } catch (err) {
      this._loading = false;
      this._error = `Failed to load floor plans: ${err instanceof Error ? err.message : err}`;
      console.error("Error loading floor plans:", err);
    }
  }

  private async _loadDevicePlacements(floorPlanId: string): Promise<void> {
    if (!this.hass) return;

    const results = await Promise.allSettled([
      this.hass.callWS<LightPlacement[]>({
        type: "inhabit/lights/list",
        floor_plan_id: floorPlanId,
      }),
      this.hass.callWS<SwitchPlacement[]>({
        type: "inhabit/switches/list",
        floor_plan_id: floorPlanId,
      }),
      this.hass.callWS<FanPlacement[]>({
        type: "inhabit/fans/list",
        floor_plan_id: floorPlanId,
      }),
      this.hass.callWS<ButtonPlacement[]>({
        type: "inhabit/buttons/list",
        floor_plan_id: floorPlanId,
      }),
      this.hass.callWS<OtherPlacement[]>({
        type: "inhabit/others/list",
        floor_plan_id: floorPlanId,
      }),
      this.hass.callWS<MmwavePlacement[]>({
        type: "inhabit/mmwave/list",
        floor_plan_id: floorPlanId,
      }),
    ]);

    const labels = [
      "lights",
      "switches",
      "fans",
      "buttons",
      "others",
      "mmwave",
    ] as const;
    const signals = [
      lightPlacements,
      switchPlacements,
      fanPlacements,
      buttonPlacements,
      otherPlacements,
      mmwavePlacements,
    ] as const;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled") {
        (signals[i] as (typeof signals)[number]).value = result.value as any;
      } else {
        console.error(`Error loading ${labels[i]} placements:`, result.reason);
      }
    }
  }

  private _updateEntityStates(): void {
    this.requestUpdate();
  }

  private async _initializeFloors(count: number): Promise<void> {
    if (!this.hass) return;

    try {
      const result = await this.hass.callWS<FloorPlan>({
        type: "inhabit/floor_plans/create",
        name: "Home",
        unit: "cm",
        grid_size: 10,
      });

      result.floors = [];

      for (let i = 0; i < count; i++) {
        const floor = await this.hass.callWS<Floor>({
          type: "inhabit/floors/add",
          floor_plan_id: result.id,
          name: `Floor ${i + 1}`,
          level: i,
        });
        result.floors.push(floor);
      }

      this._floorPlans = [result];
      currentFloorPlan.value = result;
      currentFloor.value = result.floors[0];
      gridSize.value = result.grid_size;
    } catch (err) {
      console.error("Error creating floors:", err);
      alert(
        `Failed to create floors: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  private async _loadLocalSimulatorHouse(
    replaceExisting = false,
  ): Promise<void> {
    if (!this.hass) return;

    try {
      const result = await this.hass.callWS<{
        created: boolean;
        floor_plan: FloorPlan;
      }>({
        type: "inhabit/simulate/local_house/create",
        replace_existing: replaceExisting,
      });

      const floorPlan = result.floor_plan;
      this._floorPlans = [
        floorPlan,
        ...this._floorPlans.filter((plan) => plan.id !== floorPlan.id),
      ];
      currentFloorPlan.value = floorPlan;
      currentFloor.value = floorPlan.floors[0] ?? null;
      gridSize.value = floorPlan.grid_size;
      this._detectFloorConflicts(floorPlan);
      await this._loadDevicePlacements(floorPlan.id);
      clearHistory();
      this._editorMode = true;
      canvasMode.value = "occupancy";
      activeTool.value = "select";
      showGrid.value = false;
    } catch (err) {
      console.error("Error loading simulator house:", err);
      alert(
        `Failed to load simulator house: ${
          err instanceof Error ? err.message : err
        }`,
      );
    }
  }

  private async _addFloor(): Promise<void> {
    if (!this.hass) return;

    const fp = currentFloorPlan.value;
    if (!fp) return;

    const name = prompt("Floor name:", `Floor ${fp.floors.length + 1}`);
    if (!name) return;

    try {
      const floor = await this.hass.callWS<Floor>({
        type: "inhabit/floors/add",
        floor_plan_id: fp.id,
        name: name,
        level: fp.floors.length,
      });

      const updatedFp = { ...fp, floors: [...fp.floors, floor] };
      this._floorPlans = this._floorPlans.map((p) =>
        p.id === fp.id ? updatedFp : p,
      );
      currentFloorPlan.value = updatedFp;
      currentFloor.value = floor;
    } catch (err) {
      console.error("Error adding floor:", err);
      alert(`Failed to add floor: ${err instanceof Error ? err.message : err}`);
    }
  }

  private async _deleteFloor(floorId: string): Promise<void> {
    if (!this.hass) return;

    const fp = currentFloorPlan.value;
    if (!fp) return;

    try {
      await this.hass.callWS({
        type: "inhabit/floors/delete",
        floor_plan_id: fp.id,
        floor_id: floorId,
      });

      const updatedFloors = fp.floors.filter((f) => f.id !== floorId);
      const updatedFp = { ...fp, floors: updatedFloors };
      this._floorPlans = this._floorPlans.map((p) =>
        p.id === fp.id ? updatedFp : p,
      );
      currentFloorPlan.value = updatedFp;

      if (currentFloor.value?.id === floorId) {
        clearHistory();
        currentFloor.value = updatedFloors.length > 0 ? updatedFloors[0] : null;
      }
    } catch (err) {
      console.error("Error deleting floor:", err);
      alert(
        `Failed to delete floor: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  private async _renameFloor(floorId: string, name: string): Promise<void> {
    if (!this.hass) return;

    const fp = currentFloorPlan.value;
    if (!fp) return;

    try {
      await this.hass.callWS({
        type: "inhabit/floors/update",
        floor_plan_id: fp.id,
        floor_id: floorId,
        name,
      });

      const updatedFloors = fp.floors.map((f) =>
        f.id === floorId ? { ...f, name } : f,
      );
      const updatedFp = { ...fp, floors: updatedFloors };
      this._floorPlans = this._floorPlans.map((p) =>
        p.id === fp.id ? updatedFp : p,
      );
      currentFloorPlan.value = updatedFp;

      if (currentFloor.value?.id === floorId) {
        currentFloor.value = { ...currentFloor.value, name };
      }
    } catch (err) {
      console.error("Error renaming floor:", err);
    }
  }

  private _openImportExport(): void {
    const dialog = this.shadowRoot?.querySelector(
      "fpb-import-export-dialog",
    ) as FpbImportExportDialog | null;
    dialog?.show();
  }

  private async _handleFloorsImported(e: CustomEvent): Promise<void> {
    const { floorPlan, switchTo } = e.detail;
    this._floorPlans = this._floorPlans.map((p) =>
      p.id === floorPlan.id ? floorPlan : p,
    );
    currentFloorPlan.value = floorPlan;
    if (switchTo) {
      clearHistory();
      currentFloor.value = switchTo;
    }
    await this._loadDevicePlacements(floorPlan.id);
  }

  private _handleFloorSelect(floorId: string): void {
    const fp = currentFloorPlan.value;
    if (fp) {
      const floor = fp.floors.find((f) => f.id === floorId);
      if (floor) {
        if (currentFloor.value?.id !== floor.id) {
          clearHistory();
          focusedRoomId.value = null;
        }
        currentFloor.value = floor;
      }
    }
  }

  private _handleFloorChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    this._handleFloorSelect(select.value);
  }

  private _handleRoomChipClick(roomId: string | null): void {
    if (roomId === null) {
      focusedRoomId.value = null;
      occupancyPanelTarget.value = null;
    } else if (focusedRoomId.value === roomId) {
      focusedRoomId.value = null;
    } else {
      focusedRoomId.value = roomId;
    }
  }

  private _renderRoomChips() {
    const floor = currentFloor.value;
    if (!floor || floor.rooms.length === 0) return null;

    const floorPlanUnit = currentFloorPlan.value?.unit;
    const toSquareMeters = (area: number) => {
      switch (floorPlanUnit) {
        case "cm":
          return area / 10000;
        case "m":
          return area;
        case "in":
          return area * 0.00064516;
        case "ft":
          return area * 0.092903;
        default:
          return area;
      }
    };

    const sortedRooms = [...floor.rooms].sort((roomA, roomB) => {
      const areaA = toSquareMeters(Math.abs(polygonArea(roomA.polygon)));
      const areaB = toSquareMeters(Math.abs(polygonArea(roomB.polygon)));
      if (areaA === areaB) {
        return roomA.name.localeCompare(roomB.name);
      }
      return areaB - areaA;
    });

    return html`
      <div class="room-chips-bar">
        <button
          class="room-chip ${this._focusedRoomId === null ? "active" : ""}"
          @click=${() => this._handleRoomChipClick(null)}
        >
          <ha-icon icon="mdi:home-outline" style="--mdc-icon-size: 16px;"></ha-icon>
          <span>All</span>
        </button>
        ${sortedRooms.map((room) => {
          const area = room.ha_area_id
            ? this._haAreas.find((a) => a.area_id === room.ha_area_id)
            : null;
          const icon = area?.icon || "mdi:floor-plan";
          const displayName = area?.name ?? room.name;
          return html`
            <button
              class="room-chip ${this._focusedRoomId === room.id ? "active" : ""}"
              @click=${() => this._handleRoomChipClick(room.id)}
            >
              <ha-icon icon=${icon} style="--mdc-icon-size: 16px;"></ha-icon>
              <span>${displayName}</span>
            </button>
          `;
        })}
      </div>
    `;
  }

  private _renderViewerToolbar() {
    const fp = currentFloorPlan.value;
    const floors = fp?.floors ?? [];
    const activeFloorId = currentFloor.value?.id;

    return html`
      <div class="viewer-toolbar">
        <ha-icon icon="mdi:floor-plan"></ha-icon>
        ${
          floors.length > 1
            ? html`
              <select
                class="floor-select"
                .value=${activeFloorId ?? ""}
                @change=${(e: Event) => this._handleFloorChange(e)}
              >
                ${floors.map(
                  (f) =>
                    html`<option value=${f.id} ?selected=${f.id === activeFloorId}>
                      ${f.name}
                    </option>`,
                )}
              </select>
            `
            : null
        }
        <span style="flex:1"></span>
        ${
          this._isAdmin
            ? html`
              <button
                class="edit-toggle ${this._editorMode ? "active" : ""}"
                @click=${() => this._toggleEditorMode()}
                title=${this._editorMode ? "Exit editor" : "Edit floor plan"}
              >
                <ha-icon icon=${this._editorMode ? "mdi:close" : "mdi:pencil"} style="--mdc-icon-size: 18px;"></ha-icon>
                <span>${this._editorMode ? "Done" : "Edit"}</span>
              </button>
            `
            : null
        }
      </div>
    `;
  }

  override render() {
    if (this._loading) {
      return html`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading floor plan...</p>
        </div>
      `;
    }

    if (this._error) {
      return html`
        <div class="error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>${this._error}</p>
          <button @click=${() => this._loadFloorPlans()}>Retry</button>
        </div>
      `;
    }

    if (this._floorPlans.length === 0) {
      if (!this._isAdmin) {
        return html`
          <div class="empty-state">
            <ha-icon icon="mdi:floor-plan" style="--mdc-icon-size: 64px;"></ha-icon>
            <h2>No Floor Plans</h2>
            <p>Ask an administrator to create a floor plan.</p>
          </div>
        `;
      }

      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:floor-plan" style="--mdc-icon-size: 64px;"></ha-icon>
          <h2>Welcome to Inhabit</h2>
          <p>
            Create visual floor plans of your home, place devices, and set up
            spatial automations with occupancy detection.
          </p>
          <div class="init-form">
            <label>Floors</label>
            <input
              type="number"
              min="1"
              max="10"
              .value=${String(this._floorCount)}
              @input=${(e: InputEvent) => {
                const val = parseInt((e.target as HTMLInputElement).value, 10);
                if (val >= 1 && val <= 10) this._floorCount = val;
              }}
            />
            <button @click=${() => this._initializeFloors(this._floorCount)}>Get Started</button>
            <button @click=${() => this._loadLocalSimulatorHouse()}>
              Load simulator house
            </button>
          </div>
        </div>
      `;
    }

    if (this._editorMode) {
      return html`
        <div class="container ${this._calibrationCaptureActive ? "calibration-capture" : ""}">
          <div class="main-area">
            ${
              this._calibrationCaptureActive
                ? null
                : html`
              <fpb-toolbar
                .hass=${this.hass}
                .floorPlans=${this._floorPlans}
                @floor-select=${(e: CustomEvent) =>
                  this._handleFloorSelect(e.detail.id)}
                @add-floor=${this._addFloor}
                @delete-floor=${(e: CustomEvent) =>
                  this._deleteFloor(e.detail.id)}
                @rename-floor=${(e: CustomEvent) =>
                  this._renameFloor(e.detail.id, e.detail.name)}
                @open-import-export=${this._openImportExport}
                @load-local-simulator=${() => this._loadLocalSimulatorHouse(true)}
                @exit-editor=${this._toggleEditorMode}
              ></fpb-toolbar>
            `
            }

            ${this._calibrationCaptureActive ? null : this._renderRoomChips()}

            <div class="canvas-container">
              <fpb-canvas .hass=${this.hass}></fpb-canvas>
              ${
                this._occupancyPanelTarget
                  ? html`
                <fpb-occupancy-panel
                  class="floating-panel"
                  .hass=${this.hass}
                  .targetId=${this._occupancyPanelTarget.id}
                  .targetName=${this._occupancyPanelTarget.name}
                  .targetType=${this._occupancyPanelTarget.type}
                  @close-panel=${() => {
                    occupancyPanelTarget.value = null;
                    focusedRoomId.value = null;
                  }}
                ></fpb-occupancy-panel>
              `
                  : null
              }
              ${
                this._devicePanelTarget
                  ? html`
                <fpb-device-panel
                  class=${
                    this._calibrationCaptureActive
                      ? "calibration-hidden-panel"
                      : "floating-panel"
                  }
                  .hass=${this.hass}
                  .placementId=${this._devicePanelTarget.id}
                  .deviceType=${this._devicePanelTarget.type}
                ></fpb-device-panel>
              `
                  : null
              }
            </div>
          </div>
        </div>
        <fpb-import-export-dialog
          .hass=${this.hass}
          @floors-imported=${this._handleFloorsImported}
        ></fpb-import-export-dialog>
      `;
    }

    // Viewer mode (default)
    return html`
      ${this._renderViewerToolbar()}
      ${this._renderRoomChips()}
      <div class="canvas-container">
        <fpb-canvas .hass=${this.hass}></fpb-canvas>
      </div>
    `;
  }
}
