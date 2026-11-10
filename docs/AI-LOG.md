# AI log

One entry per AI-assisted task on `AI-enhanced`: the tool, the prompt, and what changed by hand.
Plan: see the "A-Store: AI upgrade, deploy and backend plan" doc.

## 1. Fix the build (Claude Code)

**Prompt:** Fix the build: remove the unused imports and the logic bugs from "Issues found". No visual change.

**Changes**
- Removed unused imports that broke `tsc` (`noUnusedLocals`) and lint: `ThemeProvider` and `sellTheme` in `App.tsx`, `_` in `Cart.tsx`, `OrderedItemStatus` in `useBuy.ts`.
- `buyItem` in `itemSlice.ts` now ignores an unknown item id instead of crashing on index -1.
- Stock validation message now matches the rule `min(1)`: "At least 1 unit must be in stock" (Add Item and Update Item).
- New `src/hooks/useAuth.ts` holds the login state; `NavBar` uses it, so Sell pages no longer depend on Buy logic. `useBuy` reuses it.
- `useNotification` handlers are wrapped in `useCallback`, so the route-change effect lists its dependencies (clears the `react-hooks/exhaustive-deps` warning).

**Check:** `npm run lint` and `npm run build` pass. In the browser: Login/Logout in the navbar on both /sell and /buy, order an item from the cart.

**Changed by hand:** —

## 2. Tokens and type (Claude Code)

**Prompt:** Tokens and type: theme module, light/dark, fonts. Keep the Gruvbox theme and the sharp-edged design language.

**Changes**
- `src/styles/theme.ts` builds every MUI theme (Sell / Buy / neutral × light / dark) from `colorD` and `colorL`. Accents use bright Gruvbox colours on dark and faded ones on light, so text on them stays readable. `sellTheme.ts` and `buyTheme.ts` are gone.
- Sharp edges: `shape.borderRadius: 0`, square chips and badges, and hard offset shadows with no blur (`--shadow-1/2/3`).
- `GlobalStyle` exposes colours, spacing, shadows and radius as CSS variables that switch on `data-theme`; `src/styles/tokens.ts` gives components `color.*`, `space.*`, `shadow.*` and `radius` instead of hex values.
- `ThemeModeProvider` + `useThemeMode` follow the system setting by default and hold a preference for the theme toggle (task 3).
- Components that used `colorD` directly now use tokens: navbar, footer, notification bar, cards, home buttons. Cards and bars use the raised Gruvbox surface (`bg1`).
- Type: Geist (`@fontsource-variable/geist`) for body text; JetBrains Mono for nav, buttons and labels, cut from 8 files to the 3 the app uses (400, 700, 700 italic), all with `font-display: swap`.

**Check:** `npm run lint` and `npm run build` pass. Switch the OS between light and dark: the app follows it.

**Changed by hand:** —

## 3. App shell, theme switch and phone layout (Claude Code)

**Prompt:** App shell: navbar, drawer, cart badge, theme toggle, footer. Add a light/dark switch that starts from the system setting. Fix the phone layout: pages are tight, overlap and run off the screen.

**Changes**
- `ThemeSwitch`: a square Gruvbox switch with sun/moon icons. Starts from the browser's colour-scheme setting; a flip is saved in `localStorage` and applied before first paint by a small script in `index.html`. (Chrome and Firefox report their own Appearance / Website appearance setting, not macOS's, which is why they didn't follow the OS.)
- `NavBar`: logo, links and actions on wide screens; under 768 px a cart icon and a menu button open a right-side drawer with the links, the switch and login. The Cart link shows a badge with the item count.
- `Layout`: sticky navbar, flex column so the footer sits at the end instead of being absolutely positioned; one `--page-gutter` (16-48 px) replaces fixed `3em` padding.
- Footer: real links to the source, the classic version (tag `v1-classic`) and the GitHub compare view, with a "rebuilt with AI" note.
- Phone fixes: card grids use `minmax(min(220px, 100%), 1fr)` instead of fixed 15 × 20 em boxes; headings scale with the screen; the home split stacks Sell over Buy; dialogs fit the screen; forms have spacing; the notification bar sits under the navbar.

**Check:** `npm run lint` and `npm run build` pass. At 390 px: no sideways scroll, drawer opens, badge counts cart items, switch flips the theme and survives a reload.

**Changed by hand:** —

## 3b. Fixes after review (Claude Code)

**Prompt:** Chrome doesn't follow the system or browser theme. On phones make the menu and cart icons bigger, with the menu at the navbar edge. Give the update dialog an X at the top right, a styled title, and the site's font.

**Changes**
- Theme switch: flipping back to the mode the system uses clears the saved choice, so the app follows the system again. (A flip saved during testing had pinned Chrome to one mode.)
- Phone navbar: menu and cart icons are 32 px, as large as the logo; the menu button sits on the right edge (the hidden desktop column no longer reserves space).
- New `DialogHeader` (title, item name in mono accent, X button) used by the Update and Remove dialogs; dialogs set the site font explicitly, dim the page behind them, and close cleanly with Escape. Remove gets a confirm line and a red Remove button.
- Sharp edges everywhere: MUI's round ripples are off; focus shows as a square 2 px outline in the side's colour.

**Check:** lint and build pass; verified in Chrome at 390 px.

**Changed by hand:** —

## 4. Home hero and images (Claude Code)

**Prompt:** Home hero and image optimisation: split Sell/Buy hero that stacks on phones; images converted to WebP/AVIF under 200 KB each; hover and focus motion.

**Changes**
- Photos: the two 1.8-1.9 MB JPEGs are replaced by 640 px and 1200 px AVIF and WebP versions (38-198 KB each) in `src/assets/home/`, served through `<picture>` with `srcset`/`sizes` so a phone or a 1x screen loads a ~40-55 KB AVIF.
- Each half is one link (the old `<button>` inside a `<Link>` is gone), with the photo as a real `<img>`, a big italic mono label on the side colour, a one-line tagline and a call to action.
- Hover and keyboard focus share one effect: the photo regains colour and zooms slightly, the label lifts onto a bigger hard shadow, the call to action fills with the side colour. All motion is off under `prefers-reduced-motion`.
- A floating top bar with the logo and the theme switch; a gradient from the page background keeps the text readable on any photo in both modes.
- Phones: halves stack and keep their taglines. On touch screens (`hover: none`) the first tap on a half shows the hover look and the second tap opens it; tapping the other half moves the highlight. Desktop clicks and keyboard Enter open straight away. `:hover` styles only apply where a pointer can hover, so they don't stick after a tap.
- No blue tap flash on phones (`-webkit-tap-highlight-color: transparent` on `html`). Nav links, the logo and the hero halves can't be dragged or have their text selected (`draggable={false}` for Firefox, `-webkit-user-drag: none` and `user-select: none`); the hero photo ignores the pointer, so a long press acts on the link.

**Check:** lint and build pass; checked at 1280 px (light, dark, hover, Tab focus, one-click open) and with touch emulation at 360 and 390 px (tap, second tap, switching halves).

**Changed by hand:** —

## 5. Product card, seed pictures, image picker (Claude Code)

**Prompt:** Product card: picture, name, price in mono, stock chip with a low-stock warning, add-to-cart feedback, loading skeleton. Product pictures: seed images in `src/assets/products/`; Add Item gets an image picker (FileReader → data URL kept in state).

**Changes**
- `Item.image` is now a URL string instead of a `File` (a `File` can't be stored in Redux or saved later). The five placeholder items ("1 name" … "5 name") became real products with descriptions, prices, mixed stock levels and pictures.
- Seed pictures: five Unsplash photos (no brand logos) cropped to 640 × 480 WebP, 2-10 KB each, sources in `src/assets/products/CREDITS.md`.
- New `ProductCard` used by Buy and Sell: 4:3 picture, stock chip on the picture ("12 in stock", orange "Only 3 left" at 3 or fewer, red "Sold out"), name, two-line description, mono price, buttons pinned to the bottom so cards in a row line up. Hard shadow lift on hover where a pointer can hover. Skeleton shimmer while the picture loads; a missing or broken picture shows the item's first letter instead. Motion off under reduced motion.
- Buy: "Add to cart" turns into "✓ Added", which fades out into a stepper (`CartStepper`: − | quantity | + and a clear button). The quantity can be typed (Enter or leaving the field applies it, capped at the stock), + stops at the stock, and reaching 0 by −, typing 0 or the clear button brings back "Add to cart". Keyboard focus moves to + after "Added" and back to "Add to cart" at 0; adds and changes are announced to screen readers; the stepper is the button's height so the card doesn't jump. New `setCartItemNum` reducer sets an exact quantity. Empty state when nothing is in stock. (Stepper design from the user's review.)
- Sell: Update and Remove are outlined buttons with icons (Remove in red). Empty state links to Add Item.
- New `ImageField` on Add Item: choose a picture with the button, by clicking the empty frame, or by dropping a file on desktop; preview with Change and Remove; rejects non-pictures and files over 15 MB. The file is read with FileReader and scaled on a canvas to at most 960 px (WebP, JPEG where WebP can't be written), so a several-MB phone photo becomes ~25-150 KB in state.
- Prices keep their cents (`parseInt` turned 149.50 into 149) and display as `$89` / `$149.50`.
- `.visually-hidden` moved to the global styles (used by the home page and the Buy announcements).

**Check:** lint and build pass. Chrome at 1280 px light and dark, 390 and 360 px: all pictures load, no sideways scroll. Cart controls: Added → stepper after 1.2 s, + + − gives 2, typing 99 caps at 40, typing 5 sets 5, typing 0 / − at 1 / clear return to Add to cart, + disabled at the stock, keyboard focus follows, card height unchanged, at 1280 and 360 px. Add Item with a 3000 px, 700 KB photo: preview is a 25 KB WebP data URL, the new item shows on Sell with its picture and `$149.50`. Pictures held back on the network show the skeleton; failed pictures show the letters.

**Changed by hand:** —

## 6. Cart and both Track pages (Claude Code)

**Prompt:** Cart: line items with a quantity stepper, subtotal, order button, a friendly empty state. Track pages: Track Shipment lists `orderedItems` with a simulated status line (Ordered → In delivery → Delivered). Track Sold shows sold quantity per item.

**Changes**
- Orders: each order line now keeps `orderedAt` and a snapshot of the item's name, price and picture, so later edits or removals by the seller don't change past orders. Lines placed together share one `orderId`. `addItemToOrdered` became `placeOrder`, which adds the lines and takes them out of the cart in one step; the unused `isInDelivery` / `isDelivered` flags are gone (the status is worked out from the time).
- Cart: line items with picture, name, unit price, the `CartStepper` and a line total; a sticky summary (items, free delivery, subtotal, Place order, "no payment is taken" note). If the stock dropped below what's in the cart, the line says how many will be ordered and the subtotal counts only those. One Place order button orders everything; the cart then shows "Order #XXXXXX placed" with Track shipment / Keep shopping. Empty cart: a friendly message and a Browse the shop button. Desktop: lines and summary side by side; tablets and phones: summary below, and on phones the stepper and total sit under the name.
- Track Shipment: orders newest first, each with its short id, time, item count and total, a live status line ("Packing · ships in 12 s", "On its way · arrives in 28 s", "Delivered at 10:44"), a three-step bar (square markers, fills over time, green when delivered) and its items. Delivery is simulated (ships after 15 s, arrives after 45 s) and the page says so. The clock only ticks while an order is on its way; screen readers hear the step changes, not every second.
- Track Sold: total units, orders and revenue, then one row per item with units sold, revenue (at the price each order paid) and the stock left, sold items first; items the seller removed but sold still show, marked "No longer listed".
- Shared: `EmptyState`, `ProductThumb`, `useNow`, `utils/orders.ts`, and `LOW_STOCK` in `constant/stockConstant.ts`.
- The quantity field in `CartStepper` no longer draws the focus outline inside the box (user's review).

**Check:** lint and build pass. The plan's path at 360 px with no sideways scroll: Buy → add headphones, 3 mugs, 3 lamps → seller drops the lamp stock to 1 → Cart shows the warning and a $176 subtotal for 5 items → Place order → Track Shipment goes Ordered → In delivery (17 s) → Delivered (47 s) → Track Sold shows 5 units, 1 order, $176, the lamp sold out → Buy no longer lists the lamp. Same pages checked at 1280 px dark; empty states for Cart, Track Shipment and Track Sold.

**Changed by hand:** —
