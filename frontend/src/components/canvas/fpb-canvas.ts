/**
 * SVG Canvas Component with pan/zoom and wall-based room creation
 */

import { LitElement, html, css, svg } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { effect } from "@preact/signals-core";
import type { HomeAssistant, Coordinates, ViewBox, Floor, Wall } from "../../types";
import {
  currentFloor,
  currentFloorPlan,
  viewBox,
  gridSize,
  snapToGrid,
  layers,
  activeTool,
  selection,
  devicePlacements,
} from "../../ha-floorplan-builder";
import { polygonToPath, wallPath, viewBoxToString } from "../../utils/svg";
import { snapToGrid as snapPoint } from "../../utils/geometry";

interface WallSegment {
  start: Coordinates;
  end: Coordinates;
  id?: string;
}

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

  @state()
  private _wallStartPoint: Coordinates | null = null;

  @state()
  private _haAreas: Array<{ area_id: string; name: string }> = [];

  @state()
  private _hoveredEndpoint: { wallId: string; point: "start" | "end"; coords: Coordinates } | null = null;

  private _cleanupEffects: (() => void)[] = [];

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--card-background-color, #f5f5f5);
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
      fill: var(--primary-text-color, #1a1a1a);
    }

    .door {
      fill: var(--card-background-color, #fff);
      stroke: var(--primary-text-color, #333);
      stroke-width: 1;
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

    .room-label {
      pointer-events: none;
      font-size: 14px;
      font-weight: 500;
      fill: var(--primary-text-color, #333);
      text-anchor: middle;
      dominant-baseline: middle;
    }

    .drawing-preview {
      pointer-events: none;
    }

    .wall-preview {
      stroke: var(--primary-color, #2196f3);
      stroke-width: 8;
      stroke-linecap: round;
    }

    .wall-length-label {
      font-size: 12px;
      font-weight: 500;
      fill: var(--primary-color, #2196f3);
      text-anchor: middle;
      dominant-baseline: middle;
      pointer-events: none;
    }

    .wall-length-bg {
      fill: var(--card-background-color, white);
      opacity: 0.95;
    }

    .snap-indicator {
      fill: var(--primary-color, #2196f3);
      stroke: white;
      stroke-width: 2;
    }

    .closed-shape-preview {
      fill: rgba(76, 175, 80, 0.3);
      stroke: #4caf50;
      stroke-width: 2;
      stroke-dasharray: 5,5;
    }

    .wall-endpoint {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .wall-endpoint circle {
      fill: var(--card-background-color, white);
      stroke: var(--divider-color, #666);
      stroke-width: 2;
    }

    .wall-endpoint:hover circle {
      fill: var(--primary-color, #2196f3);
      stroke: var(--primary-color, #2196f3);
      r: 10;
    }

    .wall-endpoint text {
      fill: var(--secondary-text-color, #666);
      font-size: 16px;
      font-weight: bold;
      pointer-events: none;
    }

    .wall-endpoint:hover text {
      fill: var(--text-primary-color, white);
    }

    .extend-button {
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .extend-button:hover .extend-bg {
      fill: var(--primary-color, #2196f3);
    }

    .extend-button:hover .extend-icon {
      fill: var(--text-primary-color, white);
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();

    this._cleanupEffects.push(
      effect(() => {
        this._viewBox = viewBox.value;
      })
    );

    this._loadHaAreas();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cleanupEffects.forEach((cleanup) => cleanup());
    this._cleanupEffects = [];
  }

  private async _loadHaAreas(): Promise<void> {
    if (!this.hass) return;
    try {
      const areas = await this.hass.callWS<Array<{ area_id: string; name: string }>>({
        type: "config/area_registry/list",
      });
      this._haAreas = areas;
    } catch (err) {
      console.error("Error loading HA areas:", err);
    }
  }

  private _handleWheel(e: WheelEvent): void {
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const point = this._screenToSvg({ x: e.clientX, y: e.clientY });

    const newWidth = this._viewBox.width * zoomFactor;
    const newHeight = this._viewBox.height * zoomFactor;

    if (newWidth < 100 || newWidth > 10000) return;

    const newX = point.x - (point.x - this._viewBox.x) * zoomFactor;
    const newY = point.y - (point.y - this._viewBox.y) * zoomFactor;

    const newViewBox = { x: newX, y: newY, width: newWidth, height: newHeight };
    viewBox.value = newViewBox;
    this._viewBox = newViewBox;
  }

  private _handlePointerDown(e: PointerEvent): void {
    const point = this._screenToSvg({ x: e.clientX, y: e.clientY });
    const snappedPoint = this._getSnappedPoint(point);

    // Middle button or shift+click for pan
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      this._isPanning = true;
      this._panStart = { x: e.clientX, y: e.clientY };
      this._svg?.setPointerCapture(e.pointerId);
      return;
    }

    const tool = activeTool.value;

    if (tool === "select") {
      this._handleSelectClick(point);
    } else if (tool === "wall") {
      this._handleWallClick(snappedPoint);
    } else if (tool === "room" || tool === "polygon") {
      this._handlePolygonClick(snappedPoint);
    }
  }

  private _handlePointerMove(e: PointerEvent): void {
    const point = this._screenToSvg({ x: e.clientX, y: e.clientY });
    this._cursorPos = this._getSnappedPoint(point);

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
      return;
    }

    // Check for hovering over wall endpoints (only when not drawing)
    if (!this._wallStartPoint && activeTool.value === "select") {
      this._checkEndpointHover(point);
    }
  }

  private _checkEndpointHover(point: Coordinates): void {
    const floor = currentFloor.value;
    if (!floor) {
      this._hoveredEndpoint = null;
      return;
    }

    const hoverDistance = 20;

    for (const wall of floor.walls) {
      // Check start point
      const distStart = Math.sqrt(
        Math.pow(point.x - wall.start.x, 2) + Math.pow(point.y - wall.start.y, 2)
      );
      if (distStart < hoverDistance) {
        this._hoveredEndpoint = { wallId: wall.id, point: "start", coords: wall.start };
        return;
      }

      // Check end point
      const distEnd = Math.sqrt(
        Math.pow(point.x - wall.end.x, 2) + Math.pow(point.y - wall.end.y, 2)
      );
      if (distEnd < hoverDistance) {
        this._hoveredEndpoint = { wallId: wall.id, point: "end", coords: wall.end };
        return;
      }
    }

    this._hoveredEndpoint = null;
  }

  private _handlePointerUp(e: PointerEvent): void {
    if (this._isPanning) {
      this._isPanning = false;
      this._svg?.releasePointerCapture(e.pointerId);
    }
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this._wallStartPoint = null;
      this._drawingPoints = [];
      this._hoveredEndpoint = null;
      selection.value = { type: "none", ids: [] };
    }
  }

  private _handleExtendWall(endpoint: Coordinates): void {
    // Start drawing a new wall from this endpoint
    this._wallStartPoint = endpoint;
    this._hoveredEndpoint = null;
    activeTool.value = "wall";
  }

  private _getSnappedPoint(point: Coordinates): Coordinates {
    const floor = currentFloor.value;
    if (!floor) return snapToGrid.value ? snapPoint(point, gridSize.value) : point;

    // Snap to existing wall endpoints
    const snapDistance = 15;
    for (const wall of floor.walls) {
      for (const endpoint of [wall.start, wall.end]) {
        const dist = Math.sqrt(
          Math.pow(point.x - endpoint.x, 2) + Math.pow(point.y - endpoint.y, 2)
        );
        if (dist < snapDistance) {
          return endpoint;
        }
      }
    }

    return snapToGrid.value ? snapPoint(point, gridSize.value) : point;
  }

  private _handleSelectClick(point: Coordinates): void {
    const floor = currentFloor.value;
    if (!floor) return;

    // Check rooms
    for (const room of floor.rooms) {
      if (this._pointInPolygon(point, room.polygon.vertices)) {
        selection.value = { type: "room", ids: [room.id] };
        return;
      }
    }

    // Check devices
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

    selection.value = { type: "none", ids: [] };
  }

  private _handleWallClick(point: Coordinates): void {
    if (!this._wallStartPoint) {
      this._wallStartPoint = point;
    } else {
      this._completeWall(this._wallStartPoint, point);
      // Check for closed shape after adding wall
      this._checkForClosedShape(point);
      // Start new wall from this point for continuous drawing
      this._wallStartPoint = point;
    }
  }

  private _handlePolygonClick(point: Coordinates): void {
    if (this._drawingPoints.length >= 3) {
      const firstPoint = this._drawingPoints[0];
      const dist = Math.sqrt(
        Math.pow(point.x - firstPoint.x, 2) + Math.pow(point.y - firstPoint.y, 2)
      );
      if (dist < 15) {
        this._completePolygon();
        return;
      }
    }
    this._drawingPoints = [...this._drawingPoints, point];
  }

  private async _completeWall(start: Coordinates, end: Coordinates): Promise<void> {
    if (!this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    try {
      await this.hass.callWS({
        type: "inhabit/walls/add",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        start,
        end,
        thickness: 8,
      });
      // Reload to get updated floor
      window.location.reload();
    } catch (err) {
      console.error("Error creating wall:", err);
    }
  }

  private _checkForClosedShape(lastPoint: Coordinates): void {
    const floor = currentFloor.value;
    if (!floor || floor.walls.length < 2) return;

    // Find closed polygon from walls
    const polygon = this._findClosedPolygon(floor.walls, lastPoint);
    if (polygon && polygon.length >= 3) {
      this._promptCreateRoom(polygon);
    }
  }

  private _findClosedPolygon(walls: Wall[], fromPoint: Coordinates): Coordinates[] | null {
    // Build adjacency from walls
    const visited = new Set<string>();
    const path: Coordinates[] = [fromPoint];

    const findPath = (current: Coordinates, target: Coordinates, depth: number): boolean => {
      if (depth > 20) return false; // Prevent infinite loops

      const key = `${current.x},${current.y}`;
      if (visited.has(key)) return false;
      visited.add(key);

      // Check if we're back at start
      if (path.length >= 3) {
        const dist = Math.sqrt(
          Math.pow(current.x - target.x, 2) + Math.pow(current.y - target.y, 2)
        );
        if (dist < 5) return true;
      }

      // Find connected walls
      for (const wall of walls) {
        let nextPoint: Coordinates | null = null;

        if (Math.abs(wall.start.x - current.x) < 5 && Math.abs(wall.start.y - current.y) < 5) {
          nextPoint = wall.end;
        } else if (Math.abs(wall.end.x - current.x) < 5 && Math.abs(wall.end.y - current.y) < 5) {
          nextPoint = wall.start;
        }

        if (nextPoint) {
          path.push(nextPoint);
          if (findPath(nextPoint, target, depth + 1)) return true;
          path.pop();
        }
      }

      return false;
    };

    // Try to find a closed path starting from any wall endpoint
    for (const wall of walls) {
      visited.clear();
      path.length = 0;
      path.push(wall.start);

      if (findPath(wall.start, wall.start, 0)) {
        return [...path];
      }
    }

    return null;
  }

  private async _promptCreateRoom(polygon: Coordinates[]): Promise<void> {
    if (!this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    // Show dialog to create room
    const roomName = prompt("Closed shape detected! Enter room name (or cancel to skip):");
    if (!roomName) return;

    // Ask to link to HA area
    let haAreaId: string | null = null;
    if (this._haAreas.length > 0) {
      const areaNames = this._haAreas.map((a) => a.name).join(", ");
      const areaInput = prompt(`Link to Home Assistant area? (${areaNames}) or leave empty:`);
      if (areaInput) {
        const area = this._haAreas.find(
          (a) => a.name.toLowerCase() === areaInput.toLowerCase()
        );
        if (area) haAreaId = area.area_id;
      }
    }

    try {
      await this.hass.callWS({
        type: "inhabit/rooms/add",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        name: roomName,
        polygon: { vertices: polygon },
        color: this._getRandomRoomColor(),
        ha_area_id: haAreaId,
      });
      window.location.reload();
    } catch (err) {
      console.error("Error creating room:", err);
      alert(`Failed to create room: ${err}`);
    }
  }

  private async _completePolygon(): Promise<void> {
    if (!this.hass || this._drawingPoints.length < 3) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const roomName = prompt("Enter room name:");
    if (!roomName) {
      this._drawingPoints = [];
      return;
    }

    // Ask to link to HA area
    let haAreaId: string | null = null;
    if (this._haAreas.length > 0) {
      const areaNames = this._haAreas.map((a) => a.name).join(", ");
      const areaInput = prompt(`Link to Home Assistant area? (${areaNames}) or leave empty:`);
      if (areaInput) {
        const area = this._haAreas.find(
          (a) => a.name.toLowerCase() === areaInput.toLowerCase()
        );
        if (area) haAreaId = area.area_id;
      }
    }

    try {
      await this.hass.callWS({
        type: "inhabit/rooms/add",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        name: roomName,
        polygon: { vertices: this._drawingPoints },
        color: this._getRandomRoomColor(),
        ha_area_id: haAreaId,
      });

      this._drawingPoints = [];
      window.location.reload();
    } catch (err) {
      console.error("Error creating room:", err);
      alert(`Failed to create room: ${err}`);
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
    // Colors that work in both light and dark themes (semi-transparent)
    const colors = [
      "rgba(156, 156, 156, 0.3)",  // gray
      "rgba(244, 143, 177, 0.3)",  // pink
      "rgba(129, 199, 132, 0.3)",  // green
      "rgba(100, 181, 246, 0.3)",  // blue
      "rgba(255, 183, 77, 0.3)",   // orange
      "rgba(186, 104, 200, 0.3)",  // purple
      "rgba(77, 208, 225, 0.3)",   // cyan
      "rgba(255, 213, 79, 0.3)",   // yellow
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private _calculateWallLength(start: Coordinates, end: Coordinates): number {
    return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  }

  private _formatLength(length: number): string {
    // Assuming units are in cm, show in meters if > 100cm
    if (length >= 100) {
      return `${(length / 100).toFixed(2)}m`;
    }
    return `${Math.round(length)}cm`;
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

      <!-- Structure layer -->
      ${layerConfig.find(l => l.id === "structure")?.visible ? svg`
        <g class="structure-layer" opacity="${layerConfig.find(l => l.id === "structure")?.opacity ?? 1}">
          <!-- Rooms -->
          ${floor.rooms.map(room => svg`
            <path class="room ${sel.type === "room" && sel.ids.includes(room.id) ? "selected" : ""}"
                  d="${polygonToPath(room.polygon)}"
                  fill="${room.color}"
                  stroke="var(--divider-color, #999)"
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
            const center = this._getPolygonCenter(room.polygon.vertices);
            if (!center) return null;
            return svg`
              <text class="room-label" x="${center.x}" y="${center.y}">
                ${room.name}${room.ha_area_id ? " 🏠" : ""}
              </text>
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

  private _renderWallEndpoints() {
    const floor = currentFloor.value;
    if (!floor || floor.walls.length === 0) return null;

    // Collect all unique endpoints
    const endpoints: Map<string, { coords: Coordinates; wallIds: string[] }> = new Map();

    for (const wall of floor.walls) {
      const startKey = `${wall.start.x},${wall.start.y}`;
      const endKey = `${wall.end.x},${wall.end.y}`;

      if (!endpoints.has(startKey)) {
        endpoints.set(startKey, { coords: wall.start, wallIds: [] });
      }
      endpoints.get(startKey)!.wallIds.push(wall.id);

      if (!endpoints.has(endKey)) {
        endpoints.set(endKey, { coords: wall.end, wallIds: [] });
      }
      endpoints.get(endKey)!.wallIds.push(wall.id);
    }

    // Only show extend buttons on endpoints with 1 connection (end of a wall chain)
    const extendableEndpoints = Array.from(endpoints.values()).filter(
      (ep) => ep.wallIds.length === 1
    );

    return svg`
      <g class="wall-endpoints-layer">
        ${extendableEndpoints.map((ep) => {
          const isHovered = this._hoveredEndpoint &&
            Math.abs(this._hoveredEndpoint.coords.x - ep.coords.x) < 1 &&
            Math.abs(this._hoveredEndpoint.coords.y - ep.coords.y) < 1;

          return svg`
            <g class="extend-button"
               transform="translate(${ep.coords.x}, ${ep.coords.y})"
               @click=${(e: Event) => {
                 e.stopPropagation();
                 this._handleExtendWall(ep.coords);
               }}>
              <circle class="extend-bg" r="${isHovered ? 12 : 8}" fill="var(--secondary-background-color, #f0f0f0)" stroke="var(--divider-color, #999)" stroke-width="2"/>
              <text class="extend-icon" text-anchor="middle" dominant-baseline="central" font-size="14" fill="var(--secondary-text-color, #666)">+</text>
            </g>
          `;
        })}
      </g>
    `;
  }

  private _renderDrawingPreview() {
    const tool = activeTool.value;

    // Wall drawing preview with length
    if (tool === "wall" && this._wallStartPoint) {
      const start = this._wallStartPoint;
      const end = this._cursorPos;
      const length = this._calculateWallLength(start, end);
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;

      // Calculate angle for label rotation
      const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
      const labelAngle = angle > 90 || angle < -90 ? angle + 180 : angle;

      return svg`
        <g class="drawing-preview">
          <!-- Wall line -->
          <line class="wall-preview"
                x1="${start.x}" y1="${start.y}"
                x2="${end.x}" y2="${end.y}"/>

          <!-- Start point indicator -->
          <circle class="snap-indicator" cx="${start.x}" cy="${start.y}" r="6"/>

          <!-- Length label -->
          <g transform="translate(${midX}, ${midY}) rotate(${labelAngle})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(length)}</text>
          </g>

          <!-- End point indicator -->
          <circle class="snap-indicator" cx="${end.x}" cy="${end.y}" r="4" opacity="0.5"/>
        </g>
      `;
    }

    // Room/polygon drawing preview
    if ((tool === "room" || tool === "polygon") && this._drawingPoints.length > 0) {
      const points = [...this._drawingPoints, this._cursorPos];
      const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

      return svg`
        <g class="drawing-preview">
          <path d="${pathData} Z" fill="rgba(33, 150, 243, 0.2)"
                stroke="var(--primary-color)" stroke-width="2" stroke-dasharray="5,5"/>
          ${this._drawingPoints.map(p => svg`
            <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--primary-color)" stroke="white" stroke-width="2"/>
          `)}
        </g>
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
        ${this._renderFloor()}
        ${this._renderWallEndpoints()}
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
