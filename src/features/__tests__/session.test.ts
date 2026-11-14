import { expect, it } from "vitest";
import { setupStore } from "../../app/store";
import { logInAs } from "../cartActions";
import { logOut } from "../sessionSlice";

it("logOut seller keeps buyer", () => {
  const store = setupStore();
  store.dispatch(logInAs("buyer", "acc-ahmed"));
  store.dispatch(logInAs("seller", "acc-mona"));
  store.dispatch(logOut({ role: "seller" }));
  expect(store.getState().session).toMatchObject({ buyerId: "acc-ahmed", sellerId: null });
});
