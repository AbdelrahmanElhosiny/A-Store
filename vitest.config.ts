import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Node 25+ has its own localStorage, which hides jsdom's (and is empty
// without a file). Turning it off lets the tests use jsdom's.
const nodeMajor = Number(process.versions.node.split(".")[0]);
const execArgv = nodeMajor >= 25 ? ["--no-experimental-webstorage"] : [];

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    poolOptions: { forks: { execArgv } },
  },
});
