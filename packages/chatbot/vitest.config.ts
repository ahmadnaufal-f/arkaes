import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The renderer is a pure string→string function, so the default Node
    // environment is enough — no DOM needed.
    include: ["src/**/*.test.ts"],
  },
});
