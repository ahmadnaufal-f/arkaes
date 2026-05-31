import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const renderDialogWithPortal = () => html`
  <div style="display: flex; justify-content: center; padding: 4rem;">
    <ark-dialog-root>
      <ark-dialog-trigger>
        <ark-button variant="primary">Open Dialog (Portal)</ark-button>
      </ark-dialog-trigger>
      <ark-dialog-portal>
        <ark-dialog-overlay></ark-dialog-overlay>
        <ark-dialog-content>
          <ark-dialog-close absolute></ark-dialog-close>
          <ark-dialog-title>Dialog with Portal</ark-dialog-title>
          <ark-dialog-description>
            When using the portal (ark-dialog-portal), the dialog content is appended directly to the document body, escaping any parent stacking contexts or styles.
          </ark-dialog-description>

          <div style="display: flex; gap: var(--ark-space-3); justify-content: flex-end; margin-top: var(--ark-space-6);">
            <ark-button variant="ghost" size="sm">Cancel</ark-button>
            <ark-button variant="primary" size="sm">Confirm Action</ark-button>
          </div>
        </ark-dialog-content>
      </ark-dialog-portal>
    </ark-dialog-root>
  </div>
`;

const renderDialogWithoutPortal = () => html`
  <div style="display: flex; justify-content: center; padding: 4rem;">
    <ark-dialog-root>
      <ark-dialog-trigger>
        <ark-button variant="primary">Open Dialog (No Portal)</ark-button>
      </ark-dialog-trigger>
      <ark-dialog-overlay></ark-dialog-overlay>
      <ark-dialog-content>
        <ark-dialog-close absolute></ark-dialog-close>
        <ark-dialog-title>Dialog without Portal</ark-dialog-title>
        <ark-dialog-description>
          Without using the portal, the dialog content renders inline under its real parent element in the DOM tree.
        </ark-dialog-description>

        <div style="display: flex; gap: var(--ark-space-3); justify-content: flex-end; margin-top: var(--ark-space-6);">
          <ark-button variant="ghost" size="sm">Cancel</ark-button>
          <ark-button variant="primary" size="sm">Confirm Action</ark-button>
        </div>
      </ark-dialog-content>
    </ark-dialog-root>
  </div>
`;

const meta = {
  component: "ark-dialog-root",
  render: renderDialogWithPortal,
  title: "Components/Ark Dialog",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default = {} satisfies Story;

export const WithoutPortal = {
  render: renderDialogWithoutPortal,
} satisfies Story;
