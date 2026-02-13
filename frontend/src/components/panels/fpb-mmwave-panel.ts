/**
 * mmWave Sensor Configuration Panel — slide-out panel for configuring
 * a selected mmWave placement's target mappings, angle, FOV, and range.
 */

import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";
import type {
  HomeAssistant,
  MmwavePlacement,
} from "../../types";
import { mmwavePlacements } from "../../stores/signals";

export class FpbMmwavePanel extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ type: String })
  placementId = "";

  @state()
  private _placement: MmwavePlacement | null = null;

  @state()
  private _loading = true;

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
    }

    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
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
      background: var(--secondary-background-color);
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

    .target-mapping {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px;
      background: var(--primary-background-color, #fafafa);
      border-radius: 8px;
    }

    .target-mapping-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .target-mapping-header span {
      font-weight: 500;
      font-size: 13px;
    }

    .target-mapping input {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      font-size: 13px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }

    .target-mapping label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      color: var(--error-color, #f44336);
      font-size: 14px;
    }

    .add-btn {
      padding: 8px 16px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
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
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadPlacement();
  }

  override updated(changedProps: Map<string, unknown>): void {
    if (changedProps.has("placementId") && this.placementId) {
      this._loadPlacement();
    }
  }

  private async _loadPlacement(): Promise<void> {
    if (!this.hass || !this.placementId) return;
    this._loading = true;
    // Find from signal cache
    const p = mmwavePlacements.value.find(m => m.id === this.placementId);
    this._placement = p ?? null;
    this._loading = false;
  }

  private async _update(updates: Record<string, unknown>): Promise<void> {
    if (!this.hass || !this._placement) return;
    try {
      const result = await this.hass.callWS<MmwavePlacement>({
        type: "inhabit/mmwave/update",
        placement_id: this.placementId,
        ...updates,
      });
      this._placement = result;
      // Update signal cache
      mmwavePlacements.value = mmwavePlacements.value.map(
        p => p.id === result.id ? result : p
      );
    } catch (err) {
      console.error("Failed to update mmWave placement:", err);
    }
  }

  private async _addTargetMapping(): Promise<void> {
    if (!this._placement) return;
    const nextIndex = this._placement.target_mappings.length > 0
      ? Math.max(...this._placement.target_mappings.map(m => m.target_index)) + 1
      : 0;

    const updated = [
      ...this._placement.target_mappings,
      { target_index: nextIndex, x_entity_id: "", y_entity_id: "" },
    ];
    await this._update({ target_mappings: updated });
  }

  private async _removeTargetMapping(index: number): Promise<void> {
    if (!this._placement) return;
    const updated = this._placement.target_mappings.filter(
      m => m.target_index !== index
    );
    await this._update({ target_mappings: updated });
  }

  private async _updateTargetMapping(
    targetIndex: number,
    field: "x_entity_id" | "y_entity_id",
    value: string,
  ): Promise<void> {
    if (!this._placement) return;
    const updated = this._placement.target_mappings.map(m =>
      m.target_index === targetIndex ? { ...m, [field]: value } : m
    );
    await this._update({ target_mappings: updated });
  }

  private async _deletePlacement(): Promise<void> {
    if (!this.hass || !this._placement) return;
    try {
      await this.hass.callWS({
        type: "inhabit/mmwave/delete",
        placement_id: this.placementId,
      });
      mmwavePlacements.value = mmwavePlacements.value.filter(
        p => p.id !== this.placementId
      );
      this.dispatchEvent(new CustomEvent("close-panel"));
    } catch (err) {
      console.error("Failed to delete mmWave placement:", err);
    }
  }

  override render() {
    return html`
      <div class="panel-header">
        <h3>mmWave Sensor</h3>
        <button class="close-btn" @click=${() => this.dispatchEvent(new CustomEvent("close-panel"))}>
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </div>
      <div class="panel-body">
        ${this._loading ? html`<ha-circular-progress active></ha-circular-progress>` :
          !this._placement ? html`<p>Placement not found.</p>` : html`
          <!-- Angle, FOV, Range -->
          <div class="section">
            <div class="section-title">Sensor Settings</div>

            <div class="slider-row">
              <label>Angle Offset <span>${this._placement.angle.toFixed(0)}deg</span></label>
              <input type="range" min="-90" max="90" step="1"
                .value=${String(this._placement.angle)}
                @change=${(e: Event) => this._update({ angle: Number((e.target as HTMLInputElement).value) })}
              />
            </div>

            <div class="slider-row">
              <label>Field of View <span>${this._placement.field_of_view.toFixed(0)}deg</span></label>
              <input type="range" min="30" max="180" step="5"
                .value=${String(this._placement.field_of_view)}
                @change=${(e: Event) => this._update({ field_of_view: Number((e.target as HTMLInputElement).value) })}
              />
            </div>

            <div class="slider-row">
              <label>Detection Range <span>${this._placement.detection_range.toFixed(0)}cm</span></label>
              <input type="range" min="50" max="1200" step="25"
                .value=${String(this._placement.detection_range)}
                @change=${(e: Event) => this._update({ detection_range: Number((e.target as HTMLInputElement).value) })}
              />
            </div>
          </div>

          <!-- Target Mappings -->
          <div class="section">
            <div class="section-title">Target Mappings</div>
            ${this._placement.target_mappings.map(m => html`
              <div class="target-mapping">
                <div class="target-mapping-header">
                  <span>Target ${m.target_index}</span>
                  <button class="remove-btn" @click=${() => this._removeTargetMapping(m.target_index)}>x</button>
                </div>
                <label>X Entity</label>
                <input type="text" .value=${m.x_entity_id} placeholder="sensor.mmwave_target_x"
                  @change=${(e: Event) => this._updateTargetMapping(m.target_index, "x_entity_id", (e.target as HTMLInputElement).value)}
                />
                <label>Y Entity</label>
                <input type="text" .value=${m.y_entity_id} placeholder="sensor.mmwave_target_y"
                  @change=${(e: Event) => this._updateTargetMapping(m.target_index, "y_entity_id", (e.target as HTMLInputElement).value)}
                />
              </div>
            `)}
            <button class="add-btn" @click=${this._addTargetMapping}>+ Add Target</button>
          </div>

          <!-- Delete -->
          <div class="section">
            <button class="delete-btn" @click=${this._deletePlacement}>Delete Sensor</button>
          </div>
        `}
      </div>
    `;
  }
}

customElements.define("fpb-mmwave-panel", FpbMmwavePanel);
