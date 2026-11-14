import { useAppSelector } from "../app/hooks";
import { selectActiveStore } from "../features/selectors";
import SellerNav from "../components/header/SellerNav";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import useRememberPath from "../hooks/useRememberPath";
import RequireSeller from "../components/RequireSeller";
import Layout from "./Layout";
import useIsPhone from "../hooks/useIsPhone";
import SellerHeader from "../components/header/SellerHeader";
import { useSideTheme } from "../hooks/useThemeMode";

const SellerLayout = () => {
  const isPhone = useIsPhone();
  const store = useAppSelector(selectActiveStore);
  useRememberPath();
  const theme = useSideTheme("sell");

  return (
    <ThemeProvider theme={theme}>
      <Layout
        NavBar={<SellerHeader />}
        Sidebar={!isPhone && store ? <SellerNav /> : undefined}
        MainComponent={
          <RequireSeller><Outlet /></RequireSeller>
        }
        Theme="sell"
      />
    </ThemeProvider>
  );
};

export default SellerLayout;
