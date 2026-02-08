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
  opts?: { direction?: WallDirection; length_locked?: boolean; angle_locked?: boolean; type?: EdgeType }
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
    angle_locked: opts?.angle_locked ?? false,
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

  it('length_locked: moving node onto other node (zero distance) does not crash', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    // Move n2 exactly on top of n1
    const result = solveNodeMove(graph, 'n2', 0, 0);
    expect(result.blocked).to.be.false;
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
// 5. solveNodeMove – angle lock
// ─────────────────────────────────────────────────────────────────────────────

describe('solveNodeMove – angle lock', () => {
  it('should preserve angle and length for a single angle-locked edge', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { angle_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 50, 0);

    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;

    const origLen = Math.sqrt(100 * 100 + 100 * 100);
    expect(distance(n1, n2)).to.be.closeTo(origLen, 0.01);

    const origAngle = Math.atan2(100, 100);
    const newAngle = Math.atan2(n2.y - n1.y, n2.x - n1.x);
    expect(newAngle).to.be.closeTo(origAngle, 0.01);
  });

  it('should make two angle-locked edges at a corner rotate rigidly', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { angle_locked: true }),
      createEdge('e2', 'n2', 'n3', { angle_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 100, 50);

    const n1 = findUpdate(result.updates, 'n1')!;
    const n3 = findUpdate(result.updates, 'n3')!;

    expect(n1.x).to.be.closeTo(0, 0.01);
    expect(n1.y).to.be.closeTo(50, 0.01);
    expect(n3.x).to.be.closeTo(100, 0.01);
    expect(n3.y).to.be.closeTo(150, 0.01);
  });

  it('should propagate angle-locked movement to connected free edges', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 0, -100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { angle_locked: true }),
      createEdge('e2', 'n3', 'n1'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 100, 50);

    const n1 = findUpdate(result.updates, 'n1')!;
    expect(n1.x).to.be.closeTo(0, 0.01);
    expect(n1.y).to.be.closeTo(50, 0.01);
    // n3 doesn't move (free)
    expect(findUpdate(result.updates, 'n3')).to.be.undefined;
  });

  it('should let direction constraint take precedence over angle_locked', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { angle_locked: true, direction: 'horizontal' })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150, 50);

    const n1 = findUpdate(result.updates, 'n1')!;
    const n2 = findUpdate(result.updates, 'n2')!;
    // Direction wins: horizontal
    expect(n1.y).to.equal(n2.y);
    expect(n1.x).to.equal(0);
  });

  it('should handle angle-locked edges in a closed rectangle', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 200, 0),
      createNode('n3', 200, 200), createNode('n4', 0, 200),
    ];
    const edges = [
      createEdge('top', 'n1', 'n2', { angle_locked: true }),
      createEdge('right', 'n2', 'n3', { angle_locked: true }),
      createEdge('bottom', 'n3', 'n4', { angle_locked: true }),
      createEdge('left', 'n4', 'n1', { angle_locked: true }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 250, 0);
    expect(result.blocked).to.be.false;

    const n1 = findUpdate(result.updates, 'n1')!;
    const n3 = findUpdate(result.updates, 'n3')!;
    expect(n1.x).to.be.closeTo(50, 0.01);
    expect(n3.x).to.be.closeTo(250, 0.01);
    expect(n3.y).to.be.closeTo(200, 0.01);
  });

  it('angle_locked with a 45-degree edge: translation preserves geometry', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { angle_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 50, 50);

    const n2 = findUpdate(result.updates, 'n2')!;
    // Should translate: n2 = (150, 150)
    expect(n2.x).to.be.closeTo(150, 0.01);
    expect(n2.y).to.be.closeTo(150, 0.01);
  });

  it('angle_locked: moving end node should reposition start node', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 0, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { angle_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 50, 100);

    const n1 = findUpdate(result.updates, 'n1')!;
    // Original angle from n2's perspective: atan2(0-100, 0-0) = atan2(-100, 0) = -π/2
    // From n1's perspective: angle n1→n2 = atan2(100, 0) = π/2
    // n1 adjusts: n2(50,100) + cos(-π/2)*100, sin(-π/2)*100 = (50, 0)
    expect(n1.x).to.be.closeTo(50, 0.01);
    expect(n1.y).to.be.closeTo(0, 0.01);
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
    expect(result.blockedBy).to.equal('e1');
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
    const preview = previewNodeDrag(nodes, edges, 'n2', 150, 0);
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
    const preview = previewNodeDrag(nodes, edges, 'n2', 100, 50);
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
  it('blockedBy should contain the edge ID that caused blocking', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('my-locked-wall', 'n1', 'n2', { length_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'my-locked-wall', 500);
    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.equal('my-locked-wall');
  });

  it('free edge length change is never blocked', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('free-edge', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'free-edge', 500);
    expect(result.blocked).to.be.false;
    expect(result.blockedBy).to.be.undefined;
  });

  it('node move is never blocked (constraints propagate instead)', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true, direction: 'horizontal', angle_locked: true })];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 500, 500);
    expect(result.blocked).to.be.false;
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
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0.3)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];
    // Default tolerance 0.5 — 0.3 is within tolerance
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
    // Should not crash
    expect(result.blocked).to.be.false;
    // n1 pinned — should not move
    expect(findUpdate(result.updates, 'n1')).to.be.undefined;
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
