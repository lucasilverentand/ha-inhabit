import { expect } from "@open-wc/testing";
import type { MmwavePlacement } from "../types.js";
import {
  correctedRawTarget,
  filterJitter,
  rawTargetToWorld,
} from "./mmwave-calibration.js";

function placement(overrides: Partial<MmwavePlacement> = {}): MmwavePlacement {
  return {
    id: "p1",
    floor_plan_id: "fp1",
    floor_id: "floor1",
    position: { x: 250, y: 250 },
    angle: 0,
    field_of_view: 120,
    detection_range: 500,
    targets: [{ x_entity_id: "sensor.x", y_entity_id: "sensor.y" }],
    ...overrides,
  };
}

describe("mmWave calibration helpers", () => {
  it("subtracts raw calibration bias", () => {
    const p = placement({
      calibration: {
        enabled: true,
        target_index: 0,
        map_point: { x: 350, y: 300 },
        raw_mean: { x: 520, y: 1030 },
        raw_stddev: { x: 0, y: 0 },
        raw_bias: { x: 20, y: 30 },
        jitter_radius: 0,
        sample_count: 10,
      },
    });

    expect(correctedRawTarget(p, 520, 1030)).to.deep.equal({
      x: 500,
      y: 1000,
    });
  });

  it("maps corrected raw target positions to world coordinates", () => {
    const p = placement({
      calibration: {
        enabled: true,
        target_index: 0,
        map_point: { x: 350, y: 300 },
        raw_mean: { x: 520, y: 1030 },
        raw_stddev: { x: 0, y: 0 },
        raw_bias: { x: 20, y: 30 },
        jitter_radius: 0,
        sample_count: 10,
      },
    });

    const world = rawTargetToWorld(p, 520, 1030, "cm");

    expect(world.x).to.be.closeTo(350, 0.001);
    expect(world.y).to.be.closeTo(300, 0.001);
  });

  it("smooths movement inside the jitter radius", () => {
    const p = placement({
      calibration: {
        enabled: true,
        target_index: 0,
        map_point: { x: 350, y: 300 },
        raw_mean: { x: 0, y: 0 },
        raw_stddev: { x: 0, y: 0 },
        raw_bias: { x: 0, y: 0 },
        jitter_radius: 5,
        sample_count: 10,
      },
    });

    const filtered = filterJitter(p, { x: 350, y: 300 }, { x: 354, y: 300 });

    expect(filtered.x).to.be.closeTo(351, 0.001);
    expect(filtered.y).to.equal(300);
  });

  it("allows movement outside the jitter radius immediately", () => {
    const p = placement({
      calibration: {
        enabled: true,
        target_index: 0,
        map_point: { x: 350, y: 300 },
        raw_mean: { x: 0, y: 0 },
        raw_stddev: { x: 0, y: 0 },
        raw_bias: { x: 0, y: 0 },
        jitter_radius: 5,
        sample_count: 10,
      },
    });

    const filtered = filterJitter(p, { x: 350, y: 300 }, { x: 370, y: 300 });

    expect(filtered).to.deep.equal({ x: 370, y: 300 });
  });
});
