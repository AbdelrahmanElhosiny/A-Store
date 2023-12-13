import { BUY_ROUTE, ROUTE_INDEX } from "../../constant/routeConstant";
import styled from "@emotion/styled";
import colorD from "../../styles/colorD";
import TopNavLink from "./TopNavLink";
import { Link } from "react-router-dom";
import SVG from "../../assets/svg";

const BuyNavbar = () => {
  return (
    <Holder>
      <ul>
        <Link to={`${ROUTE_INDEX.HOME}`} className="logo">
          <SVG.Icons.logo />
        </Link>
        <TopNavLink path={`${ROUTE_INDEX.BUY}`} label="Buy" />
        <TopNavLink
          path={`${ROUTE_INDEX.BUY}/${BUY_ROUTE.ADD_USER}`}
          label="Add-user"
        />
        <TopNavLink
          path={`${ROUTE_INDEX.BUY}/${BUY_ROUTE.CHECKOUT}`}
          label="Checkout"
        />
        <TopNavLink
          path={`${ROUTE_INDEX.BUY}/${BUY_ROUTE.TRACK_BOUGHT}`}
          label="Track-Shipment"
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

export default BuyNavbar;
