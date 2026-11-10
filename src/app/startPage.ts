// The page the visit started on, read once when the app boots.
const START_PATHNAME = window.location.pathname;
let hasNavigated = false;

// True while the visitor is still on the page they arrived at. Once they
// move on it stays false, even if they come back to that page.
const isStartPage = (pathname: string) => {
  if (pathname !== START_PATHNAME) hasNavigated = true;
  return !hasNavigated;
};

export default isStartPage;
