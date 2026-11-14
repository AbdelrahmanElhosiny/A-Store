import { vi } from "vitest";

export const setViewportWidth = (px: number): void => {
  vi.stubGlobal("matchMedia", (query: string): MediaQueryList => {
    const match = query.match(/^\((max|min)-width:\s*(\d+)px\)$/);
    return {
      matches: !!match && (match[1] === "max" ? px <= Number(match[2]) : px >= Number(match[2])),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    };
  });
};
