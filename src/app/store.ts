import { configureStore } from "@reduxjs/toolkit";
import itemSlice from "../features/itemSlice";
import userSlice from "../features/userSlice";
import notificationSlice from "../features/notificationSlice";

const store = configureStore({
  reducer: {
    items: itemSlice,
    users: userSlice,
    notification: notificationSlice,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
