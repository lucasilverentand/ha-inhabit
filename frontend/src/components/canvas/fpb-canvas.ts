/**
 * SVG Canvas Component with pan/zoom and wall-based room creation
 */

import { LitElement, html, css, svg } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { effect } from "@preact/signals-core";
import type { HomeAssistant, Coordinates, ViewBox, Wall } from "../../types";
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
  reloadFloorData,
} from "../../ha-floorplan-builder";
import { polygonToPath, viewBoxToString, groupWallsIntoChains, wallChainPath } from "../../utils/svg";
import { snapToGrid as snapPoint } from "../../utils/geometry";
import { buildConnectionGraph, solveWallLengthChange, solveWallMovement, solveConstraintSnap, previewEndpointDrag } from "../../utils/wall-solver";
import { pushAction, undo, redo } from "../../stores/history-store";

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
  private _hoveredEndpoint: { coords: Coordinates; wallIds: string[] } | null = null;

  @state()
  private _draggingEndpoint: { coords: Coordinates; wallIds: string[]; originalCoords: Coordinates; startX: number; startY: number; hasMoved: boolean } | null = null;

  @state()
  private _wallEditor: { wall: Wall; position: Coordinates; length: number } | null = null;

  @state()
  private _editingLength: string = "";

  @state()
  private _pendingDevice: { position: Coordinates } | null = null;

  @state()
  private _entitySearch: string = "";

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
    }

    svg:focus {
      outline: none;
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
      pointer-events: none;
    }

    .wall-selected-highlight {
      fill: var(--primary-color, #2196f3);
      stroke: none;
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
      fill: var(--primary-color, #2196f3);
      stroke: white;
      stroke-width: 2;
      cursor: pointer;
    }

    .wall-endpoint.dragging {
      cursor: grabbing;
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
      width: 280px;
      background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .wall-editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .wall-editor-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color, #333);
    }

    .wall-editor-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--secondary-text-color, #666);
      font-size: 16px;
      line-height: 1;
    }

    .wall-editor-close:hover {
      color: var(--primary-text-color, #333);
    }

    .wall-editor-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .wall-editor-label {
      font-size: 12px;
      color: var(--secondary-text-color, #666);
      min-width: 50px;
    }

    .wall-editor input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 6px;
      font-size: 14px;
      background: var(--primary-background-color, white);
      color: var(--primary-text-color, #333);
    }

    .wall-editor input:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
    }

    .wall-editor-unit {
      font-size: 12px;
      color: var(--secondary-text-color, #666);
    }

    .wall-editor-constraints {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .wall-editor .constraint-btn {
      padding: 6px 10px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 6px;
      background: var(--secondary-background-color, #e0e0e0);
      color: var(--primary-text-color, #333);
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .wall-editor .constraint-btn:hover {
      background: var(--primary-color, #2196f3);
      color: white;
      border-color: var(--primary-color, #2196f3);
    }

    .wall-editor .constraint-btn.active {
      background: var(--primary-color, #2196f3);
      color: white;
      border-color: var(--primary-color, #2196f3);
    }

    .wall-editor-actions {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }

    .wall-editor-actions button {
      flex: 1;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    }

    .wall-editor .save-btn {
      background: var(--primary-color, #2196f3);
      color: white;
    }

    .wall-editor .save-btn:hover {
      opacity: 0.9;
    }

    .wall-editor .delete-btn {
      background: var(--error-color, #f44336);
      color: white;
    }

    .wall-editor .delete-btn:hover {
      opacity: 0.9;
    }

    .entity-picker {
      position: absolute;
      background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 100;
      width: 250px;
      max-height: 300px;
      display: flex;
      flex-direction: column;
    }

    .entity-picker input {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 4px;
      font-size: 14px;
      background: var(--primary-background-color, white);
      color: var(--primary-text-color, #333);
      box-sizing: border-box;
      margin-bottom: 8px;
    }

    .entity-picker input:focus {
      outline: none;
      border-color: var(--primary-color, #2196f3);
    }

    .entity-list {
      overflow-y: auto;
      max-height: 220px;
    }

    .entity-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }

    .entity-item:hover {
      background: var(--secondary-background-color, #f0f0f0);
    }

    .entity-item ha-icon {
      --mdc-icon-size: 18px;
      color: var(--secondary-text-color, #666);
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
      color: var(--secondary-text-color, #666);
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

    const tool = activeTool.value;

    // Left click behavior depends on tool
    if (e.button === 0) {
      if (tool === "select") {
        // Close wall editor first (will be reopened if clicking on a wall)
        const hadEditor = !!this._wallEditor;
        this._wallEditor = null;

        // Check if clicking on something selectable
        const clickedSomething = this._handleSelectClick(point);
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
        this._wallEditor = null;
        // Use _cursorPos which has Shift-constraint applied from pointer move
        const wallPoint = this._wallStartPoint && e.shiftKey
          ? this._cursorPos
          : snappedPoint;
        this._handleWallClick(wallPoint, e.shiftKey);
      } else if (tool === "room" || tool === "polygon") {
        this._wallEditor = null;
        this._handlePolygonClick(snappedPoint);
      } else if (tool === "device") {
        this._wallEditor = null;
        this._handleDeviceClick(snappedPoint);
      } else {
        // Other tools - pan on empty space
        this._wallEditor = null;
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
    // Enable wall segment snapping for device tool
    let snapped = this._getSnappedPoint(point, tool === "device");

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

    // Handle endpoint dragging
    if (this._draggingEndpoint) {
      // Check if we've moved enough to count as a drag (not just a click)
      const dx = e.clientX - this._draggingEndpoint.startX;
      const dy = e.clientY - this._draggingEndpoint.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        this._draggingEndpoint.hasMoved = true;
      }

      // Snap to 1cm (integer coordinates) and other endpoints while dragging
      this._cursorPos = this._getSnappedPointForEndpoint(point);
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

    // Check for hovering over wall endpoints (only when not drawing)
    if (!this._wallStartPoint && tool === "select") {
      this._checkEndpointHover(point);
    }
  }

  private _checkEndpointHover(point: Coordinates): void {
    const endpoints = this._getWallEndpoints();
    const hoverDistance = 15;

    for (const ep of endpoints.values()) {
      const dist = Math.sqrt(
        Math.pow(point.x - ep.coords.x, 2) + Math.pow(point.y - ep.coords.y, 2)
      );
      if (dist < hoverDistance) {
        this._hoveredEndpoint = ep;
        return;
      }
    }

    this._hoveredEndpoint = null;
  }

  private _handlePointerUp(e: PointerEvent): void {
    if (this._draggingEndpoint) {
      if (this._draggingEndpoint.hasMoved) {
        // It was a drag - move the endpoint
        this._finishEndpointDrag();
      } else {
        // It was a click - start a new wall from this point
        this._startWallFromEndpoint();
      }
      this._svg?.releasePointerCapture(e.pointerId);
      return;
    }

    if (this._isPanning) {
      this._isPanning = false;
      this._svg?.releasePointerCapture(e.pointerId);
    }
  }

  private _startWallFromEndpoint(): void {
    if (!this._draggingEndpoint) return;

    // Start drawing a new wall from this endpoint
    this._wallStartPoint = this._draggingEndpoint.originalCoords;
    activeTool.value = "wall";
    this._draggingEndpoint = null;
    this._hoveredEndpoint = null;
  }

  private async _finishEndpointDrag(): Promise<void> {
    if (!this._draggingEndpoint || !this.hass) {
      this._draggingEndpoint = null;
      return;
    }

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) {
      this._draggingEndpoint = null;
      return;
    }

    const newPos = this._cursorPos;
    const originalPos = this._draggingEndpoint.originalCoords;

    // Check if position actually changed
    if (Math.abs(newPos.x - originalPos.x) < 1 && Math.abs(newPos.y - originalPos.y) < 1) {
      this._draggingEndpoint = null;
      return;
    }

    // Use the wall solver for constraint-aware movement
    const graph = buildConnectionGraph(floor.walls);
    const draggedWallIds = this._draggingEndpoint.wallIds.map((ref) => ref.split(":")[0]);

    const result = solveWallMovement(
      graph,
      draggedWallIds,
      "start", // The endpoint type is determined by position matching in the solver
      originalPos,
      newPos
    );

    if (result.blocked) {
      alert(`Cannot move endpoint: wall "${result.blockedBy}" is locked.`);
      this._draggingEndpoint = null;
      return;
    }

    if (result.updates.length === 0) {
      this._draggingEndpoint = null;
      return;
    }

    const affectedIds = result.updates.map((u) => u.wallId);

    try {
      await this._withWallUndo(affectedIds, "Move wall endpoint", async () => {
        if (result.updates.length > 1) {
          await this.hass!.callWS({
            type: "inhabit/walls/batch_update",
            floor_plan_id: floorPlan.id,
            floor_id: floor.id,
            updates: result.updates.map((u) => ({
              wall_id: u.wallId,
              start: u.newStart,
              end: u.newEnd,
            })),
          });
        } else {
          const update = result.updates[0];
          await this.hass!.callWS({
            type: "inhabit/walls/update",
            floor_plan_id: floorPlan.id,
            floor_id: floor.id,
            wall_id: update.wallId,
            start: update.newStart,
            end: update.newEnd,
          });
        }
        await reloadFloorData();
      });
    } catch (err) {
      console.error("Error updating wall endpoint:", err);
      alert(`Failed to update wall: ${err}`);
    }

    this._draggingEndpoint = null;
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this._wallStartPoint = null;
      this._drawingPoints = [];
      this._hoveredEndpoint = null;
      this._draggingEndpoint = null;
      this._pendingDevice = null;
      this._wallEditor = null;
      selection.value = { type: "none", ids: [] };
      activeTool.value = "select";
    } else if ((e.key === "Backspace" || e.key === "Delete") && this._wallEditor) {
      e.preventDefault();
      this._handleWallDelete();
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

  private _handleEditorSave(): void {
    if (!this._wallEditor) return;

    const newLength = parseFloat(this._editingLength);
    if (isNaN(newLength) || newLength <= 0) {
      return;
    }

    this._updateWallLength(this._wallEditor.wall, newLength);
    this._wallEditor = null;
  }

  private _handleEditorCancel(): void {
    this._wallEditor = null;
    selection.value = { type: "none", ids: [] };
  }

  private async _handleWallDelete(): Promise<void> {
    if (!this._wallEditor || !this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const hass = this.hass;
    const fpId = floorPlan.id;
    const fId = floor.id;
    const wall = this._wallEditor.wall;
    const snapshot = {
      start: { ...wall.start },
      end: { ...wall.end },
      thickness: wall.thickness,
      is_exterior: wall.is_exterior,
      length_locked: wall.length_locked,
      direction: wall.direction,
    };
    const wallRef = { id: wall.id };

    try {
      await hass.callWS({
        type: "inhabit/walls/delete",
        floor_plan_id: fpId,
        floor_id: fId,
        wall_id: wallRef.id,
      });
      await reloadFloorData();

      pushAction({
        type: "wall_delete",
        description: "Delete wall",
        undo: async () => {
          const r = await hass.callWS<{ id: string }>({
            type: "inhabit/walls/add",
            floor_plan_id: fpId,
            floor_id: fId,
            ...snapshot,
          });
          wallRef.id = r.id;
          await reloadFloorData();
        },
        redo: async () => {
          await hass.callWS({
            type: "inhabit/walls/delete",
            floor_plan_id: fpId,
            floor_id: fId,
            wall_id: wallRef.id,
          });
          await reloadFloorData();
        },
      });
    } catch (err) {
      console.error("Error deleting wall:", err);
    }

    this._wallEditor = null;
    selection.value = { type: "none", ids: [] };
  }

  private _handleEditorKeyDown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      this._handleEditorSave();
    } else if (e.key === "Escape") {
      this._handleEditorCancel();
    }
  }

  private async _withWallUndo(
    wallIds: string[],
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

    // Snapshot wall states before
    const before = new Map<string, { start: Coordinates; end: Coordinates; length_locked: boolean; direction: import("../../types").WallDirection }>();
    for (const id of wallIds) {
      const w = floor.walls.find((w) => w.id === id);
      if (w) {
        before.set(id, { start: { ...w.start }, end: { ...w.end }, length_locked: w.length_locked, direction: w.direction });
      }
    }

    await perform();

    // Capture new states after reload
    const updatedFloor = currentFloor.value;
    if (!updatedFloor) return;

    const after = new Map<string, { start: Coordinates; end: Coordinates; length_locked: boolean; direction: import("../../types").WallDirection }>();
    for (const id of wallIds) {
      const w = updatedFloor.walls.find((w) => w.id === id);
      if (w) {
        after.set(id, { start: { ...w.start }, end: { ...w.end }, length_locked: w.length_locked, direction: w.direction });
      }
    }

    const restoreStates = async (states: Map<string, { start: Coordinates; end: Coordinates; length_locked: boolean; direction: import("../../types").WallDirection }>) => {
      const updates = Array.from(states.entries()).map(([wall_id, s]) => ({
        wall_id,
        start: s.start,
        end: s.end,
        length_locked: s.length_locked,
        direction: s.direction,
      }));
      if (updates.length > 1) {
        await hass.callWS({
          type: "inhabit/walls/batch_update",
          floor_plan_id: fpId,
          floor_id: fId,
          updates,
        });
      } else if (updates.length === 1) {
        const u = updates[0];
        await hass.callWS({
          type: "inhabit/walls/update",
          floor_plan_id: fpId,
          floor_id: fId,
          ...u,
        });
      }
      await reloadFloorData();
    };

    pushAction({
      type: "wall_update",
      description,
      undo: () => restoreStates(before),
      redo: () => restoreStates(after),
    });
  }

  private async _updateWallLength(wall: Wall, newLength: number): Promise<void> {
    if (!this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    // Use the wall solver for center-based length editing
    const graph = buildConnectionGraph(floor.walls);
    const result = solveWallLengthChange(graph, wall.id, newLength);

    if (result.blocked) {
      alert(`Cannot change length: wall "${result.blockedBy}" has a constraint that blocks this change.`);
      return;
    }

    if (result.updates.length === 0) return;

    const affectedIds = result.updates.map((u) => u.wallId);

    try {
      await this._withWallUndo(affectedIds, "Change wall length", async () => {
        if (result.updates.length > 1) {
          await this.hass!.callWS({
            type: "inhabit/walls/batch_update",
            floor_plan_id: floorPlan.id,
            floor_id: floor.id,
            updates: result.updates.map((u) => ({
              wall_id: u.wallId,
              start: u.newStart,
              end: u.newEnd,
            })),
          });
        } else {
          const update = result.updates[0];
          await this.hass!.callWS({
            type: "inhabit/walls/update",
            floor_plan_id: floorPlan.id,
            floor_id: floor.id,
            wall_id: update.wallId,
            start: update.newStart,
            end: update.newEnd,
          });
        }
        await reloadFloorData();
      });
    } catch (err) {
      console.error("Error updating wall:", err);
      alert(`Failed to update wall: ${err}`);
    }

    selection.value = { type: "none", ids: [] };
  }

  private _getSnappedPointForEndpoint(point: Coordinates): Coordinates {
    const floor = currentFloor.value;

    // First check for snapping to other wall endpoints
    if (floor) {
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
    }

    // Snap to 1cm (round to nearest integer)
    return {
      x: Math.round(point.x),
      y: Math.round(point.y),
    };
  }

  private _getSnappedPoint(point: Coordinates, snapToWallSegments = false): Coordinates {
    const floor = currentFloor.value;
    if (!floor) return snapToGrid.value ? snapPoint(point, gridSize.value) : point;

    const snapDistance = 15;

    // Snap to existing wall endpoints first (highest priority)
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

    // Snap to wall segments (for device placement)
    if (snapToWallSegments) {
      let closestPoint: Coordinates | null = null;
      let closestDist = snapDistance;

      for (const wall of floor.walls) {
        const snapped = this._getClosestPointOnSegment(point, wall.start, wall.end);
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

  private _handleSelectClick(point: Coordinates): boolean {
    const floor = currentFloor.value;
    if (!floor) return false;

    // Check walls first (they're on top visually)
    for (const wall of floor.walls) {
      const dist = this._pointToSegmentDistance(point, wall.start, wall.end);
      if (dist < (wall.thickness / 2 + 5)) {
        selection.value = { type: "wall", ids: [wall.id] };
        // Show wall editor
        const currentLength = this._calculateWallLength(wall.start, wall.end);
        const midpoint: Coordinates = {
          x: (wall.start.x + wall.end.x) / 2,
          y: (wall.start.y + wall.end.y) / 2,
        };
        this._wallEditor = {
          wall,
          position: midpoint,
          length: currentLength,
        };
        this._editingLength = Math.round(currentLength).toString();
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
        return true;
      }
    }

    selection.value = { type: "none", ids: [] };
    return false;
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
      this._wallStartPoint = point;
    } else {
      // Determine direction constraint from shift key
      let direction: import("../../types").WallDirection = "free";
      if (shiftHeld) {
        const dx = Math.abs(point.x - this._wallStartPoint.x);
        const dy = Math.abs(point.y - this._wallStartPoint.y);
        direction = dx >= dy ? "horizontal" : "vertical";
      }
      this._completeWall(this._wallStartPoint, point, direction);
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

  private async _completeWall(start: Coordinates, end: Coordinates, direction: import("../../types").WallDirection = "free"): Promise<void> {
    if (!this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const hass = this.hass;
    const fpId = floorPlan.id;
    const fId = floor.id;
    const wallRef = { id: "" };

    try {
      const result = await hass.callWS<{ id: string }>({
        type: "inhabit/walls/add",
        floor_plan_id: fpId,
        floor_id: fId,
        start,
        end,
        thickness: 8,
        direction,
      });
      wallRef.id = result.id;
      await reloadFloorData();

      pushAction({
        type: "wall_add",
        description: "Add wall",
        undo: async () => {
          await hass.callWS({
            type: "inhabit/walls/delete",
            floor_plan_id: fpId,
            floor_id: fId,
            wall_id: wallRef.id,
          });
          await reloadFloorData();
        },
        redo: async () => {
          const r = await hass.callWS<{ id: string }>({
            type: "inhabit/walls/add",
            floor_plan_id: fpId,
            floor_id: fId,
            start,
            end,
            thickness: 8,
            direction,
          });
          wallRef.id = r.id;
          await reloadFloorData();
        },
      });
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

    const hass = this.hass;
    const fpId = floorPlan.id;
    const fId = floor.id;
    const color = this._getRandomRoomColor();
    const roomRef = { id: "" };

    try {
      const result = await hass.callWS<{ id: string }>({
        type: "inhabit/rooms/add",
        floor_plan_id: fpId,
        floor_id: fId,
        name: roomName,
        polygon: { vertices: polygon },
        color,
        ha_area_id: haAreaId,
      });
      roomRef.id = result.id;
      await reloadFloorData();

      pushAction({
        type: "room_add",
        description: "Add room",
        undo: async () => {
          await hass.callWS({
            type: "inhabit/rooms/delete",
            floor_plan_id: fpId,
            room_id: roomRef.id,
          });
          await reloadFloorData();
        },
        redo: async () => {
          const r = await hass.callWS<{ id: string }>({
            type: "inhabit/rooms/add",
            floor_plan_id: fpId,
            floor_id: fId,
            name: roomName,
            polygon: { vertices: polygon },
            color,
            ha_area_id: haAreaId,
          });
          roomRef.id = r.id;
          await reloadFloorData();
        },
      });
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

    const hass = this.hass;
    const fpId = floorPlan.id;
    const fId = floor.id;
    const vertices = [...this._drawingPoints];
    const color = this._getRandomRoomColor();
    const roomRef = { id: "" };

    try {
      const result = await hass.callWS<{ id: string }>({
        type: "inhabit/rooms/add",
        floor_plan_id: fpId,
        floor_id: fId,
        name: roomName,
        polygon: { vertices },
        color,
        ha_area_id: haAreaId,
      });
      roomRef.id = result.id;

      this._drawingPoints = [];
      await reloadFloorData();

      pushAction({
        type: "room_add",
        description: "Add room",
        undo: async () => {
          await hass.callWS({
            type: "inhabit/rooms/delete",
            floor_plan_id: fpId,
            room_id: roomRef.id,
          });
          await reloadFloorData();
        },
        redo: async () => {
          const r = await hass.callWS<{ id: string }>({
            type: "inhabit/rooms/add",
            floor_plan_id: fpId,
            floor_id: fId,
            name: roomName,
            polygon: { vertices },
            color,
            ha_area_id: haAreaId,
          });
          roomRef.id = r.id;
          await reloadFloorData();
        },
      });
    } catch (err) {
      console.error("Error creating room:", err);
      alert(`Failed to create room: ${err}`);
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

  private _renderWallChains(walls: Wall[], sel: import("../../types").SelectionState) {
    // If dragging an endpoint, use the solver to preview all affected walls
    let wallsToRender = walls;
    if (this._draggingEndpoint) {
      const draggedPos = this._cursorPos;
      const draggedWallIds = this._draggingEndpoint.wallIds.map((ref) => ref.split(":")[0]);
      const preview = previewEndpointDrag(
        walls,
        this._draggingEndpoint.originalCoords,
        draggedPos,
        draggedWallIds
      );

      wallsToRender = walls.map(wall => {
        const p = preview.get(wall.id);
        if (p) {
          return { ...wall, start: p.start, end: p.end };
        }
        return wall;
      });
    }

    const chains = groupWallsIntoChains(wallsToRender);

    // Find the selected wall for individual highlight
    const selectedWall = sel.type === "wall" && sel.ids.length > 0
      ? wallsToRender.find(w => w.id === sel.ids[0])
      : null;

    return svg`
      <!-- Base walls rendered as chains for proper corners -->
      ${chains.map((chain, idx) => svg`
        <path class="wall"
              d="${wallChainPath(chain)}"
              data-chain-idx="${idx}"/>
      `)}

      <!-- Individual selected wall highlight -->
      ${selectedWall ? svg`
        <path class="wall-selected-highlight"
              d="${this._singleWallPath(selectedWall)}"/>
      ` : null}
    `;
  }

  private _singleWallPath(wall: Wall): string {
    const { start, end, thickness } = wall;
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

          <!-- Walls (rendered as chains for proper corners) -->
          ${this._renderWallChains(floor.walls, sel)}

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

  private _getWallEndpoints(): Map<string, { coords: Coordinates; wallIds: string[] }> {
    const floor = currentFloor.value;
    if (!floor) return new Map();

    const endpoints: Map<string, { coords: Coordinates; wallIds: string[] }> = new Map();

    for (const wall of floor.walls) {
      const startKey = `${Math.round(wall.start.x)},${Math.round(wall.start.y)}`;
      const endKey = `${Math.round(wall.end.x)},${Math.round(wall.end.y)}`;

      if (!endpoints.has(startKey)) {
        endpoints.set(startKey, { coords: wall.start, wallIds: [] });
      }
      endpoints.get(startKey)!.wallIds.push(wall.id + ":start");

      if (!endpoints.has(endKey)) {
        endpoints.set(endKey, { coords: wall.end, wallIds: [] });
      }
      endpoints.get(endKey)!.wallIds.push(wall.id + ":end");
    }

    return endpoints;
  }

  private _renderWallEndpoints() {
    const floor = currentFloor.value;
    if (!floor || floor.walls.length === 0) return null;

    // Only show the hovered endpoint or the one being dragged
    const endpointsToShow: Array<{ coords: Coordinates; wallIds: string[]; isDragging: boolean }> = [];

    if (this._draggingEndpoint) {
      endpointsToShow.push({
        coords: this._cursorPos, // Show at cursor position while dragging
        wallIds: this._draggingEndpoint.wallIds,
        isDragging: true,
      });
    } else if (this._hoveredEndpoint) {
      endpointsToShow.push({
        coords: this._hoveredEndpoint.coords,
        wallIds: this._hoveredEndpoint.wallIds,
        isDragging: false,
      });
    }

    if (endpointsToShow.length === 0) return null;

    return svg`
      <g class="wall-endpoints-layer">
        ${endpointsToShow.map((ep) => svg`
          <circle
            class="wall-endpoint ${ep.isDragging ? "dragging" : ""}"
            cx="${ep.coords.x}"
            cy="${ep.coords.y}"
            r="6"
            @pointerdown=${(e: PointerEvent) => this._handleEndpointPointerDown(e, ep)}
          />
        `)}
        ${this._draggingEndpoint ? this._renderDraggedWallLengths(floor) : null}
      </g>
    `;
  }

  private _renderDraggedWallLengths(floor: import("../../types").Floor) {
    if (!this._draggingEndpoint) return null;

    const draggedPos = this._cursorPos;
    const draggedWallIds = this._draggingEndpoint.wallIds.map((ref) => ref.split(":")[0]);
    const preview = previewEndpointDrag(
      floor.walls,
      this._draggingEndpoint.originalCoords,
      draggedPos,
      draggedWallIds
    );

    const wallData: Array<{
      start: Coordinates;
      end: Coordinates;
      origStart: Coordinates;
      origEnd: Coordinates;
      length: number;
      angle: number;
      thickness: number
    }> = [];

    for (const [wallId, positions] of preview) {
      const wall = floor.walls.find(w => w.id === wallId);
      if (!wall) continue;

      const length = this._calculateWallLength(positions.start, positions.end);
      const angle = Math.atan2(positions.end.y - positions.start.y, positions.end.x - positions.start.x);

      wallData.push({
        start: positions.start,
        end: positions.end,
        origStart: wall.start,
        origEnd: wall.end,
        length,
        angle,
        thickness: wall.thickness,
      });
    }

    // Check for 90-degree angles between walls at the dragged point
    const rightAngles: Array<{ point: Coordinates; angle: number }> = [];
    for (let i = 0; i < wallData.length; i++) {
      for (let j = i + 1; j < wallData.length; j++) {
        const angleDiff = Math.abs(wallData[i].angle - wallData[j].angle);
        const normalizedDiff = angleDiff % Math.PI;
        // Check if angle is close to 90 degrees (PI/2)
        if (Math.abs(normalizedDiff - Math.PI / 2) < 0.02) { // ~1 degree tolerance
          rightAngles.push({
            point: draggedPos,
            angle: Math.min(wallData[i].angle, wallData[j].angle),
          });
        }
      }
    }

    return svg`
      <!-- Original wall positions (ghost) -->
      ${wallData.map(({ origStart, origEnd, thickness }) => {
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

      <!-- Wall length labels -->
      ${wallData.map(({ start, end, length }) => {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        // Calculate angle for label rotation
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

  private _handleEndpointPointerDown(e: PointerEvent, endpoint: { coords: Coordinates; wallIds: string[] }): void {
    e.stopPropagation();
    e.preventDefault();

    // Get the original coords from hovered endpoint (not the display coords which might be cursor pos)
    const originalCoords = this._hoveredEndpoint?.coords || endpoint.coords;

    this._draggingEndpoint = {
      coords: originalCoords,
      wallIds: endpoint.wallIds,
      originalCoords: { ...originalCoords },
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

  private _renderWallEditor() {
    if (!this._wallEditor) return null;

    const wall = this._wallEditor.wall;

    return html`
      <div class="wall-editor"
           @click=${(e: Event) => e.stopPropagation()}
           @pointerdown=${(e: Event) => e.stopPropagation()}>
        <div class="wall-editor-header">
          <span class="wall-editor-title">Wall Properties</span>
          <button class="wall-editor-close" @click=${this._handleEditorCancel}>✕</button>
        </div>

        <div class="wall-editor-row">
          <span class="wall-editor-label">Length</span>
          <input
            type="number"
            .value=${this._editingLength}
            @input=${(e: InputEvent) => this._editingLength = (e.target as HTMLInputElement).value}
            @keydown=${this._handleEditorKeyDown}
            ?disabled=${wall.length_locked}
            autofocus
          />
          <span class="wall-editor-unit">cm</span>
          <button
            class="constraint-btn ${wall.length_locked ? "active" : ""}"
            @click=${() => this._toggleLengthLock()}
            title="${wall.length_locked ? "Unlock length" : "Lock length"}"
          >${wall.length_locked ? "🔒" : "🔓"}</button>
        </div>

        <div class="wall-editor-row">
          <span class="wall-editor-label">Direction</span>
          <div class="wall-editor-constraints">
            <button
              class="constraint-btn ${wall.direction === "free" ? "active" : ""}"
              @click=${() => this._setDirection("free")}
              title="Free direction"
            >Free</button>
            <button
              class="constraint-btn ${wall.direction === "horizontal" ? "active" : ""}"
              @click=${() => this._setDirection("horizontal")}
              title="Lock horizontal"
            ><span>―</span> H</button>
            <button
              class="constraint-btn ${wall.direction === "vertical" ? "active" : ""}"
              @click=${() => this._setDirection("vertical")}
              title="Lock vertical"
            ><span>|</span> V</button>
          </div>
        </div>

        <div class="wall-editor-actions">
          <button class="save-btn" @click=${this._handleEditorSave}>Apply</button>
          <button class="delete-btn" @click=${this._handleWallDelete}>Delete</button>
        </div>
      </div>
    `;
  }

  private async _toggleLengthLock(): Promise<void> {
    if (!this._wallEditor || !this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const wall = this._wallEditor.wall;

    try {
      await this._withWallUndo([wall.id], "Toggle length lock", async () => {
        await this.hass!.callWS({
          type: "inhabit/walls/update",
          floor_plan_id: floorPlan.id,
          floor_id: floor.id,
          wall_id: wall.id,
          length_locked: !wall.length_locked,
        });
        await reloadFloorData();
      });
      this._refreshWallEditor(wall.id);
    } catch (err) {
      console.error("Error toggling length lock:", err);
      alert(`Failed to toggle length lock: ${err}`);
    }
  }

  private async _setDirection(direction: import("../../types").WallDirection): Promise<void> {
    if (!this._wallEditor || !this.hass) return;

    const floor = currentFloor.value;
    const floorPlan = currentFloorPlan.value;
    if (!floor || !floorPlan) return;

    const wall = this._wallEditor.wall;

    try {
      // Solve constraint snap with connected wall propagation
      const graph = buildConnectionGraph(floor.walls);
      const result = solveConstraintSnap(graph, wall.id, direction);

      if (result.blocked) {
        alert(`Cannot apply direction: blocked by connected walls.`);
        return;
      }

      const affectedIds = result.updates.length > 0
        ? result.updates.map((u) => u.wallId)
        : [wall.id];

      await this._withWallUndo(affectedIds, "Set wall direction", async () => {
        if (result.updates.length > 0) {
          const updates = result.updates.map((u) => {
            const update: Record<string, unknown> = {
              wall_id: u.wallId,
              start: u.newStart,
              end: u.newEnd,
            };
            if (u.wallId === wall.id) {
              update.direction = direction;
            }
            return update;
          });

          await this.hass!.callWS({
            type: "inhabit/walls/batch_update",
            floor_plan_id: floorPlan.id,
            floor_id: floor.id,
            updates,
          });
        } else {
          await this.hass!.callWS({
            type: "inhabit/walls/update",
            floor_plan_id: floorPlan.id,
            floor_id: floor.id,
            wall_id: wall.id,
            direction,
          });
        }
        await reloadFloorData();
      });

      this._refreshWallEditor(wall.id);
    } catch (err) {
      console.error("Error setting wall direction:", err);
      alert(`Failed to set wall direction: ${err}`);
    }
  }

  private _refreshWallEditor(wallId: string): void {
    const updatedFloor = currentFloor.value;
    if (updatedFloor) {
      const updatedWall = updatedFloor.walls.find((w) => w.id === wallId);
      if (updatedWall && this._wallEditor) {
        this._wallEditor = {
          ...this._wallEditor,
          wall: updatedWall,
        };
      }
    }
  }

  private _getFilteredEntities(): import("../../types").HassEntity[] {
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

  private _getEntityIcon(entity: import("../../types").HassEntity): string {
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
        ${this._renderDevicePreview()}
      </svg>
      ${this._renderWallEditor()}
      ${this._renderEntityPicker()}
    `;
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
