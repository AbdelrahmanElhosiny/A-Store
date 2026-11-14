import { Outlet } from "react-router-dom";
import Layout from "../../layout/Layout";
import NavBar from "../../components/NavBar";
import { BUY_ROUTE, ROUTE_INDEX } from "../../constant/routeConstant";
import styled from "@emotion/styled";
import { ThemeProvider } from "@mui/material";
import { useSideTheme } from "../../hooks/useThemeMode";
import { useAppSelector } from "../../app/hooks";
import { selectCartCount } from "../../features/selectors";

// -------------------
// define links array
// -------------------
const getNavLinks = (cartCount: number) => [
  {
    label: "Home",
    path: ROUTE_INDEX.BUY,
  },
  {
    label: "Cart",
    path: `${ROUTE_INDEX.BUY}/${BUY_ROUTE.CART}`,
    badge: cartCount,
  },
  {
    label: "Track Shipment",
    path: `${ROUTE_INDEX.BUY}/${BUY_ROUTE.TRACK_BOUGHT}`,
  },
];
// ------------------
// define components
// ------------------
const NavbarComponent = () => {
  const cartCount = useAppSelector(selectCartCount);
  return <NavBar navLinks={getNavLinks(cartCount)} className="buy" />;
};
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
  const theme = useSideTheme("buy");
  return (
    <ThemeProvider theme={theme}>
      <Layout
        NavBar={<NavbarComponent />}
        MainComponent={<MainComponent />}
        Theme="buy"
      />
    </ThemeProvider>
  );
};
// -----------------
// Styled component
// -----------------
const Holder = styled.div``;

export default BuyIndex;
