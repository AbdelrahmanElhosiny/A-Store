import { afterEach, beforeEach, expect, it } from "vitest";
import { cleanup, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SellerLayout from "../../../layout/SellerLayout";
import { renderWithStore } from "../../../test/renderWithStore";
import { setViewportWidth } from "../../../test/viewport";
import { LocationProbe } from "../../../test/LocationProbe";
import { buildSeed } from "../../../seed/buildSeed";
import { ROUTES } from "../../../constant/routes";

beforeEach(() => setViewportWidth(360));
afterEach(cleanup);
const header = <><SellerLayout /><LocationProbe /></>;
const signedIn = () => {
  const seed = buildSeed(0);
  seed.session.sellerId = "acc-mona";
  return seed;
};
const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Open menu" }));
  return screen.findByRole("dialog", { name: "Menu" });
};
it("phone bar in order", () => {
  renderWithStore(header, { route: ROUTES.seller, preloadedState: signedIn() });
  const elements = [screen.getByRole("button", { name: "Open menu" }),
    screen.getByRole("link", { name: "A-Store seller centre home" }),
    screen.getByRole("link", { name: "Switch to shopping" }), screen.getByRole("button", { name: "Account menu, Mona" })];
  elements.slice(1).forEach((element, i) => {
    expect(elements[i].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  expect(elements[1]).not.toHaveTextContent("Seller centre");
  expect(elements[2].textContent).toBe("Shop");
  expect(screen.queryByRole("searchbox")).toBeNull();
  expect(screen.queryByRole("navigation", { name: "Seller centre" })).toBeNull();
});
it("drawer holds the sidebar items", async () => {
  const user = userEvent.setup();
  renderWithStore(header, { route: ROUTES.seller, preloadedState: signedIn() });
  const dialog = await openMenu(user);
  const drawer = within(dialog);
  expect(dialog.closest(".MuiDrawer-paper")).toHaveClass("sell");
  expect(drawer.getByText("Tick & Tock")).toBeInTheDocument();
  expect(drawer.getByRole("link", { name: "Switch to shopping" }).textContent).toBe("Switch to shopping");
  expect(within(drawer.getByRole("navigation", { name: "Seller centre" })).getByRole("link", { name: "Orders, 2 open" }))
    .toHaveAttribute("href", ROUTES.sellerOrders);
  expect(drawer.getByRole("separator")).toBeInTheDocument();
  expect(drawer.getByRole("checkbox", { name: "Dark mode" })).toBeInTheDocument();
  expect(drawer.getByRole("button", { name: "Reset demo data" })).toBeInTheDocument();
});
it("drawer closes after a sidebar link", async () => {
  const user = userEvent.setup();
  renderWithStore(header, { route: ROUTES.seller, preloadedState: signedIn() });
  const dialog = await openMenu(user);
  const removed = waitForElementToBeRemoved(dialog);
  await user.click(within(dialog).getByRole("link", { name: "Products" }));
  await removed;
  expect(screen.getByTestId("location").textContent).toBe(ROUTES.sellerProducts);
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("no store: drawer offers log in", async () => {
  const user = userEvent.setup();
  renderWithStore(header, { route: ROUTES.seller });
  const drawer = within(await openMenu(user));
  expect(drawer.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  expect(drawer.getByRole("link", { name: "Create a store" })).toHaveAttribute("href", ROUTES.sellerSignUp);
  expect(drawer.queryByRole("navigation", { name: "Seller centre" })).toBeNull();
});
