import { afterEach, beforeEach, expect, it } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SellerHeader from "../SellerHeader";
import SellerLayout from "../../../layout/SellerLayout";
import { renderWithStore } from "../../../test/renderWithStore";
import { setViewportWidth } from "../../../test/viewport";
import { LocationProbe } from "../../../test/LocationProbe";
import { buildSeed } from "../../../seed/buildSeed";
import { ROUTES } from "../../../constant/routes";

beforeEach(() => setViewportWidth(1280));
afterEach(cleanup);
const header = <><SellerHeader /><LocationProbe /></>;
const signedIn = () => {
  const seed = buildSeed(0);
  seed.session.sellerId = "acc-mona";
  seed.session.buyerId = "acc-ahmed";
  return seed;
};
it("top bar", () => {
  renderWithStore(header, { route: ROUTES.seller, preloadedState: signedIn() });
  expect(screen.getByRole("link", { name: "A-Store seller centre home" })).toHaveAttribute("href", "/seller");
  expect(screen.getByRole("link", { name: "A-Store seller centre home" })).toHaveTextContent("Seller centre");
  expect(screen.getByText("Tick & Tock")).toBeInTheDocument();
  expect(screen.getByRole("searchbox", { name: "Search orders and products" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Switch to shopping" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Account menu, Mona" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /cart/i })).toBeNull();
  expect(screen.queryByRole("navigation", { name: "Categories" })).toBeNull();
});
it("seller search goes to orders", async () => {
  const user = userEvent.setup();
  renderWithStore(header, { route: ROUTES.seller, preloadedState: signedIn() });
  const input = screen.getByRole("searchbox", { name: "Search orders and products" });
  await user.type(input, "A-10012{Enter}");
  expect(screen.getByTestId("location").textContent).toBe("/seller/orders?q=A-10012");
  await user.clear(input);
  await user.type(input, " {Enter}");
  expect(screen.getByTestId("location").textContent).toBe("/seller/orders?q=A-10012");
});
it("seller account menu", async () => {
  const user = userEvent.setup();
  const { store } = renderWithStore(header, { route: ROUTES.seller, preloadedState: signedIn() });
  await user.click(screen.getByRole("button", { name: "Account menu, Mona" }));
  const menu = await screen.findByRole("menu");
  expect(Array.from(menu.children).map((item) => item.getAttribute("role") === "separator" ? "separator" : item.textContent))
    .toEqual(["Store settings", "separator", "Dark mode", "Log out"]);
  expect(within(menu).getByRole("menuitem", { name: "Store settings" })).toHaveAttribute("href", "/seller/store");
  expect(within(menu).getByRole("menuitem", { name: "Store settings" })).toHaveClass("primary");
  expect(menu.closest(".MuiPaper-root")).toHaveClass("sell");
  await user.click(within(menu).getByRole("menuitem", { name: "Log out" }));
  expect(store.getState().session).toMatchObject({ sellerId: null, buyerId: "acc-ahmed" });
});
it("no store signed in", async () => {
  const user = userEvent.setup();
  const { unmount } = renderWithStore(header, { route: ROUTES.sellerOrders });
  expect(screen.queryByText("Tick & Tock")).toBeNull();
  expect(screen.queryByRole("searchbox")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Log in" }));
  const menu = await screen.findByRole("menu");
  expect(Array.from(menu.children).map((item) => item.textContent))
    .toEqual(["Log in", "New here? Create a store", "Dark mode"]);
  expect(within(menu).getByRole("menuitem", { name: "New here? Create a store" })).toHaveAttribute("href", "/seller/sign-up");
  unmount();
  renderWithStore(<SellerLayout />, { route: ROUTES.sellerOrders });
  expect(screen.queryByRole("navigation", { name: "Seller centre" })).toBeNull();
});
it("long store name", () => {
  const seed = signedIn();
  seed.stores.find(({ id }) => id === "store-tick-tock")!.name = "The Very Long Store Name Company";
  renderWithStore(header, { route: ROUTES.seller, preloadedState: seed });
  expect(screen.getByTitle("The Very Long Store Name Company")).toHaveClass("truncate");
});
