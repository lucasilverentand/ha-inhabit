/**
 * SVG utility functions
 */

import type { Coordinates, Polygon, ViewBox } from "../types";

/**
 * Convert a polygon to SVG path data
 */
export function polygonToPath(polygon: Polygon): string {
  const vertices = polygon.vertices;
  if (vertices.length === 0) return "";

  const parts = vertices.map((v, i) => {
    const cmd = i === 0 ? "M" : "L";
    return `${cmd}${v.x},${v.y}`;
  });

  return parts.join(" ") + " Z";
}

/**
 * Convert a polyline to SVG path data
 */
export function polylineToPath(points: Coordinates[]): string {
  if (points.length === 0) return "";

  const parts = points.map((p, i) => {
    const cmd = i === 0 ? "M" : "L";
    return `${cmd}${p.x},${p.y}`;
  });

  return parts.join(" ");
}

/**
 * Create SVG arc path for a sector (cone coverage)
 */
export function sectorPath(
  center: Coordinates,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = center.x + radius * Math.cos(startRad);
  const y1 = center.y + radius * Math.sin(startRad);
  const x2 = center.x + radius * Math.cos(endRad);
  const y2 = center.y + radius * Math.sin(endRad);

  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  const sweep = endAngle > startAngle ? 1 : 0;

  return `M${center.x},${center.y} L${x1},${y1} A${radius},${radius} 0 ${largeArc},${sweep} ${x2},${y2} Z`;
}

/**
 * Create SVG circle path
 */
export function circlePath(center: Coordinates, radius: number): string {
  return `M${center.x - radius},${center.y}
          a${radius},${radius} 0 1,0 ${radius * 2},0
          a${radius},${radius} 0 1,0 ${-radius * 2},0`;
}

/**
 * Create SVG rectangle path
 */
export function rectPath(
  x: number,
  y: number,
  width: number,
  height: number
): string {
  return `M${x},${y} h${width} v${height} h${-width} Z`;
}

/**
 * Create SVG rounded rectangle path
 */
export function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): string {
  const r = Math.min(radius, width / 2, height / 2);
  return `M${x + r},${y}
          h${width - 2 * r}
          a${r},${r} 0 0 1 ${r},${r}
          v${height - 2 * r}
          a${r},${r} 0 0 1 ${-r},${r}
          h${-(width - 2 * r)}
          a${r},${r} 0 0 1 ${-r},${-r}
          v${-(height - 2 * r)}
          a${r},${r} 0 0 1 ${r},${-r}
          Z`;
}

/**
 * Create SVG ellipse path
 */
export function ellipsePath(
  center: Coordinates,
  rx: number,
  ry: number
): string {
  return `M${center.x - rx},${center.y}
          a${rx},${ry} 0 1,0 ${rx * 2},0
          a${rx},${ry} 0 1,0 ${-rx * 2},0`;
}

/**
 * Create door swing arc path
 */
export function doorSwingPath(
  hingePoint: Coordinates,
  doorWidth: number,
  direction: "left" | "right",
  angle: number = 90
): string {
  const startAngle = direction === "left" ? 0 : 180 - angle;
  const endAngle = direction === "left" ? angle : 180;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = hingePoint.x + doorWidth * Math.cos(startRad);
  const y1 = hingePoint.y + doorWidth * Math.sin(startRad);
  const x2 = hingePoint.x + doorWidth * Math.cos(endRad);
  const y2 = hingePoint.y + doorWidth * Math.sin(endRad);

  const largeArc = angle > 180 ? 1 : 0;
  const sweep = direction === "left" ? 1 : 0;

  return `M${hingePoint.x},${hingePoint.y} L${x1},${y1} A${doorWidth},${doorWidth} 0 ${largeArc},${sweep} ${x2},${y2} Z`;
}

/**
 * Create wall path with thickness (for single walls)
 */
export function wallPath(
  start: Coordinates,
  end: Coordinates,
  thickness: number
): string {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len === 0) return "";

  // Perpendicular offset
  const nx = (-dy / len) * (thickness / 2);
  const ny = (dx / len) * (thickness / 2);

  return `M${start.x + nx},${start.y + ny}
          L${end.x + nx},${end.y + ny}
          L${end.x - nx},${end.y - ny}
          L${start.x - nx},${start.y - ny}
          Z`;
}

/**
 * Group walls into connected chains
 */
export function groupWallsIntoChains(
  walls: Array<{ id: string; start: Coordinates; end: Coordinates; thickness: number }>
): Array<Array<{ id: string; start: Coordinates; end: Coordinates; thickness: number }>> {
  if (walls.length === 0) return [];

  const used = new Set<string>();
  const chains: Array<Array<typeof walls[0]>> = [];
  const tolerance = 1; // Connection tolerance

  const pointsMatch = (p1: Coordinates, p2: Coordinates): boolean => {
    return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
  };

  for (const startWall of walls) {
    if (used.has(startWall.id)) continue;

    const chain: typeof walls = [startWall];
    used.add(startWall.id);

    // Extend forward from end
    let currentEnd = startWall.end;
    let found = true;
    while (found) {
      found = false;
      for (const wall of walls) {
        if (used.has(wall.id)) continue;
        if (pointsMatch(wall.start, currentEnd)) {
          chain.push(wall);
          used.add(wall.id);
          currentEnd = wall.end;
          found = true;
          break;
        } else if (pointsMatch(wall.end, currentEnd)) {
          // Reverse the wall
          chain.push({ ...wall, start: wall.end, end: wall.start });
          used.add(wall.id);
          currentEnd = wall.start;
          found = true;
          break;
        }
      }
    }

    // Extend backward from start
    let currentStart = startWall.start;
    found = true;
    while (found) {
      found = false;
      for (const wall of walls) {
        if (used.has(wall.id)) continue;
        if (pointsMatch(wall.end, currentStart)) {
          chain.unshift(wall);
          used.add(wall.id);
          currentStart = wall.start;
          found = true;
          break;
        } else if (pointsMatch(wall.start, currentStart)) {
          // Reverse the wall
          chain.unshift({ ...wall, start: wall.end, end: wall.start });
          used.add(wall.id);
          currentStart = wall.end;
          found = true;
          break;
        }
      }
    }

    chains.push(chain);
  }

  return chains;
}

/**
 * Create a wall chain path with proper miter joints at corners
 */
export function wallChainPath(
  chain: Array<{ start: Coordinates; end: Coordinates; thickness: number }>
): string {
  if (chain.length === 0) return "";

  const thickness = chain[0].thickness;
  const halfThick = thickness / 2;

  // Build list of vertices along the centerline
  const centerline: Coordinates[] = [chain[0].start];
  for (const wall of chain) {
    centerline.push(wall.end);
  }

  // Check if it's a closed loop
  const isClosed = centerline.length > 2 &&
    Math.abs(centerline[0].x - centerline[centerline.length - 1].x) < 1 &&
    Math.abs(centerline[0].y - centerline[centerline.length - 1].y) < 1;

  // Calculate offset points on both sides
  const leftPoints: Coordinates[] = [];
  const rightPoints: Coordinates[] = [];

  for (let i = 0; i < centerline.length; i++) {
    const curr = centerline[i];

    // Get directions to prev and next points
    let prevDir: Coordinates | null = null;
    let nextDir: Coordinates | null = null;

    if (i > 0 || isClosed) {
      const prevIdx = i > 0 ? i - 1 : centerline.length - 2;
      const prev = centerline[prevIdx];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        prevDir = { x: dx / len, y: dy / len };
      }
    }

    if (i < centerline.length - 1 || isClosed) {
      const nextIdx = i < centerline.length - 1 ? i + 1 : 1;
      const next = centerline[nextIdx];
      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        nextDir = { x: dx / len, y: dy / len };
      }
    }

    // Calculate the offset direction (bisector of the angle)
    let offsetDir: Coordinates;

    if (prevDir && nextDir) {
      // Average the perpendiculars to get the miter direction
      const prevPerp = { x: -prevDir.y, y: prevDir.x };
      const nextPerp = { x: -nextDir.y, y: nextDir.x };

      // Bisector
      const bisX = prevPerp.x + nextPerp.x;
      const bisY = prevPerp.y + nextPerp.y;
      const bisLen = Math.sqrt(bisX * bisX + bisY * bisY);

      if (bisLen < 0.01) {
        // Parallel lines, just use perpendicular
        offsetDir = prevPerp;
      } else {
        offsetDir = { x: bisX / bisLen, y: bisY / bisLen };

        // Scale to maintain wall thickness at the miter
        // The miter length = thickness / (2 * cos(angle/2))
        const dot = prevPerp.x * offsetDir.x + prevPerp.y * offsetDir.y;
        if (Math.abs(dot) > 0.1) {
          const scale = 1 / dot;
          // Limit miter extension to avoid very long points
          const limitedScale = Math.min(Math.abs(scale), 3) * Math.sign(scale);
          offsetDir = { x: offsetDir.x * limitedScale, y: offsetDir.y * limitedScale };
        }
      }
    } else if (prevDir) {
      offsetDir = { x: -prevDir.y, y: prevDir.x };
    } else if (nextDir) {
      offsetDir = { x: -nextDir.y, y: nextDir.x };
    } else {
      offsetDir = { x: 1, y: 0 };
    }

    leftPoints.push({
      x: curr.x + offsetDir.x * halfThick,
      y: curr.y + offsetDir.y * halfThick,
    });
    rightPoints.push({
      x: curr.x - offsetDir.x * halfThick,
      y: curr.y - offsetDir.y * halfThick,
    });
  }

  // Build path: left side forward, then right side backward
  let path = `M${leftPoints[0].x},${leftPoints[0].y}`;
  for (let i = 1; i < leftPoints.length; i++) {
    path += ` L${leftPoints[i].x},${leftPoints[i].y}`;
  }

  // If not closed, connect to right side
  if (!isClosed) {
    for (let i = rightPoints.length - 1; i >= 0; i--) {
      path += ` L${rightPoints[i].x},${rightPoints[i].y}`;
    }
  } else {
    // For closed paths, we need to handle differently
    path += ` L${rightPoints[rightPoints.length - 1].x},${rightPoints[rightPoints.length - 1].y}`;
    for (let i = rightPoints.length - 2; i >= 0; i--) {
      path += ` L${rightPoints[i].x},${rightPoints[i].y}`;
    }
  }

  path += " Z";
  return path;
}

/**
 * Calculate viewBox string from ViewBox object
 */
export function viewBoxToString(vb: ViewBox): string {
  return `${vb.x} ${vb.y} ${vb.width} ${vb.height}`;
}

/**
 * Calculate screen point to SVG point transformation
 */
export function screenToSvg(
  screenPoint: Coordinates,
  svgElement: SVGSVGElement,
  viewBox: ViewBox
): Coordinates {
  const rect = svgElement.getBoundingClientRect();
  const scaleX = viewBox.width / rect.width;
  const scaleY = viewBox.height / rect.height;

  return {
    x: viewBox.x + (screenPoint.x - rect.left) * scaleX,
    y: viewBox.y + (screenPoint.y - rect.top) * scaleY,
  };
}

/**
 * Calculate SVG point to screen point transformation
 */
export function svgToScreen(
  svgPoint: Coordinates,
  svgElement: SVGSVGElement,
  viewBox: ViewBox
): Coordinates {
  const rect = svgElement.getBoundingClientRect();
  const scaleX = rect.width / viewBox.width;
  const scaleY = rect.height / viewBox.height;

  return {
    x: rect.left + (svgPoint.x - viewBox.x) * scaleX,
    y: rect.top + (svgPoint.y - viewBox.y) * scaleY,
  };
}

/**
 * Create grid pattern SVG element
 */
export function createGridPattern(
  gridSize: number,
  color: string = "#e0e0e0"
): string {
  return `
    <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="${color}" stroke-width="0.5"/>
    </pattern>
  `;
}

/**
 * Create major/minor grid pattern
 */
export function createGridPatternMajorMinor(
  gridSize: number,
  majorGridSize: number,
  minorColor: string = "#f0f0f0",
  majorColor: string = "#d0d0d0"
): string {
  return `
    <pattern id="minor-grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="${minorColor}" stroke-width="0.5"/>
    </pattern>
    <pattern id="major-grid" width="${majorGridSize}" height="${majorGridSize}" patternUnits="userSpaceOnUse">
      <rect width="${majorGridSize}" height="${majorGridSize}" fill="url(#minor-grid)"/>
      <path d="M ${majorGridSize} 0 L 0 0 0 ${majorGridSize}" fill="none" stroke="${majorColor}" stroke-width="1"/>
    </pattern>
  `;
}
