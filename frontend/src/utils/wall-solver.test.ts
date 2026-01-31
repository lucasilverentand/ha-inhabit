import { expect } from '@open-wc/testing';
import {
  buildConnectionGraph,
  solveWallMovement,
  solveWallLengthChange,
  previewLengthChange,
  previewEndpointDrag,
} from './wall-solver.js';
import type { Wall, Coordinates } from '../types.js';

// Helper to create a wall
function createWall(
  id: string,
  start: Coordinates,
  end: Coordinates,
  constraint: Wall['constraint'] = 'none'
): Wall {
  return {
    id,
    start,
    end,
    thickness: 10,
    is_exterior: false,
    constraint,
  };
}

// Helper to check if two coordinates are approximately equal
function coordsEqual(a: Coordinates, b: Coordinates, tolerance = 0.01): boolean {
  return Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance;
}

describe('buildConnectionGraph', () => {
  it('should create a graph from walls', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('w2', { x: 100, y: 0 }, { x: 100, y: 100 }),
    ];

    const graph = buildConnectionGraph(walls);

    expect(graph.walls.size).to.equal(2);
    expect(graph.endpoints.size).to.equal(3); // 3 unique endpoints
  });

  it('should group walls that share an endpoint', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('w2', { x: 100, y: 0 }, { x: 100, y: 100 }),
      createWall('w3', { x: 100, y: 0 }, { x: 200, y: 0 }),
    ];

    const graph = buildConnectionGraph(walls);

    // The endpoint at (100, 0) should have 3 wall references
    const sharedEndpoint = graph.endpoints.get('100,0');
    expect(sharedEndpoint).to.exist;
    expect(sharedEndpoint!.length).to.equal(3);
  });

  it('should handle isolated walls', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('w2', { x: 200, y: 200 }, { x: 300, y: 200 }),
    ];

    const graph = buildConnectionGraph(walls);

    expect(graph.walls.size).to.equal(2);
    expect(graph.endpoints.size).to.equal(4); // 4 unique endpoints, no sharing
  });
});

describe('solveWallMovement', () => {
  it('should move all walls connected to an endpoint', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('w2', { x: 100, y: 0 }, { x: 100, y: 100 }),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallMovement(
      graph,
      ['w1', 'w2'],
      'end',
      { x: 100, y: 0 },
      { x: 150, y: 0 }
    );

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(2);

    // Both walls should have their shared endpoint moved
    const w1Update = result.updates.find(u => u.wallId === 'w1');
    const w2Update = result.updates.find(u => u.wallId === 'w2');

    expect(w1Update).to.exist;
    expect(w2Update).to.exist;
    expect(coordsEqual(w1Update!.newEnd, { x: 150, y: 0 })).to.be.true;
    expect(coordsEqual(w2Update!.newStart, { x: 150, y: 0 })).to.be.true;
  });

  it('should block movement when a fixed wall is at the endpoint', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('w2', { x: 100, y: 0 }, { x: 100, y: 100 }, 'fixed'),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallMovement(
      graph,
      ['w1'],
      'end',
      { x: 100, y: 0 },
      { x: 150, y: 0 }
    );

    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.equal('w2');
    expect(result.updates.length).to.equal(0);
  });

  it('should respect horizontal constraint by adjusting other endpoint', () => {
    // With the new approach: shared endpoint always moves, constraint affects OTHER endpoint
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }, 'horizontal'),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallMovement(
      graph,
      ['w1'],
      'end',
      { x: 100, y: 0 },
      { x: 150, y: 50 } // Try to move diagonally
    );

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(1);

    // The moved endpoint goes to target position
    const update = result.updates[0];
    expect(update.newEnd.x).to.equal(150);
    expect(update.newEnd.y).to.equal(50);

    // The other endpoint (start) adjusts to keep wall horizontal
    // Start's Y should match end's new Y
    expect(update.newStart.x).to.equal(0); // X unchanged
    expect(update.newStart.y).to.equal(50); // Y matches new end Y

    // Wall should still be horizontal
    expect(update.newStart.y).to.equal(update.newEnd.y);
  });

  it('should respect vertical constraint by adjusting other endpoint', () => {
    // With the new approach: shared endpoint always moves, constraint affects OTHER endpoint
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 0, y: 100 }, 'vertical'),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallMovement(
      graph,
      ['w1'],
      'end',
      { x: 0, y: 100 },
      { x: 50, y: 150 } // Try to move diagonally
    );

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(1);

    // The moved endpoint goes to target position
    const update = result.updates[0];
    expect(update.newEnd.x).to.equal(50);
    expect(update.newEnd.y).to.equal(150);

    // The other endpoint (start) adjusts to keep wall vertical
    // Start's X should match end's new X
    expect(update.newStart.x).to.equal(50); // X matches new end X
    expect(update.newStart.y).to.equal(0); // Y unchanged

    // Wall should still be vertical
    expect(update.newStart.x).to.equal(update.newEnd.x);
  });

  it('should respect length constraint by moving other endpoint', () => {
    // With length constraint: shared endpoint moves, other endpoint moves to maintain length
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }, 'length'),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallMovement(
      graph,
      ['w1'],
      'end',
      { x: 100, y: 0 },
      { x: 150, y: 0 } // Try to extend the wall
    );

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(1);

    // The moved endpoint goes to target position
    const update = result.updates[0];
    expect(update.newEnd.x).to.equal(150);
    expect(update.newEnd.y).to.equal(0);

    // The other endpoint moves to maintain original length of 100
    // Start should be at (50, 0) to keep length at 100
    expect(update.newStart.x).to.be.closeTo(50, 0.01);
    expect(update.newStart.y).to.be.closeTo(0, 0.01);

    // Length should remain 100
    const newLength = Math.sqrt(
      Math.pow(update.newEnd.x - update.newStart.x, 2) +
      Math.pow(update.newEnd.y - update.newStart.y, 2)
    );
    expect(newLength).to.be.closeTo(100, 0.01);
  });

  it('should respect angle constraint', () => {
    // Wall at 45 degrees
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 100 }, 'angle'),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallMovement(
      graph,
      ['w1'],
      'end',
      { x: 100, y: 100 },
      { x: 200, y: 50 } // Try to change angle
    );

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(1);

    // Angle should remain 45 degrees (endpoint slides along the line)
    const update = result.updates[0];
    const originalAngle = Math.atan2(100 - 0, 100 - 0);
    const newAngle = Math.atan2(
      update.newEnd.y - update.newStart.y,
      update.newEnd.x - update.newStart.x
    );
    expect(newAngle).to.be.closeTo(originalAngle, 0.01);
  });
});

describe('solveWallLengthChange', () => {
  it('should extend wall from center', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallLengthChange(graph, 'w1', 200);

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(1);

    const update = result.updates[0];
    // Center should remain at (50, 0)
    const newCenterX = (update.newStart.x + update.newEnd.x) / 2;
    const newCenterY = (update.newStart.y + update.newEnd.y) / 2;
    expect(newCenterX).to.be.closeTo(50, 0.01);
    expect(newCenterY).to.be.closeTo(0, 0.01);

    // New length should be 200
    const newLength = Math.sqrt(
      Math.pow(update.newEnd.x - update.newStart.x, 2) +
      Math.pow(update.newEnd.y - update.newStart.y, 2)
    );
    expect(newLength).to.be.closeTo(200, 0.01);
  });

  it('should push connected walls when extending and they stay connected', () => {
    // Two walls forming an L shape
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('w2', { x: 100, y: 0 }, { x: 100, y: 100 }),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallLengthChange(graph, 'w1', 200);

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(2);

    const w1Update = result.updates.find(u => u.wallId === 'w1');
    const w2Update = result.updates.find(u => u.wallId === 'w2');

    expect(w1Update).to.exist;
    expect(w2Update).to.exist;

    // CRITICAL: w1's end and w2's start should still be connected at exactly the same point
    expect(coordsEqual(w1Update!.newEnd, w2Update!.newStart)).to.be.true;

    // w1 extends from center, so end should move right by 50
    // Original: (0,0) to (100,0), center at (50,0), new length 200
    // New: (-50,0) to (150,0)
    expect(w1Update!.newEnd.x).to.be.closeTo(150, 0.01);
    expect(w2Update!.newStart.x).to.be.closeTo(150, 0.01);
  });

  it('should keep vertical wall vertical when connected wall extends', () => {
    // L-shape: horizontal wall + vertical wall with vertical constraint
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('w2', { x: 100, y: 0 }, { x: 100, y: 100 }, 'vertical'),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallLengthChange(graph, 'w1', 200);

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(2);

    const w1Update = result.updates.find(u => u.wallId === 'w1');
    const w2Update = result.updates.find(u => u.wallId === 'w2');

    // Walls should stay connected
    expect(coordsEqual(w1Update!.newEnd, w2Update!.newStart)).to.be.true;

    // w2 should still be vertical (both points have same X)
    expect(w2Update!.newStart.x).to.equal(w2Update!.newEnd.x);
    expect(w2Update!.newStart.x).to.be.closeTo(150, 0.01);
    expect(w2Update!.newEnd.x).to.be.closeTo(150, 0.01);
  });

  it('should block length change on fixed wall', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }, 'fixed'),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallLengthChange(graph, 'w1', 200);

    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.equal('w1');
  });

  it('should block length change on length-constrained wall', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }, 'length'),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallLengthChange(graph, 'w1', 200);

    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.equal('w1');
  });

  it('should block if connected wall is fixed', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('w2', { x: 100, y: 0 }, { x: 100, y: 100 }, 'fixed'),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallLengthChange(graph, 'w1', 200);

    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.equal('w2');
  });

  it('should preserve angle when changing length', () => {
    // Wall at 45 degrees
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 100 }),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallLengthChange(graph, 'w1', 200);

    expect(result.blocked).to.be.false;
    const update = result.updates[0];

    const originalAngle = Math.atan2(100, 100);
    const newAngle = Math.atan2(
      update.newEnd.y - update.newStart.y,
      update.newEnd.x - update.newStart.x
    );
    expect(newAngle).to.be.closeTo(originalAngle, 0.01);
  });
});

describe('previewLengthChange', () => {
  it('should return preview without modifying walls', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
    ];

    const preview = previewLengthChange(walls, 'w1', 200);

    expect(preview.size).to.equal(1);
    expect(preview.has('w1')).to.be.true;

    // Original wall should be unchanged
    expect(walls[0].start.x).to.equal(0);
    expect(walls[0].end.x).to.equal(100);
  });
});

describe('previewEndpointDrag', () => {
  it('should return preview of endpoint drag', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('w2', { x: 100, y: 0 }, { x: 100, y: 100 }),
    ];

    const preview = previewEndpointDrag(
      walls,
      { x: 100, y: 0 },
      { x: 150, y: 0 },
      ['w1', 'w2']
    );

    expect(preview.size).to.equal(2);
    expect(preview.has('w1')).to.be.true;
    expect(preview.has('w2')).to.be.true;
  });
});

describe('complex scenarios', () => {
  it('should handle a closed rectangle', () => {
    // Rectangle: 4 walls forming a closed shape
    const walls = [
      createWall('top', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('right', { x: 100, y: 0 }, { x: 100, y: 100 }),
      createWall('bottom', { x: 100, y: 100 }, { x: 0, y: 100 }),
      createWall('left', { x: 0, y: 100 }, { x: 0, y: 0 }),
    ];

    const graph = buildConnectionGraph(walls);

    // Each corner should have 2 wall endpoints
    expect(graph.endpoints.get('0,0')!.length).to.equal(2);
    expect(graph.endpoints.get('100,0')!.length).to.equal(2);
    expect(graph.endpoints.get('100,100')!.length).to.equal(2);
    expect(graph.endpoints.get('0,100')!.length).to.equal(2);
  });

  it('should handle T-junction', () => {
    // T-junction: 3 walls meeting at one point
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('w2', { x: 100, y: 0 }, { x: 200, y: 0 }),
      createWall('w3', { x: 100, y: 0 }, { x: 100, y: 100 }),
    ];

    const graph = buildConnectionGraph(walls);

    // The T-junction point should have 3 wall endpoints
    const junction = graph.endpoints.get('100,0');
    expect(junction).to.exist;
    expect(junction!.length).to.equal(3);
  });

  it('should handle mixed constraints in connected walls while staying connected', () => {
    // This is the KEY test: connected walls must stay connected!
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }, 'horizontal'),
      createWall('w2', { x: 100, y: 0 }, { x: 100, y: 100 }, 'vertical'),
    ];

    const graph = buildConnectionGraph(walls);

    // Moving the shared endpoint at (100, 0) to (150, 50)
    // Both walls share this endpoint and must stay connected
    const result = solveWallMovement(
      graph,
      ['w1', 'w2'],
      'end',
      { x: 100, y: 0 },
      { x: 150, y: 50 }
    );

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(2);

    const w1Update = result.updates.find(u => u.wallId === 'w1');
    const w2Update = result.updates.find(u => u.wallId === 'w2');

    // CRITICAL: Both walls' shared endpoints must be at the same position
    expect(coordsEqual(w1Update!.newEnd, w2Update!.newStart)).to.be.true;

    // Shared endpoint should be at target position
    expect(w1Update!.newEnd.x).to.equal(150);
    expect(w1Update!.newEnd.y).to.equal(50);
    expect(w2Update!.newStart.x).to.equal(150);
    expect(w2Update!.newStart.y).to.equal(50);

    // w1 (horizontal constraint) should still be horizontal
    // Its other endpoint's Y should match the shared endpoint's Y
    expect(w1Update!.newStart.y).to.equal(w1Update!.newEnd.y);
    expect(w1Update!.newStart.y).to.equal(50);

    // w2 (vertical constraint) should still be vertical
    // Its other endpoint's X should match the shared endpoint's X
    expect(w2Update!.newEnd.x).to.equal(w2Update!.newStart.x);
    expect(w2Update!.newEnd.x).to.equal(150);
  });
});
