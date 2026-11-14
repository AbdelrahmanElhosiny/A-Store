import { Suspense } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@mui/material";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import SVG from "../../assets/svg";
import { useAppSelector } from "../../app/hooks";
import { selectCartCount } from "../../features/selectors";
import { ROUTES } from "../../constant/routes";
import useSide from "../../hooks/useSide";
import ModeSwitch from "../ModeSwitch";
import HeaderSearch from "./HeaderSearch";
import AccountMenu from "./AccountMenu";
import CategoryRow from "./CategoryRow";
import { HeaderBar } from "./headerStyles";
import useHeaderLogin, { HeaderLoginDialog } from "./useHeaderLogin";

const BuyerHeader: React.FC = () => {
  const { homePath } = useSide();
  const count = useAppSelector(selectCartCount);
  const { isLoginOpen, hasOpened, openLogin, closeLogin } = useHeaderLogin();
  return <>
    <HeaderBar>
      <Link className="logo" to={homePath} aria-label="A-Store home"><SVG.Icons.logo /></Link>
      <HeaderSearch mode="buyer" />
      <ModeSwitch />
      <AccountMenu onLogIn={openLogin} />
      <Link className="cart" to={ROUTES.cart} aria-label={`Cart, ${count} items`}>
        <Badge badgeContent={count} color="primary"><ShoppingCartOutlined /></Badge>
        <span className="cart-label">Cart</span>
      </Link>
    </HeaderBar>
    <CategoryRow />
    {hasOpened && <Suspense fallback={null}><HeaderLoginDialog isOpen={isLoginOpen} onClose={closeLogin} /></Suspense>}
  </>;
};
export default BuyerHeader;
