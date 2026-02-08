/**
 * Room detection from edge loops using planar face detection.
 *
 * Algorithm: angle-based face traversal on the planar graph formed by edges.
 * For each directed edge, trace the face by always picking the next edge with
 * the smallest clockwise angle. Track visited directed edges to avoid duplicates.
 * Filter out the outer (unbounded) face and faces below a minimum area threshold.
 */

import type { Coordinates, Node, Edge } from "../types";

export interface RoomCandidate {
  vertices: Coordinates[];
  area: number;
  centroid: Coordinates;
}

/** Minimum area in cm^2 to consider a face a room */
const MIN_AREA = 100;

interface AdjEntry {
  targetId: string;
  angle: number;
}

/**
 * Detect all closed rooms formed by edge loops.
 */
export function detectRoomsFromEdges(nodes: Node[], edges: Edge[]): RoomCandidate[] {
  if (edges.length === 0) return [];

  // Build node map
  const nodeMap = new Map<string, Node>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // Build adjacency graph: for each node, list of neighbors sorted by angle
  const adj = new Map<string, AdjEntry[]>();

  const addDirectedEdge = (fromId: string, toId: string) => {
    const fromNode = nodeMap.get(fromId);
    const toNode = nodeMap.get(toId);
    if (!fromNode || !toNode) return;
    if (fromId === toId) return;

    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
    if (!adj.has(fromId)) adj.set(fromId, []);
    adj.get(fromId)!.push({ targetId: toId, angle });
  };

  for (const edge of edges) {
    addDirectedEdge(edge.start_node, edge.end_node);
    addDirectedEdge(edge.end_node, edge.start_node);
  }

  // Sort each adjacency list by angle
  for (const [, entries] of adj) {
    entries.sort((a, b) => a.angle - b.angle);
  }

  // Trace all faces
  const visitedEdges = new Set<string>();
  const faces: Coordinates[][] = [];

  const edgeKey = (from: string, to: string) => `${from}->${to}`;

  for (const [nodeId, neighbors] of adj) {
    for (const neighbor of neighbors) {
      const ek = edgeKey(nodeId, neighbor.targetId);
      if (visitedEdges.has(ek)) continue;

      // Trace face starting from this directed edge
      const face: string[] = [];
      let currentId = nodeId;
      let nextId = neighbor.targetId;
      let valid = true;

      for (let step = 0; step < 1000; step++) {
        const fek = edgeKey(currentId, nextId);
        if (visitedEdges.has(fek)) {
          valid = false;
          break;
        }
        visitedEdges.add(fek);
        face.push(currentId);

        // Find the incoming edge angle (from currentId to nextId reversed)
        const currentNode = nodeMap.get(currentId)!;
        const nextNode = nodeMap.get(nextId)!;
        const incomingAngle = Math.atan2(
          currentNode.y - nextNode.y,
          currentNode.x - nextNode.x
        );

        // At nextId, find the next edge with smallest clockwise angle after incomingAngle
        const nextNeighbors = adj.get(nextId);
        if (!nextNeighbors || nextNeighbors.length === 0) {
          valid = false;
          break;
        }

        let chosen: AdjEntry | null = null;
        for (const entry of nextNeighbors) {
          if (entry.angle > incomingAngle) {
            chosen = entry;
            break;
          }
        }
        if (!chosen) {
          chosen = nextNeighbors[0];
        }

        currentId = nextId;
        nextId = chosen.targetId;

        if (currentId === nodeId && nextId === neighbor.targetId) {
          break;
        }
        if (currentId === nodeId) {
          break;
        }
      }

      if (valid && face.length >= 3) {
        faces.push(face.map(id => {
          const n = nodeMap.get(id)!;
          return { x: n.x, y: n.y };
        }));
      }
    }
  }

  // Compute signed area for each face and filter
  const rooms: RoomCandidate[] = [];

  for (const vertices of faces) {
    const area = signedArea(vertices);
    const absArea = Math.abs(area);

    if (absArea < MIN_AREA) continue;

    // CW in screen coords (Y-down) = negative signed area = interior faces
    if (area > 0) continue;

    const centroid = computeCentroid(vertices);
    rooms.push({ vertices, area: absArea, centroid });
  }

  // Deduplicate faces that share the same set of vertices
  const unique = new Map<string, RoomCandidate>();
  for (const room of rooms) {
    const sig = room.vertices
      .map(v => `${Math.round(v.x)},${Math.round(v.y)}`)
      .sort()
      .join("|");
    if (!unique.has(sig) || unique.get(sig)!.area < room.area) {
      unique.set(sig, room);
    }
  }

  return Array.from(unique.values());
}

/** @deprecated Use detectRoomsFromEdges instead */
export function detectRoomsFromWalls(walls: Array<{ start: Coordinates; end: Coordinates }>): RoomCandidate[] {
  if (walls.length === 0) return [];

  // Convert walls to nodes + edges
  const nodeMap = new Map<string, Node>();
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeCounter = 0;

  function getOrCreateNode(x: number, y: number): string {
    const key = `${Math.round(x)},${Math.round(y)}`;
    if (nodeMap.has(key)) return nodeMap.get(key)!.id;
    const id = `_n${nodeCounter++}`;
    const node: Node = { id, x, y, pinned: false };
    nodeMap.set(key, node);
    nodes.push(node);
    return id;
  }

  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];
    const startId = getOrCreateNode(w.start.x, w.start.y);
    const endId = getOrCreateNode(w.end.x, w.end.y);
    edges.push({
      id: `_e${i}`,
      start_node: startId,
      end_node: endId,
      type: 'wall',
      thickness: 10,
      is_exterior: false,
      length_locked: false,
      direction: 'free',
      angle_locked: false,
    });
  }

  return detectRoomsFromEdges(nodes, edges);
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

/** Compute area-weighted centroid of a polygon using the shoelace formula. */
function computeCentroid(vertices: Coordinates[]): Coordinates {
  const n = vertices.length;
  if (n < 3) {
    let cx = 0, cy = 0;
    for (const v of vertices) { cx += v.x; cy += v.y; }
    return { x: cx / n, y: cy / n };
  }

  let area = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const cross = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
    area += cross;
    cx += (vertices[i].x + vertices[j].x) * cross;
    cy += (vertices[i].y + vertices[j].y) * cross;
  }

  area /= 2;
  if (Math.abs(area) < 1e-6) {
    let sx = 0, sy = 0;
    for (const v of vertices) { sx += v.x; sy += v.y; }
    return { x: sx / n, y: sy / n };
  }

  const factor = 1 / (6 * area);
  return { x: cx * factor, y: cy * factor };
}
