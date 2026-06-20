import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkSpinner as ArkSpinnerElement, SpinnerVariant, defineArkSpinner } from "@arkaes/ui";

defineArkSpinner();

export const ArkSpinner = createComponent({
  react: React,
  tagName: "ark-spinner",
  elementClass: ArkSpinnerElement,
});

export { SpinnerVariant };
