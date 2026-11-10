import { useEffect } from "react";

const SITE_NAME = "A-Store";

// The browser tab's title, e.g. "Cart · A-Store": screen readers read it
// when the page changes, and it tells open tabs apart
const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  }, [title]);
};

export default useDocumentTitle;
