/**
 * Floorplan Viewer – read-only panel (no editing tools).
 *
 * Shares the same canvas component as the editor but locks the mode to
 * "viewing" and hides the toolbar.
 */

import { LitElement, html, css, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import type {
  HomeAssistant,
  FloorPlan,
  DevicePlacement,
} from "./types";

// Import the canvas component (it already supports viewing mode)
import "./components/canvas/fpb-canvas";

// Import shared signals that live on window so both bundles share them
import {
  currentFloorPlan,
  currentFloor,
  canvasMode,
  activeTool,
  selection,
  gridSize,
  showGrid,
  devicePlacements,
  focusedRoomId,
  setReloadFunction,
  resetSignals,
} from "./stores/signals";

import { effect } from "@preact/signals-core";

export class HaFloorplanViewer extends LitElement {
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
  private _haAreas: Array<{ area_id: string; name: string; icon?: string | null }> = [];

  @state()
  private _focusedRoomId: string | null = null;

  private _cleanupEffects: (() => void)[] = [];

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
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
  `;

  override connectedCallback(): void {
    super.connectedCallback();

    // Reset all shared signals so stale state from the editor doesn't bleed in
    resetSignals();

    // Lock to viewing mode
    canvasMode.value = "viewing";
    activeTool.value = "select";
    selection.value = { type: "none", ids: [] };
    showGrid.value = false;

    setReloadFunction(() => this._reloadCurrentFloor());
    this._loadFloorPlans();
    this._loadHaAreas();

    this._cleanupEffects.push(
      effect(() => {
        this._focusedRoomId = focusedRoomId.value;
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

  override updated(changedProps: PropertyValues): void {
    if (changedProps.has("hass") && this.hass) {
      this.requestUpdate();
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
        await this._loadDevicePlacements(result[0].id);
      }

      this._loading = false;
    } catch (err) {
      this._loading = false;
      this._error = `Failed to load floor plans: ${err}`;
      console.error("Error loading floor plans:", err);
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

  private _handleFloorChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    const floorId = select.value;
    const fp = currentFloorPlan.value;
    if (fp) {
      const floor = fp.floors.find((f) => f.id === floorId);
      if (floor) {
        focusedRoomId.value = null;
        currentFloor.value = floor;
      }
    }
  }

  private _handleRoomChipClick(roomId: string | null): void {
    if (focusedRoomId.value === roomId) {
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
          <p>Loading floor plan...</p>
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
          <ha-icon
            icon="mdi:floor-plan"
            style="--mdc-icon-size: 64px;"
          ></ha-icon>
          <h2>No Floor Plans</h2>
          <p>
            Use the Floorplan Editor to create and configure your floor plans.
          </p>
        </div>
      `;
    }

    const fp = currentFloorPlan.value;
    const floors = fp?.floors ?? [];
    const activeFloorId = currentFloor.value?.id;

    return html`
      <div class="viewer-toolbar">
        <ha-icon icon="mdi:floor-plan"></ha-icon>
        <h1>${fp?.name ?? "Floorplan"}</h1>
        ${floors.length > 1
          ? html`
              <select
                class="floor-select"
                .value=${activeFloorId ?? ""}
                @change=${this._handleFloorChange}
              >
                ${floors.map(
                  (f) =>
                    html`<option value=${f.id} ?selected=${f.id === activeFloorId}>
                      ${f.name}
                    </option>`,
                )}
              </select>
            `
          : null}
      </div>
      ${this._renderRoomChips()}
      <div class="canvas-container">
        <fpb-canvas .hass=${this.hass}></fpb-canvas>
      </div>
    `;
  }
}
