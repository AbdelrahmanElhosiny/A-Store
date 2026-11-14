# Phase F (part 2): Buy again, cancel and returns, reviews, sales chart, notifications, guided tour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the last six picked ideas: Buy again on past orders, buyer cancels and return requests that the seller approves, reviews with one locking seller reply (plus the rating sort, a rating filter and store ratings), a revenue-per-day chart on the seller dashboard, a notifications bell in both headers, and a guided "Try the whole flow" tour.

**Architecture:**
- **Pure modules decide and carry the unit tests:**
  - `buyAgain.ts`: what goes back in the cart.
  - `returns.ts`: the cancel and return windows.
  - `reviews.ts`: rating summaries.
  - `salesChart.ts`: day buckets.
  - `notifications.ts`: events derived from status history.
  - `tour.ts`: tour progress from state and the path.
- **No new event stores:**
  - Notifications are derived from each shipment's `effectiveHistory` and compared with Phase A's `Account.notificationsSeenAt`.
  - The tour reads the orders, the session and the path. It never clicks anything for the visitor.
- **Status changes** go through guarded `ordersSlice` reducers, dispatched only by thunks that check ownership and the effective status (Phase E's pattern). The buyer cancel reuses Phase E's `cancelShipment` and its restock.
- **One new slice, `reviews`.** Everything else rides on optional fields, so the save stays `VERSION = 2`.

**Tech Stack:** React 18, react-router-dom 6, RTK 1.9, MUI 5 (`Menu`, icons), Formik + Yup, Vitest + Testing Library. No chart library: the chart is hand-written SVG.

**Spec:** `docs/superpowers/specs/2026-11-13-marketplace-overhaul-design.md`, these sections:
- "Ideas for you to pick": Buy again, Cancel and return requests, Reviews and ratings, Sales chart, Notifications bell, Guided demo tour;
- Phase F tasks 22 to 27;
- Point 1b: "Customer rating joins the list with reviews";
- Point 2: the status table ("buyer cancelling and returns come in task 23").

Builds on the Phase A–E plans and on Phase F part 1 (`2026-11-13-phase-f-ideas-part-1.md`, tasks 16–21), which lands first.

## Global Constraints

- **Workflow:**
  - Branch `marketplace`. No major version upgrades (React 18, MUI 5, RTK 1.9, react-redux 8, react-router 6, Vite 5 stay). No new runtime dependencies.
  - One spec task = one commit = one `docs/AI-LOG.md` entry. This plan writes entries 32 to 37 in the existing format: `## N. Title (Claude Code)`, `**Prompt:**`, `**Changes**`, `**Check:**`, `**Changed by hand:** —`.
  - No Claude/Anthropic attribution in commit messages. Commit only when the user has asked.
  - `npm run lint`, `npm run build` and `npm test` pass after every task.
- **Look:**
  - Gruvbox tokens from `src/styles/tokens.ts` only, with sharp edges (radius 0) on every new surface: stars, the chart bars, the bell menu, the tour card and panel.
  - Buyer markup keeps the `buy` class and seller markup `sell`. Portalled surfaces carry the class themselves.
  - Nothing scrolls sideways at 360 px.
- **Mode:** the URL decides the mode, and the mode is never stored. Every path comes from `ROUTES`.
- **Ownership:** a seller only sees and changes their own store, and buyer thunks only touch the signed-in buyer's orders. Every thunk returns `false` or `null` without dispatching otherwise.
- **Privacy:** sellers see only what came with orders to their store. Reviews show the reviewer's account `name` and nothing else about them. Seller notifications name the order number only.
- **Time:** reducers never call `Date.now()`. Times come in the payload as `at`.
- **Saved data:** no `VERSION` bump.
  - New fields are optional and load as "absent": `Shipment.returnRequest`, `StatusEvent.by`, `SessionState.tour`.
  - The new `reviews` slice loads as `reviews ?? []`.
  - Seed changes (reviews, `notificationsSeenAt`) reach a browser only on first load or Reset demo data.
- **Seed numbers that must not move:** the seed facts that Phases D and E and Phase F part 1 pin stay as they are: prices, stock, units, totals and revenue. This plan adds reviews and changes only `notificationsSeenAt`.

## Review Focus

1. **Buy again on an order whose items changed:** archived, sold out, variant removed, or already at the stock limit in the cart.
   - Expected: the cart never goes past stock, variant lines keep their variant, and the toast names every line it skipped or cut.
   - Pinned in Task 22: `buyAgain.test.ts` › "skips and caps, never past stock".
2. **A buyer cancel confirmed after the shipment moved on.** Auto-ship or the seller ships it while the dialog is open.
   - Expected: nothing changes, no stock comes back, and the toast reads "Tick & Tock has already shipped these items."
   - Pinned in Task 23: `OrderPage.test.tsx` › "a stale cancel is refused".
3. **A return on a shipment the delivery timer delivered.** The raw status is still `shipped`, with only `deliverAt`.
   - Expected: the request works. The history gains `{ delivered, at: deliverAt }`, then `return-requested`. Neither Auto-ship nor the timer ever moves a return state afterwards.
   - Pinned in Task 23: `returns.test.ts` › "a timer-delivered shipment can be returned", and `fulfilment.test.ts` › "nothing moves a return on its own".
4. **The bell's unread state.**
   - Expected: opening the bell marks everything read, but the items stay marked "New" until it closes.
   - A delivery that lands by timer while the page is open raises the count. Before it lands, no "delivered" item shows.
   - Pinned in Task 26: `NotificationBell.test.tsx` › "opening marks read but keeps New until closed", and `notifications.test.ts` › "a timer delivery appears only once it happens".
5. **The tour while Tick & Tock's Auto-ship is on.** Without care, Auto-ship packs and ships the tour order within 40 s, before the visitor reaches the seller centre.
   - Expected: while a tour runs, Auto-ship leaves Tick & Tock alone, so the order waits. The "Pack and ship" step still completes however the order got shipped.
   - Pinned in Task 27: `fulfilmentActions.test.ts` › "the tour keeps Auto-ship off Tick & Tock", and `tour.test.ts` › "ship counts however the order was shipped".

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/features/buyAgain.ts` (new) | `planBuyAgain`, `buyAgainMessage` |
| `src/features/buyerOrderActions.ts` (new) | Buyer thunks: `buyAgain`, `buyerCancelShipment`, `requestShipmentReturn` |
| `src/features/returns.ts` (new) | `RETURN_WINDOW_MS`, `RETURN_REASONS`, `firstDeliveredAt`, `returnClosesAt`, `canRequestReturn`, `canBuyerCancel` |
| `src/features/reviewsSlice.ts`, `reviews.ts`, `reviewActions.ts` (new) | The reviews slice, rating summaries, the review and reply thunks |
| `src/seed/seedReviews.ts` (new) | The eight seed reviews |
| `src/features/salesChart.ts` (new) | `revenueByDay`, `salesChartRange` |
| `src/features/notifications.ts` (new) | `notificationsFor`, `unreadCount` |
| `src/features/tour.ts` (new) | `tourProgress` and the tour constants |
| `src/components/reviews/{StarRating,StarInput,RatingLine,ReviewList,ReviewDialog,ReplyDialog}.tsx` (new) | Review UI |
| `src/pages/Seller/Dashboard/SalesChart.tsx` (new) | SVG bars and a table fallback |
| `src/components/header/NotificationBell.tsx`, `NotificationList.tsx` (new; the list is a lazy chunk) | The bell |
| `src/components/tour/TourCard.tsx`, `TourPanel.tsx` (new) | The tour card on the store home, and the panel in both layouts |
| `src/features/types.ts`, `ordersSlice.ts`, `itemSlice.ts`, `accountsSlice.ts`, `sessionSlice.ts`, `selectors.ts`, `shipmentStatus.ts`, `fulfilmentActions.ts` (modify) | New fields, reducers, selectors and the shared `countsAsSale` |
| `src/features/{orderView,sellerOrders,storeStats,products,customers}.ts`, `src/features/listing/{listingQuery,applyListing}.ts` (modify) | Return states, the money rule, the rating sort and filter |
| `src/app/persist.ts`, `src/app/store.ts`, `src/seed/buildSeed.ts`, `src/seed/catalogue.ts`, `src/constant/routes.ts` (modify) | The reviews slice, the seed, `ROUTES.tour` |
| Pages (modify) | `Account/{Orders,OrderPage}`, `Buy/{Home,Product,StorePage}`, `Seller/Orders/{SellerOrdersPage,SellerOrderPage}`, `Seller/Dashboard/DashboardPage`, `listing/{FilterPanel,FilterChips}`, `BuyCard`, `StoreCard`, `header/{BuyerHeader,SellerHeader}`, `layout/Layout` |

**Seed facts used below** (`buildSeed(NOW)`, `NOW = Date.UTC(2026, 10, 13, 12)` in pure tests; history steps are 6 h apart from `placedAt`):

| Order | Buyer | Store → lines → status | Placed | Delivered at |
| --- | --- | --- | --- | --- |
| A-10001 | Ahmed | Tick & Tock → Field watch, 38 mm ×1 → delivered | −25 d | −24 d 6 h |
| A-10004 | Ahmed | Pocket Signal → Clear phone case ×2 (variant `item-ps-clear-phone-case-v2`, "6.1 inch") → delivered · Carry Co. → Leather wallet ×1 → delivered | −16 d | −15 d 6 h |
| A-10007 | Ahmed | Carry Co. → City backpack ×1 → delivered | −6 d | −5 d 6 h |
| A-10008 | Omar | Pocket Signal → Budget smartphone ×1 → shipped (no `deliverAt`) · Tick & Tock → Leather watch strap ×2 (`-v2`, "Brown") → delivered | −4 d | −3 d 6 h (Tick & Tock) |
| A-10009 | Nour | Tick & Tock → Diver watch, steel ×1 → shipped (no `deliverAt`) | −3 d | — |
| A-10010 | Ahmed | Hearth Lane → Cast iron skillet ×1 → packed | −2 d | — |
| A-10013 | Ahmed | Tick & Tock → Kids' digital watch ×2 → placed | −2 h | — |

- **Stock:** Kids' digital watch 30, City backpack 8, Cast iron skillet 11, Leather wallet 18, Field watch 14, and `item-ps-clear-phone-case-v2` 35.
- **Item ids:** `item-tt-kids-digital-watch`, `item-cc-city-backpack`, `item-hl-cast-iron-skillet-26-cm`, `item-cc-leather-wallet`, `item-tt-field-watch-38-mm`, `item-ps-clear-phone-case`.
- **Shipment ids:** `ship-A-10013-tt`, `ship-A-10007-cc`, and so on.
- **Order ids:** `order-A-10013`, and so on.
- **The next order number** is `A-10014`.

---

### Task 22 (spec task 22): Buy again

**Files:**
- Create: `src/features/buyAgain.ts`, `src/features/buyerOrderActions.ts`
- Modify: `src/pages/Account/Orders.tsx`, `src/pages/Account/OrderPage.tsx`, `docs/AI-LOG.md`
- Test: `src/features/__tests__/buyAgain.test.ts`, `src/pages/Account/__tests__/Orders.test.tsx` (add), `OrderPage.test.tsx` (add)

**Interfaces:**
- Consumes:
  - Phase A: `OrderLine`, `CartLine`, `Item`, `lineKey`, `selectCart`, `selectItemsById`, `selectActiveBuyer`, `selectAllOrders`, `addItemToCart`, `setCartQuantity`, `AppThunk`.
  - Phase A: `orderSummaryStatus`. Phase D: the `Orders` and `OrderPage` pages.
  - Part 1 (task 16): `Item.variants`, variant ids `${itemId}-v<n>`, `hasVariants`, `findVariant`, and `withVariantTotals` (an item's `stockNum` is its variants' sum).
  - Existing: `useNotification().showNotification`.
- Produces:

```ts
// src/features/buyAgain.ts (pure)
export type BuyAgainSkipReason = "unavailable" | "sold-out" | "option-gone" | "pick-option" | "in-cart";
export const BUY_AGAIN_SKIP_TEXT: Record<BuyAgainSkipReason, string>;
//   "no longer sold", "sold out", "that option is gone", "pick an option on its page", "your cart already has all in stock"
export interface BuyAgainAdd { item: Item; variantId?: string; add: number; target: number /* cart quantity afterwards */ }
export interface BuyAgainPlan { adds: BuyAgainAdd[]; capped: { name: string; added: number; ordered: number }[]; skipped: { name: string; reason: BuyAgainSkipReason }[]; units: number; priceChanged: boolean }
export const planBuyAgain: (lines: OrderLine[], itemsById: Record<string, Item>, cart: CartLine[]) => BuyAgainPlan;
export const buyAgainMessage: (orderNumber: string, plan: BuyAgainPlan) => { type: "success" | "info" | "warning"; message: string };
// src/features/buyerOrderActions.ts
export const buyAgain: (orderId: string, shipmentId?: string) => AppThunk<BuyAgainPlan | null>;
//   shipmentId limits it to that shipment's lines; null (nothing dispatched): no buyer, not this buyer's order, or unknown shipment
export const canBuyAgain: (o: Order, now: number) => boolean;              // orderSummaryStatus is "delivered" or "cancelled"
export const canBuyAgainShipment: (s: Shipment, now: number) => boolean;   // effective status is not placed, packed or shipped
```

Rules for `planBuyAgain`:
- **Lines:** every shipment's lines, cancelled shipments included, in order (or one shipment's lines when `shipmentId` is given).
- **Name in messages:** `line.name`, plus `", " + variantLabel` when the line has one.
- **Per line, in this order:**
  1. The item is missing or not `active` → skip with "unavailable".
  2. The line has a `variantId` and `findVariant(item, variantId)` is null → "option-gone". Variant lines are added with their `variantId`, never as the plain item.
  3. The line has no `variantId`, but `hasVariants(item)` → "pick-option" (part 1's `addToCart` would ignore such a line anyway).
  4. Stock is the variant's `stockNum`, or else the item's. Stock 0 → "sold-out".
  5. `room = stock − (quantity already in the cart for lineKey(line))`. When `room <= 0` → "in-cart".
  6. Otherwise `add = min(line.quantity, room)`, and the line is in `capped` when `add < line.quantity`.
- **`priceChanged`:** true when any added line's current price (the variant's, else the item's) differs from `line.price`.

`buyAgainMessage` builds the message from these parts, joined by one space and leaving out empty parts:
- When `units > 0`: ``Added ${units} ${units === 1 ? "item" : "items"} from ${number} to your cart.``
- When `units === 0`: ``Nothing from ${number} could be added.``
- When `priceChanged`: "Some prices have changed since then."
- One part per capped line: ``${name}: ${added} of ${ordered}, all that's in stock.``
- When something was skipped: ``Not added: ${skipped.map(s => `${s.name} (${BUY_AGAIN_SKIP_TEXT[s.reason]})`).join(", ")}.``

The type is "warning" when `units === 0`, else "info" when anything was capped or skipped, else "success".

- [ ] **Step 1: Write the failing pure tests**

`buyAgain.test.ts` builds its fixtures from `buildSeed(NOW)`'s orders and items:
- **"A-10001 goes back as it was":** Field watch ×1 is added with `target` 1. The message is `{ type: "success", message: "Added 1 item from A-10001 to your cart." }`.
- **"variant lines keep their variant":** A-10004 adds `{ itemId: "item-ps-clear-phone-case", variantId: "item-ps-clear-phone-case-v2", add: 2 }` and the wallet ×1, for "Added 3 items from A-10004 to your cart."
- **"skips and caps, never past stock":**
  - With the wallet archived, A-10004 reads "Added 2 items from A-10004 to your cart. Not added: Leather wallet (no longer sold)." (`info`).
  - With Kids' digital watch at stock 1, A-10013 reads "Added 1 item from A-10013 to your cart. Kids' digital watch: 1 of 2, all that's in stock."
  - With stock 2 and Kids' ×2 already in the cart, A-10013 reads "Nothing from A-10013 could be added. Not added: Kids' digital watch (your cart already has all in stock)." (`warning`), and `adds` is empty.
  - With 1 in the cart and stock 2, `target` is 2 and `add` is 1.
- **"variant removed or newly required":**
  - With `-v2` removed from the case's variants, A-10004 skips "Clear phone case, 6.1 inch (that option is gone)".
  - A fixture line without `variantId`, for an item that now has variants, skips with "pick an option on its page".
- **"sold out":** with the Field watch at stock 0, A-10001 reads "Nothing from A-10001 could be added. Not added: Field watch, 38 mm (sold out)."
- **"today's price":** with the Field watch at price 99, A-10001 reads "Added 1 item from A-10001 to your cart. Some prices have changed since then."

Thunk tests, on `setupStore` with Ahmed signed in:
- `buyAgain("order-A-10001")` returns the plan, and `selectCart` holds `{ itemId: "item-tt-field-watch-38-mm", quantity: 1 }`.
- `buyAgain("order-A-10003")` (Nour's order) returns `null`, and the cart is unchanged.
- With nobody signed in, it returns `null`.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/features/__tests__/buyAgain.test.ts`. Expected: FAIL (the module is missing).

- [ ] **Step 3: Implement `buyAgain.ts` and the thunk**

`buyAgain` plans against `selectCart` and `selectItemsById`. For each entry in `adds`:
- when the line isn't in the cart yet, dispatch `addItemToCart(item, variantId)` (adds 1);
- then, when `target` is above what is now in the cart, dispatch `setCartQuantity(item.id, target, variantId)`.

Prices aren't copied anywhere: cart lines join the item at render, so the cart shows today's price.

Run: `npx vitest run src/features/__tests__/buyAgain.test.ts`. Expected: PASS.

- [ ] **Step 4: Write the failing page tests**

- `Orders.test.tsx` (Nour):
  - There are exactly two buttons, "Buy again: order A-10006" and "Buy again: order A-10003" (the delivered orders).
  - Each sits inside its `<li>` but outside the row's link (`link.contains(button) === false`).
- `OrderPage.test.tsx` (Ahmed):
  - On A-10001, the Tick & Tock card's button "Buy again" (`aria-label` "Buy again from Tick & Tock") comes after the card's "Delivery: Free" line. It adds the item: the header shows "Cart, 1 items", and the toast reads "Added 1 item from A-10001 to your cart."
  - On A-10004, each card has its own button. "Buy again from Carry Co." adds only the wallet: "Added 1 item from A-10004 to your cart."
  - A-10013 (placed) has no "Buy again".

- [ ] **Step 5: Add the buttons**

- **`Orders`:** each `<li>` holds the existing row link, then, when `canBuyAgain(order, now)` is true, an outlined small `Button` "Buy again" with `aria-label={\`Buy again: order ${number}\`}`, outside the link.
- **`OrderPage`:** per shipment card, when `canBuyAgainShipment(s, now)`, the same button with `aria-label={\`Buy again from ${storeName}\`}`, placed after the card's "Delivery" line (part 1, task 18). It calls `buyAgain(order.id, s.id)`.
- **On click:** `const plan = dispatch(buyAgain(…)); if (plan) showNotification(buyAgainMessage(order.number, plan))`. The page stays where it is.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 6: Check by hand, AI-LOG and commit**

At 360 px as Ahmed:
1. On the Orders list, Buy again on A-10004: the cart holds the 6.1 inch case ×2 and the wallet.
2. On A-10004's order page, "Buy again from Pocket Signal": only the case quantity grows, and it stops at stock.
3. As Mona, archive the wallet. Buy again as Ahmed: the toast names it.

Add `## 32. Buy again on past orders (Claude Code)`.
```bash
git add -A && git commit -m "Add Buy again on past orders at today's price and stock"
```

---

### Task 23 (spec task 23): Cancel and return requests

Decisions:
- **A buyer cancel is instant**, for `placed` and `packed`, the same window the seller has.
  - Nothing has left the store, so there is nothing for the seller to approve.
  - It reuses Phase E's guarded `cancelShipment` and its restock, so the two can't disagree.
  - Phase A has no "cancel requested" status, and adding one would need new tabs and texts for no demo value.
  - The seller learns of it through Task 26's bell ("A-10013 was cancelled by the buyer").
- **A return is a request the seller approves**, as the spec says.
  - The window is 14 days from the first delivery (`RETURN_WINDOW_MS`).
  - The window is real time, not demo-scaled: the seed then shows both cases on first visit. Ahmed's A-10007 is open; A-10001 and A-10004 are closed.
  - Returns are per shipment, with every line. One request per shipment: after a decline, the buyer can't ask again. This keeps the request from bouncing back and forth.
- **A decline goes back to `delivered`**, with the seller's note.
  - It appends `{ delivered, at, by: "seller" }`.
  - The delivery time shown to the buyer and the return window always use the **first** `delivered` event, so a decline doesn't move "Delivered <time>" or reopen the window.
- **Money rule:** in every seller figure and sales count, a `returned` shipment counts like a cancelled one. One helper, `countsAsSale`, replaces those "cancelled excluded" checks in Phases D and E. A `return-requested` shipment still counts until it is approved.
  - The buyer's own `orderTotals` (Phase D) is the exception: it keeps leaving out cancelled shipments only, so a fully returned order still shows what was paid, labelled "Delivered" by Phase A's summary, with the card reading "Returned". A $0 "Delivered" order would read as a bug.
- **Seller tabs:** a new "Returns" tab (`return-requested`, `returned`) sits between Delivered and Cancelled. Delivered becomes `delivered` only, so no shipment counts in two tabs.

**Files:**
- Create: `src/features/returns.ts`, `src/pages/Account/components/ReturnDialog.tsx`, `src/pages/Seller/Orders/DeclineReturnDialog.tsx`
- Modify:
  - `src/features/types.ts`, `ordersSlice.ts`, `itemSlice.ts`, `shipmentStatus.ts`, `buyerOrderActions.ts`, `fulfilmentActions.ts`
  - `orderView.ts`, `sellerOrders.ts`, `storeStats.ts`, `products.ts`, `customers.ts`, `selectors.ts` (`selectUnitsSoldByItem`)
  - `src/pages/Account/OrderPage.tsx`, `src/pages/Seller/Orders/SellerOrdersPage.tsx`, `SellerOrderPage.tsx`, `src/pages/Seller/Dashboard/DashboardPage.tsx`, `docs/AI-LOG.md`
- Test:
  - `src/features/__tests__/returns.test.ts`, `ordersSlice.test.ts` (add), `fulfilment.test.ts` (add), `fulfilmentActions.test.ts` (add), `orderView.test.ts` (add), `sellerOrders.test.ts` (change), `storeStats.test.ts` (change: Phase E's exact `storeTodo` expectation `{ toPack: 2, toShip: 0, late: 2, lowStock: 2, soldOut: 1 }` gains `returns: 0`)
  - `src/app/__tests__/persist.test.ts` (add)
  - `src/pages/Account/__tests__/OrderPage.test.tsx` (add), `src/pages/Seller/Orders/__tests__/SellerOrderPage.test.tsx` (add), `SellerOrdersPage.test.tsx` (change), `src/pages/Seller/Dashboard/__tests__/DashboardPage.test.tsx` (add)

**Interfaces:**
- Consumes:
  - Phase A: `effectiveStatus`, `Shipment`, `StatusEvent`, `selectActiveBuyer`, `selectAllOrders`.
  - Phase D: `shipmentText`, `orderTotals`, `ORDER_STATUS_LABEL`, `ConfirmDialog`, `AppDialog`, `formatDay`, `formatDateTime`.
  - Phase E:
    - `ShipmentRef`, exported from `ordersSlice.ts`;
    - `cancelShipment` and its restock extraReducer, `effectiveHistory`, `autoShipStep`, `autoShipApply`;
    - `ORDER_TABS`, `OrdersTab`, `countByTab`, `sellerOrdersLink`, `SELLER_STATUS_LABEL`;
    - `storeFigures`, `topProducts`, `storeTodo`, `StoreTodo`, `DAY_MS`;
    - `unitsSoldByItem`, `customersForStore`, `customerProfile`, `useSellerStore`.
- Produces:

```ts
// src/features/types.ts (optional fields: old saves load unchanged)
export type ReturnReasonId = "changed-mind" | "damaged" | "not-as-described" | "wrong-item";
export interface ReturnRequest { reason: ReturnReasonId; note?: string; at: number; declinedAt?: number; declineNote?: string }
// Shipment gains   returnRequest?: ReturnRequest
// StatusEvent gains by?: "buyer" | "seller"   (set by the actions below; absent on older events)

// src/features/shipmentStatus.ts
export const countsAsSale: (status: ShipmentStatus) => boolean; // false for "cancelled" and "returned"

// src/features/returns.ts (pure)
export const RETURN_WINDOW_MS = 14 * DAY_MS;
export const RETURN_REASONS: { id: ReturnReasonId; label: string }[];
//   "Changed my mind", "Arrived damaged", "Not as described", "Wrong item sent"
export const firstDeliveredAt: (s: Shipment, now: number) => number | null; // first "delivered" event of effectiveHistory(s, now)
export const returnClosesAt: (s: Shipment, now: number) => number | null;   // firstDeliveredAt + RETURN_WINDOW_MS
export const canRequestReturn: (s: Shipment, now: number) => boolean;       // effective "delivered", no returnRequest, now <= closesAt
export const canBuyerCancel: (s: Shipment, now: number) => boolean;         // effective "placed" | "packed"

// src/features/ordersSlice.ts (plain actions; a wrong current status is a no-op)
cancelShipment(payload: ShipmentRef & { at: number; lines: { itemId: string; variantId?: string; quantity: number }[]; by?: "buyer" | "seller" }) // Phase E's, plus `by` on the event
markReturnRequested(payload: ShipmentRef & { at: number; reason: ReturnReasonId; note?: string })
//   allowed when there is no returnRequest and: raw "delivered", or raw "shipped" with deliverAt <= at.
//   The raw-"shipped" case first appends { status: "delivered", at: deliverAt }.
//   It then appends { status: "return-requested", at, by: "buyer" } and sets returnRequest = { reason, note?, at }.
approveReturn(payload: ShipmentRef & { at: number; lines: { itemId: string; variantId?: string; quantity: number }[] }) // return-requested → returned; event by "seller"
declineReturn(payload: ShipmentRef & { at: number; note: string }) // return-requested → delivered; event { delivered, at, by: "seller" }; returnRequest gains declinedAt and declineNote
// itemSlice: approveReturn restocks through the same helper as the cancelShipment case, as part 1 extends it:
//   adds to the variant (cap 9999), then withVariantTotals(item); a missing item or variant is skipped

// src/features/buyerOrderActions.ts
export const buyerCancelShipment: (ref: ShipmentRef) => AppThunk<boolean>; // own order && canBuyerCancel(now) → cancelShipment({ ..., by: "buyer" })
export const requestShipmentReturn: (ref: ShipmentRef, request: { reason: ReturnReasonId; note: string }) => AppThunk<boolean>; // own order && canRequestReturn; note trimmed, "" left out
// src/features/fulfilmentActions.ts
export const approveShipmentReturn: (ref: ShipmentRef) => AppThunk<boolean>; // active store's shipment, status "return-requested"
export const declineShipmentReturn: (ref: ShipmentRef, note: string) => AppThunk<boolean>; // the same, plus a note of 5 to 200 characters after trimming

// src/features/sellerOrders.ts
export type OrdersTab = "to-pack" | "to-ship" | "shipped" | "delivered" | "returns" | "cancelled" | "all";
// ORDER_TABS: ... Delivered [delivered] · Returns [return-requested, returned] · Cancelled ...
// src/features/storeStats.ts
export interface StoreTodo { toPack: number; toShip: number; late: number; lowStock: number; soldOut: number; returns: number /* return-requested */ }
```

**Buyer texts:** `shipmentText` gains these rows. Delivered times read `firstDeliveredAt`.

| Case | headline | detail |
| --- | --- | --- |
| return-requested | "Return requested" | `Waiting for ${storeName} to approve it` |
| returned | "Returned" | `Return approved ${formatDateTime(at)}` (the last event's time) |
| delivered, `returnRequest.declinedAt` set | `Delivered ${formatDateTime(firstDeliveredAt)}` | `Return declined: ${declineNote}` |
| cancelled, last event `by: "buyer"` | "Cancelled" | "You cancelled these items" |

A seller-side cancel keeps Phase D's null detail.

**Seller history:** a `delivered` event that follows a `return-requested` event renders as "Return declined" in `SellerOrderPage`'s status list.

- [ ] **Step 1: Write the failing pure tests**

`returns.test.ts`:
- **"window":**
  - On A-10007's Carry Co. shipment at NOW, `canRequestReturn` is true.
  - `returnClosesAt` equals the placedAt + 18 h + 14 days.
  - A-10001 and A-10004 are false: their windows closed.
  - On a shipment already return-requested, it is false.
- **"a timer-delivered shipment can be returned":**
  - Fixture: a non-seed Tick & Tock shipment, raw `shipped`, with `deliverAt: NOW - 1000`.
  - `canRequestReturn(s, NOW)` is true.
  - `markReturnRequested` at NOW leaves the history ending in `[{ shipped, … }, { delivered, NOW - 1000 }, { return-requested, NOW, by: "buyer" }]`.
  - At `NOW - 2000` (before `deliverAt`) the same action is a no-op.
- **"the first delivery counts after a decline":** after request, then decline at NOW + 5000:
  - `firstDeliveredAt` is unchanged;
  - `canRequestReturn` is false;
  - `shipmentText(...).detail` is "Return declined: Worn, tags removed".
- **"canBuyerCancel":** true for A-10013 (placed) and A-10010 (packed); false for A-10009 (shipped) and A-10001 (delivered).

`ordersSlice.test.ts` (add):
- `approveReturn` from `delivered` changes nothing.
- `declineReturn` sets `status: "delivered"`, `returnRequest.declineNote`, and the last event `{ delivered, at, by: "seller" }`.
- `cancelShipment` with `by: "buyer"` records `by` on the event.

`fulfilment.test.ts` › "nothing moves a return on its own":
- A non-seed Tick & Tock shipment in `return-requested`, and another in `returned` (both with a past `deliverAt`):
  - `autoShipStep(orders, stores, null, NOW + 3_600_000)` gives `[]`;
  - `effectiveStatus` keeps each status;
  - `autoShipApply([{ from: "placed", … }])` leaves both unchanged.

`orderView.test.ts` (add): the four table rows above. `orderTotals` keeps a returned shipment (A-10007 returned still totals 65).

`sellerOrders.test.ts` (change):
- "counts per tab" becomes `{ "to-pack": 2, "to-ship": 0, shipped: 1, delivered: 3, returns: 0, cancelled: 0, all: 6 }`.
- A fixture with A-10008's Tick & Tock shipment as `return-requested` gives `delivered: 2, returns: 1`.

`storeStats.test.ts` (add):
- "returned is excluded": A-10009 returned gives Tick & Tock all time `{ revenue: 369, orders: 5, units: 7, averageOrderValue: 73.8 }`.
- "return-requested still counts": the all-time figures stay 558.
- `storeTodo` gains `returns: 0`; it is 1 with the fixture above.

`persist.test.ts` › "a save made before task 23 loads unchanged": `saveState(buildSeed(NOW))` (no `returnRequest`, no `by`), then `loadState()`, gives `droppedOld: false` and the same orders.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/features src/app`. Expected: FAIL.

- [ ] **Step 3: Implement**

- **Types and reducers:** the types, the reducers, the itemSlice restock case, `returns.ts` and `countsAsSale`.
- **Use `countsAsSale`** wherever Phase D or E wrote "cancelled excluded" or "isn't cancelled", except the buyer's `orderTotals`: `selectUnitsSoldByItem`, `unitsSoldByItem`, `storeFigures`, `topProducts`, and the `customersForStore` / `customerProfile` totals and `topItems`.
- **Check with grep:** `grep -rn '"cancelled"' src/features` should leave only status logic (labels, transitions, `countsAsSale` itself).

Run: `npx vitest run src/features src/app`. Expected: PASS.

- [ ] **Step 4: Write the failing thunk and page tests**

`fulfilmentActions.test.ts` (add). Ahmed and Karim are both signed in through `sellerState("acc-karim", NOW)` plus `buyerId: "acc-ahmed"`.

| Test | Expected |
| --- | --- |
| "buyer cancels a placed shipment" | `buyerCancelShipment` for A-10013's `ship-A-10013-tt` returns true; the status is "cancelled", the last event has `by: "buyer"`, and Kids' digital watch goes 30 → 32 |
| "buyer cancels a packed shipment" | A-10010 returns true, and the skillet goes 11 → 12 |
| "a buyer can't cancel another's or a shipped one" | A-10012 (Nour's) returns false; A-10009 with Nour signed in returns false; the state is unchanged |
| "return, then approve" | `requestShipmentReturn(A-10007 cc, { reason: "damaged", note: " Strap torn " })` returns true, with `note` "Strap torn"; then Karim's `approveShipmentReturn` returns true, the status is "returned", and the City backpack goes 8 → 9 |
| "approving twice restocks once" | the second call returns false, and the stock stays 9 |
| "a returned variant goes back to its variant" | a non-seed delivered Carry Co. shipment (Ahmed, Canvas tote `item-cc-canvas-tote-v4` ×2, delivered at NOW − 1 d), requested, then approved: `-v4` goes 3 → 5 and the tote's `stockNum` 25 → 27 |
| "only the store approves" | with Mona signed in instead, approve returns false |
| "decline needs a note" | `"no"` returns false; `"Worn, tags removed"` returns true and sets the status to "delivered"; a second `requestShipmentReturn` returns false |

`OrderPage.test.tsx` (add, Ahmed):
- **"cancel before shipping":** on A-10013:
  1. "Cancel these items" opens the dialog "Cancel these items?" with the text "Tick & Tock hasn't shipped them yet, so they're cancelled right away."
  2. "Cancel items" confirms.
  3. The card reads "Cancelled" and "You cancelled these items", and the toast is "Items from Tick & Tock cancelled."
- **"a stale cancel is refused":**
  1. Open the dialog on A-10013.
  2. `store.dispatch` `markPacked` then `markShipped` (Phase E actions) from outside.
  3. Confirm. The toast is "Tick & Tock has already shipped these items.", and the Kids' digital watch stock stays 30.
- **"return request":** on A-10007:
  - The card shows "Request a return" and the text `Return by ${formatDay(closesAt)}`.
  - The dialog "Request a return" has radios with the four reason labels and the field "Anything to add? (optional)" (max 200).
  - Submitting with no reason shows "Pick a reason".
  - "Arrived damaged", then "Send request", gives the headline "Return requested", the detail "Waiting for Carry Co. to approve it", and the toast "Return requested. Carry Co. will answer on this page."
- **"window closed":** A-10001 has no "Request a return" and shows `Returns closed ${formatDay(closesAt)}`.

`SellerOrderPage.test.tsx` (add). Karim on A-10007, with the shipment preloaded as `return-requested` (reason "damaged", note "Strap torn"):
- **The return section:** "Return requested", "Arrived damaged" and "“Strap torn”".
- **Approve:** "Approve return" opens a `ConfirmDialog`, titled "Approve this return?", with the text "The order is marked Returned and the stock goes back." and the confirm button "Approve return". Then:
  - the status reads "Returned";
  - the toast is "Return for A-10007 approved. The stock is back.";
  - the backpack stock is 9.
- **Decline:** "Decline return" opens a dialog with the field "Tell the buyer why".
  - An empty field shows "Enter a short reason". "no" shows "At least 5 characters".
  - "Worn, tags removed" gives the toast "Return for A-10007 declined.", and the history shows "Return declined".

`SellerOrdersPage.test.tsx` (change): the tabs add `/Returns\s*0/` between Delivered and Cancelled. `?tab=returns` with the fixture lists A-10007.

`DashboardPage.test.tsx` (add): the To do list has "Return requests 0" → `sellerOrdersLink({ tab: "returns" })`.

- [ ] **Step 5: Run them to verify they fail, then implement the thunks and the pages**

- **Buyer `OrderPage`:** each shipment card gets its action after the card's "Delivery" line (part 1, task 18), next to "Buy again":
  - when `canBuyerCancel`, the outlined button "Cancel these items", which opens a `ConfirmDialog` (`tone="error"`, `cancelLabel` "Keep them");
  - when `canRequestReturn`, the button "Request a return" plus "Return by …", which opens `ReturnDialog` (Formik; the reason is a `RadioGroup`);
  - otherwise, when the shipment is effective-delivered with no request, "Returns closed …".
  - When the thunk returns false, toast `${storeName} has already shipped these items.` (cancel), or "This order can no longer be returned." (return).
  - No new clock. The buttons read the `now` that Phase D's `useNow(hasPendingDelivery(...))` already provides: `canBuyerCancel` changes only with store state, and `canRequestReturn` turns on at delivery, which that clock covers. A 14-day window closing while the page sits open is picked up on the next render.
  - Add to Phase D's "ticks only while a delivery is pending": with a delivered shipment whose return window is open, `vi.getTimerCount()` is still 0.
- **`SellerOrderPage`:** a "Return" section shows while `returnRequest` exists, with the reason label, the quoted note, and the request time.
  - The actions for `return-requested` are "Approve return" and "Decline return". `DeclineReturnDialog` is an `AppDialog` with one Formik field.
  - A stale action (the thunk returns false) reuses Phase E's toast, "This order has moved on since you opened it."
- **Seller orders and dashboard:** the "Returns" tab, the dashboard "Return requests" to-do (muted at 0), and `SELLER_STATUS_LABEL` as Phase E defined it.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 6: Check by hand, AI-LOG and commit**

At 360 px and 1280 px:
1. As Ahmed, cancel A-10013. As Mona, it sits under Cancelled, with the stock back.
2. As Ahmed, ask to return A-10007. As Karim, it shows in Returns and under "Return requests 1" on the dashboard. Decline it with a note. As Ahmed, the note shows and the button is gone.
3. Buy a Carry Co. item, ship it as Karim, wait 30 s, and ask to return it. Approve it as Karim: the dashboard revenue drops by its total.

Add `## 33. Buyer cancels and return requests with seller approval (Claude Code)`.
```bash
git add -A && git commit -m "Add buyer cancels before shipping and return requests the seller approves or declines"
```

---
### Task 24 (spec task 24): Reviews and ratings

Decisions:
- **Who reviews what:**
  - One review per item per shipment, after delivery: the effective status is `delivered`, `return-requested` or `returned`. Reviews are per item, not per variant: two variants of one item in a shipment share one review, and a review shows no variant label.
  - Stars 1–5 are required. The text is optional, at most 500 characters, and trimmed.
- **Editing and replies:**
  - The author can edit until the store replies.
  - The store gets one public reply, at most 500 characters, which can't be edited.
  - Replying locks the review (Etsy's rule).
- **Source of truth:** the `reviews` slice. A line's review is the one with the same `shipmentId` and `itemId`.
  - `OrderLine.reviewId` (Phase A) is written on every line of that item in the shipment, for the future backend shape. Nothing reads it to decide anything, so an old save that has `reviews: []` and no `reviewId` stays consistent.
- **Rating maths:**
  - `average` is rounded to one decimal and shown with `toFixed(1)`.
  - The "Customer rating" sort puts the highest average first, then the most reviews, then unrated items last. Ties go by name, then id (Phase D's rule).
- **Rating filter:**
  - The param `rating=4|3` reads "4 stars & up" / "3 stars & up". Anything else is `null`.
  - It is written last: the canonical order becomes `q, category, sort, min, max, store, instock, sale, rating` (part 1 ends at `sale`).
- **Where ratings show:**
  - the product page: summary and list;
  - `BuyCard` and `StoreCard`: the short form;
  - the store page: the summary;
  - the buyer order page: write and edit;
  - the seller order page: read and reply.

**Files:**
- Create: `src/features/reviewsSlice.ts`, `reviews.ts`, `reviewActions.ts`, `src/seed/seedReviews.ts`, `src/components/reviews/{StarRating,StarInput,RatingLine,ReviewList,ReviewDialog,ReplyDialog}.tsx`
- Modify:
  - `src/features/types.ts`, `ordersSlice.ts` (`reviewId` on `reviewAdded`), `selectors.ts`, `listing/listingQuery.ts`, `listing/applyListing.ts`
  - `src/app/store.ts`, `src/app/persist.ts`, `src/seed/buildSeed.ts`
  - `src/components/listing/{ProductListing,FilterPanel,FilterChips,FilterSheet}.tsx`, `BuyCard.tsx`, `StoreCard.tsx`
  - `src/pages/Buy/{Product,StorePage}.tsx`, `src/pages/Account/OrderPage.tsx`, `src/pages/Seller/Orders/SellerOrderPage.tsx`, `docs/AI-LOG.md`
- Test:
  - `src/features/__tests__/reviews.test.ts`, `src/features/listing/__tests__/{listingQuery,applyListing}.test.ts` (add), `src/pages/Buy/__tests__/Home.test.tsx` (add)
  - `src/app/__tests__/persist.test.ts` (add), `src/seed/__tests__/buildSeed.test.ts` (add)
  - `src/pages/Buy/__tests__/{Product,StorePage,Search,Category}.test.tsx` (add), `src/pages/Account/__tests__/OrderPage.test.tsx` (add), `src/pages/Seller/Orders/__tests__/SellerOrderPage.test.tsx` (add)

**Interfaces:**
- Consumes:
  - Phase A: `effectiveStatus`, `resetDemoData`, `SeedData`, `buildSeed`, `saveState`/`loadState`, `selectActiveBuyer`, `selectActiveStore`.
  - Phase D: `ListingQuery`, `EMPTY_QUERY`, `SortId`, `SORT_OPTIONS`, `parseListingQuery`, `serializeListingQuery`, `clearFilters`, `activeFilterCount`, `ListingContext`, `applyListing`, `facetCounts`, `BuyCard`, `StoreCard`, `formatDay`, `AppDialog`.
  - Task 23: the return statuses.
- Produces:

```ts
// src/features/types.ts
export interface Review { id: string; itemId: string; storeId: string; orderId: string; shipmentId: string; buyerId: string; authorName: string; stars: number; text: string; createdAt: number; editedAt?: number; reply?: { text: string; at: number } }
export interface RatingSummary { average: number; count: number } // { 0, 0 } when there are no reviews
// SeedData gains reviews: Review[]

// src/features/reviewsSlice.ts (state: Review[]; resetDemoData → buildSeed(now).reviews)
reviewAdded(payload: Review)                                   // no-op if a review for the same shipmentId + itemId exists
reviewEdited(payload: { id: string; stars: number; text: string; at: number }) // no-op once reply is set
reviewReplied(payload: { id: string; text: string; at: number })               // no-op once reply is set
// ordersSlice extraReducer on reviewAdded: sets reviewId on every line of that item in the shipment

// src/features/reviews.ts (pure)
export const REVIEW_TEXT_MAX = 500;
export const summarizeRatings: (reviews: Review[]) => RatingSummary;
export const ratingText: (s: RatingSummary) => string;  // "No reviews yet" | "4.5 out of 5 (2 reviews)" | "5.0 out of 5 (1 review)"
export const ratingLabel: (s: RatingSummary) => string; // "Rated 4.3 out of 5 from 3 reviews" (average with toFixed(1); "1 review")
export const canReviewShipment: (s: Shipment, now: number) => boolean; // effective delivered | return-requested | returned

// src/features/reviewActions.ts
export const submitReview: (args: { orderId: string; shipmentId: string; itemId: string; stars: number; text: string }) => AppThunk<Review | null>;
//   active buyer's order, canReviewShipment, no review yet, stars an integer 1–5, trimmed text ≤ 500; id "rev-" + uuid, authorName = buyer.name
export const editReview: (args: { reviewId: string; stars: number; text: string }) => AppThunk<boolean>; // author only, no reply yet
export const replyToReview: (args: { reviewId: string; text: string }) => AppThunk<boolean>;          // active store's review, no reply yet, trimmed 2–500

// src/features/selectors.ts
selectReviews(state): Review[]
selectReviewsForItem(state, itemId: string): Review[]                      // newest first
selectReviewForLine(state, shipmentId: string, itemId: string): Review | null
selectRatingsByItem(state): Record<string, RatingSummary>                 // rated items only
selectRatingsByStore(state): Record<string, RatingSummary>

// src/features/listing/listingQuery.ts
export type SortId = "best" | "price-asc" | "price-desc" | "newest" | "rating"; // SORT_OPTIONS gains { id: "rating", label: "Customer rating" }, last
// ListingQuery gains minRating: 3 | 4 | null (EMPTY_QUERY null; param "rating"; clearFilters drops it; activeFilterCount counts it 1)
export const RATING_OPTIONS: { value: 3 | 4; label: string }[]; // [{ 4, "4 stars & up" }, { 3, "3 stars & up" }]
// src/features/listing/applyListing.ts
// ListingContext gains ratings: Record<string, RatingSummary>. The minRating filter runs last; facet counts apply it like every other filter

// components
const StarRating: React.FC<{ value: number; size?: "small" | "medium" }>; // role="img", aria-label `${value} out of 5 stars`; Star / StarHalf / StarBorder icons in color.yellow
const StarInput: React.FC<{ name: string; value: number | null; onChange: (stars: number) => void; error?: string }>; // radio group "Your rating", options "1 star" … "5 stars"
const RatingLine: React.FC<{ summary: RatingSummary; short?: boolean }>; // long: stars + ratingText; short: one star + "4.3 (3)" with aria-label ratingLabel; renders nothing when short and count is 0
const ReviewList: React.FC<{ reviews: Review[]; storeName: string }>;
const ReviewDialog: React.FC<{ isOpen: boolean; onClose: () => void; itemName: string; initial?: { stars: number; text: string }; onSubmit: (v: { stars: number; text: string }) => void }>;
const ReplyDialog: React.FC<{ isOpen: boolean; onClose: () => void; authorName: string; onSubmit: (text: string) => void }>;
```

**Seed reviews** (`seedReviews.ts`):
- Each id is `"rev-" + <shipment id without "ship-"> + "-" + <1-based line index>`.
- `createdAt` is the order's `placedAt` + 2 days, and a reply's `at` is `placedAt` + 3 days.
- `authorName` is the buyer's name, and `buildSeed` sets each line's `reviewId`.

| id | Line | Author | Stars | Text | Reply |
| --- | --- | --- | --- | --- | --- |
| `rev-A-10001-tt-1` | Field watch, 38 mm | Ahmed | 5 | "Light on the wrist and easy to read at night. The strap softened after a week." | "Thank you, Ahmed. Glad it suits you." |
| `rev-A-10002-cc-1` | Canvas tote (Standard / Natural) | Omar | 4 | "Sturdy canvas and long handles. I wish it had an inside pocket." | — |
| `rev-A-10002-hl-1` | Ceramic mug | Omar | 5 | "Keeps tea hot, and the glaze is even on all four." | — |
| `rev-A-10003-ps-1` | Wireless earbuds | Nour | 3 | "Good sound for the price, but the case scratches easily." | — |
| `rev-A-10004-cc-1` | Leather wallet | Ahmed | 4 | "Slim and well stitched. Six cards fit comfortably." | — |
| `rev-A-10005-tt-1` | Minimal quartz watch | Omar | 4 | "Clean dial and it keeps good time. The buckle feels a little thin." | — |
| `rev-A-10006-hl-2` | Desk lamp | Nour | 2 | "Nice warm light, but the arm drifts down after a few hours." | "Sorry about that, Nour. A quarter turn on the hinge screw stops the drift." |
| `rev-A-10007-cc-1` | City backpack | Ahmed | 5 | "Fits a 14 inch laptop and still looks neat on the bike." | — |

The delivered lines left without a review are A-10004's Clear phone case (Ahmed), A-10006's Pour-over coffee set (Nour) and A-10008's strap (Omar). Each shows "Write a review" on first visit.

The resulting ratings:
- **Stores:** Tick & Tock 4.5 (2), Carry Co. 4.3 (3), Pocket Signal 3.0 (1), Hearth Lane 3.5 (2).
- **Items at 4 or more:** 6 of the shop's items.
- **Items at 3 or more:** 7, adding the earbuds.

- [ ] **Step 1: Write the failing pure, slice and persist tests**

`reviews.test.ts` (on `buildSeed(NOW)`):
- **"seed ratings":**
  - `selectRatingsByStore` gives `{ "store-tick-tock": { average: 4.5, count: 2 }, "store-carry-co": { average: 4.3, count: 3 }, "store-pocket-signal": { average: 3, count: 1 }, "store-hearth-lane": { average: 3.5, count: 2 } }`.
  - `ratingText` of Carry Co. is "4.3 out of 5 (3 reviews)". `ratingText({ average: 0, count: 0 })` is "No reviews yet".
- **"submit a review":** with Ahmed signed in, `submitReview` on `ship-A-10004-ps` with `itemId: "item-ps-clear-phone-case"` (a variant line, `-v2`), 4 stars and the text `" Fits well "`:
  - it returns a review with `authorName: "Ahmed"`, `text: "Fits well"`, `itemId: "item-ps-clear-phone-case"` and `storeId: "store-pocket-signal"`;
  - the line's `reviewId` is that review's id;
  - a second submit returns `null`.
- **"only delivered lines of your own orders":** each of these returns `null`:
  - A-10010 (packed);
  - A-10003 as Ahmed;
  - stars 0, 6 or 2.5;
  - 501 characters of text;
  - nobody signed in.
- **"a reply locks the review":**
  - Karim's `replyToReview` on `rev-A-10007-cc-1` with "Thanks!" returns true. A second reply returns false.
  - Ahmed's `editReview` on it now returns false. On `rev-A-10004-cc-1` (no reply) it returns true and sets `editedAt`.
  - Mona replying to `rev-A-10007-cc-1` returns false. Omar editing Ahmed's review returns false.
- **"reset brings the seed reviews back":** after a submit, `resetDemoData(5)` gives `buildSeed(5).reviews`.

`listingQuery.test.ts` (add):
- `parseListingQuery("?rating=4").minRating` is 4. `"?rating=5"` and `"?rating=x"` give `null`.
- `serializeListingQuery({ ...EMPTY_QUERY, sort: "rating", minRating: 4 })` is `"sort=rating&rating=4"`.
- The round-trip list gains a query that uses `minRating: 3`.
- `activeFilterCount` counts it, and `clearFilters` drops it.

`applyListing.test.ts` (add), with `ctx.ratings` from the seed:
- **"customer rating sort":** watches by `"rating"` give `["Field watch, 38 mm", "Minimal quartz watch", "Chronograph, leather strap", "Diver watch, steel", "Kids' digital watch", "Smart watch"]`.
- **"rating filter":** watches with `minRating: 4` give 2 items. All shop items give 6 with 4 and 7 with 3.

`persist.test.ts` (add):
- **"round-trips reviews".**
- **"a v2 save without reviews keeps the visitor's data":** a saved seed with the `reviews` key deleted loads with `droppedOld: false`, `state.reviews` equal to `[]`, and the same `accounts`.
- **"reviews that aren't an array drop the save":** this gives `{ state: undefined, droppedOld: true }`.

`buildSeed.test.ts` › "seed reviews line up":
- there are 8 reviews;
- every line with a `reviewId` matches a review with the same `shipmentId` and `itemId`;
- every reviewed shipment is delivered;
- exactly 2 have a `reply`.

- [ ] **Step 2: Run them to verify they fail, then implement**

Run: `npx vitest run src/features src/app src/seed`. Expected: FAIL.

What to implement:
- the types, the slice, `reviews.ts`, `reviewActions.ts`, the selectors and `seedReviews.ts`;
- `SeedData.reviews` and `setupStore`'s `reviews` reducer;
- the listing changes.

`persist.ts` changes:
- **Save:** the persisted keys gain `reviews`. The persist listener watches it by reference.
- **Load:** `reviews: saved.reviews ?? []`.
- **Validity:** Phase A's rule ("all five keys present") stays for the five; `reviews`, when present, must be an array.

Run them again. Expected: PASS.

- [ ] **Step 3: Write the failing page tests**

- **`Search.test.tsx`:**
  - `?rating=4` shows "6 results" and the chip "4 stars & up". Its × leaves no `rating`.
  - `?rating=3` shows "7 results".
  - On a wide screen the filter panel has the radios "4 stars & up", "3 stars & up" and "Any rating".
- **`Category.test.tsx`:** `/c/watches?sort=rating` shows the combobox "Sort by" as "Customer rating", with "Field watch, 38 mm" as the first card.
- **`Product.test.tsx`:**
  - `/p/item-tt-field-watch-38-mm` shows "5.0 out of 5 (1 review)", the h3 "Customer reviews", "Ahmed", `formatDay(createdAt)`, the review text, "Reply from Tick & Tock" and the reply text.
  - Smart watch shows "No reviews yet".
- **`StorePage.test.tsx`:** `/store/tick-tock` shows "4.5 out of 5 (2 reviews)".
- **`BuyCard` / `Home`:** the Carry Co. store card has an element labelled "Rated 4.3 out of 5 from 3 reviews". The Field watch card has "Rated 5.0 out of 5 from 1 review", and Smart watch's card has none.
- **`OrderPage.test.tsx`** (Ahmed):
  - On A-10004, the case line has "Write a review". The wallet line shows "Your review", 4 stars and "Edit review".
  - On A-10001, the line shows "Tick & Tock replied, so this review is locked." and no "Edit review".
  - "Write a review" opens the dialog "Review Clear phone case". Posting without stars shows "Pick a star rating". "4 stars" and "Post review" give the toast "Thanks, your review is posted."
- **`SellerOrderPage.test.tsx`** (Karim, A-10007):
  - The backpack line shows "5 out of 5 stars", "Ahmed" and the text, with a "Reply" button.
  - "Reply" opens "Reply to Ahmed", with the helper "Your reply is public and locks the review." An empty submit shows "Write a reply".
  - "Post reply" toasts "Reply posted", the reply shows, and "Reply" is gone.
  - Mona on A-10001 sees the existing reply and no "Reply".

- [ ] **Step 4: Run them to verify they fail, then build the components and wire the pages**

- **`ProductListing`:** passes `ratings: selectRatingsByItem` into the context.
- **`FilterPanel`:** gains a "Customer rating" radio group ("Any rating" + `RATING_OPTIONS`), after Store and before In stock.
- **`FilterChips`:** labels the chip with the option's label.
- **`FilterSheet`'s draft:** covers it.
- **`BuyCard` and `StoreCard`:** render `<RatingLine short summary={…}/>` under the name.
- **`Product`:** shows `RatingLine` under the name. A `<section aria-labelledby>` with the h3 "Customer reviews" and `ReviewList` sits after the delivery text and before "More from <store>" (part 1's order: … Sold by, delivery text, **Customer reviews**, More from, Recently viewed). The empty text is "No reviews yet. Reviews come from buyers after delivery."
- **Buyer `OrderPage` review controls** sit on the first line of each item in a card (one per item).
- **`StorePage`:** shows `RatingLine` under the tagline.
- **Buyer `OrderPage`, each line of a shipment where `canReviewShipment`:**
  - no review: "Write a review";
  - a review: "Your review" + `StarRating`, plus "Edit review" (the same dialog, `initial` filled), or the locked text when replied.
  - The edit toast is "Review updated".
- **`SellerOrderPage`, each reviewed line:** the review, and "Reply" while there is no reply.
- **Stars:** the MUI `Star`, `StarHalf` and `StarBorder` icons, not ★ characters. Task 10's subset font doesn't carry ★.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 5: Check by hand, AI-LOG and commit**

At 360 px and 1280 px:
1. The rating sort and the 4-stars filter on `/search`.
2. As Ahmed, review the phone case. As Youssef, reply on A-10004. As Ahmed, "Edit review" is gone.
3. The product page shows the new average.
4. Reset demo data brings back the eight seed reviews.

Add `## 34. Reviews and ratings: stars after delivery, one locking seller reply, rating sort and filter (Claude Code)`.
```bash
git add -A && git commit -m "Add reviews and ratings with a locking seller reply, the rating sort and filter, and store ratings"
```

---

### Task 25 (spec task 25): Sales chart

Decisions:
- **Which numbers:** the bars use Phase E's money rule, `shipmentTotal` (`deliveryFee` included), bucketed by `placedAt`, and leave out `!countsAsSale` (cancelled and returned). For the same range, the bars therefore sum to the Revenue tile. A test pins this.
- **Which range:** the chart follows the dashboard's period.
  - **7 days and 30 days:** use Phase E's `periodRange`, so 7 days shows 8 calendar-day bars (the first one partial), matching the tile.
  - **All time:** starts at the store's first order, not at `0`. With no orders, it falls back to 7 days.
  - **Today:** shows no chart, only a line of text. A single bar says nothing, and hourly bars would need a second bucketing rule.
- **Days:** a day is a calendar day in `tz`, the browser's zone by default. Keys come from `Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })`. The buckets step through the keys as UTC dates, one day at a time, from `dayKey(from)` to `dayKey(to)`, never by adding `DAY_MS` to local times, so DST can't skip or repeat a day.
- **Access:**
  - The SVG is `aria-hidden`, and a visually hidden table (Day, Revenue, Orders) carries the numbers.
  - Each bar has a `<title>` for mouse hover.
  - The `<figure>` has a `<figcaption>`.

**Files:**
- Create: `src/features/salesChart.ts`, `src/pages/Seller/Dashboard/SalesChart.tsx`
- Modify: `src/pages/Seller/Dashboard/DashboardPage.tsx`, `docs/AI-LOG.md`
- Test: `src/features/__tests__/salesChart.test.ts`, `src/pages/Seller/Dashboard/__tests__/DashboardPage.test.tsx` (add)

**Interfaces:**
- Consumes:
  - Phase E: `StoreShipment`, `shipmentTotal`, `storeFigures`, `Period`, `PERIODS`, `periodRange`, `DAY_MS`, `useStoreShipments`.
  - Task 23: `countsAsSale`.
  - Existing: `formatPrice`, the `visually-hidden` class.
- Produces:

```ts
// src/features/salesChart.ts
export interface DayRevenue { day: string /* "2026-11-13" in tz */; label: string /* "Nov 13" */; revenue: number; orders: number }
export const dayKey: (at: number, tz: string) => string;
export const revenueByDay: (entries: StoreShipment[], from: number, to: number, tz?: string /* resolvedOptions().timeZone */) => DayRevenue[];
//   one entry per calendar day from dayKey(from) to dayKey(to), zeros included; only from <= placedAt <= to and countsAsSale
export const salesChartRange: (period: Period, now: number, entries: StoreShipment[]) => { from: number; to: number } | null; // "today" → null
export const SALES_CHART_CAPTION: Record<"7d" | "30d" | "all", string>; // "Revenue per day, last 7 days" / "…, last 30 days" / "Revenue per day, all time"
// src/pages/Seller/Dashboard/SalesChart.tsx
const SalesChart: React.FC<{ days: DayRevenue[]; caption: string }>;
```

- [ ] **Step 1: Write the failing pure tests**

`salesChart.test.ts` (`NOW = Date.UTC(2026, 10, 13, 12)`, `tt` = Tick & Tock entries, `tz = "UTC"`):

| Test | Call | Expected |
| --- | --- | --- |
| "7 days of Tick & Tock" | `revenueByDay(tt, NOW - 7*DAY_MS, NOW, "UTC")` | 8 days, `"2026-11-06"` to `"2026-11-13"`; revenue `[0, 0, 0, 38, 189, 0, 0, 177]`; orders `[0, 0, 0, 1, 1, 0, 0, 2]`; first label "Nov 6" |
| "30 days" | `NOW - 30*DAY_MS` | 31 days; the non-zero days are `{ "2026-10-19": 95, "2026-11-01": 59, "2026-11-09": 38, "2026-11-10": 189, "2026-11-13": 177 }` |
| "all time starts at the first order's day" | `salesChartRange("all", NOW, tt)` then `revenueByDay` | `from` is A-10001's `placedAt`; 26 days; first `{ day: "2026-10-19", revenue: 95 }` |
| "today has no chart" | `salesChartRange("today", NOW, tt)` | `null` |
| "all time without orders falls back to 7 days" | `salesChartRange("all", NOW, [])` | `periodRange("7d", NOW)` |
| "bars add up to the Revenue tile" | each of 7d, 30d, all | `sum(revenue) === storeFigures(tt, from, NOW).revenue`: 404, 558, 558 |
| "cancelled and returned are left out" | A-10013 cancelled; A-10009 returned | `"2026-11-13"` → 129; `"2026-11-10"` → 0 |
| "the time zone decides the day" | one entry placed at `Date.UTC(2026, 10, 12, 23, 30)` | `"2026-11-12"` in `"UTC"`, `"2026-11-13"` in `"Africa/Cairo"` |
| "Hearth Lane" | all time | non-zero `{ "2026-10-22": 56, "2026-11-04": 83, "2026-11-11": 42, "2026-11-12": 36 }` |

- [ ] **Step 2: Run them to verify they fail, then implement `salesChart.ts`**

Run: `npx vitest run src/features/__tests__/salesChart.test.ts`. Expected: FAIL, then PASS.

- [ ] **Step 3: Write the failing page tests**

`DashboardPage.test.tsx` (add, Mona, `sellerState("acc-mona", Date.now())`):
- **"chart follows the period":**
  - At the default 7 days, a `figure` has the caption "Revenue per day, last 7 days".
  - Its table has the headers Day, Revenue and Orders, and 8 body rows. The Revenue cells sum to 404.
  - The `svg` inside the figure has `aria-hidden="true"`, and 8 `rect[data-day]`, none with an `rx` attribute.
- **"today shows a note instead":** `?period=today` has no figure, and the text "Sales by day show for 7 days, 30 days and All time."
- **"all time":** `?period=all` has the caption "Revenue per day, all time", and the Revenue cells sum to 558.

(Row counts for 30 days and All time depend on the test machine's time zone, so the page tests pin sums only. The pure tests pin the days.)

- [ ] **Step 4: Build `SalesChart` and place it**

- **Placement:** the figure goes right after the figure tiles, in a section with the h3 "Sales by day".
- **SVG geometry:**
  - `viewBox="0 0 {days.length * 10} 100"`, `preserveAspectRatio="none"`, 160 px tall, full width.
  - One `<rect data-day={day}>` per day, 8 units wide with a 2-unit gap.
  - The height is `revenue / max * 96`, so the top label never overlaps.
  - The fill is `color.primary` (the `sell` accent).
  - A day with 0 gets a 1-unit stub in `color.bg2`, so empty days still read as days.
  - Each `<rect>` holds `<title>{label}: {formatPrice(revenue)}, {orders} order(s)</title>`.
- **Labels** are HTML, outside the SVG, so text isn't stretched:
  - the max value at the top left, and "$0" at the bottom left;
  - under the bars, the first and last day labels, in 0.8rem `color.fgMuted`.
- **The table** uses `className="visually-hidden"`, with `formatPrice` revenue.
- **Shape:** no `rx`, no border radius, no gradient.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 5: Check by hand, AI-LOG and commit**

At 360 px and 1280 px, in light and dark, as Mona:
1. 7 days shows 8 bars, with today's bar the tallest but one.
2. Hovering a bar shows its title.
3. All time starts at the first order.
4. Today shows the note.
5. Cancel A-10013: today's bar drops to $129.
6. axe on `/seller` reports nothing new.

Add `## 35. Sales chart: revenue per day on the seller dashboard (Claude Code)`.
```bash
git add -A && git commit -m "Add a revenue-per-day SVG chart with a table fallback to the seller dashboard"
```

---
### Task 26 (spec task 26): Notifications bell

Decisions:
- **Derived, never stored:** the list comes from `effectiveHistory(s, now)` (Phase E), so timer deliveries appear once they happen and never before.
- **Unread:** an event is unread when `at > account.notificationsSeenAt`, strictly.
- **Marking read:** opening the bell dispatches `markNotificationsSeen({ accountId, at: Date.now() })`. The bell keeps the old `seenAt` in local state while it is open, so those items stay marked "New" until it closes.
- **Buyer events:** shipped, delivered, return approved and return declined (the decline is a `delivered` event that follows `return-requested`).
- **Seller events, for their own store's shipments only:**
  - "New order" is the shipment's first event;
  - "Return requested";
  - "cancelled by the buyer" is a `cancelled` event with `by: "buyer"`.
- **Not events:** packed, seller cancels, the buyer's own placing.
- **List size:** the newest 20.
- **Placement** (agreed with part 1, which put "Saved" between the account button and the cart): the bell sits just left of the mode switch, in both modes and at every width, so the switch stays immediately left of the account button as the spec requires. It renders only while the mode has a signed-in account.
  - Buyer wide row 1: logo, search, **bell**, switch, account, Saved, cart.
  - Buyer phone bar: menu, logo, spacer, **bell**, switch, account, cart.
  - Seller wide: logo, store name, search, **bell**, switch, account. Seller phone: menu, logo, spacer, **bell**, switch, account.
  - The phone drawers get no notifications entry: the bell stays in the bar.
- **Loading:** the list is a lazy chunk (Phase C's first-load rule keeps `Menu` out of the preloaded files), and its paper carries the mode class.
- **Seed `notificationsSeenAt`:**
  - buyers: `now − 7 × DAY_MS`;
  - sellers: `now − 36 h`.

  So a first visit shows Ahmed 2 unread, Omar 3, Nour 1, Mona 2, Karim 1, Youssef 1 and Laila 1. Accounts created at sign-up keep Phase A/B's `Date.now()`.

**Files:**
- Create: `src/features/notifications.ts`, `src/components/header/NotificationBell.tsx`, `NotificationList.tsx`
- Modify: `src/features/accountsSlice.ts`, `src/seed/buildSeed.ts` (or `catalogue.ts`, wherever `notificationsSeenAt` is set), `src/components/header/BuyerHeader.tsx`, `SellerHeader.tsx`, `docs/AI-LOG.md`
- Test: `src/features/__tests__/notifications.test.ts`, `src/seed/__tests__/buildSeed.test.ts` (add), `src/components/header/__tests__/NotificationBell.test.tsx`

**Interfaces:**
- Consumes:
  - Phase A: `Account`, `Order`, `Store`, `selectActiveBuyer`, `selectActiveSeller`, `selectAllOrders`. Phase A: `selectStores`.
  - Phase B: `useSide`, `ROUTES.accountOrder`, `ROUTES.sellerOrder`.
  - Phase C: `BuyerHeader`, `SellerHeader`, the `AccountMenuList` lazy pattern, `setViewportWidth`, `whenIdle`.
  - Phase D: `formatDateTime`, `hasPendingDelivery`, `selectOrdersForBuyer`.
  - Phase E: `effectiveHistory`, `DAY_MS`.
  - Task 23: `StatusEvent.by`.
  - Existing: `useNow`.
- Produces:

```ts
// src/features/notifications.ts (pure)
export type NotificationKind = "shipped" | "delivered" | "return-approved" | "return-declined" | "new-order" | "return-requested" | "buyer-cancelled";
export interface AppNotification { id: string /* `${shipment.id}:${kind}:${at}` */; kind: NotificationKind; at: number; text: string; href: string; isUnread: boolean }
export const NOTIFICATIONS_MAX = 20;
export const notificationsFor: (account: Account, orders: Order[], stores: Store[], now: number) => AppNotification[]; // newest first, ties by id
export const unreadCount: (list: AppNotification[]) => number;
// src/features/accountsSlice.ts
markNotificationsSeen(payload: { accountId: string; at: number }) // seenAt = max(seenAt, at); an unknown id is a no-op
// src/components/header/NotificationBell.tsx
const NotificationBell: React.FC; // reads useSide().role; null when that mode has no signed-in account
```

Texts. `first` is `lines[0].name`, plus ``` and ${n} more``` when the shipment has more lines; `store` is the store's name.

| Kind | Text | href |
| --- | --- | --- |
| shipped | `Your ${first} shipped` | `ROUTES.accountOrder(order.id)` |
| delivered | `Your ${first} was delivered` | same |
| return-approved | `${store} approved your return of ${first}` | same |
| return-declined | `${store} declined your return of ${first}` | same |
| new-order | `New order ${number}` | `ROUTES.sellerOrder(order.id)` |
| return-requested | `Return requested on ${number}` | same |
| buyer-cancelled | `${number} was cancelled by the buyer` | same |

- [ ] **Step 1: Write the failing pure tests**

`notifications.test.ts` (on `buildSeed(NOW)` with this task's seen times):
- **"seed unread counts":** `unreadCount(notificationsFor(account, …, NOW))` per account is `{ "acc-ahmed": 2, "acc-omar": 3, "acc-nour": 1, "acc-mona": 2, "acc-karim": 1, "acc-youssef": 1, "acc-laila": 1 }`. Add the same check to `buildSeed.test.ts` as "notifications start with a few unread".
- **"Ahmed's list":**
  - 8 items.
  - The first two are `"Your City backpack was delivered"` and `"Your City backpack shipped"`, both unread, with href `/account/orders/order-A-10007`.
  - Nothing for A-10010 (packed) or A-10013 (placed).
- **"Mona's list":**
  - 6 items, starting `"New order A-10013"`, `"New order A-10012"`, with href `/seller/orders/order-A-10013`.
  - `JSON.stringify` of the list contains neither "Power bank" nor "Nour".
- **"a timer delivery appears only once it happens":** a fixture Ahmed order whose Tick & Tock shipment (Kids' digital watch) shipped at `NOW - 5_000`, with `deliverAt: NOW + 5_000`.
  - At NOW, the list has "Your Kids' digital watch shipped" and no "was delivered".
  - At `NOW + 5_000`, the first item is "Your Kids' digital watch was delivered", at `NOW + 5_000`, and unread.
- **"returns, declines and buyer cancels"** (fixtures on A-10007 and A-10013):
  - Karim gets "Return requested on A-10007".
  - Ahmed gets "Carry Co. approved your return of City backpack", or "Carry Co. declined your return of City backpack" after a decline.
  - Mona gets "A-10013 was cancelled by the buyer". A seller cancel gives Mona nothing.
- **"more lines":** for Nour, A-10006 reads "Your Pour-over coffee set and 1 more was delivered".
- **"strictly after seenAt":** with `notificationsSeenAt` equal to an event's `at`, that event is read.
- **"at most 20":** a buyer with 15 delivered fixture shipments (30 events) gets 20 items.

`accountsSlice`:
- `markNotificationsSeen({ accountId: "acc-ahmed", at: NOW - 1 })` after `at: NOW` keeps NOW;
- `"acc-nope"` leaves the state the same by reference.

- [ ] **Step 2: Run them to verify they fail, then implement `notifications.ts`, the reducer and the seed times**

Run: `npx vitest run src/features src/seed`. Expected: FAIL, then PASS.

- [ ] **Step 3: Write the failing component tests**

`NotificationBell.test.tsx` renders `BuyerHeader` or `SellerHeader` with `LocationProbe`, through `renderWithStore` with `buildSeed(Date.now())`:
- **"no bell for a guest":** `queryByRole("button", { name: /Notifications/ })` is null.
- **"buyer bell in row 1":** at 1280 px, with Ahmed:
  - in the DOM, the button "Notifications, 2 unread" precedes "Switch to selling", which precedes "Hello, Ahmed", which precedes "Saved, 2 items" and "Cart, 0 items";
  - its badge text is "2".
  - At 360 px the order is bell, switch ("Sell"), avatar, cart.
- **"opening marks read but keeps New until closed":**
  1. Click the bell. `findByRole("menu")` has 8 `menuitem` links; the first is "Your City backpack was delivered" → `/account/orders/order-A-10007`.
  2. Exactly 2 items contain "New".
  3. `acc-ahmed`'s `notificationsSeenAt` is at least the test's start time.
  4. Escape closes the menu. The button is "Notifications" with no badge, and it has focus.
  5. Reopen: no item contains "New".
- **"seller bell":** Mona at `/seller` sees "Notifications, 2 unread" before "Switch to shopping", and "Switch to shopping" comes right before "Account menu, Mona". The first item is "New order A-10013" → `/seller/orders/order-A-10013`, and the menu paper has class `sell`.
- **"an item opens its order":** click it. The location is the order's path, and the menu is gone.
- **"the count rises when a delivery lands":**
  - Fake timers at T, with Ahmed's `notificationsSeenAt = T`.
  - A fixture shipment shipped at `T - 5_000` (read) with `deliverAt: T + 5_000`.
  - The button reads "Notifications". After `advanceTimersByTime(5_000)` it reads "Notifications, 1 unread".
  - After another `advanceTimersByTime(2_000)`, `vi.getTimerCount()` is back to its value before the fixture: the bell's clock stops once nothing is pending.

- [ ] **Step 4: Build `NotificationBell` and `NotificationList`, and place them**

- **`NotificationBell`:**
  - The account comes from `selectActiveBuyer` / `selectActiveSeller`, by `useSide().role`.
  - `now = useNow(role === "buyer" && hasPendingDelivery(buyerOrders, Date.now()))` (Phase D), so the header runs no clock unless a timer delivery is pending. Seller events come only from state changes, which re-render anyway. The list is `notificationsFor(account, selectAllOrders, selectStores, now)`.
- **The button:** an `IconButton` with:
  - `id="notifications-button"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls="notifications-menu"` while open;
  - `NotificationsNone` (or `Notifications` when there are unread items);
  - `aria-label` "Notifications, N unread" or "Notifications";
  - a square `Badge` showing "9+" above 9.
- **On open:** keep `seenAtOnOpen = account.notificationsSeenAt` in state, then dispatch `markNotificationsSeen`. While open, the "New" marker reads `at > seenAtOnOpen`.
- **`NotificationList`:** `lazy(() => import("./NotificationList"))`, prefetched with `whenIdle()`. It is an MUI `Menu` with:
  - `id="notifications-menu"`, `MenuListProps={{ "aria-labelledby": "notifications-button" }}`;
  - the paper class from `useSide().side`, radius 0, `var(--shadow-2)`, max height 60vh, width `min(360px, 92vw)`.
- **Each item:** a `MenuItem component={Link}` holding the text, then `formatDateTime(at)` in `color.fgMuted`, and a "New" tag in `color.primary` with `font.Bold` while unread.
- **Empty:** a disabled item, "No notifications yet".
- **Focus:** the same rules as Phase C's account menu: `disableRestoreFocus`, and focus goes back to the button by hand on Escape, backdrop or Tab.
- **Placement:**
  - `BuyerHeader` wide grid gains one more `auto` column: logo, search, bell, switch, account, Saved, cart.
  - `BuyerHeader` phone: menu, logo, spacer, bell, switch, account, cart.
  - `SellerHeader`: just left of `ModeSwitch` at both widths (so the switch stays next to `AccountMenu`).

Run: `npm test && npm run lint && npm run build`. Expected: PASS. Repeat Phase C Task 1 Step 10's chunk check: the files `/` preloads contain no `MuiMenu-`, and `NotificationList` is its own chunk.

- [ ] **Step 5: Check by hand, AI-LOG and commit**

At 360 px and 1280 px:
1. As Ahmed: 2 unread. Open the bell, close it, refresh: still read.
2. Buy as Ahmed, then switch to Tick & Tock: Mona's bell says "New order A-10014".
3. Ship it, then switch back: Ahmed's bell gains "shipped", and about 30 s later "was delivered".
4. At 360 px, nothing scrolls sideways with the bell in the row.

Add `## 36. Notifications bell for buyers and sellers (Claude Code)`.
```bash
git add -A && git commit -m "Add a notifications bell derived from order history, with unread counts per account"
```

---

### Task 27 (spec task 27): Guided demo tour

Decisions:
- **State in the session:** the tour's state lives in `session.tour` (persisted, optional), not in browser storage.
  - Reset demo data brings the card back with the rest of the first-visit state.
  - Phase G's cross-tab sync carries it.
  - Auto-ship can read it (below).
  - A save without it loads as "never started".
- **The card:** "Try the whole flow" sits on the store home, right after the hero, until it is started or hidden. The home order becomes: hero, **Try the whole flow**, Shop by category, Deals, Our stores, New arrivals, Recently viewed. Once started, a small `TourPanel` shows in both layouts, so the steps stay in view in the seller centre.
- **Never automates:** the tour only shows text and links. Every step is detected from state and the path by `tourProgress`, which also needs `now` (delivery is derived from the clock), so its signature is `tourProgress(state, pathname, now)`.
- **Who can buy:** any buyer's new Tick & Tock order counts. The text suggests Ahmed, but a visitor who signed up as themselves isn't stuck.
- **Steps stay done:** a step counts as done when its own check passes or any later step's does. When every check passes at once, the panel shows the finish text until "Close".
- **Auto-ship:** while a tour is active, `runAutoShip` treats Tick & Tock's `autoShip` as off. Otherwise its Auto-ship packs and ships the tour order before the visitor gets there. The "Pack and ship" step still checks only that the order is shipped, so it completes however that happened.
- **The footer link:**
  - The Help column (wide) and the buyer phone footer row get "Try the whole flow" → `ROUTES.tour` (`"/?tour=1"`).
  - Home reads `tour=1`: a hidden or finished card shows again, and focus moves to its heading.
  - The param is then removed with `replace`.

**Files:**
- Create: `src/features/tour.ts`, `src/components/tour/TourCard.tsx`, `TourPanel.tsx`
- Modify: `src/features/types.ts`, `sessionSlice.ts`, `fulfilmentActions.ts` (`runAutoShip`), `src/constant/routes.ts`, `src/pages/Buy/Home.tsx`, `src/layout/Layout.tsx`, `docs/AI-LOG.md`
- Test: `src/features/__tests__/tour.test.ts`, `session.test.ts` (add), `fulfilmentActions.test.ts` (add), `src/app/__tests__/persist.test.ts` (add), `src/components/tour/__tests__/TourCard.test.tsx`, `TourPanel.test.tsx`, `src/layout/__tests__/Layout.test.tsx` (add)

**Interfaces:**
- Consumes:
  - Phase A: `SessionState`, `effectiveStatus`, `resetDemoData`.
  - Phase B: `ROUTES`, `isSellerPath`, `ModeSwitch` (named in the hints).
  - Phase C: `Layout` footer columns, `setViewportWidth`, `LocationProbe`.
  - Phase D: `Home`.
  - Phase E: `runAutoShip`, `autoShipStep`.
  - Task 23: `countsAsSale`.
  - Existing: `useNow`.
- Produces:

```ts
// src/features/types.ts
export type TourState = { status: "active"; startedAt: number } | { status: "done" | "hidden" };
// SessionState gains tour?: TourState   (absent = never started; the card shows)
// src/features/sessionSlice.ts
startTour(payload: { at: number })          // → { status: "active", startedAt: at }
endTour(payload: { completed: boolean })    // completed → { status: "done" }; otherwise tour removed
hideTourCard()                              // → { status: "hidden" }
showTourCard()                              // "hidden" or "done" → removed; "active" unchanged
// resetDemoData removes it (buildSeed's session has no tour)
// src/constant/routes.ts
ROUTES.tour = "/?tour=1"
// src/features/tour.ts (pure)
export const TOUR_STORE_ID = "store-tick-tock";
export const TOUR_SELLER_ID = "acc-mona";
export type TourStepId = "buy" | "switch" | "ship" | "back" | "arrive";
export interface TourStep { id: TourStepId; label: string; hint: string; link: { to: string; label: string } | null; done: boolean }
export interface TourProgress { steps: TourStep[]; current: TourStepId | null; orderId: string | null; orderNumber: string | null; isComplete: boolean }
export const tourProgress: (state: Pick<RootState, "session" | "orders">, pathname: string, now: number) => TourProgress | null; // null unless tour.status === "active"
// fulfilmentActions.runAutoShip: passes stores with TOUR_STORE_ID's autoShip forced false while session.tour?.status === "active"
// components
const TourCard: React.FC;  // store home only
const TourPanel: React.FC; // rendered by Layout in both modes while the tour is active
```

**Step checks.** The tour order is the newest order with `placedAt >= startedAt` and a `TOUR_STORE_ID` shipment that `countsAsSale`. `S` is that shipment.

| Step | Own check | Label | Hint | Link |
| --- | --- | --- | --- | --- |
| buy | a tour order exists | "Buy something from Tick & Tock" | "Log in as Ahmed (or any buyer), add a Tick & Tock item to your cart and check out." | "Go to Tick & Tock" → `ROUTES.store("tick-tock")` |
| switch | `session.sellerId === TOUR_SELLER_ID` and `isSellerPath(pathname)` | "Switch to selling as Tick & Tock" | "Use Switch to selling at the top, then pick Tick & Tock." | "Open the seller centre" → `ROUTES.seller` |
| ship | `effectiveStatus(S, now)` is shipped, delivered, return-requested or returned | "Pack and ship the order" | `Open ${number}, choose Mark packed, then Mark shipped.` | `Open ${number}` → `ROUTES.sellerOrder(orderId)` |
| back | the ship check passes, `!isSellerPath(pathname)` and `session.buyerId === order.buyerId` | "Switch back to shopping" | "Use Switch to shopping at the top." | none |
| arrive | effective delivered (or later) and `pathname === ROUTES.accountOrder(orderId)` | "Watch it arrive" | `It arrives about 30 seconds after shipping. Keep ${number} open to watch it change.` | `Open ${number}` → `ROUTES.accountOrder(orderId)` |

- [ ] **Step 1: Write the failing pure, slice and Auto-ship tests**

`tour.test.ts`. Setup: `buildSeed(NOW)` with `session.tour = { status: "active", startedAt: NOW }`. The fixture `T` is `order-A-10014` (number "A-10014", buyer `acc-ahmed`, `placedAt: NOW + 1_000`), with one Tick & Tock shipment of Kids' digital watch ×1, placed.

| Test | Setup | Expected |
| --- | --- | --- |
| "no active tour, no progress" | tour absent; `{ status: "done" }` | `null` both times |
| "before buying" | no `T` | `current: "buy"`; buy's link `{ to: "/store/tick-tock", label: "Go to Tick & Tock" }`; nothing done |
| "orders from before the tour don't count" | only the seed (A-10013 is a Tick & Tock order) | buy not done |
| "buying a Tick & Tock item" | `T` | buy done; `orderNumber: "A-10014"`; `current: "switch"`; ship's hint "Open A-10014, choose Mark packed, then Mark shipped." and link `/seller/orders/order-A-10014` |
| "any buyer counts; a cancelled order doesn't" | `T` with `acc-omar`; `T` cancelled | done; not done |
| "switch needs Tick & Tock on a seller page" | Mona at "/"; Mona at "/seller"; Karim at "/seller" | not done; done; not done |
| "ship counts however the order was shipped" | `T` shipped with `deliverAt: NOW + 30_000`, nobody signed in, at "/" | buy, switch and ship done; `current: "back"` |
| "back needs the order's buyer in buyer mode" | shipped; Ahmed at "/account/orders"; then Nour | back done, `current: "arrive"`; then back not done |
| "arrive needs the delivery and the order page" | at `/account/orders/order-A-10014`, `now` NOW + 29_999 and then NOW + 30_000 | not done; then done, `isComplete: true`, `current: null` |

`session.test.ts` (add):
- `startTour({ at: 5 })` gives `{ status: "active", startedAt: 5 }`.
- `endTour({ completed: true })` gives `{ status: "done" }`. `endTour({ completed: false })` removes the tour.
- `hideTourCard()` gives `{ status: "hidden" }`. `showTourCard()` from hidden removes it; from active it changes nothing.
- `resetDemoData()` removes it.

`fulfilmentActions.test.ts` › "the tour keeps Auto-ship off Tick & Tock". Setup: nobody signed in; non-seed Tick & Tock and Carry Co. orders, each placed at `NOW - 50_000`; tour active.
- `runAutoShip(NOW)` returns 1: Carry Co. is shipped, and Tick & Tock is still placed.
- After `endTour({ completed: false })`, `runAutoShip(NOW)` returns 1, and Tick & Tock is shipped.

`persist.test.ts` (add):
- "a save without session.tour loads": `droppedOld: false`, and `tour` is undefined.
- "an active tour round-trips".

- [ ] **Step 2: Run them to verify they fail, then implement `tour.ts`, the reducers, `ROUTES.tour` and the Auto-ship rule**

Run: `npx vitest run src/features src/app`. Expected: FAIL, then PASS.

- [ ] **Step 3: Write the failing component tests**

`TourCard.test.tsx` renders `<Home/>` with `LocationProbe`:
- **"card on a first visit":**
  - the h2 "Try the whole flow";
  - the text "Buy as a shopper, ship it as the store, then watch it arrive. It takes about a minute.";
  - an ordered list of the 5 step labels;
  - the buttons "Start the tour" and "Hide the tour".
  - It adds no links, so Phase D's Home link counts hold.
- **"start":** `session.tour.status` is "active", and the h2 is gone.
- **"hide":** `{ status: "hidden" }`, and the card is gone.
- **"done":** with `{ status: "done" }`, the card reads "You've seen the whole flow." with "Run it again" (which gives an active tour, `startedAt` ≈ now) and "Hide the tour".
- **"?tour=1 brings it back":** with `{ status: "hidden" }` at `/?tour=1`, the card shows, the location becomes `/`, and the card's h2 has focus.

`TourPanel.test.tsx` renders `RouterIndex` with an active tour:
- **"panel in buyer mode":** at 1280 px on `/`, the `complementary` "Guided tour" shows:
  - "Tour: step 1 of 5";
  - the buy hint;
  - the link "Go to Tick & Tock" → `/store/tick-tock`;
  - the note "Tick & Tock's Auto-ship is paused while the tour runs."
  - "End tour" removes the tour and the panel.
- **"panel in seller mode":** at `/seller` with Mona and `T` placed, it shows "Tour: step 3 of 5" and the link "Open A-10014". Its root has class `sell`.
- **"finish":** with `T` delivered (past `deliverAt`) at `/account/orders/order-A-10014`:
  - it shows "That's the whole flow: one order, split by store, moved by the seller.";
  - "Close" sets `{ status: "done" }` and removes the panel.
- **"phones":** at 360 px the panel starts collapsed as the button "Tour, step 1 of 5" (`aria-expanded="false"`). Clicking it shows the hint.

`Layout.test.tsx` (add):
- The Help column's first link is "Try the whole flow" → `/?tour=1`, followed by Phase C's three.
- At 360 px the buyer footer row also has "Try the whole flow". The seller footer doesn't.

- [ ] **Step 4: Build `TourCard` and `TourPanel`, and place them**

- **`TourCard`** (a `section` labelled by its h2):
  - It sits between the hero and "Shop by category" on `Home`, as a `<section aria-labelledby>`, with `color.bg1`, a 4 px left bar in `color.primary`, radius 0 and `var(--shadow-1)`.
  - It renders when the tour is absent (start view) or "done" (done view). It is gone while "active" or "hidden".
  - "Start the tour" dispatches `startTour({ at: Date.now() })`.
- **`TourPanel`:** an `<aside aria-label="Guided tour">`, rendered by `Layout` after the footer while `session.tour?.status === "active"`.
  - `now = useNow(true)`. `tourProgress` is memoised on `session`, `orders`, `pathname` and `now`.
  - It holds the heading "Tour: step N of 5" (N = the current step's index + 1), the 5 steps (a check icon when done, `aria-current="step"` on the current one), the current step's hint and link, the Auto-ship note, and "End tour".
  - **Wide screens:** fixed at bottom 16 px, right 16 px, 320 px wide, `color.bg1`, radius 0, `var(--shadow-2)`, with the mode class.
  - **Phones:** collapsed to a fixed button at right 16 px, bottom 80 px, clear of Phase D's sticky "Filter and sort" button. It expands into a full-width panel fixed to the bottom.
  - **When `isComplete`:** the finish text and "Close" (`endTour({ completed: true })`).
- **`Home`:** reads `tour` from `useSearchParams`, dispatches `showTourCard()`, removes the param with `replace`, and focuses the card's h2 (`tabIndex={-1}`).
- **`Layout` footer:** adds the link in the Help column, and in the buyer phone row.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 5: Walk the whole flow by hand, AI-LOG and commit**

`npm run build && npm run preview`, at 360 px and 1280 px, starting from Reset demo data:
1. Start the tour.
2. Log in as Ahmed, buy a Tick & Tock watch, and wait 60 s: the order stays Placed (Auto-ship paused).
3. Switch to selling, then pick Tick & Tock. Pack and ship it.
4. Switch to shopping and open the order: it arrives about 30 s later, and the panel shows the finish text.
5. Close the panel. Hide the card. The footer's "Try the whole flow" brings it back.
6. Nothing scrolls sideways at 360 px with the panel open or collapsed.

Add `## 37. Guided demo tour: "Try the whole flow" (Claude Code)`.
```bash
git add -A && git commit -m "Add the guided demo tour card and panel, detected from state and the page"
```

---

## Self-review notes

- **Spec coverage:**
  - **Task 22:** Buy again, at today's price and stock.
  - **Task 23:** buyer cancel before shipping, return requests the seller approves, the Return requested and Returned states, and the stock going back.
  - **Task 24:** stars after delivery, the one locking reply, the rating sort, the rating filter and store ratings.
  - **Task 25:** the SVG chart in Gruvbox colours, with no library.
  - **Task 26:** "Your … shipped" and "New order", plus the unread count.
  - **Task 27:** the tour, last, walking the finished app.
- **Choices made here:**
  - The buyer cancel is instant.
  - Returns use a 14-day real-time window from the first delivery, with one request per shipment.
  - A decline returns to `delivered`.
  - `returned` counts like `cancelled` in every money and units figure (`countsAsSale`).
  - There is a new Returns tab.
  - Reviews are per item per shipment (not per variant), and the reviews slice is the source of truth.
  - Today shows no chart.
  - The bell sits just left of the mode switch, so the switch keeps the spec's place immediately left of the account button.
  - The tour lives in `session.tour`, and Auto-ship pauses for Tick & Tock during it.
- **Seed values,** recomputed with a script from Phase A's order table and history spacing:
  - Tick & Tock 7 days: 38 / 189 / 177 on Nov 9, 10 and 13, summing to 404. 30 days and all time: 558. Hearth Lane: 217.
  - All time is 26 days from Oct 19.
  - Unread: Ahmed 2, Omar 3, Nour 1, Mona 2, Karim 1, Youssef 1, Laila 1.
  - Store ratings: 4.5 / 4.3 / 3.0 / 3.5.
  - Returned A-10009 gives Tick & Tock 369 / 5 / 7 / 73.8.
- **Auto-ship backfill vs `seenAt`:** a backfilled event is dated when it fell due. It could land before a `seenAt` stamped in the same second. The tick is 1 s, so that window is negligible, and no test pins it.
- **Types used across tasks:** `ShipmentRef` (Phase E), `countsAsSale` (Task 23, used in 24, 25 and 27), `Review` and `RatingSummary` (Task 24), `DAY_MS` (Phase E), `StatusEvent.by` (Task 23, read in Task 26), `TourState` (Task 27).

## Contract gaps

1. **Return details have no field in Phase A's types.** Phase A carries the `return-requested` and `returned` statuses, but nowhere to keep the reason, the decline note or who cancelled. Task 23 adds two optional fields, `Shipment.returnRequest` and `StatusEvent.by`, and needs no `VERSION` bump.
2. **Adding a missing line through `setCartQuantity`.** Phase A's `setCartQuantity` / `setLineQuantity` don't say whether they add a line that isn't in the cart. Task 22 adds it with `addItemToCart` first, then sets the quantity.
3. **Phase E's tabs and to-do.** Phase E's "Delivered" tab includes the return states, and `StoreTodo` has no returns count. Task 23 moves the return states to a new "Returns" tab, adds `StoreTodo.returns`, and updates Phase E's `countByTab` and tab assertions.
4. **"Cancelled excluded" is spelled out in many places in Phases D and E:**
   - `selectUnitsSoldByItem`;
   - `unitsSoldByItem`, `storeFigures`, `topProducts`;
   - the customers totals.

   Task 23 replaces them all with `countsAsSale`, which leaves out `returned` too. If a later phase adds a figure, it should use the helper. The buyer's `orderTotals` keeps the cancelled-only rule on purpose.
5. **Phase D's delivered time.** Phase D's `shipmentText` reads the last `delivered` event. After a declined return that is the decline time, so Task 23 switches it to the first `delivered` event.
6. **Persist validity with a sixth slice.** Phase A requires "all five keys present". Task 24 keeps that rule and treats `reviews` as optional (`?? []`, an array when present). Phase G's cross-tab hydrate already uses `payload.reviews ?? []`.
7. **Seed `notificationsSeenAt`.** Phase A sets it to `now` for every account, so a first visit would show nothing unread. Task 26 changes only these seed values (buyers `now − 7 d`, sellers `now − 36 h`), not the shape.
8. **`tourProgress` signature.** The brief asked for `tourProgress(state, pathname)`. Delivery is derived from the clock, so it takes `now` as well. It reads a new optional `SessionState.tour`.
9. **Phase C's footer.** The Help column linked only to the AI log (Phase C gap 4). Task 27 adds "Try the whole flow" there, and to the buyer phone footer row, which Phase C kept to today's links.
10. **Part 1's shared places, as part 1 pinned them (its gap 10):**
    - `ListingQuery` ends `instock, sale`; Task 24 appends `rating`.
    - Header row 1 is logo, search, switch, account, Saved, cart; Task 26 puts the bell just left of the switch. The bell renders only when signed in, so the guest row-order tests in Phase C and part 1 don't change; Task 26's own test pins the signed-in order.
    - Home: Task 27's card goes between the hero and "Shop by category". Product page: Task 24's reviews go before "More from".
    - Order page cards: Task 22's "Buy again" and Task 23's cancel and return buttons go after the "Delivery" line. To fit that, "Buy again" on the order page is per shipment; the Orders list keeps an order-wide button.
    - Restocks (cancel and approved return) go through part 1's variant-aware restock, so variant stock and the item total stay in step (part 1 gap 1).
    - Nothing in this plan places orders. A tour order is placed by the visitor through checkout, which uses part 1's `submitOrder`.
11. **Part 1's seed.** The values here assume part 1's pinned seed:
    - Seed order lines keep their Phase A prices, with variants only on the tote (A-10002), the phone case (A-10004) and the strap (A-10008).
    - Seed shipments keep `deliveryFee: 0`, and stock is unchanged.

    If part 1 changes any of these, recompute the Task 22, 24 and 25 values.
