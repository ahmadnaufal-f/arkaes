import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "@arkaes/ui/register/ark-radio";

const meta = {
  component: "ark-radio",
  title: "Primitives/Ark Radio",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const WithRadioGroup = {
  name: "With ark-radio-group",
  render: () => html`
    <ark-radio-group
      name="service"
      value="frontend"
      label="Choose a service"
      hint="Recommended usage with grouped semantics and keyboard navigation"
    >
      <ark-radio
        value="design"
        label="Design System"
        hint="Tokens, components, and documentation"
        size="md"
      ></ark-radio>
      <ark-radio
        value="frontend"
        label="Frontend Engineering"
        hint="Performant, accessible interfaces"
        size="md"
      ></ark-radio>
      <ark-radio
        value="strategy"
        label="Brand Strategy"
        hint="Identity and visual language"
        size="md"
      ></ark-radio>
    </ark-radio-group>
  `,
} satisfies Story;

export const WithoutRadioGroup = {
  name: "Without ark-radio-group",
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <ark-radio
        name="service-standalone"
        value="design"
        label="Design System"
        hint="Standalone fallback with matching name"
        size="md"
      ></ark-radio>
      <ark-radio
        name="service-standalone"
        value="frontend"
        label="Frontend Engineering"
        hint="Checked radio participates in form submission"
        size="md"
        checked
      ></ark-radio>
      <ark-radio
        name="service-standalone"
        value="strategy"
        label="Brand Strategy"
        hint="Peer unchecking still works without a group"
        size="md"
      ></ark-radio>
    </div>
  `,
} satisfies Story;
