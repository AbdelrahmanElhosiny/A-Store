import { afterEach, beforeEach, expect, it } from "vitest";
import { act, cleanup, screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useNavigate } from "react-router-dom";
import BuyerHeader from "../BuyerHeader";
import { renderWithStore } from "../../../test/renderWithStore";
import { setViewportWidth } from "../../../test/viewport";
import { LocationProbe } from "../../../test/LocationProbe";
import { buildSeed } from "../../../seed/buildSeed";
import { CATEGORIES } from "../../../constant/categories";
import { ROUTES } from "../../../constant/routes";

beforeEach(() => setViewportWidth(360));
afterEach(cleanup);
let navRef: ReturnType<typeof useNavigate>;
const Nav = () => { navRef = useNavigate(); return null; };
const header = <><BuyerHeader /><LocationProbe /><Nav /></>;
const signedIn = () => {
  const seed = buildSeed(0);
  seed.session.buyerId = "acc-ahmed";
  return seed;
};
const inOrder = (elements: HTMLElement[]) => elements.slice(1).forEach((element, i) => {
  expect(elements[i].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Open menu" }));
  return screen.findByRole("dialog", { name: "Menu" });
};

it("phone row in order", () => {
  renderWithStore(header);
  const menu = screen.getByRole("button", { name: "Open menu" });
  const mode = screen.getByRole("link", { name: "Switch to selling" });
  const login = screen.getByRole("button", { name: "Log in" });
  const search = screen.getByRole("searchbox", { name: "Search A-Store" });
  inOrder([menu, screen.getByRole("link", { name: "A-Store home" }), mode, login,
    screen.getByRole("link", { name: "Cart, 0 items" }), search]);
  expect(menu).toHaveAttribute("aria-expanded", "false");
  expect(menu).toHaveAttribute("aria-controls", "site-menu");
  expect(mode.textContent).toBe("Sell");
  expect(login.textContent).toBe("");
  expect(search.closest('[data-row="search"]')).not.toBeNull();
  expect(screen.queryByRole("combobox", { name: "Search in" })).toBeNull();
  expect(screen.queryByRole("navigation", { name: "Categories" })).toBeNull();
});
it("drawer opens from the left with focus inside", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const button = screen.getByRole("button", { name: "Open menu" });
  const dialog = await openMenu(user);
  expect(dialog.closest(".MuiDrawer-paper")).toHaveClass("MuiDrawer-paperAnchorLeft", "buy");
  expect(button).toHaveAttribute("aria-expanded", "true");
  await waitFor(() => expect(within(dialog).getByRole("button", { name: "Close menu" })).toHaveFocus());
});
it("drawer order: greeting, switch, categories, then account links", async () => {
  const user = userEvent.setup();
  renderWithStore(header, { preloadedState: signedIn() });
  const drawer = within(await openMenu(user));
  const categories = drawer.getByRole("navigation", { name: "Shop by category" });
  expect(within(categories).getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")]))
    .toEqual([["All categories", ROUTES.search()], ...CATEGORIES.map(({ id, label }) => [label, ROUTES.category(id)])]);
  const links = [
    ["Orders", ROUTES.accountOrders], ["Addresses", ROUTES.accountAddresses], ["Payment methods", ROUTES.accountPayments],
  ].map(([name, href]) => {
    const link = drawer.getByRole("link", { name });
    expect(link).toHaveAttribute("href", href);
    return link;
  });
  const mode = drawer.getByRole("link", { name: "Switch to selling" });
  expect(mode.textContent).toBe("Switch to selling");
  inOrder([drawer.getByText("Hello, Ahmed"), mode, categories, drawer.getByRole("separator"),
    ...links, drawer.getByRole("button", { name: "Log out" }), drawer.getByRole("checkbox", { name: "Dark mode" }),
    drawer.getByRole("button", { name: "Reset demo data" })]);
});
it("guest greeting", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const drawer = within(await openMenu(user));
  expect(drawer.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  expect(drawer.getByRole("link", { name: "Create account" })).toHaveAttribute("href", ROUTES.signUp);
  expect(drawer.queryByRole("link", { name: "Orders" })).toBeNull();
});
it("drawer closes after navigation and leaves focus alone", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const button = screen.getByRole("button", { name: "Open menu" });
  const dialog = await openMenu(user);
  const removed = waitForElementToBeRemoved(dialog);
  await user.click(within(dialog).getByRole("link", { name: "Watches" }));
  await removed;
  expect(screen.getByTestId("location").textContent).toBe(ROUTES.category("watches"));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).not.toBe(button);
});
it("a path change from outside closes it", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const dialog = await openMenu(user);
  const removed = waitForElementToBeRemoved(dialog);
  act(() => navRef(ROUTES.category("bags")));
  await removed;
  expect(screen.getByTestId("location").textContent).toBe(ROUTES.category("bags"));
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("Escape returns focus to the menu button", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const button = screen.getByRole("button", { name: "Open menu" });
  const dialog = await openMenu(user);
  const removed = waitForElementToBeRemoved(dialog);
  await user.keyboard("{Escape}");
  await removed;
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(button).toHaveFocus();
});
it("Log in from the drawer", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const dialog = await openMenu(user);
  const removed = waitForElementToBeRemoved(dialog);
  await user.click(within(dialog).getByRole("button", { name: "Log in" }));
  await removed;
  const login = await screen.findByRole("dialog", { name: "Log in" });
  // MUI initially focuses the dialog container, which wraps its paper.
  await waitFor(() => expect(login.closest(".MuiModal-root")).toContainElement(document.activeElement as HTMLElement));
  await user.tab();
  expect(within(login).getByRole("button", { name: "Close" })).toHaveFocus();
  expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
});
it("Reset demo data from the drawer", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const dialog = await openMenu(user);
  const removed = waitForElementToBeRemoved(dialog);
  await user.click(within(dialog).getByRole("button", { name: "Reset demo data" }));
  await removed;
  const reset = await screen.findByRole("dialog", { name: "Reset demo data" });
  await waitFor(() => expect(reset.closest(".MuiModal-root")).toContainElement(document.activeElement as HTMLElement));
  await user.tab();
  expect(within(reset).getByRole("button", { name: "Close" })).toHaveFocus();
  expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull();
});

it.each(["Close menu", "backdrop"])("%s returns focus to the menu button", async (target) => {
  const user = userEvent.setup();
  renderWithStore(header);
  const button = screen.getByRole("button", { name: "Open menu" });
  const dialog = await openMenu(user);
  const removed = waitForElementToBeRemoved(dialog);
  await user.click(target === "Close menu"
    ? within(dialog).getByRole("button", { name: "Close menu" })
    : document.querySelector<HTMLElement>("#site-menu .MuiBackdrop-root")!);
  await removed;
  expect(button).toHaveFocus();
});
