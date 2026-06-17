import { expect } from "@open-wc/testing";
import {
  activeTool,
  devicePanelTarget,
  mmwaveCalibrationTarget,
  occupancyPanelTarget,
  resetSignals,
  selection,
  setCanvasMode,
  simHitboxEnabled,
  simulatedTargets,
} from "./signals";

describe("canvas mode signal transitions", () => {
  beforeEach(() => {
    resetSignals();
  });

  it("clears placement state when leaving Devices mode", () => {
    activeTool.value = "mmwave";
    selection.value = { type: "mmwave", ids: ["m1"] };
    devicePanelTarget.value = { id: "m1", type: "mmwave" };
    mmwaveCalibrationTarget.value = { placementId: "m1", targetIndex: 0 };

    setCanvasMode("walls");

    expect(activeTool.value).to.equal("select");
    expect(selection.value).to.deep.equal({ type: "none", ids: [] });
    expect(devicePanelTarget.value).to.equal(null);
    expect(mmwaveCalibrationTarget.value).to.equal(null);
  });

  it("clears occupancy state when leaving Occupancy mode", () => {
    occupancyPanelTarget.value = { id: "room1", name: "Room 1", type: "room" };
    simulatedTargets.value = [
      {
        id: "t1",
        floor_plan_id: "fp1",
        floor_id: "floor1",
        position: { x: 1, y: 2 },
        region_id: null,
        region_name: null,
      },
    ];
    simHitboxEnabled.value = true;

    setCanvasMode("placement");

    expect(occupancyPanelTarget.value).to.equal(null);
    expect(simulatedTargets.value).to.deep.equal([]);
    expect(simHitboxEnabled.value).to.equal(false);
  });

  it("keeps mmWave config available in Occupancy mode", () => {
    devicePanelTarget.value = { id: "m1", type: "mmwave" };
    mmwaveCalibrationTarget.value = { placementId: "m1", targetIndex: 0 };

    setCanvasMode("occupancy");

    expect(devicePanelTarget.value).to.deep.equal({
      id: "m1",
      type: "mmwave",
    });
    expect(mmwaveCalibrationTarget.value).to.deep.equal({
      placementId: "m1",
      targetIndex: 0,
    });

    setCanvasMode("openings");

    expect(devicePanelTarget.value).to.equal(null);
    expect(mmwaveCalibrationTarget.value).to.equal(null);
  });
});
