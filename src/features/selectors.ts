import { createSelector } from "@reduxjs/toolkit";
import keyBy from "lodash/keyBy";
import sumBy from "lodash/sumBy";
import type { RootState } from "../app/store";
import { lineKey } from "./cart";
import {
  Address,
  BuyerAccount,
  Item,
  Order,
  SellerAccount,
  Shipment,
  Store,
} from "./types";

// Everything the pages read goes through these. The ones that build a new
// array or object are memoised, so the same state gives the same reference.

// -----------------
// Plain reads
// -----------------
const selectAccounts = (state: RootState) => state.accounts;
const selectSession = (state: RootState) => state.session;
const selectItems = (state: RootState) => state.items;
const selectOrders = (state: RootState) => state.orders;

// seed order, then sign-up order
export const selectStores = (state: RootState): Store[] => state.stores;

// -----------------
// Accounts and who is signed in
// -----------------
export const selectBuyerAccounts = createSelector(
  [selectAccounts],
  (accounts) =>
    accounts.filter(
      (account): account is BuyerAccount => account.role === "buyer",
    ),
);

export const selectSellerAccounts = createSelector(
  [selectAccounts],
  (accounts) =>
    accounts.filter(
      (account): account is SellerAccount => account.role === "seller",
    ),
);

export const selectActiveBuyer = createSelector(
  [selectBuyerAccounts, (state: RootState) => state.session.buyerId],
  (buyers, buyerId): BuyerAccount | null =>
    buyers.find(({ id }) => id === buyerId) ?? null,
);

export const selectActiveSeller = createSelector(
  [selectSellerAccounts, (state: RootState) => state.session.sellerId],
  (sellers, sellerId): SellerAccount | null =>
    sellers.find(({ id }) => id === sellerId) ?? null,
);

// the active seller's store
export const selectActiveStore = createSelector(
  [selectActiveSeller, selectStores],
  (seller, stores): Store | null =>
    (seller && stores.find(({ id }) => id === seller.storeId)) ?? null,
);

// -----------------
// Cart
// -----------------
// the signed-in buyer's cart, or the guest's
export const selectCart = createSelector(
  [selectActiveBuyer, selectSession],
  (buyer, session) => buyer?.cart ?? session.guestCart,
);

// total units
export const selectCartCount = createSelector([selectCart], (cart) =>
  sumBy(cart, "quantity"),
);

// -----------------
// Stores and items
// -----------------
export const selectItemsById = createSelector(
  [selectItems],
  (items): Record<string, Item> => keyBy(items, "id"),
);

export const selectStoresById = createSelector(
  [selectStores],
  (stores): Record<string, Store> => keyBy(stores, "id"),
);

// what buyers see: listed items, in stock or not
export const selectShopItems = createSelector([selectItems], (items) =>
  items.filter(({ status }) => status === "active"),
);

// a store's own list: every status
export const selectItemsForStore = createSelector(
  [selectItems, (_: RootState, storeId: string) => storeId],
  (items, storeId) => items.filter((item) => item.storeId === storeId),
);

// keyed by lineKey: the item id, and "itemId:variantId" for each variant
export const selectStockById = createSelector([selectItems], (items) => {
  const stock: Record<string, number> = {};
  items.forEach((item) => {
    stock[item.id] = item.stockNum;
    item.variants?.forEach((variant) => {
      stock[lineKey({ itemId: item.id, variantId: variant.id })] =
        variant.stockNum;
    });
  });
  return stock;
});

// -----------------
// Orders
// -----------------
// newest first (a copy: the state itself can't be sorted)
export const selectAllOrders = createSelector([selectOrders], (orders) =>
  [...orders].sort((a, b) => b.placedAt - a.placedAt),
);

export const selectOrdersForBuyer = createSelector(
  [selectAllOrders, (_: RootState, buyerId: string) => buyerId],
  (orders, buyerId) => orders.filter((order) => order.buyerId === buyerId),
);

// newest first
export const selectShipmentsForStore = createSelector(
  [selectAllOrders, (_: RootState, storeId: string) => storeId],
  (orders, storeId): { order: Order; shipment: Shipment }[] =>
    orders.flatMap((order) =>
      order.shipments
        .filter((shipment) => shipment.storeId === storeId)
        .map((shipment) => ({ order, shipment })),
    ),
);

// Only placed and packed shipments are waiting for the seller.
export const selectToShipCount = createSelector(
  [selectShipmentsForStore],
  (list): number => list.filter(({ shipment }) =>
    shipment.status === "placed" || shipment.status === "packed",
  ).length,
);

export const selectDefaultAddress = createSelector(
  [selectActiveBuyer],
  (buyer): Address | null => buyer?.addresses.find(({ isDefault }) => isDefault) ?? null,
);
