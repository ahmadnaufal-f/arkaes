import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { ArkButton, ButtonVariant } from "@arkaes/ui";

type ButtonArgs = {
  disabled: boolean;
  fullWidth: boolean;
  href: string;
  label: string;
  loading: boolean;
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
  loading,
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
        ?loading=${loading}
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
      ?loading=${loading}
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
    loading: { control: "boolean" },
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
    loading: false,
    rel: "",
    size: "md",
    target: "",
    type: "button",
    variant: ButtonVariant.Primary,
  },
  component: "ark-button",
  parameters: {
    docs: {
      description: {
        component: `
\`ark-button\` is a versatile button element that works both as a native button and as a link.

Provide an \`href\` to render as an anchor; omit it for a regular button. Use \`type\` to set button behavior (\`button\`, \`submit\`, \`reset\`). Choose from three variants for different visual emphasis and multiple sizes to fit your layout.
        `,
      },
    },
  },
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

export const LoadingPrimary = {
  args: {
    label: "Submitting",
    loading: true,
    variant: ButtonVariant.Primary,
  },
} satisfies Story;

export const LoadingSecondary = {
  args: {
    label: "Saving",
    loading: true,
    variant: ButtonVariant.Secondary,
  },
} satisfies Story;

export const LoadingGhost = {
  args: {
    label: "Sending",
    loading: true,
    variant: ButtonVariant.Ghost,
  },
} satisfies Story;

export const LoadingLink = {
  args: {
    href: "https://example.com",
    label: "Opening",
    loading: true,
    target: "_blank",
  },
} satisfies Story;

export const LoadingWithPromise: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Pass a \`Promise\` to \`loadingPromise\` to automatically enter and exit loading state.
The button disables itself while the promise is pending and recovers when it settles (resolve or reject).
Click the button below to simulate a 2-second async operation.
        `,
      },
    },
  },
  render: () => {
    const handleClick = (e: Event) => {
      const host = (e.currentTarget as ArkButton);
      host.loadingPromise = new Promise<void>((resolve) => setTimeout(resolve, 2000));
    };
    return html`<ark-button @click=${handleClick}>Click to load</ark-button>`;
  },
};
