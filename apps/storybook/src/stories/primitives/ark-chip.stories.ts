import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { ChipVariant } from "@arkaes/ui";

type ChipArgs = {
  label: string;
  size: "sm" | "md";
  variant: ChipVariant;
  href: string;
  isHovered: boolean;
};

const renderChip = ({ label, size, variant, href, isHovered }: ChipArgs) => html`
  <ark-chip
    size=${size}
    variant=${variant}
    href=${ifDefined(href || undefined)}
    ?data-is-hovered=${isHovered}
    >${label}</ark-chip
  >
`;

const meta = {
  argTypes: {
    href: { control: "text" },
    isHovered: { control: "boolean" },
    label: { control: "text" },
    size: {
      control: "inline-radio",
      options: ["sm", "md"],
    },
    variant: {
      control: "select",
      options: Object.values(ChipVariant),
    },
  },
  args: {
    href: "",
    isHovered: false,
    label: "TypeScript",
    size: "md",
    variant: ChipVariant.Default,
  },
  component: "ark-chip",
  parameters: {
    docs: {
      description: {
        component: `
\`ark-chip\` renders a pill-shaped tag for listing tech stacks, related work, categories, and similar collections.

Five variants cover the portfolio's needs: \`default\` (neutral), \`primary\` (blush emphasis), \`emerging\` (sage), \`accent\` (filled), and \`learning\` (dashed outline). Set \`href\` to render the chip as a link. The hover appearance can be driven programmatically via the \`isHovered\` property (reflected to \`data-is-hovered\`) in addition to native \`:hover\` — useful when a parent container wants every chip to highlight together.
        `,
      },
    },
  },
  render: renderChip,
  title: "Primitives/Ark Chip",
} satisfies Meta<ChipArgs>;

export default meta;
type Story = StoryObj<ChipArgs>;

export const Default = {} satisfies Story;

export const Primary = {
  args: {
    label: "Lit",
    variant: ChipVariant.Primary,
  },
} satisfies Story;

export const Emerging = {
  args: {
    label: "Rust",
    variant: ChipVariant.Emerging,
  },
} satisfies Story;

export const Accent = {
  args: {
    label: "Atlas Dashboard",
    variant: ChipVariant.Accent,
  },
} satisfies Story;

export const Learning = {
  args: {
    label: "WebGPU",
    variant: ChipVariant.Learning,
  },
} satisfies Story;

export const Link = {
  args: {
    label: "View project",
    href: "#",
    variant: ChipVariant.Accent,
  },
} satisfies Story;

export const AllVariants = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
      <ark-chip variant="default">Default</ark-chip>
      <ark-chip variant="primary">Primary</ark-chip>
      <ark-chip variant="emerging">Emerging</ark-chip>
      <ark-chip variant="accent">Accent</ark-chip>
      <ark-chip variant="learning">Learning</ark-chip>
      <ark-chip size="sm" variant="default">Small</ark-chip>
    </div>
  `,
} satisfies Story;
