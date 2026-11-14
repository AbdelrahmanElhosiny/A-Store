import { CartLine, Item } from "./types";

// Pure cart helpers, shared by the guest cart (session) and buyer carts
// (accounts). They return a new array and never change the one passed in.

// "itemId", or "itemId:variantId" for a variant
export const lineKey = ({
  itemId,
  variantId,
}: {
  itemId: string;
  variantId?: string;
}) => (variantId ? `${itemId}:${variantId}` : itemId);

const isLine =
  (itemId: string, variantId?: string) =>
  (line: CartLine) =>
    line.itemId === itemId && line.variantId === variantId;

const stockOf = (item: Item, variantId?: string) =>
  variantId
    ? (item.variants?.find(({ id }) => id === variantId)?.stockNum ?? 0)
    : item.stockNum;

// one more of the item, but never past its stock
export const addToCart = (
  cart: CartLine[],
  item: Item,
  variantId?: string,
): CartLine[] => {
  const stock = stockOf(item, variantId);
  const line = cart.find(isLine(item.id, variantId));
  if (!line) {
    if (stock <= 0) return cart;
    const added: CartLine = variantId
      ? { itemId: item.id, variantId, quantity: 1 }
      : { itemId: item.id, quantity: 1 };
    return [...cart, added];
  }
  if (line.quantity >= stock) return cart;
  return cart.map((other) =>
    other === line ? { ...line, quantity: line.quantity + 1 } : other,
  );
};

// an exact quantity (from a stepper); 0 or less removes the line
export const setLineQuantity = (
  cart: CartLine[],
  itemId: string,
  quantity: number,
  variantId?: string,
): CartLine[] => {
  const matches = isLine(itemId, variantId);
  if (quantity <= 0) return cart.filter((line) => !matches(line));
  if (!cart.some(matches)) {
    const added: CartLine = variantId
      ? { itemId, variantId, quantity }
      : { itemId, quantity };
    return [...cart, added];
  }
  return cart.map((line) => (matches(line) ? { ...line, quantity } : line));
};

// The guest's cart joins the account's on login: quantities add up, but
// not past the stock, and never below what the account already had.
// stockById is keyed by lineKey.
export const mergeCarts = (
  account: CartLine[],
  guest: CartLine[],
  stockById: Record<string, number>,
): CartLine[] =>
  guest.reduce((merged, guestLine) => {
    const key = lineKey(guestLine);
    const line = merged.find((other) => lineKey(other) === key);
    const had = line?.quantity ?? 0;
    const quantity = Math.max(
      Math.min(had + guestLine.quantity, stockById[key] ?? 0),
      had,
    );
    if (line)
      return merged.map((other) =>
        other === line ? { ...line, quantity } : other,
      );
    return quantity > 0 ? [...merged, { ...guestLine, quantity }] : merged;
  }, account);
