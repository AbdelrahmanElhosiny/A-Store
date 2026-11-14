# Phase D: Shopping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give buyers a real shop: a store home; category, search, product and store pages on one listing with sort and filters in the query string; an account area with addresses and payment methods; and a checkout that places one order split into one shipment per store, followed on an order page with a tracking card per shipment.

**Architecture:**
- **Pure modules decide and carry the unit tests:**
  - `listingQuery.ts`: URL ⇄ state.
  - `applyListing.ts`: filter, sort and facet counts.
  - `cardUtils.ts`: brand, Luhn and expiry.
  - `checkout.ts`: what is picked and what can be ordered.
  - `orderView.ts`: the buyer's status texts.
- **Reducers:** the address and payment-method reducers live on `accountsSlice`, keyed by `buyerId`.
- **Pages** are thin. They read selectors and the query string, and dispatch Phase A actions.
- **One listing:** `ProductListing` serves the category, search and store pages.
- **Account pages** nest under `/account`, behind `RequireBuyer`, which mirrors Phase B's `RequireSeller`.

**Tech Stack:** React 18, react-router-dom 6 (`useSearchParams`, nested routes), RTK 1.9, MUI 5, Formik + Yup, Vitest + Testing Library (from Phase A).

**Spec:** `docs/superpowers/specs/2026-11-13-marketplace-overhaul-design.md`, these sections:
- Target structure;
- Point 1b;
- Point 2: "One order, one shipment per store" and the status table;
- Point 3;
- Builder notes;
- Risks "Card fields".

Builds on the Phase A, B and C plans in `docs/superpowers/plans/`.

## Global Constraints

- **Branch and versions:** branch `marketplace`. No major upgrades and no new runtime dependencies.
- **Commits:**
  - One spec task = one commit = one `docs/AI-LOG.md` entry. This phase writes entries 17–21 in the existing format.
  - No Claude/Anthropic attribution in commit messages.
  - Commit only when the user asks.
- **Checks:** `npm run lint`, `npm run build` and `npm test` pass after every task.
- **Design:**
  - Gruvbox tokens only, with sharp edges (radius 0) and the `buy` accent.
  - No sideways scroll at 360 px.
  - The phone breakpoint is Phase C's `useIsPhone()` / `media.phone` (767 px).
- **Card data:**
  - Only `brand`, `last4`, `expMonth`, `expYear`, `holder` and `nickname` are stored.
  - The number and the CVV live only in form state and are cleared on submit.
- **Mode:** the URL decides the mode, and every page here is buyer mode.
- **Paths:** spelled only through `ROUTES` / `ROUTE_PATTERNS`.
- **State access:** components read through selectors and `useAppSelector` / `useAppDispatch`.

## Review Focus

1. **Junk query string** (`/c/watches?min=abc&sort=zzz&store=%25%25&instock=yes`). Expected: the default listing (6 watches, Best-selling, no chips) and no crash. Pinned in Task 1 (`listingQuery.test.ts` › "junk falls back to defaults"; `Category.test.tsx` › "junk query renders the default listing").
2. **Price min above max** (`?min=100&max=20`). Expected: the two are swapped, items from $20 to $100 show, and the chip reads "$20 to $100". Pinned in Task 1 (`listingQuery.test.ts` › "min above max is swapped").
3. **A cart line archived or sold out before checkout.** Expected:
   - It is listed under "Won't be ordered" with its reason.
   - It is left out of the totals.
   - The order holds only what can ship.
   - The line stays in the cart.

   Pinned in Task 5 (`Checkout.test.tsx` › "archived and sold-out lines are not ordered").
4. **The picked address deleted mid-checkout.** Expected: Ship to falls back to the new default, and the order's `shipTo` is that address. Pinned in Task 5 (`Checkout.test.tsx` › "removed address falls back to the new default").
5. **Back after placing an order.** Expected:
   - Back lands on the empty cart.
   - `/checkout` redirects to `/cart`.
   - A double click places one order.

   Pinned in Task 5 (`Checkout.test.tsx` › "back after placing does not reorder", "double click places one order").

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/features/listing/listingQuery.ts`, `applyListing.ts` | Query-string state; filter, sort, facets |
| `src/hooks/useListingQuery.ts` | The query string as a `ListingQuery`, plus a setter |
| `src/components/listing/{ProductListing,FilterPanel,FilterChips,SortSelect,FilterSheet}.tsx` | The shared listing |
| `src/components/{CartControl,BuyCard,StoreCard,RequireBuyer,ConfirmDialog}.tsx` | Add-to-cart control (from `Buy/Home.tsx`), card, store card, guest guard, yes/no dialog |
| `src/pages/Buy/Home.tsx` (rewrite), `{Category,Search,Product,StorePage,Checkout}.tsx` | Buyer pages |
| `src/pages/Account/{AccountLayout,Overview,Profile,Addresses,AddressForm,Payments,AddCardForm,Orders,OrderPage}.tsx` | Account area |
| `src/features/{cardUtils,checkout,orderView}.ts` | Pure card, checkout and order-view logic |
| `src/utils/validation.ts`, `src/utils/formatWhen.ts` | Shared Yup rules; date formatters (Phase E's signatures) |
| `src/routes/startKey.ts` | Start-page preload key for paths with an id |
| Modify: `ProductCard.tsx`, `accountsSlice.ts`, `cart.ts`, `orderBuild.ts`, `orderActions.ts`, `selectors.ts`, `useBuy.ts`, `Cart.tsx`, `SignUp.tsx`, `useAuth.ts`, `routes/Index.tsx`, `vite.config.ts` | Links, reducers, ordering rules, routes, preload |
| Delete (Task 5): `src/pages/Buy/TrackBought.tsx`, `src/utils/orders.ts` | Replaced by the account order pages |

---

### Task 1 (spec task 7): Store home, category pages and the shared listing

**Files:**
- Create:
  - `src/features/listing/listingQuery.ts`, `applyListing.ts`
  - `src/hooks/useListingQuery.ts`
  - `src/components/listing/*` (5 files)
  - `src/components/CartControl.tsx`, `BuyCard.tsx`, `StoreCard.tsx`
  - `src/pages/Buy/Category.tsx`
  - `src/routes/startKey.ts`
- Modify: `src/pages/Buy/Home.tsx` (rewrite), `src/components/ProductCard.tsx`, `src/features/selectors.ts`, `src/routes/Index.tsx`, `vite.config.ts`, `docs/AI-LOG.md`
- Test:
  - `src/features/listing/__tests__/listingQuery.test.ts`, `applyListing.test.ts`
  - `src/features/__tests__/selectors.test.ts` (add)
  - `src/routes/__tests__/startKey.test.ts`
  - `src/pages/Buy/__tests__/Category.test.tsx`, `Home.test.tsx`

**Interfaces:**
- Consumes:
  - Phase A: `Item`, `Store`, `CategoryId`, `CATEGORIES`, `categoryLabel`, `selectShopItems`, `selectStoresById`, `selectAllOrders`, `selectCart`, `addItemToCart`, `setCartQuantity`, `buildSeed`, `renderWithStore`.
  - Phase B: `ROUTES`, `ROUTE_PATTERNS.category`, `Error404`.
  - Phase C: `useIsPhone`, `media`, `setViewportWidth`, `LocationProbe`.
- Produces:

```ts
// src/features/listing/listingQuery.ts
export type SortId = "best" | "price-asc" | "price-desc" | "newest";
export const SORT_OPTIONS: { id: SortId; label: string }[]; // "Best-selling", "Price low to high", "Price high to low", "Newest"
export interface ListingQuery { q: string; category: CategoryId | null; sort: SortId; min: number | null; max: number | null; stores: string[]; inStock: boolean }
export const EMPTY_QUERY: ListingQuery; // { q: "", category: null, sort: "best", min: null, max: null, stores: [], inStock: false }
export const parseListingQuery: (search: string | URLSearchParams) => ListingQuery;
export const serializeListingQuery: (query: ListingQuery) => string; // no leading "?"; "" when all default
export const clearFilters: (query: ListingQuery) => ListingQuery;    // drops min, max, stores, inStock, category; keeps q, sort
export const activeFilterCount: (query: ListingQuery) => number;     // price range 1, each store 1, inStock 1, category 1
// src/features/listing/applyListing.ts
export interface ListingContext { storesById: Record<string, Store>; unitsSold: Record<string, number> }
export const matchesSearch: (item: Item, storeName: string, q: string) => boolean;
export const applyListing: (items: Item[], query: ListingQuery, ctx: ListingContext) => Item[];
export const facetCounts: (items: Item[], query: ListingQuery, ctx: ListingContext) =>
  { stores: { store: Store; count: number }[]; categories: { id: CategoryId; label: string; count: number }[] };
// src/hooks/useListingQuery.ts
const useListingQuery: () => { query: ListingQuery; setQuery: (next: ListingQuery) => void }; // pushes a history entry
// components
const ProductListing: React.FC<{ items: Item[]; title: string; showStoreFilter?: boolean /* true */; showCategoryFilter?: boolean /* false */ }>;
const CartControl: React.FC<{ item: Item }>;  // today's add → "Added" → stepper; disabled "Sold out" at stock 0 with none in cart
const BuyCard: React.FC<{ item: Item; isPriority?: boolean }>; // ProductCard href={ROUTES.product(id)} + CartControl
const StoreCard: React.FC<{ store: Store; productCount: number }>; // link to ROUTES.store(slug)
// ProductCard gains href?: string
// src/features/selectors.ts
selectUnitsSoldByItem(state): Record<string, number>    // units on order lines whose shipment isn't "cancelled"
selectCategoryCounts(state): Record<CategoryId, number> // active items per category, sold out included
// selectStores(state): Store[] comes from Phase A; reuse it, don't redefine
selectNewArrivals(state): Item[]                        // active, in stock, newest createdAt first, first 8
// src/routes/startKey.ts
export const startKey: (pathname: string) => string;    // trims "/" end; /c/x → "/c/*", /p/x, /store/x, /account/orders/x likewise
```

**Query-string contract:**
- **Param names, in canonical write order:** `q`, `category`, `sort`, `min`, `max`, `store`, `instock`. Default values are never written.
- **`q`:** trimmed, cut to 100 characters, and written with `encodeURIComponent`.
- **`category`:** a `CategoryId`, else `null`.
- **`sort`:** one of the 4 ids, else `"best"`.
- **`min`/`max`:**
  - Each must match `/^\d+(\.\d{1,2})?$/`, else it becomes `null`.
  - They are swapped when min > max.
- **`store`:**
  - A comma list. Repeated params are also read.
  - Each slug must match `/^[a-z0-9]+(-[a-z0-9]+)*$/`.
  - The list is deduplicated and sorted A–Z.
  - Commas are written unencoded.
  - Well-formed but unknown slugs survive parsing. `applyListing` and the chips ignore any slug that isn't in `ctx.storesById`.
- **`instock`:** `"1"` → true.

**Listing contract:**
- **Filters, in this order:** `q`, category, price, known stores, `inStock`.
  - Sold-out items show unless `inStock` is set. Today's Buy page hides them.
- **Sorts:**
  - `best`: `unitsSold[id] ?? 0`, highest first.
  - `price-asc` / `price-desc`: by price.
  - `newest`: `createdAt`, newest first.
  - Every sort breaks ties by `name` (`localeCompare` with `"en"`), then by `id`.
- **`matchesSearch`:** lower-cased whitespace terms. Every term must appear in `name description storeName`. An empty `q` matches everything.
- **Facets:**
  - Stores: every store that keeps at least one item after the `q` filter, sorted by name.
  - Categories: in `CATEGORIES` order, with any at 0 left out.
  - Each count applies every filter except its own.

- [ ] **Step 1: Write the failing pure tests**

`listingQuery.test.ts`:
```ts
it("reads the spec example", () => expect(parseListingQuery("?sort=price-asc&store=tick-tock")).toEqual({ ...EMPTY_QUERY, sort: "price-asc", stores: ["tick-tock"] }));
it("junk falls back to defaults", () => expect(parseListingQuery("?min=abc&max=-5&sort=zzz&store=%25%25&instock=yes&category=shoes")).toEqual(EMPTY_QUERY));
it("min above max is swapped", () => expect(parseListingQuery("?min=100&max=20")).toMatchObject({ min: 20, max: 100 }));
it("stores: comma list and repeats, deduped and sorted", () => expect(parseListingQuery("?store=tick-tock,carry-co&store=tick-tock").stores).toEqual(["carry-co", "tick-tock"]));
it("writes canonical order and omits defaults", () =>
  expect(serializeListingQuery({ q: "a b", category: "audio", sort: "newest", min: 10, max: 50.5, stores: ["carry-co", "tick-tock"], inStock: true }))
    .toBe("q=a%20b&category=audio&sort=newest&min=10&max=50.5&store=carry-co,tick-tock&instock=1"));
it("empty query serializes to an empty string", () => expect(serializeListingQuery(EMPTY_QUERY)).toBe(""));
it("round-trips", () => QUERIES.forEach((q) => expect(parseListingQuery(serializeListingQuery(q))).toEqual(q))); // 6 queries, every field used
```

`applyListing.test.ts` runs on `buildSeed(0)`. It looks items up by name and computes `unitsSold` from the seed orders.
- **"best-selling watches":** the names come out as `["Kids' digital watch", "Diver watch, steel", "Field watch, 38 mm", "Minimal quartz watch", "Smart watch", "Chronograph, leather strap"]`.
- **"price sorts":** price-asc gives `[24, 59, 95, 129, 159, 189]`. Price-desc starts with "Diver watch, steel".
- **"newest uses createdAt, ties by name":** a 3-item fixture.
- **"price range and stock":** bags with min 30 and max 90 give 4 items (City backpack, Laptop sleeve, Crossbody sling, Hiking daypack). Adding `inStock` gives 3.
- **"unknown store slug is ignored":** watches with `["nope"]` give 6.
- **"store facet counts":**
  - Accessories give tick-tock 2, carry-co 2, pocket-signal 3.
  - With `inStock`, pocket-signal drops to 2.
  - With `stores: ["carry-co"]`, the counts are unchanged.
- **"matchesSearch":** matches a description word, matches the store name, ignores case, and "red bag" needs both terms.

Selectors:
- `selectUnitsSoldByItem`:
  - The mug (`item-hl-ceramic-mug`) is 4.
  - The values sum to 27.
  - `item-ps-headphones` is absent.
  - A cancelled-shipment fixture adds nothing.
- `selectCategoryCounts` gives `{ watches: 6, bags: 6, phones: 2, audio: 3, "home-kitchen": 6, accessories: 7 }`.
- `selectNewArrivals` gives 8 items, all with stock above 0, with `createdAt` never increasing.

`startKey.test.ts`:
- `"/c/watches/"` gives `"/c/*"`.
- `"/account/orders/abc"` gives `"/account/orders/*"`.
- `"/account/orders"` and `"/"` come back unchanged.

- [ ] **Step 2: Run them to verify they fail, then implement both listing modules, the selectors and `startKey`**

Run: `npx vitest run src/features src/routes`. Expected: FAIL (the modules are missing), then PASS. `selectUnitsSoldByItem` is memoised on `selectAllOrders`.

- [ ] **Step 3: Write the failing component tests**

`Category.test.tsx` renders the category route and a `LocationProbe` through `renderWithStore`:
- **"junk query renders the default listing":** at `/c/watches?min=abc&sort=zzz`, the heading is "Watches", the count reads "6 results", the first card is Kids' digital watch, and there are no chips.
- **"wide: filters apply at once":** with `setViewportWidth(1280)` at `/c/accessories`, ticking "In stock only" gives:
  - the location `?instock=1`;
  - "6 results";
  - the chip "In stock only";
  - the store option "Pocket Signal (2)".
- **"chips and Clear all":** at `/c/bags?min=30&max=90&instock=1&sort=price-asc`, the chips read "$30 to $90" and "In stock only".
  - The price chip's × leaves `?sort=price-asc&instock=1`.
  - "Clear all" leaves `?sort=price-asc`.
- **"sort dropdown shows the active choice":** at `?sort=price-desc`, the combobox "Sort by" shows "Price high to low". Choosing "Newest" writes `sort=newest`.
- **"phone panel counts as you choose":** with `setViewportWidth(360)` at `/c/accessories`:
  - "Filter and sort" opens a dialog with the button "Show 7 results".
  - Ticking "In stock only" changes it to "Show 6 results", and the location stays the same.
  - The button applies `?instock=1` and closes the dialog.
  - Closing with × discards the change.
- **"unknown category is a 404":** `/c/shoes` shows "Page not found".

`Home.test.tsx` renders `<Home/>` alone (no layout, so Phase C's header links don't count):
- The hero `<img>` has `fetchpriority="high"`.
- 6 links go to `/c/<id>`, and the Watches tile reads "6 products".
- 4 links go to `/store/<slug>`, and Hearth Lane reads "6 products".
- "New arrivals" shows 8 cards, and their names link to `/p/<id>`.

- [ ] **Step 4: Run them to verify they fail, then build the components, `Category` and the store home**

- **`CartControl`:**
  - Takes today's `BuyCard` logic out of `pages/Buy/Home.tsx`: "Added" for 1200 ms, the focus hand-off, and the live-region text.
  - Reads the quantity with `selectCart`.
- **`ProductCard` with `href`:**
  - The name becomes a router `Link`.
  - The picture is wrapped in the same link with `tabIndex={-1}` and `aria-hidden`, so there is one tab stop per card.
- **`ProductListing`:**
  - A header: the h2 title, then "N results" ("1 result"), then `SortSelect` (an MUI `TextField select` labelled "Sort by").
  - `FilterChips` labels: "$30 to $90", "From $30", "Up to $90", the store name, "In stock only", and the category label. Each chip has an ×, and "Clear all" follows the chips.
  - Today's grid of `BuyCard`s, with the first 4 marked `isPriority`.
  - When nothing matches: `EmptyState` "No products match" with a "Clear all filters" button.
- **Wide screens:** `FilterPanel` is a 240 px left column.
  - Every change calls `setQuery` straight away.
  - The price fields commit on blur or Enter.
- **Phones:**
  - A sticky "Filter and sort" button sits at the bottom, with " (N)" added when filters are active.
  - It opens `FilterSheet`, an MUI `Dialog fullScreen` styled like `AppDialog`.
  - The sheet holds a draft: the sort as radios, and `FilterPanel` bound to the draft.
  - Its footer has "Clear all" and "Show N results", where N = `applyListing(items, draft, ctx).length`.
- **`FilterPanel`:**
  - Price: "Min" and "Max" fields with a `$` adornment.
  - Store: checkboxes labelled "Name (count)". A store at 0 is disabled unless it is checked.
  - "In stock only".
  - With `showCategoryFilter`: a radio group of "All categories" plus each category with its count.
- **`Category`:** an unknown `:category` renders `<Error404/>`. Otherwise it lists the category's `selectShopItems`, with the title and document title from `categoryLabel`.
- **`Home`** (document title "Shop"):
  - **Hero:** a `<picture>` of `buy-640/900/1200` in AVIF and WebP, with `sizes={HERO_SIZES}` (`"100vw"`), eager loading and `fetchpriority="high"`. Over it:
    - the h2 "Four small stores, one cart";
    - the text "Watches, bags, phones and home goods from independent sellers. A demo: no payment is taken.";
    - the button "Shop all products" to `ROUTES.search()`.
  - **"Shop by category":** 6 tiles. Each has the label, "N products" (`selectCategoryCounts`), and the picture of that category's best-selling in-stock item.
  - **"Our stores":** a `StoreCard` per store.
  - **"New arrivals":** `selectNewArrivals`, plus "See all" to `ROUTES.search() + "?sort=newest"`.

- [ ] **Step 5: Routes and preload**

- **Route:** `c/:category` → `Category`.
- **`START_CODE`:**
  - Look keys up with `startKey(location.pathname)`.
  - Add `"/c/*"` → buyerLayout + category.
- **`vite.config.ts`:**
  - Add `ROUTE_SOURCES["/c/*"] = ["layout/BuyerLayout.tsx", "pages/Buy/Category.tsx"]`.
  - Copy `startKey`'s regexes into the inline script (comment "must match src/routes/startKey.ts").
  - Re-add `HERO_SIZES = "100vw"` (comment "must match src/pages/Buy/Home.tsx").
  - On `/`, preload only the `buy` AVIF srcset.
  - The first-product preload runs only on `/seller/products`.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 6: Check by hand and commit**

At 360 px and 1280 px:
- All four home sections.
- Watches → "Price low to high" → tick Tick & Tock → refresh: the choices are kept. Back undoes the last change.
- The phone panel.
- On a fresh `/`, the hero AVIF preloads with `fetchpriority=high`.

Add `## 17. Store home and category pages: sort, filters, chips, query-string state (Claude Code)`.
```bash
git add -A && git commit -m "Add the store home and category pages with sort, filters and chips in the query string"
```

---

### Task 2 (spec task 8): Search, product page, store page

**Files:**
- Create: `src/pages/Buy/Search.tsx`, `Product.tsx`, `StorePage.tsx`
- Modify: `src/features/selectors.ts`, `src/routes/Index.tsx`, `vite.config.ts`, `docs/AI-LOG.md`
- Test: `selectors.test.ts` (add), `src/pages/Buy/__tests__/Search.test.tsx`, `Product.test.tsx`, `StorePage.test.tsx`

**Interfaces:**
- Consumes:
  - Task 1: `ProductListing`, `CartControl`, `BuyCard`, `applyListing`, `selectUnitsSoldByItem`, `startKey`.
  - Phases A/B: `selectShopItems`, `ROUTE_PATTERNS.product` / `.store`. Existing app code: `Error404`, `LOW_STOCK` (`src/constant/stockConstant.ts`).
- Produces:

```ts
selectShopItem(state, itemId: string): Item | null   // only when status is "active"
selectStoreBySlug(state, slug: string): Store | null
selectStoreItems(state, storeId: string): Item[]     // that store's active items
```

- [ ] **Step 1: Write the failing tests**

**Selectors:**
- `selectShopItem(seed, "item-tt-smart-watch")?.name` is "Smart watch". The same item as a draft gives `null`.
- `selectStoreBySlug(seed, "carry-co")?.name` is "Carry Co.". `"nope"` gives `null`.
- `selectStoreItems(seed, "store-hearth-lane")` has 6 items.

**`Search.test.tsx`** (these are the params Phase C's header sends):
- `?q=hearth` gives "6 results" (the store name matches).
- `?q=skillet` gives "1 result".
- `?category=audio` gives "3 results" and the chip "Audio".
- No query gives the title "All products" and "30 results".
- `?q=zzzz` shows "No products match".
- On a wide screen the facet shows "Audio (3)".

**`Product.test.tsx`** at `/p/item-tt-smart-watch`:
- The h2 "Smart watch", "$129", the chip "Only 2 left", and the description.
- "Sold by Tick & Tock", linking to `/store/tick-tock`.
- "Add to cart" sets `selectCartCount` to 1. "One more" stops at 2.
- "More from Tick & Tock" shows 4 cards, without Smart watch.
- **"draft and missing items are a 404":** the item as a draft, as archived, and `/p/nope` all show "Page not found".
- On "Chronograph, leather strap", "Sold out" is disabled.

**`StorePage.test.tsx`:**
- `/store/tick-tock` shows the h2 "Tick & Tock", the tagline, a "Since …" line, "8 results", and no Store filter.
- `/store/nope` shows "Page not found".

- [ ] **Step 2: Run them to verify they fail, then implement**

- **`Search`:**
  - Title: `Results for "<q>"`, or "All products" when there is no `q`.
  - Lists all `selectShopItems`, with `showCategoryFilter` on.
  - Document title "Search".
- **`Product`:**
  - When `selectShopItem` gives `null`, render `<Error404/>`.
  - Two columns on wide screens, one on phones. In order:
    1. the picture (eager, `fetchpriority="high"`);
    2. the h2 name;
    3. the price;
    4. the stock chip, with `ProductCard`'s labels: "Sold out", "Only N left" (at or under `LOW_STOCK`), "N in stock";
    5. the description;
    6. "Sold by <store link>";
    7. `CartControl`.
  - "More from <store>": the store's other active items, Best-selling, the first 4, as `BuyCard`s.
  - Document title: the item name.
- **`StorePage`:**
  - When `selectStoreBySlug` gives `null`, render `<Error404/>`.
  - The banner is the store's picture, or a `logoColor` band with the logo letter.
  - The h2 name, the tagline, and "Since " + `toLocaleDateString("en", { month: "long", year: "numeric" })`.
  - `ProductListing` over `selectStoreItems`, with `showStoreFilter={false}` and the title "Products".
- **Routes:** `search`, `p/:itemId` and `store/:slug` replace their `ComingSoon`.
- **Preload keys:** `"/search"`, `"/p/*"`, `"/store/*"`.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 3: Check by hand and commit**

At 360 px and 1280 px: search "watch" → Diver watch → Sold by → store page → In stock only → Back twice. The search results are unchanged.

Add `## 18. Search, product page and store page (Claude Code)`.
```bash
git add -A && git commit -m "Add search, the product page and store pages on the shared listing"
```

---

### Task 3 (spec task 9): Account area and addresses

**Files:**
- Create:
  - `src/components/RequireBuyer.tsx`, `ConfirmDialog.tsx`
  - `src/pages/Account/{AccountLayout,Overview,Profile,Addresses,AddressForm}.tsx`
  - `src/utils/validation.ts`, `formatWhen.ts`
- Modify: `src/features/accountsSlice.ts`, `src/pages/SignUp.tsx`, `src/hooks/useAuth.ts`, `src/routes/Index.tsx`, `vite.config.ts`, `docs/AI-LOG.md`
- Test:
  - `src/features/__tests__/addresses.test.ts`
  - `src/components/__tests__/RequireBuyer.test.tsx`
  - `src/pages/Account/__tests__/{Addresses,AddressForm,Profile}.test.tsx`
  - `src/pages/__tests__/SignUp.test.tsx`

**Interfaces:**
- Consumes:
  - Phase A: `Address`, `selectActiveBuyer`, `selectBuyerAccounts`, `selectOrdersForBuyer`.
  - Phase B: `LoginDialog` (`isOpen`, `onClose`), `useAuth().carryText`, `ROUTE_PATTERNS`.
  - Phase C: `selectDefaultAddress`, `media.phone`.
  - Existing: `EmptyState`, `AppDialog`, `TextFiled`, `useNotification().showNotification`.
- Produces:

```ts
// src/features/accountsSlice.ts: each is a no-op when buyerId isn't a buyer or the id is unknown
export type AddressFields = Omit<Address, "id" | "isDefault">;
addAddress(buyerId: string, fields: AddressFields, makeDefault?: boolean) // prepare → { buyerId; address /* id "addr-" + uuid */; makeDefault }; first address is always default
updateAddress(payload: { buyerId: string; id: string; changes: Partial<AddressFields> }) // never touches id or isDefault
removeAddress(payload: { buyerId: string; id: string })   // a removed default passes to the first remaining address
setDefaultAddress(payload: { buyerId: string; id: string })
renameBuyer(payload: { buyerId: string; name: string })   // trimmed
// invariant: a buyer with ≥1 address has exactly one isDefault
// src/utils/validation.ts
export const nameRule: (isTaken: (name: string) => boolean) => yup.StringSchema; // today's SignUp userName rule
export const line1Rule, line2Rule, cityRule, zipCodeRule, phoneRule: yup.StringSchema;
export const addressSchema: yup.ObjectSchema<AddressFields>;
// src/utils/formatWhen.ts (Phase E's exact signatures; Phase E reuses the file)
export const formatDateTime: (at: number) => string; // "Nov 13, 14:05"
export const formatDay: (at: number) => string;      // "Nov 13, 2026"
// src/components/ConfirmDialog.tsx (Phase E's exact signature)
const ConfirmDialog: React.FC<{ isOpen: boolean; onClose: () => void; title: string; subtitle?: string; text: React.ReactNode; confirmLabel: string; cancelLabel?: string /* "Cancel" */; tone?: "error" | "primary"; onConfirm: () => void }>;
const RequireBuyer: React.FC<{ title?: string /* "Log in to see your account" */; text?: string; children: React.ReactNode }>;
const AddressForm: React.FC<{ initial?: AddressFields; submitLabel: string; showMakeDefault?: boolean; onSubmit: (values: AddressFields, makeDefault: boolean) => void; onCancel: () => void }>;
```

Address fields. The ZIP, phone and line rules move out of `SignUp.tsx` unchanged:

| Field | Label | Rule and messages |
| --- | --- | --- |
| `label` | Label (Home, Work) | trim; required "Enter a label"; max 20 "20 characters at most" |
| `name` | Full name | trim; required "Enter the full name"; 2–40 |
| `line1` | Address line 1 | required "Enter a delivery address"; min 5 "At least 5 characters" |
| `line2` | Address line 2 (optional) | max 60 "60 characters at most" |
| `city` | City | trim; required "Enter a city"; 2–40 |
| `zipCode` | ZIP code | required "Enter a ZIP code"; `/^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/` "Enter a valid ZIP code" |
| `phoneNum` | Phone | required "Enter a phone number"; `/^\+?[\d\s()-]+$/` "Digits, spaces, + ( ) - only"; ≥7 digits "At least 7 digits" |

- [ ] **Step 1: Write the failing reducer tests**

`addresses.test.ts` runs on `buildSeed(0)` and finds Ahmed's addresses by `label`:
- **"removeAddress of the default promotes the first remaining":** removing Home makes Work the default.
- **"addAddress with makeDefault moves the default".**
- **"the first address becomes default":** after both are removed, an add with `makeDefault: false` is still the default.
- **"updateAddress never changes id or isDefault":** `{ city: "Giza", isDefault: false } as any` on Home sets the city, and Home stays the default.
- **"exactly one default after any sequence":** add ×2, setDefault, remove default, update, remove. After every step, a non-empty book has exactly one default.
- **"unknown buyer or id is a no-op":** `acc-mona` and `"addr-nope"` leave the state the same by reference.
- **"renameBuyer trims":** `"  Ahmed H "` becomes `"Ahmed H"`.

- [ ] **Step 2: Run them to verify they fail, then implement the reducers**

Run: `npx vitest run src/features/__tests__/addresses.test.ts`. Expected: FAIL, then PASS.

- [ ] **Step 3: Write the failing page tests**

**`RequireBuyer.test.tsx`** (a guest at `/account/addresses`):
- the heading "Log in to see your account", a "Log in" button, and a "Create an account" link to `/sign-up`;
- Log in → Ahmed leads to "Your addresses" at the same path.

**`Addresses.test.tsx`** (as Ahmed):
- 2 cards, each with a visible "Edit", and one "Add an address".
- "Default" on Home, and "Make default" only on Work.
- Editing Work's city to Cairo saves it and shows "Address saved".
- Remove on Home → "Remove this address?" → "Remove". Work is now "Default".

**`AddressForm.test.tsx`:**
- An empty submit shows the six "Enter …" messages from the table.
- The phone "12345" gives "At least 7 digits".
- The ZIP "!!" gives "Enter a valid ZIP code".

**`Profile.test.tsx`:**
- The name "omar" gives "That name is taken, pick another".
- "Ahmed H" saves and shows "Profile saved".

**`SignUp.test.tsx`:** the form has a "City" field. Signing up with "Giza" gives a first address of `{ city: "Giza", label: "Home", isDefault: true }`.

- [ ] **Step 4: Run them to verify they fail, then build the pages**

- **Routes:** Phase B's flat `account/*` routes become `<Route path="account" element={<RequireBuyer><AccountLayout/></RequireBuyer>}>`, with these children:
  - `index` → `Overview`;
  - `addresses` → `Addresses`;
  - `profile` → `Profile`;
  - `orders`, `ROUTE_PATTERNS.accountOrder` and `payments` keep their current element until Tasks 4–5;
  - `saved` stays `ComingSoon` (Phase F).
- **`RequireBuyer`** (no buyer signed in): an `EmptyState` with:
  - `title`;
  - `text` (default "Pick a demo buyer or create an account. There's no password.");
  - "Log in", which opens `LoginDialog`;
  - a "Create an account" link to `ROUTES.signUp` with `state={{ from: pathname }}`.
- **`AccountLayout`:**
  - Wide: a 220 px left nav with "Overview", "Orders", "Your addresses", "Payment methods" and "Profile" (`NavLink`, `aria-current="page"`).
  - Under `media.phone`: the same links in a wrapping row above the `<Outlet/>`.
- **`Overview`** (document title "Your account"): "Hello, <name>", then tiles linking to:
  - Orders: the count and the latest number;
  - Your addresses: "Home: 14 Nile Street, Cairo";
  - Payment methods: "Manage cards and cash on delivery";
  - Profile.
- **`Addresses`** (h2 and document title "Your addresses"):
  - **Cards:** the label, name, lines, "city ZIP", phone, and the "Default" chip.
  - **Card buttons:** "Edit", "Remove", and "Make default" when the address isn't the default.
  - **"Add an address"** is an outlined button above the list, the same weight as Edit.
  - **Add and Edit** open `AppDialog` ("Add an address" / "Edit address") with `AddressForm`. Add also offers "Make this my default address".
  - **Remove** uses `ConfirmDialog`:
    - title "Remove this address?";
    - text "<label>: <line1>. Past orders keep their own copy.";
    - confirm "Remove", cancel "Keep it".
  - **Toasts:** "Address saved", "Address removed".
  - **No addresses:** "No saved addresses".
- **`Profile`:** the name uses `nameRule`, unique among the other buyers. It shows "Member since " + `formatDay(createdAt)`. Save calls `renameBuyer`.
- **`SignUp`:** imports its rules from `validation.ts`, and adds "City" after the address lines.
  - `SignUpFields` gains `city`.
  - `useAuth.signUp` maps it to the first address, replacing Phase A's `""`.
- **Preload keys:** `"/account"`, `"/account/addresses"`.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 5: Check by hand and commit**

At 360 px:
- As a guest, `/account` → Log in → Ahmed: the overview.
- Edit an address, add one as default, remove the default, refresh: the changes are kept.
- Sign up with a city: Phase C's header shows "Ship to <city>".

Add `## 19. Account area and your addresses (Claude Code)`.
```bash
git add -A && git commit -m "Add the account area and saved addresses with one default"
```

---

### Task 4 (spec task 10): Payment methods

**Files:**
- Create: `src/features/cardUtils.ts`, `src/pages/Account/Payments.tsx`, `AddCardForm.tsx`
- Modify: `src/features/accountsSlice.ts`, `selectors.ts`, `src/hooks/useAuth.ts` (only if Phase A's sign-up leaves out `cod`), `src/pages/Account/Overview.tsx`, `src/routes/Index.tsx`, `vite.config.ts`, `docs/AI-LOG.md`
- Test: `src/features/__tests__/cardUtils.test.ts`, `payments.test.ts`, `src/pages/Account/__tests__/AddCardForm.test.tsx`, `Payments.test.tsx`

**Interfaces:**
- Consumes:
  - Phase A: `PaymentMethod`, `CardBrand`, `selectActiveBuyer`, `saveState`.
  - Task 3: the account routes, `ConfirmDialog`.
- Produces:

```ts
// src/features/cardUtils.ts (pure)
export const CARD_BRAND_LABEL: Record<CardBrand, string>; // "Visa", "Mastercard", "American Express"
export const CARD_LENGTHS: Record<CardBrand, number[]>;   // visa [13, 16, 19], mastercard [16], amex [15]
export const CVV_LENGTH: Record<CardBrand, number>;       // 3, 3, 4
export const TEST_CARDS: { brand: CardBrand; number: string }[]; // "4242 4242 4242 4242", "5555 5555 5555 4444"
export const detectBrand: (number: string) => CardBrand | null; // 4 visa; 51–55, 2221–2720 mastercard; 34, 37 amex
export const luhnValid: (number: string) => boolean;           // non-digits stripped; "" false
export const parseExpiry: (text: string) => { month: number; year: number } | null; // "MM/YY", "MM / YY", "MMYY" → 20YY
export const isExpired: (expMonth: number, expYear: number, now: number) => boolean; // good through the month's last day (local)
export const formatCardNumber: (number: string) => string;     // 4-4-4-4…; amex 4-6-5; at most 19 digits
export const formatExpiry: (expMonth: number, expYear: number) => string; // "12/28"
export const paymentLabel: (method: PaymentMethod) => string; // "Visa ending 4242" | "Cash on delivery"
export interface CardFormValues { number: string; holder: string; expiry: string; cvv: string; nickname: string; makeDefault: boolean }
export interface NewCard { brand: CardBrand; last4: string; expMonth: number; expYear: number; holder: string; nickname?: string }
export const toSavedCard: (values: CardFormValues) => NewCard; // field by field, never spreads values
// src/features/accountsSlice.ts
addPaymentMethod(buyerId: string, card: NewCard, makeDefault?: boolean) // prepare → { buyerId; method /* id "pm-" + uuid, kind "card", NewCard fields copied one by one */; makeDefault }
updatePaymentMethod(payload: { buyerId: string; id: string; changes: { nickname: string } }) // trimmed, max 24; "" deletes the key; "cod" ignored
removePaymentMethod(payload: { buyerId: string; id: string }) // "cod" can't be removed; a removed default passes to "cod"
setDefaultPaymentMethod(payload: { buyerId: string; id: string })
selectDefaultPaymentMethod(state): PaymentMethod | null // the active buyer's
```

| Field | Messages |
| --- | --- |
| Card number | "Enter the card number" · "Use a Visa, Mastercard or American Express card" · "Check the number of digits" · "Check the card number" (Luhn) |
| Name on card | "Enter the name on the card" (2–40) |
| Expiry (MM/YY) | "Enter the expiry date" · "Use MM/YY" · "That card has expired" · "Check the year" (over 20 years ahead) |
| Security code | "Enter the security code" · "Use the 3 digits on the back" / "Use the 4 digits on the front" (Amex) |
| Nickname (optional) | max 24 |

- [ ] **Step 1: Write the failing `cardUtils` tests (vectors checked with a Luhn one-liner)**

```ts
it.each([["4242424242424242", true], ["4242 4242 4242 4242", true], ["4242424242424241", false], ["5555555555554444", true], ["2223003122003222", true],
  ["378282246310005", true], ["4000000000000002", true], ["1234567812345678", false], ["", false], ["abcd", false]])("luhnValid(%s) is %s", (n, ok) => expect(luhnValid(n)).toBe(ok));
it.each([["4242424242424242", "visa"], ["5105105105105100", "mastercard"], ["5555555555554444", "mastercard"], ["2221000000000000", "mastercard"],
  ["2720990000000000", "mastercard"], ["2220990000000000", null], ["2721000000000000", null], ["5000000000000000", null], ["5600000000000000", null],
  ["378282246310005", "amex"], ["341111111111111", "amex"], ["351111111111111", null], ["6011111111111117", null], ["", null]])("detectBrand(%s) is %s", (n, b) => expect(detectBrand(n)).toBe(b));
it("isExpired: good through the end of the month", () => {
  const nov13 = new Date(2026, 10, 13).getTime();
  expect(isExpired(11, 2026, nov13)).toBe(false); expect(isExpired(10, 2026, nov13)).toBe(true);
  expect(isExpired(11, 2026, new Date(2026, 11, 1).getTime())).toBe(true); expect(isExpired(12, 2026, nov13)).toBe(false);
});
it("parseExpiry", () => { expect(parseExpiry("12/28")).toEqual({ month: 12, year: 2028 }); expect(parseExpiry("0128")).toEqual({ month: 1, year: 2028 });
  expect(parseExpiry("13/28")).toBeNull(); expect(parseExpiry("00/28")).toBeNull(); expect(parseExpiry("1/2")).toBeNull(); });
it("formatCardNumber", () => { expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
  expect(formatCardNumber("378282246310005")).toBe("3782 822463 10005"); expect(formatCardNumber("42424")).toBe("4242 4"); });
it("paymentLabel", () => { expect(paymentLabel({ id: "x", kind: "card", brand: "mastercard", last4: "4444", isDefault: false })).toBe("Mastercard ending 4444");
  expect(paymentLabel({ id: "cod", kind: "cod", isDefault: true })).toBe("Cash on delivery"); });
it("toSavedCard keeps only the allowed fields", () => expect(Object.keys(toSavedCard({ number: "4242 4242 4242 4242", holder: " Nour Adel ",
  expiry: "12/30", cvv: "123", nickname: "", makeDefault: false })).sort()).toEqual(["brand", "expMonth", "expYear", "holder", "last4"]));
```

- [ ] **Step 2: Write the failing reducer tests**

`payments.test.ts` runs on the seed, and finds Nour's cards by `last4` and nickname:
- **"addPaymentMethod copies only allowed fields":** with `{ ...card, number: "4242424242424242", cvv: "123" } as any`, the stored method has exactly `id, kind, brand, last4, expMonth, expYear, holder, isDefault`.
- **"cod can't be removed":** Nour keeps 3 methods.
- **"removing the default card hands default to cod":** removing Visa 4242 makes `cod` the default.
- **"setDefault":** exactly one default.
- **"rename":**
  - `"  Travel  "` is stored as `"Travel"`.
  - `""` deletes the `nickname` key.
- **"sign-up comes with cash on delivery":** a new `useAuth.signUp` buyer has `[{ id: "cod", kind: "cod", isDefault: true }]`.

- [ ] **Step 3: Run them to verify they fail, then implement `cardUtils.ts`, the reducers and the selector**

Run: `npx vitest run src/features`. Expected: FAIL, then PASS.

- [ ] **Step 4: Write the failing form and page tests**

`AddCardForm.test.tsx` (Nour, on `buildSeed(0)` so the seed timestamps stay short):
- **"the number and CVV never reach the store":** type `4242 4242 4242 4242`, "Nour Adel", `12/39`, `123`, then Save. Then all of these hold:
  - `JSON.stringify(store.getState())` contains neither `4242424242424242` nor `4242 4242 4242 4242`;
  - `JSON.stringify(nour.paymentMethods)` matches no `/\d{13,19}/`;
  - no method has a `number`, `cvv` or `cvc` key;
  - after `saveState(store.getState())`, `localStorage` holds no `4242424242424242`;
  - the number field is empty.
- **Brand while typing:** "Visa" after `4`, "American Express" after `37`.
- **One case per message:**
  - `4242 4242 4242 4241` → "Check the card number";
  - `6011 1111 1111 1117` → "Use a Visa, Mastercard or American Express card";
  - `4242 4242 42` → "Check the number of digits";
  - `10/20` → "That card has expired";
  - `13/30` → "Use MM/YY";
  - an Amex with `123` → "Use the 4 digits on the front".
- **Test numbers:** the help text names both numbers, and "Use test Visa" fills `4242 4242 4242 4242`.

`Payments.test.tsx` (Nour, on `buildSeed(Date.now())` so the seeded cards aren't expired against the page's clock):
- "Visa ending 4242, expires <MM/YY>" shows with "Default".
- "Work card" sits above "Mastercard ending 4444".
- "Cash on delivery" has no Remove or Rename.
- An expired fixture card shows "Expired" and no "Make default".
- Rename → "Travel".
- Remove the Visa → confirm → "Cash on delivery" is "Default".

- [ ] **Step 5: Build `AddCardForm` and `Payments`**

- **`AddCardForm`** (Formik, local state only):
  - **Number field:** `inputMode="numeric"`, `autoComplete="off"` (so browsers don't offer real saved cards), displayed through `formatCardNumber`, with the brand label as its end adornment.
  - **Other fields:** "Name on card", "Expiry (MM/YY)", "Security code" (`autoComplete="off"`), "Nickname (optional)", and "Make this my default payment method".
  - **Help text:** "Demo store: use a test card such as 4242 4242 4242 4242 (Visa) or 5555 5555 5555 4444 (Mastercard). Never a real card.", with the text buttons "Use test Visa" and "Use test Mastercard".
  - **Submit:** dispatch `addPaymentMethod(buyerId, toSavedCard(values), values.makeDefault)`, then `resetForm()` (Risks: Card fields), then `onDone(action.payload.method.id)`.
  - **Props:** `{ onDone: (methodId: string) => void; onCancel: () => void }`.
- **`Payments`** (h2 and document title "Payment methods"):
  - **First row:** "Cash on delivery", with the text "Pay when it arrives".
  - **Each card row:**
    - the nickname in bold, when set;
    - `paymentLabel` + ", expires " + `formatExpiry`;
    - the holder;
    - the chips "Default" and "Expired".
  - **Card buttons:**
    - "Make default", hidden on expired cards and on the default;
    - "Rename", an `AppDialog` with one field;
    - "Remove", through `ConfirmDialog` "Remove this card?".
  - **"Add a card":** opens `AddCardForm` in an `AppDialog`.
  - **Toasts:** "Card saved", "Card removed".
- **Overview:** the Payment methods tile shows the default's `paymentLabel`.
- **Route:** `account/payments` → `Payments`.
- **Preload key:** `"/account/payments"`.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 6: Check by hand and commit**

At 360 px, as Nour:
- Add `5555 5555 5555 4444` and refresh. DevTools → Local Storage holds no `5555555555554444`.
- Rename the card, make it the default, then remove it.

Add `## 20. Payment methods: cards (brand, last 4, expiry only) and cash on delivery (Claude Code)`.
```bash
git add -A && git commit -m "Add payment methods: saved cards without the number or CVV, and cash on delivery"
```

---

### Task 5 (spec task 11): Checkout and buyer orders

**Files:**
- Create:
  - `src/features/checkout.ts`, `orderView.ts`
  - `src/pages/Buy/Checkout.tsx`
  - `src/pages/Account/Orders.tsx`, `OrderPage.tsx`
- Modify:
  - `src/features/cart.ts`, `orderBuild.ts`, `orderActions.ts`, `__tests__/slices.test.ts`
  - `src/pages/Buy/useBuy.ts`, `Cart.tsx`
  - `src/routes/Index.tsx`, `vite.config.ts`, `docs/AI-LOG.md`
- Delete: `src/pages/Buy/TrackBought.tsx`, `src/utils/orders.ts`. Before deleting, `grep -rn "utils/orders" src` must show only those files and `Cart.tsx`.
- Test:
  - `src/features/__tests__/checkout.test.ts`, `orderView.test.ts`, `orderBuild.test.ts` (add), `slices.test.ts`
  - `src/pages/Buy/__tests__/Checkout.test.tsx`, `Cart.test.tsx`
  - `src/pages/Account/__tests__/Orders.test.tsx`, `OrderPage.test.tsx`

**Interfaces:**
- Consumes:
  - Phase A: `placeOrder`, `buildOrder`, `effectiveStatus`, `orderSummaryStatus`, `OrderStatus`, `selectOrdersForBuyer`, `selectCart`, `selectItemsById`, `selectStoresById`, `lineKey`, `updateItem`. Existing app code: `useNow` (`src/hooks/useNow.ts`).
  - Tasks 3–4: `RequireBuyer`, `AddressForm`, `removeAddress`, `addressSchema`, `AddCardForm`, `paymentLabel`, `isExpired`, `formatDateTime`, `formatDay`.
- Produces:

```ts
// src/features/cart.ts (CartRow moves here from useBuy and gains `problem`)
export type CartProblem = "inactive" | "sold-out" | "short" | null;
export interface CartRow { item: Item; quantity: number; orderableNum: number; problem: CartProblem }
export const joinCart: (cart: CartLine[], itemsById: Record<string, Item>) => CartRow[];
  // missing item dropped; status ≠ active → 0 "inactive"; stock 0 → 0 "sold-out"; stock < qty → stock "short"
// src/features/checkout.ts
export const isAddressComplete: (a: Address) => boolean; // addressSchema.isValidSync (old sign-ups have city "")
export const isUsablePayment: (m: PaymentMethod, now: number) => boolean; // cod, or an unexpired card
export const pickAddress: (addresses: Address[], pickedId: string | null) => Address | null; // picked if complete → default if complete → first complete → null
export const pickPayment: (methods: PaymentMethod[], pickedId: string | null, now: number) => PaymentMethod; // picked if usable → default if usable → "cod"
export interface CheckoutGroup { store: Store; rows: CartRow[]; itemsTotal: number; deliveryFee: number /* the same rule as Phase A's buildOrder: store.deliveryFee, or 0 when freeDeliveryOver is set and itemsTotal >= it. Seed fees are 0 until task 18 sets them, so review and saved order always agree */ }
export const groupCartByStore: (rows: CartRow[], storesById: Record<string, Store>) => CheckoutGroup[]; // orderableNum > 0, first-seen store order
export const checkoutTotals: (groups: CheckoutGroup[]) => { units: number; itemsTotal: number; delivery: number; total: number };
// src/features/orderView.ts
export const ORDER_STATUS_LABEL: Record<OrderStatus, string>; // "Placed", in-progress "Being packed", "Partly shipped", "Shipped", "Delivered", "Cancelled"
export const TRACK_STEPS: { status: "placed" | "packed" | "shipped" | "delivered"; label: string }[]; // Placed, Packed, Shipped, Delivered
export const trackStepIndex: (status: ShipmentStatus) => number; // return-requested/returned → 3; cancelled → -1
export const shipmentText: (s: Shipment, storeName: string, now: number) => { headline: string; detail: string | null };
export const hasPendingDelivery: (orders: Order[], now: number) => boolean; // a "shipped" shipment with deliverAt > now
export const orderTotals: (o: Order) => { units: number; itemsTotal: number; delivery: number; total: number }; // cancelled shipments left out
```

`shipmentText` follows the spec's table and reads `effectiveStatus(s, now)`:

| Status | headline | detail |
| --- | --- | --- |
| placed | "Order placed, waiting for the store" | null |
| packed | `Being packed by ${storeName}` | null |
| shipped | "On its way" | `${carrier} · ${trackingNo}` (null if missing) |
| delivered | `Delivered ${formatDateTime(at)}`: `at` = `deliverAt` if the timer delivered it, else the last "delivered" history event | carrier · tracking if present |
| cancelled | "Cancelled" | null |

**Ordering rules Phase A left open (Contract gap 2):**
- `buildOrder` skips lines whose item is not `active`, and caps each line at the stock for `lineKey(line)`. A line capped to 0 is skipped.
- `placeOrder` returns `null` when no buyer is signed in, or when nothing is orderable.
- Ordered lines leave the cart, capped lines included. Lines that ordered nothing stay.

- [ ] **Step 1: Write the failing pure tests**

**`orderBuild` (add):**
- an archived line is skipped;
- 5 against a stock of 2 orders 2;
- a line at stock 0 is skipped.

**`slices`:**
- **"guest can't place an order"** replaces the Phase A `GUEST_ID` case: the result is `null` and `orders` is unchanged.
- Ahmed's cart preloaded with smart watch ×3 (stock 2) and Chronograph ×1 (stock 0), since `addToCart` caps at stock: the order line has 2, and his cart keeps only the Chronograph.
- The new order's `number` is `"A-10014"`.

**`checkout`:**
- `joinCart` produces all four problems.
- `pickAddress`:
  - picked;
  - falls back to the default once the picked one is removed;
  - skips an incomplete default (`city: ""`);
  - an empty book gives `null`.
- `pickPayment`: an expired pick falls back to the default, and an expired default falls back to `cod`.
- `groupCartByStore` on [smart watch ×2, backpack ×1] gives the stores `["Tick & Tock", "Carry Co."]` with item totals `[258, 65]`.
- `checkoutTotals` gives `{ units: 3, itemsTotal: 323, delivery: 0, total: 323 }`.

**`orderView`:**
- Each table row, on fixtures with the store "Tick & Tock".
- `deliverAt: 1000` reads "On its way" at 999 and "Delivered …" at 1000.
- A fixture `[shipped, placed]` gives "Partly shipped". No seed order does: A-10008, shipped + delivered, reads "Shipped".
- `hasPendingDelivery` is true only when `deliverAt` is in the future.
- `orderTotals` skips cancelled shipments.

- [ ] **Step 2: Run them to verify they fail, then implement `joinCart`, the ordering rules, `checkout.ts` and `orderView.ts`**

Run: `npx vitest run src/features`. Expected: FAIL, then PASS.

`useBuy` builds its rows with `joinCart`. The `Cart` messages, by problem:

| `problem` | Message |
| --- | --- |
| short | today's "Only N in stock: N will be ordered" |
| sold-out | "Sold out: won't be ordered" |
| inactive | "No longer available: won't be ordered" |

- [ ] **Step 3: Write the failing checkout and cart tests**

`Checkout.test.tsx` setup:
- Renders `RouterIndex` plus a `LocationProbe`. Text assertions are scoped `within(screen.getByRole("main"))`, so Phase C's header ("Ship to Cairo") doesn't match.
- State is `buildSeed(Date.now())`: the seed's card expiries are month offsets from its `now`, so `buildSeed(0)` would make every seeded card expired against the page's `Date.now()`.
- Ahmed is signed in, with the cart `item-tt-smart-watch ×1` and `item-cc-city-backpack ×1`.
- Router entries `["/cart", "/checkout"]`. Add `routerEntries?: string[]` to `renderWithStore`.

Tests:
- **"defaults are picked":**
  - "1. Ship to" shows "Home" and "14 Nile Street, Cairo".
  - "2. Pay with" shows "Visa ending 4242".
  - "3. Review" has "Ships from Tick & Tock" and "Ships from Carry Co.", Delivery "Free", and Order total "$194".
- **"Change and Add new":**
  - "Change" shows 2 radios, and picking Work shows "Smart Village, Building B2, Giza".
  - "Add a new address" saves a new address and picks it.
  - "Edit" on Work opens `AddressForm` filled in. Changing the city to "Cairo" updates the saved address (`updateAddress`), and the option reads "Smart Village, Building B2, Cairo".
  - An expired fixture card is a disabled radio marked "Expired".
- **"place order":**
  - The location is `/account/orders/<id>`, with "Order A-10014 placed".
  - The cart is empty.
  - Both stocks are down by 1.
  - The order has 2 shipments, and `shipTo.line1` is "14 Nile Street".
- **"back after placing does not reorder":**
  - `navigate(-1)` lands on `/cart`, which shows "Your cart is empty".
  - Pushing `/checkout` redirects to `/cart`.
  - There are 14 orders.
- **"double click places one order":** 14 orders.
- **"removed address falls back to the new default":** pick Work, then dispatch `removeAddress` for Work. Ship to shows Home, and the order's `shipTo.label` is "Home".
- **"archived and sold-out lines are not ordered":** preload the backpack with `status: "archived"` and Ahmed's cart with it and Chronograph ×1. Don't archive through `updateItem`, because Phase E makes that clear carts. Then:
  - "Won't be ordered" lists "City backpack: No longer available" and "Chronograph, leather strap: Sold out".
  - The Order total is "$129".
  - The order has 1 shipment.
  - Both lines stay in the cart.
- **"guest is asked to log in":** with a 2-unit guest cart:
  - "Log in to check out" and "Your cart (2 items) comes with you." show;
  - Log in → Omar shows "8 Corniche Road, Alexandria".
- **"empty cart redirects":** `/checkout` lands on `/cart`.

`Cart.test.tsx`:
- A "Checkout" link to `/checkout`, and no "Place order".
- A preloaded archived line shows "No longer available: won't be ordered".

- [ ] **Step 4: Run them to verify they fail, then build `Checkout` and change `Cart`**

- **Guard:** `RequireBuyer title="Log in to check out" text={carryText ?? undefined}`.
- **No orderable rows:** `<Navigate to={ROUTES.cart} replace/>`.
- **State:** local `{ addressId, paymentId }`, both starting at `null`. The page always shows `pickAddress(...)` / `pickPayment(..., Date.now())`, so a removed or expired choice falls back on the next render.
- **"1. Ship to" / "2. Pay with":**
  - The current choice, with "Change" opening an inline `RadioGroup`.
  - Disabled options:
    - incomplete addresses: "Incomplete: edit to add the city";
    - expired cards: "Expired MM/YY".
  - Each address option has "Edit": an `AppDialog` with `AddressForm initial={…}`, saved with `updateAddress` (the spec lets checkout edit addresses as well as add them).
  - "Add a new address" / "Add a card" opens an `AppDialog` with `AddressForm` / `AddCardForm`, and selects the new entry.
- **"3. Review":**
  - Per `groupCartByStore` group: h3 `Ships from ${store.name}`, the lines (thumb, name, "qty × price", line total), and "Delivery: Free".
  - "Won't be ordered": the rows with `orderableNum === 0`.
  - A summary: Items, Delivery "Free", "Order total".
  - "Place order", disabled when there is no address, no orderable row, or an order is being placed.
  - "Demo store: no payment is taken."
- **Placing:**
  1. A `useRef` guard ignores repeat clicks.
  2. `dispatch(placeOrder({ shipTo: address, payment: { kind: method.kind, label: paymentLabel(method) } }))`.
  3. When it returns `null`, toast "Nothing in your cart could be ordered."
  4. Otherwise `navigate(ROUTES.accountOrder(order.id), { replace: true, state: { placedNumber: order.number } })`.
- **`Cart`:**
  - Drop "Place order", its handler, the "Order … placed" state and the Phase A guest placeholder address.
  - The summary button becomes `<Button component={Link} to={ROUTES.checkout}>Checkout</Button>`, disabled when no units are orderable.
- **Route:** `checkout` → `Checkout`.

- [ ] **Step 5: Write the failing orders tests**

`Orders.test.tsx` (Nour, at `/account/orders`):
- 4 rows, in the order A-10012, A-10009, A-10006, A-10003:

  | Order | Total | Status |
  | --- | --- | --- |
  | A-10012 | $163 | Placed |
  | A-10009 | $189 | Shipped |
  | A-10006 | $83 | Delivered |
  | A-10003 | $59 | Delivered |

- Each row links to `/account/orders/<id>`.
- For Omar, A-10011 reads "Being packed".
- A new buyer sees "No orders yet" and "Browse the shop".

`OrderPage.test.tsx`:
- **Omar's A-10011:**
  - The h2 "Order A-10011".
  - "From Carry Co.": "Order placed, waiting for the store", with `aria-current="step"` on Placed.
  - "From Hearth Lane": "Being packed by Hearth Lane", with `aria-current="step"` on Packed.
  - Ship to "8 Corniche Road", and the payment label.
- **Omar's A-10008:**
  - Pocket Signal reads "On its way", with a detail matching `/^(Nile Express|Delta Post) · (NE|DP)\d{9}$/`.
  - Tick & Tock reads "Delivered …".
- **"ticks only while a delivery is pending":**
  1. A fixture shipped with `deliverAt = now + 2000`, under `vi.useFakeTimers()`, reads "On its way".
  2. `act(() => vi.advanceTimersByTime(2000))` → "Delivered …".
  3. Then `vi.getTimerCount() === 0`.
- **"another buyer's order is a 404":** Nour opening A-10011, or an unknown id, gets "Page not found".
- **"placed banner":** the state `{ placedNumber: "A-10014" }` shows "Order A-10014 placed".

- [ ] **Step 6: Run them to verify they fail, then build `Orders` and `OrderPage`; delete the old tracking**

- **`Orders`** (h2 and document title "Your orders"):
  - An `<ol>` of `selectOrdersForBuyer`. Each row is one link holding:
    - "Order A-10012";
    - "Placed " + `formatDay`;
    - "N items";
    - up to 4 `ProductThumb`s;
    - the `orderTotals` total;
    - `ORDER_STATUS_LABEL[orderSummaryStatus(o, now)]`.
  - `now = useNow(hasPendingDelivery(orders, Date.now()))`.
  - The empty state is TrackBought's, pointing at `ROUTES.home`.
- **`OrderPage`:**
  - Finds the order by `id` among the active buyer's orders, else `<Error404/>`.
  - A banner from `location.state.placedNumber`.
  - Header: the number, "Placed " + `formatDateTime`, the summary label, Ship to, the payment label, and the totals.
  - One card per shipment, holding:
    - "From <store link>";
    - a 4-step status line on TrackBought's CSS: fill = `trackStepIndex / 3`, hidden when cancelled;
    - the `shipmentText` headline and detail, plus an `aria-live="polite"` copy of the headline;
    - the lines.
  - `useNow(hasPendingDelivery([order], Date.now()))`.
- **Routes:** `account/orders` → `Orders`; `orders/:orderId` → `OrderPage`.
- **Preload:**
  - `"/account/orders"` → buyerLayout + accountOrders (replaces trackBought);
  - `"/account/orders/*"` → orderPage;
  - `"/checkout"` → checkout.
- **Delete** `TrackBought.tsx` and `utils/orders.ts`.

Run: `grep -rn "TrackBought\|utils/orders\|shortOrderId\|IN_DELIVERY_AFTER" src`. Expected: no matches.
Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 7: Check by hand and commit**

At 360 px and 1280 px:
1. As a guest, add a watch and a backpack.
2. Go to Checkout, log in as Ahmed, and check the cart carried over.
3. Pick Work and add a card. The review shows two "Ships from" groups.
4. Place the order. The order page shows two cards reading "Order placed, waiting for the store".
5. Press Back: the cart is empty.
6. `/account/orders` lists the order first, as "Placed".

New orders stay "Placed" until Phase E adds the seller actions.

Add `## 21. Checkout and buyer orders: one shipment per store, tracking cards (Claude Code)`.
```bash
git add -A && git commit -m "Add checkout and buyer orders with a tracking card per shipment"
```

---

## Self-review notes

- **Spec coverage:** Task 1 covers the store home (handed over by Phase B), the four sorts with no A to Z, the four filters, chips, the query string, the wide and phone layouts, and the preload. Task 2 covers search, the product page and store pages. Task 3 covers "Your addresses" and its single default, plus the city at sign-up (Phase C gap 3). Task 4 covers every card rule, COD, and expired cards. Task 5 covers the three checkout steps, guest log-in, the order list and the tracking cards.
- **Left out on purpose:** the header (Phase C), seller actions and `deliverAt` (Phase E), the rating sort (task 24) and Saved (task 20). Until Phase E, new orders stay Placed, so the ticking clock is tested with fixtures.
- **Seed values, recounted from Phase A's tables:**
  - categories 6/6/2/3/6/7;
  - accessories 2/2/3 per store;
  - units 27 in total, with the mug's 4 the highest;
  - Nour's totals 163/189/83/59;
  - Ahmed's test cart 194;
  - the next order number A-10014.
- **Shared types:**
  - `CartRow` moves to `cart.ts`.
  - `AddressFields` serves the reducer, the form and the schema.
  - `formatWhen.ts` and `ConfirmDialog` match Phase E's signatures.

## Contract gaps

1. **Seed ids Phase A doesn't pin.** Only five item ids and the order `number`s are pinned. The other 25 item ids, `Order.id`, the address and card ids, and each item's `createdAt` are not. Tests look things up by name, `number`, `label` or `last4`, and Newest uses fixtures. Phase E gap 1 is the same.
2. **Ordering rules.** Phase A's `buildOrder` skips only missing items, and its `placeOrder` makes guest orders. Neither caps at stock nor skips non-active items; Phase E gap 5 asks Phase D for this. Task 5 pins the rules and replaces Phase A's guest test:
   - skip non-active items;
   - cap at stock;
   - return `null` for a guest or when nothing can be ordered;
   - keep unordered lines in the cart.
3. **Sign-up data.** Phase A stores `city: ""`, and may leave out `cod` for new buyers.
   - Task 3 adds City.
   - Task 4 adds `cod` if it's missing.
   - `isAddressComplete` keeps old city-less addresses out of checkout.
4. **`selectStores`.** Resolved: Phase A produces it.
5. **`renderWithStore`.** It takes a single `route`. Task 5 adds a backward-compatible `routerEntries?: string[]` for the Back test.
6. **Phase C names this plan consumes.** Phase C (committed in `72940af`) produces these, which are not Phase A/B names:
   - `useIsPhone` and `media` (`src/styles/breakpoints.ts`, 767 px);
   - `setViewportWidth` (`src/test/viewport.ts`);
   - `LocationProbe` (`src/test/LocationProbe.tsx`);
   - `selectDefaultAddress`.

   If Phase C renames any of them, update Tasks 1–5.
7. **Phase E overlap.** Resolved: Phase D creates `formatWhen.ts` and `ConfirmDialog.tsx`; Phase E reuses them.
8. **Phase E dependencies:**
   - The buyer's tracking cards and `useNow` need "Mark shipped" and Auto-ship to set `deliverAt = now + DELIVER_AFTER_MS`. Phase E Task 1 does this.
   - Until Phase E clears archived and draft items from carts, `joinCart` shows them as "No longer available".
   - Buyer stock chips keep `LOW_STOCK`, which Phase E's note allows.
