/**
 * Node-graph utilities for resolving edges to coordinates.
 */

import type { Node, Edge, Floor, Coordinates } from '../types';

export interface ResolvedEdge extends Edge {
  startPos: Coordinates;
  endPos: Coordinates;
}

export function buildNodeMap(nodes: Node[]): Map<string, Node> {
  const map = new Map<string, Node>();
  for (const node of nodes) {
    map.set(node.id, node);
  }
  return map;
}

export function resolveEdge(edge: Edge, nodeMap: Map<string, Node>): ResolvedEdge | null {
  const startNode = nodeMap.get(edge.start_node);
  const endNode = nodeMap.get(edge.end_node);
  if (!startNode || !endNode) return null;
  return {
    ...edge,
    startPos: { x: startNode.x, y: startNode.y },
    endPos: { x: endNode.x, y: endNode.y },
  };
}

export function resolveFloorEdges(floor: Floor): ResolvedEdge[] {
  const nodeMap = buildNodeMap(floor.nodes);
  const resolved: ResolvedEdge[] = [];
  for (const edge of floor.edges) {
    const r = resolveEdge(edge, nodeMap);
    if (r) resolved.push(r);
  }
  return resolved;
}

export function edgesAtNode(nodeId: string, edges: Edge[]): Edge[] {
  return edges.filter(e => e.start_node === nodeId || e.end_node === nodeId);
}

export function findNearestNode(point: Coordinates, nodes: Node[], maxDistance: number): Node | null {
  let best: Node | null = null;
  let bestDist = maxDistance;
  for (const node of nodes) {
    const dist = Math.sqrt((point.x - node.x) ** 2 + (point.y - node.y) ** 2);
    if (dist < bestDist) {
      bestDist = dist;
      best = node;
    }
  }
  return best;
}
