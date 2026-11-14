import { lazy, Suspense, useEffect, useState } from "react";
import { Button } from "@mui/material";
import PersonOutline from "@mui/icons-material/PersonOutline";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import styled from "@emotion/styled";
import useAuth from "../../hooks/useAuth";
import { useAppSelector } from "../../app/hooks";
import { selectActiveStore } from "../../features/selectors";
import { color } from "../../styles/tokens";
import { media } from "../../styles/breakpoints";
import whenIdle from "../../utils/whenIdle";
import AccountAvatar from "./AccountAvatar";
import { truncate } from "./headerStyles";

const loadMenu = () => import("./AccountMenuList");
const AccountMenuList = lazy(loadMenu);
let prefetch: Promise<unknown> | undefined;

const AccountMenu: React.FC<{ compact?: boolean; onLogIn: () => void }> = ({ compact = false, onLogIn }) => {
  const { activeAccount, isSignedIn, role } = useAuth();
  const store = useAppSelector(selectActiveStore);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hasOpened, setHasOpened] = useState(false);
  useEffect(() => {
    prefetch ??= whenIdle().then(loadMenu).catch(() => { prefetch = undefined; });
  }, []);
  const name = activeAccount?.name ?? "";
  const label = !isSignedIn ? "Log in" : role === "seller" ? `Account menu, ${name}` : `Hello, ${name}`;
  const avatar = activeAccount && <AccountAvatar
    letter={role === "seller" && store ? store.logoLetter : name.charAt(0)}
    color={role === "seller" && store ? store.logoColor : activeAccount.avatarColor} />;

  return <>
    <Holder id="account-button" aria-label={label} aria-haspopup="menu"
      aria-expanded={Boolean(anchorEl)} aria-controls={anchorEl ? "account-menu" : undefined}
      className={compact ? "compact" : undefined}
      onClick={(event) => { setHasOpened(true); setAnchorEl(event.currentTarget); }}>
      {isSignedIn ? avatar : <PersonOutline />}
      {!compact && <span className="account-label">
        <span className="truncate" title={isSignedIn ? name : undefined}>{label}</span>
      </span>}
      {!compact && isSignedIn && <KeyboardArrowDown />}
    </Holder>
    {hasOpened && <Suspense fallback={null}>
      <AccountMenuList anchorEl={anchorEl} onClose={() => setAnchorEl(null)} onLogIn={onLogIn} />
    </Suspense>}
  </>;
};
const Holder = styled(Button)`
  min-width: 0;
  padding: 4px;
  gap: var(--space-xs);
  color: ${color.fg};
  border-radius: 0;
  text-transform: none;
  .truncate { ${truncate} display: block; max-width: 14ch; }
  &.compact { width: 40px; height: 40px; }
  ${media.narrow} {
    .account-label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }
`;
export default AccountMenu;
