/**
 * Entity picker dialog with search, domain filtering, duplicate prevention,
 * and multi-select support.
 *
 * Single-select mode (multi=false, default):
 *   Fires `entities-confirmed` with one entity immediately on click.
 *
 * Multi-select mode (multi=true):
 *   User checks entities, then clicks "Add (N)" to confirm all at once.
 */

import { LitElement, html, css, nothing } from "lit";
import { property, state, query } from "lit/decorators.js";
import type { HomeAssistant } from "../../types";

interface EntityEntry {
  entity_id: string;
  friendly_name: string;
  domain: string;
}

export class FpbEntityPicker extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  /** Entity domains to include (e.g. ["binary_sensor"]). Empty = all. */
  @property({ type: Array })
  domains: string[] = [];

  /** Entity IDs to exclude from the list (already bound elsewhere). */
  @property({ type: Array })
  exclude: string[] = [];

  /** Allow selecting multiple entities before confirming. */
  @property({ type: Boolean })
  multi = false;

  @property({ type: String })
  title = "Select Entity";

  @property({ type: String })
  placeholder = "Search entities...";

  @state()
  private _search = "";

  /** Entity IDs staged for multi-add. */
  @state()
  private _staged: Set<string> = new Set();

  @query(".search-input")
  private _input?: HTMLInputElement;

  static override styles = css`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      width: 420px;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid var(--divider-color, #e8e8e8);
    }

    .dialog-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
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
    }

    .close-btn:hover {
      color: var(--primary-text-color, #333);
      background: var(--secondary-background-color, #f5f5f5);
    }

    .search-container {
      padding: 12px 16px 8px;
    }

    .search-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      box-sizing: border-box;
      outline: none;
    }

    .search-input:focus {
      border-color: var(--primary-color);
    }

    .result-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px 8px;
      min-height: 120px;
      max-height: 360px;
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 8px;
      color: var(--primary-text-color);
      text-align: left;
      width: 100%;
      transition: background 0.1s;
    }

    .result-item:hover {
      background: var(--secondary-background-color);
    }

    .result-item.selected {
      background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    }

    .result-item .check {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 2px solid var(--divider-color, #ccc);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: border-color 0.1s, background 0.1s;
    }

    .result-item.selected .check {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .check-mark {
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
    }

    .result-item .text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      overflow: hidden;
    }

    .result-item .name {
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .result-item .eid {
      color: var(--secondary-text-color);
      font-size: 11px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .empty-state {
      padding: 24px 12px;
      text-align: center;
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--divider-color, #e8e8e8);
    }

    .footer-btn {
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }

    .cancel-btn {
      background: none;
      color: var(--secondary-text-color);
    }

    .cancel-btn:hover {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }

    .confirm-btn {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .confirm-btn:hover {
      opacity: 0.9;
    }

    .confirm-btn:disabled {
      opacity: 0.4;
      cursor: default;
    }
  `;

  override firstUpdated(): void {
    requestAnimationFrame(() => this._input?.focus());
  }

  private _getIcon(entityId: string): string {
    if (entityId.startsWith("binary_sensor.")) {
      const state = this.hass?.states[entityId];
      const dc = state?.attributes?.device_class ?? "";
      if (dc === "motion") return "mdi:motion-sensor";
      if (dc === "occupancy") return "mdi:account-eye";
      if (dc === "door") return "mdi:door";
      if (dc === "window") return "mdi:window-closed";
      if (dc === "presence") return "mdi:account-eye";
      return "mdi:checkbox-blank-circle-outline";
    }
    if (entityId.startsWith("event.")) return "mdi:bell-ring";
    if (entityId.startsWith("button.") || entityId.startsWith("input_button.")) return "mdi:gesture-tap-button";
    if (entityId.startsWith("switch.") || entityId.startsWith("input_boolean.")) return "mdi:toggle-switch";
    if (entityId.startsWith("light.")) return "mdi:lightbulb";
    if (entityId.startsWith("sensor.")) return "mdi:eye";
    return "mdi:ray-vertex";
  }

  private _scoreMatch(entry: EntityEntry, terms: string[]): number {
    if (terms.length === 0) return 1;
    const name = entry.friendly_name.toLowerCase();
    const eid = entry.entity_id.toLowerCase();
    let score = 0;

    for (const term of terms) {
      const nameIdx = name.indexOf(term);
      const eidIdx = eid.indexOf(term);
      if (nameIdx === -1 && eidIdx === -1) return -1;
      if (nameIdx === 0 || (nameIdx > 0 && name[nameIdx - 1] === " ")) score += 3;
      else if (nameIdx >= 0) score += 2;
      if (eidIdx === 0 || (eidIdx > 0 && (eid[eidIdx - 1] === "." || eid[eidIdx - 1] === "_"))) score += 3;
      else if (eidIdx >= 0) score += 1;
    }
    return score;
  }

  private _getFilteredEntities(): EntityEntry[] {
    if (!this.hass) return [];
    const excludeSet = new Set(this.exclude);
    const domainSet = new Set(this.domains);
    const terms = this._search.toLowerCase().split(/\s+/).filter(Boolean);

    const entries: Array<EntityEntry & { score: number }> = [];

    for (const eid of Object.keys(this.hass.states)) {
      if (excludeSet.has(eid)) continue;
      const domain = eid.split(".")[0];
      if (domainSet.size > 0 && !domainSet.has(domain)) continue;

      const entry: EntityEntry = {
        entity_id: eid,
        friendly_name: String(this.hass.states[eid].attributes?.friendly_name ?? eid),
        domain,
      };

      const score = this._scoreMatch(entry, terms);
      if (score >= 0) entries.push({ ...entry, score });
    }

    entries.sort((a, b) => {
      // In multi mode, show staged items first
      if (this.multi) {
        const aStaged = this._staged.has(a.entity_id) ? 1 : 0;
        const bStaged = this._staged.has(b.entity_id) ? 1 : 0;
        if (aStaged !== bStaged) return bStaged - aStaged;
      }
      return b.score - a.score || a.friendly_name.localeCompare(b.friendly_name);
    });
    return entries.slice(0, 50);
  }

  private _toggleStaged(entityId: string): void {
    const next = new Set(this._staged);
    if (next.has(entityId)) next.delete(entityId);
    else next.add(entityId);
    this._staged = next;
  }

  private _onItemClick(entityId: string): void {
    if (this.multi) {
      this._toggleStaged(entityId);
    } else {
      this._confirm([entityId]);
    }
  }

  private _confirm(entityIds: string[]): void {
    this.dispatchEvent(new CustomEvent("entities-confirmed", {
      detail: { entityIds },
      bubbles: true,
      composed: true,
    }));
    this._close();
  }

  private _close(): void {
    this._search = "";
    this._staged = new Set();
    this.dispatchEvent(new CustomEvent("picker-closed", { bubbles: true, composed: true }));
  }

  private _onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains("overlay")) {
      this._close();
    }
  }

  override render() {
    const results = this._getFilteredEntities();
    const stagedCount = this._staged.size;

    return html`
      <div class="overlay" @click=${this._onOverlayClick} @keydown=${(e: KeyboardEvent) => { if (e.key === "Escape") this._close(); }}>
        <div class="dialog">
          <div class="dialog-header">
            <h3>${this.title}</h3>
            <button class="close-btn" @click=${this._close}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="search-container">
            <input
              class="search-input"
              type="text"
              .placeholder=${this.placeholder}
              .value=${this._search}
              @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === "Escape") this._close(); }}
            />
          </div>

          <div class="result-list">
            ${results.length > 0 ? results.map(ent => {
              const isStaged = this._staged.has(ent.entity_id);
              return html`
                <button
                  class="result-item ${isStaged ? "selected" : ""}"
                  @click=${() => this._onItemClick(ent.entity_id)}
                >
                  ${this.multi ? html`
                    <div class="check">
                      ${isStaged ? html`<span class="check-mark">✓</span>` : nothing}
                    </div>
                  ` : html`
                    <ha-icon icon=${this._getIcon(ent.entity_id)} style="--mdc-icon-size: 18px;"></ha-icon>
                  `}
                  <div class="text">
                    <span class="name">${ent.friendly_name}</span>
                    <span class="eid">${ent.entity_id}</span>
                  </div>
                </button>
              `;
            }) : html`
              <div class="empty-state">
                ${this._search ? "No matching entities" : "No entities available"}
              </div>
            `}
          </div>

          ${this.multi ? html`
            <div class="dialog-footer">
              <button class="footer-btn cancel-btn" @click=${this._close}>Cancel</button>
              <button
                class="footer-btn confirm-btn"
                ?disabled=${stagedCount === 0}
                @click=${() => this._confirm([...this._staged])}
              >
                Add${stagedCount > 0 ? ` (${stagedCount})` : ""}
              </button>
            </div>
          ` : nothing}
        </div>
      </div>
    `;
  }
}

customElements.define("fpb-entity-picker", FpbEntityPicker);
