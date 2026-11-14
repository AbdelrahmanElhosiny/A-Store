import { useLocation } from "react-router-dom";
import { ROUTES, isSellerPath } from "../constant/routes";
import type { Role } from "../features/types";

// The URL alone decides the mode; shared pages and dialogs keep its accent.
const useSide = () => {
  const { pathname } = useLocation();
  const seller = isSellerPath(pathname);
  const side: "buy" | "sell" = seller ? "sell" : "buy";
  const role: Role = seller ? "seller" : "buyer";
  const homePath = seller ? ROUTES.seller : ROUTES.home;
  const signUpPath = seller ? ROUTES.sellerSignUp : ROUTES.signUp;

  return { side, role, homePath, signUpPath, pathname };
};

export default useSide;
