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
