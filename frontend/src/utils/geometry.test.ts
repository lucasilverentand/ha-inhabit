import { expect } from '@open-wc/testing';
import {
  distance,
  midpoint,
  snapToGrid,
  angleBetween,
  rotatePoint,
  getBoundingBox,
  pointInPolygon,
  pointNearLine,
  polygonCentroid,
  polygonArea,
  isClockwise,
  lineIntersection,
} from './geometry.js';
import type { Coordinates, Polygon } from '../types.js';

describe('distance', () => {
  it('should calculate distance between two points', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).to.equal(5);
    expect(distance({ x: 0, y: 0 }, { x: 0, y: 0 })).to.equal(0);
    expect(distance({ x: 1, y: 1 }, { x: 4, y: 5 })).to.equal(5);
  });

  it('should handle negative coordinates', () => {
    expect(distance({ x: -3, y: -4 }, { x: 0, y: 0 })).to.equal(5);
  });
});

describe('midpoint', () => {
  it('should calculate midpoint between two points', () => {
    const mid = midpoint({ x: 0, y: 0 }, { x: 10, y: 10 });
    expect(mid.x).to.equal(5);
    expect(mid.y).to.equal(5);
  });

  it('should handle same point', () => {
    const mid = midpoint({ x: 5, y: 5 }, { x: 5, y: 5 });
    expect(mid.x).to.equal(5);
    expect(mid.y).to.equal(5);
  });
});

describe('snapToGrid', () => {
  it('should snap point to grid', () => {
    const snapped = snapToGrid({ x: 12, y: 18 }, 10);
    expect(snapped.x).to.equal(10);
    expect(snapped.y).to.equal(20);
  });

  it('should handle points already on grid', () => {
    const snapped = snapToGrid({ x: 10, y: 20 }, 10);
    expect(snapped.x).to.equal(10);
    expect(snapped.y).to.equal(20);
  });

  it('should work with different grid sizes', () => {
    const snapped = snapToGrid({ x: 7, y: 13 }, 5);
    expect(snapped.x).to.equal(5);
    expect(snapped.y).to.equal(15);
  });
});

describe('angleBetween', () => {
  it('should calculate angle in degrees', () => {
    // Horizontal right
    expect(angleBetween({ x: 0, y: 0 }, { x: 1, y: 0 })).to.equal(0);
    // Straight up (negative Y in screen coords)
    expect(angleBetween({ x: 0, y: 0 }, { x: 0, y: -1 })).to.equal(-90);
    // Straight down
    expect(angleBetween({ x: 0, y: 0 }, { x: 0, y: 1 })).to.equal(90);
    // Horizontal left
    expect(angleBetween({ x: 0, y: 0 }, { x: -1, y: 0 })).to.be.closeTo(180, 0.01);
  });

  it('should calculate 45 degree angles', () => {
    expect(angleBetween({ x: 0, y: 0 }, { x: 1, y: 1 })).to.equal(45);
    expect(angleBetween({ x: 0, y: 0 }, { x: -1, y: -1 })).to.equal(-135);
  });
});

describe('rotatePoint', () => {
  it('should rotate point around origin', () => {
    const rotated = rotatePoint({ x: 1, y: 0 }, { x: 0, y: 0 }, 90);
    expect(rotated.x).to.be.closeTo(0, 0.0001);
    expect(rotated.y).to.be.closeTo(1, 0.0001);
  });

  it('should rotate point around custom origin', () => {
    const rotated = rotatePoint({ x: 2, y: 1 }, { x: 1, y: 1 }, 90);
    expect(rotated.x).to.be.closeTo(1, 0.0001);
    expect(rotated.y).to.be.closeTo(2, 0.0001);
  });

  it('should handle 180 degree rotation', () => {
    const rotated = rotatePoint({ x: 1, y: 0 }, { x: 0, y: 0 }, 180);
    expect(rotated.x).to.be.closeTo(-1, 0.0001);
    expect(rotated.y).to.be.closeTo(0, 0.0001);
  });
});

describe('getBoundingBox', () => {
  it('should calculate bounding box', () => {
    const points: Coordinates[] = [
      { x: 0, y: 0 },
      { x: 10, y: 5 },
      { x: 5, y: 10 },
    ];
    const box = getBoundingBox(points);

    expect(box).to.not.be.null;
    expect(box!.min_x).to.equal(0);
    expect(box!.min_y).to.equal(0);
    expect(box!.max_x).to.equal(10);
    expect(box!.max_y).to.equal(10);
  });

  it('should return null for empty array', () => {
    expect(getBoundingBox([])).to.be.null;
  });

  it('should handle single point', () => {
    const box = getBoundingBox([{ x: 5, y: 5 }]);
    expect(box!.min_x).to.equal(5);
    expect(box!.max_x).to.equal(5);
  });
});

describe('pointInPolygon', () => {
  const square: Polygon = {
    vertices: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ],
  };

  it('should detect point inside polygon', () => {
    expect(pointInPolygon({ x: 5, y: 5 }, square)).to.be.true;
    expect(pointInPolygon({ x: 1, y: 1 }, square)).to.be.true;
  });

  it('should detect point outside polygon', () => {
    expect(pointInPolygon({ x: 15, y: 5 }, square)).to.be.false;
    expect(pointInPolygon({ x: -5, y: 5 }, square)).to.be.false;
  });

  it('should handle concave polygon', () => {
    const lShape: Polygon = {
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 5 },
        { x: 5, y: 5 },
        { x: 5, y: 10 },
        { x: 0, y: 10 },
      ],
    };

    expect(pointInPolygon({ x: 2, y: 2 }, lShape)).to.be.true;
    expect(pointInPolygon({ x: 7, y: 7 }, lShape)).to.be.false; // In the cutout
  });

  it('should return false for degenerate polygon', () => {
    expect(pointInPolygon({ x: 0, y: 0 }, { vertices: [] })).to.be.false;
    expect(pointInPolygon({ x: 0, y: 0 }, { vertices: [{ x: 0, y: 0 }] })).to.be.false;
  });
});

describe('pointNearLine', () => {
  it('should detect point near line segment', () => {
    expect(pointNearLine({ x: 5, y: 1 }, { x: 0, y: 0 }, { x: 10, y: 0 }, 2)).to.be.true;
    expect(pointNearLine({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 }, 2)).to.be.false;
  });

  it('should handle point at endpoint', () => {
    expect(pointNearLine({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 }, 1)).to.be.true;
    expect(pointNearLine({ x: 10, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 }, 1)).to.be.true;
  });

  it('should handle point beyond segment', () => {
    // Point is on the line extended, but beyond the segment
    expect(pointNearLine({ x: 15, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 }, 1)).to.be.false;
  });
});

describe('polygonCentroid', () => {
  it('should calculate centroid of square', () => {
    const square: Polygon = {
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
    };

    const center = polygonCentroid(square);
    expect(center!.x).to.equal(5);
    expect(center!.y).to.equal(5);
  });

  it('should return null for empty polygon', () => {
    expect(polygonCentroid({ vertices: [] })).to.be.null;
  });
});

describe('polygonArea', () => {
  it('should calculate area of square', () => {
    const square: Polygon = {
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
    };

    expect(Math.abs(polygonArea(square))).to.equal(100);
  });

  it('should return 0 for degenerate polygon', () => {
    expect(polygonArea({ vertices: [] })).to.equal(0);
    expect(polygonArea({ vertices: [{ x: 0, y: 0 }] })).to.equal(0);
  });
});

describe('isClockwise', () => {
  it('should detect clockwise polygon', () => {
    const clockwise: Polygon = {
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
    };
    expect(isClockwise(clockwise)).to.be.true;
  });

  it('should detect counter-clockwise polygon', () => {
    const ccw: Polygon = {
      vertices: [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
        { x: 10, y: 10 },
        { x: 10, y: 0 },
      ],
    };
    expect(isClockwise(ccw)).to.be.false;
  });
});

describe('lineIntersection', () => {
  it('should find intersection of crossing lines', () => {
    const intersection = lineIntersection(
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 10, y: 0 }
    );

    expect(intersection).to.not.be.null;
    expect(intersection!.x).to.be.closeTo(5, 0.01);
    expect(intersection!.y).to.be.closeTo(5, 0.01);
  });

  it('should return null for parallel lines', () => {
    const intersection = lineIntersection(
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 5 },
      { x: 10, y: 5 }
    );

    expect(intersection).to.be.null;
  });

  it('should return null for non-intersecting segments', () => {
    const intersection = lineIntersection(
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
      { x: 15, y: 0 }
    );

    expect(intersection).to.be.null;
  });
});
