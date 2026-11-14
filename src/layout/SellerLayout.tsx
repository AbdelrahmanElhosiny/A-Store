import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import useRememberPath from "../hooks/useRememberPath";
import RequireSeller from "../components/RequireSeller";
import Layout from "./Layout";
import NavBar from "../components/NavBar";
import { ROUTES } from "../constant/routes";
import { useSideTheme } from "../hooks/useThemeMode";

const navLinks = [
  { label: "Home", path: ROUTES.seller },
  { label: "Products", path: ROUTES.sellerProducts },
  { label: "Add product", path: ROUTES.sellerProductNew },
  { label: "Orders", path: ROUTES.sellerOrders },
];

const SellerLayout = () => {
  useRememberPath();
  const theme = useSideTheme("sell");

  return (
    <ThemeProvider theme={theme}>
      <Layout
        NavBar={<NavBar navLinks={navLinks} className="sell" />}
        MainComponent={
          <RequireSeller><Outlet /></RequireSeller>
        }
        Theme="sell"
      />
    </ThemeProvider>
  );
};

export default SellerLayout;
