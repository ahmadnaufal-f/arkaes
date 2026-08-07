import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { MarkdownHeadingStyle } from "@arkaes/ui";
import { html } from "lit";

const ARTICLE_SOURCE = `# Designing in the open

A portfolio is a **long-form** argument, not a gallery. It needs prose that reads
well at length, and code that looks like it belongs.

## What the system provides

Tokens, primitives, and a small set of compositions. Everything else is content.

### Reading measure

Body copy is capped at \`--ark-measure-md\` so a line never outruns the eye.

> The point of a design system is that the next page is cheaper than the last.

1. Define the token
2. Use the token
3. Never reach for a hex code

\`\`\`ts
const heading = renderMarkdown(body, { headings: "article" });
\`\`\`

| Layer | Purpose |
| --- | --- |
| tokens | values |
| primitives | leaf elements |
| patterns | page compositions |
`;

const SECTION_SOURCE = `Case study bodies sit inside an accordion, so their own titles are already
carried by the panel above them.

### Approach

The subheading above is a \`###\` in the source and an \`<h4>\` in the DOM — one
level below the panel title, and styled to sit close to body copy.

• Audit the existing surface
• Extract the shared vocabulary
• Migrate one page at a time

→ ±87% shared | [Virtual Home](/case-studies/virtual-home) | Tech lead for the monorepo rewrite
→ 3 sites | [Arkaes](/) | One token pipeline behind every surface
`;

const FLAT_SOURCE = `## Short answer

Arkaes is built with Lit and Astro [1].

The design tokens live in their own package so every surface reads from one
source [2, 3].

- Tokens are CSS custom properties
- Components are standard custom elements
`;

type MarkdownArgs = {
  features: string;
  headingStyle: MarkdownHeadingStyle;
  source: string;
};

const renderMarkdownStory = ({ features, headingStyle, source }: MarkdownArgs) => html`
  <div style="max-width: 720px; padding: var(--ark-space-8);">
    <ark-markdown
      heading-style=${headingStyle}
      features=${features}
      .source=${source}
    ></ark-markdown>
  </div>
`;

const LEVELS_SOURCE = "# Level one\n\n## Level two\n\n### Level three\n\nBody copy follows.";

const renderHeadingStyleColumn = (style: MarkdownHeadingStyle) => html`
  <section>
    <p class="ark-label">${style}</p>
    <ark-markdown heading-style=${style} .source=${LEVELS_SOURCE}></ark-markdown>
  </section>
`;

const renderHeadingStyleGrid = () => html`
  <div style="display: grid; gap: var(--ark-space-8); padding: var(--ark-space-8);">
    ${Object.values(MarkdownHeadingStyle).map(renderHeadingStyleColumn)}
  </div>
`;

const meta = {
  argTypes: {
    features: { control: "text" },
    headingStyle: {
      control: "inline-radio",
      options: Object.values(MarkdownHeadingStyle),
    },
    source: { control: "text" },
  },
  args: {
    features: "",
    headingStyle: MarkdownHeadingStyle.Article,
    source: ARTICLE_SOURCE,
  },
  component: "ark-markdown",
  parameters: {
    docs: {
      description: {
        component:
          "Renders markdown as arkaes prose. `heading-style` carries the " +
          "difference between the site's long-form treatments: `article` for " +
          "blog bodies, `section` for case studies (every level shifted down " +
          "one), `flat` for chat replies. Renders into the light DOM, so a " +
          "server-rendered body needs no client JavaScript — set `source` only " +
          "when rendering on the client.",
      },
    },
    layout: "fullscreen",
  },
  render: renderMarkdownStory,
  title: "Components/Ark Markdown",
} satisfies Meta<MarkdownArgs>;

export default meta;
type Story = StoryObj<MarkdownArgs>;

export const Article = {
  parameters: {
    docs: {
      description: {
        story: "Blog treatment: real `h1`–`h6` with slug ids, display face, stepped sizes.",
      },
    },
  },
} satisfies Story;

export const Section = {
  args: {
    features: "proof-cards,glyph-bullets",
    headingStyle: MarkdownHeadingStyle.Section,
    source: SECTION_SOURCE,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Case-study treatment: every heading level shifted down one and styled " +
          "as a quiet sans subheading, plus the proof-card and glyph-bullet syntaxes.",
      },
    },
  },
} satisfies Story;

export const Flat = {
  args: {
    features: "citations",
    headingStyle: MarkdownHeadingStyle.Flat,
    source: FLAT_SOURCE,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Chat treatment: every heading level pinned to one tag, with citation badges.",
      },
    },
  },
} satisfies Story;

export const AllHeadingStyles = {
  parameters: {
    docs: {
      description: {
        story: "The same source under each heading style, side by side.",
      },
    },
  },
  render: () => renderHeadingStyleGrid(),
} satisfies Story;
