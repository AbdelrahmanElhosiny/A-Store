import { color } from "../styles/tokens";
import { Button, ThemeProvider } from "@mui/material";
import { Link } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { ROUTES } from "../constant/routes";
import useSide from "../hooks/useSide";
import { useSideTheme } from "../hooks/useThemeMode";

const ModeSwitch: React.FC<{ compact?: boolean; onNavigate?: () => void }> = ({ compact = false, onNavigate }) => {
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
        variant="contained"
        color="primary"
        className={otherSide}
        aria-label={label}
        onClick={onNavigate}
        sx={{
          "--primary-color": toSeller ? color.sell : color.buy,
          fontFamily: "var(--font-mono)", fontWeight: 700,
          whiteSpace: "nowrap", borderRadius: 0, height: 36,
          color: color.bg, backgroundColor: color.primary,
          boxShadow: "var(--shadow-1)",
          "&:hover": { backgroundColor: color.primary, boxShadow: "var(--shadow-1)" },
        }}
      >
        {compact ? (toSeller ? "Sell" : "Shop") : label}
      </Button>
    </ThemeProvider>
  );
};

export default ModeSwitch;
