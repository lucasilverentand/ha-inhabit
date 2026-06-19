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
  OccupancyStateData,
  SensorBinding,
  SensorConfigPatchResult,
  VirtualSensorConfig,
} from "../../types";
import "../shared/fpb-entity-picker";

type AreaSensorBindingType = "motion" | "door";

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
  private _patchText = "";

  @state()
  private _patchPreview: SensorConfigPatchResult | null = null;

  @state()
  private _patchError = "";

  @state()
  private _patchApplying = false;

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
    this._patchPreview = null;
    this._patchError = "";
    try {
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

  private _parsePatch(): Record<string, unknown> | null {
    this._patchError = "";
    const text = this._patchText.trim();
    if (!text) {
      this._patchError = "Paste a JSON object with config fields to change.";
      return null;
    }
    try {
      const parsed = JSON.parse(text) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        this._patchError = "Patch must be a JSON object.";
        return null;
      }
      return parsed as Record<string, unknown>;
    } catch (err) {
      this._patchError = err instanceof Error ? err.message : String(err);
      return null;
    }
  }

  private async _previewConfigPatch(): Promise<void> {
    if (!this.hass) return;
    const patch = this._parsePatch();
    if (!patch) return;
    try {
      this._patchPreview = await this.hass.callWS<SensorConfigPatchResult>({
        type: "inhabit/sensor_config/preview_patch",
        room_id: this.targetId,
        patch,
        reason: "AI config patch preview",
      });
    } catch (err) {
      this._patchPreview = null;
      this._patchError =
        err instanceof Error ? err.message : "Could not preview patch.";
    }
  }

  private async _applyConfigPatch(): Promise<void> {
    if (!this.hass || !this._patchPreview?.valid) return;
    const patch = this._parsePatch();
    if (!patch) return;
    this._patchApplying = true;
    try {
      const result = await this.hass.callWS<SensorConfigPatchResult>({
        type: "inhabit/sensor_config/apply_patch",
        room_id: this.targetId,
        patch,
        reason: "Applied from occupancy panel AI config patch",
        confirm: true,
      });
      this._patchPreview = result;
      if (result.config) this._config = result.config;
      await this._loadDiagnostics();
    } catch (err) {
      this._patchError =
        err instanceof Error ? err.message : "Could not apply patch.";
    } finally {
      this._patchApplying = false;
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

  private _formatValue(value: unknown): string {
    if (value === null || value === undefined) return "null";
    if (typeof value === "string") return value;
    return JSON.stringify(value);
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

  private async _addSensors(
    type: AreaSensorBindingType,
    entityIds: string[],
  ): Promise<void> {
    if (!this._config || entityIds.length === 0) return;
    const key = `${type}_sensors` as const;
    const existing = this._config[key] as SensorBinding[];
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
    const existing = this._config[key] as SensorBinding[];
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
    for (const s of this._config.occupancy_sensors ?? []) ids.push(s.entity_id);
    for (const s of this._config.door_sensors ?? []) ids.push(s.entity_id);
    if (this._config.override_trigger_entity)
      ids.push(this._config.override_trigger_entity);
    return ids;
  }

  private _renderSensorSection(
    title: string,
    type: AreaSensorBindingType,
    sensors: SensorBinding[],
  ) {
    const icon = type === "motion" ? "mdi:motion-sensor" : "mdi:door";
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
          Add ${type} sensor
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
            placeholder="Search ${type} sensors..."
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
            ${this._diagnostics.length === 0
              ? html`<div class="message-box">No diagnostics recorded yet.</div>`
              : this._diagnostics.slice(-6).map(
                  (event) => html`
                    <div class="diagnostic-item">
                      <div class="diagnostic-meta">
                        <span>${event.category}</span>
                        <span>${new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div class="diagnostic-title">${event.event}</div>
                      ${event.reason
                        ? html`<div class="diagnostic-reason">
                            ${event.reason}
                          </div>`
                        : nothing}
                      ${event.blockers.length > 0
                        ? html`<div class="diagnostic-reason">
                            Blockers: ${event.blockers.join(", ")}
                          </div>`
                        : nothing}
                    </div>
                  `,
                )}
          </div>
        </div>
      </div>
    `;
  }

  private _renderConfigPatchTools() {
    const preview = this._patchPreview;
    return html`
      <div class="section">
        <div class="section-title">AI Config Patch</div>
        <textarea
          class="action-input textarea-input"
          placeholder='{"checking_timeout": 45, "occupied_threshold": 0.6}'
          .value=${this._patchText}
          @input=${(e: Event) => {
            this._patchText = (e.target as HTMLTextAreaElement).value;
            this._patchPreview = null;
            this._patchError = "";
          }}
        ></textarea>
        <div class="button-row">
          <button class="secondary-btn" @click=${() => this._previewConfigPatch()}>
            Preview
          </button>
          <button
            class="add-btn"
            ?disabled=${!preview?.valid || this._patchApplying}
            @click=${() => this._applyConfigPatch()}
          >
            Apply Patch
          </button>
        </div>
        ${this._patchError
          ? html`<div class="message-box error">${this._patchError}</div>`
          : nothing}
        ${preview?.warnings?.length
          ? html`<div class="message-box warning">
              ${preview.warnings.join(" ")}
            </div>`
          : nothing}
        ${preview?.errors?.length
          ? html`<div class="message-box error">
              ${preview.errors.join(" ")}
            </div>`
          : nothing}
        ${preview
          ? html`
              <div class="diff-list">
                ${preview.diff.length === 0
                  ? html`<div class="message-box">No config changes.</div>`
                  : preview.diff.map(
                      (item) => html`
                        <div class="diff-item">
                          <strong>${item.field}</strong>
                          <div class="diff-value">
                            ${this._formatValue(item.before)} -> ${this._formatValue(
                              item.after,
                            )}
                          </div>
                        </div>
                      `,
                    )}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  override render() {
    const hasDoorSensors = (this._config?.door_sensors ?? []).length > 0;
    const doorSealsRoom =
      this._config?.door_seals_room ?? this._config?.door_blocks_vacancy;
    const spatialPresenceDelay =
      this._config?.spatial_presence_delay ??
      (this.targetType === "zone" ? 5 : 0);

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

            <!-- Timing -->
            <div class="section">
              <div class="section-title">Timing</div>

              <div class="slider-row">
                <label>Motion Timeout <span>${this._config.motion_timeout}s</span></label>
                <input type="range" min="10" max="600" step="10"
                  .value=${String(this._config.motion_timeout)}
                  @change=${(e: Event) => this._updateConfig({ motion_timeout: Number((e.target as HTMLInputElement).value) })}
                />
              </div>

              <div class="slider-row">
                <label>Checking Timeout <span>${this._config.checking_timeout}s</span></label>
                <input type="range" min="5" max="120" step="5"
                  .value=${String(this._config.checking_timeout)}
                  @change=${(e: Event) => this._updateConfig({ checking_timeout: Number((e.target as HTMLInputElement).value) })}
                />
              </div>

              <div class="slider-row">
                <label>Presence Timeout <span>${this._config.presence_timeout}s</span></label>
                <input type="range" min="30" max="900" step="30"
                  .value=${String(this._config.presence_timeout)}
                  @change=${(e: Event) => this._updateConfig({ presence_timeout: Number((e.target as HTMLInputElement).value) })}
                />
              </div>

              <div class="slider-row">
                <label>Open/unsealed idle <span>${this._config.unsealed_activity_timeout}s</span></label>
                <input type="range" min="10" max="900" step="10"
                  .value=${String(this._config.unsealed_activity_timeout)}
                  @change=${(e: Event) => this._updateConfig({ unsealed_activity_timeout: Number((e.target as HTMLInputElement).value) })}
                />
              </div>

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
            ${this._renderSensorSection("Motion Sensors", "motion", this._config.motion_sensors)}
            ${this._renderSensorSection("Door Sensors", "door", this._config.door_sensors)}

            <!-- Door Logic -->
            ${
              hasDoorSensors
                ? html`<div class="section">
              <div class="section-title">Door Logic</div>

              <div class="toggle-row">
                <div>
                  <label>Closed-door hold</label>
                  <div class="sublabel">Requires a fresh detection after closing</div>
                </div>
                <ha-switch
                  .checked=${Boolean(doorSealsRoom)}
                  @change=${(e: Event) => this._updateConfig({ door_seals_room: (e.target as HTMLInputElement).checked })}
                ></ha-switch>
              </div>

              <div class="toggle-row">
                <div>
                  <label>Door open resets checking</label>
                  <div class="sublabel">Opening door restarts CHECKING timer</div>
                </div>
                <ha-switch
                  .checked=${this._config.door_open_resets_checking}
                  @change=${(e: Event) => this._updateConfig({ door_open_resets_checking: (e.target as HTMLInputElement).checked })}
                ></ha-switch>
              </div>
            </div>`
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

            <!-- Thresholds -->
            <div class="section">
              <div class="section-title">Thresholds</div>

              <div class="slider-row">
                <label>Occupied Threshold <span>${(this._config.occupied_threshold * 100).toFixed(0)}%</span></label>
                <input type="range" min="0.1" max="1.0" step="0.05"
                  .value=${String(this._config.occupied_threshold)}
                  @change=${(e: Event) => this._updateConfig({ occupied_threshold: Number((e.target as HTMLInputElement).value) })}
                />
              </div>

              <div class="slider-row">
                <label>Vacant Threshold <span>${(this._config.vacant_threshold * 100).toFixed(0)}%</span></label>
                <input type="range" min="0.0" max="0.5" step="0.05"
                  .value=${String(this._config.vacant_threshold)}
                  @change=${(e: Event) => this._updateConfig({ vacant_threshold: Number((e.target as HTMLInputElement).value) })}
                />
              </div>
            </div>

            ${this._renderDiagnostics()}
            ${this._renderConfigPatchTools()}
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
