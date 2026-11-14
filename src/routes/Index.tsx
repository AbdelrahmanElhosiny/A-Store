import { Suspense, lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { LEGACY_REDIRECTS, ROUTES, ROUTE_PATTERNS } from "../constant/routes";
import useRouteFocus from "../hooks/useRouteFocus";
import whenIdle from "../utils/whenIdle";

// Load each page and layout only when opened or prefetched.
const load = {
  buyerLayout: () => import("../layout/BuyerLayout"),
  buyHome: () => import("../pages/Buy/Home"),
  cart: () => import("../pages/Buy/Cart"),
  trackBought: () => import("../pages/Buy/TrackBought"),
  sellerLayout: () => import("../layout/SellerLayout"),
  sellHome: () => import("../pages/Sell/Home"),
  addItem: () => import("../pages/Sell/AddItem"),
  trackSold: () => import("../pages/Sell/TrackSold"),
  signUp: () => import("../pages/SignUp"),
  sellerSignUp: () => import("../pages/Seller/SellerSignUp"),
  comingSoon: () => import("../pages/ComingSoon"),
  error404: () => import("../pages/Error404"),
  legacyRedirect: () => import("../pages/LegacyRedirect"),
};

const BuyerLayout = lazy(load.buyerLayout);
const BuyHome = lazy(load.buyHome);
const Cart = lazy(load.cart);
const TrackBought = lazy(load.trackBought);
const SellerLayout = lazy(load.sellerLayout);
const SellHome = lazy(load.sellHome);
const AddItem = lazy(load.addItem);
const TrackSold = lazy(load.trackSold);
const SignUp = lazy(load.signUp);
const SellerSignUp = lazy(load.sellerSignUp);
const ComingSoon = lazy(load.comingSoon);
const Error404 = lazy(load.error404);
const LegacyRedirect = lazy(load.legacyRedirect);

// A failed prefetch is fine: the page loads (or fails visibly) when opened.
const prefetch = (loaders: (() => Promise<unknown>)[]) =>
  loaders.forEach((loader) => loader().catch(() => undefined));

// Fetch the starting page and its layout together, avoiding an extra round trip.
// Keep the build's ROUTE_SOURCES in vite.config.ts in sync.
const START_CODE: Record<string, (() => Promise<unknown>)[]> = {
  [ROUTES.home]: [load.buyerLayout, load.buyHome],
  [ROUTES.cart]: [load.buyerLayout, load.cart],
  [ROUTES.accountOrders]: [load.buyerLayout, load.trackBought],
  [ROUTES.signUp]: [load.buyerLayout, load.signUp],
  [ROUTES.seller]: [load.sellerLayout, load.trackSold],
  [ROUTES.sellerProducts]: [load.sellerLayout, load.sellHome],
  [ROUTES.sellerProductNew]: [load.sellerLayout, load.addItem],
  [ROUTES.sellerSignUp]: [load.sellerLayout, load.sellerSignUp],
};
prefetch(
  START_CODE[window.location.pathname.replace(/\/+$/, "") || ROUTES.home] ?? [],
);

const RouterIndex = () => {
  useRouteFocus();

  // Once idle, fetch the buyer home and seller dashboard for the next visit.
  useEffect(() => {
    whenIdle().then(() =>
      prefetch([load.buyerLayout, load.buyHome, load.sellerLayout, load.trackSold]),
    );
  }, []);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<BuyerLayout />}>
          <Route
            path={ROUTES.home}
            element={<BuyHome />}
          />
          <Route
            path={ROUTE_PATTERNS.category}
            element={<ComingSoon title="Category" phase="Phase D" />}
          />
          <Route
            path={ROUTES.search()}
            element={<ComingSoon title="Search results" phase="Phase D" />}
          />
          <Route
            path={ROUTE_PATTERNS.product}
            element={<ComingSoon title="Product" phase="Phase D" />}
          />
          <Route
            path={ROUTE_PATTERNS.store}
            element={<ComingSoon title="Store" phase="Phase D" />}
          />
          <Route
            path={ROUTES.cart}
            element={<Cart />}
          />
          <Route
            path={ROUTES.checkout}
            element={<ComingSoon title="Checkout" phase="Phase D" />}
          />
          <Route
            path={ROUTES.signUp}
            element={<SignUp />}
          />
          <Route path={ROUTES.account}>
            <Route index element={<ComingSoon title="Your account" phase="Phase D" />} />
            <Route
              path={ROUTES.accountOrders}
              element={<TrackBought />}
            />
            <Route
              path={ROUTE_PATTERNS.accountOrder}
              element={<ComingSoon title="Order details" phase="Phase D" />}
            />
            <Route
              path={ROUTES.accountAddresses}
              element={<ComingSoon title="Your addresses" phase="Phase F" />}
            />
            <Route
              path={ROUTES.accountPayments}
              element={<ComingSoon title="Payment methods" phase="Phase F" />}
            />
            <Route
              path={ROUTES.accountProfile}
              element={<ComingSoon title="Your profile" phase="Phase F" />}
            />
            <Route
              path={ROUTES.accountSaved}
              element={<ComingSoon title="Saved items" phase="Phase F" />}
            />
          </Route>
          <Route path="*" element={<Error404 />} />
        </Route>
        <Route path={ROUTES.seller} element={<SellerLayout />}>
          <Route index element={<TrackSold />} />
          <Route
            path={ROUTES.sellerSignUp}
            element={<SellerSignUp />}
          />
          <Route
            path={ROUTES.sellerProducts}
            element={<SellHome />}
          />
          <Route
            path={ROUTES.sellerProductNew}
            element={<AddItem />}
          />
          <Route
            path={ROUTE_PATTERNS.sellerProduct}
            element={<ComingSoon title="Product details" phase="Phase E" />}
          />
          <Route
            path={ROUTES.sellerOrders}
            element={<ComingSoon title="Orders" phase="Phase E" />}
          />
          <Route
            path={ROUTE_PATTERNS.sellerOrder}
            element={<ComingSoon title="Order details" phase="Phase E" />}
          />
          <Route
            path={ROUTES.sellerCustomers}
            element={<ComingSoon title="Customers" phase="Phase E" />}
          />
          <Route
            path={ROUTE_PATTERNS.sellerCustomer}
            element={<ComingSoon title="Customer details" phase="Phase E" />}
          />
          <Route
            path={ROUTES.sellerStore}
            element={<ComingSoon title="Your store" phase="Phase E" />}
          />
          <Route path="*" element={<Error404 />} />
        </Route>
        {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
          <Route key={from} path={from} element={<LegacyRedirect to={to} />} />
        ))}
      </Routes>
    </Suspense>
  );
};

export default RouterIndex;
