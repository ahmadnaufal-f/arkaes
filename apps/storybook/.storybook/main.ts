import remarkGfm from "remark-gfm";
import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  addons: [
    {
      name: "@storybook/addon-docs",
      options: {
        // MDX ships CommonMark only, which has no table syntax. Without this the
        // pipe tables in the Guides pages render as literal rows of text.
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|mjs|ts)"],
};

export default config;
