import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import RouterIndex from "../Index";
import { LEGACY_REDIRECTS, ROUTES } from "../../constant/routes";
import { renderWithStore } from "../../test/renderWithStore";
import { buildSeed } from "../../seed/buildSeed";

const LocationProbe = () => {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname + search}</output>;
};
const app = <><RouterIndex /><LocationProbe /></>;

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("legacy redirects", () => {
  it.each(Object.entries(LEGACY_REDIRECTS))("redirects %s to %s", async (from, to) => {
    renderWithStore(app, { route: from });
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe(to));
    await screen.findByRole("heading", { level: 2 });
  });

  it.each([
    ["/buy/cart/", "/cart"],
    ["/sell/track-sold?x=1", "/seller?x=1"],
  ])("preserves queries and accepts trailing slashes: %s", async (from, to) => {
    renderWithStore(app, { route: from });
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe(to));
    await screen.findByRole("heading", { level: 2 });
  });
});

describe("mode layouts", () => {
  it("renders an unknown buyer URL inside the buyer layout", async () => {
    renderWithStore(app, { route: "/nope" });
    const title = await screen.findByRole("heading", { name: "Page not found" });
    expect(title.closest(".buy")).not.toBeNull();
    expect(within(screen.getByRole("main")).getByRole("link", { name: "Go to the shop" })).toHaveAttribute("href", ROUTES.home);
  });

  it("renders an unknown seller URL with a return to the seller home", async () => {
    const seed = buildSeed(Date.now());
    renderWithStore(app, {
      route: "/seller/nope",
      preloadedState: { ...seed, session: { ...seed.session, sellerId: "acc-mona" } },
    });
    const title = await screen.findByRole("heading", { name: "Page not found" });
    expect(title.closest(".sell")).not.toBeNull();
    expect(within(screen.getByRole("main")).getByRole("link", { name: "Go to your items" })).toHaveAttribute("href", ROUTES.seller);
  });

  it("keeps seller sign-up available while signed out", async () => {
    renderWithStore(app, { route: ROUTES.sellerSignUp });
    expect(await screen.findByText("Arrives in Task 2.")).toBeInTheDocument();
    expect(within(screen.getByRole("main")).getByRole("link")).toHaveAttribute("href", ROUTES.seller);
  });

  it("renders the category placeholder with buyer navigation", async () => {
    renderWithStore(app, { route: ROUTES.category("watches") });
    expect(await screen.findByRole("heading", { name: "Category" })).toBeInTheDocument();
    expect(screen.getByText("Arrives in Phase D.")).toBeInTheDocument();
    expect(within(screen.getByRole("main")).getByRole("link")).toHaveAttribute("href", ROUTES.home);
  });
});


describe("route coverage", () => {
  it.each([
    [ROUTES.search("a b"), "Search results", "Phase D"],
    [ROUTES.product("item-1"), "Product", "Phase D"],
    [ROUTES.store("tick-tock"), "Store", "Phase D"],
    [ROUTES.checkout, "Checkout", "Phase D"],
    [ROUTES.account, "Your account", "Phase D"],
    [ROUTES.accountOrder("order-1"), "Order details", "Phase D"],
    [ROUTES.accountAddresses, "Your addresses", "Phase F"],
    [ROUTES.accountPayments, "Payment methods", "Phase F"],
    [ROUTES.accountProfile, "Your profile", "Phase F"],
    [ROUTES.accountSaved, "Saved items", "Phase F"],
    [ROUTES.sellerProduct("item-1"), "Product details", "Phase E"],
    [ROUTES.sellerOrders, "Orders", "Phase E"],
    [ROUTES.sellerOrder("order-1"), "Order details", "Phase E"],
    [ROUTES.sellerCustomers, "Customers", "Phase E"],
    [ROUTES.sellerCustomer("acc-ahmed"), "Customer details", "Phase E"],
    [ROUTES.sellerStore, "Your store", "Phase E"],
  ])("renders the placeholder at %s", async (route, title, phase) => {
    renderWithStore(app, { route });
    expect(await screen.findByRole("heading", { name: title, level: 2 })).toBeInTheDocument();
    expect(screen.getByText(`Arrives in ${phase}.`)).toBeInTheDocument();
  });

  it("shows buyer links and the selected cart count on the home grid", async () => {
    const seed = buildSeed(Date.now());
    renderWithStore(app, {
      route: ROUTES.home,
      preloadedState: {
        ...seed,
        session: { ...seed.session, guestCart: [{ itemId: "item-hl-ceramic-mug", quantity: 2 }] },
      },
    });
    await screen.findAllByRole("button", { name: "Add to cart" });
    const nav = within(screen.getByRole("navigation", { name: "Main" }));
    expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("href", ROUTES.home);
    expect(nav.getByRole("link", { name: /Cart/ })).toHaveAttribute("href", ROUTES.cart);
    expect(nav.getByRole("link", { name: /Cart/ })).toHaveTextContent("2");
    expect(nav.getByRole("link", { name: "Orders" })).toHaveAttribute("href", ROUTES.accountOrders);
  });

  it("saves a product and returns to the seller product grid", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(app, { route: ROUTES.sellerProductNew });
    await screen.findByRole("heading", { name: "Add new item" });
    const nav = within(screen.getByRole("navigation", { name: "Main" }));
    expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("href", ROUTES.seller);
    expect(nav.getByRole("link", { name: "Products" })).toHaveAttribute("href", ROUTES.sellerProducts);
    expect(nav.getByRole("link", { name: "Add product" })).toHaveAttribute("href", ROUTES.sellerProductNew);
    expect(nav.getByRole("link", { name: "Orders" })).toHaveAttribute("href", ROUTES.sellerOrders);
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Route test product");
    await user.type(screen.getByRole("textbox", { name: "Description" }), "A product for the route test.");
    await user.type(screen.getByRole("textbox", { name: "Price" }), "12.50");
    await user.type(screen.getByRole("spinbutton", { name: "Stock" }), "3");
    await user.click(screen.getByRole("button", { name: "Add item" }));
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe(ROUTES.sellerProducts));
    expect(store.getState().items.find(({ name }) => name === "Route test product")).toMatchObject({ price: 12.5, stockNum: 3 });
    expect(await screen.findByRole("heading", { name: "Route test product" })).toBeInTheDocument();
  });
});
