import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Seller from "../pages/Seller";
import Buyer from "../pages/Buyer";
import AddItem from "../pages/Seller/AddItem";
import TrackSold from "../pages/Seller/TrackSold";
import AddUser from "../pages/Buyer/AddUser";
import BrowseShop from "../pages/Buyer/BrowseShop";
import Checkout from "../pages/Buyer/Checkout";
import TrackBought from "../pages/Buyer/TrackBought";

const RouterIndex = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/seller" element={<Seller />} />
      <Route path="/seller/add-item" element={<AddItem />} />
      <Route path="/seller/track-sold" element={<TrackSold />} />
      <Route path="/buyer" element={<Buyer />} />
      <Route path="/buyer/add-user" element={<AddUser />} />
      <Route path="/buyer/browse" element={<BrowseShop />} />
      <Route path="/buyer/checkout" element={<Checkout />} />
      <Route path="/buyer/track-bought" element={<TrackBought />} />
    </Routes>
  );
};

export default RouterIndex;
