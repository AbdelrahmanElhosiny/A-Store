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
    id: "1id",
    name: "1name",
    price: 1,
    description: "1",
    stockNum: 1,
    buyNum: 0,
  },
  {
    id: "2id",
    name: "2name",
    price: 2,
    description: "2",
    stockNum: 2,
    buyNum: 0,
  },
  {
    id: "3id",
    name: "3name",
    price: 3,
    description: "3",
    stockNum: 3,
    buyNum: 0,
  },
  {
    id: "4id",
    name: "4name",
    price: 4,
    description: "4",
    stockNum: 4,
    buyNum: 0,
  },
  {
    id: "5id",
    name: "5name",
    price: 5,
    description: "5",
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
      // state.map((item) => {
      //   if (item.id === action.payload.id) {
      //     return action.payload;
      //   }
      //   return { ...item };
      // });
    },

    // removeItem
    removeItem: (state, action: PayloadAction<string>) => {
      _.remove(state, { id: action.payload });
    },
    // removeItem: (state, action: PayloadAction<Item>) => {
    //   state.splice(
    //     state.findIndex((item) => item.id === action.payload.id),
    //     1
    //   );
    // },

    // buyItem
    buyItem: (state, action: PayloadAction<Item>) => {
      const id = _.findIndex(state, { id: action.payload.id });
      if (state[id].stockNum >= 1) {
        state[id].buyNum += 1;
        state[id].stockNum -= 1;
      } else return state;
    },
  },
});

export type { Item };
export const { addNewItem, updateItem, removeItem, buyItem } =
  itemSlice.actions;
export default itemSlice.reducer;
