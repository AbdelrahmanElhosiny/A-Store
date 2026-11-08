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
