import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type ProjectHeaderArgs = {
  eyebrow: string;
  heading: string;
};

const placeholderVisual = html`
  <div
    slot="visual"
    style="
      aspect-ratio: 4 / 3;
      background: linear-gradient(145deg, var(--ark-color-blush-light), var(--ark-color-sage-light));
      width: 100%;
    "
  ></div>
`;

const renderHeader = ({ eyebrow, heading }: ProjectHeaderArgs) => html`
  <ark-project-header eyebrow=${eyebrow} heading=${heading}>
    ${placeholderVisual}
    <ark-chip slot="tag">Lit</ark-chip>
    <ark-chip slot="tag">Astro</ark-chip>
    <ark-chip slot="tag">TypeScript</ark-chip>
  </ark-project-header>
`;

const meta = {
  args: {
    eyebrow: "Case Study",
    heading: "A performance-focused interface system.",
  },
  component: "ark-project-header",
  render: renderHeader,
  title: "Patterns/Ark Project Header",
} satisfies Meta<ProjectHeaderArgs>;

export default meta;
type Story = StoryObj<ProjectHeaderArgs>;

export const Default = {} satisfies Story;

export const WithoutTags = {
  render: ({ eyebrow, heading }: ProjectHeaderArgs) => html`
    <ark-project-header eyebrow=${eyebrow} heading=${heading}>
      ${placeholderVisual}
    </ark-project-header>
  `,
} satisfies Story;
