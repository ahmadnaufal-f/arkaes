import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { expect, userEvent, waitFor } from "storybook/test";

type DialogRootElement = HTMLElement & {
  open: boolean;
};

const getShadowButton = (element: Element) => {
  const button = element.shadowRoot?.querySelector("button");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Expected a shadow-root button");
  }
  return button;
};

const getDialogElements = (canvasElement: HTMLElement) => {
  const root = canvasElement.querySelector("ark-dialog-root");
  const trigger = canvasElement.querySelector("ark-dialog-trigger ark-button");
  if (!(root instanceof HTMLElement) || !(trigger instanceof HTMLElement)) {
    throw new Error("Expected dialog root and trigger");
  }

  return {
    root: root as DialogRootElement,
    triggerButton: getShadowButton(trigger),
  };
};

const getOpenPortalContainer = () => {
  const content = document.querySelector(
    "[data-ark-dialog-portal] ark-dialog-content[open]",
  );
  const portal = content?.closest("[data-ark-dialog-portal]");
  if (!(portal instanceof HTMLElement)) {
    throw new Error("Expected open dialog portal container");
  }
  return portal;
};

const closeDialog = (event: Event) => {
  event.currentTarget?.dispatchEvent(
    new CustomEvent("ark-dialog:close", {
      bubbles: true,
      composed: true,
    }),
  );
};

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
            <ark-button variant="ghost" size="sm" @click=${closeDialog}>
              Cancel
            </ark-button>
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
          <ark-button variant="ghost" size="sm" @click=${closeDialog}>
            Cancel
          </ark-button>
          <ark-button variant="primary" size="sm">Confirm Action</ark-button>
        </div>
      </ark-dialog-content>
    </ark-dialog-root>
  </div>
`;

const meta = {
  component: "ark-dialog-root",
  parameters: {
    docs: {
      description: {
        component: `
\`ark-dialog\` is an accessible modal component with focus trapping, keyboard support, and optional portal rendering.

Wrap content in \`ark-dialog-root\`, \`ark-dialog-trigger\`, and \`ark-dialog-content\`. Use \`ark-dialog-portal\` to render content into the document body, escaping parent stacking contexts. Include \`ark-dialog-overlay\`, \`ark-dialog-title\`, \`ark-dialog-description\`, and \`ark-dialog-close\` for complete accessibility and user control.
        `,
      },
    },
  },
  render: renderDialogWithPortal,
  title: "Components/Ark Dialog",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default = {} satisfies Story;

export const WithoutPortal = {
  render: renderDialogWithoutPortal,
  play: async ({ canvasElement }) => {
    const { root, triggerButton } = getDialogElements(canvasElement);
    try {
      await userEvent.click(triggerButton);

      const overlay = canvasElement.querySelector("ark-dialog-overlay");
      if (!(overlay instanceof HTMLElement)) {
        throw new Error("Expected inline dialog overlay");
      }

      await userEvent.click(overlay);
      await expect(root.open).toBe(false);
      await expect(triggerButton).toHaveFocus();
    } finally {
      root.open = false;
    }
  },
} satisfies Story;

export const KeyboardAndFocus = {
  play: async ({ canvasElement }) => {
    const { root, triggerButton } = getDialogElements(canvasElement);
    try {
      await userEvent.click(triggerButton);

      const portal = getOpenPortalContainer();
      const close = portal.querySelector("ark-dialog-close");
      const buttons = portal.querySelectorAll("ark-button");
      if (!(close instanceof HTMLElement) || buttons.length < 2) {
        throw new Error("Expected dialog controls");
      }

      const closeButton = getShadowButton(close);
      const lastControl = buttons.item(buttons.length - 1);
      if (!(lastControl instanceof HTMLElement)) {
        throw new Error("Expected final dialog control");
      }
      const lastButton = getShadowButton(lastControl);

      await waitFor(() => expect(closeButton).toHaveFocus());

      lastButton.focus();
      await userEvent.tab();
      await expect(closeButton).toHaveFocus();

      await userEvent.tab({ shift: true });
      await expect(lastButton).toHaveFocus();

      await userEvent.keyboard("{Escape}");
      await expect(root.open).toBe(false);
      await expect(triggerButton).toHaveFocus();

      await userEvent.click(triggerButton);
      const overlay = getOpenPortalContainer().querySelector(
        "ark-dialog-overlay",
      );
      if (!(overlay instanceof HTMLElement)) {
        throw new Error("Expected portal dialog overlay");
      }
      await userEvent.click(overlay);
      await expect(root.open).toBe(false);
      await expect(triggerButton).toHaveFocus();
    } finally {
      root.open = false;
    }
  },
} satisfies Story;

export const PortalLifecycle = {
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector("ark-dialog-root");
    const portal = canvasElement.querySelector("ark-dialog-portal");
    if (!(root instanceof HTMLElement) || !(portal instanceof HTMLElement)) {
      throw new Error("Expected dialog root and portal");
    }

    portal.remove();
    await expect(portal.querySelector("ark-dialog-content")).not.toBeNull();
    await expect(document.querySelector("[data-ark-dialog-portal]")).toBeNull();

    root.appendChild(portal);
    await waitFor(() => {
      expect(
        document.querySelector("[data-ark-dialog-portal] ark-dialog-content"),
      ).not.toBeNull();
    });
  },
} satisfies Story;
