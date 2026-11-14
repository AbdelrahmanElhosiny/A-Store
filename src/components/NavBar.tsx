import { Suspense, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import SVG from "../assets/svg";
import styled from "@emotion/styled";
import { linkStyle } from "./header/headerStyles";
import { color } from "../styles/tokens";
import font from "../styles/font";
import { Badge, Button, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import useAuth from "../hooks/useAuth";
import useSide from "../hooks/useSide";
import ModeSwitch from "./ModeSwitch";
import ThemeSwitch from "./ThemeSwitch";
// the dialog is its own chunk, shared with the wide headers
import useHeaderLogin, { HeaderLoginDialog } from "./header/useHeaderLogin";

interface LinkProp {
  path: string;
  label: string;
  badge?: number; // a count shown on the link, e.g. items in the cart
}
interface NavbarProps {
  navLinks: LinkProp[];
  className?: string;
}

// -----------------
// JSX
// -----------------
const NavBar: React.FC<NavbarProps> = ({ navLinks, className }) => {
  const { logOut, activeName, isSignedIn } = useAuth();
  const { signUpPath, pathname, homePath } = useSide();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoginOpen, hasOpened, openLogin: showLogin, closeLogin } = useHeaderLogin();

  const cartLink = navLinks.find(({ badge }) => badge !== undefined);
  const closeMenu = () => setIsMenuOpen(false);
  const openLogin = () => {
    closeMenu();
    showLogin();
  };

  const links = navLinks.map(({ path, label, badge }) => (
    <NavLink
      to={path}
      className="link"
      end={true}
      key={label}
      draggable={false}
      onClick={closeMenu}
    >
      {badge !== undefined ? (
        <Badge badgeContent={badge} color="primary" className="badge">
          {label}
        </Badge>
      ) : (
        label
      )}
    </NavLink>
  ));

  const account = !isSignedIn ? (
    <div className="account">
      <Button variant="contained" onClick={openLogin}>
        Log in
      </Button>
      <Button
        variant="outlined"
        component={Link}
        to={signUpPath}
        // after signing up, go back to the page they were on
        state={{ from: pathname }}
        onClick={closeMenu}
      >
        Sign up
      </Button>
    </div>
  ) : (
    <div className="account">
      <span className="user-name">{activeName}</span>
      <Button
        variant="outlined"
        onClick={() => {
          closeMenu();
          logOut();
        }}
      >
        Log out
      </Button>
    </div>
  );

  return (
    <Holder className={className || ""}>
      <Link
        to={homePath}
        className="logo"
        aria-label="A-Store home"
        draggable={false}
      >
        <SVG.Icons.logo />
      </Link>

      {/* wide screens */}
      <nav className="nav-links" aria-label="Main">
        {links}
      </nav>
      <div className="actions">
        <ThemeSwitch />
        <ModeSwitch />
        {account}
      </div>

      {/* phones */}
      <div className="mobile-actions">
        {cartLink && (
          <IconButton
            component={Link}
            to={cartLink.path}
            aria-label={`Cart, ${cartLink.badge} items`}
          >
            <Badge badgeContent={cartLink.badge} color="primary">
              <ShoppingCartOutlinedIcon />
            </Badge>
          </IconButton>
        )}
        <IconButton
          edge="end"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      </div>
      <Drawer anchor="right" open={isMenuOpen} onClose={closeMenu}>
        <DrawerHolder className={className || ""}>
          <IconButton
            className="close"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <CloseIcon />
          </IconButton>
          <nav className="drawer-links" aria-label="Main">
            {links}
          </nav>
          <ThemeSwitch />
          <ModeSwitch />
          {account}
        </DrawerHolder>
      </Drawer>
      {hasOpened && <Suspense fallback={null}><HeaderLoginDialog isOpen={isLoginOpen} onClose={closeLogin} /></Suspense>}
    </Holder>
  );
};

// -----------------
// Styled component
// -----------------
const Holder = styled.div`
  background-color: ${color.bg1};
  border-bottom: 1px solid ${color.bg2};
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--space-l);
  padding-inline: var(--page-gutter);
  height: 100%;
  user-select: none;

  .logo {
    display: flex;
    -webkit-user-drag: none;
    svg {
      width: 2.6em;
    }
  }

  .nav-links {
    ${font.Bold}
    display: flex;
    justify-content: center;
    gap: var(--space-l);
  }
  ${linkStyle}
  .link { font-size: 1.1em; }
  .link .badge .MuiBadge-badge { ${font.Bold} right: -0.6em; }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-m);
  }

  .account {
    display: flex;
    align-items: center;
    gap: var(--space-s);
    .user-name {
      ${font.Bold}
    }
  }

  .mobile-actions {
    display: none;
    justify-self: end;
    align-items: center;
    gap: var(--space-xs);
    color: ${color.fg};
    .MuiIconButton-root {
      color: inherit;
    }
    /* as big as the logo */
    .MuiSvgIcon-root {
      font-size: 32px;
    }
  }

  @media (max-width: 767px) {
    grid-template-columns: auto 1fr;
    .nav-links,
    .actions {
      display: none;
    }
    .mobile-actions {
      display: flex;
    }
  }
`;

const DrawerHolder = styled.div`
  ${font.Bold}
  background-color: ${color.bg1};
  color: ${color.fg};
  min-height: 100%;
  width: min(80vw, 300px);
  padding: var(--space-m) var(--space-l) var(--space-xl);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-l);

  .close {
    align-self: flex-end;
    color: inherit;
  }

  .drawer-links {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-m);
    width: 100%;
  }
  ${linkStyle}
  .link { font-size: 1.1em; }
  .link .badge .MuiBadge-badge { ${font.Bold} right: -0.6em; }

  .account {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-s);
  }

  /* the drawer renders outside the page, so it sets the side colour itself */
  &.sell {
    --primary-color: ${color.sell};
  }
  &.buy {
    --primary-color: ${color.buy};
  }
`;

export default NavBar;
