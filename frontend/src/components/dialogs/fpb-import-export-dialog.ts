/**
 * Import/Export Dialog Component
 *
 * A unified dialog for importing and exporting floors.
 * - Export: select which floors to export (all selected by default)
 * - Import: pick a file, then select which floors to import
 */

import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant, Floor } from "../../types";
import { currentFloorPlan } from "../../stores/signals";

type DialogMode = "export" | "import";

interface ImportFloorEntry {
  index: number;
  name: string;
  level: number;
  roomCount: number;
  wallCount: number;
  deviceCount: number;
  selected: boolean;
}

export class FpbImportExportDialog extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @property({ type: Boolean, reflect: true })
  open = false;

  @state() private _mode: DialogMode = "export";
  @state() private _exportSelection: Set<string> = new Set();
  @state() private _importEntries: ImportFloorEntry[] = [];
  @state() private _importData: Record<string, unknown>[] = [];
  @state() private _importing = false;
  @state() private _exporting = false;
  @state() private _error: string | null = null;

  static override styles = css`
    :host {
      display: none;
    }

    :host([open]) {
      display: block;
    }

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
      border-radius: 20px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1);
      width: 420px;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 16px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--secondary-text-color, #999);
      cursor: pointer;
      transition: color 0.15s, background 0.15s;
    }

    .close-btn:hover {
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--primary-text-color);
    }

    .close-btn ha-icon {
      --mdc-icon-size: 20px;
    }

    /* Mode toggle */
    .mode-toggle {
      display: flex;
      margin: 0 20px 16px;
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 12px;
      padding: 3px;
      gap: 2px;
    }

    .mode-toggle button {
      flex: 1;
      padding: 9px 0;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--secondary-text-color, #888);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, box-shadow 0.15s;
    }

    .mode-toggle button:first-child {
      border-right: none;
    }

    .mode-toggle button.active {
      background: var(--card-background-color, white);
      color: var(--primary-text-color);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .mode-toggle button:not(.active):hover {
      color: var(--primary-text-color);
    }

    /* Content */
    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: 0 20px;
    }

    .floor-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .floor-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 10px;
      border-radius: 12px;
      cursor: pointer;
      user-select: none;
      transition: background 0.12s;
    }

    .floor-item:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .floor-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-color);
      cursor: pointer;
      flex-shrink: 0;
    }

    .floor-item-info {
      flex: 1;
      min-width: 0;
    }

    .floor-item-name {
      font-size: 14px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .floor-item-meta {
      font-size: 12px;
      color: var(--secondary-text-color, #999);
      margin-top: 3px;
    }

    .select-all {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      margin-bottom: 4px;
      font-size: 13px;
      color: var(--secondary-text-color, #888);
      cursor: pointer;
      user-select: none;
      border-radius: 10px;
      transition: background 0.12s;
    }

    .select-all:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .select-all input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-color);
      cursor: pointer;
    }

    /* File picker */
    .file-drop {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 36px 16px;
      border: 2px dashed var(--divider-color, #e0e0e0);
      border-radius: 14px;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }

    .file-drop:hover {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.04);
    }

    .file-drop ha-icon {
      --mdc-icon-size: 36px;
      color: var(--secondary-text-color, #999);
    }

    .file-drop span {
      font-size: 14px;
      color: var(--secondary-text-color, #888);
    }

    /* Error */
    .error-msg {
      padding: 10px 14px;
      margin-bottom: 8px;
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.08);
      color: var(--error-color, #f44336);
      border-radius: 10px;
      font-size: 13px;
    }

    /* Footer */
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 20px;
      border-top: 1px solid var(--divider-color, #e8e8e8);
    }

    .dialog-footer button {
      padding: 10px 22px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }

    .dialog-footer button:active:not(:disabled) {
      transform: scale(0.97);
    }

    .dialog-footer button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: transparent;
      color: var(--primary-text-color);
    }

    .btn-cancel:hover:not(:disabled) {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .btn-primary {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
    }

    .empty-msg {
      text-align: center;
      color: var(--secondary-text-color, #999);
      padding: 32px 0;
      font-size: 14px;
    }
  `;

  show(mode?: DialogMode): void {
    this._mode = mode || "export";
    this._error = null;
    this._importEntries = [];
    this._importData = [];
    this._importing = false;
    this._exporting = false;

    // Initialize export selection with all floors
    const fp = currentFloorPlan.value;
    if (fp) {
      this._exportSelection = new Set(fp.floors.map((f) => f.id));
    }

    this.open = true;
  }

  close(): void {
    this.open = false;
  }

  private _setMode(mode: DialogMode): void {
    this._mode = mode;
    this._error = null;
  }

  /* ---------- Export ---------- */

  private _toggleExportFloor(floorId: string): void {
    const next = new Set(this._exportSelection);
    if (next.has(floorId)) {
      next.delete(floorId);
    } else {
      next.add(floorId);
    }
    this._exportSelection = next;
  }

  private _toggleExportAll(): void {
    const fp = currentFloorPlan.value;
    if (!fp) return;

    if (this._exportSelection.size === fp.floors.length) {
      this._exportSelection = new Set();
    } else {
      this._exportSelection = new Set(fp.floors.map((f) => f.id));
    }
  }

  private async _doExport(): Promise<void> {
    if (!this.hass) return;
    const fp = currentFloorPlan.value;
    if (!fp || this._exportSelection.size === 0) return;

    this._exporting = true;
    this._error = null;

    try {
      const floors: Record<string, unknown>[] = [];
      for (const floorId of this._exportSelection) {
        const result = await this.hass.callWS<Record<string, unknown>>({
          type: "inhabit/floors/export",
          floor_plan_id: fp.id,
          floor_id: floorId,
        });
        floors.push(result);
      }

      // Wrap in multi-floor envelope
      const envelope =
        floors.length === 1
          ? floors[0]
          : {
              inhabit_version: "1.0",
              export_type: "floors",
              exported_at: new Date().toISOString(),
              floors,
            };

      const json = JSON.stringify(envelope, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const safeName = fp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const suffix =
        floors.length === 1
          ? (((floors[0] as Record<string, unknown>).floor as Record<string, unknown> | undefined)?.name as string || "floor")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
          : "floors";
      a.download = `inhabit-${safeName}-${suffix}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.close();
    } catch (err: any) {
      console.error("Export error:", err);
      this._error = `Export failed: ${err?.message || err}`;
    } finally {
      this._exporting = false;
    }
  }

  /* ---------- Import ---------- */

  private _pickFile(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        this._parseImportFile(data);
      } catch {
        this._error = "Could not read file. Make sure it's a valid Inhabit JSON export.";
      }
    });

    input.click();
  }

  private _parseImportFile(data: unknown): void {
    this._error = null;

    if (!data || typeof data !== "object") {
      this._error = "Invalid file format.";
      return;
    }

    const obj = data as Record<string, unknown>;

    // Multi-floor export
    if (obj.export_type === "floors" && Array.isArray(obj.floors)) {
      const floorExports = obj.floors as Record<string, unknown>[];
      this._importData = floorExports;
      this._importEntries = floorExports.map((fe, i) => {
        const floor = fe.floor as Record<string, unknown> | undefined;
        const devices = fe.devices as unknown[] | undefined;
        return {
          index: i,
          name: (floor?.name as string) || `Floor ${i + 1}`,
          level: (floor?.level as number) ?? i,
          roomCount: Array.isArray(floor?.rooms) ? (floor!.rooms as unknown[]).length : 0,
          wallCount: Array.isArray(floor?.edges) ? (floor!.edges as unknown[]).length
                   : Array.isArray(floor?.walls) ? (floor!.walls as unknown[]).length : 0,
          deviceCount: Array.isArray(devices) ? devices.length : 0,
          selected: true,
        };
      });
      return;
    }

    // Single-floor export
    if (obj.export_type === "floor") {
      this._importData = [obj];
      const floor = obj.floor as Record<string, unknown> | undefined;
      const devices = obj.devices as unknown[] | undefined;
      this._importEntries = [
        {
          index: 0,
          name: (floor?.name as string) || "Imported Floor",
          level: (floor?.level as number) ?? 0,
          roomCount: Array.isArray(floor?.rooms) ? (floor!.rooms as unknown[]).length : 0,
          wallCount: Array.isArray(floor?.edges) ? (floor!.edges as unknown[]).length
                   : Array.isArray(floor?.walls) ? (floor!.walls as unknown[]).length : 0,
          deviceCount: Array.isArray(devices) ? devices.length : 0,
          selected: true,
        },
      ];
      return;
    }

    this._error = "Invalid file: not an Inhabit floor export.";
  }

  private _toggleImportFloor(index: number): void {
    this._importEntries = this._importEntries.map((e) =>
      e.index === index ? { ...e, selected: !e.selected } : e
    );
  }

  private _toggleImportAll(): void {
    const allSelected = this._importEntries.every((e) => e.selected);
    this._importEntries = this._importEntries.map((e) => ({
      ...e,
      selected: !allSelected,
    }));
  }

  private async _doImport(): Promise<void> {
    if (!this.hass) return;
    const fp = currentFloorPlan.value;
    if (!fp) return;

    const selected = this._importEntries.filter((e) => e.selected);
    if (selected.length === 0) return;

    this._importing = true;
    this._error = null;

    try {
      let lastFloor: Floor | null = null;
      const newFloors: Floor[] = [];

      for (const entry of selected) {
        const data = this._importData[entry.index];
        const result = await this.hass.callWS<Floor>({
          type: "inhabit/floors/import",
          floor_plan_id: fp.id,
          data,
        });
        newFloors.push(result);
        lastFloor = result;
      }

      // Update local state
      const updatedFp = { ...fp, floors: [...fp.floors, ...newFloors] };
      this.dispatchEvent(
        new CustomEvent("floors-imported", {
          detail: { floorPlan: updatedFp, switchTo: lastFloor },
          bubbles: true,
          composed: true,
        })
      );

      this.close();
    } catch (err: any) {
      console.error("Import error:", err);
      this._error = `Import failed: ${err?.message || err}`;
    } finally {
      this._importing = false;
    }
  }

  /* ---------- Render ---------- */

  private _onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains("overlay")) {
      this.close();
    }
  }

  override render() {
    if (!this.open) return nothing;

    const fp = currentFloorPlan.value;
    const floors = fp?.floors || [];

    return html`
      <div class="overlay" @click=${this._onOverlayClick}>
        <div class="dialog">
          <div class="dialog-header">
            <h2>Import / Export</h2>
            <button class="close-btn" @click=${this.close} title="Close">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="mode-toggle">
            <button
              class=${this._mode === "export" ? "active" : ""}
              @click=${() => this._setMode("export")}
            >
              Export
            </button>
            <button
              class=${this._mode === "import" ? "active" : ""}
              @click=${() => this._setMode("import")}
            >
              Import
            </button>
          </div>

          ${this._error
            ? html`<div class="error-msg" style="margin: 0 16px 8px;">${this._error}</div>`
            : nothing}

          <div class="dialog-content">
            ${this._mode === "export"
              ? this._renderExport(floors)
              : this._renderImport()}
          </div>

          <div class="dialog-footer">
            <button class="btn-cancel" @click=${this.close}>Cancel</button>
            ${this._mode === "export"
              ? html`
                  <button
                    class="btn-primary"
                    ?disabled=${this._exportSelection.size === 0 ||
                    this._exporting}
                    @click=${this._doExport}
                  >
                    ${this._exporting ? "Exporting…" : "Export"}
                  </button>
                `
              : html`
                  <button
                    class="btn-primary"
                    ?disabled=${this._importEntries.filter((e) => e.selected)
                      .length === 0 || this._importing}
                    @click=${this._doImport}
                    style=${this._importEntries.length === 0
                      ? "display:none"
                      : ""}
                  >
                    ${this._importing ? "Importing…" : "Import"}
                  </button>
                `}
          </div>
        </div>
      </div>
    `;
  }

  private _renderExport(floors: Floor[]) {
    if (floors.length === 0) {
      return html`<div class="empty-msg">No floors to export.</div>`;
    }

    const allSelected = this._exportSelection.size === floors.length;

    return html`
      <label class="select-all" @click=${this._toggleExportAll}>
        <input
          type="checkbox"
          .checked=${allSelected}
          @click=${(e: Event) => e.stopPropagation()}
          @change=${this._toggleExportAll}
        />
        Select all
      </label>
      <div class="floor-list">
        ${floors.map(
          (f) => html`
            <label class="floor-item" @click=${() => this._toggleExportFloor(f.id)}>
              <input
                type="checkbox"
                .checked=${this._exportSelection.has(f.id)}
                @click=${(e: Event) => e.stopPropagation()}
                @change=${() => this._toggleExportFloor(f.id)}
              />
              <div class="floor-item-info">
                <div class="floor-item-name">${f.name}</div>
                <div class="floor-item-meta">
                  ${f.rooms.length} room${f.rooms.length !== 1 ? "s" : ""},
                  ${f.edges.length} edge${f.edges.length !== 1 ? "s" : ""}
                </div>
              </div>
            </label>
          `
        )}
      </div>
    `;
  }

  private _renderImport() {
    if (this._importEntries.length === 0) {
      return html`
        <div class="file-drop" @click=${this._pickFile}>
          <ha-icon icon="mdi:file-upload-outline"></ha-icon>
          <span>Choose an Inhabit JSON file</span>
        </div>
      `;
    }

    const allSelected = this._importEntries.every((e) => e.selected);

    return html`
      <label class="select-all" @click=${this._toggleImportAll}>
        <input
          type="checkbox"
          .checked=${allSelected}
          @click=${(e: Event) => e.stopPropagation()}
          @change=${this._toggleImportAll}
        />
        Select all
      </label>
      <div class="floor-list">
        ${this._importEntries.map(
          (entry) => html`
            <label class="floor-item" @click=${() => this._toggleImportFloor(entry.index)}>
              <input
                type="checkbox"
                .checked=${entry.selected}
                @click=${(e: Event) => e.stopPropagation()}
                @change=${() => this._toggleImportFloor(entry.index)}
              />
              <div class="floor-item-info">
                <div class="floor-item-name">${entry.name}</div>
                <div class="floor-item-meta">
                  ${entry.roomCount} room${entry.roomCount !== 1 ? "s" : ""},
                  ${entry.wallCount} wall${entry.wallCount !== 1 ? "s" : ""}${entry.deviceCount > 0 ? `, ${entry.deviceCount} device${entry.deviceCount !== 1 ? "s" : ""}` : ""}
                </div>
              </div>
            </label>
          `
        )}
      </div>
    `;
  }
}

if (!customElements.get("fpb-import-export-dialog")) {
  customElements.define("fpb-import-export-dialog", FpbImportExportDialog);
}

declare global {
  interface HTMLElementTagNameMap {
    "fpb-import-export-dialog": FpbImportExportDialog;
  }
}
