/**
 * SVG Canvas Component with pan/zoom and wall-based room creation
 */

import { LitElement, html, css, svg } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { effect } from "@preact/signals-core";
import type { HomeAssistant, Coordinates, ViewBox, Edge, Node, Room, WallDirection, CanvasMode, Floor, SelectionState, HassEntity, DevicePlacement } from "../../types";
import {
  currentFloor,
  currentFloorPlan,
  viewBox,
  gridSize,
  snapToGrid,
  layers,
  activeTool,
  canvasMode,
  selection,
  devicePlacements,
  reloadFloorData,
  constraintConflicts,
} from "../../ha-floorplan-builder";
import { polygonToPath, viewBoxToString, groupEdgesIntoChains, wallChainPath } from "../../utils/svg";
import { snapToGrid as snapPoint, arePointsCollinear } from "../../utils/geometry";
import { buildNodeGraph, solveNodeMove, solveEdgeLengthChange, solveConstraintSnap, previewNodeDrag, checkConstraintsFeasible, findDegenerateEdges, solveCollinearTotalLength } from "../../utils/wall-solver";
import { resolveFloorEdges, buildNodeMap, findNearestNode, edgesAtNode } from "../../utils/node-graph";
import { detectRoomsFromEdges } from "../../utils/room-detection";
import { pushAction, undo, redo } from "../../stores/history-store";

const LINK_COLORS = [
  "#e91e63", "#9c27b0", "#3f51b5", "#00bcd4",
  "#4caf50", "#ff9800", "#795548", "#607d8b",
  "#f44336", "#673ab7",
];
function linkGroupColor(group: string): string {
  let hash = 0;
  for (let i = 0; i < group.length; i++)
    hash = ((hash << 5) - hash) + group.charCodeAt(i);
  return LINK_COLORS[Math.abs(hash) % LINK_COLORS.length];
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
  private _wallStartPoint: Coordinates | null = null;

  /** First point of the current wall chain, used to detect loop closure. */
  private _wallChainStart: Coordinates | null = null;

  @state()
  private _roomEditor: { room: Room; editName: string; editColor: string; editAreaId: string | null } | null = null;

  @state()
  private _haAreas: Array<{ area_id: string; name: string }> = [];

  @state()
  private _hoveredNode: Node | null = null;

  @state()
  private _draggingNode: { node: Node; originalCoords: Coordinates; startX: number; startY: number; hasMoved: boolean } | null = null;

  @state()
  private _nodeEditor: { node: Node; editX: string; editY: string } | null = null;

  @state()
  private _edgeEditor: { edge: Edge; position: Coordinates; length: number } | null = null;

  @state()
  private _multiEdgeEditor: { edges: Edge[]; collinear?: boolean; totalLength?: number } | null = null;

  @state()
  private _editingTotalLength: string = "";

  @state()
  private _editingLength: string = "";

  @state()
  private _editingLengthLocked: boolean = false;

  @state()
  private _editingDirection: WallDirection = "free";

  @state()
  private _blinkingEdgeIds: string[] = [];

  private _blinkTimer: ReturnType<typeof setTimeout> | null = null;

  @state()
  private _pendingDevice: { position: Coordinates } | null = null;

  @state()
  private _entitySearch: string = "";

  @state()
  private _canvasMode: CanvasMode = "walls";

  private _cleanupEffects: (() => void)[] = [];

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--card-background-color, #f5f5f5);
      position: relative;
    }

    svg {
      width: 100%;
      height: 100%;
      cursor: crosshair;
      outline: none;
      user-select: none;
      -webkit-user-select: none;
    }

    svg:focus {
      outline: none;
    }

    svg.panning {
      cursor: grabbing;
    }

    svg.view-mode {
      cursor: grab;
    }

    svg.view-mode.panning {
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
      pointer-events: none;
    }

    .wall-selected-highlight {
      fill: var(--primary-color, #2196f3);
      stroke: none;
      pointer-events: none;
    }

    @keyframes wall-blink {
      0%, 100% { opacity: 0; }
      25%, 75% { opacity: 0.8; }
      50% { opacity: 1; }
    }

    .wall-blocked-blink {
      fill: var(--error-color, #f44336);
      stroke: none;
      pointer-events: none;
      animation: wall-blink 0.6s ease-in-out 3;
    }

    .wall-conflict-highlight {
      fill: none;
      stroke: #ff9800;
      stroke-width: 2;
      stroke-dasharray: 6,4;
      pointer-events: none;
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

    .room-label-group {
      pointer-events: none;
    }

    .room-label {
      font-size: 14px;
      font-weight: 500;
      fill: #000;
      text-anchor: middle;
      dominant-baseline: middle;
      stroke: white;
      stroke-width: 3px;
      paint-order: stroke fill;
    }

    .room-link-icon {
      opacity: 0.7;
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
      stroke: white;
      stroke-width: 3px;
      paint-order: stroke fill;
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
      fill: var(--primary-color, #2196f3);
      stroke: white;
      stroke-width: 2;
      cursor: pointer;
    }

    .wall-endpoint.dragging {
      cursor: grabbing;
    }

    .wall-endpoint.pinned rect {
      fill: var(--primary-color, #2196f3);
      stroke: white;
      stroke-width: 2;
    }

    .wall-endpoint.pinned {
      cursor: not-allowed;
    }

    .wall-original-ghost {
      fill: var(--secondary-text-color, #666);
      fill-opacity: 0.3;
      stroke: none;
      pointer-events: none;
    }

    .wall-preview-shape {
      fill: var(--primary-text-color, #333);
      stroke: none;
      pointer-events: none;
    }

    .wall-editor {
      position: absolute;
      bottom: 16px;
      right: 16px;
      width: 300px;
      background: var(--card-background-color, white);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .wall-editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--divider-color, #e8e8e8);
    }

    .wall-editor-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--primary-text-color, #333);
      letter-spacing: -0.01em;
    }

    .wall-editor-close {
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

    .wall-editor-close:hover {
      color: var(--primary-text-color, #333);
      background: var(--secondary-background-color, #f5f5f5);
    }

    .wall-editor-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .wall-editor-section-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--secondary-text-color, #999);
    }

    .wall-editor-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .wall-editor-label {
      font-size: 13px;
      color: var(--secondary-text-color, #888);
      min-width: 54px;
    }

    .wall-editor input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      font-size: 14px;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color, #333);
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .wall-editor input:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    .wall-editor input:disabled {
      opacity: 0.5;
    }

    .wall-editor-unit {
      font-size: 12px;
      color: var(--secondary-text-color, #999);
    }

    .wall-editor-constraints {
      display: flex;
      gap: 6px;
      flex: 1;
    }

    .wall-editor .constraint-btn {
      padding: 7px 12px;
      border: 1.5px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      background: transparent;
      color: var(--primary-text-color, #555);
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      --mdc-icon-size: 15px;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .wall-editor .constraint-btn:hover {
      border-color: var(--primary-color, #2196f3);
      color: var(--primary-color, #2196f3);
      background: rgba(33, 150, 243, 0.06);
    }

    .wall-editor .constraint-btn.active {
      background: var(--primary-color, #2196f3);
      color: white;
      border-color: var(--primary-color, #2196f3);
    }

    .wall-editor .constraint-btn.lock-btn {
      padding: 7px 8px;
    }

    .wall-editor-actions {
      display: flex;
      gap: 10px;
      padding-top: 12px;
      border-top: 1px solid var(--divider-color, #e8e8e8);
    }

    .wall-editor-actions button {
      flex: 1;
      padding: 10px 14px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      --mdc-icon-size: 16px;
      transition: opacity 0.15s, transform 0.1s;
    }

    .wall-editor-actions button:active {
      transform: scale(0.97);
    }

    .wall-editor .save-btn {
      background: var(--primary-color, #2196f3);
      color: white;
    }

    .wall-editor .save-btn:hover {
      opacity: 0.9;
    }

    .wall-editor .delete-btn {
      background: transparent;
      color: var(--error-color, #f44336);
      border: 1.5px solid var(--error-color, #f44336);
    }

    .wall-editor .delete-btn:hover {
      background: var(--error-color, #f44336);
      color: white;
    }

    .wall-editor-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      font-size: 14px;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color, #333);
      transition: border-color 0.15s;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23999' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 32px;
    }

    .wall-editor-select:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    .wall-editor-colors {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .color-swatch {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 2.5px solid transparent;
      cursor: pointer;
      padding: 0;
      transition: border-color 0.15s, transform 0.1s;
    }

    .color-swatch:hover {
      transform: scale(1.1);
    }

    .color-swatch.active {
      border-color: var(--primary-color, #2196f3);
    }

    .entity-picker {
      position: absolute;
      background: var(--card-background-color, white);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
      z-index: 100;
      width: 280px;
      max-height: 340px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .entity-picker input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 10px;
      font-size: 14px;
      background: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color, #333);
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .entity-picker input:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    .entity-list {
      overflow-y: auto;
      max-height: 240px;
    }

    .entity-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.12s;
    }

    .entity-item:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .entity-item ha-icon {
      --mdc-icon-size: 20px;
      color: var(--secondary-text-color, #999);
    }

    .entity-item.on ha-icon {
      color: var(--state-light-active-color, #ffd600);
    }

    .entity-item .name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entity-item .state {
      font-size: 11px;
      color: var(--secondary-text-color, #999);
      font-weight: 500;
    }

    .wall-annotation-text {
      font-size: 10px;
      fill: #000;
      text-anchor: middle;
      dominant-baseline: middle;
      pointer-events: none;
      stroke: white;
      stroke-width: 3px;
      paint-order: stroke fill;
    }

    .wall-annotation-icon {
      font-size: 9px;
      fill: var(--primary-color, #2196f3);
      text-anchor: middle;
      dominant-baseline: middle;
      pointer-events: none;
    }

    .device-preview {
      pointer-events: none;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();

    this._cleanupEffects.push(
      effect(() => {
        this._viewBox = viewBox.value;
      }),
      effect(() => {
        this._canvasMode = canvasMode.value;
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
    const tool = activeTool.value;
    const snappedPoint = this._getSnappedPoint(point, tool === "device" || tool === "wall");
    const mode = this._canvasMode;

    // Close entity picker if clicking outside (but not when in device mode placing a new one)
    if (this._pendingDevice && activeTool.value !== "device") {
      this._pendingDevice = null;
    }

    // Middle button always pans
    if (e.button === 1) {
      this._isPanning = true;
      this._panStart = { x: e.clientX, y: e.clientY };
      this._svg?.setPointerCapture(e.pointerId);
      return;
    }

    // Viewing mode: left-click always pans
    if (mode === "viewing" && e.button === 0) {
      this._isPanning = true;
      this._panStart = { x: e.clientX, y: e.clientY };
      this._svg?.setPointerCapture(e.pointerId);
      return;
    }

    // Left click behavior depends on tool
    if (e.button === 0) {
      if (tool === "select") {
        // Close edge editor first (will be reopened if clicking on an edge)
        const hadEditor = !!this._edgeEditor || !!this._multiEdgeEditor;
        this._edgeEditor = null;
        this._multiEdgeEditor = null;
        this._roomEditor = null;

        // Check if clicking on something selectable
        const clickedSomething = this._handleSelectClick(point, e.shiftKey);
        if (!clickedSomething) {
          // Clear selection if we had an editor open
          if (hadEditor) {
            selection.value = { type: "none", ids: [] };
          }
          // Start panning if clicking on empty space
          this._isPanning = true;
          this._panStart = { x: e.clientX, y: e.clientY };
          this._svg?.setPointerCapture(e.pointerId);
        }
      } else if (tool === "wall") {
        this._edgeEditor = null;
        this._multiEdgeEditor = null;
        this._roomEditor = null;
        // Use _cursorPos which has Shift-constraint applied from pointer move
        const wallPoint = this._wallStartPoint && e.shiftKey
          ? this._cursorPos
          : snappedPoint;
        this._handleWallClick(wallPoint, e.shiftKey);
      } else if (tool === "device") {
        this._edgeEditor = null;
        this._multiEdgeEditor = null;
        this._handleDeviceClick(snappedPoint);
      } else {
        // Other tools - pan on empty space
        this._edgeEditor = null;
        this._multiEdgeEditor = null;
        this._roomEditor = null;
        this._isPanning = true;
        this._panStart = { x: e.clientX, y: e.clientY };
        this._svg?.setPointerCapture(e.pointerId);
      }
    }
  }

  private _handleDeviceClick(point: Coordinates): void {
    // Open entity picker at this position
    this._pendingDevice = { position: point };
    this._entitySearch = "";
  }

  private _handlePointerMove(e: PointerEvent): void {
    const point = this._screenToSvg({ x: e.clientX, y: e.clientY });
    const tool = activeTool.value;
    // Enable wall segment snapping for device and wall tools
    let snapped = this._getSnappedPoint(point, tool === "device" || tool === "wall");

    // Shift constrains to horizontal/vertical when drawing a wall
    if (e.shiftKey && tool === "wall" && this._wallStartPoint) {
      const dx = Math.abs(snapped.x - this._wallStartPoint.x);
      const dy = Math.abs(snapped.y - this._wallStartPoint.y);
      if (dx >= dy) {
        snapped = { x: snapped.x, y: this._wallStartPoint.y };
      } else {
        snapped = { x: this._wallStartPoint.x, y: snapped.y };
      }
    }

    this._cursorPos = snapped;

    // Handle node dragging
    if (this._draggingNode) {
      // Check if we've moved enough to count as a drag (not just a click)
      const dx = e.clientX - this._draggingNode.startX;
      const dy = e.clientY - this._draggingNode.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        this._draggingNode.hasMoved = true;
      }

      // Snap to 1cm (integer coordinates) and other nodes while dragging
      this._cursorPos = this._getSnappedPointForNode(point);
      this.requestUpdate();
      return;
    }

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

    // Check for hovering over nodes (only in walls mode when not drawing)
    if (!this._wallStartPoint && tool === "select" && this._canvasMode === "walls") {
      this._checkNodeHover(point);
    }
  }

  private _checkNodeHover(point: Coordinates): void {
    const floor = currentFloor.value;
    if (!floor) {
      this._hoveredNode = null;
      return;
    }

    const nearest = findNearestNode(point, floor.nodes, 15);
    this._hoveredNode = nearest;
  }

  private _handlePointerUp(e: PointerEvent): void {
    if (this._draggingNode) {
      if (this._draggingNode.hasMoved) {
        // It was a drag - move the node
        this._finishNodeDrag();
      } else {
        // It was a click - start a new wall from this node
        this._startWallFromNode();
      }
      this._svg?.releasePointerCapture(e.pointerId);
      return;
    }

    if (this._isPanning) {
      this._isPanning = false;
      this._svg?.releasePointerCapture(e.pointerId);
    }
  }

  /**
   * Double-click on an edge to split it at that point.
   */
  private async _handleDblClick(e: MouseEvent): Promise<void> {
    if (this._canvasMode !== "walls") return;

    const point = this._screenToSvg({ x: e.clientX, y: e.clientY });
    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan || !this.hass) return;

    // Check if double-click is near a node — open node editor
    const nearestNode = findNearestNode(point, floor.nodes, 15);
    if (nearestNode) {
      this._nodeEditor = {
        node: nearestNode,
        editX: Math.round(nearestNode.x).toString(),
        editY: Math.round(nearestNode.y).toString(),
      };
      this._edgeEditor = null;
      this._multiEdgeEditor = null;
      return;
    }

    const resolved = resolveFloorEdges(floor);
    for (const re of resolved) {
      const dist = this._pointToSegmentDistance(point, re.startPos, re.endPos);
      if (dist < (re.thickness / 2 + 8)) {
        try {
          await this.hass.callWS({
            type: "inhabit/edges/split_at_point",
            floor_plan_id: floorPlan.id,
            floor_id: floor.id,
            edge_id: re.id,
            point: { x: point.x, y: point.y },
          });
          await reloadFloorData();
          await this._syncRoomsWithEdges();
        } catch (err) {
          console.error("Failed to split edge:", err);
        }
        return;
      }
    }
  }

  /**
   * Right-click on a node to dissolve it (merge the two connected edges).
   */
  private async _handleContextMenu(e: MouseEvent): Promise<void> {
    if (this._canvasMode !== "walls") return;
    e.preventDefault();

    const point = this._screenToSvg({ x: e.clientX, y: e.clientY });
    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan || !this.hass) return;

    const nearest = findNearestNode(point, floor.nodes, 15);
    if (!nearest) return;

    // Only dissolve nodes with exactly 2 connected edges
    const connected = edgesAtNode(nearest.id, floor.edges);
    if (connected.length !== 2) return;

    try {
      await this.hass.callWS({
        type: "inhabit/nodes/dissolve",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        node_id: nearest.id,
      });
      await reloadFloorData();
      await this._syncRoomsWithEdges();
      this._hoveredNode = null;
      selection.value = { type: "none", ids: [] };
      this._edgeEditor = null;
    } catch (err) {
      console.error("Failed to dissolve node:", err);
    }
  }

  private _startWallFromNode(): void {
    if (!this._draggingNode) return;

    // Start drawing a new wall from this node
    this._wallStartPoint = this._draggingNode.originalCoords;
    activeTool.value = "wall";
    this._draggingNode = null;
    this._hoveredNode = null;
  }

  private async _finishNodeDrag(): Promise<void> {
    if (!this._draggingNode || !this.hass) {
      this._draggingNode = null;
      return;
    }

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) {
      this._draggingNode = null;
      return;
    }

    const newPos = this._cursorPos;
    const originalPos = this._draggingNode.originalCoords;

    // Check if position actually changed
    if (Math.abs(newPos.x - originalPos.x) < 1 && Math.abs(newPos.y - originalPos.y) < 1) {
      this._draggingNode = null;
      return;
    }

    // Use the node solver for constraint-aware movement
    const graph = buildNodeGraph(floor.nodes, floor.edges);
    const result = solveNodeMove(graph, this._draggingNode.node.id, newPos.x, newPos.y);

    if (result.blocked) {
      if (result.blockedBy) this._blinkEdges(result.blockedBy);
      this._draggingNode = null;
      return;
    }

    if (result.updates.length === 0) {
      this._draggingNode = null;
      return;
    }

    try {
      await this._withNodeUndo(result.updates, "Move node", async () => {
        await this.hass!.callWS({
          type: "inhabit/nodes/update",
          floor_plan_id: floorPlan.id,
          floor_id: floor.id,
          updates: result.updates.map((u) => ({
            node_id: u.nodeId,
            x: u.x,
            y: u.y,
          })),
        });
        await reloadFloorData();
      });
    } catch (err) {
      console.error("Error updating node:", err);
      alert(`Failed to update node: ${err}`);
    }

    this._draggingNode = null;

    // Auto-remove any edges that collapsed to zero length
    await this._removeDegenerateEdges();
  }

  /**
   * Remove edges whose endpoints overlap (0-length / single-point walls).
   * Called automatically after node drags and edge length changes.
   */
  private async _removeDegenerateEdges(): Promise<void> {
    if (!this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const degenerate = findDegenerateEdges(floor.nodes, floor.edges);
    if (degenerate.length === 0) return;

    console.log(
      "%c[degenerate]%c Removing %d zero-length edge(s): %s",
      "color:#f59e0b;font-weight:bold", "",
      degenerate.length,
      degenerate.map(id => id.slice(0, 8) + "…").join(", ")
    );

    try {
      for (const edgeId of degenerate) {
        await this.hass.callWS({
          type: "inhabit/edges/delete",
          floor_plan_id: floorPlan.id,
          floor_id: floor.id,
          edge_id: edgeId,
        });
      }
      await reloadFloorData();
      await this._syncRoomsWithEdges();
    } catch (err) {
      console.error("Error removing degenerate edges:", err);
    }
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this._wallStartPoint = null;
      this._wallChainStart = null;
      this._hoveredNode = null;
      this._draggingNode = null;
      this._pendingDevice = null;
      this._edgeEditor = null;
      this._multiEdgeEditor = null;
      this._nodeEditor = null;
      this._roomEditor = null;
      selection.value = { type: "none", ids: [] };
      activeTool.value = "select";
    } else if ((e.key === "Backspace" || e.key === "Delete") && this._multiEdgeEditor) {
      e.preventDefault();
      this._handleMultiEdgeDelete();
    } else if ((e.key === "Backspace" || e.key === "Delete") && this._edgeEditor) {
      e.preventDefault();
      this._handleEdgeDelete();
    } else if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (
      (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) ||
      (e.key === "y" && (e.ctrlKey || e.metaKey))
    ) {
      e.preventDefault();
      redo();
    }
  }

  private async _handleEditorSave(): Promise<void> {
    if (!this._edgeEditor || !this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const edge = this._edgeEditor.edge;
    const newLength = parseFloat(this._editingLength);
    if (isNaN(newLength) || newLength <= 0) return;

    const lengthChanged = Math.abs(newLength - this._edgeEditor.length) >= 0.01;
    const directionChanged = this._editingDirection !== edge.direction;
    const lengthLockChanged = this._editingLengthLocked !== edge.length_locked;
    const anyEdgePropChanged = directionChanged || lengthLockChanged;

    try {
      // 1. Apply direction change (may move nodes via constraint snap)
      if (directionChanged) {
        const ok = await this._applyDirection(edge, this._editingDirection);
        if (!ok) return; // blocked — blink already triggered, bail out entirely
      }

      // 2. Apply length change (moves nodes)
      if (lengthChanged) {
        await this._updateEdgeLength(edge, newLength);
      }

      // 3. Validate constraint changes before persisting
      if (anyEdgePropChanged) {
        // Check feasibility of the proposed constraint combination
        const currentFloorData = currentFloor.value;
        if (currentFloorData && lengthLockChanged) {
          const proposed: { direction?: WallDirection; length_locked?: boolean } = {};
          if (directionChanged) proposed.direction = this._editingDirection;
          if (lengthLockChanged) proposed.length_locked = this._editingLengthLocked;

          const check = checkConstraintsFeasible(
            currentFloorData.nodes, currentFloorData.edges, edge.id, proposed
          );
          if (!check.feasible) {
            if (check.blockedBy) this._blinkEdges(check.blockedBy);
            return; // blocked — bail out
          }
        }

        const edgeUpdate: Record<string, unknown> = {
          type: "inhabit/edges/update",
          floor_plan_id: floorPlan.id,
          floor_id: floor.id,
          edge_id: edge.id,
        };
        if (directionChanged) edgeUpdate.direction = this._editingDirection;
        if (lengthLockChanged) edgeUpdate.length_locked = this._editingLengthLocked;

        await this.hass.callWS(edgeUpdate);
        await reloadFloorData();
      }
    } catch (err) {
      console.error("Error applying edge changes:", err);
    }

    this._edgeEditor = null;
    selection.value = { type: "none", ids: [] };
  }

  private _handleEditorCancel(): void {
    this._edgeEditor = null;
    selection.value = { type: "none", ids: [] };
  }

  private async _handleEdgeDelete(): Promise<void> {
    if (!this._edgeEditor || !this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const hass = this.hass;
    const fpId = floorPlan.id;
    const fId = floor.id;
    const edge = this._edgeEditor.edge;
    const nodeMap = buildNodeMap(floor.nodes);
    const startNode = nodeMap.get(edge.start_node);
    const endNode = nodeMap.get(edge.end_node);
    const snapshot = {
      start: startNode ? { x: startNode.x, y: startNode.y } : { x: 0, y: 0 },
      end: endNode ? { x: endNode.x, y: endNode.y } : { x: 0, y: 0 },
      thickness: edge.thickness,
      is_exterior: edge.is_exterior,
      length_locked: edge.length_locked,
      direction: edge.direction,
    };
    const edgeRef = { id: edge.id };

    try {
      await hass.callWS({
        type: "inhabit/edges/delete",
        floor_plan_id: fpId,
        floor_id: fId,
        edge_id: edgeRef.id,
      });
      await reloadFloorData();
      await this._syncRoomsWithEdges();

      pushAction({
        type: "edge_delete",
        description: "Delete edge",
        undo: async () => {
          const r = await hass.callWS<{ edge: { id: string } }>({
            type: "inhabit/edges/add",
            floor_plan_id: fpId,
            floor_id: fId,
            ...snapshot,
          });
          edgeRef.id = r.edge.id;
          await reloadFloorData();
          await this._syncRoomsWithEdges();
        },
        redo: async () => {
          await hass.callWS({
            type: "inhabit/edges/delete",
            floor_plan_id: fpId,
            floor_id: fId,
            edge_id: edgeRef.id,
          });
          await reloadFloorData();
          await this._syncRoomsWithEdges();
        },
      });
    } catch (err) {
      console.error("Error deleting edge:", err);
    }

    this._edgeEditor = null;
    selection.value = { type: "none", ids: [] };
  }

  private _handleEditorKeyDown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      this._handleEditorSave();
    } else if (e.key === "Escape") {
      this._handleEditorCancel();
    }
  }

  private async _withNodeUndo(
    nodeUpdates: Array<{ nodeId: string; x: number; y: number }>,
    description: string,
    perform: () => Promise<void>,
  ): Promise<void> {
    if (!this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const hass = this.hass;
    const fpId = floorPlan.id;
    const fId = floor.id;

    // Snapshot node positions before
    const before = new Map<string, { x: number; y: number }>();
    for (const u of nodeUpdates) {
      const n = floor.nodes.find((n) => n.id === u.nodeId);
      if (n) {
        before.set(n.id, { x: n.x, y: n.y });
      }
    }

    await perform();
    await this._syncRoomsWithEdges();

    // Capture new positions after reload
    const updatedFloor = currentFloor.value;
    if (!updatedFloor) return;

    const after = new Map<string, { x: number; y: number }>();
    for (const u of nodeUpdates) {
      const n = updatedFloor.nodes.find((n) => n.id === u.nodeId);
      if (n) {
        after.set(n.id, { x: n.x, y: n.y });
      }
    }

    const restoreNodes = async (states: Map<string, { x: number; y: number }>) => {
      const updates = Array.from(states.entries()).map(([node_id, pos]) => ({
        node_id,
        x: pos.x,
        y: pos.y,
      }));
      if (updates.length > 0) {
        await hass.callWS({
          type: "inhabit/nodes/update",
          floor_plan_id: fpId,
          floor_id: fId,
          updates,
        });
      }
      await reloadFloorData();
      await this._syncRoomsWithEdges();
    };

    pushAction({
      type: "node_update",
      description,
      undo: () => restoreNodes(before),
      redo: () => restoreNodes(after),
    });
  }

  private async _updateEdgeLength(edge: Edge, newLength: number): Promise<void> {
    if (!this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    // Temporarily unlock this edge for the solver — the user is explicitly
    // setting a new length via the editor, so the edge's own lock should not block.
    const edgeCopy = floor.edges.map(e =>
      e.id === edge.id ? { ...e, length_locked: false } : e
    );
    const graph = buildNodeGraph(floor.nodes, edgeCopy);
    const result = solveEdgeLengthChange(graph, edge.id, newLength);

    if (result.blocked) {
      if (result.blockedBy) this._blinkEdges(result.blockedBy);
      return;
    }

    if (result.updates.length === 0) return;

    try {
      await this._withNodeUndo(result.updates, "Change edge length", async () => {
        await this.hass!.callWS({
          type: "inhabit/nodes/update",
          floor_plan_id: floorPlan.id,
          floor_id: floor.id,
          updates: result.updates.map((u) => ({
            node_id: u.nodeId,
            x: u.x,
            y: u.y,
          })),
        });
        await reloadFloorData();
      });
    } catch (err) {
      console.error("Error updating edge length:", err);
      alert(`Failed to update edge: ${err}`);
    }

    // Auto-remove any edges that collapsed to zero length
    await this._removeDegenerateEdges();
  }

  private _getSnappedPointForNode(point: Coordinates): Coordinates {
    const floor = currentFloor.value;

    // First check for snapping to other nodes
    if (floor) {
      const nearest = findNearestNode(point, floor.nodes, 15);
      if (nearest) {
        return { x: nearest.x, y: nearest.y };
      }
    }

    // Snap to 1cm (round to nearest integer)
    return {
      x: Math.round(point.x),
      y: Math.round(point.y),
    };
  }

  private _getSnappedPoint(point: Coordinates, snapToEdgeSegments = false): Coordinates {
    const floor = currentFloor.value;
    if (!floor) return snapToGrid.value ? snapPoint(point, gridSize.value) : point;

    const snapDistance = 15;

    // Snap to existing nodes first (highest priority)
    const nearest = findNearestNode(point, floor.nodes, snapDistance);
    if (nearest) {
      return { x: nearest.x, y: nearest.y };
    }

    // Snap to edge segments (for device placement)
    if (snapToEdgeSegments) {
      const resolved = resolveFloorEdges(floor);
      let closestPoint: Coordinates | null = null;
      let closestDist = snapDistance;

      for (const re of resolved) {
        const snapped = this._getClosestPointOnSegment(point, re.startPos, re.endPos);
        const dist = Math.sqrt(
          Math.pow(point.x - snapped.x, 2) + Math.pow(point.y - snapped.y, 2)
        );
        if (dist < closestDist) {
          closestDist = dist;
          closestPoint = snapped;
        }
      }

      if (closestPoint) {
        return closestPoint;
      }
    }

    return snapToGrid.value ? snapPoint(point, gridSize.value) : point;
  }

  private _getClosestPointOnSegment(point: Coordinates, start: Coordinates, end: Coordinates): Coordinates {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) return start;

    // Calculate projection parameter t
    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq));

    return {
      x: start.x + t * dx,
      y: start.y + t * dy,
    };
  }

  private _handleSelectClick(point: Coordinates, shiftKey = false): boolean {
    const floor = currentFloor.value;
    if (!floor) return false;

    // Check edges first (they're on top visually)
    const resolved = resolveFloorEdges(floor);
    for (const re of resolved) {
      const dist = this._pointToSegmentDistance(point, re.startPos, re.endPos);
      if (dist < (re.thickness / 2 + 5)) {
        // Shift-click multi-select in walls mode
        if (shiftKey && this._canvasMode === "walls" && selection.value.type === "edge") {
          const currentIds = [...selection.value.ids];
          const idx = currentIds.indexOf(re.id);
          if (idx >= 0) {
            currentIds.splice(idx, 1);
          } else {
            currentIds.push(re.id);
          }
          selection.value = { type: "edge", ids: currentIds };
          this._updateEdgeEditorForSelection(currentIds);
          return true;
        }

        // Single select
        selection.value = { type: "edge", ids: [re.id] };
        this._updateEdgeEditorForSelection([re.id]);
        return true;
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
        return true;
      }
    }

    // Check rooms
    for (const room of floor.rooms) {
      if (this._pointInPolygon(point, room.polygon.vertices)) {
        selection.value = { type: "room", ids: [room.id] };
        const areaName = room.ha_area_id
          ? this._haAreas.find(a => a.area_id === room.ha_area_id)?.name ?? room.name
          : room.name;
        this._roomEditor = {
          room,
          editName: areaName,
          editColor: room.color,
          editAreaId: room.ha_area_id ?? null,
        };
        return true;
      }
    }

    selection.value = { type: "none", ids: [] };
    return false;
  }

  private _updateEdgeEditorForSelection(edgeIds: string[]): void {
    const floor = currentFloor.value;
    if (!floor) return;

    if (edgeIds.length === 0) {
      this._edgeEditor = null;
      this._multiEdgeEditor = null;
      return;
    }

    const nodeMap = buildNodeMap(floor.nodes);

    if (edgeIds.length === 1) {
      const edge = floor.edges.find(e => e.id === edgeIds[0]);
      if (edge) {
        const startNode = nodeMap.get(edge.start_node);
        const endNode = nodeMap.get(edge.end_node);
        if (startNode && endNode) {
          const currentLength = this._calculateWallLength(startNode, endNode);
          this._edgeEditor = {
            edge,
            position: {
              x: (startNode.x + endNode.x) / 2,
              y: (startNode.y + endNode.y) / 2,
            },
            length: currentLength,
          };
          this._editingLength = Math.round(currentLength).toString();
          this._editingLengthLocked = edge.length_locked;
          this._editingDirection = edge.direction;
        }
      }
      this._multiEdgeEditor = null;
      return;
    }

    // 2+ edges: show multi-edge editor
    const edges = edgeIds
      .map(id => floor.edges.find(e => e.id === id))
      .filter((e): e is Edge => !!e);

    // Detect collinearity and compute total length
    const allPoints: Coordinates[] = [];
    for (const edge of edges) {
      const sn = nodeMap.get(edge.start_node);
      const en = nodeMap.get(edge.end_node);
      if (sn) allPoints.push({ x: sn.x, y: sn.y });
      if (en) allPoints.push({ x: en.x, y: en.y });
    }
    const collinear = arePointsCollinear(allPoints);
    let totalLength: number | undefined;
    if (collinear) {
      totalLength = 0;
      for (const edge of edges) {
        const sn = nodeMap.get(edge.start_node);
        const en = nodeMap.get(edge.end_node);
        if (sn && en) totalLength += this._calculateWallLength(sn, en);
      }
      this._editingTotalLength = Math.round(totalLength).toString();
    }

    this._multiEdgeEditor = { edges, collinear, totalLength };
    this._edgeEditor = null;
  }

  private _pointToSegmentDistance(point: Coordinates, start: Coordinates, end: Coordinates): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) {
      return Math.sqrt(Math.pow(point.x - start.x, 2) + Math.pow(point.y - start.y, 2));
    }

    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSq));
    const projX = start.x + t * dx;
    const projY = start.y + t * dy;

    return Math.sqrt(Math.pow(point.x - projX, 2) + Math.pow(point.y - projY, 2));
  }

  private _handleWallClick(point: Coordinates, shiftHeld = false): void {
    if (!this._wallStartPoint) {
      // First click — begin a new chain
      this._wallStartPoint = point;
      this._wallChainStart = point;
    } else {
      // Determine direction constraint from shift key
      let direction: WallDirection = "free";
      if (shiftHeld) {
        const dx = Math.abs(point.x - this._wallStartPoint.x);
        const dy = Math.abs(point.y - this._wallStartPoint.y);
        direction = dx >= dy ? "horizontal" : "vertical";
      }
      this._completeWall(this._wallStartPoint, point, direction);

      // Check if the endpoint landed on an existing node
      const floor = currentFloor.value;
      const snappedToExisting = floor?.nodes.some(
        (n) => Math.abs(point.x - n.x) < 1 && Math.abs(point.y - n.y) < 1
      );

      // Check if the loop is closed (clicked point snapped back to chain start)
      const closedLoop = this._wallChainStart
        && Math.abs(point.x - this._wallChainStart.x) < 1
        && Math.abs(point.y - this._wallChainStart.y) < 1;

      if (closedLoop) {
        // Loop closed — exit wall tool entirely
        this._wallStartPoint = null;
        this._wallChainStart = null;
        activeTool.value = "select";
      } else if (snappedToExisting) {
        // Attached to an existing wall — stop chaining but stay in wall tool
        this._wallStartPoint = null;
        this._wallChainStart = null;
      } else {
        // Continue chain from this point
        this._wallStartPoint = point;
      }
    }
  }

  private async _completeWall(start: Coordinates, end: Coordinates, direction: WallDirection = "free"): Promise<void> {
    if (!this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const hass = this.hass;
    const fpId = floorPlan.id;
    const fId = floor.id;
    const edgeRef = { id: "" };

    try {
      const result = await hass.callWS<{ edge: { id: string } }>({
        type: "inhabit/edges/add",
        floor_plan_id: fpId,
        floor_id: fId,
        start,
        end,
        thickness: 6,
        direction,
      });
      edgeRef.id = result.edge.id;
      await reloadFloorData();
      await this._syncRoomsWithEdges();

      pushAction({
        type: "edge_add",
        description: "Add wall",
        undo: async () => {
          await hass.callWS({
            type: "inhabit/edges/delete",
            floor_plan_id: fpId,
            floor_id: fId,
            edge_id: edgeRef.id,
          });
          await reloadFloorData();
          await this._syncRoomsWithEdges();
        },
        redo: async () => {
          const r = await hass.callWS<{ edge: { id: string } }>({
            type: "inhabit/edges/add",
            floor_plan_id: fpId,
            floor_id: fId,
            start,
            end,
            thickness: 6,
            direction,
          });
          edgeRef.id = r.edge.id;
          await reloadFloorData();
          await this._syncRoomsWithEdges();
        },
      });
    } catch (err) {
      console.error("Error creating edge:", err);
    }
  }

  private _screenToSvg(screenPoint: Coordinates): Coordinates {
    if (!this._svg) return screenPoint;

    const ctm = this._svg.getScreenCTM();
    if (ctm) {
      const inv = ctm.inverse();
      return {
        x: inv.a * screenPoint.x + inv.c * screenPoint.y + inv.e,
        y: inv.b * screenPoint.x + inv.d * screenPoint.y + inv.f,
      };
    }

    // Fallback to manual calculation
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

  /**
   * Auto-detect rooms from wall loops and sync with existing rooms.
   * Called after every wall mutation.
   */
  private async _syncRoomsWithEdges(): Promise<void> {
    if (!this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const detected = detectRoomsFromEdges(floor.nodes, floor.edges);
    const existingRooms = [...floor.rooms];
    const matchedExistingIds = new Set<string>();
    let nextRoomNum = this._getNextRoomNumber(existingRooms) - 1;

    // Match detected rooms to existing rooms by vertex count + centroid proximity.
    // Vertex matching alone breaks when constraint propagation moves many nodes.
    for (const candidate of detected) {
      let bestMatch: Room | null = null;
      let bestScore = 0;

      for (const room of existingRooms) {
        if (matchedExistingIds.has(room.id)) continue;

        const existingVerts = room.polygon.vertices;
        const detectedVerts = candidate.vertices;

        // Primary: same vertex count + close centroid = strong match
        const existingCentroid = this._getPolygonCenter(existingVerts);
        if (!existingCentroid) continue;
        const detectedCentroid = candidate.centroid;
        const centroidDist = Math.sqrt(
          (existingCentroid.x - detectedCentroid.x) ** 2 +
          (existingCentroid.y - detectedCentroid.y) ** 2
        );

        // Score: combine vertex count match and centroid proximity
        let score = 0;

        // Same vertex count is a strong signal (topology didn't change)
        if (existingVerts.length === detectedVerts.length) {
          score += 0.5;
        }

        // Centroid proximity (within 200px is a reasonable match for constraint moves)
        if (centroidDist < 200) {
          score += 0.5 * (1 - centroidDist / 200);
        }

        if (score > 0.3 && score > bestScore) {
          bestScore = score;
          bestMatch = room;
        }
      }

      if (bestMatch) {
        matchedExistingIds.add(bestMatch.id);
        // Update polygon geometry if shape changed
        const verticesChanged = this._verticesChanged(bestMatch.polygon.vertices, candidate.vertices);
        if (verticesChanged) {
          try {
            await this.hass!.callWS({
              type: "inhabit/rooms/update",
              floor_plan_id: floorPlan.id,
              room_id: bestMatch.id,
              polygon: { vertices: candidate.vertices },
            });
          } catch (err) {
            console.error("Error updating room polygon:", err);
          }
        }
      } else {
        // Create new room with auto-name (increment counter to avoid duplicates)
        nextRoomNum++;
        try {
          await this.hass!.callWS({
            type: "inhabit/rooms/add",
            floor_plan_id: floorPlan.id,
            floor_id: floor.id,
            name: `Room ${nextRoomNum}`,
            polygon: { vertices: candidate.vertices },
            color: this._getRandomRoomColor(),
          });
        } catch (err) {
          console.error("Error creating auto-detected room:", err);
        }
      }
    }

    // Delete rooms whose loops no longer exist
    for (const room of existingRooms) {
      if (!matchedExistingIds.has(room.id)) {
        try {
          await this.hass!.callWS({
            type: "inhabit/rooms/delete",
            floor_plan_id: floorPlan.id,
            room_id: room.id,
          });
        } catch (err) {
          console.error("Error deleting orphaned room:", err);
        }
      }
    }

    await reloadFloorData();
  }

  private _verticesChanged(existing: Coordinates[], detected: Coordinates[]): boolean {
    if (existing.length !== detected.length) return true;
    for (let i = 0; i < existing.length; i++) {
      if (Math.abs(existing[i].x - detected[i].x) > 1 ||
          Math.abs(existing[i].y - detected[i].y) > 1) {
        return true;
      }
    }
    return false;
  }

  private _getNextRoomNumber(existingRooms: Room[]): number {
    let max = 0;
    for (const room of existingRooms) {
      const match = room.name.match(/^Room (\d+)$/);
      if (match) {
        max = Math.max(max, parseInt(match[1], 10));
      }
    }
    return max + 1;
  }

  private async _handleRoomEditorSave(): Promise<void> {
    if (!this._roomEditor || !this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const { room, editName, editColor, editAreaId } = this._roomEditor;

    try {
      await this.hass.callWS({
        type: "inhabit/rooms/update",
        floor_plan_id: floorPlan.id,
        room_id: room.id,
        name: editName,
        color: editColor,
        ha_area_id: editAreaId,
      });
      await reloadFloorData();
    } catch (err) {
      console.error("Error updating room:", err);
    }

    this._roomEditor = null;
    selection.value = { type: "none", ids: [] };
  }

  private _handleRoomEditorCancel(): void {
    this._roomEditor = null;
    selection.value = { type: "none", ids: [] };
  }

  private async _handleRoomDelete(): Promise<void> {
    if (!this._roomEditor || !this.hass) return;

    const floorPlan = currentFloorPlan.value;
    if (!floorPlan) return;

    try {
      await this.hass.callWS({
        type: "inhabit/rooms/delete",
        floor_plan_id: floorPlan.id,
        room_id: this._roomEditor.room.id,
      });
      await reloadFloorData();
    } catch (err) {
      console.error("Error deleting room:", err);
    }

    this._roomEditor = null;
    selection.value = { type: "none", ids: [] };
  }

  private _renderRoomEditor() {
    if (!this._roomEditor) return null;

    const ROOM_COLORS = [
      "rgba(156, 156, 156, 0.3)",
      "rgba(244, 143, 177, 0.3)",
      "rgba(129, 199, 132, 0.3)",
      "rgba(100, 181, 246, 0.3)",
      "rgba(255, 183, 77, 0.3)",
      "rgba(186, 104, 200, 0.3)",
      "rgba(77, 208, 225, 0.3)",
      "rgba(255, 213, 79, 0.3)",
    ];

    return html`
      <div class="wall-editor"
           @click=${(e: Event) => e.stopPropagation()}
           @pointerdown=${(e: Event) => e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Room Properties</span>
          <button class="wall-editor-close" @click=${this._handleRoomEditorCancel}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">HA Area</span>
          <select
            class="wall-editor-select"
            .value=${this._roomEditor.editAreaId ?? ""}
            @change=${(e: Event) => {
              if (this._roomEditor) {
                const val = (e.target as HTMLSelectElement).value;
                const area = this._haAreas.find(a => a.area_id === val);
                this._roomEditor = {
                  ...this._roomEditor,
                  editAreaId: val || null,
                  editName: area ? area.name : this._roomEditor.editName,
                };
              }
            }}
          >
            <option value="">None</option>
            ${this._haAreas.map(a => html`
              <option value=${a.area_id} ?selected=${this._roomEditor?.editAreaId === a.area_id}>${a.name}</option>
            `)}
          </select>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Name</span>
          <input
            type="text"
            .value=${this._roomEditor.editName}
            ?disabled=${!!this._roomEditor.editAreaId}
            @input=${(e: InputEvent) => {
              if (this._roomEditor) {
                this._roomEditor = { ...this._roomEditor, editName: (e.target as HTMLInputElement).value };
              }
            }}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === "Enter") this._handleRoomEditorSave();
              else if (e.key === "Escape") this._handleRoomEditorCancel();
            }}
          />
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Color</span>
          <div class="wall-editor-colors">
            ${ROOM_COLORS.map(c => html`
              <button
                class="color-swatch ${this._roomEditor?.editColor === c ? "active" : ""}"
                style="background:${c};"
                @click=${() => {
                  if (this._roomEditor) {
                    this._roomEditor = { ...this._roomEditor, editColor: c };
                  }
                }}
              ></button>
            `)}
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleRoomEditorSave}><ha-icon icon="mdi:check"></ha-icon> Save</button>
          <button class="delete-btn" @click=${this._handleRoomDelete}><ha-icon icon="mdi:delete-outline"></ha-icon> Delete</button>
        </div>
      </div>
    `;
  }

  private _renderEdgeChains(floor: Floor, sel: SelectionState) {
    const resolved = resolveFloorEdges(floor);

    // If dragging a node, use the solver to preview all affected node positions
    let edgesForChains = resolved.map(re => ({
      id: re.id,
      start_node: re.start_node,
      end_node: re.end_node,
      startPos: re.startPos,
      endPos: re.endPos,
      thickness: re.thickness,
      type: re.type,
    }));

    if (this._draggingNode) {
      const { positions: preview, blocked, blockedBy } = previewNodeDrag(
        floor.nodes,
        floor.edges,
        this._draggingNode.node.id,
        this._cursorPos.x,
        this._cursorPos.y
      );

      if (blocked) {
        if (blockedBy) this._blinkEdges(blockedBy);
      } else {
        // Apply preview positions to resolved edges
        edgesForChains = resolved.map(re => ({
          id: re.id,
          start_node: re.start_node,
          end_node: re.end_node,
          startPos: preview.get(re.start_node) ?? re.startPos,
          endPos: preview.get(re.end_node) ?? re.endPos,
          thickness: re.thickness,
          type: re.type,
        }));
      }
    }

    const chains = groupEdgesIntoChains(edgesForChains);

    // Find selected edges for highlight
    const selectedEdges = sel.type === "edge"
      ? edgesForChains.filter(w => sel.ids.includes(w.id))
      : [];

    // Find conflict edges (constraint violations detected on floor load)
    const floorConflicts = constraintConflicts.value.get(floor.id);
    const conflictEdgeIds = floorConflicts
      ? new Set(floorConflicts.map(v => v.edgeId))
      : new Set<string>();

    return svg`
      <!-- Base edges rendered as chains for proper corners -->
      ${chains.map((chain, idx) => svg`
        <path class="wall"
              d="${wallChainPath(chain.map(e => ({ start: e.startPos, end: e.endPos, thickness: e.thickness })))}"
              data-chain-idx="${idx}"/>
      `)}

      <!-- Constraint conflict highlights (amber dashed) -->
      ${conflictEdgeIds.size > 0 ? edgesForChains
        .filter(e => conflictEdgeIds.has(e.id))
        .map(edge => svg`
          <path class="wall-conflict-highlight"
                d="${this._singleEdgePath({ start: edge.startPos, end: edge.endPos, thickness: edge.thickness })}"/>
        `) : null}

      <!-- Selected edge highlights -->
      ${selectedEdges.map(edge => svg`
        <path class="wall-selected-highlight"
              d="${this._singleEdgePath({ start: edge.startPos, end: edge.endPos, thickness: edge.thickness })}"/>
      `)}

      <!-- Blocked edge blink -->
      ${this._blinkingEdgeIds.length > 0 ? this._blinkingEdgeIds.map(id => {
        const blinkEdge = edgesForChains.find(w => w.id === id);
        return blinkEdge ? svg`
          <path class="wall-blocked-blink"
                d="${this._singleEdgePath({ start: blinkEdge.startPos, end: blinkEdge.endPos, thickness: blinkEdge.thickness })}"/>
        ` : null;
      }) : null}
    `;
  }

  private _singleEdgePath(edge: { start: Coordinates; end: Coordinates; thickness: number }): string {
    const { start, end, thickness } = edge;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len === 0) return "";

    const nx = (-dy / len) * (thickness / 2);
    const ny = (dx / len) * (thickness / 2);

    return `M${start.x + nx},${start.y + ny}
            L${end.x + nx},${end.y + ny}
            L${end.x - nx},${end.y - ny}
            L${start.x - nx},${start.y - ny}
            Z`;
  }

  private _blinkEdges(edgeIds: string | string[]): void {
    if (this._blinkTimer) clearTimeout(this._blinkTimer);
    const ids = Array.isArray(edgeIds) ? edgeIds : [edgeIds];
    this._blinkingEdgeIds = ids;

    const floor = currentFloor.value;
    if (floor) {
      const details = ids.map(id => {
        const edge = floor.edges.find(e => e.id === id);
        if (!edge) return id.slice(0, 8) + "…";
        const s = floor.nodes.find(n => n.id === edge.start_node);
        const e = floor.nodes.find(n => n.id === edge.end_node);
        const len = s && e ? Math.sqrt((e.x - s.x) ** 2 + (e.y - s.y) ** 2).toFixed(1) : "?";
        const cstr: string[] = [];
        if (edge.direction !== "free") cstr.push(edge.direction);
        if (edge.length_locked) cstr.push("len-locked");
        if (edge.angle_group) cstr.push(`ang:${edge.angle_group.slice(0,4)}`);
        return `${id.slice(0, 8)}… (${len}cm${cstr.length ? " " + cstr.join(",") : ""})`;
      });
      console.warn(
        `%c[constraint]%c Blinking ${ids.length} blocked edge(s):\n  ${details.join("\n  ")}`,
        "color:#8b5cf6;font-weight:bold", ""
      );
    }

    this._blinkTimer = setTimeout(() => {
      this._blinkingEdgeIds = [];
      this._blinkTimer = null;
    }, 1800); // 3 blinks × 0.6s
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

          <!-- Edges (rendered as chains for proper corners) -->
          ${this._renderEdgeChains(floor, sel)}
        </g>
      ` : null}

      <!-- Labels layer -->
      ${layerConfig.find(l => l.id === "labels")?.visible ? svg`
        <g class="labels-layer" opacity="${layerConfig.find(l => l.id === "labels")?.opacity ?? 1}">
          ${floor.rooms.map(room => {
            const center = this._getPolygonCenter(room.polygon.vertices);
            if (!center) return null;
            const displayName = room.ha_area_id ? (this._haAreas.find(a => a.area_id === room.ha_area_id)?.name ?? room.name) : room.name;
            const isLinked = !!room.ha_area_id;
            return svg`
              <g class="room-label-group" transform="translate(${center.x}, ${center.y})">
                <text class="room-label" x="0" y="0">
                  ${displayName}
                </text>
                ${isLinked ? svg`
                  <g class="room-link-icon" transform="translate(${displayName.length * 3.8 + 4}, -5) scale(0.55)">
                    <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" fill="white"/>
                  </g>
                ` : null}
              </g>
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

  private _renderDevice(device: DevicePlacement) {
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

  private _renderNodeEndpoints() {
    const floor = currentFloor.value;
    if (!floor || floor.nodes.length === 0) return null;

    // Build set of node IDs referenced by edges (non-orphan nodes)
    const referencedNodes = new Set<string>();
    for (const edge of floor.edges) {
      referencedNodes.add(edge.start_node);
      referencedNodes.add(edge.end_node);
    }

    // Show hovered/dragged node + all pinned nodes (skip orphans)
    const nodesToShow: Array<{ node: Node; coords: Coordinates; isDragging: boolean; isPinned: boolean }> = [];

    // Always show pinned nodes (only if connected to an edge)
    for (const node of floor.nodes) {
      if (node.pinned && referencedNodes.has(node.id)) {
        nodesToShow.push({
          node,
          coords: { x: node.x, y: node.y },
          isDragging: false,
          isPinned: true,
        });
      }
    }

    if (this._draggingNode && referencedNodes.has(this._draggingNode.node.id)) {
      // Remove if already added as pinned (shouldn't happen since pinned can't drag, but safe)
      const idx = nodesToShow.findIndex(n => n.node.id === this._draggingNode!.node.id);
      if (idx >= 0) nodesToShow.splice(idx, 1);
      // Use solver-projected position (respects collinear constraints) instead of raw cursor
      const { positions: dragPreview, blocked: dragBlocked } = previewNodeDrag(
        floor.nodes, floor.edges,
        this._draggingNode.node.id,
        this._cursorPos.x, this._cursorPos.y
      );
      // When blocked, keep the node at its original position
      const projected = dragBlocked
        ? this._draggingNode.originalCoords
        : (dragPreview.get(this._draggingNode.node.id) ?? this._cursorPos);
      nodesToShow.push({
        node: this._draggingNode.node,
        coords: projected,
        isDragging: true,
        isPinned: false,
      });
    } else if (this._hoveredNode && referencedNodes.has(this._hoveredNode.id)) {
      // Don't duplicate if already shown as pinned
      if (!nodesToShow.some(n => n.node.id === this._hoveredNode!.id)) {
        nodesToShow.push({
          node: this._hoveredNode,
          coords: { x: this._hoveredNode.x, y: this._hoveredNode.y },
          isDragging: false,
          isPinned: false,
        });
      }
    }

    if (nodesToShow.length === 0) return null;

    // MDI pin icon path (24x24 viewBox)
    const pinIconPath = "M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z";

    return svg`
      <g class="wall-endpoints-layer">
        ${nodesToShow.map((item) => item.isPinned ? svg`
          <g class="wall-endpoint pinned"
             transform="translate(${item.coords.x}, ${item.coords.y})"
             @pointerdown=${(e: PointerEvent) => this._handleNodePointerDown(e, item.node)}>
            <rect x="-5" y="-5" width="10" height="10" rx="2" />
            <g transform="translate(-6, -18) scale(0.5)">
              <path d="${pinIconPath}" fill="var(--primary-color, #2196f3)" />
            </g>
          </g>
        ` : svg`
          <circle
            class="wall-endpoint ${item.isDragging ? "dragging" : ""}"
            cx="${item.coords.x}"
            cy="${item.coords.y}"
            r="6"
            @pointerdown=${(e: PointerEvent) => this._handleNodePointerDown(e, item.node)}
          />
        `)}
        ${this._draggingNode ? this._renderDraggedEdgeLengths(floor) : null}
      </g>
    `;
  }

  private _renderDraggedEdgeLengths(floor: Floor) {
    if (!this._draggingNode) return null;

    const draggedPos = this._cursorPos;
    const { positions: preview, blocked } = previewNodeDrag(
      floor.nodes,
      floor.edges,
      this._draggingNode.node.id,
      draggedPos.x,
      draggedPos.y
    );

    // When blocked, don't show length labels (walls stay at original positions)
    if (blocked) return null;

    const resolved = resolveFloorEdges(floor);

    const edgeData: Array<{
      start: Coordinates;
      end: Coordinates;
      origStart: Coordinates;
      origEnd: Coordinates;
      length: number;
      angle: number;
      thickness: number
    }> = [];

    for (const re of resolved) {
      const startPreview = preview.get(re.start_node);
      const endPreview = preview.get(re.end_node);
      if (!startPreview && !endPreview) continue; // Not affected

      const newStart = startPreview ?? re.startPos;
      const newEnd = endPreview ?? re.endPos;
      const length = this._calculateWallLength(newStart, newEnd);
      const angle = Math.atan2(newEnd.y - newStart.y, newEnd.x - newStart.x);

      edgeData.push({
        start: newStart,
        end: newEnd,
        origStart: re.startPos,
        origEnd: re.endPos,
        length,
        angle,
        thickness: re.thickness,
      });
    }

    // Check for 90-degree angles between edges at the dragged point
    const rightAngles: Array<{ point: Coordinates; angle: number }> = [];
    for (let i = 0; i < edgeData.length; i++) {
      for (let j = i + 1; j < edgeData.length; j++) {
        const angleDiff = Math.abs(edgeData[i].angle - edgeData[j].angle);
        const normalizedDiff = angleDiff % Math.PI;
        if (Math.abs(normalizedDiff - Math.PI / 2) < 0.02) {
          rightAngles.push({
            point: draggedPos,
            angle: Math.min(edgeData[i].angle, edgeData[j].angle),
          });
        }
      }
    }

    return svg`
      <!-- Original edge positions (ghost) -->
      ${edgeData.map(({ origStart, origEnd, thickness }) => {
        const dx = origEnd.x - origStart.x;
        const dy = origEnd.y - origStart.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return null;

        const nx = (-dy / len) * (thickness / 2);
        const ny = (dx / len) * (thickness / 2);

        return svg`
          <path
            class="wall-original-ghost"
            d="M${origStart.x + nx},${origStart.y + ny}
               L${origEnd.x + nx},${origEnd.y + ny}
               L${origEnd.x - nx},${origEnd.y - ny}
               L${origStart.x - nx},${origStart.y - ny}
               Z"
          />
        `;
      })}

      <!-- Edge length labels -->
      ${edgeData.map(({ start, end, length }) => {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
        const labelAngle = angle > 90 || angle < -90 ? angle + 180 : angle;

        return svg`
          <g transform="translate(${midX}, ${midY}) rotate(${labelAngle})">
            <rect class="wall-length-bg" x="-30" y="-10" width="60" height="20" rx="4"/>
            <text class="wall-length-label" x="0" y="0">${this._formatLength(length)}</text>
          </g>
        `;
      })}

      <!-- 90-degree angle indicators -->
      ${rightAngles.map(({ point, angle }) => svg`
        <g transform="translate(${point.x}, ${point.y}) rotate(${angle * 180 / Math.PI})">
          <path
            class="right-angle-indicator"
            d="M 12 0 L 12 12 L 0 12"
            fill="none"
            stroke="var(--primary-color, #2196f3)"
            stroke-width="2"
          />
        </g>
      `)}
    `;
  }

  private _handleNodePointerDown(e: PointerEvent, node: Node): void {
    // Right-click: let contextmenu handle it for node dissolve
    if (e.button === 2) return;

    e.stopPropagation();
    e.preventDefault();

    // Get the original coords from hovered node (not the display coords which might be cursor pos)
    const actualNode = this._hoveredNode || node;

    // When drawing walls, treat node click as a wall click at this node's position
    if (activeTool.value === "wall") {
      const pt: Coordinates = { x: actualNode.x, y: actualNode.y };
      this._handleWallClick(pt, e.shiftKey);
      return;
    }

    // Pinned nodes cannot be dragged — clicking immediately starts a new wall
    if (actualNode.pinned) {
      this._wallStartPoint = { x: actualNode.x, y: actualNode.y };
      activeTool.value = "wall";
      this._hoveredNode = null;
      return;
    }

    this._draggingNode = {
      node: actualNode,
      originalCoords: { x: actualNode.x, y: actualNode.y },
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false,
    };

    this._svg?.setPointerCapture(e.pointerId);
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

    return null;
  }

  private _getPolygonCenter(vertices: Coordinates[]): Coordinates | null {
    if (vertices.length === 0) return null;
    if (vertices.length < 3) {
      // Fallback for degenerate polygons: simple average
      let cx = 0, cy = 0;
      for (const v of vertices) { cx += v.x; cy += v.y; }
      return { x: cx / vertices.length, y: cy / vertices.length };
    }

    // Area-weighted centroid using the shoelace formula
    let area = 0;
    let cx = 0;
    let cy = 0;
    const n = vertices.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const cross = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
      area += cross;
      cx += (vertices[i].x + vertices[j].x) * cross;
      cy += (vertices[i].y + vertices[j].y) * cross;
    }

    area /= 2;
    if (Math.abs(area) < 1e-6) {
      // Near-zero area: fall back to simple average
      let sx = 0, sy = 0;
      for (const v of vertices) { sx += v.x; sy += v.y; }
      return { x: sx / n, y: sy / n };
    }

    const factor = 1 / (6 * area);
    return { x: cx * factor, y: cy * factor };
  }

  private _svgToScreen(svgPoint: Coordinates): Coordinates {
    if (!this._svg) return svgPoint;

    const ctm = this._svg.getScreenCTM();
    if (ctm) {
      // Get absolute screen position
      const screenX = ctm.a * svgPoint.x + ctm.c * svgPoint.y + ctm.e;
      const screenY = ctm.b * svgPoint.x + ctm.d * svgPoint.y + ctm.f;
      // Convert to position relative to the SVG element
      const rect = this._svg.getBoundingClientRect();
      return {
        x: screenX - rect.left,
        y: screenY - rect.top,
      };
    }

    // Fallback
    const rect = this._svg.getBoundingClientRect();
    const scaleX = rect.width / this._viewBox.width;
    const scaleY = rect.height / this._viewBox.height;

    return {
      x: (svgPoint.x - this._viewBox.x) * scaleX,
      y: (svgPoint.y - this._viewBox.y) * scaleY,
    };
  }

  private _renderEdgeEditor() {
    if (!this._edgeEditor) return null;

    return html`
      <div class="wall-editor"
           @click=${(e: Event) => e.stopPropagation()}
           @pointerdown=${(e: Event) => e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Wall Properties</span>
          <button class="wall-editor-close" @click=${this._handleEditorCancel}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${this._edgeEditor.edge.link_group ? (() => {
          const floor = currentFloor.value;
          const group = this._edgeEditor!.edge.link_group!;
          const siblingCount = floor
            ? floor.edges.filter(e => e.link_group === group).length
            : 0;
          return html`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${linkGroupColor(group)};">
                <ha-icon icon="mdi:link-variant" style="--mdc-icon-size:14px;"></ha-icon>
                Linked (${siblingCount} walls)
              </span>
              <button
                class="constraint-btn"
                @click=${() => this._unlinkEdges()}
                title="Unlink this wall"
                style="padding:2px 6px; font-size:11px;"
              ><ha-icon icon="mdi:link-variant-off" style="--mdc-icon-size:14px;"></ha-icon></button>
            </div>
          `;
        })() : null}

        ${this._edgeEditor.edge.collinear_group ? (() => {
          const floor = currentFloor.value;
          const cGroup = this._edgeEditor!.edge.collinear_group!;
          const siblingCount = floor
            ? floor.edges.filter(e => e.collinear_group === cGroup).length
            : 0;
          return html`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${linkGroupColor(cGroup)};">
                <ha-icon icon="mdi:vector-line" style="--mdc-icon-size:14px;"></ha-icon>
                Collinear (${siblingCount} walls)
              </span>
              <button
                class="constraint-btn"
                @click=${() => this._collinearUnlinkEdges()}
                title="Remove collinear constraint"
                style="padding:2px 6px; font-size:11px;"
              ><ha-icon icon="mdi:link-variant-off" style="--mdc-icon-size:14px;"></ha-icon></button>
            </div>
          `;
        })() : null}

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Length</span>
          <div class="wall-editor-row">
            <input
              type="number"
              .value=${this._editingLength}
              @input=${(e: InputEvent) => this._editingLength = (e.target as HTMLInputElement).value}
              @keydown=${this._handleEditorKeyDown}
              autofocus
            />
            <span class="wall-editor-unit">cm</span>
            <button
              class="constraint-btn lock-btn ${this._editingLengthLocked ? "active" : ""}"
              @click=${() => { this._editingLengthLocked = !this._editingLengthLocked; }}
              title="${this._editingLengthLocked ? "Unlock length" : "Lock length"}"
            ><ha-icon icon="${this._editingLengthLocked ? "mdi:lock" : "mdi:lock-open-variant"}"></ha-icon></button>
          </div>
        </div>

        ${this._edgeEditor.edge.angle_group ? (() => {
          const floor = currentFloor.value;
          const aGroup = this._edgeEditor!.edge.angle_group!;
          const siblingCount = floor
            ? floor.edges.filter(e => e.angle_group === aGroup).length
            : 0;
          return html`
            <div class="wall-editor-section" style="flex-direction:row; align-items:center; gap:8px;">
              <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; color:${linkGroupColor(aGroup)};">
                <ha-icon icon="mdi:angle-acute" style="--mdc-icon-size:14px;"></ha-icon>
                Angle Group (${siblingCount} walls)
              </span>
              <button
                class="constraint-btn"
                @click=${() => this._angleUnlinkEdges()}
                title="Remove angle constraint"
                style="padding:2px 6px; font-size:11px;"
              ><ha-icon icon="mdi:link-variant-off" style="--mdc-icon-size:14px;"></ha-icon></button>
            </div>
          `;
        })() : null}

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Constraints</span>
          <div class="wall-editor-row">
            <span class="wall-editor-label">Direction</span>
            <div class="wall-editor-constraints">
              <button
                class="constraint-btn ${this._editingDirection === "free" ? "active" : ""}"
                @click=${() => { this._editingDirection = "free"; }}
                title="Free direction"
              >Free</button>
              <button
                class="constraint-btn ${this._editingDirection === "horizontal" ? "active" : ""}"
                @click=${() => { this._editingDirection = "horizontal"; }}
                title="Lock horizontal"
              ><ha-icon icon="mdi:arrow-left-right"></ha-icon> Horizontal</button>
              <button
                class="constraint-btn ${this._editingDirection === "vertical" ? "active" : ""}"
                @click=${() => { this._editingDirection = "vertical"; }}
                title="Lock vertical"
              ><ha-icon icon="mdi:arrow-up-down"></ha-icon> Vertical</button>
            </div>
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleEditorSave}><ha-icon icon="mdi:check"></ha-icon> Apply</button>
          <button class="delete-btn" @click=${this._handleEdgeDelete}><ha-icon icon="mdi:delete-outline"></ha-icon> Delete</button>
        </div>
      </div>
    `;
  }

  /** Apply a direction constraint. Snaps nodes if possible, blinks blockers if not. Always returns true so the direction is persisted. */
  private async _applyDirection(edge: Edge, direction: WallDirection): Promise<boolean> {
    if (!this.hass) return false;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return false;

    // Temporarily clear the edited edge's old constraints so it doesn't block itself
    const edgeCopy = floor.edges.map(e =>
      e.id === edge.id ? { ...e, direction: "free" as const, length_locked: false, angle_group: undefined } : e
    );
    const graph = buildNodeGraph(floor.nodes, edgeCopy);
    const result = solveConstraintSnap(graph, edge.id, direction);

    if (result.blocked) {
      // Blink the blocking edges as feedback, but still allow the direction to be persisted
      if (result.blockedBy) this._blinkEdges(result.blockedBy);
      return true;
    }

    // Apply node position updates from constraint snap
    if (result.updates.length > 0) {
      await this.hass.callWS({
        type: "inhabit/nodes/update",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        updates: result.updates.map((u) => ({
          node_id: u.nodeId,
          x: u.x,
          y: u.y,
        })),
      });
    }

    await reloadFloorData();
    await this._syncRoomsWithEdges();
    return true;
  }


  private _renderNodeEditor() {
    if (!this._nodeEditor) return null;

    const node = this._nodeEditor.node;
    const floor = currentFloor.value;
    const connectedEdgeCount = floor ? edgesAtNode(node.id, floor.edges).length : 0;

    return html`
      <div class="wall-editor"
           @click=${(e: Event) => e.stopPropagation()}
           @pointerdown=${(e: Event) => e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Point Properties</span>
          <button class="wall-editor-close" @click=${() => { this._nodeEditor = null; }}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Position</span>
          <div class="wall-editor-row">
            <span class="wall-editor-label">X</span>
            <input
              type="number"
              .value=${this._nodeEditor.editX}
              @input=${(e: InputEvent) => {
                if (this._nodeEditor) {
                  this._nodeEditor = { ...this._nodeEditor, editX: (e.target as HTMLInputElement).value };
                }
              }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") this._handleNodeEditorSave(); }}
            />
            <span class="wall-editor-unit">cm</span>
          </div>
          <div class="wall-editor-row">
            <span class="wall-editor-label">Y</span>
            <input
              type="number"
              .value=${this._nodeEditor.editY}
              @input=${(e: InputEvent) => {
                if (this._nodeEditor) {
                  this._nodeEditor = { ...this._nodeEditor, editY: (e.target as HTMLInputElement).value };
                }
              }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") this._handleNodeEditorSave(); }}
            />
            <span class="wall-editor-unit">cm</span>
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Pin</span>
          <div class="wall-editor-row">
            <button
              class="constraint-btn ${node.pinned ? "active" : ""}"
              @click=${() => this._toggleNodePin()}
              title="${node.pinned ? "Unpin node" : "Pin node in place"}"
            ><ha-icon icon="${node.pinned ? "mdi:pin" : "mdi:pin-off"}"></ha-icon> ${node.pinned ? "Pinned" : "Unpinned"}</button>
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${() => this._handleNodeEditorSave()}><ha-icon icon="mdi:check"></ha-icon> Apply</button>
          ${connectedEdgeCount === 2 ? html`
            <button class="delete-btn" @click=${() => this._handleNodeDissolve()}><ha-icon icon="mdi:delete-outline"></ha-icon> Dissolve</button>
          ` : null}
        </div>
      </div>
    `;
  }

  private async _handleNodeEditorSave(): Promise<void> {
    if (!this._nodeEditor || !this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const node = this._nodeEditor.node;
    const newX = parseFloat(this._nodeEditor.editX);
    const newY = parseFloat(this._nodeEditor.editY);
    if (isNaN(newX) || isNaN(newY)) return;

    try {
      // Use solver for constraint propagation
      const graph = buildNodeGraph(floor.nodes, floor.edges);
      const result = solveNodeMove(graph, node.id, newX, newY);

      await this.hass.callWS({
        type: "inhabit/nodes/update",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        updates: result.updates.map((u) => ({
          node_id: u.nodeId,
          x: u.x,
          y: u.y,
        })),
      });
      await reloadFloorData();
      await this._syncRoomsWithEdges();
      this._refreshNodeEditor(node.id);
    } catch (err) {
      console.error("Error updating node position:", err);
      alert(`Failed to update node: ${err}`);
    }
  }

  private async _toggleNodePin(): Promise<void> {
    if (!this._nodeEditor || !this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const node = this._nodeEditor.node;
    const newPinned = !node.pinned;

    try {
      await this.hass.callWS({
        type: "inhabit/nodes/update",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        updates: [{
          node_id: node.id,
          x: node.x,
          y: node.y,
          pinned: newPinned,
        }],
      });
      await reloadFloorData();
      this._refreshNodeEditor(node.id);
    } catch (err) {
      console.error("Error toggling node pin:", err);
      alert(`Failed to toggle pin: ${err}`);
    }
  }

  private async _handleNodeDissolve(): Promise<void> {
    if (!this._nodeEditor || !this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    try {
      await this.hass.callWS({
        type: "inhabit/nodes/dissolve",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        node_id: this._nodeEditor.node.id,
      });
      await reloadFloorData();
      await this._syncRoomsWithEdges();
      this._nodeEditor = null;
    } catch (err) {
      console.error("Failed to dissolve node:", err);
      alert(`Failed to dissolve node: ${err}`);
    }
  }

  private _refreshNodeEditor(nodeId: string): void {
    const updatedFloor = currentFloor.value;
    if (updatedFloor) {
      const updatedNode = updatedFloor.nodes.find((n) => n.id === nodeId);
      if (updatedNode) {
        this._nodeEditor = {
          node: updatedNode,
          editX: Math.round(updatedNode.x).toString(),
          editY: Math.round(updatedNode.y).toString(),
        };
      }
    }
  }

  private _getFilteredEntities(): HassEntity[] {
    if (!this.hass) return [];

    const placableDomains = ["light", "switch", "sensor", "binary_sensor", "climate", "fan", "cover", "camera", "media_player"];
    let entities = Object.values(this.hass.states).filter((e) =>
      placableDomains.some((d) => e.entity_id.startsWith(d + "."))
    );

    if (this._entitySearch) {
      const search = this._entitySearch.toLowerCase();
      entities = entities.filter(
        (e) =>
          e.entity_id.toLowerCase().includes(search) ||
          ((e.attributes.friendly_name as string) || "").toLowerCase().includes(search)
      );
    }

    return entities.slice(0, 30);
  }

  private _getEntityIcon(entity: HassEntity): string {
    const domain = entity.entity_id.split(".")[0];
    const iconMap: Record<string, string> = {
      light: "mdi:lightbulb",
      switch: "mdi:toggle-switch",
      sensor: "mdi:eye",
      binary_sensor: "mdi:radiobox-marked",
      climate: "mdi:thermostat",
      fan: "mdi:fan",
      cover: "mdi:window-shutter",
      camera: "mdi:camera",
      media_player: "mdi:cast",
    };
    return (entity.attributes.icon as string) || iconMap[domain] || "mdi:devices";
  }

  private async _placeDevice(entityId: string): Promise<void> {
    if (!this.hass || !this._pendingDevice) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const hass = this.hass;
    const fpId = floorPlan.id;
    const fId = floor.id;
    const position = { ...this._pendingDevice.position };
    const contributesToOccupancy = entityId.startsWith("binary_sensor.") || entityId.startsWith("sensor.");
    const deviceRef = { id: "" };

    try {
      const result = await hass.callWS<{ id: string }>({
        type: "inhabit/devices/place",
        floor_plan_id: fpId,
        floor_id: fId,
        entity_id: entityId,
        position,
        rotation: 0,
        scale: 1,
        show_state: true,
        show_label: true,
        contributes_to_occupancy: contributesToOccupancy,
      });
      deviceRef.id = result.id;
      await reloadFloorData();

      pushAction({
        type: "device_place",
        description: "Place device",
        undo: async () => {
          await hass.callWS({
            type: "inhabit/devices/remove",
            floor_plan_id: fpId,
            device_id: deviceRef.id,
          });
          await reloadFloorData();
        },
        redo: async () => {
          const r = await hass.callWS<{ id: string }>({
            type: "inhabit/devices/place",
            floor_plan_id: fpId,
            floor_id: fId,
            entity_id: entityId,
            position,
            rotation: 0,
            scale: 1,
            show_state: true,
            show_label: true,
            contributes_to_occupancy: contributesToOccupancy,
          });
          deviceRef.id = r.id;
          await reloadFloorData();
        },
      });
    } catch (err) {
      console.error("Error placing device:", err);
      alert(`Failed to place device: ${err}`);
    }

    this._pendingDevice = null;
  }

  private _cancelDevicePlacement(): void {
    this._pendingDevice = null;
  }

  private _renderEntityPicker() {
    if (!this._pendingDevice) return null;

    const screenPos = this._svgToScreen(this._pendingDevice.position);
    const entities = this._getFilteredEntities();

    return html`
      <div class="entity-picker"
           style="left: ${screenPos.x + 20}px; top: ${screenPos.y - 10}px;"
           @click=${(e: Event) => e.stopPropagation()}
           @pointerdown=${(e: Event) => e.stopPropagation()}>
        <input
          type="text"
          placeholder="Search entities..."
          .value=${this._entitySearch}
          @input=${(e: InputEvent) => this._entitySearch = (e.target as HTMLInputElement).value}
          @keydown=${(e: KeyboardEvent) => e.key === "Escape" && this._cancelDevicePlacement()}
          autofocus
        />
        <div class="entity-list">
          ${entities.map(
            (entity) => html`
              <div
                class="entity-item ${entity.state === "on" ? "on" : ""}"
                @click=${() => this._placeDevice(entity.entity_id)}
              >
                <ha-icon icon=${this._getEntityIcon(entity)}></ha-icon>
                <span class="name">${entity.attributes.friendly_name || entity.entity_id}</span>
                <span class="state">${entity.state}</span>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  override render() {
    const mode = this._canvasMode;
    const svgClasses = [
      this._isPanning ? "panning" : "",
      activeTool.value === "select" ? "select-tool" : "",
      mode === "viewing" ? "view-mode" : "",
    ].filter(Boolean).join(" ");

    return html`
      <svg
        class="${svgClasses}"
        viewBox="${viewBoxToString(this._viewBox)}"
        @wheel=${this._handleWheel}
        @pointerdown=${this._handlePointerDown}
        @pointermove=${this._handlePointerMove}
        @pointerup=${this._handlePointerUp}
        @dblclick=${this._handleDblClick}
        @contextmenu=${this._handleContextMenu}
        @keydown=${this._handleKeyDown}
        tabindex="0"
      >
        ${this._renderFloor()}
        ${mode === "walls" ? this._renderEdgeAnnotations() : null}
        ${mode === "walls" ? this._renderAngleConstraints() : null}
        ${mode === "walls" ? this._renderNodeEndpoints() : null}
        ${mode !== "viewing" ? this._renderDrawingPreview() : null}
        ${mode === "placement" ? this._renderDevicePreview() : null}
      </svg>
      ${this._renderEdgeEditor()}
      ${this._renderNodeEditor()}
      ${this._renderMultiEdgeEditor()}
      ${this._renderRoomEditor()}
      ${mode === "placement" ? this._renderEntityPicker() : null}
    `;
  }

  private _renderEdgeAnnotations() {
    const floor = currentFloor.value;
    if (!floor || floor.edges.length === 0) return null;

    const resolved = resolveFloorEdges(floor);

    return svg`
      <g class="wall-annotations-layer">
        ${resolved.map(re => {
          const midX = (re.startPos.x + re.endPos.x) / 2;
          const midY = (re.startPos.y + re.endPos.y) / 2;
          const length = this._calculateWallLength(re.startPos, re.endPos);
          const angle = Math.atan2(re.endPos.y - re.startPos.y, re.endPos.x - re.startPos.x) * (180 / Math.PI);
          const labelAngle = angle > 90 || angle < -90 ? angle + 180 : angle;

          // Build constraint icon paths (24x24 viewBox, rendered at scale 0.35)
          const icons: string[] = [];
          if (re.length_locked) icons.push("M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"); // lock
          // mdi:arrow-left-right (simple horizontal double arrow)
          if (re.direction === "horizontal") icons.push("M6.45,17.45L1,12L6.45,6.55L7.86,7.96L4.83,11H19.17L16.14,7.96L17.55,6.55L23,12L17.55,17.45L16.14,16.04L19.17,13H4.83L7.86,16.04L6.45,17.45Z");
          // mdi:arrow-up-down (simple vertical double arrow)
          if (re.direction === "vertical") icons.push("M17.45,17.55L12,23L6.55,17.55L7.96,16.14L11,19.17V4.83L7.96,7.86L6.55,6.45L12,1L17.45,6.45L16.04,7.86L13,4.83V19.17L16.04,16.14L17.45,17.55Z");

          const label = this._formatLength(length);
          const iconScale = 0.35;
          const iconSize = iconScale * 24; // 8.4px per icon
          const iconGap = 3;
          const iconStep = iconSize + iconGap;
          const iconOffset = label.length * 3.2 + 4;

          const linkDotOffset = -(label.length * 3.2 + 8);
          // Offset label above the wall (perpendicular, in rotated coords negative-y is "above")
          const labelY = -(re.thickness / 2 + 6);

          return svg`
            <g transform="translate(${midX}, ${midY}) rotate(${labelAngle})">
              ${re.link_group ? svg`
                <circle cx="${linkDotOffset}" cy="${labelY - 1}" r="3.5"
                  fill="${linkGroupColor(re.link_group)}"
                  stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
              ` : null}
              ${re.collinear_group ? svg`
                <g transform="translate(${linkDotOffset - (re.link_group ? 10 : 0)}, ${labelY - 1}) rotate(45)">
                  <rect x="-2.8" y="-2.8" width="5.6" height="5.6"
                    fill="${linkGroupColor(re.collinear_group)}"
                    stroke="white" stroke-width="1.5" paint-order="stroke fill"/>
                </g>
              ` : null}
              <text class="wall-annotation-text" x="0" y="${labelY}">${label}</text>
              ${icons.map((d, i) => svg`
                <g transform="translate(${iconOffset + i * iconStep}, ${labelY}) rotate(${-labelAngle}) scale(${iconScale})">
                  <path d="${d}" fill="#666" stroke="white" stroke-width="3" paint-order="stroke fill" transform="translate(-12,-12)"/>
                </g>
              `)}
            </g>
          `;
        })}
      </g>
    `;
  }

  private _renderAngleConstraints() {
    const floor = currentFloor.value;
    if (!floor || floor.edges.length === 0) return null;

    const nodeMap = buildNodeMap(floor.nodes);
    // Group edges by angle_group, then find the shared node for each group
    const groupEdges = new Map<string, Edge[]>();
    for (const edge of floor.edges) {
      if (!edge.angle_group) continue;
      if (!groupEdges.has(edge.angle_group)) groupEdges.set(edge.angle_group, []);
      groupEdges.get(edge.angle_group)!.push(edge);
    }

    // For each angle group pair, find the shared node and draw the indicator there.
    const indicators: Array<{ x: number; y: number; angle1: number; angle2: number }> = [];

    for (const [, edges] of groupEdges) {
      if (edges.length !== 2) continue;

      // Find shared node between the two edges
      const nodes0 = new Set([edges[0].start_node, edges[0].end_node]);
      const nodes1 = new Set([edges[1].start_node, edges[1].end_node]);
      let sharedNodeId: string | null = null;
      for (const n of nodes0) {
        if (nodes1.has(n)) { sharedNodeId = n; break; }
      }
      if (!sharedNodeId) continue;

      const nodeId = sharedNodeId;
      const node = nodeMap.get(nodeId);
      if (!node) continue;

      // Get the outgoing directions from this node
      const dirs: number[] = [];
      for (const edge of edges) {
        const otherId = edge.start_node === nodeId ? edge.end_node : edge.start_node;
        const other = nodeMap.get(otherId);
        if (!other) continue;
        dirs.push(Math.atan2(other.y - node.y, other.x - node.x));
      }

      if (dirs.length < 2) continue;

      // Sort outgoing angles and find the LARGEST gap — that's the room interior.
      // For each adjacent pair in sorted order, the gap between them is a wedge
      // where no wall extends. The largest such gap is the interior.
      dirs.sort((a, b) => a - b);
      const n = dirs.length;

      // With exactly 2 edges: pick the larger of the two gaps
      // With 3+ edges: draw indicator for each gap that is > 180° / n
      // But simplest correct approach: for each adjacent pair, compute the
      // gap (region with no outgoing edge). Draw the indicator in that gap
      // only if the gap angle is <= 180° (skip reflex gaps).
      for (let i = 0; i < n; i++) {
        const a1 = dirs[i];
        const a2 = dirs[(i + 1) % n];
        // Gap = angular region between a1 (CW boundary) and a2 (CCW boundary)
        // going counter-clockwise from a1 to a2
        const gap = ((a2 - a1) + 2 * Math.PI) % (2 * Math.PI);

        // The indicator should be in the gap region, drawn using the
        // inward-facing directions (flip the outgoing edge directions by π).
        // The inward direction of edge at a1 is a1+π, and at a2 is a2+π.
        // The angle between these inward directions = π - gap (supplement).
        const interiorAngle = Math.PI - gap;
        // Skip if the interior angle is negative (gap > π means reflex interior)
        if (interiorAngle < 0.01) continue;

        // The indicator sits in the gap, using inward directions
        const inA = a1 + Math.PI; // inward direction of first wall
        const inB = a2 + Math.PI; // inward direction of second wall
        // Ensure we sweep the short way from inA to inB (should be = interiorAngle)
        const sweepCheck = ((inB - inA) + 2 * Math.PI) % (2 * Math.PI);
        if (sweepCheck > Math.PI + 0.01) {
          // Swap so we go the short way
          indicators.push({ x: node.x, y: node.y, angle1: inB, angle2: inB + (2 * Math.PI - sweepCheck) });
        } else {
          indicators.push({ x: node.x, y: node.y, angle1: inA, angle2: inA + sweepCheck });
        }
      }
    }

    if (indicators.length === 0) return null;

    const r = 12; // arc radius in SVG units

    return svg`
      <g class="angle-constraints-layer">
        ${indicators.map(ind => {
          const a1 = ind.angle1;
          const a2 = ind.angle2;
          const sweep = a2 - a1;
          const deg = (sweep * 180) / Math.PI;
          const isRightAngle = deg > 85 && deg < 95;

          if (isRightAngle) {
            // Draw a small square for right angles
            const sq = r * 0.7;
            const px = ind.x + sq * Math.cos(a1);
            const py = ind.y + sq * Math.sin(a1);
            const qx = ind.x + sq * Math.cos(a2);
            const qy = ind.y + sq * Math.sin(a2);
            const mid = (a1 + a2) / 2;
            const cornerDist = sq / Math.cos(sweep / 2);
            const cx = ind.x + cornerDist * Math.cos(mid);
            const cy = ind.y + cornerDist * Math.sin(mid);
            return svg`
              <path d="M${px},${py} L${cx},${cy} L${qx},${qy}"
                fill="none" stroke="#666" stroke-width="1.5"
                paint-order="stroke fill"/>
            `;
          }

          const x1 = ind.x + r * Math.cos(a1);
          const y1 = ind.y + r * Math.sin(a1);
          const x2 = ind.x + r * Math.cos(a2);
          const y2 = ind.y + r * Math.sin(a2);
          const largeArc = sweep > Math.PI ? 1 : 0;

          return svg`
            <path d="M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2}"
              fill="none" stroke="#666" stroke-width="1.5"/>
          `;
        })}
      </g>
    `;
  }

  private _renderMultiEdgeEditor() {
    if (!this._multiEdgeEditor) return null;

    const edges = this._multiEdgeEditor.edges;
    const isCollinear = this._multiEdgeEditor.collinear ?? false;

    return html`
      <div class="wall-editor"
           @click=${(e: Event) => e.stopPropagation()}
           @pointerdown=${(e: Event) => e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">${edges.length} Walls Selected</span>
          <button class="wall-editor-close" @click=${() => {
            this._multiEdgeEditor = null;
            selection.value = { type: "none", ids: [] };
          }}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>

        ${isCollinear ? html`
          <div class="wall-editor-section">
            <span class="wall-editor-section-label">Total Length</span>
            <div class="wall-editor-row">
              <input
                type="number"
                .value=${this._editingTotalLength}
                @input=${(e: InputEvent) => this._editingTotalLength = (e.target as HTMLInputElement).value}
                @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") this._applyTotalLength(); }}
              />
              <span class="wall-editor-unit">cm</span>
              <button
                class="constraint-btn"
                @click=${() => this._applyTotalLength()}
                title="Apply total length"
              ><ha-icon icon="mdi:check"></ha-icon></button>
            </div>
          </div>
        ` : null}

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Angle Link</span>
          <div class="wall-editor-row">
            ${(() => {
              const aGroups = edges.map(e => e.angle_group).filter(Boolean);
              const allSameAGroup = aGroups.length === edges.length && new Set(aGroups).size === 1;
              if (allSameAGroup) {
                return html`<button
                  class="constraint-btn active"
                  @click=${() => this._angleUnlinkEdges()}
                  title="Remove angle constraint"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Unlink Angle</button>`;
              }
              // Only enable angle link when exactly 2 edges sharing a common node
              const canLink = edges.length === 2 && (() => {
                const nodes0 = new Set([edges[0].start_node, edges[0].end_node]);
                return nodes0.has(edges[1].start_node) || nodes0.has(edges[1].end_node);
              })();
              if (canLink) {
                return html`<button
                  class="constraint-btn"
                  @click=${() => this._angleLinkEdges()}
                  title="Preserve angle between these 2 walls"
                ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`;
              }
              return html`<button
                class="constraint-btn"
                disabled
                title="${edges.length !== 2 ? "Select exactly 2 walls" : "Walls must share a node"}"
              ><ha-icon icon="mdi:angle-acute"></ha-icon> Link Angle</button>`;
            })()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Link Group</span>
          <div class="wall-editor-row">
            ${(() => {
              const groups = edges.map(e => e.link_group).filter(Boolean);
              const allSameGroup = groups.length === edges.length && new Set(groups).size === 1;
              if (allSameGroup) {
                return html`<button
                  class="constraint-btn active"
                  @click=${() => this._unlinkEdges()}
                  title="Unlink these walls"
                ><ha-icon icon="mdi:link-variant-off"></ha-icon> Unlink</button>`;
              }
              return html`<button
                class="constraint-btn"
                @click=${() => this._linkEdges()}
                title="Link these walls so property changes propagate"
              ><ha-icon icon="mdi:link-variant"></ha-icon> Link</button>`;
            })()}
          </div>
        </div>

        <div class="wall-editor-section">
          <span class="wall-editor-section-label">Collinear Link</span>
          <div class="wall-editor-row">
            ${(() => {
              const cGroups = edges.map(e => e.collinear_group).filter(Boolean);
              const allSameCGroup = cGroups.length === edges.length && new Set(cGroups).size === 1;
              if (allSameCGroup) {
                return html`<button
                  class="constraint-btn active"
                  @click=${() => this._collinearUnlinkEdges()}
                  title="Remove collinear constraint"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Unlink Collinear</button>`;
              }
              if (isCollinear) {
                return html`<button
                  class="constraint-btn"
                  @click=${() => this._collinearLinkEdges()}
                  title="Constrain walls to stay on the same line"
                ><ha-icon icon="mdi:vector-line"></ha-icon> Link Collinear</button>`;
              }
              return html`<button
                class="constraint-btn"
                disabled
                title="Walls are not collinear"
              ><ha-icon icon="mdi:vector-line"></ha-icon> Not Collinear</button>`;
            })()}
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="delete-btn" @click=${() => this._handleMultiEdgeDelete()}><ha-icon icon="mdi:delete-outline"></ha-icon> Delete All</button>
        </div>
      </div>
    `;
  }

  private async _angleLinkEdges(): Promise<void> {
    if (!this._multiEdgeEditor || !this.hass) return;
    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const edgeIds = this._multiEdgeEditor.edges.map(e => e.id);
    try {
      await this.hass.callWS({
        type: "inhabit/edges/angle_link",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        edge_ids: edgeIds,
      });
      await reloadFloorData();
      const updatedFloor = currentFloor.value;
      if (updatedFloor) {
        const updatedEdges = edgeIds
          .map(id => updatedFloor.edges.find(e => e.id === id))
          .filter((e): e is Edge => !!e);
        this._multiEdgeEditor = { ...this._multiEdgeEditor, edges: updatedEdges };
      }
    } catch (err) {
      console.error("Error angle linking edges:", err);
    }
  }

  private async _angleUnlinkEdges(): Promise<void> {
    if (!this.hass) return;
    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const edgeIds = this._multiEdgeEditor
      ? this._multiEdgeEditor.edges.map(e => e.id)
      : this._edgeEditor
        ? [this._edgeEditor.edge.id]
        : [];
    if (edgeIds.length === 0) return;

    try {
      await this.hass.callWS({
        type: "inhabit/edges/angle_unlink",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        edge_ids: edgeIds,
      });
      await reloadFloorData();
      const updatedFloor = currentFloor.value;
      if (updatedFloor) {
        if (this._multiEdgeEditor) {
          const updatedEdges = edgeIds
            .map(id => updatedFloor.edges.find(e => e.id === id))
            .filter((e): e is Edge => !!e);
          this._multiEdgeEditor = { ...this._multiEdgeEditor, edges: updatedEdges };
        } else if (this._edgeEditor) {
          const updatedEdge = updatedFloor.edges.find(e => e.id === edgeIds[0]);
          if (updatedEdge) {
            this._edgeEditor = { ...this._edgeEditor, edge: updatedEdge };
          }
        }
      }
    } catch (err) {
      console.error("Error angle unlinking edges:", err);
    }
  }

  private async _linkEdges(): Promise<void> {
    if (!this._multiEdgeEditor || !this.hass) return;
    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const edgeIds = this._multiEdgeEditor.edges.map(e => e.id);
    try {
      await this.hass.callWS({
        type: "inhabit/edges/link",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        edge_ids: edgeIds,
      });
      await reloadFloorData();
      const updatedFloor = currentFloor.value;
      if (updatedFloor) {
        const updatedEdges = edgeIds
          .map(id => updatedFloor.edges.find(e => e.id === id))
          .filter((e): e is Edge => !!e);
        this._multiEdgeEditor = { edges: updatedEdges };
      }
    } catch (err) {
      console.error("Error linking edges:", err);
    }
  }

  private async _unlinkEdges(): Promise<void> {
    if (!this.hass) return;
    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    // Works for both multi-edge and single-edge unlink
    const edgeIds = this._multiEdgeEditor
      ? this._multiEdgeEditor.edges.map(e => e.id)
      : this._edgeEditor
        ? [this._edgeEditor.edge.id]
        : [];
    if (edgeIds.length === 0) return;

    try {
      await this.hass.callWS({
        type: "inhabit/edges/unlink",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        edge_ids: edgeIds,
      });
      await reloadFloorData();
      const updatedFloor = currentFloor.value;
      if (updatedFloor) {
        if (this._multiEdgeEditor) {
          const updatedEdges = edgeIds
            .map(id => updatedFloor.edges.find(e => e.id === id))
            .filter((e): e is Edge => !!e);
          this._multiEdgeEditor = { edges: updatedEdges };
        } else if (this._edgeEditor) {
          const updatedEdge = updatedFloor.edges.find(e => e.id === edgeIds[0]);
          if (updatedEdge) {
            this._edgeEditor = { ...this._edgeEditor, edge: updatedEdge };
          }
        }
      }
    } catch (err) {
      console.error("Error unlinking edges:", err);
    }
  }

  private async _applyTotalLength(): Promise<void> {
    if (!this._multiEdgeEditor || !this.hass) return;
    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const newTotal = parseFloat(this._editingTotalLength);
    if (isNaN(newTotal) || newTotal <= 0) return;

    const edgeIds = this._multiEdgeEditor.edges.map(e => e.id);
    const graph = buildNodeGraph(floor.nodes, floor.edges);
    const result = solveCollinearTotalLength(graph, edgeIds, newTotal);

    if (result.blocked) {
      if (result.blockedBy) this._blinkEdges(result.blockedBy);
      return;
    }

    if (result.updates.length === 0) return;

    try {
      await this.hass.callWS({
        type: "inhabit/nodes/update",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        updates: result.updates.map(u => ({ node_id: u.nodeId, x: u.x, y: u.y })),
      });
      await reloadFloorData();
      // Refresh multi-edge editor
      const updatedFloor = currentFloor.value;
      if (updatedFloor) {
        this._updateEdgeEditorForSelection(edgeIds);
      }
    } catch (err) {
      console.error("Error applying total length:", err);
    }
  }

  private async _collinearLinkEdges(): Promise<void> {
    if (!this._multiEdgeEditor || !this.hass) return;
    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const edgeIds = this._multiEdgeEditor.edges.map(e => e.id);
    try {
      await this.hass.callWS({
        type: "inhabit/edges/collinear_link",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        edge_ids: edgeIds,
      });
      await reloadFloorData();
      const updatedFloor = currentFloor.value;
      if (updatedFloor) {
        const updatedEdges = edgeIds
          .map(id => updatedFloor.edges.find(e => e.id === id))
          .filter((e): e is Edge => !!e);
        this._multiEdgeEditor = { ...this._multiEdgeEditor, edges: updatedEdges };
      }
    } catch (err) {
      console.error("Error collinear linking edges:", err);
    }
  }

  private async _collinearUnlinkEdges(): Promise<void> {
    if (!this.hass) return;
    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const edgeIds = this._multiEdgeEditor
      ? this._multiEdgeEditor.edges.map(e => e.id)
      : this._edgeEditor
        ? [this._edgeEditor.edge.id]
        : [];
    if (edgeIds.length === 0) return;

    try {
      await this.hass.callWS({
        type: "inhabit/edges/collinear_unlink",
        floor_plan_id: floorPlan.id,
        floor_id: floor.id,
        edge_ids: edgeIds,
      });
      await reloadFloorData();
      const updatedFloor = currentFloor.value;
      if (updatedFloor) {
        if (this._multiEdgeEditor) {
          const updatedEdges = edgeIds
            .map(id => updatedFloor.edges.find(e => e.id === id))
            .filter((e): e is Edge => !!e);
          this._multiEdgeEditor = { ...this._multiEdgeEditor, edges: updatedEdges };
        } else if (this._edgeEditor) {
          const updatedEdge = updatedFloor.edges.find(e => e.id === edgeIds[0]);
          if (updatedEdge) {
            this._edgeEditor = { ...this._edgeEditor, edge: updatedEdge };
          }
        }
      }
    } catch (err) {
      console.error("Error collinear unlinking edges:", err);
    }
  }

  private async _handleMultiEdgeDelete(): Promise<void> {
    if (!this._multiEdgeEditor || !this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const edges = this._multiEdgeEditor.edges;

    try {
      for (const edge of edges) {
        await this.hass.callWS({
          type: "inhabit/edges/delete",
          floor_plan_id: floorPlan.id,
          floor_id: floor.id,
          edge_id: edge.id,
        });
      }
      await reloadFloorData();
      await this._syncRoomsWithEdges();
    } catch (err) {
      console.error("Error deleting edges:", err);
    }

    this._multiEdgeEditor = null;
    selection.value = { type: "none", ids: [] };
  }

  private _renderDevicePreview() {
    const tool = activeTool.value;
    if (tool !== "device" || this._pendingDevice) return null;

    // Show a preview cursor at the snapped position
    return svg`
      <g class="device-preview">
        <circle
          cx="${this._cursorPos.x}"
          cy="${this._cursorPos.y}"
          r="12"
          fill="var(--primary-color, #2196f3)"
          fill-opacity="0.3"
          stroke="var(--primary-color, #2196f3)"
          stroke-width="2"
          stroke-dasharray="4,2"
        />
        <circle
          cx="${this._cursorPos.x}"
          cy="${this._cursorPos.y}"
          r="3"
          fill="var(--primary-color, #2196f3)"
        />
      </g>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "fpb-canvas": FpbCanvas;
  }
}
