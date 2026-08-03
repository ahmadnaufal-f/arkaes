import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type ScrollTopArgs = {
  label: string;
};

const renderScrollTop = ({ label }: ScrollTopArgs) => html`
  <div style="display: flex; align-items: center; gap: 12px; padding: 24px;">
    <ark-scroll-top label=${label} .atTop=${false}></ark-scroll-top>
  </div>
`;

// `at-top` is the collapsed state, so the story frames it against a marker to
// make the zero width visible rather than looking like an empty canvas.
const renderCollapsed = ({ label }: ScrollTopArgs) => html`
  <div style="display: flex; align-items: center; gap: 12px; padding: 24px;">
    <span style="font-family: var(--ark-font-mono); font-size: 0.75rem;">before</span>
    <ark-scroll-top label=${label} .atTop=${true}></ark-scroll-top>
    <span style="font-family: var(--ark-font-mono); font-size: 0.75rem;">after</span>
  </div>
`;

const meta = {
  args: {
    label: "Back to top",
  },
  component: "ark-scroll-top",
  parameters: {
    docs: {
      description: {
        component: `
A round back-to-top button that collapses out of the layout while the page is already at the top. It tracks the page scroll itself and reflects \`at-top\` while \`scrollY <= 0\`.

Collapsing is a width animation rather than a fade, which is what lets it sit in \`ark-floating-action-container\`: it also subtracts half of \`--ark-floating-action-gap\` from each inline margin while collapsed, so the actions beside it slide back to true centre instead of sitting off by half a gap.

Inside the Storybook preview the element stands down from reading the page scroll (the canvas never scrolls), so these stories set \`atTop\` directly to show each state.
        `,
      },
    },
  },
  render: renderScrollTop,
  title: "Components/Ark Scroll Top",
} satisfies Meta<ScrollTopArgs>;

export default meta;
type Story = StoryObj<ScrollTopArgs>;

export const Default = {} satisfies Story;

export const Collapsed = {
  render: renderCollapsed,
} satisfies Story;
