import "@arkaes/tokens/css";
import "@arkaes/ui";

import type { Preview } from "@storybook/web-components-vite";

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
