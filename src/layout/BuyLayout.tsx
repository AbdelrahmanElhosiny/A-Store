import { Outlet } from "react-router-dom";
import BuyNavbar from "../components/navigation/BuyNavbar";
import styled from "@emotion/styled";

const BuyLayout = () => {
  return (
    <Holder>
      <BuyNavbar />
      <Outlet />
    </Holder>
  );
};

const Holder = styled.div`
  display: grid;
  grid-template-rows: 4em auto;
`;

export default BuyLayout;
