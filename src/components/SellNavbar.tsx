import { Link } from "react-router-dom";
import { ROUTE_INDEX, SELL_ROUTE } from "../constant/routeConstant";

const SellNavbar = () => {
  return (
    <>
      <ul>
        <Link to={ROUTE_INDEX.HOME}>Home</Link>
        <Link to={ROUTE_INDEX.SELL}>Sell</Link>
        <Link to={`${ROUTE_INDEX.SELL}/${SELL_ROUTE.ADD_ITEM}`}>Add-Item</Link>
        <Link to={`${ROUTE_INDEX.SELL}/${SELL_ROUTE.TRACK_SOLD}`}>
          Track-Sold
        </Link>
      </ul>
    </>
  );
};

export default SellNavbar;
