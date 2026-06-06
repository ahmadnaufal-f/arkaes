import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta = {
  component: "ark-hero",
  parameters: {
    layout: "fullscreen",
  },
  render: () => html`
    <ark-hero
      style="
        --ark-hero-content-padding: clamp(2rem, 6vw, 6rem);
        --ark-hero-min-height: 100vh;
        --ark-hero-padding-top: 0;
      "
    >
      <ark-badge slot="eyebrow" variant="eyebrow">Slot-driven hero</ark-badge>
      <h1 slot="title">Compose the message your product needs.</h1>
      <p slot="subtitle">
        Each content region accepts application-owned markup while the hero
        retains its responsive layout and motion behavior.
      </p>
      <div slot="actions" style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <ark-button>Primary action</ark-button>
        <ark-button variant="ghost">Secondary action</ark-button>
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
          width: min(38vw, 32rem);
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
      eyebrow="Frontend Engineer & UI Systems Architect"
      title="Frontend engineering"
      title-emphasis="with clarity."
      subtitle="The original attribute API remains available as default slot content."
      primary-label="View case studies"
      ghost-label="Explore the approach"
      style="
        --ark-hero-content-padding: clamp(2rem, 6vw, 6rem);
        --ark-hero-min-height: 100vh;
        --ark-hero-padding-top: 0;
      "
    ></ark-hero>
  `,
} satisfies Story;
