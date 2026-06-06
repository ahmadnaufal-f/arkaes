import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type CaseStudyCardArgs = {
  category: string;
  href: string;
  summary: string;
  title: string;
  variant: "featured" | "compact";
};

const renderCard = ({
  category,
  href,
  summary,
  title,
  variant,
}: CaseStudyCardArgs) => html`
  <ark-case-study-card
    category=${category}
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
    <ark-badge slot="tag" variant="pill">Performance</ark-badge>
    <ark-badge slot="tag" variant="pill">UI Architecture</ark-badge>
  </ark-case-study-card>
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
    href: "#case-study",
    summary:
      "A focused case study about improving interface performance and maintainability.",
    title: "Interface Performance System",
    variant: "featured",
  },
  component: "ark-case-study-card",
  render: renderCard,
  title: "Patterns/Ark Case Study Card",
} satisfies Meta<CaseStudyCardArgs>;

export default meta;
type Story = StoryObj<CaseStudyCardArgs>;

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
