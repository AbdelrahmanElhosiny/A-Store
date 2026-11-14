# Phase C: Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace today's one-row `NavBar` with a two-row store header in buyer mode (logo, search with a category scope, mode switch, account menu, cart; then a category row with "Ship to"), and a slim top bar plus left sidebar in seller mode. Phones get their own header, with a menu button on the left, and a side menu that puts categories first.

**Architecture:** Each mode gets its own header component in `src/components/header/`. `BuyerLayout` renders `BuyerHeader`. `SellerLayout` renders `SellerHeader`, and passes `SellerNav` to a new `Sidebar` slot in `Layout`. Wide and phone layouts are chosen in JavaScript with one hook, `useIsPhone()` (MUI `useMediaQuery`, `noSsr`), so only one tree is in the DOM. That way tests can use `getByRole` without duplicates, and a `matchMedia` test helper picks the width. The heavy MUI pieces (`Menu`/`Popover`, `Drawer`/`Modal`, `LoginDialog`) load in their own chunks on first open, with an idle prefetch. The header that paints first only uses `Button`, `IconButton`, `Badge`, a native `<select>` and a plain `<input>`. The header height is a constant per mode and breakpoint, written to `--nav-height`.

**Tech Stack:** React 18, react-router-dom 6, RTK 1.9, MUI 5 (`Menu`, `MenuItem`, `Divider`, `Drawer`, `useMediaQuery`), Emotion, Vitest + Testing Library + user-event (from Phase A).

**Spec:** `docs/superpowers/specs/2026-11-13-marketplace-overhaul-design.md` (Point 4 "navbar and phone menu"; Point 3 "How the switch behaves": logo to the mode's home, accent per mode, cart only in buyer mode; Phase C tasks 5 and 6; Builder notes "Mode classes" and "Phase C before D").

## Global Constraints

- Branch `marketplace`. No major version upgrades (React 18, MUI 5, RTK 1.9, react-router 6, Vite 5 stay). No new runtime dependencies.
- One spec task = one commit = one `docs/AI-LOG.md` entry (this phase writes 15 and 16, in the existing format: `## N. Title (Claude Code)`, `**Prompt:**`, `**Changes**`, `**Check:**`, `**Changed by hand:** —`). No Claude/Anthropic attribution in commit messages. Commit only when the user has asked.
- `npm run lint`, `npm run build` and `npm test` pass after every task.
- Gruvbox tokens from `src/styles/tokens.ts` only (no hex values in components). Sharp edges: `border-radius: 0` / `var(--radius)` on every new surface (menu paper, drawer, search box, avatar, badges). Hard shadows only (`var(--shadow-1..3)`).
- Each mode keeps its accent: buyer markup sits under the `buy` class, seller markup under `sell`. Portalled surfaces (account menu paper, drawer paper) carry the class themselves, because they render outside the layout's `Holder`.
- Every path comes from `ROUTES` (`src/constant/routes.ts`). Query strings are built only in `src/components/header/searchPaths.ts`.
- Breakpoints: phone `max-width: 767px` (as today). There is one new step at `max-width: 1023px` ("narrow", the same value `Cart.tsx` already uses). Both live in `src/styles/breakpoints.ts`.
- Cart, "Ship to" and categories exist only in buyer mode. There is no bottom tab bar.

## Review Focus

1. **Long names at 360 px.** A 24-character buyer name and a 32-character store name (both are the sign-up maximums) must not push the cart or avatar off-screen or cause sideways scroll. Expected: the visible text is cut with an ellipsis, and the full name stays in the accessible name and in `title`. Pinned in Task 1 (`BuyerHeader.test.tsx` › "long names truncate but keep their full name") and Task 2's 360 px hand check.
2. **The drawer staying open after navigation**, or snapping focus back to the menu button after `useRouteFocus` has moved it to the new page's heading. Expected: any path change closes the drawer, and focus goes back to the menu button only when the user closed the drawer themselves (Escape or Close). Pinned in Task 2 (`BuyerHeader.phone.test.tsx` › "drawer closes after navigation and leaves focus alone").
3. **Search with an empty or blank query.** Expected: "All categories" plus a blank query does nothing (no `/search?q=`, no `&category=` on a bare path). A blank query with a category picked opens that category's page. Pinned in Task 1 (`searchPaths.test.ts` and `BuyerHeader.test.tsx` › "blank search stays put").
4. **Keyboard trap in the account menu**, with the theme item swallowing arrow keys. Expected: the arrow keys walk every item, including "Dark mode". Escape and Tab close the menu and return focus to the account button. Pinned in Task 1 (`AccountMenu.test.tsx` › "keyboard: arrows, Escape, Tab").
5. **The taller header breaking sticky offsets.** The header grows from 56 px to 96 px (wide buyer) and 112 px (phone buyer), and `Cart.tsx`'s summary uses `top: calc(var(--nav-height) + …)`. Expected: `--nav-height` always equals the header's real height, so nothing slides under it. Pinned in Task 1 (`navHeight.test.ts` › "nav heights add up the rows") and the DevTools hand check (jsdom cannot measure layout).

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/styles/breakpoints.ts` (new) | `BREAKPOINT`, `media` strings for Emotion, `PHONE_QUERY` for `useMediaQuery` |
| `src/styles/navHeight.ts` (new) | Row heights and `navHeight(side, isPhone)`; `GlobalStyle` writes `--nav-height` from them |
| `src/hooks/useIsPhone.ts` (new) | `useMediaQuery(PHONE_QUERY, { noSsr: true })` |
| `src/test/viewport.ts` (new) | `setViewportWidth(px)`: a `matchMedia` stub for tests |
| `src/test/LocationProbe.tsx` (new, or moved out of `redirects.test.tsx`) | Prints `pathname + search` for navigation assertions |
| `src/components/header/searchPaths.ts` (new) | `storeSearchPath`, `sellerSearchPath` |
| `src/components/header/HeaderSearch.tsx` (new) | The search form: buyer (with scope) or seller |
| `src/components/header/AccountAvatar.tsx` (new) | Square initial on a colour |
| `src/components/header/AccountMenu.tsx` (new) | Account button and the lazy menu, mode-aware |
| `src/components/header/AccountMenuList.tsx` (new, lazy chunk) | The MUI `Menu` and its items |
| `src/components/header/ThemeMenuItem.tsx` (new) | "Dark mode" as a `menuitemcheckbox` |
| `src/components/header/CategoryRow.tsx` (new) | Row 2: All categories, the six categories, Ship to |
| `src/components/header/BuyerHeader.tsx` (new) | Buyer header, wide (Task 1) and phone (Task 2) |
| `src/components/header/SellerHeader.tsx` (new) | Seller top bar, wide (Task 1) and phone (Task 2) |
| `src/components/header/SellerNav.tsx` (new) | The sidebar list, also used inside the seller drawer |
| `src/components/header/MenuDrawer.tsx` (new, Task 2, lazy chunk) | The left drawer for both modes |
| `src/components/header/headerStyles.ts` (new) | Shared Emotion snippets (the nav link bar from today's `linkStyle`, the accent button) |
| `src/components/NavBar.tsx` (deleted in Task 2) | Kept for phones during Task 1 only |
| `src/components/ModeSwitch.tsx` (modify) | Restyled as the accent button; props unchanged |
| `src/components/ThemeSwitch.tsx` (modify) | Optional visible `label` (used in the drawer) |
| `src/layout/Layout.tsx`, `BuyerLayout.tsx`, `SellerLayout.tsx` (modify) | Sidebar slot, footer columns, the new headers |
| `src/styles/GlobalStyle.tsx` (modify) | `--nav-height` per mode and breakpoint |
| `src/features/selectors.ts` (modify) | `selectToShipCount`, `selectDefaultAddress` |
| `src/constant/linkConstant.ts` (modify) | `EXTERNAL_LINK.AI_LOG` for the footer's Help column |

---

### Task 1 (spec task 5): Store header and seller bar on wide screens

**Files:**
- Create: `src/styles/breakpoints.ts`, `src/styles/navHeight.ts`, `src/hooks/useIsPhone.ts`, `src/test/viewport.ts`, `src/test/LocationProbe.tsx`, `src/components/header/searchPaths.ts`, `HeaderSearch.tsx`, `AccountAvatar.tsx`, `AccountMenu.tsx`, `AccountMenuList.tsx`, `ThemeMenuItem.tsx`, `CategoryRow.tsx`, `BuyerHeader.tsx`, `SellerHeader.tsx`, `SellerNav.tsx`, `headerStyles.ts`
- Modify: `src/test/setup.ts` (reset the `matchMedia` stub), `src/layout/Layout.tsx`, `src/layout/BuyerLayout.tsx`, `src/layout/SellerLayout.tsx`, `src/components/ModeSwitch.tsx`, `src/styles/GlobalStyle.tsx`, `src/features/selectors.ts`, `src/constant/linkConstant.ts`, `docs/AI-LOG.md`
- Test: `src/features/__tests__/selectors.test.ts` (add), `src/styles/__tests__/navHeight.test.ts`, `src/components/header/__tests__/searchPaths.test.ts`, `BuyerHeader.test.tsx`, `AccountMenu.test.tsx`, `SellerHeader.test.tsx`, `SellerNav.test.tsx`, `src/layout/__tests__/Layout.test.tsx`

**Interfaces:**
- Consumes (Phase A): `renderWithStore`, `setupStore`, `buildSeed`, `CATEGORIES`, `CategoryId`, `selectActiveBuyer`, `selectActiveSeller`, `selectActiveStore`, `selectCartCount`, `selectShipmentsForStore`, `useAppSelector`, `RootState`, `Address`. Consumes (Phase B): `ROUTES`, `useSide()` (`side`, `role`, `homePath`, `signUpPath`, `pathname`), `useAuth()` (`role`, `activeAccount`, `activeName`, `isSignedIn`, `logOut`), `ModeSwitch` (`{ compact?: boolean }`), `LoginDialog` (`{ isOpen, onClose }`), `BuyerLayout`, `SellerLayout`, `RequireSeller`. Existing: `ThemeSwitch`, `useThemeMode`, `ResetDemoDialog`, `whenIdle`, `EXTERNAL_LINK`.
- Produces:

```ts
// src/styles/breakpoints.ts
export const BREAKPOINT = { phone: 767, narrow: 1023 } as const;      // max-widths
export const media = { phone: "@media (max-width: 767px)", narrow: "@media (max-width: 1023px)" } as const;
export const PHONE_QUERY = "(max-width: 767px)";

// src/styles/navHeight.ts
export const NAV_ROW = { bar: 56, categories: 40, search: 56 } as const; // px, each row is border-box
export const navHeight: (side: "buy" | "sell", isPhone: boolean) => number;
//   buy wide = bar + categories = 96; buy phone = bar + search = 112; sell = bar = 56 (both widths)

// src/hooks/useIsPhone.ts
const useIsPhone: () => boolean;

// src/test/viewport.ts
export const setViewportWidth: (px: number) => void; // stubs window.matchMedia: (max-width|min-width: Npx) evaluated against px; any other query (e.g. ThemeModeProvider's
//   "(prefers-color-scheme: dark)") gives matches: false. Every result has addEventListener/removeEventListener/addListener/removeListener. Restored in setup.ts afterEach
// src/test/LocationProbe.tsx
export const LocationProbe: React.FC; // <output data-testid="location">{pathname + search}</output>

// src/components/header/searchPaths.ts
export type SearchScope = CategoryId | "all";
export const storeSearchPath: (q: string, scope: SearchScope) => string | null;
//   q trimmed. q && all → ROUTES.search(q); q && cat → ROUTES.search(q) + "&category=" + cat;
//   !q && cat → ROUTES.category(cat); !q && all → null (stay put)
export const sellerSearchPath: (q: string) => string | null;
//   q trimmed. q → ROUTES.sellerOrders + "?" + new URLSearchParams({ q }) (same encoding as Phase E's sellerOrdersLink); !q → null
// Query params other phases read: `/search?q=&category=<CategoryId>` (Phase D), `/seller/orders?q=` (Phase E).

// src/features/selectors.ts
selectToShipCount(state: RootState, storeId: string): number
//   shipments of storeId whose status is "placed" or "packed". Raw status equals effectiveStatus for these two
//   (effectiveStatus only turns shipped into delivered), so the selector needs no `now` and stays memoised.
selectDefaultAddress(state: RootState): Address | null // the active buyer's isDefault address; null for a guest

// src/components/header/*
const HeaderSearch: React.FC<{ mode: "buyer" | "seller"; showScope?: boolean /* buyer only, default true */; className?: string }>;
const AccountAvatar: React.FC<{ letter: string; color: string; size?: number /* px, default 32 */ }>; // aria-hidden, square, text color.bg
const AccountMenu: React.FC<{ compact?: boolean; onLogIn: () => void }>; // compact = avatar/icon only (phones; seller always)
const ThemeMenuItem: React.FC;
const CategoryRow: React.FC;
const BuyerHeader: React.FC;
const SellerHeader: React.FC;
const SellerNav: React.FC<{ onNavigate?: () => void }>;

// src/layout/Layout.tsx: props become
interface LayoutProps { NavBar: React.ReactElement; MainComponent: React.ReactElement; Theme: ThemeType; Sidebar?: React.ReactElement }

// src/constant/linkConstant.ts
EXTERNAL_LINK.AI_LOG = `${REPO_URL}/blob/AI-enhanced/docs/AI-LOG.md`
```

- [ ] **Step 1: Write the failing pure tests**

`navHeight.test.ts` › "nav heights add up the rows":
- `navHeight("buy", false) === 96`, `navHeight("buy", true) === 112`;
- `navHeight("sell", false) === 56`, `navHeight("sell", true) === 56`.

`searchPaths.test.ts`:
- `storeSearchPath("  red watch ", "all")` gives `"/search?q=red%20watch"`;
- `storeSearchPath("strap", "watches")` gives `"/search?q=strap&category=watches"`;
- `storeSearchPath("", "bags")` and `storeSearchPath("   ", "bags")` give `"/c/bags"`;
- `storeSearchPath("   ", "all")` gives `null`;
- `sellerSearchPath(" A-10012 ")` gives `"/seller/orders?q=A-10012"`, `sellerSearchPath("Nour & co")` gives `"/seller/orders?q=Nour+%26+co"`, and `sellerSearchPath(" ")` gives `null`.

Add to `selectors.test.ts`, with `setupStore()` on the default seed:
- "selectToShipCount counts placed and packed shipments": `store-tick-tock` → 2 (A-10012 and A-10013, both placed); `store-carry-co` → 1 (A-10011); `store-hearth-lane` → 2 (A-10010 and A-10011, both packed); `store-pocket-signal` → 1 (A-10012); `"store-nope"` → 0. With a preloaded seed where A-10013's Tick & Tock shipment has `status: "shipped"`, `store-tick-tock` → 1.
- "selectDefaultAddress": with Ahmed signed in, `city === "Cairo"` and `label === "Home"`; with nobody signed in, `null`.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/styles src/components/header src/features`. Expected: FAIL, the modules and selectors are missing.

- [ ] **Step 3: Write `breakpoints.ts`, `navHeight.ts`, `searchPaths.ts`, the two selectors, `useIsPhone`, `setViewportWidth` and `LocationProbe`**

- `selectToShipCount` is `createSelector([selectShipmentsForStore], list => count)`, with `storeId` passed through as the second argument.
- `GlobalStyle`:
  - `:root` keeps `--nav-height: ${navHeight("sell", false)}px`.
  - Add `.buy { --nav-height: ${navHeight("buy", false)}px }`.
  - Task 2 adds the phone value under `media.phone`. During Task 1, phones still render today's one-row `NavBar`, so `.buy` under `media.phone` stays `56px` for now.
- `setup.ts` resets the `matchMedia` stub after each test. With no stub, `useIsPhone()` is false (wide).
- If Phase B wrote `LocationProbe` inside `redirects.test.tsx`, move it to `src/test/LocationProbe.tsx` and import it there.

Run: `npx vitest run src/styles src/components/header src/features`. Expected: PASS.

- [ ] **Step 4: Write the failing component tests**

Every test calls `setViewportWidth(1280)` and renders with `renderWithStore(<><Header/><LocationProbe/></>, { route, preloadedState })`, using `@testing-library/user-event`. The menu, the login dialog and (Task 2) the drawer are lazy chunks, so the first assertion after opening one uses `findBy*`.

`BuyerHeader.test.tsx` (route `/`, guest unless stated):
- **"row 1 in order"**: these elements follow each other in the DOM (`compareDocumentPosition`):
  - link "A-Store home" (href `/`);
  - searchbox "Search A-Store";
  - combobox "Search in", whose options are "All categories" and then the six `CATEGORIES` labels in order;
  - link "Switch to selling";
  - button "Log in";
  - link "Cart, 0 items" (href `/cart`).
- **"search submit navigates"**: type "strap", select "Watches" and press Enter. The location reads `/search?q=strap&category=watches`. A second submit of "lamp" with "All categories" reads `/search?q=lamp`.
- **"blank search stays put"**: at route `/c/bags`, submitting "   " with "All categories" leaves the location at `/c/bags`. Submitting "   " with "Audio" goes to `/c/audio`.
- **"category row links"**: nav "Categories" holds 7 links: "All categories" → `/search`, then "Watches" → `/c/watches` … "Home and kitchen" → `/c/home-kitchen`, "Accessories" → `/c/accessories`.
- **"Ship to shows the default address city"**: with Ahmed signed in, link "Ship to Cairo" → `/account/addresses`. As a guest, `queryByText(/Ship to/)` is null. With a signed-in buyer whose default address has `city: ""`, it is also null.
- **"cart count"**: a guest cart with 2 + 1 units gives link "Cart, 3 items".
- **"account button when signed in"**: with Ahmed signed in, button "Hello, Ahmed" contains the avatar letter "A" (the colour is left to the hand check; jsdom's style parser is unreliable with `var()` values).
- **"long names truncate but keep their full name"**: a buyer named "Abdelrahman Elhosiny Ali" (24 characters):
  - the button's accessible name is "Hello, Abdelrahman Elhosiny Ali";
  - the visible name span has `title` "Abdelrahman Elhosiny Ali" and the class `truncate`.
- **"the theme switch left the header"**: outside the menu, `queryByRole("checkbox", { name: "Dark mode" })` is null.

`AccountMenu.test.tsx` (inside `BuyerHeader`):
- **"logged out"**: click "Log in", and the button has `aria-expanded="true"` and `aria-controls` equal to the menu's `id`. The menu's `menuitem`/`menuitemcheckbox` names, in order, are "Log in", "New here? Create an account" and "Dark mode". "New here? Create an account" links to `/sign-up`. Clicking the "Log in" item closes the menu and shows the dialog "Log in".
- **"logged in"**: with Ahmed signed in, the items in order are:
  - "Your account" → `/account`, rendered in bold (class `primary`);
  - "Orders" → `/account/orders`;
  - "Addresses" → `/account/addresses`;
  - "Payment methods" → `/account/payments`;
  - a `separator`;
  - "Dark mode";
  - "Log out".

  "Dark mode" and "Log out" have class `secondary`.
- **"log out signs out of buyer mode only"**: with Ahmed and Mona signed in, click "Log out". Then `buyerId` is null, `sellerId === "acc-mona"`, and the header button reads "Log in".
- **"Dark mode toggles and keeps the menu open"**: `aria-checked` flips from `"false"` to `"true"`, `document.documentElement.dataset.theme === "dark"`, and the menu is still open.
- **"keyboard: arrows, Escape, Tab"**:
  - Focus the account button and press Enter. The menu opens with the first item focused.
  - As a guest, ArrowDown twice moves focus to "Dark mode" (Log in → New here → Dark mode), and a third ArrowDown wraps to "Log in". Space on "Dark mode" flips its `aria-checked`.
  - Escape closes the menu (`queryByRole("menu")` null) and focus is on the account button.
  - Reopen, then press Tab. The menu closes and focus is on the account button.
- **"menu paper carries the mode class"**: the menu's paper element has class `buy`.

`SellerHeader.test.tsx` (route `/seller`, Mona signed in unless stated):
- **"top bar"**:
  - link "A-Store seller centre home" (href `/seller`) with the text "Seller centre";
  - text "Tick & Tock";
  - searchbox "Search orders and products";
  - link "Switch to shopping";
  - button "Account menu, Mona";
  - no link matching `/cart/i` and no "Categories" nav.
- **"seller search goes to orders"**: type "A-10012" and press Enter, and the location reads `/seller/orders?q=A-10012`. A blank submit doesn't move.
- **"seller account menu"**: the items in order are "Store settings" → `/seller/store` (class `primary`), a separator, "Dark mode" and "Log out". "Log out" sets `sellerId` to null and keeps `buyerId`.
- **"no store signed in"** (route `/seller/orders`, no seller):
  - no store name;
  - button "Log in" whose menu items are "Log in", "New here? Create a store" (→ `/seller/sign-up`) and "Dark mode";
  - and, rendered through `SellerLayout`, no "Seller centre" sidebar nav.
- **"long store name"**: a store named "The Very Long Store Name Company" renders its visible name with `title` equal to the full name and class `truncate`.

`SellerNav.test.tsx`:
- **"sidebar links in order"**: nav "Seller centre" holds "Home" → `/seller`, "Orders, 2 open" → `/seller/orders`, "Products" → `/seller/products`, "Customers" → `/seller/customers` and "Store settings" → `/seller/store`. This is with Mona signed in on the seed: Tick & Tock has 2 placed shipments.
- **"badge per store"**: with Karim signed in, the Orders link's name is "Orders, 1 open" and the badge's text is "1".
- **"zero hides the badge"**: with Mona signed in and A-10012 and A-10013 Tick & Tock shipments preloaded as `shipped`, the link name is "Orders" and no badge text shows.
- **"active page"**: at `/seller/orders/abc`, "Orders, 2 open" has `aria-current="page"` and "Home" does not.

`Layout.test.tsx` (renders each layout via `<Routes><Route element={<BuyerLayout/>}><Route path="*" element={<h2>Page</h2>}/></Route></Routes>`, and likewise for the seller layout):
- **"skip link and h1 per mode"**:
  - The first link in the document is "Skip to content" → `#main`.
  - The buyer layout has a level-1 heading "A-Store shop".
  - The seller layout has "A-Store seller centre".
- **"sidebar sits outside main"**: with Mona signed in, nav "Seller centre" is not inside `main`, and `main`'s first heading is the page's "Page".
- **"footer columns in buyer mode"**:
  - heading "Shop by category" with 7 links (same hrefs as the category row);
  - heading "Help" with "Your orders" → `/account/orders`, "Sell on A-Store" → `/seller`, "How this demo was built" → `EXTERNAL_LINK.AI_LOG`;
  - "Source", "Classic version", "What AI changed" and the "Reset demo data" button are still there.
- **"seller footer stays one row"**: no "Shop by category" heading.

- [ ] **Step 5: Run them to verify they fail**

Run: `npx vitest run src/components/header src/layout`. Expected: FAIL.

- [ ] **Step 6: Build `HeaderSearch`, `CategoryRow`, `AccountAvatar` and restyle `ModeSwitch`**

`HeaderSearch` is a `<form role="search">` holding:
- a native `<select>` labelled "Search in" (visually hidden `<label>`), buyer mode with `showScope` only. It keeps a picked category, and the scope resets to "all" when the route changes away from a category.
- an `<input type="search">` labelled "Search A-Store" (seller: "Search orders and products"), with the placeholder "Search products and stores" (seller: "Order number, buyer or product").
- a submit `IconButton` labelled "Search".

On submit it calls `storeSearchPath` or `sellerSearchPath` and navigates only when the result is non-null. Don't use MUI `Select` or `Autocomplete`: they pull `Popover` into the first load. Style:
- square, 40 px tall, `color.bg` field with a `color.bg2` border;
- the focus ring on the whole form via `:focus-within`;
- grows to fill row 1 (`flex: 1; max-width: 640px`).

`CategoryRow`:
- `<nav aria-label="Categories">`: "All categories" → `ROUTES.search()`, then `CATEGORIES.map(c => ROUTES.category(c.id))`, as `NavLink`s with today's link bar style moved to `headerStyles.ts`.
- At the right, "Ship to <city>" with `LocationOnOutlined`, linking to `ROUTES.accountAddresses`. It renders only when `selectDefaultAddress(state)?.city` is non-empty.
- `media.narrow`: the row stays one line with its own `overflow-x: auto` (never the page's), and "Ship to" is hidden.

`AccountAvatar` is a square `span` with the letter upper-cased, in `font.Bold`, `color.bg` text on `color`. Buyers pass `name[0]` and `avatarColor`. Sellers pass the store's `logoLetter` and `logoColor`.

`ModeSwitch` (props and texts unchanged, so Phase B's test still passes) becomes a contained button in the other mode's accent: `--primary-color` set to `color.sell` in buyer mode and `color.buy` in seller mode. It has `color.bg` text, `font.Bold`, `var(--shadow-1)`, radius 0 and is 36 px tall.

- [ ] **Step 7: Build `AccountMenu`, `AccountMenuList` and `ThemeMenuItem`**

`AccountMenu` button (`id="account-button"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls="account-menu"` while open):

| State | Wide buyer | `compact` (phones; seller always) |
| --- | --- | --- |
| Signed out | text "Log in" + `PersonOutline` | `PersonOutline` icon, `aria-label="Log in"` |
| Buyer signed in | `AccountAvatar` + `<span class="truncate" title={name}>Hello, {name}</span>` + `KeyboardArrowDown` | `AccountAvatar`, `aria-label="Hello, {name}"` |
| Seller signed in | (n/a) | `AccountAvatar` (store letter), `aria-label="Account menu, {owner name}"` |

- `.truncate` is `max-width: 14ch; overflow: hidden; text-overflow: ellipsis; white-space: nowrap`.
- Under `media.narrow` the wide buyer hides the "Hello, …" text visually but keeps it in the accessible name: wrap it in a span that becomes `visually-hidden` there.

`AccountMenuList` is `lazy(() => import("./AccountMenuList"))`. It mounts on first open and is prefetched once with `whenIdle()` from an effect in `AccountMenu`. It is an MUI `Menu` (`id="account-menu"`, `MenuListProps={{ "aria-labelledby": "account-button" }}`), and its paper gets the mode class (`buy`/`sell`) through `slotProps.paper.className`, plus radius 0 and `var(--shadow-2)`.

Items: the texts, order and hrefs are the ones pinned in `AccountMenu.test.tsx` and `SellerHeader.test.tsx`. Link items are `MenuItem component={Link}`. The sign-up item passes `state={{ from: pathname }}`. Class `primary` is `font.Bold`. Class `secondary` is `color.fgMuted` at 0.875rem. A `Divider` separates the main links from the secondary ones.

Closing the menu: MUI 5's `FocusTrap` reads `disableRestoreFocus` only when the menu opens (`node_modules/@mui/base/FocusTrap/FocusTrap.js`, effect keyed on `[open]`), so the prop can't be toggled per close.
- The `Menu` always has `disableRestoreFocus`. Otherwise MUI's restore would run after `useRouteFocus` has focused the new page's heading.
- `onClose` with reason `"escapeKeyDown"`, `"backdropClick"` or `"tabKeyDown"` focuses `#account-button` by hand. A link item or Log out closes the menu without moving focus.

`ThemeMenuItem` is a `MenuItem` with:
- `role="menuitemcheckbox"` and `aria-checked={mode === "dark"}`;
- the text "Dark mode" and a trailing `DarkModeOutlined` icon, with a CSS-only square track indicator styled like `ThemeSwitch` (no `<input>` inside);
- `onClick` that toggles `setPreference` and does not close the menu.

- [ ] **Step 8: Build `BuyerHeader`, `SellerHeader`, `SellerNav` and wire the layouts**

`BuyerHeader` (wide), with the `buy` class from the layout:

| Row | Height | Content |
| --- | --- | --- |
| Row 1 | `NAV_ROW.bar`, `color.bg1`, bottom border `color.bg2` | grid `auto minmax(0,1fr) auto auto auto`: logo link (`aria-label="A-Store home"`, to `useSide().homePath`), `HeaderSearch mode="buyer"`, `ModeSwitch`, `AccountMenu`, Cart link (`ShoppingCartOutlined` + "Cart" + `Badge` with `selectCartCount`; `aria-label={\`Cart, ${n} items\`}`; "Cart" text hidden under `media.narrow`) |
| Row 2 | `NAV_ROW.categories`, `color.bg` | `CategoryRow` |

It owns `isLoginOpen` and renders the lazy `LoginDialog` once it has been opened (`lazy(() => import("../LoginDialog"))`, prefetched on idle).

`SellerHeader` owns `isLoginOpen` and the lazy `LoginDialog` too (seller mode lists the stores). On wide screens it is one row, `NAV_ROW.bar` tall:
- the logo link (`aria-label="A-Store seller centre home"`, to `ROUTES.seller`) and the text "Seller centre" (`font.Bold`);
- the store name (`selectActiveStore()?.name`, `.truncate` with `title`, max 24ch), rendered only when there is a store;
- `HeaderSearch mode="seller"` (only when a store is signed in);
- `ModeSwitch`;
- `AccountMenu compact`.

`SellerNav` is `<nav aria-label="Seller centre">`, a list of `NavLink`s:
- Home → `ROUTES.seller` (`end`);
- Orders → `ROUTES.sellerOrders`. Its badge is `selectToShipCount(state, store.id)`, hidden at 0, and its `aria-label` is "Orders, N open" when N > 0 (open = placed or packed, still waiting for the seller; Phase E's "To ship" tab is packed only, so the badge must not say "to ship");
- Products → `ROUTES.sellerProducts`;
- Customers → `ROUTES.sellerCustomers`;
- Store settings → `ROUTES.sellerStore`.

Links are at least 44 px tall, each with an outlined MUI icon, and the active one has a 4 px left bar in `color.primary`. `onNavigate` is called on click (the drawer uses it in Task 2).

`Layout`:
- `Sidebar` renders in `<aside class="sidebar">` between the header and `<main>`, inside a `.body` grid `200px minmax(0,1fr)` (only when `Sidebar` is given).
- The aside is `position: sticky; top: var(--nav-height); height: calc(100dvh - var(--nav-height)); overflow-y: auto`, with `color.bg1` and a right border `color.bg2`.
- The `h1` texts become "A-Store shop" and "A-Store seller centre".
- The footer in buyer mode (above `media.phone`) becomes three columns: "Shop by category" (the 7 links), "Help" (Your orders, Sell on A-Store, How this demo was built) and "About" (today's four).
- Each column heading is an `<h2 class="footer-heading">` styled small (0.9rem). `useRouteFocus` looks inside `main` first, so footer headings never take the page focus.
- On phones and in seller mode the footer stays today's single row.

`BuyerLayout` passes `NavBar={isPhone ? <NavBar …today's Phase B props/> : <BuyerHeader/>}`. `SellerLayout` passes `isPhone ? <NavBar…/> : <SellerHeader/>`, and `Sidebar={!isPhone && store ? <SellerNav/> : undefined}`. Phones keep today's `NavBar` until Task 2.

- [ ] **Step 9: Run everything**

Run: `npm test && npm run lint && npm run build`. Expected: PASS, including Phase B's `ModeSwitch.test.tsx` and `redirects.test.tsx`.

- [ ] **Step 10: Check the first-load cost**

`START_CODE` and `ROUTE_SOURCES` don't change: the layouts keep their paths, and the headers are static imports of the layout chunks.

Run: `npm run build`. Compare the gzip size of the `BuyerLayout` chunk plus its imports with the size before this task (`git stash`, build, note it, `git stash pop`). Expected:
- the growth is under 8 kB gzip;
- no chunk that `/` modulepreloads contains `Popover` or `Menu` (grep the preloaded files for `MuiMenu-`);
- the `AccountMenuList` and `LoginDialog` chunks exist separately.

Write the numbers in the AI-LOG entry.

- [ ] **Step 11: Check by hand and commit**

`npm run build && npm run preview`, at 768 px and 1280 px, in light and dark:
1. On `/`: the two rows show, the search scope works, and "Ship to" is hidden as a guest.
2. Log in as Ahmed from the account menu: "Hello, Ahmed" and "Ship to Cairo" show.
3. On `/cart` with items, scroll: the summary sticks just under the header and doesn't slide behind it. In DevTools, the header's `offsetHeight` equals `getComputedStyle(header).getPropertyValue("--nav-height")` (96).
4. At 768 px the category row scrolls inside itself, the body never scrolls sideways (`document.documentElement.scrollWidth === innerWidth`), and "Ship to" and "Hello, Ahmed" are hidden while the avatar shows.
5. On `/seller` as Mona: the top bar, the sidebar with "Orders 2", the sidebar's sticky position while the page scrolls, and Switch to shopping.
6. Keyboard only: Tab to the account button, then Enter, the arrow keys, Escape and Tab out.

Add `## 15. Store header, account menu and seller bar on wide screens (Claude Code)` to `docs/AI-LOG.md`.
```bash
git add -A && git commit -m "Add the store header, account menu and seller bar for wide screens"
```

---

### Task 2 (spec task 6): Phone header and side menu

**Files:**
- Create: `src/components/header/MenuDrawer.tsx`
- Modify: `src/components/header/BuyerHeader.tsx`, `SellerHeader.tsx`, `src/components/ThemeSwitch.tsx`, `src/layout/BuyerLayout.tsx`, `src/layout/SellerLayout.tsx`, `src/styles/GlobalStyle.tsx`, `docs/AI-LOG.md`
- Delete: `src/components/NavBar.tsx`
- Test: `src/components/header/__tests__/BuyerHeader.phone.test.tsx`, `SellerHeader.phone.test.tsx`, `src/styles/__tests__/navHeight.test.ts` (unchanged, now also applied)

**Interfaces:**
- Consumes (Task 1): `useIsPhone`, `setViewportWidth`, `LocationProbe`, `navHeight`, `NAV_ROW`, `media`, `HeaderSearch`, `AccountMenu`, `AccountAvatar`, `SellerNav`, `selectToShipCount`, `headerStyles`. Consumes (Phase A/B): `CATEGORIES`, `ROUTES`, `useAuth`, `useSide`, `ModeSwitch`, `selectActiveStore`, `selectCartCount`. Existing: `ResetDemoDialog`, `ThemeSwitch`.
- Produces:

```ts
// src/components/header/MenuDrawer.tsx (default export, loaded with lazy())
const MenuDrawer: React.FC<{ open: boolean; onClose: (reason: "user" | "navigation") => void; onLogIn: () => void; onResetDemo: () => void }>;
//   id="site-menu"; anchor="left"; mode-aware content via useSide().role
// src/components/ThemeSwitch.tsx
const ThemeSwitch: React.FC<{ className?: string; label?: string }>; // label: visible text before the icons; input stays aria-label "Dark mode"
```

- [ ] **Step 1: Write the failing phone tests**

Every test calls `setViewportWidth(360)`.

`BuyerHeader.phone.test.tsx` (route `/`):
- **"phone row in order"**:
  - These come in DOM order: button "Open menu" (`aria-expanded="false"`, `aria-controls="site-menu"`), link "A-Store home", link "Switch to selling" (visible text "Sell"), button "Log in" (icon only), link "Cart, 0 items".
  - After them comes a searchbox "Search A-Store" on its own row (`data-row="search"`).
  - There is no combobox "Search in" and no nav "Categories".
- **"drawer opens from the left with focus inside"**: click "Open menu". Then:
  - the dialog's paper has class `MuiDrawer-paperAnchorLeft` and class `buy`;
  - "Open menu" has `aria-expanded="true"`;
  - the focused element is the button "Close menu".
- **"drawer order: greeting, switch, categories, then account links"**: with Ahmed signed in, the drawer's elements follow this order: text "Hello, Ahmed", link "Switch to selling" (full text), nav "Shop by category" with "All categories" and the six categories, a `separator`, then the links "Orders" → `/account/orders`, "Addresses" → `/account/addresses`, "Payment methods" → `/account/payments`, then the button "Log out", the checkbox "Dark mode" and the button "Reset demo data".
- **"guest greeting"**: as a guest, the drawer shows the button "Log in" and the link "Create account" → `/sign-up`, and no "Orders" link.
- **"drawer closes after navigation and leaves focus alone"**: open the drawer, click "Watches". The location reads `/c/watches`, `queryByRole("dialog")` is null once `waitForElementToBeRemoved` resolves, and `document.activeElement` is not the "Open menu" button.
- **"a path change from outside closes it"**: the test file defines `const Nav = () => { navRef = useNavigate(); return null; }` and renders it beside the header. Open the drawer at `/`, then `act(() => navRef("/c/bags"))`. The dialog goes away. This guards the pathname effect, which also catches browser Back and Forward, not only the link click handler.
- **"Escape returns focus to the menu button"**: open, press Escape. The dialog is gone and "Open menu" has focus.
- **"Log in from the drawer"**: click "Log in". The drawer closes and the dialog "Log in" shows.
- **"Reset demo data from the drawer"**: click it. The drawer closes and the reset dialog's title (today's `ResetDemoDialog` title) shows.

`SellerHeader.phone.test.tsx` (route `/seller`, Mona signed in):
- **"phone bar in order"**: button "Open menu", link "A-Store seller centre home", link "Switch to shopping" (text "Shop"), button "Account menu, Mona". There is no searchbox and no "Seller centre" sidebar nav outside the drawer.
- **"drawer holds the sidebar items"**: open it. The drawer shows text "Tick & Tock", link "Switch to shopping", nav "Seller centre" with "Orders, 2 open", a separator, the checkbox "Dark mode" and the button "Reset demo data". The paper has class `sell`.
- **"drawer closes after a sidebar link"**: click "Products". The location reads `/seller/products` and the dialog is gone.
- **"no store: drawer offers log in"**: with no seller signed in, the drawer shows the button "Log in" and the link "Create a store" → `/seller/sign-up`, and no "Seller centre" nav.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/components/header`. Expected: the phone tests FAIL (phones still get the old `NavBar`).

- [ ] **Step 3: Phone `BuyerHeader` and `SellerHeader`**

When `useIsPhone()` is true:
- `BuyerHeader` row 1 (`NAV_ROW.bar`) is a grid `auto auto 1fr auto auto auto`:
  - the menu `IconButton` (`edge="start"`, `MenuIcon`, `aria-label="Open menu"`, `aria-expanded`, `aria-controls="site-menu"`);
  - the logo;
  - a spacer;
  - `ModeSwitch compact`;
  - `AccountMenu compact`;
  - the cart `IconButton` (same `aria-label` as wide).
- `BuyerHeader` row 2 (`NAV_ROW.search`, `data-row="search"`) is `HeaderSearch mode="buyer" showScope={false}` at full width.
- `SellerHeader` is one row: menu button, logo (without the "Seller centre" text), spacer, `ModeSwitch compact`, `AccountMenu compact`.

Icons are 28 px and touch targets at least 44 px. The `AccountMenu` stays the Task 1 menu.

Each header owns `isMenuOpen`, `isLoginOpen`, `isResetOpen` and a `useEffect` on `pathname` that closes the drawer with reason `"navigation"`. `MenuDrawer` is `lazy(() => import("./MenuDrawer"))`, rendered after the first open and prefetched on idle only when `useIsPhone()` is true.

- [ ] **Step 4: `MenuDrawer`**

An MUI `Drawer`:
- `anchor="left"`, `id="site-menu"`;
- `PaperProps={{ className: side, "aria-label": "Menu" }}`;
- always `disableRestoreFocus` (see Task 1 Step 7). The header focuses the "Open menu" button by hand when `onClose("user")` fires (Escape, backdrop, Close), and leaves focus alone on `"navigation"`;
- width `min(85vw, 320px)`, `color.bg1`, radius 0.

Content, in the order and with the texts and hrefs the Step 1 tests pin:
1. The "Close menu" `IconButton`, `autoFocus`.
2. The greeting block. Signed in, it shows `AccountAvatar` (40 px) with "Hello, {name}" (the store name in seller mode), `.truncate`. Signed out, it shows a contained "Log in" button and a link to `signUpPath` with `state={{ from: pathname }}`.
3. The full-width `ModeSwitch`.
4. Buyer: the categories, as 48 px rows in `font.Bold`. Seller, signed in: `SellerNav onNavigate={() => onClose("navigation")}`.
5. A `Divider`, then the small list (0.9rem, `color.fgMuted`): the account links and "Log out" when signed in, then `ThemeSwitch label="Dark mode"` and a "Reset demo data" button styled like the footer's.

Every link calls `onClose("navigation")` on click; the pathname effect covers Back and Forward. "Reset demo data" calls `onClose("navigation")` (so focus isn't pulled back to the menu button) and then `onResetDemo()`. The header holds `isResetOpen` and renders its own `ResetDemoDialog`, so the dialog outlives the drawer. "Log in" works the same way with `onLogIn()`.

`ThemeSwitch` gains the `label` prop: a `<span>` before the light icon, with `font.Bold`.

- [ ] **Step 5: Phone `--nav-height`, layouts, delete `NavBar`**

- `GlobalStyle`: `${media.phone} { .buy { --nav-height: ${navHeight("buy", true)}px } }`. Seller stays 56.
- `BuyerLayout` and `SellerLayout` always render `BuyerHeader` and `SellerHeader`.
- `SellerLayout`'s `Sidebar` stays wide-only.
- Delete `src/components/NavBar.tsx`, and move whatever the headers still need into `headerStyles.ts`.

Run: `grep -rn "components/NavBar" src`. Expected: no matches.

- [ ] **Step 6: Run everything**

Run: `npm test && npm run lint && npm run build`. Expected: PASS. Then repeat Task 1 Step 10's size check for `/` at phone width: the `MenuDrawer` chunk is separate, and `Drawer`/`Modal` are not in the files `/` modulepreloads.

- [ ] **Step 7: Check by hand and commit**

`npm run build && npm run preview` at 360, 390, 768 and 1280 px, in light and dark. On each width:
- `document.documentElement.scrollWidth === innerWidth` on `/`, `/cart`, `/seller` and `/seller/orders`;
- the header's `offsetHeight` equals `--nav-height` (112 phone buyer, 96 wide buyer, 56 seller);
- the cart summary (wide) sits under the header.

At 360 px:
1. Sign up a buyer named "Abdelrahman Elhosiny Ali", and rename a store to "The Very Long Store Name Company" (or preload it through the console): the bars keep the cart and avatar on-screen.
2. Open the menu: it slides from the left, categories sit above the account links, and tapping a category closes it and focuses the page heading.
3. Back with the menu open closes it.
4. Escape returns focus to the menu button.
5. Reset demo data from the menu opens the reset dialog.
6. Seller: "Shop" switch, and the drawer holds the sidebar with "Orders 2".
7. 767 to 768 px: the layout flips with no flash of the other header on reload.

Add `## 16. Phone header and side menu (Claude Code)` to `docs/AI-LOG.md`.
```bash
git add -A && git commit -m "Add the phone header and the left side menu with categories first"
```

---

## Self-review notes

- Spec coverage for Phase C:
  - **Task 1:** buyer row 1 (logo, scoped search, switch, account, cart) and row 2 (All categories first, six categories, Ship to); the sticky header; the account menu's exact items; the theme switch moved into it; the seller top bar and sidebar with a to-ship count; the logo to the mode's home; the accent per mode; the footer's category and help columns.
  - **Task 2:** the phone buyer header (menu left, logo, Sell, avatar, cart, search line underneath), the left drawer with greeting, switch, categories, then smaller links (Orders, Addresses, Payment methods, theme, Reset demo data), the seller phone bar and its drawer, and no bottom tab bar.
- Accessibility kept: the skip link, the visually-hidden `h1` per mode, `aria-expanded`/`aria-controls` on both menu buttons, the MUI `Menu` keyboard model, the labelled search and scope, the drawer's initial focus and focus restore, and distinct `aria-label`s on the three navs ("Categories", "Shop by category", "Seller centre").
- The seller search sits only on wide screens. On phones the seller orders page's own search (Phase E) covers it. The spec lists no seller phone search.
- `selectToShipCount` reads raw `status` instead of calling `effectiveStatus`, so it needs no clock. The counts (Tick & Tock 2, Carry Co. 1, Hearth Lane 2, Pocket Signal 1) come from Phase A's seed orders table.

## Contract gaps

1. **Phase D (task 8), search page:** "All categories" links to `ROUTES.search()` (`/search`, no `q`). The search page must list every active item when `q` is absent, and it must read `category=<CategoryId>` from the query string (built by `storeSearchPath`). The Phase B `ComingSoon` placeholder covers both until then.
2. **Phase E (task 12), seller orders:** the seller top bar sends `/seller/orders?q=<text>`. The orders page must read `q` as its order-number/buyer search. "Search over orders and products" lands on orders; Phase E's orders page shows a "N products match" link into the products table.
3. **Phase D (task 9), addresses:** "Ship to" hides when the default address has `city: ""`, which is every buyer created by Phase A's sign-up. Phase D's address form should make city required, so signed-up buyers get a "Ship to" line.
4. **Footer Help column:** there is no in-app "how it works" page. The column links to `EXTERNAL_LINK.AI_LOG`, on the `AI-enhanced` branch on GitHub. After the marketplace merge, repoint it to the merged branch, or to the spec once it is pushed. The guided demo tour (Phase F task 27) can add its "Try the whole flow" link to this column.
