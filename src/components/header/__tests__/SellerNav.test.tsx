import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SellerNav from "../SellerNav";
import { renderWithStore } from "../../../test/renderWithStore";
import { setViewportWidth } from "../../../test/viewport";
import { LocationProbe } from "../../../test/LocationProbe";
import { buildSeed } from "../../../seed/buildSeed";
import { ROUTES } from "../../../constant/routes";

beforeEach(() => setViewportWidth(1280));
afterEach(cleanup);
const nav = <><SellerNav /><LocationProbe /></>;
const signedIn = (sellerId = "acc-mona") => {
  const seed = buildSeed(0);
  seed.session.sellerId = sellerId;
  return seed;
};
it("sidebar links in order", () => {
  renderWithStore(nav, { route: ROUTES.seller, preloadedState: signedIn() });
  const links = within(screen.getByRole("navigation", { name: "Seller centre" })).getAllByRole("link");
  const expected = [["Home", "/seller"], ["Orders, 2 open", "/seller/orders"], ["Products", "/seller/products"], ["Customers", "/seller/customers"], ["Store settings", "/seller/store"]];
  expect(links).toHaveLength(expected.length);
  expected.forEach(([name, href], i) => {
    expect(links[i]).toHaveAccessibleName(name);
    expect(links[i]).toHaveAttribute("href", href);
  });
});
it("badge per store", () => {
  renderWithStore(nav, { route: ROUTES.seller, preloadedState: signedIn("acc-karim") });
  expect(within(screen.getByRole("link", { name: "Orders, 1 open" })).getByText("1")).toBeInTheDocument();
});
it("zero hides the badge", () => {
  const seed = signedIn();
  seed.orders.forEach((order) => {
    if (["A-10012", "A-10013"].includes(order.number)) {
      order.shipments.forEach((shipment) => { if (shipment.storeId === "store-tick-tock") shipment.status = "shipped"; });
    }
  });
  renderWithStore(nav, { route: ROUTES.seller, preloadedState: seed });
  const orders = screen.getByRole("link", { name: "Orders" });
  expect(orders).toHaveTextContent(/^Orders$/);
  expect(within(orders).queryByText("0")).toBeNull();
});
it("active page", () => {
  renderWithStore(nav, { route: ROUTES.sellerOrder("abc"), preloadedState: signedIn() });
  expect(screen.getByRole("link", { name: "Orders, 2 open" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
});
it("calls onNavigate for a link", async () => {
  const user = userEvent.setup();
  const onNavigate = vi.fn();
  renderWithStore(<><SellerNav onNavigate={onNavigate} /><LocationProbe /></>, { route: ROUTES.seller, preloadedState: signedIn() });
  await user.click(screen.getByRole("link", { name: "Products" }));
  expect(onNavigate).toHaveBeenCalledOnce();
  expect(screen.getByTestId("location").textContent).toBe(ROUTES.sellerProducts);
});
