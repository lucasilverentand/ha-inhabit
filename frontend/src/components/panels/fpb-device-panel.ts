/**
 * Device Configuration Panel — slide-out panel for configuring
 * a selected light, switch, or mmWave placement.
 */

import { css, html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import {
  buttonPlacements,
  devicePanelTarget,
  lightPlacements,
  mmwaveCalibrationTarget,
  mmwavePlacements,
  otherPlacements,
  selection,
  switchPlacements,
} from "../../stores/signals";
import type {
  ButtonPlacement,
  HomeAssistant,
  LightPlacement,
  MmwavePlacement,
  OtherPlacement,
  SwitchPlacement,
} from "../../types";
import "../shared/fpb-entity-picker";

export class FpbDevicePanel extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ type: String })
  placementId = "";

  @property({ type: String })
  deviceType: "light" | "switch" | "mmwave" | "button" | "other" = "light";

  @state()
  private _rebinding = false;

  @state()
  private _editingTargetIndex: number | null = null;

  @state()
  private _editingTargetAxis: "x" | "y" | null = null;

  @state()
  private _selectedCalibrationTarget = 0;

  @state()
  private _calibrating = false;

  @state()
  private _calibrationStatus = "";

  @state()
  private _calibrationSampleCount = 0;

  private _calibrationPointHandler = (event: Event) => {
    this._handleCalibrationPoint(event as CustomEvent);
  };

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

    .target-card {
      background: var(--primary-background-color, #fafafa);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .target-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }

    .target-card-header .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      color: var(--secondary-text-color, #999);
      line-height: 1;
      --mdc-icon-size: 16px;
      transition: color 0.15s;
    }

    .target-card-header .remove-btn:hover {
      color: var(--error-color, #f44336);
    }

    .target-axis-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      background: var(--card-background-color, #fff);
      border-radius: 8px;
      font-size: 13px;
    }

    .target-axis-row .axis-label {
      font-weight: 600;
      color: var(--secondary-text-color);
      min-width: 14px;
    }

    .target-axis-row .entity-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .target-axis-row .entity-name.empty {
      color: var(--secondary-text-color);
      font-style: italic;
    }

    .add-target-btn {
      padding: 6px 12px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
      align-self: flex-start;
    }

    .add-target-btn:hover {
      opacity: 0.9;
    }

    .calibration-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .calibration-row select {
      flex: 1;
      min-width: 0;
      padding: 8px 10px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 13px;
    }

    .secondary-btn {
      padding: 8px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
    }

    .primary-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 8px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
    }

    .primary-btn:disabled,
    .secondary-btn:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .calibration-status {
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--primary-background-color, #fafafa);
      color: var(--secondary-text-color);
      font-size: 12px;
      line-height: 1.4;
    }

    .calibration-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .metric {
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--primary-background-color, #fafafa);
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .metric strong {
      display: block;
      color: var(--primary-text-color);
      font-size: 13px;
      font-weight: 600;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener(
      "inhabit-mmwave-calibration-point",
      this._calibrationPointHandler,
    );
  }

  override disconnectedCallback(): void {
    window.removeEventListener(
      "inhabit-mmwave-calibration-point",
      this._calibrationPointHandler,
    );
    if (mmwaveCalibrationTarget.value?.placementId === this.placementId) {
      mmwaveCalibrationTarget.value = null;
    }
    super.disconnectedCallback();
  }

  private _getPlacement():
    | LightPlacement
    | SwitchPlacement
    | ButtonPlacement
    | OtherPlacement
    | MmwavePlacement
    | null {
    if (this.deviceType === "light") {
      return (
        lightPlacements.value.find((p) => p.id === this.placementId) ?? null
      );
    } else if (this.deviceType === "switch") {
      return (
        switchPlacements.value.find((p) => p.id === this.placementId) ?? null
      );
    } else if (this.deviceType === "button") {
      return (
        buttonPlacements.value.find((p) => p.id === this.placementId) ?? null
      );
    } else if (this.deviceType === "other") {
      return (
        otherPlacements.value.find((p) => p.id === this.placementId) ?? null
      );
    } else {
      return (
        mmwavePlacements.value.find((p) => p.id === this.placementId) ?? null
      );
    }
  }

  private _getPickerDomains(): string[] {
    if (this.deviceType === "other") return [];
    return [this.deviceType];
  }

  private _getPickerExcludeDomains(): string[] {
    if (this.deviceType === "other") return ["light", "switch", "button"];
    return [];
  }

  private _getExcludedEntityIds(): string[] {
    if (this.deviceType === "light") {
      return lightPlacements.value
        .filter((p) => p.id !== this.placementId)
        .map((p) => p.entity_id);
    } else if (this.deviceType === "switch") {
      return switchPlacements.value
        .filter((p) => p.id !== this.placementId)
        .map((p) => p.entity_id);
    } else if (this.deviceType === "button") {
      return buttonPlacements.value
        .filter((p) => p.id !== this.placementId)
        .map((p) => p.entity_id);
    } else {
      return otherPlacements.value
        .filter((p) => p.id !== this.placementId)
        .map((p) => p.entity_id);
    }
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
        lightPlacements.value = lightPlacements.value.map((p) =>
          p.id === this.placementId ? { ...p, entity_id: newEntityId } : p,
        );
      } else if (this.deviceType === "switch") {
        await this.hass.callWS({
          type: "inhabit/switches/update",
          switch_id: this.placementId,
          entity_id: newEntityId,
        });
        switchPlacements.value = switchPlacements.value.map((p) =>
          p.id === this.placementId ? { ...p, entity_id: newEntityId } : p,
        );
      } else if (this.deviceType === "button") {
        await this.hass.callWS({
          type: "inhabit/buttons/update",
          button_id: this.placementId,
          entity_id: newEntityId,
        });
        buttonPlacements.value = buttonPlacements.value.map((p) =>
          p.id === this.placementId ? { ...p, entity_id: newEntityId } : p,
        );
      } else if (this.deviceType === "other") {
        await this.hass.callWS({
          type: "inhabit/others/update",
          other_id: this.placementId,
          entity_id: newEntityId,
        });
        otherPlacements.value = otherPlacements.value.map((p) =>
          p.id === this.placementId ? { ...p, entity_id: newEntityId } : p,
        );
      }
      this._rebinding = false;
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
      mmwavePlacements.value = mmwavePlacements.value.map((p) =>
        p.id === result.id ? result : p,
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
        lightPlacements.value = lightPlacements.value.filter(
          (p) => p.id !== this.placementId,
        );
      } else if (this.deviceType === "switch") {
        await this.hass.callWS({
          type: "inhabit/switches/remove",
          switch_id: this.placementId,
        });
        switchPlacements.value = switchPlacements.value.filter(
          (p) => p.id !== this.placementId,
        );
      } else if (this.deviceType === "button") {
        await this.hass.callWS({
          type: "inhabit/buttons/remove",
          button_id: this.placementId,
        });
        buttonPlacements.value = buttonPlacements.value.filter(
          (p) => p.id !== this.placementId,
        );
      } else if (this.deviceType === "other") {
        await this.hass.callWS({
          type: "inhabit/others/remove",
          other_id: this.placementId,
        });
        otherPlacements.value = otherPlacements.value.filter(
          (p) => p.id !== this.placementId,
        );
      } else {
        await this.hass.callWS({
          type: "inhabit/mmwave/delete",
          placement_id: this.placementId,
        });
        mmwavePlacements.value = mmwavePlacements.value.filter(
          (p) => p.id !== this.placementId,
        );
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
    if (this.deviceType === "button") return "mdi:gesture-tap-button";
    if (this.deviceType === "other") return "mdi:devices";
    return "mdi:access-point";
  }

  private _getTitle(): string {
    if (this.deviceType === "light") return "Light";
    if (this.deviceType === "switch") return "Switch";
    if (this.deviceType === "button") return "Button";
    if (this.deviceType === "other") return "Other Device";
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

    const entityId =
      this.deviceType !== "mmwave" && "entity_id" in placement
        ? (placement as { entity_id?: string }).entity_id
        : undefined;
    const friendlyName =
      entityId && this.hass?.states[entityId]
        ? (this.hass.states[entityId].attributes?.friendly_name ?? entityId)
        : (entityId ?? "No entity");

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
        <!-- Entity binding (not shown for mmwave) -->
        ${
          this.deviceType !== "mmwave"
            ? html`
          <div class="section">
            <div class="section-title">Entity</div>
            <div class="entity-row">
              <ha-icon icon=${this._getIcon()} style="--mdc-icon-size: 18px;"></ha-icon>
              <span class="entity-id">${friendlyName}</span>
              <button class="rebind-btn" @click=${() => {
                this._rebinding = true;
              }}>Change</button>
            </div>
            ${
              this._rebinding
                ? html`
              <fpb-entity-picker
                .hass=${this.hass}
                .domains=${this._getPickerDomains()}
                .excludeDomains=${this._getPickerExcludeDomains()}
                .exclude=${this._getExcludedEntityIds()}
                title="Select ${this._getTitle()} Entity"
                placeholder="Search entities..."
                @entities-confirmed=${(e: CustomEvent) => {
                  this._rebindEntity(e.detail.entityIds[0]);
                }}
                @picker-closed=${() => {
                  this._rebinding = false;
                }}
              ></fpb-entity-picker>
            `
                : nothing
            }
          </div>
        `
            : nothing
        }

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
              mmwavePlacements.value = mmwavePlacements.value.map((m) =>
                m.id === p.id ? { ...m, angle: val } : m,
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
              mmwavePlacements.value = mmwavePlacements.value.map((m) =>
                m.id === p.id ? { ...m, field_of_view: val } : m,
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
              mmwavePlacements.value = mmwavePlacements.value.map((m) =>
                m.id === p.id ? { ...m, detection_range: val } : m,
              );
              this.requestUpdate();
            }}
            @change=${(e: Event) => this._updateMmwave({ detection_range: Number((e.target as HTMLInputElement).value) })}
          />
        </div>
      </div>

      ${this._renderTrackingTargets(p)}
      ${this._renderCalibration(p)}
    `;
  }

  private _renderTrackingTargets(p: MmwavePlacement) {
    const targets = p.targets ?? [];

    const entityName = (eid: string) => {
      if (!eid) return null;
      return this.hass?.states[eid]?.attributes?.friendly_name ?? eid;
    };

    return html`
      <div class="section">
        <div class="section-title">Tracking Targets</div>

        ${targets.map(
          (t, i) => html`
          <div class="target-card">
            <div class="target-card-header">
              <span>Target ${i + 1}</span>
              <button class="remove-btn" @click=${() => this._removeTarget(p, i)}>
                <ha-icon icon="mdi:trash-can-outline"></ha-icon>
              </button>
            </div>
            <div class="target-axis-row">
              <span class="axis-label">X</span>
              <span class="entity-name ${t.x_entity_id ? "" : "empty"}">${entityName(t.x_entity_id) ?? "Not set"}</span>
              <button class="rebind-btn" @click=${() => {
                this._editingTargetIndex = i;
                this._editingTargetAxis = "x";
              }}>Change</button>
            </div>
            <div class="target-axis-row">
              <span class="axis-label">Y</span>
              <span class="entity-name ${t.y_entity_id ? "" : "empty"}">${entityName(t.y_entity_id) ?? "Not set"}</span>
              <button class="rebind-btn" @click=${() => {
                this._editingTargetIndex = i;
                this._editingTargetAxis = "y";
              }}>Change</button>
            </div>
          </div>

          ${
            this._editingTargetIndex === i && this._editingTargetAxis !== null
              ? html`
            <fpb-entity-picker
              .hass=${this.hass}
              .numericOnly=${true}
              title="Select ${this._editingTargetAxis.toUpperCase()} Entity for Target ${i + 1}"
              placeholder="Search numeric entities..."
              @entities-confirmed=${(e: CustomEvent) => {
                this._updateTargetEntity(
                  p,
                  i,
                  this._editingTargetAxis!,
                  e.detail.entityIds[0],
                );
              }}
              @picker-closed=${() => {
                this._editingTargetIndex = null;
                this._editingTargetAxis = null;
              }}
            ></fpb-entity-picker>
          `
              : nothing
          }
        `,
        )}

        <button class="add-target-btn" @click=${() => this._addTarget(p)}>
          Add target
        </button>
      </div>
    `;
  }

  private async _addTarget(p: MmwavePlacement): Promise<void> {
    const newTargets = [
      ...(p.targets ?? []),
      { x_entity_id: "", y_entity_id: "" },
    ];
    await this._updateMmwave({ targets: newTargets });
  }

  private async _removeTarget(
    p: MmwavePlacement,
    index: number,
  ): Promise<void> {
    const newTargets = (p.targets ?? []).filter((_, i) => i !== index);
    await this._updateMmwave({ targets: newTargets });
  }

  private async _updateTargetEntity(
    p: MmwavePlacement,
    index: number,
    axis: "x" | "y",
    entityId: string,
  ): Promise<void> {
    const newTargets = [...(p.targets ?? [])];
    newTargets[index] = {
      ...newTargets[index],
      [axis === "x" ? "x_entity_id" : "y_entity_id"]: entityId,
    };
    this._editingTargetIndex = null;
    this._editingTargetAxis = null;
    await this._updateMmwave({ targets: newTargets });
  }

  private _renderCalibration(p: MmwavePlacement) {
    const targets = p.targets ?? [];
    const selectedIndex =
      this._selectedCalibrationTarget < targets.length
        ? this._selectedCalibrationTarget
        : 0;
    const selectedTarget = targets[selectedIndex];
    const canCalibrate = Boolean(
      selectedTarget?.x_entity_id && selectedTarget?.y_entity_id,
    );
    const calibration = p.calibration;

    return html`
      <div class="section">
        <div class="section-title">Calibration</div>
        <div class="calibration-row">
          <select
            .value=${String(selectedIndex)}
            ?disabled=${this._calibrating || targets.length === 0}
            @change=${(e: Event) => {
              this._selectedCalibrationTarget = Number(
                (e.target as HTMLSelectElement).value,
              );
            }}
          >
            ${targets.map(
              (_target, index) => html`
                <option value=${String(index)}>Target ${index + 1}</option>
              `,
            )}
          </select>
          <button
            class="primary-btn"
            ?disabled=${!canCalibrate || this._calibrating}
            @click=${() => this._armCalibration(p, selectedIndex)}
          >
            Calibrate
          </button>
        </div>

        ${
          this._calibrationStatus
            ? html`
              <div class="calibration-status">
                ${this._calibrationStatus}
                ${
                  this._calibrationSampleCount
                    ? html` (${this._calibrationSampleCount} samples)`
                    : nothing
                }
              </div>
            `
            : nothing
        }

        ${
          calibration?.enabled
            ? html`
              <div class="calibration-metrics">
                <div class="metric">
                  <strong>${calibration.sample_count}</strong>
                  Samples
                </div>
                <div class="metric">
                  <strong>${calibration.jitter_radius.toFixed(2)}</strong>
                  Jitter radius
                </div>
                <div class="metric">
                  <strong>${calibration.raw_bias.x.toFixed(1)}</strong>
                  X offset
                </div>
                <div class="metric">
                  <strong>${calibration.raw_bias.y.toFixed(1)}</strong>
                  Y offset
                </div>
              </div>
              <div class="calibration-status">
                ${
                  calibration.calibrated_at
                    ? new Date(calibration.calibrated_at).toLocaleString()
                    : "Calibration saved"
                }
              </div>
              <button
                class="secondary-btn"
                ?disabled=${this._calibrating}
                @click=${this._clearCalibration}
              >
                Clear calibration
              </button>
            `
            : html`
              <div class="calibration-status">
                No calibration saved.
              </div>
            `
        }
      </div>
    `;
  }

  private _armCalibration(p: MmwavePlacement, targetIndex: number): void {
    const target = p.targets?.[targetIndex];
    if (!target?.x_entity_id || !target.y_entity_id) return;

    this._calibrating = true;
    this._calibrationSampleCount = 0;
    this._calibrationStatus = "Click the target location on the map";
    mmwaveCalibrationTarget.value = {
      placementId: p.id,
      targetIndex,
    };
  }

  private async _handleCalibrationPoint(event: CustomEvent): Promise<void> {
    const detail = event.detail as {
      placementId?: string;
      targetIndex?: number;
      point?: { x: number; y: number };
    };
    if (
      this.deviceType !== "mmwave" ||
      detail.placementId !== this.placementId ||
      detail.targetIndex === undefined ||
      !detail.point
    ) {
      return;
    }

    const placement = this._getPlacement() as MmwavePlacement | null;
    if (!placement) return;

    await this._sampleAndSaveCalibration(
      placement,
      detail.targetIndex,
      detail.point,
    );
  }

  private async _sampleAndSaveCalibration(
    placement: MmwavePlacement,
    targetIndex: number,
    mapPoint: { x: number; y: number },
  ): Promise<void> {
    if (!this.hass) return;

    const target = placement.targets?.[targetIndex];
    if (!target?.x_entity_id || !target.y_entity_id) {
      this._calibrating = false;
      this._calibrationStatus = "Target needs both X and Y entities";
      return;
    }

    const samples: Array<{ x: number; y: number }> = [];
    this._calibrationStatus = "Sampling target";
    this._calibrationSampleCount = 0;

    for (let i = 0; i < 25; i++) {
      const sample = this._readTargetSample(
        target.x_entity_id,
        target.y_entity_id,
      );
      if (sample) {
        samples.push(sample);
        this._calibrationSampleCount = samples.length;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 200));
    }

    if (samples.length < 10) {
      this._calibrating = false;
      this._calibrationStatus = "Calibration needs at least 10 valid samples";
      return;
    }

    try {
      this._calibrationStatus = "Saving calibration";
      const result = await this.hass.callWS<MmwavePlacement>({
        type: "inhabit/mmwave/calibrate",
        placement_id: placement.id,
        target_index: targetIndex,
        map_point: mapPoint,
        samples,
      });
      mmwavePlacements.value = mmwavePlacements.value.map((p) =>
        p.id === result.id ? result : p,
      );
      this._calibrationStatus = "Calibration saved";
    } catch (err) {
      console.error("Failed to calibrate mmWave placement:", err);
      this._calibrationStatus = "Calibration failed";
    } finally {
      this._calibrating = false;
      this.requestUpdate();
    }
  }

  private _readTargetSample(
    xEntityId: string,
    yEntityId: string,
  ): { x: number; y: number } | null {
    const xState = this.hass?.states[xEntityId];
    const yState = this.hass?.states[yEntityId];
    if (!xState || !yState) return null;

    const x = Number.parseFloat(xState.state);
    const y = Number.parseFloat(yState.state);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    if (x === 0 && y === 0) return null;
    return { x, y };
  }

  private async _clearCalibration(): Promise<void> {
    if (!this.hass || this.deviceType !== "mmwave") return;
    this._calibrationStatus = "Clearing calibration";
    try {
      const result = await this.hass.callWS<MmwavePlacement>({
        type: "inhabit/mmwave/clear_calibration",
        placement_id: this.placementId,
      });
      mmwavePlacements.value = mmwavePlacements.value.map((p) =>
        p.id === result.id ? result : p,
      );
      this._calibrationStatus = "Calibration cleared";
    } catch (err) {
      console.error("Failed to clear mmWave calibration:", err);
      this._calibrationStatus = "Clear calibration failed";
    }
  }
}

customElements.define("fpb-device-panel", FpbDevicePanel);
