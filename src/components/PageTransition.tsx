import { useLocation } from "react-router-dom";
import { m } from "motion/react";
import { pageEnter } from "../styles/motion";
import isStartPage from "../app/startPage";

interface Props {
  children: React.ReactNode;
}

// Each page fades and rises in when the route changes. Only an entrance:
// an exit animation would hold up every navigation. The page a visit starts
// on shows at once: its fade would wait for the animation code to download,
// keeping the page invisible on a slow connection.
const PageTransition: React.FC<Props> = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <m.div key={pathname} {...pageEnter(!isStartPage(pathname))}>
      {children}
    </m.div>
  );
};

export default PageTransition;
