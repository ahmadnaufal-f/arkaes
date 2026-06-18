import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

interface DropdownArgs {
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
}

const meta = {
  component: "ark-dropdown",
  title: "Primitives/Ark Dropdown",
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    value: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Filter by category",
    placeholder: "All work",
    value: "",
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        component: `
\`ark-dropdown\` is a native HTML \`select\` wrapper that presents options in a visually consistent combobox interface.

Add \`ark-dropdown-option\` elements as children to define choices. Provide a \`label\` for the field and \`placeholder\` text for the initial selection prompt. Use \`disabled\` to prevent interaction.
        `,
      },
    },
  },
  render: ({ label, placeholder, value, disabled }) => html`
    <ark-dropdown
      label=${label}
      placeholder=${placeholder}
      value=${value}
      ?disabled=${disabled}
    >
      <ark-dropdown-option value="">All work</ark-dropdown-option>
      <ark-dropdown-option value="professional-work">Professional Work</ark-dropdown-option>
      <ark-dropdown-option value="side-project">Side Projects</ark-dropdown-option>
    </ark-dropdown>
  `,
} satisfies Meta<DropdownArgs>;

export default meta;

type Story = StoryObj<DropdownArgs>;

export const Default: Story = {};

export const Preselected: Story = {
  args: {
    value: "side-project",
  },
};

export const ManyOptions: Story = {
  args: {
    label: "Filter by expertise",
    placeholder: "All expertise",
  },
  render: ({ label, placeholder, value, disabled }) => html`
    <ark-dropdown
      label=${label}
      placeholder=${placeholder}
      value=${value}
      ?disabled=${disabled}
    >
      <ark-dropdown-option value="">All expertise</ark-dropdown-option>
      <ark-dropdown-option value="frontend-architecture">
        Frontend Architecture & UI Systems
      </ark-dropdown-option>
      <ark-dropdown-option value="design-systems">Design Systems Engineering</ark-dropdown-option>
      <ark-dropdown-option value="performance">
        Performance-focused Frontend Engineering
      </ark-dropdown-option>
      <ark-dropdown-option value="cross-platform">
        Cross-platform Product Development
      </ark-dropdown-option>
    </ark-dropdown>
  `,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
