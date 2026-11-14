import { useCallback, useRef } from "react";

// Menu items disappear; remember their stable header button before closing.
const useReturnFocus = () => {
  const target = useRef<HTMLElement | null>(null);
  const remember = useCallback((element: HTMLElement | null) => { target.current = element; }, []);
  const restore = useCallback(() => {
    const element = target.current;
    target.current = null;
    if (element?.isConnected) element.focus();
  }, []);
  return { remember, restore };
};
export default useReturnFocus;
