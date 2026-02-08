import { expect } from '@open-wc/testing';
import {
  buildNodeGraph,
  solveNodeMove,
  solveEdgeLengthChange,
  previewLengthChange,
  previewNodeDrag,
  snapEdgeToConstraint,
  solveConstraintSnap,
} from './wall-solver.js';
import type { Node, Edge, WallDirection, EdgeType } from '../types.js';
import { buildNodeMap } from './node-graph.js';

// Helper to create a node
function createNode(id: string, x: number, y: number): Node {
  return { id, x, y };
}

// Helper to create an edge
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

// Helper to find a node update
function findNodeUpdate(updates: Array<{ nodeId: string; x: number; y: number }>, nodeId: string) {
  return updates.find(u => u.nodeId === nodeId);
}

// Helper to check if two positions are approximately equal
function posEqual(a: { x: number; y: number }, b: { x: number; y: number }, tolerance = 0.01): boolean {
  return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
}

describe('buildNodeGraph', () => {
  it('should create a graph from nodes and edges', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100)];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3'),
    ];

    const graph = buildNodeGraph(nodes, edges);

    expect(graph.edges.size).to.equal(2);
    expect(graph.nodes.size).to.equal(3);
  });

  it('should group edges that share a node', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 100, 100), createNode('n4', 200, 0),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3'),
      createEdge('e3', 'n2', 'n4'),
    ];

    const graph = buildNodeGraph(nodes, edges);

    // Node n2 should have 3 edge references
    const n2Edges = graph.nodeToEdges.get('n2');
    expect(n2Edges).to.exist;
    expect(n2Edges!.length).to.equal(3);
  });

  it('should handle isolated edges', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 200, 200), createNode('n4', 300, 200),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n3', 'n4'),
    ];

    const graph = buildNodeGraph(nodes, edges);

    expect(graph.edges.size).to.equal(2);
    // Each node should have exactly 1 edge reference
    expect(graph.nodeToEdges.get('n1')!.length).to.equal(1);
    expect(graph.nodeToEdges.get('n4')!.length).to.equal(1);
  });
});

describe('solveNodeMove', () => {
  it('should move all edges connected to a node', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100)];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3'),
    ];

    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150, 0);

    expect(result.blocked).to.be.false;
    // n2 should be moved
    const n2Update = findNodeUpdate(result.updates, 'n2');
    expect(n2Update).to.exist;
    expect(n2Update!.x).to.equal(150);
    expect(n2Update!.y).to.equal(0);
  });

  it('should respect horizontal direction by adjusting other node', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal' })];

    const graph = buildNodeGraph(nodes, edges);
    // Move n2 diagonally
    const result = solveNodeMove(graph, 'n2', 150, 50);

    expect(result.blocked).to.be.false;

    const n2Update = findNodeUpdate(result.updates, 'n2');
    expect(n2Update!.x).to.equal(150);
    expect(n2Update!.y).to.equal(50);

    // n1 should adjust Y to match (stay horizontal)
    const n1Update = findNodeUpdate(result.updates, 'n1');
    expect(n1Update).to.exist;
    expect(n1Update!.x).to.equal(0);
    expect(n1Update!.y).to.equal(50);
  });

  it('should respect vertical direction by adjusting other node', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 0, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'vertical' })];

    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 50, 150);

    expect(result.blocked).to.be.false;

    const n2Update = findNodeUpdate(result.updates, 'n2');
    expect(n2Update!.x).to.equal(50);
    expect(n2Update!.y).to.equal(150);

    // n1 should adjust X to match (stay vertical)
    const n1Update = findNodeUpdate(result.updates, 'n1');
    expect(n1Update).to.exist;
    expect(n1Update!.x).to.equal(50);
    expect(n1Update!.y).to.equal(0);
  });

  it('should respect length_locked by moving other node', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];

    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150, 0);

    expect(result.blocked).to.be.false;

    const n2Update = findNodeUpdate(result.updates, 'n2');
    expect(n2Update!.x).to.equal(150);
    expect(n2Update!.y).to.equal(0);

    // n1 should move to maintain length 100
    const n1Update = findNodeUpdate(result.updates, 'n1');
    expect(n1Update).to.exist;
    expect(n1Update!.x).to.be.closeTo(50, 0.01);
    expect(n1Update!.y).to.be.closeTo(0, 0.01);

    // Length should remain 100
    const newLength = Math.sqrt(
      Math.pow(n2Update!.x - n1Update!.x, 2) +
      Math.pow(n2Update!.y - n1Update!.y, 2)
    );
    expect(newLength).to.be.closeTo(100, 0.01);
  });

  it('should propagate constrained node movement to connected edges', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 0, -100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { direction: 'horizontal' }),
      createEdge('e2', 'n3', 'n1'), // connected at n1
    ];

    const graph = buildNodeGraph(nodes, edges);
    // Drag n2 down
    const result = solveNodeMove(graph, 'n2', 100, 50);

    expect(result.blocked).to.be.false;

    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n3Update = findNodeUpdate(result.updates, 'n3');

    // e1 stays horizontal: n1 Y should be 50
    expect(n1Update.y).to.equal(50);
    expect(n1Update.x).to.equal(0);

    // e2's end (n1) moved, so n3 should also update (but free, so only shared endpoint moves)
    // n3 is free, so it stays at original position
    // Actually n3 is the OTHER end - for a free edge, the other end doesn't move
    // The propagation: n2 moved -> e1 horizontal -> n1 moves to (0,50) -> e2 -> n3 is other end, free, no move
    expect(n3Update).to.be.undefined; // n3 doesn't move because e2 is free
  });

  it('should handle combined length_locked + direction', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { direction: 'horizontal', length_locked: true })];

    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 200, 50);

    expect(result.blocked).to.be.false;

    const n2Update = findNodeUpdate(result.updates, 'n2')!;
    const n1Update = findNodeUpdate(result.updates, 'n1')!;

    expect(n2Update.x).to.equal(200);
    expect(n2Update.y).to.equal(50);

    // Horizontal: same Y
    expect(n1Update.y).to.equal(50);

    // Length should be preserved at 100
    const newLength = Math.sqrt(
      Math.pow(n2Update.x - n1Update.x, 2) +
      Math.pow(n2Update.y - n1Update.y, 2)
    );
    expect(newLength).to.be.closeTo(100, 0.01);

    // n1 should be at (100, 50)
    expect(n1Update.x).to.be.closeTo(100, 0.01);
  });
});

describe('solveEdgeLengthChange', () => {
  it('should extend edge from center', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];

    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 200);

    expect(result.blocked).to.be.false;

    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;

    // Center should remain at (50, 0)
    const newCenterX = (n1Update.x + n2Update.x) / 2;
    const newCenterY = (n1Update.y + n2Update.y) / 2;
    expect(newCenterX).to.be.closeTo(50, 0.01);
    expect(newCenterY).to.be.closeTo(0, 0.01);

    // New length should be 200
    const newLength = Math.sqrt(
      Math.pow(n2Update.x - n1Update.x, 2) +
      Math.pow(n2Update.y - n1Update.y, 2)
    );
    expect(newLength).to.be.closeTo(200, 0.01);
  });

  it('should push connected edges when extending and stay connected', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3'),
    ];

    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 200);

    expect(result.blocked).to.be.false;

    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;

    // n2 should have moved to ~150
    expect(n2Update.x).to.be.closeTo(150, 0.01);

    // n3 should also get an update since n2 moved and e2 connects them
    // (free edge, so n3 stays in place - the "other" end doesn't move for free edges)
    // Actually, for free edges, moving the shared endpoint doesn't move the other end
  });

  it('should keep vertical edge vertical when connected edge extends', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),
    ];

    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 200);

    expect(result.blocked).to.be.false;

    const n2Update = findNodeUpdate(result.updates, 'n2')!;
    const n3Update = findNodeUpdate(result.updates, 'n3');

    // n2 moved, e2 is vertical, so n3's X should match n2's new X
    expect(n3Update).to.exist;
    expect(n3Update!.x).to.equal(n2Update.x);
    expect(n3Update!.x).to.be.closeTo(150, 0.01);
  });

  it('should block length change on length-locked edge', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { length_locked: true })];

    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 200);

    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.equal('e1');
  });

  it('should preserve angle when changing length', () => {
    // Edge at 45 degrees
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 100)];
    const edges = [createEdge('e1', 'n1', 'n2')];

    const graph = buildNodeGraph(nodes, edges);
    const result = solveEdgeLengthChange(graph, 'e1', 200);

    expect(result.blocked).to.be.false;
    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;

    const originalAngle = Math.atan2(100, 100);
    const newAngle = Math.atan2(
      n2Update.y - n1Update.y,
      n2Update.x - n1Update.x
    );
    expect(newAngle).to.be.closeTo(originalAngle, 0.01);
  });
});

describe('previewLengthChange', () => {
  it('should return preview without modifying nodes', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2')];

    const preview = previewLengthChange(nodes, edges, 'e1', 200);

    expect(preview.size).to.be.greaterThan(0);
    expect(preview.has('n1')).to.be.true;

    // Original nodes should be unchanged
    expect(nodes[0].x).to.equal(0);
    expect(nodes[1].x).to.equal(100);
  });
});

describe('previewNodeDrag', () => {
  it('should return preview of node drag', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3'),
    ];

    const preview = previewNodeDrag(nodes, edges, 'n2', 150, 0);

    expect(preview.size).to.be.greaterThan(0);
    expect(preview.has('n2')).to.be.true;
  });
});

describe('snapEdgeToConstraint', () => {
  it('should return null for free direction', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const nodeMap = buildNodeMap(nodes);
    expect(snapEdgeToConstraint(edges[0], 'free', nodeMap)).to.be.null;
  });

  it('should snap diagonal edge to horizontal', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const nodeMap = buildNodeMap(nodes);
    const result = snapEdgeToConstraint(edges[0], 'horizontal', nodeMap);

    expect(result).to.not.be.null;
    const n1Update = result!.nodeUpdates.find(u => u.nodeId === 'n1')!;
    const n2Update = result!.nodeUpdates.find(u => u.nodeId === 'n2')!;

    // Both should have same Y (midpoint Y = 25)
    expect(n1Update.y).to.equal(n2Update.y);
    expect(n1Update.y).to.be.closeTo(25, 0.01);

    // Length should be preserved
    const originalLength = Math.sqrt(100 * 100 + 50 * 50);
    const newLength = Math.abs(n2Update.x - n1Update.x);
    expect(newLength).to.be.closeTo(originalLength, 0.01);
  });

  it('should return null for already-horizontal edge', () => {
    const nodes = [createNode('n1', 0, 50), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const nodeMap = buildNodeMap(nodes);
    expect(snapEdgeToConstraint(edges[0], 'horizontal', nodeMap)).to.be.null;
  });

  it('should snap diagonal edge to vertical', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 50, 100)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const nodeMap = buildNodeMap(nodes);
    const result = snapEdgeToConstraint(edges[0], 'vertical', nodeMap);

    expect(result).to.not.be.null;
    const n1Update = result!.nodeUpdates.find(u => u.nodeId === 'n1')!;
    const n2Update = result!.nodeUpdates.find(u => u.nodeId === 'n2')!;

    // Both should have same X (midpoint X = 25)
    expect(n1Update.x).to.equal(n2Update.x);
    expect(n1Update.x).to.be.closeTo(25, 0.01);

    // Length should be preserved
    const originalLength = Math.sqrt(50 * 50 + 100 * 100);
    const newLength = Math.abs(n2Update.y - n1Update.y);
    expect(newLength).to.be.closeTo(originalLength, 0.01);
  });

  it('should return null for already-vertical edge', () => {
    const nodes = [createNode('n1', 50, 0), createNode('n2', 50, 100)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const nodeMap = buildNodeMap(nodes);
    expect(snapEdgeToConstraint(edges[0], 'vertical', nodeMap)).to.be.null;
  });

  it('should preserve edge center when snapping to horizontal', () => {
    const nodes = [createNode('n1', 10, 20), createNode('n2', 110, 80)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const nodeMap = buildNodeMap(nodes);
    const result = snapEdgeToConstraint(edges[0], 'horizontal', nodeMap)!;

    const n1Update = result.nodeUpdates.find(u => u.nodeId === 'n1')!;
    const n2Update = result.nodeUpdates.find(u => u.nodeId === 'n2')!;

    const originalMidX = (10 + 110) / 2;
    const originalMidY = (20 + 80) / 2;
    const newMidX = (n1Update.x + n2Update.x) / 2;
    const newMidY = (n1Update.y + n2Update.y) / 2;

    expect(newMidX).to.be.closeTo(originalMidX, 0.01);
    expect(newMidY).to.be.closeTo(originalMidY, 0.01);
  });
});

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

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(2); // both nodes

    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;
    expect(n1Update.y).to.equal(n2Update.y);
  });

  it('should keep connected edges connected when snapping to horizontal', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 50), createNode('n3', 100, 150),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'horizontal');

    expect(result.blocked).to.be.false;

    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;

    // e1 should be horizontal
    expect(n1Update.y).to.equal(n2Update.y);

    // Connection maintained: n2 is shared between e1 and e2
    // (n2 moved, so if e2 has no constraints, n3 stays put)
  });

  it('should keep connected edges connected when snapping to vertical', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 50, 100), createNode('n3', -100, 0),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n1', 'n3'),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'vertical');

    expect(result.blocked).to.be.false;

    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;

    // e1 should be vertical
    expect(n1Update.x).to.equal(n2Update.x);
  });

  it('should propagate to multiple connected edges at both endpoints', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 50),
      createNode('n3', 0, -100), createNode('n4', 200, 50),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'), // diagonal, will snap
      createEdge('e2', 'n3', 'n1'), // connected at n1
      createEdge('e3', 'n2', 'n4'), // connected at n2
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'horizontal');

    expect(result.blocked).to.be.false;

    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;

    // e1 should be horizontal
    expect(n1Update.y).to.equal(n2Update.y);
  });

  it('should return no updates for free direction', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 50)];
    const edges = [createEdge('e1', 'n1', 'n2')];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'free');
    expect(result.updates.length).to.equal(0);
    expect(result.blocked).to.be.false;
  });

  it('should respect direction constraints on connected edges during snap', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 50), createNode('n3', 100, 150),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'), // diagonal -> horizontal
      createEdge('e2', 'n2', 'n3', { direction: 'vertical' }),
    ];
    const graph = buildNodeGraph(nodes, edges);
    const result = solveConstraintSnap(graph, 'e1', 'horizontal');

    expect(result.blocked).to.be.false;

    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;
    const n3Update = findNodeUpdate(result.updates, 'n3');

    // e1 horizontal
    expect(n1Update.y).to.equal(n2Update.y);

    // e2 stays vertical (n3.x should match n2.x)
    expect(n3Update).to.exist;
    expect(n3Update!.x).to.equal(n2Update.x);
  });
});

describe('complex scenarios', () => {
  it('should handle a closed rectangle', () => {
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

    // Each corner node should have 2 edge references
    expect(graph.nodeToEdges.get('n1')!.length).to.equal(2);
    expect(graph.nodeToEdges.get('n2')!.length).to.equal(2);
    expect(graph.nodeToEdges.get('n3')!.length).to.equal(2);
    expect(graph.nodeToEdges.get('n4')!.length).to.equal(2);
  });

  it('should handle T-junction', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0),
      createNode('n3', 200, 0), createNode('n4', 100, 100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2'),
      createEdge('e2', 'n2', 'n3'),
      createEdge('e3', 'n2', 'n4'),
    ];

    const graph = buildNodeGraph(nodes, edges);

    // The T-junction node n2 should have 3 edge references
    const n2Edges = graph.nodeToEdges.get('n2');
    expect(n2Edges).to.exist;
    expect(n2Edges!.length).to.equal(3);
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

    // Move n2 to (150, 50)
    const result = solveNodeMove(graph, 'n2', 150, 50);

    expect(result.blocked).to.be.false;

    const n2Update = findNodeUpdate(result.updates, 'n2')!;
    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n3Update = findNodeUpdate(result.updates, 'n3')!;

    // n2 at target
    expect(n2Update.x).to.equal(150);
    expect(n2Update.y).to.equal(50);

    // e1 (horizontal) → n1 Y should match n2 Y
    expect(n1Update.y).to.equal(50);

    // e2 (vertical) → n3 X should match n2 X
    expect(n3Update.x).to.equal(150);
  });
});

describe('angle lock', () => {
  it('should preserve angle and length for a single angle-locked edge', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 100)];
    const edges = [createEdge('e1', 'n1', 'n2', { angle_locked: true })];

    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n1', 50, 0);

    expect(result.blocked).to.be.false;

    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;

    // n1 moves to target
    expect(n1Update.x).to.equal(50);
    expect(n1Update.y).to.equal(0);

    // n2 should preserve original angle (45 degrees) and length (~141.42)
    const originalLength = Math.sqrt(100 * 100 + 100 * 100);
    const newLength = Math.sqrt(
      Math.pow(n2Update.x - n1Update.x, 2) +
      Math.pow(n2Update.y - n1Update.y, 2)
    );
    expect(newLength).to.be.closeTo(originalLength, 0.01);

    const originalAngle = Math.atan2(100, 100);
    const newAngle = Math.atan2(
      n2Update.y - n1Update.y,
      n2Update.x - n1Update.x
    );
    expect(newAngle).to.be.closeTo(originalAngle, 0.01);
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
    // Drag n2 down
    const result = solveNodeMove(graph, 'n2', 100, 50);

    expect(result.blocked).to.be.false;

    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;
    const n3Update = findNodeUpdate(result.updates, 'n3')!;

    // n2 at target
    expect(n2Update.x).to.equal(100);
    expect(n2Update.y).to.equal(50);

    // e1 original angle was 0 (horizontal right), length 100
    // n1 should be at (100-100, 50) = (0, 50)
    expect(n1Update.x).to.be.closeTo(0, 0.01);
    expect(n1Update.y).to.be.closeTo(50, 0.01);

    // e2 original angle was pi/2 (down), length 100
    // n3 should be at (100, 50+100) = (100, 150)
    expect(n3Update.x).to.be.closeTo(100, 0.01);
    expect(n3Update.y).to.be.closeTo(150, 0.01);
  });

  it('should propagate angle-locked movement to connected free edges', () => {
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n3', 0, -100),
    ];
    const edges = [
      createEdge('e1', 'n1', 'n2', { angle_locked: true }),
      createEdge('e2', 'n3', 'n1'), // connected at n1, free
    ];

    const graph = buildNodeGraph(nodes, edges);
    // Drag n2 down
    const result = solveNodeMove(graph, 'n2', 100, 50);

    expect(result.blocked).to.be.false;

    const n1Update = findNodeUpdate(result.updates, 'n1')!;

    // e1 angle locked: angle was 0 (horizontal), length 100
    // n1 should move to (0, 50)
    expect(n1Update.x).to.be.closeTo(0, 0.01);
    expect(n1Update.y).to.be.closeTo(50, 0.01);

    // n3 stays (free edge, n3 is the other end, doesn't move)
    const n3Update = findNodeUpdate(result.updates, 'n3');
    expect(n3Update).to.be.undefined;
  });

  it('should let direction constraint take precedence over angle_locked', () => {
    const nodes = [createNode('n1', 0, 0), createNode('n2', 100, 0)];
    const edges = [createEdge('e1', 'n1', 'n2', { angle_locked: true, direction: 'horizontal' })];

    const graph = buildNodeGraph(nodes, edges);
    const result = solveNodeMove(graph, 'n2', 150, 50);

    expect(result.blocked).to.be.false;
    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;

    // Direction constraint: wall stays horizontal
    expect(n1Update.y).to.equal(n2Update.y);
    expect(n1Update.y).to.equal(50);

    // Start X stays at 0
    expect(n1Update.x).to.equal(0);
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
    // Drag n2 (top-right corner) right
    const result = solveNodeMove(graph, 'n2', 250, 0);

    expect(result.blocked).to.be.false;

    const n1Update = findNodeUpdate(result.updates, 'n1')!;
    const n2Update = findNodeUpdate(result.updates, 'n2')!;
    const n3Update = findNodeUpdate(result.updates, 'n3')!;

    // Top edge: angle locked at 0 rad (horizontal), length 200
    // n2 at (250, 0), n1 = (250-200, 0) = (50, 0)
    expect(n2Update.x).to.equal(250);
    expect(n2Update.y).to.equal(0);
    expect(n1Update.x).to.be.closeTo(50, 0.01);
    expect(n1Update.y).to.be.closeTo(0, 0.01);

    // Right edge: angle locked at pi/2 (down), length 200
    // n2 at (250, 0), n3 = (250, 200)
    expect(n3Update.x).to.be.closeTo(250, 0.01);
    expect(n3Update.y).to.be.closeTo(200, 0.01);
  });
});
