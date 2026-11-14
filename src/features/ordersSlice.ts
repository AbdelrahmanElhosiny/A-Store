import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import resetDemoData from "../app/resetDemoData";
import { buildSeed, initialSeed } from "../seed/buildSeed";
import { Order } from "./types";

const ordersSlice = createSlice({
  name: "orders",
  initialState: initialSeed.orders,
  reducers: {
    // addOrder: built by the placeOrder thunk (orderActions.ts)
    addOrder: (state, action: PayloadAction<Order>) => {
      state.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetDemoData, (_, { payload }) => buildSeed(payload.now).orders);
  },
});

export const { addOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
