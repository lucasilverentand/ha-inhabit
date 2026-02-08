import { expect } from '@open-wc/testing';
import { detectRoomsFromEdges, detectRoomsFromWalls } from './room-detection.js';
import type { Node, Edge, Coordinates } from '../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function createNode(id: string, x: number, y: number): Node {
  return { id, x, y };
}

function createEdge(id: string, startNode: string, endNode: string): Edge {
  return {
    id,
    start_node: startNode,
    end_node: endNode,
    type: 'wall',
    thickness: 10,
    is_exterior: false,
    length_locked: false,
    direction: 'free',
    angle_locked: false,
  };
}

/** Build a simple rectangular room and return nodes + edges. */
function makeRect(
  x: number, y: number, w: number, h: number,
  prefix = 'r'
): { nodes: Node[]; edges: Edge[] } {
  const nodes = [
    createNode(`${prefix}1`, x, y),
    createNode(`${prefix}2`, x + w, y),
    createNode(`${prefix}3`, x + w, y + h),
    createNode(`${prefix}4`, x, y + h),
  ];
  const edges = [
    createEdge(`${prefix}e1`, `${prefix}1`, `${prefix}2`),
    createEdge(`${prefix}e2`, `${prefix}2`, `${prefix}3`),
    createEdge(`${prefix}e3`, `${prefix}3`, `${prefix}4`),
    createEdge(`${prefix}e4`, `${prefix}4`, `${prefix}1`),
  ];
  return { nodes, edges };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Basic room detection
// ─────────────────────────────────────────────────────────────────────────────

describe('room detection – basic shapes', () => {
  it('should detect a single rectangular room', () => {
    const { nodes, edges } = makeRect(0, 0, 200, 200);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].area).to.be.closeTo(200 * 200, 1);
  });

  it('should detect a single square room', () => {
    const { nodes, edges } = makeRect(0, 0, 100, 100);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].area).to.be.closeTo(10000, 1);
  });

  it('should detect a triangular room', () => {
    const nodes = [
      createNode('a', 0, 0), createNode('b', 200, 0), createNode('c', 100, 200),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'),
      createEdge('bc', 'b', 'c'),
      createEdge('ca', 'c', 'a'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    // Area of triangle: 0.5 * 200 * 200 = 20000
    expect(rooms[0].area).to.be.closeTo(20000, 1);
  });

  it('should detect an L-shaped room (6 vertices)', () => {
    const nodes = [
      createNode('a', 0, 0), createNode('b', 200, 0),
      createNode('c', 200, 100), createNode('d', 100, 100),
      createNode('e', 100, 200), createNode('f', 0, 200),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('cd', 'c', 'd'), createEdge('de', 'd', 'e'),
      createEdge('ef', 'e', 'f'), createEdge('fa', 'f', 'a'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    // L-shape area = 200*100 + 100*100 = 30000
    expect(rooms[0].area).to.be.closeTo(30000, 1);
  });

  it('should detect a pentagon', () => {
    // Regular pentagon approximation
    const r = 100;
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (2 * Math.PI * i) / 5 - Math.PI / 2;
      nodes.push(createNode(`p${i}`, r * Math.cos(angle), r * Math.sin(angle)));
    }
    for (let i = 0; i < 5; i++) {
      edges.push(createEdge(`e${i}`, `p${i}`, `p${(i + 1) % 5}`));
    }
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].area).to.be.greaterThan(100); // well above MIN_AREA
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Multiple rooms
// ─────────────────────────────────────────────────────────────────────────────

describe('room detection – multiple rooms', () => {
  it('should detect two rooms sharing a wall', () => {
    //  n1 -- n2 -- n5
    //  |     |     |
    //  n4 -- n3 -- n6
    const nodes = [
      createNode('n1', 0, 0), createNode('n2', 100, 0), createNode('n5', 200, 0),
      createNode('n4', 0, 100), createNode('n3', 100, 100), createNode('n6', 200, 100),
    ];
    const edges = [
      createEdge('top1', 'n1', 'n2'), createEdge('top2', 'n2', 'n5'),
      createEdge('shared', 'n2', 'n3'),
      createEdge('bot1', 'n4', 'n3'), createEdge('bot2', 'n3', 'n6'),
      createEdge('left', 'n1', 'n4'), createEdge('right', 'n5', 'n6'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(2);
    // Both rooms should be ~10000 area
    for (const room of rooms) {
      expect(room.area).to.be.closeTo(10000, 100);
    }
  });

  it('should detect three rooms in a row', () => {
    //  a -- b -- c -- d
    //  |    |    |    |
    //  h -- g -- f -- e
    const nodes = [
      createNode('a', 0, 0), createNode('b', 100, 0),
      createNode('c', 200, 0), createNode('d', 300, 0),
      createNode('e', 300, 100), createNode('f', 200, 100),
      createNode('g', 100, 100), createNode('h', 0, 100),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'), createEdge('cd', 'c', 'd'),
      createEdge('de', 'd', 'e'), createEdge('ef', 'e', 'f'), createEdge('fg', 'f', 'g'),
      createEdge('gh', 'g', 'h'), createEdge('ha', 'h', 'a'),
      createEdge('bg', 'b', 'g'), createEdge('cf', 'c', 'f'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(3);
  });

  it('should detect four rooms in a 2x2 grid', () => {
    //  a -- b -- c
    //  |    |    |
    //  d -- e -- f
    //  |    |    |
    //  g -- h -- i
    const nodes = [
      createNode('a', 0, 0), createNode('b', 100, 0), createNode('c', 200, 0),
      createNode('d', 0, 100), createNode('e', 100, 100), createNode('f', 200, 100),
      createNode('g', 0, 200), createNode('h', 100, 200), createNode('i', 200, 200),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('de', 'd', 'e'), createEdge('ef', 'e', 'f'),
      createEdge('gh', 'g', 'h'), createEdge('hi', 'h', 'i'),
      createEdge('ad', 'a', 'd'), createEdge('be', 'b', 'e'), createEdge('cf', 'c', 'f'),
      createEdge('dg', 'd', 'g'), createEdge('eh', 'e', 'h'), createEdge('fi', 'f', 'i'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(4);
  });

  it('should detect rooms of different sizes', () => {
    //  a ---- b ------ c
    //  |      |        |
    //  d ---- e ------ f  (small left room, large right room)
    const nodes = [
      createNode('a', 0, 0), createNode('b', 50, 0), createNode('c', 200, 0),
      createNode('d', 0, 100), createNode('e', 50, 100), createNode('f', 200, 100),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('de', 'd', 'e'), createEdge('ef', 'e', 'f'),
      createEdge('ad', 'a', 'd'), createEdge('be', 'b', 'e'), createEdge('cf', 'c', 'f'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(2);
    const areas = rooms.map(r => r.area).sort((a, b) => a - b);
    expect(areas[0]).to.be.closeTo(5000, 100);   // 50 * 100
    expect(areas[1]).to.be.closeTo(15000, 100);  // 150 * 100
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Edge cases – empty / degenerate
// ─────────────────────────────────────────────────────────────────────────────

describe('room detection – empty & degenerate', () => {
  it('should return empty array for no edges', () => {
    const rooms = detectRoomsFromEdges([], []);
    expect(rooms.length).to.equal(0);
  });

  it('should return empty array for no nodes with edges', () => {
    const edges = [createEdge('e1', 'missing1', 'missing2')];
    const rooms = detectRoomsFromEdges([], edges);
    expect(rooms.length).to.equal(0);
  });

  it('should return empty for a single edge (no closed loop)', () => {
    const nodes = [createNode('a', 0, 0), createNode('b', 100, 0)];
    const edges = [createEdge('e1', 'a', 'b')];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(0);
  });

  it('should return empty for two edges forming an open path', () => {
    const nodes = [createNode('a', 0, 0), createNode('b', 100, 0), createNode('c', 200, 0)];
    const edges = [createEdge('e1', 'a', 'b'), createEdge('e2', 'b', 'c')];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(0);
  });

  it('should return empty for a dangling edge off a closed room', () => {
    // Rectangle + one dangling edge
    const { nodes, edges } = makeRect(0, 0, 200, 200);
    const dangle = createNode('d', 300, 100);
    nodes.push(dangle);
    edges.push(createEdge('dangle', 'r2', 'd'));
    const rooms = detectRoomsFromEdges(nodes, edges);
    // Should still detect the rectangle
    expect(rooms.length).to.equal(1);
  });

  it('should filter out tiny rooms below MIN_AREA', () => {
    // 5x5 square = area 25, below MIN_AREA of 100
    const { nodes, edges } = makeRect(0, 0, 5, 5);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(0);
  });

  it('should detect room at exactly MIN_AREA boundary', () => {
    // 10x10 square = area 100, exactly at MIN_AREA
    const { nodes, edges } = makeRect(0, 0, 10, 10);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
  });

  it('should handle self-referencing edge (start == end) gracefully', () => {
    const nodes = [createNode('a', 0, 0), createNode('b', 100, 0)];
    const edges = [
      createEdge('self', 'a', 'a'), // self-loop (should be ignored)
      createEdge('ab', 'a', 'b'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    // No closed room possible with just one real edge
    expect(rooms.length).to.equal(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. T-junctions and complex topology
// ─────────────────────────────────────────────────────────────────────────────

describe('room detection – complex topology', () => {
  it('should handle T-junction correctly', () => {
    // Rectangle with one interior wall creating a T
    //  a -- b -- c
    //  |    |    |
    //  d -- e    |
    //  |         |
    //  f ------- g
    const nodes = [
      createNode('a', 0, 0), createNode('b', 100, 0), createNode('c', 200, 0),
      createNode('d', 0, 100), createNode('e', 100, 100),
      createNode('f', 0, 200), createNode('g', 200, 200),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('cg', 'c', 'g'), createEdge('gf', 'g', 'f'),
      createEdge('fd', 'f', 'd'), createEdge('da', 'd', 'a'),
      createEdge('be', 'b', 'e'), createEdge('ed', 'e', 'd'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    // Should detect 2 rooms: top-left small, big L-shaped or bottom
    expect(rooms.length).to.be.greaterThanOrEqual(2);
  });

  it('should handle cross junction (4-way intersection)', () => {
    //      b
    //      |
    //  d - e - f
    //      |
    //      h
    // Plus outer rectangle
    //  a --- c
    //  |     |
    //  g --- i
    const nodes = [
      createNode('a', 0, 0), createNode('b', 100, 0), createNode('c', 200, 0),
      createNode('d', 0, 100), createNode('e', 100, 100), createNode('f', 200, 100),
      createNode('g', 0, 200), createNode('h', 100, 200), createNode('i', 200, 200),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('cf', 'c', 'f'), createEdge('fi', 'f', 'i'),
      createEdge('ih', 'i', 'h'), createEdge('hg', 'h', 'g'),
      createEdge('gd', 'g', 'd'), createEdge('da', 'd', 'a'),
      createEdge('be', 'b', 'e'), createEdge('ef', 'e', 'f'),
      createEdge('eh', 'e', 'h'), createEdge('de', 'd', 'e'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(4);
  });

  it('should handle a room with an interior partition', () => {
    //  a -- b -- c
    //  |    |    |
    //  f -- e -- d
    const nodes = [
      createNode('a', 0, 0), createNode('b', 100, 0), createNode('c', 200, 0),
      createNode('d', 200, 100), createNode('e', 100, 100), createNode('f', 0, 100),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('cd', 'c', 'd'), createEdge('de', 'd', 'e'),
      createEdge('ef', 'e', 'f'), createEdge('fa', 'f', 'a'),
      createEdge('be', 'b', 'e'), // interior partition
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(2);
  });

  it('should handle nested rooms (room within room) as flat partitions', () => {
    // Partition from top wall to bottom wall splits outer room into 2
    // Must share nodes with the outer walls for the graph to be connected
    const nodes = [
      createNode('a', 0, 0), createNode('b', 100, 0), createNode('c', 300, 0),
      createNode('d', 300, 300), createNode('e', 100, 300), createNode('f', 0, 300),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('cd', 'c', 'd'), createEdge('de', 'd', 'e'),
      createEdge('ef', 'e', 'f'), createEdge('fa', 'f', 'a'),
      createEdge('partition', 'b', 'e'), // splits into left and right rooms
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Centroid calculation
// ─────────────────────────────────────────────────────────────────────────────

describe('room detection – centroid', () => {
  it('centroid of a square should be at center', () => {
    const { nodes, edges } = makeRect(0, 0, 200, 200);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].centroid.x).to.be.closeTo(100, 1);
    expect(rooms[0].centroid.y).to.be.closeTo(100, 1);
  });

  it('centroid of a rectangle should be at center', () => {
    const { nodes, edges } = makeRect(0, 0, 400, 200);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms[0].centroid.x).to.be.closeTo(200, 1);
    expect(rooms[0].centroid.y).to.be.closeTo(100, 1);
  });

  it('centroid of an equilateral triangle should be at geometric center', () => {
    const h = 100 * Math.sqrt(3) / 2;
    const nodes = [
      createNode('a', 0, 0), createNode('b', 100, 0), createNode('c', 50, h),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'), createEdge('ca', 'c', 'a'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].centroid.x).to.be.closeTo(50, 1);
    expect(rooms[0].centroid.y).to.be.closeTo(h / 3, 1);
  });

  it('centroid of offset rectangle should account for offset', () => {
    const { nodes, edges } = makeRect(500, 300, 200, 100);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms[0].centroid.x).to.be.closeTo(600, 1);
    expect(rooms[0].centroid.y).to.be.closeTo(350, 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Area calculation
// ─────────────────────────────────────────────────────────────────────────────

describe('room detection – area', () => {
  it('should calculate area of a large room', () => {
    const { nodes, edges } = makeRect(0, 0, 1000, 800);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms[0].area).to.be.closeTo(800000, 10);
  });

  it('should calculate area of a very thin room', () => {
    const { nodes, edges } = makeRect(0, 0, 500, 11); // just above MIN_AREA
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].area).to.be.closeTo(5500, 10);
  });

  it('should handle negative coordinate rooms', () => {
    const { nodes, edges } = makeRect(-200, -200, 200, 200);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].area).to.be.closeTo(40000, 10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Deduplication
// ─────────────────────────────────────────────────────────────────────────────

describe('room detection – deduplication', () => {
  it('should not produce duplicate rooms for a simple rectangle', () => {
    const { nodes, edges } = makeRect(0, 0, 200, 200);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
  });

  it('should not produce duplicates for a 2-room layout', () => {
    const nodes = [
      createNode('a', 0, 0), createNode('b', 100, 0), createNode('c', 200, 0),
      createNode('d', 0, 100), createNode('e', 100, 100), createNode('f', 200, 100),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('de', 'd', 'e'), createEdge('ef', 'e', 'f'),
      createEdge('ad', 'a', 'd'), createEdge('be', 'b', 'e'), createEdge('cf', 'c', 'f'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Winding order
// ─────────────────────────────────────────────────────────────────────────────

describe('room detection – winding order', () => {
  it('should detect CW room (screen coords: Y-down)', () => {
    // CW in Y-down = negative signed area
    const nodes = [
      createNode('a', 0, 0), createNode('b', 200, 0),
      createNode('c', 200, 200), createNode('d', 0, 200),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('cd', 'c', 'd'), createEdge('da', 'd', 'a'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
  });

  it('should detect room regardless of edge insertion order', () => {
    const nodes = [
      createNode('a', 0, 0), createNode('b', 200, 0),
      createNode('c', 200, 200), createNode('d', 0, 200),
    ];
    // Shuffled edge order
    const edges = [
      createEdge('cd', 'c', 'd'), createEdge('ab', 'a', 'b'),
      createEdge('da', 'd', 'a'), createEdge('bc', 'b', 'c'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Real floor plan scenarios
// ─────────────────────────────────────────────────────────────────────────────

describe('room detection – real floor plan scenarios', () => {
  it('should detect rooms in a studio apartment layout', () => {
    // Studio: one big room + bathroom
    //  a --------- b
    //  |           |
    //  |     d --- c
    //  |     |     |
    //  f --- e ----+  (e connects to c)
    // Wait, let's make it simpler:
    // Outer walls + one interior wall
    const nodes = [
      createNode('a', 0, 0), createNode('b', 400, 0),
      createNode('c', 400, 300), createNode('d', 0, 300),
      createNode('e', 300, 0), createNode('f', 300, 200),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('cd', 'c', 'd'), createEdge('da', 'd', 'a'),
      createEdge('ef', 'e', 'f'), // interior wall
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    // Interior wall doesn't form closed rooms on its own
    // Only the outer rectangle forms a room
    expect(rooms.length).to.equal(1);
  });

  it('should detect rooms in a two-bedroom layout', () => {
    //  a -- b -- c -- d
    //  |    |    |    |
    //  h -- g -- f -- e
    const nodes = [
      createNode('a', 0, 0), createNode('b', 150, 0),
      createNode('c', 300, 0), createNode('d', 450, 0),
      createNode('e', 450, 300), createNode('f', 300, 300),
      createNode('g', 150, 300), createNode('h', 0, 300),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'), createEdge('cd', 'c', 'd'),
      createEdge('de', 'd', 'e'), createEdge('ef', 'e', 'f'),
      createEdge('fg', 'f', 'g'), createEdge('gh', 'g', 'h'), createEdge('ha', 'h', 'a'),
      createEdge('bg', 'b', 'g'), createEdge('cf', 'c', 'f'), // interior walls
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(3);
  });

  it('should handle a corridor connecting two rooms', () => {
    //  Room 1        Corridor       Room 2
    //  a --- b ===== e ---- f ===== i --- j
    //  |     |       |      |       |     |
    //  d --- c ===== h ---- g ===== l --- k
    const nodes = [
      createNode('a', 0, 0), createNode('b', 100, 0),
      createNode('e', 100, 20), createNode('f', 200, 20),
      createNode('i', 200, 0), createNode('j', 300, 0),
      createNode('d', 0, 100), createNode('c', 100, 100),
      createNode('h', 100, 80), createNode('g', 200, 80),
      createNode('l', 200, 100), createNode('k', 300, 100),
    ];
    const edges = [
      // Room 1
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('cd', 'c', 'd'), createEdge('da', 'd', 'a'),
      // Room 2
      createEdge('ij', 'i', 'j'), createEdge('jk', 'j', 'k'),
      createEdge('kl', 'k', 'l'), createEdge('li', 'l', 'i'),
      // Corridor
      createEdge('ef', 'e', 'f'), createEdge('fg', 'f', 'g'),
      createEdge('gh', 'g', 'h'), createEdge('he', 'h', 'e'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Legacy API (detectRoomsFromWalls)
// ─────────────────────────────────────────────────────────────────────────────

describe('detectRoomsFromWalls (legacy)', () => {
  it('should detect a room from wall segments', () => {
    const walls = [
      { start: { x: 0, y: 0 }, end: { x: 200, y: 0 } },
      { start: { x: 200, y: 0 }, end: { x: 200, y: 200 } },
      { start: { x: 200, y: 200 }, end: { x: 0, y: 200 } },
      { start: { x: 0, y: 200 }, end: { x: 0, y: 0 } },
    ];
    const rooms = detectRoomsFromWalls(walls);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].area).to.be.closeTo(40000, 10);
  });

  it('should return empty for no walls', () => {
    const rooms = detectRoomsFromWalls([]);
    expect(rooms.length).to.equal(0);
  });

  it('should merge coincident endpoints into shared nodes', () => {
    // Walls defined as separate segments that share endpoints
    const walls = [
      { start: { x: 0, y: 0 }, end: { x: 100, y: 0 } },
      { start: { x: 100, y: 0 }, end: { x: 100, y: 100 } },
      { start: { x: 100, y: 100 }, end: { x: 0, y: 100 } },
      { start: { x: 0, y: 100 }, end: { x: 0, y: 0 } },
    ];
    const rooms = detectRoomsFromWalls(walls);
    expect(rooms.length).to.equal(1);
  });

  it('should handle walls with nearly-coincident endpoints (rounding)', () => {
    const walls = [
      { start: { x: 0.4, y: 0.4 }, end: { x: 100.4, y: 0.4 } },
      { start: { x: 100.4, y: 0.4 }, end: { x: 100.4, y: 100.4 } },
      { start: { x: 100.4, y: 100.4 }, end: { x: 0.4, y: 100.4 } },
      { start: { x: 0.4, y: 100.4 }, end: { x: 0.4, y: 0.4 } },
    ];
    const rooms = detectRoomsFromWalls(walls);
    expect(rooms.length).to.equal(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. Numeric edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe('room detection – numeric edge cases', () => {
  it('should handle rooms with large coordinates', () => {
    const { nodes, edges } = makeRect(10000, 10000, 500, 500);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].area).to.be.closeTo(250000, 100);
  });

  it('should handle rooms with negative coordinates', () => {
    const { nodes, edges } = makeRect(-500, -500, 300, 300);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].area).to.be.closeTo(90000, 100);
  });

  it('should handle collinear nodes (three nodes on same line)', () => {
    // a -- b -- c  (all on Y=0, just a line segment split)
    // |              |
    // f ----------- d  (bottom)
    const nodes = [
      createNode('a', 0, 0), createNode('b', 100, 0), createNode('c', 200, 0),
      createNode('d', 200, 100), createNode('f', 0, 100),
    ];
    const edges = [
      createEdge('ab', 'a', 'b'), createEdge('bc', 'b', 'c'),
      createEdge('cd', 'c', 'd'),
      createEdge('df', 'd', 'f'), createEdge('fa', 'f', 'a'),
    ];
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].area).to.be.closeTo(20000, 100);
  });

  it('should handle very thin room (aspect ratio 100:1)', () => {
    const { nodes, edges } = makeRect(0, 0, 1000, 11);
    const rooms = detectRoomsFromEdges(nodes, edges);
    expect(rooms.length).to.equal(1);
    expect(rooms[0].area).to.be.closeTo(11000, 100);
  });
});
