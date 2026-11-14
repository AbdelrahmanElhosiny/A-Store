import useRememberPath from "../hooks/useRememberPath";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import Layout from "./Layout";
import BuyerHeader from "../components/header/BuyerHeader";
import { useSideTheme } from "../hooks/useThemeMode";

const BuyerLayout = () => {
  useRememberPath();
  const theme = useSideTheme("buy");

  return (
    <ThemeProvider theme={theme}>
      <Layout
        NavBar={<BuyerHeader />}
        MainComponent={<Outlet />}
        Theme="buy"
      />
    </ThemeProvider>
  );
};

export default BuyerLayout;
