import { expect } from "@open-wc/testing";
import {
  getCanvasModePolicy,
  getMapModeDefinition,
  getMapModeDefinitions,
  getModeTools,
  shouldShowLayer,
} from "./map-modes";

describe("map mode policy", () => {
  it("maps current canvas modes to task labels", () => {
    expect(getMapModeDefinition("viewing").label).to.equal("View");
    expect(getMapModeDefinition("walls").label).to.equal("Walls");
    expect(getMapModeDefinition("openings").label).to.equal("Doors & Windows");
    expect(getMapModeDefinition("furniture").label).to.equal("Zones");
    expect(getMapModeDefinition("placement").label).to.equal("Devices");
    expect(getMapModeDefinition("occupancy").label).to.equal("Occupancy");
  });

  it("presents editable layers in the expected order", () => {
    expect(
      getMapModeDefinitions().map((definition) => definition.label),
    ).to.deep.equal([
      "Walls",
      "Zones",
      "Doors & Windows",
      "Devices",
      "Occupancy",
    ]);
  });

  it("returns contextual tools by mode", () => {
    expect(getModeTools("walls")).to.deep.equal(["wall"]);
    expect(getModeTools("openings")).to.deep.equal(["opening"]);
    expect(getModeTools("furniture")).to.deep.equal(["zone"]);
    expect(getModeTools("placement")).to.deep.equal([
      "light",
      "switch",
      "button",
      "mmwave",
      "other",
    ]);
    expect(getModeTools("occupancy")).to.deep.equal([]);
  });

  it("keeps editing controls isolated to their owning layer", () => {
    const walls = getCanvasModePolicy("walls");
    expect(walls.showWallEditing).to.equal(true);
    expect(walls.showOpeningEditing).to.equal(false);
    expect(walls.showZoneEditing).to.equal(false);
    expect(walls.showNormalDevices).to.equal(false);

    const openings = getCanvasModePolicy("openings");
    expect(openings.showWallEditing).to.equal(false);
    expect(openings.showOpeningEditing).to.equal(true);
    expect(openings.showZoneEditing).to.equal(false);
    expect(openings.showNormalDevices).to.equal(false);

    const zones = getCanvasModePolicy("furniture");
    expect(zones.showWallEditing).to.equal(false);
    expect(zones.showOpeningEditing).to.equal(false);
    expect(zones.showZoneEditing).to.equal(true);

    const devices = getCanvasModePolicy("placement");
    expect(devices.showWallEditing).to.equal(false);
    expect(devices.showOpeningEditing).to.equal(false);
    expect(devices.showZoneEditing).to.equal(false);
    expect(devices.showNormalDevices).to.equal(true);
  });

  it("hides unrelated layers by default", () => {
    expect(shouldShowLayer("walls", "devices")).to.equal(false);
    expect(shouldShowLayer("placement", "devices")).to.equal(true);
    expect(shouldShowLayer("occupancy", "furniture")).to.equal(true);
    expect(shouldShowLayer("viewing", "furniture")).to.equal(false);
  });

  it("uses a focused calibration policy", () => {
    const policy = getCanvasModePolicy("placement", true);

    expect(policy.showNormalDevices).to.equal(false);
    expect(policy.showMmwave).to.equal(true);
    expect(policy.showMmwaveCoverage).to.equal(false);
    expect(policy.showWallEditing).to.equal(false);
    expect(policy.showOpeningEditing).to.equal(false);
    expect(shouldShowLayer("placement", "furniture", true)).to.equal(false);
  });
});
