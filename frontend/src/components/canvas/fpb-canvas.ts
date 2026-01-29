/**
 * SVG Canvas Component with pan/zoom and layers
 */

import { LitElement, html, css, svg, PropertyValues } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { effect } from "@preact/signals-core";
import type { HomeAssistant, Coordinates, ViewBox } from "../../types";
import {
  currentFloor,
  viewBox,
  gridSize,
  showGrid,
  snapToGrid,
  layers,
  activeTool,
  selection,
  devicePlacements,
} from "../../ha-floorplan-builder";
import { polygonToPath, wallPath, viewBoxToString } from "../../utils/svg";
import { snapToGrid as snapPoint } from "../../utils/geometry";

@customElement("fpb-canvas")
export class FpbCanvas extends LitElement {
  @property({ attribute: false })
  hass?: HomeAssistant;

  @query("svg")
  private _svg?: SVGSVGElement;

  @state()
  private _viewBox: ViewBox = { x: 0, y: 0, width: 1000, height: 800 };

  @state()
  private _isPanning = false;

  @state()
  private _panStart: Coordinates = { x: 0, y: 0 };

  @state()
  private _cursorPos: Coordinates = { x: 0, y: 0 };

  @state()
  private _drawingPoints: Coordinates[] = [];

  private _cleanupEffects: (() => void)[] = [];

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--card-background-color, #fff);
    }

    svg {
      width: 100%;
      height: 100%;
      cursor: crosshair;
    }

    svg.panning {
      cursor: grabbing;
    }

    svg.select-tool {
      cursor: default;
    }

    .grid-layer {
      pointer-events: none;
    }

    .room {
      cursor: pointer;
      transition: fill 0.2s ease;
    }

    .room:hover {
      fill-opacity: 0.8;
    }

    .room.selected {
      stroke: var(--primary-color, #03a9f4);
      stroke-width: 3;
      stroke-dasharray: 5,5;
    }

    .wall {
      fill: var(--primary-text-color, #333);
      stroke: none;
    }

    .wall.exterior {
      fill: #1a1a1a;
    }

    .door {
      fill: var(--card-background-color, #fff);
      stroke: var(--primary-text-color, #333);
      stroke-width: 1;
    }

    .door-swing {
      fill: none;
      stroke: var(--secondary-text-color, #666);
      stroke-width: 1;
      stroke-dasharray: 3,3;
    }

    .window {
      fill: #b3e5fc;
      stroke: var(--primary-text-color, #333);
      stroke-width: 1;
    }

    .device-marker {
      cursor: pointer;
    }

    .device-marker circle {
      transition: r 0.2s ease;
    }

    .device-marker:hover circle {
      r: 14;
    }

    .device-marker.on circle {
      fill: var(--state-light-active-color, #ffd600);
    }

    .device-marker.off circle {
      fill: var(--disabled-text-color, #bdbdbd);
    }

    .coverage-zone {
      pointer-events: none;
      opacity: 0.3;
    }

    .coverage-zone.motion {
      fill: #4caf50;
    }

    .coverage-zone.presence {
      fill: #2196f3;
    }

    .room-label {
      pointer-events: none;
      font-size: 14px;
      font-weight: 500;
      fill: var(--primary-text-color, #333);
      text-anchor: middle;
      dominant-baseline: middle;
    }

    .drawing-preview {
      fill: rgba(33, 150, 243, 0.2);
      stroke: var(--primary-color, #2196f3);
      stroke-width: 2;
      stroke-dasharray: 5,5;
      pointer-events: none;
    }

    .crosshair {
      stroke: var(--secondary-text-color, #666);
      stroke-width: 1;
      pointer-events: none;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();

    // Subscribe to signal changes
    this._cleanupEffects.push(
      effect(() => {
        this._viewBox = viewBox.value;
      })
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cleanupEffects.forEach((cleanup) => cleanup());
    this._cleanupEffects = [];
  }

  private _handleWheel(e: WheelEvent): void {
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const point = this._screenToSvg({ x: e.clientX, y: e.clientY });

    const newWidth = this._viewBox.width * zoomFactor;
    const newHeight = this._viewBox.height * zoomFactor;

    // Limit zoom
    if (newWidth < 100 || newWidth > 10000) return;

    // Zoom toward cursor position
    const newX = point.x - (point.x - this._viewBox.x) * zoomFactor;
    const newY = point.y - (point.y - this._viewBox.y) * zoomFactor;

    const newViewBox = {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };

    viewBox.value = newViewBox;
    this._viewBox = newViewBox;
  }

  private _handlePointerDown(e: PointerEvent): void {
    const point = this._screenToSvg({ x: e.clientX, y: e.clientY });
    const snappedPoint = snapToGrid.value ? snapPoint(point, gridSize.value) : point;

    // Middle button or space+click for pan
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      this._isPanning = true;
      this._panStart = { x: e.clientX, y: e.clientY };
      this._svg?.setPointerCapture(e.pointerId);
      return;
    }

    // Handle tool-specific actions
    const tool = activeTool.value;

    if (tool === "select") {
      this._handleSelectClick(point);
    } else if (tool === "room" || tool === "polygon") {
      this._handlePolygonClick(snappedPoint);
    } else if (tool === "wall") {
      this._handleWallClick(snappedPoint);
    }
  }

  private _handlePointerMove(e: PointerEvent): void {
    const point = this._screenToSvg({ x: e.clientX, y: e.clientY });
    const snappedPoint = snapToGrid.value ? snapPoint(point, gridSize.value) : point;
    this._cursorPos = snappedPoint;

    if (this._isPanning) {
      const dx = (e.clientX - this._panStart.x) * (this._viewBox.width / this._svg!.clientWidth);
      const dy = (e.clientY - this._panStart.y) * (this._viewBox.height / this._svg!.clientHeight);

      const newViewBox = {
        ...this._viewBox,
        x: this._viewBox.x - dx,
        y: this._viewBox.y - dy,
      };

      this._panStart = { x: e.clientX, y: e.clientY };
      viewBox.value = newViewBox;
      this._viewBox = newViewBox;
    }
  }

  private _handlePointerUp(e: PointerEvent): void {
    if (this._isPanning) {
      this._isPanning = false;
      this._svg?.releasePointerCapture(e.pointerId);
    }
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this._drawingPoints = [];
      selection.value = { type: "none", ids: [] };
    } else if (e.key === "Enter" && this._drawingPoints.length >= 3) {
      this._completePolygon();
    }
  }

  private _handleSelectClick(point: Coordinates): void {
    const floor = currentFloor.value;
    if (!floor) return;

    // Check if clicked on a room
    for (const room of floor.rooms) {
      if (this._pointInPolygon(point, room.polygon.vertices)) {
        selection.value = { type: "room", ids: [room.id] };
        return;
      }
    }

    // Check if clicked on a device
    const devices = devicePlacements.value.filter((d) => d.floor_id === floor.id);
    for (const device of devices) {
      const dist = Math.sqrt(
        Math.pow(point.x - device.position.x, 2) +
        Math.pow(point.y - device.position.y, 2)
      );
      if (dist < 15) {
        selection.value = { type: "device", ids: [device.id] };
        return;
      }
    }

    // Clear selection
    selection.value = { type: "none", ids: [] };
  }

  private _handlePolygonClick(point: Coordinates): void {
    // Check if closing the polygon
    if (this._drawingPoints.length >= 3) {
      const firstPoint = this._drawingPoints[0];
      const dist = Math.sqrt(
        Math.pow(point.x - firstPoint.x, 2) +
        Math.pow(point.y - firstPoint.y, 2)
      );
      if (dist < 15) {
        this._completePolygon();
        return;
      }
    }

    this._drawingPoints = [...this._drawingPoints, point];
  }

  private _handleWallClick(point: Coordinates): void {
    if (this._drawingPoints.length === 0) {
      this._drawingPoints = [point];
    } else {
      // Complete wall
      this._completeWall(this._drawingPoints[0], point);
      this._drawingPoints = [];
    }
  }

  private async _completePolygon(): Promise<void> {
    if (!this.hass || this._drawingPoints.length < 3) return;

    const floor = currentFloor.value;
    const floorPlan = (await import("../../ha-floorplan-builder")).currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const roomName = prompt("Enter room name:");
    if (!roomName) {
      this._drawingPoints = [];
      return;
    }

    try {
      await this.hass.callWS({
        type: "inhabit/rooms/add",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        name: roomName,
        polygon: { vertices: this._drawingPoints },
        color: this._getRandomRoomColor(),
      });

      this._drawingPoints = [];
      // Reload floor plan
      window.location.reload(); // Simple approach - would use signals in production
    } catch (err) {
      console.error("Error creating room:", err);
      alert(`Failed to create room: ${err}`);
    }
  }

  private async _completeWall(start: Coordinates, end: Coordinates): Promise<void> {
    if (!this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = (await import("../../ha-floorplan-builder")).currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    try {
      await this.hass.callWS({
        type: "inhabit/walls/add",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        start,
        end,
        thickness: 10,
      });
    } catch (err) {
      console.error("Error creating wall:", err);
    }
  }

  private _screenToSvg(screenPoint: Coordinates): Coordinates {
    if (!this._svg) return screenPoint;

    const rect = this._svg.getBoundingClientRect();
    const scaleX = this._viewBox.width / rect.width;
    const scaleY = this._viewBox.height / rect.height;

    return {
      x: this._viewBox.x + (screenPoint.x - rect.left) * scaleX,
      y: this._viewBox.y + (screenPoint.y - rect.top) * scaleY,
    };
  }

  private _pointInPolygon(point: Coordinates, vertices: Coordinates[]): boolean {
    if (vertices.length < 3) return false;

    let inside = false;
    const n = vertices.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const vi = vertices[i];
      const vj = vertices[j];

      if (
        vi.y > point.y !== vj.y > point.y &&
        point.x < ((vj.x - vi.x) * (point.y - vi.y)) / (vj.y - vi.y) + vi.x
      ) {
        inside = !inside;
      }
    }

    return inside;
  }

  private _getRandomRoomColor(): string {
    const colors = [
      "#e8e8e8", "#fce4ec", "#e8f5e9", "#e3f2fd",
      "#fff3e0", "#f3e5f5", "#e0f7fa", "#fff8e1",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private _renderGrid() {
    if (!showGrid.value) return null;

    const gs = gridSize.value;
    const majorGs = gs * 10;

    return svg`
      <defs>
        <pattern id="minor-grid" width="${gs}" height="${gs}" patternUnits="userSpaceOnUse">
          <path d="M ${gs} 0 L 0 0 0 ${gs}" fill="none" stroke="#f0f0f0" stroke-width="0.5"/>
        </pattern>
        <pattern id="major-grid" width="${majorGs}" height="${majorGs}" patternUnits="userSpaceOnUse">
          <rect width="${majorGs}" height="${majorGs}" fill="url(#minor-grid)"/>
          <path d="M ${majorGs} 0 L 0 0 0 ${majorGs}" fill="none" stroke="#d0d0d0" stroke-width="1"/>
        </pattern>
      </defs>
      <rect class="grid-layer" x="${this._viewBox.x}" y="${this._viewBox.y}"
            width="${this._viewBox.width}" height="${this._viewBox.height}"
            fill="url(#major-grid)"/>
    `;
  }

  private _renderFloor() {
    const floor = currentFloor.value;
    if (!floor) return null;

    const sel = selection.value;
    const layerConfig = layers.value;

    return svg`
      <!-- Background layer -->
      ${layerConfig.find(l => l.id === "background")?.visible && floor.background_image ? svg`
        <image href="${floor.background_image}"
               x="0" y="0"
               width="${1000 * floor.background_scale}"
               height="${800 * floor.background_scale}"
               opacity="${layerConfig.find(l => l.id === "background")?.opacity ?? 1}"/>
      ` : null}

      <!-- Structure layer (walls, doors, windows) -->
      ${layerConfig.find(l => l.id === "structure")?.visible ? svg`
        <g class="structure-layer" opacity="${layerConfig.find(l => l.id === "structure")?.opacity ?? 1}">
          <!-- Rooms -->
          ${floor.rooms.map(room => svg`
            <path class="room ${sel.type === "room" && sel.ids.includes(room.id) ? "selected" : ""}"
                  d="${polygonToPath(room.polygon)}"
                  fill="${room.color}"
                  stroke="#999"
                  stroke-width="1"/>
          `)}

          <!-- Walls -->
          ${floor.walls.map(wall => svg`
            <path class="wall ${wall.is_exterior ? "exterior" : ""}"
                  d="${wallPath(wall.start, wall.end, wall.thickness)}"/>
          `)}

          <!-- Doors -->
          ${floor.doors.map(door => {
            const wall = floor.walls.find(w => w.id === door.wall_id);
            if (!wall) return null;
            const pos = door.position;
            const x = wall.start.x + (wall.end.x - wall.start.x) * pos;
            const y = wall.start.y + (wall.end.y - wall.start.y) * pos;
            return svg`
              <rect class="door" x="${x - door.width/2}" y="${y - 5}"
                    width="${door.width}" height="10"/>
            `;
          })}

          <!-- Windows -->
          ${floor.windows.map(window => {
            const wall = floor.walls.find(w => w.id === window.wall_id);
            if (!wall) return null;
            const pos = window.position;
            const x = wall.start.x + (wall.end.x - wall.start.x) * pos;
            const y = wall.start.y + (wall.end.y - wall.start.y) * pos;
            return svg`
              <rect class="window" x="${x - window.width/2}" y="${y - 3}"
                    width="${window.width}" height="6"/>
            `;
          })}
        </g>
      ` : null}

      <!-- Labels layer -->
      ${layerConfig.find(l => l.id === "labels")?.visible ? svg`
        <g class="labels-layer" opacity="${layerConfig.find(l => l.id === "labels")?.opacity ?? 1}">
          ${floor.rooms.map(room => {
            const bbox = this._getPolygonCenter(room.polygon.vertices);
            if (!bbox) return null;
            return svg`
              <text class="room-label" x="${bbox.x}" y="${bbox.y}">${room.name}</text>
            `;
          })}
        </g>
      ` : null}

      <!-- Devices layer -->
      ${layerConfig.find(l => l.id === "devices")?.visible ? svg`
        <g class="devices-layer" opacity="${layerConfig.find(l => l.id === "devices")?.opacity ?? 1}">
          ${devicePlacements.value
            .filter(d => d.floor_id === floor.id)
            .map(device => this._renderDevice(device))}
        </g>
      ` : null}
    `;
  }

  private _renderDevice(device: import("../../types").DevicePlacement) {
    const state = this.hass?.states[device.entity_id];
    const isOn = state?.state === "on";
    const sel = selection.value;

    return svg`
      <g class="device-marker ${isOn ? "on" : "off"} ${sel.type === "device" && sel.ids.includes(device.id) ? "selected" : ""}"
         transform="translate(${device.position.x}, ${device.position.y}) rotate(${device.rotation})">
        <circle r="12" fill="${isOn ? "#ffd600" : "#bdbdbd"}" stroke="#333" stroke-width="2"/>
        ${device.show_label ? svg`
          <text y="24" text-anchor="middle" font-size="10" fill="#333">
            ${device.label || state?.attributes.friendly_name || device.entity_id}
          </text>
        ` : null}
      </g>
    `;
  }

  private _renderDrawingPreview() {
    if (this._drawingPoints.length === 0) return null;

    const tool = activeTool.value;

    if (tool === "room" || tool === "polygon") {
      const points = [...this._drawingPoints, this._cursorPos];
      const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

      return svg`
        <path class="drawing-preview" d="${pathData} Z"/>
        ${this._drawingPoints.map(p => svg`
          <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--primary-color)" stroke="white" stroke-width="2"/>
        `)}
      `;
    }

    if (tool === "wall" && this._drawingPoints.length === 1) {
      const start = this._drawingPoints[0];
      return svg`
        <line class="drawing-preview" x1="${start.x}" y1="${start.y}"
              x2="${this._cursorPos.x}" y2="${this._cursorPos.y}"
              stroke="var(--primary-color)" stroke-width="3"/>
      `;
    }

    return null;
  }

  private _getPolygonCenter(vertices: Coordinates[]): Coordinates | null {
    if (vertices.length === 0) return null;

    let cx = 0;
    let cy = 0;
    for (const v of vertices) {
      cx += v.x;
      cy += v.y;
    }

    return {
      x: cx / vertices.length,
      y: cy / vertices.length,
    };
  }

  override render() {
    return html`
      <svg
        class="${this._isPanning ? "panning" : ""} ${activeTool.value === "select" ? "select-tool" : ""}"
        viewBox="${viewBoxToString(this._viewBox)}"
        @wheel=${this._handleWheel}
        @pointerdown=${this._handlePointerDown}
        @pointermove=${this._handlePointerMove}
        @pointerup=${this._handlePointerUp}
        @keydown=${this._handleKeyDown}
        tabindex="0"
      >
        ${this._renderGrid()}
        ${this._renderFloor()}
        ${this._renderDrawingPreview()}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "fpb-canvas": FpbCanvas;
  }
}
