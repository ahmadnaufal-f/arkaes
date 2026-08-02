import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { ArkButton, ButtonTone, ButtonVariant } from "@arkaes/ui";

type ButtonArgs = {
  disabled: boolean;
  fullWidth: boolean;
  href: string;
  label: string;
  loading: boolean;
  rel: string;
  size: "sm" | "md" | "lg";
  target: "" | "_blank" | "_self" | "_parent" | "_top";
  tone: ButtonTone;
  type: "button" | "submit" | "reset";
  variant: ButtonVariant;
};

const variantRoles: Record<ButtonVariant, string> = {
  [ButtonVariant.Primary]: "The one loud action per view",
  [ButtonVariant.Secondary]: "Supporting action",
  [ButtonVariant.Outline]: "Alternate path",
  [ButtonVariant.Ghost]: "Quiet utility",
  [ButtonVariant.Link]: "Inline navigation",
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
  tone,
  type,
  variant,
}: ButtonArgs) => {
  if (href) {
    return html`
      <ark-button
        href=${href}
        size=${size}
        tone=${tone}
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
      tone=${tone}
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
    tone: {
      control: "inline-radio",
      options: Object.values(ButtonTone),
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
    tone: ButtonTone.Neutral,
    type: "button",
    variant: ButtonVariant.Primary,
  },
  component: "ark-button",
  parameters: {
    docs: {
      description: {
        component: `
\`ark-button\` is the action control of the system, spanning a five-step emphasis scale:
\`primary\` (the one loud action per view), \`secondary\` (supporting), \`outline\` (alternate paths),
\`ghost\` (quiet utility), and \`link\` (inline serif navigation).

Provide an \`href\` to render as an anchor; omit it for a regular button. Use \`type\` to set button
behavior (\`button\`, \`submit\`, \`reset\`). Sizes \`sm\`/\`md\`/\`lg\` scale the box for the four
button-shaped variants and only the font size for \`link\`. Set \`tone="danger"\` on any variant for
destructive actions, and use the \`prefix\`/\`suffix\` slots for directional glyphs.
        `,
      },
    },
  },
  render: renderButton,
  title: "Primitives/Ark Button",
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Playground = {} satisfies Story;

export const EmphasisScale: Story = {
  parameters: {
    docs: {
      description: {
        story: "The five variants form a deliberate emphasis ladder, from the single loud action down to inline navigation.",
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: var(--ark-space-6); align-items: flex-start;">
      ${Object.values(ButtonVariant).map(
        (variant) => html`
          <div style="display: flex; align-items: center; gap: var(--ark-space-6);">
            <ark-button variant=${variant} style="min-width: 12rem;">${variant}</ark-button>
            <span
              style="font-family: var(--ark-font-mono); font-size: var(--ark-font-size-xs); color: var(--ark-color-text-subtle); text-transform: uppercase; letter-spacing: var(--ark-letter-spacing-mono);"
            >
              ${variantRoles[variant]}
            </span>
          </div>
        `,
      )}
    </div>
  `,
};

export const Primary = {
  args: {
    label: "View all case studies",
  },
} satisfies Story;

export const Secondary = {
  args: {
    label: "Browse all projects",
    variant: ButtonVariant.Secondary,
  },
} satisfies Story;

export const Outline = {
  args: {
    label: "See other options",
    variant: ButtonVariant.Outline,
  },
} satisfies Story;

export const Ghost = {
  args: {
    label: "Dismiss",
    variant: ButtonVariant.Ghost,
  },
} satisfies Story;

export const Link = {
  args: {
    label: "View case study",
    variant: ButtonVariant.Link,
  },
} satisfies Story;

export const SizeMatrix: Story = {
  parameters: {
    docs: {
      description: {
        story: "Sizes scale padding and min-height for the button-shaped variants. The `link` variant only scales its font size — it never grows a box.",
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: var(--ark-space-6); align-items: flex-start;">
      ${Object.values(ButtonVariant).map(
        (variant) => html`
          <div style="display: flex; align-items: center; gap: var(--ark-space-4);">
            ${(["sm", "md", "lg"] as const).map(
              (size) => html`
                <ark-button variant=${variant} size=${size}>${variant} ${size}</ark-button>
              `,
            )}
          </div>
        `,
      )}
    </div>
  `,
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story: "Directional glyphs go in the `prefix`/`suffix` slots; they nudge outward on hover.",
      },
    },
  },
  render: () => html`
    <div style="display: flex; align-items: center; gap: var(--ark-space-6); flex-wrap: wrap;">
      <ark-button>
        Read all posts
        <span slot="suffix" aria-hidden="true">&rarr;</span>
      </ark-button>
      <ark-button variant="secondary">
        Browse all projects
        <span slot="suffix" aria-hidden="true">&rarr;</span>
      </ark-button>
      <ark-button variant="link">
        <span slot="prefix" aria-hidden="true">&larr;</span>
        Back to home page
      </ark-button>
    </div>
  `,
};

export const DangerTone: Story = {
  parameters: {
    docs: {
      description: {
        story: "`tone=\"danger\"` composes with every emphasis level, so destructive actions can be loud or quiet.",
      },
    },
  },
  render: () => html`
    <div style="display: flex; align-items: center; gap: var(--ark-space-6); flex-wrap: wrap;">
      ${Object.values(ButtonVariant).map(
        (variant) => html`
          <ark-button variant=${variant} tone="danger">Delete draft</ark-button>
        `,
      )}
    </div>
  `,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story: "Disabled and loading states across the scale. Loading keeps full opacity and shows the built-in spinner.",
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: var(--ark-space-6); align-items: flex-start;">
      <div style="display: flex; align-items: center; gap: var(--ark-space-4); flex-wrap: wrap;">
        ${Object.values(ButtonVariant).map(
          (variant) => html`<ark-button variant=${variant} disabled>Unavailable</ark-button>`,
        )}
      </div>
      <div style="display: flex; align-items: center; gap: var(--ark-space-4); flex-wrap: wrap;">
        ${Object.values(ButtonVariant).map(
          (variant) => html`<ark-button variant=${variant} loading>Saving</ark-button>`,
        )}
      </div>
    </div>
  `,
};

export const AsLink = {
  args: {
    href: "https://example.com",
    label: "Open Link",
    target: "_blank",
  },
} satisfies Story;

export const FullWidth = {
  args: {
    fullWidth: true,
    label: "Send message",
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
