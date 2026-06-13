/**
 * Toolbar Component
 */

import { effect } from "@preact/signals-core";
import { css, html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { canRedo, canUndo, redo, undo } from "../../stores/history-store";
import {
  activeTool,
  canvasMode,
  currentFloor,
  currentFloorPlan,
  setCanvasMode,
  simHitboxEnabled,
  simulatedTargets,
} from "../../stores/signals";
import type {
  CanvasMode,
  FloorPlan,
  HomeAssistant,
  ToolType,
} from "../../types";
import {
  getMapModeDefinition,
  getMapModeDefinitions,
  getModeTools,
} from "../../utils/map-modes";
import { getDirectToolbarActionLimit } from "../../utils/toolbar-overflow";

interface AddMenuItem {
  id: ToolType;
  icon: string;
  label: string;
}

interface ToolbarAction {
  id: string;
  icon: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  accent?: string;
  run: () => void;
}

const TOOL_ITEMS: Record<ToolType, AddMenuItem> = {
  select: { id: "select", icon: "mdi:cursor-default-outline", label: "Select" },
  wall: { id: "wall", icon: "mdi:wall", label: "Wall" },
  door: { id: "door", icon: "mdi:door", label: "Door" },
  window: { id: "window", icon: "mdi:window-closed-variant", label: "Window" },
  zone: { id: "zone", icon: "mdi:vector-polygon", label: "Zone" },
  light: { id: "light", icon: "mdi:lightbulb", label: "Light" },
  switch: { id: "switch", icon: "mdi:toggle-switch", label: "Switch" },
  button: { id: "button", icon: "mdi:gesture-tap-button", label: "Button" },
  mmwave: { id: "mmwave", icon: "mdi:access-point", label: "mmWave" },
  other: { id: "other", icon: "mdi:devices", label: "Other" },
};

export class FpbToolbar extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ attribute: false })
  floorPlans: FloorPlan[] = [];

  @state()
  private _floorMenuOpen = false;

  @state()
  private _actionsMenuOpen = false;

  @state()
  private _toolbarWidth = 0;

  @state()
  private _canvasMode: CanvasMode = "walls";

  @state()
  private _renamingFloorId: string | null = null;

  @state()
  private _renameValue = "";

  private _cleanupEffects: (() => void)[] = [];
  private _renameCommitted = false;
  private _documentListenerAttached = false;
  private _resizeObserver?: ResizeObserver;

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
      gap: 10px;
    }

    .toolbar-left {
      justify-self: start;
      min-width: 0;
    }

    .toolbar-right {
      justify-self: end;
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
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

    .context-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
      position: relative;
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
      background: var(--mode-accent, var(--primary-color));
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

    .overflow-wrapper {
      position: relative;
    }

    .overflow-menu {
      position: absolute;
      right: 0;
      bottom: calc(100% + 8px);
      min-width: 180px;
      padding: 6px;
      border-radius: 14px;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
      z-index: 260;
    }

    .overflow-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 42px;
      padding: 8px 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--primary-text-color);
      font-size: 13px;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
    }

    .overflow-item:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .overflow-item.active {
      background: color-mix(
        in srgb,
        var(--mode-accent, var(--primary-color)) 16%,
        transparent
      );
      color: var(--mode-accent, var(--primary-color));
    }

    .overflow-item:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .overflow-item ha-icon {
      --mdc-icon-size: 19px;
      flex: 0 0 auto;
    }

    .overflow-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* --- Done button --- */
    .done-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: none;
      border-radius: 8px;
      background: var(--primary-color);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.15s;
      margin-left: 4px;
    }

    .done-button:hover {
      opacity: 0.85;
    }

    .done-button ha-icon {
      --mdc-icon-size: 18px;
    }

    /* --- Mode switcher --- */
    .mode-group {
      display: flex;
      gap: 4px;
      background: rgba(0, 0, 0, 0.06);
      border-radius: 12px;
      padding: 3px;
    }

    .mode-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 78px;
      height: 36px;
      padding: 0 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .mode-button:hover {
      background: rgba(0, 0, 0, 0.08);
      color: var(--primary-text-color);
    }

    .mode-button.active {
      background: var(--mode-accent, var(--primary-color));
      color: #fff;
    }

    .mode-button ha-icon {
      --mdc-icon-size: 18px;
    }

    .mode-label {
      line-height: 1;
    }

    @media (max-width: 900px), (hover: none) and (pointer: coarse) {
      :host {
        position: fixed;
        left: 10px;
        right: 10px;
        bottom: max(10px, env(safe-area-inset-bottom));
        top: auto;
        z-index: 250;
        height: auto;
        min-height: 64px;
        grid-template-columns: 1fr;
        grid-template-rows: auto auto;
        padding: 8px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
      }

      .toolbar-left {
        display: none;
      }

      .mode-group {
        width: 100%;
        min-width: 0;
        background: transparent;
        padding: 0;
        gap: 5px;
      }

      .mode-group::-webkit-scrollbar {
        display: none;
      }

      .mode-button {
        min-width: 64px;
        height: 48px;
        flex: 1 0 auto;
        flex-direction: column;
        gap: 3px;
        padding: 4px 8px;
        border-radius: 14px;
        font-size: 11px;
      }

      .mode-button ha-icon {
        --mdc-icon-size: 20px;
      }

      .toolbar-right {
        width: 100%;
        justify-self: stretch;
        justify-content: space-between;
        gap: 6px;
        overflow: visible;
        scrollbar-width: none;
      }

      .toolbar-right::-webkit-scrollbar {
        display: none;
      }

      .tool-group {
        gap: 6px;
        flex: 0 0 auto;
      }

      .context-actions {
        flex: 1 1 auto;
        justify-content: flex-start;
        gap: 6px;
        min-width: 0;
      }

      .tool-button {
        width: 44px;
        height: 44px;
        border-radius: 13px;
        background: var(--primary-background-color, #fafafa);
      }

      .divider {
        display: none;
      }

      .done-button {
        min-height: 44px;
        border-radius: 13px;
        margin-left: auto;
        position: sticky;
        right: 0;
        flex: 0 0 auto;
        box-shadow: -8px 0 12px var(--card-background-color, #fff);
      }
    }

    @media (max-width: 390px) {
      :host {
        left: 8px;
        right: 8px;
        padding: 7px;
        border-radius: 16px;
        gap: 7px;
      }

      .mode-button {
        min-width: 44px;
        height: 44px;
        padding: 4px;
      }

      .mode-label {
        display: none;
      }

      .toolbar-right {
        gap: 5px;
      }

      .tool-group,
      .context-actions {
        gap: 5px;
      }

      .tool-button {
        width: 42px;
        height: 42px;
        border-radius: 12px;
      }

      .done-button {
        width: 42px;
        min-width: 42px;
        padding: 0;
        justify-content: center;
      }

      .done-button span {
        display: none;
      }
    }

    @media (max-width: 300px) {
      :host {
        left: 6px;
        right: 6px;
      }

      .mode-button {
        min-width: 40px;
      }

      .tool-button,
      .done-button {
        width: 40px;
        min-width: 40px;
      }
    }

  `;

  private _selectFloor(floorId: string): void {
    this._floorMenuOpen = false;
    this.dispatchEvent(
      new CustomEvent("floor-select", {
        detail: { id: floorId },
        bubbles: true,
        composed: true,
      }),
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
      }),
    );
  }

  private _handleDeleteFloor(
    e: Event,
    floorId: string,
    floorName: string,
  ): void {
    e.stopPropagation();
    if (
      !confirm(
        `Delete "${floorName}"? This will remove all walls, rooms, and devices on this floor.`,
      )
    )
      return;
    this._floorMenuOpen = false;
    this.dispatchEvent(
      new CustomEvent("delete-floor", {
        detail: { id: floorId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _startRename(e: Event, floorId: string, currentName: string): void {
    e.stopPropagation();
    this._renamingFloorId = floorId;
    this._renameValue = currentName;
    this._renameCommitted = false;
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector(
        ".rename-input",
      ) as HTMLInputElement | null;
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
      }),
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

  private _exitEditor(): void {
    this.dispatchEvent(
      new CustomEvent("exit-editor", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _openImportExport(): void {
    this._floorMenuOpen = false;
    this.dispatchEvent(
      new CustomEvent("open-import-export", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _toggleFloorMenu(): void {
    this._floorMenuOpen = !this._floorMenuOpen;
    if (this._floorMenuOpen) {
      this._actionsMenuOpen = false;
    }
  }

  private _toggleActionsMenu(e?: Event): void {
    e?.stopPropagation();
    this._actionsMenuOpen = !this._actionsMenuOpen;
    if (this._actionsMenuOpen) {
      this._floorMenuOpen = false;
    }
  }

  private _closeMenus(): void {
    this._floorMenuOpen = false;
    this._actionsMenuOpen = false;
  }

  private _runAction(action: ToolbarAction): void {
    if (action.disabled) return;
    action.run();
    this._actionsMenuOpen = false;
  }

  private _directActionLimit(actionCount: number): number {
    return getDirectToolbarActionLimit(this._toolbarWidth, actionCount);
  }

  private _splitActions(actions: ToolbarAction[]): {
    direct: ToolbarAction[];
    overflow: ToolbarAction[];
  } {
    const limit = this._directActionLimit(actions.length);
    if (limit >= actions.length) {
      return { direct: actions, overflow: [] };
    }
    return {
      direct: actions.slice(0, limit),
      overflow: actions.slice(limit),
    };
  }

  private _toolAction(
    item: AddMenuItem,
    modeDef: { accent: string },
  ): ToolbarAction {
    return {
      id: `tool-${item.id}`,
      icon: item.icon,
      label: item.label,
      active: activeTool.value === item.id,
      accent: modeDef.accent,
      run: () => this._handleToolSelect(item.id),
    };
  }

  private _toolbarActions(
    menuItems: AddMenuItem[],
    mode: CanvasMode,
    modeDef: { accent: string },
  ): ToolbarAction[] {
    const actions: ToolbarAction[] = [
      {
        id: "undo",
        icon: "mdi:undo",
        label: "Undo",
        disabled: !canUndo.value,
        run: () => this._handleUndo(),
      },
      {
        id: "redo",
        icon: "mdi:redo",
        label: "Redo",
        disabled: !canRedo.value,
        run: () => this._handleRedo(),
      },
    ];

    if (mode === "occupancy") {
      actions.push({
        id: "simulate",
        icon: "mdi:target-account",
        label: simHitboxEnabled.value
          ? "Stop simulating"
          : "Simulate positions",
        active: simHitboxEnabled.value,
        accent: modeDef.accent,
        run: () => {
          const next = !simHitboxEnabled.value;
          simHitboxEnabled.value = next;
          if (!next) {
            simulatedTargets.value = [];
          }
        },
      });
    }

    const activeItem = menuItems.find((item) => item.id === activeTool.value);
    if (activeItem) {
      actions.push(this._toolAction(activeItem, modeDef));
    }
    for (const item of menuItems) {
      if (item.id !== activeItem?.id) {
        actions.push(this._toolAction(item, modeDef));
      }
    }

    return actions;
  }

  private _renderActionButton(action: ToolbarAction) {
    return html`
      <button
        class="tool-button ${action.active ? "active" : ""}"
        style=${action.accent ? `--mode-accent: ${action.accent}` : ""}
        @click=${() => this._runAction(action)}
        ?disabled=${action.disabled}
        title=${action.label}
      >
        <ha-icon icon=${action.icon}></ha-icon>
      </button>
    `;
  }

  private _renderOverflowItem(action: ToolbarAction) {
    return html`
      <button
        class="overflow-item ${action.active ? "active" : ""}"
        style=${action.accent ? `--mode-accent: ${action.accent}` : ""}
        @click=${() => this._runAction(action)}
        ?disabled=${action.disabled}
      >
        <ha-icon icon=${action.icon}></ha-icon>
        <span class="overflow-label">${action.label}</span>
      </button>
    `;
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
      }),
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("click", this._handleDocumentClick);
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    this._documentListenerAttached = false;
    for (const cleanup of this._cleanupEffects) cleanup();
    this._cleanupEffects = [];
  }

  override firstUpdated(): void {
    this._resizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      if (width !== this._toolbarWidth) {
        this._toolbarWidth = width;
      }
    });
    this._resizeObserver.observe(this);
    this._toolbarWidth = Math.round(this.getBoundingClientRect().width);
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
    const mode = this._canvasMode;
    const floors = fp?.floors || [];
    const modeDef = getMapModeDefinition(mode);
    const menuItems = getModeTools(mode).map((toolId) => TOOL_ITEMS[toolId]);
    const actions = this._toolbarActions(menuItems, mode, modeDef);
    const { direct, overflow } = this._splitActions(actions);

    return html`
      <!-- Left: Floor Selector -->
      <div class="toolbar-left">
        ${
          floors.length > 0
            ? html`
          <div class="floor-selector">
            <button
              class="floor-trigger ${this._floorMenuOpen ? "open" : ""}"
              @click=${this._toggleFloorMenu}
            >
              ${floor?.name || "Select floor"}
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </button>
            ${
              this._floorMenuOpen
                ? html`
              <div class="floor-dropdown">
                ${floors.map((f) =>
                  this._renamingFloorId === f.id
                    ? html`
                      <div class="floor-option">
                        <ha-icon icon="mdi:layers"></ha-icon>
                        <input
                          class="rename-input"
                          .value=${this._renameValue}
                          @input=${(e: InputEvent) => {
                            this._renameValue = (
                              e.target as HTMLInputElement
                            ).value;
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
                    `,
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
            `
                : null
            }
          </div>
        `
            : html`
          <button class="floor-trigger" @click=${this._handleAddFloor}>
            <ha-icon icon="mdi:plus" style="--mdc-icon-size: 16px;"></ha-icon>
            Add floor
          </button>
        `
        }
      </div>

      <!-- Center: Mode Switcher -->
      <div class="mode-group">
        ${getMapModeDefinitions().map(
          (definition) => html`
            <button
              class="mode-button ${mode === definition.mode ? "active" : ""}"
              style="--mode-accent: ${definition.accent}"
              @click=${() => setCanvasMode(definition.mode)}
              title="${definition.label} mode"
            >
              <ha-icon icon=${definition.icon}></ha-icon>
              <span class="mode-label">${definition.label}</span>
            </button>
          `,
        )}
      </div>

      <!-- Right: Undo/Redo + contextual tools -->
      <div class="toolbar-right">
        <div class="context-actions">
          ${direct.map((action) => this._renderActionButton(action))}
          ${
            overflow.length > 0
              ? html`
                <div class="overflow-wrapper">
                  <button
                    class="tool-button ${this._actionsMenuOpen ? "active" : ""}"
                    style="--mode-accent: ${modeDef.accent}"
                    @click=${this._toggleActionsMenu}
                    title="More tools"
                  >
                    <ha-icon icon="mdi:dots-horizontal"></ha-icon>
                  </button>
                  ${
                    this._actionsMenuOpen
                      ? html`
                        <div class="overflow-menu">
                          ${overflow.map((action) =>
                            this._renderOverflowItem(action),
                          )}
                        </div>
                      `
                      : null
                  }
                </div>
              `
              : null
          }
        </div>

        <div class="divider"></div>
        <button
          class="done-button"
          @click=${this._exitEditor}
          title="Exit editor"
        >
          <ha-icon icon="mdi:check"></ha-icon>
          Done
        </button>
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
