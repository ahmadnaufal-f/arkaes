import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkRadioGroup as ArkRadioGroupElement, defineArkRadioGroup } from "@arkaes/ui";

defineArkRadioGroup();

export const ArkRadioGroup = createComponent({
  react: React,
  tagName: "ark-radio-group",
  elementClass: ArkRadioGroupElement,
  events: {
    onInput: "input",
    onChange: "change",
  },
});
