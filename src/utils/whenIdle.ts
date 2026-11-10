// Resolves once the page has finished loading and the browser is idle:
// for downloads that shouldn't compete with the first paint.
const whenIdle = () =>
  new Promise<void>((resolve) => {
    const onIdle = () => {
      // Safari has no requestIdleCallback
      if ("requestIdleCallback" in window)
        window.requestIdleCallback(() => resolve(), { timeout: 3000 });
      else setTimeout(resolve, 200);
    };
    if (document.readyState === "complete") onIdle();
    else window.addEventListener("load", onIdle, { once: true });
  });

export default whenIdle;
