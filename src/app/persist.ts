import { Item, SEED_IMAGES } from "../features/itemSlice";
import { User } from "../features/userSlice";

// Items and users are saved in localStorage so a visitor's changes survive a
// refresh. Bump VERSION when the saved shape changes: older data is ignored.
const STORAGE_KEY = "a-store-data";
const VERSION = 1;

interface PersistedState {
  items: Item[];
  users: User[];
}
interface SavedData extends PersistedState {
  version: number;
}

// The bundled seed pictures get a new hashed URL on every build, so they are
// saved by name ("seed:mug") and turned back into the current URL on load.
const SEED_PREFIX = "seed:";
const seedNameByUrl = new Map(
  Object.entries(SEED_IMAGES).map(([name, url]) => [url, name]),
);

const toSaved = (_key: string, value: unknown) =>
  typeof value === "string" && seedNameByUrl.has(value)
    ? `${SEED_PREFIX}${seedNameByUrl.get(value)}`
    : value;

const fromSaved = (_key: string, value: unknown) =>
  typeof value === "string" && value.startsWith(SEED_PREFIX)
    ? SEED_IMAGES[value.slice(SEED_PREFIX.length)]
    : value;

// the users list always starts with the guest and has one active user
const isValid = (data: Partial<SavedData>): data is SavedData =>
  data.version === VERSION &&
  Array.isArray(data.items) &&
  Array.isArray(data.users) &&
  data.users[0]?.userName === "Guest" &&
  data.users.filter(({ isLoggedIn }) => isLoggedIn).length === 1;

const loadState = (): PersistedState | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const data = JSON.parse(raw, fromSaved) as Partial<SavedData>;
    if (!isValid(data)) return undefined;
    return { items: data.items, users: data.users };
  } catch {
    // blocked storage or broken JSON: start from the seed data
    return undefined;
  }
};

// returns false when the browser refused to save (usually storage is full)
const saveState = ({ items, users }: PersistedState): boolean => {
  try {
    const data: SavedData = { version: VERSION, items, users };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, toSaved));
    return true;
  } catch {
    return false;
  }
};

const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing saved, nothing to clear
  }
};

export type { PersistedState };
export { loadState, saveState, clearState };
