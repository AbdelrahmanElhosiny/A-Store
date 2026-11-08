import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material";
import createAppTheme, { Mode } from "./theme";
import { Preference, ThemeModeContext } from "../hooks/useThemeMode";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const STORAGE_KEY = "a-store-theme";

const getSystemMode = (): Mode =>
  window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light";

// the user's last pick, if any; storage can be blocked (private windows)
const readPreference = (): Preference => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
};
const savePreference = (preference: Preference) => {
  try {
    if (preference === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // keep working without storage
  }
};

interface Props {
  children: React.ReactNode;
}

// Holds the light/dark mode, follows the system by default,
// and gives pages outside Sell/Buy a neutral MUI theme.
const ThemeModeProvider: React.FC<Props> = ({ children }) => {
  const [preference, setPreferenceState] =
    useState<Preference>(readPreference);
  const setPreference = useCallback((next: Preference) => {
    savePreference(next);
    setPreferenceState(next);
  }, []);
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
    [mode, preference, setPreference]
  );
  const neutralTheme = useMemo(() => createAppTheme("neutral", mode), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={neutralTheme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default ThemeModeProvider;
