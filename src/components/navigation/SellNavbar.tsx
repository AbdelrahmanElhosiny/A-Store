import { ROUTE_INDEX, SELL_ROUTE } from "../../constant/routeConstant";
import styled from "@emotion/styled";
import colorD from "../../styles/colorD";
import TopNavLink from "./TopNavLink";

const SellNavbar = () => {
  return (
    <Holder>
      <ul>
        <TopNavLink path={`${ROUTE_INDEX.HOME}`} label="Home" />
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
`;

export default SellNavbar;
