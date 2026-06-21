import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkRadio as ArkRadioElement, defineArkRadio } from "@arkaes/ui";

defineArkRadio();

export const ArkRadio = createComponent({
  react: React,
  tagName: "ark-radio",
  elementClass: ArkRadioElement,
  events: {
    onInput: "input",
    onChange: "change",
    onSelect: "ark-radio-select",
  },
});
