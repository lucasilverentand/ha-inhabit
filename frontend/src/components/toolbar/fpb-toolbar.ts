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
  simHitboxEnabled,
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

const ZONES_MENU_ITEMS: AddMenuItem[] = [
  { id: "zone", icon: "mdi:vector-polygon", label: "Zone" },
];

const PLACEMENT_MENU_ITEMS: AddMenuItem[] = [
  { id: "light", icon: "mdi:lightbulb", label: "Light" },
  { id: "switch", icon: "mdi:toggle-switch", label: "Switch" },
  { id: "mmwave", icon: "mdi:access-point", label: "mmWave" },
];

export class FpbToolbar extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  floorPlans: FloorPlan[] = [];

  @state()
  private _addMenuOpen = false;

  @state()
  private _canvasMode: CanvasMode = "walls";

  @state()
  private _renamingFloorId: string | null = null;

  @state()
  private _renameValue = "";

  private _cleanupEffects: (() => void)[] = [];
  private _renameCommitted = false;
  private _documentListenerAttached = false;

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background: var(--app-header-background-color, var(--primary-color));
      color: var(--app-header-text-color, var(--text-primary-color));
      box-sizing: border-box;
    }

    /* --- Floor tab bar --- */
    .floor-bar {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 0 12px;
      min-height: 40px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      background: rgba(0, 0, 0, 0.1);
    }

    .floor-bar::-webkit-scrollbar {
      display: none;
    }

    .floor-tab {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: none;
      border-radius: 8px 8px 0 0;
      background: transparent;
      color: inherit;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      opacity: 0.7;
      transition: background 0.15s, opacity 0.15s;
    }

    .floor-tab:hover {
      background: rgba(255, 255, 255, 0.08);
      opacity: 0.9;
    }

    .floor-tab.active {
      background: rgba(255, 255, 255, 0.15);
      opacity: 1;
    }

    .floor-tab ha-icon {
      --mdc-icon-size: 16px;
    }

    .floor-tab .tab-actions {
      display: none;
      align-items: center;
      gap: 2px;
      margin-left: 2px;
    }

    .floor-tab:hover .tab-actions {
      display: flex;
    }

    .floor-tab .tab-action {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.12s, background 0.12s;
    }

    .floor-tab .tab-action:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.15);
    }

    .floor-tab .tab-action.delete:hover {
      background: rgba(244, 67, 54, 0.25);
    }

    .floor-tab .tab-action ha-icon {
      --mdc-icon-size: 14px;
    }

    .floor-tab .rename-input {
      padding: 2px 6px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      background: rgba(0, 0, 0, 0.2);
      color: inherit;
      outline: none;
      min-width: 80px;
    }

    .floor-add-tab {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      border: none;
      border-radius: 8px 8px 0 0;
      background: transparent;
      color: inherit;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
      opacity: 0.5;
      transition: background 0.15s, opacity 0.15s;
    }

    .floor-add-tab:hover {
      background: rgba(255, 255, 255, 0.08);
      opacity: 0.8;
    }

    .floor-add-tab ha-icon {
      --mdc-icon-size: 14px;
    }

    .floor-bar-spacer {
      flex: 1;
    }

    .floor-bar-action {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      border: none;
      border-radius: 8px 8px 0 0;
      background: transparent;
      color: inherit;
      font-size: 12px;
      cursor: pointer;
      white-space: nowrap;
      opacity: 0.5;
      transition: background 0.15s, opacity 0.15s;
    }

    .floor-bar-action:hover {
      background: rgba(255, 255, 255, 0.08);
      opacity: 0.8;
    }

    .floor-bar-action ha-icon {
      --mdc-icon-size: 14px;
    }

    /* --- Tool bar --- */
    .tool-row {
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 4px;
      min-height: 44px;
      overflow: visible;
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
    this._renameCommitted = false;
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector(".rename-input") as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  private _commitRename(): void {
    if (this._renameCommitted) return;
    this._renameCommitted = true;
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
    this.dispatchEvent(
      new CustomEvent("open-import-export", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggleAddMenu(): void {
    this._addMenuOpen = !this._addMenuOpen;
  }

  private _closeMenus(): void {
    this._addMenuOpen = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this._documentListenerAttached) {
      document.addEventListener("click", this._handleDocumentClick);
      this._documentListenerAttached = true;
    }
    this._cleanupEffects.push(
      effect(() => {
        this._canvasMode = canvasMode.value;
      })
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("click", this._handleDocumentClick);
    this._documentListenerAttached = false;
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
      : mode === "furniture" ? ZONES_MENU_ITEMS
      : mode === "placement" ? PLACEMENT_MENU_ITEMS
      : [];

    return html`
      <!-- Floor Tab Bar -->
      <div class="floor-bar">
        ${floors.map(
          (f) => this._renamingFloorId === f.id
            ? html`
              <div class="floor-tab active">
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
                class="floor-tab ${f.id === floor?.id ? "active" : ""}"
                @click=${() => this._selectFloor(f.id)}
              >
                <ha-icon icon="mdi:layers"></ha-icon>
                ${f.name}
                <span class="tab-actions">
                  <span class="tab-action"
                        @click=${(e: Event) => this._startRename(e, f.id, f.name)}
                        title="Rename">
                    <ha-icon icon="mdi:pencil-outline"></ha-icon>
                  </span>
                  <span class="tab-action delete"
                        @click=${(e: Event) => this._handleDeleteFloor(e, f.id, f.name)}
                        title="Delete">
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </span>
                </span>
              </button>
            `
        )}
        <button class="floor-add-tab" @click=${this._handleAddFloor}>
          <ha-icon icon="mdi:plus"></ha-icon>
          Add floor
        </button>
        <span class="floor-bar-spacer"></span>
        <button class="floor-bar-action" @click=${this._openImportExport}>
          <ha-icon icon="mdi:swap-horizontal"></ha-icon>
          Import / Export
        </button>
      </div>

      <!-- Tool Row -->
      <div class="tool-row">

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
          class="mode-button ${mode === "furniture" ? "active" : ""}"
          @click=${() => setCanvasMode("furniture")}
          title="Zones mode"
        >
          <ha-icon icon="mdi:vector-square"></ha-icon>
        </button>
        <button
          class="mode-button ${mode === "placement" ? "active" : ""}"
          @click=${() => setCanvasMode("placement")}
          title="Placement mode"
        >
          <ha-icon icon="mdi:devices"></ha-icon>
        </button>
        <button
          class="mode-button ${mode === "occupancy" ? "active" : ""}"
          @click=${() => setCanvasMode("occupancy")}
          title="Occupancy mode"
        >
          <ha-icon icon="mdi:motion-sensor"></ha-icon>
        </button>
        <button
          class="mode-button ${mode === "simulate" ? "active" : ""}"
          @click=${() => setCanvasMode("simulate")}
          title="Simulate mode"
        >
          <ha-icon icon="mdi:radar"></ha-icon>
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

      <!-- Simulate mode: hitbox toggle -->
      ${mode === "simulate" ? html`
        <div class="tool-group">
          <button
            class="tool-button ${simHitboxEnabled.value ? "active" : ""}"
            @click=${() => { simHitboxEnabled.value = !simHitboxEnabled.value; }}
            title="${simHitboxEnabled.value ? "Hitbox detection enabled" : "Hitbox detection disabled"}"
          >
            <ha-icon icon="${simHitboxEnabled.value ? "mdi:vector-square-edit" : "mdi:vector-square-remove"}"></ha-icon>
          </button>
        </div>
      ` : null}

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
      </div>
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
