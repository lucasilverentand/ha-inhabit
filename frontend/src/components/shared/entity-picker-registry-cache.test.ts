import { expect } from "@open-wc/testing";
import type { HomeAssistant } from "../../types";
import {
  getCachedIntegrationEntityIds,
  loadIntegrationEntityIds,
  resetEntityPickerRegistryCacheForTests,
} from "./entity-picker-registry-cache";

function hass(callWS: HomeAssistant["callWS"]): HomeAssistant {
  return {
    states: {},
    services: {},
    user: { id: "u1", name: "Admin", is_admin: true },
    language: "en",
    auth: { data: { access_token: "token" } },
    callService: async () => {},
    callWS,
    connection: {
      subscribeEvents: async () => () => {},
      subscribeMessage: async () => () => {},
    },
  };
}

describe("entity picker registry cache", () => {
  beforeEach(() => {
    resetEntityPickerRegistryCacheForTests();
  });

  it("loads the registry once and reuses cached Inhabit entity IDs", async () => {
    let callCount = 0;
    const callWS: HomeAssistant["callWS"] = async <T>() => {
      callCount += 1;
      return [
        {
          entity_id: "binary_sensor.room_1",
          unique_id: "fp_room_1_occupancy",
          platform: "inhabit",
        },
        {
          entity_id: "light.kitchen",
          unique_id: "light_1",
          platform: "demo",
        },
      ] as T;
    };

    const first = await loadIntegrationEntityIds(hass(callWS));
    const second = await loadIntegrationEntityIds(hass(callWS));

    expect([...first]).to.deep.equal(["binary_sensor.room_1"]);
    expect(second).to.equal(first);
    expect(getCachedIntegrationEntityIds()).to.equal(first);
    expect(callCount).to.equal(1);
  });

  it("retries after a failed registry load", async () => {
    let callCount = 0;
    const callWS: HomeAssistant["callWS"] = async <T>() => {
      callCount += 1;
      if (callCount === 1) throw new Error("temporary failure");
      return [] as T;
    };

    try {
      await loadIntegrationEntityIds(hass(callWS));
      throw new Error("expected first load to fail");
    } catch (err) {
      expect((err as Error).message).to.equal("temporary failure");
    }

    const ids = await loadIntegrationEntityIds(hass(callWS));

    expect([...ids]).to.deep.equal([]);
    expect(callCount).to.equal(2);
  });
});
