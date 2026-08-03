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
  parameters: {
    docs: {
      description: {
        component: `
Sticky case-study / project header. It pins flush with the top of the viewport and lets the fixed site nav float over it, so the room for that chrome is held as start padding inside the hero (\`--ark-project-header-chrome-clearance\`, default \`76px\`). There is no nav in this canvas, so that clearance reads as empty space above the eyebrow.

Scrolling 60px past the header collapses it: the eyebrow and tags fold away and the visual shrinks.

Once pinned it also travels with the site chrome: while \`ark-navigation\` has its immersive pills tucked away mid-scroll it publishes \`--ark-nav-chrome-away: 1\`, and the hero rides up by exactly the clearance it was holding for them, giving the band back to the reader until scrolling stops. Neither state is reachable in this canvas, which does not scroll and has no nav in it.
        `,
      },
    },
  },
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
