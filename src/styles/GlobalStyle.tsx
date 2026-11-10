import { Global, css } from "@emotion/react";
import size from "./size";
import { Mode, Palette, palettes, fontMono, fontSans } from "./theme";
import { color } from "./tokens";

type ThemeType = "sell" | "buy";

const GlobalStyle = () => {
  return <Global styles={style} />;
};

// colour variables for one mode
const modeVars = (mode: Mode, p: Palette) => css`
  color-scheme: ${mode};

  --color-bg: ${p.bg};
  --color-bg-1: ${p.bg1};
  --color-bg-2: ${p.bg2};
  --color-fg: ${p.fg};
  --color-fg-muted: ${p.fgMuted};
  --color-red: ${p.red};
  --color-green: ${p.green};
  --color-yellow: ${p.yellow};
  --color-orange: ${p.orange};
  --color-shadow: ${p.shadow};

  --sell-color: ${p.sell};
  --buy-color: ${p.buy};
`;

const style = css`
  :root {
    ${modeVars("light", palettes.light)}

    /* fonts */
    --font-sans: ${fontSans};
    --font-mono: ${fontMono};

    /* sizes */
    --size-xs: 14px;
    --size-s: 16px;
    --size-m: 20px;
    --size-l: 30px;
    --size-xl: 40px;

    /* spacing */
    --space-xs: 4px;
    --space-s: 8px;
    --space-m: 16px;
    --space-l: 24px;
    --space-xl: 32px;
    --space-xxl: 48px;

    /* layout */
    --page-gutter: clamp(16px, 4vw, 48px);
    --nav-height: 56px;

    /* sharp edges: square corners, hard shadows */
    --radius: 0;
    --shadow-1: 2px 2px 0 0 var(--color-shadow);
    --shadow-2: 4px 4px 0 0 var(--color-shadow);
    --shadow-3: 8px 8px 0 0 var(--color-shadow);
  }

  /* follow the system until the app sets data-theme */
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      ${modeVars("dark", palettes.dark)}
    }
  }
  :root[data-theme="dark"] {
    ${modeVars("dark", palettes.dark)}
  }

  /* no blue flash when tapping links and buttons on phones;
     keyboard users still get the focus ring below */
  html {
    -webkit-tap-highlight-color: transparent;
  }

  body {
    background-color: ${color.bg};
    color: ${color.fg};
    font-family: var(--font-sans);
    /* clip, not hidden: hidden would break the sticky navbar */
    overflow-x: clip;
  }

  h1 {
    font-size: clamp(28px, 7vw, ${size.xl});
  }
  h2 {
    font-size: clamp(22px, 5vw, ${size.l});
  }

  .buy {
    --primary-color: ${color.buy};
  }

  .sell {
    --primary-color: ${color.sell};
  }

  /* hidden on screen, still read by screen readers */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* square focus ring for keyboard users */
  :focus-visible {
    outline: 2px solid var(--primary-color, ${color.fg});
    outline-offset: 2px;
  }
`;

export type { ThemeType };
export default GlobalStyle;
