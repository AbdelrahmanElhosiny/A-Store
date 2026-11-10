import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface Notification {
  type?: "success" | "error" | "info" | "warning";
  message: string;
  isOpen: boolean;
  // new for every message, so a repeated message restarts its timer
  id: number;
}

const initialState: Notification = {
  isOpen: false,
  message: "",
  type: "success",
  id: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<Omit<Notification, "isOpen" | "id">>,
    ) => {
      state.isOpen = true;
      state.message = action.payload.message;
      state.type = action.payload.type || initialState.type;
      state.id += 1;
    },
    // the message stays while the toast animates out
    hideNotification: (state) => {
      state.isOpen = false;
    },
  },
});

export type { Notification };
export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
