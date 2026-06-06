import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

type CardArgs = {
  interactive: boolean;
  truncateDescription: boolean;
  variant: "surface" | "project";
  width: "parent" | "sm" | "md" | "lg" | "xl" | "full";
};

const renderCard = ({ interactive, truncateDescription, variant, width }: CardArgs) => html`
  <ark-card
    ?interactive=${interactive}
    variant=${variant}
    width=${ifDefined(width === "parent" ? undefined : width)}
  >
    <ark-card-header>
      <ark-card-title>Quiet systems for sharp work</ark-card-title>
      <ark-card-description ?truncate=${truncateDescription}>
        A restrained surface for organizing modular interface layouts.
      </ark-card-description>
      <ark-card-action>
        <button
          type="button"
          style="
            background: transparent;
            border: none;
            color: var(--ark-color-text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--ark-space-1);
            transition: color var(--ark-duration-fast) var(--ark-ease-standard);
          "
          onmouseover="this.style.color='var(--ark-color-text)'"
          onmouseout="this.style.color='var(--ark-color-text-muted)'"
          aria-label="Information"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="8" r="6.25" />
            <line x1="8" y1="5.25" x2="8" y2="5.25" stroke-linecap="round" stroke-width="2" />
            <line x1="8" y1="7.75" x2="8" y2="11.25" stroke-linecap="round" />
          </svg>
        </button>
      </ark-card-action>
    </ark-card-header>
    <ark-card-content>
      <p style="margin: 0; line-height: 1.6; font-size: var(--ark-font-size-sm); color: var(--ark-color-text-muted);">
        Detailed performance diagnostics, build telemetry, and environment details are formatted clean.
      </p>
    </ark-card-content>
    <ark-card-footer>
      <ark-button variant="secondary" size="sm">Inspect Component</ark-button>
    </ark-card-footer>
  </ark-card>
`;

const meta = {
  argTypes: {
    interactive: { control: "boolean" },
    truncateDescription: {
      control: "boolean",
      name: "description truncate",
    },
    variant: {
      control: "inline-radio",
      options: ["surface", "project"],
    },
    width: {
      control: "select",
      options: ["parent", "sm", "md", "lg", "xl", "full"],
    },
  },
  args: {
    interactive: false,
    truncateDescription: false,
    variant: "surface",
    width: "parent",
  },
  component: "ark-card",
  render: renderCard,
  title: "Components/Ark Card",
} satisfies Meta<CardArgs>;

export default meta;
type Story = StoryObj<CardArgs>;

export const Default = {} satisfies Story;

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

export const HeaderOnly = {
  render: ({ interactive, truncateDescription, variant, width }: CardArgs) => html`
    <ark-card
      ?interactive=${interactive}
      variant=${variant}
      width=${ifDefined(width === "parent" ? undefined : width)}
    >
      <ark-card-header>
        <ark-card-title>Telemetry Console</ark-card-title>
        <ark-card-description ?truncate=${truncateDescription}>
          Real-time diagnostics and active engine variables.
        </ark-card-description>
      </ark-card-header>
    </ark-card>
  `,
} satisfies Story;
