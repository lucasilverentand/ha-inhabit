import { expect } from "@open-wc/testing";
import type { HassEntity } from "../../types.js";
import {
  isInhabitGeneratedEntity,
  isInhabitGeneratedUniqueId,
  isInhabitRegistryEntry,
} from "./entity-filter.js";

function entity(
  entityId: string,
  attributes: Record<string, unknown> = {},
): HassEntity {
  return {
    entity_id: entityId,
    state: "off",
    attributes,
    last_changed: "2026-06-03T00:00:00+00:00",
    last_updated: "2026-06-03T00:00:00+00:00",
  };
}

describe("Inhabit entity filtering", () => {
  it("identifies generated occupancy entity unique IDs", () => {
    expect(isInhabitGeneratedUniqueId("fp_kitchen_occupancy")).to.be.true;
    expect(isInhabitGeneratedUniqueId("fp_kitchen_occupancy_override")).to.be
      .true;
    expect(isInhabitGeneratedUniqueId("kitchen_occupancy")).to.be.false;
    expect(isInhabitGeneratedUniqueId("fp_kitchen_motion")).to.be.false;
  });

  it("identifies Inhabit registry entries by platform or generated unique ID", () => {
    expect(
      isInhabitRegistryEntry({
        entity_id: "binary_sensor.renamed",
        platform: "inhabit",
        unique_id: "custom_name",
      }),
    ).to.be.true;
    expect(
      isInhabitRegistryEntry({
        entity_id: "button.renamed",
        platform: "button",
        unique_id: "fp_kitchen_occupancy_override",
      }),
    ).to.be.true;
    expect(
      isInhabitRegistryEntry({
        entity_id: "binary_sensor.kitchen_motion",
        platform: "mqtt",
        unique_id: "kitchen_motion",
      }),
    ).to.be.false;
  });

  it("excludes generated entities using registry IDs or state unique ID fallback", () => {
    const integrationEntityIds = new Set(["binary_sensor.kitchen_occupancy"]);

    expect(
      isInhabitGeneratedEntity(
        "binary_sensor.kitchen_occupancy",
        entity("binary_sensor.kitchen_occupancy"),
        integrationEntityIds,
      ),
    ).to.be.true;
    expect(
      isInhabitGeneratedEntity(
        "button.kitchen_occupancy_override",
        entity("button.kitchen_occupancy_override", {
          unique_id: "fp_kitchen_occupancy_override",
        }),
        integrationEntityIds,
      ),
    ).to.be.true;
    expect(
      isInhabitGeneratedEntity(
        "binary_sensor.kitchen_motion",
        entity("binary_sensor.kitchen_motion"),
        integrationEntityIds,
      ),
    ).to.be.false;
  });
});
