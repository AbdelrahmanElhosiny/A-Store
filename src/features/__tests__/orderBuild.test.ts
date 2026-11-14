import { describe, expect, it } from "vitest";
import { buildOrder, nextOrderNumber } from "../orderBuild";
import { Address, Item, Order, Store } from "../types";

const now = 1_000_000;
const shipTo: Address = {
  id: "a1",
  label: "Home",
  name: "Ahmed",
  line1: "14 Nile Street",
  city: "Cairo",
  zipCode: "11511",
  phoneNum: "+20 100 000 0001",
  isDefault: true,
};
const payment: Order["payment"] = { kind: "cod", label: "Cash on delivery" };

const store = (id: string, extra: Partial<Store> = {}) =>
  ({ id, deliveryFee: 0, freeDeliveryOver: null, ...extra }) as Store;
const storesById = {
  s1: store("s1"),
  s2: store("s2", { deliveryFee: 5, freeDeliveryOver: 50 }),
};

const lamp = {
  id: "lamp",
  storeId: "s1",
  name: "Desk lamp",
  price: 45,
  stockNum: 3,
  image: "lamp.webp",
} as Item;
const shirt = {
  id: "shirt",
  storeId: "s2",
  name: "Shirt",
  price: 20,
  stockNum: 10,
  image: "shirt.webp",
  variants: [{ id: "m-red", values: ["M", "Red"], price: 22, stockNum: 4, sku: "S-1" }],
} as Item;
const mug = { id: "mug", storeId: "s2", name: "Mug", price: 14, stockNum: 9 } as Item;
const itemsById = { lamp, shirt, mug };

const build = (cart: Parameters<typeof buildOrder>[0]["cart"]) =>
  buildOrder({
    id: "o1",
    number: "A-10001",
    buyerId: "acc-ahmed",
    now,
    cart,
    itemsById,
    storesById,
    shipTo,
    payment,
  });

describe("buildOrder", () => {
  const order = build([
    { itemId: "mug", quantity: 1 },
    { itemId: "lamp", quantity: 2 },
    { itemId: "shirt", variantId: "m-red", quantity: 1 },
  ]);

  it("splits the cart into one shipment per store, in first-seen order", () => {
    expect(order.shipments).toHaveLength(2);
    expect(order.shipments.map((s) => s.storeId)).toEqual(["s2", "s1"]);
  });

  it("starts every shipment as placed", () => {
    order.shipments.forEach((s) => {
      expect(s.status).toBe("placed");
      expect(s.history).toEqual([{ status: "placed", at: now }]);
    });
  });

  it("snapshots the item on each line, and the variant's price and label", () => {
    const [s2, s1] = order.shipments;
    expect(s1.lines).toEqual([
      { itemId: "lamp", name: "Desk lamp", price: 45, image: "lamp.webp", quantity: 2 },
    ]);
    expect(s2.lines[1]).toEqual({
      itemId: "shirt",
      variantId: "m-red",
      variantLabel: "M / Red",
      name: "Shirt",
      price: 22,
      image: "shirt.webp",
      quantity: 1,
    });
  });

  it("charges the store's delivery fee under its free-delivery threshold", () => {
    // s2 subtotal: 14 + 22 = 36
    expect(order.shipments[0].deliveryFee).toBe(5);
    expect(order.shipments[1].deliveryFee).toBe(0);
    // 14 * 3 + 22 = 64
    const big = build([
      { itemId: "mug", quantity: 3 },
      { itemId: "shirt", variantId: "m-red", quantity: 1 },
    ]);
    expect(big.shipments[0].deliveryFee).toBe(0);
    // exactly 50 is free too: 14 * 2 + 22 = 50
    const exact = build([
      { itemId: "mug", quantity: 2 },
      { itemId: "shirt", variantId: "m-red", quantity: 1 },
    ]);
    expect(exact.shipments[0].deliveryFee).toBe(0);
  });

  it("skips a line whose item is gone", () => {
    const partial = build([
      { itemId: "gone", quantity: 1 },
      { itemId: "lamp", quantity: 1 },
    ]);
    expect(partial.shipments).toHaveLength(1);
    expect(partial.shipments[0].lines.map((l) => l.itemId)).toEqual(["lamp"]);
  });

  it("fills in the order itself", () => {
    expect(order).toMatchObject({
      id: "o1",
      number: "A-10001",
      buyerId: "acc-ahmed",
      placedAt: now,
      shipTo,
      payment,
      isSeed: false,
    });
    expect(new Set(order.shipments.map((s) => s.id)).size).toBe(2);
  });
});

describe("nextOrderNumber", () => {
  it("starts at A-10001", () => expect(nextOrderNumber([])).toBe("A-10001"));

  it("counts on from the highest existing number", () =>
    expect(
      nextOrderNumber([{ number: "A-10004" }, { number: "A-10012" }] as Order[]),
    ).toBe("A-10013"));
});
