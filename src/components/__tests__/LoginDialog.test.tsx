import { afterEach, expect, it, vi } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginDialog from "../LoginDialog";
import { ROUTES } from "../../constant/routes";
import { buildSeed } from "../../seed/buildSeed";
import { renderWithStore } from "../../test/renderWithStore";

afterEach(cleanup);
it.each(["buyer", "seller"] as const)("lists and logs in only %s accounts", async (role) => {
  const user = userEvent.setup();
  const seed = buildSeed(0);
  seed.session.guestCart = [{ itemId: "item-hl-ceramic-mug", quantity: 3 }];
  const onClose = vi.fn();
  const { store } = renderWithStore(<LoginDialog isOpen onClose={onClose} />, {
    route: role === "seller" ? ROUTES.seller : ROUTES.home, preloadedState: seed,
  });
  const dialog = within(screen.getByRole("dialog", { name: role === "seller" ? "Log in to your store" : "Log in" }));
  const accounts = seed.accounts.filter((account) => account.role === role);
  expect(within(dialog.getByRole("list", { name: "Accounts" })).getAllByRole("button")).toHaveLength(accounts.length);
  accounts.forEach((account) => expect(dialog.getByText(role === "seller" ? account.name : `Log in as ${account.name}`)).toBeInTheDocument());
  if (role === "seller") {
    seed.stores.forEach(({ name }) => expect(dialog.getByText(name)).toBeInTheDocument());
    expect(dialog.queryByText(/Your cart/)).not.toBeInTheDocument();
    expect(dialog.getByRole("link", { name: "New here? Create a store" })).toHaveAttribute("href", ROUTES.sellerSignUp);
  } else expect(dialog.getByText("Your cart (3 items) comes with you.")).toBeInTheDocument();
  await user.click(dialog.getByRole("button", { name: role === "seller" ? /Tick & Tock/ : /Log in as Ahmed/ }));
  expect(store.getState().session[role === "seller" ? "sellerId" : "buyerId"]).toBe(role === "seller" ? "acc-mona" : "acc-ahmed");
  expect(store.getState().session[role === "seller" ? "buyerId" : "sellerId"]).toBeNull();
  expect(store.getState().notification.message).toBe(role === "seller" ? "Logged in to Tick & Tock" : "Logged in as Ahmed");
  expect(onClose).toHaveBeenCalledOnce();
});
