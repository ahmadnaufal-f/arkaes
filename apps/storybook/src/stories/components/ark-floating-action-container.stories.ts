import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

// The dock is fixed to the bottom of the viewport, so the canvas needs a frame
// with something behind it for the actions to read as floating.
const dockFrame = (content: ReturnType<typeof html>) => html`
  <div
    style="position: relative; height: 260px; overflow: hidden; background:
      repeating-linear-gradient(135deg, var(--ark-color-surface-soft) 0 18px,
      var(--ark-color-bg) 18px 36px);"
  >
    ${content}
  </div>
`;

const placeholderAction = (label: string) => html`
  <button
    type="button"
    style="align-items: center; background: var(--ark-color-surface); border:
      1px solid var(--ark-color-border); border-radius: var(--ark-radius-full);
      box-shadow: var(--ark-shadow-md); color: var(--ark-color-text); display:
      inline-flex; font-family: var(--ark-font-mono); font-size:
      var(--ark-font-size-sm); height: 3.25rem; padding-inline: 1.25rem;"
  >
    ${label}
  </button>
`;

const renderDefault = () => dockFrame(html`
  <ark-floating-action-container scrolled style="position: absolute;">
    <ark-scroll-top .atTop=${false}></ark-scroll-top>
    ${placeholderAction("Chat with Arkhe")}
  </ark-floating-action-container>
`);

// At the top of a page there is nothing for the back-to-top button to do, so it
// collapses and the remaining action sits dead centre.
const renderAtTop = () => dockFrame(html`
  <ark-floating-action-container style="position: absolute;">
    <ark-scroll-top .atTop=${true}></ark-scroll-top>
    ${placeholderAction("Chat with Arkhe")}
  </ark-floating-action-container>
`);

const renderActionsHidden = () => dockFrame(html`
  <ark-floating-action-container scrolled actions-hidden style="position: absolute;">
    <ark-scroll-top .atTop=${false}></ark-scroll-top>
    ${placeholderAction("Chat with Arkhe")}
  </ark-floating-action-container>
`);

const meta = {
  component: "ark-floating-action-container",
  parameters: {
    docs: {
      description: {
        component: `
\`ark-floating-action-container\` docks a centred row of floating actions to the bottom edge of the viewport. It is the bottom-edge counterpart to \`ark-navigation\`'s immersive header and follows the same scroll rule: the actions step out of the way while the page is moving and settle back in once it stops.

The container sets \`scrolled\` and \`actions-hidden\` on itself from the page scroll; the stories below pin them, and pin \`position: absolute\` so the dock sits in the canvas frame rather than at the bottom of the docs page.

Hiding is suspended while a slotted action carries \`open\` — an expanded \`ark-chatbot\` panel, say — or while the keyboard focus ring is inside the dock.
        `,
      },
    },
  },
  render: renderDefault,
  title: "Components/Ark Floating Action Container",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default = {} satisfies Story;

export const AtTop = {
  render: renderAtTop,
} satisfies Story;

export const ActionsHidden = {
  render: renderActionsHidden,
} satisfies Story;
