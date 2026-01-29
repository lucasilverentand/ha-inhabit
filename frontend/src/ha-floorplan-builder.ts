/**
 * Main Floor Plan Builder Panel Component
 */

import { LitElement, html, css, PropertyValues, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { signal, computed } from "@preact/signals-core";
import type {
  HomeAssistant,
  FloorPlan,
  Floor,
  ToolType,
  LayerConfig,
  Coordinates,
  ViewBox,
  SelectionState,
  DevicePlacement,
} from "./types";

// Import sub-components
import "./components/canvas/fpb-canvas";
import "./components/toolbar/fpb-toolbar";
import "./components/sidebar/fpb-sidebar";

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
  private _sidebarCollapsed = false;

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      --sidebar-width: 300px;
      --toolbar-height: 48px;
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
      border-bottom: 1px solid var(--divider-color);
    }

    .canvas-container {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    fpb-sidebar {
      width: var(--sidebar-width);
      border-left: 1px solid var(--divider-color);
      overflow-y: auto;
      transition: width 0.2s ease;
    }

    fpb-sidebar.collapsed {
      width: 48px;
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

    .empty-state button {
      margin-top: 16px;
      padding: 12px 24px;
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

    /* Narrow mode adjustments */
    :host([narrow]) fpb-sidebar {
      position: absolute;
      right: 0;
      top: var(--toolbar-height);
      bottom: 0;
      z-index: 10;
      background: var(--card-background-color);
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    }

    :host([narrow]) fpb-sidebar.collapsed {
      transform: translateX(calc(100% - 48px));
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadFloorPlans();
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

  private async _createFloor(): Promise<void> {
    if (!this.hass) return;

    const name = prompt("Floor name:", `Floor ${this._floorPlans.length + 1}`);
    if (!name) return;

    try {
      // Each "floor" is a floor plan with a single floor
      const result = await this.hass.callWS<FloorPlan>({
        type: "inhabit/floor_plans/create",
        name: name,
        unit: "cm",
        grid_size: 10,
      });

      // Create the floor inside
      const floor = await this.hass.callWS<Floor>({
        type: "inhabit/floors/add",
        floor_plan_id: result.id,
        name: name,
        level: this._floorPlans.length,
      });

      result.floors = [floor];
      this._floorPlans = [...this._floorPlans, result];
      currentFloorPlan.value = result;
      currentFloor.value = floor;
    } catch (err) {
      console.error("Error creating floor:", err);
      alert(`Failed to create floor: ${err}`);
    }
  }

  private _handleFloorPlanSelect(floorPlanId: string): void {
    const fp = this._floorPlans.find((p) => p.id === floorPlanId);
    if (fp) {
      currentFloorPlan.value = fp;
      currentFloor.value = fp.floors[0] || null;
      this._loadDevicePlacements(fp.id);
    }
  }

  private _handleFloorSelect(floorId: string): void {
    const fp = currentFloorPlan.value;
    if (fp) {
      const floor = fp.floors.find((f) => f.id === floorId);
      if (floor) {
        currentFloor.value = floor;
      }
    }
  }

  private _toggleSidebar(): void {
    this._sidebarCollapsed = !this._sidebarCollapsed;
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
          <button @click=${this._createFloor}>Create Floor</button>
        </div>
      `;
    }

    return html`
      <div class="container">
        <div class="main-area">
          <fpb-toolbar
            .hass=${this.hass}
            .floorPlans=${this._floorPlans}
            @floor-plan-select=${(e: CustomEvent) =>
              this._handleFloorPlanSelect(e.detail.id)}
            @floor-select=${(e: CustomEvent) =>
              this._handleFloorSelect(e.detail.id)}
            @create-floor=${this._createFloor}
          ></fpb-toolbar>

          <div class="canvas-container">
            <fpb-canvas .hass=${this.hass}></fpb-canvas>
          </div>
        </div>

        <fpb-sidebar
          class=${this._sidebarCollapsed ? "collapsed" : ""}
          .hass=${this.hass}
          .collapsed=${this._sidebarCollapsed}
          @toggle-sidebar=${this._toggleSidebar}
        ></fpb-sidebar>
      </div>
    `;
  }
}
