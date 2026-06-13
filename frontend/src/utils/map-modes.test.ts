import { expect } from "@open-wc/testing";
import {
  getCanvasModePolicy,
  getMapModeDefinition,
  getModeTools,
  shouldShowLayer,
} from "./map-modes";

describe("map mode policy", () => {
  it("maps current canvas modes to task labels", () => {
    expect(getMapModeDefinition("viewing").label).to.equal("View");
    expect(getMapModeDefinition("walls").label).to.equal("Build");
    expect(getMapModeDefinition("furniture").label).to.equal("Zones");
    expect(getMapModeDefinition("placement").label).to.equal("Devices");
    expect(getMapModeDefinition("occupancy").label).to.equal("Occupancy");
  });

  it("returns contextual tools by mode", () => {
    expect(getModeTools("walls")).to.deep.equal(["wall", "door", "window"]);
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
    expect(shouldShowLayer("placement", "furniture", true)).to.equal(false);
  });
});
