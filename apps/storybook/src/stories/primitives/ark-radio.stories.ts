import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "@arkaes/ui/register/ark-radio";

type RadioArgs = {
  name: string;
  value: string;
  checked: boolean;
  disabled: boolean;
  label: string;
  hint: string;
  size: "sm" | "md" | "lg";
};

const renderRadio = ({ name, value, checked, disabled, label, hint, size }: RadioArgs) => html`
  <ark-radio
    name=${name}
    value=${value}
    ?checked=${checked}
    ?disabled=${disabled}
    label=${label}
    hint=${hint}
    size=${size}
  ></ark-radio>
`;

const meta = {
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    hint: { control: "text" },
    label: { control: "text" },
    name: { control: "text" },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    value: { control: "text" },
  },
  args: {
    checked: false,
    disabled: false,
    hint: "",
    label: "Frontend Engineering",
    name: "discipline",
    size: "md",
    value: "frontend",
  },
  component: "ark-radio",
  render: renderRadio,
  title: "Primitives/Ark Radio",
} satisfies Meta<RadioArgs>;

export default meta;
type Story = StoryObj<RadioArgs>;

export const Default = {} satisfies Story;

export const Checked = {
  args: {
    checked: true,
    label: "Frontend Engineering",
    value: "frontend",
  },
} satisfies Story;

export const WithHint = {
  args: {
    hint: "Interfaces, systems, and everything in between",
    label: "Frontend Engineering",
    value: "frontend",
  },
} satisfies Story;

export const Disabled = {
  args: {
    disabled: true,
    hint: "Not available for this project",
    label: "Brand Strategy",
    value: "brand",
  },
} satisfies Story;

export const Group = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <ark-radio
        name="service"
        value="design"
        label="Design System"
        hint="Tokens, components, and documentation"
        size="md"
      ></ark-radio>
      <ark-radio
        name="service"
        value="frontend"
        label="Frontend Engineering"
        hint="Performant, accessible interfaces"
        size="md"
        checked
      ></ark-radio>
      <ark-radio
        name="service"
        value="strategy"
        label="Brand Strategy"
        hint="Identity and visual language"
        size="md"
      ></ark-radio>
    </div>
  `,
} satisfies Story;

export const Sizes = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ark-radio name="size-demo" value="sm" label="Small" size="sm" checked></ark-radio>
      <ark-radio name="size-demo" value="md" label="Medium" size="md"></ark-radio>
      <ark-radio name="size-demo" value="lg" label="Large" size="lg"></ark-radio>
    </div>
  `,
} satisfies Story;
