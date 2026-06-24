/**
 * Occupancy Settings Panel — slide-out right panel for configuring
 * a room or zone's occupancy detection settings.
 */

import { css, html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type {
  HassEntity,
  HomeAssistant,
  OccupancyDiagnosticEvent,
  OccupancyDiagnosticsResponse,
  OccupancyProfile,
  OccupancyStateData,
  SensorBinding,
  VirtualSensorConfig,
} from "../../types";
import "../shared/fpb-entity-picker";

type AreaSensorBindingType =
  | "motion"
  | "presence"
  | "occupancy"
  | "door"
  | "window"
  | "exit";

type PolicyOverrideValue = number | boolean;

type PolicyOverrideKey =
  | "motion_timeout"
  | "checking_timeout"
  | "presence_timeout"
  | "unsealed_activity_timeout"
  | "exit_check_delay"
  | "override_safety_timeout"
  | "closed_door_hybrid_check"
  | "phantom_hold_seconds"
  | "door_seals_room"
  | "long_stay"
  | "hold_until_exit";

type PolicyNumberField = {
  key: PolicyOverrideKey;
  label: string;
  suffix: string;
  min: number;
  max: number;
  step: number;
};

const POLICY_NUMBER_FIELDS: PolicyNumberField[] = [
  {
    key: "motion_timeout",
    label: "Motion hold",
    suffix: "s",
    min: 5,
    max: 1800,
    step: 5,
  },
  {
    key: "checking_timeout",
    label: "Empty check",
    suffix: "s",
    min: 5,
    max: 900,
    step: 5,
  },
  {
    key: "presence_timeout",
    label: "Presence hold",
    suffix: "s",
    min: 15,
    max: 7200,
    step: 15,
  },
  {
    key: "unsealed_activity_timeout",
    label: "Open-door hold",
    suffix: "s",
    min: 5,
    max: 1800,
    step: 5,
  },
  {
    key: "exit_check_delay",
    label: "Exit delay",
    suffix: "s",
    min: 0,
    max: 120,
    step: 1,
  },
  {
    key: "override_safety_timeout",
    label: "Override safety",
    suffix: "s",
    min: 60,
    max: 14400,
    step: 60,
  },
  {
    key: "closed_door_hybrid_check",
    label: "Closed-door check",
    suffix: "s",
    min: 60,
    max: 7200,
    step: 60,
  },
  {
    key: "phantom_hold_seconds",
    label: "Transit phantom",
    suffix: "s",
    min: 0,
    max: 300,
    step: 5,
  },
];

const POLICY_TOGGLE_FIELDS: Array<{
  key: PolicyOverrideKey;
  label: string;
  description: string;
}> = [
  {
    key: "door_seals_room",
    label: "Closed door holds occupancy",
    description:
      "Door closure can keep this area occupied until evidence clears it.",
  },
  {
    key: "long_stay",
    label: "Long-stay behavior",
    description:
      "Use slower quiet-period behavior for couches, beds, and living areas.",
  },
  {
    key: "hold_until_exit",
    label: "Hold until leave confirmation",
    description: "Keep occupied until a leave sensor confirms someone left.",
  },
];

const FALLBACK_OCCUPANCY_PROFILES: OccupancyProfile[] = [
  {
    id: "transit",
    label: "Transit",
    description:
      "Fast hallway and pass-through behavior with a short path hold.",
    motion_timeout: 30,
    checking_timeout: 15,
    presence_timeout: 60,
    unsealed_activity_timeout: 30,
    door_seals_room: false,
    long_stay: false,
    hold_until_exit: false,
    phantom_hold_seconds: 30,
    exit_check_delay: 15,
    override_safety_timeout: 1800,
    closed_door_hybrid_check: 600,
  },
  {
    id: "short_stay",
    label: "Short Stay",
    description: "Bathroom/toilet behavior with door-aware confirmation.",
    motion_timeout: 45,
    checking_timeout: 30,
    presence_timeout: 300,
    unsealed_activity_timeout: 45,
    door_seals_room: true,
    long_stay: false,
    hold_until_exit: false,
    phantom_hold_seconds: 0,
    exit_check_delay: 15,
    override_safety_timeout: 1800,
    closed_door_hybrid_check: 600,
  },
  {
    id: "long_stay",
    label: "Long Stay",
    description:
      "Living/dining behavior that tolerates quiet occupied periods.",
    motion_timeout: 120,
    checking_timeout: 60,
    presence_timeout: 600,
    unsealed_activity_timeout: 300,
    door_seals_room: true,
    long_stay: true,
    hold_until_exit: false,
    phantom_hold_seconds: 0,
    exit_check_delay: 15,
    override_safety_timeout: 1800,
    closed_door_hybrid_check: 600,
  },
  {
    id: "open_area",
    label: "Open Area",
    description: "Doorless spaces using evidence decay instead of sealing.",
    motion_timeout: 120,
    checking_timeout: 30,
    presence_timeout: 300,
    unsealed_activity_timeout: 180,
    door_seals_room: false,
    long_stay: false,
    hold_until_exit: false,
    phantom_hold_seconds: 0,
    exit_check_delay: 15,
    override_safety_timeout: 1800,
    closed_door_hybrid_check: 600,
  },
  {
    id: "sleep",
    label: "Sleep",
    description: "Bedroom/bed behavior that holds until an exit signal.",
    motion_timeout: 300,
    checking_timeout: 60,
    presence_timeout: 1800,
    unsealed_activity_timeout: 600,
    door_seals_room: true,
    long_stay: true,
    hold_until_exit: true,
    phantom_hold_seconds: 0,
    exit_check_delay: 15,
    override_safety_timeout: 1800,
    closed_door_hybrid_check: 600,
  },
  {
    id: "utility",
    label: "Utility",
    description: "Fast but safe behavior for closets and utility rooms.",
    motion_timeout: 30,
    checking_timeout: 15,
    presence_timeout: 120,
    unsealed_activity_timeout: 60,
    door_seals_room: true,
    long_stay: false,
    hold_until_exit: false,
    phantom_hold_seconds: 0,
    exit_check_delay: 15,
    override_safety_timeout: 1800,
    closed_door_hybrid_check: 600,
  },
];

export class FpbOccupancyPanel extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ type: String })
  targetId = "";

  @property({ type: String })
  targetName = "";

  @property({ type: String })
  targetType: "room" | "zone" = "room";

  @state()
  private _config: VirtualSensorConfig | null = null;

  @state()
  private _occupancyState: OccupancyStateData | null = null;

  @state()
  private _profiles: OccupancyProfile[] = FALLBACK_OCCUPANCY_PROFILES;

  @state()
  private _loading = true;

  @state()
  private _activePicker: AreaSensorBindingType | "override" | null = null;

  @state()
  private _diagnostics: OccupancyDiagnosticEvent[] = [];

  @state()
  private _diagnosticsCategory = "";

  @state()
  private _diagnosticsLoading = false;

  @state()
  private _policyEditorOpen = false;

  private _pollTimer?: number;

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
      gap: 8px;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 0;
    }

    .toggle-row label {
      font-size: 14px;
    }

    .toggle-row .sublabel {
      font-size: 12px;
      color: var(--secondary-text-color);
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

    .sensor-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sensor-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      background: var(--primary-background-color, #fafafa);
      border-radius: 8px;
      font-size: 13px;
    }

    .sensor-item .entity-id {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sensor-item .remove-btn {
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

    .sensor-item .remove-btn:hover {
      color: var(--error-color, #f44336);
    }

    .add-btn {
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

    .add-btn:hover {
      opacity: 0.9;
    }

    .action-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      box-sizing: border-box;
    }

    .textarea-input {
      min-height: 96px;
      resize: vertical;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      line-height: 1.4;
    }

    .status-section {
      padding: 12px;
      background: var(--primary-background-color, #fafafa);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .state-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
    }

    .state-badge.vacant {
      background: rgba(76, 175, 80, 0.15);
      color: #2e7d32;
    }

    .state-badge.occupied {
      background: rgba(244, 67, 54, 0.15);
      color: #c62828;
    }

    .state-badge.checking {
      background: rgba(255, 152, 0, 0.15);
      color: #e65100;
    }

    .confidence-bar {
      height: 6px;
      background: var(--divider-color, #e0e0e0);
      border-radius: 3px;
      overflow: hidden;
    }

    .confidence-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s;
      background: var(--primary-color);
    }

    .contributing-sensors {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .button-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .secondary-btn {
      padding: 6px 10px;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
    }

    .secondary-btn:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .secondary-btn[disabled],
    .add-btn[disabled] {
      cursor: default;
      opacity: 0.55;
    }

    .select-input {
      min-width: 140px;
      padding: 6px 8px;
      border: 1px solid var(--divider-color, #ddd);
      border-radius: 8px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
    }

    .policy-summary {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }

    .policy-chip {
      padding: 7px 8px;
      border-radius: 8px;
      background: var(--primary-background-color, #fafafa);
      font-size: 12px;
      line-height: 1.3;
    }

    .policy-chip strong {
      display: block;
      font-size: 11px;
      color: var(--secondary-text-color);
      font-weight: 500;
    }

    .policy-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .policy-status {
      color: var(--secondary-text-color);
      font-size: 12px;
    }

    .policy-editor {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
    }

    .policy-field-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .policy-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .policy-field label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .policy-input {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      padding: 7px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color);
      font: inherit;
      font-size: 13px;
    }

    .policy-toggle-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .policy-toggle {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      align-items: center;
    }

    .policy-toggle label {
      display: block;
      font-size: 13px;
      font-weight: 500;
    }

    .policy-toggle .sublabel {
      margin-top: 2px;
      font-size: 12px;
    }

    .diagnostic-list,
    .diff-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .diagnostic-item,
    .diff-item,
    .message-box {
      padding: 8px;
      background: var(--primary-background-color, #fafafa);
      border-radius: 8px;
      font-size: 12px;
      line-height: 1.35;
    }

    .diagnostic-meta {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      color: var(--secondary-text-color);
      font-size: 11px;
    }

    .diagnostic-title {
      margin-top: 2px;
      font-weight: 600;
    }

    .diagnostic-reason,
    .diff-value {
      margin-top: 2px;
      color: var(--secondary-text-color);
      overflow-wrap: anywhere;
    }

    .message-box.error {
      color: var(--error-color, #b00020);
      background: rgba(244, 67, 54, 0.12);
    }

    .message-box.warning {
      color: #8a5a00;
      background: rgba(255, 193, 7, 0.16);
    }

    ha-switch {
      --mdc-theme-secondary: var(--primary-color);
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadConfig().then(() => this._startPolling());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopPolling();
  }

  override updated(changedProps: Map<string, unknown>): void {
    if (changedProps.has("targetId") && this.targetId) {
      this._stopPolling();
      this._loadConfig().then(() => this._startPolling());
    }
  }

  private _startPolling(): void {
    if (this._pollTimer) clearInterval(this._pollTimer);
    this._pollTimer = window.setInterval(
      () => this._loadOccupancyState(),
      2000,
    );
  }

  private _stopPolling(): void {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = undefined;
    }
  }

  private async _loadConfig(): Promise<void> {
    if (!this.hass || !this.targetId) return;
    this._loading = true;
    this._diagnostics = [];
    try {
      await this._loadProfiles();
      const config = await this.hass.callWS<VirtualSensorConfig>({
        type: "inhabit/sensor_config/get",
        room_id: this.targetId,
      });
      this._config = config;
    } catch (err) {
      console.error("Failed to load config:", err);
      this._config = null;
    }
    await this._loadOccupancyState();
    await this._loadDiagnostics();
    this._loading = false;
  }

  private async _loadProfiles(): Promise<void> {
    if (!this.hass) return;
    try {
      const response = await this.hass.callWS<{ profiles: OccupancyProfile[] }>(
        {
          type: "inhabit/occupancy_profiles",
        },
      );
      if (Array.isArray(response.profiles) && response.profiles.length > 0) {
        this._profiles = response.profiles;
      }
    } catch (err) {
      console.warn("Falling back to bundled occupancy profiles:", err);
      this._profiles = FALLBACK_OCCUPANCY_PROFILES;
    }
  }

  private async _loadOccupancyState(): Promise<void> {
    if (!this.hass) return;
    try {
      const states = await this.hass.callWS<Record<string, OccupancyStateData>>(
        {
          type: "inhabit/occupancy_states",
        },
      );
      this._occupancyState = states[this.targetId] ?? null;
    } catch (err) {
      console.error("Failed to load config:", err);
    }
  }

  private async _loadDiagnostics(): Promise<void> {
    if (!this.hass || !this.targetId) return;
    this._diagnosticsLoading = true;
    try {
      const response = await this.hass.callWS<OccupancyDiagnosticsResponse>({
        type: "inhabit/occupancy_diagnostics",
        room_id: this.targetId,
        category: this._diagnosticsCategory || undefined,
        limit: 20,
        include_config: true,
      });
      this._diagnostics = response.events ?? [];
    } catch (err) {
      console.error("Failed to load diagnostics:", err);
      this._diagnostics = [];
    } finally {
      this._diagnosticsLoading = false;
    }
  }

  private async _updateConfig(
    updates: Partial<VirtualSensorConfig>,
  ): Promise<void> {
    if (!this.hass || !this._config) return;
    try {
      const result = await this.hass.callWS<VirtualSensorConfig>({
        type: "inhabit/sensor_config/update",
        room_id: this.targetId,
        ...updates,
      });
      this._config = result;
    } catch (err) {
      console.error("Failed to update sensor config:", err);
    }
  }

  private async _copyDiagnostics(): Promise<void> {
    const payload = JSON.stringify(
      {
        room_id: this.targetId,
        state: this._occupancyState,
        config: this._config,
        diagnostics: this._diagnostics,
      },
      null,
      2,
    );
    await navigator.clipboard?.writeText(payload);
  }

  private _latestWhy(): string {
    const latest = [...this._diagnostics]
      .reverse()
      .find(
        (event) =>
          event.event === "state_committed" ||
          event.event === "state_transition" ||
          event.event === "transition_blocked",
      );
    if (!latest) return "No recent diagnostic decision recorded.";
    if (latest.event === "transition_blocked") {
      const blockers = latest.blockers.length
        ? ` (${latest.blockers.join(", ")})`
        : "";
      return `Stayed ${this._occupancyState?.state ?? "unknown"}: ${latest.reason ?? latest.event}${blockers}`;
    }
    return `${latest.previous_state ?? "unknown"} -> ${latest.new_state ?? "unknown"}: ${latest.reason ?? latest.event}`;
  }

  private _selectedProfile(): OccupancyProfile {
    const id = this._config?.occupancy_profile ?? "short_stay";
    return (
      this._profiles.find((profile) => profile.id === id) ??
      FALLBACK_OCCUPANCY_PROFILES.find((profile) => profile.id === id) ??
      FALLBACK_OCCUPANCY_PROFILES[1]
    );
  }

  private _policyOverrides(): Record<string, PolicyOverrideValue> {
    return this._config?.policy_overrides ?? {};
  }

  private _hasPolicyOverrides(): boolean {
    return Object.keys(this._policyOverrides()).length > 0;
  }

  private async _selectPolicyProfile(profileId: string): Promise<void> {
    await this._updateConfig({
      occupancy_profile: profileId,
      policy_overrides: {},
    });
  }

  private async _updatePolicyOverride(
    key: PolicyOverrideKey,
    value: PolicyOverrideValue,
  ): Promise<void> {
    if (!this._config) return;
    await this._updateConfig({
      policy_overrides: {
        ...this._policyOverrides(),
        [key]: value,
      },
    });
  }

  private async _resetPolicyOverrides(): Promise<void> {
    await this._updateConfig({ policy_overrides: {} });
  }

  private _renderPolicyEditor() {
    if (!this._config) return nothing;
    return html`
      <div class="policy-editor">
        <div class="policy-field-grid">
          ${POLICY_NUMBER_FIELDS.map(
            (field) => html`
              <div class="policy-field">
                <label>${field.label}</label>
                <input
                  class="policy-input"
                  type="number"
                  min=${field.min}
                  max=${field.max}
                  step=${field.step}
                  .value=${String(this._config?.[field.key] ?? 0)}
                  @change=${(e: Event) => {
                    const input = e.target as HTMLInputElement;
                    const value = Number(input.value);
                    if (Number.isFinite(value)) {
                      this._updatePolicyOverride(
                        field.key,
                        Math.max(field.min, value),
                      );
                    }
                  }}
                />
              </div>
            `,
          )}
        </div>
        <div class="policy-toggle-list">
          ${POLICY_TOGGLE_FIELDS.map(
            (field) => html`
              <div class="policy-toggle">
                <div>
                  <label>${field.label}</label>
                  <div class="sublabel">${field.description}</div>
                </div>
                <ha-switch
                  .checked=${Boolean(this._config?.[field.key])}
                  @change=${(e: Event) =>
                    this._updatePolicyOverride(
                      field.key,
                      (e.target as HTMLInputElement).checked,
                    )}
                ></ha-switch>
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }

  private async _addSensors(
    type: AreaSensorBindingType,
    entityIds: string[],
  ): Promise<void> {
    if (!this._config || entityIds.length === 0) return;
    const key = `${type}_sensors` as const;
    const existing = (this._config[key] as SensorBinding[] | undefined) ?? [];
    const existingIds = new Set(existing.map((s) => s.entity_id));
    const newBindings = entityIds
      .filter((eid) => eid && !existingIds.has(eid))
      .map((eid) => ({
        entity_id: eid,
        sensor_type: type,
        weight: 1.0,
        inverted: false,
      }));
    if (newBindings.length === 0) return;
    await this._updateConfig({ [key]: [...existing, ...newBindings] });
  }

  private async _removeSensor(
    type: AreaSensorBindingType,
    entityId: string,
  ): Promise<void> {
    if (!this._config) return;
    const key = `${type}_sensors` as const;
    const existing = (this._config[key] as SensorBinding[] | undefined) ?? [];
    const updated = existing.filter((s) => s.entity_id !== entityId);
    await this._updateConfig({ [key]: updated });
  }

  private _isOverrideTriggerEntity = (
    entityId: string,
    stateObj: HassEntity,
  ): boolean => {
    const domain = entityId.split(".")[0];
    if (
      ["button", "input_button", "event", "switch", "input_boolean"].includes(
        domain,
      )
    ) {
      return true;
    }
    if (domain !== "sensor") return false;

    const entityIdLower = entityId.toLowerCase();
    const friendlyName = String(
      stateObj.attributes?.friendly_name ?? "",
    ).toLowerCase();
    const deviceClass = String(
      stateObj.attributes?.device_class ?? "",
    ).toLowerCase();

    return (
      entityIdLower.endsWith("_action") ||
      entityIdLower.includes("_action_") ||
      friendlyName.endsWith(" action") ||
      friendlyName.includes(" action ") ||
      deviceClass === "enum"
    );
  };

  private _getEntityName(entityId: string): string {
    if (!this.hass?.states[entityId]) return entityId;
    return String(
      this.hass.states[entityId].attributes?.friendly_name ?? entityId,
    );
  }

  /** All entity IDs currently bound (for the picker's exclude list). */
  private _getAllBoundEntityIds(): string[] {
    if (!this._config) return [];
    const ids: string[] = [];
    for (const s of this._config.motion_sensors ?? []) ids.push(s.entity_id);
    for (const s of this._config.presence_sensors ?? []) ids.push(s.entity_id);
    for (const s of this._config.occupancy_sensors ?? []) ids.push(s.entity_id);
    for (const s of this._config.door_sensors ?? []) ids.push(s.entity_id);
    for (const s of this._config.window_sensors ?? []) ids.push(s.entity_id);
    for (const s of this._config.exit_sensors ?? []) ids.push(s.entity_id);
    if (this._config.override_trigger_entity)
      ids.push(this._config.override_trigger_entity);
    return ids;
  }

  private _renderSensorSection(
    title: string,
    type: AreaSensorBindingType,
    sensors: SensorBinding[] = [],
    addLabel?: string,
    searchLabel?: string,
  ) {
    const icon =
      type === "motion"
        ? "mdi:motion-sensor"
        : type === "presence"
          ? "mdi:radar"
          : type === "occupancy"
            ? "mdi:account-check-outline"
            : type === "window"
              ? "mdi:window-closed-variant"
              : type === "exit"
                ? "mdi:exit-run"
                : "mdi:door";
    return html`
      <div class="section">
        <div class="section-title">${title}</div>
        <div class="sensor-list">
          ${sensors.map(
            (s) => html`
            <div class="sensor-item">
              <ha-icon icon=${icon} style="--mdc-icon-size: 18px;"></ha-icon>
              <span class="entity-id">${this._getEntityName(s.entity_id)}</span>
              <button class="remove-btn" @click=${() => this._removeSensor(type, s.entity_id)}><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>
            </div>
          `,
          )}
        </div>
        <button class="add-btn" @click=${() => {
          this._activePicker = type;
        }}>
          ${addLabel ?? `Add ${type} sensor`}
        </button>
        ${
          this._activePicker === type
            ? html`
          <fpb-entity-picker
            .hass=${this.hass}
            .domains=${["binary_sensor"]}
            .exclude=${this._getAllBoundEntityIds()}
            .multi=${true}
            title="Add ${title}"
            placeholder="Search ${searchLabel ?? type} sensors..."
            @entities-confirmed=${(e: CustomEvent) => {
              this._addSensors(type, e.detail.entityIds);
              this._activePicker = null;
            }}
            @picker-closed=${() => {
              this._activePicker = null;
            }}
          ></fpb-entity-picker>
        `
            : nothing
        }
      </div>
    `;
  }

  private _renderStatus() {
    const state = this._occupancyState;
    if (!state) return nothing;

    const stateClass = state.state;
    const stateLabel =
      state.state.charAt(0).toUpperCase() + state.state.slice(1);
    const confidencePercent = Math.round(state.confidence * 100);

    return html`
      <div class="section">
        <div class="section-title">Live Status</div>
        <div class="status-section">
          <div>
            <span class="state-badge ${stateClass}">${stateLabel}</span>
          </div>
          <div>
            <label style="font-size: 12px; color: var(--secondary-text-color);">Confidence: ${confidencePercent}%</label>
            <div class="confidence-bar">
              <div class="confidence-bar-fill" style="width: ${confidencePercent}%;"></div>
            </div>
          </div>
          ${
            state.contributing_sensors.length > 0
              ? html`
            <div class="contributing-sensors">
              Contributing: ${state.contributing_sensors.join(", ")}
            </div>
          `
              : nothing
          }
        </div>
      </div>
    `;
  }

  private _renderDiagnostics() {
    return html`
      <div class="section">
        <div class="section-title">Diagnostics</div>
        <div class="status-section">
          <div class="contributing-sensors">${this._latestWhy()}</div>
          <div class="button-row">
            <select
              class="select-input"
              .value=${this._diagnosticsCategory}
              @change=${(e: Event) => {
                this._diagnosticsCategory = (
                  e.target as HTMLSelectElement
                ).value;
                this._loadDiagnostics();
              }}
            >
              <option value="">All events</option>
              <option value="state">State</option>
              <option value="state_machine">State machine</option>
              <option value="sensor">Sensors</option>
              <option value="spatial">Spatial</option>
              <option value="seal">Seal</option>
              <option value="adaptive">Adaptive</option>
              <option value="config">Config</option>
            </select>
            <button
              class="secondary-btn"
              ?disabled=${this._diagnosticsLoading}
              @click=${() => this._loadDiagnostics()}
            >
              Refresh
            </button>
            <button
              class="secondary-btn"
              ?disabled=${this._diagnostics.length === 0}
              @click=${() => this._copyDiagnostics()}
            >
              Copy JSON
            </button>
          </div>
          <div class="diagnostic-list">
            ${
              this._diagnostics.length === 0
                ? html`<div class="message-box">No diagnostics recorded yet.</div>`
                : this._diagnostics.slice(-6).map(
                    (event) => html`
                    <div class="diagnostic-item">
                      <div class="diagnostic-meta">
                        <span>${event.category}</span>
                        <span>${new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div class="diagnostic-title">${event.event}</div>
                      ${
                        event.reason
                          ? html`<div class="diagnostic-reason">
                            ${event.reason}
                          </div>`
                          : nothing
                      }
                      ${
                        event.blockers.length > 0
                          ? html`<div class="diagnostic-reason">
                            Blockers: ${event.blockers.join(", ")}
                          </div>`
                          : nothing
                      }
                    </div>
                  `,
                  )
            }
          </div>
        </div>
      </div>
    `;
  }

  override render() {
    const spatialPresenceDelay =
      this._config?.spatial_presence_delay ??
      (this.targetType === "zone" ? 5 : 0);
    const selectedProfile = this._selectedProfile();

    return html`
      <div class="panel-header">
        <h3>${this.targetName} Occupancy</h3>
        <button class="close-btn" @click=${() => this.dispatchEvent(new CustomEvent("close-panel"))}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      <div class="panel-body">
        ${
          this._loading
            ? html`<ha-circular-progress active></ha-circular-progress>`
            : this._config
              ? html`
          <!-- Enable toggle -->
          <div class="toggle-row">
            <div>
              <label>Occupancy Sensor</label>
              <div class="sublabel">Creates a binary_sensor entity</div>
            </div>
            <ha-switch
              .checked=${this._config.enabled}
              @change=${(e: Event) => this._updateConfig({ enabled: (e.target as HTMLInputElement).checked })}
            ></ha-switch>
          </div>

          ${
            this._config.enabled
              ? html`
            <!-- Spatial presence toggle -->
            <div class="toggle-row">
              <div>
                <label>Presence sensors affect this ${this.targetType}</label>
                <div class="sublabel">Spatial targets inside drive occupancy</div>
              </div>
              <ha-switch
                .checked=${this._config.presence_affects}
                @change=${(e: Event) => this._updateConfig({ presence_affects: (e.target as HTMLInputElement).checked })}
              ></ha-switch>
            </div>

            ${this._renderStatus()}

            <!-- Policy -->
            <div class="section">
              <div class="section-title">Policy</div>
              <select
                class="select-input"
                .value=${this._config.occupancy_profile}
                @change=${(e: Event) => this._selectPolicyProfile((e.target as HTMLSelectElement).value)}
              >
                ${this._profiles.map(
                  (profile) => html`
                    <option value=${profile.id}>${profile.label}</option>
                  `,
                )}
              </select>
              <div class="message-box">${selectedProfile.description}</div>
              <div class="policy-summary">
                <div class="policy-chip">
                  <strong>Open check</strong>
                  ${this._config.unsealed_activity_timeout}s
                </div>
                <div class="policy-chip">
                  <strong>Exit delay</strong>
                  ${this._config.exit_check_delay}s
                </div>
                <div class="policy-chip">
                  <strong>Override safety</strong>
                  ${Math.round(this._config.override_safety_timeout / 60)}m
                </div>
                <div class="policy-chip">
                  <strong>Closed door</strong>
                  ${this._config.door_seals_room ? "Hold with confirmation" : "Evidence decay"}
                </div>
              </div>
              <div class="policy-actions">
                <span class="policy-status">
                  ${
                    this._hasPolicyOverrides()
                      ? "Customized for this area"
                      : "Using profile defaults"
                  }
                </span>
                <div style="display: flex; gap: 8px;">
                  ${
                    this._hasPolicyOverrides()
                      ? html`
                          <button class="add-btn" @click=${() => this._resetPolicyOverrides()}>
                            Reset defaults
                          </button>
                        `
                      : nothing
                  }
                  <button
                    class="add-btn"
                    @click=${() => {
                      this._policyEditorOpen = !this._policyEditorOpen;
                    }}
                  >
                    ${this._policyEditorOpen ? "Done" : "Edit policy"}
                  </button>
                </div>
              </div>
              ${this._policyEditorOpen ? this._renderPolicyEditor() : nothing}

              ${
                this.targetType === "zone"
                  ? html`
              <div class="slider-row">
                <label>Spatial Delay <span>${spatialPresenceDelay}s</span></label>
                <input type="range" min="0" max="30" step="1"
                  .value=${String(spatialPresenceDelay)}
                  @change=${(e: Event) => this._updateConfig({ spatial_presence_delay: Number((e.target as HTMLInputElement).value) })}
                />
              </div>
            `
                  : nothing
              }
            </div>

            <!-- Sensor Bindings -->
            ${this._renderSensorSection("Motion / PIR", "motion", this._config.motion_sensors)}
            ${this._renderSensorSection("Presence / mmWave", "presence", this._config.presence_sensors)}
            ${this._renderSensorSection("Occupancy Signals", "occupancy", this._config.occupancy_sensors)}
            ${this._renderSensorSection("Doors / Openings", "door", this._config.door_sensors)}
            ${this._renderSensorSection("Windows / Exterior", "window", this._config.window_sensors ?? [])}
            ${
              selectedProfile.hold_until_exit ||
              (this._config.exit_sensors ?? []).length > 0
                ? html`
                    ${this._renderSensorSection(
                      "Leave Confirmation",
                      "exit",
                      this._config.exit_sensors ?? [],
                      "Add leave sensor",
                      "leave confirmation",
                    )}
                    <div class="message-box">
                      Used by sleep-style policies to release occupancy when another sensor proves the person left.
                    </div>
                  `
                : nothing
            }

            <!-- Override Trigger -->
            <div class="section">
              <div class="section-title">Override Trigger</div>
              ${
                this._config.override_trigger_entity
                  ? html`
                <div class="sensor-item">
                  <ha-icon icon="mdi:gesture-tap-button" style="--mdc-icon-size: 18px;"></ha-icon>
                  <span class="entity-id">
                    ${this._getEntityName(this._config.override_trigger_entity)}
                    ${this._config.override_trigger_action ? html` <span style="color: var(--secondary-text-color)">(${this._config.override_trigger_action})</span>` : nothing}
                  </span>
                  <button class="remove-btn" @click=${() => {
                    this._updateConfig({
                      override_trigger_entity: "",
                      override_trigger_action: "",
                    });
                  }}><ha-icon icon="mdi:trash-can-outline"></ha-icon></button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label style="font-size: 12px; color: var(--secondary-text-color);">Action (optional)</label>
                  <input
                    class="action-input"
                    type="text"
                    placeholder="e.g. on_press, single, toggle"
                    .value=${this._config.override_trigger_action ?? ""}
                    @change=${(e: Event) => this._updateConfig({ override_trigger_action: (e.target as HTMLInputElement).value.trim() })}
                  />
                </div>
              `
                  : html`
                <button class="add-btn" @click=${() => {
                  this._activePicker = "override";
                }}>
                  Select entity
                </button>
                <div style="font-size: 12px; color: var(--secondary-text-color);">
                  Pick a button, switch, or event entity to toggle occupancy
                </div>
                ${
                  this._activePicker === "override"
                    ? html`
                  <fpb-entity-picker
                    .hass=${this.hass}
                    .domains=${["button", "input_button", "event", "switch", "input_boolean", "sensor"]}
                    .exclude=${this._getAllBoundEntityIds()}
                    .entityFilter=${this._isOverrideTriggerEntity}
                    title="Select Override Trigger"
                    placeholder="Search buttons, switches, events, action sensors..."
                    @entities-confirmed=${(e: CustomEvent) => {
                      this._updateConfig({
                        override_trigger_entity: e.detail.entityIds[0],
                      });
                      this._activePicker = null;
                    }}
                    @picker-closed=${() => {
                      this._activePicker = null;
                    }}
                  ></fpb-entity-picker>
                `
                    : nothing
                }
              `
              }
            </div>

            ${this._renderDiagnostics()}
          `
              : nothing
          }
        `
              : html`
          <p style="color: var(--secondary-text-color);">No occupancy config found. Enable occupancy on this ${this.targetType} first.</p>
        `
        }
      </div>
    `;
  }
}

if (!customElements.get("fpb-occupancy-panel")) {
  customElements.define("fpb-occupancy-panel", FpbOccupancyPanel);
}
