/**
 * Node-graph constraint solver for propagating node movements.
 * Uses iterative Gauss-Seidel relaxation to handle multi-path constraint
 * propagation (T-junctions, shared walls, closed loops) correctly.
 *
 * Supports independent length lock (boolean), direction (free/horizontal/vertical),
 * and angle group constraints (pair-based angle preservation) on edges.
 */

import type { Coordinates, Node, Edge, WallDirection } from "../types";
import { distance, fitLine, projectOntoLine } from "./geometry";

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
  blockedBy?: string[]; // edge IDs that blocked the movement
}

/** Convergence threshold in coordinate units */
const EPSILON = 0.05;
/** Violation threshold — how much residual error to tolerate after solve.
 *  Must be larger than EPSILON because the iterative solver may not fully
 *  converge within MAX_ITERATIONS on complex graphs (loops, many constraints).
 *  0.2 ≈ two tenths of a millimetre in a cm-based coordinate system. */
const VIOLATION_TOLERANCE = 0.2;
/** Maximum solver iterations before giving up */
const MAX_ITERATIONS = 100;

type PositionMap = Map<string, Coordinates>;

// ─────────────────────────────────────────────────────────────────────────────
// Debug logging (set to true or run `localStorage.setItem('inhabit_debug_solver', '1')`)
// ─────────────────────────────────────────────────────────────────────────────

const DEBUG = typeof localStorage !== 'undefined' && localStorage.getItem('inhabit_debug_solver') === '1';

const LOG_PREFIX = "%c[constraint]";
const LOG_STYLE = "color:#8b5cf6;font-weight:bold";
const LOG_DIM = "color:#888";
const LOG_WARN = "color:#f59e0b;font-weight:bold";
const LOG_ERR = "color:#ef4444;font-weight:bold";
const LOG_OK = "color:#22c55e;font-weight:bold";

function fmtPos(p: Coordinates): string {
  return `(${p.x.toFixed(1)},${p.y.toFixed(1)})`;
}

function fmtEdge(edge: Edge, nodeMap: Map<string, Node>): string {
  const s = nodeMap.get(edge.start_node);
  const e = nodeMap.get(edge.end_node);
  const constraints: string[] = [];
  if (edge.direction !== "free") constraints.push(edge.direction);
  if (edge.length_locked) constraints.push("len🔒");
  if (edge.angle_group) constraints.push(`ang:${edge.angle_group.slice(0,4)}`);
  const cStr = constraints.length > 0 ? ` [${constraints.join(",")}]` : "";
  const len = s && e ? distance(s, e).toFixed(1) : "?";
  return `${edge.id.slice(0, 8)}… (${len}cm${cStr})`;
}

function fmtNodeId(id: string): string {
  return id.slice(0, 8) + "…";
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
 * Check whether an edge has any active constraint.
 */
function hasConstraint(edge: Edge): boolean {
  // Note: angle_group is enforced at group level (like collinear), not per-edge
  return edge.direction !== "free" || edge.length_locked;
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
  _anchorNodeId: string,
  anchorPos: Coordinates,
  partnerPos: Coordinates,
  graph: NodeGraph
): Coordinates {
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
 * Scan all edges for remaining constraint violations.
 * Returns the max violation magnitude and all violating edge IDs.
 */
function computeViolations(
  graph: NodeGraph,
  positions: PositionMap
): { maxViolation: number; violatingEdgeIds: string[]; magnitudes: Map<string, number> } {
  let maxViolation = 0;
  const violatingEdgeIds: string[] = [];
  const magnitudes = new Map<string, number>();

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

    // Always record magnitude for all constrained edges
    magnitudes.set(edgeId, violation);

    if (violation > VIOLATION_TOLERANCE) {
      violatingEdgeIds.push(edgeId);
    }
    if (violation > maxViolation) {
      maxViolation = violation;
    }
  }

  // Check collinear groups: if any node deviates from group line, flag edges
  const collinearGroups = buildCollinearGroups(graph, positions);
  for (const [, group] of collinearGroups) {
    let groupViolation = 0;
    for (const nid of group.nodeIds) {
      const pos = positions.get(nid);
      if (!pos) continue;
      const projected = projectOntoLine(pos, group.anchor, group.dir);
      const dev = distance(pos, projected);
      groupViolation = Math.max(groupViolation, dev);
    }
    // Record magnitude for first edge in group
    for (const [edgeId, edge] of graph.edges) {
      if (edge.collinear_group && group.nodeIds.has(edge.start_node)) {
        const existing = magnitudes.get(edgeId) ?? 0;
        magnitudes.set(edgeId, Math.max(existing, groupViolation));
        if (groupViolation > VIOLATION_TOLERANCE) {
          if (!violatingEdgeIds.includes(edgeId)) {
            violatingEdgeIds.push(edgeId);
          }
        }
        break;
      }
    }
    maxViolation = Math.max(maxViolation, groupViolation);
  }

  // Check angle groups: if inter-edge angles deviate from original, flag edges
  const angleGroups = buildAngleGroups(graph);
  for (const [, group] of angleGroups) {
    const sharedPos = positions.get(group.sharedNodeId);
    if (!sharedPos) continue;

    let groupViolation = 0;
    let totalLen = 0;
    let edgeCount = 0;

    // Check all pairs of edges in the group for relative angle deviation
    for (let i = 0; i < group.edgeIds.length; i++) {
      const ei = graph.edges.get(group.edgeIds[i])!;
      const otherIId = ei.start_node === group.sharedNodeId ? ei.end_node : ei.start_node;
      const otherIPos = positions.get(otherIId);
      if (!otherIPos) continue;

      const currentAngleI = Math.atan2(otherIPos.y - sharedPos.y, otherIPos.x - sharedPos.x);
      let driftI = currentAngleI - group.originalAngles[i];
      while (driftI > Math.PI) driftI -= 2 * Math.PI;
      while (driftI < -Math.PI) driftI += 2 * Math.PI;

      const lenI = distance(sharedPos, otherIPos);
      totalLen += lenI;
      edgeCount++;

      for (let j = i + 1; j < group.edgeIds.length; j++) {
        const ej = graph.edges.get(group.edgeIds[j])!;
        const otherJId = ej.start_node === group.sharedNodeId ? ej.end_node : ej.start_node;
        const otherJPos = positions.get(otherJId);
        if (!otherJPos) continue;

        const currentAngleJ = Math.atan2(otherJPos.y - sharedPos.y, otherJPos.x - sharedPos.x);
        let driftJ = currentAngleJ - group.originalAngles[j];
        while (driftJ > Math.PI) driftJ -= 2 * Math.PI;
        while (driftJ < -Math.PI) driftJ += 2 * Math.PI;

        let relDiff = driftI - driftJ;
        while (relDiff > Math.PI) relDiff -= 2 * Math.PI;
        while (relDiff < -Math.PI) relDiff += 2 * Math.PI;

        const lenJ = distance(sharedPos, otherJPos);
        const avgLen = (lenI + lenJ) / 2;
        groupViolation = Math.max(groupViolation, Math.abs(relDiff) * avgLen);
      }
    }

    // Record magnitude for first edge in group
    const existing = magnitudes.get(group.edgeIds[0]) ?? 0;
    magnitudes.set(group.edgeIds[0], Math.max(existing, groupViolation));

    if (groupViolation > VIOLATION_TOLERANCE) {
      if (!violatingEdgeIds.includes(group.edgeIds[0])) {
        violatingEdgeIds.push(group.edgeIds[0]);
      }
      maxViolation = Math.max(maxViolation, groupViolation);
    }
  }

  // Check link groups: if max length deviation within a group exceeds tolerance, flag edges
  const linkGroups = buildLinkGroups(graph);
  for (const [, group] of linkGroups) {
    // Compute current lengths
    const lengths: number[] = [];
    for (const eid of group.edgeIds) {
      const e = graph.edges.get(eid)!;
      const sPos = positions.get(e.start_node);
      const ePos = positions.get(e.end_node);
      if (!sPos || !ePos) { lengths.push(0); continue; }
      lengths.push(distance(sPos, ePos));
    }
    // Max deviation from target length
    let groupViolation = 0;
    for (const len of lengths) {
      groupViolation = Math.max(groupViolation, Math.abs(len - group.targetLength));
    }

    // Record magnitude for first edge
    const existing = magnitudes.get(group.edgeIds[0]) ?? 0;
    magnitudes.set(group.edgeIds[0], Math.max(existing, groupViolation));

    if (groupViolation > VIOLATION_TOLERANCE) {
      if (!violatingEdgeIds.includes(group.edgeIds[0])) {
        violatingEdgeIds.push(group.edgeIds[0]);
      }
      maxViolation = Math.max(maxViolation, groupViolation);
    }
  }

  return { maxViolation, violatingEdgeIds, magnitudes };
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
  positions: PositionMap,
  preExistingViolations?: Map<string, number>
): SolverResult {
  const edgeOrder = bfsEdgeOrder(graph, pinned);
  const constrainedEdges = edgeOrder.filter(hasConstraint);
  const collinearGroups = buildCollinearGroups(graph, positions);
  const angleGroups = buildAngleGroups(graph);
  const linkGroups = buildLinkGroups(graph);
  let maxDelta = 0;
  let iterationsUsed = 0;

  if (DEBUG) {
    console.groupCollapsed(
      LOG_PREFIX + " solveIterative: %c%d constrained edges, %d pinned nodes",
      LOG_STYLE, LOG_DIM,
      constrainedEdges.length,
      pinned.size
    );
    console.log(
      "  Pinned nodes:", [...pinned].map(fmtNodeId).join(", ") || "(none)"
    );
    console.log(
      "  Constrained edges:",
      constrainedEdges.map(e => fmtEdge(e, graph.nodes)).join(" | ") || "(none)"
    );
    if (preExistingViolations && preExistingViolations.size > 0) {
      console.log(
        "  Pre-existing violations:",
        [...preExistingViolations.entries()].map(([id, mag]) => {
          const e = graph.edges.get(id);
          return (e ? fmtEdge(e, graph.nodes) : id.slice(0, 8) + "…") + ` (${mag.toFixed(2)})`;
        }).join(" | ")
      );
    }
  }

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    maxDelta = 0;
    iterationsUsed = iteration + 1;

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

    // Collinear projection pass: project non-pinned nodes back onto their group line
    for (const [, group] of collinearGroups) {
      for (const nid of group.nodeIds) {
        if (pinned.has(nid)) continue;
        const pos = positions.get(nid);
        if (!pos) continue;
        const projected = projectOntoLine(pos, group.anchor, group.dir);
        const delta = Math.max(
          Math.abs(projected.x - pos.x),
          Math.abs(projected.y - pos.y)
        );
        if (delta > EPSILON) {
          maxDelta = Math.max(maxDelta, delta);
          positions.set(nid, projected);
        }
      }
    }

    // Angle group pass: enforce inter-edge angles at shared nodes
    const angleDelta = enforceAngleGroups(graph, angleGroups, pinned, positions);
    maxDelta = Math.max(maxDelta, angleDelta);

    // Link group pass: synchronize linked edge lengths
    const linkDelta = enforceLinkGroups(graph, linkGroups, pinned, positions);
    maxDelta = Math.max(maxDelta, linkDelta);

    if (maxDelta < EPSILON) break;
  }

  // Build result: one update per node that moved from its original position
  const updates: NodeUpdate[] = [];
  for (const [nodeId, pos] of positions) {
    const orig = graph.nodes.get(nodeId)!;
    if (Math.abs(pos.x - orig.x) > EPSILON || Math.abs(pos.y - orig.y) > EPSILON) {
      updates.push({ nodeId, x: pos.x, y: pos.y });
    }
  }

  const converged = maxDelta < EPSILON;

  if (!converged) {
    const { violatingEdgeIds, maxViolation, magnitudes: postMagnitudes } = computeViolations(graph, positions);
    // Block if: (a) new violation, or (b) pre-existing violation got worse
    const newViolations: string[] = [];
    for (const id of violatingEdgeIds) {
      if (!preExistingViolations) {
        newViolations.push(id);
      } else {
        const preMag = preExistingViolations.get(id);
        if (preMag === undefined) {
          // Newly violating edge
          newViolations.push(id);
        } else {
          // Pre-existing: block only if it got worse
          const postMag = postMagnitudes.get(id) ?? 0;
          if (postMag > preMag + EPSILON) {
            newViolations.push(id);
          }
        }
      }
    }

    if (newViolations.length > 0) {
      if (DEBUG) {
        console.log(
          `${LOG_PREFIX} %cBLOCKED%c — ${iterationsUsed} iterations, maxDelta=${maxDelta.toFixed(3)}, maxViolation=${maxViolation.toFixed(3)}`,
          LOG_STYLE, LOG_ERR, ""
        );
        console.log("  All violating edges:", violatingEdgeIds.map(id => {
          const e = graph.edges.get(id);
          return e ? fmtEdge(e, graph.nodes) : id.slice(0, 8) + "…";
        }).join(" | "));
        console.log("  NEW violations (blocking):", newViolations.map(id => {
          const e = graph.edges.get(id);
          if (!e) return id.slice(0, 8) + "…";
          const sPos = positions.get(e.start_node);
          const ePos = positions.get(e.end_node);
          const posInfo = sPos && ePos ? ` now ${fmtPos(sPos)}→${fmtPos(ePos)}` : "";
          return fmtEdge(e, graph.nodes) + posInfo;
        }).join(" | "));
        console.groupEnd();
      }
      return { updates, blocked: true, blockedBy: newViolations };
    }

    if (DEBUG) {
      console.log(
        `${LOG_PREFIX} %cDID NOT CONVERGE%c but no new violations — ${iterationsUsed} iters, maxDelta=${maxDelta.toFixed(3)}`,
        LOG_STYLE, LOG_WARN, ""
      );
    }
  } else if (DEBUG) {
    console.log(
      LOG_PREFIX + " %cConverged%c in %d iteration(s), %d node(s) moved",
      LOG_STYLE, LOG_OK, "", iterationsUsed, updates.length
    );
  }

  if (DEBUG) console.groupEnd();
  return { updates, blocked: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Collinear helpers
// ─────────────────────────────────────────────────────────────────────────────

interface CollinearGroupInfo {
  nodeIds: Set<string>;
  anchor: Coordinates;
  dir: Coordinates;
}

/**
 * Build a map of collinear_group → { nodeIds, anchor, dir } from current positions.
 */
function buildCollinearGroups(
  graph: NodeGraph,
  positions: PositionMap
): Map<string, CollinearGroupInfo> {
  const groups = new Map<string, CollinearGroupInfo>();

  // Collect node IDs per group
  const groupNodes = new Map<string, Set<string>>();
  for (const [, edge] of graph.edges) {
    if (!edge.collinear_group) continue;
    if (!groupNodes.has(edge.collinear_group)) {
      groupNodes.set(edge.collinear_group, new Set());
    }
    const s = groupNodes.get(edge.collinear_group)!;
    s.add(edge.start_node);
    s.add(edge.end_node);
  }

  for (const [groupId, nodeIds] of groupNodes) {
    const points: Coordinates[] = [];
    for (const nid of nodeIds) {
      const pos = positions.get(nid);
      if (pos) points.push(pos);
    }
    if (points.length < 2) continue;
    const { anchor, dir } = fitLine(points);
    groups.set(groupId, { nodeIds, anchor, dir });
  }

  return groups;
}

// ─────────────────────────────────────────────────────────────────────────────
// Angle group helpers
// ─────────────────────────────────────────────────────────────────────────────

interface AngleGroupInfo {
  edgeIds: string[];
  sharedNodeId: string;
  /** Original absolute angle of each edge from the shared node (radians), parallel to edgeIds. */
  originalAngles: number[];
}

/**
 * Build a map of angle_group → AngleGroupInfo from original graph node positions.
 * Supports N ≥ 2 edges sharing a common node.
 * Uses graph.nodes (original positions) to compute reference angles.
 */
function buildAngleGroups(
  graph: NodeGraph
): Map<string, AngleGroupInfo> {
  const groups = new Map<string, AngleGroupInfo>();

  // Collect edge IDs per group
  const groupEdges = new Map<string, string[]>();
  for (const [, edge] of graph.edges) {
    if (!edge.angle_group) continue;
    if (!groupEdges.has(edge.angle_group)) {
      groupEdges.set(edge.angle_group, []);
    }
    groupEdges.get(edge.angle_group)!.push(edge.id);
  }

  for (const [groupId, edgeIds] of groupEdges) {
    if (edgeIds.length < 2) continue;

    // Find shared node: node common to ALL edges
    const edgeObjs = edgeIds.map(id => graph.edges.get(id)!);
    // Count node appearances — shared node appears in every edge
    const nodeCount = new Map<string, number>();
    for (const e of edgeObjs) {
      nodeCount.set(e.start_node, (nodeCount.get(e.start_node) ?? 0) + 1);
      nodeCount.set(e.end_node, (nodeCount.get(e.end_node) ?? 0) + 1);
    }
    let sharedNodeId: string | null = null;
    for (const [nid, count] of nodeCount) {
      if (count === edgeIds.length) { sharedNodeId = nid; break; }
    }
    if (!sharedNodeId) continue;

    const sharedNode = graph.nodes.get(sharedNodeId);
    if (!sharedNode) continue;

    // Compute original absolute angle for each edge from the shared node
    const originalAngles: number[] = [];
    let valid = true;
    for (const e of edgeObjs) {
      const otherId = e.start_node === sharedNodeId ? e.end_node : e.start_node;
      const other = graph.nodes.get(otherId);
      if (!other) { valid = false; break; }
      originalAngles.push(Math.atan2(other.y - sharedNode.y, other.x - sharedNode.x));
    }
    if (!valid) continue;

    groups.set(groupId, {
      edgeIds,
      sharedNodeId,
      originalAngles,
    });
  }

  return groups;
}

/**
 * Enforce angle group constraints: rotate outer nodes around the shared node
 * to preserve relative angles between all edges in the group.
 *
 * For N edges, computes the mean angular drift using circular mean of
 * pinned-node drifts (or all drifts if none pinned), then adjusts
 * each unpinned outer node to originalAngle[i] + meanDrift.
 */
function enforceAngleGroups(
  graph: NodeGraph,
  angleGroups: Map<string, AngleGroupInfo>,
  pinned: Set<string>,
  positions: PositionMap
): number {
  let maxDelta = 0;

  for (const [, group] of angleGroups) {
    const sharedPos = positions.get(group.sharedNodeId);
    if (!sharedPos) continue;

    const N = group.edgeIds.length;

    // Gather outer node IDs, current positions, and current angles
    const outerIds: string[] = [];
    const outerPositions: Coordinates[] = [];
    const currentAngles: number[] = [];
    let valid = true;
    for (let i = 0; i < N; i++) {
      const e = graph.edges.get(group.edgeIds[i])!;
      const otherId = e.start_node === group.sharedNodeId ? e.end_node : e.start_node;
      const otherPos = positions.get(otherId);
      if (!otherPos) { valid = false; break; }
      outerIds.push(otherId);
      outerPositions.push(otherPos);
      currentAngles.push(Math.atan2(otherPos.y - sharedPos.y, otherPos.x - sharedPos.x));
    }
    if (!valid) continue;

    // Compute per-edge drift: currentAngle[i] - originalAngle[i], normalized to [-π,π]
    const drifts: number[] = [];
    for (let i = 0; i < N; i++) {
      let d = currentAngles[i] - group.originalAngles[i];
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      drifts.push(d);
    }

    // Determine which outer nodes are pinned
    const isPinned = outerIds.map(id => pinned.has(id));
    const pinnedCount = isPinned.filter(Boolean).length;

    // If all outer nodes are pinned, skip
    if (pinnedCount === N) continue;

    // Compute mean drift using circular mean
    // If any outer nodes are pinned, use only their drifts as the reference
    let sinSum = 0, cosSum = 0;
    if (pinnedCount > 0) {
      for (let i = 0; i < N; i++) {
        if (isPinned[i]) {
          sinSum += Math.sin(drifts[i]);
          cosSum += Math.cos(drifts[i]);
        }
      }
    } else {
      for (let i = 0; i < N; i++) {
        sinSum += Math.sin(drifts[i]);
        cosSum += Math.cos(drifts[i]);
      }
    }
    const meanDrift = Math.atan2(sinSum, cosSum);

    // Adjust each unpinned outer node to originalAngle[i] + meanDrift
    for (let i = 0; i < N; i++) {
      if (isPinned[i]) continue;
      const targetAngle = group.originalAngles[i] + meanDrift;
      const dist = distance(sharedPos, outerPositions[i]);
      const newPos: Coordinates = {
        x: sharedPos.x + Math.cos(targetAngle) * dist,
        y: sharedPos.y + Math.sin(targetAngle) * dist,
      };
      const delta = Math.max(
        Math.abs(newPos.x - outerPositions[i].x),
        Math.abs(newPos.y - outerPositions[i].y)
      );
      maxDelta = Math.max(maxDelta, delta);
      positions.set(outerIds[i], newPos);
    }
  }

  return maxDelta;
}

// ─────────────────────────────────────────────────────────────────────────────
// Link group helpers
// ─────────────────────────────────────────────────────────────────────────────

interface LinkGroupInfo {
  edgeIds: string[];
  targetLength: number;
}

/**
 * Build a map of link_group → LinkGroupInfo from original graph positions.
 * Target length is the average length of all member edges.
 */
function buildLinkGroups(graph: NodeGraph): Map<string, LinkGroupInfo> {
  const groups = new Map<string, LinkGroupInfo>();

  const groupEdges = new Map<string, string[]>();
  for (const [, edge] of graph.edges) {
    if (!edge.link_group) continue;
    if (!groupEdges.has(edge.link_group)) {
      groupEdges.set(edge.link_group, []);
    }
    groupEdges.get(edge.link_group)!.push(edge.id);
  }

  for (const [groupId, edgeIds] of groupEdges) {
    if (edgeIds.length < 2) continue;
    let totalLen = 0;
    for (const eid of edgeIds) {
      const e = graph.edges.get(eid)!;
      const s = graph.nodes.get(e.start_node)!;
      const end = graph.nodes.get(e.end_node)!;
      totalLen += distance(s, end);
    }
    groups.set(groupId, {
      edgeIds,
      targetLength: totalLen / edgeIds.length,
    });
  }

  return groups;
}

/**
 * Enforce link group constraints: scale each member edge toward the group
 * target length. Uses the same anchor/symmetric logic as edge constraints.
 * Returns max delta for convergence tracking.
 */
function enforceLinkGroups(
  graph: NodeGraph,
  linkGroups: Map<string, LinkGroupInfo>,
  pinned: Set<string>,
  positions: PositionMap
): number {
  let maxDelta = 0;

  for (const [, group] of linkGroups) {
    for (const eid of group.edgeIds) {
      const edge = graph.edges.get(eid)!;
      const sPos = positions.get(edge.start_node);
      const ePos = positions.get(edge.end_node);
      if (!sPos || !ePos) continue;

      const currentLen = distance(sPos, ePos);
      if (currentLen === 0) continue;
      const error = Math.abs(currentLen - group.targetLength);
      if (error <= EPSILON) continue;

      const startPinned = pinned.has(edge.start_node);
      const endPinned = pinned.has(edge.end_node);
      if (startPinned && endPinned) continue;

      const dx = ePos.x - sPos.x;
      const dy = ePos.y - sPos.y;
      const scale = group.targetLength / currentLen;

      if (startPinned) {
        const newEnd: Coordinates = {
          x: sPos.x + dx * scale,
          y: sPos.y + dy * scale,
        };
        const delta = Math.max(Math.abs(newEnd.x - ePos.x), Math.abs(newEnd.y - ePos.y));
        maxDelta = Math.max(maxDelta, delta);
        positions.set(edge.end_node, newEnd);
      } else if (endPinned) {
        const newStart: Coordinates = {
          x: ePos.x - dx * scale,
          y: ePos.y - dy * scale,
        };
        const delta = Math.max(Math.abs(newStart.x - sPos.x), Math.abs(newStart.y - sPos.y));
        maxDelta = Math.max(maxDelta, delta);
        positions.set(edge.start_node, newStart);
      } else {
        const midX = (sPos.x + ePos.x) / 2;
        const midY = (sPos.y + ePos.y) / 2;
        const halfScale = group.targetLength / 2 / (currentLen / 2);
        const newStart: Coordinates = {
          x: midX - (dx / 2) * halfScale,
          y: midY - (dy / 2) * halfScale,
        };
        const newEnd: Coordinates = {
          x: midX + (dx / 2) * halfScale,
          y: midY + (dy / 2) * halfScale,
        };
        const delta = Math.max(
          Math.abs(newStart.x - sPos.x), Math.abs(newStart.y - sPos.y),
          Math.abs(newEnd.x - ePos.x), Math.abs(newEnd.y - ePos.y)
        );
        maxDelta = Math.max(maxDelta, delta);
        positions.set(edge.start_node, newStart);
        positions.set(edge.end_node, newEnd);
      }
    }
  }

  return maxDelta;
}

/**
 * Solve collinear total length: redistribute N collinear edges proportionally
 * to match a new total length, keeping outermost nodes pinned.
 */
export function solveCollinearTotalLength(
  graph: NodeGraph,
  edgeIds: string[],
  newTotal: number
): SolverResult {
  // Gather all unique nodes from these edges
  const nodeIdSet = new Set<string>();
  const edges: Edge[] = [];
  for (const eid of edgeIds) {
    const edge = graph.edges.get(eid);
    if (!edge) continue;
    // If any edge is length-locked, block
    if (edge.length_locked) {
      return { updates: [], blocked: true, blockedBy: [edge.id] };
    }
    edges.push(edge);
    nodeIdSet.add(edge.start_node);
    nodeIdSet.add(edge.end_node);
  }

  if (edges.length === 0) return { updates: [], blocked: false };

  // Compute line direction from edge endpoints
  const nodePoints: Coordinates[] = [];
  for (const nid of nodeIdSet) {
    const n = graph.nodes.get(nid);
    if (n) nodePoints.push({ x: n.x, y: n.y });
  }
  const { anchor, dir } = fitLine(nodePoints);

  // Project all nodes onto the line, get parametric t-values
  const nodeTs = new Map<string, number>();
  for (const nid of nodeIdSet) {
    const n = graph.nodes.get(nid);
    if (!n) continue;
    const dx = n.x - anchor.x;
    const dy = n.y - anchor.y;
    const t = dx * dir.x + dy * dir.y;
    nodeTs.set(nid, t);
  }

  // Find outermost nodes
  let minT = Infinity, maxT = -Infinity;
  let minNode = "";
  for (const [nid, t] of nodeTs) {
    if (t < minT) { minT = t; minNode = nid; }
    if (t > maxT) { maxT = t; }
  }

  const currentTotal = maxT - minT;
  if (currentTotal < 1e-9) return { updates: [], blocked: false };

  // Compute new positions for all nodes on the selected edges
  const positions = snapshotPositions(graph);
  const chainNodeIds = new Set<string>();
  for (const [nid, oldT] of nodeTs) {
    chainNodeIds.add(nid);
    if (nid === minNode) continue; // anchor stays put
    const newT = minT + (oldT - minT) * (newTotal / currentTotal);
    positions.set(nid, {
      x: anchor.x + newT * dir.x,
      y: anchor.y + newT * dir.y,
    });
  }

  // Only pin the anchor (min) node — let the rest of the graph flex from there.
  // The chain nodes get their new positions set above; the solver will
  // propagate to satisfy constraints on edges connected to the chain.
  const pinned = new Set<string>(chainNodeIds);
  for (const [id, node] of graph.nodes) {
    if (node.pinned) pinned.add(id);
  }

  const result = solveIterative(graph, pinned, positions);

  // Ensure all chain nodes that moved are in updates
  for (const nid of chainNodeIds) {
    const pos = positions.get(nid);
    const orig = graph.nodes.get(nid)!;
    if (!pos) continue;
    if (Math.abs(pos.x - orig.x) > EPSILON || Math.abs(pos.y - orig.y) > EPSILON) {
      if (!result.updates.some(u => u.nodeId === nid)) {
        result.updates.push({ nodeId: nid, x: pos.x, y: pos.y });
      }
    }
  }

  // Don't block on non-convergence of neighbor propagation
  result.blocked = false;
  delete result.blockedBy;

  return result;
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
  let effectiveX = newX;
  let effectiveY = newY;

  // If the dragged node belongs to a collinear group, constrain the drag
  // to slide along the group's line (project requested position onto line).
  const collinearGroupId = _findCollinearGroup(graph, nodeId);
  if (collinearGroupId) {
    const groupNodeIds = _collectCollinearNodeIds(graph, collinearGroupId);
    // Build line from original positions of group nodes
    const pts: Coordinates[] = [];
    for (const nid of groupNodeIds) {
      const n = graph.nodes.get(nid);
      if (n) pts.push({ x: n.x, y: n.y });
    }
    if (pts.length >= 2) {
      const { anchor, dir } = fitLine(pts);
      const projected = projectOntoLine({ x: newX, y: newY }, anchor, dir);
      effectiveX = projected.x;
      effectiveY = projected.y;
    }
  }

  // Snapshot pre-existing violations so we don't blame this move for them
  const originalPositions = snapshotPositions(graph);
  const { magnitudes: preMagnitudes } = computeViolations(graph, originalPositions);

  const positions = snapshotPositions(graph);
  positions.set(nodeId, { x: effectiveX, y: effectiveY });
  const pinned = new Set([nodeId]);

  // Pin all user-pinned nodes so the solver never moves them
  for (const [id, node] of graph.nodes) {
    if (node.pinned && id !== nodeId) pinned.add(id);
  }

  const result = solveIterative(graph, pinned, positions, preMagnitudes);

  // Always include the moved node itself in updates
  const hasMovedNode = result.updates.some(u => u.nodeId === nodeId);
  if (!hasMovedNode) {
    const orig = graph.nodes.get(nodeId)!;
    if (orig.x !== effectiveX || orig.y !== effectiveY) {
      result.updates.unshift({ nodeId, x: effectiveX, y: effectiveY });
    }
  }

  // Update the moved node's position to the effective (projected) position
  const movedNodeUpdate = result.updates.find(u => u.nodeId === nodeId);
  if (movedNodeUpdate) {
    movedNodeUpdate.x = effectiveX;
    movedNodeUpdate.y = effectiveY;
  }

  // Filter out pinned nodes (except the actively moved node) from result updates
  result.updates = result.updates.filter(u => u.nodeId === nodeId || !graph.nodes.get(u.nodeId)?.pinned);

  // Final violation check: if the solver converged but post-processing
  // introduced new constraint violations, block the move.
  if (!result.blocked) {
    const { violatingEdgeIds, magnitudes: postMagnitudes } = computeViolations(graph, positions);
    const newViolations: string[] = [];
    for (const id of violatingEdgeIds) {
      const preMag = preMagnitudes.get(id);
      if (preMag === undefined) {
        newViolations.push(id);
      } else {
        const postMag = postMagnitudes.get(id) ?? 0;
        if (postMag > preMag + EPSILON) {
          newViolations.push(id);
        }
      }
    }
    if (newViolations.length > 0) {
      result.blocked = true;
      result.blockedBy = newViolations;
    }
  }

  return result;
}

/** Find the collinear_group a node belongs to (if any). */
function _findCollinearGroup(graph: NodeGraph, nodeId: string): string | null {
  const connected = graph.nodeToEdges.get(nodeId);
  if (!connected) return null;
  for (const { edgeId } of connected) {
    const edge = graph.edges.get(edgeId);
    if (edge?.collinear_group) return edge.collinear_group;
  }
  return null;
}

/** Collect all node IDs belonging to a collinear group. */
function _collectCollinearNodeIds(graph: NodeGraph, groupId: string): Set<string> {
  const nodeIds = new Set<string>();
  for (const [, edge] of graph.edges) {
    if (edge.collinear_group === groupId) {
      nodeIds.add(edge.start_node);
      nodeIds.add(edge.end_node);
    }
  }
  return nodeIds;
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

  if (DEBUG) {
    console.log(
      LOG_PREFIX + " solveEdgeLengthChange: %c%s → %scm",
      LOG_STYLE, LOG_DIM,
      fmtEdge(edge, graph.nodes),
      newLength.toFixed(1)
    );
  }

  if (edge.length_locked) {
    if (DEBUG) console.log(LOG_PREFIX + " %c→ BLOCKED: edge is length-locked", LOG_STYLE, LOG_ERR);
    return { updates: [], blocked: true, blockedBy: [edge.id] };
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
  delete result.blockedBy;

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
): { positions: Map<string, { x: number; y: number }>; blocked: boolean; blockedBy?: string[] } {
  const graph = buildNodeGraph(nodes, edges);
  const result = solveNodeMove(graph, nodeId, newX, newY);
  return {
    positions: updatesToPreview(result.updates),
    blocked: result.blocked,
    blockedBy: result.blockedBy,
  };
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

  const startNode = graph.nodes.get(edge.start_node)!;
  const endNode = graph.nodes.get(edge.end_node)!;

  if (DEBUG) {
    console.group(
      LOG_PREFIX + " solveConstraintSnap: %csnap %s → %s",
      LOG_STYLE, LOG_DIM,
      fmtEdge(edge, graph.nodes),
      direction
    );
    console.log(
      `  Nodes: ${fmtNodeId(edge.start_node)} ${fmtPos(startNode)} → ${fmtNodeId(edge.end_node)} ${fmtPos(endNode)}`
    );
  }

  const snapped = snapEdgeToConstraint(edge, direction, graph.nodes);
  if (!snapped) {
    if (DEBUG) {
      console.log(LOG_PREFIX + " %cAlready satisfies %s — no-op", LOG_STYLE, LOG_OK, direction);
      console.groupEnd();
    }
    return { updates: [], blocked: false };
  }

  // Snapshot pre-existing violations so we don't blame this operation for them
  const originalPositions = snapshotPositions(graph);
  const { magnitudes: preMagnitudes } = computeViolations(graph, originalPositions);

  const newStart = snapped.nodeUpdates.find(u => u.nodeId === edge.start_node)!;
  const newEnd = snapped.nodeUpdates.find(u => u.nodeId === edge.end_node)!;

  if (DEBUG) {
    console.log(
      `  Snap target: ${fmtNodeId(edge.start_node)} ${fmtPos(newStart)} → ${fmtNodeId(edge.end_node)} ${fmtPos(newEnd)}`
    );
  }

  const positions = snapshotPositions(graph);
  positions.set(edge.start_node, { x: newStart.x, y: newStart.y });
  positions.set(edge.end_node, { x: newEnd.x, y: newEnd.y });

  const pinned = new Set([edge.start_node, edge.end_node]);

  // Pin all user-pinned nodes so the solver never moves them
  for (const [id, node] of graph.nodes) {
    if (node.pinned) pinned.add(id);
  }

  const result = solveIterative(graph, pinned, positions, preMagnitudes);

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

  if (DEBUG) {
    if (result.blocked) {
      console.log(
        LOG_PREFIX + " %c→ SNAP BLOCKED by: %s",
        LOG_STYLE, LOG_ERR,
        (result.blockedBy || []).map(id => {
          const e = graph.edges.get(id);
          return e ? fmtEdge(e, graph.nodes) : id.slice(0, 8) + "…";
        }).join(" | ")
      );
    } else {
      console.log(
        LOG_PREFIX + " %c→ Snap OK%c, %d node(s) to update",
        LOG_STYLE, LOG_OK, "", result.updates.length
      );
    }
    console.groupEnd();
  }

  return result;
}

/**
 * Check whether a proposed constraint change on an edge is feasible.
 * Temporarily applies the change and runs the solver to see if it converges.
 * Returns { feasible: true } or { feasible: false, blockedBy: [...] }.
 */
export function checkConstraintsFeasible(
  nodes: Node[],
  edges: Edge[],
  edgeId: string,
  proposed: { direction?: WallDirection; length_locked?: boolean; angle_group?: string | null }
): { feasible: boolean; blockedBy?: string[] } {
  if (DEBUG) {
    const propsStr = Object.entries(proposed).map(([k, v]) => `${k}=${v}`).join(", ");
    console.group(
      LOG_PREFIX + " checkConstraintsFeasible: %cedge %s → {%s}",
      LOG_STYLE, LOG_DIM,
      edgeId.slice(0, 8) + "…",
      propsStr
    );
  }

  // Snapshot pre-existing violations with the ORIGINAL edges
  const originalGraph = buildNodeGraph(nodes, edges);
  const originalPositions = snapshotPositions(originalGraph);
  const { magnitudes: preMagnitudes } = computeViolations(originalGraph, originalPositions);

  // Build edges with the proposed change applied
  const modifiedEdges = edges.map(e => {
    if (e.id !== edgeId) return e;
    return {
      ...e,
      ...(proposed.direction !== undefined && { direction: proposed.direction }),
      ...(proposed.length_locked !== undefined && { length_locked: proposed.length_locked }),
      ...(proposed.angle_group !== undefined && { angle_group: proposed.angle_group ?? undefined }),
    };
  });

  const graph = buildNodeGraph(nodes, modifiedEdges);
  const positions = snapshotPositions(graph);

  // Pin nothing — let the solver freely try to satisfy all constraints
  const pinned = new Set<string>();
  // Pin user-pinned nodes
  for (const [id, node] of graph.nodes) {
    if (node.pinned) pinned.add(id);
  }

  const result = solveIterative(graph, pinned, positions, preMagnitudes);

  if (result.blocked) {
    if (DEBUG) {
      console.log(
        LOG_PREFIX + " %c→ NOT FEASIBLE%c — blocked by: %s",
        LOG_STYLE, LOG_ERR, "",
        (result.blockedBy || []).map(id => {
          const e = graph.edges.get(id);
          return e ? fmtEdge(e, graph.nodes) : id.slice(0, 8) + "…";
        }).join(" | ")
      );
      console.groupEnd();
    }
    return { feasible: false, blockedBy: result.blockedBy };
  }

  if (DEBUG) {
    console.log(LOG_PREFIX + " %c→ Feasible", LOG_STYLE, LOG_OK);
    console.groupEnd();
  }
  return { feasible: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Degenerate edge detection
// ─────────────────────────────────────────────────────────────────────────────

/** Threshold below which an edge is considered degenerate (0-length). */
const DEGENERATE_THRESHOLD = 0.5;

/**
 * Find edges whose endpoints are at (or very near) the same position.
 * These are "single-point walls" / "0cm walls" that should be removed.
 *
 * @param nodes  All nodes on the floor
 * @param edges  All edges on the floor
 * @param threshold  Max length to consider degenerate (default 0.5 cm)
 * @returns Array of edge IDs that are degenerate
 */
export function findDegenerateEdges(
  nodes: Node[],
  edges: Edge[],
  threshold: number = DEGENERATE_THRESHOLD
): string[] {
  const nodeMap = new Map<string, Node>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const degenerate: string[] = [];
  for (const edge of edges) {
    const s = nodeMap.get(edge.start_node);
    const e = nodeMap.get(edge.end_node);
    if (!s || !e) continue;

    if (distance(s, e) <= threshold) {
      degenerate.push(edge.id);
    }
  }
  return degenerate;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constraint validation & auto-fix
// ─────────────────────────────────────────────────────────────────────────────

export interface ConstraintViolation {
  edgeId: string;
  type: 'direction' | 'length_locked' | 'angle_group' | 'collinear' | 'link_group';
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
  tolerance: number = 0.2
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

  // Collinear group check
  const groupNodes = new Map<string, Set<string>>();
  const groupFirstEdge = new Map<string, string>();
  for (const edge of edges) {
    if (!edge.collinear_group) continue;
    if (!groupNodes.has(edge.collinear_group)) {
      groupNodes.set(edge.collinear_group, new Set());
      groupFirstEdge.set(edge.collinear_group, edge.id);
    }
    groupNodes.get(edge.collinear_group)!.add(edge.start_node);
    groupNodes.get(edge.collinear_group)!.add(edge.end_node);
  }
  for (const [groupId, nodeIds] of groupNodes) {
    const points: Coordinates[] = [];
    for (const nid of nodeIds) {
      const n = nodeMap.get(nid);
      if (n) points.push({ x: n.x, y: n.y });
    }
    if (points.length < 2) continue;
    const { anchor, dir } = fitLine(points);
    let maxDev = 0;
    for (const p of points) {
      const projected = projectOntoLine(p, anchor, dir);
      maxDev = Math.max(maxDev, distance(p, projected));
    }
    if (maxDev > tolerance) {
      violations.push({
        edgeId: groupFirstEdge.get(groupId)!,
        type: 'collinear',
        expected: 0,
        actual: maxDev,
      });
    }
  }

  // Link group check: edges in the same link_group should have the same length
  const linkGroupEdges = new Map<string, string[]>();
  for (const edge of edges) {
    if (!edge.link_group) continue;
    if (!linkGroupEdges.has(edge.link_group)) {
      linkGroupEdges.set(edge.link_group, []);
    }
    linkGroupEdges.get(edge.link_group)!.push(edge.id);
  }
  for (const [, edgeIds] of linkGroupEdges) {
    if (edgeIds.length < 2) continue;
    // Compute lengths
    const lengths: number[] = [];
    for (const eid of edgeIds) {
      const edge = edges.find(e => e.id === eid)!;
      const s = nodeMap.get(edge.start_node);
      const e = nodeMap.get(edge.end_node);
      if (!s || !e) { lengths.push(0); continue; }
      lengths.push(distance(s, e));
    }
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    let maxDev = 0;
    for (const len of lengths) {
      maxDev = Math.max(maxDev, Math.abs(len - avgLen));
    }
    if (maxDev > tolerance) {
      violations.push({
        edgeId: edgeIds[0],
        type: 'link_group',
        expected: avgLen,
        actual: maxDev,
      });
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
 *   2. angle_group
 *   3. direction
 *
 * Returns the list of edge IDs whose constraints were relaxed, and the
 * original violations found. The caller persists changes to the backend.
 *
 * @deprecated Use `validateConstraints()` + UI highlighting instead.
 * This function silently removes user constraints; prefer showing conflicts
 * to the user so they can decide what to fix.
 */
export function autoFixConstraints(
  nodes: Node[],
  edges: Edge[],
  tolerance: number = 0.2
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

    if (worst.type === 'collinear') {
      edge.collinear_group = undefined;
    } else if (worst.type === 'direction') {
      edge.direction = "free";
    } else if (worst.type === 'length_locked') {
      edge.length_locked = false;
    } else if (worst.type === 'angle_group') {
      edge.angle_group = undefined;
    }
    fixedEdgeIds.add(edge.id);
  }

  return {
    fixedEdgeIds: Array.from(fixedEdgeIds),
    violations: initialViolations,
  };
}
