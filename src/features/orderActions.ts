import { v4 as uuid } from "uuid";
import type { AppThunk } from "../app/store";
import { lineKey } from "./cart";
import { setActiveCart } from "./cartActions";
import { decreaseStock } from "./itemSlice";
import { buildOrder, nextOrderNumber } from "./orderBuild";
import { addOrder } from "./ordersSlice";
import {
  selectActiveBuyer,
  selectCart,
  selectItemsById,
  selectStockById,
  selectStoresById,
} from "./selectors";
import { Address, GUEST_ID, Order } from "./types";

// Orders what's in the active cart and in stock (a line asking for more
// than the stock orders the stock), takes it off the shelf and out of the
// cart. Lines that can't be ordered stay in the cart. Returns the order,
// or null when nothing could be ordered.
export const placeOrder =
  (args: { shipTo: Address; payment: Order["payment"] }): AppThunk<Order | null> =>
  (dispatch, getState) => {
    const state = getState();
    const cart = selectCart(state);
    const stockById = selectStockById(state);
    const orderable = cart
      .map((line) => ({
        ...line,
        quantity: Math.min(line.quantity, stockById[lineKey(line)] ?? 0),
      }))
      .filter(({ quantity }) => quantity > 0);

    const order = buildOrder({
      id: uuid(),
      number: nextOrderNumber(state.orders),
      buyerId: selectActiveBuyer(state)?.id ?? GUEST_ID,
      now: Date.now(),
      cart: orderable,
      itemsById: selectItemsById(state),
      storesById: selectStoresById(state),
      ...args,
    });
    const lines = order.shipments.flatMap(({ lines }) => lines);
    if (lines.length === 0) return null;

    dispatch(addOrder(order));
    dispatch(
      decreaseStock(
        lines.map(({ itemId, variantId, quantity }) => ({
          itemId,
          variantId,
          quantity,
        })),
      ),
    );
    const ordered = new Set(lines.map(lineKey));
    dispatch(setActiveCart(cart.filter((line) => !ordered.has(lineKey(line)))));
    return order;
  };
