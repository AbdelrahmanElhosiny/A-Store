import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  stockNum: number;
  image?: File;
}

const initialState: Item[] = [
  {
    id: "1",
    name: "1",
    price: 1,
    description: "1",
    stockNum: 11,
  },
  {
    id: "2",
    name: "2",
    price: 2,
    description: "2",
    stockNum: 22,
  },
  {
    id: "3",
    name: "3",
    price: 3,
    description: "3",
    stockNum: 33,
  },
  {
    id: "4",
    name: "4",
    price: 4,
    description: "4",
    stockNum: 44,
  },
  {
    id: "5",
    name: "5",
    price: 5,
    description: "5",
    stockNum: 55,
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
    // removeItem
    // removeItem: (state, action: PayloadAction<Item>) => {
    //   state.splice(
    //     state.findIndex((item) => item.id === action.payload.id),
    //     1
    //   );
    // },
    removeItem: (state, action: PayloadAction<string>) => {
      _.remove(state, { id: action.payload });
    },
  },
});

export type { Item };
export const { addNewItem, removeItem } = itemSlice.actions;
export default itemSlice.reducer;
