import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type CardArgs = {
  interactive: boolean;
  variant: "surface" | "project";
};

const renderCard = ({ interactive, variant }: CardArgs) => html`
  <ark-card ?interactive=${interactive} variant=${variant} style="width: min(28rem, 80vw);">
    <div style="display: grid; gap: 1rem; padding: 1.5rem;">
      <ark-badge variant="pill">Case Study</ark-badge>
      <h2 style="font: var(--ark-font-heading-md); margin: 0;">Quiet systems for sharp work</h2>
      <p style="color: var(--ark-color-text-muted); line-height: 1.7; margin: 0;">
        A restrained surface for grouping editorial UI, project summaries, and design-system notes.
      </p>
      <ark-button variant="secondary" size="sm">Inspect Component</ark-button>
    </div>
  </ark-card>
`;

const meta = {
  argTypes: {
    interactive: { control: "boolean" },
    variant: {
      control: "inline-radio",
      options: ["surface", "project"],
    },
  },
  args: {
    interactive: false,
    variant: "surface",
  },
  component: "ark-card",
  render: renderCard,
  title: "Components/Ark Card",
} satisfies Meta<CardArgs>;

export default meta;
type Story = StoryObj<CardArgs>;

export const Surface = {} satisfies Story;

export const Interactive = {
  args: {
    interactive: true,
  },
} satisfies Story;

export const Project = {
  args: {
    interactive: true,
    variant: "project",
  },
} satisfies Story;
