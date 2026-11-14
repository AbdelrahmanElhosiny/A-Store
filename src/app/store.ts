import {
  AnyAction,
  ListenerMiddlewareInstance,
  ThunkAction,
  combineReducers,
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import throttle from "lodash/throttle";
import accountsSlice from "../features/accountsSlice";
import sessionSlice from "../features/sessionSlice";
import storesSlice from "../features/storesSlice";
import itemSlice from "../features/itemSlice";
import ordersSlice from "../features/ordersSlice";
import notificationSlice, {
  showNotification,
} from "../features/notificationSlice";
import { PersistedState, clearState, loadState, saveState } from "./persist";
import resetDemoData from "./resetDemoData";

const rootReducer = combineReducers({
  accounts: accountsSlice,
  session: sessionSlice,
  stores: storesSlice,
  items: itemSlice,
  orders: ordersSlice,
  notification: notificationSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

// A store with the app's reducers. Tests make their own; only the app's
// store (below) passes the listener that saves to localStorage.
export const setupStore = (
  preloadedState?: Partial<RootState>,
  listener: ListenerMiddlewareInstance = createListenerMiddleware(),
) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listener.middleware),
  });

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, AnyAction>;

// -----------------
// The app's store, from what the visitor saved last time
// -----------------
const persistListener = createListenerMiddleware();
const loaded = loadState();
const store = setupStore(loaded.state, persistListener);

// -----------------
// Saving to localStorage
// -----------------
const PERSISTED_KEYS: (keyof PersistedState)[] = [
  "accounts",
  "session",
  "stores",
  "items",
  "orders",
];
let hasWarnedStorageFull = false;

// at most twice a second, so typing in a stepper doesn't write on every key
const save = throttle(() => {
  if (saveState(store.getState()) || hasWarnedStorageFull) return;
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
    const now = current as RootState;
    const before = previous as RootState;
    return (
      !resetDemoData.match(action) &&
      PERSISTED_KEYS.some((key) => now[key] !== before[key])
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

// Data from an older version was dropped: forget it, so the message shows
// only once, and tell the visitor why their changes are gone.
if (loaded.droppedOld) {
  clearState();
  store.dispatch(
    showNotification({
      type: "info",
      message: "The demo was updated, so your saved changes were reset.",
    }),
  );
}

// don't lose the last half second of changes when the tab closes
window.addEventListener("pagehide", () => save.flush());

export default store;
