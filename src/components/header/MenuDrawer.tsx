import { Link } from "react-router-dom";
import { Button, Divider, Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styled from "@emotion/styled";
import { useAppSelector } from "../../app/hooks";
import { CATEGORIES } from "../../constant/categories";
import { ROUTES } from "../../constant/routes";
import { selectActiveStore } from "../../features/selectors";
import useAuth from "../../hooks/useAuth";
import useSide from "../../hooks/useSide";
import font from "../../styles/font";
import { color } from "../../styles/tokens";
import ModeSwitch from "../ModeSwitch";
import ThemeSwitch from "../ThemeSwitch";
import AccountAvatar from "./AccountAvatar";
import accountAvatarProps from "./accountAvatarProps";
import SellerNav from "./SellerNav";
import { truncate } from "./headerStyles";

interface Props {
  open: boolean;
  onClose: (reason: "user" | "navigation") => void;
  onLogIn: () => void;
  onResetDemo: () => void;
  onExited: () => void;
}
const MenuDrawer: React.FC<Props> = ({ open, onClose, onLogIn, onResetDemo, onExited }) => {
  const { side, role, signUpPath, pathname } = useSide();
  const { activeAccount, activeName, isSignedIn, logOut } = useAuth();
  const store = useAppSelector(selectActiveStore);
  const navigate = () => onClose("navigation");
  const buyer = role === "buyer";
  const accountLinks = buyer ? [
    { name: "Orders", path: ROUTES.accountOrders },
    { name: "Addresses", path: ROUTES.accountAddresses },
    { name: "Payment methods", path: ROUTES.accountPayments },
  ] : [];

  return <Holder SlideProps={{ onExited }} anchor="left" open={open} disableRestoreFocus
    onClose={() => onClose("user")}
    PaperProps={{ id: "site-menu", className: side, "aria-label": "Menu", role: "dialog", "aria-modal": true }}>
    <IconButton className="close" aria-label="Close menu" autoFocus onClick={() => onClose("user")}><CloseIcon /></IconButton>
    <div className="greeting">
      {isSignedIn && activeAccount ? <>
        <AccountAvatar size={40} {...accountAvatarProps(activeAccount, store)} />
        <span className="truncate" title={activeName ?? undefined}>{buyer ? `Hello, ${activeName}` : activeName}</span>
      </> : <>
        <Button variant="contained" onClick={() => { navigate(); onLogIn(); }}>Log in</Button>
        <Link to={signUpPath} state={{ from: pathname }} onClick={navigate}>{buyer ? "Create account" : "Create a store"}</Link>
      </>}
    </div>
    <ModeSwitch onNavigate={navigate} />
    {buyer ? <nav className="categories" aria-label="Shop by category">
      <Link to={ROUTES.search()} onClick={navigate}>All categories</Link>
      {CATEGORIES.map(({ id, label }) => <Link key={id} to={ROUTES.category(id)} onClick={navigate}>{label}</Link>)}
    </nav> : isSignedIn && store && <SellerNav onNavigate={navigate} />}
    <Divider />
    <div className="secondary">
      {isSignedIn && <>
        {accountLinks.map(({ name, path }) => <Link key={path} to={path} onClick={navigate}>{name}</Link>)}
        <button type="button" onClick={() => { onClose("user"); logOut(); }}>Log out</button>
      </>}
      <ThemeSwitch label="Dark mode" />
      <button className="reset" type="button" onClick={() => { navigate(); onResetDemo(); }}>Reset demo data</button>
    </div>
  </Holder>;
};
const Holder = styled(Drawer)`
  .MuiDrawer-paper {
    box-sizing: border-box;
    width: min(85vw, 320px);
    padding: var(--space-m);
    gap: var(--space-m);
    background: ${color.bg1};
    color: ${color.fg};
    border-radius: 0;
    &.buy { --primary-color: ${color.buy}; }
    &.sell { --primary-color: ${color.sell}; }
    > .MuiButton-root { width: 100%; min-height: 44px; flex-shrink: 0; }
  }
  .close { align-self: flex-end; }
  .MuiIconButton-root { color: inherit; border-radius: 0; min-width: 44px; min-height: 44px; }
  .MuiSvgIcon-root { font-size: 28px; }
  a { color: inherit; text-decoration-color: ${color.primary}; }
  .greeting {
    ${font.Bold}
    display: flex;
    align-items: center;
    gap: var(--space-s);
    min-width: 0;
    flex-shrink: 0;
    a { display: inline-flex; align-items: center; min-height: 44px; }
    .MuiButton-root { min-height: 44px; border-radius: 0; }
  }
  .truncate { ${truncate} }
  .categories {
    ${font.Bold}
    a { display: flex; align-items: center; min-height: 48px; text-decoration: none; }
    a:hover { color: ${color.primary}; }
  }
  .secondary {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    font-size: 0.9rem;
    color: ${color.fgMuted};
    a, button { display: flex; align-items: center; min-height: 44px; }
    button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
    .reset {
      ${font.Bold}
      align-self: flex-start;
      border-bottom: 2px solid ${color.red};
      &:hover, &:focus-visible { color: ${color.red}; }
    }
  }
`;
export default MenuDrawer;
