import { afterEach, beforeEach, expect, it } from "vitest";
import { cleanup, screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef } from "react";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "../../../constant/routes";
import BuyerHeader from "../BuyerHeader";
import { renderWithStore } from "../../../test/renderWithStore";
import { setViewportWidth } from "../../../test/viewport";
import { LocationProbe } from "../../../test/LocationProbe";
import { buildSeed } from "../../../seed/buildSeed";

beforeEach(() => setViewportWidth(1280));
afterEach(cleanup);
const header = <><BuyerHeader /><LocationProbe /></>;
const signedIn = () => {
  const seed = buildSeed(0);
  seed.session.buyerId = "acc-ahmed";
  seed.session.sellerId = "acc-mona";
  return seed;
};
const items = (menu: HTMLElement) => Array.from(menu.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"], [role="separator"]'));

it("logged out", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const button = screen.getByRole("button", { name: "Log in" });
  await user.click(button);
  const menu = await screen.findByRole("menu");
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(button).toHaveAttribute("aria-controls", menu.id);
  expect(items(menu).map((item) => item.textContent)).toEqual(["Log in", "New here? Create an account", "Dark mode"]);
  expect(within(menu).getByRole("menuitem", { name: "New here? Create an account" })).toHaveAttribute("href", "/sign-up");
  await user.click(within(menu).getByRole("menuitem", { name: "Log in" }));
  expect(await screen.findByRole("dialog", { name: "Log in" })).toBeInTheDocument();
  expect(screen.queryByRole("menu")).toBeNull();
});
it("logged in", async () => {
  const user = userEvent.setup();
  renderWithStore(header, { preloadedState: signedIn() });
  await user.click(screen.getByRole("button", { name: "Hello, Ahmed" }));
  const menu = await screen.findByRole("menu");
  expect(items(menu).map((item) => item.getAttribute("role") === "separator" ? "separator" : item.textContent))
    .toEqual(["Your account", "Orders", "Addresses", "Payment methods", "separator", "Dark mode", "Log out"]);
  const links = [
    ["Your account", "/account"], ["Orders", "/account/orders"],
    ["Addresses", "/account/addresses"], ["Payment methods", "/account/payments"],
  ];
  links.forEach(([name, href]) => expect(within(menu).getByRole("menuitem", { name })).toHaveAttribute("href", href));
  expect(within(menu).getByRole("menuitem", { name: "Your account" })).toHaveClass("primary");
  expect(within(menu).getByRole("menuitemcheckbox", { name: "Dark mode" })).toHaveClass("secondary");
  expect(within(menu).getByRole("menuitem", { name: "Log out" })).toHaveClass("secondary");
});
it("log out signs out of buyer mode only", async () => {
  const user = userEvent.setup();
  const { store } = renderWithStore(header, { preloadedState: signedIn() });
  await user.click(screen.getByRole("button", { name: "Hello, Ahmed" }));
  await user.click(await screen.findByRole("menuitem", { name: "Log out" }));
  expect(store.getState().session).toMatchObject({ buyerId: null, sellerId: "acc-mona" });
  expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
});
it("Dark mode toggles and keeps the menu open", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  await user.click(screen.getByRole("button", { name: "Log in" }));
  const theme = await screen.findByRole("menuitemcheckbox", { name: "Dark mode" });
  expect(theme).toHaveAttribute("aria-checked", "false");
  await user.click(theme);
  expect(theme).toHaveAttribute("aria-checked", "true");
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(screen.getByRole("menu")).toBeInTheDocument();
});
it("keyboard: arrows, Escape, Tab", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const button = screen.getByRole("button", { name: "Log in" });
  button.focus();
  await user.keyboard("{Enter}");
  const first = await screen.findByRole("menuitem", { name: "Log in" });
  await waitFor(() => expect(first).toHaveFocus());
  await user.keyboard("{ArrowDown}{ArrowDown}");
  const theme = screen.getByRole("menuitemcheckbox", { name: "Dark mode" });
  expect(theme).toHaveFocus();
  await user.keyboard("{ArrowDown}");
  expect(first).toHaveFocus();
  await user.keyboard("{ArrowDown}{ArrowDown} ");
  expect(theme).toHaveAttribute("aria-checked", "true");
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  expect(button).toHaveFocus();
  expect(button).toHaveAttribute("aria-expanded", "false");
  await user.keyboard("{Enter}");
  await screen.findByRole("menu");
  await user.tab();
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  expect(button).toHaveFocus();
  expect(button).toHaveAttribute("aria-expanded", "false");
});
it("menu paper carries the mode class", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  await user.click(screen.getByRole("button", { name: "Log in" }));
  expect((await screen.findByRole("menu")).closest(".MuiPaper-root")).toHaveClass("buy");
});

it("login Escape returns focus to the account button", async () => {
  const user = userEvent.setup();
  renderWithStore(header);
  const button = screen.getByRole("button", { name: "Log in" });
  await user.click(button);
  await user.click(await screen.findByRole("menuitem", { name: "Log in" }));
  const dialog = await screen.findByRole("dialog", { name: "Log in" });
  const removed = waitForElementToBeRemoved(dialog);
  await user.keyboard("{Escape}");
  await removed;
  expect(button).toHaveFocus();
  expect(button).toHaveAttribute("aria-expanded", "false");
});
it("logout returns focus to the account button", async () => {
  const user = userEvent.setup();
  renderWithStore(header, { preloadedState: signedIn() });
  const button = screen.getByRole("button", { name: "Hello, Ahmed" });
  await user.click(button);
  const menu = await screen.findByRole("menu");
  const removed = waitForElementToBeRemoved(menu);
  await user.click(within(menu).getByRole("menuitem", { name: "Log out" }));
  await removed;
  expect(button).toHaveAccessibleName("Log in");
  expect(button).toHaveFocus();
  expect(button).toHaveAttribute("aria-expanded", "false");
});
it("account links leave focus on the new page after the menu exits", async () => {
  const Destination = () => {
    const ref = useRef<HTMLHeadingElement>(null);
    useEffect(() => { ref.current?.focus(); }, []);
    return <h2 ref={ref} tabIndex={-1}>Orders page</h2>;
  };
  const user = userEvent.setup();
  renderWithStore(<><BuyerHeader /><Routes>
    <Route path={ROUTES.home} element={<h2>Home</h2>} />
    <Route path={ROUTES.accountOrders} element={<Destination />} />
  </Routes></>, { preloadedState: signedIn() });
  const button = screen.getByRole("button", { name: "Hello, Ahmed" });
  await user.click(button);
  const menu = await screen.findByRole("menu");
  const removed = waitForElementToBeRemoved(menu);
  await user.click(within(menu).getByRole("menuitem", { name: "Orders" }));
  await removed;
  expect(screen.getByRole("heading", { name: "Orders page" })).toHaveFocus();
  expect(button).toHaveAttribute("aria-expanded", "false");
});
it("guests keep visible Log in text at 900 pixels", () => {
  setViewportWidth(900);
  renderWithStore(header);
  const label = within(screen.getByRole("button", { name: "Log in" })).getByText("Log in");
  expect(label.closest(".visually-hidden")).toBeNull();
  // jsdom does not apply media queries; check matching responsive rules directly.
  const responsiveRules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules))
    .filter((rule): rule is CSSMediaRule => rule instanceof CSSMediaRule && matchMedia(rule.conditionText).matches)
    .flatMap((rule) => Array.from(rule.cssRules))
    .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule);
  for (const rule of responsiveRules) {
    if (label.matches(rule.selectorText) || label.parentElement!.matches(rule.selectorText)) {
      expect(rule.style.getPropertyValue("clip-path")).not.toBe("inset(50%)");
      expect(rule.style.display).not.toBe("none");
    }
  }
});
