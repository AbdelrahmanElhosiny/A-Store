import { useLocation } from "react-router-dom";
import { m } from "motion/react";
import { pageEnter } from "../styles/motion";

interface Props {
  children: React.ReactNode;
}

// Each page fades and rises in when the route changes. Only an entrance:
// an exit animation would hold up every navigation.
const PageTransition: React.FC<Props> = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <m.div key={pathname} {...pageEnter}>
      {children}
    </m.div>
  );
};

export default PageTransition;
