import process from "node:process";
import vercel from "@astrojs/vercel";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://arkaes.dev",
  // Pages stay static (prerendered) by default; the adapter only kicks in for
  // routes that opt into on-demand rendering via `export const prerender = false`
  // — the `/api/chat` chatbot endpoint (needs a server to hold the OpenAI API
  // key) and the blog routes, which fetch from Contentful and are ISR-cached.
  adapter: vercel({
    // ISR: on-demand routes render once, then serve from the edge cache like
    // static pages. Contentful's publish webhook hits /api/revalidate, which
    // uses the bypass token to refresh just the affected blog paths — so a
    // publish never needs a rebuild or a commit. `expiration` is a safety net
    // in case a webhook is missed.
    isr: {
      expiration: 60 * 60,
      bypassToken: process.env.VERCEL_ISR_BYPASS_TOKEN,
      // API endpoints must run on every request: /api/revalidate performs the
      // invalidation itself and /api/chat streams per-user responses.
      exclude: ["/api/revalidate", "/api/chat"],
    },
  }),

  // Prefetch in-viewport links so ClientRouter has the next page's HTML ready
  // before the click — this closes the navigation flash window. The site is
  // small and the header nav is always on screen, so `viewport` won't over-fetch.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },

  // Self-host the type stack instead of pulling it from Google Fonts at runtime.
  // Astro downloads and serves the woff2 files locally, emits <link rel="preload">
  // for them, and generates metric-matched fallback @font-face rules — which
  // together remove the fallback→web-font swap (FOUT) on load/navigation.
  // The generated CSS variables are mapped onto the --ark-font-* tokens in
  // src/styles/global.css so every consumer (including Lit shadow DOM) picks
  // them up. Weights/styles/subsets mirror what the portfolio actually uses.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Plus Jakarta Sans",
      cssVariable: "--font-sans",
      weights: [300, 400, 500, 600],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: [
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "sans-serif",
      ],
    },
    {
      provider: fontProviders.google(),
      name: "Fraunces",
      cssVariable: "--font-display",
      weights: ["100 900"],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Cormorant Garamond", "Georgia", "serif"],
    },
    {
      provider: fontProviders.google(),
      name: "DM Mono",
      cssVariable: "--font-mono",
      weights: [300, 400],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["SFMono-Regular", "Consolas", "monospace"],
    },
  ],
});
