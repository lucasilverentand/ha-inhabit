import type { Coordinates, FloorPlan, MmwavePlacement } from "../types";

export type FloorPlanUnit = FloorPlan["unit"];

export function mmToUnitScale(unit: FloorPlanUnit = "cm"): number {
  switch (unit) {
    case "m":
      return 0.001;
    case "in":
      return 1 / 25.4;
    case "ft":
      return 1 / 304.8;
    default:
      return 0.1;
  }
}

export function correctedRawTarget(
  placement: MmwavePlacement,
  rawX: number,
  rawY: number,
): Coordinates {
  const calibration = placement.calibration;
  if (!calibration?.enabled) {
    return { x: rawX, y: rawY };
  }

  return {
    x: rawX - calibration.raw_bias.x,
    y: rawY - calibration.raw_bias.y,
  };
}

export function rawTargetToWorld(
  placement: MmwavePlacement,
  rawX: number,
  rawY: number,
  unit: FloorPlanUnit = "cm",
): Coordinates {
  const corrected = correctedRawTarget(placement, rawX, rawY);
  const scale = mmToUnitScale(unit);
  const localX = corrected.x * scale;
  const localY = corrected.y * scale;
  const rad = (placement.angle * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  return {
    x: placement.position.x + localY * cosA - localX * sinA,
    y: placement.position.y + localY * sinA + localX * cosA,
  };
}

export function filterJitter(
  placement: MmwavePlacement,
  previous: Coordinates | undefined,
  next: Coordinates,
): Coordinates {
  const jitterRadius = placement.calibration?.enabled
    ? placement.calibration.jitter_radius
    : 0;
  if (!previous || !jitterRadius || jitterRadius <= 0) {
    return next;
  }

  const dx = next.x - previous.x;
  const dy = next.y - previous.y;
  if (Math.hypot(dx, dy) > jitterRadius) {
    return next;
  }

  const alpha = 0.25;
  return {
    x: previous.x + dx * alpha,
    y: previous.y + dy * alpha,
  };
}
