import { createSlice } from "@reduxjs/toolkit";

interface Item {
  id: string;
  name: string;
  price: number;
  description: string;
  unitsNum: number;
  image?: File;
}

const initialState: Item[] = [
  {
    id: "",
    name: "",
    price: 0,
    description: "",
    unitsNum: 0,
  },
];

const itemSlice = createSlice({
  name: "item",
  initialState,
  reducers: {
    // addNewItem
    // sellItem
    // restockItem
    // updateItem
    // removeItem
  },
});

export default itemSlice.reducer;
