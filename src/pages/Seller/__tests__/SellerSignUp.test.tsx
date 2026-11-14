import { afterEach, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import SellerSignUp from "../SellerSignUp";
import { renderWithStore } from "../../../test/renderWithStore";
import { ROUTES } from "../../../constant/routes";
import { buildSeed } from "../../../seed/buildSeed";
import { saveState, loadState } from "../../../app/persist";
import { color } from "../../../styles/tokens";

const Location = () => <output>{useLocation().pathname}</output>;
const renderPage = () => renderWithStore(<><SellerSignUp /><Location /></>, { route: ROUTES.sellerSignUp });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it("shows required errors for an empty submit", async () => {
  const user = userEvent.setup();
  renderPage();
  await user.click(screen.getByRole("button", { name: "Create a store" }));
  for (const error of ["Enter your name", "Enter a store name", "Pick a category"]) expect(await screen.findByText(error)).toBeInTheDocument();
});
it("slug collision is a taken name", async () => {
  const user = userEvent.setup();
  const { store } = renderPage();
  const before = store.getState();
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Sara");
  await user.type(screen.getByRole("textbox", { name: "Store name" }), "tick & tock!");
  await user.click(screen.getByRole("combobox", { name: "Category" }));
  await user.click(screen.getByRole("option", { name: "Accessories" }));
  await user.click(screen.getByRole("button", { name: "Create a store" }));
  expect(await screen.findByText("That store name is taken")).toBeInTheDocument();
  const after = store.getState();
  expect(after.stores).toHaveLength(before.stores.length);
  expect(after.accounts.filter(({ role }) => role === "seller")).toHaveLength(
    before.accounts.filter(({ role }) => role === "seller").length,
  );
  expect(after.session.sellerId).toBe(before.session.sellerId);
});
it("creates, signs in and opens the seller home with the required defaults", async () => {
  const user = userEvent.setup();
  const now = 1800000000000;
  vi.spyOn(Date, "now").mockReturnValue(now);
  const { store } = renderPage();
  const before = store.getState();
  await user.type(screen.getByRole("textbox", { name: "Name" }), "  Sara  ");
  await user.type(screen.getByRole("textbox", { name: "Store name" }), "Paper Trail");
  await user.click(screen.getByRole("combobox", { name: "Category" }));
  await user.click(screen.getByRole("option", { name: "Accessories" }));
  await user.click(screen.getByRole("button", { name: "Create a store" }));
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe(ROUTES.seller));
  const state = store.getState();
  const created = state.stores.find(({ slug }) => slug === "paper-trail");
  expect(state.stores).toHaveLength(before.stores.length + 1);
  expect(created).toMatchObject({ name: "Paper Trail", slug: "paper-trail", logoLetter: "P", logoColor: color.red, categoryFocus: "accessories", autoShip: false, lowStockAt: 3, deliveryFee: 0, freeDeliveryOver: null, since: now });
  expect(state.accounts.find(({ id }) => id === state.session.sellerId)).toMatchObject({ role: "seller", name: "Sara", storeId: created?.id, avatarColor: color.red, createdAt: now, notificationsSeenAt: now });
  expect(created?.ownerId).toBe(state.session.sellerId);
  expect(created?.id).toMatch(/^store-/);
  expect(state.session.sellerId).toMatch(/^acc-/);
  expect(state.session.buyerId).toBeNull();
  expect(saveState(state)).toBe(true);
  expect(loadState().state?.stores).toEqual(state.stores);
  expect(loadState().state?.session).toEqual(state.session);
  expect(state.notification.message).toBe("Your store is ready. Add your first product.");

  await user.click(screen.getByRole("button", { name: "Log out" }));
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Nadia");
  await user.type(screen.getByRole("textbox", { name: "Store name" }), "Ink House");
  await user.click(screen.getByRole("combobox", { name: "Category" }));
  await user.click(screen.getByRole("option", { name: "Accessories" }));
  await user.click(screen.getByRole("button", { name: "Create a store" }));
  await screen.findByText("You're running Ink House");
  const nextState = store.getState();
  const secondStore = nextState.stores.find(({ slug }) => slug === "ink-house");
  expect(nextState.stores).toHaveLength(before.stores.length + 2);
  expect(secondStore).toMatchObject({ logoColor: color.sell, ownerId: nextState.session.sellerId });
  expect(nextState.accounts.find(({ id }) => id === nextState.session.sellerId)).toMatchObject({
    name: "Nadia", storeId: secondStore?.id, avatarColor: color.sell,
  });
});

it("rejects a seller name ignoring case and outer spaces", async () => {
  const user = userEvent.setup();
  renderPage();
  await user.type(screen.getByRole("textbox", { name: "Name" }), "  mOnA  ");
  await user.click(screen.getByRole("button", { name: "Create a store" }));
  expect(await screen.findByText("That name is taken, pick another")).toBeInTheDocument();
});
it("allows a buyer's name for a new seller", async () => {
  const user = userEvent.setup();
  renderPage();
  await user.type(screen.getByRole("textbox", { name: "Name" }), "Ahmed");
  await user.click(screen.getByRole("button", { name: "Create a store" }));
  await screen.findByText("Enter a store name");
  expect(screen.queryByText("That name is taken, pick another")).not.toBeInTheDocument();
});
it("shows the running store and logs out only the seller before another sign-up", async () => {
  const user = userEvent.setup();
  const seed = buildSeed(0);
  const { store } = renderWithStore(<SellerSignUp />, {
    route: ROUTES.sellerSignUp,
    preloadedState: { ...seed, session: { ...seed.session, sellerId: "acc-mona", buyerId: "acc-ahmed" } },
  });
  expect(screen.getByText("You're running Tick & Tock")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", ROUTES.seller);
  expect(screen.queryByRole("textbox", { name: "Store name" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Log out" }));
  expect(screen.getByRole("textbox", { name: "Store name" })).toBeInTheDocument();
  expect(store.getState().session).toMatchObject({ sellerId: null, buyerId: "acc-ahmed" });
});
