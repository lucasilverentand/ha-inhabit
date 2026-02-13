/**
 * Main Floor Plan Builder Panel Component
 */

import { LitElement, html, css, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  FloorPlan,
  Floor,
  DevicePlacement,
  MmwavePlacement,
} from "./types";

// Import sub-components
import "./components/canvas/fpb-canvas";
import "./components/toolbar/fpb-toolbar";
import "./components/dialogs/fpb-import-export-dialog";
import "./components/panels/fpb-occupancy-panel";
import "./components/panels/fpb-mmwave-panel";
import type { FpbImportExportDialog } from "./components/dialogs/fpb-import-export-dialog";
import { clearHistory } from "./stores/history-store";
import { validateConstraints } from "./utils/wall-solver";
import type { ConstraintViolation } from "./utils/wall-solver";

// Re-export shared signals so existing imports from this module keep working
export {
  currentFloorPlan,
  currentFloor,
  canvasMode,
  activeTool,
  selection,
  viewBox,
  gridSize,
  snapToGrid,
  showGrid,
  layers,
  devicePlacements,
  constraintConflicts,
  focusedRoomId,
  occupancyPanelTarget,
  mmwavePlacements,
  setCanvasMode,
  setReloadFunction,
  reloadFloorData,
  resetSignals,
} from "./stores/signals";

import {
  currentFloorPlan,
  currentFloor,
  canvasMode,
  gridSize,
  devicePlacements,
  constraintConflicts,
  focusedRoomId,
  occupancyPanelTarget,
  mmwavePlacements,
  setReloadFunction,
  resetSignals,
} from "./stores/signals";

import { effect } from "@preact/signals-core";

export class HaFloorplanBuilder extends LitElement {
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
  private _haAreas: Array<{ area_id: string; name: string; icon?: string | null }> = [];

  @state()
  private _focusedRoomId: string | null = null;

  @state()
  private _occupancyPanelTarget: { id: string; name: string; type: "room" | "zone" } | null = null;

  private _cleanupEffects: (() => void)[] = [];

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
      height: var(--toolbar-height);
    }

    .canvas-container {
      flex: 1;
      position: relative;
      overflow: hidden;
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

    .canvas-with-panel {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .canvas-with-panel .canvas-container {
      flex: 1;
    }

    fpb-occupancy-panel {
      width: 320px;
      flex-shrink: 0;
      border-left: 1px solid var(--divider-color, #e0e0e0);
      overflow-y: auto;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    // Reset all shared signals so stale state from the viewer doesn't bleed in
    resetSignals();
    canvasMode.value = "walls";
    clearHistory();
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
        // Track floor changes to re-render chips bar when rooms change
        void currentFloor.value;
        this.requestUpdate();
      })
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cleanupEffects.forEach(cleanup => cleanup());
    this._cleanupEffects = [];
  }

  private async _loadHaAreas(): Promise<void> {
    if (!this.hass) return;
    try {
      const areas = await this.hass.callWS<Array<{ area_id: string; name: string; icon?: string | null }>>({
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
      // Reload all floor plans to get fresh data
      const result = await this.hass.callWS<FloorPlan[]>({
        type: "inhabit/floor_plans/list",
      });

      this._floorPlans = result;

      // Find and update the current floor plan
      const updatedFp = result.find(p => p.id === fp.id);
      if (updatedFp) {
        currentFloorPlan.value = updatedFp;

        // Find and update the current floor
        const currentFloorId = currentFloor.value?.id;
        if (currentFloorId) {
          const updatedFloor = updatedFp.floors.find(f => f.id === currentFloorId);
          if (updatedFloor) {
            currentFloor.value = updatedFloor;
          } else if (updatedFp.floors.length > 0) {
            currentFloor.value = updatedFp.floors[0];
          }
        } else if (updatedFp.floors.length > 0) {
          currentFloor.value = updatedFp.floors[0];
        }

        // Reload device placements
        await this._loadDevicePlacements(updatedFp.id);
      }
    } catch (err) {
      console.error("Error reloading floor data:", err);
    }
  }

  /**
   * Detect constraint violations on all floors and surface them via the
   * constraintConflicts signal. The user sees amber highlights on the
   * canvas and decides what to fix — no silent mutation of constraints.
   */
  private _detectFloorConflicts(floorPlan: FloorPlan): void {
    const conflicts = new Map<string, ConstraintViolation[]>();
    for (const floor of floorPlan.floors) {
      const violations = validateConstraints(floor.nodes, floor.edges);
      if (violations.length > 0) {
        conflicts.set(floor.id, violations);
        console.warn(
          `[inhabit] Detected ${violations.length} constraint conflict(s) on floor "${floor.id}":`,
          violations.map(v => `${v.edgeId} (${v.type})`)
        );
      }
    }
    constraintConflicts.value = conflicts;
  }

  override updated(changedProps: PropertyValues): void {
    if (changedProps.has("hass") && this.hass) {
      // Update entity states in device placements
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

      // Select first floor plan if available
      if (result.length > 0) {
        currentFloorPlan.value = result[0];
        if (result[0].floors.length > 0) {
          currentFloor.value = result[0].floors[0];
          gridSize.value = result[0].grid_size;
        }

        // Detect constraint conflicts on initial load (highlight, don't auto-fix)
        this._detectFloorConflicts(result[0]);

        // Load device placements
        await this._loadDevicePlacements(result[0].id);
      }

      this._loading = false;
    } catch (err) {
      this._loading = false;
      this._error = `Failed to load floor plans: ${err}`;
      console.error("Error loading floor plans:", err);
    }
  }

  private async _loadDevicePlacements(floorPlanId: string): Promise<void> {
    if (!this.hass) return;

    try {
      const [devices, mmwave] = await Promise.all([
        this.hass.callWS<DevicePlacement[]>({
          type: "inhabit/devices/list",
          floor_plan_id: floorPlanId,
        }),
        this.hass.callWS<MmwavePlacement[]>({
          type: "inhabit/mmwave/list",
          floor_plan_id: floorPlanId,
        }),
      ]);
      devicePlacements.value = devices;
      mmwavePlacements.value = mmwave;
    } catch (err) {
      console.error("Error loading device placements:", err);
    }
  }

  private _updateEntityStates(): void {
    // This would update real-time entity states
    // Triggered when hass object changes
    this.requestUpdate();
  }

  private async _initializeFloors(count: number): Promise<void> {
    if (!this.hass) return;

    try {
      // Create one floor plan (the "home")
      const result = await this.hass.callWS<FloorPlan>({
        type: "inhabit/floor_plans/create",
        name: "Home",
        unit: "cm",
        grid_size: 10,
      });

      result.floors = [];

      // Create N floors inside
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
      alert(`Failed to create floors: ${err}`);
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
      this._floorPlans = this._floorPlans.map(p => p.id === fp.id ? updatedFp : p);
      currentFloorPlan.value = updatedFp;
      currentFloor.value = floor;
    } catch (err) {
      console.error("Error adding floor:", err);
      alert(`Failed to add floor: ${err}`);
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

      const updatedFloors = fp.floors.filter(f => f.id !== floorId);
      const updatedFp = { ...fp, floors: updatedFloors };
      this._floorPlans = this._floorPlans.map(p => p.id === fp.id ? updatedFp : p);
      currentFloorPlan.value = updatedFp;

      // Switch to another floor or clear
      if (currentFloor.value?.id === floorId) {
        clearHistory();
        currentFloor.value = updatedFloors.length > 0 ? updatedFloors[0] : null;
      }
    } catch (err) {
      console.error("Error deleting floor:", err);
      alert(`Failed to delete floor: ${err}`);
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

      const updatedFloors = fp.floors.map(f =>
        f.id === floorId ? { ...f, name } : f
      );
      const updatedFp = { ...fp, floors: updatedFloors };
      this._floorPlans = this._floorPlans.map(p => p.id === fp.id ? updatedFp : p);
      currentFloorPlan.value = updatedFp;

      if (currentFloor.value?.id === floorId) {
        currentFloor.value = { ...currentFloor.value, name };
      }
    } catch (err) {
      console.error("Error renaming floor:", err);
    }
  }

  private _openImportExport(): void {
    const dialog = this.shadowRoot?.querySelector("fpb-import-export-dialog") as FpbImportExportDialog | null;
    dialog?.show();
  }

  private async _handleFloorsImported(e: CustomEvent): Promise<void> {
    const { floorPlan, switchTo } = e.detail;
    this._floorPlans = this._floorPlans.map(p => p.id === floorPlan.id ? floorPlan : p);
    currentFloorPlan.value = floorPlan;
    if (switchTo) {
      clearHistory();
      currentFloor.value = switchTo;
    }
    // Reload device placements since import may have added new ones
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

  private _handleRoomChipClick(roomId: string | null): void {
    if (focusedRoomId.value === roomId) {
      // Toggle off if clicking same chip
      focusedRoomId.value = null;
    } else {
      focusedRoomId.value = roomId;
    }
  }

  private _renderRoomChips() {
    const floor = currentFloor.value;
    if (!floor || floor.rooms.length === 0) return null;

    return html`
      <div class="room-chips-bar">
        <button
          class="room-chip ${this._focusedRoomId === null ? "active" : ""}"
          @click=${() => this._handleRoomChipClick(null)}
        >
          <ha-icon icon="mdi:home-outline" style="--mdc-icon-size: 16px;"></ha-icon>
          <span>All</span>
        </button>
        ${floor.rooms.map(room => {
          const area = room.ha_area_id
            ? this._haAreas.find(a => a.area_id === room.ha_area_id)
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

  override render() {
    if (this._loading) {
      return html`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading floor plans...</p>
        </div>
      `;
    }

    if (this._error) {
      return html`
        <div class="error">
          <ha-icon icon="mdi:alert-circle"></ha-icon>
          <p>${this._error}</p>
          <button @click=${this._loadFloorPlans}>Retry</button>
        </div>
      `;
    }

    if (this._floorPlans.length === 0) {
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
          </div>
        </div>
      `;
    }

    return html`
      <div class="container">
        <div class="main-area">
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
          ></fpb-toolbar>

          ${this._renderRoomChips()}

          ${this._occupancyPanelTarget ? html`
            <div class="canvas-with-panel">
              <div class="canvas-container">
                <fpb-canvas .hass=${this.hass}></fpb-canvas>
              </div>
              <fpb-occupancy-panel
                .hass=${this.hass}
                .targetId=${this._occupancyPanelTarget.id}
                .targetName=${this._occupancyPanelTarget.name}
                .targetType=${this._occupancyPanelTarget.type}
                @close-panel=${() => { occupancyPanelTarget.value = null; }}
              ></fpb-occupancy-panel>
            </div>
          ` : html`
            <div class="canvas-container">
              <fpb-canvas .hass=${this.hass}></fpb-canvas>
            </div>
          `}
        </div>
      </div>
      <fpb-import-export-dialog
        .hass=${this.hass}
        @floors-imported=${this._handleFloorsImported}
      ></fpb-import-export-dialog>
    `;
  }
}
