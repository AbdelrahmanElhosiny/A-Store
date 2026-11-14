import { vi } from "vitest";

// src/test/setup.ts runs vi.unstubAllGlobals() after each test; set stubs in beforeEach, not beforeAll.
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
