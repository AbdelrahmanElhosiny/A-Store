import { createSlice } from "@reduxjs/toolkit";
import resetDemoData from "../app/resetDemoData";
import { buildSeed, initialSeed } from "../seed/buildSeed";

// The stores. Sellers edit theirs from Phase B on.
const storesSlice = createSlice({
  name: "stores",
  initialState: initialSeed.stores,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetDemoData, (_, { payload }) => buildSeed(payload.now).stores);
  },
});

export default storesSlice.reducer;
