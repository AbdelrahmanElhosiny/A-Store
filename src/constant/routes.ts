import type { CategoryId } from "./categories";

export const ROUTES = {
  home: "/",
  category: (id: CategoryId) => `/c/${id}`,
  search: (q?: string) => (q ? `/search?q=${encodeURIComponent(q)}` : "/search"),
  product: (itemId: string) => `/p/${itemId}`,
  store: (slug: string) => `/store/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  signUp: "/sign-up",
  account: "/account",
  accountOrders: "/account/orders",
  accountOrder: (orderId: string) => `/account/orders/${orderId}`,
  accountAddresses: "/account/addresses",
  accountPayments: "/account/payments",
  accountProfile: "/account/profile",
  accountSaved: "/account/saved",
  seller: "/seller",
  sellerSignUp: "/seller/sign-up",
  sellerProducts: "/seller/products",
  sellerProductNew: "/seller/products/new",
  sellerProduct: (itemId: string) => `/seller/products/${itemId}`,
  sellerOrders: "/seller/orders",
  sellerOrder: (orderId: string) => `/seller/orders/${orderId}`,
  sellerCustomers: "/seller/customers",
  sellerCustomer: (buyerId: string) => `/seller/customers/${buyerId}`,
  sellerStore: "/seller/store",
} as const;

// Relative paths for dynamic children in the route tree.
export const ROUTE_PATTERNS = {
  category: "c/:category",
  product: "p/:itemId",
  store: "store/:slug",
  accountOrder: "orders/:orderId",
  sellerProduct: "products/:itemId",
  sellerOrder: "orders/:orderId",
  sellerCustomer: "customers/:buyerId",
} as const;

export const LEGACY_REDIRECTS: Record<string, string> = {
  "/buy": ROUTES.home,
  "/buy/cart": ROUTES.cart,
  "/buy/track-bought": ROUTES.accountOrders,
  "/buy/sign-up": ROUTES.signUp,
  "/sell": ROUTES.seller,
  "/sell/add-item": ROUTES.sellerProductNew,
  "/sell/track-sold": ROUTES.seller,
  "/sell/sign-up": ROUTES.sellerSignUp,
};

export const isSellerPath = (pathname: string): boolean => {
  const path = pathname.toLowerCase();
  return path === ROUTES.seller || path.startsWith(`${ROUTES.seller}/`);
};
