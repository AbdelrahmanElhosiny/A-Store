import { Outlet } from "react-router-dom";
import Layout from "../../layout/Layout";
import NavBar from "../../components/NavBar";
import { BUY_ROUTE, ROUTE_INDEX } from "../../constant/routeConstant";
import styled from "@emotion/styled";

// -------------------
// define links array
// -------------------
const navLinks = [
  {
    label: "Home",
    path: ROUTE_INDEX.BUY,
  },
  {
    label: "Add User",
    path: `${ROUTE_INDEX.BUY}/${BUY_ROUTE.ADD_USER}`,
  },
  {
    label: "Checkout",
    path: `${ROUTE_INDEX.BUY}/${BUY_ROUTE.CHECKOUT}`,
  },
  {
    label: "Track Shipment",
    path: `${ROUTE_INDEX.BUY}/${BUY_ROUTE.TRACK_BOUGHT}`,
  },
];
// ------------------
// define components
// ------------------
const NavbarComponent = () => <NavBar navLinks={navLinks} />;
const MainComponent = () => {
  return (
    <Holder>
      <Outlet />
    </Holder>
  );
};

// -----------------
// JSX
// -----------------
const BuyIndex = () => {
  return (
    <Layout
      NavBar={<NavbarComponent />}
      MainComponent={<MainComponent />}
      Theme="buy"
    />
  );
};
// -----------------
// Styled component
// -----------------
const Holder = styled.div``;

export default BuyIndex;
