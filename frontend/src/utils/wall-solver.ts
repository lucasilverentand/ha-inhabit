/**
 * Wall constraint solver for propagating endpoint movements
 * Supports independent length lock (boolean) and direction (free/horizontal/vertical)
 */

import type { Coordinates, Wall, WallDirection } from "../types";
import { distance } from "./geometry";

export interface WallEndpoint {
  wallId: string;
  endpoint: "start" | "end";
}

export interface ConnectionGraph {
  /** Map from position key (rounded coords) to list of wall endpoints at that position */
  endpoints: Map<string, WallEndpoint[]>;
  /** Map from wall ID to wall */
  walls: Map<string, Wall>;
}

export interface WallUpdate {
  wallId: string;
  newStart: Coordinates;
  newEnd: Coordinates;
}

export interface SolverResult {
  updates: WallUpdate[];
  blocked: boolean;
  blockedBy?: string; // wall ID that blocked the movement
}

/**
 * Build a connection graph from walls
 * Maps endpoint positions to the walls connected at that position
 */
export function buildConnectionGraph(walls: Wall[]): ConnectionGraph {
  const endpoints = new Map<string, WallEndpoint[]>();
  const wallsMap = new Map<string, Wall>();

  for (const wall of walls) {
    wallsMap.set(wall.id, wall);

    const startKey = coordsToKey(wall.start);
    const endKey = coordsToKey(wall.end);

    if (!endpoints.has(startKey)) {
      endpoints.set(startKey, []);
    }
    endpoints.get(startKey)!.push({ wallId: wall.id, endpoint: "start" });

    if (!endpoints.has(endKey)) {
      endpoints.set(endKey, []);
    }
    endpoints.get(endKey)!.push({ wallId: wall.id, endpoint: "end" });
  }

  return { endpoints, walls: wallsMap };
}

/**
 * Convert coordinates to a string key for map lookup
 */
function coordsToKey(coords: Coordinates): string {
  return `${Math.round(coords.x)},${Math.round(coords.y)}`;
}

/**
 * Calculate the angle of a wall in radians
 */
function getWallAngle(wall: Wall): number {
  return Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
}

/**
 * Calculate the length of a wall
 */
function getWallLength(wall: Wall): number {
  return distance(wall.start, wall.end);
}

/**
 * Solve wall movement with constraints
 * This propagates endpoint movement through connected walls.
 *
 * Key principle: The shared endpoint ALWAYS moves to the new position.
 * Constraints affect where the OTHER endpoint of each connected wall goes.
 * This ensures walls stay connected at all times.
 */
export function solveWallMovement(
  graph: ConnectionGraph,
  _movedWallIds: string[],
  _movedEndpoint: "start" | "end",
  originalPos: Coordinates,
  newPos: Coordinates
): SolverResult {
  const updates: WallUpdate[] = [];
  const visited = new Set<string>();
  const positionKey = coordsToKey(originalPos);

  // Get all walls connected at the original position
  const connectedEndpoints = graph.endpoints.get(positionKey) || [];

  // Process each connected wall
  // The shared endpoint moves to newPos; constraints affect the other endpoint
  // Track other-endpoint moves that need propagation
  const otherEndpointMoves: { originalPos: Coordinates; newPos: Coordinates }[] = [];

  for (const ep of connectedEndpoints) {
    if (visited.has(ep.wallId)) continue;
    visited.add(ep.wallId);

    const wall = graph.walls.get(ep.wallId);
    if (!wall) continue;

    // The shared endpoint always moves to exactly newPos
    const sharedEndpointNewPos = newPos;

    // Calculate where the other endpoint goes based on constraints
    const otherEndpointNewPos = computeOtherEndpointAfterMove(
      wall,
      ep.endpoint,
      sharedEndpointNewPos
    );

    // Calculate new wall positions
    const newStart = ep.endpoint === "start" ? sharedEndpointNewPos : otherEndpointNewPos;
    const newEnd = ep.endpoint === "end" ? sharedEndpointNewPos : otherEndpointNewPos;

    updates.push({
      wallId: wall.id,
      newStart,
      newEnd,
    });

    // If the other endpoint moved, we need to propagate to walls connected there
    const otherOriginal = ep.endpoint === "start" ? wall.end : wall.start;
    const otherMoved =
      Math.round(otherOriginal.x) !== Math.round(otherEndpointNewPos.x) ||
      Math.round(otherOriginal.y) !== Math.round(otherEndpointNewPos.y);
    if (otherMoved) {
      otherEndpointMoves.push({ originalPos: otherOriginal, newPos: otherEndpointNewPos });
    }
  }

  // Propagate other-endpoint movements to connected walls
  for (const move of otherEndpointMoves) {
    const result = propagateEndpointMove(graph, move.originalPos, move.newPos, visited);
    if (result.blocked) return result;
    updates.push(...result.updates);
  }

  return {
    updates,
    blocked: false,
  };
}

/**
 * Solve wall length change with center-based scaling
 * Extends wall symmetrically from center and propagates to connected walls
 */
export function solveWallLengthChange(
  graph: ConnectionGraph,
  wallId: string,
  newLength: number
): SolverResult {
  const wall = graph.walls.get(wallId);
  if (!wall) {
    return { updates: [], blocked: false };
  }

  // Check if length is locked
  if (wall.length_locked) {
    return { updates: [], blocked: true, blockedBy: wall.id };
  }

  const currentLength = getWallLength(wall);
  if (currentLength === 0) {
    return { updates: [], blocked: false };
  }

  // Calculate center point
  const center: Coordinates = {
    x: (wall.start.x + wall.end.x) / 2,
    y: (wall.start.y + wall.end.y) / 2,
  };

  // Calculate direction vector
  const angle = getWallAngle(wall);
  const halfLength = newLength / 2;

  // New endpoints extending from center
  const newStart: Coordinates = {
    x: center.x - Math.cos(angle) * halfLength,
    y: center.y - Math.sin(angle) * halfLength,
  };
  const newEnd: Coordinates = {
    x: center.x + Math.cos(angle) * halfLength,
    y: center.y + Math.sin(angle) * halfLength,
  };

  const updates: WallUpdate[] = [];
  const visited = new Set<string>();
  visited.add(wallId);

  // Add the main wall update
  updates.push({
    wallId: wall.id,
    newStart,
    newEnd,
  });

  // Propagate start endpoint movement to connected walls
  const startMoved =
    Math.round(wall.start.x) !== Math.round(newStart.x) ||
    Math.round(wall.start.y) !== Math.round(newStart.y);
  if (startMoved) {
    const result = propagateEndpointMove(graph, wall.start, newStart, visited);
    if (result.blocked) return result;
    updates.push(...result.updates);
  }

  // Propagate end endpoint movement to connected walls
  const endMoved =
    Math.round(wall.end.x) !== Math.round(newEnd.x) ||
    Math.round(wall.end.y) !== Math.round(newEnd.y);
  if (endMoved) {
    const result = propagateEndpointMove(graph, wall.end, newEnd, visited);
    if (result.blocked) return result;
    updates.push(...result.updates);
  }

  return { updates, blocked: false };
}

/**
 * Compute the new position of the "other" endpoint when the shared endpoint moves.
 * Direction is applied first, then length lock.
 *
 * - direction 'horizontal': other endpoint's Y matches the moved endpoint's Y
 * - direction 'vertical': other endpoint's X matches the moved endpoint's X
 * - length_locked: after direction, scale so distance equals original length
 */
function computeOtherEndpointAfterMove(
  wall: Wall,
  movedEndpoint: "start" | "end",
  newMovedPosition: Coordinates
): Coordinates {
  const otherEndpoint = movedEndpoint === "start" ? wall.end : wall.start;

  let result: Coordinates = { ...otherEndpoint };

  // Apply direction constraint first
  if (wall.direction === "horizontal") {
    // Other endpoint's Y matches moved endpoint's new Y
    result = { x: result.x, y: newMovedPosition.y };
  } else if (wall.direction === "vertical") {
    // Other endpoint's X matches moved endpoint's new X
    result = { x: newMovedPosition.x, y: result.y };
  }

  // Apply length lock: scale to original length from new moved position
  if (wall.length_locked) {
    const originalLength = getWallLength(wall);
    const dx = result.x - newMovedPosition.x;
    const dy = result.y - newMovedPosition.y;
    const currentDist = Math.sqrt(dx * dx + dy * dy);

    if (currentDist > 0 && originalLength > 0) {
      const scale = originalLength / currentDist;
      result = {
        x: newMovedPosition.x + dx * scale,
        y: newMovedPosition.y + dy * scale,
      };
    }
  }

  return result;
}

/**
 * Preview wall positions during length editing
 * Returns the new positions without modifying anything
 */
export function previewLengthChange(
  walls: Wall[],
  wallId: string,
  newLength: number
): Map<string, { start: Coordinates; end: Coordinates }> {
  const graph = buildConnectionGraph(walls);
  const result = solveWallLengthChange(graph, wallId, newLength);

  const preview = new Map<string, { start: Coordinates; end: Coordinates }>();

  for (const update of result.updates) {
    preview.set(update.wallId, {
      start: update.newStart,
      end: update.newEnd,
    });
  }

  return preview;
}

/**
 * Compute the snapped start/end for a single wall to satisfy a direction constraint.
 * Returns null if no geometry change is needed.
 */
export function snapWallToConstraint(
  wall: Wall,
  direction: WallDirection
): { start: Coordinates; end: Coordinates } | null {
  if (direction === "free") {
    return null;
  }

  const midX = (wall.start.x + wall.end.x) / 2;
  const midY = (wall.start.y + wall.end.y) / 2;
  const len = distance(wall.start, wall.end);
  const halfLen = len / 2;

  if (direction === "horizontal") {
    if (Math.round(wall.start.y) === Math.round(wall.end.y)) return null;
    return {
      start: { x: midX - halfLen, y: midY },
      end: { x: midX + halfLen, y: midY },
    };
  }

  if (direction === "vertical") {
    if (Math.round(wall.start.x) === Math.round(wall.end.x)) return null;
    return {
      start: { x: midX, y: midY - halfLen },
      end: { x: midX, y: midY + halfLen },
    };
  }

  return null;
}

/**
 * Solve all wall updates needed when applying a direction to a wall.
 * Snaps the wall to satisfy the direction and propagates endpoint
 * movements to connected walls so they stay connected.
 */
export function solveConstraintSnap(
  graph: ConnectionGraph,
  wallId: string,
  direction: WallDirection
): SolverResult {
  const wall = graph.walls.get(wallId);
  if (!wall) {
    return { updates: [], blocked: false };
  }

  const snapped = snapWallToConstraint(wall, direction);
  if (!snapped) {
    // No geometry change needed
    return { updates: [], blocked: false };
  }

  const updates: WallUpdate[] = [];
  const visited = new Set<string>();
  visited.add(wallId);

  // Add the primary wall update
  updates.push({ wallId, newStart: snapped.start, newEnd: snapped.end });

  // Propagate start endpoint movement to connected walls
  const startMoved =
    Math.round(wall.start.x) !== Math.round(snapped.start.x) ||
    Math.round(wall.start.y) !== Math.round(snapped.start.y);
  if (startMoved) {
    const result = propagateEndpointMove(
      graph, wall.start, snapped.start, visited
    );
    if (result.blocked) return result;
    updates.push(...result.updates);
  }

  // Propagate end endpoint movement to connected walls
  const endMoved =
    Math.round(wall.end.x) !== Math.round(snapped.end.x) ||
    Math.round(wall.end.y) !== Math.round(snapped.end.y);
  if (endMoved) {
    const result = propagateEndpointMove(
      graph, wall.end, snapped.end, visited
    );
    if (result.blocked) return result;
    updates.push(...result.updates);
  }

  return { updates, blocked: false };
}

/**
 * Propagate an endpoint move to all connected walls (excluding already-visited ones).
 * Uses the same constraint logic as solveWallMovement.
 */
function propagateEndpointMove(
  graph: ConnectionGraph,
  originalPos: Coordinates,
  newPos: Coordinates,
  visited: Set<string>
): SolverResult {
  const updates: WallUpdate[] = [];
  const positionKey = coordsToKey(originalPos);
  const connectedEndpoints = graph.endpoints.get(positionKey) || [];

  const furtherMoves: { originalPos: Coordinates; newPos: Coordinates }[] = [];

  for (const ep of connectedEndpoints) {
    if (visited.has(ep.wallId)) continue;
    visited.add(ep.wallId);

    const connectedWall = graph.walls.get(ep.wallId);
    if (!connectedWall) continue;

    const otherEndpointNewPos = computeOtherEndpointAfterMove(
      connectedWall, ep.endpoint, newPos
    );

    const newStart = ep.endpoint === "start" ? newPos : otherEndpointNewPos;
    const newEnd = ep.endpoint === "end" ? newPos : otherEndpointNewPos;

    updates.push({ wallId: connectedWall.id, newStart, newEnd });

    // If the other endpoint moved, queue it for further propagation
    const otherOriginal = ep.endpoint === "start" ? connectedWall.end : connectedWall.start;
    const otherMoved =
      Math.round(otherOriginal.x) !== Math.round(otherEndpointNewPos.x) ||
      Math.round(otherOriginal.y) !== Math.round(otherEndpointNewPos.y);
    if (otherMoved) {
      furtherMoves.push({ originalPos: otherOriginal, newPos: otherEndpointNewPos });
    }
  }

  // Recursively propagate further moves
  for (const move of furtherMoves) {
    const result = propagateEndpointMove(graph, move.originalPos, move.newPos, visited);
    if (result.blocked) return result;
    updates.push(...result.updates);
  }

  return { updates, blocked: false };
}

/**
 * Preview endpoint drag with constraints
 */
export function previewEndpointDrag(
  walls: Wall[],
  originalPos: Coordinates,
  newPos: Coordinates,
  draggedWallIds: string[]
): Map<string, { start: Coordinates; end: Coordinates }> {
  const graph = buildConnectionGraph(walls);
  const result = solveWallMovement(
    graph,
    draggedWallIds,
    "start", // This will be determined by position matching
    originalPos,
    newPos
  );

  const preview = new Map<string, { start: Coordinates; end: Coordinates }>();

  for (const update of result.updates) {
    preview.set(update.wallId, {
      start: update.newStart,
      end: update.newEnd,
    });
  }

  return preview;
}
