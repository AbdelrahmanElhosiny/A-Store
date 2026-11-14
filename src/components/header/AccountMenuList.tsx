import useReturnFocus from "./useReturnFocus";
import { Link } from "react-router-dom";
import { Menu } from "@mui/material";
import { MenuItem } from "@mui/material";
import { Divider } from "@mui/material";
import styled from "@emotion/styled";
import useAuth from "../../hooks/useAuth";
import useSide from "../../hooks/useSide";
import { ROUTES } from "../../constant/routes";
import { color } from "../../styles/tokens";
import font from "../../styles/font";
import ThemeMenuItem from "./ThemeMenuItem";

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onLogIn: () => void;
  getLogoutTarget?: () => HTMLElement | null;
}
const AccountMenuList: React.FC<Props> = ({ anchorEl, onClose, onLogIn, getLogoutTarget }) => {
  const focus = useReturnFocus();
  const { isSignedIn, logOut } = useAuth();
  const { side, role, signUpPath, pathname } = useSide();
  const links = role === "buyer" ? [
    { name: "Your account", path: ROUTES.account },
    { name: "Orders", path: ROUTES.accountOrders },
    { name: "Addresses", path: ROUTES.accountAddresses },
    { name: "Payment methods", path: ROUTES.accountPayments },
  ] : [{ name: "Store settings", path: ROUTES.sellerStore }];

  return (
    <Holder
      anchorEl={anchorEl} open={Boolean(anchorEl)} disableRestoreFocus
      // The controlled id belongs to the actual menu list, not the modal wrapper.
      MenuListProps={{ id: "account-menu", "aria-labelledby": "account-button" }}
      slotProps={{ paper: { className: side, sx: { borderRadius: 0, boxShadow: "var(--shadow-2)" } } }}
      TransitionProps={{ onExited: focus.restore }}
      onClose={() => {
        focus.remember(anchorEl);
        onClose();
      }}
    >
      {isSignedIn ? links.map(({ name, path }, index) => (
        <MenuItem key={path} component={Link} to={path} className={index === 0 ? "primary" : undefined} onClick={onClose}>{name}</MenuItem>
      )) : [
        <MenuItem key="login" onClick={() => { onClose(); onLogIn(); }}>Log in</MenuItem>,
        <MenuItem key="signup" component={Link} to={signUpPath} state={{ from: pathname }} onClick={onClose}>
          {role === "buyer" ? "New here? Create an account" : "New here? Create a store"}
        </MenuItem>,
      ]}
      {isSignedIn && <Divider role="separator" />}
      <ThemeMenuItem />
      {isSignedIn && <MenuItem className="secondary" onClick={() => { focus.remember(getLogoutTarget ? getLogoutTarget() : anchorEl); onClose(); logOut(); }}>Log out</MenuItem>}
    </Holder>
  );
};
const Holder = styled(Menu)`
  .primary { ${font.Bold} }
  .secondary { color: ${color.fgMuted}; font-size: 0.875rem; }
`;
export default AccountMenuList;
