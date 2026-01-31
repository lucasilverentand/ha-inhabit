/**
 * Wall constraint solver for propagating endpoint movements
 * Implements Fusion 360-style constraints: length, angle, and fixed
 */

import type { Coordinates, Wall } from "../types";
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

  // Check for fixed walls first - these block all movement
  for (const ep of connectedEndpoints) {
    const wall = graph.walls.get(ep.wallId);
    if (wall && wall.constraint === "fixed") {
      return {
        updates: [],
        blocked: true,
        blockedBy: wall.id,
      };
    }
  }

  // Process each connected wall
  // The shared endpoint moves to newPos; constraints affect the other endpoint
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

  // Check if wall is fixed
  if (wall.constraint === "fixed") {
    return { updates: [], blocked: true, blockedBy: wall.id };
  }

  // Check if length is constrained
  if (wall.constraint === "length") {
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

  // Add the main wall update
  updates.push({
    wallId: wall.id,
    newStart,
    newEnd,
  });

  // Propagate to connected walls at start
  // The shared endpoint MUST move to newStart - constraints affect the other endpoint
  const startKey = coordsToKey(wall.start);
  const startConnected = graph.endpoints.get(startKey) || [];
  for (const ep of startConnected) {
    if (ep.wallId === wallId) continue;

    const connectedWall = graph.walls.get(ep.wallId);
    if (!connectedWall) continue;

    // Check constraints - fixed walls block the movement entirely
    if (connectedWall.constraint === "fixed") {
      return { updates: [], blocked: true, blockedBy: connectedWall.id };
    }

    // The shared endpoint moves to exactly where the main wall's endpoint is
    // The other endpoint is adjusted based on constraints
    const sharedEndpointMovesTo = newStart;
    const otherEndpointNewPos = computeOtherEndpointAfterMove(
      connectedWall,
      ep.endpoint,
      sharedEndpointMovesTo
    );

    updates.push({
      wallId: connectedWall.id,
      newStart: ep.endpoint === "start" ? sharedEndpointMovesTo : otherEndpointNewPos,
      newEnd: ep.endpoint === "end" ? sharedEndpointMovesTo : otherEndpointNewPos,
    });
  }

  // Propagate to connected walls at end
  // The shared endpoint MUST move to newEnd - constraints affect the other endpoint
  const endKey = coordsToKey(wall.end);
  const endConnected = graph.endpoints.get(endKey) || [];
  for (const ep of endConnected) {
    if (ep.wallId === wallId) continue;

    const connectedWall = graph.walls.get(ep.wallId);
    if (!connectedWall) continue;

    // Check if already processed from start
    if (updates.some((u) => u.wallId === connectedWall.id)) continue;

    // Check constraints - fixed walls block the movement entirely
    if (connectedWall.constraint === "fixed") {
      return { updates: [], blocked: true, blockedBy: connectedWall.id };
    }

    // The shared endpoint moves to exactly where the main wall's endpoint is
    // The other endpoint is adjusted based on constraints
    const sharedEndpointMovesTo = newEnd;
    const otherEndpointNewPos = computeOtherEndpointAfterMove(
      connectedWall,
      ep.endpoint,
      sharedEndpointMovesTo
    );

    updates.push({
      wallId: connectedWall.id,
      newStart: ep.endpoint === "start" ? sharedEndpointMovesTo : otherEndpointNewPos,
      newEnd: ep.endpoint === "end" ? sharedEndpointMovesTo : otherEndpointNewPos,
    });
  }

  return { updates, blocked: false };
}

/**
 * Compute the new position of the "other" endpoint when the shared endpoint moves.
 * This ensures constraints are applied to how the wall stretches/rotates,
 * NOT to where the shared connection point ends up.
 *
 * For connected walls, the shared endpoint MUST move to the new position.
 * The constraint determines where the other endpoint goes.
 */
function computeOtherEndpointAfterMove(
  wall: Wall,
  movedEndpoint: "start" | "end",
  newMovedPosition: Coordinates
): Coordinates {
  const otherEndpoint = movedEndpoint === "start" ? wall.end : wall.start;

  // For unconstrained walls, the other endpoint stays put
  if (wall.constraint === "none") {
    return otherEndpoint;
  }

  // For length constraint, keep length the same - other endpoint moves
  // to maintain the original distance from the new moved position
  if (wall.constraint === "length") {
    const originalLength = getWallLength(wall);
    const movedPos = movedEndpoint === "start" ? wall.start : wall.end;

    // Direction from moved endpoint to other endpoint
    const dx = otherEndpoint.x - movedPos.x;
    const dy = otherEndpoint.y - movedPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return otherEndpoint;

    // Scale to original length from new position
    return {
      x: newMovedPosition.x + (dx / dist) * originalLength,
      y: newMovedPosition.y + (dy / dist) * originalLength,
    };
  }

  // For angle constraint, keep angle the same - other endpoint moves
  // along the same direction from the new moved position
  if (wall.constraint === "angle") {
    const movedPos = movedEndpoint === "start" ? wall.start : wall.end;

    // Direction vector from moved to other
    const dx = otherEndpoint.x - movedPos.x;
    const dy = otherEndpoint.y - movedPos.y;

    // Keep same relative position
    return {
      x: newMovedPosition.x + dx,
      y: newMovedPosition.y + dy,
    };
  }

  // For horizontal constraint, keep wall horizontal
  // Other endpoint moves to have same Y as new position
  if (wall.constraint === "horizontal") {
    return {
      x: otherEndpoint.x,
      y: newMovedPosition.y,
    };
  }

  // For vertical constraint, keep wall vertical
  // Other endpoint moves to have same X as new position
  if (wall.constraint === "vertical") {
    return {
      x: newMovedPosition.x,
      y: otherEndpoint.y,
    };
  }

  return otherEndpoint;
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
