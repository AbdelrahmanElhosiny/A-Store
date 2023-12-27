import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface Notification {
  type?: "success" | "error" | "info" | "warning";
  message: string;
  isOpen: boolean;
}

const initialState: Notification = {
  isOpen: false,
  message: "",
  type: "success",
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<Omit<Notification, "isOpen">>
    ) => {
      state.isOpen = true;
      state.message = action.payload.message;
      state.type = action.payload.type || initialState.type;
    },
    hideNotification: (state) => {
      state.isOpen = false;
      state.message = initialState.message;
      state.type = initialState.type;
    },
  },
});

export type { Notification };
export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
