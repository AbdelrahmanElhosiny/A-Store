import type { AppThunk } from "../app/store";
import { addToCart, setLineQuantity } from "./cart";
import { selectActiveBuyer, selectCart, selectStockById } from "./selectors";
import { setBuyerCart } from "./accountsSlice";
import { logIn, setGuestCart } from "./sessionSlice";
import { CartLine, Item, Role } from "./types";

// The cart actions for whoever shops right now: the signed-in buyer's cart
// (accounts slice), or the guest's (session slice).

// replaces the active cart
export const setActiveCart =
  (cart: CartLine[]): AppThunk =>
  (dispatch, getState) => {
    const buyer = selectActiveBuyer(getState());
    if (buyer) dispatch(setBuyerCart({ accountId: buyer.id, cart }));
    else dispatch(setGuestCart(cart));
  };

// Signs in after checking the id is an account of that role; false (and
// nothing dispatched) when it isn't. A buyer takes the guest's cart along.
export const logInAs =
  (role: Role, accountId: string): AppThunk<boolean> =>
  (dispatch, getState) => {
    const state = getState();
    const isAccount = state.accounts.some(
      (account) => account.id === accountId && account.role === role,
    );
    if (!isAccount) return false;
    dispatch(
      logIn({
        role,
        accountId,
        guestCart: state.session.guestCart,
        stockById: selectStockById(state),
      }),
    );
    return true;
  };

// one more, up to the stock
export const addItemToCart =
  (item: Item, variantId?: string): AppThunk =>
  (dispatch, getState) => {
    const cart = selectCart(getState());
    const next = addToCart(cart, item, variantId);
    if (next !== cart) dispatch(setActiveCart(next));
  };

// an exact quantity; 0 removes the line
export const setCartQuantity =
  (itemId: string, quantity: number, variantId?: string): AppThunk =>
  (dispatch, getState) => {
    const cart = selectCart(getState());
    dispatch(setActiveCart(setLineQuantity(cart, itemId, quantity, variantId)));
  };

export const removeFromCart = (itemId: string, variantId?: string): AppThunk =>
  setCartQuantity(itemId, 0, variantId);
