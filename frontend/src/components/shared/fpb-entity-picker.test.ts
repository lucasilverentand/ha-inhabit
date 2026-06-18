import {
  expect,
  fixture,
  fixtureCleanup,
  html,
  nextFrame,
  oneEvent,
} from "@open-wc/testing";
import type { HassEntity, HomeAssistant } from "../../types.js";
import { resetEntityPickerRegistryCacheForTests } from "./entity-picker-registry-cache.js";
import "./fpb-entity-picker.js";
import type { FpbEntityPicker } from "./fpb-entity-picker.js";

function entity(
  entityId: string,
  friendlyName: string,
  attributes: Record<string, unknown> = {},
): HassEntity {
  return {
    entity_id: entityId,
    state: "off",
    attributes: { friendly_name: friendlyName, ...attributes },
    last_changed: "2026-06-18T00:00:00+00:00",
    last_updated: "2026-06-18T00:00:00+00:00",
  };
}

function hassWithStates(states: Record<string, HassEntity>): HomeAssistant {
  return {
    states,
    services: {},
    user: { id: "1", name: "Luca", is_admin: true },
    language: "en",
    auth: { data: { access_token: "token" } },
    callService: async () => undefined,
    callWS: async () => [] as never,
    connection: {
      subscribeEvents: async () => () => undefined,
      subscribeMessage: async () => () => undefined,
    },
  };
}

const nativeShowModal = HTMLDialogElement.prototype.showModal;
const nativeClose = HTMLDialogElement.prototype.close;
let showModalCalls = 0;

function installDialogStubs(): void {
  HTMLDialogElement.prototype.showModal = function showModalStub() {
    showModalCalls += 1;
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function closeStub() {
    this.removeAttribute("open");
  };
}

installDialogStubs();

describe("fpb-entity-picker", function () {
  this.timeout(20000);

  beforeEach(() => {
    resetEntityPickerRegistryCacheForTests();
    showModalCalls = 0;
    installDialogStubs();
  });

  afterEach(() => {
    fixtureCleanup();
  });

  after(() => {
    HTMLDialogElement.prototype.showModal = nativeShowModal;
    HTMLDialogElement.prototype.close = nativeClose;
  });

  it("opens as a native modal dialog so panel overflow cannot clip it", async () => {
    const el = await fixture<FpbEntityPicker>(html`
      <fpb-entity-picker
        .hass=${hassWithStates({
          "button.bathroom_override": entity(
            "button.bathroom_override",
            "Bathroom Override",
          ),
        })}
      ></fpb-entity-picker>
    `);

    await nextFrame();

    const dialog = el.shadowRoot?.querySelector("dialog.entity-picker-dialog");
    expect(dialog).to.exist;
    expect(showModalCalls).to.equal(1);
    expect(dialog?.open).to.equal(true);
    expect(el.shadowRoot?.querySelector(".overlay")).to.equal(null);

    el.remove();
  });

  it("closes when the native backdrop surface is clicked", async () => {
    const el = await fixture<FpbEntityPicker>(html`
      <fpb-entity-picker
        .hass=${hassWithStates({
          "button.bathroom_override": entity(
            "button.bathroom_override",
            "Bathroom Override",
          ),
        })}
      ></fpb-entity-picker>
    `);
    await nextFrame();
    const dialog = el.shadowRoot?.querySelector("dialog.entity-picker-dialog");
    expect(dialog?.open).to.equal(true);

    const closed = oneEvent(el, "picker-closed");
    dialog?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await closed;

    expect(dialog?.open).to.equal(false);
  });

  it("still emits the selected entity before closing", async () => {
    const el = await fixture<FpbEntityPicker>(html`
      <fpb-entity-picker
        .hass=${hassWithStates({
          "button.bathroom_override": entity(
            "button.bathroom_override",
            "Bathroom Override",
          ),
        })}
      ></fpb-entity-picker>
    `);
    await nextFrame();

    const selected = oneEvent(el, "entities-confirmed") as Promise<
      CustomEvent<{ entityIds: string[] }>
    >;
    el.shadowRoot?.querySelector<HTMLButtonElement>(".result-item")?.click();
    const event = await selected;

    expect(event.detail.entityIds).to.deep.equal(["button.bathroom_override"]);
  });

  it("supports caller filtering for legacy Hue action sensors", async () => {
    const el = await fixture<FpbEntityPicker>(html`
      <fpb-entity-picker
        .hass=${hassWithStates({
          "sensor.hue_button_action": entity(
            "sensor.hue_button_action",
            "Hue Button Action",
          ),
          "sensor.bathroom_temperature": entity(
            "sensor.bathroom_temperature",
            "Bathroom Temperature",
          ),
        })}
        .domains=${["sensor"]}
        .entityFilter=${(entityId: string) => entityId.endsWith("_action")}
      ></fpb-entity-picker>
    `);
    await nextFrame();

    const results = [
      ...el.shadowRoot!.querySelectorAll<HTMLElement>(".result-item .eid"),
    ].map((item) => item.textContent?.trim());

    expect(results).to.deep.equal(["sensor.hue_button_action"]);
  });
});
