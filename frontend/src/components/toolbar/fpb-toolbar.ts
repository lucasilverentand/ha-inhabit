/**
 * Toolbar Component
 */

import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";
import { effect } from "@preact/signals-core";
import type { HomeAssistant, FloorPlan, ToolType, CanvasMode } from "../../types";
import {
  currentFloorPlan,
  currentFloor,
  activeTool,
  canvasMode,
  setCanvasMode,
} from "../../stores/signals";
import { canUndo, canRedo, undo, redo } from "../../stores/history-store";

interface AddMenuItem {
  id: ToolType;
  icon: string;
  label: string;
}

const WALLS_MENU_ITEMS: AddMenuItem[] = [
  { id: "wall", icon: "mdi:wall", label: "Wall" },
  { id: "door", icon: "mdi:door", label: "Door" },
  { id: "window", icon: "mdi:window-closed-variant", label: "Window" },
];

const PLACEMENT_MENU_ITEMS: AddMenuItem[] = [
  { id: "device", icon: "mdi:devices", label: "Device" },
];

export class FpbToolbar extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  floorPlans: FloorPlan[] = [];

  @state()
  private _addMenuOpen = false;

  @state()
  private _floorMenuOpen = false;

  @state()
  private _canvasMode: CanvasMode = "walls";

  @state()
  private _renamingFloorId: string | null = null;

  @state()
  private _renameValue = "";

  private _cleanupEffects: (() => void)[] = [];

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
      gap: 6px;
      padding: 6px 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: inherit;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }

    .floor-trigger:hover {
      background: rgba(255, 255, 255, 0.12);
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
      top: calc(100% + 6px);
      left: 0;
      background: var(--card-background-color);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
      min-width: 180px;
      z-index: 100;
      overflow: hidden;
      padding: 6px;
    }

    .floor-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 14px;
      width: 100%;
      text-align: left;
      transition: background 0.12s;
    }

    .floor-option:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .floor-option.selected {
      color: var(--primary-color);
      font-weight: 600;
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
      background: var(--divider-color, #e8e8e8);
      margin: 4px 6px;
    }

    .floor-option .delete-btn {
      display: none;
      margin-left: auto;
      padding: 4px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      line-height: 1;
      transition: color 0.12s, background 0.12s;
    }

    .floor-option .delete-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    .floor-option:hover .delete-btn {
      display: flex;
    }

    .floor-option .delete-btn:hover {
      color: var(--error-color, #f44336);
      background: rgba(244, 67, 54, 0.08);
    }

    .floor-option .rename-btn {
      display: none;
      margin-left: auto;
      padding: 4px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      line-height: 1;
      transition: color 0.12s, background 0.12s;
    }

    .floor-option .rename-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    .floor-option:hover .rename-btn {
      display: flex;
    }

    .floor-option .rename-btn:hover {
      color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
    }

    .floor-option .rename-input {
      flex: 1;
      min-width: 0;
      padding: 4px 8px;
      border: 1px solid var(--primary-color);
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      outline: none;
    }

    .floor-option.add-floor,
    .floor-option.action-item {
      color: var(--secondary-text-color);
    }

    .floor-option.add-floor:hover,
    .floor-option.action-item:hover {
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
      border-radius: 8px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }

    .tool-button:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .tool-button.active {
      background: rgba(255, 255, 255, 0.22);
    }

    .tool-button:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .tool-button:disabled:hover {
      background: transparent;
    }

    .tool-button ha-icon {
      --mdc-icon-size: 20px;
    }

    /* --- Mode switcher --- */
    .mode-group {
      display: flex;
      gap: 2px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 2px;
    }

    .mode-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 32px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }

    .mode-button:first-child {
      border-radius: 8px;
    }

    .mode-button:last-child {
      border-radius: 8px;
    }

    .mode-button:not(:first-child) {
    }

    .mode-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .mode-button.active {
      background: rgba(255, 255, 255, 0.22);
    }

    .mode-button ha-icon {
      --mdc-icon-size: 18px;
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
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.15);
      color: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }

    .add-button:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .add-button.menu-open {
      background: rgba(255, 255, 255, 0.25);
    }

    .add-button ha-icon {
      --mdc-icon-size: 20px;
    }

    .add-menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      background: var(--card-background-color);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
      min-width: 160px;
      z-index: 100;
      overflow: hidden;
      padding: 6px;
    }

    .add-menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 14px;
      width: 100%;
      text-align: left;
      transition: background 0.12s;
    }

    .add-menu-item:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .add-menu-item.active {
      color: var(--primary-color);
      font-weight: 600;
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

  private _handleDeleteFloor(e: Event, floorId: string, floorName: string): void {
    e.stopPropagation();
    if (!confirm(`Delete "${floorName}"? This will remove all walls, rooms, and devices on this floor.`)) return;
    this._floorMenuOpen = false;
    this.dispatchEvent(
      new CustomEvent("delete-floor", {
        detail: { id: floorId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _startRename(e: Event, floorId: string, currentName: string): void {
    e.stopPropagation();
    this._renamingFloorId = floorId;
    this._renameValue = currentName;
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector(".rename-input") as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  private _commitRename(): void {
    const id = this._renamingFloorId;
    const name = this._renameValue.trim();
    this._renamingFloorId = null;
    if (!id || !name) return;

    this.dispatchEvent(
      new CustomEvent("rename-floor", {
        detail: { id, name },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _cancelRename(): void {
    this._renamingFloorId = null;
  }

  private _handleRenameKeyDown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      this._commitRename();
    } else if (e.key === "Escape") {
      this._cancelRename();
    }
  }

  private _openImportExport(): void {
    this._floorMenuOpen = false;
    this.dispatchEvent(
      new CustomEvent("open-import-export", {
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
    this._cleanupEffects.push(
      effect(() => {
        this._canvasMode = canvasMode.value;
      })
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("click", this._handleDocumentClick);
    this._cleanupEffects.forEach(cleanup => cleanup());
    this._cleanupEffects = [];
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
    const mode = this._canvasMode;
    const floors = fp?.floors || [];

    const menuItems = mode === "walls" ? WALLS_MENU_ITEMS
      : mode === "placement" ? PLACEMENT_MENU_ITEMS
      : [];

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
                (f) => this._renamingFloorId === f.id
                  ? html`
                    <div class="floor-option">
                      <ha-icon icon="mdi:layers"></ha-icon>
                      <input
                        class="rename-input"
                        .value=${this._renameValue}
                        @input=${(e: InputEvent) => {
                          this._renameValue = (e.target as HTMLInputElement).value;
                        }}
                        @keydown=${this._handleRenameKeyDown}
                        @blur=${this._commitRename}
                        @click=${(e: Event) => e.stopPropagation()}
                      />
                    </div>
                  `
                  : html`
                    <button
                      class="floor-option ${f.id === floor?.id ? "selected" : ""}"
                      @click=${() => this._selectFloor(f.id)}
                    >
                      <ha-icon icon="mdi:layers"></ha-icon>
                      ${f.name}
                      <span class="rename-btn"
                            @click=${(e: Event) => this._startRename(e, f.id, f.name)}
                            title="Rename floor">
                        <ha-icon icon="mdi:pencil-outline"></ha-icon>
                      </span>
                      <span class="delete-btn"
                            @click=${(e: Event) => this._handleDeleteFloor(e, f.id, f.name)}
                            title="Delete floor">
                        <ha-icon icon="mdi:delete-outline"></ha-icon>
                      </span>
                    </button>
                  `
              )}
              <div class="floor-dropdown-divider"></div>
              <button class="floor-option add-floor" @click=${this._handleAddFloor}>
                <ha-icon icon="mdi:plus"></ha-icon>
                Add floor
              </button>
              <button class="floor-option action-item" @click=${this._openImportExport}>
                <ha-icon icon="mdi:swap-horizontal"></ha-icon>
                Import / Export
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

      <!-- Mode Switcher -->
      <div class="mode-group">
        <button
          class="mode-button ${mode === "walls" ? "active" : ""}"
          @click=${() => setCanvasMode("walls")}
          title="Walls mode"
        >
          <ha-icon icon="mdi:wall"></ha-icon>
        </button>
        <button
          class="mode-button ${mode === "placement" ? "active" : ""}"
          @click=${() => setCanvasMode("placement")}
          title="Placement mode"
        >
          <ha-icon icon="mdi:devices"></ha-icon>
        </button>
      </div>

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

      <!-- Add Menu -->
      ${menuItems.length > 0 ? html`
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
                  ${menuItems.map(
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
      ` : null}
    `;
  }
}

if (!customElements.get("fpb-toolbar")) {
  customElements.define("fpb-toolbar", FpbToolbar);
}

declare global {
  interface HTMLElementTagNameMap {
    "fpb-toolbar": FpbToolbar;
  }
}
