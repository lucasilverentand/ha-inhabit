/**
 * Device Configuration Panel — slide-out panel for configuring
 * a selected light, switch, or mmWave placement.
 */

import { css, html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import {
  buttonPlacements,
  currentFloorPlan,
  devicePanelTarget,
  fanPlacements,
  lightPlacements,
  mmwaveCalibrationTarget,
  mmwavePlacements,
  otherPlacements,
  selection,
  switchPlacements,
} from "../../stores/signals";
import type {
  ButtonPlacement,
  Coordinates,
  FanPlacement,
  HomeAssistant,
  LightPlacement,
  MmwavePlacement,
  OtherPlacement,
  SwitchPlacement,
} from "../../types";
import {
  type DeviceIssue,
  getMmwavePlacementIssues,
  getNormalDeviceIssues,
} from "../../utils/device-issues";
import {
  getPlacedDeviceEntityIds,
  isDeviceEntityAlreadyPlaced,
} from "../../utils/device-placements";
import { isCalibrationCaptureRunActive } from "../../utils/mmwave-calibration";
import "../shared/fpb-entity-picker";

const DYSON_MIN_ANGLE = 5;
const DYSON_MAX_ANGLE = 355;
const DYSON_MIN_ANGLE_SPAN = 30;

interface CalibrationDraftPoint {
  target_index: number;
  map_point: Coordinates;
  raw_mean: Coordinates;
  raw_stddev: Coordinates;
  raw_bias?: Coordinates;
  sample_count: number;
}

export class FpbDevicePanel extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ type: String })
  placementId = "";

  @property({ type: String })
  deviceType: "light" | "switch" | "fan" | "mmwave" | "button" | "other" =
    "light";

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

  @state()
  private _calibrationDraftPlacementId: string | null = null;

  @state()
  private _calibrationDraftPoints: CalibrationDraftPoint[] = [];

  private _calibrationRunId = 0;

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
      min-width: 32px;
      min-height: 32px;
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

    .issue-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px 12px;
      border-radius: 10px;
      background: rgba(255, 179, 0, 0.12);
      border: 1px solid rgba(255, 179, 0, 0.45);
    }

    .issue-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      color: var(--primary-text-color);
      font-size: 12px;
      line-height: 1.35;
    }

    .issue-item ha-icon {
      color: #f9a825;
      flex: 0 0 auto;
      --mdc-icon-size: 16px;
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
      min-height: 32px;
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

    .toggle-row,
    .metric-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 28px;
      font-size: 13px;
    }

    .toggle-row input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-color);
      flex: 0 0 auto;
    }

    .metric-row span:last-child {
      color: var(--secondary-text-color);
      white-space: nowrap;
    }

    .delete-btn {
      min-height: 36px;
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
      min-width: 32px;
      min-height: 32px;
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
      min-height: 36px;
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
      min-height: 36px;
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
      min-height: 36px;
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

    .calibration-points {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .calibration-point {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--primary-background-color, #fafafa);
      font-size: 12px;
    }

    .calibration-point-main {
      flex: 1;
      min-width: 0;
    }

    .calibration-point-title {
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .calibration-point-meta {
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .calibration-point-remove {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      --mdc-icon-size: 16px;
    }

    .calibration-point-remove:hover {
      color: var(--error-color, #f44336);
      background: var(--card-background-color, #fff);
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

    @media (max-width: 900px), (hover: none) and (pointer: coarse) {
      :host {
        border-radius: 20px 20px 0 0;
      }

      .panel-header {
        padding: 14px 16px 10px;
      }

      .panel-body {
        max-height: calc(76vh - 56px);
        overflow-y: auto;
        padding: 14px 16px calc(18px + env(safe-area-inset-bottom));
      }

      .close-btn,
      .rebind-btn,
      .delete-btn,
      .add-target-btn,
      .primary-btn,
      .secondary-btn,
      .calibration-point-remove,
      .target-card-header .remove-btn {
        min-height: 44px;
      }

      .close-btn,
      .calibration-point-remove,
      .target-card-header .remove-btn {
        min-width: 44px;
      }

      .entity-row,
      .target-axis-row,
      .calibration-point {
        min-height: 44px;
      }

      .calibration-row {
        align-items: stretch;
      }

      .calibration-row select {
        min-height: 44px;
      }
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
    this._cancelCalibrationCapture();
    super.disconnectedCallback();
  }

  private _getPlacement():
    | LightPlacement
    | SwitchPlacement
    | FanPlacement
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
    } else if (this.deviceType === "fan") {
      return fanPlacements.value.find((p) => p.id === this.placementId) ?? null;
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
    if (this.deviceType === "other")
      return ["light", "switch", "fan", "button"];
    return [];
  }

  private _getPlacementIssues(
    placement:
      | LightPlacement
      | SwitchPlacement
      | FanPlacement
      | ButtonPlacement
      | OtherPlacement
      | MmwavePlacement,
  ): DeviceIssue[] {
    const states = this.hass?.states ?? {};
    if (this.deviceType === "mmwave") {
      return getMmwavePlacementIssues(placement as MmwavePlacement, states);
    }
    return getNormalDeviceIssues(
      placement as
        | LightPlacement
        | SwitchPlacement
        | FanPlacement
        | ButtonPlacement
        | OtherPlacement,
      states,
    );
  }

  private _renderIssues(issues: DeviceIssue[]) {
    if (issues.length === 0) return nothing;
    return html`
      <div class="issue-list" role="status">
        ${issues.map(
          (issue) => html`
            <div class="issue-item">
              <ha-icon icon="mdi:alert-circle"></ha-icon>
              <span>${issue.message}</span>
            </div>
          `,
        )}
      </div>
    `;
  }

  private _getExcludedEntityIds(): string[] {
    return getPlacedDeviceEntityIds(
      {
        lights: lightPlacements.value,
        switches: switchPlacements.value,
        fans: fanPlacements.value,
        buttons: buttonPlacements.value,
        others: otherPlacements.value,
      },
      this.placementId,
    );
  }

  private async _rebindEntity(newEntityId: string): Promise<void> {
    if (!this.hass) return;
    if (
      isDeviceEntityAlreadyPlaced(
        {
          lights: lightPlacements.value,
          switches: switchPlacements.value,
          fans: fanPlacements.value,
          buttons: buttonPlacements.value,
          others: otherPlacements.value,
        },
        newEntityId,
        this.placementId,
      )
    ) {
      alert(`${newEntityId} is already placed on this floor plan.`);
      return;
    }
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
      } else if (this.deviceType === "fan") {
        await this.hass.callWS({
          type: "inhabit/fans/update",
          fan_id: this.placementId,
          entity_id: newEntityId,
        });
        fanPlacements.value = fanPlacements.value.map((p) =>
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

  private async _updateFan(updates: Partial<FanPlacement>): Promise<void> {
    if (!this.hass) return;
    try {
      const result = await this.hass.callWS<FanPlacement>({
        type: "inhabit/fans/update",
        fan_id: this.placementId,
        ...updates,
      });
      fanPlacements.value = fanPlacements.value.map((p) =>
        p.id === result.id ? result : p,
      );
      this.requestUpdate();
    } catch (err) {
      console.error("Failed to update fan placement:", err);
    }
  }

  private _defaultFanDeadzoneRadius(): number {
    const unit = currentFloorPlan.value?.unit ?? "cm";
    if (unit === "m") return 0.75;
    if (unit === "in") return 75 / 2.54;
    if (unit === "ft") return 75 / 30.48;
    return 75;
  }

  private _normalizeFanAngle(angle: number): number {
    return ((Math.round(angle) % 360) + 360) % 360;
  }

  private _clampDysonFanAngle(angle: number): number {
    return Math.max(
      DYSON_MIN_ANGLE,
      Math.min(DYSON_MAX_ANGLE, this._normalizeFanAngle(angle)),
    );
  }

  private _fanOscillationStart(fan: FanPlacement): number {
    return this._clampDysonFanAngle(
      fan.oscillation_start ?? fan.orientation - 30,
    );
  }

  private _fanOscillationEnd(fan: FanPlacement): number {
    const start = this._fanOscillationStart(fan);
    const fallbackEnd = this._clampDysonFanAngle(
      fan.oscillation_end ?? fan.orientation + 30,
    );
    if (fallbackEnd === start || fallbackEnd - start >= DYSON_MIN_ANGLE_SPAN) {
      return fallbackEnd;
    }
    return start + DYSON_MIN_ANGLE_SPAN <= DYSON_MAX_ANGLE
      ? start + DYSON_MIN_ANGLE_SPAN
      : start;
  }

  private _fanAngleBoundsUpdate(
    fan: FanPlacement,
    field: "oscillation_start" | "oscillation_end",
    angle: number,
  ): Partial<FanPlacement> {
    const value = this._clampDysonFanAngle(angle);
    const currentStart = this._fanOscillationStart(fan);
    const currentEnd = this._fanOscillationEnd(fan);

    if (field === "oscillation_start") {
      const nextEnd =
        currentEnd === value || currentEnd - value >= DYSON_MIN_ANGLE_SPAN
          ? currentEnd
          : value + DYSON_MIN_ANGLE_SPAN <= DYSON_MAX_ANGLE
            ? value + DYSON_MIN_ANGLE_SPAN
            : value;
      return { oscillation_start: value, oscillation_end: nextEnd };
    }

    const nextStart =
      value === currentStart || value - currentStart >= DYSON_MIN_ANGLE_SPAN
        ? currentStart
        : value - DYSON_MIN_ANGLE_SPAN >= DYSON_MIN_ANGLE
          ? value - DYSON_MIN_ANGLE_SPAN
          : value;
    return { oscillation_start: nextStart, oscillation_end: value };
  }

  private _fanBlowFactor(fan: FanPlacement): number {
    const state = this.hass?.states[fan.entity_id];
    if (!state || state.state !== "on") return 0;

    const percentage = this._numericFanAttribute(state.attributes.percentage);
    if (percentage !== null) return Math.max(0, Math.min(1, percentage / 100));

    const speed =
      this._numericFanAttribute(state.attributes.speed) ??
      this._numericFanAttribute(state.attributes.fan_speed);
    if (speed !== null) return Math.max(0, Math.min(1, speed / 100));

    return 1;
  }

  private _numericFanAttribute(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private _effectiveFanDeadzoneRadius(fan: FanPlacement): number {
    if (fan.deadzone_enabled === false) return 0;

    const maxRadius = Math.max(
      0,
      fan.deadzone_radius ?? this._defaultFanDeadzoneRadius(),
    );
    const blowFactor = this._fanBlowFactor(fan);
    if (blowFactor <= 0) return 0;
    if (fan.deadzone_dynamic === false) return maxRadius;

    const minRadius = Math.min(
      maxRadius,
      Math.max(0, fan.deadzone_min_radius ?? 0),
    );
    return minRadius + (maxRadius - minRadius) * blowFactor;
  }

  private _fanDeadzoneControlRange(): {
    max: number;
    step: number;
    unit: string;
  } {
    const unit = currentFloorPlan.value?.unit ?? "cm";
    if (unit === "m") return { max: 2.5, step: 0.05, unit };
    if (unit === "in") return { max: 100, step: 2, unit };
    if (unit === "ft") return { max: 8, step: 0.25, unit };
    return { max: 250, step: 5, unit: "cm" };
  }

  private _formatFanDeadzone(value: number, step: number): string {
    return value.toFixed(step < 1 ? 2 : 0);
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
      } else if (this.deviceType === "fan") {
        await this.hass.callWS({
          type: "inhabit/fans/remove",
          fan_id: this.placementId,
        });
        fanPlacements.value = fanPlacements.value.filter(
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
    if (this.deviceType === "fan") return "mdi:fan";
    if (this.deviceType === "button") return "mdi:gesture-tap-button";
    if (this.deviceType === "other") return "mdi:devices";
    return "mdi:access-point";
  }

  private _getTitle(): string {
    if (this.deviceType === "light") return "Light";
    if (this.deviceType === "switch") return "Switch";
    if (this.deviceType === "fan") return "Fan";
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
    const issues = this._getPlacementIssues(placement);

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
        ${this._renderIssues(issues)}
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

        ${this.deviceType === "fan" ? this._renderFanSettings(placement as FanPlacement) : null}
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

  private _renderFanSettings(p: FanPlacement) {
    const orientation = this._clampDysonFanAngle(p.orientation);
    const oscillationStart = this._fanOscillationStart(p);
    const oscillationEnd = this._fanOscillationEnd(p);
    const deadzoneRange = this._fanDeadzoneControlRange();
    const deadzoneEnabled = p.deadzone_enabled !== false;
    const deadzoneDynamic = p.deadzone_dynamic !== false;
    const deadzoneRadius =
      p.deadzone_radius ?? this._defaultFanDeadzoneRadius();
    const deadzoneMinRadius = p.deadzone_min_radius ?? 0;
    const effectiveDeadzoneRadius = this._effectiveFanDeadzoneRadius(p);
    const formatDeadzone = (value: number) =>
      `${this._formatFanDeadzone(value, deadzoneRange.step)} ${deadzoneRange.unit}`;
    return html`
      <div class="section">
        <div class="section-title">Map Settings</div>

        <div class="slider-row">
          <label>Facing Direction <span>${orientation.toFixed(0)}&deg;</span></label>
          <input type="range" min=${DYSON_MIN_ANGLE} max=${DYSON_MAX_ANGLE} step="1"
            .value=${String(orientation)}
            @input=${(e: Event) => {
              const val = this._clampDysonFanAngle(
                Number((e.target as HTMLInputElement).value),
              );
              fanPlacements.value = fanPlacements.value.map((fan) =>
                fan.id === p.id ? { ...fan, orientation: val } : fan,
              );
              this.requestUpdate();
            }}
            @change=${(e: Event) => this._updateFan({ orientation: this._clampDysonFanAngle(Number((e.target as HTMLInputElement).value)) })}
          />
        </div>

        <div class="slider-row">
          <label>Angle Begin <span>${oscillationStart.toFixed(0)}&deg;</span></label>
          <input type="range" min=${DYSON_MIN_ANGLE} max=${DYSON_MAX_ANGLE} step="1"
            .value=${String(oscillationStart)}
            @input=${(e: Event) => {
              const updates = this._fanAngleBoundsUpdate(
                p,
                "oscillation_start",
                Number((e.target as HTMLInputElement).value),
              );
              fanPlacements.value = fanPlacements.value.map((fan) =>
                fan.id === p.id ? { ...fan, ...updates } : fan,
              );
              this.requestUpdate();
            }}
            @change=${(e: Event) =>
              this._updateFan(
                this._fanAngleBoundsUpdate(
                  p,
                  "oscillation_start",
                  Number((e.target as HTMLInputElement).value),
                ),
              )}
          />
        </div>

        <div class="slider-row">
          <label>Angle End <span>${oscillationEnd.toFixed(0)}&deg;</span></label>
          <input type="range" min=${DYSON_MIN_ANGLE} max=${DYSON_MAX_ANGLE} step="1"
            .value=${String(oscillationEnd)}
            @input=${(e: Event) => {
              const updates = this._fanAngleBoundsUpdate(
                p,
                "oscillation_end",
                Number((e.target as HTMLInputElement).value),
              );
              fanPlacements.value = fanPlacements.value.map((fan) =>
                fan.id === p.id ? { ...fan, ...updates } : fan,
              );
              this.requestUpdate();
            }}
            @change=${(e: Event) =>
              this._updateFan(
                this._fanAngleBoundsUpdate(
                  p,
                  "oscillation_end",
                  Number((e.target as HTMLInputElement).value),
                ),
              )}
          />
        </div>

        <label class="toggle-row">
          <span>Always Movable</span>
          <input type="checkbox"
            .checked=${p.draggable_always === true}
            @change=${(e: Event) => {
              const val = (e.target as HTMLInputElement).checked;
              fanPlacements.value = fanPlacements.value.map((fan) =>
                fan.id === p.id ? { ...fan, draggable_always: val } : fan,
              );
              this._updateFan({ draggable_always: val });
            }}
          />
        </label>

        <label class="toggle-row">
          <span>Automatic Deadzone</span>
          <input type="checkbox"
            .checked=${deadzoneEnabled}
            @change=${(e: Event) => {
              const val = (e.target as HTMLInputElement).checked;
              fanPlacements.value = fanPlacements.value.map((fan) =>
                fan.id === p.id ? { ...fan, deadzone_enabled: val } : fan,
              );
              this._updateFan({ deadzone_enabled: val });
            }}
          />
        </label>

        <label class="toggle-row">
          <span>Dynamic Size</span>
          <input type="checkbox"
            .checked=${deadzoneDynamic}
            ?disabled=${!deadzoneEnabled}
            @change=${(e: Event) => {
              const val = (e.target as HTMLInputElement).checked;
              fanPlacements.value = fanPlacements.value.map((fan) =>
                fan.id === p.id ? { ...fan, deadzone_dynamic: val } : fan,
              );
              this._updateFan({ deadzone_dynamic: val });
            }}
          />
        </label>

        <div class="slider-row">
          <label>Range <span>${formatDeadzone(deadzoneRadius)}</span></label>
          <input type="range" min="0" max=${deadzoneRange.max} step=${deadzoneRange.step}
            .value=${String(deadzoneRadius)}
            ?disabled=${!deadzoneEnabled}
            @input=${(e: Event) => {
              const val = Number((e.target as HTMLInputElement).value);
              fanPlacements.value = fanPlacements.value.map((fan) =>
                fan.id === p.id ? { ...fan, deadzone_radius: val } : fan,
              );
              this.requestUpdate();
            }}
            @change=${(e: Event) => this._updateFan({ deadzone_radius: Number((e.target as HTMLInputElement).value) })}
          />
        </div>

        ${
          deadzoneDynamic
            ? html`
        <div class="slider-row">
          <label>Minimum Range <span>${formatDeadzone(Math.min(deadzoneRadius, deadzoneMinRadius))}</span></label>
          <input type="range" min="0" max=${deadzoneRange.max} step=${deadzoneRange.step}
            .value=${String(Math.min(deadzoneRadius, deadzoneMinRadius))}
            ?disabled=${!deadzoneEnabled}
            @input=${(e: Event) => {
              const val = Number((e.target as HTMLInputElement).value);
              fanPlacements.value = fanPlacements.value.map((fan) =>
                fan.id === p.id ? { ...fan, deadzone_min_radius: val } : fan,
              );
              this.requestUpdate();
            }}
            @change=${(e: Event) => this._updateFan({ deadzone_min_radius: Number((e.target as HTMLInputElement).value) })}
          />
        </div>
        `
            : nothing
        }

        <div class="metric-row">
          <span>Current Range</span>
          <span>${formatDeadzone(effectiveDeadzoneRadius)}</span>
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
    const draftPoints = this._getCalibrationDraftPoints(p);
    const pointCount =
      calibration?.points?.length ?? (calibration?.enabled ? 1 : 0);
    const transform = calibration?.world_transform;

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
            Capture point
          </button>
        </div>

        ${
          draftPoints.length > 0
            ? html`
              <div class="calibration-points">
                ${draftPoints.map(
                  (point, index) => html`
                    <div class="calibration-point">
                      <div class="calibration-point-main">
                        <div class="calibration-point-title">
                          Point ${index + 1} · Target ${point.target_index + 1}
                        </div>
                        <div class="calibration-point-meta">
                          Map ${point.map_point.x.toFixed(1)}, ${point.map_point.y.toFixed(1)}
                          · Raw ${point.raw_mean.x.toFixed(1)}, ${point.raw_mean.y.toFixed(1)}
                          · ${point.sample_count} samples
                        </div>
                      </div>
                      <button
                        class="calibration-point-remove"
                        title="Remove point"
                        ?disabled=${this._calibrating}
                        @click=${() => this._removeCalibrationPoint(index)}
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    </div>
                  `,
                )}
              </div>
              <button
                class="primary-btn"
                ?disabled=${this._calibrating}
                @click=${() => this._saveCalibration(p)}
              >
                Save calibration
              </button>
            `
            : html`
              <div class="calibration-status">
                Capture one or more known target points.
              </div>
            `
        }

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
                  <strong>${pointCount}</strong>
                  Points
                </div>
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
                ${
                  transform
                    ? html`
                      <div class="metric">
                        <strong>${transform.residual_error.toFixed(2)}</strong>
                        Fit error
                      </div>
                    `
                    : nothing
                }
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
              ${
                draftPoints.length > 0
                  ? nothing
                  : html`
                <div class="calibration-status">
                  No calibration saved.
                </div>
              `
              }
            `
        }
      </div>
    `;
  }

  private _armCalibration(p: MmwavePlacement, targetIndex: number): void {
    const target = p.targets?.[targetIndex];
    if (!target?.x_entity_id || !target.y_entity_id) return;

    this._calibrationRunId += 1;
    this._calibrating = true;
    this._calibrationSampleCount = 0;
    this._calibrationStatus = "Click the target location on the map";
    mmwaveCalibrationTarget.value = {
      placementId: p.id,
      targetIndex,
      points: this._getCalibrationDraftPoints(p).map(
        (point) => point.map_point,
      ),
      sampleCount: 0,
      sampleGoal: 25,
      sampleProgress: 0,
      status: "Tap target point",
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

    const runId = ++this._calibrationRunId;
    mmwaveCalibrationTarget.value = {
      placementId: placement.id,
      targetIndex: detail.targetIndex,
      points: this._getCalibrationDraftPoints(placement).map(
        (point) => point.map_point,
      ),
      activePoint: detail.point,
      sampleCount: 0,
      sampleGoal: 25,
      sampleProgress: 0,
      status: "Sampling",
      sampling: true,
    };
    await this._sampleAndAddCalibrationPoint(
      placement,
      detail.targetIndex,
      detail.point,
      runId,
    );
  }

  private async _sampleAndAddCalibrationPoint(
    placement: MmwavePlacement,
    targetIndex: number,
    mapPoint: { x: number; y: number },
    runId: number,
  ): Promise<void> {
    if (!this.hass) return;

    const target = placement.targets?.[targetIndex];
    if (!target?.x_entity_id || !target.y_entity_id) {
      this._calibrating = false;
      this._calibrationStatus = "Target needs both X and Y entities";
      mmwaveCalibrationTarget.value = null;
      return;
    }

    const samples: Array<{ x: number; y: number }> = [];
    this._calibrationStatus = "Sampling target";
    this._calibrationSampleCount = 0;
    const sampleGoal = 25;

    for (let i = 0; i < sampleGoal; i++) {
      if (!this._isCalibrationRunActive(runId, placement.id, targetIndex)) {
        return;
      }
      const sample = this._readTargetSample(
        target.x_entity_id,
        target.y_entity_id,
      );
      if (sample) {
        samples.push(sample);
        this._calibrationSampleCount = samples.length;
      }
      mmwaveCalibrationTarget.value = {
        placementId: placement.id,
        targetIndex,
        points: this._getCalibrationDraftPoints(placement).map(
          (point) => point.map_point,
        ),
        activePoint: mapPoint,
        sampleCount: samples.length,
        sampleGoal,
        sampleProgress: (i + 1) / sampleGoal,
        status: "Sampling",
        sampling: true,
      };
      await new Promise((resolve) => window.setTimeout(resolve, 200));
      if (!this._isCalibrationRunActive(runId, placement.id, targetIndex)) {
        return;
      }
    }

    if (!this._isCalibrationRunActive(runId, placement.id, targetIndex)) {
      return;
    }

    if (samples.length < 10) {
      this._calibrating = false;
      this._calibrationStatus = "Calibration needs at least 10 valid samples";
      mmwaveCalibrationTarget.value = {
        placementId: placement.id,
        targetIndex,
        points: this._getCalibrationDraftPoints(placement).map(
          (point) => point.map_point,
        ),
        activePoint: mapPoint,
        sampleCount: samples.length,
        sampleGoal,
        sampleProgress: 1,
        status: "Needs 10 samples",
      };
      return;
    }

    if (!this._isCalibrationRunActive(runId, placement.id, targetIndex)) {
      return;
    }

    const rawMean = this._meanSamples(samples);
    const rawStddev = this._stddevSamples(samples, rawMean);
    const nextPoints = [
      ...this._getCalibrationDraftPoints(placement),
      {
        target_index: targetIndex,
        map_point: mapPoint,
        raw_mean: rawMean,
        raw_stddev: rawStddev,
        sample_count: samples.length,
      },
    ];
    this._calibrationDraftPlacementId = placement.id;
    this._calibrationDraftPoints = nextPoints;
    this._calibrating = false;
    this._calibrationStatus = `Point ${nextPoints.length} captured`;
    mmwaveCalibrationTarget.value = {
      placementId: placement.id,
      targetIndex,
      points: nextPoints.map((point) => point.map_point),
      activePoint: mapPoint,
      sampleCount: samples.length,
      sampleGoal,
      sampleProgress: 1,
      status: "Captured",
    };
    window.setTimeout(() => {
      const current = mmwaveCalibrationTarget.value;
      if (
        this._calibrationRunId === runId &&
        current?.placementId === placement.id &&
        current.targetIndex === targetIndex &&
        current.status === "Captured"
      ) {
        mmwaveCalibrationTarget.value = null;
      }
    }, 900);
    this.requestUpdate();
  }

  private _cancelCalibrationCapture(): void {
    this._calibrationRunId += 1;
    this._calibrating = false;
    this._calibrationSampleCount = 0;
    if (mmwaveCalibrationTarget.value?.placementId === this.placementId) {
      mmwaveCalibrationTarget.value = null;
    }
  }

  private _isCalibrationRunActive(
    runId: number,
    placementId: string,
    targetIndex: number,
  ): boolean {
    const target = mmwaveCalibrationTarget.value;
    return isCalibrationCaptureRunActive(
      runId,
      this._calibrationRunId,
      this.isConnected,
      this.deviceType,
      this.placementId,
      placementId,
      targetIndex,
      target,
    );
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
      this._calibrationDraftPlacementId = this.placementId;
      this._calibrationDraftPoints = [];
      this._calibrationStatus = "Calibration cleared";
    } catch (err) {
      console.error("Failed to clear mmWave calibration:", err);
      this._calibrationStatus = "Clear calibration failed";
    }
  }

  private _getCalibrationDraftPoints(
    placement: MmwavePlacement,
  ): CalibrationDraftPoint[] {
    if (this._calibrationDraftPlacementId === placement.id) {
      return this._calibrationDraftPoints;
    }

    const points = this._pointsFromCalibration(placement);
    this._calibrationDraftPlacementId = placement.id;
    this._calibrationDraftPoints = points;
    return points;
  }

  private _pointsFromCalibration(
    placement: MmwavePlacement,
  ): CalibrationDraftPoint[] {
    const calibration = placement.calibration;
    if (!calibration?.enabled) return [];
    if (calibration.points?.length) {
      return calibration.points.map((point) => ({ ...point }));
    }
    return [
      {
        target_index: calibration.target_index,
        map_point: calibration.map_point,
        raw_mean: calibration.raw_mean,
        raw_stddev: calibration.raw_stddev,
        raw_bias: calibration.raw_bias,
        sample_count: calibration.sample_count,
      },
    ];
  }

  private _removeCalibrationPoint(index: number): void {
    if (!this._calibrationDraftPlacementId) return;
    this._calibrationDraftPoints = this._calibrationDraftPoints.filter(
      (_point, pointIndex) => pointIndex !== index,
    );
    this._calibrationStatus =
      this._calibrationDraftPoints.length > 0
        ? "Point removed. Save calibration to apply."
        : "No calibration points in draft";
  }

  private async _saveCalibration(placement: MmwavePlacement): Promise<void> {
    if (!this.hass || this.deviceType !== "mmwave") return;
    const points = this._getCalibrationDraftPoints(placement);
    if (points.length === 0) {
      this._calibrationStatus = "Capture at least one point";
      return;
    }

    this._calibrating = true;
    this._calibrationStatus = "Saving calibration";
    try {
      const result = await this.hass.callWS<MmwavePlacement>({
        type: "inhabit/mmwave/calibrate",
        placement_id: placement.id,
        points,
      });
      mmwavePlacements.value = mmwavePlacements.value.map((p) =>
        p.id === result.id ? result : p,
      );
      this._calibrationDraftPlacementId = result.id;
      this._calibrationDraftPoints = this._pointsFromCalibration(result);
      this._calibrationStatus = "Calibration saved";
    } catch (err) {
      console.error("Failed to calibrate mmWave placement:", err);
      this._calibrationStatus = "Calibration failed";
    } finally {
      this._calibrating = false;
      this.requestUpdate();
    }
  }

  private _meanSamples(samples: Array<{ x: number; y: number }>): Coordinates {
    return {
      x: samples.reduce((sum, sample) => sum + sample.x, 0) / samples.length,
      y: samples.reduce((sum, sample) => sum + sample.y, 0) / samples.length,
    };
  }

  private _stddevSamples(
    samples: Array<{ x: number; y: number }>,
    mean: Coordinates,
  ): Coordinates {
    return {
      x: Math.sqrt(
        samples.reduce((sum, sample) => sum + (sample.x - mean.x) ** 2, 0) /
          samples.length,
      ),
      y: Math.sqrt(
        samples.reduce((sum, sample) => sum + (sample.y - mean.y) ** 2, 0) /
          samples.length,
      ),
    };
  }
}

if (!customElements.get("fpb-device-panel")) {
  customElements.define("fpb-device-panel", FpbDevicePanel);
}
