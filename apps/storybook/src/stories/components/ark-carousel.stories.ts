import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type CarouselArgs = {
  breakpoint: number;
  hideControls: boolean;
  hideCounter: boolean;
  itemWidth: string;
  label: string;
};

const SLIDES = [
  { title: "Virtual Home", meta: "Cross-platform product" },
  { title: "Virtual Home TV", meta: "Living-room interface" },
  { title: "Milk Tracker", meta: "Mobile utility" },
  { title: "Air Care", meta: "Connected hardware" },
];

const slide = ({ title, meta }: (typeof SLIDES)[number]) => html`
  <article
    style="
      background: var(--ark-color-surface-muted);
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-md);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: 220px;
      padding: var(--ark-space-6);
    "
  >
    <div
      style="
        color: var(--ark-color-text-subtle);
        font-family: var(--ark-font-mono);
        font-size: var(--ark-text-xs);
        letter-spacing: var(--ark-letter-spacing-mono);
      "
    >
      ${meta}
    </div>
    <h3
      style="
        color: var(--ark-color-text);
        font-family: var(--ark-font-display);
        font-size: var(--ark-text-xl);
        font-weight: var(--ark-weight-thin);
        margin: var(--ark-space-2) 0 0;
      "
    >
      ${title}
    </h3>
  </article>
`;

const renderCarousel = ({
  breakpoint,
  hideControls,
  hideCounter,
  itemWidth,
  label,
}: CarouselArgs) => html`
  <div style="padding: var(--ark-space-8) 0;">
    <style>
      /* Grid mode: the host is the layout container, because the element's
         track is display: contents while the carousel is inactive. */
      .demo-carousel {
        display: grid;
        gap: var(--ark-space-4);
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      /* Carousel mode: hand layout back to the element's own track. */
      .demo-carousel[active] {
        display: block;
        --ark-carousel-item-width: ${itemWidth};
      }
    </style>
    <ark-carousel
      class="demo-carousel"
      breakpoint=${breakpoint}
      label=${label}
      prev-label="Previous project"
      next-label="Next project"
      ?hide-controls=${hideControls}
      ?hide-counter=${hideCounter}
    >
      ${SLIDES.map(slide)}
    </ark-carousel>
  </div>
`;

const meta = {
  component: "ark-carousel",
  args: {
    breakpoint: 0,
    hideControls: false,
    hideCounter: false,
    itemWidth: "calc(100% - var(--ark-space-16))",
    label: "Selected projects",
  },
  argTypes: {
    breakpoint: {
      control: { type: "number" },
      description:
        "Viewport width (px) at or below which the element behaves as a carousel. 0 means always.",
    },
    hideControls: { control: { type: "boolean" } },
    hideCounter: { control: { type: "boolean" } },
    itemWidth: { control: { type: "text" } },
    label: { control: { type: "text" } },
  },
  parameters: {
    docs: {
      description: {
        component: `
\`ark-carousel\` turns its children into a scroll-snapped strip with arrow navigation, and can be limited to small screens.

Set \`breakpoint\` to a pixel width and the carousel only engages at or below it. Above that width the internal track renders as \`display: contents\`, so the slides are laid out by whatever grid or flex rules sit on the host element — the layout below is a four-column grid on desktop and a swipeable strip on narrow viewports, from one piece of markup. Because that desktop layout is plain CSS on light DOM, it is also correct in server-rendered HTML before the element upgrades.

Resize the preview across the breakpoint to see it switch. The reflected \`active\` attribute lets CSS branch on the current mode, and \`ark-carousel:change\` reports \`{ index, total }\` as the position moves.
        `,
      },
    },
  },
  title: "Components/Ark Carousel",
} satisfies Meta<CarouselArgs>;

export default meta;
type Story = StoryObj<CarouselArgs>;

/** No breakpoint: a carousel at every width. */
export const Always = {
  render: renderCarousel,
} satisfies Story;

/** Grid above 900px, carousel at or below it. */
export const SmallScreensOnly = {
  args: { breakpoint: 900 },
  render: renderCarousel,
} satisfies Story;

/** Swipe-only: no arrows, no counter. */
export const WithoutControls = {
  args: { hideControls: true },
  render: renderCarousel,
} satisfies Story;

/** Arrows without the position readout. */
export const WithoutCounter = {
  args: { hideCounter: true },
  render: renderCarousel,
} satisfies Story;

/** Narrower slides, so several sit in view at once. */
export const PeekingSlides = {
  args: { itemWidth: "min(60%, 280px)" },
  render: renderCarousel,
} satisfies Story;
