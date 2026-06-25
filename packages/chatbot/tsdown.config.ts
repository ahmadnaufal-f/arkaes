import { defineConfig } from "tsdown";

export default defineConfig({
  // Preserve the source module structure 1:1 so the deep subpath exports
  // (./register/*, ./client/*, ./server/*) keep resolving and the
  // side-effect register files stay individually importable.
  entry: ["src/**/*.ts"],
  format: "esm",
  platform: "neutral",
  dts: true,
  clean: true,
  unbundle: true,
  // lit, openai, and @arkaes/tokens stay external (declared dependencies).
  external: ["lit", "openai", /^@arkaes\//],
});
