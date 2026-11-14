import { Button, ThemeProvider } from "@mui/material";
import { Link } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { ROUTES } from "../constant/routes";
import useSide from "../hooks/useSide";
import { useSideTheme } from "../hooks/useThemeMode";

const ModeSwitch: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { role } = useSide();
  const toSeller = role === "buyer";
  const otherRole = toSeller ? "seller" : "buyer";
  const otherSide = toSeller ? "sell" : "buy";
  const lastPath = useAppSelector((state) => state.session.lastPath[otherRole]);
  const theme = useSideTheme(otherSide);
  const label = toSeller ? "Switch to selling" : "Switch to shopping";

  return (
    <ThemeProvider theme={theme}>
      <Button
        component={Link}
        to={lastPath || (toSeller ? ROUTES.seller : ROUTES.home)}
        variant="outlined"
        color="primary"
        className={otherSide}
        aria-label={label}
        sx={{ whiteSpace: "nowrap", borderRadius: 0 }}
      >
        {compact ? (toSeller ? "Sell" : "Shop") : label}
      </Button>
    </ThemeProvider>
  );
};

export default ModeSwitch;
