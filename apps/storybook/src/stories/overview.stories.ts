import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => html`
    <main
      style="
        background: var(--ark-color-background);
        color: var(--ark-color-text);
        display: grid;
        gap: 2rem;
        min-height: 100vh;
        padding: clamp(2rem, 5vw, 5rem);
      "
    >
      <section style="display: grid; gap: 1rem; max-width: 52rem;">
        <ark-badge>Arkaes UI</ark-badge>
        <h1 style="font: var(--ark-font-display); margin: 0;">Custom components</h1>
        <p
          style="
            color: var(--ark-color-text-muted);
            font: var(--ark-font-body-lg);
            margin: 0;
            max-width: 42rem;
          "
        >
          Storybook loads the shared token CSS and imports the UI package once, so each
          custom element renders with the same registration and theme surface used by the apps.
        </p>
      </section>

      <section
        style="
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
        "
      >
        <ark-card interactive>
          <div style="display: grid; gap: 1rem; padding: 1.5rem;">
            <ark-badge variant="pill">Button</ark-badge>
            <ark-button>View Project</ark-button>
            <ark-button variant="secondary" size="sm">Read Notes</ark-button>
          </div>
        </ark-card>
        <ark-card interactive>
          <div style="display: grid; gap: 1rem; padding: 1.5rem;">
            <ark-badge variant="eyebrow">Badge</ark-badge>
            <ark-badge variant="soft">Interface System</ark-badge>
            <ark-badge variant="contact">Contact</ark-badge>
          </div>
        </ark-card>
        <ark-card interactive>
          <div style="display: grid; gap: 1rem; padding: 1.5rem;">
            <ark-badge variant="pill">Card</ark-badge>
            <h2 style="font: var(--ark-font-heading-sm); margin: 0;">Surface container</h2>
            <p style="color: var(--ark-color-text-muted); line-height: 1.7; margin: 0;">
              Slots accept real content, including other custom elements.
            </p>
          </div>
        </ark-card>
      </section>
    </main>
  `,
  title: "Components/Overview",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllComponents = {} satisfies Story;
