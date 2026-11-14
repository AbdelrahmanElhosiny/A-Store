# Phase G: Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the finished marketplace safe to leave open in two tabs, then check every new page against the targets the AI-enhanced work set (axe, Lighthouse, 360 px), document the demo, and prepare the branch for review.

**Architecture:** Task 1 closes the one cross-cutting gap the earlier plans left open. Each open tab saves to the same localStorage key and runs its own Auto-ship timer. A `storage` listener loads the other tab's save into this tab, and Auto-ship only ticks in the visible tab. Task 2 changes no behaviour: it measures, fixes what the measurements find, and writes the README and AI-LOG.

**Tech Stack:** As before. Chrome DevTools (Lighthouse, axe DevTools extension or `@axe-core/cli` run with `npx`, nothing added to `package.json`).

**Spec:** `docs/superpowers/specs/2026-11-13-marketplace-overhaul-design.md` ("Phase G: check", Risks: Lighthouse scores, the classic-vs-AI comparison, localStorage size).

## Global Constraints

- Branch `marketplace`. No major version upgrades. One task = one commit = one `docs/AI-LOG.md` entry (this phase writes 38 and 39). No Claude/Anthropic attribution in commit messages. Commit, tag, push or open a PR only when the user asks.
- `npm run lint`, `npm run build` and `npm test` pass after every task.
- Gruvbox tokens and sharp edges (radius 0).
- Targets from task 10: 90+ on all four mobile Lighthouse scores (Performance, Accessibility, Best Practices, SEO). The dark-mode red Remove buttons from 9b are the one known accessibility gap allowed to remain.

## Review Focus

1. **Two tabs open, an order placed in tab A, tab B then edits a product.** Expected: tab B's save includes A's order; nothing is lost. Pinned in Task 1 (`crossTab.test.ts` › "a storage event replaces the persisted slices").
2. **A storage event carrying a broken or old save** (another tab still on an old build). Expected: it is ignored and this tab keeps its state, with no toast loop. Pinned in Task 1 (`crossTab.test.ts` › "ignores invalid saves").
3. **Auto-ship with two tabs.** Expected: only the visible tab ticks; a hidden tab catches up when it becomes visible, through the backfill Phase E already has. Pinned in Task 1 (`autoShipTimer.test.ts` › "pauses while hidden").
4. **The hydrate itself triggering a save.** Expected: loading another tab's data doesn't write it straight back (no ping-pong between tabs). Pinned in Task 1 (`crossTab.test.ts` › "hydrate does not save").
5. **Storage full after many uploaded pictures across stores.** Expected: today's one-time warning still shows, and the app keeps working in memory. Checked by hand in Task 2 Step 4 (the existing warning has no automated test because jsdom's quota can't be filled reliably).

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/app/hydrate.ts` (new) | `hydrateFromStorage` action |
| `src/app/crossTab.ts` (new) | `startCrossTabSync(store)`: the `storage` listener |
| `src/app/store.ts` (modify) | The persist predicate ignores `hydrateFromStorage`; the app store starts cross-tab sync |
| `src/features/*Slice.ts` (modify) | The five persisted slices replace their state on `hydrateFromStorage` |
| Phase E's Auto-ship timer module (modify) | Tick only while `document.visibilityState === "visible"` |
| `README.md` (modify) | Demo accounts, the two modes, the guided tour, how to run tests |
| `docs/AI-LOG.md` (modify) | Entries 38 and 39; the header points at the marketplace plan too |

---

### Task 1: Two-tab safety

This task is not in the spec. Planning found the gap (Phase E's contract gap 3), and this is my call. Drop it if you'd rather keep the limitation and note it in the README.

**Files:**
- Create: `src/app/hydrate.ts`, `src/app/crossTab.ts`
- Modify: `src/app/store.ts`, `src/app/persist.ts` (export `parseSaved(raw: string): PersistedState | undefined`, which `loadState` now uses), `src/features/accountsSlice.ts`, `sessionSlice.ts`, `storesSlice.ts`, `itemSlice.ts`, `ordersSlice.ts`, the `reviews` slice from Phase F task 24, the Auto-ship timer from Phase E Task 1, `docs/AI-LOG.md`
- Test: `src/app/__tests__/crossTab.test.ts`, `src/features/__tests__/autoShipTimer.test.ts` (or extend Phase E's Auto-ship test file)

**Interfaces:**
- Consumes: `setupStore`, `loadState`/`saveState`, `STORAGE_KEY` (export it from `persist.ts` if it isn't already), Phase E's `startAutoShip(store)`, and the `reviews` slice (Phase F task 24).
- Produces:

```ts
// src/app/hydrate.ts
export const hydrateFromStorage: ActionCreatorWithPayload<PersistedState>; // type "app/hydrateFromStorage"
// src/app/crossTab.ts
export const startCrossTabSync: (store: ReturnType<typeof setupStore>) => () => void; // returns the unsubscribe
// src/app/persist.ts
export const parseSaved: (raw: string) => PersistedState | undefined; // undefined for invalid or old versions
```

- [ ] **Step 1: Write the failing tests**

`crossTab.test.ts` uses `setupStore(buildSeed(0))` and `startCrossTabSync(store)`, then fires `new StorageEvent("storage", { key: STORAGE_KEY, newValue })`.
- "a storage event replaces the persisted slices": `newValue` is a valid v2 save in which order `A-10013`'s Tick & Tock shipment is `packed`. After the event the store reads it as `packed`. `notification` is untouched.
- "ignores invalid saves": `newValue` is `"{"`, then `{"version":1}`, then `null` (another tab cleared storage). The state is unchanged each time, and no notification is dispatched.
- "ignores other keys": an event for the key `"a-store-theme"` changes nothing.
- "hydrate does not save": spy on `saveState`, fire a valid event, advance timers by 1 s, and expect 0 calls.

`autoShipTimer.test.ts` › "pauses while hidden": fake timers, a non-seed placed shipment in a store with `autoShip` on and its seller signed out.
- With `document.visibilityState` stubbed to "hidden", advancing 60 s leaves it `placed`.
- Switch to "visible" and fire `visibilitychange`, advance 1 s, and it is `shipped`. The backfilled history times are 20 s apart from `placedAt`.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/app/__tests__/crossTab.test.ts src/features/__tests__/autoShipTimer.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement**

- Every persisted slice adds `builder.addCase(hydrateFromStorage, (_, { payload }) => payload.<slice>)`. `reviews` falls back to `payload.reviews ?? []`.
- The persist listener's predicate adds `!hydrateFromStorage.match(action)`.
- `startCrossTabSync` listens on `window` `storage`. It ignores other keys, calls `parseSaved(event.newValue)` and dispatches `hydrateFromStorage` when valid.
- A `null` `newValue` (Reset in another tab) is ignored too. The other tab's Reset already cleared storage, and this tab's next change saves its own state again, which is acceptable for a demo. Note this in the README.
- The app `store` calls `startCrossTabSync(store)` once.
- The Auto-ship tick returns early while `document.visibilityState !== "visible"`.

- [ ] **Step 4: Run tests, lint and build**

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 5: Check by hand and commit**

1. Open the app in two windows side by side.
2. Place an order as Ahmed in A.
3. B's Orders page shows it without a refresh.
4. In B, switch to Tick & Tock and mark it packed. A's order page shows "Being packed by Tick & Tock".
5. Leave A in front and B hidden for a minute. Only one tab moves Auto-ship orders, and nothing jumps back.

Add `## 38. Two tabs stay in step (Claude Code)` to `docs/AI-LOG.md`.
```bash
git add src/app src/features docs/AI-LOG.md && git commit -m "Keep two open tabs in step and run Auto-ship only in the visible tab"
```

---

### Task 2: Final check, README, and the branch ready for review

**Files:**
- Modify: whatever the checks below find (each fix is listed in the AI-LOG entry), `README.md`, `docs/AI-LOG.md`

- [ ] **Step 1: Accessibility (axe)**

Build and preview (`npm run build && npm run preview`). Run axe (the DevTools extension, or `npx @axe-core/cli <url> --exit`) in light and dark mode on every route.
- **Buyer pages:** `/`, `/c/watches`, `/search?q=watch`, `/p/item-tt-smart-watch`, `/store/tick-tock`, `/cart` (with items), `/checkout` (as Ahmed), `/account`, `/account/orders`, `/account/orders/order-A-10001`, `/account/addresses`, `/account/payments`, `/account/saved`, `/sign-up`.
- **Seller pages**, as Mona: `/seller`, `/seller/orders`, `/seller/orders/order-A-10012`, `/seller/products`, `/seller/products/new`, `/seller/products/item-tt-smart-watch`, `/seller/customers`, `/seller/customers/acc-ahmed`, `/seller/store`, `/seller/sign-up` (signed out).
- **Signed out:** the seller pick page (`/seller`).
- **Overlays:** the account menu open, the phone drawer open, the login dialog open, the filter panel open, and the notifications list open.

Expected: no violations except the known 9b red Remove buttons in dark mode. Fix anything else at its source, so the same component isn't fixed page by page.

- [ ] **Step 2: Lighthouse (mobile, simulated throttling, fresh profile)**

Run it on `/`, `/c/watches`, `/p/item-tt-smart-watch` and `/seller` (Pick your store; Lighthouse starts signed out). Expected: 90+ on all four scores on each page.
- If Performance drops below 90, check first that `START_CODE`/`ROUTE_SOURCES` cover the page's chunks and that the hero picture on `/` is preloaded with high priority (Phase E removed the first-product preload).
- Next, check that the header didn't pull menus or dialogs into the first load (Phase C split them out).
- Record the four scores per page in the AI-LOG entry.

- [ ] **Step 3: 360 px pass**

In Chrome device mode at 360 × 740, open every route from Step 1 and the overlays, in both themes.
- Expected: no sideways scroll. Check by running `document.documentElement.scrollWidth <= 360` in the console.
- Long names must wrap or truncate with an ellipsis, never overflow. Test with a store signed up as "The Extremely Long Store Name Co." and a buyer "Alexandria-Maryam".

- [ ] **Step 4: Storage and Reset**

1. As a new store, upload 15 large photos.
2. Confirm the storage-full warning shows once and the app keeps working.
3. Reset demo data brings back the seed, and the warning can show again afterwards.
4. If the warning shows before about 15 uploads, lower the upload resize in `src/utils/readImage.ts` from 960 px to 640 px (the spec's Risks table suggests it) and record it in the AI-LOG entry.

- [ ] **Step 5: README**

Replace the old Buy/Sell description with:
- the two modes and the switch;
- the seed accounts (buyers Ahmed, Omar and Nour; stores Tick & Tock, Carry Co., Pocket Signal and Hearth Lane with their owners);
- the guided tour;
- the Stripe test cards, including the declined one;
- the cross-tab note from Task 1;
- `npm test`.

Keep it short and keep the links to the classic version and the AI log.

- [ ] **Step 6: Run everything and commit**

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

Add `## 39. Marketplace check: axe, Lighthouse, 360 px, README (Claude Code)` with the scores. Update the AI-LOG header line "One entry per AI-assisted task on `AI-enhanced`" to mention entries 11+ on `marketplace`, and link the marketplace plan doc (https://claude.ai/artifact/2tKmriyRm2Zm5q6PyQxemm).
```bash
git add -A && git commit -m "Check the marketplace: axe, Lighthouse, 360 px; update the README"
```

- [ ] **Step 7: Prepare the merge (only when the user asks)**

These come from the spec's Risks table:
1. Tag `ai-ui-v1` on `AI-enhanced` before merging, so the UI-only diff stays reachable. Point the version chip's "Changes" link at `master...ai-ui-v1` if the user wants that kept.
2. Open a PR `marketplace` → `AI-enhanced`. The description summarises the phases and links the plan doc and `docs/superpowers/plans/`. It carries no Claude or "Generated with" line.

Don't tag, push or open the PR without the user's go-ahead in that message.

---

## Self-review notes

- Spec coverage for Phase G: re-running axe and Lighthouse on the new pages with task 10's targets, and the 360 px pass, are Task 2. The Risks table's tag and PR are Step 7. The localStorage size risk is checked in Task 2 Step 4.
- Task 1 is an addition from planning. It is flagged as my call so the user can drop it.
