/**
 * Geometry utility functions
 */

import type { Coordinates, BoundingBox, Polygon } from "../types";

/**
 * Calculate distance between two points
 */
export function distance(p1: Coordinates, p2: Coordinates): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate midpoint between two points
 */
export function midpoint(p1: Coordinates, p2: Coordinates): Coordinates {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Snap a point to a grid
 */
export function snapToGrid(point: Coordinates, gridSize: number): Coordinates {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

/**
 * Calculate angle between two points in degrees
 */
export function angleBetween(p1: Coordinates, p2: Coordinates): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/**
 * Rotate a point around an origin
 */
export function rotatePoint(
  point: Coordinates,
  origin: Coordinates,
  angleDegrees: number
): Coordinates {
  const angleRad = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const dx = point.x - origin.x;
  const dy = point.y - origin.y;

  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
}

/**
 * Calculate bounding box for a set of points
 */
export function getBoundingBox(points: Coordinates[]): BoundingBox | null {
  if (points.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  return { min_x: minX, min_y: minY, max_x: maxX, max_y: maxY };
}

/**
 * Check if a point is inside a polygon using ray casting
 */
export function pointInPolygon(point: Coordinates, polygon: Polygon): boolean {
  const vertices = polygon.vertices;
  if (vertices.length < 3) return false;

  let inside = false;
  const n = vertices.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const vi = vertices[i];
    const vj = vertices[j];

    if (
      vi.y > point.y !== vj.y > point.y &&
      point.x < ((vj.x - vi.x) * (point.y - vi.y)) / (vj.y - vi.y) + vi.x
    ) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a point is near a line segment
 */
export function pointNearLine(
  point: Coordinates,
  lineStart: Coordinates,
  lineEnd: Coordinates,
  threshold: number
): boolean {
  const lineLength = distance(lineStart, lineEnd);
  if (lineLength === 0) return distance(point, lineStart) <= threshold;

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - lineStart.x) * (lineEnd.x - lineStart.x) +
        (point.y - lineStart.y) * (lineEnd.y - lineStart.y)) /
        (lineLength * lineLength)
    )
  );

  const projection: Coordinates = {
    x: lineStart.x + t * (lineEnd.x - lineStart.x),
    y: lineStart.y + t * (lineEnd.y - lineStart.y),
  };

  return distance(point, projection) <= threshold;
}

/**
 * Calculate polygon centroid
 */
export function polygonCentroid(polygon: Polygon): Coordinates | null {
  const vertices = polygon.vertices;
  if (vertices.length === 0) return null;

  let cx = 0;
  let cy = 0;

  for (const v of vertices) {
    cx += v.x;
    cy += v.y;
  }

  return {
    x: cx / vertices.length,
    y: cy / vertices.length,
  };
}

/**
 * Calculate polygon area (signed, positive for clockwise)
 */
export function polygonArea(polygon: Polygon): number {
  const vertices = polygon.vertices;
  if (vertices.length < 3) return 0;

  let area = 0;
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }

  return area / 2;
}

/**
 * Check if polygon vertices are in clockwise order
 */
export function isClockwise(polygon: Polygon): boolean {
  return polygonArea(polygon) > 0;
}

/**
 * Ensure polygon vertices are in clockwise order
 */
export function ensureClockwise(polygon: Polygon): Polygon {
  if (isClockwise(polygon)) return polygon;
  return { vertices: [...polygon.vertices].reverse() };
}

/**
 * Find the intersection point of two line segments
 */
export function lineIntersection(
  p1: Coordinates,
  p2: Coordinates,
  p3: Coordinates,
  p4: Coordinates
): Coordinates | null {
  const d1x = p2.x - p1.x;
  const d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x;
  const d2y = p4.y - p3.y;

  const cross = d1x * d2y - d1y * d2x;
  if (Math.abs(cross) < 1e-10) return null; // Parallel lines

  const dx = p3.x - p1.x;
  const dy = p3.y - p1.y;

  const t = (dx * d2y - dy * d2x) / cross;
  const u = (dx * d1y - dy * d1x) / cross;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p1.x + t * d1x,
      y: p1.y + t * d1y,
    };
  }

  return null;
}

/**
 * Offset a polygon by a given distance (simple approach)
 */
export function offsetPolygon(polygon: Polygon, offset: number): Polygon {
  const vertices = polygon.vertices;
  if (vertices.length < 3) return polygon;

  const newVertices: Coordinates[] = [];
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const prev = vertices[(i - 1 + n) % n];
    const curr = vertices[i];
    const next = vertices[(i + 1) % n];

    // Calculate edge normals
    const e1x = curr.x - prev.x;
    const e1y = curr.y - prev.y;
    const e2x = next.x - curr.x;
    const e2y = next.y - curr.y;

    const len1 = Math.sqrt(e1x * e1x + e1y * e1y);
    const len2 = Math.sqrt(e2x * e2x + e2y * e2y);

    if (len1 === 0 || len2 === 0) {
      newVertices.push(curr);
      continue;
    }

    // Normalized normals (perpendicular to edges)
    const n1x = -e1y / len1;
    const n1y = e1x / len1;
    const n2x = -e2y / len2;
    const n2y = e2x / len2;

    // Average normal
    const nx = (n1x + n2x) / 2;
    const ny = (n1y + n2y) / 2;
    const nLen = Math.sqrt(nx * nx + ny * ny);

    if (nLen === 0) {
      newVertices.push(curr);
      continue;
    }

    // Scale offset to account for angle
    const scale = offset / nLen;

    newVertices.push({
      x: curr.x + nx * scale,
      y: curr.y + ny * scale,
    });
  }

  return { vertices: newVertices };
}
