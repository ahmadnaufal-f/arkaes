import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

interface EmptyArgs {
  eyebrow: string;
  heading: string;
  headingEmphasis: string;
  description: string;
  symbol: string;
}

const meta = {
  title: "Primitives/Empty",
  argTypes: {
    eyebrow: { control: "text" },
    heading: { control: "text" },
    headingEmphasis: { control: "text" },
    description: { control: "text" },
    symbol: { control: "text" },
  },
  args: {
    eyebrow: "No results",
    heading: "Nothing matches",
    headingEmphasis: "just yet.",
    description: "No work fits this combination of filters. Try widening your selection.",
    symbol: "Æ",
  },
  render: ({ eyebrow, heading, headingEmphasis, description, symbol }) => html`
    <ark-empty
      eyebrow=${eyebrow}
      heading=${heading}
      heading-emphasis=${headingEmphasis}
      description=${description}
      symbol=${symbol}
    ></ark-empty>
  `,
} satisfies Meta<EmptyArgs>;

export default meta;

type Story = StoryObj<EmptyArgs>;

export const Default: Story = {};

export const WithAction: Story = {
  render: ({ eyebrow, heading, headingEmphasis, description, symbol }) => html`
    <ark-empty
      eyebrow=${eyebrow}
      heading=${heading}
      heading-emphasis=${headingEmphasis}
      description=${description}
      symbol=${symbol}
    >
      <ark-button variant="secondary" size="sm">Reset filters</ark-button>
    </ark-empty>
  `,
};

export const MinimalNoSymbol: Story = {
  args: {
    symbol: "",
    eyebrow: "Empty",
    heading: "No items here.",
    headingEmphasis: "",
    description: "",
  },
};
