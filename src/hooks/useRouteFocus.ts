import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import isStartPage from "../app/startPage";

// After an in-app navigation: back to the top of the page, and keyboard and
// screen-reader focus moves to the new page's heading instead of staying on
// the link that was clicked (which may not exist any more)
const useRouteFocus = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // the page the visit starts on keeps the browser's own focus and scroll
    // (a path check, not a "first render" flag, so StrictMode can't trip it)
    if (isStartPage(pathname)) return;
    window.scrollTo(0, 0);
    const frame = requestAnimationFrame(() => {
      // the page's own heading; the home page has no <main>
      const heading =
        document.querySelector<HTMLElement>("main h1, main h2") ??
        document.querySelector<HTMLElement>("h1");
      if (!heading) return;
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
};

export default useRouteFocus;
