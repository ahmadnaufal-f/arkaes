import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkButton as ArkButtonElement, ButtonVariant, defineArkButton } from "@arkaes/ui";

defineArkButton();

export const ArkButton = createComponent({
  react: React,
  tagName: "ark-button",
  elementClass: ArkButtonElement,
});

export { ButtonVariant };
