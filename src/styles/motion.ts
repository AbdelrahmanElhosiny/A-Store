// Shared animations, spread onto `m` elements: <m.li {...listItem}>.
// Durations come from MotionProvider (0 s under reduced motion).

// an item in a list or grid: pops in and out, slides when its neighbours change
const listItem = {
  layout: "position" as const,
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

// a page's content when the route changes
const pageEnter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export { listItem, pageEnter };
