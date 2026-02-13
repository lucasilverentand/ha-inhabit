/**
 * Device Configuration Panel — slide-out panel for configuring
 * a selected light, switch, or mmWave placement.
 */

import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  LightPlacement,
  SwitchPlacement,
  MmwavePlacement,
} from "../../types";
import {
  lightPlacements,
  switchPlacements,
  mmwavePlacements,
  devicePanelTarget,
  selection,
} from "../../stores/signals";

export class FpbDevicePanel extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ type: String })
  placementId = "";

  @property({ type: String })
  deviceType: "light" | "switch" | "mmwave" = "light";

  @state()
  private _entitySearch = "";

  @state()
  private _rebinding = false;

  static override styles = css`
    :host {
      display: block;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 14px;
      border-radius: 16px;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid var(--divider-color, #e8e8e8);
    }

    .panel-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      letter-spacing: -0.01em;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 8px;
      color: var(--secondary-text-color, #999);
      line-height: 1;
      --mdc-icon-size: 20px;
      transition: color 0.15s, background 0.15s;
    }

    .close-btn:hover {
      color: var(--primary-text-color, #333);
      background: var(--secondary-background-color, #f5f5f5);
    }

    .panel-body {
      padding: 16px 20px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
    }

    .entity-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--primary-background-color);
      border-radius: 8px;
      font-size: 13px;
    }

    .entity-row .entity-id {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .rebind-btn {
      padding: 4px 10px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 12px;
      white-space: nowrap;
    }

    .rebind-btn:hover {
      background: var(--secondary-background-color);
    }

    .entity-search {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      box-sizing: border-box;
    }

    .entity-list {
      max-height: 200px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .entity-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 6px;
      font-size: 13px;
      color: var(--primary-text-color);
      text-align: left;
    }

    .entity-option:hover {
      background: var(--secondary-background-color);
    }

    .entity-option .friendly-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entity-option .entity-id-small {
      color: var(--secondary-text-color);
      font-size: 11px;
    }

    .slider-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .slider-row label {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }

    .slider-row label span {
      color: var(--secondary-text-color);
    }

    .slider-row input[type="range"] {
      width: 100%;
      accent-color: var(--primary-color);
    }

    .delete-btn {
      padding: 8px 16px;
      background: var(--error-color, #f44336);
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
    }

    .delete-btn:hover {
      opacity: 0.9;
    }
  `;

  private _getPlacement(): LightPlacement | SwitchPlacement | MmwavePlacement | null {
    if (this.deviceType === "light") {
      return lightPlacements.value.find(p => p.id === this.placementId) ?? null;
    } else if (this.deviceType === "switch") {
      return switchPlacements.value.find(p => p.id === this.placementId) ?? null;
    } else {
      return mmwavePlacements.value.find(p => p.id === this.placementId) ?? null;
    }
  }

  private _getFilteredEntities(): Array<{ entity_id: string; friendly_name: string }> {
    if (!this.hass) return [];
    const domain = this.deviceType === "mmwave" ? "" : `${this.deviceType}.`;
    const search = this._entitySearch.toLowerCase();

    return Object.keys(this.hass.states)
      .filter(eid => {
        if (domain && !eid.startsWith(domain)) return false;
        if (!search) return true;
        const name = String(this.hass!.states[eid].attributes?.friendly_name ?? "");
        return eid.toLowerCase().includes(search) || name.toLowerCase().includes(search);
      })
      .slice(0, 50)
      .map(eid => ({
        entity_id: eid,
        friendly_name: String(this.hass!.states[eid].attributes?.friendly_name ?? eid),
      }));
  }

  private async _rebindEntity(newEntityId: string): Promise<void> {
    if (!this.hass) return;
    try {
      if (this.deviceType === "light") {
        await this.hass.callWS({
          type: "inhabit/lights/update",
          light_id: this.placementId,
          entity_id: newEntityId,
        });
        lightPlacements.value = lightPlacements.value.map(p =>
          p.id === this.placementId ? { ...p, entity_id: newEntityId } : p
        );
      } else if (this.deviceType === "switch") {
        await this.hass.callWS({
          type: "inhabit/switches/update",
          switch_id: this.placementId,
          entity_id: newEntityId,
        });
        switchPlacements.value = switchPlacements.value.map(p =>
          p.id === this.placementId ? { ...p, entity_id: newEntityId } : p
        );
      } else {
        await this.hass.callWS({
          type: "inhabit/mmwave/update",
          placement_id: this.placementId,
          entity_id: newEntityId,
        });
        mmwavePlacements.value = mmwavePlacements.value.map(p =>
          p.id === this.placementId ? { ...p, entity_id: newEntityId } : p
        );
      }
      this._rebinding = false;
      this._entitySearch = "";
      this.requestUpdate();
    } catch (err) {
      console.error("Failed to rebind entity:", err);
    }
  }

  private async _updateMmwave(updates: Record<string, unknown>): Promise<void> {
    if (!this.hass) return;
    try {
      const result = await this.hass.callWS<MmwavePlacement>({
        type: "inhabit/mmwave/update",
        placement_id: this.placementId,
        ...updates,
      });
      mmwavePlacements.value = mmwavePlacements.value.map(
        p => p.id === result.id ? result : p
      );
      this.requestUpdate();
    } catch (err) {
      console.error("Failed to update mmWave placement:", err);
    }
  }

  private async _deletePlacement(): Promise<void> {
    if (!this.hass) return;
    try {
      if (this.deviceType === "light") {
        await this.hass.callWS({
          type: "inhabit/lights/remove",
          light_id: this.placementId,
        });
        lightPlacements.value = lightPlacements.value.filter(p => p.id !== this.placementId);
      } else if (this.deviceType === "switch") {
        await this.hass.callWS({
          type: "inhabit/switches/remove",
          switch_id: this.placementId,
        });
        switchPlacements.value = switchPlacements.value.filter(p => p.id !== this.placementId);
      } else {
        await this.hass.callWS({
          type: "inhabit/mmwave/delete",
          placement_id: this.placementId,
        });
        mmwavePlacements.value = mmwavePlacements.value.filter(p => p.id !== this.placementId);
      }
      selection.value = { type: "none", ids: [] };
      devicePanelTarget.value = null;
    } catch (err) {
      console.error("Failed to delete placement:", err);
    }
  }

  private _close(): void {
    devicePanelTarget.value = null;
  }

  private _getIcon(): string {
    if (this.deviceType === "light") return "mdi:lightbulb";
    if (this.deviceType === "switch") return "mdi:toggle-switch";
    return "mdi:access-point";
  }

  private _getTitle(): string {
    if (this.deviceType === "light") return "Light";
    if (this.deviceType === "switch") return "Switch";
    return "mmWave Sensor";
  }

  override render() {
    const placement = this._getPlacement();
    if (!placement) {
      return html`
        <div class="panel-header">
          <h3>${this._getTitle()}</h3>
          <button class="close-btn" @click=${this._close}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <div class="panel-body"><p>Placement not found.</p></div>
      `;
    }

    const entityId = "entity_id" in placement ? (placement as { entity_id?: string }).entity_id : undefined;
    const friendlyName = entityId && this.hass?.states[entityId]
      ? this.hass.states[entityId].attributes?.friendly_name ?? entityId
      : entityId ?? "No entity";

    return html`
      <div class="panel-header">
        <h3>
          <ha-icon icon=${this._getIcon()} style="--mdc-icon-size: 20px;"></ha-icon>
          ${this._getTitle()}
        </h3>
        <button class="close-btn" @click=${this._close}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      <div class="panel-body">
        <!-- Entity binding -->
        <div class="section">
          <div class="section-title">Entity</div>
          ${this._rebinding ? html`
            <input
              class="entity-search"
              type="text"
              placeholder="Search entities..."
              .value=${this._entitySearch}
              @input=${(e: Event) => { this._entitySearch = (e.target as HTMLInputElement).value; this.requestUpdate(); }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === "Escape") { this._rebinding = false; this._entitySearch = ""; } }}
            />
            <div class="entity-list">
              ${this._getFilteredEntities().map(ent => html`
                <button class="entity-option" @click=${() => this._rebindEntity(ent.entity_id)}>
                  <span class="friendly-name">${ent.friendly_name}</span>
                  <span class="entity-id-small">${ent.entity_id}</span>
                </button>
              `)}
            </div>
          ` : html`
            <div class="entity-row">
              <ha-icon icon=${this._getIcon()} style="--mdc-icon-size: 18px;"></ha-icon>
              <span class="entity-id">${friendlyName}</span>
              <button class="rebind-btn" @click=${() => { this._rebinding = true; }}>Change</button>
            </div>
          `}
        </div>

        ${this.deviceType === "mmwave" ? this._renderMmwaveSettings(placement as MmwavePlacement) : null}

        <!-- Delete -->
        <div class="section">
          <button class="delete-btn" @click=${this._deletePlacement}>
            Delete ${this._getTitle()}
          </button>
        </div>
      </div>
    `;
  }

  private _renderMmwaveSettings(p: MmwavePlacement) {
    return html`
      <div class="section">
        <div class="section-title">Sensor Settings</div>

        <div class="slider-row">
          <label>Facing Angle <span>${p.angle.toFixed(0)}&deg;</span></label>
          <input type="range" min="0" max="360" step="1"
            .value=${String(p.angle)}
            @input=${(e: Event) => {
              const val = Number((e.target as HTMLInputElement).value);
              mmwavePlacements.value = mmwavePlacements.value.map(m =>
                m.id === p.id ? { ...m, angle: val } : m
              );
              this.requestUpdate();
            }}
            @change=${(e: Event) => this._updateMmwave({ angle: Number((e.target as HTMLInputElement).value) })}
          />
        </div>

        <div class="slider-row">
          <label>Field of View <span>${p.field_of_view.toFixed(0)}&deg;</span></label>
          <input type="range" min="30" max="180" step="5"
            .value=${String(p.field_of_view)}
            @input=${(e: Event) => {
              const val = Number((e.target as HTMLInputElement).value);
              mmwavePlacements.value = mmwavePlacements.value.map(m =>
                m.id === p.id ? { ...m, field_of_view: val } : m
              );
              this.requestUpdate();
            }}
            @change=${(e: Event) => this._updateMmwave({ field_of_view: Number((e.target as HTMLInputElement).value) })}
          />
        </div>

        <div class="slider-row">
          <label>Detection Range <span>${p.detection_range.toFixed(0)}cm</span></label>
          <input type="range" min="50" max="1200" step="25"
            .value=${String(p.detection_range)}
            @input=${(e: Event) => {
              const val = Number((e.target as HTMLInputElement).value);
              mmwavePlacements.value = mmwavePlacements.value.map(m =>
                m.id === p.id ? { ...m, detection_range: val } : m
              );
              this.requestUpdate();
            }}
            @change=${(e: Event) => this._updateMmwave({ detection_range: Number((e.target as HTMLInputElement).value) })}
          />
        </div>
      </div>
    `;
  }
}

customElements.define("fpb-device-panel", FpbDevicePanel);
