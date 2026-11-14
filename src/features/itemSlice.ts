import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import findIndex from "lodash/findIndex";
import remove from "lodash/remove";
import resetDemoData from "../app/resetDemoData";
import { buildSeed, initialSeed } from "../seed/buildSeed";
import { Item } from "./types";

// what an order takes from the shelf
interface StockTaken {
  itemId: string;
  variantId?: string;
  quantity: number;
}

const itemSlice = createSlice({
  name: "items",
  initialState: initialSeed.items,
  reducers: {
    // addNewItem
    addNewItem: (state, action: PayloadAction<Item>) => {
      state.push(action.payload);
    },

    // updateItem
    updateItem: (state, action: PayloadAction<Item>) => {
      const index = findIndex(state, { id: action.payload.id });
      if (index !== -1) state[index] = action.payload;
    },

    // removeItem: carts drop it too (accounts and session slices)
    removeItem: (state, action: PayloadAction<string>) => {
      remove(state, { id: action.payload });
    },

    // decreaseStock: never below 0. A variant's stock and the item's total
    // both go down.
    decreaseStock: (state, action: PayloadAction<StockTaken[]>) => {
      action.payload.forEach(({ itemId, variantId, quantity }) => {
        const item = state.find(({ id }) => id === itemId);
        if (!item) return;
        item.stockNum = Math.max(item.stockNum - quantity, 0);
        const variant = variantId
          ? item.variants?.find(({ id }) => id === variantId)
          : undefined;
        if (variant) variant.stockNum = Math.max(variant.stockNum - quantity, 0);
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetDemoData, (_, { payload }) => buildSeed(payload.now).items);
  },
});

export const { addNewItem, updateItem, removeItem, decreaseStock } =
  itemSlice.actions;
export default itemSlice.reducer;
