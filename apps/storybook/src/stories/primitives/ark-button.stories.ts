import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { ButtonVariant } from "@arkaes/ui";

type ButtonArgs = {
  disabled: boolean;
  fullWidth: boolean;
  href: string;
  label: string;
  rel: string;
  size: "sm" | "md" | "lg";
  target: "" | "_blank" | "_self" | "_parent" | "_top";
  type: "button" | "submit" | "reset";
  variant: ButtonVariant;
};

const renderButton = ({
  disabled,
  fullWidth,
  href,
  label,
  rel,
  size,
  target,
  type,
  variant,
}: ButtonArgs) => {
  if (href) {
    return html`
      <ark-button
        href=${href}
        size=${size}
        variant=${variant}
        target=${ifDefined(target || undefined)}
        rel=${ifDefined(rel || undefined)}
        ?disabled=${disabled}
        ?full-width=${fullWidth}
      >
        ${label}
      </ark-button>
    `;
  }

  return html`
    <ark-button
      size=${size}
      type=${type}
      variant=${variant}
      ?disabled=${disabled}
      ?full-width=${fullWidth}
    >
      ${label}
    </ark-button>
  `;
};

const meta = {
  argTypes: {
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean", name: "full-width" },
    href: { control: "text" },
    label: { control: "text" },
    rel: { control: "text" },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    target: {
      control: "select",
      options: ["", "_blank", "_self", "_parent", "_top"],
    },
    type: {
      control: "inline-radio",
      options: ["button", "submit", "reset"],
    },
    variant: {
      control: "select",
      options: Object.values(ButtonVariant),
    },
  },
  args: {
    disabled: false,
    fullWidth: false,
    href: "",
    label: "View Project",
    rel: "",
    size: "md",
    target: "",
    type: "button",
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
    target: "_blank",
  },
} satisfies Story;

export const Disabled = {
  args: {
    disabled: true,
    label: "Unavailable",
  },
} satisfies Story;
