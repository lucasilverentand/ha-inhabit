import { expect } from "@open-wc/testing";
import type {
  ButtonPlacement,
  LightPlacement,
  OtherPlacement,
  SwitchPlacement,
} from "../types";
import {
  getPlacedDeviceEntityIds,
  isDeviceEntityAlreadyPlaced,
} from "./device-placements";

function placement<T extends { id: string; entity_id: string }>(
  id: string,
  entityId: string,
): T {
  return {
    id,
    entity_id: entityId,
    floor_id: "floor_1",
    position: { x: 0, y: 0 },
  } as T;
}

describe("device placement entity helpers", () => {
  const groups = {
    lights: [placement<LightPlacement>("light_1", "light.lamp")],
    switches: [placement<SwitchPlacement>("switch_1", "switch.fan")],
    buttons: [placement<ButtonPlacement>("button_1", "button.scene")],
    others: [placement<OtherPlacement>("other_1", "sensor.power")],
  };

  it("collects placed entity ids across normal device types", () => {
    expect(getPlacedDeviceEntityIds(groups)).to.deep.equal([
      "light.lamp",
      "switch.fan",
      "button.scene",
      "sensor.power",
    ]);
  });

  it("can exclude the placement currently being edited", () => {
    expect(getPlacedDeviceEntityIds(groups, "switch_1")).to.deep.equal([
      "light.lamp",
      "button.scene",
      "sensor.power",
    ]);
  });

  it("checks duplicates across placement types", () => {
    expect(isDeviceEntityAlreadyPlaced(groups, "sensor.power")).to.equal(true);
    expect(
      isDeviceEntityAlreadyPlaced(groups, "sensor.power", "other_1"),
    ).to.equal(false);
  });
});
