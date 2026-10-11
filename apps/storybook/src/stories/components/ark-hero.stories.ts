import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta = {
  component: "ark-hero",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
\`ark-hero\` is a full-viewport landing section with responsive layout and motion that respects reduced-motion preferences.

Accepts content via slots: \`eyebrow\` for a chip row, \`title\` and \`subtitle\` for messaging (including emphasis), \`actions\` for button groups, and \`visual\` for imagery or graphics. CSS custom properties control height, padding, visual sizing, and panel background.

Pointer parallax runs only above 900px on fine-pointer hover devices when reduced motion is not requested. Set the boolean \`disable-parallax\` attribute when a custom visual supplies its own motion. The built-in visual fallback keeps its scroll scatter; custom visuals are not scattered. All hero entrance and scroll animations stop for reduced-motion users.

The headline holds each line unbroken and renders \`<em>\` as a filled band. Below 1400px that band bleeds out to the hero's own inline edge; above it, where the page gutter becomes open margin, it stays self-contained.

For simple cases the \`chips\` attribute takes a JSON string array and renders every entry as a \`primary\` \`ark-chip\`. Mixing variants needs the \`eyebrow\` slot.
        `,
      },
    },
  },
  render: () => html`
    <ark-hero
      disable-parallax
      style="
        --ark-hero-content-padding: clamp(2rem, 6vw, 6rem);
        --ark-hero-min-height: 100vh;
        --ark-hero-padding-top: 0;
        --ark-hero-visual-width: 100%;
        --ark-hero-visual-min-height: 30rem;
        --ark-hero-visual-background: var(--ark-color-accent-soft);
      "
    >
      <ark-chip slot="eyebrow" variant="primary">Frontend Engineer</ark-chip>
      <ark-chip slot="eyebrow" variant="primary">UI Systems Architect</ark-chip>
      <ark-chip slot="eyebrow" variant="emerging">Applied AI Interfaces</ark-chip>
      <h1 slot="title">Compose the message your product needs.</h1>
      <p slot="subtitle">
        Each content region accepts application-owned markup while the hero
        retains its responsive layout and motion behavior.
      </p>
      <div slot="actions" style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <ark-button>Primary action</ark-button>
        <ark-button variant="link">Secondary action</ark-button>
      </div>
      <div
        slot="visual"
        style="
          align-items: end;
          background: linear-gradient(145deg, var(--ark-color-blush-light), var(--ark-color-sage-light));
          border-radius: var(--ark-radius-md);
          box-sizing: border-box;
          color: var(--ark-color-text);
          display: flex;
          font-family: var(--ark-font-display);
          font-size: clamp(2rem, 5vw, 5rem);
          height: min(60vh, 34rem);
          padding: clamp(2rem, 5vw, 4rem);
          width: 100%;
        "
      >
        Custom visual
      </div>
    </ark-hero>
  `,
  title: "Components/Ark Hero",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Slotted = {} satisfies Story;

export const AttributeFallbacks = {
  render: () => html`
    <ark-hero
      chips='["Frontend Engineer", "UI Systems Architect"]'
      title="Frontend engineering"
      title-emphasis="with clarity."
      subtitle="The original attribute API remains available as default slot content."
      primary-label="View case studies"
      ghost-label="Explore the approach"
      style="
        --ark-hero-content-padding: clamp(2rem, 6vw, 6rem);
        --ark-hero-min-height: 100vh;
        --ark-hero-padding-top: 0;
        --ark-hero-visual-min-height: 420px;
      "
    ></ark-hero>
  `,
} satisfies Story;
