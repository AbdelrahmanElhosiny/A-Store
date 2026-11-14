import { useEffect, useRef } from "react";
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
}
const AccountMenuList: React.FC<Props> = ({ anchorEl, onClose, onLogIn }) => {
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (!anchorEl && restoreFocus.current) {
      restoreFocus.current = false;
      document.getElementById("account-button")?.focus();
    }
  }, [anchorEl]);
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
      onClose={(_, reason) => {
        // Wait for the closed render: the still-open FocusTrap would take
        // synchronous focus back into the menu. Links/log out never set this.
        restoreFocus.current = ["escapeKeyDown", "backdropClick", "tabKeyDown"].includes(reason);
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
      {isSignedIn && <MenuItem className="secondary" onClick={() => { onClose(); logOut(); }}>Log out</MenuItem>}
    </Holder>
  );
};
const Holder = styled(Menu)`
  .primary { ${font.Bold} }
  .secondary { color: ${color.fgMuted}; font-size: 0.875rem; }
`;
export default AccountMenuList;
