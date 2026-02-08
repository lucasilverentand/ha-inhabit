/**
 * Node-graph constraint solver for propagating node movements.
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
 * Get the angle of an edge from start to end.
 */
function getEdgeAngle(edge: Edge, nodeMap: Map<string, Node>): number {
  const start = nodeMap.get(edge.start_node)!;
  const end = nodeMap.get(edge.end_node)!;
  return Math.atan2(end.y - start.y, end.x - start.x);
}

/**
 * Check if two positions differ (using rounded comparison).
 */
function hasMoved(ax: number, ay: number, bx: number, by: number): boolean {
  return Math.round(ax) !== Math.round(bx) || Math.round(ay) !== Math.round(by);
}

/**
 * Compute where the other node of an edge should go when one node moves.
 * Direction is applied first, then length lock.
 */
function computeOtherNodeAfterMove(
  edge: Edge,
  movedNodeId: string,
  newPos: Coordinates,
  nodeMap: Map<string, Node>
): Coordinates {
  const isStart = edge.start_node === movedNodeId;
  const otherNode = nodeMap.get(isStart ? edge.end_node : edge.start_node)!;
  const movedOriginal = nodeMap.get(movedNodeId)!;

  // Angle lock: preserve original angle and length (only when direction is free)
  if (edge.angle_locked && edge.direction === "free") {
    const originalAngle = Math.atan2(
      otherNode.y - movedOriginal.y,
      otherNode.x - movedOriginal.x
    );
    const startNode = nodeMap.get(edge.start_node)!;
    const endNode = nodeMap.get(edge.end_node)!;
    const originalLength = distance(startNode, endNode);
    return {
      x: newPos.x + Math.cos(originalAngle) * originalLength,
      y: newPos.y + Math.sin(originalAngle) * originalLength,
    };
  }

  let result: Coordinates = { x: otherNode.x, y: otherNode.y };

  // Apply direction constraint first
  if (edge.direction === "horizontal") {
    result = { x: result.x, y: newPos.y };
  } else if (edge.direction === "vertical") {
    result = { x: newPos.x, y: result.y };
  }

  // Apply length lock: scale to original length from new moved position
  if (edge.length_locked) {
    const startNode = nodeMap.get(edge.start_node)!;
    const endNode = nodeMap.get(edge.end_node)!;
    const originalLength = distance(startNode, endNode);
    const dx = result.x - newPos.x;
    const dy = result.y - newPos.y;
    const currentDist = Math.sqrt(dx * dx + dy * dy);

    if (currentDist > 0 && originalLength > 0) {
      const scale = originalLength / currentDist;
      result = {
        x: newPos.x + dx * scale,
        y: newPos.y + dy * scale,
      };
    }
  }

  return result;
}

/**
 * Propagate a node move to all connected edges.
 * Returns node updates for all affected nodes.
 */
function propagateNodeMove(
  graph: NodeGraph,
  nodeId: string,
  newX: number,
  newY: number,
  visited: Set<string>
): SolverResult {
  const updates: NodeUpdate[] = [];
  const connectedEdges = graph.nodeToEdges.get(nodeId) || [];

  const furtherMoves: { nodeId: string; x: number; y: number }[] = [];

  for (const { edgeId, endpoint } of connectedEdges) {
    if (visited.has(edgeId)) continue;
    visited.add(edgeId);

    const edge = graph.edges.get(edgeId);
    if (!edge) continue;

    const otherNodeId = endpoint === 'start' ? edge.end_node : edge.start_node;
    const otherNode = graph.nodes.get(otherNodeId);
    if (!otherNode) continue;

    const otherNewPos = computeOtherNodeAfterMove(
      edge, nodeId, { x: newX, y: newY }, graph.nodes
    );

    // If the other node moved, record update and queue for further propagation
    if (hasMoved(otherNode.x, otherNode.y, otherNewPos.x, otherNewPos.y)) {
      updates.push({ nodeId: otherNodeId, x: otherNewPos.x, y: otherNewPos.y });
      furtherMoves.push({ nodeId: otherNodeId, x: otherNewPos.x, y: otherNewPos.y });
    }
  }

  // Recursively propagate further moves
  for (const move of furtherMoves) {
    if (visited.size > graph.edges.size * 2) break; // safety limit
    const result = propagateNodeMove(graph, move.nodeId, move.x, move.y, visited);
    if (result.blocked) return result;
    updates.push(...result.updates);
  }

  return { updates, blocked: false };
}

/**
 * Solve node movement with constraints.
 * Moves the given node and propagates to connected edges.
 */
export function solveNodeMove(
  graph: NodeGraph,
  nodeId: string,
  newX: number,
  newY: number
): SolverResult {
  const visited = new Set<string>();
  const updates: NodeUpdate[] = [{ nodeId, x: newX, y: newY }];

  const result = propagateNodeMove(graph, nodeId, newX, newY, visited);
  if (result.blocked) return result;
  updates.push(...result.updates);

  return { updates, blocked: false };
}

/**
 * Solve edge length change with center-based scaling.
 * Moves both endpoint nodes symmetrically and propagates.
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

  const visited = new Set<string>();
  visited.add(edgeId);

  const updates: NodeUpdate[] = [
    { nodeId: edge.start_node, x: newStartPos.x, y: newStartPos.y },
    { nodeId: edge.end_node, x: newEndPos.x, y: newEndPos.y },
  ];

  // Propagate start node movement
  if (hasMoved(startNode.x, startNode.y, newStartPos.x, newStartPos.y)) {
    const result = propagateNodeMove(graph, edge.start_node, newStartPos.x, newStartPos.y, visited);
    if (result.blocked) return result;
    updates.push(...result.updates);
  }

  // Propagate end node movement
  if (hasMoved(endNode.x, endNode.y, newEndPos.x, newEndPos.y)) {
    const result = propagateNodeMove(graph, edge.end_node, newEndPos.x, newEndPos.y, visited);
    if (result.blocked) return result;
    updates.push(...result.updates);
  }

  return { updates, blocked: false };
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
    return {
      nodeUpdates: [
        { nodeId: edge.start_node, x: midX - halfLen, y: midY },
        { nodeId: edge.end_node, x: midX + halfLen, y: midY },
      ],
    };
  }

  if (direction === "vertical") {
    if (Math.round(startNode.x) === Math.round(endNode.x)) return null;
    return {
      nodeUpdates: [
        { nodeId: edge.start_node, x: midX, y: midY - halfLen },
        { nodeId: edge.end_node, x: midX, y: midY + halfLen },
      ],
    };
  }

  return null;
}

/**
 * Solve all node updates needed when applying a direction to an edge.
 * Snaps the edge and propagates endpoint movements to connected edges.
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

  const visited = new Set<string>();
  visited.add(edgeId);

  const updates: NodeUpdate[] = [...snapped.nodeUpdates];

  const startNode = graph.nodes.get(edge.start_node)!;
  const endNode = graph.nodes.get(edge.end_node)!;
  const newStart = snapped.nodeUpdates.find(u => u.nodeId === edge.start_node)!;
  const newEnd = snapped.nodeUpdates.find(u => u.nodeId === edge.end_node)!;

  if (hasMoved(startNode.x, startNode.y, newStart.x, newStart.y)) {
    const result = propagateNodeMove(graph, edge.start_node, newStart.x, newStart.y, visited);
    if (result.blocked) return result;
    updates.push(...result.updates);
  }

  if (hasMoved(endNode.x, endNode.y, newEnd.x, newEnd.y)) {
    const result = propagateNodeMove(graph, edge.end_node, newEnd.x, newEnd.y, visited);
    if (result.blocked) return result;
    updates.push(...result.updates);
  }

  return { updates, blocked: false };
}
