import { describe, expect, it } from "vitest";
import { buildSeed } from "../buildSeed";
import { BuyerAccount, SellerAccount } from "../../features/types";

describe("buildSeed", () => {
  const seed = buildSeed(0);
  const sellers = seed.accounts.filter(
    (account): account is SellerAccount => account.role === "seller",
  );
  const buyers = seed.accounts.filter(
    (account): account is BuyerAccount => account.role === "buyer",
  );

  it("minimal seed is consistent", () => {
    const storeIds = seed.stores.map(({ id }) => id);
    seed.items.forEach((item) => expect(storeIds).toContain(item.storeId));

    seed.stores.forEach((store) => {
      const owner = sellers.find(({ id }) => id === store.ownerId);
      expect(owner?.storeId).toBe(store.id);
    });

    const slugs = seed.stores.map(({ slug }) => slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    expect(buyers.length).toBeGreaterThan(0);
    buyers.forEach((buyer) => {
      expect(buyer.addresses.filter(({ isDefault }) => isDefault)).toHaveLength(1);
      expect(buyer.paymentMethods.filter(({ isDefault }) => isDefault)).toHaveLength(1);
    });
  });

  it("counts times back from now", () => {
    const later = buildSeed(1_000_000_000_000);
    expect(later.items[0].createdAt - seed.items[0].createdAt).toBe(
      1_000_000_000_000,
    );
  });

  it("makes new objects every time", () => {
    expect(buildSeed(0)).toEqual(seed);
    expect(buildSeed(0).items[0]).not.toBe(seed.items[0]);
  });
});
