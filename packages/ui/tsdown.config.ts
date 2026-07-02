import { defineConfig } from "tsdown";

export default defineConfig({
  // Preserve the source module structure 1:1 so the deep subpath exports
  // (./register/*, ./primitives/*, ./components/*, ./patterns/*) keep
  // resolving and side-effect registration files stay individually importable.
  // Exclude test files — they pull in dev-only deps (@testing-library/react,
  // vitest) that aren't installable at build time, which rolldown reports as
  // "Module not found" and would otherwise emit test files into dist/.
  entry: ["src/**/*.ts", "!src/**/*.test.ts", "!src/**/__tests__/**"],
  format: "esm",
  platform: "neutral",
  dts: true,
  clean: true,
  unbundle: true,
  // lit and @arkaes/tokens stay external (declared dependencies).
});
