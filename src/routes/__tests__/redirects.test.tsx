import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocationProbe } from "../../test/LocationProbe";
import RouterIndex from "../Index";
import { LEGACY_REDIRECTS, ROUTES } from "../../constant/routes";
import { renderWithStore } from "../../test/renderWithStore";
import { saveState, loadState } from "../../app/persist";
import { buildSeed } from "../../seed/buildSeed";

const app = <><RouterIndex /><LocationProbe /></>;

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("legacy redirects", () => {
  it.each(Object.entries(LEGACY_REDIRECTS))("redirects %s to %s", async (from, to) => {
    renderWithStore(app, { route: from });
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe(to));
    await within(await screen.findByRole("main")).findByRole("heading", { level: 2 });
  });

  it.each([
    ["/buy/cart/", "/cart"],
    ["/sell/track-sold?x=1", "/seller?x=1"],
  ])("preserves queries and accepts trailing slashes: %s", async (from, to) => {
    renderWithStore(app, { route: from });
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe(to));
    await within(await screen.findByRole("main")).findByRole("heading", { level: 2 });
  });
});

describe("mode layouts", () => {
  it("renders an unknown buyer URL inside the buyer layout", async () => {
    renderWithStore(app, { route: "/nope" });
    const title = await screen.findByRole("heading", { name: "Page not found" });
    expect(title.closest(".buy")).not.toBeNull();
    expect(within(screen.getByRole("main")).getByRole("link", { name: "Go to the shop" })).toHaveAttribute("href", ROUTES.home);
    expect(within(screen.getByRole("main")).getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "Home page" })).not.toBeInTheDocument();
  });

  it("guards an unknown seller URL while signed out", async () => {
    renderWithStore(app, { route: `${ROUTES.seller}/nope` });
    expect(await screen.findByRole("heading", { name: "Pick your store" })).toBeInTheDocument();
    expect(screen.queryByText("Page not found")).not.toBeInTheDocument();
  });

  it("renders an unknown seller URL with a return to the seller home", async () => {
    const seed = buildSeed(Date.now());
    renderWithStore(app, {
      route: `${ROUTES.seller}/nope`,
      preloadedState: { ...seed, session: { ...seed.session, sellerId: "acc-mona" } },
    });
    const title = await screen.findByRole("heading", { name: "Page not found" });
    expect(title.closest(".sell")).not.toBeNull();
    expect(within(screen.getByRole("main")).getByRole("link", { name: "Go to the seller centre" })).toHaveAttribute("href", ROUTES.seller);
    expect(within(screen.getByRole("main")).getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "Home page" })).not.toBeInTheDocument();
  });

  it.each([
    ROUTES.sellerSignUp,
    `${ROUTES.sellerSignUp}/`,
    ROUTES.sellerSignUp.replace("seller", "Seller").replace("sign-up", "Sign-Up"),
  ])("keeps %s available while signed out", async (route) => {
    renderWithStore(app, { route });
    expect(await screen.findByRole("heading", { name: "Create a store" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Store name" })).toBeInTheDocument();
    expect(screen.queryByText("Pick your store")).not.toBeInTheDocument();
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
    const seed = buildSeed(Date.now());
    renderWithStore(app, { route, preloadedState: { ...seed, session: { ...seed.session, sellerId: "acc-mona" } } });
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
    expect(screen.getByRole("link", { name: "A-Store home" })).toHaveAttribute("href", ROUTES.home);
    expect(screen.getByRole("link", { name: "Cart, 2 items" })).toHaveAttribute("href", ROUTES.cart);
    expect(screen.getByRole("link", { name: "Cart, 2 items" })).toHaveTextContent("2");
    expect(screen.getByRole("link", { name: "Your orders" })).toHaveAttribute("href", ROUTES.accountOrders);
  });

  it("saves a product and returns to the seller product grid", async () => {
    const user = userEvent.setup();
    const seed = buildSeed(Date.now());
    const { store } = renderWithStore(app, { route: ROUTES.sellerProductNew, preloadedState: { ...seed, session: { ...seed.session, sellerId: "acc-mona" } } });
    await screen.findByRole("heading", { name: "Add new item" });
    const nav = within(screen.getByRole("navigation", { name: "Seller centre" }));
    expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("href", ROUTES.seller);
    expect(nav.getByRole("link", { name: "Products" })).toHaveAttribute("href", ROUTES.sellerProducts);
    expect(nav.getByRole("link", { name: "Orders, 2 open" })).toHaveAttribute("href", ROUTES.sellerOrders);
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Route test product");
    await user.type(screen.getByRole("textbox", { name: "Description" }), "A product for the route test.");
    await user.type(screen.getByRole("textbox", { name: "Price" }), "12.50");
    await user.type(screen.getByRole("spinbutton", { name: "Stock" }), "3");
    await user.click(screen.getByRole("button", { name: "Add item" }));
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe(ROUTES.sellerProducts));
    expect(store.getState().items.find(({ name }) => name === "Route test product")).toMatchObject({ price: 12.5, stockNum: 3, storeId: "store-tick-tock", category: "watches" });
    expect(await screen.findByRole("heading", { name: "Route test product" })).toBeInTheDocument();
  });
});

describe("mode sessions across navigation", () => {
  it("keeps the guest cart, both logins and remembered query independent, including a saved-data reload", async () => {
    const user = userEvent.setup();
    const seed = buildSeed(0);
    const route = `${ROUTES.sellerOrders}?tab=to-ship`;
    const cart = [{ itemId: "item-hl-ceramic-mug", quantity: 1 }];
    const { store, unmount } = renderWithStore(app, {
      route,
      preloadedState: { ...seed, session: { ...seed.session, guestCart: cart } },
    });
    await user.click(await screen.findByRole("button", { name: "Hearth Lane" }));
    const heading = await screen.findByRole("heading", { name: "Orders", level: 2 });
    expect(await screen.findByText("Logged in to Hearth Lane")).toBeVisible();
    await waitFor(() => expect(heading).toHaveFocus());
    expect(store.getState().session).toMatchObject({ buyerId: null, sellerId: "acc-laila", guestCart: cart });
    expect(screen.getByRole("link", { name: "A-Store seller centre home" })).toHaveAttribute("href", ROUTES.seller);
    await user.click(screen.getByRole("link", { name: "Switch to shopping" }));
    await user.click(await screen.findByRole("button", { name: "Log in" }));
    await user.click(await screen.findByRole("menuitem", { name: "Log in" }));
    await user.click(await screen.findByRole("button", { name: /Log in as Ahmed/ }));
    expect(store.getState().session.buyerId).toBe("acc-ahmed");
    await user.click(await screen.findByRole("link", { name: "Switch to selling" }));
    await screen.findByRole("heading", { name: "Orders", level: 2 });
    expect(screen.getByTestId("location").textContent).toBe(route);
    expect(screen.getByText("Hearth Lane")).toBeInTheDocument();
    expect(saveState(store.getState())).toBe(true);
    const saved = loadState().state;
    expect(saved?.session).toMatchObject({ buyerId: "acc-ahmed", sellerId: "acc-laila", lastPath: { seller: route } });
    unmount();
    const reloaded = renderWithStore(app, { route, preloadedState: saved });
    await user.click(await screen.findByRole("button", { name: "Account menu, Laila" }));
    await user.click(await screen.findByRole("menuitem", { name: "Log out" }));
    await screen.findByRole("heading", { name: "Pick your store" });
    await user.click(screen.getByRole("link", { name: "Switch to shopping" }));
    await screen.findByRole("button", { name: "Hello, Ahmed" });
    expect(reloaded.store.getState().session).toMatchObject({ buyerId: "acc-ahmed", sellerId: null });
    const buyer = reloaded.store.getState().accounts.find(({ id }) => id === "acc-ahmed");
    expect(buyer?.role === "buyer" && buyer.cart).toEqual(cart);
  });
});
