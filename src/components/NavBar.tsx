import { Link, NavLink } from "react-router-dom";
import { ROUTE_INDEX } from "../constant/routeConstant";
import SVG from "../assets/svg";
import styled from "@emotion/styled";
import colorD from "../styles/colorD";
import font from "../styles/font";
import { Button } from "@mui/material";
import useSell from "../pages/Buy/useBuy";

interface LinkProp {
  path: string;
  label: string;
}
interface NavbarProps {
  navLinks: LinkProp[];
  className?: string;
}
// -----------------
// JSX
// -----------------
const NavBar: React.FC<NavbarProps> = ({ navLinks, className }) => {
  const { setLoggedInUser, setLoggedOutUser } = useSell();

  return (
    <Holder className={` ${className || ""}`}>
      <Link to={`${ROUTE_INDEX.HOME}`} className={"logo"}>
        <SVG.Icons.logo />
      </Link>
      <div className="nav-links">
        {navLinks.map(({ path, label }) => (
          <NavLink to={path} className="link" end={true} key={label}>
            {label}
          </NavLink>
        ))}
      </div>
      <div className="login">
        <Button onClick={setLoggedInUser}>Login</Button>
        <Button onClick={setLoggedOutUser}>Logout</Button>
      </div>
    </Holder>
  );
};
// -----------------
// Styled component
// -----------------
const Holder = styled.div`
  background-color: ${colorD.bg};
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  padding: 0 3em;
  height: 100%;

  .logo svg {
    width: 3em;
  }

  .link {
    --color: ${colorD.fg};

    position: relative;
    ${font.Bold}
    font-size: 1.2em;
    list-style: none;
    text-decoration: none;
    color: var(--color);
    transition: all 0.3s;
    z-index: 3;
    padding-inline: 0.6em;

    &::after {
      content: "";
      position: absolute;
      background-color: var(--color);
      height: 100%;
      width: 0.3em;
      /* right: 0em; */
      inset: 0;
      /* padding-inline: 0.2em; */
      transition: all 0.4s;
    }

    :hover {
      color: ${colorD.bg};
      &::after {
        z-index: -1;
        width: 100%;
      }
    }

    &.active {
      --color: var(--primary-color);
    }
  }

  .nav-links {
    display: flex;
    justify-content: space-between;
  }

  .login {
    display: flex;
    justify-content: end;
  }
`;

export default NavBar;
