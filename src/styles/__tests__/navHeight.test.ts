import { expect, it } from "vitest";
import { navHeight } from "../navHeight";

it("nav heights add up the rows", () => {
  expect(navHeight("buy", false)).toBe(96);
  expect(navHeight("buy", true)).toBe(112);
  expect(navHeight("sell", false)).toBe(56);
  expect(navHeight("sell", true)).toBe(56);
});
