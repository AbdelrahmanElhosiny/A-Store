import { lazy, useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import whenIdle from "../../utils/whenIdle";

const loadMenu = () => import("./MenuDrawer");
export const HeaderMenuDrawer = lazy(loadMenu);
export const HeaderResetDialog = lazy(() => import("../ResetDemoDialog"));
let prefetch: Promise<unknown> | undefined;

// State belongs to the header, so login/reset dialogs outlive the drawer.
const useHeaderMenu = (isPhone: boolean) => {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const closeMenu = useCallback((reason: "user" | "navigation") => {
    restoreFocus.current = reason === "user";
    setIsMenuOpen(false);
  }, []);

  useEffect(() => { closeMenu("navigation"); }, [pathname, closeMenu]);
  useEffect(() => {
    if (!isPhone) closeMenu("navigation");
  }, [isPhone, closeMenu]);
  useEffect(() => {
    if (!isMenuOpen && restoreFocus.current) {
      restoreFocus.current = false;
      // Focus only after the closed render disables the drawer's focus trap.
      menuButtonRef.current?.focus();
    }
  }, [isMenuOpen]);
  useEffect(() => {
    if (!isPhone) return;
    let cancelled = false;
    void whenIdle().then(() => {
      if (!cancelled) prefetch ??= loadMenu().catch(() => { prefetch = undefined; });
    });
    return () => { cancelled = true; };
  }, [isPhone]);

  return {
    isMenuOpen, hasOpened, isResetOpen, menuButtonRef, closeMenu,
    openMenu: () => { setHasOpened(true); setIsMenuOpen(true); },
    openReset: () => setIsResetOpen(true),
    closeReset: () => setIsResetOpen(false),
  };
};
export default useHeaderMenu;
