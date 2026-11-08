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
