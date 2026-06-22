import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    // @lit/react ships separate browser and node (SSR) builds. Without this,
    // Vitest picks the node/SSR build which has no useLayoutEffect and never
    // wires up element properties or event listeners.
    conditions: ["browser", "import", "module", "default"],
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/react/__tests__/setup.ts"],
  },
});
