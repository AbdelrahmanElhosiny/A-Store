# A-Store: marketplace overhaul plan

> Exported from the Claude Doc "A-Store: marketplace overhaul plan" (https://claude.ai/artifact/2tKmriyRm2Zm5q6PyQxemm) on 2026-11-13, after the decisions were made. The doc is the living copy; this file is the spec the phase plans in `docs/superpowers/plans/` implement.

Nov 11, 2026 (decisions made Nov 13, 2026)

Turn A-Store from one shop with a Sell/Buy split into a small marketplace: several dummy seller stores, buyers with saved addresses and payment methods, category browsing with sort and filter, seller tools for shipments and customers, a mode switch in the navbar, and a store-like header. Structure and features only; the Gruvbox, sharp-edged look stays.

## Decisions first

Five calls change what gets built. Each has my default; pick in the last column or comment, and everything below follows the defaults until you do.

| Decision | My default | Why it matters | Your call |
| --- | --- | --- | --- |
| What "admin" means | Sellers get the admin controls over their own store. | No platform admin role: no third mode, no extra dummy accounts, no pages that police other sellers. | Changed: sellers only, no platform admin |
| Accounts per mode | Separate buyer and seller accounts. Each mode remembers its own signed-in account, so the switch flips between "Ahmed shopping" and "Tick Tock Watches selling" without logging in again. | Lets you demo a whole order in one sitting: buy, switch, ship, switch back, watch it arrive. | Go with default |
| Where the work lands | A new `marketplace` branch off `AI-enhanced`, merged back by PR when done; the later `fullstack` branch starts from it. | The old plan's rule "keep the slices and routes" can't hold here. React 18, MUI 5 and RTK 1.9 still stay; one task = one prompt = one commit, logged in `docs/AI-LOG.md` from entry 11. | Go with default |
| Card data | Keep only brand, last 4 digits, expiry, name on card and a nickname. The full number is checked (Luhn) and thrown away; the CVV is never kept. Cash on delivery is a second method type. | Everything lands in localStorage. The old plan said "no card data at all"; this keeps that spirit and still gives buyers several methods. | Go with default |
| Who moves a shipment | The seller marks an order Packed, then Shipped with a carrier and tracking number; Delivered follows on a timer. Seed stores have an "Auto-ship (demo)" switch, on by default: it moves orders placed during the visit along every 20 s, but never for the store whose seller is signed in and never the seeded waiting orders, so the To pack tab and the hand-ship loop survive. | Today the status comes only from the clock. Seller-driven status is what makes "follow shipments" real. | Go with default |

## Where the app is today

The app is one shop seen from two sides: every item belongs to "the store", every user is a buyer, and Sell vs Buy is only a URL prefix. The overhaul replaces that foundation, so most files below change.

| Area | Today (`AI-enhanced`, `18e0a35`) | What has to change |
| --- | --- | --- |
| Users | `features/userSlice.ts`: one array, Guest always at index 0, `isLoggedIn` flag on each user, `userType` always `"buyer"`, one address per user (`address`, `optAddress`, `zipCode`, `phoneNum`), unused `pillingInfo` with numeric card fields | Split into accounts with a role, a session per mode, an address book and payment methods |
| Items | `features/itemSlice.ts`: 5 seed items, no seller, no category, no dates; TODO "add seller name to item" | `sellerId`, `category`, `createdAt`, status (active, draft, archived), SKU |
| Orders | Lines live inside each buyer's `orderedItems`; Track Sold flat-maps every user's lines (`useSell.ts`: "one seller, the store") | Own `orders` slice: one order, one shipment per seller, status history |
| Delivery | `utils/orders.ts` works the status out from the clock: ships at 15 s, arrives at 45 s | Status set by the seller (or auto-ship), stored with timestamps |
| Routes | `/` split hero, `/buy/*`, `/sell/*`, sign-up under both; `useSide` reads the prefix | Store at `/`, seller centre at `/seller/*`, account at `/account/*` |
| Navbar | `components/NavBar.tsx`: logo, 3 text links, theme switch, Log in / Sign up; phone drawer repeats the links | Store header with search, categories, account menu, cart, mode switch (point 4) |
| Saved data | `app/persist.ts`, `VERSION = 1`, valid only if `users[0]` is Guest and exactly one user is logged in | New shape, `VERSION = 2`, new validity rule; old saves fall back to the seed |
| Start-page preload | `routes/Index.tsx` `START_CODE` and `vite.config.ts` `ROUTE_SOURCES`, hero image preload, a regex on the headphones picture | Rewritten for the new routes, or the Lighthouse scores from task 10 drop |
| Seed pictures | 5 WebP files in `src/assets/products/`, mapped in `SEED_IMAGES`, credited in `CREDITS.md` | About 25 new pictures for the stores, same pipeline (640 x 480 WebP, 2 to 10 KB) |

**Keep as they are:** the Gruvbox tokens and sharp edges, `ProductCard`, `CartStepper`, `AppDialog`, `Toaster`, `EmptyState`, the form fields, Formik + Yup, Motion presets, error boundaries, the guest-cart merge on login, and the Reset demo data button.

## Target structure

Two modes, five slices, and a data model that matches the planned `fullstack` collections, so stage 3 swaps the data source instead of rewriting the shapes again.

**Slices**

| Slice | Holds | Replaces |
| --- | --- | --- |
| `accounts` | Every buyer and seller account: id, role, name, avatar colour; buyers also hold addresses, payment methods and their cart | `users` |
| `session` | The signed-in buyer id, the signed-in seller id, the guest's cart, and the last page visited in each mode (for the switch). The mode itself is never stored: the address decides it | `isLoggedIn` flags and the Guest at index 0 |
| `stores` | One store per seller: name, slug, logo letter and colour, banner, tagline, "since" date, Auto-ship switch | nothing (new) |
| `items` | Products with `storeId`, `category`, `status`, `sku`, `createdAt` | `items` (extended) |
| `orders` | Orders with one shipment per store and a status history | each buyer's `orderedItems` |

`notification` stays. Categories are a constant list (`constant/categories.ts`), not a slice.

**Core types (sketch)**

```ts
type Role = "buyer" | "seller";
interface Address { id: string; label: string; name: string; line1: string; line2?: string; city: string; zipCode: string; phoneNum: string; isDefault: boolean }
interface PaymentMethod { id: string; kind: "card" | "cod"; brand?: "visa" | "mastercard" | "amex"; last4?: string; expMonth?: number; expYear?: number; holder?: string; nickname?: string; isDefault: boolean }
interface Item { id: string; storeId: string; category: CategoryId; name: string; description: string; price: number; stockNum: number; image?: string; status: "active" | "draft" | "archived"; sku: string; createdAt: number }
type ShipmentStatus = "placed" | "packed" | "shipped" | "delivered" | "cancelled";
interface Shipment { id: string; storeId: string; lines: OrderLine[]; status: ShipmentStatus; history: { status: ShipmentStatus; at: number }[]; carrier?: string; trackingNo?: string }
interface Order { id: string; buyerId: string; placedAt: number; shipTo: Address; payment: { kind: "card" | "cod"; label: string }; shipments: Shipment[] }
```

`OrderLine` keeps today's snapshot (item id, name, price, picture, quantity), so a seller editing or removing an item never changes a past order. `shipTo` and `payment.label` ("Visa ending 4242") are snapshots too.

**Routes**

| Mode | Path | Page |
| --- | --- | --- |
| Buyer | `/` | Store home: hero, category tiles, featured stores, new arrivals |
| Buyer | `/c/:category` | Category listing with sort and filters in the query string |
| Buyer | `/search?q=` | Search results, same listing component |
| Buyer | `/p/:itemId` | Product page: picture, price, stock, "Sold by" store link, add to cart |
| Buyer | `/store/:slug` | A store's public page and its products |
| Buyer | `/cart`, `/checkout` | Cart, then checkout: address, payment method, review, place order |
| Buyer | `/account/*` | Overview, orders, order detail, addresses, payment methods, profile |
| Seller | `/seller` | Dashboard |
| Seller | `/seller/products/*` | Product list, add, edit |
| Seller | `/seller/orders/*` | Orders to ship, order detail |
| Seller | `/seller/customers/*` | Buyers who ordered from this store, buyer profile |
| Seller | `/seller/store` | Store profile settings |
| Both | `/sign-up` | Buyer sign-up; a new store signs up at /seller/sign-up |

Old addresses (`/buy/cart`, `/sell/track-sold`, …) redirect to their new pages, so bookmarks and the classic-vs-AI comparison links keep working.

## Point 1a: sellers as dummy stores

Four seed stores, each owned by one seller account and focused on one kind of product; the five items in the shop today move into them. Store and seller names are invented, with no real brands in names or pictures.

| Store | Sells | Owner account | Seed products | Today's items it takes |
| --- | --- | --- | --- | --- |
| Tick & Tock | Watches, straps | Mona | 8 | Smart watch |
| Carry Co. | Backpacks, totes, wallets | Karim | 8 | City backpack |
| Pocket Signal | Phones, cases, chargers, earbuds | Youssef | 8 | Wireless headphones |
| Hearth Lane | Home and kitchen | Laila | 6 | Desk lamp, Ceramic mug |

That is about 30 products, so about 25 new pictures through the task 5 pipeline (640 x 480 WebP, 2 to 10 KB, listed in `CREDITS.md`). Prices and stock vary on purpose, so sorting, "Only 2 left" and "Sold out" all show up.

**Admin controls a seller gets over their own store**

- **Products table** (replaces the card grid on Sell home): picture, name, SKU, category, price, stock, status, units sold; search by name or SKU; filter by status, low stock and sold out.
- **Status:** Active (in the shop), Draft (only the seller sees it), Archived (hidden, history kept). An item that has orders is archived instead of deleted, so Track pages and customer profiles never lose it.
- **Bulk actions:** select rows, then set status, add or remove stock, or delete drafts.
- **Quick edits:** stock and price edit in the row (the `StockField` arrows from task 9b); the full form for the rest, with a category picker and a SKU.
- **Duplicate** a product to start a similar one.
- **Store settings:** name, tagline, description, logo letter and colour, banner picture, low-stock threshold (today the fixed `LOW_STOCK = 3`), Auto-ship (demo).
- **Ownership:** a seller only sees and changes their own store. Selectors filter by `storeId` and the seller routes check the session; a product id from another store shows the 404 page.

A seller who signs up in seller mode creates a new store with a name and a category focus, and lands on an empty dashboard that points to Add product.

## Point 1b: buyers

Buyers get an account area with addresses and payment methods, a real checkout that uses them, and category pages with the sorts and filters Baymard found shoppers rely on.

**Addresses** (`/account/addresses`)

- Fields: label (Home, Work), full name, address line 1 and 2, city, ZIP, phone. One is the default; any can be made default.
- Called "Your addresses", not "Address book": Baymard found shoppers don't recognise that term, and that most saved addresses are added during checkout, not on the account page. So checkout can add and edit addresses too.
- Editing is as easy to reach as adding. Baymard found that nudging people to "Add" piles up stale addresses that then get picked by mistake.
- Sign-up keeps its address fields; what it asks for becomes the first, default address.

**Payment methods** (`/account/payments`)

- Add a card: number, name, expiry, CVV. The brand comes from the first digits (4 Visa, 51-55 and 2221-2720 Mastercard, 34 and 37 Amex); the number must pass the Luhn check and the expiry must be in the future.
- Saved and shown: "Visa ending 4242, expires 12/28", plus an optional nickname. The full number and the CVV never reach Redux or localStorage.
- The form suggests Stripe's public test numbers (4242 4242 4242 4242, 5555 5555 5555 4444), so nobody types a real card into a demo.
- Cash on delivery is a method that is always there.
- Set default, rename, remove. An expired card shows as expired and can't be picked at checkout.

**Checkout** (`/checkout`, new between the cart and the order)

1. Ship to: the default address picked, with Change and Add new.
2. Pay with: the default method picked, with Change and Add new.
3. Review: lines grouped by store ("Ships from Tick & Tock"), item totals, delivery, order total, Place order.

A guest is asked to log in or sign up at checkout; the guest-cart merge from task 7 carries the cart over.

**Browsing by category**

- Categories: Watches, Bags, Phones, Audio, Home and kitchen, Accessories. Each has a tile on the store home, a link in the header's category row and a page at `/c/:category`.
- Sort, as a labelled dropdown that shows the active choice (Baymard advises against a "Sort by" option inside the list): Best-selling (units ordered), Price low to high, Price high to low, Newest. Customer rating joins the list with reviews (task 24). No A to Z: Baymard found people rarely use it.
- Filters: price range (min and max fields), store (several at once, with a count beside each), in stock only, and category on search results. Applied filters show as chips with an × and a Clear all.
- Sort and filters live in the query string (`/c/watches?sort=price-asc&store=tick-tock`), so Back, refresh and a shared link keep them.
- Wide screens: filters in a left column, applied at once. Phones: a sticky "Filter and sort" button opens a full-screen panel with a "Show 12 results" button that counts as you choose.
- Search: a box in the header searches names, descriptions and store names; results use the same listing page.

**Product page** (`/p/:itemId`, new): picture, name, price, stock chip, description, "Sold by Tick & Tock" linking to the store, quantity stepper and Add to cart, then more from the same store.

## Point 2: seller tools

The seller centre gets four working areas: a dashboard of what needs doing, the store's orders with shipping actions, the products table from point 1a, and customer profiles built from that store's orders.

**One order, one shipment per store.** A buyer's cart with a watch and a backpack becomes one order with two shipments: Tick & Tock ships the watch, Carry Co. the backpack. Each seller only sees and moves their own shipment. The buyer sees the order as "Partly shipped" until every shipment is out, the way Shopify shows Partially fulfilled.

**Shipment status line**

| Status | Set by | What the buyer sees |
| --- | --- | --- |
| Placed | Checkout | "Order placed, waiting for the store" |
| Packed | Seller, Mark packed | "Being packed by Tick & Tock" |
| Shipped | Seller, Mark shipped: carrier and tracking number | Carrier, tracking number, "On its way" |
| Delivered | Timer, 30 s after Shipped (today's gap between shipping and arriving), or seller | "Delivered" with the time |
| Cancelled | Seller, before shipping (buyer cancelling and returns come in task 23) | "Cancelled"; the stock goes back |

Carriers are invented names (Nile Express, Delta Post); the tracking number is generated and can be edited. Auto-ship (demo) moves Placed to Packed to Shipped on its own, 20 s per step, only for orders placed during the visit and only while that store's seller is not signed in.

**Dashboard** (`/seller`)

- To do: orders to pack, orders to ship, orders waiting longer than a set time ("late"), products low on stock or sold out. Each links to the filtered list. Etsy's dashboard leads with the same kind of list: open orders that need dispatching, overdue first.
- Figures for today, 7 days, 30 days or all time: revenue, orders, units sold, average order value.
- Recent orders and top products.

**Orders** (`/seller/orders`)

- Tabs: To pack, To ship, Shipped, Delivered, Cancelled, All, each with a count.
- Columns: order number, buyer, placed, items, total, status. Search by order number or buyer name.
- Order page: buyer (links to their profile), ship-to address and phone, payment label, lines, status history with times, and the actions that fit the status.

**Customers** (`/seller/customers`)

- Everyone who ordered from this store: name, city, orders, units, total spent, last order. Sort by total spent or last order.
- Customer profile: what they ordered from this store, order by order, with status; totals; first and last order; the items they buy most.
- A seller sees only what came with orders to their store: name, the ship-to address and phone on those orders. Never the buyer's other addresses, payment methods, or orders with other stores.

Today's Track Sold numbers (units, revenue, stock per item) move into the products table and the dashboard; `/sell/track-sold` redirects to the dashboard.

## Point 3: dummy users and the mode switch

The Sell/Buy split page goes away: `/` is the store, and a **mode switch** next to Log in (or the avatar) moves between shopping and selling, the way Airbnb puts "Switch to hosting" next to the profile photo.

**Seed accounts.** Each login dialog lists only its own mode's accounts.

| Mode | Accounts | Comes with |
| --- | --- | --- |
| Buyer | Ahmed (Cairo), Omar (Alexandria), Nour (Giza) | 2 addresses each, a test card or two plus cash on delivery, and past orders spread over the last 25 days, some across two stores (delivered, shipped, waiting) |
| Seller | Mona (Tick & Tock), Karim (Carry Co.), Youssef (Pocket Signal), Laila (Hearth Lane) | Their store, its products, and the shipments from those past orders |

The past orders are what fill the seller dashboards, Orders tabs and customer profiles on first visit. Reset demo data brings all of it back.

**How the switch behaves**

- The address decides the mode: anything under `/seller` is seller mode, everything else is buyer mode. A link to a seller page opens seller mode, so the switch can never disagree with the page.
- The switch is a link: "Switch to selling" in buyer mode, "Switch to shopping" in seller mode. It goes back to the last page you had open in that mode, or that mode's home the first time (my call; it makes the buy, ship, check loop quick).
- Each mode keeps its own signed-in account (decision 2). Log out signs out of the current mode only.
- Seller mode with nobody signed in shows a "Pick your store" page with the four stores and a Create a store link, instead of an empty dashboard.
- The logo goes to the current mode's home. Cart, wishlist and checkout exist only in buyer mode.
- Each mode keeps its accent colour from today (Buy and Sell), so you can tell at a glance which side you are on.
- Sign up in buyer mode makes a buyer account; in seller mode it makes a store and its owner.

The home page photos can come back as the store home's banner, so the image work from task 4 isn't lost.

## Point 4: navbar and phone menu

Buyer mode gets a two-row store header with search in the middle and categories underneath. Seller mode swaps the whole nav for a slim top bar and a left sidebar, the way Airbnb's hosting mode and the Shopify admin do.

_(Header mock-up drawing: see the Claude Doc, "Point 4" section.)_

The switch (accent) always sits just left of the account button; on phones it shrinks to "Sell" or "Shop" and the menu repeats it in full.

**Buyer header, wide screens**

- Row 1, left to right: logo, search (with an "All categories" scope), **Switch to selling**, the account button ("Log in", or "Hello, Ahmed" with the avatar), Cart with its count.
- Row 2: "All categories" first, then Watches, Bags, Phones, Audio, Home and kitchen, Accessories; "Ship to Cairo" at the right, from the default address. Baymard calls an "All" link at the far left, with the categories right beside it, the most foolproof setup.
- The header still sticks to the top, like today.

**Account menu.** Logged out: Log in, then "New here? Create an account", then the theme switch. Logged in: "Your account" first and bold, then Orders, Addresses, Payment methods; a divider; the theme switch and Log out in lighter type. Baymard found 71% of sites don't separate main from secondary account links. The theme switch moves into this menu and the phone menu to free the header (my call).

**Seller bar, wide screens**

- Top bar: logo with "Seller centre", the store's name, search over orders and products, **Switch to shopping**, avatar menu.
- Left sidebar: Home, Orders (with a "to ship" count), Products, Customers, Store settings.

**Phones**

- Buyer header: menu button on the left (it is on the right today; Shopify's Dawn theme puts it left), logo, a short "Sell" switch, avatar, cart. Search gets its own full-width line underneath.
- The menu slides in from the left: a greeting block ("Hello, Ahmed" or Log in and Create account), the full Switch to selling button, then the categories as top-level items, then a divider and smaller links (Orders, Addresses, Payment methods, theme, Reset demo data). Baymard found shoppers leave the menu when account links sit at the same level as categories, and that categories hidden behind one "Shop" link slow them down.
- Seller mode: menu button, logo, "Shop" switch, avatar; the menu holds the sidebar items.
- No bottom tab bar for now: Baymard's app study found that when categories hide behind a single menu in a tab bar, many people never find them, so the menu above keeps categories first.

The footer keeps its links (source, classic version, what AI changed, Reset demo data) and gains category and help columns on wide screens.

## Ideas for you to pick

Twenty extras beyond your four points, best value for effort first. None is in the phases above; each one you mark Add becomes one Phase F task. Effort: S is under half a task, M about one task, L two or more.

| Idea | What it adds | Effort | Decision |
| --- | --- | --- | --- |
| Reviews and ratings | 1 to 5 stars after delivery, one public reply per review from the seller (Etsy's rule: replying locks the review). Unlocks the Rating sort, a rating filter and a store rating | M | Add |
| Guided demo tour | A "Try the whole flow" card: buy as Ahmed, switch to Tick & Tock, ship it, switch back, see it arrive. Shows a recruiter the marketplace in one minute | M | Add |
| Wishlist | Heart on cards and the product page, a Saved page in the account, count in the header | S | Add |
| Buy again | Button on past orders that puts the same items back in the cart, at today's price and stock | S | Add |
| Deals | A "was" price on items, an On sale filter, a Deals row on the store home | S | Add |
| Delivery fees per store | Each store sets a fee and a free-delivery threshold; checkout shows them per shipment | S | Add |
| Declined test card | Stripe's 4000 0000 0000 0002 saves fine but is "declined" at checkout, so the error path is demoable | S | Add |
| Cancel and return requests | Buyer cancels before shipping or asks for a return after delivery; the seller approves; stock goes back. Adds Return requested and Returned states | M | Add |
| Sales chart | Revenue per day on the seller dashboard, drawn as SVG bars in Gruvbox colours, no chart library | S | Add |
| Notifications bell | Header bell: "Your watch shipped" for buyers, "New order" for sellers, unread count | M | Add |
| Recently viewed | A row of the last 8 products opened, on the home and the product page | S | Add |
| Follow a store | Follow button on store pages, a Following list, followed stores' new products on the home | S | No |
| Customer notes and tags | A private note and tags ("VIP", "Wholesale") on a seller's customer profile, as Shopify has | S | No |
| Packing slip | A print-friendly page per shipment with the address and lines | S | No |
| Orders as CSV | Export a seller's filtered orders list | S | No |
| Picture gallery | Up to 4 pictures per product, thumbnails on the product page | M | No |
| Messages on an order | A thread between buyer and store on each shipment | M | No |
| Product variants | Up to 3 options (size, colour) with stock and price per variant, as Shopify has | L | Add |
| Platform admin mode | A third mode: all stores, all accounts, categories, suspend a store or a product | L | No |
| Arabic and EGP | Right-to-left layout and a currency switch for the Egyptian seed data | L | No |

Your picks: 12 to add, 8 left out. The 12 are tasks 16 to 27 in Phase F below.

## Phases and commit order

Twenty-seven tasks in seven phases; the data comes first with no visible change, so every later task builds on shapes that already work. Each task is one prompt, one commit you review, and one `docs/AI-LOG.md` entry, numbered on from 10. Lint and build pass after every one.

**Phase A: data and seed**

1. **New slices and saved data:** `accounts`, `session`, `stores`, `orders`, extended `items`; selectors; `persist.ts` at `VERSION = 2` with its new validity check. The types already carry the fields your picked ideas need (variants, was price, delivery fee, wishlist, review and return states), so the save format doesn't change again. Today's pages read the new slices and look exactly the same.
2. **Seed catalogue:** four stores, seven accounts, about 30 products with pictures and credits, the seeded past orders.

**Phase B: modes and routes**

3. **Route tree:** the new paths, redirects from the old ones, the mode taken from the address, the split page removed; `START_CODE` and `ROUTE_SOURCES` rewritten so the start-page preload still works.
4. **Mode switch and logins:** the switch, one session per mode, login dialogs per mode, Pick your store, sign-up for both modes.

**Phase C: navbar**

5. **Store header and seller bar** on wide screens (point 4).
6. **Phone header and side menu** (point 4).

**Phase D: shopping**

7. **Category pages:** listing, sort, filters, chips, query-string state, phone filter panel.
8. **Search, product page, store page.**
9. **Account area and addresses.**
10. **Payment methods.**
11. **Checkout and buyer orders:** checkout steps, orders split into shipments, order list, order page with a tracking card per shipment.

**Phase E: seller centre**

12. **Seller orders:** tabs, order page, Mark packed and Mark shipped, cancel with restock, Auto-ship (demo).
13. **Products table:** statuses, SKU, category, bulk actions, quick edits, duplicate, store settings.
14. **Dashboard:** to-do list, figures by period, recent orders, top products.
15. **Customers:** list and profile.

**Phase F: your picked ideas**

16. **Product variants:** up to 3 options (size, colour) per product, each with its own price and stock; a picker on the product page; cart and order lines carry the variant; the seller's product form edits them. First, because it reshapes the cart lines later tasks build on.
17. **Deals:** a "was" price, an On sale filter, a Deals row on the store home.
18. **Delivery fees per store:** a fee and a free-delivery threshold in store settings; checkout shows them per shipment.
19. **Declined test card:** Stripe's 4000 0000 0000 0002 saves fine but is declined at checkout, with the error on the payment step.
20. **Wishlist:** a heart on cards and the product page, a Saved page in the account, a count in the header.
21. **Recently viewed:** the last 8 products opened, as a row on the home and the product page.
22. **Buy again:** on past orders, puts the same items back in the cart at today's price and stock.
23. **Cancel and return requests:** the buyer cancels before shipping or asks for a return after delivery; the seller approves; stock goes back. Adds the Return requested and Returned states.
24. **Reviews and ratings:** stars after delivery, one seller reply that locks the review; adds the Rating sort, a rating filter and a store rating.
25. **Sales chart:** revenue per day on the dashboard, SVG bars in Gruvbox colours, no chart library.
26. **Notifications bell:** "Your watch shipped" for buyers, "New order" for sellers, an unread count.
27. **Guided demo tour:** the "Try the whole flow" card. Last, so it walks the finished app.

**Phase G: check.** Re-run axe and Lighthouse on the new pages (task 10's target: 90+ on all four mobile Lighthouse scores, with the dark-mode red Remove buttons from 9b still the one known accessibility gap) and the 360 px no-sideways-scroll pass.

**Builder notes** (small calls from a review of this plan against the code; mine, change any)

- **Guests:** the guest keeps a cart in `session` and can't place orders; the login merge moves only the cart, so the "and 1 order" wording in `useAuth`'s carry text goes. Phase A keeps guest ordering working until checkout lands in task 11.
- **Timers:** store `shippedAt` and work out Delivered when read, as `utils/orders.ts` does today. Auto-ship runs from one listener-middleware tick that also catches up steps that fell due while the tab was closed.
- **Seed dates:** seeds are built by a function at load and on Reset, with times as offsets from now, so the 7- and 30-day figures always have data.
- **Archive vs delete:** archiving takes the item out of every cart, as `removeItem` does today; only items with no orders can be deleted.
- **Saved data and Reset:** the persist listener and Reset demo data cover every new slice; `loadState` says whether it dropped an old save, so the "demo was updated" toast only shows then.
- **Mode classes:** buyer mode keeps the `buy` class and theme, seller mode the `sell` ones; `useSide` already matches `/seller`.
- **404s:** a 404 route inside the seller layout too, with a button back to the seller home.
- **Sign-up checks:** today's rules stay (name 2 to 24 characters, unique ignoring case, ZIP, phone with 7+ digits), unique per role; a store also needs a unique name and slug. Log in by account id, not by name.
- **Redirects:** `/buy` to `/`, `/buy/cart` to `/cart`, `/buy/track-bought` to `/account/orders`, `/sell` to `/seller`, `/sell/add-item` to `/seller/products/new`, `/sell/track-sold` to `/seller`, both old sign-ups to their new ones.
- **Phase C before D:** the header links to pages that arrive in Phase D, so Phase B adds simple placeholder routes.
- **Preload:** the idle prefetch list in `routes/Index.tsx` and the first-product-picture regex in `vite.config.ts` move to the new home.
- **Small defaults:** cash on delivery is one fixed method that can't be removed; delivery is free until task 18 adds store fees; an order is "late" after 60 s; a signed-out seller opening a deep link picks a store, then lands on that link.

## Risks and what this breaks

The biggest risk is size: this is roughly as much work as tasks 1 to 10 together, and it rewrites the data layer they sit on.

| Risk | What happens | Plan |
| --- | --- | --- |
| Saved data from version 1 | Visitors' carts, sign-ups and added items from the current site don't fit the new shape | `VERSION = 2` drops them and starts from the seed; one toast says the demo was updated |
| localStorage size | About 30 seed pictures are bundled files, saved by name (fine), but seller-uploaded pictures are data URLs and fill the 5 MB quota faster with more stores | Keep the task 5 resize (960 px WebP) and the storage-full warning; consider 640 px for uploads |
| Lighthouse scores | New routes break the start-page preload, and the header with search and categories is heavier | Phase B rewrites `START_CODE` and `ROUTE_SOURCES`; Phase G re-measures |
| The classic-vs-AI comparison | The `master...AI-enhanced` diff becomes mostly this overhaul, not the UI upgrade | Tag `ai-ui-v1` on `AI-enhanced` before merging, and point the version chip's "Changes" link at that tag if you want the UI-only diff kept |
| Old links | `/buy/...` and `/sell/...` bookmarks, and links in the old plan doc | Redirects in Phase B |
| Card fields | A typed card number sitting in form state | It stays in the form only; the submit handler saves brand, last 4 and expiry and clears the field |
| Scope creep | The 12 picked ideas nearly double the work; variants alone touches the cart, checkout and products table | Phase F, one idea per task, after the 15 core tasks work; variants first so the rest build on its cart lines |

**Stays out of scope:** visual redesign (Gruvbox, sharp edges, fonts and motion stay), the backend and real auth (the `fullstack` stage), major version upgrades, real payments.

## Sources

Pages opened for this plan. Amazon, Noon, Etsy's storefront, eBay's home page and Fiverr's help blocked the research tools, so nothing here rests on their headers.

- [Airbnb: switching between hosting and traveling](https://www.airbnb.com/help/article/3546); [Airbnb hosting tools](https://www.airbnb.com/resources/hosting-homes/a/exploring-your-hosting-tools-738)
- [Baymard: product categories as top-level mobile navigation](https://baymard.com/blog/main-navigation-product-categories) (Jan 2023)
- [Baymard: "View All" in mobile navigation](https://baymard.com/blog/mobile-main-nav-view-all)
- [Baymard: mobile app UX trends](https://baymard.com/blog/mobile-app-ux-trends)
- [Baymard: account drop-down structure](https://baymard.com/blog/account-drop-down-structure)
- [Baymard: essential sort types](https://baymard.com/blog/essential-sort-types) (Apr 2021)
- [Baymard: ecommerce filter UI](https://baymard.com/blog/ecommerce-filter-ui) (Apr 2026)
- [Baymard: address book examples](https://baymard.com/ecommerce-design-examples/59-address-book); [Baymard: accounts and self-service research](https://baymard.com/research-articles/new-research-accounts-self-service)
- [Shopify Dawn header source](https://raw.githubusercontent.com/Shopify/dawn/main/sections/header.liquid); [Dawn demo store](https://theme-dawn-demo.myshopify.com/)
- [Shopify admin overview](https://help.shopify.com/en/manual/shopify-admin/shopify-admin-overview)
- [Shopify order statuses](https://help.shopify.com/en/manual/orders/order-status); [filtering orders](https://help.shopify.com/en/manual/fulfillment/managing-orders/viewing-orders/filtering-orders); [fulfilling an order](https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/single-fulfillment)
- [Shopify product details and status](https://help.shopify.com/en/manual/products/details/product-details-page); [managing customers](https://help.shopify.com/en/manual/customers/manage-customers); [analytics fields](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/analytics-fields)
- [Etsy: dashboard](https://help.etsy.com/hc/en-in/articles/360000343908-How-to-Use-Your-Dashboard-to-Manage-Your-Shop); [completing orders](https://help.etsy.com/hc/en-us/articles/115015774228); [multi-shop checkout](https://help.etsy.com/hc/en-us/articles/115013196707); [responding to reviews](https://help.etsy.com/hc/en-us/articles/115015808588)
- [eBay: how to sell](https://www.ebay.com/pages/help/sell.html)
- [noon Seller Lab homepage](https://supportagent.noon.partners/portal/en/kb/articles/navigating-your-homepage)
- [Stripe: test cards](https://docs.stripe.com/testing); [Stripe security guide](https://docs.stripe.com/security/guide); [PCI SSC: storing the CVC](https://blog.pcisecuritystandards.org/faq-can-cvc-be-stored-for-card-on-file-or-recurring-transactions)
- [Luhn algorithm](https://en.wikipedia.org/wiki/Luhn_algorithm)
- The earlier plan: [A-Store: AI upgrade, deploy and backend plan](https://claude.ai/artifact/NZQ5TRk5sVQDfBmkzB6G6D)
