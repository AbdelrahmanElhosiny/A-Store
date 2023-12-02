import { createSlice } from "@reduxjs/toolkit";

interface InitialState {
  id: number;
  name: string;
  price: number;
  description: string;
  estDeliveryTime: number;
  unitsNum: number;
  isInStoke: boolean;
  image?: File;
}

const initialState: InitialState = {
  id: 0,
  name: "",
  price: 0,
  description: "",
  estDeliveryTime: 0,
  unitsNum: 0,
  isInStoke: false,
};

const itemSlice = createSlice({
  name: "item",
  initialState,
  reducers: {},
});

export default itemSlice.reducer;
