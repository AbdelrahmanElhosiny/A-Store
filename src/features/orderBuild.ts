import { Address, CartLine, Item, Order, OrderLine, Shipment, Store } from "./types";

// "A-10001": seed orders start there, new ones count on from the highest
const FIRST_ORDER_NUMBER = 10001;

export const nextOrderNumber = (orders: Pick<Order, "number">[]) => {
  const highest = orders.reduce(
    (max, { number }) => Math.max(max, Number(number.slice(2)) || 0),
    FIRST_ORDER_NUMBER - 1,
  );
  return `A-${String(highest + 1).padStart(5, "0")}`;
};

// One order from a cart: a shipment per store, in the order the cart first
// mentions each store. Each line keeps a copy of the item as it is now.
// Lines whose item (or variant) no longer exists are left out.
export const buildOrder = ({
  id,
  number,
  buyerId,
  now,
  cart,
  itemsById,
  storesById,
  shipTo,
  payment,
}: {
  id: string;
  number: string;
  buyerId: string;
  now: number;
  cart: CartLine[];
  itemsById: Record<string, Item>;
  storesById: Record<string, Store>;
  shipTo: Address;
  payment: Order["payment"];
}): Order => {
  const linesByStore = new Map<string, OrderLine[]>();

  cart.forEach(({ itemId, variantId, quantity }) => {
    const item = itemsById[itemId];
    if (!item) return;
    const variant = variantId
      ? item.variants?.find((other) => other.id === variantId)
      : undefined;
    if (variantId && !variant) return;

    const line: OrderLine = {
      itemId,
      name: item.name,
      price: variant?.price ?? item.price,
      quantity,
    };
    if (variant) {
      line.variantId = variant.id;
      line.variantLabel = variant.values.join(" / ");
    }
    if (item.image) line.image = item.image;

    const lines = linesByStore.get(item.storeId) ?? [];
    lines.push(line);
    linesByStore.set(item.storeId, lines);
  });

  const shipments: Shipment[] = [...linesByStore].map(
    ([storeId, lines], index) => {
      const store = storesById[storeId];
      const subtotal = lines.reduce(
        (sum, line) => sum + line.price * line.quantity,
        0,
      );
      const isFree =
        !store ||
        (store.freeDeliveryOver !== null && subtotal >= store.freeDeliveryOver);
      return {
        id: `${id}-${index + 1}`,
        storeId,
        lines,
        status: "placed",
        history: [{ status: "placed", at: now }],
        deliveryFee: isFree ? 0 : store.deliveryFee,
      };
    },
  );

  return {
    id,
    number,
    buyerId,
    placedAt: now,
    shipTo,
    payment,
    shipments,
    isSeed: false,
  };
};
