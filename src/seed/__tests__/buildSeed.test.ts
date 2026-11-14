import { describe, expect, it } from "vitest";
import { buildSeed } from "../buildSeed";
import { SEED_IMAGES } from "../images";
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
      expect(buyer.addresses.filter(({ isDefault }) => isDefault)).toHaveLength(
        1,
      );
      expect(
        buyer.paymentMethods.filter(({ isDefault }) => isDefault),
      ).toHaveLength(1);
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

  it("has the full catalogue", () => {
    expect(seed.stores).toHaveLength(4);
    expect(buyers).toHaveLength(3);
    expect(sellers).toHaveLength(4);
    expect(seed.items).toHaveLength(30);
    const perStore = (id: string) =>
      seed.items.filter(({ storeId }) => storeId === id).length;
    expect(perStore("store-tick-tock")).toBe(8);
    expect(perStore("store-carry-co")).toBe(8);
    expect(perStore("store-pocket-signal")).toBe(8);
    expect(perStore("store-hearth-lane")).toBe(6);
    expect(seed.items.filter(({ stockNum }) => stockNum === 0)).toHaveLength(4);
    const lowStockAt = seed.stores[0].lowStockAt;
    expect(
      seed.items.filter(
        ({ stockNum }) => stockNum >= 1 && stockNum <= lowStockAt,
      ).length,
    ).toBeGreaterThanOrEqual(3);
    expect(new Set(seed.items.map(({ id }) => id)).size).toBe(30);
    expect(new Set(seed.items.map(({ sku }) => sku)).size).toBe(30);
  });

  it("every item has a picture that resolves", () => {
    const urls = Object.values(SEED_IMAGES) as string[];
    seed.items.forEach((item) => expect(urls).toContain(item.image));
  });

  it("buyers come ready", () => {
    const now = Date.UTC(2026, 10, 14);
    const dated = buildSeed(now).accounts.filter(
      (account): account is BuyerAccount => account.role === "buyer",
    );
    const today = new Date(now);
    const thisMonth = today.getFullYear() * 12 + today.getMonth() + 1;
    dated.forEach((buyer) => {
      expect(buyer.addresses).toHaveLength(2);
      expect(buyer.addresses.filter(({ isDefault }) => isDefault)).toHaveLength(
        1,
      );
      const cards = buyer.paymentMethods.filter(({ kind }) => kind === "card");
      expect(cards.length).toBeGreaterThanOrEqual(1);
      expect(buyer.paymentMethods.some(({ id }) => id === "cod")).toBe(true);
      cards.forEach((card) => {
        expect(card.expYear! * 12 + card.expMonth!).toBeGreaterThan(thisMonth);
      });
    });
  });

  it("dates are offsets from now", () => {
    const a = 1_000_000_000_000;
    const b = 2_000_000_000_000;
    const first = buildSeed(a).orders;
    const second = buildSeed(b).orders;
    expect(first).toHaveLength(13);
    first.forEach((order, index) => {
      expect(order.placedAt - a).toBe(second[index].placedAt - b);
      expect(a - order.placedAt).toBeGreaterThan(0);
      expect(a - order.placedAt).toBeLessThanOrEqual(25 * 24 * 60 * 60 * 1000);
    });
  });

  it("each store has waiting work", () => {
    seed.stores.forEach((store) => {
      const waiting = seed.orders
        .flatMap(({ shipments }) => shipments)
        .filter(
          ({ storeId, status }) =>
            storeId === store.id &&
            (status === "placed" || status === "packed"),
        );
      expect(waiting.length).toBeGreaterThan(0);
    });
  });

  it("seed orders are internally consistent", () => {
    const itemIds = seed.items.map(({ id }) => id);
    seed.orders.forEach((order) => {
      expect(order.isSeed).toBe(true);
      order.shipments.forEach((shipment) => {
        shipment.lines.forEach((line) => {
          expect(itemIds).toContain(line.itemId);
          const item = seed.items.find(({ id }) => id === line.itemId);
          expect(item?.storeId).toBe(shipment.storeId);
        });
        if (shipment.status === "shipped") {
          expect(shipment.carrier).toBeTruthy();
          expect(shipment.trackingNo).toBeTruthy();
          expect(shipment.deliverAt).toBeUndefined();
        }
        const times = shipment.history.map(({ at }) => at);
        expect([...times].sort((x, y) => x - y)).toEqual(times);
        expect(shipment.history[shipment.history.length - 1].status).toBe(
          shipment.status,
        );
      });
    });
  });
});
