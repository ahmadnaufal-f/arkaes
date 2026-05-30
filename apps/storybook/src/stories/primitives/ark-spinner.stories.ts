import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { SpinnerVariant } from "@arkaes/ui";
import "@arkaes/ui";

type SpinnerArgs = {
  variant: SpinnerVariant;
  size: "sm" | "md" | "lg" | "xl";
  thickness?: number;
};

const renderSpinner = ({ variant, size, thickness }: SpinnerArgs) => html`
  <ark-spinner
    variant=${variant}
    size=${size}
    thickness=${ifDefined(thickness)}
  ></ark-spinner>
`;

const meta = {
  argTypes: {
    variant: {
      control: "inline-radio",
      options: Object.values(SpinnerVariant),
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "xl"],
    },
    thickness: {
      control: "number",
    },
  },
  args: {
    variant: SpinnerVariant.Arc,
    size: "md",
  },
  component: "ark-spinner",
  render: renderSpinner,
  title: "Primitives/Ark Spinner",
} satisfies Meta<SpinnerArgs>;

export default meta;
type Story = StoryObj<SpinnerArgs>;

export const Default = {} satisfies Story;

export const Variants = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: center;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px;">arc</span>
        <ark-spinner variant="arc"></ark-spinner>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px;">segment</span>
        <ark-spinner variant="segment"></ark-spinner>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px;">orbital</span>
        <ark-spinner variant="orbital"></ark-spinner>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px;">dash</span>
        <ark-spinner variant="dash"></ark-spinner>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px;">dots</span>
        <ark-spinner variant="dots"></ark-spinner>
      </div>
    </div>
  `,
} satisfies Story;

export const Sizes = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ark-spinner size="sm"></ark-spinner>
      <ark-spinner size="md"></ark-spinner>
      <ark-spinner size="lg"></ark-spinner>
      <ark-spinner size="xl"></ark-spinner>
    </div>
  `,
} satisfies Story;

export const ColorOverride = {
  render: () => html`
    <div style="display: flex; gap: 24px; align-items: center;">
      <ark-spinner style="--spinner-color: #f0ede8;"></ark-spinner>
      <ark-spinner style="--spinner-color: #c9614c;"></ark-spinner>
      <ark-spinner style="--spinner-color: #6aab7c;"></ark-spinner>
    </div>
  `,
} satisfies Story;
