import { Link } from "react-router-dom";
import { BUY_ROUTE, ROUTE_INDEX } from "../constant/routeConstant";

const BuyNavbar = () => {
  return (
    <>
      <ul>
        <Link to={ROUTE_INDEX.HOME}>Home</Link>
        <Link to={ROUTE_INDEX.BUY}>Buy</Link>
        <Link to={`${ROUTE_INDEX.BUY}/${BUY_ROUTE.ADD_USER}`}>Add-user</Link>
        <Link to={`${ROUTE_INDEX.BUY}/${BUY_ROUTE.CHECKOUT}`}>Checkout</Link>
        <Link to={`${ROUTE_INDEX.BUY}/${BUY_ROUTE.TRACK_BOUGHT}`}>
          Track-Shipment
        </Link>
      </ul>
    </>
  );
};

export default BuyNavbar;
