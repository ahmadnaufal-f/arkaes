import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { toast, type ToastPosition } from "@arkaes/ui";
import "@arkaes/ui/register/ark-toast";

const VARIANTS = ["default", "success", "error", "warning", "info", "loading"] as const;

type ToastArgs = {
  position: ToastPosition;
};

const meta = {
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
  },
  args: {
    position: "bottom-center",
  },
  component: "ark-toaster",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
\`ark-toast\` is a transient notification system supporting both declarative and imperative usage.

Mount a single \`ark-toaster\` container (typically once per page) and control \`position\`. Show toasts declaratively by toggling the \`open\` property on \`ark-toast\` elements, or imperatively using the \`toast()\` function. Support multiple variants (default, success, error, warning, info, loading) and auto-dismiss with \`duration\`.
        `,
      },
    },
  },
  title: "Components/Ark Toast",
} satisfies Meta<ToastArgs>;

export default meta;
type Story = StoryObj<ToastArgs>;

/**
 * Persistent toasts (`duration="0"`) pinned at the default bottom-center region
 * so the resting visual treatment can be inspected in both backgrounds.
 */
export const Default = {
  render: () => html`
    <ark-toaster>
      <ark-toast variant="default" heading="Heads up" open duration="0">
        A neutral notification with a short supporting message.
      </ark-toast>
      <ark-toast variant="success" heading="Saved" open duration="0">
        Your changes have been published.
      </ark-toast>
    </ark-toaster>
  `,
} satisfies Story;

/** Every variant, including the spinner-driven loading state. */
export const Variants = {
  render: () => html`
    <ark-toaster>
      ${VARIANTS.map(
    (variant) => html`
          <ark-toast variant=${variant} heading=${variant} open duration="0">
            The ${variant} variant of ark-toast.
          </ark-toast>
        `,
  )}
    </ark-toaster>
  `,
} satisfies Story;

/** Use the `position` control to move the region to any corner or edge-center. */
export const Positions = {
  render: ({ position }) => html`
    <ark-toaster position=${position}>
      <ark-toast variant="info" heading=${position} open duration="0">
        Toasts render at the ${position} region.
      </ark-toast>
    </ark-toaster>
  `,
} satisfies Story;

/**
 * Declarative usage — author an `<ark-toast>` in markup and flip its `open`
 * property. Demonstrates the enter animation, auto-dismiss, the close button,
 * and the bubbling `ark-toast:dismiss` event.
 */
export const Declarative = {
  render: () => {
    const show = (event: Event) => {
      const region = (event.currentTarget as HTMLElement).closest(".demo");
      const toastEl = region?.querySelector("ark-toast");
      if (toastEl) {
        toastEl.open = true;
      }
    };

    const onDismiss = () => {
      console.log("ark-toast:dismiss");
    };

    return html`
      <div class="demo" style="padding: 3rem;">
        <ark-button @click=${show}>Show toast</ark-button>
        <ark-toaster>
          <ark-toast
            variant="success"
            heading="Saved"
            duration="4000"
            @ark-toast:dismiss=${onDismiss}
          >
            Your changes have been published.
          </ark-toast>
        </ark-toaster>
      </div>
    `;
  },
} satisfies Story;

/**
 * Imperative usage — call `toast()` from anywhere to spawn transient toasts
 * into the single `<ark-toaster>` mounted on the page.
 */
export const Imperative = {
  render: () => html`
    <div
      style="display: flex; flex-wrap: wrap; gap: var(--ark-space-3); padding: 3rem;"
    >
      <ark-button @click=${() => toast("A neutral message")}>
        Default
      </ark-button>
      <ark-button
        variant="secondary"
        @click=${() => toast.success("Changes published", { heading: "Saved" })}
      >
        Success
      </ark-button>
      <ark-button
        variant="ghost"
        @click=${() => toast.error("Upload failed", { heading: "Error" })}
      >
        Error
      </ark-button>
      <ark-button
        variant="ghost"
        @click=${() => toast.loading("Working…", { duration: 0 })}
      >
        Loading
      </ark-button>
      <ark-button variant="ghost" @click=${() => toast.dismiss()}>
        Dismiss all
      </ark-button>
      <ark-toaster></ark-toaster>
    </div>
  `,
} satisfies Story;
