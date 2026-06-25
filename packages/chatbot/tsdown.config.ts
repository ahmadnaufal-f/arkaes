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
  // Declared dependencies stay external.
  external: ["lit", "openai", "@supabase/supabase-js", /^@arkaes\//],
});
