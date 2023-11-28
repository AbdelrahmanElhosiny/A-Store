import { createSlice } from "@reduxjs/toolkit";

interface InitialState {
  ordered: boolean;
  shipped: boolean;
  outForDelivery: boolean;
  delivered: boolean;
}

const initialState: InitialState = {
  ordered: false,
  shipped: false,
  outForDelivery: false,
  delivered: false,
};

const deliverySlice = createSlice({
  name: "delivery",
  initialState,
  reducers: {},
});

export default deliverySlice.reducer;
