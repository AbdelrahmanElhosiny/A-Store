import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ROUTE_INDEX } from "../constant/routeConstant";
import SVG from "../assets/svg";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { color } from "../styles/tokens";
import font from "../styles/font";
import { Badge, Button, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import useAuth from "../hooks/useAuth";
import ThemeSwitch from "./ThemeSwitch";

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
  const { setLoggedInUser, setLoggedOutUser, activeUserName } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const guestLoggedIn: boolean = activeUserName === "Guest";
  const cartLink = navLinks.find(({ badge }) => badge !== undefined);
  const closeMenu = () => setIsMenuOpen(false);

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

  const account = guestLoggedIn ? (
    <div className="account">
      <Button variant="contained" onClick={setLoggedInUser}>
        Login
      </Button>
      <Button variant="outlined" onClick={setLoggedInUser}>
        Sign up
      </Button>
    </div>
  ) : (
    <div className="account">
      <span className="user-name">{activeUserName}</span>
      <Button variant="outlined" onClick={setLoggedOutUser}>
        Logout
      </Button>
    </div>
  );

  return (
    <Holder className={className || ""}>
      <Link
        to={ROUTE_INDEX.HOME}
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
          {account}
        </DrawerHolder>
      </Drawer>
    </Holder>
  );
};

// -----------------
// Styled component
// -----------------
// shared look of a nav link: a bar that fills on hover
const linkStyle = css`
  .link {
    --color: ${color.fg};

    /* nav text can't be selected or dragged away */
    user-select: none;
    -webkit-user-drag: none;

    position: relative;
    font-size: 1.1em;
    text-decoration: none;
    color: var(--color);
    transition: color 0.3s;
    z-index: 0;
    padding: 0.15em 0.6em;
    white-space: nowrap;

    &::after {
      content: "";
      position: absolute;
      background-color: var(--color);
      width: 0.3em;
      inset: 0;
      z-index: -1;
      transition: width 0.4s;
    }

    &:hover,
    &:focus-visible {
      color: ${color.bg};
      &::after {
        width: 100%;
      }
    }

    &.active {
      --color: var(--primary-color);
    }

    .badge .MuiBadge-badge {
      ${font.Bold}
      right: -0.6em;
    }
  }
`;

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
