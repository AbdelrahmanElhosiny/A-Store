import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import resetDemoData from "../app/resetDemoData";
import { buildSeed, initialSeed } from "../seed/buildSeed";

import type { Store } from "./types";
const storesSlice = createSlice({
  name: "stores",
  initialState: initialSeed.stores,
  reducers: {
    addStore: (state, { payload }: PayloadAction<Store>) => {
      state.push(payload);
    },
    updateStore: (state, { payload }: PayloadAction<{
      id: string;
      changes: Partial<Omit<Store, "id" | "ownerId" | "slug">>;
    }>) => {
      const store = state.find(({ id }) => id === payload.id);
      if (store) Object.assign(store, payload.changes);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetDemoData, (_, { payload }) => buildSeed(payload.now).stores);
  },
});

export const { addStore, updateStore } = storesSlice.actions;
export default storesSlice.reducer;
