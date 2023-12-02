import { createSlice } from "@reduxjs/toolkit";

interface InitialState {
  isOrdered: boolean;
  isShipped: boolean;
  isOutForDelivery: boolean;
  isDelivered: boolean;
}

const initialState: InitialState = {
  isOrdered: false,
  isShipped: false,
  isOutForDelivery: false,
  isDelivered: false,
};

const deliverySlice = createSlice({
  name: "delivery",
  initialState,
  reducers: {},
});

export default deliverySlice.reducer;
