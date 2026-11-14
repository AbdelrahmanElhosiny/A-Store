import { afterEach, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import ModeSwitch from "../ModeSwitch";
import useRememberPath from "../../hooks/useRememberPath";
import { ROUTES } from "../../constant/routes";
import { renderWithStore } from "../../test/renderWithStore";

afterEach(cleanup);
const Harness = ({ compact = false }) => {
  useRememberPath();
  const { pathname, search } = useLocation();
  return <><ModeSwitch compact={compact} /><output>{pathname + search}</output></>;
};
it("offers the seller home from a buyer category", () => {
  renderWithStore(<Harness />, { route: ROUTES.category("watches") });
  expect(screen.getByRole("link", { name: "Switch to selling" })).toHaveAttribute("href", ROUTES.seller);
});
it("remembers the seller query when switching away and back", async () => {
  const user = userEvent.setup();
  const route = `${ROUTES.sellerOrders}?tab=to-ship`;
  const { store } = renderWithStore(<Harness />, { route });
  expect(store.getState().session.lastPath.seller).toBe(route);
  await user.click(screen.getByRole("link", { name: "Switch to shopping" }));
  expect(screen.getByRole("link", { name: "Switch to selling" })).toHaveAttribute("href", route);
  await user.click(screen.getByRole("link", { name: "Switch to selling" }));
  expect(screen.getByRole("status")).toHaveTextContent(route);
});
it("uses short compact text with full accessible labels", async () => {
  const user = userEvent.setup();
  renderWithStore(<Harness compact />);
  expect(screen.getByRole("link", { name: "Switch to selling" })).toHaveTextContent("Sell");
  await user.click(screen.getByRole("link", { name: "Switch to selling" }));
  expect(screen.getByRole("link", { name: "Switch to shopping" })).toHaveTextContent("Shop");
});
