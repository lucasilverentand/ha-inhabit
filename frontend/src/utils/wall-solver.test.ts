import { expect } from '@open-wc/testing';
import {
  buildConnectionGraph,
  solveWallMovement,
  solveWallLengthChange,
  previewLengthChange,
  previewEndpointDrag,
  snapWallToConstraint,
  solveConstraintSnap,
} from './wall-solver.js';
import type { Wall, Coordinates, WallDirection } from '../types.js';

// Helper to create a wall
function createWall(
  id: string,
  start: Coordinates,
  end: Coordinates,
  opts?: { direction?: WallDirection; length_locked?: boolean }
): Wall {
  return {
    id,
    start,
    end,
    thickness: 10,
    is_exterior: false,
    length_locked: opts?.length_locked ?? false,
    direction: opts?.direction ?? 'free',
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

  it('should respect horizontal direction by adjusting other endpoint', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }, { direction: 'horizontal' }),
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
    expect(update.newStart.x).to.equal(0); // X unchanged
    expect(update.newStart.y).to.equal(50); // Y matches new end Y

    // Wall should still be horizontal
    expect(update.newStart.y).to.equal(update.newEnd.y);
  });

  it('should respect vertical direction by adjusting other endpoint', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 0, y: 100 }, { direction: 'vertical' }),
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
    expect(update.newStart.x).to.equal(50); // X matches new end X
    expect(update.newStart.y).to.equal(0); // Y unchanged

    // Wall should still be vertical
    expect(update.newStart.x).to.equal(update.newEnd.x);
  });

  it('should respect length_locked by moving other endpoint', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }, { length_locked: true }),
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
    expect(update.newStart.x).to.be.closeTo(50, 0.01);
    expect(update.newStart.y).to.be.closeTo(0, 0.01);

    // Length should remain 100
    const newLength = Math.sqrt(
      Math.pow(update.newEnd.x - update.newStart.x, 2) +
      Math.pow(update.newEnd.y - update.newStart.y, 2)
    );
    expect(newLength).to.be.closeTo(100, 0.01);
  });

  it('should propagate constrained other-endpoint movement to connected walls', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }, { direction: 'horizontal' }),
      createWall('w2', { x: 0, y: -100 }, { x: 0, y: 0 }), // connected at w1's start
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallMovement(
      graph,
      ['w1'],
      'end',
      { x: 100, y: 0 },
      { x: 100, y: 50 } // drag end down
    );

    expect(result.blocked).to.be.false;

    const w1Update = result.updates.find(u => u.wallId === 'w1')!;
    const w2Update = result.updates.find(u => u.wallId === 'w2')!;

    // w1 stays horizontal: both Y = 50
    expect(w1Update.newStart.y).to.equal(50);
    expect(w1Update.newEnd.y).to.equal(50);

    // w2's end must follow w1's start to stay connected
    expect(coordsEqual(w2Update.newEnd, w1Update.newStart)).to.be.true;
    expect(w2Update.newEnd.y).to.equal(50);

    // w2's start stays put (free direction, only shared endpoint moves)
    expect(w2Update.newStart.x).to.equal(0);
    expect(w2Update.newStart.y).to.equal(-100);
  });

  it('should handle combined length_locked + direction', () => {
    // Horizontal wall with locked length: moving endpoint diagonally should
    // keep the wall horizontal AND preserve its original length
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }, { direction: 'horizontal', length_locked: true }),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallMovement(
      graph,
      ['w1'],
      'end',
      { x: 100, y: 0 },
      { x: 200, y: 50 } // Move diagonally
    );

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(1);

    const update = result.updates[0];

    // The moved endpoint goes to target position
    expect(update.newEnd.x).to.equal(200);
    expect(update.newEnd.y).to.equal(50);

    // Direction applied first: other endpoint Y matches moved endpoint Y
    // Length lock applied second: distance scaled to original 100

    // Wall should be horizontal (same Y)
    expect(update.newStart.y).to.equal(50);

    // Length should be preserved at 100
    const newLength = Math.sqrt(
      Math.pow(update.newEnd.x - update.newStart.x, 2) +
      Math.pow(update.newEnd.y - update.newStart.y, 2)
    );
    expect(newLength).to.be.closeTo(100, 0.01);

    // Start should be at (100, 50) to keep horizontal + length 100
    expect(update.newStart.x).to.be.closeTo(100, 0.01);
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

    // CRITICAL: w1's end and w2's start should still be connected
    expect(coordsEqual(w1Update!.newEnd, w2Update!.newStart)).to.be.true;

    expect(w1Update!.newEnd.x).to.be.closeTo(150, 0.01);
    expect(w2Update!.newStart.x).to.be.closeTo(150, 0.01);
  });

  it('should keep vertical wall vertical when connected wall extends', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }),
      createWall('w2', { x: 100, y: 0 }, { x: 100, y: 100 }, { direction: 'vertical' }),
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

  it('should block length change on length-locked wall', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }, { length_locked: true }),
    ];

    const graph = buildConnectionGraph(walls);
    const result = solveWallLengthChange(graph, 'w1', 200);

    expect(result.blocked).to.be.true;
    expect(result.blockedBy).to.equal('w1');
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

describe('snapWallToConstraint', () => {
  it('should return null for free direction', () => {
    const wall = createWall('w1', { x: 0, y: 0 }, { x: 100, y: 50 });
    expect(snapWallToConstraint(wall, 'free')).to.be.null;
  });

  it('should snap diagonal wall to horizontal', () => {
    const wall = createWall('w1', { x: 0, y: 0 }, { x: 100, y: 50 });
    const result = snapWallToConstraint(wall, 'horizontal');

    expect(result).to.not.be.null;
    // Both endpoints should have the same Y (midpoint Y = 25)
    expect(result!.start.y).to.equal(result!.end.y);
    expect(result!.start.y).to.be.closeTo(25, 0.01);
    // Length should be preserved
    const originalLength = Math.sqrt(100 * 100 + 50 * 50);
    const newLength = Math.abs(result!.end.x - result!.start.x);
    expect(newLength).to.be.closeTo(originalLength, 0.01);
  });

  it('should return null for already-horizontal wall with horizontal direction', () => {
    const wall = createWall('w1', { x: 0, y: 50 }, { x: 100, y: 50 });
    expect(snapWallToConstraint(wall, 'horizontal')).to.be.null;
  });

  it('should snap diagonal wall to vertical', () => {
    const wall = createWall('w1', { x: 0, y: 0 }, { x: 50, y: 100 });
    const result = snapWallToConstraint(wall, 'vertical');

    expect(result).to.not.be.null;
    // Both endpoints should have the same X (midpoint X = 25)
    expect(result!.start.x).to.equal(result!.end.x);
    expect(result!.start.x).to.be.closeTo(25, 0.01);
    // Length should be preserved
    const originalLength = Math.sqrt(50 * 50 + 100 * 100);
    const newLength = Math.abs(result!.end.y - result!.start.y);
    expect(newLength).to.be.closeTo(originalLength, 0.01);
  });

  it('should return null for already-vertical wall with vertical direction', () => {
    const wall = createWall('w1', { x: 50, y: 0 }, { x: 50, y: 100 });
    expect(snapWallToConstraint(wall, 'vertical')).to.be.null;
  });

  it('should preserve wall center when snapping to horizontal', () => {
    const wall = createWall('w1', { x: 10, y: 20 }, { x: 110, y: 80 });
    const result = snapWallToConstraint(wall, 'horizontal')!;

    const originalMidX = (10 + 110) / 2;
    const originalMidY = (20 + 80) / 2;
    const newMidX = (result.start.x + result.end.x) / 2;
    const newMidY = (result.start.y + result.end.y) / 2;

    expect(newMidX).to.be.closeTo(originalMidX, 0.01);
    expect(newMidY).to.be.closeTo(originalMidY, 0.01);
  });
});

describe('solveConstraintSnap', () => {
  it('should return no updates when direction needs no geometry change', () => {
    const walls = [
      createWall('w1', { x: 0, y: 50 }, { x: 100, y: 50 }), // already horizontal
    ];
    const graph = buildConnectionGraph(walls);
    const result = solveConstraintSnap(graph, 'w1', 'horizontal');

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(0);
  });

  it('should snap isolated wall without connected walls', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 50 }),
    ];
    const graph = buildConnectionGraph(walls);
    const result = solveConstraintSnap(graph, 'w1', 'horizontal');

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(1);
    expect(result.updates[0].wallId).to.equal('w1');
    expect(result.updates[0].newStart.y).to.equal(result.updates[0].newEnd.y);
  });

  it('should keep connected walls connected when snapping to horizontal', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 50 }), // diagonal, will snap
      createWall('w2', { x: 100, y: 50 }, { x: 100, y: 150 }), // connected at w1's end
    ];
    const graph = buildConnectionGraph(walls);
    const result = solveConstraintSnap(graph, 'w1', 'horizontal');

    expect(result.blocked).to.be.false;
    expect(result.updates.length).to.equal(2);

    const w1Update = result.updates.find(u => u.wallId === 'w1')!;
    const w2Update = result.updates.find(u => u.wallId === 'w2')!;

    // w1 should be horizontal
    expect(w1Update.newStart.y).to.equal(w1Update.newEnd.y);

    // CRITICAL: w1's end must equal w2's start (stay connected)
    expect(coordsEqual(w1Update.newEnd, w2Update.newStart)).to.be.true;
  });

  it('should keep connected walls connected when snapping to vertical', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 50, y: 100 }), // diagonal, will snap
      createWall('w2', { x: 0, y: 0 }, { x: -100, y: 0 }), // connected at w1's start
    ];
    const graph = buildConnectionGraph(walls);
    const result = solveConstraintSnap(graph, 'w1', 'vertical');

    expect(result.blocked).to.be.false;

    const w1Update = result.updates.find(u => u.wallId === 'w1')!;
    const w2Update = result.updates.find(u => u.wallId === 'w2')!;

    // w1 should be vertical
    expect(w1Update.newStart.x).to.equal(w1Update.newEnd.x);

    // CRITICAL: w1's start must equal w2's start (stay connected)
    expect(coordsEqual(w1Update.newStart, w2Update.newStart)).to.be.true;
  });

  it('should propagate to multiple connected walls at both endpoints', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 50 }), // diagonal, will snap
      createWall('w2', { x: 0, y: 0 }, { x: 0, y: -100 }),   // connected at w1 start
      createWall('w3', { x: 100, y: 50 }, { x: 200, y: 50 }), // connected at w1 end
    ];
    const graph = buildConnectionGraph(walls);
    const result = solveConstraintSnap(graph, 'w1', 'horizontal');

    expect(result.blocked).to.be.false;

    const w1Update = result.updates.find(u => u.wallId === 'w1')!;
    const w2Update = result.updates.find(u => u.wallId === 'w2')!;
    const w3Update = result.updates.find(u => u.wallId === 'w3')!;

    // w1 should be horizontal
    expect(w1Update.newStart.y).to.equal(w1Update.newEnd.y);

    // All connections maintained
    expect(coordsEqual(w1Update.newStart, w2Update.newStart)).to.be.true;
    expect(coordsEqual(w1Update.newEnd, w3Update.newStart)).to.be.true;
  });

  it('should return no updates for free direction', () => {
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 50 }),
    ];
    const graph = buildConnectionGraph(walls);
    const result = solveConstraintSnap(graph, 'w1', 'free');
    expect(result.updates.length).to.equal(0);
    expect(result.blocked).to.be.false;
  });

  it('should respect direction constraints on connected walls during snap', () => {
    // When w1 snaps horizontal, w2 (vertical direction) must stay vertical
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 50 }), // diagonal → horizontal
      createWall('w2', { x: 100, y: 50 }, { x: 100, y: 150 }, { direction: 'vertical' }),
    ];
    const graph = buildConnectionGraph(walls);
    const result = solveConstraintSnap(graph, 'w1', 'horizontal');

    expect(result.blocked).to.be.false;

    const w1Update = result.updates.find(u => u.wallId === 'w1')!;
    const w2Update = result.updates.find(u => u.wallId === 'w2')!;

    // w1 horizontal
    expect(w1Update.newStart.y).to.equal(w1Update.newEnd.y);

    // w2 stays vertical (same X for both endpoints)
    expect(w2Update.newStart.x).to.equal(w2Update.newEnd.x);

    // Still connected
    expect(coordsEqual(w1Update.newEnd, w2Update.newStart)).to.be.true;
  });
});

describe('complex scenarios', () => {
  it('should handle a closed rectangle', () => {
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
    const walls = [
      createWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }, { direction: 'horizontal' }),
      createWall('w2', { x: 100, y: 0 }, { x: 100, y: 100 }, { direction: 'vertical' }),
    ];

    const graph = buildConnectionGraph(walls);

    // Moving the shared endpoint at (100, 0) to (150, 50)
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

    // w1 (horizontal direction) should still be horizontal
    expect(w1Update!.newStart.y).to.equal(w1Update!.newEnd.y);
    expect(w1Update!.newStart.y).to.equal(50);

    // w2 (vertical direction) should still be vertical
    expect(w2Update!.newEnd.x).to.equal(w2Update!.newStart.x);
    expect(w2Update!.newEnd.x).to.equal(150);
  });
});
