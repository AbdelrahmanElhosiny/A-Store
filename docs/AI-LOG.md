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

## 7. Sign up, login, guest-cart merge, persistence (Claude Code)

**Prompt:** Sign up and login: a real Formik/Yup sign-up that adds a user to state; login picks a demo account; the guest cart moves into the user's cart on login. Persistence: save items and users to localStorage (RTK listener middleware, throttled), plus a "Reset demo data" button.

**Changes**
- Log in opens a dialog listing the accounts (Ahmed, Omar and any created here), each a button with its initial and address; no passwords, and the dialog says so. Esc, the X or a tap on the backdrop closes it. "New here? Create an account" links to sign up.
- On login, the guest's cart moves into the account: quantities of the same item add up but stop at the stock (and never drop below what the account already had). The guest's orders move too, so Track Shipment doesn't look empty after logging in mid-way. The dialog and the sign-up page say what comes along ("Your cart (3 items) comes with you."). Logging out goes back to the guest with an empty cart. The hard-coded "always Omar" login and the `TODO: transfer data from guest to user` are gone.
- Sign up is a real page under each side (`/buy/sign-up`, `/sell/sign-up`, so it keeps that side's nav and colour): name, delivery address, optional second line, ZIP code and phone, with Yup checks (name 2-24 characters and not taken, ignoring case; ZIP format; phone with at least 7 digits). It adds the account, logs straight into it and returns to the page Sign up was clicked from. Demo accounts are offered next to the form (under it on phones). If someone is already logged in, the page says so with Log out / back buttons. `zipCode` and `phoneNum` are strings now (a number drops leading zeros and "+"); the seed accounts got realistic addresses.
- Persistence: a listener middleware saves `items` and `users` to localStorage (`a-store-data`, versioned) at most twice a second, and flushes on `pagehide`. Seed pictures are saved by name and turned back into the current build's URL on load, so a new deploy doesn't break them. Broken, old or blocked storage falls back to the seed data; if the browser refuses to save (storage full), a one-time warning says so.
- "Reset demo data" in the footer asks first, then a shared `resetDemoData` action puts both slices back to the starter data and clears the saved copy.
- Nav buttons read "Log in" / "Log out". `DialogHeader` takes a `titleId` for the dialog's label.

**Check:** lint and build pass. Chrome at 360 px: guest adds a mug → Log in as Omar (cart moves) → Omar adds a watch → Log out (empty cart) → guest adds 2 watches → Log in as Omar gives mug 1, watch 2 (capped at the stock of 2) → refresh keeps Omar and the cart. Sign up: empty submit shows four errors, " omar " and phone "123" show "taken" and "At least 7 digits", then Sara signs up, lands back on the cart with the guest's 3 lines. Sell: an added item survives a refresh. Reset brings back the five items and the guest, clears storage, and a refresh stays reset. Login dialog closes on Esc and the backdrop. 1280 px dark checked; no sideways scroll; no console errors.

**Changed by hand:** —

## 8. Sell-side dialogs and Snackbar toasts (Claude Code)

**Prompt:** Sell side: item table or grid with edit and remove in MUI dialogs; MUI Snackbar toasts with auto-hide replace the yellow bar. (Also from earlier reviews: the Price label only moved up on focus, and the Update dialog had no picture picker.)

**Changes**
- New `AppDialog` on MUI `Dialog` (focus trap, Esc, backdrop click, scrolls inside when taller than the screen, no animation under reduced motion) with the sharp Gruvbox look. It renders outside the page, so it adds the side's class itself and keeps the sell/buy colour. Update, Remove, Log in and Reset demo data all use it; the native `<dialog>` code and its global style are gone.
- Update dialog: the same fields as Add Item through a shared `ItemFields`, including the picture picker (change or remove the picture). "Save changes" stays disabled until something changes. The stock can go down to 0 to mark an item sold out; a new item still needs at least 1.
- Shared item checks (`pages/Sell/itemSchema.ts`): clear messages ("Enter a price", "At most 2 decimals", "Enter a whole number"); a price like $0.50 is now allowed (the old rule rejected anything under $1 with a message about 0); an empty field shows "required", not "not a number".
- Price field: the label sits after the "$" while empty and moves up on focus or when it has a value, including a value filled in by the Update dialog. The padding workarounds are gone. Price and stock are text inputs with decimal/numeric keyboards, so the mouse wheel and the spinner can't change them.
- Toasts: `Toaster` (MUI `Snackbar`) replaces the yellow bar: inverted colours with a coloured bar for the kind, icon, close button, bottom centre (full width on phones). It hides after 4 s, or 8 s for warnings and errors; a click elsewhere doesn't dismiss it; a repeated message restarts the timer. Toasts no longer disappear on page change, so "Welcome, Sara!" survives the redirect after sign up. Messages: item added / saved / removed, logged in / out, account created, demo data reset, storage full.
- Sell home: a header with the item and unit counts and an "Add item" button; an empty state; the buttons name their item for screen readers ("Update Desk lamp"). One state for the open dialog replaces the mixed `removedItemName` / `updatedItem` state, and the item stays set while its dialog closes.
- Fix: removing an item now also takes it out of every cart. Before, it stayed in the cart data and still counted in the cart badge.
- Add Item: "Add item" / outlined "Clear" buttons.

**Check:** lint and build pass. Chrome at 360 px: Update Desk lamp opens with the sell colour, the price label up and Save disabled; "12.345" and "-1" show "At most 2 decimals" and "Can't be below 0"; $49.50 with stock 0 saves, the card shows $49.50 and Sold out, and the toast is gone after 5 s. Removing the mug, which was in the guest's cart, hides the cart badge. Add Item: the empty price label sits inside the box, moves up on a click and stays up with a value; an empty submit shows four messages; Kettle is added and the form clears. Esc closes the dialog; the login and reset toasts show. 1280 px dark checked; no console errors.

**Changed by hand:** —

## 9. Motion, 404, error boundary, accessibility (Claude Code)

**Prompt:** Motion: page transitions and list add/remove with Motion (the motion package, formerly framer-motion); everything off under prefers-reduced-motion. Errors: styled 404 page and a top-level error boundary (react-error-boundary is already installed but unused). Accessibility: no button inside a link, visible focus rings, WCAG AA contrast in both themes, labelled inputs, keyboard-usable cards.

**Changes**
- Motion (`motion@12.43.0`, a new dependency): `MotionProvider` uses `LazyMotion` with the animation features in their own chunk (29 kB gzip, loaded after the first paint) and the small `m` components. Pages fade and rise in on route change (entrance only, so navigation is never held up). Cards on Buy and Sell and the lines in the Cart pop in and out, and the rest slide into place (`AnimatePresence` with `popLayout`, `layout="position"`). Shared presets live in `styles/motion.ts`.
- Reduced motion: every animation takes 0 s (things still appear and disappear, nothing moves or fades). It follows the system setting live through MUI's `useMediaQuery`; motion's own `useReducedMotion` reads the setting only once.
- 404: a styled page (big "404" block, the address that wasn't found, buttons to the side's home and the home page) shown inside the side's layout, so the nav is there. Unknown addresses under `/buy` and `/sell` keep their side; any other address uses the Buy layout.
- Error boundaries (react-error-boundary): one around each page inside the layout (the nav stays; going to another page clears it) and one around the whole app (full screen). `ErrorFallback` offers "Try again" and "Reset demo data", which clears saved data from an older version, the likeliest cause of a crash. Development builds also show the error message.
- Contrast (axe-core): muted text failed AA on cards in both themes (3.5 light, 4.2 dark), and so did purple/blue/red text on cards and the navbar in dark mode (4.2/4.3/3.4). Muted text now uses Gruvbox's fg3 grey; dark purple and blue are 10% lighter, dark red is mixed 40% toward the text colour (softer, more coral), and light green and orange are a little darker. All in `theme.ts`, marked as accessible variants.
- Focus: MUI buttons removed the outline on focus, so keyboard users saw no ring on any MUI button; the theme now gives them the same square ring. A "Skip to content" link appears on the first Tab. After a click on a link, the page scrolls to the top and focus moves to the new page's heading, so the keyboard and screen readers start there (the first load keeps the browser's own focus, also under StrictMode).
- Structure: each side has a visually hidden `h1` in the header ("A-Store shop" / "A-Store seller tools"), so page titles stay `h2` and the heading levels don't skip. Every page sets the browser tab title ("Cart · A-Store") with `useDocumentTitle`.
- Already fine and checked: no button inside a link (the home hero was fixed in task 4; other links use `component={Link}`), every input has a label (axe `label` rule), and card buttons and steppers are reachable and usable from the keyboard.

**Check:** lint and build pass. axe-core 4.10 (WCAG 2.1 A/AA + best practice) reports nothing on Home, Buy, Cart, Track Shipment, Sign up with errors, Sell, the Update dialog, Add Item, Track Sold, the 404 page and the Login dialog, in light and dark (before: 175 contrast problems, a missing h1, and a 404 nested inside a second layout, caused by a route edit in this task and fixed). Chrome: the first Tab shows the skip link, Enter moves to the content, the next Tab rings "Add to cart"; going to Cart focuses its heading at the top with the title "Cart · A-Store"; mid-transition opacity ~0.5 then 1; a removed card leaves while the next one slides over. With reduced motion: no fade (opacity 1 right away) and a removed card leaves at once. Broken saved orders crash only Track Shipment (the nav stays) and Reset brings it back; a broken saved cart crashes the nav, shows the full-screen fallback, and Reset brings the app back.

**Changed by hand:** —

## 9b. Review changes: dark-mode colours, stock arrows (Claude Code)

**Prompt (user's review):** Change back the colours to be higher in contrast; I want the red instead of the soft coral. On the item edit page, add an up arrow and a down arrow, good for the stock (maybe not the price).

**Changes**
- Dark mode is back to the original Gruvbox accents (bright red, purple, blue and grey). The contrast comes from a darker surface instead: cards, the navbar, the footer and dialogs use Gruvbox `bg0_s` (#32302f) instead of `bg1` (#3c3836). Purple (4.8), blue (4.9) and grey (4.7) now pass AA on them. Text on filled red buttons uses Gruvbox's darkest background (4.8). Light mode keeps the task 9 values.
- Known gap, by choice: the bright red stays below AA as small text in dark mode: the outlined Remove buttons on cards (3.8:1) and form error messages on the page (4.3:1). Everything else passes axe in both themes.
- New `StockField` for Stock on Add Item and in the Update dialog: ▲ / ▼ buttons stacked at the right of the field, full height, square. They stop at the minimum (1 for a new item, 0 when updating) and at 9,999, and an empty field counts as 0. The arrow keys do the same while typing, so the buttons stay out of the Tab order. The input is a `spinbutton` with its current value and limits for screen readers. The price keeps its plain field.

**Check:** lint and build pass. Update Desk lamp (3): ▲ gives 4 and enables Save; ▼ five times stops at 0 with ▼ disabled; ArrowUp twice gives 2 and ArrowDown gives 1; saving shows "Only 1 left". Add Item: ▼ is disabled while empty, ▲ gives 1, and ▼ is disabled at 1. Checked in light and dark at 390 px. axe: light clean; dark only the red text above.

**Changed by hand:** —

## 10. Lighthouse pass and version chip (Claude Code)

**Prompt:** Lighthouse pass (mobile 90+ in Performance, Accessibility, Best Practices and SEO; lint and build with no warnings) and the version chip: a small fixed chip, "AI-enhanced · see the classic version", linking to the classic address and to the GitHub compare view master...AI-enhanced.

**Changes**
- Code splitting: only the home page is in the first download; every other page is `React.lazy`. React, the router, Redux and Emotion share a `vendor` file that stays cached across deploys; MUI is split by page. The first load went from 225 kB to 119 kB gzip, and the "chunk larger than 500 kB" build warning is gone.
- lodash: `import _ from "lodash"` shipped the whole library (70 kB raw) for seven functions; each is imported on its own now (`lodash/findIndex`, …).
- The page a visit starts on: its code (layout plus page) is fetched in one go, not one level at a time. In the built `index.html`, a small script starts those downloads together with the main code (`modulepreload`), plus the home photos on `/` and the first product picture on `/buy` and `/sell` (vite plugin `preload-start-page`, file names read from the build).
- After the first paint: both sides' home pages are prefetched once the page has loaded and the browser is idle, and so is the animation code. Until it arrives, new items and pages simply appear; nothing can stay hidden. Tested with the file blocked: removing a card and changing pages still work. Animations moved from around the whole app into the Buy/Sell layout, so the home page doesn't download them. The page a visit starts on no longer fades in (its fade had to wait for the animation code).
- Fonts: the three JetBrains Mono files are cut down to Latin (with · → × … − and the ligatures), 92-96 kB to 35-37 kB each.
- Images: a 900 px size of both home photos (AVIF 52-76 kB, WebP 95-150 kB) between 640 and 1200, which fits a phone screen at 2x; the hero photo and the first four product pictures load with high priority instead of lazily.
- The app's CSS (under 1 kB) is put into `index.html` instead of a render-blocking `<link>`.
- SEO: a meta description, `theme-color` for light and dark, and `public/robots.txt`.
- Version chip (`VersionChip`): fixed bottom-left, inverted colours, "AI-enhanced · See the classic version · Changes" ("Classic version" on phones), opening in a new tab, with an × that hides it for good (saved in the browser). The classic link reads `VITE_CLASSIC_URL` (set it on Vercel once the classic site is live) and falls back to the `v1-classic` code on GitHub.
- `tsconfig.node.json` gets `target: ES2020`, so `vite.config.ts` type-checks on its own.

**Check:** lint and build pass with no warnings. Lighthouse 12.8 mobile on the production build, seven pages (Home, Buy, Sell, Cart, Track Shipment, Add Item, Sign up), over HTTP/2 with brotli like a CDN: Performance 94-98, Accessibility 100 (95 on Sell: the dark-mode red Remove buttons, kept by choice in 9b; Lighthouse ran in dark mode), Best Practices 100, SEO 100. Before this task Home was 73 / 100 / 100 / 83 and Buy 89 / 100 / 100 / 83. On `vite preview` (HTTP/1.1, gzip) Performance is 87-93, because the page's small files queue on 6 connections. Production build in Chrome at 360 px: Home → Buy → add a mug → Cart; a direct load of `/sell` preloads its files and the first picture; removing cards works with and without the animation code; the chip fits on one line, hides, and stays hidden after a refresh; no console errors.

**Changed by hand:** —
