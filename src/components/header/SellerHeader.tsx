import { Suspense } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SVG from "../../assets/svg";
import { useAppSelector } from "../../app/hooks";
import { selectActiveStore } from "../../features/selectors";
import { ROUTES } from "../../constant/routes";
import { media } from "../../styles/breakpoints";
import useIsPhone from "../../hooks/useIsPhone";
import ModeSwitch from "../ModeSwitch";
import HeaderSearch from "./HeaderSearch";
import AccountMenu from "./AccountMenu";
import { HeaderBar, truncate } from "./headerStyles";
import useHeaderLogin, { HeaderLoginDialog } from "./useHeaderLogin";
import useHeaderMenu, { HeaderMenuDrawer, HeaderResetDialog } from "./useHeaderMenu";

const SellerHeader: React.FC = () => {
  const store = useAppSelector(selectActiveStore);
  const isPhone = useIsPhone();
  const menu = useHeaderMenu(isPhone);
  const { isLoginOpen, hasOpened, openLogin, closeLogin } = useHeaderLogin();
  return <>
    <Holder className={isPhone ? "phone seller" : undefined}>
      {isPhone && <IconButton edge="start" ref={menu.menuButtonRef} aria-label="Open menu"
        aria-expanded={menu.isMenuOpen} aria-controls="site-menu" onClick={menu.openMenu}><MenuIcon /></IconButton>}
      <Link className="logo" to={ROUTES.seller} aria-label="A-Store seller centre home"><SVG.Icons.logo />{!isPhone && "Seller centre"}</Link>
      {!isPhone && store && <span className="truncate" title={store.name}>{store.name}</span>}
      {!isPhone && store ? <HeaderSearch mode="seller" /> : <span className="spacer" />}
      <ModeSwitch compact={isPhone} />
      <AccountMenu compact onLogIn={openLogin} />
    </Holder>
    {menu.hasOpened && <Suspense fallback={null}><HeaderMenuDrawer open={menu.isMenuOpen} onClose={menu.closeMenu}
      onLogIn={openLogin} onResetDemo={menu.openReset} /></Suspense>}
    {menu.isResetOpen && <Suspense fallback={null}><HeaderResetDialog isOpen onClose={menu.closeReset} /></Suspense>}
    {hasOpened && <Suspense fallback={null}><HeaderLoginDialog isOpen={isLoginOpen} onClose={closeLogin} /></Suspense>}
  </>;
};
const Holder = styled(HeaderBar)`
  display: flex;
  .truncate { ${truncate} max-width: 24ch; min-width: 0; flex-shrink: 2; }
  .spacer { flex: 1; }
  .logo, > .MuiButton-root { flex-shrink: 0; }
  ${media.narrow} { .truncate { max-width: 12ch; } }
`;
export default SellerHeader;
