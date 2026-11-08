import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material";
import createAppTheme, { Mode } from "./theme";
import { Preference, ThemeModeContext } from "../hooks/useThemeMode";

const DARK_QUERY = "(prefers-color-scheme: dark)";

const getSystemMode = (): Mode =>
  window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light";

interface Props {
  children: React.ReactNode;
}

// Holds the light/dark mode, follows the system by default,
// and gives pages outside Sell/Buy a neutral MUI theme.
const ThemeModeProvider: React.FC<Props> = ({ children }) => {
  const [preference, setPreference] = useState<Preference>("system");
  const [systemMode, setSystemMode] = useState<Mode>(getSystemMode);

  // follow the system setting when it changes
  useEffect(() => {
    const query = window.matchMedia?.(DARK_QUERY);
    if (!query) return;
    const onChange = (event: MediaQueryListEvent) =>
      setSystemMode(event.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const mode = preference === "system" ? systemMode : preference;

  // the CSS variables in GlobalStyle switch on this attribute
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const value = useMemo(
    () => ({ mode, preference, setPreference }),
    [mode, preference]
  );
  const neutralTheme = useMemo(() => createAppTheme("neutral", mode), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={neutralTheme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default ThemeModeProvider;
