import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "../pages/HomePage";
import BuyIndex from "../pages/Buy";
import AddItem from "../pages/Sell/AddItem";
import TrackSold from "../pages/Sell/TrackSold";
import Cart from "../pages/Buy/Cart";
import TrackBought from "../pages/Buy/TrackBought";
import { BUY_ROUTE, ROUTE_INDEX, SELL_ROUTE } from "../constant/routeConstant";
import BuyHome from "../pages/Buy/Home";
import SellIndex from "../pages/Sell";
import SellHome from "../pages/Sell/Home";
import { useEffect } from "react";
import useNotification from "../hooks/useNotification";
import SignUp from "../pages/SignUp";

const RouterIndex = () => {
  const location = useLocation();
  const { hideNotification } = useNotification();

  useEffect(() => {
    hideNotification();
  }, [location]);
  return (
    <Routes>
      <Route path={ROUTE_INDEX.HOME} element={<HomePage />} />
      <Route path={ROUTE_INDEX.SIGN_UP} element={<SignUp />} />
      <Route path={ROUTE_INDEX.SELL} element={<SellIndex />}>
        <Route index element={<SellHome />} />
        <Route path={SELL_ROUTE.ADD_ITEM} element={<AddItem />} />
        <Route path={SELL_ROUTE.TRACK_SOLD} element={<TrackSold />} />
      </Route>
      <Route path={ROUTE_INDEX.BUY} element={<BuyIndex />}>
        <Route index element={<BuyHome />} />
        <Route path={BUY_ROUTE.CART} element={<Cart />} />
        <Route path={BUY_ROUTE.TRACK_BOUGHT} element={<TrackBought />} />
      </Route>
    </Routes>
  );
};

export default RouterIndex;
