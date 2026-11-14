import { lazy, useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import useReturnFocus from "./useReturnFocus";
import whenIdle from "../../utils/whenIdle";

const loadMenu = () => import("./MenuDrawer");
export const HeaderMenuDrawer = lazy(loadMenu);
export const HeaderResetDialog = lazy(() => import("../ResetDemoDialog"));
let prefetch: Promise<unknown> | undefined;

// State belongs to the header, so login/reset dialogs outlive the drawer.
const useHeaderMenu = (isPhone: boolean) => {
  const { key } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [hasResetOpened, setHasResetOpened] = useState(false);
  const resetFocus = useReturnFocus();
  const { remember, restore } = useReturnFocus();
  const [isResetOpen, setIsResetOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback((reason: "user" | "navigation") => {
    remember(reason === "user" ? menuButtonRef.current : null);
    setIsMenuOpen(false);
  }, [remember]);

  useEffect(() => { closeMenu("navigation"); }, [key, closeMenu]);
  useEffect(() => {
    if (!isPhone) closeMenu("navigation");
  }, [isPhone, closeMenu]);
  useEffect(() => {
    if (!isPhone) return;
    let cancelled = false;
    void whenIdle().then(() => {
      if (!cancelled) prefetch ??= loadMenu().catch(() => { prefetch = undefined; });
    });
    return () => { cancelled = true; };
  }, [isPhone]);

  return {
    isMenuOpen, hasOpened, isResetOpen, hasResetOpened, menuButtonRef, closeMenu,
    onMenuExited: restore, onResetExited: resetFocus.restore,
    openMenu: () => { setHasOpened(true); setIsMenuOpen(true); },
    openReset: () => {
      resetFocus.remember(menuButtonRef.current);
      setHasResetOpened(true);
      setIsResetOpen(true);
    },
    closeReset: () => setIsResetOpen(false),
  };
};
export default useHeaderMenu;
