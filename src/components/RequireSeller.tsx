import { useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectActiveSeller } from "../features/selectors";
import { ROUTES } from "../constant/routes";
import PickStore from "../pages/Seller/PickStore";

const RequireSeller: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const seller = useAppSelector(selectActiveSeller);
  const { pathname } = useLocation();
  const isSignUp = pathname.replace(/\/+$/, "") === ROUTES.sellerSignUp;
  return seller || isSignUp ? <>{children}</> : <PickStore />;
};

export default RequireSeller;
