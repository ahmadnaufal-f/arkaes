import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "@arkaes/ui";

type ToggleArgs = {
  name: string;
  value: string;
  checked: boolean;
  disabled: boolean;
  label: string;
  hint: string;
  size: "sm" | "md" | "lg";
  labelPosition: "left" | "right";
};

const renderToggle = ({ name, value, checked, disabled, label, hint, size, labelPosition }: ToggleArgs) => html`
  <ark-toggle
    name=${name}
    value=${value}
    ?checked=${checked}
    ?disabled=${disabled}
    label=${label}
    hint=${hint}
    size=${size}
    label-position=${labelPosition}
  ></ark-toggle>
`;

const meta = {
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    hint: { control: "text" },
    label: { control: "text" },
    labelPosition: {
      control: "inline-radio",
      options: ["left", "right"],
    },
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
    label: "Enable notifications",
    labelPosition: "right",
    name: "notifications",
    size: "md",
    value: "on",
  },
  component: "ark-toggle",
  render: renderToggle,
  title: "Primitives/Ark Toggle",
} satisfies Meta<ToggleArgs>;

export default meta;
type Story = StoryObj<ToggleArgs>;

export const Default = {} satisfies Story;

export const Checked = {
  args: {
    checked: true,
    label: "Enable notifications",
    value: "on",
  },
} satisfies Story;

export const WithHint = {
  args: {
    hint: "Receive updates on new projects",
    label: "Enable notifications",
    value: "on",
  },
} satisfies Story;

export const Disabled = {
  args: {
    disabled: true,
    hint: "Not available in your plan",
    label: "Advanced analytics",
    value: "on",
  },
} satisfies Story;

export const DisabledChecked = {
  args: {
    checked: true,
    disabled: true,
    hint: "Locked for this workspace",
    label: "Two-factor authentication",
    value: "on",
  },
} satisfies Story;

export const LabelPositionLeft = {
  args: {
    label: "Dark mode",
    labelPosition: "left",
    value: "on",
  },
} satisfies Story;

export const Sizes = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ark-toggle value="sm" label="Small toggle" size="sm" checked></ark-toggle>
      <ark-toggle value="md" label="Medium toggle" size="md" checked></ark-toggle>
      <ark-toggle value="lg" label="Large toggle" size="lg" checked></ark-toggle>
    </div>
  `,
} satisfies Story;

export const States = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <ark-toggle value="unchecked" label="Unchecked" size="md"></ark-toggle>
      <ark-toggle value="checked" label="Checked" size="md" checked></ark-toggle>
      <ark-toggle value="with-hint" label="With hint" hint="Secondary text" size="md" checked></ark-toggle>
      <ark-toggle value="disabled-off" label="Disabled (off)" size="md" disabled></ark-toggle>
      <ark-toggle value="disabled-on" label="Disabled (on)" size="md" disabled checked></ark-toggle>
    </div>
  `,
} satisfies Story;

export const Settings = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <ark-toggle
        name="settings"
        value="analytics"
        label="Analytics"
        hint="Help us improve with usage data"
        size="md"
        checked
      ></ark-toggle>
      <ark-toggle
        name="settings"
        value="updates"
        label="Email updates"
        hint="Receive news and announcements"
        size="md"
      ></ark-toggle>
      <ark-toggle
        name="settings"
        value="marketing"
        label="Marketing communications"
        hint="Promotional offers and new features"
        size="md"
      ></ark-toggle>
    </div>
  `,
} satisfies Story;
