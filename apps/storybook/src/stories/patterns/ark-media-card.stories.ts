import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { ArkMediaCard } from "@arkaes/ui";

type MediaCardArgs = {
  category: string;
  datetime: string;
  href: string;
  loading: boolean;
  summary: string;
  title: string;
  variant: "featured" | "compact";
};

const renderCard = ({
  category,
  datetime,
  href,
  loading,
  summary,
  title,
  variant,
}: MediaCardArgs) => html`
  <ark-media-card
    category=${category}
    datetime=${datetime}
    href=${href}
    summary=${summary}
    title=${title}
    variant=${variant}
    ?loading=${loading}
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
    loading: { control: "boolean" },
    variant: {
      control: "inline-radio",
      options: ["featured", "compact"],
    },
  },
  args: {
    category: "Case Study",
    datetime: "",
    href: "#case-study",
    loading: false,
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

Provide a \`title\`, \`category\`, \`summary\`, and \`href\` to make the entire card clickable. Slot custom media in the \`media\` slot for hero imagery and badges via the \`tag\` slot. Dated entries can add \`datetime\` (an ISO string or \`YYYY-MM-DD\`); the card derives the display label from it, formatted in UTC, and renders it beside the category. Choose \`featured\` for full-height showcase layouts or \`compact\` for dense grid presentations.

Because the card navigates, it carries the same loading affordance as \`ark-button\`: set \`loading\` or assign a \`loadingPromise\` and the corner arrow becomes a spinner while the next page loads.
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
    datetime: "2026-07-25T00:00:00.000Z",
    summary:
      "What a legal training session changed about how I collect data in my own app.",
    title: "Why I Added a Privacy Notice to My App",
    variant: "compact",
  },
} satisfies Story;

export const Loading = {
  args: {
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "While navigating, the corner arrow becomes a spinner, the copy dims, and the hover affordances freeze so the card reads as in-flight. Further clicks are blocked until it settles.",
      },
    },
  },
} satisfies Story;

export const LoadingWithPromise: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Assign a \`Promise\` to \`loadingPromise\` and the card shows the spinner until it settles —
the same async API as \`ark-button\`. Click the card below to simulate a 2-second page fetch.
        `,
      },
    },
  },
  render: (args) => {
    const handleClick = (e: Event) => {
      const card = e.currentTarget as ArkMediaCard;
      card.loadingPromise = new Promise<void>((resolve) =>
        setTimeout(resolve, 2000),
      );
    };
    return html`
      <ark-media-card
        category=${args.category}
        href="#"
        summary=${args.summary}
        title=${args.title}
        variant="compact"
        style="width: min(100%, 34rem);"
        @click=${handleClick}
      >
        <ark-chip slot="tag">Click me</ark-chip>
      </ark-media-card>
    `;
  },
};
