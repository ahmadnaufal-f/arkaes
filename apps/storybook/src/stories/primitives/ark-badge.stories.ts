import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { BadgeVariant } from "@arkaes/ui";

type BadgeArgs = {
  label: string;
  size: "sm" | "md" | "lg";
  variant: BadgeVariant;
};

const renderBadge = ({ label, size, variant }: BadgeArgs) => html`
  <ark-badge size=${size} variant=${variant}>${label}</ark-badge>
`;

const meta = {
  argTypes: {
    label: { control: "text" },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "select",
      options: Object.values(BadgeVariant),
    },
  },
  args: {
    label: "Selected Work",
    size: "md",
    variant: BadgeVariant.Eyebrow,
  },
  component: "ark-badge",
  parameters: {
    docs: {
      description: {
        component: `
\`ark-badge\` labels content with small, visually distinct tags. Use it to categorize, highlight, or mark items with contextual metadata.

Three variants provide different visual weights: \`eyebrow\` for subtle labels, \`soft\` for muted backgrounds, and \`pill\` for rounded pill-shaped badges. Choose the size that matches your layout context.
        `,
      },
    },
  },
  render: renderBadge,
  title: "Primitives/Ark Badge",
} satisfies Meta<BadgeArgs>;

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Eyebrow = {} satisfies Story;

export const Soft = {
  args: {
    label: "Interface System",
    variant: BadgeVariant.Soft,
  },
} satisfies Story;

export const Pill = {
  args: {
    label: "Available",
    variant: BadgeVariant.Pill,
  },
} satisfies Story;

export const Sizes = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <ark-badge size="sm" variant="eyebrow">Small</ark-badge>
      <ark-badge size="md" variant="eyebrow">Medium</ark-badge>
      <ark-badge size="lg" variant="eyebrow">Large</ark-badge>
    </div>
  `,
} satisfies Story;

