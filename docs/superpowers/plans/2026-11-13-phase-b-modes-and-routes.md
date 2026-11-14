# Phase B: Modes and Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Sell/Buy split page and the `/buy` and `/sell` prefixes with a store at `/` and a seller centre at `/seller`. The address picks the mode. A mode switch sits next to Log in. Each mode keeps its own signed-in account, with login dialogs per mode, a "Pick your store" page and sign-up for both modes.

**Architecture:** One route constants module (`ROUTES`) is the only place paths are spelled. The mode comes from the path (`useSide`, kept by name, now `/seller`-aware). Two layouts, `BuyerLayout` and `SellerLayout`, replace `pages/Buy/index.tsx` and `pages/Sell/index.tsx`. Today's pages move under the new paths. Pages that arrive in Phases D and E get a shared `ComingSoon` placeholder now, so the Phase C header can link to them. A `RequireSeller` guard shows "Pick your store" for any seller page while nobody is signed in to seller mode. The start-page preload (`START_CODE` in `routes/Index.tsx`, `ROUTE_SOURCES` in `vite.config.ts`) is rewritten for the new paths.

**Tech Stack:** React 18, react-router-dom 6 (`Routes`, `Navigate`, `useLocation`), RTK 1.9, MUI 5, Formik + Yup, Vitest + Testing Library (from Phase A).

**Spec:** `docs/superpowers/specs/2026-11-13-marketplace-overhaul-design.md` (Routes table, Point 3 "How the switch behaves", Builder notes: Redirects, 404s, Phase C before D, Preload, Sign-up checks).

## Global Constraints

- Branch `marketplace`. No major version upgrades. One spec task = one commit = one `docs/AI-LOG.md` entry (this phase writes 13 and 14). No Claude/Anthropic attribution in commit messages. Commit only when the user has asked.
- `npm run lint`, `npm run build` and `npm test` pass after every task.
- Gruvbox tokens and sharp edges (radius 0). Each mode keeps its accent: buyer mode uses the `buy` class and theme, seller mode the `sell` ones.
- The URL decides the mode: `/seller` and everything under `/seller/` is seller mode, everything else is buyer mode. The mode is never stored.
- Every path is spelled only in `src/constant/routes.ts`.
- Log in by account id, never by name. Sign-up names are unique per role, ignoring case.

## Review Focus

1. **A deep link to a seller page while signed out of seller mode** (`/seller/orders` in a fresh tab). Expected: "Pick your store" shows at that address. Picking a store signs in and the same page renders, with no bounce to `/seller`. Pinned in Task 2 (`RequireSeller.test.tsx` › "deep link survives picking a store").
2. **Old bookmarks with a trailing slash or a query** (`/buy/cart/`, `/sell/track-sold?x=1`). Expected: they land on the new page, and the query string survives. Pinned in Task 1 (`redirects.test.tsx` › "trailing slash and query").
3. **Logging out in one mode.** Expected: the other mode stays signed in. Switching back shows that account, not a login prompt. Pinned in Task 2 (`session` › "logOut seller keeps buyer").
4. **A seller sign-up whose store name differs from an existing one only by case or symbols** ("tick & tock!"). Expected: the slug collides, the form says the name is taken, and nothing is created. Pinned in Task 2 (`SellerSignUp.test.tsx` › "slug collision is a taken name").
5. **The mode switch before the other mode was ever visited.** Expected: it goes to that mode's home (`/` or `/seller`). After a visit it goes back to the exact page, search query included. Pinned in Task 2 (`ModeSwitch.test.tsx`).

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/constant/routes.ts` (new, replaces `routeConstant.ts`) | `ROUTES` builders, `LEGACY_REDIRECTS`, `isSellerPath` |
| `src/hooks/useSide.ts` (rewrite) | Mode from the path: `{ side, role, homePath, signUpPath, pathname }` |
| `src/layout/BuyerLayout.tsx` (new, from `pages/Buy/index.tsx`) | Buy theme + `Layout` + today's `NavBar` with buyer links |
| `src/layout/SellerLayout.tsx` (new, from `pages/Sell/index.tsx`) | Sell theme + `Layout` + `NavBar` with seller links + `RequireSeller` |
| `src/hooks/useRememberPath.ts` (new) | Records the current path per mode for the switch |
| `src/components/ModeSwitch.tsx` (new) | "Switch to selling" / "Switch to shopping" link |
| `src/components/RequireSeller.tsx` (new) | Renders its children or `PickStore` |
| `src/pages/Seller/PickStore.tsx` (new) | Store cards that sign in as the owner, plus a Create a store link |
| `src/pages/Seller/SellerSignUp.tsx` (new) | Creates a seller account and a store |
| `src/pages/ComingSoon.tsx` (new) | Placeholder for routes that Phases D and E fill |
| `src/pages/LegacyRedirect.tsx` (new) | `<Navigate replace>` to the mapped path, keeping `search` |
| `src/routes/Index.tsx` (rewrite) | The route tree, `START_CODE`, idle prefetch |
| `vite.config.ts` (modify) | `ROUTE_SOURCES` and the first-product preload paths |
| `src/pages/HomePage.tsx` (delete) | The split page goes; its photos stay in `src/assets/home/` for Phase D's banner |
| `src/components/LoginDialog.tsx`, `AccountPicker.tsx`, `NavBar.tsx`, `src/hooks/useAuth.ts`, `src/pages/SignUp.tsx`, `src/pages/Error404.tsx`, `src/components/AppDialog.tsx`, `src/pages/Sell/*`, `src/pages/Buy/*` (modify) | Mode-aware and store-scoped |

---

### Task 1 (spec task 3): Route tree

**Files:**
- Create: `src/constant/routes.ts`, `src/layout/BuyerLayout.tsx`, `src/layout/SellerLayout.tsx`, `src/pages/ComingSoon.tsx`, `src/pages/LegacyRedirect.tsx`
- Modify: `src/routes/Index.tsx`, `vite.config.ts`, `src/hooks/useSide.ts`, `src/components/NavBar.tsx` (links only), `src/pages/SignUp.tsx`, `src/pages/Error404.tsx`, `src/components/AppDialog.tsx`, `src/pages/Buy/Cart.tsx`, `src/pages/Buy/TrackBought.tsx`, `src/pages/Sell/Home.tsx`, `src/pages/Sell/AddItem.tsx`, `src/pages/Sell/TrackSold.tsx`, `docs/AI-LOG.md`
- Delete: `src/constant/routeConstant.ts`, `src/pages/HomePage.tsx`, `src/pages/Buy/index.tsx`, `src/pages/Sell/index.tsx`
- Test: `src/constant/__tests__/routes.test.ts`, `src/hooks/__tests__/useSide.test.tsx`, `src/routes/__tests__/redirects.test.tsx`

**Interfaces:**
- Consumes (Phase A): `setupStore`, `renderWithStore(ui, { preloadedState?, route? }): RenderResult & { store }` (wraps `Provider`, the app theme providers and `MemoryRouter initialEntries={[route ?? "/"]}`), `CategoryId`, `selectCartCount`.
- Produces:

```ts
// src/constant/routes.ts
export const ROUTES = {
  home: "/",
  category: (id: CategoryId) => `/c/${id}`,
  search: (q?: string) => (q ? `/search?q=${encodeURIComponent(q)}` : "/search"),
  product: (itemId: string) => `/p/${itemId}`,
  store: (slug: string) => `/store/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  signUp: "/sign-up",
  account: "/account",
  accountOrders: "/account/orders",
  accountOrder: (orderId: string) => `/account/orders/${orderId}`,
  accountAddresses: "/account/addresses",
  accountPayments: "/account/payments",
  accountProfile: "/account/profile",
  accountSaved: "/account/saved",
  seller: "/seller",
  sellerSignUp: "/seller/sign-up",
  sellerProducts: "/seller/products",
  sellerProductNew: "/seller/products/new",
  sellerProduct: (itemId: string) => `/seller/products/${itemId}`,
  sellerOrders: "/seller/orders",
  sellerOrder: (orderId: string) => `/seller/orders/${orderId}`,
  sellerCustomers: "/seller/customers",
  sellerCustomer: (buyerId: string) => `/seller/customers/${buyerId}`,
  sellerStore: "/seller/store",
} as const;
// relative child paths for <Route path>, so the tree and the builders can't drift
export const ROUTE_PATTERNS: { category: "c/:category"; product: "p/:itemId"; store: "store/:slug"; accountOrder: "orders/:orderId"; sellerProduct: "products/:itemId"; sellerOrder: "orders/:orderId"; sellerCustomer: "customers/:buyerId" };
export const LEGACY_REDIRECTS: Record<string, string> = {
  "/buy": "/", "/buy/cart": "/cart", "/buy/track-bought": "/account/orders", "/buy/sign-up": "/sign-up",
  "/sell": "/seller", "/sell/add-item": "/seller/products/new", "/sell/track-sold": "/seller", "/sell/sign-up": "/seller/sign-up",
};
export const isSellerPath: (pathname: string) => boolean; // "/seller" or starts with "/seller/"

// src/hooks/useSide.ts (same name; every caller keeps working)
const useSide: () => { side: "buy" | "sell"; role: Role; homePath: string; signUpPath: string; pathname: string };

// src/pages/ComingSoon.tsx
const ComingSoon: React.FC<{ title: string; phase: string }>; // h2 title, "Arrives in <phase>.", link to the mode's home
```

- [ ] **Step 1: Write the failing tests**

`routes.test.ts`:
- `ROUTES.search("a b")` gives `"/search?q=a%20b"`, and `ROUTES.category("home-kitchen")` gives `"/c/home-kitchen"`.
- `isSellerPath` is true for `/seller` and `/seller/orders/1`, and false for `/sellers`, `/sell` and `/`.

`useSide.test.tsx`: render a probe in `MemoryRouter`.
- At `/seller/orders`: `{ side: "sell", role: "seller", homePath: "/seller", signUpPath: "/seller/sign-up" }`.
- At `/c/watches`: `{ side: "buy", role: "buyer", homePath: "/", signUpPath: "/sign-up" }`.

`redirects.test.tsx` renders `<RouterIndex />` with `renderWithStore`, plus a `LocationProbe` that prints `pathname + search`:
- each `LEGACY_REDIRECTS` key lands on its value;
- "trailing slash and query": `/buy/cart/` lands on `/cart`, and `/sell/track-sold?x=1` lands on `/seller?x=1`;
- `/nope` shows "Page not found" inside the buyer layout;
- `/seller/nope` shows it inside the seller layout, with a button to `/seller`. With nobody signed in, "Pick your store" shows instead; this test signs Mona in through `preloadedState`.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/constant src/hooks src/routes`. Expected: FAIL, the modules are missing.

- [ ] **Step 3: Write `routes.ts` and `useSide.ts`, and repoint every import of `routeConstant.ts`**

Run: `grep -rn "routeConstant\|ROUTE_INDEX\|BUY_ROUTE\|SELL_ROUTE" src`. Expected after this step: no matches.

- [ ] **Step 4: Build the layouts and the route tree**

`BuyerLayout` and `SellerLayout` are today's `pages/Buy/index.tsx` and `pages/Sell/index.tsx` moved to `src/layout/`, with their nav links repointed:
- buyer: Home `/`, Cart `/cart` with the `selectCartCount` badge, Orders `/account/orders`;
- seller: Home `/seller`, Products `/seller/products`, Add product `/seller/products/new`, Orders `/seller/orders`.

`SellerLayout` wraps its `<Outlet />` in `RequireSeller` (Task 2). Until then, use a pass-through stub with that name, so Task 2 only replaces the body.

The tree (lazy-load every page, as today):
```
<Route element={<BuyerLayout/>}>
  /                     → Buy/Home (today's grid; Phase D builds the store home)
  c/:category           → ComingSoon "Category" phase "Phase D"
  search                → ComingSoon "Search results" "Phase D"
  p/:itemId             → ComingSoon "Product" "Phase D"
  store/:slug           → ComingSoon "Store" "Phase D"
  cart                  → Buy/Cart
  checkout              → ComingSoon "Checkout" "Phase D"
  sign-up               → SignUp
  account               → ComingSoon "Your account" "Phase D"
  account/orders        → Buy/TrackBought
  account/orders/:orderId, account/addresses, account/payments, account/profile, account/saved → ComingSoon "… " "Phase D"/"Phase F"
  *                     → Error404
</Route>
<Route path="seller" element={<SellerLayout/>}>
  index                 → Sell/TrackSold (dashboard placeholder until Phase E)
  sign-up               → SellerSignUp (Task 2; ComingSoon until then)
  products              → Sell/Home
  products/new          → Sell/AddItem
  products/:itemId, orders, orders/:orderId, customers, customers/:buyerId, store → ComingSoon "…" "Phase E"
  *                     → Error404
</Route>
{Object.entries(LEGACY_REDIRECTS) → <Route path={from} element={<LegacyRedirect to={to}/>} />}
```
`seller/sign-up` must render outside `RequireSeller`: give the layout a prop, or check `pathname === ROUTES.sellerSignUp` inside the guard.

React Router 6 matching already ignores a trailing slash. `LegacyRedirect` appends `location.search`.

- [ ] **Step 5: Update `START_CODE`, the idle prefetch and `ROUTE_SOURCES`**

`START_CODE` keys:
- `/`: buyerLayout + buyHome
- `/cart`: buyerLayout + cart
- `/account/orders`: buyerLayout + trackBought
- `/sign-up`: buyerLayout + signUp
- `/seller`: sellerLayout + trackSold
- `/seller/products`: sellerLayout + sellHome
- `/seller/products/new`: sellerLayout + addItem
- `/seller/sign-up`: sellerLayout + sellerSignUp

Mirror them in `ROUTE_SOURCES` with the new source paths (`layout/BuyerLayout.tsx`, …).

The idle prefetch fetches buyerLayout, buyHome, sellerLayout and trackSold. In the preload script:
- The hero-photo preload for `/` goes (the split page is gone).
- The first-product-picture preload runs when `path === "/" || path === "/seller/products"`.
- `FIRST_PRODUCT_IMAGE` stays the headphones regex while Buy home lists items in seed order.
- Keep a comment that Phase D's store home must update this regex if its first picture changes.

`isStartPage` needs no change.

- [ ] **Step 6: Repoint in-page links**

- `Cart`'s "Track shipment" goes to `ROUTES.accountOrders`, and "Keep shopping" and "Browse the shop" go to `ROUTES.home`.
- `TrackBought`'s empty state goes to `ROUTES.home`.
- `Sell/Home`'s Add item goes to `ROUTES.sellerProductNew`.
- `AddItem` returns to `ROUTES.sellerProducts` after saving.
- `SignUp` and `Error404` keep using `useSide()` (already mode-aware).
- `AppDialog` keeps `side`.
- Delete `HomePage.tsx`. Remove `HERO_SIZES` from `vite.config.ts` if nothing uses it.

- [ ] **Step 7: Run the tests, lint and build**

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 8: Check by hand and commit**

`npm run build && npm run preview`, then open these at 360 px and 1280 px:
- `/` (the grid, buy colours);
- `/seller/products` (sell colours);
- each old address (redirects);
- `/c/watches` (Coming soon);
- `/seller/zzz` (seller 404).

In DevTools, on a fresh load of `/`, the headphones picture is preloaded with `fetchpriority=high` and the page's code arrives as `modulepreload`.

Add `## 13. Route tree: store at /, seller centre at /seller (Claude Code)` to `docs/AI-LOG.md`.
```bash
git add -A && git commit -m "Move to marketplace routes: store at /, seller centre at /seller, old links redirect"
```

---

### Task 2 (spec task 4): Mode switch and logins

**Files:**
- Create: `src/hooks/useRememberPath.ts`, `src/components/ModeSwitch.tsx`, `src/components/RequireSeller.tsx`, `src/pages/Seller/PickStore.tsx`, `src/pages/Seller/SellerSignUp.tsx`, `src/pages/Seller/sellerSignUpSchema.ts`, `src/utils/slugify.ts`
- Modify: `src/layout/BuyerLayout.tsx`, `src/layout/SellerLayout.tsx`, `src/components/NavBar.tsx`, `src/components/LoginDialog.tsx`, `src/components/AccountPicker.tsx`, `src/hooks/useAuth.ts`, `src/features/storesSlice.ts` (`addStore`), `src/pages/Sell/Home.tsx`, `src/pages/Sell/AddItem.tsx`, `src/pages/Sell/TrackSold.tsx`, `src/pages/Sell/useSell.ts`, `src/routes/Index.tsx`, `docs/AI-LOG.md`
- Test: `src/components/__tests__/ModeSwitch.test.tsx`, `RequireSeller.test.tsx`, `LoginDialog.test.tsx`, `src/pages/Seller/__tests__/SellerSignUp.test.tsx`, `src/utils/__tests__/slugify.test.ts`, `src/features/__tests__/session.test.ts`

**Interfaces:**
- Consumes (Phase A): `logInAs(role, id)`, `logOut({ role })`, `rememberPath({ role, path })`, `addSeller`, `selectActiveSeller`, `selectActiveStore`, `selectBuyerAccounts`, `selectSellerAccounts`, `selectItemsForStore`, `selectShipmentsForStore`, `Store`, `SellerAccount`, `CATEGORIES`. Consumes (Task 1): `ROUTES`, `useSide`.
- Produces:

```ts
// src/features/storesSlice.ts
addStore(payload: Store)
updateStore(payload: { id: string; changes: Partial<Omit<Store, "id" | "ownerId" | "slug">> }) // used by Phase E settings and Phase F fees
// src/utils/slugify.ts
export const slugify: (name: string) => string; // "Tick & Tock!" → "tick-tock"; lower-case, a–z0–9 runs joined by "-"
// src/hooks/useRememberPath.ts
const useRememberPath: () => void; // in each layout: dispatch rememberPath({ role, path: pathname + search }) on change
// src/components/ModeSwitch.tsx
const ModeSwitch: React.FC<{ compact?: boolean }>; // full: "Switch to selling"/"Switch to shopping"; compact: "Sell"/"Shop"
// src/components/RequireSeller.tsx
const RequireSeller: React.FC<{ children: React.ReactNode }>;
// src/hooks/useAuth.ts (mode-aware now)
useAuth(): { role: Role; activeAccount: Account | null; activeName: string | null; isSignedIn: boolean; accounts: Account[] /* this mode's */; carryText: string | null /* buyer mode only */; logIn(accountId: string): void; logOut(): void; signUp(fields: SignUpFields): void; isNameTaken(name: string): boolean }
```

- [ ] **Step 1: Write the failing tests**

`slugify.test.ts`:
- `"Tick & Tock!"` gives `"tick-tock"`, `"  Carry Co. "` gives `"carry-co"` and `"Café 9"` gives `"caf-9"`;
- an empty result falls back to `"store"`.

`session.test.ts` › "logOut seller keeps buyer": both signed in, `logOut({ role: "seller" })`, then `buyerId` is unchanged and `sellerId` is null.

`ModeSwitch.test.tsx`:
- At `/c/watches` with `lastPath.seller = "/seller"`, the link reads "Switch to selling" and its href is `/seller`.
- At `/seller/orders?tab=to-ship`, after `useRememberPath` ran there, switching to buyer and back goes to `/seller/orders?tab=to-ship`.
- `compact` renders "Sell" and "Shop" with the full text as `aria-label`.

`RequireSeller.test.tsx`:
- No seller: "Pick your store" heading, four store buttons (by store name) and a "Create a store" link to `/seller/sign-up`.
- "deep link survives picking a store": route `/seller/orders`, click "Tick & Tock", then `sellerId === "acc-mona"`, the path is still `/seller/orders` and the guarded child renders.

`LoginDialog.test.tsx`:
- In seller mode it lists only the four sellers, each with its store name. In buyer mode it lists only buyers.
- Picking one calls `logInAs` with that mode's role.
- Buyer mode with a guest cart of 3 units shows "Your cart (3 items) comes with you." Seller mode shows no carry text.

`SellerSignUp.test.tsx`:
- an empty submit shows the errors "Enter your name", "Enter a store name" and "Pick a category";
- "slug collision is a taken name": store name "tick & tock!" shows "That store name is taken";
- a valid submit ("Sara", "Paper Trail", "accessories") creates a seller account and a store (slug `paper-trail`, `logoLetter: "P"`, `autoShip: false`, `lowStockAt: 3`, `deliveryFee: 0`, `freeDeliveryOver: null`, `since: now`), signs in and navigates to `/seller`.

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test`. Expected: the new tests fail.

- [ ] **Step 3: Implement `slugify`, `addStore`, `updateStore`, `useRememberPath` and `ModeSwitch`**

`ModeSwitch` reads `session.lastPath[otherRole]` and renders an MUI `Button` as a router `Link`, with `variant="outlined"`, `color="primary"` and the other mode's accent. It sits immediately left of the account block in `NavBar` (wide) and in the drawer (full text). Phase C restyles it.

- [ ] **Step 4: Make the logins mode-aware**

`useAuth` reads `useSide().role`:
- `accounts` is `selectBuyerAccounts` or `selectSellerAccounts`.
- `logIn(id)` dispatches `logInAs(role, id)` and toasts "Logged in as X". In seller mode it toasts "Logged in to <store name>".
- `logOut()` dispatches `logOut({ role })`.
- `signUp` stays buyer-only.

`AccountPicker` shows sellers as the store's logo letter on its `logoColor` and the store name, with the owner's name underneath. `LoginDialog`'s title is "Log in" in buyer mode and "Log in to your store" in seller mode. Its sign-up link is `useSide().signUpPath`, whose text in seller mode is "New here? Create a store". `NavBar` shows `activeName` (seller mode: the store name) and Log out.

- [ ] **Step 5: `RequireSeller`, `PickStore` and `SellerSignUp`**

- `RequireSeller` renders `PickStore` when `selectActiveSeller` is null, except on `ROUTES.sellerSignUp`.
- `PickStore`: h2 "Pick your store", one sentence ("This is a demo: pick a store to run it, no password needed."), a grid of store cards (logo letter, name, tagline, product count; each card is a button calling `logInAs("seller", ownerId)`), then a "Create a store" link.
- `SellerSignUp` uses Formik + Yup in `sellerSignUpSchema.ts`:
  - **name:** today's buyer name rules, unique among sellers;
  - **storeName:** trim, required "Enter a store name", 2–32 characters, unique by `slugify` against existing slugs, "That store name is taken";
  - **categoryFocus:** required "Pick a category", one of `CATEGORIES`;
  - **tagline:** optional, max 60.
- On submit it dispatches `addSeller` (`id: "acc-" + uuid`, `storeId: "store-" + uuid`) and `addStore`, then `logInAs("seller", id)`, then navigates to `ROUTES.seller` and toasts "Your store is ready. Add your first product."

If someone is signed in as a seller already, the page shows "You're running <store>" with Log out and Back buttons, mirroring buyer `SignUp`.

- [ ] **Step 6: Scope today's seller pages to the active store**

- `useSell` reads `selectItemsForStore(state, store.id)`, so the seller's products grid and Update/Remove only see their own.
- `AddItem` uses the active store's id (remove the Phase A placeholder) and its `categoryFocus` as the default category.
- `TrackSold` reads `selectShipmentsForStore` lines.
- Buyer pages still show every store's active items.

- [ ] **Step 7: Run everything**

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 8: Check by hand and commit**

At 360 px and 1280 px:
1. As a guest, add a mug, then Switch to selling.
2. Pick your store, choose Hearth Lane, and confirm only Hearth Lane's 6 products are shown.
3. Switch to shopping: still a guest, with the mug in the cart.
4. Log in as Ahmed.
5. Switch to selling: still Hearth Lane, on the same page.
6. Log out of seller mode, then Switch to shopping: still Ahmed.
7. Open `/seller/orders` in a new tab: Pick your store shows, then pick, and it stays on `/seller/orders`.
8. Create the store "Paper Trail".

Refresh after each step; the sessions survive.

Add `## 14. Mode switch, logins per mode, Pick your store, store sign-up (Claude Code)` to `docs/AI-LOG.md`.
```bash
git add -A && git commit -m "Add the mode switch, per-mode logins, Pick your store and store sign-up"
```

---

## Self-review notes

- Spec coverage for Phase B:
  - **Task 1:** new paths, redirects, mode from the address, split page removed, `START_CODE`/`ROUTE_SOURCES`, placeholder routes (Builder note "Phase C before D"), and a 404 inside the seller layout.
  - **Task 2:** the switch going to the last page or the mode's home, one session per mode, log out of the current mode only, "Pick your store" with a "Create a store" link, sign-up in both modes, store-scoped seller views (Ownership), and log in by account id.
  - "The logo goes to the current mode's home" is Phase C's header. Today's logo links to `/`; Task 1 points the seller layout's logo at `ROUTES.seller` through `useSide().homePath`.
- **Store home `/`:** the spec's Routes table lists the store home (hero, category tiles, featured stores, new arrivals), but no phase task names it. Phase D task 7 owns it. Until then `/` shows today's product grid.
