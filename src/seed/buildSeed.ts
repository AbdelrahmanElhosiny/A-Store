import { ROUTES } from "../constant/routes";
import {
  Account,
  BuyerAccount,
  Item,
  Order,
  PaymentMethod,
  SellerAccount,
  SessionState,
  Store,
} from "../features/types";
import { SEED_BUYERS, SEED_ITEMS, SEED_STORES } from "./catalogue";
import { SEED_IMAGES } from "./images";
import { buildSeedOrders } from "./seedOrders";

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

  const buyers: BuyerAccount[] = SEED_BUYERS.map((buyer) => {
    const firstName = buyer.name.toLowerCase();
    const start = new Date(now);
    const cards: PaymentMethod[] = buyer.cards.map((card, index) => {
      // count months from now so the card is never expired
      const months =
        start.getFullYear() * 12 + start.getMonth() + card.monthsAhead;
      const method: PaymentMethod = {
        id: `pm-${firstName}-${card.last4}`,
        kind: "card",
        brand: card.brand,
        last4: card.last4,
        expMonth: (months % 12) + 1,
        expYear: Math.floor(months / 12),
        isDefault: !buyer.codIsDefault && index === 0,
      };
      if (card.holder) method.holder = card.holder;
      if (card.nickname) method.nickname = card.nickname;
      return method;
    });
    return {
      id: buyer.id,
      role: "buyer",
      name: buyer.name,
      avatarColor: buyer.avatarColor,
      createdAt: now - 60 * DAY_MS,
      notificationsSeenAt: now,
      addresses: buyer.addresses.map(({ label, ...address }, index) => ({
        id: `addr-${firstName}-${label.toLowerCase()}`,
        label,
        name: buyer.name,
        ...address,
        isDefault: index === 0,
      })),
      paymentMethods: [
        ...cards,
        { id: "cod", kind: "cod", isDefault: buyer.codIsDefault },
      ],
      cart: [],
      wishlist: [],
      recentlyViewed: [],
    };
  });

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

  const items: Item[] = SEED_ITEMS.map(({ daysAgo, ...item }) => ({
    ...item,
    image: SEED_IMAGES[item.image],
    status: "active",
    createdAt: now - daysAgo * DAY_MS,
  }));

  return {
    accounts: [...sellers, ...buyers],
    session: {
      buyerId: null,
      sellerId: null,
      guestCart: [],
      lastPath: { buyer: ROUTES.home, seller: ROUTES.seller },
    },
    stores,
    items,
    orders: buildSeedOrders(now, items, buyers),
  };
};

// computed once, so every slice starts from the same "now"
export const initialSeed: SeedData = buildSeed(Date.now());
