import { createContext, useContext, useMemo } from "react";
import createAppTheme, { Mode, Side } from "../styles/theme";

type Preference = Mode | "system";

interface ThemeModeValue {
  mode: Mode; // the mode in use now
  preference: Preference; // what the user picked; "system" follows the OS
  setPreference: (preference: Preference) => void;
}

const ThemeModeContext = createContext<ThemeModeValue | null>(null);

const useThemeMode = () => {
  const value = useContext(ThemeModeContext);
  if (!value) throw new Error("useThemeMode must be used in ThemeModeProvider");
  return value;
};

// MUI theme for a side (Sell / Buy) in the current mode
const useSideTheme = (side: Side) => {
  const { mode } = useThemeMode();
  return useMemo(() => createAppTheme(side, mode), [side, mode]);
};

export type { Preference, ThemeModeValue };
export { ThemeModeContext, useSideTheme };
export default useThemeMode;
