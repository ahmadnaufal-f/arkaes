import * as React from "react";
import { createComponent } from "@lit/react";
import {
  ArkDropdown as ArkDropdownElement,
  ArkDropdownOption as ArkDropdownOptionElement,
  DropdownListboxWidth,
  defineArkDropdown,
} from "@arkaes/ui";

defineArkDropdown();

export const ArkDropdown = createComponent({
  react: React,
  tagName: "ark-dropdown",
  elementClass: ArkDropdownElement,
  events: {
    onChange: "change",
  },
});

export const ArkDropdownOption = createComponent({
  react: React,
  tagName: "ark-dropdown-option",
  elementClass: ArkDropdownOptionElement,
});

export { DropdownListboxWidth };
