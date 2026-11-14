import { afterEach, beforeEach, expect, it } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import BuyerLayout from "../BuyerLayout";
import SellerLayout from "../SellerLayout";
import { renderWithStore } from "../../test/renderWithStore";
import { setViewportWidth } from "../../test/viewport";
import { buildSeed } from "../../seed/buildSeed";
import { ROUTES } from "../../constant/routes";
import { CATEGORIES } from "../../constant/categories";
import { EXTERNAL_LINK } from "../../constant/linkConstant";

beforeEach(() => setViewportWidth(1280));
afterEach(cleanup);
const layout = (side: "buy" | "sell") => <Routes><Route element={side === "buy" ? <BuyerLayout /> : <SellerLayout />}><Route path="*" element={<h2>Page</h2>} /></Route></Routes>;
const signedIn = () => {
  const seed = buildSeed(0);
  seed.session.sellerId = "acc-mona";
  return seed;
};
it("skip link and h1 per mode", () => {
  const buyer = renderWithStore(layout("buy"));
  expect(screen.getAllByRole("link")[0]).toHaveAccessibleName("Skip to content");
  expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "#main");
  expect(screen.getByRole("heading", { level: 1, name: "A-Store shop" })).toBeInTheDocument();
  buyer.unmount();
  renderWithStore(layout("sell"), { route: ROUTES.seller, preloadedState: signedIn() });
  expect(screen.getAllByRole("link")[0]).toHaveAccessibleName("Skip to content");
  expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "#main");
  expect(screen.getByRole("heading", { level: 1, name: "A-Store seller centre" })).toBeInTheDocument();
});
it("sidebar sits outside main", () => {
  renderWithStore(layout("sell"), { route: ROUTES.seller, preloadedState: signedIn() });
  const main = screen.getByRole("main");
  expect(main).not.toContainElement(screen.getByRole("navigation", { name: "Seller centre" }));
  expect(within(main).getAllByRole("heading")[0]).toHaveTextContent("Page");
});
it("footer columns in buyer mode", () => {
  renderWithStore(layout("buy"));
  const footer = within(screen.getByRole("contentinfo"));
  const shop = within(footer.getByRole("heading", { name: "Shop by category" }).parentElement!);
  expect(shop.getAllByRole("link").map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
    ["All categories", "/search"], ...CATEGORIES.map(({ id, label }) => [label, ROUTES.category(id)]),
  ]);
  const help = within(footer.getByRole("heading", { name: "Help" }).parentElement!);
  expect(help.getByRole("link", { name: "Your orders" })).toHaveAttribute("href", "/account/orders");
  expect(help.getByRole("link", { name: "Sell on A-Store" })).toHaveAttribute("href", "/seller");
  expect(help.getByRole("link", { name: "How this demo was built" })).toHaveAttribute("href", EXTERNAL_LINK.AI_LOG);
  expect(footer.getByRole("heading", { name: "About" })).toBeInTheDocument();
  ["Source", "Classic version", "What AI changed"].forEach((name) => expect(footer.getByRole("link", { name })).toBeInTheDocument());
  expect(footer.getByRole("button", { name: "Reset demo data" })).toBeInTheDocument();
});
it("seller footer stays one row", () => {
  renderWithStore(layout("sell"), { route: ROUTES.seller, preloadedState: signedIn() });
  expect(screen.queryByRole("heading", { name: "Shop by category" })).toBeNull();
});
it("phones keep the existing navbar and footer", async () => {
  setViewportWidth(767);
  const buyer = renderWithStore(layout("buy"));
  expect(await screen.findByRole("button", { name: "Open menu", hidden: true })).toBeInTheDocument();
  expect(screen.queryByRole("searchbox")).toBeNull();
  expect(screen.queryByRole("heading", { name: "Shop by category" })).toBeNull();
  buyer.unmount();
  renderWithStore(layout("sell"), { route: ROUTES.seller, preloadedState: signedIn() });
  expect(await screen.findByRole("button", { name: "Open menu", hidden: true })).toBeInTheDocument();
  expect(screen.queryByRole("navigation", { name: "Seller centre" })).toBeNull();
});
it("768 pixels uses the wide header", () => {
  setViewportWidth(768);
  renderWithStore(layout("buy"));
  expect(screen.getByRole("searchbox", { name: "Search A-Store" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Open menu" })).toBeNull();
});
