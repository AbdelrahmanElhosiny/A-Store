import { ROUTE_INDEX, SELL_ROUTE } from "../../constant/routeConstant";
import styled from "@emotion/styled";
import colorD from "../../styles/colorD";
import TopNavLink from "./TopNavLink";
import { Link } from "react-router-dom";
import SVG from "../../assets/svg";

const SellNavbar = () => {
  return (
    <Holder>
      <ul>
        <Link to={`${ROUTE_INDEX.HOME}`} className="logo">
          <SVG.Icons.logo />
        </Link>
        <TopNavLink path={`${ROUTE_INDEX.SELL}`} label="Sell" />
        <TopNavLink
          path={`${ROUTE_INDEX.SELL}/${SELL_ROUTE.ADD_ITEM}`}
          label="Add-Item"
        />
        <TopNavLink
          path={`${ROUTE_INDEX.SELL}/${SELL_ROUTE.TRACK_SOLD}`}
          label="Track-Sold"
        />
      </ul>
    </Holder>
  );
};

const Holder = styled.div`
  background-color: ${colorD.purple};

  .logo svg {
    width: 3em;
  }
`;

export default SellNavbar;
