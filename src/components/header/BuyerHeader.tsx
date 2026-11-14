import { Suspense } from "react";
import { Link } from "react-router-dom";
import { Badge, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import SVG from "../../assets/svg";
import { useAppSelector } from "../../app/hooks";
import { selectCartCount } from "../../features/selectors";
import { ROUTES } from "../../constant/routes";
import useSide from "../../hooks/useSide";
import useIsPhone from "../../hooks/useIsPhone";
import ModeSwitch from "../ModeSwitch";
import HeaderSearch from "./HeaderSearch";
import AccountMenu from "./AccountMenu";
import CategoryRow from "./CategoryRow";
import { HeaderBar, PhoneSearchRow } from "./headerStyles";
import useHeaderLogin, { HeaderLoginDialog } from "./useHeaderLogin";
import useHeaderMenu, { HeaderMenuDrawer, HeaderResetDialog } from "./useHeaderMenu";

const BuyerHeader: React.FC = () => {
  const { homePath } = useSide();
  const count = useAppSelector(selectCartCount);
  const isPhone = useIsPhone();
  const menu = useHeaderMenu(isPhone);
  const { isLoginOpen, hasOpened, openLogin, closeLogin, onLoginExited } = useHeaderLogin();
  return <>
    <HeaderBar className={isPhone ? "phone" : undefined}>
      {isPhone && <IconButton edge="start" ref={menu.menuButtonRef} aria-label="Open menu"
        aria-expanded={menu.isMenuOpen} aria-controls="site-menu" onClick={menu.openMenu}><MenuIcon /></IconButton>}
      <Link className="logo" to={homePath} aria-label="A-Store home"><SVG.Icons.logo /></Link>
      {isPhone ? <span className="spacer" /> : <HeaderSearch mode="buyer" />}
      <ModeSwitch compact={isPhone} />
      <AccountMenu compact={isPhone} onLogIn={openLogin} getLogoutTarget={isPhone ? () => menu.menuButtonRef.current : undefined} />
      {isPhone ? <IconButton className="cart" component={Link} to={ROUTES.cart} aria-label={`Cart, ${count} items`}>
        <Badge badgeContent={count} color="primary"><ShoppingCartOutlined /></Badge>
      </IconButton> : <Link className="cart" to={ROUTES.cart} aria-label={`Cart, ${count} items`}>
        <Badge badgeContent={count} color="primary"><ShoppingCartOutlined /></Badge>
        <span className="cart-label">Cart</span>
      </Link>}
    </HeaderBar>
    {isPhone ? <PhoneSearchRow data-row="search"><HeaderSearch mode="buyer" showScope={false} /></PhoneSearchRow> : <CategoryRow />}
    {menu.hasOpened && <Suspense fallback={null}><HeaderMenuDrawer open={menu.isMenuOpen} onClose={menu.closeMenu}
      onLogIn={() => openLogin(menu.menuButtonRef.current)} onResetDemo={menu.openReset} onExited={menu.onMenuExited} /></Suspense>}
    {menu.hasResetOpened && <Suspense fallback={null}><HeaderResetDialog isOpen={menu.isResetOpen} onClose={menu.closeReset} onExited={menu.onResetExited} /></Suspense>}
    {hasOpened && <Suspense fallback={null}><HeaderLoginDialog isOpen={isLoginOpen} onClose={closeLogin} onExited={onLoginExited} /></Suspense>}
  </>;
};
export default BuyerHeader;
