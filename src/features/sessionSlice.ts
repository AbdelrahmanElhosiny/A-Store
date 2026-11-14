import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import resetDemoData from "../app/resetDemoData";
import { buildSeed, initialSeed } from "../seed/buildSeed";
import { removeItem } from "./itemSlice";
import { CartLine, Role } from "./types";

// Dispatched only by the logInAs thunk (cartActions.ts), which checks the
// account first. The guest's cart and the stock ride along so the accounts
// slice can merge the cart in the same step.
interface LogInPayload {
  role: Role;
  accountId: string;
  guestCart: CartLine[];
  stockById: Record<string, number>;
}

const sessionSlice = createSlice({
  name: "session",
  initialState: initialSeed.session,
  reducers: {
    // logIn: the guest's cart has moved to the buyer (accounts slice)
    logIn: (state, action: PayloadAction<LogInPayload>) => {
      const { role, accountId } = action.payload;
      if (role === "buyer") {
        state.buyerId = accountId;
        state.guestCart = [];
      } else state.sellerId = accountId;
    },

    // logOut: one mode at a time
    logOut: (state, action: PayloadAction<{ role: Role }>) => {
      if (action.payload.role === "buyer") state.buyerId = null;
      else state.sellerId = null;
    },

    // rememberPath: where to go back to when switching modes
    rememberPath: (state, action: PayloadAction<{ role: Role; path: string }>) => {
      state.lastPath[action.payload.role] = action.payload.path;
    },

    // setGuestCart: the cart thunks work it out (features/cart.ts)
    setGuestCart: (state, action: PayloadAction<CartLine[]>) => {
      state.guestCart = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetDemoData, (_, { payload }) => buildSeed(payload.now).session);
    // a removed item leaves the cart (orders keep their own copy)
    builder.addCase(removeItem, (state, { payload }) => {
      state.guestCart = state.guestCart.filter(({ itemId }) => itemId !== payload);
    });
  },
});

export type { LogInPayload };
export const { logIn, logOut, rememberPath, setGuestCart } = sessionSlice.actions;
export default sessionSlice.reducer;
