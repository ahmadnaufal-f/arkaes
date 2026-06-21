import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkInput as ArkInputElement, InputType, defineArkInput } from "@arkaes/ui";

defineArkInput();

export const ArkInput = createComponent({
  react: React,
  tagName: "ark-input",
  elementClass: ArkInputElement,
  events: {
    onInput: "input",
    onChange: "change",
  },
});

export { InputType };
