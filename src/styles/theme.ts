import { createTheme, Theme } from "@mui/material";
import { Shadows } from "@mui/material/styles";
import colorD from "./colorD";
import colorL from "./colorL";
import { shadow } from "./tokens";

type Mode = "light" | "dark";
type Side = "sell" | "buy" | "neutral";

// -----------------
// Gruvbox roles per mode
// -----------------
// Accents use the variant that keeps text readable on them:
// bright colours on the dark background, faded colours on the light one.
// Text on an accent is always the page background colour.
//
// A few values are nudged so text passes WCAG AA (4.5:1) on the cards (bg1)
// as well as the page; each is marked and stays close to the Gruvbox colour.
const accessible = {
  // Gruvbox fg3: the muted grey one step closer to the text colour
  mutedL: "#665c54",
  mutedD: "#bdae93",
  // greenB / orangeB darkened a little (were 3.6 and 4.5 on bg1)
  greenL: "#66611a",
  orangeL: "#aa3a05",
  // purpleB / blueB 10% lighter, redB mixed 40% toward fg (were 4.2, 4.3, 3.4)
  sellD: "#d6909e",
  buyD: "#8caa9a",
  redD: "#f48568",
};

const palettes = {
  dark: {
    bg: colorD.bg,
    bg1: colorD.bg1,
    bg2: colorD.bg2,
    fg: colorD.fg,
    fgMuted: accessible.mutedD,
    sell: accessible.sellD,
    buy: accessible.buyD,
    red: accessible.redD,
    green: colorD.greenB,
    yellow: colorD.yellowB,
    orange: colorD.orangeB,
    shadow: colorD.bgH,
  },
  light: {
    bg: colorL.bg,
    bg1: colorL.bg1,
    bg2: colorL.bg2,
    fg: colorL.fg,
    fgMuted: accessible.mutedL,
    sell: colorL.purpleB,
    buy: colorL.blueB,
    red: colorL.redB,
    green: accessible.greenL,
    yellow: colorL.yellowB,
    orange: accessible.orangeL,
    shadow: colorL.bg3,
  },
};
type Palette = (typeof palettes)[Mode];

const fontSans =
  '"Geist Variable", system-ui, -apple-system, "Segoe UI", sans-serif';
const fontMono =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

// Sharp-edged design: hard offset shadows, no blur.
// MUI elevations 1-4 / 5-12 / 13-24 map to the three shadow levels.
const hardShadows = [
  "none",
  ...Array.from({ length: 24 }, (_, i) =>
    i < 4 ? shadow.s1 : i < 12 ? shadow.s2 : shadow.s3
  ),
] as Shadows;

// -----------------
// MUI theme for one side in one mode
// -----------------
const createAppTheme = (side: Side, mode: Mode): Theme => {
  const p = palettes[mode];
  const main = side === "sell" ? p.sell : side === "buy" ? p.buy : p.fg;

  return createTheme({
    palette: {
      mode,
      primary: { main, contrastText: p.bg },
      error: { main: p.red, contrastText: p.bg },
      warning: { main: p.yellow, contrastText: p.bg },
      success: { main: p.green, contrastText: p.bg },
      background: { default: p.bg, paper: p.bg1 },
      text: { primary: p.fg, secondary: p.fgMuted },
      divider: p.bg2,
    },
    shape: { borderRadius: 0 },
    shadows: hardShadows,
    typography: {
      fontFamily: fontSans,
      button: { fontFamily: fontMono, fontWeight: 700 },
    },
    components: {
      // no round ripples: focus shows as a square outline (GlobalStyle)
      // MUI removes the outline on its buttons, so they get the same square
      // ring as the rest of the app when focused from the keyboard
      MuiButtonBase: {
        defaultProps: { disableRipple: true },
        styleOverrides: {
          root: {
            "&.Mui-focusVisible": {
              outline: `2px solid var(--primary-color, ${p.fg})`,
              outlineOffset: "2px",
            },
          },
        },
      },
      MuiButton: { defaultProps: { disableElevation: true } },
      // MUI lightens dark-mode surfaces with a gradient; keep them flat
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 0 } } },
      MuiBadge: { styleOverrides: { badge: { borderRadius: 0 } } },
      // hover and focus highlights on icon buttons are square too
      MuiIconButton: { styleOverrides: { root: { borderRadius: 0 } } },
    },
  });
};

export type { Mode, Side, Palette };
export { palettes, fontSans, fontMono };
export default createAppTheme;
