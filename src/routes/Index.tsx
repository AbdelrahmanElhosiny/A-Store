import { Suspense, lazy, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import { BUY_ROUTE, ROUTE_INDEX, SELL_ROUTE } from "../constant/routeConstant";
import useRouteFocus from "../hooks/useRouteFocus";
import whenIdle from "../utils/whenIdle";

// Only the home page is in the first download; every other page loads when
// it's opened, so a visitor to the home page doesn't wait for the forms,
// dialogs and icons of the whole shop.
const load = {
  buyIndex: () => import("../pages/Buy"),
  buyHome: () => import("../pages/Buy/Home"),
  cart: () => import("../pages/Buy/Cart"),
  trackBought: () => import("../pages/Buy/TrackBought"),
  sellIndex: () => import("../pages/Sell"),
  sellHome: () => import("../pages/Sell/Home"),
  addItem: () => import("../pages/Sell/AddItem"),
  trackSold: () => import("../pages/Sell/TrackSold"),
  signUp: () => import("../pages/SignUp"),
  error404: () => import("../pages/Error404"),
};

const BuyIndex = lazy(load.buyIndex);
const BuyHome = lazy(load.buyHome);
const Cart = lazy(load.cart);
const TrackBought = lazy(load.trackBought);
const SellIndex = lazy(load.sellIndex);
const SellHome = lazy(load.sellHome);
const AddItem = lazy(load.addItem);
const TrackSold = lazy(load.trackSold);
const SignUp = lazy(load.signUp);
const Error404 = lazy(load.error404);

// a failed prefetch is fine: the page loads (or fails visibly) when opened
const prefetch = (loaders: (() => Promise<unknown>)[]) =>
  loaders.forEach((loader) => loader().catch(() => undefined));

// The page a visit starts on: fetch its layout and its page together, as
// soon as this file runs. Otherwise the page's code is only found after the
// layout's code has arrived and rendered, one round trip later.
const BUY = ROUTE_INDEX.BUY;
const SELL = ROUTE_INDEX.SELL;
const START_CODE: Record<string, (() => Promise<unknown>)[]> = {
  [BUY]: [load.buyIndex, load.buyHome],
  [`${BUY}/${BUY_ROUTE.CART}`]: [load.buyIndex, load.cart],
  [`${BUY}/${BUY_ROUTE.TRACK_BOUGHT}`]: [load.buyIndex, load.trackBought],
  [`${BUY}/${BUY_ROUTE.SIGN_UP}`]: [load.buyIndex, load.signUp],
  [SELL]: [load.sellIndex, load.sellHome],
  [`${SELL}/${SELL_ROUTE.ADD_ITEM}`]: [load.sellIndex, load.addItem],
  [`${SELL}/${SELL_ROUTE.TRACK_SOLD}`]: [load.sellIndex, load.trackSold],
  [`${SELL}/${SELL_ROUTE.SIGN_UP}`]: [load.sellIndex, load.signUp],
};
prefetch(START_CODE[window.location.pathname.replace(/\/+$/, "")] ?? []);

const RouterIndex = () => {
  useRouteFocus();

  // once the page has loaded and the browser is idle, fetch both sides'
  // home pages, so the first click into Buy or Sell doesn't wait
  useEffect(() => {
    whenIdle().then(() =>
      prefetch([load.buyIndex, load.buyHome, load.sellIndex, load.sellHome]),
    );
  }, []);

  return (
    // a side's layout is loading: nothing to show yet (it's fast, and a
    // spinner flashing for a moment would be worse)
    <Suspense fallback={null}>
      <Routes>
        <Route path={ROUTE_INDEX.HOME} element={<HomePage />} />
        <Route path={ROUTE_INDEX.SELL} element={<SellIndex />}>
          <Route index element={<SellHome />} />
          <Route path={SELL_ROUTE.ADD_ITEM} element={<AddItem />} />
          <Route path={SELL_ROUTE.TRACK_SOLD} element={<TrackSold />} />
          <Route path={SELL_ROUTE.SIGN_UP} element={<SignUp />} />
          <Route path="*" element={<Error404 />} />
        </Route>
        <Route path={ROUTE_INDEX.BUY} element={<BuyIndex />}>
          <Route index element={<BuyHome />} />
          <Route path={BUY_ROUTE.CART} element={<Cart />} />
          <Route path={BUY_ROUTE.TRACK_BOUGHT} element={<TrackBought />} />
          <Route path={BUY_ROUTE.SIGN_UP} element={<SignUp />} />
          <Route path="*" element={<Error404 />} />
        </Route>
        {/* any other address: the 404 page inside the shop's layout */}
        <Route path="*" element={<BuyIndex />}>
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default RouterIndex;
