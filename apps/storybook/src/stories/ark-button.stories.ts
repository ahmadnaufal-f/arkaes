import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type ButtonArgs = {
  href: string;
  label: string;
  size: "sm" | "md" | "lg";
  variant: "primary" | "secondary" | "ghost";
};

const renderButton = ({ href, label, size, variant }: ButtonArgs) => {
  if (href) {
    return html`<ark-button href=${href} size=${size} variant=${variant}>${label}</ark-button>`;
  }

  return html`<ark-button size=${size} variant=${variant}>${label}</ark-button>`;
};

const meta = {
  argTypes: {
    href: { control: "text" },
    label: { control: "text" },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
    },
  },
  args: {
    href: "",
    label: "View Project",
    size: "md",
    variant: "primary",
  },
  component: "ark-button",
  render: renderButton,
  title: "Components/Ark Button",
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Primary = {} satisfies Story;

export const Secondary = {
  args: {
    label: "Read Notes",
    variant: "secondary",
  },
} satisfies Story;

export const Ghost = {
  args: {
    label: "About the studio",
    variant: "ghost",
  },
} satisfies Story;

export const Link = {
  args: {
    href: "https://example.com",
    label: "Open Link",
  },
} satisfies Story;
