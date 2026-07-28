import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type MediaCardArgs = {
  category: string;
  date: string;
  datetime: string;
  href: string;
  summary: string;
  title: string;
  variant: "featured" | "compact";
};

const renderCard = ({
  category,
  date,
  datetime,
  href,
  summary,
  title,
  variant,
}: MediaCardArgs) => html`
  <ark-media-card
    category=${category}
    date=${date}
    datetime=${datetime}
    href=${href}
    summary=${summary}
    title=${title}
    variant=${variant}
    style="width: min(100%, 34rem);"
  >
    <div
      slot="media"
      style="
        align-items: center;
        background: linear-gradient(145deg, var(--ark-color-blush-light), var(--ark-color-sage-light));
        box-sizing: border-box;
        color: var(--ark-color-text);
        display: flex;
        font-family: var(--ark-font-display);
        font-size: 3rem;
        height: 22rem;
        justify-content: center;
      "
    >
      &AElig;
    </div>
    <ark-chip slot="tag">Performance</ark-chip>
    <ark-chip slot="tag">UI Architecture</ark-chip>
  </ark-media-card>
`;

const meta = {
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["featured", "compact"],
    },
  },
  args: {
    category: "Case Study",
    date: "",
    datetime: "",
    href: "#case-study",
    summary:
      "A focused case study about improving interface performance and maintainability.",
    title: "Interface Performance System",
    variant: "featured",
  },
  component: "ark-media-card",
  parameters: {
    docs: {
      description: {
        component: `
\`ark-media-card\` presents a linked entry — a case study, project, or blog post — with a title, metadata, and a custom media slot.

Provide a \`title\`, \`category\`, \`summary\`, and \`href\` to make the entire card clickable. Slot custom media in the \`media\` slot for hero imagery and badges via the \`tag\` slot. Dated entries can add \`date\` (the label) and \`datetime\` (the machine-readable value), which render beside the category. Choose \`featured\` for full-height showcase layouts or \`compact\` for dense grid presentations.
        `,
      },
    },
  },
  render: renderCard,
  title: "Patterns/Ark Media Card",
} satisfies Meta<MediaCardArgs>;

export default meta;
type Story = StoryObj<MediaCardArgs>;

export const Featured = {
  args: {
    category: "",
    summary: "",
  },
} satisfies Story;

export const Compact = {
  args: {
    variant: "compact",
  },
} satisfies Story;

export const Dated = {
  args: {
    category: "Career",
    date: "July 25, 2026",
    datetime: "2026-07-25T00:00:00.000Z",
    summary:
      "What a legal training session changed about how I collect data in my own app.",
    title: "Why I Added a Privacy Notice to My App",
    variant: "compact",
  },
} satisfies Story;
