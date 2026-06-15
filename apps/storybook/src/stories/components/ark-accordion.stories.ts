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

const meta = {
  component: "ark-accordion",
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
