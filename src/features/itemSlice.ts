import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import findIndex from "lodash/findIndex";
import remove from "lodash/remove";
import { CartItemStatus } from "./userSlice";
import resetDemoData from "../app/resetDemoData";
import headphones from "../assets/products/headphones.webp";
import lamp from "../assets/products/lamp.webp";
import mug from "../assets/products/mug.webp";
import watch from "../assets/products/watch.webp";
import backpack from "../assets/products/backpack.webp";

//TODO: add seller name to item
//TODO: item delivery is here and has (id of process, time of order and time delivered)

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  stockNum: number;
  // a URL: a bundled picture, or a data URL from the Add Item picker
  image?: string;
}

// bundled pictures by name; saved data refers to them by name (see app/persist.ts)
const SEED_IMAGES: Record<string, string> = {
  headphones,
  lamp,
  mug,
  watch,
  backpack,
};

// seed items, pictures from Unsplash (see src/assets/products/CREDITS.md)
const initialState: Item[] = [
  {
    id: "1 id",
    name: "Wireless headphones",
    description: "Over-ear, 30 hours of battery, folds flat into its case.",
    price: 89,
    stockNum: 12,
    image: headphones,
  },
  {
    id: "2 id",
    name: "Desk lamp",
    description: "Steel shade on an adjustable arm, warm white bulb included.",
    price: 45,
    stockNum: 3,
    image: lamp,
  },
  {
    id: "3 id",
    name: "Ceramic mug",
    description: "350 ml stoneware, dishwasher safe, matte white glaze.",
    price: 14,
    stockNum: 40,
    image: mug,
  },
  {
    id: "4 id",
    name: "Smart watch",
    description: "Heart rate, sleep tracking and a week of battery life.",
    price: 129,
    stockNum: 2,
    image: watch,
  },
  {
    id: "5 id",
    name: "City backpack",
    description: "20 L, water-resistant, padded sleeve for a 15-inch laptop.",
    price: 65,
    stockNum: 8,
    image: backpack,
  },
];

const itemSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    // addNewItem
    addNewItem: (state, action: PayloadAction<Item>) => {
      state.push(action.payload);
    },

    // updateItem
    updateItem: (state, action: PayloadAction<Item>) => {
      const idIndex = findIndex(state, { id: action.payload.id });
      state.splice(idIndex, 1, action.payload);
    },

    // removeItem
    removeItem: (state, action: PayloadAction<string>) => {
      remove(state, { id: action.payload });
    },

    // buyItem
    buyItem: (state, action: PayloadAction<CartItemStatus>) => {
      const id = findIndex(state, { id: action.payload.itemId });
      if (id === -1) return state;
      if (state[id].stockNum >= action.payload.inCartNum) {
        state[id].stockNum -= action.payload.inCartNum;
      } else return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetDemoData, () => initialState);
  },
});

export type { Item };
export { SEED_IMAGES };
export const { addNewItem, updateItem, removeItem, buyItem } =
  itemSlice.actions;
export default itemSlice.reducer;
