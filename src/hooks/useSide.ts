import { useLocation } from "react-router-dom";
import { BUY_ROUTE, ROUTE_INDEX, SELL_ROUTE } from "../constant/routeConstant";

// Which side of the store the page is on, and its home and sign-up paths.
// Pages shared by both sides (like sign up) use it to stay on their side.
const useSide = () => {
  const { pathname } = useLocation();
  const side: "sell" | "buy" = pathname.startsWith(ROUTE_INDEX.SELL)
    ? "sell"
    : "buy";
  const homePath = side === "sell" ? ROUTE_INDEX.SELL : ROUTE_INDEX.BUY;
  const signUpPath = `${homePath}/${side === "sell" ? SELL_ROUTE.SIGN_UP : BUY_ROUTE.SIGN_UP}`;

  return { side, homePath, signUpPath, pathname };
};

export default useSide;
