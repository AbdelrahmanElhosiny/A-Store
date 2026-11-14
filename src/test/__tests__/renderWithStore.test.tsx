import { describe, expect, it } from "vitest";
import { act, screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { setCartQuantity } from "../../features/cartActions";
import { selectCartCount } from "../../features/selectors";
import { buildSeed } from "../../seed/buildSeed";
import { renderWithStore } from "../renderWithStore";

const Probe = () => {
  const count = useAppSelector(selectCartCount);
  const { pathname } = useLocation();
  return (
    <p>
      {pathname}: {count} in cart
    </p>
  );
};

describe("renderWithStore", () => {
  it("renders with a store, a router at the route, and returns the store", () => {
    const seed = buildSeed(0);
    const { store } = renderWithStore(<Probe />, {
      preloadedState: {
        ...seed,
        session: {
          ...seed.session,
          guestCart: [{ itemId: "item-hl-ceramic-mug", quantity: 2 }],
        },
      },
      route: "/buy/cart",
    });
    expect(screen.getByText("/buy/cart: 2 in cart")).toBeInTheDocument();

    act(() => {
      store.dispatch(setCartQuantity("item-hl-ceramic-mug", 5));
    });
    expect(screen.getByText("/buy/cart: 5 in cart")).toBeInTheDocument();
  });

  it("starts at / from the seed by default", () => {
    renderWithStore(<Probe />);
    expect(screen.getByText("/: 0 in cart")).toBeInTheDocument();
  });
});
