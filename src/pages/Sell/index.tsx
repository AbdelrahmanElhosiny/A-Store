import { Outlet } from "react-router-dom";
import Layout from "../../layout/Layout";
import NavBar from "../../components/NavBar";
import { ROUTE_INDEX, SELL_ROUTE } from "../../constant/routeConstant";
import styled from "@emotion/styled";
import { ThemeProvider } from "@mui/material";
import sellTheme from "../../styles/sellTheme";

// -------------------
// define links array
// -------------------
const navLinks = [
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
const SellIndex = () => {
  return (
    <ThemeProvider theme={sellTheme}>
      <Layout
        NavBar={<NavbarComponent />}
        MainComponent={<MainComponent />}
        Theme="sell"
      />
    </ThemeProvider>
  );
};
// -----------------
// Styled component
// -----------------
const Holder = styled.div``;

export default SellIndex;
