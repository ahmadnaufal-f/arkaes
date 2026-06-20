import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type PageHeaderArgs = {
  eyebrow: string;
  heading: string;
  lead: string;
};

const renderHeader = ({ eyebrow, heading, lead }: PageHeaderArgs) => html`
  <ark-page-header
    eyebrow=${eyebrow}
    heading=${heading}
    lead=${lead}
    style="display: block; max-width: 60rem;"
  ></ark-page-header>
`;

const meta = {
  args: {
    eyebrow: "Projects",
    heading: "Selected work, by context and expertise.",
    lead: "Professional engagements and side projects, filterable in one place.",
  },
  component: "ark-page-header",
  render: renderHeader,
  title: "Patterns/Ark Page Header",
} satisfies Meta<PageHeaderArgs>;

export default meta;
type Story = StoryObj<PageHeaderArgs>;

export const Default = {} satisfies Story;

export const TitleOnly = {
  args: {
    eyebrow: "About",
    heading: "Frontend engineering with a product eye.",
    lead: "",
  },
} satisfies Story;

export const SlottedContent = {
  render: ({ eyebrow, lead }: PageHeaderArgs) => html`
    <ark-page-header style="display: block; max-width: 60rem;">
      <ark-badge slot="eyebrow" variant="eyebrow">${eyebrow}</ark-badge>
      <h1 slot="title">
        Engineering <em>structure</em> for product clarity.
      </h1>
      <p slot="lead">${lead}</p>
      <dl
        style="
          border-block: 1px solid var(--ark-color-border);
          display: grid;
          gap: var(--ark-space-4);
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
          margin: 0;
          padding-block: var(--ark-space-5);
        "
      >
        <div>
          <dt class="ark-label">Role</dt>
          <dd style="margin: var(--ark-space-2) 0 0;">Frontend Engineer</dd>
        </div>
        <div>
          <dt class="ark-label">Stack</dt>
          <dd style="margin: var(--ark-space-2) 0 0;">Lit, Astro, TypeScript</dd>
        </div>
      </dl>
    </ark-page-header>
  `,
} satisfies Story;
