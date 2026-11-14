import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// every test starts with nothing saved
afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});
