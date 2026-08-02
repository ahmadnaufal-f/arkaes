import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const SAMPLE_ITEMS = [
  {
    heading: "What is a design system?",
    body: "A design system is a collection of reusable components, guided by clear standards, that can be assembled to build any number of applications. It bridges the gap between design and engineering by providing a shared language and a set of building blocks.",
  },
  {
    heading: "How does the accordion animation work?",
    body: "The animation uses the CSS grid trick: animating grid-template-rows from 0fr to 1fr. This lets the browser interpolate the row height without needing a known pixel value, so content of any size collapses and expands smoothly.",
  },
  {
    heading: "When should I use single vs. multiple mode?",
    body: "Use single mode (type=\"single\" on ark-accordion) when only one section should be visible at a time — common for FAQs where answers are mutually exclusive. Use multiple mode (the default) when users might need to compare content across several open sections simultaneously.",
  },
];

const renderWithAccordion = (type: "single" | "multiple") => html`
  <div style="max-width: 640px; padding: 2rem;">
    <ark-accordion type=${type}>
      ${SAMPLE_ITEMS.map(
        ({ heading, body }) => html`
          <ark-accordion-item heading=${heading}>
            <p style="color: var(--ark-color-text-muted); font-size: var(--ark-text-md); line-height: var(--ark-leading-relaxed); margin: 0;">
              ${body}
            </p>
          </ark-accordion-item>
        `,
      )}
    </ark-accordion>
  </div>
`;

const renderStandaloneItems = () => html`
  <div style="max-width: 640px; padding: 2rem; border-top: 1px solid var(--ark-color-border);">
    ${SAMPLE_ITEMS.map(
      ({ heading, body }) => html`
        <ark-accordion-item heading=${heading}>
          <p style="color: var(--ark-color-text-muted); font-size: var(--ark-text-md); line-height: var(--ark-leading-relaxed); margin: 0;">
            ${body}
          </p>
        </ark-accordion-item>
      `,
    )}
  </div>
`;

// Long bodies plus generous padding above/below make the story taller than the
// preview frame, so there is somewhere to scroll from and the auto-scroll is
// actually visible.
const renderAutoScroll = () => html`
  <div style="max-width: 640px; padding: 60vh 2rem;">
    <p style="color: var(--ark-color-text-muted); font-size: var(--ark-text-md); margin: 0 0 2rem;">
      Scroll down and expand a section — its trigger travels to the top of the frame.
    </p>
    <ark-accordion type="single" auto-scroll-when-expanded>
      ${SAMPLE_ITEMS.map(
        ({ heading, body }) => html`
          <ark-accordion-item heading=${heading}>
            <p style="color: var(--ark-color-text-muted); font-size: var(--ark-text-md); line-height: var(--ark-leading-relaxed); margin: 0;">
              ${body} ${body}
            </p>
          </ark-accordion-item>
        `,
      )}
    </ark-accordion>
  </div>
`;

const meta = {
  component: "ark-accordion",
  parameters: {
    docs: {
      description: {
        component: `
\`ark-accordion\` manages collapsible content sections with smooth grid-based animations.

Use \`type="single"\` to allow only one section open at a time, or omit it (default: multiple) to let users compare content across expanded sections. Wrap \`ark-accordion-item\` children and provide a \`heading\` for each. Accordion items can also stand alone for custom layouts.

Add \`auto-scroll-when-expanded\` — on the root, or on a single item — to scroll an opening item's trigger to the top of the viewport.
        `,
      },
    },
  },
  title: "Components/Ark Accordion",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const WithAccordionRoot = {
  render: () => renderWithAccordion("multiple"),
} satisfies Story;

export const SingleMode = {
  render: () => renderWithAccordion("single"),
} satisfies Story;

export const StandaloneItems = {
  render: renderStandaloneItems,
} satisfies Story;

export const AutoScrollWhenExpanded = {
  render: renderAutoScroll,
  parameters: {
    docs: {
      description: {
        story:
          "`auto-scroll-when-expanded` scrolls the opening item's trigger to the top of the viewport, so a long panel opens into view instead of below the fold. It is skipped when the trigger already sits at the top, and never runs for an item rendered `open` on load. Set `--accordion-scroll-margin` to leave room for a sticky header.",
      },
    },
  },
} satisfies Story;
