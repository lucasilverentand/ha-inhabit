/**
 * Toolbar Component
 */

import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { HomeAssistant, FloorPlan, ToolType } from "../../types";
import {
  currentFloorPlan,
  currentFloor,
  activeTool,
  showGrid,
  snapToGrid,
} from "../../ha-floorplan-builder";
import { canUndo, canRedo, undo, redo } from "../../stores/history-store";

interface ToolConfig {
  id: ToolType;
  icon: string;
  label: string;
}

const TOOLS: ToolConfig[] = [
  { id: "select", icon: "mdi:cursor-default", label: "Select" },
  { id: "wall", icon: "mdi:wall", label: "Wall" },
  { id: "room", icon: "mdi:floor-plan", label: "Room" },
  { id: "door", icon: "mdi:door", label: "Door" },
  { id: "window", icon: "mdi:window-closed-variant", label: "Window" },
  { id: "rectangle", icon: "mdi:rectangle-outline", label: "Rectangle" },
  { id: "ellipse", icon: "mdi:ellipse-outline", label: "Ellipse" },
  { id: "text", icon: "mdi:format-text", label: "Text" },
  { id: "device", icon: "mdi:devices", label: "Place Device" },
];

@customElement("fpb-toolbar")
export class FpbToolbar extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  floorPlans: FloorPlan[] = [];

  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 8px;
      background: var(--card-background-color);
    }

    .floor-plan-select,
    .floor-select {
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      cursor: pointer;
    }

    .divider {
      width: 1px;
      height: 24px;
      background: var(--divider-color);
      margin: 0 8px;
    }

    .tool-group {
      display: flex;
      gap: 4px;
    }

    .tool-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .tool-button:hover {
      background: var(--secondary-background-color);
    }

    .tool-button.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .tool-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tool-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .spacer {
      flex: 1;
    }

    .toggle-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 12px;
    }

    .toggle-button.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .add-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      cursor: pointer;
      font-size: 12px;
    }

    .add-button:hover {
      opacity: 0.9;
    }
  `;

  private _handleFloorPlanChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    this.dispatchEvent(
      new CustomEvent("floor-plan-select", {
        detail: { id: select.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleFloorChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    this.dispatchEvent(
      new CustomEvent("floor-select", {
        detail: { id: select.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleToolSelect(tool: ToolType): void {
    activeTool.value = tool;
  }

  private _handleUndo(): void {
    undo();
  }

  private _handleRedo(): void {
    redo();
  }

  private _toggleGrid(): void {
    showGrid.value = !showGrid.value;
  }

  private _toggleSnap(): void {
    snapToGrid.value = !snapToGrid.value;
  }

  private _handleCreateFloorPlan(): void {
    this.dispatchEvent(
      new CustomEvent("create-floor-plan", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _handleAddFloor(): Promise<void> {
    if (!this.hass) return;

    const fp = currentFloorPlan.value;
    if (!fp) return;

    const name = prompt("Enter floor name:");
    if (!name) return;

    const level = parseInt(prompt("Enter floor level (0 = ground):") || "0", 10);

    try {
      await this.hass.callWS({
        type: "inhabit/floors/add",
        floor_plan_id: fp.id,
        name,
        level,
      });
      window.location.reload();
    } catch (err) {
      console.error("Error adding floor:", err);
      alert(`Failed to add floor: ${err}`);
    }
  }

  override render() {
    const fp = currentFloorPlan.value;
    const floor = currentFloor.value;
    const tool = activeTool.value;

    return html`
      <!-- Floor Plan Selector -->
      <select
        class="floor-plan-select"
        .value=${fp?.id || ""}
        @change=${this._handleFloorPlanChange}
      >
        ${this.floorPlans.map(
          (p) => html`<option value=${p.id}>${p.name}</option>`
        )}
      </select>

      <button class="add-button" @click=${this._handleCreateFloorPlan}>
        <ha-icon icon="mdi:plus"></ha-icon>
        New
      </button>

      <div class="divider"></div>

      <!-- Floor Selector -->
      ${fp
        ? html`
            <select
              class="floor-select"
              .value=${floor?.id || ""}
              @change=${this._handleFloorChange}
            >
              ${fp.floors.map(
                (f) => html`<option value=${f.id}>${f.name}</option>`
              )}
            </select>

            <button class="tool-button" @click=${this._handleAddFloor} title="Add Floor">
              <ha-icon icon="mdi:layers-plus"></ha-icon>
            </button>
          `
        : null}

      <div class="divider"></div>

      <!-- Undo/Redo -->
      <div class="tool-group">
        <button
          class="tool-button"
          @click=${this._handleUndo}
          ?disabled=${!canUndo.value}
          title="Undo"
        >
          <ha-icon icon="mdi:undo"></ha-icon>
        </button>
        <button
          class="tool-button"
          @click=${this._handleRedo}
          ?disabled=${!canRedo.value}
          title="Redo"
        >
          <ha-icon icon="mdi:redo"></ha-icon>
        </button>
      </div>

      <div class="divider"></div>

      <!-- Drawing Tools -->
      <div class="tool-group">
        ${TOOLS.map(
          (t) => html`
            <button
              class="tool-button ${tool === t.id ? "active" : ""}"
              @click=${() => this._handleToolSelect(t.id)}
              title=${t.label}
            >
              <ha-icon icon=${t.icon}></ha-icon>
            </button>
          `
        )}
      </div>

      <div class="spacer"></div>

      <!-- View Options -->
      <button
        class="toggle-button ${showGrid.value ? "active" : ""}"
        @click=${this._toggleGrid}
      >
        <ha-icon icon="mdi:grid"></ha-icon>
        Grid
      </button>

      <button
        class="toggle-button ${snapToGrid.value ? "active" : ""}"
        @click=${this._toggleSnap}
      >
        <ha-icon icon="mdi:magnet"></ha-icon>
        Snap
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "fpb-toolbar": FpbToolbar;
  }
}
