import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "@arkaes/ui";

type CheckboxArgs = {
  name: string;
  value: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  label: string;
  hint: string;
  size: "sm" | "md" | "lg";
};

const renderCheckbox = ({ name, value, checked, indeterminate, disabled, label, hint, size }: CheckboxArgs) => html`
  <ark-checkbox
    name=${name}
    value=${value}
    ?checked=${checked}
    ?indeterminate=${indeterminate}
    ?disabled=${disabled}
    label=${label}
    hint=${hint}
    size=${size}
  ></ark-checkbox>
`;

const meta = {
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    hint: { control: "text" },
    indeterminate: { control: "boolean" },
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
    indeterminate: false,
    label: "Include analytics",
    name: "analytics",
    size: "md",
    value: "analytics",
  },
  component: "ark-checkbox",
  render: renderCheckbox,
  title: "Primitives/Ark Checkbox",
} satisfies Meta<CheckboxArgs>;

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Default = {} satisfies Story;

export const Checked = {
  args: {
    checked: true,
    label: "Include analytics",
    value: "analytics",
  },
} satisfies Story;

export const Indeterminate = {
  args: {
    indeterminate: true,
    label: "Parent preferences",
    hint: "Some child items are selected",
    value: "parent",
  },
} satisfies Story;

export const WithHint = {
  args: {
    hint: "Required for usage tracking",
    label: "Include analytics",
    value: "analytics",
  },
} satisfies Story;

export const Disabled = {
  args: {
    disabled: true,
    checked: true,
    hint: "Not available in this plan",
    label: "Advanced features",
    value: "advanced",
  },
} satisfies Story;

export const Group = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <ark-checkbox
        value="design"
        label="Design System"
        hint="Tokens, components, and documentation"
        size="md"
        checked
      ></ark-checkbox>
      <ark-checkbox
        value="frontend"
        label="Frontend Engineering"
        hint="Performant, accessible interfaces"
        size="md"
      ></ark-checkbox>
      <ark-checkbox
        value="strategy"
        label="Brand Strategy"
        hint="Identity and visual language"
        size="md"
        checked
      ></ark-checkbox>
      <ark-checkbox
        value="infrastructure"
        label="Infrastructure"
        hint="Deployment and DevOps"
        size="md"
      ></ark-checkbox>
    </div>
  `,
} satisfies Story;

export const Sizes = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ark-checkbox value="sm" label="Small checkbox" size="sm" checked></ark-checkbox>
      <ark-checkbox value="md" label="Medium checkbox" size="md" checked></ark-checkbox>
      <ark-checkbox value="lg" label="Large checkbox" size="lg" checked></ark-checkbox>
    </div>
  `,
} satisfies Story;

export const States = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <ark-checkbox value="unchecked" label="Unchecked" size="md"></ark-checkbox>
      <ark-checkbox value="checked" label="Checked" size="md" checked></ark-checkbox>
      <ark-checkbox value="indeterminate" label="Indeterminate" size="md" indeterminate></ark-checkbox>
      <ark-checkbox value="disabled-unchecked" label="Disabled (unchecked)" size="md" disabled></ark-checkbox>
      <ark-checkbox value="disabled-checked" label="Disabled (checked)" size="md" disabled checked></ark-checkbox>
    </div>
  `,
} satisfies Story;
