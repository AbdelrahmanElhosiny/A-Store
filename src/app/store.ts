import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import _ from "lodash";
import itemSlice from "../features/itemSlice";
import userSlice from "../features/userSlice";
import notificationSlice, {
  showNotification,
} from "../features/notificationSlice";
import { PersistedState, clearState, loadState, saveState } from "./persist";
import resetDemoData from "./resetDemoData";

const persistListener = createListenerMiddleware();

const store = configureStore({
  reducer: {
    items: itemSlice,
    users: userSlice,
    notification: notificationSlice,
  },
  // what the visitor saved last time, if anything
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(persistListener.middleware),
});

// -----------------
// Saving to localStorage
// -----------------
let hasWarnedStorageFull = false;

// at most twice a second, so typing in a stepper doesn't write on every key
const save = _.throttle(() => {
  const { items, users } = store.getState();
  if (saveState({ items, users }) || hasWarnedStorageFull) return;
  hasWarnedStorageFull = true;
  store.dispatch(
    showNotification({
      type: "warning",
      message:
        "Browser storage is full, so new changes won't survive a refresh. Smaller pictures or Reset demo data will free space.",
    }),
  );
}, 500);

persistListener.startListening({
  predicate: (action, current, previous) => {
    const now = current as PersistedState;
    const before = previous as PersistedState;
    return (
      !resetDemoData.match(action) &&
      (now.items !== before.items || now.users !== before.users)
    );
  },
  effect: () => save(),
});

// a reset forgets the saved data, so the next visit starts fresh too
persistListener.startListening({
  actionCreator: resetDemoData,
  effect: () => {
    save.cancel();
    clearState();
    hasWarnedStorageFull = false;
  },
});

// don't lose the last half second of changes when the tab closes
window.addEventListener("pagehide", () => save.flush());

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
