import { afterEach, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithStore } from "../../../test/renderWithStore";
import { buildSeed } from "../../../seed/buildSeed";
import { ROUTES } from "../../../constant/routes";
import useSell, { toFormFields } from "../useSell";
import Home from "../Home";
import TrackSold from "../TrackSold";

const seed = buildSeed(0);
const preloadedState = { ...seed, session: { ...seed.session, sellerId: "acc-laila" } };
afterEach(cleanup);
it("Hearth Lane's grid only offers its six products for Update/Remove", () => {
  renderWithStore(<Home />, { route: ROUTES.sellerProducts, preloadedState });
  expect(screen.getAllByRole("button", { name: /^Update / })).toHaveLength(6);
  expect(screen.getAllByRole("button", { name: /^Remove / })).toHaveLength(6);
  for (const item of seed.items) {
    expect(Boolean(screen.queryByRole("heading", { name: item.name }))).toBe(item.storeId === "store-hearth-lane");
  }
});
it("sold rows and totals use only Hearth Lane shipments, including mixed-store orders", () => {
  renderWithStore(<TrackSold />, { route: ROUTES.seller, preloadedState });
  const shipments = seed.orders.flatMap((order) => order.shipments.filter(({ storeId }) => storeId === "store-hearth-lane"));
  const units = shipments.flatMap(({ lines }) => lines).reduce((sum, line) => sum + line.quantity, 0);
  expect(screen.getByText(/units sold in/)).toHaveTextContent(`${units} units sold in ${shipments.length} orders`);
  for (const item of seed.items.filter(({ storeId }) => storeId !== "store-hearth-lane")) expect(screen.queryByText(item.name)).not.toBeInTheDocument();
});
it("rejects stale Update/Remove callbacks for another store's item", async () => {
  const foreign = seed.items.find(({ storeId }) => storeId === "store-tick-tock")!;
  const Probe = () => {
    const { updateItem, removeItem } = useSell();
    return <><button onClick={() => updateItem(foreign, { ...toFormFields(foreign), name: "Wrong owner" })}>Update foreign</button><button onClick={() => removeItem(foreign)}>Remove foreign</button></>;
  };
  const user = userEvent.setup();
  const { store } = renderWithStore(<Probe />, { route: ROUTES.sellerProducts, preloadedState });
  await user.click(screen.getByText("Update foreign"));
  await user.click(screen.getByText("Remove foreign"));
  expect(store.getState().items.find(({ id }) => id === foreign.id)).toEqual(foreign);
});
