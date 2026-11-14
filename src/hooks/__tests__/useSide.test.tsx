import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import useSide from "../useSide";

const Probe = () => <output>{JSON.stringify(useSide())}</output>;
afterEach(cleanup);

describe("useSide", () => {
  it.each([
    ["/seller/orders", "sell", "seller", "/seller", "/seller/sign-up"],
    ["/c/watches", "buy", "buyer", "/", "/sign-up"],
  ])("takes mode from %s", (pathname, side, role, homePath, signUpPath) => {
    render(<MemoryRouter initialEntries={[pathname]}><Probe /></MemoryRouter>);
    expect(JSON.parse(screen.getByRole("status").textContent!)).toEqual({
      side, role, homePath, signUpPath, pathname,
    });
  });
});
