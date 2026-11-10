import { Route, Routes } from "react-router-dom";
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
import SignUp from "../pages/SignUp";
import Error404 from "../pages/Error404";
import useRouteFocus from "../hooks/useRouteFocus";

const RouterIndex = () => {
  useRouteFocus();

  return (
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
  );
};

export default RouterIndex;
