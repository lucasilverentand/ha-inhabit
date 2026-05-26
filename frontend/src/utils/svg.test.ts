import { expect } from "@open-wc/testing";
import type { Coordinates } from "../types.js";
import { groupEdgesIntoChains, wallChainPath, wallPath } from "./svg.js";

type TestEdge = {
  id: string;
  start_node: string;
  end_node: string;
  startPos: Coordinates;
  endPos: Coordinates;
  thickness: number;
  type: string;
};

function edge(
  id: string,
  startNode: string,
  endNode: string,
  startPos: Coordinates,
  endPos: Coordinates,
  thickness = 6,
): TestEdge {
  return {
    id,
    start_node: startNode,
    end_node: endNode,
    startPos,
    endPos,
    thickness,
    type: "wall",
  };
}

function expectFinitePath(path: string): void {
  expect(path).to.be.a("string");
  expect(path.length).to.be.greaterThan(0);
  expect(path).not.to.include("NaN");
  expect(path).not.to.include("Infinity");
}

describe("groupEdgesIntoChains", () => {
  it("does not greedily chain through T junctions", () => {
    const chains = groupEdgesIntoChains([
      edge("ab", "a", "b", { x: 0, y: 0 }, { x: 100, y: 0 }),
      edge("bc", "b", "c", { x: 100, y: 0 }, { x: 200, y: 0 }),
      edge("bd", "b", "d", { x: 100, y: 0 }, { x: 100, y: 100 }),
    ]);

    expect(chains).to.have.length(3);
    expect(
      chains.map((chain) => chain.map((e) => e.id).join(",")),
    ).to.have.members(["ab", "bc", "bd"]);
  });

  it("splits chains when connected wall thickness changes", () => {
    const chains = groupEdgesIntoChains([
      edge("ab", "a", "b", { x: 0, y: 0 }, { x: 100, y: 0 }, 6),
      edge("bc", "b", "c", { x: 100, y: 0 }, { x: 200, y: 0 }, 12),
    ]);

    expect(chains).to.have.length(2);
    expect(chains.map((chain) => chain[0].id)).to.have.members(["ab", "bc"]);
  });

  it("keeps simple loops in one chain", () => {
    const chains = groupEdgesIntoChains([
      edge("ab", "a", "b", { x: 0, y: 0 }, { x: 100, y: 0 }),
      edge("bc", "b", "c", { x: 100, y: 0 }, { x: 100, y: 100 }),
      edge("ca", "c", "a", { x: 100, y: 100 }, { x: 0, y: 0 }),
    ]);

    expect(chains).to.have.length(1);
    expect(chains[0]).to.have.length(3);
  });

  it("ignores zero length and non-finite wall segments", () => {
    const chains = groupEdgesIntoChains([
      edge("ab", "a", "b", { x: 0, y: 0 }, { x: 100, y: 0 }),
      edge("tiny", "x", "y", { x: 5, y: 5 }, { x: 5.1, y: 5.1 }),
      edge("bad", "m", "n", { x: Number.NaN, y: 0 }, { x: 0, y: 0 }),
    ]);

    expect(chains).to.have.length(1);
    expect(chains[0][0].id).to.equal("ab");
  });
});

describe("wallChainPath", () => {
  it("renders a finite path for a near-closed loop", () => {
    const path = wallChainPath([
      { start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, thickness: 6 },
      { start: { x: 100, y: 0 }, end: { x: 100, y: 100 }, thickness: 6 },
      { start: { x: 100, y: 100 }, end: { x: 0.4, y: 0.3 }, thickness: 6 },
    ]);

    expectFinitePath(path);
  });

  it("drops tiny duplicate segments before rendering", () => {
    const path = wallChainPath([
      { start: { x: 0, y: 0 }, end: { x: 0.1, y: 0.1 }, thickness: 6 },
      { start: { x: 0.1, y: 0.1 }, end: { x: 100, y: 0 }, thickness: 6 },
    ]);

    expectFinitePath(path);
  });

  it("falls back safely for invalid thickness", () => {
    const path = wallChainPath([
      { start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, thickness: Number.NaN },
    ]);

    expectFinitePath(path);
  });
});

describe("wallPath", () => {
  it("does not render invalid single-edge paths", () => {
    expect(wallPath({ x: 0, y: 0 }, { x: 0.1, y: 0.1 }, 6)).to.equal("");
    expect(wallPath({ x: Number.NaN, y: 0 }, { x: 100, y: 0 }, 6)).to.equal("");
  });
});
