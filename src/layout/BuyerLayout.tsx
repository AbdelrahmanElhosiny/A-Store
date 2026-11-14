import useRememberPath from "../hooks/useRememberPath";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import Layout from "./Layout";
import NavBar from "../components/NavBar";
import useIsPhone from "../hooks/useIsPhone";
import BuyerHeader from "../components/header/BuyerHeader";
import { ROUTES } from "../constant/routes";
import { useSideTheme } from "../hooks/useThemeMode";
import { useAppSelector } from "../app/hooks";
import { selectCartCount } from "../features/selectors";

const BuyerLayout = () => {
  const isPhone = useIsPhone();
  useRememberPath();
  const theme = useSideTheme("buy");
  const cartCount = useAppSelector(selectCartCount);
  const navLinks = [
    { label: "Home", path: ROUTES.home },
    { label: "Cart", path: ROUTES.cart, badge: cartCount },
    { label: "Orders", path: ROUTES.accountOrders },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Layout
        NavBar={isPhone ? <NavBar navLinks={navLinks} className="buy" /> : <BuyerHeader />}
        MainComponent={<Outlet />}
        Theme="buy"
      />
    </ThemeProvider>
  );
};

export default BuyerLayout;
