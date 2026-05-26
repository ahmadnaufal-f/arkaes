import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type BadgeArgs = {
  label: string;
  variant: "eyebrow" | "soft" | "pill" | "contact";
};

const renderBadge = ({ label, variant }: BadgeArgs) => html`
  <ark-badge variant=${variant}>${label}</ark-badge>
`;

const meta = {
  argTypes: {
    label: { control: "text" },
    variant: {
      control: "select",
      options: ["eyebrow", "soft", "pill", "contact"],
    },
  },
  args: {
    label: "Selected Work",
    variant: "eyebrow",
  },
  component: "ark-badge",
  render: renderBadge,
  title: "Components/Ark Badge",
} satisfies Meta<BadgeArgs>;

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Eyebrow = {} satisfies Story;

export const Soft = {
  args: {
    label: "Interface System",
    variant: "soft",
  },
} satisfies Story;

export const Pill = {
  args: {
    label: "Available",
    variant: "pill",
  },
} satisfies Story;

export const Contact = {
  args: {
    label: "Contact",
    variant: "contact",
  },
} satisfies Story;
