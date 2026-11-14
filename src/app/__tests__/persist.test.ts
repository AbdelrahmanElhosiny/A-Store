import { describe, expect, it } from "vitest";
import { STORAGE_KEY, loadState, saveState } from "../persist";
import { buildSeed } from "../../seed/buildSeed";
import { SEED_IMAGES } from "../../seed/images";

describe("saved data", () => {
  it("round-trips the five slices", () => {
    const seed = buildSeed(0);
    expect(saveState(seed)).toBe(true);
    // seed pictures are saved by name, not by their build-specific URL
    const raw = localStorage.getItem(STORAGE_KEY) ?? "";
    expect(raw).toContain('"seed:headphones"');
    expect(raw).not.toContain(SEED_IMAGES.headphones);

    const loaded = loadState();
    expect(loaded).toEqual({ state: seed, droppedOld: false });
    expect(loaded.state?.items[0].image).toBe(SEED_IMAGES.headphones);
  });

  it("drops a version 1 save and reports it", () => {
    localStorage.setItem(STORAGE_KEY, '{"version":1,"items":[],"users":[]}');
    expect(loadState()).toEqual({ state: undefined, droppedOld: true });
  });

  it("rejects a session whose buyer is missing", () => {
    const seed = buildSeed(0);
    saveState({ ...seed, session: { ...seed.session, buyerId: "acc-gone" } });
    expect(loadState()).toEqual({ state: undefined, droppedOld: true });
  });

  it("rejects a session whose seller is a buyer, and a store without its seller", () => {
    const seed = buildSeed(0);
    saveState({ ...seed, session: { ...seed.session, sellerId: "acc-ahmed" } });
    expect(loadState().droppedOld).toBe(true);

    const orphan = { ...seed.stores[0], ownerId: "acc-ahmed" };
    saveState({ ...seed, stores: [orphan, ...seed.stores.slice(1)] });
    expect(loadState().droppedOld).toBe(true);
  });

  it("drops broken JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadState()).toEqual({ state: undefined, droppedOld: true });
  });

  it("starts fresh with nothing saved", () =>
    expect(loadState()).toEqual({ state: undefined, droppedOld: false }));
});
