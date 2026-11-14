import { afterEach, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeSwitch from "../ThemeSwitch";
import { renderWithStore } from "../../test/renderWithStore";

afterEach(cleanup);
it("clicking Dark mode text toggles its labelled switch", async () => {
  const user = userEvent.setup();
  renderWithStore(<ThemeSwitch label="Dark mode" />);
  const input = screen.getByRole("checkbox", { name: "Dark mode" });
  expect(input).not.toBeChecked();
  await user.click(screen.getByText("Dark mode"));
  expect(input).toBeChecked();
  await user.click(screen.getByText("Dark mode"));
  expect(input).not.toBeChecked();
});
