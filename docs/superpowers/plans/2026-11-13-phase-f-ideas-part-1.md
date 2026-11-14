# Phase F (part 1): Variants, deals, fees, declined card, wishlist, recently viewed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first six picked ideas: product variants with their own price and stock, deals with a "was" price, delivery fees per store, a test card that is declined at checkout, a wishlist with a Saved page, and a recently viewed row.

**Architecture:**
- **Variants are summed on write.** One pure helper, `withVariantTotals`, sets `item.stockNum` to the sum of the variants and `item.price` to the lowest variant price. `itemSlice` runs it on every write, so the listing, stock chips, sorts and seller figures from Phases D and E keep reading `item.stockNum` and `item.price` unchanged.
- **Pure modules decide, pages stay thin:**
  - `variants.ts`: combinations, id-stable regeneration, totals.
  - `pricing.ts`: "from" price, on-sale, percent off.
  - `delivery.ts`: one fee rule, shared by checkout and `buildOrder`.
  - `checkoutActions.ts`: the payment check that sits in front of Phase A's `placeOrder`.
- **Account lists:** the wishlist and recently viewed lists live on `BuyerAccount` (Phase A fields). They are filtered to active items when read, never rewritten on archive.

**Tech Stack:** React 18, react-router-dom 6 (`useSearchParams`), RTK 1.9, MUI 5 (`@mui/icons-material` 5 for the heart), Formik + Yup, Vitest + Testing Library (from Phase A).

**Spec:** `docs/superpowers/specs/2026-11-13-marketplace-overhaul-design.md`, these sections:
- "Ideas for you to pick": Product variants, Deals, Delivery fees per store, Declined test card, Wishlist, Recently viewed;
- Phase F tasks 16 to 21;
- Decisions: "Card data";
- Builder notes: "Small defaults" (delivery free until task 18).

Builds on the Phase A–E plans in `docs/superpowers/plans/`.

## Global Constraints

- **Workflow:**
  - Branch `marketplace`. No major version upgrades (React 18, MUI 5, RTK 1.9, react-redux 8, react-router 6, Vite 5 stay). No new runtime dependencies.
  - One spec task = one commit = one `docs/AI-LOG.md` entry. This plan writes entries 26 to 31 in the existing format: `## N. Title (Claude Code)`, `**Prompt:**`, `**Changes**`, `**Check:**`, `**Changed by hand:** —`.
  - No Claude/Anthropic attribution in commit messages. Commit only when the user has asked.
  - `npm run lint`, `npm run build` and `npm test` pass after every task.
- **Look:** Gruvbox tokens from `src/styles/tokens.ts` only, sharp edges (radius 0) on every new surface (picker buttons, price badge, heart button). Buyer pages keep the `buy` class, seller pages `sell`. Nothing scrolls sideways at 360 px.
- **Card data:** only `brand`, `last4`, `expMonth`, `expYear`, `holder` and `nickname` are stored, plus one flag, `declines: true`. Task 4 explains why the flag is allowed. The full number and the CVV never reach Redux or localStorage.
- **Mode:** the URL decides the mode, and the mode is never stored. Every path comes from `ROUTES`.
- **Ownership:** a seller only sees and changes their own store (Phase E's `useSellerStore`). This plan adds no cross-store reads.
- **Saved data:**
  - Fields Phase A's types already declare (`options`, `variants`, `compareAtPrice`, `deliveryFee`, `freeDeliveryOver`, `wishlist`, `recentlyViewed`) need no `VERSION` bump.
  - The one new field, `PaymentMethod.declines`, is optional, and a missing value means "not a declining card".
  - Seed changes reach a browser only on first load or Reset demo data. An existing save keeps its own data.
- **Seed numbers that must not move:** Phases D and E pin prices, stock, unit counts, order totals and store revenue on the seed. Every seed change below keeps them. Variant sums equal the Phase A stock, the cheapest variant equals the Phase A price, and seed orders keep `deliveryFee: 0`.

## Review Focus

1. **A cart line whose variant the seller removed** (they edited the options while the line sat in a cart).
   - Expected: the line leaves every cart on save.
   - An older save that still holds it shows the line as "No longer available: won't be ordered", with Remove, instead of hiding it while the cart badge still counts it.
   - Pinned in Task 1: `itemVariants.test.ts` › "updateItem drops cart lines whose variant is gone", and `cart.test.ts` › "joinCart: a missing variant is inactive, not dropped".
2. **Totals that use the item's "from" price instead of the chosen variant's price.**
   - Expected: a Large / Black tote costs $35 in the cart, at checkout and on the order, never $29.
   - Pinned in Task 1: `checkout.test.ts` › "groupCartByStore uses the variant price", and `orderBuild.test.ts` › "variant line takes the variant price and label".
3. **A was price at or below the current price**, after a quick price edit in the products table (Phase E's quick edit doesn't know `compareAtPrice`).
   - Expected: no struck price, no "0% off" or negative badge, and the item leaves "On sale" and Deals.
   - Pinned in Task 2: `pricing.test.ts` › "a was price at or below the price is not a sale".
4. **Trying again after a declined card.** Phase D's double-click guard could stay locked, or the order number could be used up.
   - Expected: switching to another method and pressing Place order works, and the order is `A-10014`.
   - Pinned in Task 4: `Checkout.test.tsx` › "declined, then cash on delivery places A-10014".
5. **An archived product on the Saved page and in the header count.** Phase E keeps wishlist ids when an item is archived.
   - Expected: it disappears from both while archived, and comes back when the seller makes it active again.
   - Pinned in Task 5: `wishlist.test.ts` › "archived items hide from Saved and the count".

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/features/variants.ts` (new) | Option combinations, id-stable variant rows, `withVariantTotals`, lookups |
| `src/features/pricing.ts` (new) | `priceRange`, `itemPriceProps`, `isOnSale`, `percentOff` |
| `src/features/delivery.ts` (new) | `deliveryFeeFor`, `deliveryText`, `freeDeliveryHint` |
| `src/features/checkoutActions.ts` (new) | `submitOrder`: payment check, then Phase A's `placeOrder` |
| `src/features/wishlistActions.ts` (new) | `toggleSaved` thunk (guest → "login") |
| `src/components/PriceTag.tsx` (new) | Price, "from", struck was price, percent off |
| `src/components/LineName.tsx` (new) | Line name with the variant label under it |
| `src/components/VariantPicker.tsx` (new) | One radio group per option on the product page |
| `src/components/SaveButton.tsx` (new) | The heart toggle, icon or labelled |
| `src/components/RecentlyViewedRow.tsx` (new) | The "Recently viewed" section |
| `src/hooks/useRecordView.ts` (new) | Records a product view for the signed-in buyer |
| `src/pages/Seller/Products/VariantsEditor.tsx` (new) | Options and variant rows inside the product form |
| `src/pages/Account/Saved.tsx` (new) | The Saved page |
| `src/features/itemSlice.ts`, `accountsSlice.ts`, `sessionSlice.ts`, `cart.ts`, `orderBuild.ts`, `checkout.ts`, `selectors.ts`, `cardUtils.ts`, `types.ts` (modify) | Variant-aware stock and carts, fees, the decline flag, the list reducers |
| `src/features/listing/listingQuery.ts`, `applyListing.ts` (modify) | `sale=1` |
| `src/components/ProductCard.tsx`, `CartControl.tsx`, `BuyCard.tsx`, `listing/*`, `header/BuyerHeader.tsx`, `header/MenuDrawer.tsx` (modify) | Price tag, "Choose options", heart, On sale filter, Saved link |
| `src/pages/Buy/{Home,Product,StorePage,Cart,Checkout}.tsx`, `src/pages/Account/{AccountLayout,Payments,AddCardForm,OrderPage}.tsx` (modify) | Buyer pages |
| `src/pages/Seller/Products/{ProductFields,productSchema,productForm,ProductFormPage,ProductsPage,BulkStockDialog}.tsx/ts`, `src/features/products.ts`, `src/pages/Seller/{StoreSettings.tsx,storeSettingsSchema.ts}`, `src/pages/Seller/Orders/SellerOrderPage.tsx` (modify) | Seller pages |
| `src/seed/catalogue.ts`, `src/seed/seedOrders.ts` (modify) | Variants, was prices, fees, the declining card, seeded lists |

**Seed facts used below** (`buildSeed(NOW)`, after this plan; `LOW_STOCK` is 3):

| Item (id) | Options | Variants: id suffix, values, price, stock, SKU | Totals (= Phase A) |
| --- | --- | --- | --- |
| Leather watch strap, 20 mm (`item-tt-leather-watch-strap-20-mm`) | Colour: Black, Brown, Tan | `-v1` Black $19 18 `T-007-1` · `-v2` Brown $19 14 `T-007-2` · `-v3` Tan $19 8 `T-007-3` | $19, 40 |
| Canvas tote (`item-cc-canvas-tote`) | Size: Standard, Large · Colour: Natural, Black | `-v1` Standard / Natural $29 10 `C-002-1` · `-v2` Standard / Black $29 7 `C-002-2` · `-v3` Large / Natural $35 5 `C-002-3` · `-v4` Large / Black $35 3 `C-002-4` | $29, 25 |
| Clear phone case (`item-ps-clear-phone-case`) | Size: 5.8 inch, 6.1 inch, 6.7 inch | `-v1` 5.8 inch $12 0 `P-005-1` · `-v2` 6.1 inch $12 35 `P-005-2` · `-v3` 6.7 inch $14 25 `P-005-3` | $12, 60 |

- **Seed order lines** gain a variant at the Phase A line price, so every pinned total holds:
  - A-10002 Canvas tote ×2 → `item-cc-canvas-tote-v1`, "Standard / Natural";
  - A-10004 Clear phone case ×2 → `item-ps-clear-phone-case-v2`, "6.1 inch";
  - A-10008 Leather watch strap ×2 → `item-tt-leather-watch-strap-20-mm-v2`, "Brown".
- **Was prices** (`compareAtPrice`; `price` never changes):

  | Item | Was price |
  | --- | --- |
  | Field watch, 38 mm | 119 |
  | Chronograph, leather strap | 199 |
  | Canvas tote | 39 |
  | Weekender duffel | 149 |
  | Wireless earbuds | 79 |
  | Pour-over coffee set | 48 |

- **Store fees** (`deliveryFee` / `freeDeliveryOver`):

  | Store | Fee | Free over |
  | --- | --- | --- |
  | Tick & Tock | 0 | `null` |
  | Carry Co. | 5 | 50 |
  | Pocket Signal | 7 | 100 |
  | Hearth Lane | 6 | `null` |

  Seed orders keep `deliveryFee: 0`: they were placed before fees existed.
- **Omar** gains a card, after his Mastercard: `{ id: "pm-omar-declines", kind: "card", brand: "visa", last4: "0002", expMonth/expYear: now + 14 months, holder: "Omar Khaled", nickname: "Declines (test)", isDefault: false, declines: true }`. His default stays cash on delivery.
- **Ahmed's lists:**
  - `wishlist: ["item-tt-diver-watch-steel", "item-hl-linen-throw-blanket"]`;
  - `recentlyViewed: ["item-ps-wireless-earbuds", "item-cc-weekender-duffel", "item-hl-pour-over-coffee-set"]`.

  Omar and Nour keep empty lists.

---

### Task 1 (spec task 16): Product variants

**Files:**
- Create:
  - `src/features/variants.ts`, `src/features/pricing.ts`
  - `src/components/PriceTag.tsx`, `LineName.tsx`, `VariantPicker.tsx`
  - `src/pages/Seller/Products/VariantsEditor.tsx`
- Modify:
  - `src/features/itemSlice.ts`, `accountsSlice.ts`, `sessionSlice.ts`, `cart.ts`, `orderBuild.ts`, `checkout.ts`, `products.ts`
  - `src/components/ProductCard.tsx`, `CartControl.tsx`
  - `src/pages/Buy/Product.tsx`, `Cart.tsx`, `Checkout.tsx`, `src/pages/Account/OrderPage.tsx`
  - `src/pages/Seller/Orders/SellerOrderPage.tsx`, `src/pages/Seller/Customers/CustomerPage.tsx`
  - `src/pages/Seller/Products/ProductFields.tsx`, `productSchema.ts`, `productForm.ts`, `ProductFormPage.tsx`, `ProductsPage.tsx`, `BulkStockDialog.tsx`
  - `src/seed/catalogue.ts`, `seedOrders.ts`, `docs/AI-LOG.md`
- Test:
  - `src/features/__tests__/variants.test.ts`, `itemVariants.test.ts`
  - `cart.test.ts`, `orderBuild.test.ts`, `checkout.test.ts`, `products.test.ts` (add)
  - `src/seed/__tests__/buildSeed.test.ts` (add)
  - `src/pages/Buy/__tests__/Product.test.tsx`, `StorePage.test.tsx`, `Cart.test.tsx`, `src/pages/Account/__tests__/OrderPage.test.tsx` (add)
  - `src/pages/Seller/Products/__tests__/ProductFormPage.test.tsx`, `ProductsPage.test.tsx` (add)

**Interfaces:**
- Consumes:
  - Phase A: `Item`, `Variant`, `ProductOption`, `CartLine`, `OrderLine`, `lineKey`, `addToCart`, `setLineQuantity`, `buildOrder`, `decreaseStock`, `addNewItem`, `updateItem`, `removeItem`, `selectStockById`, `addItemToCart(item, variantId?)`, `setCartQuantity(itemId, quantity, variantId?)`, `removeFromCart(itemId, variantId?)`, `buildSeed`, `renderWithStore`.
  - Phase D: `CartRow`, `joinCart`, `CartProblem`, `groupCartByStore`, `checkoutTotals`, `CartControl`, `BuyCard`, `ProductCard` (`href`), `Product`, `LOW_STOCK`.
  - Phase E:
    - `cancelShipment` and its `itemSlice` restock;
    - `adjustStock`, `duplicateItem`, `validateQuickEdit`, `getItemSchema`;
    - `ProductFormFields`, `toFormFields`, `fromFormFields`;
    - `QuickEditCell`, `sellerState`, `useSellerStore`.
- Produces:

```ts
// src/features/variants.ts (pure)
export const MAX_OPTIONS = 3;
export const MAX_VARIANTS = 30;
export const variantLabel: (values: string[]) => string;              // values.join(" / ")
export const parseOptionValues: (text: string) => string[];           // split on ",", trim, drop empties, dedupe ignoring case (first spelling kept)
export const combinations: (options: ProductOption[]) => string[][];   // cross product, first option outermost; [] when options is []
export const variantCount: (options: ProductOption[]) => number;       // product of values.length; 0 when options is []
export const variantId: (itemId: string, n: number) => string;         // `${itemId}-v${n}`, n from 1
export const nextVariantNumber: (itemId: string, rows: { id: string }[]) => number; // 1 + max n over /^<itemId>-v(\d+)$/, else 1
export const syncVariants: <R extends { id: string; values: string[] }>(
  itemId: string, options: ProductOption[], rows: R[], makeRow: (id: string, values: string[], n: number) => R) => R[];
//   one row per combination, in combination order; a row whose `values` equal a combination (exact, in order) is kept as is (same id);
//   other combinations get makeRow(variantId(itemId, n), values, n) with n counting on from nextVariantNumber(itemId, rows); unmatched rows are dropped
export const hasVariants: (item: Item) => boolean;                     // (item.variants?.length ?? 0) > 0
export const findVariant: (item: Item, variantId?: string) => Variant | null;
export const findVariantByValues: (item: Item, values: string[]) => Variant | null;
export const defaultVariant: (item: Item) => Variant | null;           // first with stockNum > 0, else first; null without variants
export const withVariantTotals: (item: Item) => Item;
//   with variants: stockNum = Σ variant.stockNum, price = min variant.price (a new object only when either changes);
//   options [] or variants [] → returns the item without the `options` and `variants` keys; no variants → item unchanged
// src/features/pricing.ts (pure; Task 2 extends itemPriceProps)
export const priceRange: (item: Item) => { min: number; max: number }; // variants' min/max, else { price, price }
export const itemPriceProps: (item: Item, variant?: Variant | null) => { price: number; isFrom: boolean; compareAtPrice?: number };
//   variant given → { price: variant.price, isFrom: false }; else { price: min, isFrom: min < max }
// src/features/cart.ts
export interface CartRow { item: Item; variant: Variant | null; quantity: number; orderableNum: number; problem: CartProblem } // gains `variant`
export const rowPrice: (row: CartRow) => number;                      // row.variant?.price ?? row.item.price
export const dropStaleVariantLines: (cart: CartLine[], item: Item) => CartLine[];
//   for lines of item.id: drops a line whose variantId doesn't resolve, and a line with no variantId when the item has variants
// addToCart(cart, item, variantId?): returns `cart` unchanged when the item has variants and variantId doesn't resolve
// joinCart: a line whose variant doesn't resolve (or has none on a variant item) → variant null, orderableNum 0, problem "inactive";
//   a variant line's stock is variant.stockNum
// src/features/orderBuild.ts: a line that joinCart would mark "inactive" for its variant is skipped; caps use the variant's stock
// src/features/checkout.ts: CheckoutGroup.itemsTotal = Σ rowPrice(row) × row.orderableNum
// src/features/itemSlice.ts: addNewItem and updateItem store withVariantTotals(payload); decreaseStock with variantId lowers that
//   variant (never below 0), then re-totals; the Phase E cancelShipment restock adds to the variant (cap 9999), then re-totals;
//   a line whose variant no longer exists is skipped
// accountsSlice / sessionSlice: on updateItem, every cart = dropStaleVariantLines(cart, withVariantTotals(payload))
// src/features/products.ts
// duplicateItem: variant ids become variantId(newId, n) and SKUs `${sku}-${n}`, n = 1… in variant order
export const hasVariantsLabel: (item: Item) => string;                // "40 across 3 variants"
// src/pages/Seller/Products/productForm.ts
export interface OptionFormRow { name: string; values: string }       // values as typed, comma-separated
export interface VariantFormRow { id: string; values: string[]; price: string; stockNum: string; sku: string }
// ProductFormFields gains: options: OptionFormRow[]; variants: VariantFormRow[]
export const toOptions: (rows: OptionFormRow[]) => ProductOption[];    // { name: name.trim(), values: parseOptionValues(values) }
export const resyncVariantRows: (itemId: string, fields: ProductFormFields) => VariantFormRow[];
//   syncVariants with makeRow = { price: lowest valid price among the current rows, else fields.price; stockNum: "0"; sku: `${fields.sku}-${n}` }
// components
const PriceTag: React.FC<{ price: number; isFrom?: boolean; compareAtPrice?: number /* Task 2 */; size?: "card" | "page" }>;
//   text "from $29" when isFrom, else "$29"
const LineName: React.FC<{ name: string; variantLabel?: string }>;   // name, then the label on its own line in color.fgMuted
const VariantPicker: React.FC<{ item: Item; selected: Variant; onSelect: (variant: Variant) => void }>;
//   one radiogroup per option, named by option.name; each value a radio; picking a value selects findVariantByValues(selected values with that one swapped)
const CartControl: React.FC<{ item: Item; variantId?: string }>;
//   item has variants and no variantId → a link "Choose options" (aria-label `Choose options for ${name}`) to ROUTES.product(id)
// Product page query param: `?variant=<variant id>`, written with replace; unknown or missing → defaultVariant(item)
```

**Saved data:** `options` and `variants` are Phase A fields, so there is no `VERSION` bump and nothing new is stored. Items saved without them load as single-price items.

**Choices this task makes:**
- **Where the stock is computed.** `itemSlice` sums the variants on write, through `withVariantTotals`. Every reader in Phases A–E (listing, `inStock`, stock chips, `selectStockById` for the item key, `stockLevel`, `storeTodo`) keeps using `item.stockNum`. Sorts and the price filter use `item.price`, which is the lowest variant price. The "from" label tells the buyer.
- **At most 30 variants.** Two options, 5 sizes × 6 colours, already make 30. Every variant is one form row, and 30 rows is about as long as a phone form stays usable. It also keeps each saved item small in localStorage. The cap is checked on the combination count before rows are built.
- **Variant ids are stable.** They are `<itemId>-v<n>`, the format of Phase E's `duplicateItem`, with `n` counting up and never reused. Regeneration keeps a row whose values are unchanged, so carts keep pointing at the right variant after an unrelated edit. Renaming a value is a new variant, and its old lines leave carts.
- **Quick edits are off for items with variants.** Phase E's `adjustStock` already skips them. In the products table, the Stock cell shows `hasVariantsLabel(item)` and a link "Edit variants" to `ROUTES.sellerProduct(id)`. The Price cell shows a `PriceTag` with no edit. The bulk stock dialog says what it skips. Price and stock per variant are edited in one place, the product form, with one set of rules.

- [ ] **Step 1: Write the failing pure tests**

`variants.test.ts`:

| Test | Call | Expected |
| --- | --- | --- |
| "parseOptionValues" | `" S, m ,M,, L "` | `["S", "m", "L"]` |
| "combinations, first option outermost" | `[{Size: [S, L]}, {Colour: [Red, Blue]}]` | `[["S","Red"],["S","Blue"],["L","Red"],["L","Blue"]]` |
| "no options, no combinations" | `[]` | `combinations` → `[]`, `variantCount` → 0 |
| "variantCount" | values 6 × 6 | 36 |
| "syncVariants keeps rows by values" | strap rows v1–v3, Colour gains "Green" | ids `-v1`, `-v2`, `-v3` unchanged (same objects), new row `-v4` with values `["Green"]` |
| "syncVariants never reuses a number" | rows `-v1`, `-v3`; a new combination | it gets `-v4` |
| "syncVariants drops removed values" | tote, Size loses "Large" | rows `-v1`, `-v2` only |
| "withVariantTotals" | tote | `stockNum` 25, `price` 29 |
| "withVariantTotals with no options strips both keys" | `{ ...strap, options: [] }` | no `options` key, no `variants` key |
| "defaultVariant skips sold out" | case | `-v2` |
| "priceRange and itemPriceProps" | tote | `{ min: 29, max: 35 }`; `itemPriceProps(tote)` → `{ price: 29, isFrom: true }`; strap → `{ price: 19, isFrom: false }`; with tote `-v4` → `{ price: 35, isFrom: false }` |

`cart.test.ts` (add):
- **"addToCart ignores a variant item without a variant":** `addToCart([], tote)` returns the same array, and `addToCart([], tote, "nope")` too.
- **"variant lines cap at the variant's stock":** tote `-v4` (stock 3): four adds give quantity 3.
- **"joinCart: a missing variant is inactive, not dropped":** a line `{ itemId: tote, variantId: "item-cc-canvas-tote-v9", quantity: 1 }` gives one row with `variant: null`, `orderableNum: 0` and `problem: "inactive"`. A tote line with no `variantId` gives the same.
- **"rowPrice":** a tote `-v3` row gives 35, and a smart watch row gives 129.
- **"dropStaleVariantLines":** removing "Tan" from the strap drops the `-v3` line and keeps `-v1`. Lines of other items are kept.

`orderBuild.test.ts` (add):
- **"variant line takes the variant price and label":** tote `-v4` ×1 makes the line `{ variantId: "item-cc-canvas-tote-v4", variantLabel: "Large / Black", price: 35 }`.
- **"caps at the variant's stock":** `-v4` ×5 orders 3.
- **"skips a line whose variant is gone":** a `-v9` line gives no line, and no shipment for Carry Co.

`checkout.test.ts` (add) › **"groupCartByStore uses the variant price":** [tote `-v4` ×1, tote `-v1` ×2] gives Carry Co. with `itemsTotal` 93 (35 + 58).

`itemVariants.test.ts` uses `setupStore` on `buildSeed(0)`:
- **"decreaseStock lowers the variant and the total":** `decreaseStock([{ itemId: tote, variantId: "item-cc-canvas-tote-v3", quantity: 2 }])` gives `-v3` stock 3 and item `stockNum` 23. Before the call, `selectStockById(state)["item-cc-canvas-tote:item-cc-canvas-tote-v3"]` is 5.
- **"decreaseStock never goes below 0":** `-v1` of the case stays 0.
- **"cancel restocks the variant":** preload a non-seed order with one placed Carry Co. shipment, then dispatch Phase E's `cancelShipment` with `lines: [{ itemId: tote, variantId: "item-cc-canvas-tote-v4", quantity: 2 }]`. `-v4` becomes 5 and the item 27. A second fixture whose line is `-v9` leaves the tote unchanged.
- **"updateItem re-totals":** an update setting strap `-v1` stock to 0 gives `stockNum` 22.
- **"updateItem drops cart lines whose variant is gone":**
  - Setup: strap `-v3` in the guest cart and in Ahmed's cart, and `-v1` in Omar's.
  - Action: `updateItem` with Colour "Black, Brown".
  - Result: `-v3` lines are gone from both carts, and Omar's `-v1` line stays.

`products.test.ts` (add) › **"duplicateItem renumbers variants":** the tote with `{ id: "n1", sku: "C-009", now: 7 }` gives variant ids `["n1-v1", "n1-v2", "n1-v3", "n1-v4"]` and SKUs `["C-009-1", …, "C-009-4"]`. The prices and stocks are copied.

`buildSeed.test.ts` (add):
- **"variant products keep their Phase A totals":** the three items in the seed facts table have exactly those options and variants, and `withVariantTotals(item)` equals the item. Every other item has no `options` key.
- **"seed variant lines":** A-10002, A-10004 and A-10008 carry the variant ids and labels from the seed facts, and each line's `price` equals its variant's price.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/features src/seed`. Expected: FAIL. `variants.ts` and `pricing.ts` are missing, and the slices don't re-total yet.

- [ ] **Step 3: Implement `variants.ts`, `pricing.ts` and the cart, order, checkout, slice and seed changes**

- **`itemSlice`:**
  - `addNewItem` and `updateItem` store `withVariantTotals(payload)`.
  - `decreaseStock` and the `cancelShipment` restock change the variant, then replace the item with `withVariantTotals(item)`.
  - `adjustStock` keeps skipping items with variants (Phase E).
- **`accountsSlice` and `sessionSlice`:**
  - Their existing `updateItem` case (Phase E: strip when not active) also runs `dropStaleVariantLines` on every cart, with the re-totalled item.
  - Import `withVariantTotals` from `variants.ts`, not from the slice.
- **Seed:**
  - `catalogue.ts` holds the three items' `options`/`variants` exactly as in the seed facts table, and passes every item through `withVariantTotals`.
  - `seedOrders.ts` lines get the `variantId`/`variantLabel` pairs from the seed facts.

Run: `npx vitest run src/features src/seed`. Expected: PASS, along with every Phase A–E test in those folders.

- [ ] **Step 4: Write the failing buyer page tests**

**`Product.test.tsx` (add)** at `/p/item-cc-canvas-tote`, with a `LocationProbe`:
- **"variant picker":**
  - Radiogroups "Size" and "Colour" are shown, with "Standard" and "Natural" checked.
  - The price reads "$29".
- **"picking a value picks the variant":**
  - Click "Large": the price reads "$35", the chip "5 in stock", and the location ends `?variant=item-cc-canvas-tote-v3`.
  - Click "Black": "Only 3 left".
  - "Add to cart" adds the cart line `{ itemId: "item-cc-canvas-tote", variantId: "item-cc-canvas-tote-v4", quantity: 1 }`.
- **"a sold-out variant":** at `/p/item-ps-clear-phone-case`:
  - "6.1 inch" starts checked;
  - picking "5.8 inch" shows the disabled "Sold out" button.
- **"unknown variant param falls back":** `?variant=zzz` checks "6.1 inch".

**Listing card** (in `Product.test.tsx` › "More from"):
- At `/p/item-tt-smart-watch`, the strap's card has the link "Choose options for Leather watch strap, 20 mm" to `/p/item-tt-leather-watch-strap-20-mm`, and no "Add to cart".
- `StorePage.test.tsx` (add): at `/store/carry-co`, the tote's card price reads "from $29".

**`Cart.test.tsx` (add):**
- **"variant lines show their label and price":** Ahmed's cart holds tote `-v4` ×1 and `-v1` ×1. The cart shows two "Canvas tote" lines, labelled "Large / Black" ($35) and "Standard / Natural" ($29).
- **"one variant's stepper doesn't touch the other":** pressing "One more" on the `-v1` line sets it to 2, and `-v4` stays at 1.

**`OrderPage.test.tsx` (add):** Omar's A-10002 shows "Canvas tote" with "Standard / Natural".

- [ ] **Step 5: Run them to verify they fail, then build the buyer side**

- **`ProductCard`:** renders `PriceTag` with `itemPriceProps(item)` instead of `formatPrice(price)`.
- **`CartControl`:** takes `variantId`. It reads the quantity for `lineKey({ itemId, variantId })` and the stock from the variant. It passes `variantId` to `addItemToCart`, `setCartQuantity` and `removeFromCart`.
- **`Product`:**
  - With variants, the selection is `findVariant(item, params.get("variant")) ?? defaultVariant(item)`.
  - In order: `VariantPicker` sits between the description and `CartControl`. The price is `PriceTag` with `itemPriceProps(item, selected)`, and the stock chip reads `selected.stockNum`.
  - `CartControl` gets `variantId={selected.id}`.
- **`VariantPicker`:**
  - Each option is a `fieldset` with a `legend` and native radios, styled as square buttons with Gruvbox borders, at least 44 px tall.
  - A value whose variant (with the other picks unchanged) is sold out gets a muted, struck label. It stays selectable, so the buyer sees why.
- **`LineName`** replaces the plain line name in `Cart`, `Checkout` (review and "Won't be ordered"), `OrderPage`, `SellerOrderPage` and `CustomerPage`. The cart passes `row.variant && variantLabel(row.variant.values)`, and orders pass `line.variantLabel`.
- **Line totals:** `Cart` and `Checkout` compute them with `rowPrice`, and use `lineKey` for React keys.

Run: `npx vitest run src/pages/Buy src/pages/Account`. Expected: PASS.

- [ ] **Step 6: Write the failing seller tests**

**`ProductFormPage.test.tsx` (add)**, signed in as Mona unless stated:
- **"add options builds variant rows":** on a new product:
  1. "Add option", with name "Size" and values "S, M, L".
  2. "Add option", with name "Colour" and values "Red, Blue".

  Then 6 rows are labelled "S / Red", "S / Blue", "M / Red", "M / Blue", "L / Red" and "L / Blue". The item's "Price" and "Stock" fields are gone, and the text "Price and stock are set per variant below." shows.
- **"up to 3 options":** after 3 options, "Add option" is disabled, with the text "Up to 3 options".
- **"too many variants":** "Size" with 6 values and "Colour" with 6 values show "That makes 36 variants. Keep it to 30 or fewer.", and Save stores nothing.
- **"option rules":** these messages show:
  - an empty option name: "Name the option";
  - two options named "Size" and "size": "Each option needs its own name";
  - empty values: "Add at least one value";
  - a 21-character value: "Values can be 20 characters at most".
- **"variant row rules":**
  - a row price "0" gives "The price must be more than $0", and a row stock "2.5" gives "Enter a whole number" (Phase E's `validateQuickEdit` messages);
  - two rows with SKU "T-009-1" give "Each variant needs its own SKU";
  - on a new product where every row has stock 0: "Add stock to at least one variant".
- **"editing keeps rows by values":** on the strap's page, change the Colour values to "Black, Brown, Tan, Green":
  - the rows Black, Brown and Tan keep 18, 14 and 8;
  - Green is a new row with price 19, stock 0 and SKU "T-007-4".

  Saving stores 4 variants, with Green's id `item-tt-leather-watch-strap-20-mm-v4`, and `stockNum` 40.
- **"removing the last option goes back to one price and stock":** on the strap, "Remove option" brings back "Price" (19) and "Stock" (40). Saving stores neither `options` nor `variants`, with `stockNum` 40.
- **"a new product's variant ids use its own id":** saving a new product with options gives variant ids that start with the saved item's id + "-v1".

**`ProductsPage.test.tsx` (add)** (Mona):
- **"variant rows can't be quick-edited":** the strap's row has:
  - no `textbox` or `spinbutton`;
  - the text "40 across 3 variants" and the price "$19";
  - a link "Edit variants" to `/seller/products/item-tt-leather-watch-strap-20-mm`.
- **"bulk stock skips variant items":** select the strap and Field watch, then "Add or remove stock" +5.
  - The dialog shows "Products with variants are skipped (1). Change their stock per variant on the product page."
  - After applying, Field watch has 19 and the strap stays 40.

Signed in as Karim, the tote's row shows "from $29".

- [ ] **Step 7: Run them to verify they fail, then build the seller side**

- **`ProductFormPage`:**
  - A new product's id is created once on mount (`useState(() => "item-" + uuid())`), so its variant ids exist before the first save.
- **`VariantsEditor`** sits under the category field, inside `ProductFields`:
  - **Options:** one row per option: "Option name" and "Values, separated by commas", plus "Remove option". "Add option" adds an empty row.
  - **Variant rows:** `resyncVariantRows` runs on blur of any option field and on Remove.
  - **Table:** one row per variant: the label (`variantLabel`), "Price" (`PriceField`), "Stock" (`StockField`) and "SKU". Below 600 px each row stacks.
- **`productSchema`** gains `options` and `variants` with the messages in Step 6:
  - the option name is trimmed, max 20, and unique ignoring case;
  - each value is at most 20 characters;
  - the combination count goes through `variantCount`;
  - row price and stock go through `validateQuickEdit`;
  - row SKUs use the item SKU rule and are unique within the item;
  - on a new product, the stock sum is at least 1.

  With options present, the item-level `price` and `stockNum` aren't validated.
- **`toFormFields` / `fromFormFields`:**
  - `toFormFields` joins values with ", ".
  - `fromFormFields` writes `options: toOptions(…)` and `variants` (numbers parsed), then returns `withVariantTotals(item)`. With no options, it deletes both keys.
  - Removing the last option fills empty "Price"/"Stock" fields with the lowest row price and the stock sum.
- **`ProductsPage` and `BulkStockDialog`:** as in "Choices this task makes".

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 8: Check by hand, AI-LOG and commit**

At 360 px and 1280 px:
1. Open the Canvas tote and pick Large / Black. Refresh: the pick stays.
2. Add it and a Standard / Natural tote. The cart shows two lines, $35 and $29.
3. As Karim, rename "Black" to "Charcoal". The Black lines leave Ahmed's cart.
4. Add a third option and watch the rows multiply. Check that the "36 variants" error blocks Save.
5. The products table shows "Edit variants" on the tote.

Add `## 26. Product variants: options, per-variant price and stock, picker, variant cart lines (Claude Code)`.
```bash
git add -A && git commit -m "Add product variants: options, per-variant price and stock, picker, variant cart lines"
```

---

### Task 2 (spec task 17): Deals

**Files:**
- Modify:
  - `src/features/pricing.ts`, `selectors.ts`
  - `src/features/listing/listingQuery.ts`, `applyListing.ts`
  - `src/components/PriceTag.tsx`, `listing/FilterPanel.tsx`, `listing/FilterChips.tsx`
  - `src/pages/Buy/Home.tsx`
  - `src/pages/Seller/Products/ProductFields.tsx`, `productSchema.ts`, `productForm.ts`
  - `src/seed/catalogue.ts`, `docs/AI-LOG.md`
- Test:
  - `src/features/__tests__/pricing.test.ts`, `selectors.test.ts` (add)
  - `src/features/listing/__tests__/listingQuery.test.ts`, `applyListing.test.ts` (add and edit)
  - `src/components/__tests__/PriceTag.test.tsx`
  - `src/pages/Buy/__tests__/Home.test.tsx`, `Search.test.tsx`, `Category.test.tsx` (add)
  - `src/pages/Seller/Products/__tests__/ProductFormPage.test.tsx` (add)

**Interfaces:**
- Consumes:
  - Task 1: `priceRange`, `itemPriceProps`, `PriceTag`, `hasVariants`.
  - Phase D: `ListingQuery`, `EMPTY_QUERY`, `parseListingQuery`, `serializeListingQuery`, `clearFilters`, `activeFilterCount`, `applyListing`, `facetCounts`, `FilterPanel`, `FilterChips`, `FilterSheet`, `BuyCard`, `Home`, `selectShopItems`.
  - Phase E: `ProductFormFields`, `fromFormFields`, `toFormFields`, `getItemSchema`.
- Produces:

```ts
// src/features/pricing.ts
export const isOnSale: (item: Item) => boolean;          // compareAtPrice != null && compareAtPrice > priceRange(item).max
export const percentOff: (price: number, compareAtPrice: number) => number; // Math.round((1 - price / compareAtPrice) * 100)
// itemPriceProps(item, variant?) now adds compareAtPrice exactly when isOnSale(item)
// src/features/listing/listingQuery.ts
// ListingQuery gains onSale: boolean; EMPTY_QUERY.onSale = false
// param `sale`: "1" → true, anything else → false; written as "sale=1" after "instock" (canonical order: q, category, sort, min, max, store, instock, sale)
// clearFilters drops onSale; activeFilterCount counts it as 1
// src/features/listing/applyListing.ts: filter order q, category, price, known stores, inStock, onSale (isOnSale);
//   facetCounts apply onSale like any other filter
// src/features/selectors.ts
selectDeals(state): Item[] // active, stockNum > 0, isOnSale; percentOff(priceRange.min, compareAtPrice) desc, then name ("en"); first 8
// PriceTag with compareAtPrice: price, then <s> "Was $39" ("Was " visually hidden), then a badge "26% off" (percentOff of the shown price)
// src/pages/Seller/Products/productForm.ts: ProductFormFields gains compareAtPrice: string ("" = not on sale → key deleted)
```

**Saved data:** `compareAtPrice` is a Phase A field, so there is no `VERSION` bump. A missing value means "not on sale". `sale=1` lives only in the URL.

**Choices this task makes:**
- **One sale rule.** `isOnSale` is the only test, used by the price tag, the filter, the chip and the Deals row. A was price that a later quick price edit overtook stops showing everywhere at once.
- **Variants.** An item with variants has one was price, and it must be above its most expensive variant. The badge's percentage is taken from the price on screen: "from $29" on cards, and the picked variant's price on the product page.
- **Filter, not sort.** Deals is a filter (`sale=1`), not a sort. The price filter and the price sorts keep using `item.price`.

- [ ] **Step 1: Write the failing pure tests**

`pricing.test.ts`:

| Test | Input | Expected |
| --- | --- | --- |
| "isOnSale" | Field watch (95, was 119) | true |
| "a was price at or below the price is not a sale" | price 95, was 95; price 100, was 95 | false, false; `itemPriceProps` has no `compareAtPrice` key |
| "variants compare against the highest" | tote (29–35), was 35 | false; was 39 → true |
| "percentOff rounds" | (95, 119), (29, 39), (59, 79), (38, 48) | 20, 26, 25, 21 |
| "itemPriceProps with a sale" | tote; tote with `-v3` | `{ price: 29, isFrom: true, compareAtPrice: 39 }`; `{ price: 35, isFrom: false, compareAtPrice: 39 }` |

`listingQuery.test.ts`:
- **Edit Phase D's literals.**
  - "writes canonical order" passes `onSale: true` and expects the string to end in `&instock=1&sale=1`.
  - The "round-trips" `QUERIES` gain one with `onSale: true`.
  - "junk falls back to defaults" adds `&sale=yes` and still equals `EMPTY_QUERY`.
- **Add "sale=1 reads as onSale":** `parseListingQuery("?sale=1").onSale` is true, and `activeFilterCount` is 1.
- **Add "clearFilters drops onSale".**

`applyListing.test.ts` (add):
- **"on sale":** all items with `onSale` give 6. Watches with `onSale` give `["Field watch, 38 mm", "Chronograph, leather strap"]` (best-selling). Adding `inStock` gives 1.
- **"store facet counts with onSale":** all items with `onSale` give tick-tock 2, carry-co 2, pocket-signal 1, hearth-lane 1.

`selectors.test.ts` › **"selectDeals":** the names come out as `["Canvas tote", "Wireless earbuds", "Pour-over coffee set", "Field watch, 38 mm", "Weekender duffel"]`. The Chronograph is sold out, so it isn't in the row.

- [ ] **Step 2: Run them to verify they fail, then implement**

Run: `npx vitest run src/features`. Expected: FAIL, then PASS after `pricing.ts`, the listing changes, `selectDeals` and the seed's six `compareAtPrice` values (seed facts).

- [ ] **Step 3: Write the failing component and page tests**

**`PriceTag.test.tsx`:**
- **"was price and badge":** `<PriceTag price={95} compareAtPrice={119}/>`:
  - the text "$95";
  - an `s` element whose `textContent` is "Was $119";
  - the text "20% off".
- **"from with a sale":** `isFrom` with price 29 and was 39 reads "from $29", "Was $39" and "26% off".
- **"no was price":** no `s` element and no "% off".

**`Home.test.tsx` (add):**
- **"Deals row":** the region "Deals" holds 5 cards, with "Canvas tote" first. Its "See all" link goes to `/search?sale=1`.
- **"Deals sits after Shop by category":** the "Deals" heading follows "Shop by category" and precedes "Our stores" (`compareDocumentPosition`).
- **"no deals, no row":** with every `compareAtPrice` removed from the preloaded items, there is no "Deals" heading.

  Each home section is a `section` with `aria-labelledby` pointing at its h2, so it has the `region` role. If Phase D's "New arrivals shows 8 cards" counted cards across the whole page, scope it to `within(getByRole("region", { name: "New arrivals" }))`.

**`Search.test.tsx` (add):**
- **"on sale filter":** `?sale=1` gives "6 results" and the chip "On sale". The chip's × leaves no `sale` in the location.

**`Category.test.tsx` (add):**
- **"wide: On sale checkbox":** at `/c/watches` with `setViewportWidth(1280)`, ticking "On sale" writes `?sale=1` and shows "2 results".
- **"phone sheet counts it":** with `setViewportWidth(360)` at `/c/watches`, ticking "On sale" in the sheet turns the button into "Show 2 results".

**`ProductFormPage.test.tsx` (add)** (Mona):
- **"was price must beat the price":** on Field watch, "Was price (optional)" set to 90 gives "The was price must be more than the price", and set to "119.999" gives "At most 2 decimals".
- **"empty was price removes the sale":** on Field watch, clearing it and saving stores no `compareAtPrice` key.
- **"variant item was price":** as Karim on the tote, 35 gives "The was price must be more than every variant's price", and 39 saves.

- [ ] **Step 4: Run them to verify they fail, then build**

- **`PriceTag`:**
  - The was price is an `<s>` in `color.fgMuted`, with "Was " in a visually-hidden span.
  - The badge is a square chip in `color.red` with `color.bg` text.
  - `size="page"` makes the price 1.5rem.
- **`ProductCard`, the product page and the seller products table** all show `PriceTag` with `itemPriceProps`, so the sale shows wherever the price does.
- **`FilterPanel`:** an "On sale" checkbox under "In stock only", in both the wide column and the phone sheet's draft.
- **`FilterChips`:** a chip "On sale".
- **`Home`:**
  - The sections are, in order: hero, "Shop by category", **"Deals"**, "Our stores", "New arrivals". Task 6 appends "Recently viewed".
  - "Deals" is a grid of `BuyCard`s from `selectDeals`, with "See all" to `ROUTES.search() + "?sale=1"`. It is left out when `selectDeals` is empty.
- **Product form:**
  - A field "Was price (optional)" (`PriceField`), with the helper text "Shows the old price struck through. Leave it empty when the product isn't on sale."
  - Schema: when the field isn't empty, it must have at most 2 decimals and be more than the price ("The was price must be more than the price"). With options present it must be more than the highest row price ("The was price must be more than every variant's price").
  - `fromFormFields` deletes `compareAtPrice` when the field is empty.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 5: Check by hand, AI-LOG and commit**

At 360 px and 1280 px:
1. The home's Deals row shows 5 cards with struck prices and badges.
2. "See all" opens 6 results, with the Chronograph shown as sold out.
3. As Mona, quick-edit Field watch's price to 125. Its badge disappears from the shop, and Deals shows 4 cards.
4. In the phone sheet, the "On sale" count updates as you tick.

Add `## 27. Deals: was price, On sale filter, Deals row (Claude Code)`.
```bash
git add -A && git commit -m "Add deals: was price with percent off, On sale filter, Deals row on the store home"
```

---

### Task 3 (spec task 18): Delivery fees per store

**Files:**
- Create: `src/features/delivery.ts`
- Modify:
  - `src/features/orderBuild.ts`, `checkout.ts`
  - `src/pages/Buy/Checkout.tsx`, `Product.tsx`, `StorePage.tsx`, `src/pages/Account/OrderPage.tsx`
  - `src/pages/Seller/StoreSettings.tsx`, `storeSettingsSchema.ts`, `Orders/SellerOrderPage.tsx`
  - `src/seed/catalogue.ts`, `docs/AI-LOG.md`
- Test:
  - `src/features/__tests__/delivery.test.ts`, `checkout.test.ts` (add), `storeStats.test.ts` (add)
  - `src/pages/Buy/__tests__/Checkout.test.tsx`, `Product.test.tsx` (add)
  - `src/pages/Seller/__tests__/StoreSettings.test.tsx`, `src/pages/Seller/Orders/__tests__/SellerOrderPage.test.tsx` (add)
  - `src/seed/__tests__/buildSeed.test.ts` (add)

**Interfaces:**
- Consumes:
  - Phase A: `Store.deliveryFee`, `Store.freeDeliveryOver`, `buildOrder` (sets `Shipment.deliveryFee`).
  - Phase B: `updateStore`.
  - Phase D: `groupCartByStore`, `CheckoutGroup.deliveryFee`, `checkoutTotals`, `orderTotals`.
  - Phase E: `shipmentTotal`, `storeFigures`, `StoreSettings`, `sellerState`.
  - Task 1: `rowPrice`.
  - Existing: `formatPrice`.
- Produces:

```ts
// src/features/delivery.ts (pure)
type FeeRule = Pick<Store, "deliveryFee" | "freeDeliveryOver">;
export const deliveryFeeFor: (store: FeeRule, itemsTotal: number) => number;
//   freeDeliveryOver !== null && itemsTotal >= freeDeliveryOver → 0; else deliveryFee
export const deliveryText: (store: FeeRule) => string;
//   fee 0 → "Free delivery"; no threshold → "Delivery $6"; else "Delivery $5, free over $50"
export const freeDeliveryHint: (store: FeeRule, itemsTotal: number) => string | null;
//   null when fee 0 or no threshold; below → "Add $21 more for free delivery"; at or over → "Free delivery on orders over $50"
// buildOrder: shipment.deliveryFee = deliveryFeeFor(store, Σ built line price × quantity)
// groupCartByStore: deliveryFee = deliveryFeeFor(store, itemsTotal) (itemsTotal from orderable rows, Task 1)
// src/pages/Seller/storeSettingsSchema.ts gains:
//   deliveryFee: "Delivery fee", required "Enter a delivery fee (0 for free)", ≥ 0 "Can't be below 0", ≤ 99 "At most $99", 2 decimals "At most 2 decimals"
//   freeDeliveryOver: "Free delivery over (optional)", "" → null, > 0 "Must be more than $0", ≤ 9999 "At most $9,999", 2 decimals
```

**Saved data:** `deliveryFee` and `freeDeliveryOver` are Phase A fields, already in every saved store (0 and `null` before this task), so there is no `VERSION` bump.

**Choices this task makes:**
- **One rule.** The fee is worked out on the orderable items total of one store. Checkout and `buildOrder` call the same `deliveryFeeFor`, so the review never disagrees with the saved order. Lines that won't be ordered don't count toward free delivery.
- **The threshold is inclusive.** At or over the amount, delivery is free (Phase A's `buildOrder` test).
- **No test edits needed.** Seed orders keep `deliveryFee: 0`, so Phase D's and Phase E's pinned totals and revenue are unchanged. Phase D's checkout tests also hold: Tick & Tock is free, and the $65 City backpack is over Carry Co.'s $50.

- [ ] **Step 1: Write the failing pure tests**

`delivery.test.ts` (`carry = { deliveryFee: 5, freeDeliveryOver: 50 }`):

| Test | Call | Expected |
| --- | --- | --- |
| "fee below the threshold" | `deliveryFeeFor(carry, 49.99)` | 5 |
| "free at exactly the threshold" | `deliveryFeeFor(carry, 50)` | 0 |
| "no threshold always charges" | `({ deliveryFee: 6, freeDeliveryOver: null }, 500)` | 6 |
| "free store" | `({ deliveryFee: 0, freeDeliveryOver: null }, 1)` | 0 |
| "deliveryText" | the four seed stores | "Free delivery", "Delivery $5, free over $50", "Delivery $7, free over $100", "Delivery $6" |
| "freeDeliveryHint" | `(carry, 29)`, `(carry, 50)`, Hearth Lane `(…, 10)`, Tick & Tock | "Add $21 more for free delivery", "Free delivery on orders over $50", null, null |
| "hint keeps cents" | `(carry, 45.5)` | "Add $4.50 more for free delivery" |

`checkout.test.ts` (add) › **"groups carry the store fee":** [smart watch ×1, tote `-v1` ×1] gives Tick & Tock `deliveryFee` 0 and Carry Co. 5. `checkoutTotals` gives `{ units: 2, itemsTotal: 158, delivery: 5, total: 163 }`.

`storeStats.test.ts` (add) › **"revenue includes the delivery fee":** a fixture Carry Co. shipment with one $29 line and `deliveryFee: 5` adds 34 to `storeFigures(…).revenue`.

`buildSeed.test.ts` (add) › **"store fees":** the four stores carry the seed facts' fees, and every seed shipment has `deliveryFee` 0.

- [ ] **Step 2: Run them to verify they fail, then implement**

Write `delivery.ts`. `buildOrder` and `groupCartByStore` both call `deliveryFeeFor`. Set the seed fees.

Run: `npx vitest run src/features src/seed`. Expected: FAIL, then PASS. Phase A's `orderBuild` fee test (5 under 50, 0 at or over) keeps passing.

- [ ] **Step 3: Write the failing page tests**

**`Checkout.test.tsx` (add) › "delivery fee per shipment":** Ahmed's cart is smart watch ×1 and tote `-v1` ×1.
- **Review:**
  - "Ships from Tick & Tock" reads "Delivery: Free".
  - "Ships from Carry Co." reads "Delivery: $5" and "Add $21 more for free delivery".
  - The summary reads Delivery "$5" and Order total "$163".
- **Place order:**
  - The Carry Co. shipment has `deliveryFee` 5.
  - The order page shows "$163".
  - `storeFigures(carryEntries, 0, Date.now()).revenue` grew by exactly 34.

**`Checkout.test.tsx` (add) › "free over the threshold":** with the tote ×2 (58), Carry Co. reads "Delivery: Free" and "Free delivery on orders over $50".

**`Product.test.tsx` (add):**
- `/p/item-cc-canvas-tote` shows "Delivery $5, free over $50".
- `/p/item-tt-smart-watch` shows "Free delivery".

**`StoreSettings.test.tsx` (add)** (Karim):
- **"fees save":** the fields "Delivery fee" (5) and "Free delivery over (optional)" (50) show. Setting 4.5 and an empty threshold, then Save, stores `{ deliveryFee: 4.5, freeDeliveryOver: null }`.
- **"fee rules":** "-1" gives "Can't be below 0", "" gives "Enter a delivery fee (0 for free)", and the threshold "0" gives "Must be more than $0".

**`SellerOrderPage.test.tsx` (add) › "delivery row":** preload a non-seed order for Ahmed with one placed Carry Co. shipment (Canvas tote `-v1` ×1 at $29, `deliveryFee: 5`). Karim's page for it shows a "Delivery" row of "$5" and a total of "$34".

- [ ] **Step 4: Run them to verify they fail, then build**

- **`Checkout`:** the "Delivery: Free" line from Phase D now reads `group.deliveryFee`. It shows "Free" at 0, else `formatPrice`. Under it sits `freeDeliveryHint` (muted) when that isn't null. The summary's Delivery line is `checkoutTotals().delivery`, again "Free" at 0.
- **`Product` and `StorePage`:** `deliveryText(store)` with a `LocalShippingOutlined` icon. On the product page it goes under "Sold by", and on the store page under the "Since …" line.
- **`OrderPage`:** each shipment card gets "Delivery: $5" or "Delivery: Free". The totals already use `orderTotals` (Phase D).
- **`SellerOrderPage`:** a "Delivery" row above the total, which is `shipmentTotal` (Phase E).
- **`StoreSettings`:** both fields go after "Low-stock threshold". The helper text under the threshold reads "Leave empty to always charge the fee." Saving goes through `updateStore` (Phase E), and an empty threshold is stored as `null`.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 5: Check by hand, AI-LOG and commit**

At 360 px:
1. Cart with a tote and a lamp. Checkout shows "$5" with the hint for Carry Co., and "$6" for Hearth Lane.
2. Add a second tote: Carry Co. turns Free.
3. Place the order. The buyer total matches the two seller order pages' totals added up.
4. As Laila, set the fee to 0. Hearth Lane's product page reads "Free delivery".

Add `## 28. Delivery fees per store: settings, checkout per shipment, free-delivery hint (Claude Code)`.
```bash
git add -A && git commit -m "Add delivery fees per store: settings, per-shipment fees at checkout, free-delivery hint"
```

---

### Task 4 (spec task 19): Declined test card

**Files:**
- Create: `src/features/checkoutActions.ts`
- Modify:
  - `src/features/types.ts`, `cardUtils.ts`, `accountsSlice.ts`
  - `src/pages/Buy/Checkout.tsx`
  - `src/pages/Account/AddCardForm.tsx`, `Payments.tsx`
  - `src/seed/catalogue.ts`, `docs/AI-LOG.md`
- Test:
  - `src/features/__tests__/cardUtils.test.ts`, `payments.test.ts` (add), `checkoutActions.test.ts`
  - `src/pages/Buy/__tests__/Checkout.test.tsx` (add)
  - `src/pages/Account/__tests__/AddCardForm.test.tsx`, `Payments.test.tsx` (add)

**Interfaces:**
- Consumes:
  - Phase A: `PaymentMethod`, `Address`, `Order`, `placeOrder({ shipTo, payment })` (returns `Order | null`), `selectActiveBuyer`, `AppThunk`.
  - Phase D: `toSavedCard`, `NewCard`, `TEST_CARDS`, `addPaymentMethod`, `paymentLabel`, `isUsablePayment`, `pickPayment`, `Checkout` (its `useRef` guard and "2. Pay with" section), `AddCardForm`, `Payments`.
- Produces:

```ts
// src/features/types.ts: PaymentMethod gains `declines?: true` (absent = an ordinary card)
// src/features/cardUtils.ts
export const DECLINE_TEST_NUMBER = "4000000000000002";
export const isDeclineTestNumber: (number: string) => boolean;   // non-digits stripped, then === DECLINE_TEST_NUMBER
// NewCard gains `declines?: true`; toSavedCard sets `declines: true` only for the decline number (the key is absent otherwise)
// TEST_CARDS gains { brand: "visa", number: "4000 0000 0000 0002", declines: true } (type gains `declines?: true`)
// accountsSlice.addPaymentMethod copies `declines` only when it is exactly true
// src/features/checkoutActions.ts
export type CheckoutResult = { ok: true; order: Order } | { ok: false; reason: "declined" | "unusable-payment" | "nothing-to-order" };
export const submitOrder: (args: { shipTo: Address; paymentMethodId: string }) => AppThunk<CheckoutResult>;
//   reads Date.now(); the active buyer's method by id → missing or !isUsablePayment → "unusable-payment" (nothing dispatched);
//   method.declines → "declined" (nothing dispatched); else placeOrder({ shipTo, payment: { kind, label: paymentLabel(method) } }),
//   null → "nothing-to-order"
export const DECLINED_TITLE = "Card declined";
export const declinedText: (label: string) => string; // `The bank declined ${label}. Pick another payment method, then place the order again.`
```

**How "declined" is known, against the card-data rule.**
- **The flag.** When the card is saved, `toSavedCard` compares the typed number with Stripe's public decline test number and stores `declines: true` on a match. The number is then thrown away, as before.
- **Why it's allowed.**
  - The flag holds no digits and can't be turned back into a number.
  - It only says "this was Stripe's published always-decline card", which is public.
  - Brand, last 4, expiry, holder and nickname stay the only card details kept.
- **Rejected alternative.** "Visa + last 4 `0002`" would need no stored field, but it would decline any Luhn-valid Visa that happens to end in 0002.
- **Older saves.** `declines` is a new optional field, and a missing value is read as "not declining". Saved data loads unchanged, with no `VERSION` bump: the validity check never looks inside payment methods. A card saved before this task with the decline number has no flag, so it pays normally. Its number is gone, so the flag can't be worked out again.
- **Where the check lives.** `placeOrder` only receives `{ kind, label }`, so the check sits one step before it, in `submitOrder`. `placeOrder` and its Phase A/D tests are unchanged, and a declined attempt dispatches nothing. The order number isn't used up, the cart stays as it was, and so does the stock.

- [ ] **Step 1: Write the failing pure and thunk tests**

`cardUtils.test.ts` (add):
- **"isDeclineTestNumber":**
  - `"4000 0000 0000 0002"` → true;
  - `"4000000000000002"` → true;
  - `"4242424242424242"` → false;
  - `""` → false.
- **"toSavedCard flags the declining test card":** its sorted keys are `["brand", "declines", "expMonth", "expYear", "holder", "last4"]`, with `declines: true` and `last4: "0002"`. Phase D's 4242 test keeps its five keys.

`payments.test.ts` (add) › **"addPaymentMethod keeps the decline flag and nothing else":**
- `{ ...card, declines: true, number: "4000000000000002", cvv: "123" } as any` stores exactly `id, kind, brand, last4, expMonth, expYear, holder, isDefault, declines`.
- `{ ...card, declines: false } as any` stores no `declines` key.

`checkoutActions.test.ts` (`setupStore` on `buildSeed(Date.now())`, Omar signed in, his cart `[{ itemId: "item-tt-smart-watch", quantity: 1 }]`, `shipTo` = his Home address):
- **"a declined card places nothing":** `submitOrder({ shipTo, paymentMethodId: "pm-omar-declines" })` returns `{ ok: false, reason: "declined" }`. After it:
  - `orders` still has 13 entries;
  - Omar's `cart` is the same reference;
  - the smart watch's stock is still 2.
- **"another method then works":** with `"cod"` the result is `ok: true`, with `order.number` "A-10014" and `payment` `{ kind: "cod", label: "Cash on delivery" }`.
- **"the label comes from the method":** Omar's Mastercard gives the payment label "Mastercard ending 4444".
- **"unknown or expired method":** `"pm-nope"` and an expired fixture card both give "unusable-payment", and nothing is dispatched (a dispatch spy sees only the thunk).

- [ ] **Step 2: Run them to verify they fail, then implement**

Write the type, `cardUtils` and the reducer changes, plus `checkoutActions.ts`. Add Omar's seed card (seed facts).

Run: `npx vitest run src/features src/seed`. Expected: FAIL, then PASS. Phase A's "buyers come ready" still passes, since the new card's expiry is a month offset.

- [ ] **Step 3: Write the failing page tests**

**`Checkout.test.tsx` (add) › "declined, then cash on delivery places A-10014":** Omar, cart smart watch ×1.
1. In "2. Pay with", "Change", then pick the radio matching `/Visa ending 0002/`.
2. "Place order". Inside the "2. Pay with" section:
   - an `alert` holds "Card declined" and "The bank declined Visa ending 0002. Pick another payment method, then place the order again.";
   - the alert is `document.activeElement`;
   - the location is still `/checkout`, `orders` has 13 entries, and `selectCartCount` is 1.
3. Pick "Cash on delivery". The alert is gone.
4. "Place order". The newest order in state has `number` "A-10014", the location is `/account/orders/<that order's id>` (placed ids are uuids, Phase A), and the page shows "Order A-10014 placed".

**`AddCardForm.test.tsx` (add):**
- **"the declining test card saves without its number":**
  1. "Use declining test card" fills `4000 0000 0000 0002`.
  2. Type "Omar Khaled", `12/39` and `123`, then Save.

  The new method has `last4: "0002"` and `declines: true`. `JSON.stringify(store.getState())` contains neither `4000000000000002` nor `4000 0000 0000 0002`.
- **"help text":** the form says "4000 0000 0000 0002 saves, but is always declined at checkout."

**`Payments.test.tsx` (add):** Omar's page shows "Declines (test)", "Visa ending 0002" and the chip "Always declined (test card)".

- [ ] **Step 4: Run them to verify they fail, then build**

- **`Checkout`, placing:** Place order calls `submitOrder({ shipTo: address, paymentMethodId: method.id })`.
  - `ok`: Phase D's navigation.
  - `"declined"`:
    - release the `useRef` guard;
    - set `declinedId = method.id`;
    - open the payment "Change" list;
    - show an MUI `Alert severity="error"` (`role="alert"`, `tabIndex={-1}`, focused) at the top of "2. Pay with", with the title `DECLINED_TITLE` and the text `declinedText(paymentLabel(method))`.

    The alert shows only while the picked method's id is `declinedId`.
  - `"unusable-payment"`: toast "That payment method can't be used. Pick another one." and release the guard.
  - `"nothing-to-order"`: Phase D's toast "Nothing in your cart could be ordered."
- **`AddCardForm`:**
  - After Phase D's help sentence, add "4000 0000 0000 0002 saves, but is always declined at checkout."
  - Add a third text button, "Use declining test card". The three buttons are written out by hand, not generated from `TEST_CARDS`, so Phase D's `getByRole("button", { name: "Use test Visa" })` still finds exactly one.
- **`Payments`:** a card with `declines` gets the chip "Always declined (test card)" in `color.orange`.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 5: Check by hand, AI-LOG and commit**

At 360 px, as Omar:
1. Check out with "Declines (test)". The error shows on the payment step, and the cart badge is unchanged.
2. Switch to Mastercard and place the order. It is the next number.
3. Add `4000 0000 0000 0002` as a new card. DevTools → Local Storage holds no `4000000000000002`.

Add `## 29. Declined test card: Stripe's 4000 0000 0000 0002 fails at checkout (Claude Code)`.
```bash
git add -A && git commit -m "Add the declined test card: saves normally, fails at Place order with the error on the payment step"
```

---

### Task 5 (spec task 20): Wishlist

**Files:**
- Create:
  - `src/features/wishlistActions.ts`
  - `src/components/SaveButton.tsx`
  - `src/pages/Account/Saved.tsx`
- Modify:
  - `src/features/accountsSlice.ts`, `selectors.ts`
  - `src/components/ProductCard.tsx`, `BuyCard.tsx`
  - `src/components/header/BuyerHeader.tsx`, `MenuDrawer.tsx`
  - `src/pages/Buy/Product.tsx`, `src/pages/Account/AccountLayout.tsx`
  - `src/routes/Index.tsx`, `vite.config.ts`
  - `src/seed/catalogue.ts`, `docs/AI-LOG.md`
- Test:
  - `src/features/__tests__/wishlist.test.ts`
  - `src/components/__tests__/SaveButton.test.tsx`
  - `src/pages/Account/__tests__/Saved.test.tsx`
  - `src/components/header/__tests__/BuyerHeader.test.tsx`, `BuyerHeader.phone.test.tsx` (edit)

**Interfaces:**
- Consumes:
  - Phase A: `BuyerAccount.wishlist`, `removeItem` (already strips wishlists), `selectActiveBuyer`, `selectItemsById`.
  - Phase B: `ROUTES.accountSaved`, `LoginDialog`.
  - Phase C: `BuyerHeader` (row 1 grid), `MenuDrawer`, `media.narrow`.
  - Phase D: `ProductCard`, `BuyCard`, `AccountLayout`, `RequireBuyer`, `EmptyState`.
  - Phase E: `setItemsStatus` (archive keeps wishlist ids).
  - Existing: `useNotification().showNotification`.
- Produces:

```ts
// src/features/accountsSlice.ts
toggleWishlist(payload: { buyerId: string; itemId: string }) // present → removed; absent → added at the front; not a buyer → no-op
// src/features/wishlistActions.ts
export const toggleSaved: (itemId: string) => AppThunk<"added" | "removed" | "login">; // no buyer → "login", nothing dispatched
// src/features/selectors.ts
selectWishlistIds(state): string[]           // the active buyer's raw list; [] for a guest (one shared empty array)
selectIsSaved(state, itemId: string): boolean
selectSavedItems(state): Item[]              // list order; status "active" only; unknown ids dropped
selectSavedCount(state): number              // selectSavedItems(state).length, the header count
// components
const SaveButton: React.FC<{ item: Pick<Item, "id" | "name">; labelled?: boolean }>;
//   <button aria-pressed aria-label={`Save ${name}`}>; icon FavoriteBorder / Favorite (color.red when pressed);
//   labelled → visible text "Save" / "Saved". Guest → opens LoginDialog; when a buyer signs in while it is open, the item is saved
// ProductCard gains overlay?: React.ReactNode, rendered top-right over the picture and outside its link
// header copy: wide row 1 link `Saved, ${n} ${n === 1 ? "item" : "items"}` → ROUTES.accountSaved; drawer link `Saved (${n})` ("Saved" at 0)
```

**Saved data:** `wishlist` is a Phase A field, already `[]` in every saved buyer, so there is no `VERSION` bump. Guests store nothing.

**Choices this task makes:**
- **Guests:** the heart opens the buyer "Log in" dialog. If a buyer signs in from that dialog, the item is saved straight away. Closing the dialog saves nothing.
- **Archived and draft items:** Phase E keeps their ids in wishlists, and this plan keeps that. `selectSavedItems` hides anything that isn't active, and the header count uses the same selector, so the page and the count always agree. If the seller makes the item active again, it comes back. A deleted item leaves the list through Phase A's `removeItem`.
- **Where the count sits:**
  - On wide screens, a "Saved" link sits in row 1 between the account button and the cart. It shows the heart and a badge (hidden at 0), and the "Saved" text hides under `media.narrow`, like "Cart". The row-1 grid gains one `auto` column.
  - Phones don't get it in the bar: Phase C's 360 px bar has no room left. The drawer instead lists "Saved (N)" right after "Orders", for signed-in buyers.
- **Order:** the newest save is first.

- [ ] **Step 1: Write the failing slice and selector tests**

`wishlist.test.ts` (seed; Ahmed holds Diver watch and Linen throw blanket):
- **"toggleWishlist adds to the front and removes":** toggling `item-tt-smart-watch` gives `["item-tt-smart-watch", "item-tt-diver-watch-steel", "item-hl-linen-throw-blanket"]`. Toggling again gives back the two.
- **"not a buyer is a no-op":** with `acc-mona` the state is the same reference.
- **"guest gets login":** with no buyer signed in, `toggleSaved("item-tt-smart-watch")` returns "login" and the state is the same reference.
- **"selectIsSaved and the count":** for Ahmed, `selectIsSaved(…, "item-tt-diver-watch-steel")` is true and `selectSavedCount` is 2. As a guest, the count is 0.
- **"archived items hide from Saved and the count":**
  - `setItemsStatus({ ids: ["item-tt-diver-watch-steel"], status: "archived" })` gives `selectSavedItems` names `["Linen throw blanket"]` and a count of 1. `selectWishlistIds` still has 2.
  - Status "active" brings the count back to 2.
- **"sold out stays saved":** Linen throw blanket (stock 0) is in `selectSavedItems`.

- [ ] **Step 2: Run them to verify they fail, then implement**

Write the reducer, the thunk and the selectors, and add Ahmed's seed wishlist.

Run: `npx vitest run src/features`. Expected: FAIL, then PASS.

- [ ] **Step 3: Write the failing component and page tests**

**`SaveButton.test.tsx`:**
- **"the heart sits outside the card link":** at `/c/watches` as Ahmed, the button "Save Diver watch, steel" has `aria-pressed="true"`, and `closest("a")` is null.
- **"toggle":** as Ahmed on `/p/item-tt-smart-watch`, the labelled button (`getByRole("button", { name: "Save Smart watch" })`) has the visible text "Save" (`toHaveTextContent`). Clicking it changes the text to "Saved", with `aria-pressed="true"` and the toast "Added to Saved". Clicking again gives "Removed from Saved". The accessible name stays "Save Smart watch" throughout.
- **"guest heart asks to log in, then saves":**
  1. As a guest on `/p/item-tt-smart-watch`, "Save" opens the dialog "Log in".
  2. Pick "Ahmed".

  Then Ahmed's `wishlist[0]` is `"item-tt-smart-watch"`, the toast reads "Added to Saved", and the button's visible text is "Saved".
- **"closing the dialog saves nothing":** as a guest, "Save", then close the dialog, then log in as Ahmed from the header. His wishlist still has 2 items.

**`Saved.test.tsx`** (`RouterIndex` at `/account/saved`, `setViewportWidth(1280)`):
- **"lists saved products":** as Ahmed, there is an h2 "Saved", and the cards are "Diver watch, steel" and "Linen throw blanket", in that order. The blanket shows "Sold out".
- **"unsaving removes the card and updates the header":** "Save Diver watch, steel" → one card left, the toast "Removed from Saved", and the header link "Saved, 1 item".
- **"empty":** a new buyer sees "Nothing saved yet", the text "Tap the heart on a product to keep it here.", and "Browse the shop" → `/`.
- **"guests are asked to log in":** the heading "Log in to see your account" (Phase D's `RequireBuyer`).
- **"account nav":** the links, in order, are "Overview", "Orders", "Saved", "Your addresses", "Payment methods", "Profile".

**Phase C test edits:**
- `BuyerHeader.test.tsx` › "row 1 in order": insert the link "Saved, 0 items" (href `/account/saved`) between the button "Log in" and the link "Cart, 0 items".
- Add › "Saved count": with Ahmed signed in, the link reads "Saved, 2 items". After archiving the Diver watch, it reads "Saved, 1 item".
- `BuyerHeader.phone.test.tsx` › "drawer order": for Ahmed, insert the link "Saved (2)" → `/account/saved` after "Orders". "guest greeting" also asserts there is no "Saved" link.
- "phone bar in order" is unchanged.

- [ ] **Step 4: Run them to verify they fail, then build**

- **`ProductCard`:** the `overlay` slot is absolutely placed in the picture frame's top-right corner (44 × 44 px target, `color.bg` at 0.85 behind the icon, radius 0), as a sibling of the picture link.
- **`BuyCard`:** passes `overlay={<SaveButton item={item}/>}`.
- **`Product`:** a labelled `SaveButton` next to `CartControl`.
- **`SaveButton`:** renders a lazy `LoginDialog` (`lazy(() => import("./LoginDialog"))`) only after a guest click.
  - It keeps a pending flag. When `selectActiveBuyer` becomes non-null while the dialog is open, it dispatches `toggleSaved(id)`, unless the item is already saved.
  - Closing the dialog clears the flag.
  - The toasts are "Added to Saved" and "Removed from Saved".
- **`Saved` page:**
  - h2 and document title "Saved".
  - A grid of `BuyCard`s from `selectSavedItems`. It is the account route `saved`, replacing Phase B's `ComingSoon`.
  - The empty state is `EmptyState` with the copy in Step 3.
- **`AccountLayout`:** "Saved" goes after "Orders".
- **Preload:** key `"/account/saved"` → buyerLayout + saved, in `START_CODE` and `ROUTE_SOURCES`.

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 5: Check by hand, AI-LOG and commit**

At 360 px and 1280 px:
1. As a guest, tap a heart, log in as Omar: it is saved.
2. As Ahmed, the wide header reads "Saved, 2 items". The phone drawer shows "Saved (2)".
3. As Mona, archive the Diver watch. Switch back: Ahmed's count is 1. Reactivate it: the count is 2 again.
4. At 360 px no row-1 element is pushed off-screen, and at 1024 px the "Saved" text hides with "Cart".

Add `## 30. Wishlist: hearts on cards and the product page, Saved page, header count (Claude Code)`.
```bash
git add -A && git commit -m "Add the wishlist: hearts on cards and product pages, Saved page, header count"
```

---

### Task 6 (spec task 21): Recently viewed

**Files:**
- Create: `src/hooks/useRecordView.ts`, `src/components/RecentlyViewedRow.tsx`
- Modify:
  - `src/features/accountsSlice.ts`, `selectors.ts`
  - `src/pages/Buy/Product.tsx`, `Home.tsx`
  - `src/seed/catalogue.ts`, `docs/AI-LOG.md`
- Test:
  - `src/features/__tests__/recentlyViewed.test.ts`
  - `src/pages/Buy/__tests__/Product.test.tsx`, `Home.test.tsx` (add)

**Interfaces:**
- Consumes:
  - Phase A: `BuyerAccount.recentlyViewed`, `removeItem`, `selectActiveBuyer`, `selectItemsById`.
  - Phase D: `Product` (renders only active items), `Home`, `BuyCard`.
  - Task 5: `SaveButton` (cards in the row carry hearts through `BuyCard`).
- Produces:

```ts
// src/features/accountsSlice.ts
export const RECENTLY_VIEWED_MAX = 8;
recordView(payload: { buyerId: string; itemId: string })
//   moves or adds itemId to the front, keeps RECENTLY_VIEWED_MAX; already first → state unchanged (same reference); not a buyer → no-op
// accountsSlice's removeItem case also strips the id from recentlyViewed
// src/features/selectors.ts
selectRecentlyViewed(state, excludeId?: string): Item[] // list order; status "active" only; unknown ids and excludeId dropped; [] for a guest
// src/hooks/useRecordView.ts
const useRecordView: (itemId: string | null) => void; // signed-in buyer only; dispatches recordView when itemId or buyerId changes
// src/components/RecentlyViewedRow.tsx
const RecentlyViewedRow: React.FC<{ excludeId?: string }>; // section "Recently viewed" (h2) with BuyCards; renders null when empty
```

**Saved data:** `recentlyViewed` is a Phase A field, already `[]` in every saved buyer, so there is no `VERSION` bump. Guests add no field, to `session` or anywhere else.

**Choices this task makes:**
- **Guests aren't tracked.** The list lives on `BuyerAccount`, so no new persisted field is needed, and there are no lists to merge when someone logs in. The demo always has a named buyer one click away. A guest sees no row.
- **When a view counts.** The view is recorded when the product page renders an active item, so a 404 never records. Recording the same product again (React StrictMode's double effect, or a refresh) changes nothing, so it doesn't trigger a save.
- **Filtered when read.** Archived and draft items stay in the list but don't show. Deleted items leave the list through `removeItem`.
- **Placement:**
  - On the store home, the row is the last section, after "New arrivals".
  - On the product page, it comes after "More from <store>" and leaves out the product on screen.
  - It uses the listing grid, so it wraps instead of scrolling sideways at 360 px.

- [ ] **Step 1: Write the failing slice and selector tests**

`recentlyViewed.test.ts` (seed; Ahmed's list is earbuds, duffel, pour-over):

| Test | Action | Expected Ahmed `recentlyViewed` |
| --- | --- | --- |
| "a new view goes first" | `recordView` smart watch | `["item-tt-smart-watch", "item-ps-wireless-earbuds", "item-cc-weekender-duffel", "item-hl-pour-over-coffee-set"]` |
| "a repeat view moves to the front" | `recordView` duffel | `["item-cc-weekender-duffel", "item-ps-wireless-earbuds", "item-hl-pour-over-coffee-set"]` |
| "keeps the last 8" | 9 distinct new ids, in order | length 8: the 9th id first, down to the 2nd; the 1st new id and all three seed ids are gone |
| "already first changes nothing" | `recordView` earbuds | `state.accounts` is the same reference |
| "not a buyer is a no-op" | `buyerId: "acc-mona"` | same reference |
| "removeItem strips it" | `removeItem("item-cc-weekender-duffel")` | `["item-ps-wireless-earbuds", "item-hl-pour-over-coffee-set"]` |

Selectors:
- **"selectRecentlyViewed":** for Ahmed, the names are `["Wireless earbuds", "Weekender duffel", "Pour-over coffee set"]`. With `excludeId` earbuds there are 2.
- **"archived items hide":** archiving the duffel gives 2 items, and the list still has 3 ids.
- **"guest":** `[]`.

- [ ] **Step 2: Run them to verify they fail, then implement**

Write the reducer, the `removeItem` case, the selector, and Ahmed's seed list.

Run: `npx vitest run src/features`. Expected: FAIL, then PASS.

- [ ] **Step 3: Write the failing page tests**

**`Product.test.tsx` (add):**
- **"opening a product records it":** Ahmed at `/p/item-tt-smart-watch`:
  - his `recentlyViewed[0]` is `"item-tt-smart-watch"`;
  - the region "Recently viewed" holds 3 cards (earbuds, duffel, pour-over) and no "Smart watch";
  - it comes after the region "More from Tick & Tock".
- **"guests aren't tracked":** as a guest there is no "Recently viewed" heading, and the accounts state is the same reference after rendering.
- **"a 404 records nothing":** Ahmed at `/p/nope` leaves his list unchanged.
- **"StrictMode records once":** rendered inside `<React.StrictMode>`, Ahmed's list has `item-tt-smart-watch` exactly once.

**`Home.test.tsx` (add):**
- **"Recently viewed row":** as Ahmed, the region "Recently viewed" holds 3 cards, earbuds first, and it is the last section after "New arrivals".
- **"no row for a guest or an empty list":** neither a guest nor Omar sees a "Recently viewed" heading.

- [ ] **Step 4: Run them to verify they fail, then build**

- **`Product`:** calls `useRecordView(item?.id ?? null)` after the 404 check. The hook reads `selectActiveBuyer()?.id` and dispatches in a `useEffect` keyed on `[buyerId, itemId]`.
- **`RecentlyViewedRow`:**
  - `<section aria-labelledby>` with the h2 "Recently viewed" and up to 8 `BuyCard`s (all lazy-loaded pictures, none `isPriority`).
  - Its grid matches "New arrivals".
- **Placement:** `Home` appends `<RecentlyViewedRow/>`. `Product` adds `<RecentlyViewedRow excludeId={item.id}/>` after "More from".

Run: `npm test && npm run lint && npm run build`. Expected: PASS.

- [ ] **Step 5: Check by hand, AI-LOG and commit**

At 360 px and 1280 px, as Omar:
1. Open four products, then go home. The row lists them newest first.
2. Open one of them again: it moves to the front, and the product page leaves itself out.
3. Refresh: the row is still there.
4. As a guest: no row.
5. As Mona, archive one of them. It leaves Omar's row.

Add `## 31. Recently viewed: last 8 products on the home and the product page (Claude Code)`.
```bash
git add -A && git commit -m "Add recently viewed: the last 8 products on the store home and the product page"
```

---

## Self-review notes

**Spec coverage**
- **Task 1 (16):**
  - Up to 3 options, each variant with its own price, stock and SKU.
  - The picker on the product page.
  - Cart and order lines carry `variantId`/`variantLabel`.
  - "from $X" on listings.
  - The seller form edits options and builds the rows (30 at most).
  - The stock is summed in `itemSlice`.
  - Quick edit and bulk stock are off for variant items.
  - The cancel restock and `decreaseStock` work per variant.
  - Three seed products with variants. It goes first, as the spec asks, because it reshapes cart lines.
- **Task 2 (17):** the was price with validation, the percent off, `sale=1` with its chip and facets, the Deals row, and six seeded was prices.
- **Task 3 (18):** fee and threshold in store settings, the per-shipment fee and hint at checkout, `buildOrder` and checkout on one rule, buyer totals equal seller revenue, and the seed fees.
- **Task 4 (19):** the decline test number saves and fails at Place order, with the error on the payment step. No order is made, the cart stays, and the flag is justified against the card rule.
- **Task 5 (20):** hearts on cards and the product page, the Saved page at `ROUTES.accountSaved`, the header count, the guest login prompt, and archived items hidden.
- **Task 6 (21):** the last 8 distinct products, newest first, recorded on the product page, shown on the home and the product page (leaving out the current one). Guests aren't tracked.

**Seed numbers rechecked against Phases D and E**
- Variant sums are 40, 25 and 60. The cheapest variants are $19, $29 and $12. Variant seed lines cost $19, $29 and $12. So these hold:
  - Phase D's price sorts, the bags range (4), accessories facets 2/2/3, 27 units and Nour's totals;
  - Phase E's 558, 404, 177, 217, the Tick & Tock customers and the products filters.
- Fees: seed orders keep `deliveryFee: 0`. Phase D's checkout test totals ($194, $129, 323) hold, because Tick & Tock is free and the $65 backpack clears Carry Co.'s $50.
- The new Omar card and Ahmed's lists touch no Phase D/E assertion. The Phase C header tests that Task 5 edits are listed in Task 5 Step 3.

**Phase D tests this plan edits on purpose**
- `listingQuery.test.ts` literals gain `onSale` (Task 2).
- The `Home.test.tsx` "New arrivals" count is scoped to its region if needed (Task 2).

**Shared names**
- `itemPriceProps`, `PriceTag`, `rowPrice`, `LineName` and `withVariantTotals` are defined in Task 1 and reused unchanged later.
- `isOnSale` is the only sale test.
- `deliveryFeeFor` is the only fee rule.
- `submitOrder` is the only caller of `placeOrder` from the UI after Task 4.

## Contract gaps

1. **Phase A, `decreaseStock` and variant totals.** Phase A's `decreaseStock` takes `variantId`, but it doesn't say the item's `stockNum` follows. Phase E's restock "adds back to the item or its variant", with the same gap. Task 1 pins `withVariantTotals`: on every write, the item holds the variant sum and the lowest variant price. Spec task 23 (cancel and return requests, planned in parallel) should restock through the same reducers, so the totals stay right.
2. **Phase D's cart and checkout shapes aren't variant-aware.** These lack variants:
   - `CartRow`;
   - `joinCart` (its "missing item dropped" rule would hide a counted line);
   - `CartControl({ item })`;
   - `groupCartByStore` (it totals with `item.price`).

   Task 1 extends them: `CartRow.variant`, `rowPrice`, a missing variant is "inactive", `CartControl` takes `variantId` and shows "Choose options". Phase A's `buildOrder` doesn't say what happens to a line whose variant is gone, so Task 1 skips it.
3. **Phase E's `duplicateItem` variant ids.** Phase E pins `${id}-v${i}`, but not where `i` starts, and it keeps the original variant SKUs, which would then repeat. Task 1 pins `n` from 1 and SKUs `${sku}-${n}`.
4. **Phase E's new-product id.** Phase E doesn't say when a new product's id is made. Variant ids need it, so Task 1 makes it once, on mount.
5. **Phase E's quick price edit vs `compareAtPrice`.** `validateQuickEdit` doesn't know the was price, so a quick edit can raise the price above it. Task 2 doesn't block the edit. `isOnSale` hides the sale until the seller fixes the was price in the form.
6. **`PaymentMethod.declines` isn't in Phase A's types.** Task 4 adds it as optional, so saved data needs no `VERSION` bump. Phase D's `placeOrder` gets only `{ kind, label }`, so Task 4 adds `submitOrder` in front of it instead of changing `placeOrder`.
7. **Phase A's `removeItem` doesn't strip `recentlyViewed`.** Phase A strips carts and wishlists only. Task 6 adds the `recentlyViewed` case.
8. **Phase C's pinned header tests.** Task 5 changes these, and lists each edit:
   - the row-1 order (a new "Saved" link);
   - the phone drawer order ("Saved (N)" after "Orders").

   The row-1 grid gains a column, so Phase C's 360 px review item needs re-checking by hand.
9. **Phase D section markup.** The tests here find the home and product-page sections by `getByRole("region", { name })`. Phase D doesn't pin `<section aria-labelledby>` for "Shop by category", "Our stores", "New arrivals" and "More from <store>". Tasks 2 and 6 add it where it's missing.
10. **Shared places with the parallel plan (spec tasks 22–27; the lower-case "task N" below are spec numbers):**
    - **Header row 1:** the order is now logo, search, switch, account, **Saved**, cart. The notifications bell (task 26) should go between the switch and the account button, or the two plans must agree on another order.
    - **`ListingQuery` param order:** it ends `instock, sale`. A rating filter (task 24) should come after `sale`, and its tests should edit the same literals.
    - **Section order:**
      - Home: hero, Shop by category, Deals, Our stores, New arrivals, Recently viewed.
      - Product page: picture, name, price, stock, description, picker, Add to cart + Save, Sold by, delivery text, More from, Recently viewed. Reviews (task 24) should sit before "More from".
      - Order page shipment card: status, lines, "Delivery". Buy again and the cancel/return buttons (tasks 22–23) go after it.
    - **Buy again (task 22)** must carry `OrderLine.variantId` into the cart, and skip lines whose variant is gone (`addToCart` already ignores them).
    - **Reviews (task 24)** are per item, not per variant.
11. **Seed orders and fees.** Phase A sets every seed shipment's `deliveryFee` to 0. Task 3 keeps that while the stores now charge: the past orders count as placed before fees existed. If Phase A's seed changes, Phase D's and E's totals must be re-derived.
