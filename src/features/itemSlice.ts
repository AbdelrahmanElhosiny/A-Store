import { createSlice } from "@reduxjs/toolkit";

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  stockNum: number;
  image?: File;
}

const initialState: Item[] = [
  // {
  //   id: "",
  //   name: "",
  //   price: 0,
  //   description: "",
  //   stockNum: 0,
  // },
];

const itemSlice = createSlice({
  name: "item",
  initialState,
  reducers: {
    // addNewItem
    addNewItem: (state, action) => {
      state.push(action.payload);
    },
    // clearNewItemForm
    // sellItem
    // restockItem
    // updateItem
    // removeItem
  },
});

export default itemSlice.reducer;
