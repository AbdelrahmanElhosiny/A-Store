import { lazy, useEffect, useState } from "react";
import useReturnFocus from "./useReturnFocus";
import whenIdle from "../../utils/whenIdle";

const loadLogin = () => import("../LoginDialog");
export const HeaderLoginDialog = lazy(loadLogin);
let prefetch: Promise<unknown> | undefined;

// Both headers keep the dialog mounted after its first opening.
const useHeaderLogin = () => {
  const focus = useReturnFocus();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  useEffect(() => {
    prefetch ??= whenIdle().then(loadLogin).catch(() => { prefetch = undefined; });
  }, []);
  return {
    isLoginOpen, hasOpened,
    openLogin: (target = document.getElementById("account-button")) => {
      focus.remember(target);
      setHasOpened(true);
      setIsLoginOpen(true);
    },
    onLoginExited: focus.restore,
    closeLogin: () => setIsLoginOpen(false),
  };
};
export default useHeaderLogin;
