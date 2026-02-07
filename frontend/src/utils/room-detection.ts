/**
 * Room detection from wall loops using planar face detection.
 *
 * Algorithm: angle-based face traversal on the planar graph formed by walls.
 * For each directed edge, trace the face by always picking the next edge with
 * the smallest clockwise angle. Track visited directed edges to avoid duplicates.
 * Filter out the outer (unbounded) face and faces below a minimum area threshold.
 */

import type { Coordinates, Wall } from "../types";

export interface RoomCandidate {
  vertices: Coordinates[];
  area: number;
  centroid: Coordinates;
}

/** Minimum area in cm² to consider a face a room */
const MIN_AREA = 100;

/** Tolerance for coordinate snapping (same as wall-solver) */
function coordsToKey(coords: Coordinates): string {
  return `${Math.round(coords.x)},${Math.round(coords.y)}`;
}

function keyToCoords(key: string): Coordinates {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
}

interface AdjEntry {
  targetKey: string;
  angle: number;
}

/**
 * Detect all closed rooms formed by wall loops.
 */
export function detectRoomsFromWalls(walls: Wall[]): RoomCandidate[] {
  if (walls.length === 0) return [];

  // Build adjacency graph: for each node, list of neighbors sorted by angle
  const adj = new Map<string, AdjEntry[]>();

  const addEdge = (from: Coordinates, to: Coordinates) => {
    const fromKey = coordsToKey(from);
    const toKey = coordsToKey(to);
    if (fromKey === toKey) return;

    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    if (!adj.has(fromKey)) adj.set(fromKey, []);
    adj.get(fromKey)!.push({ targetKey: toKey, angle });
  };

  for (const wall of walls) {
    addEdge(wall.start, wall.end);
    addEdge(wall.end, wall.start);
  }

  // Sort each adjacency list by angle
  for (const [, entries] of adj) {
    entries.sort((a, b) => a.angle - b.angle);
  }

  // Trace all faces
  const visitedEdges = new Set<string>();
  const faces: Coordinates[][] = [];

  const edgeKey = (from: string, to: string) => `${from}->${to}`;

  for (const [nodeKey, neighbors] of adj) {
    for (const neighbor of neighbors) {
      const ek = edgeKey(nodeKey, neighbor.targetKey);
      if (visitedEdges.has(ek)) continue;

      // Trace face starting from this directed edge
      const face: string[] = [];
      let currentKey = nodeKey;
      let nextKey = neighbor.targetKey;
      let valid = true;

      for (let step = 0; step < 1000; step++) {
        const fek = edgeKey(currentKey, nextKey);
        if (visitedEdges.has(fek)) {
          // We may have re-entered an already-visited edge before closing
          valid = false;
          break;
        }
        visitedEdges.add(fek);
        face.push(currentKey);

        // Find the incoming edge angle (from currentKey to nextKey reversed)
        const incomingAngle = Math.atan2(
          keyToCoords(currentKey).y - keyToCoords(nextKey).y,
          keyToCoords(currentKey).x - keyToCoords(nextKey).x
        );

        // At nextKey, find the next edge with smallest clockwise angle after incomingAngle
        const nextNeighbors = adj.get(nextKey);
        if (!nextNeighbors || nextNeighbors.length === 0) {
          valid = false;
          break;
        }

        // Find the edge just after incomingAngle in sorted order (clockwise = next larger angle)
        let chosen: AdjEntry | null = null;
        for (const entry of nextNeighbors) {
          if (entry.angle > incomingAngle) {
            chosen = entry;
            break;
          }
        }
        // Wrap around if nothing found
        if (!chosen) {
          chosen = nextNeighbors[0];
        }

        currentKey = nextKey;
        nextKey = chosen.targetKey;

        // Check if we've closed the loop
        if (currentKey === nodeKey && nextKey === neighbor.targetKey) {
          break;
        }
        // Check if we've returned to start node (but via different edge - still closed)
        if (currentKey === nodeKey) {
          break;
        }
      }

      if (valid && face.length >= 3) {
        faces.push(face.map(keyToCoords));
      }
    }
  }

  // Compute signed area for each face and filter
  const rooms: RoomCandidate[] = [];

  for (const vertices of faces) {
    const area = signedArea(vertices);
    const absArea = Math.abs(area);

    // Skip faces below minimum area
    if (absArea < MIN_AREA) continue;

    // Skip the outer face (largest negative area or we use the convention
    // that CW faces are interior). In a standard coordinate system where
    // Y increases downward (SVG), CW = negative signed area = interior faces.
    // We keep faces with negative signed area (CW in screen coords).
    if (area > 0) continue;

    const centroid = computeCentroid(vertices);
    rooms.push({ vertices, area: absArea, centroid });
  }

  // Deduplicate faces that share the same set of vertices (possible with
  // different starting points). Use sorted vertex keys as signature.
  const unique = new Map<string, RoomCandidate>();
  for (const room of rooms) {
    const sig = room.vertices
      .map(coordsToKey)
      .sort()
      .join("|");
    // Keep the one with largest area if duplicated
    if (!unique.has(sig) || unique.get(sig)!.area < room.area) {
      unique.set(sig, room);
    }
  }

  return Array.from(unique.values());
}

/** Signed area using the shoelace formula. Negative = CW in screen coords. */
function signedArea(vertices: Coordinates[]): number {
  let area = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return area / 2;
}

/** Compute centroid of a polygon. */
function computeCentroid(vertices: Coordinates[]): Coordinates {
  let cx = 0;
  let cy = 0;
  for (const v of vertices) {
    cx += v.x;
    cy += v.y;
  }
  const n = vertices.length;
  return { x: cx / n, y: cy / n };
}
