import { expect } from "@open-wc/testing";
import { getDirectToolbarActionLimit } from "./toolbar-overflow";

describe("toolbar action overflow", () => {
  it("keeps all actions direct when the toolbar has enough room", () => {
    expect(getDirectToolbarActionLimit(900, 7)).to.equal(7);
    expect(getDirectToolbarActionLimit(620, 7)).to.equal(7);
  });

  it("collapses actions progressively as the toolbar narrows", () => {
    expect(getDirectToolbarActionLimit(560, 7)).to.equal(5);
    expect(getDirectToolbarActionLimit(460, 7)).to.equal(4);
    expect(getDirectToolbarActionLimit(390, 7)).to.equal(3);
    expect(getDirectToolbarActionLimit(320, 7)).to.equal(2);
    expect(getDirectToolbarActionLimit(280, 7)).to.equal(1);
  });

  it("does not show overflow when the current action count already fits", () => {
    expect(getDirectToolbarActionLimit(320, 2)).to.equal(2);
    expect(getDirectToolbarActionLimit(280, 1)).to.equal(1);
  });
});
