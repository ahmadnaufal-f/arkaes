import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  platform: "neutral",
  dts: true,
  clean: true,
  // CSS entrypoints are shipped as-is alongside the compiled token constants.
  // Copies the src/styles directory into dist/ -> dist/styles/*.css
  copy: ["src/styles"],
});
