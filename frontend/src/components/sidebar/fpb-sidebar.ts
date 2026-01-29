/**
 * Sidebar Component with panels for layers, entities, and properties
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LayerConfig, HassEntity } from "../../types";
import {
  currentFloorPlan,
  currentFloor,
  layers,
  selection,
  devicePlacements,
} from "../../ha-floorplan-builder";

type TabId = "layers" | "entities" | "properties";

@customElement("fpb-sidebar")
export class FpbSidebar extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ type: Boolean })
  collapsed = false;

  @state()
  private _activeTab: TabId = "layers";

  @state()
  private _entitySearch = "";

  @state()
  private _entityFilter: string = "all";

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background: var(--card-background-color);
      overflow: hidden;
    }

    .collapse-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      border-bottom: 1px solid var(--divider-color);
    }

    .collapse-button:hover {
      background: var(--secondary-background-color);
    }

    .tabs {
      display: flex;
      border-bottom: 1px solid var(--divider-color);
    }

    :host([collapsed]) .tabs {
      display: none;
    }

    .tab {
      flex: 1;
      padding: 12px;
      border: none;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .tab:hover {
      background: var(--secondary-background-color);
    }

    .tab.active {
      color: var(--primary-color);
      border-bottom: 2px solid var(--primary-color);
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    :host([collapsed]) .content {
      display: none;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      color: var(--secondary-text-color);
      margin-bottom: 12px;
    }

    /* Layers panel */
    .layer-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 4px;
      gap: 8px;
      cursor: pointer;
    }

    .layer-item:hover {
      background: var(--secondary-background-color);
    }

    .layer-item .name {
      flex: 1;
      font-size: 14px;
    }

    .layer-item .icon-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
    }

    .layer-item .icon-button:hover {
      background: var(--primary-background-color);
    }

    .layer-item .icon-button.active {
      color: var(--primary-color);
    }

    /* Entities panel */
    .search-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      margin-bottom: 12px;
      box-sizing: border-box;
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .filter-chip {
      padding: 4px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 16px;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 12px;
    }

    .filter-chip:hover {
      background: var(--secondary-background-color);
    }

    .filter-chip.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .entity-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .entity-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 4px;
      gap: 8px;
      cursor: grab;
      background: var(--primary-background-color);
    }

    .entity-item:hover {
      background: var(--secondary-background-color);
    }

    .entity-item ha-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color);
    }

    .entity-item.on ha-icon {
      color: var(--state-light-active-color, #ffd600);
    }

    .entity-item .name {
      flex: 1;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entity-item .state {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    /* Properties panel */
    .property-row {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--divider-color);
    }

    .property-row:last-child {
      border-bottom: none;
    }

    .property-label {
      flex: 1;
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .property-value {
      font-size: 13px;
      font-weight: 500;
    }

    .property-input {
      width: 100px;
      padding: 6px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
    }

    .no-selection {
      text-align: center;
      color: var(--secondary-text-color);
      padding: 24px;
    }
  `;

  private _handleTabClick(tab: TabId): void {
    this._activeTab = tab;
  }

  private _handleToggle(): void {
    this.dispatchEvent(
      new CustomEvent("toggle-sidebar", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggleLayerVisibility(layerId: string): void {
    layers.value = layers.value.map((l) =>
      l.id === layerId ? { ...l, visible: !l.visible } : l
    );
  }

  private _toggleLayerLock(layerId: string): void {
    layers.value = layers.value.map((l) =>
      l.id === layerId ? { ...l, locked: !l.locked } : l
    );
  }

  private _getFilteredEntities(): HassEntity[] {
    if (!this.hass) return [];

    let entities = Object.values(this.hass.states);

    // Filter by domain
    if (this._entityFilter !== "all") {
      entities = entities.filter((e) =>
        e.entity_id.startsWith(this._entityFilter + ".")
      );
    }

    // Filter by search
    if (this._entitySearch) {
      const search = this._entitySearch.toLowerCase();
      entities = entities.filter(
        (e) =>
          e.entity_id.toLowerCase().includes(search) ||
          (e.attributes.friendly_name as string || "")
            .toLowerCase()
            .includes(search)
      );
    }

    // Limit results
    return entities.slice(0, 50);
  }

  private _getEntityIcon(entity: HassEntity): string {
    const domain = entity.entity_id.split(".")[0];
    const iconMap: Record<string, string> = {
      light: "mdi:lightbulb",
      switch: "mdi:toggle-switch",
      sensor: "mdi:eye",
      binary_sensor: "mdi:radiobox-marked",
      climate: "mdi:thermostat",
      fan: "mdi:fan",
      cover: "mdi:window-shutter",
      camera: "mdi:camera",
      media_player: "mdi:cast",
      lock: "mdi:lock",
      vacuum: "mdi:robot-vacuum",
    };
    return (entity.attributes.icon as string) || iconMap[domain] || "mdi:devices";
  }

  private async _handleEntityDragStart(
    e: DragEvent,
    entity: HassEntity
  ): Promise<void> {
    e.dataTransfer?.setData("text/plain", entity.entity_id);
    e.dataTransfer!.effectAllowed = "copy";
  }

  private _renderLayersPanel() {
    return html`
      <div class="section">
        <div class="section-title">Layers</div>
        ${layers.value.map(
          (layer) => html`
            <div class="layer-item">
              <span class="name">${layer.name}</span>
              <button
                class="icon-button ${layer.visible ? "active" : ""}"
                @click=${() => this._toggleLayerVisibility(layer.id)}
                title="${layer.visible ? "Hide" : "Show"}"
              >
                <ha-icon
                  icon=${layer.visible ? "mdi:eye" : "mdi:eye-off"}
                ></ha-icon>
              </button>
              <button
                class="icon-button ${layer.locked ? "active" : ""}"
                @click=${() => this._toggleLayerLock(layer.id)}
                title="${layer.locked ? "Unlock" : "Lock"}"
              >
                <ha-icon
                  icon=${layer.locked ? "mdi:lock" : "mdi:lock-open"}
                ></ha-icon>
              </button>
            </div>
          `
        )}
      </div>
    `;
  }

  private _renderEntitiesPanel() {
    const entities = this._getFilteredEntities();
    const domains = ["all", "light", "switch", "sensor", "binary_sensor", "climate"];

    return html`
      <div class="section">
        <input
          type="text"
          class="search-input"
          placeholder="Search entities..."
          .value=${this._entitySearch}
          @input=${(e: InputEvent) =>
            (this._entitySearch = (e.target as HTMLInputElement).value)}
        />

        <div class="filter-chips">
          ${domains.map(
            (d) => html`
              <button
                class="filter-chip ${this._entityFilter === d ? "active" : ""}"
                @click=${() => (this._entityFilter = d)}
              >
                ${d === "all" ? "All" : d}
              </button>
            `
          )}
        </div>

        <div class="entity-list">
          ${entities.map(
            (entity) => html`
              <div
                class="entity-item ${entity.state === "on" ? "on" : ""}"
                draggable="true"
                @dragstart=${(e: DragEvent) =>
                  this._handleEntityDragStart(e, entity)}
              >
                <ha-icon icon=${this._getEntityIcon(entity)}></ha-icon>
                <span class="name">
                  ${entity.attributes.friendly_name || entity.entity_id}
                </span>
                <span class="state">${entity.state}</span>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _renderPropertiesPanel() {
    const sel = selection.value;

    if (sel.type === "none" || sel.ids.length === 0) {
      return html`
        <div class="no-selection">
          <ha-icon icon="mdi:cursor-default-click"></ha-icon>
          <p>Select an element to view properties</p>
        </div>
      `;
    }

    const floor = currentFloor.value;

    if (sel.type === "room" && floor) {
      const room = floor.rooms.find((r) => r.id === sel.ids[0]);
      if (room) {
        return html`
          <div class="section">
            <div class="section-title">Room Properties</div>
            <div class="property-row">
              <span class="property-label">Name</span>
              <span class="property-value">${room.name}</span>
            </div>
            <div class="property-row">
              <span class="property-label">Color</span>
              <input
                type="color"
                class="property-input"
                .value=${room.color}
                style="width: 50px; height: 30px;"
              />
            </div>
            <div class="property-row">
              <span class="property-label">Occupancy Sensor</span>
              <span class="property-value">
                ${room.occupancy_sensor_enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div class="property-row">
              <span class="property-label">Motion Timeout</span>
              <span class="property-value">${room.motion_timeout}s</span>
            </div>
            <div class="property-row">
              <span class="property-label">Checking Timeout</span>
              <span class="property-value">${room.checking_timeout}s</span>
            </div>
          </div>
        `;
      }
    }

    if (sel.type === "device") {
      const device = devicePlacements.value.find((d) => d.id === sel.ids[0]);
      if (device && this.hass) {
        const state = this.hass.states[device.entity_id];
        return html`
          <div class="section">
            <div class="section-title">Device Properties</div>
            <div class="property-row">
              <span class="property-label">Entity</span>
              <span class="property-value">${device.entity_id}</span>
            </div>
            <div class="property-row">
              <span class="property-label">State</span>
              <span class="property-value">${state?.state || "unknown"}</span>
            </div>
            <div class="property-row">
              <span class="property-label">Position</span>
              <span class="property-value">
                ${Math.round(device.position.x)}, ${Math.round(device.position.y)}
              </span>
            </div>
            <div class="property-row">
              <span class="property-label">Rotation</span>
              <input
                type="number"
                class="property-input"
                .value=${device.rotation.toString()}
                min="0"
                max="360"
              />
            </div>
          </div>
        `;
      }
    }

    return html`
      <div class="no-selection">
        <p>Unknown selection type</p>
      </div>
    `;
  }

  override render() {
    return html`
      <button class="collapse-button" @click=${this._handleToggle}>
        <ha-icon
          icon=${this.collapsed ? "mdi:chevron-left" : "mdi:chevron-right"}
        ></ha-icon>
      </button>

      <div class="tabs">
        <button
          class="tab ${this._activeTab === "layers" ? "active" : ""}"
          @click=${() => this._handleTabClick("layers")}
        >
          Layers
        </button>
        <button
          class="tab ${this._activeTab === "entities" ? "active" : ""}"
          @click=${() => this._handleTabClick("entities")}
        >
          Entities
        </button>
        <button
          class="tab ${this._activeTab === "properties" ? "active" : ""}"
          @click=${() => this._handleTabClick("properties")}
        >
          Properties
        </button>
      </div>

      <div class="content">
        ${this._activeTab === "layers" ? this._renderLayersPanel() : null}
        ${this._activeTab === "entities" ? this._renderEntitiesPanel() : null}
        ${this._activeTab === "properties" ? this._renderPropertiesPanel() : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "fpb-sidebar": FpbSidebar;
  }
}
