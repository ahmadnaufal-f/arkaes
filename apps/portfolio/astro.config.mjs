import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://arkaes.dev",
  // Pages stay static (prerendered) by default; the adapter only kicks in for
  // routes that opt into on-demand rendering via `export const prerender = false`
  // — currently just the `/api/chat` chatbot endpoint, which needs a server to
  // hold the OpenAI API key.
  adapter: vercel(),
});
