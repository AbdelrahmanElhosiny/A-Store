import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Sell from "../pages/Sell";
import Buy from "../pages/Buy";
import AddItem from "../pages/Sell/AddItem";
import TrackSold from "../pages/Sell/TrackSold";
import AddUser from "../pages/Buy/AddUser";
import BrowseShop from "../pages/Buy/BrowseShop";
import Checkout from "../pages/Buy/Checkout";
import TrackBought from "../pages/Buy/TrackBought";

const RouterIndex = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sell" element={<Sell />} />
      <Route path="/sell/add-item" element={<AddItem />} />
      <Route path="/sell/track-sold" element={<TrackSold />} />
      <Route path="/buy" element={<Buy />} />
      <Route path="/buy/add-user" element={<AddUser />} />
      <Route path="/buy/browse" element={<BrowseShop />} />
      <Route path="/buy/checkout" element={<Checkout />} />
      <Route path="/buy/track-bought" element={<TrackBought />} />
    </Routes>
  );
};

export default RouterIndex;
