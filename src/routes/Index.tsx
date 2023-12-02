import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Sell from "../pages/Sell";
import Buy from "../pages/Buy";
import AddItem from "../pages/Sell/AddItem";
import TrackSold from "../pages/Sell/TrackSold";
import AddUser from "../pages/Buy/AddUser";
import Checkout from "../pages/Buy/Checkout";
import TrackBought from "../pages/Buy/TrackBought";
import SellLayout from "../layout/SellLayout";
import BuyLayout from "../layout/BuyLayout";
import { BUY_ROUTE, ROUTE_INDEX, SELL_ROUTE } from "../constant/routeConstant";

const RouterIndex = () => {
  return (
    <Routes>
      <Route path={ROUTE_INDEX.HOME} element={<HomePage />} />
      <Route path={ROUTE_INDEX.SELL} element={<SellLayout />}>
        <Route index element={<Sell />} />
        <Route path={SELL_ROUTE.ADD_ITEM} element={<AddItem />} />
        <Route path={SELL_ROUTE.TRACK_SOLD} element={<TrackSold />} />
      </Route>
      <Route path={ROUTE_INDEX.BUY} element={<BuyLayout />}>
        <Route index element={<Buy />} />
        <Route path={BUY_ROUTE.ADD_USER} element={<AddUser />} />
        <Route path={BUY_ROUTE.CHECKOUT} element={<Checkout />} />
        <Route path={BUY_ROUTE.TRACK_BOUGHT} element={<TrackBought />} />
      </Route>
    </Routes>
  );
};

export default RouterIndex;
