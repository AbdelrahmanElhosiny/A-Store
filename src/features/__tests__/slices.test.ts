import { describe, expect, it } from "vitest";
import { setupStore } from "../../app/store";
import resetDemoData from "../../app/resetDemoData";
import { buildSeed } from "../../seed/buildSeed";
import { addItemToCart, logInAs, setCartQuantity } from "../cartActions";
import { placeOrder } from "../orderActions";
import { logOut } from "../sessionSlice";
import { removeItem } from "../itemSlice";
import { addOrder } from "../ordersSlice";
import { buildOrder } from "../orderBuild";
import { Address, BuyerAccount, CartLine, GUEST_ID, Order } from "../types";
import { selectItemsById, selectStoresById } from "../selectors";

const HEADPHONES = "item-ps-headphones";
const MUG = "item-hl-ceramic-mug";

const shipTo = { id: "guest", name: "", line1: "" } as Address;
const payment: Order["payment"] = { kind: "cod", label: "Cash on delivery" };

// the seed at time 0 without its past orders (these tests count their own),
// with the guest's cart filled in
const makeStore = (guestCart: CartLine[] = []) => {
  const seed = buildSeed(0);
  return setupStore({
    ...seed,
    orders: [],
    session: { ...seed.session, guestCart },
  });
};
type TestStore = ReturnType<typeof makeStore>;

const buyer = (store: TestStore, id: string) =>
  store.getState().accounts.find((account) => account.id === id) as BuyerAccount;
const stockOf = (store: TestStore, id: string) =>
  store.getState().items.find((item) => item.id === id)?.stockNum;
const itemOf = (store: TestStore, id: string) =>
  store.getState().items.find((item) => item.id === id)!;

describe("logging in and out", () => {
  it("logInAs moves the guest cart into the buyer's cart", () => {
    const store = makeStore([{ itemId: HEADPHONES, quantity: 2 }]);
    expect(store.dispatch(logInAs("buyer", "acc-ahmed"))).toBe(true);
    const { session } = store.getState();
    expect(session.buyerId).toBe("acc-ahmed");
    expect(session.guestCart).toEqual([]);
    expect(buyer(store, "acc-ahmed").cart).toEqual([
      { itemId: HEADPHONES, quantity: 2 },
    ]);
  });

  it("logInAs refuses an id of the wrong role and changes nothing", () => {
    const store = makeStore([{ itemId: HEADPHONES, quantity: 2 }]);
    const before = store.getState();
    expect(store.dispatch(logInAs("buyer", "acc-mona"))).toBe(false);
    expect(store.dispatch(logInAs("seller", "acc-ahmed"))).toBe(false);
    expect(store.dispatch(logInAs("buyer", "nobody"))).toBe(false);
    expect(store.getState()).toBe(before);
  });

  it("logs the seller in without touching the buyer or the guest cart", () => {
    const store = makeStore([{ itemId: HEADPHONES, quantity: 1 }]);
    expect(store.dispatch(logInAs("seller", "acc-mona"))).toBe(true);
    expect(store.getState().session).toMatchObject({
      buyerId: null,
      sellerId: "acc-mona",
      guestCart: [{ itemId: HEADPHONES, quantity: 1 }],
    });
  });

  it("logOut clears one role only", () => {
    const store = makeStore();
    store.dispatch(logInAs("buyer", "acc-ahmed"));
    store.dispatch(logInAs("seller", "acc-mona"));

    store.dispatch(logOut({ role: "buyer" }));
    expect(store.getState().session).toMatchObject({
      buyerId: null,
      sellerId: "acc-mona",
    });

    store.dispatch(logInAs("buyer", "acc-ahmed"));
    store.dispatch(logOut({ role: "seller" }));
    expect(store.getState().session).toMatchObject({
      buyerId: "acc-ahmed",
      sellerId: null,
    });
  });
});

describe("the cart", () => {
  it("addItemToCart fills the guest cart, or the signed-in buyer's", () => {
    const store = makeStore();
    store.dispatch(addItemToCart(itemOf(store, MUG)));
    expect(store.getState().session.guestCart).toEqual([
      { itemId: MUG, quantity: 1 },
    ]);

    store.dispatch(logInAs("buyer", "acc-ahmed"));
    store.dispatch(addItemToCart(itemOf(store, HEADPHONES)));
    expect(store.getState().session.guestCart).toEqual([]);
    expect(buyer(store, "acc-ahmed").cart).toEqual([
      { itemId: MUG, quantity: 1 },
      { itemId: HEADPHONES, quantity: 1 },
    ]);
  });

  it("setCartQuantity sets and removes lines of the active cart", () => {
    const store = makeStore([{ itemId: MUG, quantity: 1 }]);
    store.dispatch(setCartQuantity(MUG, 4));
    expect(store.getState().session.guestCart).toEqual([
      { itemId: MUG, quantity: 4 },
    ]);
    store.dispatch(setCartQuantity(MUG, 0));
    expect(store.getState().session.guestCart).toEqual([]);
  });

  it("removeItem clears the guest cart and every buyer cart", () => {
    const line = { itemId: MUG, quantity: 1 };
    const store = makeStore([line]);
    store.dispatch(logInAs("buyer", "acc-omar"));
    store.dispatch(setCartQuantity(MUG, 1));
    store.dispatch(logOut({ role: "buyer" }));
    store.dispatch(logInAs("buyer", "acc-ahmed"));
    store.dispatch(setCartQuantity(MUG, 2));
    store.dispatch(logOut({ role: "buyer" }));
    store.dispatch(setCartQuantity(MUG, 1));

    const state = store.getState();
    const order = buildOrder({
      id: "o1",
      number: "A-10001",
      buyerId: "acc-ahmed",
      now: 0,
      cart: [line],
      itemsById: selectItemsById(state),
      storesById: selectStoresById(state),
      shipTo,
      payment,
    });
    store.dispatch(addOrder(order));
    const orders = store.getState().orders;

    store.dispatch(removeItem(MUG));
    const after = store.getState();
    expect(after.session.guestCart).toEqual([]);
    expect(buyer(store, "acc-ahmed").cart).toEqual([]);
    expect(buyer(store, "acc-omar").cart).toEqual([]);
    expect(after.items.some(({ id }) => id === MUG)).toBe(false);
    expect(after.orders).toBe(orders);
  });
});

describe("placeOrder", () => {
  it("adds the order, takes the stock and empties the ordered lines", () => {
    const store = makeStore();
    store.dispatch(logInAs("buyer", "acc-ahmed"));
    store.dispatch(setCartQuantity(HEADPHONES, 2));
    store.dispatch(setCartQuantity(MUG, 3));

    const order = store.dispatch(placeOrder({ shipTo, payment }));
    const state = store.getState();
    expect(order).not.toBeNull();
    expect(state.orders).toEqual([order]);
    expect(order).toMatchObject({ buyerId: "acc-ahmed", number: "A-10001" });
    expect(order!.shipments.map(({ storeId }) => storeId)).toEqual([
      "store-pocket-signal",
      "store-hearth-lane",
    ]);
    expect(stockOf(store, HEADPHONES)).toBe(10);
    expect(stockOf(store, MUG)).toBe(37);
    expect(buyer(store, "acc-ahmed").cart).toEqual([]);
  });

  it("orders only what's in stock and keeps sold-out lines in the cart", () => {
    const lamp = "item-hl-desk-lamp"; // 3 in stock
    const store = makeStore([
      { itemId: lamp, quantity: 5 },
      { itemId: MUG, quantity: 1 },
    ]);
    store.dispatch(placeOrder({ shipTo, payment }));
    // the lamp sells out; the next order can't include it
    store.dispatch(setCartQuantity(lamp, 1));
    const second = store.dispatch(placeOrder({ shipTo, payment }));

    const [first] = store.getState().orders;
    expect(first.shipments[0].lines.map((l) => l.quantity)).toEqual([3, 1]);
    expect(stockOf(store, lamp)).toBe(0);
    expect(second).toBeNull();
    expect(store.getState().session.guestCart).toEqual([
      { itemId: lamp, quantity: 1 },
    ]);
  });

  it("gives a guest's order the guest id and numbers orders on", () => {
    const store = makeStore([{ itemId: MUG, quantity: 1 }]);
    const first = store.dispatch(placeOrder({ shipTo, payment }));
    store.dispatch(setCartQuantity(MUG, 1));
    const second = store.dispatch(placeOrder({ shipTo, payment }));
    expect(first?.buyerId).toBe(GUEST_ID);
    expect(second?.number).toBe("A-10002");
  });

  it("returns null for an empty cart", () => {
    const store = makeStore();
    expect(store.dispatch(placeOrder({ shipTo, payment }))).toBeNull();
    expect(store.getState().orders).toEqual([]);
  });
});

describe("resetDemoData", () => {
  it("brings every slice back to the seed", () => {
    const store = makeStore([{ itemId: MUG, quantity: 1 }]);
    store.dispatch(logInAs("buyer", "acc-ahmed"));
    store.dispatch(placeOrder({ shipTo, payment }));
    store.dispatch(removeItem(HEADPHONES));

    store.dispatch(resetDemoData(5));
    const { notification, ...persisted } = store.getState();
    expect(notification).toBeDefined();
    expect(persisted).toEqual(buildSeed(5));
  });
});
