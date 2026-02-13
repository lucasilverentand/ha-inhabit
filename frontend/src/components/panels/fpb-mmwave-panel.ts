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
              <label>Facing Angle <span>${this._placement.angle.toFixed(0)}deg</span></label>
              <input type="range" min="0" max="360" step="1"
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
