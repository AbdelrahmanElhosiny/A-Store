# Phase E: Seller Centre Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each seller four working areas: orders (with shipping actions and Auto-ship), a products table (with store settings), a dashboard, and customer profiles built only from that store's orders.

**Architecture:**
- Pages are thin. They sit over pure view-model functions in `src/features/`, which take the store's `{ order, shipment }[]` (Phase A's `selectShipmentsForStore`) and `now`. Those functions are unit-tested against the seed.
- Status changes go through guarded `ordersSlice` reducers. Only thunks dispatch them, and the thunks check ownership and the effective status first.
- A cancel puts the stock back through an `itemSlice` extraReducer on the same action.
- Auto-ship is a pure `autoShipStep` driven by a 1-second tick, started for the app store only. It backfills each step at the time it fell due, so a tab that was closed catches up when it next loads.

**Tech Stack:** React 18, react-router-dom 6 (`useSearchParams`), RTK 1.9, MUI 5, Formik + Yup, Vitest + Testing Library (from Phase A).

**Spec:** `docs/superpowers/specs/2026-11-13-marketplace-overhaul-design.md`, Phase E (tasks 12 to 15). Relevant sections:
- Decisions ("Who moves a shipment");
- Point 1a admin controls;
- Point 2;
- Builder notes (Timers, Seed dates, Archive vs delete, 404s, "late" after 60 s);
- Target structure.

## Global Constraints

- **Workflow:**
  - Branch `marketplace`. No major version upgrades.
  - One spec task = one commit = one `docs/AI-LOG.md` entry; this phase writes entries 22 to 25.
  - No Claude/Anthropic attribution in commit messages. Commit only when the user has asked.
  - `npm run lint`, `npm run build` and `npm test` pass after every task.
- **Look:**
  - Gruvbox tokens and sharp edges (radius 0). Seller pages keep the `sell` class and theme.
  - Nothing scrolls sideways at 360 px. Below 600 px, table rows stack as blocks.
- **Paths:** every path is spelled only in `src/constant/routes.ts`. In this phase's code, seller query strings are built only by `sellerOrdersLink` and `sellerProductsLink`. Phase C's `sellerSearchPath` uses the same `URLSearchParams` encoding (`?q=a+b`).
- **Ownership:** a seller only sees and changes their own store.
  - Pages read through `useSellerStore()` and `useStoreShipments()`.
  - Another store's id renders `<Error404 />` inside the seller layout.
  - Status thunks return `false` without dispatching when the shipment isn't the active store's.
- **Privacy:** seller views read the store's shipment plus only these order fields: `id`, `number`, `buyerId`, `placedAt`, `shipTo`, and `payment.label` (order page only). They never read `order.shipments`, accounts, addresses or payment methods.
- **Time:** reducers never call `Date.now()`. Times come in the payload as `at`.

## Review Focus

1. **Auto-ship racing a manual action on the same shipment** (the same second, or a stale page).
   - Expected: the second action is a no-op, with no duplicate history event. The page warns "This order has moved on since you opened it."
   - Pinned in Task 1: `ordersSlice.test.ts` › "a transition from the wrong status is a no-op" and › "autoShipApply skips a shipment whose status changed", plus `SellerOrderPage.test.tsx` › "a stale dialog warns".
2. **Cancelling after shipping, or cancelling twice.**
   - Expected: nothing changes and no stock comes back. An allowed cancel restocks exactly once.
   - Pinned in Task 1: `fulfilmentActions.test.ts` › "cancel after shipped changes nothing" and › "cancelling twice restocks once".
3. **Bulk delete over a mix of drafts with orders, drafts without, and active items.**
   - Expected: only drafts without orders are deleted, and the dialog says how many stay and why.
   - Pinned in Task 2: `products.test.ts` › "planBulkDelete keeps drafts with orders and non-drafts", and `ProductsPage.test.tsx` › "bulk delete".
4. **Quick stock or price edits typed as `-1`, `2.5`, `abc`, or left empty.**
   - Expected: the full form's message appears, nothing is saved, and Esc restores the saved value.
   - Stock set below a cart's quantity is valid and saves; Phase A's `orderableNum` caps the cart.
   - Pinned in Task 2: `products.test.ts` › "validateQuickEdit", and `ProductsPage.test.tsx` › "invalid quick stock saves nothing".
5. **A seller deep-linking another store's product, order or customer.**
   - Expected: the seller 404.
   - Pinned in Task 1 (`SellerOrderPage.test.tsx` › "another store's order is a 404"), Task 2 (`ProductFormPage.test.tsx` › "another store's product is a 404") and Task 4 (`CustomerPage.test.tsx` › "a buyer with no orders here is a 404").

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/features/fulfilment.ts` (new) | `CARRIERS`, `generateTrackingNo`, `effectiveHistory`, `autoShipStep` |
| `src/features/fulfilmentActions.ts` (new) | Status thunks, `runAutoShip` |
| `src/features/ordersSlice.ts`, `itemSlice.ts`, `cart.ts`, `accountsSlice.ts`, `sessionSlice.ts` (modify) | Guarded status reducers, restock, item status and stock, cart cleanup |
| `src/app/autoShip.ts` (new), `src/app/store.ts` (modify) | The Auto-ship tick, app store only |
| `src/features/sellerOrders.ts`, `products.ts`, `storeStats.ts`, `customers.ts` (new) | Pure view models, one per area |
| `src/hooks/useSellerStore.ts`, `src/pages/Seller/components/ShipmentStatusChip.tsx` (new) | Shared seller helpers |
| `src/utils/formatWhen.ts`, `src/components/ConfirmDialog.tsx` (Phase D creates both with the signatures below; reuse them, create only if missing) | Date formatting, yes/no dialog |
| `src/pages/Seller/{Orders,Products,Dashboard,Customers}/*`, `src/pages/Seller/StoreSettings.tsx` (new) | The pages |
| `src/test/sellerState.ts` (new) | `sellerState(sellerId, now)`: the seed with a seller signed in |
| `src/routes/Index.tsx`, `vite.config.ts` (modify) | Replace the seller `ComingSoon` routes; repoint `START_CODE`/`ROUTE_SOURCES` |
| `src/pages/Sell/*` (deleted in Tasks 2 and 3) | Replaced by the files above |

**Seed facts used below** (`buildSeed(NOW)`, every `lowStockAt` is 3)

Tick & Tock (`store-tick-tock`, owner `acc-mona`) shipments:

| Order | Placed | Buyer | Lines | Total | Status |
| --- | --- | --- | --- | --- | --- |
| A-10001 | −25 d | Ahmed | Field watch, 38 mm | 95 | delivered |
| A-10005 | −12 d | Omar | Minimal quartz watch | 59 | delivered |
| A-10008 | −4 d | Omar | Leather watch strap, 20 mm ×2 | 38 | delivered |
| A-10009 | −3 d | Nour | Diver watch, steel | 189 | shipped, no `deliverAt` |
| A-10012 | −6 h | Nour | Smart watch | 129 | placed |
| A-10013 | −2 h | Ahmed | Kids' digital watch ×2 | 48 | placed |

- **Tick & Tock stock:** low is Smart watch (2) and Watch winder box (3); sold out is Chronograph, leather strap (0).
- **Hearth Lane, all time:** $217 from 4 orders and 9 units.
- **Lookups in tests:** orders by `number`, items by `name`, except the five pinned item ids (see Contract gaps).

---

### Task 1 (spec task 12): Seller orders, shipping actions, Auto-ship

**Files:**
- Create:
  - `src/features/fulfilment.ts`, `fulfilmentActions.ts`, `sellerOrders.ts`
  - `src/app/autoShip.ts`
  - `src/hooks/useSellerStore.ts`, `src/pages/Seller/components/ShipmentStatusChip.tsx`
  - `src/utils/formatWhen.ts` and `src/components/ConfirmDialog.tsx` only if Phase D hasn't created them
  - `src/pages/Seller/Orders/SellerOrdersPage.tsx`, `SellerOrderPage.tsx`, `ShipDialog.tsx`
  - `src/test/sellerState.ts`
- Modify: `src/features/ordersSlice.ts`, `itemSlice.ts`, `src/app/store.ts`, `src/routes/Index.tsx`, `docs/AI-LOG.md`
- Test:
  - `src/features/__tests__/ordersSlice.test.ts`, `fulfilment.test.ts`, `fulfilmentActions.test.ts`, `sellerOrders.test.ts`
  - `src/app/__tests__/autoShip.test.ts`
  - `src/pages/Seller/Orders/__tests__/SellerOrdersPage.test.tsx`, `SellerOrderPage.test.tsx`

**Interfaces:**
- Consumes:
  - Phase A: the types, `effectiveStatus`, `DELIVER_AFTER_MS`, `LATE_AFTER_MS`, `AUTO_SHIP_STEP_MS`, `selectActiveStore`, `selectShipmentsForStore`, `selectAllOrders`, `removeItem`, `updateItem`, `logOut`, `setupStore`, `AppThunk`, `renderWithStore`, `buildSeed`.
  - Phase B: `ROUTES`, `Error404`.
  - Existing app code: `useNow`, `AppDialog`, `ProductThumb`, `formatPrice`.
- Produces:

```ts
// src/features/ordersSlice.ts: plain actions, dispatched only by the thunks below; wrong current status → no-op
export type ShipmentRef = { orderId: string; shipmentId: string };
markPacked(payload: ShipmentRef & { at: number })      // placed → packed
markShipped(payload: ShipmentRef & { at: number; carrier: CarrierName; trackingNo: string }) // packed → shipped; deliverAt = at + DELIVER_AFTER_MS
markDelivered(payload: ShipmentRef & { at: number })   // shipped → delivered at Math.min(at, deliverAt ?? at)
cancelShipment(payload: ShipmentRef & { at: number; lines: { itemId: string; variantId?: string; quantity: number }[] }) // placed|packed → cancelled
autoShipApply(payload: AutoShipChange[])               // each change applies only while shipment.status === change.from
// itemSlice extraReducer on cancelShipment: adds each line's quantity back to the item or its variant (cap 9999).
// Missing items are skipped; archived items are restocked. itemSlice imports ordersSlice, never the reverse.

// src/features/fulfilment.ts
export const CARRIERS = [{ name: "Nile Express", prefix: "NE" }, { name: "Delta Post", prefix: "DP" }] as const;
export type CarrierName = (typeof CARRIERS)[number]["name"];
export const generateTrackingNo: (carrier: CarrierName, random?: () => number) => string; // prefix + 9 zero-padded digits
export const effectiveHistory: (s: Shipment, now: number) => StatusEvent[]; // appends { delivered, at: deliverAt } once effectiveStatus says delivered
export interface AutoShipChange { orderId: string; shipmentId: string; from: "placed" | "packed"; events: StatusEvent[]; carrier?: CarrierName; trackingNo?: string; deliverAt?: number }
export const autoShipStep: (orders: Order[], stores: Store[], sellerStoreId: string | null, now: number, random?: () => number) => AutoShipChange[];

// src/features/fulfilmentActions.ts: read Date.now(), check the active store and effectiveStatus; false = nothing dispatched
packShipment(ref: ShipmentRef): AppThunk<boolean>
shipShipment(ref: ShipmentRef, carrier: CarrierName, trackingNo: string): AppThunk<boolean>
deliverShipment(ref: ShipmentRef): AppThunk<boolean>
cancelShipmentAndRestock(ref: ShipmentRef): AppThunk<boolean> // lines come from state
runAutoShip(now: number, random?: () => number): AppThunk<number> // sellerStoreId = selectActiveStore(state)?.id ?? null (either mode); returns shipments moved
// src/app/autoShip.ts
export const AUTO_SHIP_TICK_MS = 1_000;
export const startAutoShip: (store: ReturnType<typeof setupStore>, tickMs?: number) => () => void; // runs once now, then each tick; returns stop

// src/features/sellerOrders.ts
export type OrdersTab = "to-pack" | "to-ship" | "shipped" | "delivered" | "cancelled" | "all";
export const ORDER_TABS: { id: OrdersTab; label: string; statuses: ShipmentStatus[] | null }[];
//   To pack [placed] · To ship [packed] · Shipped [shipped] · Delivered [delivered, return-requested, returned] · Cancelled · All (null)
export type StoreShipment = { order: Order; shipment: Shipment };
export interface SellerOrderRow { orderId: string; shipmentId: string; number: string; buyerId: string; buyerName: string; placedAt: number; units: number; total: number; status: ShipmentStatus; isLate: boolean }
export const shipmentTotal: (s: Shipment) => number;   // Σ price × quantity + deliveryFee; the one money rule in this phase
export const shipmentUnits: (s: Shipment) => number;
export const isLate: (e: StoreShipment, now: number) => boolean; // effective placed|packed && now - placedAt > LATE_AFTER_MS
export const toSellerOrderRows: (entries: StoreShipment[], now: number) => SellerOrderRow[]; // keeps order; buyerName = shipTo.name || "Guest"
export interface OrdersQuery { tab: OrdersTab; q: string; late: boolean }
export const parseOrdersQuery: (params: URLSearchParams) => OrdersQuery; // missing/bad tab → q ? "all" : "to-pack"; late = "late=1"
export const filterOrderRows: (rows: SellerOrderRow[], query: OrdersQuery) => SellerOrderRow[]; // q: case-insensitive, in number or buyerName
export const countByTab: (rows: SellerOrderRow[], q: string, late: boolean) => Record<OrdersTab, number>; // after q and late
export const sellerOrdersLink: (query?: Partial<OrdersQuery>) => string; // ROUTES.sellerOrders + URLSearchParams, defaults omitted

// src/hooks/useSellerStore.ts
export const useSellerStore: () => Store;              // selectActiveStore; throws on null (RequireSeller guards)
export const useStoreShipments: () => StoreShipment[]; // newest first
// src/utils/formatWhen.ts
export const formatDateTime: (at: number) => string;   // "Nov 13, 14:05"
export const formatDay: (at: number) => string;        // "Nov 13, 2026"
// components
const ConfirmDialog: React.FC<{ isOpen: boolean; onClose: () => void; title: string; subtitle?: string; text: React.ReactNode; confirmLabel: string; cancelLabel?: string; tone?: "error" | "primary"; onConfirm: () => void }>;
export const SELLER_STATUS_LABEL: Record<ShipmentStatus, string>; // "To pack", "To ship", "Shipped", "Delivered", "Cancelled", "Return requested", "Returned"
const ShipmentStatusChip: React.FC<{ status: ShipmentStatus; isLate?: boolean }>; // adds a red "Late" chip
// src/test/sellerState.ts
export const sellerState: (sellerId: string | null, now: number) => Partial<RootState>;
```

- [ ] **Step 1: Write the failing pure tests**

**`ordersSlice.test.ts`.** Fixture: a non-seed order `o1` with one shipment `s1` of `store-tick-tock`, placed at 0.

| Test | Expected |
| --- | --- |
| "markPacked moves placed to packed" | last event `{ packed, 5 }` |
| "a transition from the wrong status is a no-op" | a second `markPacked` keeps the history length at 2; `markShipped` from placed and `cancelShipment` on shipped change nothing |
| "markShipped sets carrier, tracking and deliverAt" | at 100: `{ carrier: "Delta Post", trackingNo: "DP123456789", deliverAt: 30_100 }` |
| "markDelivered logs the earlier of at and deliverAt" | `deliverAt` 30_100, `at` 50_000 → event at 30_100 |
| "autoShipApply skips a shipment whose status changed" | `{ from: "placed" }` against a shipment packed at 10_000 → history unchanged |

**`fulfilment.test.ts`** (`R = () => 0`):
- `generateTrackingNo("Nile Express", R)` returns `"NE000000000"`. 50 random calls all match `/^(NE|DP)\d{9}$/`.
- `effectiveHistory`, with `deliverAt` 30_000:
  - there is no delivered event at 29_999;
  - the last event is `{ delivered, 30_000 }` at 30_000;
  - a seeded shipped shipment without `deliverAt` never gets one.

`autoShipStep` cases. Fixture: a non-seed Tick & Tock order (`autoShip: true`) placed at 0, with `sellerStoreId` null unless the row says otherwise.

| Test | Input | Expected |
| --- | --- | --- |
| "nothing before 20 s" | now 19_999 | `[]` |
| "placed to packed at 20 s" | now 20_000 | `[{ from: "placed", events: [{ packed, 20_000 }] }]` |
| "catches up two steps after the tab was closed" | now 45_000 | events packed@20_000, shipped@40_000; `"Nile Express"`, `"NE000000000"`, `deliverAt` 70_000 |
| "steps from the last event" | manual pack at 30_000 | 45_000 → `[]`; 50_000 → `{ from: "packed", events: [shipped@50_000] }` |
| "skips the signed-in seller's store" | `sellerStoreId` `"store-tick-tock"` | `[]` |
| "skips stores with Auto-ship off" | | `[]` |
| "skips shipped, delivered and cancelled" | | `[]` |
| "moves only its own store's shipment" | two-store order; Carry Co. has `autoShip: false` | the Carry Co. shipment stays |
| "never touches seed orders" | `autoShipStep(seed.orders, seed.stores, null, NOW + 3_600_000)` | `[]`, though A-10012 and A-10013 are placed |
| "a backlog moves when the seller signs out" | now 50_000 | `"store-tick-tock"` → `[]`; null → packed@20_000 then shipped@40_000 |

**`sellerOrders.test.ts`** (`rows` = Tick & Tock rows at NOW):
- "counts per tab": `countByTab(rows, "", false)` returns `{ "to-pack": 2, "to-ship": 0, shipped: 1, delivered: 3, cancelled: 0, all: 6 }`.
- "a shipped shipment past deliverAt is Delivered": a synthetic `deliverAt: NOW - 1` gives status "delivered".
- "rows hold only this store's shipment": the A-10012 row has total 129 and 1 unit (no power bank).
- "search by number or buyer": `"10013"` returns `["A-10013"]`. `"NOUR"` on "all" returns `["A-10012", "A-10009"]`.
- "late after 60 s":
  - A-10013 and A-10012 are late at NOW;
  - a synthetic placed order is not late at `placedAt + 60_000` but is late at `+ 60_001`;
  - a packed order counts as late, a shipped one never does.
- "parseOrdersQuery defaults":
  - `""` gives `{ tab: "to-pack", q: "", late: false }`;
  - `"q=10001"` gives tab "all";
  - `"tab=zzz"` gives "to-pack";
  - `"tab=to-ship&late=1"` gives `late: true`.
- "sellerOrdersLink":
  - `{ tab: "all", late: true }` → `"/seller/orders?tab=all&late=1"`;
  - `{ q: "a b" }` → `"/seller/orders?q=a+b"`.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/features`. Expected: FAIL (the modules are missing).

- [ ] **Step 3: Implement the reducers, `fulfilment.ts` and `sellerOrders.ts`**

`autoShipStep` steps from the last history event:
```ts
// eligible: !order.isSeed && store.autoShip && store.id !== sellerStoreId && status placed|packed
let status = shipment.status, last = shipment.history.at(-1)!.at; const events = [];
while ((status === "placed" || status === "packed") && last + AUTO_SHIP_STEP_MS <= now) {
  last += AUTO_SHIP_STEP_MS; status = status === "placed" ? "packed" : "shipped"; events.push({ status, at: last });
}
// reached shipped: carrier = random() < 0.5 ? "Nile Express" : "Delta Post"; trackingNo = generateTrackingNo(carrier, random); deliverAt = last + DELIVER_AFTER_MS
```
Run: `npx vitest run src/features`. Expected: PASS.

- [ ] **Step 4: Write the failing thunk and tick tests**

**`fulfilmentActions.test.ts`.** Setup: `setupStore(sellerState("acc-mona", NOW))`, fake timers at NOW. `A13` is A-10013's ref, `kids` the "Kids' digital watch".
- "packShipment moves A-10013 to packed": returns true.
- "a seller can't move another store's shipment": A-10011's Carry Co. ref returns false, and the state is unchanged.
- "cancelling restocks the lines": returns true, the status is "cancelled", and `kids` goes from 30 to 32.
- "cancelling twice restocks once": the second call returns false, and the stock stays 32.
- "cancel after shipped changes nothing": pack, ship (`"Nile Express"`, `"NE123456789"`), then cancel. Cancel returns false, and the stock stays 30.
- "deliverShipment is refused once the timer delivered it": ship, advance 30 s, then deliver returns false.
- "restock skips a deleted item and refills an archived one".
- "runAutoShip leaves the signed-in seller's new order alone": a non-seed Tick & Tock order placed at `NOW - 50_000`.
  - With Mona signed in, `runAutoShip(NOW)` returns 0.
  - After `logOut({ role: "seller" })` it returns 1, and the shipment is "shipped".

**`autoShip.test.ts`.** Fake timers at 0, Mona signed out, and a non-seed Tick & Tock order placed at 0. Start with `stop = startAutoShip(store, 1_000)`.
- After `advanceTimersByTime(20_000)`: "packed".
- After another 20_000: "shipped", with `deliverAt` 70_000.
- After `stop()` and 60_000 more: the dispatch spy sees no new calls.

- [ ] **Step 5: Implement the thunks and `autoShip.ts`**

Call `startAutoShip(store)` beside the `pagehide` registration, so it runs for the app store only and never inside `setupStore`.

Run: `npx vitest run src/features src/app`. Expected: PASS.

- [ ] **Step 6: Write the failing page tests**

Page tests use `renderWithStore(<RouterIndex />, { preloadedState: sellerState(id, Date.now()), route })`.

**`SellerOrdersPage.test.tsx`** (Mona):
- `/seller/orders`:
  - "To pack" is selected, with rows A-10013 and A-10012, each with a "Late" chip;
  - the tabs match `/To pack\s*2/`, `/To ship\s*0/`, `/Shipped\s*1/`, `/Delivered\s*3/`, `/Cancelled\s*0/` and `/All\s*6/`.
- `?q=nour`: "All" is selected with 2 rows, and clicking A-10012 goes to its order page.
- "search also points at products" (the spec's seller search covers orders and products): with `?q=watch`, a line above the table reads "7 products match “watch”" and links to `sellerProductsLink({ q: "watch" })`. With no product match the line is absent.
- `?tab=all&late=1`: 2 rows and a "Late only" chip. The chip's × removes `late`.

**`SellerOrderPage.test.tsx`:**
- "another store's order is a 404": Mona on A-10002 sees "Page not found".
- "shows only this store's shipment": Laila on A-10011.
  - She sees "Scented candle" and no "Crossbody sling".
  - The buyer link goes to `ROUTES.sellerCustomer("acc-omar")`.
  - "8 Corniche Road", "+20 100 000 0002" and "Cash on delivery" are shown.
- "pack then ship": Mona on A-10013.
  1. "Mark packed" toasts "Order A-10013 marked as packed".
  2. "Mark shipped" opens the dialog with Carrier "Nile Express" and `/^NE\d{9}$/`.
  3. Choosing "Delta Post" gives `/^DP\d{9}$/` with the same digits.
  4. An empty number shows "Enter a tracking number".
  5. Submitting "dp123456789" shows "Delta Post", "DP123456789" and the "Mark delivered" button.
- "cancel restocks":
  - "Cancel order", then confirm "Cancel order";
  - the status shows "Cancelled" and no action buttons remain;
  - the toast is "Order A-10013 cancelled. The stock is back."
- "re-renders after an outside move": `store.dispatch(markPacked(...))`. The page now offers "Mark shipped", not "Mark packed".
- "a stale dialog warns": open "Cancel order" on A-10013, then dispatch `markPacked` and `markShipped` from outside, then confirm. The page toasts "This order has moved on since you opened it.", and the Kids' digital watch stock stays 30.

- [ ] **Step 7: Build the pages and routes**

The tests fix the copy, the columns and which actions each status offers. What they leave open:

- **Routes:** `seller/orders` and `seller/orders/:orderId` replace their `ComingSoon` routes. Both are lazy and use `useNow(true)`.
- **Search:** the search field writes `?q=` with `replace`, and the tabs write `?tab=`.
- **Status section:** it renders `effectiveHistory` with `SELLER_STATUS_LABEL`. Once shipped, it adds "Arrives about <time>" while `deliverAt` is still ahead.
- **Cancel dialog:** `ConfirmDialog`, tone "error", with the text "The buyer sees it as cancelled and the stock goes back. This can't be undone." and `cancelLabel` "Keep order".
- **`ShipDialog`** (Formik + Yup):
  - The tracking number starts as `generateTrackingNo("Nile Express")`.
  - Changing the carrier swaps the prefix, as long as the value still starts with the old one.
  - The number is trimmed and upper-cased, then must match `/^[A-Z0-9]{6,20}$/`; otherwise it shows "Use 6 to 20 letters and digits".

- [ ] **Step 8: Run everything, check by hand, AI-LOG and commit**

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

By hand, at 360 px and 1280 px:
1. Buy a watch as Ahmed. Sign in as Karim, wait 45 s, then switch to Tick & Tock: the order is Shipped, with backfilled times.
2. Buy again and switch to Tick & Tock at once: the order stays in To pack.
3. Ship it. The buyer's order page shows Delivered about 30 s later.
4. Close the tab for 2 minutes and reopen it: the other store's new order caught up.

Add `## 22. Seller orders: tabs, order page, shipping actions, Auto-ship (demo) (Claude Code)`.
```bash
git add -A && git commit -m "Add seller orders: tabs, order page, pack/ship/deliver/cancel with restock, Auto-ship demo"
```

---

### Task 2 (spec task 13): Products table, product form, store settings

**Files:**
- Create:
  - `src/features/products.ts`
  - `src/pages/Seller/Products/ProductsPage.tsx`, `QuickEditCell.tsx`, `BulkBar.tsx`, `BulkStockDialog.tsx`, `ProductFormPage.tsx`
  - `ProductFields.tsx` (from `Sell/components/ItemFields.tsx`), `productSchema.ts` (from `Sell/itemSchema.ts`), `productForm.ts`
  - `src/pages/Seller/StoreSettings.tsx`, `storeSettingsSchema.ts`
- Modify:
  - `src/features/itemSlice.ts`, `accountsSlice.ts`, `sessionSlice.ts`, `cart.ts`
  - `src/pages/Sell/useSell.ts` (trim it to `{ items, soldLines }` for TrackSold)
  - `src/routes/Index.tsx`, `vite.config.ts`, `docs/AI-LOG.md`
- Delete: `src/pages/Sell/Home.tsx`, `AddItem.tsx`, `itemSchema.ts`, `components/*`
- Test: `src/features/__tests__/products.test.ts`, `itemStatus.test.ts`, `src/pages/Seller/Products/__tests__/ProductsPage.test.tsx`, `ProductFormPage.test.tsx`, `src/pages/Seller/__tests__/StoreSettings.test.tsx`

**Interfaces:**
- Consumes:
  - Phase A: `Item`, `ItemStatus`, `CATEGORIES`, `CartLine`, `addNewItem`, `updateItem`, `removeItem`, `selectItemsForStore`, `selectAllOrders`.
  - Phase B: `updateStore`, `slugify`.
  - Task 1: `StoreShipment`, `useSellerStore`, `useStoreShipments`, `ConfirmDialog`.
  - Existing app code: `StockField`, `PriceField`, `ImageField`, `EmptyState`.
- Produces:

```ts
// src/features/itemSlice.ts
setItemsStatus(payload: { ids: string[]; status: ItemStatus })
adjustStock(payload: { ids: string[]; by: number }) // clamped 0..9999; items with variants skipped until Phase F
// src/features/cart.ts
export const removeItemsFromCart: (cart: CartLine[], itemIds: string[]) => CartLine[];
// accountsSlice (buyer carts) and sessionSlice (guestCart) strip ids on setItemsStatus draft|archived
// and on updateItem with payload.status !== "active". Wishlists keep the id.

// src/features/products.ts
export interface ProductFilters { q: string; status: ItemStatus | "all"; stock: "all" | "low" | "out" }
export const parseProductFilters: (params: URLSearchParams) => ProductFilters; // invalid → defaults
export const sellerProductsLink: (filters?: Partial<ProductFilters>) => string;
export const stockLevel: (stockNum: number, lowStockAt: number) => "out" | "low" | "ok"; // 0 out; 1..lowStockAt low
export const filterProducts: (items: Item[], filters: ProductFilters, lowStockAt: number) => Item[]; // q: name or sku, case-insensitive
export const unitsSoldByItem: (entries: StoreShipment[]) => Record<string, number>; // cancelled excluded
export const itemIdsWithOrders: (orders: Order[]) => Set<string>; // any order, any status
export const planBulkDelete: (selected: Item[], withOrders: Set<string>) => { deletable: Item[]; skipped: Item[] }; // draft && no orders
export const nextSku: (letter: string, skus: string[]) => string; // letter-(max+1, 3 digits) over /^<letter>-(\d+)$/i
export const duplicateItem: (item: Item, args: { id: string; sku: string; now: number }) => Item; // " (copy)", draft, createdAt now, variant ids `${id}-v${i}`
export const validateQuickEdit: (field: "stockNum" | "price", text: string) => { ok: true; value: number } | { ok: false; error: string }; // getItemSchema(0).pick([field])

// src/pages/Seller/Products/productSchema.ts: the moved itemSchema with the same messages
const getItemSchema: (minStock: 0 | 1, skusInUse?: Record<string, string> /* upper-cased SKU → name, the store's other items */) => yup.ObjectSchema<…>;
//   + category: required "Pick a category", one of CATEGORIES
//   + sku: trim, upper-case; required "Enter a SKU"; /^[A-Z0-9-]{1,20}$/ "Use up to 20 letters, digits and dashes"; taken → "That SKU is already used by <name>"
//   + status: active|draft|archived
// src/pages/Seller/Products/productForm.ts
export interface ProductFormFields { name: string; description: string; price: string; stockNum: string; image: string; category: CategoryId | ""; sku: string; status: ItemStatus }
export const toFormFields: (item: Item) => ProductFormFields;
export const fromFormFields: (base: Item | Pick<Item, "id" | "storeId" | "createdAt">, fields: ProductFormFields) => Item; // keeps options/variants/compareAtPrice
// src/pages/Seller/storeSettingsSchema.ts
export const LOGO_COLORS: string[]; // the distinct seed logoColors, then color.red and color.green
```

- [ ] **Step 1: Write the failing pure and slice tests**

**`products.test.ts`** (Tick & Tock items and entries):
- "parseProductFilters defaults": `"status=zzz&stock=low"` gives `{ q: "", status: "all", stock: "low" }`.
- "filters by stock":
  - "low" gives `["Smart watch", "Watch winder box"]`;
  - "out" gives `["Chronograph, leather strap"]`;
  - with `lowStockAt` 5, "low" also includes "Diver watch, steel".
- "search by name or SKU": `"watch"` matches 7, `"t-00"` matches 8, and status `"draft"` matches 0.
- "unitsSoldByItem":
  - "Kids' digital watch" sold 2 and "Smart watch" sold 1;
  - a synthetic cancelled shipment adds nothing.
- "itemIdsWithOrders": includes `item-tt-smart-watch`, but not the Chronograph.
- "planBulkDelete keeps drafts with orders and non-drafts": from [draft without orders, draft in `withOrders`, active without orders], only the first is deletable; the other two are skipped.
- "nextSku":
  - `("T", ["T-001", "T-008", "X-120"])` gives `"T-009"`;
  - `("P", [])` gives `"P-001"`;
  - `("T", ["t-099"])` gives `"T-100"`.
- "duplicateItem": Smart watch with `{ id: "n1", sku: "T-009", now: 7 }` becomes "Smart watch (copy)", a draft with `sku` "T-009", `createdAt` 7, `storeId` "store-tick-tock", and the same price and stock.
- "validateQuickEdit":

  | Field | Input | Result |
  | --- | --- | --- |
  | stockNum | `"-1"` | "Can't be below 0" |
  | stockNum | `"2.5"`, `"abc"` | "Enter a whole number" |
  | stockNum | `""` | "Enter how many are in stock" |
  | stockNum | `"0"` | ok, 0 |
  | price | `"0"` | "The price must be more than $0" |
  | price | `"12.345"` | "At most 2 decimals" |
  | price | `"12.5"` | ok, 12.5 |

**`itemStatus.test.ts`.** Setup: `item-tt-smart-watch` in the guest cart and in Ahmed's and Omar's carts.
- "archiving removes the item from every cart": the orders are unchanged.
- "draft also leaves carts, active doesn't".
- "updateItem to draft clears carts".
- "adjustStock clamps": `by: -999` gives 0, and `by: 99999` gives 9999.

- [ ] **Step 2: Run them to verify they fail, implement, run them again**

Run: `npx vitest run src/features`. Expected: FAIL.

Implement `products.ts`, the slice changes, `productSchema.ts` and `productForm.ts`.

Run it again. Expected: PASS.

- [ ] **Step 3: Write the failing page tests**

**`ProductsPage.test.tsx`** (Mona, `/seller/products`):
- **The table:**
  - 8 rows, and no Carry Co. product;
  - columns Picture, Name, SKU, Category, Price, Stock, Status, Sold;
  - Smart watch shows sold 1.
- **Filters:** `?status=active&stock=low` shows 2 rows.
- **"invalid quick stock saves nothing":**
  - in Smart watch's stock cell, type `-1` and press Enter;
  - the cell shows "Can't be below 0", and the stored stock stays 2;
  - Esc shows 2 again.
- **"quick stock saves on Enter":**
  - typing 7 toasts "Smart watch: stock 7";
  - a price edit toasts "Smart watch: price $119".
- **"bulk delete":** preload two Tick & Tock drafts, one of them inside a synthetic order.
  1. Select both, plus Field watch.
  2. Choose "Delete drafts". The dialog says "Delete 1 draft? This can't be undone. 2 selected products have orders or aren't drafts, so they stay."
  3. Confirm. Only the draft without orders is gone, and the toast is "1 draft deleted".
- **"bulk archive":** Field watch → Set status → Archived. Its chip reads "Archived", and the toast is "1 product archived".
- **"delete or archive per row":**
  - the Chronograph's row menu has "Delete";
  - Smart watch's menu has only "Archive", with "Has orders, so it can be archived, not deleted."

**`ProductFormPage.test.tsx`:**
- "another store's product is a 404": Mona at `ROUTES.sellerProduct("item-cc-city-backpack")`.
- "new product defaults": Category "Watches", SKU "T-009", Status "Active".
- "duplicate SKU": Smart watch's SKU, read from state, shows "That SKU is already used by Smart watch".
- "save a draft":
  - a Draft save stores `status: "draft"`, goes to `/seller/products`, and toasts "<name> saved as a draft";
  - an Active save toasts "<name> is now in the shop".
- "Duplicate": on Smart watch's page, "Duplicate" opens the copy's edit page, showing "Smart watch (copy)" as a Draft, and toasts "Copy saved as a draft".

**`StoreSettings.test.tsx`** (Mona, `/seller/store`):
- Threshold 5, then Save: `lowStockAt: 5` and the toast "Store settings saved".
- "carry co" gives "That store name is taken". Keeping "Tick & Tock" saves, and the slug stays `tick-tock`.
- Switching "Auto-ship (demo)" off saves `autoShip: false`.
- Logo letter "tt" gives "One letter or digit".

- [ ] **Step 4: Build the pages**

The tests fix the copy and the behaviour they assert. What they leave open:

- **Routes:**
  - `seller/products` → `ProductsPage`;
  - `seller/products/new` and `seller/products/:itemId` → `ProductFormPage`;
  - `seller/store` → `StoreSettings`.
- **Filters:** they live in the query (`parseProductFilters` / `sellerProductsLink`). Select-all covers the filtered rows.
- **Stock colour:** comes from `stockLevel`: low is `color.orange`, out is `color.red`.
- **`QuickEditCell`** (its own small Formik, so `useField` works):
  - It commits a valid, changed value on Enter, or on blur when focus leaves the cell. Check `relatedTarget` containment, so clicking the arrows doesn't commit.
  - The commit is `updateItem({ ...item, [field]: value })`. Esc reverts.
- **New product:** uses `getItemSchema(1, skusInUse)` with defaults `store.categoryFocus`, `nextSku(store.logoLetter, skus)` and "active".
- **Edit:** uses `getItemSchema(0, …)`. The "Archived" status shows only when editing.
- **`StoreSettings` limits:**
  - name 2–32 characters, and its `slugify` must not equal another store's slug (the store's own slug never changes);
  - tagline at most 60;
  - description at most 300;
  - logo letter `/^[A-Z0-9]$/i`, saved upper-case;
  - colour from `LOGO_COLORS`;
  - banner through `ImageField`;
  - threshold 0–99;
  - Auto-ship helper text: "Moves new orders to Packed, then Shipped, every 20 seconds while you're signed out of this store. Seeded orders never move."

  Saving dispatches `updateStore({ id, changes })`.
- **Preload:**
  - In `START_CODE`/`ROUTE_SOURCES`, `/seller/products` → `pages/Seller/Products/ProductsPage.tsx` and `/seller/products/new` → `ProductFormPage.tsx`.
  - Drop `/seller/products` from the first-product-picture preload. Nothing else uses it then, so delete `FIRST_PRODUCT_IMAGE` and its preload branch from `vite.config.ts`.

- [ ] **Step 5: Run everything, check by hand, AI-LOG and commit**

Run: `npm test && npm run lint && npm run build`, then `grep -rn "Sell/Home\|Sell/AddItem\|itemSchema\|ItemFields\|ItemModal" src vite.config.ts`. Expected: PASS, and no matches.

By hand, at 360 px and 1280 px, as Mona:
1. Filter Low stock. Edit stock with the arrows and by typing.
2. Archive Smart watch: it leaves Ahmed's cart and the shop.
3. Duplicate a product, then bulk-delete drafts.
4. Set the threshold to 5: Diver watch turns orange.

Add `## 23. Products table, product form and store settings (Claude Code)`.
```bash
git add -A && git commit -m "Add the seller products table with statuses, bulk actions, quick edits, duplicate, and store settings"
```

---

### Task 3 (spec task 14): Dashboard

**Files:**
- Create: `src/features/storeStats.ts`, `src/pages/Seller/Dashboard/DashboardPage.tsx`
- Modify: `src/routes/Index.tsx`, `vite.config.ts`, `docs/AI-LOG.md`
- Delete: `src/pages/Sell/TrackSold.tsx`, `useSell.ts`, and the now-empty `src/pages/Sell/`
- Test: `src/features/__tests__/storeStats.test.ts`, `src/pages/Seller/Dashboard/__tests__/DashboardPage.test.tsx`

**Interfaces:**
- Consumes:
  - Task 1: `StoreShipment`, `shipmentTotal`, `shipmentUnits`, `isLate`, `toSellerOrderRows`, `sellerOrdersLink`, `ShipmentStatusChip`.
  - Task 2: `stockLevel`, `sellerProductsLink`.
- Produces:

```ts
// src/features/storeStats.ts
export const DAY_MS = 86_400_000;
export type Period = "today" | "7d" | "30d" | "all";
export const PERIODS: { id: Period; label: "Today" | "7 days" | "30 days" | "All time" }[];
export const periodRange: (period: Period, now: number) => { from: number; to: number }; // today: local midnight; 7d/30d: now - n*DAY_MS; all: 0; to: now
export interface StoreFigures { revenue: number; orders: number; units: number; averageOrderValue: number }
export const storeFigures: (entries: StoreShipment[], from: number, to: number) => StoreFigures; // from <= placedAt <= to; cancelled excluded; AOV 0 with no orders
export interface TopProduct { itemId: string; name: string; image?: string; units: number; revenue: number }
export const topProducts: (entries: StoreShipment[], from: number, to: number, limit?: number /* 5 */) => TopProduct[]; // units, then revenue desc, then name
export interface StoreTodo { toPack: number; toShip: number; late: number; lowStock: number; soldOut: number }
export const storeTodo: (entries: StoreShipment[], items: Item[], lowStockAt: number, now: number) => StoreTodo; // stock counts: active items only
```

- [ ] **Step 1: Write the failing tests**

**`storeStats.test.ts`** (`NOW = Date.UTC(2026, 10, 13, 12)`; `tt` = Tick & Tock entries):

| Test | Call | Expected `{ revenue, orders, units, averageOrderValue }` |
| --- | --- | --- |
| "all time" (and 30 days) | `storeFigures(tt, 0, NOW)` | 558, 6, 8, 93 |
| "7 days" | `from = NOW - 7*DAY_MS` | 404, 4, 6, 101 |
| "last 24 hours" | `from = NOW - DAY_MS` | 177, 2, 3, 88.5 |
| "Hearth Lane all time" | its entries | 217, 4, 9, 54.25 |
| "cancelled is excluded" | A-10013's shipment cancelled | 510, 5, 6, 102 |
| "empty" | `[]` | all 0 |

- "periodRange", with `now = new Date(2026, 10, 13, 15, 30).getTime()`:
  - "today" starts at `new Date(2026, 10, 13).getTime()`;
  - "7d" starts at `now - 7*DAY_MS`;
  - "all" starts at 0;
  - every `to` is `now`.
- "topProducts": the first 3 are `["Kids' digital watch", "Leather watch strap, 20 mm", "Diver watch, steel"]`, with units `[2, 2, 1]`.
- "storeTodo": `storeTodo(tt, ttItems, 3, NOW)` returns `{ toPack: 2, toShip: 0, late: 2, lowStock: 2, soldOut: 1 }`.
  - A 30 s old non-seed placed order adds to `toPack` only.
  - An archived sold-out item doesn't count.

**`DashboardPage.test.tsx`** (Mona, `/seller`):
- "To do" links:
  - "To pack 2" → `sellerOrdersLink({ tab: "to-pack" })`;
  - "To ship 0" → `sellerOrdersLink({ tab: "to-ship" })`;
  - "Late 2" → `sellerOrdersLink({ tab: "all", late: true })`;
  - "Low on stock 2" → `sellerProductsLink({ status: "active", stock: "low" })`;
  - "Sold out 1" → `sellerProductsLink({ status: "active", stock: "out" })`.
- Period buttons: Today, 7 days (default), 30 days, All time.
  - "All time" sets `?period=all`.
  - It then shows "$558", "6", "8" and "$93".
- "Recent orders": 5 rows, A-10013 first, each linking to its order.
- "Top products": "Kids' digital watch" comes first for All time.
- A store with no items and no orders shows "Your store is ready" and an "Add product" link to `ROUTES.sellerProductNew`.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/features/__tests__/storeStats.test.ts src/pages/Seller/Dashboard`. Expected: FAIL.

- [ ] **Step 3: Implement `storeStats.ts` and `DashboardPage`**

- **Header:** the h2 is the store name.
- **Clock:** `useNow(true)`.
- **Period:** `?period=`, defaulting to "7d" when missing or invalid.
- **To do:** zero counts are muted, and Late is red when above 0.
- **Figure tiles:** "Revenue", "Orders", "Units sold" and "Average order".
- **Routing:**
  - The `seller` index route renders `DashboardPage`.
  - In `START_CODE`/`ROUTE_SOURCES`, `/seller` → `pages/Seller/Dashboard/DashboardPage.tsx`.
  - The idle prefetch loads the dashboard instead of `trackSold`.

- [ ] **Step 4: Run everything, check by hand, AI-LOG and commit**

Run: `npm test && npm run lint && npm run build`, then `grep -rn "pages/Sell/\|TrackSold\|useSell[^a-zA-Z]" src vite.config.ts`. Expected: PASS, and no matches.

By hand:
1. Each To do link lands on its filtered list.
2. With Mona signed in, a new Tick & Tock order raises To pack, and Late follows 60 s later.
3. Cancelling an order lowers Revenue.

Add `## 24. Seller dashboard: to-do, figures by period, recent orders, top products (Claude Code)`.
```bash
git add -A && git commit -m "Add the seller dashboard with to-do links, figures by period, recent orders and top products"
```

---

### Task 4 (spec task 15): Customers

**Files:**
- Create: `src/features/customers.ts`, `src/pages/Seller/Customers/CustomersPage.tsx`, `CustomerPage.tsx`
- Modify: `src/routes/Index.tsx`, `docs/AI-LOG.md`
- Test: `src/features/__tests__/customers.test.ts`, `src/pages/Seller/Customers/__tests__/CustomersPage.test.tsx`, `CustomerPage.test.tsx`

**Interfaces:**
- Consumes:
  - Task 1: `StoreShipment`, `shipmentTotal`, `shipmentUnits`, `useStoreShipments`, `ShipmentStatusChip`, `formatDay`, `formatDateTime`.
  - Phase A: `effectiveStatus`, `Address`, `OrderLine`.
  - Phase B: `ROUTES.sellerCustomer`.
- Produces:

```ts
// src/features/customers.ts: input is this store's entries; reads only order.id/number/buyerId/placedAt/shipTo and the shipment
export type ShipToSnapshot = Pick<Address, "name" | "line1" | "line2" | "city" | "zipCode" | "phoneNum">; // no id, label, isDefault
export interface CustomerRow { buyerId: string; name: string; city: string; orders: number; units: number; totalSpent: number; firstOrderAt: number; lastOrderAt: number }
//   name and city come from the newest order's shipTo (name || "Guest");
//   orders, units and totalSpent exclude cancelled; first and last count every order
export interface CustomerOrder { orderId: string; number: string; placedAt: number; status: ShipmentStatus; units: number; total: number; lines: OrderLine[]; shipTo: ShipToSnapshot }
export interface CustomerProfile extends CustomerRow { contact: ShipToSnapshot; orderHistory: CustomerOrder[] /* newest first */; topItems: { itemId: string; name: string; image?: string; units: number }[] /* top 3, cancelled excluded */ }
export type CustomerSort = "spent" | "recent";
export const customersForStore: (entries: StoreShipment[]) => CustomerRow[]; // sorted by spent
export const sortCustomers: (rows: CustomerRow[], sort: CustomerSort) => CustomerRow[]; // ties by name
export const customerProfile: (entries: StoreShipment[], buyerId: string, now: number) => CustomerProfile | null; // null: no entry for this buyer
```

- [ ] **Step 1: Write the failing tests**

**`customers.test.ts`:**
- "lists Tick & Tock's customers by spend":
  - names `["Nour", "Ahmed", "Omar"]`;
  - totals `[318, 143, 97]`;
  - cities `["Giza", "Cairo", "Alexandria"]`;
  - orders `[2, 2, 2]`;
  - units `[2, 3, 3]`.
- "sort by last order": `["Ahmed", "Nour", "Omar"]`.
- "profile", for Ahmed:
  - orders 2, units 3, totalSpent 143;
  - `orderHistory` numbers `["A-10013", "A-10001"]`;
  - `firstOrderAt` is A-10001's `placedAt`;
  - `topItems[0]` contains `{ name: "Kids' digital watch", units: 2 }`;
  - `contact` is line1 "14 Nile Street", city "Cairo".
- "privacy: nothing beyond this store's orders":
  - The keys of the profile and of `contact` include none of `paymentMethods`, `addresses`, `payment`, `label`, `isDefault`.
  - Ahmed's `JSON.stringify` contains none of:
    - "Smart Village" (his other address)
    - "Clear phone case" (A-10004, Pocket Signal)
    - "A-10007" (Carry Co.)
    - "Visa ending 4242"
  - Nour's contains none of:
    - "Power bank" (the Pocket Signal half of A-10012)
    - "Talaat Harb"
    - "Work card"
    - "A-10003"
- "no orders here is null":
  - Carry Co. entries with `"acc-nour"` give null;
  - `tt` with `"acc-mona"` gives null.
- "a customer with only a cancelled order is listed with zero totals" (synthetic).

**`CustomersPage.test.tsx`** (Mona):
- h2 "Customers", 3 rows, and the columns Name, City, Orders, Units, Total spent, Last order.
- The "Sort by" select defaults to "Total spent". "Last order" sets `?sort=recent` and gives Ahmed, Nour, Omar.
- Names link to `ROUTES.sellerCustomer(id)`.

**`CustomerPage.test.tsx`:**
- "a buyer with no orders here is a 404": Karim at `ROUTES.sellerCustomer("acc-nour")` sees "Page not found".
- Mona on Ahmed sees:
  - h2 "Ahmed";
  - "14 Nile Street" and "+20 100 000 0001";
  - "First order", "Last order" and "$143";
  - rows A-10013 ("To pack") and A-10001 ("Delivered"), each linking to its order;
  - "Buys most": "Kids' digital watch".
- "Smart Village" never appears.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/features/__tests__/customers.test.ts src/pages/Seller/Customers`. Expected: FAIL.

- [ ] **Step 3: Implement `customers.ts` and the pages**

- **Sort:** stored in `?sort=`, defaulting to "spent".
- **Contact block:** built from `contact` and captioned "From their latest order".
- **Unknown or other-store customer:** `<Error404 />` when the profile is null.
- **Routes:** `seller/customers` and `seller/customers/:buyerId` replace their `ComingSoon` routes.

- [ ] **Step 4: Run everything, check by hand, AI-LOG and commit**

Run: `npm test && npm run lint && npm run build`, then `grep -n "ComingSoon" src/routes/Index.tsx`. Expected: PASS, and no `seller/` route uses `ComingSoon`.

By hand:
1. Sort both ways.
2. Nour's A-10012 lists only the Smart watch.
3. The order page's buyer link opens the profile.
4. Karim opening `/seller/customers/acc-nour` gets the seller 404.

Add `## 25. Seller customers: list and privacy-safe profiles (Claude Code)`.
```bash
git add -A && git commit -m "Add seller customers: list with sorting and profiles built only from this store's orders"
```

---

## Self-review notes

**Spec coverage**
- **Task 1:** the Point 2 status table and the Auto-ship rules, plus the orders list and the order page.
- **Task 2:** Point 1a admin controls and store settings.
- **Task 3:** the dashboard, including the empty-store pointer to Add product; TrackSold's numbers move here and into the products table.
- **Task 4:** customers, the privacy rule and the 404.

**Choices made here**
- **The tick runs every 1 s, not every 20 s.** Steps are still 20 s apart, backfilled at their due times. A 20 s tick would show each step up to 20 s late.
- **A seller's backlog moves at sign-out**, with backfilled times.
- **Transitions are strict:** placed → packed → shipped.
- **The buyer name comes from `shipTo.name`**, not from the account.
- **Revenue includes `deliveryFee`** (0 until Phase F task 18).
- **Draft clears carts as well as Archived**, since a draft is hidden from the shop.
- **Buyer stock chips follow the store's threshold.** `ProductCard`'s "Only N left" chip takes the item's store `lowStockAt` (via `selectStoresById`) instead of the global `LOW_STOCK`; this task makes that change, with a test: with Tick & Tock's threshold set to 5, the Diver watch card (stock 5) shows "Only 5 left" on `/c/watches`. `LOW_STOCK` stays only as the default for new stores.
- **Auto-ship mechanism:** the spec's builder note says "one listener-middleware tick"; this plan uses a 1 s interval started next to the store (`startAutoShip`), which keeps the same single place and the catch-up. Deliberate deviation.
- **Two-tab behaviour is not tested.** See gap 3.

## Contract gaps

1. **Seed ids:** Phase A pins order numbers and five item ids, but not `Order.id`, `Shipment.id` or the 25 new item ids. Tests look those up by `number` and `name`.
2. **SKU numbering:** Phase A says only "SKUs number on per store". The "new product defaults" test assumes Tick & Tock holds `T-001`…`T-008`.
3. **Two tabs:** Phase A's persist has no cross-tab sync (no `storage` listener). Two tabs are last-writer-wins, and each runs its own Auto-ship tick. The status guards keep each tab consistent, but a stale tab can overwrite a newer save. Phase A or G should own this.
4. **Cart cleanup:** Phase A cleans carts only on `removeItem`. Task 2 adds `removeItemsFromCart` and `setItemsStatus`/non-active `updateItem` cases to Phase A's `cart.ts`, `accountsSlice` and `sessionSlice`.
5. **Stock below a cart quantity:** Phase A's `placeOrder` doesn't reject lines over stock. Phase D's plan covers this: checkout orders only `orderableNum`. If Phase D changes, a quick edit that drops stock below a cart's quantity is unguarded again.
6. **"To ship" wording:** resolved. Phase C's badge now reads "Orders, N open" (placed + packed), so it doesn't clash with this phase's packed-only "To ship" tab.
7. **Logo palette:** Phase A stores `logoColor` as a token's CSS value but defines no palette. Task 2 adds `LOGO_COLORS`.
