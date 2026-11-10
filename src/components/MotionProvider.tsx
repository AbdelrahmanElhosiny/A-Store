import { LazyMotion, MotionConfig } from "motion/react";
import { useMediaQuery } from "@mui/material";
import { loadMotionFeatures } from "../styles/motion";

interface Props {
  children: React.ReactNode;
}

// Motion settings for the whole app.
// - LazyMotion with the `m` components keeps the main bundle small; the
//   features (domMax: animations plus layout, for cards sliding into place)
//   load in their own chunk once the page has loaded and the browser is idle.
// - Under prefers-reduced-motion every animation takes 0 s, so things
//   still appear and disappear, just without moving or fading.
const MotionProvider: React.FC<Props> = ({ children }) => {
  // MUI's hook follows the setting live; motion's only reads it once
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig
        reducedMotion="user"
        transition={
          isReducedMotion
            ? { duration: 0 }
            : { duration: 0.25, ease: [0.2, 0, 0, 1] }
        }
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
};

export default MotionProvider;
