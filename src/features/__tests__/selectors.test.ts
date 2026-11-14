import { describe, expect, it } from "vitest";
import { RootState, setupStore } from "../../app/store";
import { buildSeed } from "../../seed/buildSeed";
import { buildOrder } from "../orderBuild";
import {
  selectBuyerAccounts,
  selectToShipCount,
  selectDefaultAddress,
  selectCart,
  selectCartCount,
  selectItemsById,
  selectItemsForStore,
  selectOrdersForBuyer,
  selectSellerAccounts,
  selectShipmentsForStore,
  selectShopItems,
  selectStockById,
  selectStoresById,
} from "../selectors";
import { Address, CartLine, Item } from "../types";

const shipTo = { id: "a", name: "", line1: "" } as Address;

// a store's state, from the seed with the given changes
const stateWith = (changes: Partial<RootState> = {}) =>
  setupStore({ ...buildSeed(0), orders: [], ...changes }).getState();

const orderAt = (state: RootState, id: string, placedAt: number, cart: CartLine[]) =>
  buildOrder({
    id,
    number: `A-${id}`,
    buyerId: "acc-ahmed",
    now: placedAt,
    cart,
    itemsById: selectItemsById(state),
    storesById: selectStoresById(state),
    shipTo,
    payment: { kind: "cod", label: "Cash on delivery" },
  });

describe("selectors", () => {
  it("selectCartCount sums the active cart's quantities", () => {
    const seed = buildSeed(0);
    const state = stateWith({
      session: {
        ...seed.session,
        guestCart: [
          { itemId: "item-hl-ceramic-mug", quantity: 2 },
          { itemId: "item-ps-headphones", quantity: 3 },
        ],
      },
    });
    expect(selectCartCount(state)).toBe(5);
  });

  it("selectCart reads the signed-in buyer's cart", () => {
    const seed = buildSeed(0);
    const accounts = seed.accounts.map((account) =>
      account.id === "acc-ahmed" && account.role === "buyer"
        ? { ...account, cart: [{ itemId: "item-hl-ceramic-mug", quantity: 1 }] }
        : account,
    );
    const state = stateWith({
      accounts,
      session: { ...seed.session, buyerId: "acc-ahmed" },
    });
    expect(selectCart(state)).toEqual([{ itemId: "item-hl-ceramic-mug", quantity: 1 }]);
  });

  it("selectShopItems leaves out drafts and archived items", () => {
    const seed = buildSeed(0);
    const items: Item[] = seed.items.map((item, index) =>
      index === 0 ? { ...item, status: "draft" } : index === 1 ? { ...item, status: "archived" } : item,
    );
    const state = stateWith({ items });
    expect(selectShopItems(state).map(({ id }) => id)).toEqual(
      seed.items.slice(2).map(({ id }) => id),
    );
    // the store's own list keeps every status
    expect(selectItemsForStore(state, "store-hearth-lane")).toHaveLength(6);
  });

  it("selectShipmentsForStore returns only that store's shipments, newest first", () => {
    const base = stateWith();
    const older = orderAt(base, "1", 100, [
      { itemId: "item-hl-desk-lamp", quantity: 1 },
      { itemId: "item-ps-headphones", quantity: 1 },
    ]);
    const newer = orderAt(base, "2", 200, [{ itemId: "item-hl-ceramic-mug", quantity: 1 }]);
    const other = orderAt(base, "3", 300, [{ itemId: "item-tt-smart-watch", quantity: 1 }]);
    const state = stateWith({ orders: [older, newer, other] });

    const rows = selectShipmentsForStore(state, "store-hearth-lane");
    expect(rows.map(({ order }) => order.id)).toEqual(["2", "1"]);
    rows.forEach(({ shipment }) => expect(shipment.storeId).toBe("store-hearth-lane"));
    expect(selectOrdersForBuyer(state, "acc-ahmed").map(({ id }) => id)).toEqual([
      "3",
      "2",
      "1",
    ]);
  });

  it("splits accounts by role and keys stock by line key", () => {
    const state = stateWith();
    expect(selectBuyerAccounts(state).map(({ id }) => id)).toEqual(["acc-ahmed", "acc-omar", "acc-nour"]);
    expect(selectSellerAccounts(state)).toHaveLength(4);
    expect(selectStockById(state)["item-hl-desk-lamp"]).toBe(3);
  });

  it("returns the same reference for the same state (memoised)", () => {
    const state = stateWith();
    expect(selectShopItems(state)).toBe(selectShopItems(state));
    expect(selectItemsById(state)).toBe(selectItemsById(state));
    expect(selectStockById(state)).toBe(selectStockById(state));
    expect(selectBuyerAccounts(state)).toBe(selectBuyerAccounts(state));
    expect(selectItemsForStore(state, "store-tick-tock")).toBe(
      selectItemsForStore(state, "store-tick-tock"),
    );
    expect(selectShipmentsForStore(state, "store-tick-tock")).toBe(
      selectShipmentsForStore(state, "store-tick-tock"),
    );
  });
});

it("selectToShipCount counts placed and packed shipments", () => {
  const state = setupStore().getState();
  expect(selectToShipCount(state, "store-tick-tock")).toBe(2);
  expect(selectToShipCount(state, "store-carry-co")).toBe(1);
  expect(selectToShipCount(state, "store-hearth-lane")).toBe(2);
  expect(selectToShipCount(state, "store-pocket-signal")).toBe(1);
  expect(selectToShipCount(state, "store-nope")).toBe(0);
  const seed = buildSeed(0);
  seed.orders.find(({ number }) => number === "A-10013")!.shipments
    .find(({ storeId }) => storeId === "store-tick-tock")!.status = "shipped";
  expect(selectToShipCount(setupStore(seed).getState(), "store-tick-tock")).toBe(1);
});
it("selectDefaultAddress", () => {
  const seed = buildSeed(0);
  expect(selectDefaultAddress(setupStore().getState())).toBeNull();
  seed.session.buyerId = "acc-ahmed";
  expect(selectDefaultAddress(setupStore(seed).getState())).toMatchObject({ city: "Cairo", label: "Home" });
});
