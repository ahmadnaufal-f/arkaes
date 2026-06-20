import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

type ListboxWidth = "fit-trigger" | "fit-content" | "min-content" | "max-content";

interface DropdownArgs {
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  maxVisible: number;
  listboxWidth: ListboxWidth;
}

const meta = {
  component: "ark-dropdown",
  title: "Primitives/Ark Dropdown",
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    value: { control: "text" },
    disabled: { control: "boolean" },
    maxVisible: { control: { type: "number", min: 1 } },
    listboxWidth: {
      control: "inline-radio",
      options: ["fit-trigger", "fit-content", "min-content", "max-content"],
    },
  },
  args: {
    label: "Filter by category",
    placeholder: "All work",
    value: "",
    disabled: false,
    maxVisible: 6,
    listboxWidth: "fit-trigger",
  },
  parameters: {
    docs: {
      description: {
        component: `
\`ark-dropdown\` is a native HTML \`select\` wrapper that presents options in a visually consistent combobox interface.

Add \`ark-dropdown-option\` elements as children to define choices. Provide a \`label\` for the field and \`placeholder\` text for the initial selection prompt. Use \`disabled\` to prevent interaction.

\`max-visible\` caps how many options are shown before the list scrolls (defaults to 6). \`listbox-width\` controls how the popover is sized: \`fit-trigger\` (default) matches the trigger, while \`fit-content\`, \`min-content\`, and \`max-content\` size to the options.
        `,
      },
    },
  },
  render: ({ label, placeholder, value, disabled, maxVisible, listboxWidth }) => html`
    <ark-dropdown
      label=${label}
      placeholder=${placeholder}
      value=${value}
      ?disabled=${disabled}
      max-visible=${maxVisible}
      listbox-width=${listboxWidth}
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
    maxVisible: 4,
  },
  parameters: {
    docs: {
      description: {
        story:
          "With more options than `max-visible` (here 4), the listbox scrolls. Long labels are truncated so the popover stays the same width as the trigger.",
      },
    },
  },
  render: ({ label, placeholder, value, disabled, maxVisible, listboxWidth }) => html`
    <ark-dropdown
      label=${label}
      placeholder=${placeholder}
      value=${value}
      ?disabled=${disabled}
      max-visible=${maxVisible}
      listbox-width=${listboxWidth}
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
      <ark-dropdown-option value="accessibility">Accessibility Engineering</ark-dropdown-option>
      <ark-dropdown-option value="dx-tooling">Developer Experience & Tooling</ark-dropdown-option>
    </ark-dropdown>
  `,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
