import { defineConfig } from "tsdown";

export default defineConfig({
  // Preserve the source module structure 1:1 so the deep subpath exports
  // (./register/*, ./primitives/*, ./components/*, ./patterns/*) keep
  // resolving and side-effect registration files stay individually importable.
  entry: ["src/**/*.ts"],
  format: "esm",
  platform: "neutral",
  dts: true,
  clean: true,
  unbundle: true,
  // lit and @arkaes/tokens stay external (declared dependencies).
});
