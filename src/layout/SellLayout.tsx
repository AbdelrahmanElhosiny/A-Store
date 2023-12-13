import { Outlet } from "react-router-dom";
import SellNavbar from "../components/navigation/SellNavbar";
import styled from "@emotion/styled";

const SellLayout = () => {
  return (
    <Holder>
      <SellNavbar />
      <Outlet />
    </Holder>
  );
};

const Holder = styled.div`
  display: grid;
  grid-template-rows: 4em auto;
`;

export default SellLayout;
