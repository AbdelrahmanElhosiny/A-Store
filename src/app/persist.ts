import { SEED_IMAGES } from "../seed/images";
import { SeedData } from "../seed/buildSeed";

// The five data slices are saved in localStorage so a visitor's changes
// survive a refresh. Bump VERSION when the saved shape changes: older data
// is dropped, and the app says so once.
export const STORAGE_KEY = "a-store-data";
const VERSION = 2;

export type PersistedState = SeedData;
interface SavedData extends PersistedState {
  version: number;
}

// The bundled seed pictures get a new hashed URL on every build, so they are
// saved by name ("seed:mug") and turned back into the current URL on load.
const SEED_PREFIX = "seed:";
const seedImageByName: Record<string, string> = SEED_IMAGES;
const seedNameByUrl = new Map(
  Object.entries(seedImageByName).map(([name, url]) => [url, name]),
);

const toSaved = (_key: string, value: unknown) =>
  typeof value === "string" && seedNameByUrl.has(value)
    ? `${SEED_PREFIX}${seedNameByUrl.get(value)}`
    : value;

const fromSaved = (_key: string, value: unknown) =>
  typeof value === "string" && value.startsWith(SEED_PREFIX)
    ? seedImageByName[value.slice(SEED_PREFIX.length)]
    : value;

// The shape, and the links the app relies on: who is signed in must be an
// account of that role, and every store must belong to a seller.
const isValid = (data: Partial<SavedData>): data is SavedData => {
  if (
    data.version !== VERSION ||
    !Array.isArray(data.accounts) ||
    !Array.isArray(data.stores) ||
    !Array.isArray(data.items) ||
    !Array.isArray(data.orders) ||
    typeof data.session !== "object" ||
    data.session === null
  )
    return false;
  const idsOf = (role: string) =>
    new Set(
      (data.accounts ?? [])
        .filter((account) => account.role === role)
        .map(({ id }) => id),
    );
  const buyerIds = idsOf("buyer");
  const sellerIds = idsOf("seller");
  const { buyerId, sellerId } = data.session;
  return (
    (buyerId === null || buyerIds.has(buyerId)) &&
    (sellerId === null || sellerIds.has(sellerId)) &&
    data.stores.every(({ ownerId }) => sellerIds.has(ownerId))
  );
};

// droppedOld: something was saved, but it's from an older version or broken
export const loadState = (): {
  state: PersistedState | undefined;
  droppedOld: boolean;
} => {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // blocked storage: start from the seed data
    return { state: undefined, droppedOld: false };
  }
  if (!raw) return { state: undefined, droppedOld: false };
  try {
    const data = JSON.parse(raw, fromSaved) as Partial<SavedData>;
    if (!isValid(data)) return { state: undefined, droppedOld: true };
    const { accounts, session, stores, items, orders } = data;
    return {
      state: { accounts, session, stores, items, orders },
      droppedOld: false,
    };
  } catch {
    return { state: undefined, droppedOld: true };
  }
};

// returns false when the browser refused to save (usually storage is full)
export const saveState = (state: PersistedState): boolean => {
  try {
    const { accounts, session, stores, items, orders } = state;
    const data: SavedData = {
      version: VERSION,
      accounts,
      session,
      stores,
      items,
      orders,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, toSaved));
    return true;
  } catch {
    return false;
  }
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing saved, nothing to clear
  }
};
