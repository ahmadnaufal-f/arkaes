import vercel from "@astrojs/vercel";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://arkaes.dev",
  // Pages stay static (prerendered) by default; the adapter only kicks in for
  // routes that opt into on-demand rendering via `export const prerender = false`
  // — currently just the `/api/chat` chatbot endpoint, which needs a server to
  // hold the OpenAI API key.
  adapter: vercel(),

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
