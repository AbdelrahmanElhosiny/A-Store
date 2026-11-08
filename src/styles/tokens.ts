// Design tokens as CSS variables. Values live in GlobalStyle and change with
// the light/dark mode, so components use these instead of hex values.

const color = {
  bg: "var(--color-bg)",
  bg1: "var(--color-bg-1)",
  bg2: "var(--color-bg-2)",
  fg: "var(--color-fg)",
  fgMuted: "var(--color-fg-muted)",
  red: "var(--color-red)",
  green: "var(--color-green)",
  yellow: "var(--color-yellow)",
  orange: "var(--color-orange)",
  sell: "var(--sell-color)",
  buy: "var(--buy-color)",
  // the current side's accent (set by the .sell / .buy class)
  primary: "var(--primary-color)",
};

const space = {
  xs: "var(--space-xs)",
  s: "var(--space-s)",
  m: "var(--space-m)",
  l: "var(--space-l)",
  xl: "var(--space-xl)",
  xxl: "var(--space-xxl)",
};

const shadow = {
  s1: "var(--shadow-1)",
  s2: "var(--shadow-2)",
  s3: "var(--shadow-3)",
};

// Sharp-edged design language: every corner is square.
const radius = "var(--radius)";

export { color, space, shadow, radius };
