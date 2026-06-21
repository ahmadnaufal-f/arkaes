import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkEmpty as ArkEmptyElement, defineArkEmpty } from "@arkaes/ui";

defineArkEmpty();

export const ArkEmpty = createComponent({
  react: React,
  tagName: "ark-empty",
  elementClass: ArkEmptyElement,
});
