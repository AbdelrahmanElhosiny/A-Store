import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  stockNum: number;
  image?: File;
  buyNum: number;
}

const initialState: Item[] = [
  {
    id: "1 id",
    name: "1 name",
    price: 1,
    description: "1 description",
    stockNum: 1,
    buyNum: 0,
  },
  {
    id: "2 id",
    name: "2 name",
    price: 2,
    description: "2 description",
    stockNum: 2,
    buyNum: 0,
  },
  {
    id: "3 id",
    name: "3 name",
    price: 3,
    description: "3 description",
    stockNum: 3,
    buyNum: 0,
  },
  {
    id: "4 id",
    name: "4 name",
    price: 4,
    description: "4 description",
    stockNum: 4,
    buyNum: 0,
  },
  {
    id: "5 id",
    name: "5 name",
    price: 5,
    description: "5 description",
    stockNum: 5,
    buyNum: 0,
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
      const id = _.findIndex(state, { id: action.payload.id });
      state.splice(id, 1, action.payload);
    },

    // removeItem
    removeItem: (state, action: PayloadAction<string>) => {
      _.remove(state, { id: action.payload });
    },

    // buyItem
    buyItem: (state, action: PayloadAction<Item>) => {
      const id = _.findIndex(state, { id: action.payload.id });
      if (state[id].stockNum > 0) {
        state[id].buyNum += 1;
        state[id].stockNum -= 1;
      } else return state;
    },

    //addToCart
    addToCart: (state, action: PayloadAction<Item>) => {
      const id = _.findIndex(state, { id: action.payload.id });
      state[id].buyNum < state[id].stockNum ? (state[id].buyNum += 1) : state;
    },
  },
});

export type { Item };
export const { addNewItem, updateItem, removeItem, buyItem, addToCart } =
  itemSlice.actions;
export default itemSlice.reducer;
