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
  simulatedTargets,
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
  { id: "button", icon: "mdi:gesture-tap-button", label: "Button" },
  { id: "mmwave", icon: "mdi:access-point", label: "mmWave" },
];

export class FpbToolbar extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  floorPlans: FloorPlan[] = [];

  @state()
  private _floorMenuOpen = false;

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
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 0 12px;
      height: var(--header-height, 56px);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      box-sizing: border-box;
      overflow: visible;
    }

    .toolbar-left {
      justify-self: start;
    }

    .toolbar-right {
      justify-self: end;
      display: flex;
      align-items: center;
      gap: 4px;
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
      background: rgba(0, 0, 0, 0.06);
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
      white-space: nowrap;
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

    .floor-option .rename-btn,
    .floor-option .delete-btn {
      display: flex;
      visibility: hidden;
      opacity: 0;
      padding: 4px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      line-height: 1;
      transition: color 0.12s, background 0.12s, opacity 0.12s, visibility 0.12s;
    }

    .floor-option .rename-btn {
      margin-left: auto;
    }

    .floor-option .rename-btn ha-icon,
    .floor-option .delete-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    .floor-option:hover .rename-btn,
    .floor-option:hover .delete-btn {
      visibility: visible;
      opacity: 1;
    }

    .floor-option .delete-btn:hover {
      color: var(--error-color, #f44336);
      background: rgba(244, 67, 54, 0.08);
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
      background: var(--divider-color, rgba(0, 0, 0, 0.12));
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
      color: var(--secondary-text-color);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .tool-button:hover {
      background: rgba(0, 0, 0, 0.08);
      color: var(--primary-text-color);
    }

    .tool-button.active {
      background: var(--primary-color);
      color: #fff;
    }

    .tool-button:disabled {
      opacity: 0.3;
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
      background: rgba(0, 0, 0, 0.06);
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
      color: var(--secondary-text-color);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }

    .mode-button:hover {
      background: rgba(0, 0, 0, 0.08);
      color: var(--primary-text-color);
    }

    .mode-button.active {
      background: var(--primary-color);
      color: #fff;
    }

    .mode-button ha-icon {
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
    this._floorMenuOpen = false;
    this.dispatchEvent(
      new CustomEvent("open-import-export", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggleFloorMenu(): void {
    this._floorMenuOpen = !this._floorMenuOpen;
  }

  private _closeMenus(): void {
    this._floorMenuOpen = false;
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
      <!-- Left: Floor Selector -->
      <div class="toolbar-left">
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
      </div>

      <!-- Center: Mode Switcher -->
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
      </div>

      <!-- Right: Undo/Redo + contextual tools -->
      <div class="toolbar-right">
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

        <!-- Occupancy mode: simulation toggle -->
        ${mode === "occupancy" ? html`
          <div class="divider"></div>
          <div class="tool-group">
            <button
              class="tool-button ${simHitboxEnabled.value ? "active" : ""}"
              @click=${() => {
                const next = !simHitboxEnabled.value;
                simHitboxEnabled.value = next;
                if (!next) {
                  simulatedTargets.value = [];
                }
              }}
              title="${simHitboxEnabled.value ? "Stop simulating" : "Simulate positions"}"
            >
              <ha-icon icon="mdi:target-account"></ha-icon>
            </button>
          </div>
        ` : null}

        <!-- Tool buttons (contextual) -->
        ${menuItems.length > 0 ? html`
          <div class="divider"></div>
          <div class="tool-group">
            ${menuItems.map(item => html`
              <button
                class="tool-button ${tool === item.id ? "active" : ""}"
                @click=${() => this._handleToolSelect(item.id)}
                title=${item.label}
              >
                <ha-icon icon=${item.icon}></ha-icon>
              </button>
            `)}
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
