import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { ButtonVariant } from "@arkaes/ui";

type ButtonArgs = {
  href: string;
  label: string;
  size: "sm" | "md" | "lg";
  variant: ButtonVariant;
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
      options: Object.values(ButtonVariant),
    },
  },
  args: {
    href: "",
    label: "View Project",
    size: "md",
    variant: ButtonVariant.Primary,
  },
  component: "ark-button",
  render: renderButton,
  title: "Primitives/Ark Button",
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Primary = {} satisfies Story;

export const Secondary = {
  args: {
    label: "Read Notes",
    variant: ButtonVariant.Secondary,
  },
} satisfies Story;

export const Ghost = {
  args: {
    label: "View case study",
    variant: ButtonVariant.Ghost,
  },
} satisfies Story;

export const Link = {
  args: {
    href: "https://example.com",
    label: "Open Link",
  },
} satisfies Story;
