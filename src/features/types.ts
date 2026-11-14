import { CategoryId } from "../constant/categories";

// The marketplace's data. The slices, the seed and saved data all use these,
// so no slice needs to import another just for a type.

// -----------------
// Accounts
// -----------------
export type Role = "buyer" | "seller";

export interface Address {
  id: string;
  label: string; // "Home", "Work"
  name: string; // who receives it
  line1: string;
  line2?: string;
  city: string;
  // strings: a number would drop leading zeros and "+"
  zipCode: string;
  phoneNum: string;
  isDefault: boolean;
}

export type CardBrand = "visa" | "mastercard" | "amex";

// A card keeps only what's safe to show: never the full number or the CVV
export interface PaymentMethod {
  id: string;
  kind: "card" | "cod";
  brand?: CardBrand;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  holder?: string;
  nickname?: string;
  isDefault: boolean;
}

// one cart line; a variant of an item is a line of its own
export interface CartLine {
  itemId: string;
  variantId?: string;
  quantity: number;
}

interface AccountBase {
  id: string;
  role: Role;
  name: string;
  avatarColor: string; // a CSS colour (a token's value)
  createdAt: number;
  notificationsSeenAt: number;
}

export interface BuyerAccount extends AccountBase {
  role: "buyer";
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  cart: CartLine[];
  wishlist: string[]; // item ids
  recentlyViewed: string[]; // item ids, newest first
}

export interface SellerAccount extends AccountBase {
  role: "seller";
  storeId: string;
}

export type Account = BuyerAccount | SellerAccount;

// the buyer id of orders placed while signed out
export const GUEST_ID = "guest";

// Who is signed in, per mode. The mode itself comes from the address.
export interface SessionState {
  buyerId: string | null;
  sellerId: string | null;
  guestCart: CartLine[];
  // the last page in each mode, for the mode switch
  lastPath: { buyer: string; seller: string };
}

// -----------------
// Stores and items
// -----------------
export interface Store {
  id: string;
  ownerId: string; // a seller account
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoLetter: string;
  logoColor: string; // a CSS colour (a token's value)
  banner?: string;
  since: number;
  categoryFocus: CategoryId;
  lowStockAt: number;
  autoShip: boolean;
  deliveryFee: number;
  freeDeliveryOver: number | null; // null: never free
}

export type ItemStatus = "active" | "draft" | "archived";

export interface ProductOption {
  name: string; // "Size"
  values: string[]; // ["S", "M", "L"]
}

export interface Variant {
  id: string;
  values: string[]; // one per option, in the options' order
  price: number;
  stockNum: number;
  sku: string;
}

export interface Item {
  id: string;
  storeId: string;
  category: CategoryId;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number; // the "was" price
  stockNum: number;
  // a URL: a bundled picture, or a data URL from the Add Item picker
  image?: string;
  status: ItemStatus;
  sku: string;
  createdAt: number;
  options?: ProductOption[];
  variants?: Variant[];
}

// -----------------
// Orders
// -----------------
export type ShipmentStatus =
  | "placed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "return-requested"
  | "returned";

export interface StatusEvent {
  status: ShipmentStatus;
  at: number;
}

// the item as it was when ordered: the seller can change or remove it later
export interface OrderLine {
  itemId: string;
  variantId?: string;
  variantLabel?: string; // "M / Red"
  name: string;
  price: number;
  image?: string;
  quantity: number;
  reviewId?: string;
}

// the part of an order one store sends
export interface Shipment {
  id: string;
  storeId: string;
  lines: OrderLine[];
  status: ShipmentStatus;
  history: StatusEvent[];
  carrier?: string;
  trackingNo?: string;
  deliverAt?: number; // set when shipped; it arrives then
  deliveryFee: number;
}

export interface Order {
  id: string;
  number: string; // "A-10001"
  buyerId: string; // an account id, or GUEST_ID
  placedAt: number;
  shipTo: Address;
  payment: { kind: "card" | "cod"; label: string };
  shipments: Shipment[];
  isSeed: boolean;
}
