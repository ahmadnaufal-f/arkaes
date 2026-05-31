import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "@arkaes/ui/register/ark-input";

type InputArgs = {
  type: string;
  name: string;
  value: string;
  placeholder: string;
  label: string;
  hint: string;
  error: string;
  disabled: boolean;
  invalid: boolean;
  required: boolean;
  size: "sm" | "md" | "lg";
};

const renderInput = ({
  type,
  name,
  value,
  placeholder,
  label,
  hint,
  error,
  disabled,
  invalid,
  required,
  size,
}: InputArgs) => html`
  <ark-input
    type=${type}
    name=${name}
    .value=${value}
    placeholder=${placeholder}
    label=${label}
    hint=${hint}
    error=${error}
    ?disabled=${disabled}
    ?invalid=${invalid}
    ?required=${required}
    size=${size}
  ></ark-input>
`;

const meta = {
  argTypes: {
    disabled: { control: "boolean" },
    error: { control: "text" },
    hint: { control: "text" },
    invalid: { control: "boolean" },
    label: { control: "text" },
    name: { control: "text" },
    placeholder: { control: "text" },
    required: { control: "boolean" },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    type: {
      control: "inline-radio",
      options: ["text", "password", "email", "url", "number"],
    },
    value: { control: "text" },
  },
  args: {
    disabled: false,
    error: "",
    hint: "",
    invalid: false,
    label: "Email address",
    name: "email",
    placeholder: "you@example.com",
    required: false,
    size: "md",
    type: "text",
    value: "",
  },
  component: "ark-input",
  render: renderInput,
  title: "Primitives/Ark Input",
} satisfies Meta<InputArgs>;

export default meta;
type Story = StoryObj<InputArgs>;

export const Default = {} satisfies Story;

export const WithLabel = {
  args: {
    label: "Full name",
    placeholder: "Ahmad Naufal",
    name: "name",
  },
} satisfies Story;

export const WithHint = {
  args: {
    label: "Username",
    hint: "Used across your public profile.",
    placeholder: "naufal",
    name: "username",
  },
} satisfies Story;

export const Invalid = {
  args: {
    label: "Email address",
    invalid: true,
    error: "Enter a valid email address.",
    value: "invalid-email",
    name: "email",
  },
  render: (args: InputArgs) => {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement & { invalid: boolean; value: string };
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target.value);
      target.invalid = !isValid;
    };
    return html`
      <ark-input
        type=${args.type}
        name=${args.name}
        .value=${args.value}
        placeholder=${args.placeholder}
        label=${args.label}
        hint=${args.hint}
        error=${args.error}
        ?disabled=${args.disabled}
        ?invalid=${args.invalid}
        ?required=${args.required}
        size=${args.size}
        @input=${handleInput}
      ></ark-input>
    `;
  },
} satisfies Story;

export const Disabled = {
  args: {
    label: "API key",
    value: "sk-••••••••••••••••",
    disabled: true,
    name: "apikey",
  },
} satisfies Story;

export const Password = {
  args: {
    type: "password",
    label: "Password",
    placeholder: "Enter your password",
    name: "password",
  },
} satisfies Story;

export const Email = {
  args: {
    type: "email",
    label: "Email address",
    placeholder: "you@example.com",
    name: "email",
  },
} satisfies Story;

export const Url = {
  args: {
    type: "url",
    label: "Portfolio URL",
    placeholder: "https://arkaes.dev",
    name: "url",
  },
} satisfies Story;

export const Number = {
  args: {
    type: "number",
    label: "Port number",
    placeholder: "3000",
    name: "port",
  },
} satisfies Story;

export const Required = {
  args: {
    label: "Email address",
    required: true,
    name: "email",
  },
} satisfies Story;

export const Sizes = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ark-input size="sm" label="Small input" placeholder="sm variant" name="input-sm"></ark-input>
      <ark-input size="md" label="Medium input" placeholder="md variant" name="input-md"></ark-input>
      <ark-input size="lg" label="Large input" placeholder="lg variant" name="input-lg"></ark-input>
    </div>
  `,
} satisfies Story;

export const States = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
      <ark-input label="Default state" placeholder="Type here..." name="input-default"></ark-input>
      <ark-input label="Invalid state" placeholder="Fix the value" invalid error="This value is incorrect." name="input-invalid"></ark-input>
      <ark-input label="Disabled state" placeholder="Cannot edit" disabled value="Disabled value" name="input-disabled"></ark-input>
    </div>
  `,
} satisfies Story;
