import { describe, expect, it } from "vitest";
import { ROUTES, isSellerPath } from "../routes";

describe("marketplace routes", () => {
  it("builds search and category URLs", () => {
    expect(ROUTES.search("a b")).toBe("/search?q=a%20b");
    expect(ROUTES.search()).toBe("/search");
    expect(ROUTES.category("home-kitchen")).toBe("/c/home-kitchen");
  });

  it.each([
    ["/seller", true],
    ["/seller/orders/1", true],
    ["/sellers", false],
    ["/sell", false],
    ["/", false],
  ])("identifies seller mode at %s", (path, expected) => {
    expect(isSellerPath(path)).toBe(expected);
  });
});
