import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkCheckbox as ArkCheckboxElement, defineArkCheckbox } from "@arkaes/ui";

defineArkCheckbox();

export const ArkCheckbox = createComponent({
  react: React,
  tagName: "ark-checkbox",
  elementClass: ArkCheckboxElement,
  events: {
    onInput: "input",
    onChange: "change",
  },
});
