# Phase A: Data and Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single `users` array with marketplace data (accounts, session, stores, items, orders) and a seeded catalogue of four stores, while every page in the app looks and behaves as it does today.

**Architecture:** Five Redux Toolkit slices hold the data. Pure helpers sit beside them: cart merge, order building and shipment status. Memoised selectors in one file are the only way components read state. One `buildSeed(now)` function creates the starting data on first load and on Reset. The saved data moves to `VERSION = 2`, and older saves fall back to the seed with a one-time toast. Today's pages switch from `state.users` to the new selectors. There are no visible changes: the route tree, the navbar and the Buy/Sell split stay until Phase B.

**Tech Stack:** React 18, TypeScript 5, Redux Toolkit 1.9 (`createSlice`, `createSelector`, listener middleware), Vite 5. Vitest 2 + jsdom + Testing Library is new, added in Task 1.

**Spec:** `docs/superpowers/specs/2026-11-13-marketplace-overhaul-design.md` (Target structure, Point 1a, Point 3 seed accounts, Builder notes). Living copy: https://claude.ai/artifact/2tKmriyRm2Zm5q6PyQxemm

## Global Constraints

- Branch `marketplace` (off `AI-enhanced`). No major version upgrades: React 18, MUI 5, RTK 1.9, react-redux 8, react-router 6 and Vite 5 stay.
- One spec task = one commit = one `docs/AI-LOG.md` entry, numbered on from 10 (this phase writes entries 11 and 12). Use the existing entry format: `## N. Title (Claude Code)`, `**Prompt:**`, `**Changes**` bullets, `**Check:**`, `**Changed by hand:** —`.
- Commit messages carry no Claude/Anthropic attribution lines. Commit only when the user has asked for this task to be committed.
- `npm run lint`, `npm run build` and `npm test` pass after every task.
- Design stays: Gruvbox tokens and sharp edges (radius 0). This phase changes no styles.
- Seed store, seller and product names are invented, with no real brands in the names or pictures.
- Card data: only brand, last 4 digits, expiry, name on card and nickname are ever stored. Never the full number or the CVV.
- The URL decides the mode (`/seller…` = seller, everything else = buyer). The mode is never stored.

## Review Focus

1. **Old saved data (version 1) in localStorage.** Expected: the app loads the seed, shows "The demo was updated, so your saved changes were reset." once, and the next refresh shows no toast. Pinned in Task 1 (`persist.test.ts` › "drops a version 1 save and reports it").
2. **A saved session pointing at an account that no longer exists** (for example a buyer id from a hand-edited save). Expected: the save is treated as invalid and the seed loads; nothing crashes on `undefined.cart`. Pinned in Task 1 (`persist.test.ts` › "rejects a session whose buyer is missing").
3. **The guest cart merge when stock dropped below the guest's quantity.** Expected: the merged quantity stops at the stock and never falls below what the account already had (today's rule). Pinned in Task 1 (`cart.test.ts` › "merge caps at stock but keeps the account's own quantity").
4. **Removing (or, later, archiving) an item that sits in a guest cart and in buyer carts.** Expected: it leaves every cart, the guest's included. Past orders keep their snapshot. Pinned in Task 1 (`items` › "removeItem clears the guest cart and every buyer cart").
5. **Reset demo data after the clock moved on.** Expected: seed orders are rebuilt relative to the time of the reset, so the "last 7 days" figures still have data. Pinned in Task 2 (`buildSeed.test.ts` › "dates are offsets from now").

---

## File Structure

| File | Responsibility |
| --- | --- |
| `vitest.config.ts` (new) | Test runner config: React plugin, jsdom, setup file. Kept apart from `vite.config.ts` so its build plugins don't run in tests |
| `src/test/setup.ts` (new) | jest-dom matchers, `localStorage.clear()` after each test |
| `src/test/renderWithStore.tsx` (new) | `renderWithStore(ui, { preloadedState?, route? })` for component tests in later phases |
| `src/constant/categories.ts` (new) | `CATEGORIES` list and `CategoryId` |
| `src/features/types.ts` (new) | Every shared data type: `Account`, `Address`, `PaymentMethod`, `Store`, `Item`, `Variant`, `CartLine`, `Order`, `Shipment`, and the rest |
| `src/features/accountsSlice.ts` (new) | Buyer and seller accounts, buyer carts, addresses and payment methods |
| `src/features/sessionSlice.ts` (new) | Signed-in buyer and seller ids, the guest cart, the last path per mode |
| `src/features/storesSlice.ts` (new) | One store per seller |
| `src/features/itemSlice.ts` (rewrite) | Products with `storeId`, `category`, `status`, `sku`, `createdAt` |
| `src/features/ordersSlice.ts` (new) | Orders, each with one shipment per store |
| `src/features/cart.ts` (new) | Pure cart helpers: `addToCart`, `setLineQuantity`, `mergeCarts` |
| `src/features/orderBuild.ts` (new) | Pure `buildOrder(...)`: cart lines → an `Order` split by store |
| `src/features/shipmentStatus.ts` (new) | Pure `effectiveStatus`, `orderSummaryStatus`, the timer constants |
| `src/features/selectors.ts` (new) | All memoised selectors components use |
| `src/features/cartActions.ts` (new) | Thunks that route cart changes to the guest cart or the signed-in buyer, plus `logInAs` |
| `src/features/orderActions.ts` (new) | `placeOrder` thunk |
| `src/app/hooks.ts` (new) | Typed `useAppSelector` and `useAppDispatch` |
| `src/features/userSlice.ts` (delete) | Replaced by accounts and session |
| `src/seed/buildSeed.ts` (new) | `buildSeed(now): SeedData`, the whole starting world |
| `src/seed/catalogue.ts` (new) | Stores, sellers, buyers and products as plain data |
| `src/seed/seedOrders.ts` (new) | The past orders as day/hour offsets |
| `src/seed/images.ts` (new) | `SEED_IMAGES` name → bundled URL map (moved from `itemSlice.ts`) |
| `src/app/resetDemoData.ts` (modify) | The action carries `{ now }` so reducers stay pure |
| `src/app/persist.ts` (rewrite) | `VERSION = 2`, the new shape, validity check, `loadState()` reports a dropped old save |
| `src/app/store.ts` (modify) | `setupStore(preloaded?)` factory plus the app's `store`, all five slices, the persist listener |
| today's pages and hooks (modify) | Read through `selectors.ts` and dispatch the new actions, with no visible change |

---

### Task 1 (spec task 1): New slices, selectors and saved data

**Files:**
- Create: `vitest.config.ts`, `src/test/setup.ts`, `src/test/renderWithStore.tsx`, `src/constant/categories.ts`, `src/features/types.ts`, `src/features/accountsSlice.ts`, `src/features/sessionSlice.ts`, `src/features/storesSlice.ts`, `src/features/ordersSlice.ts`, `src/features/cart.ts`, `src/features/orderBuild.ts`, `src/features/shipmentStatus.ts`, `src/features/selectors.ts`, `src/seed/buildSeed.ts`, `src/seed/catalogue.ts`, `src/seed/images.ts`
- Create also: `src/app/hooks.ts` (typed `useAppSelector`, `useAppDispatch`; today every consumer casts `useSelector<RootState>(…) as X[]`)
- Modify: `package.json`, `src/features/itemSlice.ts`, `src/app/resetDemoData.ts`, `src/app/persist.ts`, `src/app/store.ts`, `src/hooks/useAuth.ts`, `src/pages/Buy/index.tsx` (cart badge), `src/components/ResetDemoDialog.tsx` (copy), `src/components/LoginDialog.tsx`, `src/components/AccountPicker.tsx`, `src/components/NavBar.tsx`, `src/pages/Buy/useBuy.ts`, `src/pages/Buy/Home.tsx`, `src/pages/Buy/Cart.tsx`, `src/pages/Buy/TrackBought.tsx`, `src/pages/Sell/useSell.ts`, `src/pages/Sell/TrackSold.tsx`, `src/pages/Sell/AddItem.tsx`, `src/pages/Sell/components/UpdateItemModal.tsx`, `src/pages/Sell/components/RemoveItemModal.tsx`, `src/pages/SignUp.tsx`, `src/utils/orders.ts`, `docs/AI-LOG.md`. The consumer list is in Step 12. Check it with `grep -rn "userSlice\|state.users\|activeUserIndex" src` before you start.
- Delete: `src/features/userSlice.ts`
- Test: `src/features/__tests__/cart.test.ts`, `orderBuild.test.ts`, `shipmentStatus.test.ts`, `slices.test.ts`, `selectors.test.ts`, `src/app/__tests__/persist.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces (every later phase relies on these exact names):

```ts
// src/constant/categories.ts
export const CATEGORIES = [
  { id: "watches", label: "Watches" },
  { id: "bags", label: "Bags" },
  { id: "phones", label: "Phones" },
  { id: "audio", label: "Audio" },
  { id: "home-kitchen", label: "Home and kitchen" },
  { id: "accessories", label: "Accessories" },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const categoryLabel: (id: CategoryId) => string;

// src/features/types.ts
export type Role = "buyer" | "seller";
export interface Address { id: string; label: string; name: string; line1: string; line2?: string; city: string; zipCode: string; phoneNum: string; isDefault: boolean }
export type CardBrand = "visa" | "mastercard" | "amex";
export interface PaymentMethod { id: string; kind: "card" | "cod"; brand?: CardBrand; last4?: string; expMonth?: number; expYear?: number; holder?: string; nickname?: string; isDefault: boolean }
export interface CartLine { itemId: string; variantId?: string; quantity: number }
interface AccountBase { id: string; role: Role; name: string; avatarColor: string; createdAt: number; notificationsSeenAt: number }
export interface BuyerAccount extends AccountBase { role: "buyer"; addresses: Address[]; paymentMethods: PaymentMethod[]; cart: CartLine[]; wishlist: string[]; recentlyViewed: string[] }
export interface SellerAccount extends AccountBase { role: "seller"; storeId: string }
export type Account = BuyerAccount | SellerAccount;
export interface Store { id: string; ownerId: string; name: string; slug: string; tagline: string; description: string; logoLetter: string; logoColor: string; banner?: string; since: number; categoryFocus: CategoryId; lowStockAt: number; autoShip: boolean; deliveryFee: number; freeDeliveryOver: number | null }
export type ItemStatus = "active" | "draft" | "archived";
export interface ProductOption { name: string; values: string[] }
export interface Variant { id: string; values: string[]; price: number; stockNum: number; sku: string }
export interface Item { id: string; storeId: string; category: CategoryId; name: string; description: string; price: number; compareAtPrice?: number; stockNum: number; image?: string; status: ItemStatus; sku: string; createdAt: number; options?: ProductOption[]; variants?: Variant[] }
export type ShipmentStatus = "placed" | "packed" | "shipped" | "delivered" | "cancelled" | "return-requested" | "returned";
export interface StatusEvent { status: ShipmentStatus; at: number }
export interface OrderLine { itemId: string; variantId?: string; variantLabel?: string; name: string; price: number; image?: string; quantity: number; reviewId?: string }
export interface Shipment { id: string; storeId: string; lines: OrderLine[]; status: ShipmentStatus; history: StatusEvent[]; carrier?: string; trackingNo?: string; deliverAt?: number; deliveryFee: number }
export interface Order { id: string; number: string; buyerId: string; placedAt: number; shipTo: Address; payment: { kind: "card" | "cod"; label: string }; shipments: Shipment[]; isSeed: boolean }
export const GUEST_ID = "guest";

// also in types.ts, so the seed can use it before the slice exists
export interface SessionState { buyerId: string | null; sellerId: string | null; guestCart: CartLine[]; lastPath: { buyer: string; seller: string } }

// src/features/sessionSlice.ts actions:
logIn(payload: { role: Role; accountId: string; guestCart: CartLine[]; stockById: Record<string, number> }) // plain action, dispatched only by logInAs
logOut(payload: { role: Role })
rememberPath(payload: { role: Role; path: string })
// the guest-cart actions go through cartActions below

// src/features/accountsSlice.ts
addBuyer(payload: BuyerAccount)
addSeller(payload: SellerAccount)
// carts: one set of actions for the guest (session) and buyers (accounts), routed by who is signed in
// src/features/cartActions.ts (thunks)
logInAs(role: Role, accountId: string): AppThunk<boolean> // false (and no dispatch) when the id isn't an account of that role
addItemToCart(item: Item, variantId?: string): AppThunk
setCartQuantity(itemId: string, quantity: number, variantId?: string): AppThunk
removeFromCart(itemId: string, variantId?: string): AppThunk

// src/features/itemSlice.ts
addNewItem(payload: Item); updateItem(payload: Item); removeItem(payload: string /* item id */)
decreaseStock(payload: { itemId: string; variantId?: string; quantity: number }[])

// src/features/ordersSlice.ts
addOrder(payload: Order)
// src/features/orderActions.ts (thunk)
placeOrder(args: { shipTo: Address; payment: Order["payment"] }): AppThunk<Order | null>
//   builds the order from the active cart, takes stock (decreaseStock), clears the ordered lines, returns the order

// src/features/cart.ts
export const addToCart: (cart: CartLine[], item: Item, variantId?: string) => CartLine[]
export const setLineQuantity: (cart: CartLine[], itemId: string, quantity: number, variantId?: string) => CartLine[]
export const mergeCarts: (account: CartLine[], guest: CartLine[], stockById: Record<string, number>) => CartLine[]
export const lineKey: (line: { itemId: string; variantId?: string }) => string // "itemId" or "itemId:variantId"

// src/features/orderBuild.ts
export const buildOrder: (args: { id: string; number: string; buyerId: string; now: number; cart: CartLine[]; itemsById: Record<string, Item>; storesById: Record<string, Store>; shipTo: Address; payment: Order["payment"] }) => Order

// src/features/shipmentStatus.ts
export const DELIVER_AFTER_MS = 30_000;
export const LATE_AFTER_MS = 60_000;
export const AUTO_SHIP_STEP_MS = 20_000;
export const effectiveStatus: (s: Shipment, now: number) => ShipmentStatus // "shipped" becomes "delivered" once now >= deliverAt
export type OrderStatus = "placed" | "in-progress" | "partly-shipped" | "shipped" | "delivered" | "cancelled";
export const orderSummaryStatus: (o: Order, now: number) => OrderStatus

// src/features/selectors.ts (all take RootState)
selectActiveBuyer(state): BuyerAccount | null
selectActiveSeller(state): SellerAccount | null
selectActiveStore(state): Store | null              // the active seller's store
selectCart(state): CartLine[]                        // the buyer's cart, or the guest cart
selectCartCount(state): number                       // total units
selectItemsById(state): Record<string, Item>
selectStoresById(state): Record<string, Store>
selectStores(state): Store[]                         // seed order, then sign-up order
selectShopItems(state): Item[]                       // status "active", any stock
selectItemsForStore(state, storeId: string): Item[]  // every status
selectOrdersForBuyer(state, buyerId: string): Order[]           // newest first
selectShipmentsForStore(state, storeId: string): { order: Order; shipment: Shipment }[] // newest first
selectBuyerAccounts(state): BuyerAccount[]
selectSellerAccounts(state): SellerAccount[]
selectStockById(state): Record<string, number>        // keyed by lineKey: item id, and "itemId:variantId" per variant
selectAllOrders(state): Order[]                       // newest first

// src/app/store.ts
export type RootState; export type AppDispatch;
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, AnyAction>;
export const setupStore: (preloadedState?: Partial<RootState>) => EnhancedStore<RootState>;
// src/app/hooks.ts
export const useAppDispatch: () => AppDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState>;
// src/test/renderWithStore.tsx (used by component tests from Phase B on)
export const renderWithStore: (ui: React.ReactElement, opts?: { preloadedState?: Partial<RootState>; route?: string }) => RenderResult & { store: ReturnType<typeof setupStore> };
// wraps Provider, ThemeModeProvider and MemoryRouter initialEntries={[route ?? "/"]}

// src/app/persist.ts
export const STORAGE_KEY = "a-store-data";
export type PersistedState = SeedData; // the five persisted slices; Phase F task 24 adds an optional `reviews`
export const loadState: () => { state: PersistedState | undefined; droppedOld: boolean };
export const saveState: (state: PersistedState) => boolean; // false when the browser refused (storage full)
export const clearState: () => void;

// src/seed/buildSeed.ts
export interface SeedData { accounts: Account[]; session: SessionState; stores: Store[]; items: Item[]; orders: Order[] }
export const buildSeed: (now: number) => SeedData;
export const initialSeed: SeedData;
```

- [ ] **Step 1: Add the test runner**

Run: `npm i -D vitest@2.1.9 jsdom@25.0.1 @testing-library/react@16.1.0 @testing-library/dom@10.4.0 @testing-library/jest-dom@6.6.3 @testing-library/user-event@14.5.2`
Add the scripts `"test": "vitest run"` and `"test:watch": "vitest"`. `vitest.config.ts` uses `@vitejs/plugin-react`, `environment: "jsdom"`, `setupFiles: ["src/test/setup.ts"]`, and `include: ["src/**/*.test.{ts,tsx}"]`. `src/test/setup.ts` imports `@testing-library/jest-dom/vitest` and calls `localStorage.clear()` in `afterEach`. Tests import `describe/it/expect` from `vitest` explicitly, so there are no globals.
Run: `npm test`. Expected: "No test files found", exit code 1 (fine for now).

`src/app/hooks.ts`: `export const useAppDispatch: () => AppDispatch` and `export const useAppSelector: TypedUseSelectorHook<RootState>`. New and touched code uses these.

- [ ] **Step 2: Write the failing pure-helper tests**

`src/features/__tests__/cart.test.ts`:
```ts
const item = { id: "i1", stockNum: 3 } as Item;
it("adds a new line at quantity 1", () => expect(addToCart([], item)).toEqual([{ itemId: "i1", quantity: 1 }]));
it("adds one more but not past the stock", () => {
  expect(addToCart([{ itemId: "i1", quantity: 2 }], item)).toEqual([{ itemId: "i1", quantity: 3 }]);
  expect(addToCart([{ itemId: "i1", quantity: 3 }], item)).toEqual([{ itemId: "i1", quantity: 3 }]);
});
it("keeps variants of one item on separate lines", () => {
  const cart = addToCart([{ itemId: "i1", variantId: "v1", quantity: 1 }], { ...item, variants: [{ id: "v2", values: ["M"], price: 1, stockNum: 5, sku: "x" }] } as Item, "v2");
  expect(cart).toHaveLength(2);
});
it("setLineQuantity 0 removes the line", () => expect(setLineQuantity([{ itemId: "i1", quantity: 2 }], "i1", 0)).toEqual([]));
it("merge caps at stock but keeps the account's own quantity", () => {
  expect(mergeCarts([{ itemId: "a", quantity: 1 }], [{ itemId: "a", quantity: 5 }, { itemId: "b", quantity: 2 }], { a: 3, b: 0 }))
    .toEqual([{ itemId: "a", quantity: 3 }]);
  expect(mergeCarts([{ itemId: "a", quantity: 4 }], [{ itemId: "a", quantity: 1 }], { a: 2 })).toEqual([{ itemId: "a", quantity: 4 }]);
});
```
A variant's stock comes from `variant.stockNum` when `variantId` is given. In `mergeCarts` the stock key is `lineKey(line)`.

`orderBuild.test.ts`: there are two items in two stores (`s1` with fee 0, `s2` with `deliveryFee: 5, freeDeliveryOver: 50`) and a cart with both. Assert:
- `shipments.length === 2`, in the cart's first-seen store order;
- each shipment has `status: "placed"` and `history: [{ status: "placed", at: now }]`;
- line snapshots carry `name`, `price` and `image` from the item (a variant line takes the variant's price and `variantLabel` = `values.join(" / ")`);
- the `s2` shipment's `deliveryFee` is 5 when its subtotal is under 50 and 0 when at or over 50;
- a line whose item id is missing from `itemsById` is skipped;
- `isSeed` is false.

`shipmentStatus.test.ts`:
- a shipped shipment with `deliverAt: 1000` reads "shipped" at `now = 999` and "delivered" at `1000`;
- a shipped shipment with no `deliverAt` stays "shipped" (seeded shipped orders wait for the seller);
- `orderSummaryStatus` returns "partly-shipped" for [shipped, placed], "in-progress" for [packed, placed], "delivered" when every non-cancelled shipment is delivered, "cancelled" only when all are cancelled, and "placed" when all are placed.

- [ ] **Step 3: Run them to verify they fail**

Run: `npm test`. Expected: FAIL, the modules can't be resolved.

- [ ] **Step 4: Write `categories.ts`, `types.ts`, `cart.ts`, `orderBuild.ts` and `shipmentStatus.ts`**

Use the signatures above. `orderSummaryStatus` ignores cancelled shipments unless all of them are cancelled; "return-requested" and "returned" count as delivered for the summary. Order `number` format (used by `buildOrder`'s callers): `"A-" + 5 digits`, counted on from the highest existing number. Seed orders start at `A-10001`.

- [ ] **Step 5: Run the pure tests to verify they pass**

Run: `npx vitest run src/features/__tests__/cart.test.ts src/features/__tests__/orderBuild.test.ts src/features/__tests__/shipmentStatus.test.ts`. Expected: PASS.

- [ ] **Step 6: Write the minimal seed (`catalogue.ts`, `images.ts`, `buildSeed.ts`)**

`SeedData = { accounts: Account[]; session: SessionState; stores: Store[]; items: Item[]; orders: Order[] }`. `buildSeed(now)` takes every time as an offset from `now`. In this task the seed is today's world mapped across:

| Store id / slug | Name | Owner (account id, name) | Category focus | logoLetter / logoColor (token) | Today's items it takes (new id, category) |
| --- | --- | --- | --- | --- | --- |
| `store-tick-tock` / `tick-tock` | Tick & Tock | `acc-mona`, Mona | watches | T / `color.yellow` | Smart watch → `item-tt-smart-watch`, watches |
| `store-carry-co` / `carry-co` | Carry Co. | `acc-karim`, Karim | bags | C / `color.aqua` | City backpack → `item-cc-city-backpack`, bags |
| `store-pocket-signal` / `pocket-signal` | Pocket Signal | `acc-youssef`, Youssef | phones | P / `color.blue` | Wireless headphones → `item-ps-headphones`, audio |
| `store-hearth-lane` / `hearth-lane` | Hearth Lane | `acc-laila`, Laila | home-kitchen | H / `color.orange` | Desk lamp → `item-hl-desk-lamp`, Ceramic mug → `item-hl-ceramic-mug`, both home-kitchen |

Use whichever Gruvbox token names exist in `src/styles/tokens.ts`; the colour is stored as the token's CSS value. Every store has `lowStockAt: 3`, `autoShip: true`, `deliveryFee: 0` and `freeDeliveryOver: null`, and `since` set to `now` minus 400, 300, 200 and 120 days, in the table's order. Taglines are one line each, written by you. Items stay in today's array order (headphones, lamp, mug, watch, backpack), so `vite.config.ts`'s `FIRST_PRODUCT_IMAGE` regex (headphones) still matches the first Buy card until Phase B rewrites the preload. Items keep today's name, description, price, stock and picture, with `status: "active"`, `sku` = store letter + "-" + 3 digits (`T-001`), and `createdAt` = `now` minus (30 − index) days.

Buyers: Ahmed (`acc-ahmed`) and Omar (`acc-omar`). Their single address today becomes their first `Address` (`label: "Home"`, `isDefault: true`, `name` = account name, city taken from the end of today's address string). `paymentMethods` holds `{ id: "cod", kind: "cod", isDefault: true }`. `wishlist`, `recentlyViewed` and `cart` are empty, and `notificationsSeenAt = now`. `avatarColor` uses one token per account. The session is `{ buyerId: null, sellerId: null, guestCart: [], lastPath: { buyer: "/", seller: "/seller" } }`. There are no orders.

`images.ts` holds today's `SEED_IMAGES` map. `persist.ts` imports it from there.

- [ ] **Step 7: Write a seed-shape test**

`src/seed/__tests__/buildSeed.test.ts` › "minimal seed is consistent":
- every item's `storeId` is a store;
- every store's `ownerId` is a seller whose `storeId` points back to it;
- slugs are unique;
- every buyer has exactly one default address and one default payment method.

Run it. Expected: PASS.

- [ ] **Step 8: Write the failing slice and selector tests**

`slices.test.ts` uses `setupStore()` (written in Step 11; write the store factory first if you prefer, the tests only need it to exist) with a preloaded state made from `buildSeed(0)`:
- `logInAs("buyer", "acc-ahmed")` with a guest cart of 2 × `item-ps-headphones` moves those lines into Ahmed's cart (merged), empties `guestCart` and sets `buyerId`. `logInAs("buyer", "acc-mona")` (a seller) returns false and changes nothing.
- `logOut({ role: "buyer" })` clears `buyerId` only. `sellerId` is untouched, and so is the reverse.
- `addItemToCart` with no buyer goes to `session.guestCart`. With Ahmed signed in it goes to his `cart`.
- **"removeItem clears the guest cart and every buyer cart"**: put the item in the guest cart and in two buyers' carts, dispatch `removeItem(id)`, and expect it in none. Orders that contain it are unchanged.
- `placeOrder({ shipTo, payment })` adds one order for Ahmed, lowers stock by the ordered quantities, removes the ordered lines from his cart and returns the order. For a guest (Phase A only) the order gets `buyerId: GUEST_ID`.
- `resetDemoData(5)` brings every slice back to `buildSeed(5)`.

`selectors.test.ts`:
- `selectCartCount` sums quantities;
- `selectShopItems` leaves out draft and archived items;
- `selectShipmentsForStore` returns only that store's shipments, newest first;
- calling a selector twice with the same state returns the same reference (memoised).

- [ ] **Step 9: Run them to verify they fail**

Run: `npm test`. Expected: FAIL, the modules are missing.

- [ ] **Step 10: Write the slices, `cartActions.ts`, `orderActions.ts` and `selectors.ts`; update `resetDemoData`**

- `resetDemoData = createAction("app/resetDemoData", (now: number = Date.now()) => ({ payload: { now } }))`. Every slice handles it with `(_, { payload }) => buildSeed(payload.now).<slice>`.
- Each slice's `initialState` is `buildSeed(Date.now()).<slice>`. Compute the seed once at module level in `buildSeed.ts` (`export const initialSeed = buildSeed(Date.now())`), so all five slices share one `now`.
- Keyed collections (`accounts`, `stores`, `items`, `orders`) are arrays, matching today's slices and the future Mongo collections.
- `logInAs(role, accountId)` (in `cartActions.ts`) checks that the id is an account of that role, then dispatches `logIn({ role, accountId, guestCart: state.session.guestCart, stockById: selectStockById(state) })`. On a check failure it dispatches nothing and returns false. UI calls `logInAs`, never `logIn`.
- `accountsSlice` handles `logIn` with role "buyer": `buyer.cart = mergeCarts(buyer.cart, payload.guestCart, payload.stockById)`. It also handles `removeItem` (strip from every buyer cart and wishlist). `sessionSlice` handles `logIn` (sets `buyerId`/`sellerId`; for a buyer it empties `guestCart`), `logOut`, `rememberPath`, the guest-cart reducers and `removeItem` for `guestCart`.
- `ordersSlice.addOrder` pushes. `orderActions.placeOrder` composes: build the order (id via `uuid`), dispatch `addOrder`, `decreaseStock`, then the cart removal for the active owner. It returns `null` for an empty cart.
- The old `buyItem` goes away. `decreaseStock` never drops below 0.
- `AppThunk` type: `ThunkAction<R, RootState, unknown, AnyAction>` in `store.ts`.
- `types.ts` ends today's circular import (itemSlice ↔ userSlice): slices import types from `types.ts` and actions from each other only where an `extraReducers` case needs them.

- [ ] **Step 11: Write the failing persist tests, then rewrite `persist.ts` and `store.ts`**

`src/app/__tests__/persist.test.ts`:
- "round-trips the five slices": `saveState(seed)` then `loadState()` gives `{ state: seed, droppedOld: false }`, with seed images coming back as the current bundled URLs.
- "drops a version 1 save and reports it": with `{"version":1,"items":[],"users":[]}` saved, `loadState()` gives `{ state: undefined, droppedOld: true }`.
- "rejects a session whose buyer is missing": a saved v2 whose `session.buyerId` is not a buyer account id gives `{ state: undefined, droppedOld: true }`.
- With nothing saved: `{ state: undefined, droppedOld: false }`.

The v2 validity rule: `version === 2`, all five keys present, `accounts/stores/items/orders` are arrays, `session.buyerId` is null or a buyer's id, `session.sellerId` is null or a seller's id, and every store's `ownerId` is a seller's id.

`store.ts` exports `setupStore(preloadedState?: Partial<RootState>)`, plus `store = setupStore(loaded.state)` for the app. The persist listener watches the five persisted slices by reference and leaves `notification` out. On startup, when `loaded.droppedOld` is true, dispatch `showNotification({ type: "info", message: "The demo was updated, so your saved changes were reset." })` once. The `pagehide` flush and the storage-full warning stay. Only the app `store` (not the factory) registers `pagehide`.

Run: `npm test`. Expected: every test so far passes.

- [ ] **Step 12: Move today's pages onto the selectors (no visible change)**

Every file that imported from `userSlice` or read `state.users`/`activeUserIndex` now uses `selectors.ts` and the new actions:
- **Cart badge** (`Buy/index.tsx:33-36`, today `users[activeUserIndex].cart` summed) reads `selectCartCount`. `useBuy`'s exported joined-row type `CartLine` is renamed `CartRow` (item + `quantity` + `orderableNum`) so it doesn't clash with the data type.
- **Cart lines** read `selectCart`/`selectCartCount`. The stepper calls `setCartQuantity`, Add calls `addItemToCart`, Remove calls `removeFromCart`. `CartLine.quantity` replaces `inCartNum` in props.
- **Place order** in `Cart.tsx` calls `placeOrder({ shipTo, payment: { kind: "cod", label: "Cash on delivery" } })`. `shipTo` is the buyer's default address, or for the guest a placeholder `Address` with `id: "guest"` and empty fields. The success message uses the returned order's `number` instead of `shortOrderId`.
- **TrackBought** reads `selectOrdersForBuyer(state, buyerId ?? GUEST_ID)`. It keeps today's clock-driven Ordered → In delivery → Delivered line by feeding `order.placedAt` into the existing `utils/orders.ts` functions. Seller-driven status replaces this in Phase D/E. `groupOrders` and `OrderedItemStatus` go: the page maps `order.shipments.flatMap(s => s.lines)` directly.
- **TrackSold/useSell** reads every order's lines (`selectAllOrders`, then flatMap shipments → lines). It stays "one seller, the store" until Phase E.
- **Sell Home, AddItem, Update and Remove** read all items. AddItem creates an `Item` with `storeId: "store-hearth-lane"` (the placeholder until seller mode lands in Phase B; leave a `// Phase B: active seller's store` comment), `category: "home-kitchen"`, `status: "active"`, `sku: ""` and `createdAt: Date.now()`.
- **LoginDialog/AccountPicker** list `selectBuyerAccounts` and call `logInAs("buyer", id)`. Log out calls `logOut({ role: "buyer" })`. The carry text drops the orders part. It reads "Your cart (3 items) comes with you."
- **useAuth.signUp** builds a `BuyerAccount` (`id: "acc-" + uuid`) with the form's address as the first default address: `label: "Home"`, today's form fields mapped as `address` → `line1`, `optAddress` → `line2`, `city: ""` (no new field; Phase D's address book lets them fill the city). `paymentMethods` starts as `[{ id: "cod", kind: "cod", isDefault: true }]`, and `wishlist`, `recentlyViewed` and `cart` start empty. It dispatches `addBuyer`, then `logInAs`. `isNameTaken` checks buyer names only, ignoring case (today it also matched "Guest"; keep "Guest" reserved by checking it explicitly). The Yup rules stay in `SignUp.tsx` unchanged. `useAuth` keeps its return shape for today's callers (`activeUserName`, `isGuest`, `accounts`, `carryText`, `setLoggedInUser(id)`, `setLoggedOutUser()`, `signUp`, `isNameTaken`), now backed by selectors; `accounts` becomes `BuyerAccount[]` and `AccountPicker` shows `name` and the default address's `line1, city`.
- **ResetDemoDialog** copy: "the five starter items" becomes "the starter stores, products and accounts".
- `resetDemoData()` callers pass nothing (the prepare callback stamps `now`).

Run: `grep -rn "userSlice\|state.users\|activeUserIndex\|inCartNum\|orderedItems" src`. Expected: no matches.

- [ ] **Step 13: Lint, build, test and check by hand**

Run: `npm run lint && npm run build && npm test`. Expected: all pass with no warnings.
Then run `npm run dev` and check at 360 px and 1280 px:
- Buy lists the 5 items.
- Add → stepper.
- Log in as Ahmed and confirm the guest cart moves.
- Place order and confirm Track goes Ordered → Delivered on today's timer.
- Track Sold counts the units.
- Sell: add an item and it appears on Buy.
- Reset brings back the seed.
- A browser holding a version 1 save shows the "demo was updated" toast once.

- [ ] **Step 14: AI-LOG entry 11 and commit**

Add `## 11. Marketplace data layer (Claude Code)` with the prompt, the changes and the check from Step 13.
```bash
git add -A && git commit -m "Add marketplace data layer: accounts, session, stores, orders, saved data v2"
```

---

### Task 2 (spec task 2): Seed catalogue

**Files:**
- Create: `src/seed/seedOrders.ts`, 25 pictures in `src/assets/products/`
- Modify: `src/seed/catalogue.ts`, `src/seed/buildSeed.ts`, `src/seed/images.ts`, `src/assets/products/CREDITS.md`, `docs/AI-LOG.md`
- Test: `src/seed/__tests__/buildSeed.test.ts`

**Interfaces:**
- Consumes: `buildSeed`, all types and ids from Task 1.
- Produces: the stable seed ids below. Exact derivations: item id = `item-` + store letters (`tt`, `cc`, `ps`, `hl`) + `-` + the name lower-cased with every run of non a–z0–9 characters turned into one `-` and the ends trimmed ("Field watch, 38 mm" → `item-tt-field-watch-38-mm`; the five existing items keep their Task 1 ids); SKUs number per store in the product table's order (`T-001`…`T-008`, `C-001`…`C-008`, `P-001`…`P-008`, `H-001`…`H-006`); `Order.id` = `order-` + number (`order-A-10001`); `Shipment.id` = `ship-` + number + `-` + store letters (`ship-A-10002-cc`). Later phases' tests use them: `acc-ahmed`, `acc-omar`, `acc-nour`, `acc-mona`, `acc-karim`, `acc-youssef`, `acc-laila`, the four store ids and slugs from Task 1, the item ids `item-<store letters>-<kebab name>`, and order numbers `A-10001`…`A-10013`.

- [ ] **Step 1: Write the failing seed tests**

Add to `buildSeed.test.ts`:
- "has the full catalogue": 4 stores, 3 buyers, 4 sellers, 30 items. Per store: Tick & Tock 8, Carry Co. 8, Pocket Signal 8, Hearth Lane 6. Exactly 4 items have `stockNum === 0` and at least 3 have `stockNum` between 1 and `lowStockAt`.
- "every item has a picture that resolves": `item.image` is a value of `SEED_IMAGES`.
- "buyers come ready": each buyer has 2 addresses (1 default) and at least one card plus the `cod` method, and each card's expiry is in the future relative to `now`. Expiries are month offsets from `now` (`expMonth`/`expYear` from `new Date(now)` plus N months), so the seed never ages into expired cards.
- "dates are offsets from now": `buildSeed(1_000_000_000_000)` and `buildSeed(2_000_000_000_000)` give orders whose `placedAt - now` values are equal and all within the last 25 days.
- "each store has waiting work": for every store, at least one shipment is `placed` or `packed`.
- "seed orders are internally consistent": every line's `itemId` exists, every shipment's lines belong to its `storeId`, every shipped seed shipment has `carrier`, `trackingNo` and no `deliverAt`, every history is in time order and ends in its `status`, and `isSeed` is true.

Run: `npx vitest run src/seed`. Expected: FAIL (5 items, 2 buyers).

Keep today's five items first in the items array and append the new ones after them, so Buy's first card (and the preload regex) is unchanged until Phase B.

- [ ] **Step 2: Add the products**

Prices are in dollars, as today. The existing five keep their values.

| Store | Product | Category | Price | Stock |
| --- | --- | --- | --- | --- |
| Tick & Tock | Smart watch (existing) | watches | 129 | 2 |
| Tick & Tock | Field watch, 38 mm | watches | 95 | 14 |
| Tick & Tock | Diver watch, steel | watches | 189 | 5 |
| Tick & Tock | Minimal quartz watch | watches | 59 | 22 |
| Tick & Tock | Chronograph, leather strap | watches | 159 | 0 |
| Tick & Tock | Kids' digital watch | watches | 24 | 30 |
| Tick & Tock | Leather watch strap, 20 mm | accessories | 19 | 40 |
| Tick & Tock | Watch winder box | accessories | 49 | 3 |
| Carry Co. | City backpack (existing) | bags | 65 | 8 |
| Carry Co. | Canvas tote | bags | 29 | 25 |
| Carry Co. | Leather wallet | accessories | 35 | 18 |
| Carry Co. | Weekender duffel | bags | 119 | 4 |
| Carry Co. | Laptop sleeve, 14 inch | bags | 32 | 0 |
| Carry Co. | Crossbody sling | bags | 39 | 12 |
| Carry Co. | Card holder | accessories | 15 | 50 |
| Carry Co. | Hiking daypack, 28 L | bags | 85 | 2 |
| Pocket Signal | Wireless headphones (existing) | audio | 89 | 12 |
| Pocket Signal | Budget smartphone, 128 GB | phones | 199 | 9 |
| Pocket Signal | Flagship smartphone, 256 GB | phones | 749 | 3 |
| Pocket Signal | Wireless earbuds | audio | 59 | 20 |
| Pocket Signal | Clear phone case | accessories | 12 | 60 |
| Pocket Signal | 65 W USB-C charger | accessories | 29 | 0 |
| Pocket Signal | Power bank, 10,000 mAh | accessories | 34 | 15 |
| Pocket Signal | Bluetooth speaker | audio | 49 | 2 |
| Hearth Lane | Desk lamp (existing) | home-kitchen | 45 | 3 |
| Hearth Lane | Ceramic mug (existing) | home-kitchen | 14 | 40 |
| Hearth Lane | Pour-over coffee set | home-kitchen | 38 | 7 |
| Hearth Lane | Linen throw blanket | home-kitchen | 55 | 0 |
| Hearth Lane | Cast iron skillet, 26 cm | home-kitchen | 42 | 11 |
| Hearth Lane | Scented candle | home-kitchen | 18 | 2 |

Write a one-sentence description for each, in the voice of today's five (specs and materials, no hype). `createdAt` is spread across the last 60 days so that "Newest" sorts in a mixed order. SKUs number on per store.

- [ ] **Step 3: Add the 25 pictures**

For each new product, pick an Unsplash photo with no visible brand logo. Download it as 640 × 480 WebP through Unsplash's image URL parameters: `https://images.unsplash.com/photo-<id>?w=640&h=480&fit=crop&fm=webp&q=60`. Save it as `src/assets/products/<kebab-name>.webp`, between 2 and 10 KB (lower `q` if a file is bigger). Import each one into `SEED_IMAGES` under its kebab name and add a row to `CREDITS.md` in the same format (file, source URL without parameters). Then open three of the files to check the crop shows the product.

- [ ] **Step 4: Add Nour, the addresses and the cards**

| Account | Addresses (label: line1, city, ZIP, phone) | Payment methods |
| --- | --- | --- |
| Ahmed | **Home** (default): 14 Nile Street, Cairo, 11511, +20 100 000 0001 · **Work**: Smart Village, Building B2, Giza, 12577, +20 100 000 0001 | Visa 4242, expires now + 25 months, holder "Ahmed Hassan" (default) · COD |
| Omar | **Home** (default): 8 Corniche Road, Alexandria, 21500, +20 100 000 0002 · **Parents**: 22 Fouad Street, Alexandria, 21511, +20 100 000 0012 | Mastercard 4444, expires now + 9 months, holder "Omar Khaled" · COD (default) |
| Nour (`acc-nour`, new) | **Home** (default): 5 Pyramids Road, Giza, 12556, +20 100 000 0003 · **Work**: 30 Talaat Harb Street, Cairo, 11121, +20 100 000 0003 | Visa 4242, expires now + 28 months, holder "Nour Adel" (default) · Mastercard 4444, expires now + 6 months, nickname "Work card" · COD |

- [ ] **Step 5: Add the past orders (`seedOrders.ts`)**

Each row is one order. Times are offsets from `now`. Every shipment's history steps are spaced 6 hours apart, starting at `placedAt`. Shipped shipments get a carrier (alternate "Nile Express" and "Delta Post") and a tracking number (`NE` or `DP` + 9 digits, fixed per row). `deliveryFee` is 0.

| # | Buyer | Placed | Shipments: store → lines (qty) → status |
| --- | --- | --- | --- |
| A-10001 | Ahmed | −25 d | Tick & Tock → Field watch (1) → delivered |
| A-10002 | Omar | −22 d | Carry Co. → Canvas tote (2) → delivered · Hearth Lane → Ceramic mug (4) → delivered |
| A-10003 | Nour | −20 d | Pocket Signal → Wireless earbuds (1) → delivered |
| A-10004 | Ahmed | −16 d | Pocket Signal → Clear phone case (2) → delivered · Carry Co. → Leather wallet (1) → delivered |
| A-10005 | Omar | −12 d | Tick & Tock → Minimal quartz watch (1) → delivered |
| A-10006 | Nour | −9 d | Hearth Lane → Pour-over coffee set (1), Desk lamp (1) → delivered |
| A-10007 | Ahmed | −6 d | Carry Co. → City backpack (1) → delivered |
| A-10008 | Omar | −4 d | Pocket Signal → Budget smartphone (1) → shipped · Tick & Tock → Leather watch strap (2) → delivered |
| A-10009 | Nour | −3 d | Tick & Tock → Diver watch (1) → shipped |
| A-10010 | Ahmed | −2 d | Hearth Lane → Cast iron skillet (1) → packed |
| A-10011 | Omar | −1 d | Carry Co. → Crossbody sling (1) → placed · Hearth Lane → Scented candle (2) → packed |
| A-10012 | Nour | −6 h | Tick & Tock → Smart watch (1) → placed · Pocket Signal → Power bank (1) → placed |
| A-10013 | Ahmed | −2 h | Tick & Tock → Kids' digital watch (2) → placed |

`shipTo` is the buyer's default address. `payment` is the buyer's default method label: "Visa ending 4242" / "Mastercard ending 4444" / "Cash on delivery". Seed orders don't lower stock (the stock table is the stock now).

- [ ] **Step 6: Run the seed tests**

Run: `npx vitest run src/seed`. Expected: PASS.

- [ ] **Step 7: Lint, build, test and check by hand**

Run: `npm run lint && npm run build && npm test`. Expected: pass.
Then `npm run dev`:
- Buy shows the 26 in-stock items, with pictures.
- The 4 sold-out items are hidden, as today.
- Log in as Nour, and Track shows her 4 orders.
- Sell's Track Sold shows units from the seed orders.
- Reset brings it all back.
- The first-row pictures still load with high priority (DevTools Network: `fetchpriority=high` on the first 4).

- [ ] **Step 8: AI-LOG entry 12 and commit**

Add `## 12. Seed catalogue: four stores, 30 products, past orders (Claude Code)`.
```bash
git add -A && git commit -m "Seed four stores, 30 products with pictures, three buyers and past orders"
```

---

## Self-review notes

- Spec coverage for Phase A: the slices (accounts, session, stores, items, orders) are Task 1. Selectors are Task 1. `VERSION = 2`, the validity check and the dropped-save toast are Task 1. The types carry the fields the picked ideas need: `variants`/`options`, `compareAtPrice`, `deliveryFee`/`freeDeliveryOver`, `wishlist`, `recentlyViewed`, `OrderLine.reviewId`, the return statuses and `notificationsSeenAt`. Today's pages unchanged is Task 1 Step 13. The seed catalogue is Task 2. Seed dates are offsets from now (Builder notes). Reset covers every slice. The guest keeps a cart in `session`, and guest ordering keeps working until Phase D task 11.
- Reviews get their own slice in spec task 24. `persist.ts` must then load `reviews ?? []`, so the save format doesn't need a `VERSION` bump. Task 24's plan carries that step.
