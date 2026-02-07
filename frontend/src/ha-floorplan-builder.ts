/**
 * Main Floor Plan Builder Panel Component
 */

import { LitElement, html, css, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { signal } from "@preact/signals-core";
import type {
  HomeAssistant,
  FloorPlan,
  Floor,
  ToolType,
  LayerConfig,
  ViewBox,
  SelectionState,
  DevicePlacement,
} from "./types";

// Import sub-components
import "./components/canvas/fpb-canvas";
import "./components/toolbar/fpb-toolbar";
import { clearHistory } from "./stores/history-store";

// Global state signals
export const currentFloorPlan = signal<FloorPlan | null>(null);
export const currentFloor = signal<Floor | null>(null);
export const activeTool = signal<ToolType>("select");
export const selection = signal<SelectionState>({ type: "none", ids: [] });
export const viewBox = signal<ViewBox>({ x: 0, y: 0, width: 1000, height: 800 });
export const gridSize = signal<number>(10);
export const snapToGrid = signal<boolean>(true);
export const showGrid = signal<boolean>(true);

export const layers = signal<LayerConfig[]>([
  { id: "background", name: "Background", visible: true, locked: false, opacity: 1 },
  { id: "structure", name: "Structure", visible: true, locked: false, opacity: 1 },
  { id: "furniture", name: "Furniture", visible: true, locked: false, opacity: 1 },
  { id: "devices", name: "Devices", visible: true, locked: false, opacity: 1 },
  { id: "coverage", name: "Coverage", visible: true, locked: false, opacity: 0.5 },
  { id: "labels", name: "Labels", visible: true, locked: false, opacity: 1 },
  { id: "automation", name: "Automation", visible: true, locked: false, opacity: 0.7 },
]);

export const devicePlacements = signal<DevicePlacement[]>([]);

// Function to reload current floor plan data (called after modifications)
let _reloadFloorData: (() => Promise<void>) | null = null;

export function setReloadFunction(fn: () => Promise<void>): void {
  _reloadFloorData = fn;
}

export async function reloadFloorData(): Promise<void> {
  if (_reloadFloorData) {
    await _reloadFloorData();
  }
}

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
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-size: 14px;
      text-align: center;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
    }

    .empty-state button {
      padding: 10px 20px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .empty-state button:hover {
      opacity: 0.9;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadFloorPlans();
    setReloadFunction(() => this._reloadCurrentFloor());
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
      const result = await this.hass.callWS<DevicePlacement[]>({
        type: "inhabit/devices/list",
        floor_plan_id: floorPlanId,
      });
      devicePlacements.value = result;
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

  private _handleFloorSelect(floorId: string): void {
    const fp = currentFloorPlan.value;
    if (fp) {
      const floor = fp.floors.find((f) => f.id === floorId);
      if (floor) {
        if (currentFloor.value?.id !== floor.id) {
          clearHistory();
        }
        currentFloor.value = floor;
      }
    }
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
          ></fpb-toolbar>

          <div class="canvas-container">
            <fpb-canvas .hass=${this.hass}></fpb-canvas>
          </div>
        </div>
      </div>
    `;
  }
}
