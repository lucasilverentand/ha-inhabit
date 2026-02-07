/**
 * Toolbar Component
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { effect } from "@preact/signals-core";
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

  @state()
  private _floorMenuOpen = false;

  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 4px;
      background: var(--app-header-background-color, var(--primary-color));
      color: var(--app-header-text-color, var(--text-primary-color));
      box-sizing: border-box;
    }

    /* --- Floor selector dropdown --- */
    .floor-selector {
      position: relative;
    }

    .floor-trigger {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      font-size: 16px;
      font-weight: 400;
      cursor: pointer;
      white-space: nowrap;
    }

    .floor-trigger:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .floor-trigger ha-icon {
      --mdc-icon-size: 18px;
      transition: transform 0.2s ease;
    }

    .floor-trigger.open ha-icon {
      transform: rotate(180deg);
    }

    .floor-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      background: var(--card-background-color);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      min-width: 160px;
      z-index: 100;
      overflow: hidden;
      padding: 4px 0;
    }

    .floor-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 14px;
      width: 100%;
      text-align: left;
    }

    .floor-option:hover {
      background: var(--secondary-background-color);
    }

    .floor-option.selected {
      color: var(--primary-color);
      font-weight: 500;
    }

    .floor-option.selected ha-icon {
      color: var(--primary-color);
    }

    .floor-option ha-icon {
      --mdc-icon-size: 18px;
      color: var(--secondary-text-color);
    }

    .floor-dropdown-divider {
      height: 1px;
      background: var(--divider-color);
      margin: 4px 0;
    }

    .floor-option.add-floor {
      color: var(--secondary-text-color);
    }

    .floor-option.add-floor:hover {
      color: var(--primary-text-color);
    }

    /* --- Divider --- */
    .divider {
      width: 1px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      margin: 0 4px;
    }

    .tool-group {
      display: flex;
      gap: 2px;
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
      color: inherit;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .tool-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .tool-button.active {
      background: rgba(255, 255, 255, 0.2);
    }

    .tool-button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .tool-button:disabled:hover {
      background: transparent;
    }

    .tool-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .spacer {
      flex: 1;
    }

    /* --- Add button + menu --- */
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
      background: rgba(255, 255, 255, 0.15);
      color: inherit;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .add-button:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .add-button.menu-open {
      background: rgba(255, 255, 255, 0.25);
      border-radius: 4px 4px 0 0;
    }

    .add-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .add-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: var(--card-background-color);
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      min-width: 140px;
      z-index: 100;
      overflow: hidden;
      padding: 4px 0;
    }

    .add-menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
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
      color: var(--primary-color);
      font-weight: 500;
    }

    .add-menu-item ha-icon {
      --mdc-icon-size: 18px;
    }
  `;

  private _selectFloor(floorId: string): void {
    this._floorMenuOpen = false;
    this.dispatchEvent(
      new CustomEvent("floor-select", {
        detail: { id: floorId },
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
    this._floorMenuOpen = false;
    this.dispatchEvent(
      new CustomEvent("add-floor", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggleAddMenu(): void {
    this._addMenuOpen = !this._addMenuOpen;
    this._floorMenuOpen = false;
  }

  private _toggleFloorMenu(): void {
    this._floorMenuOpen = !this._floorMenuOpen;
    this._addMenuOpen = false;
  }

  private _closeMenus(): void {
    this._addMenuOpen = false;
    this._floorMenuOpen = false;
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
      this._closeMenus();
    }
  };

  override render() {
    const fp = currentFloorPlan.value;
    const floor = currentFloor.value;
    const tool = activeTool.value;
    const floors = fp?.floors || [];

    return html`
      <!-- Floor Selector -->
      ${floors.length > 0 ? html`
        <div class="floor-selector">
          <button
            class="floor-trigger ${this._floorMenuOpen ? "open" : ""}"
            @click=${this._toggleFloorMenu}
          >
            ${floor?.name || "Select floor"}
            <ha-icon icon="mdi:chevron-down"></ha-icon>
          </button>
          ${this._floorMenuOpen ? html`
            <div class="floor-dropdown">
              ${floors.map(
                (f) => html`
                  <button
                    class="floor-option ${f.id === floor?.id ? "selected" : ""}"
                    @click=${() => this._selectFloor(f.id)}
                  >
                    <ha-icon icon="mdi:layers"></ha-icon>
                    ${f.name}
                  </button>
                `
              )}
              <div class="floor-dropdown-divider"></div>
              <button class="floor-option add-floor" @click=${this._handleAddFloor}>
                <ha-icon icon="mdi:plus"></ha-icon>
                Add floor
              </button>
            </div>
          ` : null}
        </div>
      ` : html`
        <button class="floor-trigger" @click=${this._handleAddFloor}>
          <ha-icon icon="mdi:plus" style="--mdc-icon-size: 16px;"></ha-icon>
          Add floor
        </button>
      `}

      <div class="spacer"></div>

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

      <!-- Add Menu (right side) -->
      <div class="add-button-container">
        <button
          class="add-button ${this._addMenuOpen ? "menu-open" : ""}"
          @click=${this._toggleAddMenu}
          title="Add element"
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
