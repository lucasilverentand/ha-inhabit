import { expect } from "@open-wc/testing";
import type { HassEntity, MmwavePlacement } from "../types";
import {
  getMmwavePlacementIssues,
  getNormalDeviceIssues,
} from "./device-issues";

function entity(entityId: string, state: string): HassEntity {
  return {
    entity_id: entityId,
    state,
    attributes: {},
    last_changed: "2026-01-01T00:00:00Z",
    last_updated: "2026-01-01T00:00:00Z",
  };
}

function mmwave(targets: MmwavePlacement["targets"]): MmwavePlacement {
  return {
    id: "m1",
    floor_plan_id: "fp1",
    floor_id: "f1",
    position: { x: 0, y: 0 },
    angle: 0,
    field_of_view: 120,
    detection_range: 500,
    targets,
  };
}

describe("device issue detection", () => {
  it("warns for normal devices whose entity no longer exists", () => {
    const issues = getNormalDeviceIssues({ entity_id: "light.missing" }, {});

    expect(issues).to.have.length(1);
    expect(issues[0].code).to.equal("entity_missing");
  });

  it("warns for unknown and unavailable normal device states", () => {
    expect(
      getNormalDeviceIssues(
        { entity_id: "switch.one" },
        { "switch.one": entity("switch.one", "unknown") },
      )[0].code,
    ).to.equal("entity_unknown");
    expect(
      getNormalDeviceIssues(
        { entity_id: "switch.one" },
        { "switch.one": entity("switch.one", "unavailable") },
      )[0].code,
    ).to.equal("entity_unavailable");
  });

  it("does not warn for healthy normal devices", () => {
    const issues = getNormalDeviceIssues(
      { entity_id: "light.good" },
      { "light.good": entity("light.good", "on") },
    );

    expect(issues).to.deep.equal([]);
  });

  it("warns for incomplete mmWave target bindings", () => {
    const issues = getMmwavePlacementIssues(
      mmwave([{ x_entity_id: "", y_entity_id: "sensor.y" }]),
      { "sensor.y": entity("sensor.y", "12") },
    );

    expect(issues.map((found) => found.code)).to.include("mmwave_missing_x");
  });

  it("warns for missing, unavailable, and nonnumeric mmWave target entities", () => {
    const issues = getMmwavePlacementIssues(
      mmwave([
        { x_entity_id: "sensor.x", y_entity_id: "sensor.y" },
        { x_entity_id: "sensor.bad", y_entity_id: "sensor.missing" },
      ]),
      {
        "sensor.x": entity("sensor.x", "unavailable"),
        "sensor.y": entity("sensor.y", "42"),
        "sensor.bad": entity("sensor.bad", "not-a-number"),
      },
    );

    expect(issues.map((found) => found.code)).to.include.members([
      "mmwave_x_entity_unavailable",
      "mmwave_x_nonnumeric",
      "mmwave_y_entity_missing",
    ]);
  });
});
