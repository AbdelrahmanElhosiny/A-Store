import { expect, it } from "vitest";
import { sellerSearchPath, storeSearchPath } from "../searchPaths";

it("store search trims and encodes its query and scope", () => {
  expect(storeSearchPath("  red watch ", "all")).toBe("/search?q=red%20watch");
  expect(storeSearchPath("strap", "watches")).toBe("/search?q=strap&category=watches");
  expect(storeSearchPath("", "bags")).toBe("/c/bags");
  expect(storeSearchPath("   ", "bags")).toBe("/c/bags");
  expect(storeSearchPath("   ", "all")).toBeNull();
});
it("seller search trims and encodes its query", () => {
  expect(sellerSearchPath(" A-10012 ")).toBe("/seller/orders?q=A-10012");
  expect(sellerSearchPath("Nour & co")).toBe("/seller/orders?q=Nour+%26+co");
  expect(sellerSearchPath(" ")).toBeNull();
});
