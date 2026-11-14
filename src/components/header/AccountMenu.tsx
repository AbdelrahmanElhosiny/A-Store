import { lazy, Suspense, useEffect, useState } from "react";
import { Button, useMediaQuery } from "@mui/material";
import PersonOutline from "@mui/icons-material/PersonOutline";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import styled from "@emotion/styled";
import useAuth from "../../hooks/useAuth";
import { useAppSelector } from "../../app/hooks";
import { selectActiveStore } from "../../features/selectors";
import { color } from "../../styles/tokens";
import { BREAKPOINT } from "../../styles/breakpoints";
import whenIdle from "../../utils/whenIdle";
import AccountAvatar from "./AccountAvatar";
import accountAvatarProps from "./accountAvatarProps";
import { truncate } from "./headerStyles";

const loadMenu = () => import("./AccountMenuList");
const AccountMenuList = lazy(loadMenu);
let prefetch: Promise<unknown> | undefined;

interface Props {
  compact?: boolean;
  onLogIn: () => void;
  getLogoutTarget?: () => HTMLElement | null;
}
const AccountMenu: React.FC<Props> = ({ compact = false, onLogIn, getLogoutTarget }) => {
  const isNarrow = useMediaQuery(`(max-width: ${BREAKPOINT.narrow}px)`);
  const { activeAccount, isSignedIn, role } = useAuth();
  const store = useAppSelector(selectActiveStore);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hasOpened, setHasOpened] = useState(false);
  useEffect(() => {
    prefetch ??= whenIdle().then(loadMenu).catch(() => { prefetch = undefined; });
  }, []);
  const name = activeAccount?.name ?? "";
  const label = !isSignedIn ? "Log in" : role === "seller" ? `Account menu, ${name}` : `Hello, ${name}`;
  const avatar = activeAccount && <AccountAvatar {...accountAvatarProps(activeAccount, store)} />;

  return <>
    <Holder id="account-button" aria-label={label} aria-haspopup="menu"
      aria-expanded={Boolean(anchorEl)} aria-controls={anchorEl ? "account-menu" : undefined}
      className={compact ? "compact" : undefined}
      onClick={(event) => { setHasOpened(true); setAnchorEl(event.currentTarget); }}>
      {isSignedIn ? avatar : <PersonOutline />}
      {!compact && <span className={isSignedIn && isNarrow ? "visually-hidden" : "account-label"}>
        <span className="truncate" title={isSignedIn ? name : undefined}>{label}</span>
      </span>}
      {!compact && isSignedIn && <KeyboardArrowDown />}
    </Holder>
    {hasOpened && <Suspense fallback={null}>
      <AccountMenuList anchorEl={anchorEl} onClose={() => setAnchorEl(null)} onLogIn={onLogIn} getLogoutTarget={getLogoutTarget} />
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
`;
export default AccountMenu;
