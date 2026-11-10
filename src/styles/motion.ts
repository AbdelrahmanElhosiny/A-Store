import whenIdle from "../utils/whenIdle";

// Shared animations, spread onto `m` elements: <m.li {...listItem()}>.
// Durations come from MotionProvider (0 s under reduced motion).

// The animation code downloads after the page has loaded (see MotionProvider).
// Until then an `m` element can't animate, so it must not start hidden:
// new items and pages simply appear.
let isMotionReady = false;

const loadMotionFeatures = () =>
  whenIdle()
    .then(() => import("./motionFeatures"))
    .then((mod) => {
      isMotionReady = true;
      return mod.default;
    });

// an item in a list or grid: pops in and out, slides when its neighbours change
const listItem = () => ({
  layout: "position" as const,
  initial: isMotionReady ? { opacity: 0, scale: 0.96 } : false,
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
});

// a page's content when the route changes; `false` shows it at once
const pageEnter = (shouldAnimate: boolean) => ({
  initial: shouldAnimate && isMotionReady ? { opacity: 0, y: 12 } : false,
  animate: { opacity: 1, y: 0 },
});

export { listItem, pageEnter, loadMotionFeatures };
