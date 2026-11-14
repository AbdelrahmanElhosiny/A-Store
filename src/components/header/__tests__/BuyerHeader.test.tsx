import { afterEach, beforeEach, expect, it } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BuyerHeader from "../BuyerHeader";
import { renderWithStore } from "../../../test/renderWithStore";
import { setViewportWidth } from "../../../test/viewport";
import { LocationProbe } from "../../../test/LocationProbe";
import { buildSeed } from "../../../seed/buildSeed";
import { CATEGORIES } from "../../../constant/categories";
import { ROUTES } from "../../../constant/routes";

beforeEach(() => setViewportWidth(1280));
afterEach(cleanup);
const header = <><BuyerHeader /><LocationProbe /></>;
const signedIn = () => {
  const seed = buildSeed(0);
  seed.session.buyerId = "acc-ahmed";
  return seed;
};

it("row 1 in order", () => {
  renderWithStore(header);
  const elements = [
    screen.getByRole("link", { name: "A-Store home" }),
    screen.getByRole("searchbox", { name: "Search A-Store" }),
    screen.getByRole("combobox", { name: "Search in" }),
    screen.getByRole("link", { name: "Switch to selling" }),
    screen.getByRole("button", { name: "Log in" }),
    screen.getByRole("link", { name: "Cart, 0 items" }),
  ];
  elements.slice(1).forEach((element, i) => {
    expect(elements[i].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  expect(elements[0]).toHaveAttribute("href", "/");
  expect(elements[5]).toHaveAttribute("href", "/cart");
  expect(within(elements[2]).getAllByRole("option").map((option) => option.textContent))
    .toEqual(["All categories", ...CATEGORIES.map(({ label }) => label)]);
});
it("search submit navigates", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const input = screen.getByRole("searchbox", { name: "Search A-Store" });
  await user.type(input, "strap");
  await user.selectOptions(screen.getByRole("combobox", { name: "Search in" }), "Watches");
  await user.type(input, "{Enter}");
  expect(screen.getByTestId("location").textContent).toBe("/search?q=strap&category=watches");
  await user.clear(input);
  await user.selectOptions(screen.getByRole("combobox", { name: "Search in" }), "All categories");
  await user.type(input, "lamp{Enter}");
  expect(screen.getByTestId("location").textContent).toBe("/search?q=lamp");
});
it("blank search stays put", async () => {
  const user = userEvent.setup();
  renderWithStore(header, { route: ROUTES.category("bags") });
  const input = screen.getByRole("searchbox", { name: "Search A-Store" });
  await user.selectOptions(screen.getByRole("combobox"), "All categories");
  await user.type(input, "   {Enter}");
  expect(screen.getByTestId("location").textContent).toBe("/c/bags");
  await user.selectOptions(screen.getByRole("combobox"), "Audio");
  await user.type(input, "{Enter}");
  expect(screen.getByTestId("location").textContent).toBe("/c/audio");
});
it("category row links", () => {
  renderWithStore(header);
  const links = within(screen.getByRole("navigation", { name: "Categories" })).getAllByRole("link");
  expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
    ["All categories", "/search"], ...CATEGORIES.map(({ id, label }) => [label, ROUTES.category(id)]),
  ]);
});
it("Ship to shows the default address city", () => {
  const { unmount } = renderWithStore(header, { preloadedState: signedIn() });
  expect(screen.getByRole("link", { name: "Ship to Cairo" })).toHaveAttribute("href", "/account/addresses");
  unmount();
  const guest = renderWithStore(header);
  expect(screen.queryByText(/Ship to/)).toBeNull();
  guest.unmount();
  const seed = signedIn();
  seed.accounts.forEach((account) => {
    if (account.id === "acc-ahmed" && account.role === "buyer") account.addresses.find(({ isDefault }) => isDefault)!.city = "";
  });
  renderWithStore(header, { preloadedState: seed });
  expect(screen.queryByText(/Ship to/)).toBeNull();
});
it("cart count", () => {
  const seed = buildSeed(0);
  seed.session.guestCart = [{ itemId: "item-hl-ceramic-mug", quantity: 2 }, { itemId: "item-ps-headphones", quantity: 1 }];
  renderWithStore(header, { preloadedState: seed });
  expect(screen.getByRole("link", { name: "Cart, 3 items" })).toHaveAttribute("href", "/cart");
});
it("account button when signed in", () => {
  renderWithStore(header, { preloadedState: signedIn() });
  expect(within(screen.getByRole("button", { name: "Hello, Ahmed" })).getByText("A")).toBeInTheDocument();
});
it("long names truncate but keep their full name", () => {
  const seed = signedIn();
  seed.accounts.find(({ id }) => id === "acc-ahmed")!.name = "Abdelrahman Elhosiny Ali";
  renderWithStore(header, { preloadedState: seed });
  expect(screen.getByRole("button", { name: "Hello, Abdelrahman Elhosiny Ali" })).toBeInTheDocument();
  expect(screen.getByTitle("Abdelrahman Elhosiny Ali")).toHaveClass("truncate");
});
it("the theme switch left the header", () => {
  renderWithStore(header);
  expect(screen.queryByRole("checkbox", { name: "Dark mode" })).toBeNull();
});
it("scope follows category links and resets away from a category", async () => {
  const user = userEvent.setup();
  renderWithStore(header, { route: ROUTES.category("bags") });
  expect(screen.getByRole("combobox")).toHaveValue("bags");
  await user.click(screen.getByRole("link", { name: "Audio" }));
  expect(screen.getByRole("combobox")).toHaveValue("audio");
  await user.click(screen.getByRole("link", { name: "A-Store home" }));
  expect(screen.getByRole("combobox")).toHaveValue("all");
});
it("a picked scope stays until the route leaves a category", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const scope = screen.getByRole("combobox", { name: "Search in" });
  await user.selectOptions(scope, "Bags");
  await user.click(screen.getByRole("link", { name: "Cart, 0 items" }));
  expect(screen.getByTestId("location").textContent).toBe("/cart");
  expect(scope).toHaveValue("bags");
  await user.selectOptions(scope, "Watches");
  await user.type(screen.getByRole("searchbox", { name: "Search A-Store" }), "strap{Enter}");
  expect(screen.getByTestId("location").textContent).toBe("/search?q=strap&category=watches");
  expect(scope).toHaveValue("watches");
  await user.click(screen.getByRole("link", { name: "A-Store home" }));
  expect(scope).toHaveValue("all");
});
