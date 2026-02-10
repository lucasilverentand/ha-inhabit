import { expect } from '@open-wc/testing';
import {
  buildNodeGraph,
  solveNodeMove,
  solveEdgeLengthChange,
  previewLengthChange,
  previewNodeDrag,
  snapEdgeToConstraint,
  solveConstraintSnap,
  validateConstraints,
  autoFixConstraints,
  findDegenerateEdges,
  solveCollinearTotalLength,
} from './wall-solver.js';
import type { Node, Edge, WallDirection, EdgeType } from '../types.js';
import { buildNodeMap } from './node-graph.js';
import { distance } from './geometry.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function createNode(id: string, x: number, y: number): Node {
  return { id, x, y };
}

function createEdge(
  id: string,
  startNode: string,
  endNode: string,
  opts?: { direction?: WallDirection; length_locked?: boolean; angle_group?: string; link_group?: string; type?: EdgeType }
): Edge {
  return {
    id,
    start_node: startNode,
    end_node: endNode,
    type: opts?.type ?? 'wall',
    thickness: 10,
    is_exterior: false,
    length_locked: opts?.length_locked ?? false,
    direction: opts?.direction ?? 'free',
    angle_group: opts?.angle_group,
    link_group: opts?.link_group,
  };
}

function findUpdate(updates: Array<{ nodeId: string; x: number; y: number }>, nodeId: string) {
  return updates.find(u => u.nodeId === nodeId);
}

/** Get the resolved position of a node after solver updates (falls back to original). */
function resolvedPos(
  updates: Array<{ nodeId: string; x: number; y: number }>,
  nodeId: string,
  nodes: Node[]
): { x: number; y: number } {
  const upd = findUpdate(updates, nodeId);
  if (upd) return { x: upd.x, y: upd.y };
  const n = nodes.find(n => n.id === nodeId)!;
  return { x: n.x, y: n.y };
}

/** Measure edge length after solver updates. */
function edgeLengthAfter(
  updates: Array<{ nodeId: string; x: number; y: number }>,
  edge: Edge,
  nodes: Node[]
): number {
  const a = resolvedPos(updates, edge.start_node, nodes);
  const b = resolvedPos(updates, edge.end_node, nodes);
  return distance(a, b);
}

/** Measure edge angle (radians) after solver updates. */
function edgeAngleAfter(
  updates: Array<{ nodeId: string; x: number; y: number }>,
  edge: Edge,
  nodes: Node[]
): number {
  const a = resolvedPos(updates, edge.start_node, nodes);
  const b = resolvedPos(updates, edge.end_node, nodes);
  return Math.atan2(b.y - a.y, b.x - a.x);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. buildNodeGraph
// ─────────────────────────────────────────────────────────────────────────────

describe('buildNodeGraph', () => {
  it('should create a graph from nodes and edges', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100)];
    const edges = [createEdge('e1', 'n1', 'n2'), createEdge('e2', 'n2', 'n3')];
    const graph = buildNodeGraph(nodes, edges);
    expect(graph.edges.size).to.equal(2);
    expect(graph.nodes.size).to.equal(3);
  });

  it('should group edges that share a node', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 100), createNode('n4', 200, 0),
    ];
    const edges = [createEdge('e1', 'n1', 'n2'), createEdge('e2', 'n2', 'n3'), createEdge('e3', 'n2', 'n4')];
    const graph = buildNodeGraph(nodes, edges);
    expect(graph.nodeToEdges.get('n2')!.length).to.equal(3);
  });

  it('should handle isolated edges', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 200, 200), createNode('n4', 300, 200),
    ];
    const edges = [createEdge('e1', 'n1', 'n2'), createEdge('e2', 'n3', 'n4')];
    const graph = buildNodeGraph(nodes, edges);
    expect(graph.edges.size).to.equal(2);
    expect(graph.nodeToEdges.get('n1')!.length).to.equal(1);
    expect(graph.nodeToEdges.get('n4')!.length).to.equal(1);
  });

  it('should handle a node with no edges', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('orphan', 50, 50)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    expect(graph.nodes.size).to.equal(3);
    expect(graph.nodeToEdges.has('orphan')).to.be.false;
  });

  it('should handle empty inputs', () => {
    const graph = buildNodeGraph([], []);
    expect(graph.nodes.size).to.equal(0);
    expect(graph.edges.size).to.equal(0);
  });

  it('should register both endpoints of a self-referencing edge entry', () => {
    // Node appearing as both start and end of two different edges
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 0, 100)];
    const edges = [createEdge('e1', 'n1', 'n2'), createEdge('e2', 'n1', 'n3')];
    const graph = buildNodeGraph(nodes, edges);
    const n1Edges = graph.nodeToEdges.get('n1')!;
    expect(n1Edges.length).to.equal(2);
    expect(n1Edges.every(e => e.endpoint === 'start')).to.be.true;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. solveNodeMove – basic
// ─────────────────────────────────────────────────────────────────────────────

describe('solveNodeMove', () => {
  it('should move a free node with no constraints', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100)];
    const edges = [createEdge('e1', 'n1', 'n2'), createEdge('e2', 'n2', 'n3')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150, 0);
    expect(result.blocked).to.be.false;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(n2.x).to.equal(150);
    expect(n2.y).to.equal(0);
  });

  it('should not move other nodes on a free edge', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 200, 0);
    expect(findUpdate(result.updates, 'n1')).to.be.undefined;
  });

  it('should include the moved node itself in updates', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 10, 20);
    const n1 = findUpdate(result.updates, 'n1')!;
    expect(n1.x).to.equal(10);
    expect(n1.y).to.equal(20);
  });

  it('should handle moving a node to the same position (no-op)', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 100, 0);
    expect(result.blocked).to.be.false;
    // n1 should not need an update since nothing changed
    expect(findUpdate(result.updates, 'n1')).to.be.undefined;
  });

  // ── direction: horizontal ──────────────────────────────────────────────

  it('should respect horizontal direction by adjusting other node', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150, 50);
    expect(result.blocked).to.be.false;
    const n1 = findUpdate(result.updates, 'n1')!;
    expect(n1.y).to.equal(50); // same Y as n2
    expect(n1.x).to.equal(0);  // X unchanged
  });

  it('horizontal: moving start node adjusts end node Y', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 0, 30);
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(n2.y).to.equal(30);
    expect(n2.x).to.equal(100);
  });

  it('horizontal: large diagonal drag keeps edge flat', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 200, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', -500, 300);
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(n2.y).to.equal(300);
  });

  // ── direction: vertical ────────────────────────────────────────────────

  it('should respect vertical direction by adjusting other node', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 0, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'vertical' })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 50, 150);
    const n1 = findUpdate(result.updates, 'n1')!;
    expect(n1.x).to.equal(50);
    expect(n1.y).to.equal(0);
  });

  it('vertical: moving start node adjusts end node X', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 0, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'vertical' })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 75, 0);
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(n2.x).to.equal(75);
    expect(n2.y).to.equal(100);
  });

  // ── length_locked ──────────────────────────────────────────────────────

  it('should respect length_locked by moving other node', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150, 0);
    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    const len = distance(n1, n2);
    expect(len).to.be.closeTo(100, 0.01);
  });

  it('length_locked: dragging diagonally preserves length', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 100, 100);
    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(distance(n1, n2)).to.be.closeTo(100, 0.01);
  });

  it('length_locked: moving node onto other node (zero distance) is blocked', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    // Move n2 exactly on top of n1 — violates length lock (original length=100)
    const result = solveNodeMove(graph, 'n2', 0, 0);
    expect(result.blocked).to.be.true;
  });

  // ── propagation ────────────────────────────────────────────────────────

  it('should propagate constrained node movement to connected edges', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 0, -100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n3', 'n1'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 100, 50);
    const n1 = findUpdate(result.updates, 'n1')!;
    expect(n1.y).to.equal(50);
    // n3 should not move (free edge)
    expect(findUpdate(result.updates, 'n3')).to.be.undefined;
  });

  // ── combined constraints ───────────────────────────────────────────────

  it('should handle combined length_locked + direction', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal', length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 200, 50);
    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    // Horizontal: same Y
    expect(n1.y).to.equal(50);
    // Length preserved at 100
    expect(distance(n1, n2)).to.be.closeTo(100, 0.01);
    expect(n1.x).to.be.closeTo(100, 0.01);
  });

  it('horizontal + length_locked: move start node', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal', length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', -50, 20);
    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(n2.y).to.equal(20);
    expect(distance(n1, n2)).to.be.closeTo(100, 0.01);
  });

  it('vertical + length_locked: preserves length and alignment', () => {
    const nodes = [createNode('n1', 50, 0), createNode('n2', 50, 200)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'vertical', length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 100, 0);
    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(n2.x).to.equal(100); // vertical alignment
    expect(distance(n1, n2)).to.be.closeTo(200, 0.01);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. solveNodeMove – advanced propagation
// ─────────────────────────────────────────────────────────────────────────────

describe('solveNodeMove – chain propagation', () => {
  it('should propagate through a 3-edge horizontal chain', () => {
    //  n1 --H-- n2 --H-- n3 --H-- n4
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 200, 0), createNode('n4', 300, 0),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3', { direction: 'horizontal' }),
      createEdge('e3', 'n3', 'n4', { direction: 'horizontal' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 0, 50);
    // All nodes should move to Y=50
    for (const id of ['n1', 'n2', 'n3', 'n4']) {
      const pos = resolvedPos(result.updates, id, nodes);
      expect(pos.y).to.be.closeTo(50, 0.01);
    }
  });

  it('should propagate through a 3-edge length-locked chain', () => {
    //  n1 --L-- n2 --L-- n3 --L-- n4  (all length 100)
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 200, 0), createNode('n4', 300, 0),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { length_locked: true }),
      createEdge('e2', 'n2', 'n3', { length_locked: true }),
      createEdge('e3', 'n3', 'n4', { length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n4', 350, 0);
    // Each edge should still be length 100
    for (const e of edges) {
      expect(edgeLengthAfter(result.updates, e, nodes)).to.be.closeTo(100, 0.5);
    }
  });

  it('should propagate mixed horizontal+vertical in an L-shape', () => {
    //  n1 --H-- n2 --V-- n3
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150, 50);

    const n1 = resolvedPos(result.updates, 'n1', nodes);
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    const n3 = resolvedPos(result.updates, 'n3', nodes);

    expect(n1.y).to.equal(50);  // horizontal with n2
    expect(n3.x).to.equal(150); // vertical with n2
  });

  it('should propagate through a mixed constraint chain: H → V → L', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 100), createNode('n4', 200, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),
      createEdge('e3', 'n3', 'n4', { length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 0, 50);

    // n2 follows n1 horizontally
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    expect(n2.y).to.be.closeTo(50, 0.01);

    // n3 follows n2 vertically
    const n3 = resolvedPos(result.updates, 'n3', nodes);
    expect(n3.x).to.be.closeTo(100, 0.01);

    // e3 length preserved
    expect(edgeLengthAfter(result.updates, edges[2], nodes)).to.be.closeTo(100, 0.5);
  });

  it('should handle a fan: one node connected to 4 free edges', () => {
    const nodes = [
      createNode('center', 0, 0),
      createNode('a', 100, 0), createNode('b', 0, 100),
      createNode('c', -100, 0), createNode('d', 0, -100),
    ];
    const edges = [
      createEdge('ea', 'center', 'a'),
      createEdge('eb', 'center', 'b'),
      createEdge('ec', 'center', 'c'),
      createEdge('ed', 'center', 'd'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'center', 50, 50);
    expect(result.blocked).to.be.false;
    // Other nodes don't move (all free)
    for (const id of ['a', 'b', 'c', 'd']) {
      expect(findUpdate(result.updates, id)).to.be.undefined;
    }
  });

  it('should handle a fan with constrained edges', () => {
    const nodes = [
      createNode('center', 0, 0),
      createNode('a', 100, 0), createNode('b', 0, 100),
      createNode('c', -100, 0), createNode('d', 0, -100),
    ];
    const edges = [
      createEdge('ea', 'center', 'a', { direction: 'horizontal' }),
      createEdge('eb', 'center', 'b', { direction: 'vertical' }),
      createEdge('ec', 'center', 'c', { direction: 'horizontal' }),
      createEdge('ed', 'center', 'd', { direction: 'vertical' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'center', 10, 20);

    // Horizontal edges: a and c match center's Y
    const a = resolvedPos(result.updates, 'a', nodes);
    const c = resolvedPos(result.updates, 'c', nodes);
    expect(a.y).to.equal(20);
    expect(c.y).to.equal(20);

    // Vertical edges: b and d match center's X
    const b = resolvedPos(result.updates, 'b', nodes);
    const d = resolvedPos(result.updates, 'd', nodes);
    expect(b.x).to.equal(10);
    expect(d.x).to.equal(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. solveNodeMove – closed shapes
// ─────────────────────────────────────────────────────────────────────────────

describe('solveNodeMove – closed shapes', () => {
  it('should handle a closed rectangle (4 free edges)', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 100), createNode('n4', 0, 100),
    ];
    const edges = [
      createEdge('top', 'n1', 'n2'),
      createEdge('right', 'n2', 'n3'),
      createEdge('bottom', 'n3', 'n4'),
      createEdge('left', 'n4', 'n1'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    // Moving one corner should not affect opposite corner (free edges)
    const result = solveNodeMove(graph, 'n1', -10, -10);
    expect(findUpdate(result.updates, 'n3')).to.be.undefined;
  });

  it('should handle a closed triangle', () => {
    const nodes = [
      createNode('a', 0, 0), createNode('b', 100, 0), createNode('c', 50, 87),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'), createEdge('ca', 'c', 'a'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'a', 10, 10);
    expect(result.blocked).to.be.false;
  });

  it('should propagate around a closed rectangle with all-horizontal/vertical', () => {
    //  n1 -H- n2
    //  |V     |V
    //  n4 -H- n3
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 100), createNode('n4', 0, 100),
    ];
    const edges = [
      createEdge('top', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('right', 'n2', 'n3', { direction: 'vertical' }),
      createEdge('bottom', 'n3', 'n4', { direction: 'horizontal' }),
      createEdge('left', 'n4', 'n1', { direction: 'vertical' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 10, 10);

    // All nodes should shift to maintain rectangle shape
    const n1 = resolvedPos(result.updates, 'n1', nodes);
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    const n3 = resolvedPos(result.updates, 'n3', nodes);
    const n4 = resolvedPos(result.updates, 'n4', nodes);

    // top edge horizontal: n1.y == n2.y
    expect(n1.y).to.be.closeTo(n2.y, 0.5);
    // right edge vertical: n2.x == n3.x
    expect(n2.x).to.be.closeTo(n3.x, 0.5);
    // bottom edge horizontal: n3.y == n4.y
    expect(n3.y).to.be.closeTo(n4.y, 0.5);
    // left edge vertical: n4.x == n1.x
    expect(n4.x).to.be.closeTo(n1.x, 0.5);
  });

  it('should handle a T-junction: moving shared node propagates to all 3 edges', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 200, 0), createNode('n4', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3', { direction: 'horizontal' }),
      createEdge('e3', 'n2', 'n4', { direction: 'vertical' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 100, 50);

    // Horizontal edges propagate Y
    const n1 = resolvedPos(result.updates, 'n1', nodes);
    const n3 = resolvedPos(result.updates, 'n3', nodes);
    expect(n1.y).to.equal(50);
    expect(n3.y).to.equal(50);

    // Vertical edge propagates X
    const n4 = resolvedPos(result.updates, 'n4', nodes);
    expect(n4.x).to.equal(100);
  });

  it('should handle cross junction (4 edges at one node)', () => {
    const nodes = [
      createNode('center', 100, 100),
      createNode('top', 100, 0), createNode('right', 200, 100),
      createNode('bottom', 100, 200), createNode('left', 0, 100),
    ];
    const edges = [
      createEdge('eT', 'center', 'top', { direction: 'vertical' }),
      createEdge('eR', 'center', 'right', { direction: 'horizontal' }),
      createEdge('eB', 'center', 'bottom', { direction: 'vertical' }),
      createEdge('eL', 'center', 'left', { direction: 'horizontal' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'center', 110, 120);

    const top = resolvedPos(result.updates, 'top', nodes);
    const right = resolvedPos(result.updates, 'right', nodes);
    const bottom = resolvedPos(result.updates, 'bottom', nodes);
    const left = resolvedPos(result.updates, 'left', nodes);

    expect(top.x).to.equal(110);    // vertical
    expect(bottom.x).to.equal(110); // vertical
    expect(right.y).to.equal(120);  // horizontal
    expect(left.y).to.equal(120);   // horizontal
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. solveNodeMove – angle group (pair-based)
// ─────────────────────────────────────────────────────────────────────────────

describe('solveNodeMove – angle group', () => {
  it('should preserve 90° angle between two edges at a shared node', () => {
    // L-shape: n1--n2--n3, right angle at n2
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { angle_group: 'ag1' }),
      createEdge('e2', 'n2', 'n3', { angle_group: 'ag1' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    // Move shared node n2 downward
    const result = solveNodeMove(graph, 'n2', 100, 50);

    // After moving n2 to (100,50), the angle between e1 and e2 at n2 should stay 90°
    const n1 = resolvedPos(result.updates, 'n1', nodes);
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    const n3 = resolvedPos(result.updates, 'n3', nodes);

    const angleE1 = Math.atan2(n1.y - n2.y, n1.x - n2.x);
    const angleE2 = Math.atan2(n3.y - n2.y, n3.x - n2.x);
    let angleBetween = ((angleE2 - angleE1) + 2 * Math.PI) % (2 * Math.PI);
    // Original angle between edges at n2: atan2(0-0, 0-100) to atan2(100-0, 100-100) = π to π/2
    // = (π/2 - π + 2π) % 2π = 3π/2 (or equivalently -π/2)
    // The solver preserves this angle
    expect(angleBetween).to.be.closeTo(3 * Math.PI / 2, 0.1);
  });

  it('should preserve angle with a free third edge at the shared node', () => {
    // T-junction: e1 and e2 are angle-grouped at n2, e3 is free
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 100), createNode('n4', 200, 0),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { angle_group: 'ag1' }),
      createEdge('e2', 'n2', 'n3', { angle_group: 'ag1' }),
      createEdge('e3', 'n2', 'n4'), // free edge
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 0, 50);

    // The angle between e1 and e2 at n2 should be preserved
    const n1 = resolvedPos(result.updates, 'n1', nodes);
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    const n3 = resolvedPos(result.updates, 'n3', nodes);

    const angleE1 = Math.atan2(n1.y - n2.y, n1.x - n2.x);
    const angleE2 = Math.atan2(n3.y - n2.y, n3.x - n2.x);
    const angleBetween = ((angleE2 - angleE1) + 2 * Math.PI) % (2 * Math.PI);
    expect(angleBetween).to.be.closeTo(3 * Math.PI / 2, 0.1);
  });

  it('should handle angle group in a closed rectangle', () => {
    // Rectangle with all 4 corners angle-grouped
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 200, 0),
      createNode('n3', 200, 200), createNode('n4', 0, 200),
    ];
    const edges = [
      createEdge('top', 'n1', 'n2', { angle_group: 'ag1' }),
      createEdge('right', 'n2', 'n3', { angle_group: 'ag1' }),
      // Different angle group for the other corner
      createEdge('bottom', 'n3', 'n4', { angle_group: 'ag2' }),
      createEdge('left', 'n4', 'n1', { angle_group: 'ag2' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 250, 0);
    expect(result.blocked).to.be.false;
  });

  it('edges without angle_group are not affected by angle constraints', () => {
    // Two edges sharing node but NO angle_group — should move freely
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n3', 150, 100);

    // n3 should move to requested position since edges are free
    const n3 = findUpdate(result.updates, 'n3')!;
    expect(n3.x).to.be.closeTo(150, 0.01);
    expect(n3.y).to.be.closeTo(100, 0.01);
    // n1 should not move
    expect(findUpdate(result.updates, 'n1')).to.be.undefined;
  });

  it('should preserve angle when dragging an outer node', () => {
    // Drag n3 (outer node of e2) — angle at n2 should be preserved
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { angle_group: 'ag1' }),
      createEdge('e2', 'n2', 'n3', { angle_group: 'ag1' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n3', 150, 100);

    const n1 = resolvedPos(result.updates, 'n1', nodes);
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    const n3 = resolvedPos(result.updates, 'n3', nodes);

    const angleE1 = Math.atan2(n1.y - n2.y, n1.x - n2.x);
    const angleE2 = Math.atan2(n3.y - n2.y, n3.x - n2.x);
    const angleBetween = ((angleE2 - angleE1) + 2 * Math.PI) % (2 * Math.PI);
    // Original angle is 3π/2 (270°)
    expect(angleBetween).to.be.closeTo(3 * Math.PI / 2, 0.1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. solveEdgeLengthChange
// ─────────────────────────────────────────────────────────────────────────────

describe('solveEdgeLengthChange', () => {
  it('should extend edge from center', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 200);

    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    const center = { x: (n1.x + n2.x) / 2, y: (n1.y + n2.y) / 2 };
    expect(center.x).to.be.closeTo(50, 0.01);
    expect(distance(n1, n2)).to.be.closeTo(200, 0.01);
  });

  it('should shrink edge from center', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 200, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 50);

    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(distance(n1, n2)).to.be.closeTo(50, 0.01);
    // Center preserved
    const center = { x: (n1.x + n2.x) / 2, y: (n1.y + n2.y) / 2 };
    expect(center.x).to.be.closeTo(100, 0.01);
  });

  it('should block length change on length-locked edge', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 200);

    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.deep.equal(['e1']);
    expect(result.updates.length).to.equal(0);
  });

  it('should preserve angle when changing length', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 100)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 200);

    const origAngle = Math.atan2(100, 100);
    expect(edgeAngleAfter(result.updates, edges[0], nodes)).to.be.closeTo(origAngle, 0.01);
  });

  it('should push connected vertical edge when extending', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 200);

    const n2 = findUpdate(result.updates, 'n2')!;
    const n3 = findUpdate(result.updates, 'n3');
    expect(n3).to.exist;
    expect(n3!.x).to.equal(n2.x);
  });

  it('should handle edge with length 0 gracefully', () => {
    const nodes = [createNode('n1', 50, 50), createNode('n2', 50, 50)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 100);
    // Zero-length edge: solver returns empty (cannot determine direction)
    expect(result.blocked).to.be.false;
  });

  it('should handle nonexistent edge gracefully', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'nonexistent', 200);
    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(0);
  });

  it('should preserve center for vertical edge', () => {
    const nodes = [createNode('n1', 50, 0), createNode('n2', 50, 100)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 200);

    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect((n1.y + n2.y) / 2).to.be.closeTo(50, 0.01);
    expect((n1.x + n2.x) / 2).to.be.closeTo(50, 0.01);
    expect(distance(n1, n2)).to.be.closeTo(200, 0.01);
  });

  it('should propagate length change through length-locked neighbor', () => {
    // e1 (free, extended) -> n2 -> e2 (length_locked)
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 200, 0),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3', { length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 200);

    // n2 moved, e2 length_locked should preserve e2's length
    expect(edgeLengthAfter(result.updates, edges[1], nodes)).to.be.closeTo(100, 0.5);
  });

  it('should set length to very small value', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 1000, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 1);
    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(distance(n1, n2)).to.be.closeTo(1, 0.01);
  });

  it('should handle very large length change', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 10, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 100000);
    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(distance(n1, n2)).to.be.closeTo(100000, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. snapEdgeToConstraint
// ─────────────────────────────────────────────────────────────────────────────

describe('snapEdgeToConstraint', () => {
  it('should return null for free direction', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const nodeMap = buildNodeMap(nodes);
    expect(snapEdgeToConstraint(createEdge('e1', 'n1', 'n2'), 'free', nodeMap)).to.be.null;
  });

  it('should snap diagonal edge to horizontal', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const nodeMap = buildNodeMap(nodes);
    const result = snapEdgeToConstraint(createEdge('e1', 'n1', 'n2'), 'horizontal', nodeMap)!;
    const n1 = result.nodeUpdates.find(u => u.nodeId === 'n1')!;
    const n2 = result.nodeUpdates.find(u => u.nodeId === 'n2')!;
    expect(n1.y).to.equal(n2.y);
    // Length preserved
    const origLen = distance({ x: 0, y: 0 }, { x: 100, y: 50 });
    expect(Math.abs(n2.x - n1.x)).to.be.closeTo(origLen, 0.01);
  });

  it('should return null for already-horizontal edge', () => {
    const nodes = [createNode('n1', 0, 50), createNode('n2', 100, 50)];
    const nodeMap = buildNodeMap(nodes);
    expect(snapEdgeToConstraint(createEdge('e1', 'n1', 'n2'), 'horizontal', nodeMap)).to.be.null;
  });

  it('should snap diagonal edge to vertical', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 50, 100)];
    const nodeMap = buildNodeMap(nodes);
    const result = snapEdgeToConstraint(createEdge('e1', 'n1', 'n2'), 'vertical', nodeMap)!;
    const n1 = result.nodeUpdates.find(u => u.nodeId === 'n1')!;
    const n2 = result.nodeUpdates.find(u => u.nodeId === 'n2')!;
    expect(n1.x).to.equal(n2.x);
  });

  it('should return null for already-vertical edge', () => {
    const nodes = [createNode('n1', 50, 0), createNode('n2', 50, 100)];
    const nodeMap = buildNodeMap(nodes);
    expect(snapEdgeToConstraint(createEdge('e1', 'n1', 'n2'), 'vertical', nodeMap)).to.be.null;
  });

  it('should preserve edge center when snapping to horizontal', () => {
    const nodes = [createNode('n1', 10, 20), createNode('n2', 110, 80)];
    const nodeMap = buildNodeMap(nodes);
    const result = snapEdgeToConstraint(createEdge('e1', 'n1', 'n2'), 'horizontal', nodeMap)!;
    const n1 = result.nodeUpdates.find(u => u.nodeId === 'n1')!;
    const n2 = result.nodeUpdates.find(u => u.nodeId === 'n2')!;
    expect((n1.x + n2.x) / 2).to.be.closeTo(60, 0.01);
    expect((n1.y + n2.y) / 2).to.be.closeTo(50, 0.01);
  });

  it('should preserve edge center when snapping to vertical', () => {
    const nodes = [createNode('n1', 20, 10), createNode('n2', 80, 110)];
    const nodeMap = buildNodeMap(nodes);
    const result = snapEdgeToConstraint(createEdge('e1', 'n1', 'n2'), 'vertical', nodeMap)!;
    const n1 = result.nodeUpdates.find(u => u.nodeId === 'n1')!;
    const n2 = result.nodeUpdates.find(u => u.nodeId === 'n2')!;
    expect((n1.x + n2.x) / 2).to.be.closeTo(50, 0.01);
    expect((n1.y + n2.y) / 2).to.be.closeTo(60, 0.01);
  });

  it('should preserve node ordering when snapping to horizontal (start left)', () => {
    const nodes = [createNode('n1', 10, 20), createNode('n2', 200, 80)];
    const nodeMap = buildNodeMap(nodes);
    const result = snapEdgeToConstraint(createEdge('e1', 'n1', 'n2'), 'horizontal', nodeMap)!;
    const n1 = result.nodeUpdates.find(u => u.nodeId === 'n1')!;
    const n2 = result.nodeUpdates.find(u => u.nodeId === 'n2')!;
    expect(n1.x).to.be.lessThan(n2.x);
  });

  it('should preserve node ordering when snapping to vertical (start top)', () => {
    const nodes = [createNode('n1', 20, 10), createNode('n2', 80, 200)];
    const nodeMap = buildNodeMap(nodes);
    const result = snapEdgeToConstraint(createEdge('e1', 'n1', 'n2'), 'vertical', nodeMap)!;
    const n1 = result.nodeUpdates.find(u => u.nodeId === 'n1')!;
    const n2 = result.nodeUpdates.find(u => u.nodeId === 'n2')!;
    expect(n1.y).to.be.lessThan(n2.y);
  });

  it('should handle nearly-horizontal edge (1px off)', () => {
    const nodes = [createNode('n1', 0, 50), createNode('n2', 100, 51)];
    const nodeMap = buildNodeMap(nodes);
    // Math.round(50) !== Math.round(51), so snap is needed
    const result = snapEdgeToConstraint(createEdge('e1', 'n1', 'n2'), 'horizontal', nodeMap);
    expect(result).to.not.be.null;
  });

  it('should handle nearly-vertical edge (1px off)', () => {
    const nodes = [createNode('n1', 50, 0), createNode('n2', 51, 100)];
    const nodeMap = buildNodeMap(nodes);
    const result = snapEdgeToConstraint(createEdge('e1', 'n1', 'n2'), 'vertical', nodeMap);
    expect(result).to.not.be.null;
  });

  it('should handle missing node gracefully', () => {
    const nodeMap = buildNodeMap([createNode('n1', 0, 0)]);
    const edge = createEdge('e1', 'n1', 'missing');
    const result = snapEdgeToConstraint(edge, 'horizontal', nodeMap);
    expect(result).to.be.null;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. solveConstraintSnap
// ─────────────────────────────────────────────────────────────────────────────

describe('solveConstraintSnap', () => {
  it('should return no updates when direction needs no geometry change', () => {
    const nodes = [createNode('n1', 0, 50), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'horizontal');
    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(0);
  });

  it('should snap isolated edge without connected edges', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'horizontal');
    expect(result.updates.length).to.equal(2);
    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(n1.y).to.equal(n2.y);
  });

  it('should keep connected edges connected when snapping to horizontal', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 50), createNode('n3', 100, 150),
    ];
    const edges = [createEdge('e1', 'n1', 'n2'), createEdge('e2', 'n2', 'n3')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'horizontal');
    expect(result.blocked).to.be.false;
    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(n1.y).to.equal(n2.y);
  });

  it('should keep connected edges connected when snapping to vertical', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 50, 100), createNode('n3', -100, 0),
    ];
    const edges = [createEdge('e1', 'n1', 'n2'), createEdge('e2', 'n1', 'n3')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'vertical');
    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(n1.x).to.equal(n2.x);
  });

  it('should propagate to multiple connected edges at both endpoints', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 50),
      createNode('n3', 0, -100), createNode('n4', 200, 50),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n3', 'n1'),
      createEdge('e3', 'n2', 'n4'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'horizontal');
    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    expect(n1.y).to.equal(n2.y);
  });

  it('should return no updates for free direction', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'free');
    expect(result.updates.length).to.equal(0);
  });

  it('should respect direction constraints on connected edges during snap', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 50), createNode('n3', 100, 150),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'horizontal');
    const n2 = findUpdate(result.updates, 'n2')!;
    const n3 = findUpdate(result.updates, 'n3');
    expect(n3).to.exist;
    expect(n3!.x).to.equal(n2.x);
  });

  it('should handle nonexistent edge gracefully', () => {
    const nodes = [createNode('n1', 0, 0)];
    const graph = buildNodeGraph(nodes, []);
    const result = solveConstraintSnap(graph, 'missing', 'horizontal');
    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(0);
  });

  it('should snap then propagate through length-locked neighbor', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 50),
      createNode('n3', 200, 50),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3', { length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'horizontal');
    // e2 should keep its length after snap
    expect(edgeLengthAfter(result.updates, edges[1], nodes)).to.be.closeTo(100, 0.5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. preview functions
// ─────────────────────────────────────────────────────────────────────────────

describe('previewNodeDrag', () => {
  it('should return preview of node drag', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100),
    ];
    const edges = [createEdge('e1', 'n1', 'n2'), createEdge('e2', 'n2', 'n3')];
    const { positions: preview } = previewNodeDrag(nodes, edges, 'n2', 150, 0);
    expect(preview.size).to.be.greaterThan(0);
    expect(preview.has('n2')).to.be.true;
  });

  it('should not mutate original nodes', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    previewNodeDrag(nodes, edges, 'n2', 200, 50);
    expect(nodes[0].x).to.equal(0);
    expect(nodes[0].y).to.equal(0);
    expect(nodes[1].x).to.equal(100);
    expect(nodes[1].y).to.equal(0);
  });

  it('should include constrained nodes in preview', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    const { positions: preview } = previewNodeDrag(nodes, edges, 'n2', 100, 50);
    expect(preview.has('n1')).to.be.true;
    expect(preview.get('n1')!.y).to.equal(50);
  });
});

describe('previewLengthChange', () => {
  it('should return preview without modifying nodes', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const preview = previewLengthChange(nodes, edges, 'e1', 200);
    expect(preview.size).to.be.greaterThan(0);
    expect(nodes[0].x).to.equal(0);
    expect(nodes[1].x).to.equal(100);
  });

  it('should return empty map for length-locked edge', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];
    const preview = previewLengthChange(nodes, edges, 'e1', 200);
    expect(preview.size).to.equal(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. complex real-world scenarios
// ─────────────────────────────────────────────────────────────────────────────

describe('complex scenarios', () => {
  it('should handle a closed rectangle', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 100), createNode('n4', 0, 100),
    ];
    const edges = [
      createEdge('top', 'n1', 'n2'), createEdge('right', 'n2', 'n3'),
      createEdge('bottom', 'n3', 'n4'), createEdge('left', 'n4', 'n1'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    for (const id of ['n1', 'n2', 'n3', 'n4']) {
      expect(graph.nodeToEdges.get(id)!.length).to.equal(2);
    }
  });

  it('should handle T-junction', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 200, 0), createNode('n4', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'), createEdge('e2', 'n2', 'n3'), createEdge('e3', 'n2', 'n4'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    expect(graph.nodeToEdges.get('n2')!.length).to.equal(3);
  });

  it('should handle mixed constraints in connected edges while staying connected', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150, 50);

    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    const n3 = findUpdate(result.updates, 'n3')!;

    expect(n2.x).to.equal(150);
    expect(n2.y).to.equal(50);
    expect(n1.y).to.equal(50);  // horizontal
    expect(n3.x).to.equal(150); // vertical
  });

  it('should handle a room with a door (mixed edge types)', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 80), createNode('n4', 100, 100),
      createNode('n5', 0, 100),
    ];
    const edges = [
      createEdge('wall1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('wall2', 'n2', 'n3', { direction: 'vertical' }),
      createEdge('door', 'n3', 'n4', { type: 'door', direction: 'vertical', length_locked: true }),
      createEdge('wall3', 'n4', 'n5', { direction: 'horizontal' }),
      createEdge('wall4', 'n5', 'n1', { direction: 'vertical' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 10, 0);
    expect(result.blocked).to.be.false;
    // Door length should be preserved
    expect(edgeLengthAfter(result.updates, edges[2], nodes)).to.be.closeTo(20, 0.5);
  });

  it('should handle two rooms sharing a wall', () => {
    //  n1 -- n2 -- n5
    //  |     |     |
    //  n4 -- n3 -- n6
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n5', 200, 0),
      createNode('n4', 0, 100), createNode('n3', 100, 100), createNode('n6', 200, 100),
    ];
    const edges = [
      createEdge('top1', 'n1', 'n2'), createEdge('top2', 'n2', 'n5'),
      createEdge('shared', 'n2', 'n3', { direction: 'vertical' }),
      createEdge('bot1', 'n4', 'n3'), createEdge('bot2', 'n3', 'n6'),
      createEdge('left', 'n1', 'n4'), createEdge('right', 'n5', 'n6'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    // Move shared wall node
    const result = solveNodeMove(graph, 'n2', 120, 0);
    const n3 = resolvedPos(result.updates, 'n3', nodes);
    // Shared wall stays vertical
    expect(n3.x).to.equal(120);
  });

  it('should handle a zigzag chain of alternating H/V edges', () => {
    //  n1 -H- n2 -V- n3 -H- n4 -V- n5
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 100), createNode('n4', 200, 100),
      createNode('n5', 200, 200),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),
      createEdge('e3', 'n3', 'n4', { direction: 'horizontal' }),
      createEdge('e4', 'n4', 'n5', { direction: 'vertical' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n3', 150, 120);

    const n2 = resolvedPos(result.updates, 'n2', nodes);
    const n4 = resolvedPos(result.updates, 'n4', nodes);

    // n2 vertical with n3 → n2.x = 150
    expect(n2.x).to.be.closeTo(150, 0.5);
    // n4 horizontal with n3 → n4.y = 120
    expect(n4.y).to.be.closeTo(120, 0.5);
  });

  it('safety limit: should not infinite-loop on circular constraints', () => {
    // Closed triangle with all edges horizontal (contradictory — but should not hang)
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 50, 87),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3', { direction: 'horizontal' }),
      createEdge('e3', 'n3', 'n1', { direction: 'horizontal' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    // Should terminate (safety limit) and not throw
    const result = solveNodeMove(graph, 'n1', 0, 50);
    expect(result.blocked).to.be.false;
  });

  it('should handle star topology: 5 edges from a central node', () => {
    const nodes = [
      createNode('c', 0, 0),
      createNode('a', 100, 0), createNode('b', 0, 100),
      createNode('d', -100, 0), createNode('e', 0, -100),
      createNode('f', 70, 70),
    ];
    const edges = [
      createEdge('ca', 'c', 'a', { direction: 'horizontal' }),
      createEdge('cb', 'c', 'b', { direction: 'vertical' }),
      createEdge('cd', 'c', 'd', { direction: 'horizontal' }),
      createEdge('ce', 'c', 'e', { direction: 'vertical' }),
      createEdge('cf', 'c', 'f', { length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'c', 10, 20);

    // Horizontal edges: a and d match center Y
    const a = resolvedPos(result.updates, 'a', nodes);
    const d = resolvedPos(result.updates, 'd', nodes);
    expect(a.y).to.equal(20);
    expect(d.y).to.equal(20);

    // Vertical edges: b and e match center X
    const b = resolvedPos(result.updates, 'b', nodes);
    const e = resolvedPos(result.updates, 'e', nodes);
    expect(b.x).to.equal(10);
    expect(e.x).to.equal(10);

    // Length-locked edge: length preserved
    const origLen = distance({ x: 0, y: 0 }, { x: 70, y: 70 });
    const f = resolvedPos(result.updates, 'f', nodes);
    expect(distance({ x: 10, y: 20 }, f)).to.be.closeTo(origLen, 0.5);
  });

  it('should handle U-shape floor plan with constraints', () => {
    //  n1 -H- n2          n5 -H- n6
    //  |V     |V          |V     |V
    //  n8     n3 -H- n4   n7
    //  |V                        |V
    //  n9 -------- H ---------- n10
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 100), createNode('n4', 200, 100),
      createNode('n5', 200, 0), createNode('n6', 300, 0),
      createNode('n7', 300, 100), createNode('n8', 0, 100),
      createNode('n9', 0, 200), createNode('n10', 300, 200),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),
      createEdge('e3', 'n3', 'n4', { direction: 'horizontal' }),
      createEdge('e4', 'n4', 'n5', { direction: 'vertical' }),
      createEdge('e5', 'n5', 'n6', { direction: 'horizontal' }),
      createEdge('e6', 'n6', 'n7', { direction: 'vertical' }),
      createEdge('e7', 'n1', 'n8', { direction: 'vertical' }),
      createEdge('e8', 'n8', 'n9', { direction: 'vertical' }),
      createEdge('e9', 'n7', 'n10', { direction: 'vertical' }),
      createEdge('e10', 'n9', 'n10', { direction: 'horizontal' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 10, 10);
    expect(result.blocked).to.be.false;
    // The constraint should propagate through the entire U-shape
  });

  it('should handle a single isolated node with no edges', () => {
    const nodes = [createNode('lonely', 50, 50)];
    const graph = buildNodeGraph(nodes, []);
    const result = solveNodeMove(graph, 'lonely', 100, 100);
    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(1);
    expect(result.updates[0].x).to.equal(100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. edge-case numerics
// ─────────────────────────────────────────────────────────────────────────────

describe('numeric edge cases', () => {
  it('should handle negative coordinates', () => {
    const nodes = [createNode('n1', -100, -100), createNode('n2', -50, -50)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', -200, -200);
    expect(result.blocked).to.be.false;
    const origLen = distance({ x: -100, y: -100 }, { x: -50, y: -50 });
    expect(edgeLengthAfter(result.updates, edges[0], nodes)).to.be.closeTo(origLen, 0.5);
  });

  it('should handle very large coordinates', () => {
    const nodes = [createNode('n1', 1e6, 1e6), createNode('n2', 1e6 + 100, 1e6)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 1e6, 1e6 + 50);
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    expect(n2.y).to.equal(1e6 + 50);
  });

  it('should handle fractional coordinates', () => {
    const nodes = [createNode('n1', 0.5, 0.5), createNode('n2', 100.5, 0.5)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150.5, 0.5);
    expect(edgeLengthAfter(result.updates, edges[0], nodes)).to.be.closeTo(100, 0.5);
  });

  it('should handle overlapping nodes (zero-length edge)', () => {
    const nodes = [createNode('n1', 100, 100), createNode('n2', 100, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 50, 100);
    // Should not crash on zero-length edge with direction constraint
    expect(result.blocked).to.be.false;
  });

  it('should handle edge at exactly 45 degrees with length lock', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 0, 50);
    const origLen = Math.SQRT2 * 100;
    expect(edgeLengthAfter(result.updates, edges[0], nodes)).to.be.closeTo(origLen, 0.5);
  });

  it('should handle length_locked with direction=horizontal for horizontal edge', () => {
    // Edge is already horizontal + length locked: moving end up should keep horizontal + same length
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal', length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 100, 50);

    const n1 = resolvedPos(result.updates, 'n1', nodes);
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    // Horizontal: same Y
    expect(n1.y).to.be.closeTo(n2.y, 0.01);
    // Length 100
    expect(distance(n1, n2)).to.be.closeTo(100, 0.01);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. blockedBy reporting
// ─────────────────────────────────────────────────────────────────────────────

describe('blockedBy reason reporting', () => {
  it('blockedBy should contain the edge IDs that caused blocking', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('my-locked-wall', 'n1', 'n2', { length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'my-locked-wall', 500);
    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.deep.equal(['my-locked-wall']);
  });

  it('free edge length change is never blocked', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('free-edge', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'free-edge', 500);
    expect(result.blocked).to.be.false;
    expect(result.blockedBy).to.be.undefined;
  });

  it('node move propagates constraints without blocking when satisfiable', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true, direction: 'horizontal' })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 500, 500);
    // n2 should propagate to (600, 500) — horizontal + length 100 is satisfiable
    expect(result.blocked).to.be.false;
  });

  it('node move is blocked when constraints cannot be satisfied', () => {
    // n1 —[horizontal, length_locked=100]— n2 —[horizontal, length_locked=100]— n3 (pinned)
    // Moving n1 vertically while n3 is pinned at y=0 means the horizontal
    // constraints between n1(y=200) and the chain to n3(y=0) can't all hold.
    const nodes = [
      createNode('n1', 0, 0),
      createNode('n2', 100, 0),
      { ...createNode('n3', 200, 0), pinned: true },
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { length_locked: true, direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3', { length_locked: true, direction: 'horizontal' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    // Move n1 far off the horizontal line — solver can't keep both edges horizontal
    const result = solveNodeMove(graph, 'n1', 0, 200);
    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.be.an('array').that.is.not.empty;
  });

  it('constraint snap is never blocked', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'horizontal');
    expect(result.blocked).to.be.false;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. validateConstraints
// ─────────────────────────────────────────────────────────────────────────────

describe('validateConstraints', () => {
  it('should return empty for edges with no constraints', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    expect(validateConstraints(nodes, edges)).to.have.length(0);
  });

  it('should return empty when horizontal constraint is satisfied', () => {
    const nodes = [createNode('n1', 0, 50), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    expect(validateConstraints(nodes, edges)).to.have.length(0);
  });

  it('should return empty when vertical constraint is satisfied', () => {
    const nodes = [createNode('n1', 50, 0), createNode('n2', 50, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'vertical' })];
    expect(validateConstraints(nodes, edges)).to.have.length(0);
  });

  it('should detect horizontal violation', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    const v = validateConstraints(nodes, edges);
    expect(v).to.have.length(1);
    expect(v[0].edgeId).to.equal('e1');
    expect(v[0].type).to.equal('direction');
    expect(v[0].actual).to.be.closeTo(50, 0.01);
  });

  it('should detect vertical violation', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 30, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'vertical' })];
    const v = validateConstraints(nodes, edges);
    expect(v).to.have.length(1);
    expect(v[0].type).to.equal('direction');
    expect(v[0].actual).to.be.closeTo(30, 0.01);
  });

  it('should detect multiple violations', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 50),
      createNode('n3', 70, 200),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),
    ];
    const v = validateConstraints(nodes, edges);
    expect(v).to.have.length(2);
  });

  it('should respect tolerance', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0.15)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    // Default tolerance 0.2 — 0.15 is within tolerance
    expect(validateConstraints(nodes, edges)).to.have.length(0);
    // Tighter tolerance
    expect(validateConstraints(nodes, edges, 0.1)).to.have.length(1);
  });

  it('should not flag free edges', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'free' })];
    expect(validateConstraints(nodes, edges)).to.have.length(0);
  });

  it('should handle edges with missing nodes gracefully', () => {
    const nodes = [createNode('n1', 0, 0)];
    const edges = [createEdge('e1', 'n1', 'missing', { direction: 'horizontal' })];
    expect(validateConstraints(nodes, edges)).to.have.length(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. autoFixConstraints
// ─────────────────────────────────────────────────────────────────────────────

describe('autoFixConstraints', () => {
  it('should return empty when no violations exist', () => {
    const nodes = [createNode('n1', 0, 50), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    const result = autoFixConstraints(nodes, edges);
    expect(result.fixedEdgeIds).to.have.length(0);
    expect(result.violations).to.have.length(0);
  });

  it('should remove direction constraint from a violating edge', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    const result = autoFixConstraints(nodes, edges);
    expect(result.fixedEdgeIds).to.include('e1');
    expect(edges[0].direction).to.equal('free');
    // After fix, no violations remain
    expect(validateConstraints(nodes, edges)).to.have.length(0);
  });

  it('should remove vertical direction when violated', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 30, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'vertical' })];
    const result = autoFixConstraints(nodes, edges);
    expect(result.fixedEdgeIds).to.include('e1');
    expect(edges[0].direction).to.equal('free');
  });

  it('should fix multiple violating edges', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 50),
      createNode('n3', 70, 200),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),
    ];
    const result = autoFixConstraints(nodes, edges);
    expect(result.fixedEdgeIds).to.have.length(2);
    expect(edges[0].direction).to.equal('free');
    expect(edges[1].direction).to.equal('free');
    expect(validateConstraints(nodes, edges)).to.have.length(0);
  });

  it('should not touch edges that are already satisfied', () => {
    const nodes = [
      createNode('n1', 0, 50), createNode('n2', 100, 50),
      createNode('n3', 100, 200),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),  // satisfied
      createEdge('e2', 'n2', 'n3', { direction: 'horizontal' }),  // violated (Y differs)
    ];
    const result = autoFixConstraints(nodes, edges);
    expect(result.fixedEdgeIds).to.have.length(1);
    expect(result.fixedEdgeIds[0]).to.equal('e2');
    expect(edges[0].direction).to.equal('horizontal'); // untouched
    expect(edges[1].direction).to.equal('free');       // fixed
  });

  it('should preserve length_locked when direction is the issue', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal', length_locked: true })];
    const result = autoFixConstraints(nodes, edges);
    expect(edges[0].direction).to.equal('free');
    expect(edges[0].length_locked).to.be.true; // preserved
  });

  it('should handle a closed rectangle with all wrong directions', () => {
    // Rectangle where vertical edges are marked horizontal and vice versa
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 100), createNode('n4', 0, 100),
    ];
    const edges = [
      createEdge('top', 'n1', 'n2', { direction: 'vertical' }),       // wrong!
      createEdge('right', 'n2', 'n3', { direction: 'horizontal' }),   // wrong!
      createEdge('bottom', 'n3', 'n4', { direction: 'vertical' }),    // wrong!
      createEdge('left', 'n4', 'n1', { direction: 'horizontal' }),    // wrong!
    ];
    const result = autoFixConstraints(nodes, edges);
    expect(result.fixedEdgeIds).to.have.length(4);
    // All should be freed
    for (const edge of edges) {
      expect(edge.direction).to.equal('free');
    }
    expect(validateConstraints(nodes, edges)).to.have.length(0);
  });

  it('should handle edges with no constraints (no-op)', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 100)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const result = autoFixConstraints(nodes, edges);
    expect(result.fixedEdgeIds).to.have.length(0);
  });

  it('should return original violations even after fixing', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    const result = autoFixConstraints(nodes, edges);
    expect(result.violations).to.have.length(1);
    expect(result.violations[0].edgeId).to.equal('e1');
  });

  it('should fix the worst violation first', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 5),  // small violation
      createNode('n3', 100, 200),                          // big violation (from n2)
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),  // 5px off
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),    // 0px off (already vertical)
    ];
    // Only e1 should be violated
    const result = autoFixConstraints(nodes, edges);
    expect(result.fixedEdgeIds).to.include('e1');
    expect(edges[0].direction).to.equal('free');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 15. solveNodeMove – strict constraint enforcement
// ─────────────────────────────────────────────────────────────────────────────

describe('solveNodeMove – length lock enforcement after solve', () => {
  it('length-locked edges must preserve length in a closed rectangle', () => {
    // Closed rectangle with all edges length-locked
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 80), createNode('n4', 0, 80),
    ];
    const edges = [
      createEdge('top', 'n1', 'n2', { direction: 'horizontal', length_locked: true }),
      createEdge('right', 'n2', 'n3', { direction: 'vertical', length_locked: true }),
      createEdge('bottom', 'n3', 'n4', { direction: 'horizontal', length_locked: true }),
      createEdge('left', 'n4', 'n1', { direction: 'vertical', length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 20, 20);

    // Every length-locked edge must preserve its original length
    for (const edge of edges) {
      const len = edgeLengthAfter(result.updates, edge, nodes);
      const origLen = distance(
        nodes.find(n => n.id === edge.start_node)!,
        nodes.find(n => n.id === edge.end_node)!
      );
      expect(len).to.be.closeTo(origLen, 1.0, `Edge ${edge.id} length violated`);
    }
  });

  it('length-locked edges must preserve length in a T-junction', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 200, 0), createNode('n4', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { length_locked: true }),
      createEdge('e2', 'n2', 'n3', { length_locked: true }),
      createEdge('e3', 'n2', 'n4', { length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 120, 30);

    for (const edge of edges) {
      const len = edgeLengthAfter(result.updates, edge, nodes);
      const origLen = distance(
        nodes.find(n => n.id === edge.start_node)!,
        nodes.find(n => n.id === edge.end_node)!
      );
      expect(len).to.be.closeTo(origLen, 1.0, `Edge ${edge.id} length violated`);
    }
  });

  it('length-locked chain: all lengths preserved when end node dragged far', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 200, 0), createNode('n4', 300, 0),
      createNode('n5', 400, 0),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { length_locked: true }),
      createEdge('e2', 'n2', 'n3', { length_locked: true }),
      createEdge('e3', 'n3', 'n4', { length_locked: true }),
      createEdge('e4', 'n4', 'n5', { length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n5', 500, 200);

    for (const edge of edges) {
      const len = edgeLengthAfter(result.updates, edge, nodes);
      expect(len).to.be.closeTo(100, 1.0, `Edge ${edge.id} length violated`);
    }
  });

  it('mixed locked/unlocked: only locked edges preserve length', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 200, 0),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { length_locked: true }),
      createEdge('e2', 'n2', 'n3'), // free
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 50, 50);

    // e1 (locked) must preserve length
    expect(edgeLengthAfter(result.updates, edges[0], nodes)).to.be.closeTo(100, 1.0);
    // e2 (free) can change — just verify n3 didn't move
    expect(findUpdate(result.updates, 'n3')).to.be.undefined;
  });

  it('length-locked with pinned node: respects both pin and lock (reachable)', () => {
    // n3 dragged to (150, 50) — distance from n1(0,0) is ~158, within 200 total
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: true },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 200, y: 0, pinned: false },
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { length_locked: true }),
      createEdge('e2', 'n2', 'n3', { length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n3', 150, 50);

    // n1 is pinned — should not move
    expect(findUpdate(result.updates, 'n1')).to.be.undefined;

    // Both edges should preserve length
    expect(edgeLengthAfter(result.updates, edges[0], nodes)).to.be.closeTo(100, 1.0);
    expect(edgeLengthAfter(result.updates, edges[1], nodes)).to.be.closeTo(100, 1.0);
  });

  it('length-locked with pinned node: overconstrained (unreachable) degrades gracefully', () => {
    // n3 dragged to (300, 100) — distance 316 > 200 total locked length
    // This is overconstrained: we cannot satisfy both locks. The solver should
    // do its best without crashing, and autoFixConstraints handles the rest.
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: true },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 200, y: 0, pinned: false },
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { length_locked: true }),
      createEdge('e2', 'n2', 'n3', { length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n3', 300, 100);
    // Should not crash — but the move is blocked because pinned n1 prevents
    // the chain from satisfying both length locks at the requested position
    expect(result.blocked).to.be.true;
  });

  it('star topology: all length-locked spokes preserve length', () => {
    const nodes = [
      createNode('c', 0, 0),
      createNode('a', 100, 0), createNode('b', 0, 100),
      createNode('d', -100, 0), createNode('e', 0, -100),
    ];
    const edges = [
      createEdge('ca', 'c', 'a', { length_locked: true }),
      createEdge('cb', 'c', 'b', { length_locked: true }),
      createEdge('cd', 'c', 'd', { length_locked: true }),
      createEdge('ce', 'c', 'e', { length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'c', 50, 50);

    for (const edge of edges) {
      const len = edgeLengthAfter(result.updates, edge, nodes);
      expect(len).to.be.closeTo(100, 1.0, `Edge ${edge.id} length violated`);
    }
  });

  it('horizontal + length_locked in a loop: both constraints hold', () => {
    // Square with horizontal top/bottom and vertical left/right, all length locked
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 200, 0),
      createNode('n3', 200, 150), createNode('n4', 0, 150),
    ];
    const edges = [
      createEdge('top', 'n1', 'n2', { direction: 'horizontal', length_locked: true }),
      createEdge('right', 'n2', 'n3', { direction: 'vertical', length_locked: true }),
      createEdge('bottom', 'n3', 'n4', { direction: 'horizontal', length_locked: true }),
      createEdge('left', 'n4', 'n1', { direction: 'vertical', length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 10, 10);

    for (const edge of edges) {
      const origLen = distance(
        nodes.find(n => n.id === edge.start_node)!,
        nodes.find(n => n.id === edge.end_node)!
      );
      expect(edgeLengthAfter(result.updates, edge, nodes)).to.be.closeTo(origLen, 1.0, `Edge ${edge.id} length violated`);

      // Direction check
      const sPos = resolvedPos(result.updates, edge.start_node, nodes);
      const ePos = resolvedPos(result.updates, edge.end_node, nodes);
      if (edge.direction === 'horizontal') {
        expect(Math.abs(sPos.y - ePos.y)).to.be.lessThan(1.0, `Edge ${edge.id} horizontal violated`);
      } else if (edge.direction === 'vertical') {
        expect(Math.abs(sPos.x - ePos.x)).to.be.lessThan(1.0, `Edge ${edge.id} vertical violated`);
      }
    }
  });

  it('two rooms sharing a wall: locked lengths preserved', () => {
    //  n1 -- n2 -- n5
    //  |     |     |
    //  n4 -- n3 -- n6
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n5', 200, 0),
      createNode('n4', 0, 100), createNode('n3', 100, 100), createNode('n6', 200, 100),
    ];
    const edges = [
      createEdge('top1', 'n1', 'n2', { length_locked: true }),
      createEdge('top2', 'n2', 'n5', { length_locked: true }),
      createEdge('shared', 'n2', 'n3', { direction: 'vertical', length_locked: true }),
      createEdge('bot1', 'n4', 'n3', { length_locked: true }),
      createEdge('bot2', 'n3', 'n6', { length_locked: true }),
      createEdge('left', 'n1', 'n4', { length_locked: true }),
      createEdge('right', 'n5', 'n6', { length_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 120, 10);

    for (const edge of edges) {
      if (!edge.length_locked) continue;
      const origLen = distance(
        nodes.find(n => n.id === edge.start_node)!,
        nodes.find(n => n.id === edge.end_node)!
      );
      expect(edgeLengthAfter(result.updates, edge, nodes)).to.be.closeTo(origLen, 1.0, `Edge ${edge.id} length violated`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 17. findDegenerateEdges
// ─────────────────────────────────────────────────────────────────────────────

describe('findDegenerateEdges', () => {
  it('should return empty for normal-length edges', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    expect(findDegenerateEdges(nodes, edges)).to.deep.equal([]);
  });

  it('should detect an edge whose endpoints are identical', () => {
    const nodes = [createNode('n1', 50, 50), createNode('n2', 50, 50)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    expect(findDegenerateEdges(nodes, edges)).to.deep.equal(['e1']);
  });

  it('should detect an edge with length below the default threshold', () => {
    const nodes = [createNode('n1', 10, 10), createNode('n2', 10.2, 10.3)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    // distance = sqrt(0.04 + 0.09) ≈ 0.36, below 0.5 threshold → degenerate
    expect(findDegenerateEdges(nodes, edges)).to.deep.equal(['e1']);
  });

  it('should not flag an edge just above the threshold', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 1, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    expect(findDegenerateEdges(nodes, edges)).to.deep.equal([]);
  });

  it('should detect multiple degenerate edges', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 0, 0),
      createNode('n3', 100, 0), createNode('n4', 100, 0),
      createNode('n5', 200, 0), createNode('n6', 300, 0),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n3', 'n4'),
      createEdge('e3', 'n5', 'n6'),
    ];
    const result = findDegenerateEdges(nodes, edges);
    expect(result).to.include('e1');
    expect(result).to.include('e2');
    expect(result).to.not.include('e3');
  });

  it('should respect a custom threshold', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 3, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    // 3cm is above default threshold but below custom 5cm threshold
    expect(findDegenerateEdges(nodes, edges, 5)).to.deep.equal(['e1']);
    expect(findDegenerateEdges(nodes, edges, 2)).to.deep.equal([]);
  });

  it('should skip edges with missing nodes', () => {
    const nodes = [createNode('n1', 0, 0)];
    const edges = [createEdge('e1', 'n1', 'n_missing')];
    // Missing node — edge should be skipped, not crash
    expect(findDegenerateEdges(nodes, edges)).to.deep.equal([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// solveCollinearTotalLength
// ─────────────────────────────────────────────────────────────────────────────

describe('solveCollinearTotalLength', () => {
  it('should scale 3-edge horizontal chain proportionally', () => {
    // n1(0,0)--e1--n2(100,0)--e2--n3(200,0)--e3--n4(300,0)
    // Total = 300, scale to 600
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 200, y: 0, pinned: false },
      { id: 'n4', x: 300, y: 0, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3'),
      createEdge('e3', 'n3', 'n4'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveCollinearTotalLength(graph, ['e1', 'e2', 'e3'], 600);

    expect(result.blocked).to.be.false;

    // n1 stays at 0, n4 moves to 600
    const n2 = findUpdate(result.updates, 'n2');
    const n3 = findUpdate(result.updates, 'n3');
    const n4 = findUpdate(result.updates, 'n4');

    expect(n4).to.exist;
    expect(n4!.x).to.be.closeTo(600, 1);
    expect(n4!.y).to.be.closeTo(0, 1);

    // Proportional: n2 was at 1/3, n3 was at 2/3
    expect(n2).to.exist;
    expect(n2!.x).to.be.closeTo(200, 1);
    expect(n3).to.exist;
    expect(n3!.x).to.be.closeTo(400, 1);
  });

  it('should block when a length-locked edge is included', () => {
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 200, y: 0, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2', { length_locked: true }),
      createEdge('e2', 'n2', 'n3'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveCollinearTotalLength(graph, ['e1', 'e2'], 300);

    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.include('e1');
  });

  it('should handle scaling down', () => {
    // n1(0,0)--e1--n2(200,0)--e2--n3(400,0)
    // Total = 400, scale to 200
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 200, y: 0, pinned: false },
      { id: 'n3', x: 400, y: 0, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveCollinearTotalLength(graph, ['e1', 'e2'], 200);

    expect(result.blocked).to.be.false;
    const n2 = findUpdate(result.updates, 'n2');
    const n3 = findUpdate(result.updates, 'n3');
    expect(n2).to.exist;
    expect(n2!.x).to.be.closeTo(100, 1);
    expect(n3).to.exist;
    expect(n3!.x).to.be.closeTo(200, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Collinear constraint in solveNodeMove
// ─────────────────────────────────────────────────────────────────────────────

describe('collinear constraint enforcement', () => {
  it('should project node back onto line when dragged perpendicular', () => {
    // Two horizontal edges sharing a collinear group
    // n1(0,0)--e1--n2(100,0)--e2--n3(200,0)
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 200, y: 0, pinned: false },
    ];
    const edges: Edge[] = [
      { ...createEdge('e1', 'n1', 'n2'), collinear_group: 'cg1' },
      { ...createEdge('e2', 'n2', 'n3'), collinear_group: 'cg1' },
    ];
    const graph = buildNodeGraph(nodes, edges);

    // Drag n2 perpendicular (to y=50) — should be projected back onto the line
    const result = solveNodeMove(graph, 'n2', 100, 50);

    // The perpendicular component is removed — projected back to (100,0),
    // which is the original position, so no update is emitted (no-op move).
    const n2 = findUpdate(result.updates, 'n2');
    expect(n2).to.be.undefined; // projected back to original = no movement

    // Drag diagonally — should only keep the along-line component
    const result2 = solveNodeMove(graph, 'n2', 150, 50);
    const n2b = findUpdate(result2.updates, 'n2');
    expect(n2b).to.exist;
    expect(n2b!.x).to.be.closeTo(150, 1);
    expect(n2b!.y).to.be.closeTo(0, 1); // perpendicular removed
  });

  it('should allow drag along the collinear line', () => {
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 200, y: 0, pinned: false },
    ];
    const edges: Edge[] = [
      { ...createEdge('e1', 'n1', 'n2'), collinear_group: 'cg1' },
      { ...createEdge('e2', 'n2', 'n3'), collinear_group: 'cg1' },
    ];
    const graph = buildNodeGraph(nodes, edges);

    // Drag n2 along the line (to x=150)
    const result = solveNodeMove(graph, 'n2', 150, 0);
    expect(result.blocked).to.be.false;
    const n2 = findUpdate(result.updates, 'n2');
    expect(n2).to.exist;
    expect(n2!.x).to.equal(150);
    expect(n2!.y).to.equal(0);
  });

  it('should detect collinear violations in validateConstraints', () => {
    // Nodes that are NOT collinear but have collinear_group set
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 50, pinned: false }, // off-line
      { id: 'n3', x: 200, y: 0, pinned: false },
    ];
    const edges: Edge[] = [
      { ...createEdge('e1', 'n1', 'n2'), collinear_group: 'cg1' },
      { ...createEdge('e2', 'n2', 'n3'), collinear_group: 'cg1' },
    ];
    const violations = validateConstraints(nodes, edges, 0.5);
    const collinearViolation = violations.find(v => v.type === 'collinear');
    expect(collinearViolation).to.exist;
    expect(collinearViolation!.actual).to.be.greaterThan(0.5);
  });

  it('should auto-fix collinear violations by clearing collinear_group', () => {
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 50, pinned: false }, // off-line
      { id: 'n3', x: 200, y: 0, pinned: false },
    ];
    const edges: Edge[] = [
      { ...createEdge('e1', 'n1', 'n2'), collinear_group: 'cg1' },
      { ...createEdge('e2', 'n2', 'n3'), collinear_group: 'cg1' },
    ];
    const result = autoFixConstraints(nodes, edges, 0.5);
    expect(result.fixedEdgeIds.length).to.be.greaterThan(0);
    // The violating edge should have collinear_group cleared
    const fixedEdge = edges.find(e => result.fixedEdgeIds.includes(e.id));
    expect(fixedEdge).to.exist;
    expect(fixedEdge!.collinear_group).to.be.undefined;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Iterative convergence (no post-solve fighting)
// ─────────────────────────────────────────────────────────────────────────────

describe('iterative convergence without post-solve fighting', () => {
  it('length lock and collinear constraint on shared node converge without fighting', () => {
    // n1(0,0)--e1[collinear,length_locked]--n2(100,0)--e2[collinear]--n3(200,0)
    // Drag n2 along the line — length lock and collinear must both hold.
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 200, y: 0, pinned: false },
    ];
    const edges: Edge[] = [
      { ...createEdge('e1', 'n1', 'n2', { length_locked: true }), collinear_group: 'cg1' },
      { ...createEdge('e2', 'n2', 'n3'), collinear_group: 'cg1' },
    ];
    const graph = buildNodeGraph(nodes, edges);

    // Drag n2 diagonally — collinear projects back onto line, length lock must hold
    const result = solveNodeMove(graph, 'n2', 150, 50);
    expect(result.blocked).to.be.false;

    // e1 length must be preserved
    expect(edgeLengthAfter(result.updates, edges[0], nodes)).to.be.closeTo(100, 0.5);

    // All nodes must remain on the collinear line (y ≈ 0)
    const n1 = resolvedPos(result.updates, 'n1', nodes);
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    const n3 = resolvedPos(result.updates, 'n3', nodes);
    expect(n1.y).to.be.closeTo(0, 0.5);
    expect(n2.y).to.be.closeTo(0, 0.5);
    expect(n3.y).to.be.closeTo(0, 0.5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Pre-existing violation worsening detection
// ─────────────────────────────────────────────────────────────────────────────

describe('pre-existing violation worsening', () => {
  it('pre-existing violation worsened by move → blocked', () => {
    // n1 at (0,0), n2 at (100,5): horizontal constraint already violated by 5.
    // n3 at (200,5): free edge.
    // Moving n2 to (100,50) worsens the horizontal violation from 5 to 50 → should block.
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: true },
      { id: 'n2', x: 100, y: 5, pinned: false },
      { id: 'n3', x: 200, y: 5, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n2', 'n3'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 100, 50);
    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.include('e1');
  });

  it('pre-existing violation improved by move → not blocked', () => {
    // n1 at (0,0), n2 at (100,5): horizontal constraint violated by 5.
    // Moving n2 to (100,2) improves it from 5 to 2 → should NOT block.
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: true },
      { id: 'n2', x: 100, y: 5, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 100, 2);
    expect(result.blocked).to.be.false;
  });

  it('pre-existing violation unchanged → not blocked', () => {
    // n1 at (0,0), n2 at (100,5): horizontal constraint violated by 5.
    // Moving n2 to (150,5) keeps the violation at 5 → should NOT block.
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: true },
      { id: 'n2', x: 100, y: 5, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150, 5);
    expect(result.blocked).to.be.false;
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Angle groups with 3+ edges
// ─────────────────────────────────────────────────────────────────────────────

describe('angle groups with 3+ edges', () => {
  it('3-edge T-junction preserves all relative angles', () => {
    // T-junction at n2: n1--n2--n3 (horizontal), n2--n4 (vertical)
    // All 3 edges in the same angle group — should preserve 90° angles.
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 200, y: 0, pinned: false },
      { id: 'n4', x: 100, y: 100, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2', { angle_group: 'ag3' }),
      createEdge('e2', 'n2', 'n3', { angle_group: 'ag3' }),
      createEdge('e3', 'n2', 'n4', { angle_group: 'ag3' }),
    ];
    const graph = buildNodeGraph(nodes, edges);

    // Move shared node n2
    const result = solveNodeMove(graph, 'n2', 120, 30);
    expect(result.blocked).to.be.false;

    const n1 = resolvedPos(result.updates, 'n1', nodes);
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    const n3 = resolvedPos(result.updates, 'n3', nodes);
    const n4 = resolvedPos(result.updates, 'n4', nodes);

    // Compute angles from shared node n2
    const a1 = Math.atan2(n1.y - n2.y, n1.x - n2.x);
    const a3 = Math.atan2(n3.y - n2.y, n3.x - n2.x);
    const a4 = Math.atan2(n4.y - n2.y, n4.x - n2.x);

    // Original angles: e1→n1 = π, e2→n3 = 0, e3→n4 = π/2
    // Relative angles: n1-to-n3 = π (180°), n1-to-n4 = -π/2 (-90°)
    let diff13 = a3 - a1;
    while (diff13 > Math.PI) diff13 -= 2 * Math.PI;
    while (diff13 < -Math.PI) diff13 += 2 * Math.PI;
    expect(Math.abs(diff13)).to.be.closeTo(Math.PI, 0.15); // ~180°

    let diff14 = a4 - a1;
    while (diff14 > Math.PI) diff14 -= 2 * Math.PI;
    while (diff14 < -Math.PI) diff14 += 2 * Math.PI;
    expect(Math.abs(diff14)).to.be.closeTo(Math.PI / 2, 0.15); // ~90°
  });

  it('4-edge cross preserves 90° angles', () => {
    // Cross at center: 4 edges going N/E/S/W
    const nodes: Node[] = [
      { id: 'c', x: 100, y: 100, pinned: false },
      { id: 'n', x: 100, y: 0, pinned: false },
      { id: 'e', x: 200, y: 100, pinned: false },
      { id: 's', x: 100, y: 200, pinned: false },
      { id: 'w', x: 0, y: 100, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('cn', 'c', 'n', { angle_group: 'cross' }),
      createEdge('ce', 'c', 'e', { angle_group: 'cross' }),
      createEdge('cs', 'c', 's', { angle_group: 'cross' }),
      createEdge('cw', 'c', 'w', { angle_group: 'cross' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'c', 120, 110);
    expect(result.blocked).to.be.false;

    const c = resolvedPos(result.updates, 'c', nodes);
    const n = resolvedPos(result.updates, 'n', nodes);
    const e_pos = resolvedPos(result.updates, 'e', nodes);
    const s = resolvedPos(result.updates, 's', nodes);
    const w = resolvedPos(result.updates, 'w', nodes);

    // All 4 angles from center should remain 90° apart
    const aN = Math.atan2(n.y - c.y, n.x - c.x);
    const aE = Math.atan2(e_pos.y - c.y, e_pos.x - c.x);
    const aS = Math.atan2(s.y - c.y, s.x - c.x);
    const aW = Math.atan2(w.y - c.y, w.x - c.x);

    function angleDiff(a: number, b: number) {
      let d = a - b;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      return d;
    }

    // N→E should be ~90° (π/2)
    expect(Math.abs(angleDiff(aE, aN))).to.be.closeTo(Math.PI / 2, 0.15);
    // E→S should be ~90°
    expect(Math.abs(angleDiff(aS, aE))).to.be.closeTo(Math.PI / 2, 0.15);
    // S→W should be ~90°
    expect(Math.abs(angleDiff(aW, aS))).to.be.closeTo(Math.PI / 2, 0.15);
  });

  it('3-edge group with one pinned outer node', () => {
    // T-junction at n2, with n1 pinned — angles should be driven by n1's fixed angle
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: true },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 200, y: 0, pinned: false },
      { id: 'n4', x: 100, y: 100, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2', { angle_group: 'ag3' }),
      createEdge('e2', 'n2', 'n3', { angle_group: 'ag3' }),
      createEdge('e3', 'n2', 'n4', { angle_group: 'ag3' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 100, 30);
    expect(result.blocked).to.be.false;

    // n1 must not move (pinned)
    expect(findUpdate(result.updates, 'n1')).to.be.undefined;
  });

  it('existing 2-edge angle group still works (regression)', () => {
    // Same test as existing "should preserve 90° angle between two edges"
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 100, y: 100, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2', { angle_group: 'ag1' }),
      createEdge('e2', 'n2', 'n3', { angle_group: 'ag1' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 100, 50);

    const n1 = resolvedPos(result.updates, 'n1', nodes);
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    const n3 = resolvedPos(result.updates, 'n3', nodes);

    const angleE1 = Math.atan2(n1.y - n2.y, n1.x - n2.x);
    const angleE2 = Math.atan2(n3.y - n2.y, n3.x - n2.x);
    let angleBetween = ((angleE2 - angleE1) + 2 * Math.PI) % (2 * Math.PI);
    expect(angleBetween).to.be.closeTo(3 * Math.PI / 2, 0.1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Link group solver enforcement
// ─────────────────────────────────────────────────────────────────────────────

describe('link group solver enforcement', () => {
  it('linked edges synchronize lengths during node drag', () => {
    // Two parallel edges linked: both should maintain same length.
    // e1: n1(0,0)→n2(100,0) and e2: n3(0,100)→n4(100,100), both 100cm.
    // Drag n2 to (150,0) → solver should also extend e2 to match.
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 0, y: 100, pinned: false },
      { id: 'n4', x: 100, y: 100, pinned: false },
      // Connect them with a vertical edge so solver can reach e2
      { id: 'n5', x: 100, y: 50, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2', { link_group: 'lg1' }),
      createEdge('e2', 'n3', 'n4', { link_group: 'lg1' }),
      // Connect n2 to n4 through n5 for propagation
      createEdge('v1', 'n2', 'n5'),
      createEdge('v2', 'n5', 'n4'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150, 0);

    // Both linked edges should have the same length
    const len1 = edgeLengthAfter(result.updates, edges[0], nodes);
    const len2 = edgeLengthAfter(result.updates, edges[1], nodes);
    expect(Math.abs(len1 - len2)).to.be.lessThan(2.0);
  });

  it('link group violation detected by computeViolations', () => {
    // Two edges with link_group where lengths differ
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 0, y: 100, pinned: false },
      { id: 'n4', x: 200, y: 100, pinned: false }, // length 200 vs 100
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2', { link_group: 'lg1' }),
      createEdge('e2', 'n3', 'n4', { link_group: 'lg1' }),
    ];
    // Validate: avg length = 150, max deviation = 50 > 0.2 tolerance
    const v = validateConstraints(nodes, edges);
    const linkViolation = v.find(vv => vv.type === 'link_group');
    expect(linkViolation).to.exist;
    expect(linkViolation!.actual).to.be.greaterThan(0.2);
  });

  it('link group does not interfere with direction constraints', () => {
    // Two horizontal linked edges — dragging should keep both horizontal AND same length
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 0, pinned: false },
      { id: 'n3', x: 0, y: 100, pinned: false },
      { id: 'n4', x: 100, y: 100, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal', link_group: 'lg1' }),
      createEdge('e2', 'n3', 'n4', { direction: 'horizontal', link_group: 'lg1' }),
      // Connect for propagation
      createEdge('v1', 'n2', 'n4'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 0, 20);

    // e1 should stay horizontal
    const n1 = resolvedPos(result.updates, 'n1', nodes);
    const n2 = resolvedPos(result.updates, 'n2', nodes);
    expect(Math.abs(n1.y - n2.y)).to.be.lessThan(0.5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateConstraints reports violations without mutating edges
// ─────────────────────────────────────────────────────────────────────────────

describe('validateConstraints immutability', () => {
  it('reports violations without mutating edges', () => {
    // Create edges with constraints that are violated
    const nodes: Node[] = [
      { id: 'n1', x: 0, y: 0, pinned: false },
      { id: 'n2', x: 100, y: 10, pinned: false }, // violates horizontal
      { id: 'n3', x: 200, y: 10, pinned: false },
    ];
    const edges: Edge[] = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      { ...createEdge('e2', 'n2', 'n3'), collinear_group: 'cg1' },
    ];

    // Deep-clone edges to compare after
    const edgesBefore = JSON.parse(JSON.stringify(edges));

    const violations = validateConstraints(nodes, edges);
    expect(violations.length).to.be.greaterThan(0);

    // Edges must not be mutated
    expect(JSON.stringify(edges)).to.equal(JSON.stringify(edgesBefore));
  });
});
