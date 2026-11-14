import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectActiveSeller } from "../features/selectors";
import { ROUTES } from "../constant/routes";
import PickStore from "../pages/Seller/PickStore";

const RequireSeller: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const seller = useAppSelector(selectActiveSeller);
  const { pathname } = useLocation();
  const isSignUp = pathname.toLowerCase().replace(/\/+$/, "") === ROUTES.sellerSignUp;
  const showingPicker = !seller && !isSignUp;
  const wasShowingPicker = useRef(showingPicker);

  useEffect(() => {
    const leavingPicker = wasShowingPicker.current && !showingPicker;
    wasShowingPicker.current = showingPicker;
    if (!leavingPicker) return;

    // Picking a store reveals the page without changing the URL, so route
    // focus alone cannot move focus off the removed store button.
    const frame = requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>("main h2") ??
        document.querySelector<HTMLElement>("main h1");
      if (!heading) return;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [showingPicker]);

  return showingPicker ? <PickStore /> : <>{children}</>;
};

export default RequireSeller;
