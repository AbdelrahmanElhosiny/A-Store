import { lazy, useEffect, useState } from "react";
import whenIdle from "../../utils/whenIdle";

const loadLogin = () => import("../LoginDialog");
export const HeaderLoginDialog = lazy(loadLogin);
let prefetch: Promise<unknown> | undefined;

// Both headers keep the dialog mounted after its first opening.
const useHeaderLogin = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  useEffect(() => {
    prefetch ??= whenIdle().then(loadLogin).catch(() => { prefetch = undefined; });
  }, []);
  return {
    isLoginOpen, hasOpened,
    openLogin: () => { setHasOpened(true); setIsLoginOpen(true); },
    closeLogin: () => setIsLoginOpen(false),
  };
};
export default useHeaderLogin;
