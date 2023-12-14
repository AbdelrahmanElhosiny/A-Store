import { ROUTE_INDEX, SELL_ROUTE } from "../../constant/routeConstant";
import styled from "@emotion/styled";
import colorD from "../../styles/colorD";
import { Link, NavLink } from "react-router-dom";
import SVG from "../../assets/svg";
import font from "../../styles/font";

interface LinkProp {
  path: string;
  label: string;
}

// -------------------
// define links array
// -------------------
const navLinks: LinkProp[] = [
  {
    label: "Home",
    path: ROUTE_INDEX.SELL,
  },
  {
    label: "Add Item",
    path: `${ROUTE_INDEX.SELL}/${SELL_ROUTE.ADD_ITEM}`,
  },
  {
    label: "Track",
    path: `${ROUTE_INDEX.SELL}/${SELL_ROUTE.TRACK_SOLD}`,
  },
];

// -----------------
// JSX
// -----------------
const SellNavbar = () => {
  return (
    <Holder>
      <Link to={`${ROUTE_INDEX.HOME}`} className="logo">
        <SVG.Icons.logo />
      </Link>
      {navLinks.map(({ path, label }) => (
        <NavLink to={path} className="link" end={true}>
          {label}
        </NavLink>
      ))}
    </Holder>
  );
};
// -----------------
// Styled component
// -----------------
const Holder = styled.div`
  background-color: ${colorD.bg};
  display: flex;
  align-items: center;
  padding: 0 3em;
  gap: 5%;

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
    padding-inline: 0.5em;

    &::after {
      content: "";
      position: absolute;
      background-color: var(--color);
      height: 100%;
      width: 0.3em;
      right: -0.4em;
      transition: all 0.4s;
    }
    :hover {
      color: ${colorD.bg};
      &::after {
        z-index: -1;
        width: 115%;
      }
    }

    &.active {
      --color: ${colorD.orange};
    }
  }
`;

export default SellNavbar;
