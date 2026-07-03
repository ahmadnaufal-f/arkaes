import { defineConfig } from "tsdown";

export default defineConfig({
  // Preserve the source module structure 1:1 so the deep subpath exports
  // (./register/*, ./client/*, ./server/*) keep resolving and the
  // side-effect register files stay individually importable.
  // Exclude test files — they pull in dev-only deps (vitest) and must not be
  // emitted into dist/.
  entry: ["src/**/*.ts", "!src/**/*.test.ts", "!src/**/__tests__/**"],
  format: "esm",
  platform: "neutral",
  dts: true,
  clean: true,
  unbundle: true,
  // Declared dependencies stay external.
  external: ["lit", "openai", "@supabase/supabase-js", /^@arkaes\//],
});
