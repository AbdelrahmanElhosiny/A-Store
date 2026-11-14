import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// every test starts with nothing saved
afterEach(() => {
  localStorage.clear();
});
