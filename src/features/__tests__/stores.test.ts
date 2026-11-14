import { expect, it } from "vitest";
import { setupStore } from "../../app/store";
import { addStore, updateStore } from "../storesSlice";

it("adds stores and updates settings without affecting other stores", () => {
  const store = setupStore();
  const first = store.getState().stores[0];
  const newStore = { ...first, id: "store-new", ownerId: "acc-new", slug: "new" };
  store.dispatch(addStore(newStore));
  store.dispatch(updateStore({ id: newStore.id, changes: { name: "New shop", autoShip: true, deliveryFee: 5 } }));
  expect(store.getState().stores.find(({ id }) => id === newStore.id)).toEqual({ ...newStore, name: "New shop", autoShip: true, deliveryFee: 5 });
  expect(store.getState().stores[0]).toEqual(first);
});
