import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://arkaes.dev",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});

