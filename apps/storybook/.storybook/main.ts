import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|mjs|ts)"],
};

export default config;
