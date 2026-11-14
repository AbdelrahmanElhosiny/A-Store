import {
  Account,
  BuyerAccount,
  Item,
  Order,
  SellerAccount,
  SessionState,
  Store,
} from "../features/types";
import { SEED_BUYERS, SEED_ITEMS, SEED_STORES } from "./catalogue";
import { SEED_IMAGES } from "./images";

// what the five saved slices hold
export interface SeedData {
  accounts: Account[];
  session: SessionState;
  stores: Store[];
  items: Item[];
  orders: Order[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

// The starter data, with every time counted back from now. Each call makes
// new objects, so a reset never shares anything with the frozen state.
export const buildSeed = (now: number): SeedData => {
  const sellers: SellerAccount[] = SEED_STORES.map((store) => ({
    id: store.owner.id,
    role: "seller",
    name: store.owner.name,
    avatarColor: store.owner.avatarColor,
    createdAt: now - store.sinceDaysAgo * DAY_MS,
    notificationsSeenAt: now,
    storeId: store.id,
  }));

  const buyers: BuyerAccount[] = SEED_BUYERS.map((buyer) => ({
    id: buyer.id,
    role: "buyer",
    name: buyer.name,
    avatarColor: buyer.avatarColor,
    createdAt: now - 60 * DAY_MS,
    notificationsSeenAt: now,
    addresses: buyer.addresses.map((address, index) => ({
      id: `${buyer.id}-address-${index + 1}`,
      label: "Home",
      name: buyer.name,
      ...address,
      isDefault: index === 0,
    })),
    paymentMethods: [{ id: "cod", kind: "cod", isDefault: true }],
    cart: [],
    wishlist: [],
    recentlyViewed: [],
  }));

  const stores: Store[] = SEED_STORES.map((store) => ({
    id: store.id,
    ownerId: store.owner.id,
    name: store.name,
    slug: store.slug,
    tagline: store.tagline,
    description: store.description,
    logoLetter: store.logoLetter,
    logoColor: store.logoColor,
    since: now - store.sinceDaysAgo * DAY_MS,
    categoryFocus: store.categoryFocus,
    lowStockAt: 3,
    autoShip: true,
    deliveryFee: 0,
    freeDeliveryOver: null,
  }));

  const items: Item[] = SEED_ITEMS.map((item, index) => ({
    ...item,
    image: SEED_IMAGES[item.image],
    status: "active",
    createdAt: now - (30 - index) * DAY_MS,
  }));

  return {
    accounts: [...sellers, ...buyers],
    session: {
      buyerId: null,
      sellerId: null,
      guestCart: [],
      lastPath: { buyer: "/", seller: "/seller" },
    },
    stores,
    items,
    orders: [],
  };
};

// computed once, so every slice starts from the same "now"
export const initialSeed: SeedData = buildSeed(Date.now());
