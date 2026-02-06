/**
 * Toolbar Component
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, FloorPlan, ToolType } from "../../types";
import {
  currentFloorPlan,
  currentFloor,
  activeTool,
} from "../../ha-floorplan-builder";
import { canUndo, canRedo, undo, redo } from "../../stores/history-store";

interface AddMenuItem {
  id: ToolType;
  icon: string;
  label: string;
}

const ADD_MENU_ITEMS: AddMenuItem[] = [
  { id: "wall", icon: "mdi:wall", label: "Wall" },
  { id: "room", icon: "mdi:floor-plan", label: "Room" },
  { id: "door", icon: "mdi:door", label: "Door" },
  { id: "window", icon: "mdi:window-closed-variant", label: "Window" },
  { id: "device", icon: "mdi:devices", label: "Device" },
];

@customElement("fpb-toolbar")
export class FpbToolbar extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  floorPlans: FloorPlan[] = [];

  @state()
  private _addMenuOpen = false;

  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 8px;
      background: var(--card-background-color);
    }

    .floor-select {
      padding: 4px 6px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--secondary-text-color);
      font-size: 13px;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 4px center;
      padding-right: 18px;
    }

    .floor-select:hover {
      color: var(--primary-text-color);
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

    .add-button-container {
      position: relative;
    }

    .add-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 4px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      cursor: pointer;
      font-size: 20px;
      font-weight: 500;
    }

    .add-button:hover {
      opacity: 0.9;
    }

    .add-button.menu-open {
      border-radius: 4px 4px 0 0;
    }

    .add-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 4px 0 4px 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      min-width: 140px;
      z-index: 100;
      overflow: hidden;
    }

    .add-menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 14px;
      width: 100%;
      text-align: left;
    }

    .add-menu-item:hover {
      background: var(--secondary-background-color);
    }

    .add-menu-item.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
    }

    .add-menu-item ha-icon {
      --mdc-icon-size: 18px;
    }

    .add-floor-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      padding: 0;
    }

    .add-floor-btn:hover {
      color: var(--primary-text-color);
      background: var(--secondary-background-color);
    }

    .add-floor-btn ha-icon {
      --mdc-icon-size: 16px;
    }
  `;

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
    this._addMenuOpen = false;
  }

  private _handleUndo(): void {
    undo();
  }

  private _handleRedo(): void {
    redo();
  }

  private _handleAddFloor(): void {
    this.dispatchEvent(
      new CustomEvent("add-floor", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggleAddMenu(): void {
    this._addMenuOpen = !this._addMenuOpen;
  }

  private _closeAddMenu(): void {
    this._addMenuOpen = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("click", this._handleDocumentClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("click", this._handleDocumentClick);
  }

  private _handleDocumentClick = (e: MouseEvent): void => {
    const path = e.composedPath();
    if (!path.includes(this)) {
      this._closeAddMenu();
    }
  };

  override render() {
    const fp = currentFloorPlan.value;
    const floor = currentFloor.value;
    const tool = activeTool.value;
    const isAddToolActive = ADD_MENU_ITEMS.some((item) => item.id === tool);
    const floors = fp?.floors || [];

    return html`
      <!-- Floor Selector -->
      ${floors.length > 0 ? html`
        <select
          class="floor-select"
          .value=${floor?.id || ""}
          @change=${this._handleFloorChange}
        >
          ${floors.map(
            (f) => html`<option value=${f.id}>${f.name}</option>`
          )}
        </select>
      ` : null}

      <button class="add-floor-btn" @click=${this._handleAddFloor} title="Add floor">
        <ha-icon icon="mdi:plus"></ha-icon>
      </button>

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

      <div class="spacer"></div>

      <!-- Add Menu (right side) -->
      <div class="add-button-container">
        <button
          class="add-button ${this._addMenuOpen ? "menu-open" : ""} ${isAddToolActive ? "active" : ""}"
          @click=${this._toggleAddMenu}
          title="Add"
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
        ${this._addMenuOpen
          ? html`
              <div class="add-menu">
                ${ADD_MENU_ITEMS.map(
                  (item) => html`
                    <button
                      class="add-menu-item ${tool === item.id ? "active" : ""}"
                      @click=${() => this._handleToolSelect(item.id)}
                    >
                      <ha-icon icon=${item.icon}></ha-icon>
                      ${item.label}
                    </button>
                  `
                )}
              </div>
            `
          : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "fpb-toolbar": FpbToolbar;
  }
}
