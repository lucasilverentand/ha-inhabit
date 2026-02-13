/**
 * Occupancy Settings Panel — slide-out right panel for configuring
 * a room or zone's occupancy detection settings.
 */

import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  VirtualSensorConfig,
  OccupancyStateData,
  SensorBinding,
} from "../../types";

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

  private _pollTimer?: number;

  static override styles = css`
    :host {
      display: block;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      font-size: 14px;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      gap: 8px;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--secondary-text-color);
      border-radius: 50%;
    }

    .close-btn:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }

    .panel-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
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
      padding: 2px;
      color: var(--error-color, #f44336);
      font-size: 16px;
      line-height: 1;
    }

    .add-sensor-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .add-sensor-row input {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      font-size: 13px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
    }

    .add-sensor-row button {
      padding: 6px 12px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
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

    ha-switch {
      --mdc-theme-secondary: var(--primary-color);
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadConfig();
    this._startPolling();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopPolling();
  }

  override updated(changedProps: Map<string, unknown>): void {
    if (changedProps.has("targetId") && this.targetId) {
      this._loadConfig();
    }
  }

  private _startPolling(): void {
    this._pollTimer = window.setInterval(() => this._loadOccupancyState(), 2000);
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
    try {
      const config = await this.hass.callWS<VirtualSensorConfig>({
        type: "inhabit/sensor_config/get",
        room_id: this.targetId,
      });
      this._config = config;
    } catch {
      this._config = null;
    }
    await this._loadOccupancyState();
    this._loading = false;
  }

  private async _loadOccupancyState(): Promise<void> {
    if (!this.hass) return;
    try {
      const states = await this.hass.callWS<Record<string, OccupancyStateData>>({
        type: "inhabit/occupancy_states",
      });
      this._occupancyState = states[this.targetId] ?? null;
    } catch {
      // ignore
    }
  }

  private async _updateConfig(updates: Partial<VirtualSensorConfig>): Promise<void> {
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

  private async _addSensor(type: "motion" | "presence" | "door", entityId: string): Promise<void> {
    if (!this._config || !entityId) return;
    const key = `${type}_sensors` as const;
    const existing = this._config[key] as SensorBinding[];
    if (existing.some(s => s.entity_id === entityId)) return;
    const updated = [...existing, { entity_id: entityId, sensor_type: type, weight: 1.0, inverted: false }];
    await this._updateConfig({ [key]: updated });
  }

  private async _removeSensor(type: "motion" | "presence" | "door", entityId: string): Promise<void> {
    if (!this._config) return;
    const key = `${type}_sensors` as const;
    const existing = this._config[key] as SensorBinding[];
    const updated = existing.filter(s => s.entity_id !== entityId);
    await this._updateConfig({ [key]: updated });
  }

  private _renderSensorSection(title: string, type: "motion" | "presence" | "door", sensors: SensorBinding[]) {
    const inputId = `add-${type}-input`;
    return html`
      <div class="section">
        <div class="section-title">${title}</div>
        <div class="sensor-list">
          ${sensors.map(s => html`
            <div class="sensor-item">
              <ha-icon icon=${type === "motion" ? "mdi:motion-sensor" : type === "presence" ? "mdi:account-eye" : "mdi:door"} style="--mdc-icon-size: 18px;"></ha-icon>
              <span class="entity-id">${s.entity_id}</span>
              <button class="remove-btn" @click=${() => this._removeSensor(type, s.entity_id)}>x</button>
            </div>
          `)}
        </div>
        <div class="add-sensor-row">
          <input
            id=${inputId}
            type="text"
            placeholder="binary_sensor.xxx"
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === "Enter") {
                const input = e.target as HTMLInputElement;
                this._addSensor(type, input.value.trim());
                input.value = "";
              }
            }}
          />
          <button @click=${() => {
            const input = this.shadowRoot?.querySelector(`#${inputId}`) as HTMLInputElement;
            if (input) {
              this._addSensor(type, input.value.trim());
              input.value = "";
            }
          }}>Add</button>
        </div>
      </div>
    `;
  }

  private _renderStatus() {
    const state = this._occupancyState;
    if (!state) return nothing;

    const stateClass = state.state;
    const stateLabel = state.state.charAt(0).toUpperCase() + state.state.slice(1);
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
          ${state.contributing_sensors.length > 0 ? html`
            <div class="contributing-sensors">
              Contributing: ${state.contributing_sensors.join(", ")}
            </div>
          ` : nothing}
        </div>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="panel-header">
        <h3>${this.targetName} Occupancy</h3>
        <button class="close-btn" @click=${() => this.dispatchEvent(new CustomEvent("close-panel"))}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      <div class="panel-body">
        ${this._loading ? html`<ha-circular-progress active></ha-circular-progress>` : this._config ? html`
          <!-- Enable toggle -->
          <div class="toggle-row">
            <div>
              <label>Occupancy Sensor</label>
              <div class="sublabel">Creates a binary_sensor entity</div>
            </div>
            <ha-switch
              .checked=${this._config.enabled}
              @change=${(e: Event) => this._updateConfig({ enabled: (e.target as any).checked })}
            ></ha-switch>
          </div>

          ${this._config.enabled ? html`
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
            </div>

            <!-- Sensor Bindings -->
            ${this._renderSensorSection("Motion Sensors", "motion", this._config.motion_sensors)}
            ${this._renderSensorSection("Presence Sensors", "presence", this._config.presence_sensors)}
            ${this._renderSensorSection("Door Sensors", "door", this._config.door_sensors)}

            <!-- Door Logic -->
            <div class="section">
              <div class="section-title">Door Logic</div>

              <div class="toggle-row">
                <div>
                  <label>Door blocks vacancy</label>
                  <div class="sublabel">Closed door prevents VACANT</div>
                </div>
                <ha-switch
                  .checked=${this._config.door_blocks_vacancy}
                  @change=${(e: Event) => this._updateConfig({ door_blocks_vacancy: (e.target as any).checked })}
                ></ha-switch>
              </div>

              <div class="toggle-row">
                <div>
                  <label>Door open resets checking</label>
                  <div class="sublabel">Opening door restarts CHECKING timer</div>
                </div>
                <ha-switch
                  .checked=${this._config.door_open_resets_checking}
                  @change=${(e: Event) => this._updateConfig({ door_open_resets_checking: (e.target as any).checked })}
                ></ha-switch>
              </div>
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
          ` : nothing}
        ` : html`
          <p style="color: var(--secondary-text-color);">No occupancy config found. Enable occupancy on this ${this.targetType} first.</p>
        `}
      </div>
    `;
  }
}

customElements.define("fpb-occupancy-panel", FpbOccupancyPanel);
