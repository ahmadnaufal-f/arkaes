import "@arkaes/tokens/css";
import "@arkaes/tokens/fonts.css";
import "@arkaes/ui/register";
// ark-markdown renders into the light DOM, so its prose styles are an ordinary
// stylesheet the app loads once rather than shadow-encapsulated CSS.
import "@arkaes/ui/markdown.css";
import { inject } from "@vercel/analytics";

import type { Preview } from "@storybook/web-components-vite";

inject();

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "Arkaes canvas",
      values: [
        { name: "Arkaes canvas", value: "#f8f4ed" },
        { name: "Ink", value: "#211c19" },
      ],
    },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default preview;
