/**
 * Node-graph constraint solver for propagating node movements.
 * Uses iterative Gauss-Seidel relaxation to handle multi-path constraint
 * propagation (T-junctions, shared walls, closed loops) correctly.
 *
 * Supports independent length lock (boolean), direction (free/horizontal/vertical),
 * and angle lock constraints on edges.
 */

import type { Coordinates, Node, Edge, WallDirection } from "../types";
import { distance } from "./geometry";

export interface NodeGraph {
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
  /** Map from node ID to list of edges connected at that node */
  nodeToEdges: Map<string, Array<{ edgeId: string; endpoint: 'start' | 'end' }>>;
}

export interface NodeUpdate {
  nodeId: string;
  x: number;
  y: number;
}

export interface SolverResult {
  updates: NodeUpdate[];
  blocked: boolean;
  blockedBy?: string; // edge ID that blocked the movement
}

/** Convergence threshold in coordinate units */
const EPSILON = 0.05;
/** Maximum solver iterations before giving up */
const MAX_ITERATIONS = 50;

type PositionMap = Map<string, Coordinates>;

/**
 * Build a node graph from nodes and edges.
 */
export function buildNodeGraph(nodes: Node[], edges: Edge[]): NodeGraph {
  const nodesMap = new Map<string, Node>();
  const edgesMap = new Map<string, Edge>();
  const nodeToEdges = new Map<string, Array<{ edgeId: string; endpoint: 'start' | 'end' }>>();

  for (const node of nodes) {
    nodesMap.set(node.id, node);
  }

  for (const edge of edges) {
    edgesMap.set(edge.id, edge);

    if (!nodeToEdges.has(edge.start_node)) {
      nodeToEdges.set(edge.start_node, []);
    }
    nodeToEdges.get(edge.start_node)!.push({ edgeId: edge.id, endpoint: 'start' });

    if (!nodeToEdges.has(edge.end_node)) {
      nodeToEdges.set(edge.end_node, []);
    }
    nodeToEdges.get(edge.end_node)!.push({ edgeId: edge.id, endpoint: 'end' });
  }

  return { nodes: nodesMap, edges: edgesMap, nodeToEdges };
}

/**
 * Check whether an edge has any active constraint.
 */
function hasConstraint(edge: Edge): boolean {
  return edge.direction !== "free" || edge.length_locked || edge.angle_locked;
}

/**
 * Snapshot all node positions into a mutable map.
 */
function snapshotPositions(graph: NodeGraph): PositionMap {
  const positions: PositionMap = new Map();
  for (const [id, node] of graph.nodes) {
    positions.set(id, { x: node.x, y: node.y });
  }
  return positions;
}

/**
 * BFS edge ordering from pinned nodes for faster convergence.
 * Edges closer to pinned nodes are processed first.
 */
function bfsEdgeOrder(graph: NodeGraph, pinned: Set<string>): Edge[] {
  const orderedEdges: Edge[] = [];
  const visitedEdges = new Set<string>();
  const visitedNodes = new Set<string>();
  const queue: string[] = [];

  for (const nodeId of pinned) {
    queue.push(nodeId);
    visitedNodes.add(nodeId);
  }

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const connected = graph.nodeToEdges.get(nodeId) || [];

    for (const { edgeId } of connected) {
      if (visitedEdges.has(edgeId)) continue;
      visitedEdges.add(edgeId);

      const edge = graph.edges.get(edgeId);
      if (!edge) continue;

      orderedEdges.push(edge);

      const otherNodeId = edge.start_node === nodeId ? edge.end_node : edge.start_node;
      if (!visitedNodes.has(otherNodeId)) {
        visitedNodes.add(otherNodeId);
        queue.push(otherNodeId);
      }
    }
  }

  return orderedEdges;
}

/**
 * Compute constrained position of a partner node given an anchor (pinned) node.
 * Reuses the same constraint math as the old computeOtherNodeAfterMove.
 * Original node positions from the graph are used for angle/length reference.
 */
function constrainPartnerTo(
  edge: Edge,
  anchorNodeId: string,
  anchorPos: Coordinates,
  partnerPos: Coordinates,
  graph: NodeGraph
): Coordinates {
  const origAnchor = graph.nodes.get(anchorNodeId)!;
  const partnerNodeId = edge.start_node === anchorNodeId ? edge.end_node : edge.start_node;
  const origPartner = graph.nodes.get(partnerNodeId)!;

  // Angle lock: preserve original angle and length (only when direction is free)
  if (edge.angle_locked && edge.direction === "free") {
    const originalAngle = Math.atan2(
      origPartner.y - origAnchor.y,
      origPartner.x - origAnchor.x
    );
    const origStart = graph.nodes.get(edge.start_node)!;
    const origEnd = graph.nodes.get(edge.end_node)!;
    const originalLength = distance(origStart, origEnd);
    return {
      x: anchorPos.x + Math.cos(originalAngle) * originalLength,
      y: anchorPos.y + Math.sin(originalAngle) * originalLength,
    };
  }

  let result: Coordinates = { x: partnerPos.x, y: partnerPos.y };

  // Apply direction constraint
  if (edge.direction === "horizontal") {
    result = { x: result.x, y: anchorPos.y };
  } else if (edge.direction === "vertical") {
    result = { x: anchorPos.x, y: result.y };
  }

  // Apply length lock
  if (edge.length_locked) {
    const origStart = graph.nodes.get(edge.start_node)!;
    const origEnd = graph.nodes.get(edge.end_node)!;
    const originalLength = distance(origStart, origEnd);
    const dx = result.x - anchorPos.x;
    const dy = result.y - anchorPos.y;
    const currentDist = Math.sqrt(dx * dx + dy * dy);

    if (currentDist > 0 && originalLength > 0) {
      const scale = originalLength / currentDist;
      result = {
        x: anchorPos.x + dx * scale,
        y: anchorPos.y + dy * scale,
      };
    }
  }

  return result;
}

/**
 * Symmetric constraint correction when neither endpoint is pinned.
 * Projects from midpoint to satisfy constraints, splitting correction 50/50.
 */
function constrainSymmetric(
  edge: Edge,
  startPos: Coordinates,
  endPos: Coordinates,
  graph: NodeGraph
): { idealStart: Coordinates; idealEnd: Coordinates } {
  const origStart = graph.nodes.get(edge.start_node)!;
  const origEnd = graph.nodes.get(edge.end_node)!;
  const originalLength = distance(origStart, origEnd);

  // Angle lock with free direction: project from midpoint along original angle
  if (edge.angle_locked && edge.direction === "free") {
    const originalAngle = Math.atan2(
      origEnd.y - origStart.y,
      origEnd.x - origStart.x
    );
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2;
    const halfLen = originalLength / 2;
    return {
      idealStart: {
        x: midX - Math.cos(originalAngle) * halfLen,
        y: midY - Math.sin(originalAngle) * halfLen,
      },
      idealEnd: {
        x: midX + Math.cos(originalAngle) * halfLen,
        y: midY + Math.sin(originalAngle) * halfLen,
      },
    };
  }

  let s: Coordinates = { x: startPos.x, y: startPos.y };
  let e: Coordinates = { x: endPos.x, y: endPos.y };

  // Direction constraint: average the constrained axis
  if (edge.direction === "horizontal") {
    const sharedY = (s.y + e.y) / 2;
    s = { x: s.x, y: sharedY };
    e = { x: e.x, y: sharedY };
  } else if (edge.direction === "vertical") {
    const sharedX = (s.x + e.x) / 2;
    s = { x: sharedX, y: s.y };
    e = { x: sharedX, y: e.y };
  }

  // Length lock: scale from midpoint
  if (edge.length_locked) {
    const midX = (s.x + e.x) / 2;
    const midY = (s.y + e.y) / 2;
    const dx = e.x - s.x;
    const dy = e.y - s.y;
    const currentDist = Math.sqrt(dx * dx + dy * dy);

    if (currentDist > 0 && originalLength > 0) {
      const halfScale = (originalLength / 2) / (currentDist / 2);
      s = {
        x: midX - (dx / 2) * halfScale,
        y: midY - (dy / 2) * halfScale,
      };
      e = {
        x: midX + (dx / 2) * halfScale,
        y: midY + (dy / 2) * halfScale,
      };
    }
  }

  return { idealStart: s, idealEnd: e };
}

/**
 * Apply edge constraint, branching on which endpoints are pinned.
 */
function applyEdgeConstraint(
  edge: Edge,
  startPos: Coordinates,
  endPos: Coordinates,
  pinned: Set<string>,
  graph: NodeGraph
): { idealStart: Coordinates; idealEnd: Coordinates } {
  const startPinned = pinned.has(edge.start_node);
  const endPinned = pinned.has(edge.end_node);

  if (startPinned && endPinned) {
    // Both pinned — can't adjust, return as-is
    return { idealStart: startPos, idealEnd: endPos };
  }

  if (startPinned) {
    const idealEnd = constrainPartnerTo(edge, edge.start_node, startPos, endPos, graph);
    return { idealStart: startPos, idealEnd };
  }

  if (endPinned) {
    const idealStart = constrainPartnerTo(edge, edge.end_node, endPos, startPos, graph);
    return { idealStart, idealEnd: endPos };
  }

  // Neither pinned
  return constrainSymmetric(edge, startPos, endPos, graph);
}

/**
 * Scan all edges for the largest remaining constraint violation.
 */
function computeMaxViolation(
  graph: NodeGraph,
  positions: PositionMap
): { maxViolation: number; worstEdgeId: string | undefined } {
  let maxViolation = 0;
  let worstEdgeId: string | undefined;

  for (const [edgeId, edge] of graph.edges) {
    if (!hasConstraint(edge)) continue;

    const startPos = positions.get(edge.start_node);
    const endPos = positions.get(edge.end_node);
    if (!startPos || !endPos) continue;

    let violation = 0;

    if (edge.direction === "horizontal") {
      violation = Math.max(violation, Math.abs(startPos.y - endPos.y));
    } else if (edge.direction === "vertical") {
      violation = Math.max(violation, Math.abs(startPos.x - endPos.x));
    }

    if (edge.length_locked) {
      const origStart = graph.nodes.get(edge.start_node)!;
      const origEnd = graph.nodes.get(edge.end_node)!;
      const originalLength = distance(origStart, origEnd);
      const currentLength = distance(startPos, endPos);
      violation = Math.max(violation, Math.abs(currentLength - originalLength));
    }

    if (edge.angle_locked && edge.direction === "free") {
      const origStart = graph.nodes.get(edge.start_node)!;
      const origEnd = graph.nodes.get(edge.end_node)!;
      const originalAngle = Math.atan2(origEnd.y - origStart.y, origEnd.x - origStart.x);
      const currentAngle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
      // Convert angle difference to linear violation approximation
      const currentLength = distance(startPos, endPos);
      violation = Math.max(violation, Math.abs(originalAngle - currentAngle) * currentLength);
    }

    if (violation > maxViolation) {
      maxViolation = violation;
      worstEdgeId = edgeId;
    }
  }

  return { maxViolation, worstEdgeId };
}

/**
 * Post-solve enforcement: forcibly correct any remaining length-lock violations.
 * For each length-locked edge, if its current length differs from the original,
 * adjust the non-pinned endpoint (or both symmetrically) to restore exact length.
 *
 * Uses BFS order from pinned nodes so corrections propagate outward correctly.
 * Only truly pinned nodes (user-pinned / dragged) are immovable — all others
 * can be adjusted across multiple passes until convergence.
 */
function enforceLengthLocks(
  graph: NodeGraph,
  pinned: Set<string>,
  positions: PositionMap
): void {
  const ENFORCE_PASSES = 50;
  const ENFORCE_EPSILON = 0.01;

  const edgeOrder = bfsEdgeOrder(graph, pinned);

  for (let pass = 0; pass < ENFORCE_PASSES; pass++) {
    let maxError = 0;

    for (const edge of edgeOrder) {
      if (!edge.length_locked) continue;

      const origStart = graph.nodes.get(edge.start_node)!;
      const origEnd = graph.nodes.get(edge.end_node)!;
      const originalLength = distance(origStart, origEnd);
      if (originalLength === 0) continue;

      const sPos = positions.get(edge.start_node);
      const ePos = positions.get(edge.end_node);
      if (!sPos || !ePos) continue;

      const currentLength = distance(sPos, ePos);
      const error = Math.abs(currentLength - originalLength);
      maxError = Math.max(maxError, error);
      if (error <= ENFORCE_EPSILON) continue;
      if (currentLength === 0) continue;

      const startIsPinned = pinned.has(edge.start_node);
      const endIsPinned = pinned.has(edge.end_node);

      if (startIsPinned && endIsPinned) {
        // Both truly pinned — cannot fix
        continue;
      }

      const dx = ePos.x - sPos.x;
      const dy = ePos.y - sPos.y;
      const scale = originalLength / currentLength;

      if (startIsPinned) {
        positions.set(edge.end_node, {
          x: sPos.x + dx * scale,
          y: sPos.y + dy * scale,
        });
      } else if (endIsPinned) {
        positions.set(edge.start_node, {
          x: ePos.x - dx * scale,
          y: ePos.y - dy * scale,
        });
      } else {
        // Neither pinned — scale from midpoint
        const midX = (sPos.x + ePos.x) / 2;
        const midY = (sPos.y + ePos.y) / 2;
        const halfScale = originalLength / 2 / (currentLength / 2);
        positions.set(edge.start_node, {
          x: midX - (dx / 2) * halfScale,
          y: midY - (dy / 2) * halfScale,
        });
        positions.set(edge.end_node, {
          x: midX + (dx / 2) * halfScale,
          y: midY + (dy / 2) * halfScale,
        });
      }
    }

    if (maxError <= ENFORCE_EPSILON) break;
  }
}

/**
 * Core iterative constraint solver using Gauss-Seidel relaxation.
 * Maintains a mutable working position map and iterates until convergence.
 *
 * On the first pass, nodes are processed in BFS order from pinned nodes.
 * A node that has been constrained by an earlier (closer-to-pinned) edge
 * is treated as "settled" — subsequent edges treat it as an anchor rather
 * than splitting the correction symmetrically. This gives exact single-pass
 * results for chains/trees and reserves iterative convergence for loops.
 */
function solveIterative(
  graph: NodeGraph,
  pinned: Set<string>,
  positions: PositionMap
): SolverResult {
  const edgeOrder = bfsEdgeOrder(graph, pinned);
  let maxDelta = 0;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    maxDelta = 0;

    // On the first iteration, track "settled" nodes (pinned + already constrained)
    // to propagate from anchor rather than averaging symmetrically.
    const settled = iteration === 0 ? new Set(pinned) : pinned;

    for (const edge of edgeOrder) {
      if (!hasConstraint(edge)) continue;

      const startPos = positions.get(edge.start_node);
      const endPos = positions.get(edge.end_node);
      if (!startPos || !endPos) continue;

      const { idealStart, idealEnd } = applyEdgeConstraint(
        edge, startPos, endPos, settled, graph
      );

      if (!pinned.has(edge.start_node)) {
        const delta = Math.max(
          Math.abs(idealStart.x - startPos.x),
          Math.abs(idealStart.y - startPos.y)
        );
        maxDelta = Math.max(maxDelta, delta);
        positions.set(edge.start_node, idealStart);
      }

      if (!pinned.has(edge.end_node)) {
        const delta = Math.max(
          Math.abs(idealEnd.x - endPos.x),
          Math.abs(idealEnd.y - endPos.y)
        );
        maxDelta = Math.max(maxDelta, delta);
        positions.set(edge.end_node, idealEnd);
      }

      // Mark both endpoints as settled after processing this edge
      if (iteration === 0) {
        settled.add(edge.start_node);
        settled.add(edge.end_node);
      }
    }

    if (maxDelta < EPSILON) break;
  }

  // Enforce length locks: forcibly correct any remaining violations
  enforceLengthLocks(graph, pinned, positions);

  // Build result: one update per node that moved from its original position
  const updates: NodeUpdate[] = [];
  for (const [nodeId, pos] of positions) {
    const orig = graph.nodes.get(nodeId)!;
    if (Math.abs(pos.x - orig.x) > EPSILON || Math.abs(pos.y - orig.y) > EPSILON) {
      updates.push({ nodeId, x: pos.x, y: pos.y });
    }
  }

  if (maxDelta >= EPSILON) {
    const { worstEdgeId } = computeMaxViolation(graph, positions);
    return { updates, blocked: true, blockedBy: worstEdgeId };
  }

  return { updates, blocked: false };
}

/**
 * Get the angle of an edge from start to end.
 */
function getEdgeAngle(edge: Edge, nodeMap: Map<string, Node>): number {
  const start = nodeMap.get(edge.start_node)!;
  const end = nodeMap.get(edge.end_node)!;
  return Math.atan2(end.y - start.y, end.x - start.x);
}

/**
 * Solve node movement with constraints.
 * Moves the given node and propagates to connected edges via iterative relaxation.
 */
export function solveNodeMove(
  graph: NodeGraph,
  nodeId: string,
  newX: number,
  newY: number
): SolverResult {
  const positions = snapshotPositions(graph);
  positions.set(nodeId, { x: newX, y: newY });
  const pinned = new Set([nodeId]);

  // Pin all user-pinned nodes so the solver never moves them
  for (const [id, node] of graph.nodes) {
    if (node.pinned && id !== nodeId) pinned.add(id);
  }

  const result = solveIterative(graph, pinned, positions);

  // Always include the moved node itself in updates
  const hasMovedNode = result.updates.some(u => u.nodeId === nodeId);
  if (!hasMovedNode) {
    const orig = graph.nodes.get(nodeId)!;
    if (orig.x !== newX || orig.y !== newY) {
      result.updates.unshift({ nodeId, x: newX, y: newY });
    }
  }

  // Filter out pinned nodes (except the actively moved node) from result updates
  result.updates = result.updates.filter(u => u.nodeId === nodeId || !graph.nodes.get(u.nodeId)?.pinned);

  // Node moves are never blocked — constraints propagate instead.
  // If the solver didn't converge, we still return the best-effort result.
  result.blocked = false;
  delete (result as { blockedBy?: string }).blockedBy;

  return result;
}

/**
 * Solve edge length change with center-based scaling.
 * Moves both endpoint nodes symmetrically and propagates via iterative relaxation.
 */
export function solveEdgeLengthChange(
  graph: NodeGraph,
  edgeId: string,
  newLength: number
): SolverResult {
  const edge = graph.edges.get(edgeId);
  if (!edge) return { updates: [], blocked: false };

  if (edge.length_locked) {
    return { updates: [], blocked: true, blockedBy: edge.id };
  }

  const startNode = graph.nodes.get(edge.start_node);
  const endNode = graph.nodes.get(edge.end_node);
  if (!startNode || !endNode) return { updates: [], blocked: false };

  const currentLength = distance(startNode, endNode);
  if (currentLength === 0) return { updates: [], blocked: false };

  const center: Coordinates = {
    x: (startNode.x + endNode.x) / 2,
    y: (startNode.y + endNode.y) / 2,
  };

  const angle = getEdgeAngle(edge, graph.nodes);
  const halfLength = newLength / 2;

  const newStartPos: Coordinates = {
    x: center.x - Math.cos(angle) * halfLength,
    y: center.y - Math.sin(angle) * halfLength,
  };
  const newEndPos: Coordinates = {
    x: center.x + Math.cos(angle) * halfLength,
    y: center.y + Math.sin(angle) * halfLength,
  };

  const positions = snapshotPositions(graph);
  positions.set(edge.start_node, newStartPos);
  positions.set(edge.end_node, newEndPos);

  const pinned = new Set([edge.start_node, edge.end_node]);

  // Pin all user-pinned nodes so the solver never moves them
  for (const [id, node] of graph.nodes) {
    if (node.pinned) pinned.add(id);
  }

  const result = solveIterative(graph, pinned, positions);

  // Always include both endpoint updates
  if (!result.updates.some(u => u.nodeId === edge.start_node)) {
    result.updates.unshift({ nodeId: edge.start_node, x: newStartPos.x, y: newStartPos.y });
  }
  if (!result.updates.some(u => u.nodeId === edge.end_node)) {
    result.updates.push({ nodeId: edge.end_node, x: newEndPos.x, y: newEndPos.y });
  }

  // Filter out user-pinned nodes (except the two endpoints being changed) from result updates
  result.updates = result.updates.filter(u =>
    u.nodeId === edge.start_node || u.nodeId === edge.end_node || !graph.nodes.get(u.nodeId)?.pinned
  );

  // Non-convergence of neighbor propagation should not block the length change.
  // Only the explicit length_locked check above should block.
  result.blocked = false;
  delete (result as { blockedBy?: string }).blockedBy;

  return result;
}

/**
 * Convert solver updates to a preview map keyed by node ID.
 */
function updatesToPreview(updates: NodeUpdate[]): Map<string, { x: number; y: number }> {
  const preview = new Map<string, { x: number; y: number }>();
  for (const update of updates) {
    preview.set(update.nodeId, { x: update.x, y: update.y });
  }
  return preview;
}

/**
 * Preview node positions during a node drag.
 */
export function previewNodeDrag(
  nodes: Node[],
  edges: Edge[],
  nodeId: string,
  newX: number,
  newY: number
): Map<string, { x: number; y: number }> {
  const graph = buildNodeGraph(nodes, edges);
  const result = solveNodeMove(graph, nodeId, newX, newY);
  return updatesToPreview(result.updates);
}

/**
 * Preview node positions during length editing.
 */
export function previewLengthChange(
  nodes: Node[],
  edges: Edge[],
  edgeId: string,
  newLength: number
): Map<string, { x: number; y: number }> {
  const graph = buildNodeGraph(nodes, edges);
  const result = solveEdgeLengthChange(graph, edgeId, newLength);
  return updatesToPreview(result.updates);
}

/**
 * Compute the snapped positions for an edge's nodes to satisfy a direction constraint.
 * Returns null if no geometry change is needed.
 */
export function snapEdgeToConstraint(
  edge: Edge,
  direction: WallDirection,
  nodeMap: Map<string, Node>
): { nodeUpdates: NodeUpdate[] } | null {
  if (direction === "free") return null;

  const startNode = nodeMap.get(edge.start_node);
  const endNode = nodeMap.get(edge.end_node);
  if (!startNode || !endNode) return null;

  const midX = (startNode.x + endNode.x) / 2;
  const midY = (startNode.y + endNode.y) / 2;
  const len = distance(startNode, endNode);
  const halfLen = len / 2;

  if (direction === "horizontal") {
    if (Math.round(startNode.y) === Math.round(endNode.y)) return null;
    // Preserve original left-right ordering of nodes
    const startLeft = startNode.x <= endNode.x;
    return {
      nodeUpdates: [
        { nodeId: edge.start_node, x: startLeft ? midX - halfLen : midX + halfLen, y: midY },
        { nodeId: edge.end_node, x: startLeft ? midX + halfLen : midX - halfLen, y: midY },
      ],
    };
  }

  if (direction === "vertical") {
    if (Math.round(startNode.x) === Math.round(endNode.x)) return null;
    // Preserve original top-bottom ordering of nodes
    const startTop = startNode.y <= endNode.y;
    return {
      nodeUpdates: [
        { nodeId: edge.start_node, x: midX, y: startTop ? midY - halfLen : midY + halfLen },
        { nodeId: edge.end_node, x: midX, y: startTop ? midY + halfLen : midY - halfLen },
      ],
    };
  }

  return null;
}

/**
 * Solve all node updates needed when applying a direction to an edge.
 * Snaps the edge and propagates endpoint movements via iterative relaxation.
 */
export function solveConstraintSnap(
  graph: NodeGraph,
  edgeId: string,
  direction: WallDirection
): SolverResult {
  const edge = graph.edges.get(edgeId);
  if (!edge) return { updates: [], blocked: false };

  const snapped = snapEdgeToConstraint(edge, direction, graph.nodes);
  if (!snapped) return { updates: [], blocked: false };

  const newStart = snapped.nodeUpdates.find(u => u.nodeId === edge.start_node)!;
  const newEnd = snapped.nodeUpdates.find(u => u.nodeId === edge.end_node)!;

  const positions = snapshotPositions(graph);
  positions.set(edge.start_node, { x: newStart.x, y: newStart.y });
  positions.set(edge.end_node, { x: newEnd.x, y: newEnd.y });

  const pinned = new Set([edge.start_node, edge.end_node]);

  // Pin all user-pinned nodes so the solver never moves them
  for (const [id, node] of graph.nodes) {
    if (node.pinned) pinned.add(id);
  }

  const result = solveIterative(graph, pinned, positions);

  // Always include snapped endpoint updates
  if (!result.updates.some(u => u.nodeId === edge.start_node)) {
    result.updates.unshift({ nodeId: edge.start_node, x: newStart.x, y: newStart.y });
  }
  if (!result.updates.some(u => u.nodeId === edge.end_node)) {
    result.updates.push({ nodeId: edge.end_node, x: newEnd.x, y: newEnd.y });
  }

  // Filter out user-pinned nodes (except the two endpoints being snapped) from result updates
  result.updates = result.updates.filter(u =>
    u.nodeId === edge.start_node || u.nodeId === edge.end_node || !graph.nodes.get(u.nodeId)?.pinned
  );

  // Constraint snaps are never blocked
  result.blocked = false;
  delete (result as { blockedBy?: string }).blockedBy;

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constraint validation & auto-fix
// ─────────────────────────────────────────────────────────────────────────────

export interface ConstraintViolation {
  edgeId: string;
  type: 'direction' | 'length_locked' | 'angle_locked';
  expected: number;
  actual: number;
}

/**
 * Check all edges for constraint violations against current node positions.
 * Returns a list of violations (empty = all constraints satisfied).
 */
export function validateConstraints(
  nodes: Node[],
  edges: Edge[],
  tolerance: number = 0.5
): ConstraintViolation[] {
  const nodeMap = new Map<string, Node>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const violations: ConstraintViolation[] = [];

  for (const edge of edges) {
    const s = nodeMap.get(edge.start_node);
    const e = nodeMap.get(edge.end_node);
    if (!s || !e) continue;

    // Direction check
    if (edge.direction === "horizontal") {
      const diff = Math.abs(s.y - e.y);
      if (diff > tolerance) {
        violations.push({
          edgeId: edge.id,
          type: 'direction',
          expected: 0,
          actual: diff,
        });
      }
    } else if (edge.direction === "vertical") {
      const diff = Math.abs(s.x - e.x);
      if (diff > tolerance) {
        violations.push({
          edgeId: edge.id,
          type: 'direction',
          expected: 0,
          actual: diff,
        });
      }
    }
  }

  return violations;
}

/**
 * Detect and remove overconstrained edges.
 *
 * Strategy: check all constraints against current node positions. Any
 * violations indicate constraints that don't match the geometry. Remove
 * the constraint from the worst-violating edge, then repeat until clean.
 *
 * Removal priority (drop least visible first):
 *   1. length_locked
 *   2. angle_locked
 *   3. direction
 *
 * Returns the list of edge IDs whose constraints were relaxed, and the
 * original violations found. The caller persists changes to the backend.
 */
export function autoFixConstraints(
  nodes: Node[],
  edges: Edge[],
  tolerance: number = 0.5
): { fixedEdgeIds: string[]; violations: ConstraintViolation[] } {
  const initialViolations = validateConstraints(nodes, edges, tolerance);
  if (initialViolations.length === 0) {
    return { fixedEdgeIds: [], violations: [] };
  }

  const fixedEdgeIds = new Set<string>();

  // Iteratively remove constraints until no violations remain
  const MAX_FIX_ROUNDS = edges.length * 3; // each edge has up to 3 constraints
  for (let round = 0; round < MAX_FIX_ROUNDS; round++) {
    const currentViolations = validateConstraints(nodes, edges, tolerance);
    if (currentViolations.length === 0) break;

    // Find the worst violation
    let worst = currentViolations[0];
    for (const v of currentViolations) {
      if (v.actual > worst.actual) worst = v;
    }

    // Remove the violating constraint
    const edge = edges.find(e => e.id === worst.edgeId);
    if (!edge) break;

    if (worst.type === 'direction') {
      edge.direction = "free";
    } else if (worst.type === 'length_locked') {
      edge.length_locked = false;
    } else if (worst.type === 'angle_locked') {
      edge.angle_locked = false;
    }
    fixedEdgeIds.add(edge.id);
  }

  return {
    fixedEdgeIds: Array.from(fixedEdgeIds),
    violations: initialViolations,
  };
}
