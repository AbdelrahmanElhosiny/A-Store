import { Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
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

// Task 2 replaces this body with the seller account/store guard.
const RequireSeller = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const SellerLayout = () => {
  const theme = useSideTheme("sell");
  const { pathname } = useLocation();
  // Sign-up stays public when Task 2 adds the guard; accept trailing slashes.
  const isSignUp = pathname.replace(/\/+$/, "") === ROUTES.sellerSignUp;

  return (
    <ThemeProvider theme={theme}>
      <Layout
        NavBar={<NavBar navLinks={navLinks} className="sell" />}
        MainComponent={
          isSignUp ? <Outlet /> : <RequireSeller><Outlet /></RequireSeller>
        }
        Theme="sell"
      />
    </ThemeProvider>
  );
};

export default SellerLayout;
