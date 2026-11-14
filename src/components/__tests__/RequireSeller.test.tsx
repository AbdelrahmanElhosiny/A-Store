import { afterEach, expect, it } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import RequireSeller from "../RequireSeller";
import { ROUTES } from "../../constant/routes";
import { renderWithStore } from "../../test/renderWithStore";
import { buildSeed } from "../../seed/buildSeed";

afterEach(cleanup);
const Child = () => <p>Guarded child at {useLocation().pathname}</p>;
it("offers four stores and public store creation", () => {
  renderWithStore(<RequireSeller><Child /></RequireSeller>, { route: ROUTES.seller });
  expect(screen.getByRole("heading", { name: "Pick your store", level: 2 })).toBeInTheDocument();
  expect(screen.getByText("This is a demo: pick a store to run it, no password needed.")).toBeInTheDocument();
  expect(screen.getAllByRole("button")).toHaveLength(4);
  const seed = buildSeed(0);
  for (const store of seed.stores) {
    const card = screen.getByRole("button", { name: store.name });
    const count = seed.items.filter(({ storeId }) => storeId === store.id).length;
    expect(card).toHaveAccessibleName(store.name);
    expect(card).toHaveAccessibleDescription(`${store.tagline} ${count} products`);
    expect(card).not.toHaveAttribute("aria-label");
    expect(document.getElementById(card.getAttribute("aria-labelledby") ?? "")).toHaveTextContent(store.name);
  }
  expect(screen.getByRole("link", { name: "Create a store" })).toHaveAttribute("href", ROUTES.sellerSignUp);
});
it("deep link survives picking a store", async () => {
  const user = userEvent.setup();
  const { store } = renderWithStore(<RequireSeller><Child /></RequireSeller>, { route: ROUTES.sellerOrders });
  await user.click(screen.getByRole("button", { name: "Tick & Tock" }));
  expect(store.getState().session.sellerId).toBe("acc-mona");
  expect(screen.getByText(`Guarded child at ${ROUTES.sellerOrders}`)).toBeInTheDocument();
});

it("announces the selected store's login", async () => {
  const user = userEvent.setup();
  const { store } = renderWithStore(<RequireSeller><Child /></RequireSeller>, { route: ROUTES.sellerOrders });
  await user.click(screen.getByRole("button", { name: "Tick & Tock" }));
  expect(store.getState().notification).toMatchObject({
    isOpen: true, message: "Logged in to Tick & Tock", type: "success",
  });
});

it.each([2, 1])("focuses the page h%s after picking a store", async (level) => {
  const user = userEvent.setup();
  renderWithStore(
    <main><RequireSeller>
      <h1>Seller centre</h1>
      {level === 2 && <h2>Orders</h2>}
    </RequireSeller></main>,
    { route: ROUTES.sellerOrders },
  );
  await user.click(screen.getByRole("button", { name: "Tick & Tock" }));
  await waitFor(() => expect(screen.getByRole("heading", { level })).toHaveFocus());
});
