import { afterEach, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import RequireSeller from "../RequireSeller";
import { ROUTES } from "../../constant/routes";
import { renderWithStore } from "../../test/renderWithStore";
import { buildSeed } from "../../seed/buildSeed";

afterEach(cleanup);
const Child = () => <p>Guarded child at {useLocation().pathname}</p>;
it("offers four stores and public store creation", () => {
  renderWithStore(<RequireSeller><Child /></RequireSeller>, { route: ROUTES.seller });
  expect(screen.getByRole("heading", { name: "Pick your store", level: 2 })).toBeInTheDocument();
  expect(screen.getByText("This is a demo: pick a store to run it, no password needed.")).toBeInTheDocument();
  expect(screen.getAllByRole("button")).toHaveLength(4);
  for (const store of buildSeed(0).stores) expect(screen.getByRole("button", { name: store.name })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Create a store" })).toHaveAttribute("href", ROUTES.sellerSignUp);
});
it("deep link survives picking a store", async () => {
  const user = userEvent.setup();
  const { store } = renderWithStore(<RequireSeller><Child /></RequireSeller>, { route: ROUTES.sellerOrders });
  await user.click(screen.getByRole("button", { name: "Tick & Tock" }));
  expect(store.getState().session.sellerId).toBe("acc-mona");
  expect(screen.getByText(`Guarded child at ${ROUTES.sellerOrders}`)).toBeInTheDocument();
});
