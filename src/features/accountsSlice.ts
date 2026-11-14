import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import resetDemoData from "../app/resetDemoData";
import { buildSeed, initialSeed } from "../seed/buildSeed";
import { mergeCarts } from "./cart";
import { removeItem } from "./itemSlice";
import { logIn } from "./sessionSlice";
import { BuyerAccount, CartLine, SellerAccount } from "./types";

const accountsSlice = createSlice({
  name: "accounts",
  initialState: initialSeed.accounts,
  reducers: {
    // addBuyer: from the sign-up form
    addBuyer: (state, action: PayloadAction<BuyerAccount>) => {
      state.push(action.payload);
    },

    // addSeller
    addSeller: (state, action: PayloadAction<SellerAccount>) => {
      state.push(action.payload);
    },

    // setBuyerCart: the cart thunks work it out (features/cart.ts)
    setBuyerCart: (
      state,
      action: PayloadAction<{ accountId: string; cart: CartLine[] }>,
    ) => {
      const { accountId, cart } = action.payload;
      const account = state.find(({ id }) => id === accountId);
      if (account?.role === "buyer") account.cart = cart;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetDemoData, (_, { payload }) => buildSeed(payload.now).accounts);
    // what the guest had in the cart moves to the account, so nothing is
    // lost by logging in halfway through shopping
    builder.addCase(logIn, (state, { payload }) => {
      if (payload.role !== "buyer") return;
      const account = state.find(({ id }) => id === payload.accountId);
      if (account?.role !== "buyer") return;
      account.cart = mergeCarts(account.cart, payload.guestCart, payload.stockById);
    });
    // a removed item leaves every cart and wishlist (orders keep their copy)
    builder.addCase(removeItem, (state, { payload }) => {
      state.forEach((account) => {
        if (account.role !== "buyer") return;
        account.cart = account.cart.filter(({ itemId }) => itemId !== payload);
        account.wishlist = account.wishlist.filter((itemId) => itemId !== payload);
      });
    });
  },
});

export const { addBuyer, addSeller, setBuyerCart } = accountsSlice.actions;
export default accountsSlice.reducer;
