import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkToggle as ArkToggleElement, defineArkToggle } from "@arkaes/ui";

defineArkToggle();

export const ArkToggle = createComponent({
  react: React,
  tagName: "ark-toggle",
  elementClass: ArkToggleElement,
  events: {
    onInput: "input",
    onChange: "change",
  },
});
