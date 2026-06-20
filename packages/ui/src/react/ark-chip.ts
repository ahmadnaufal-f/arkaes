import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkChip as ArkChipElement, ChipVariant, defineArkChip } from "@arkaes/ui";

defineArkChip();

export const ArkChip = createComponent({
  react: React,
  tagName: "ark-chip",
  elementClass: ArkChipElement,
});

export { ChipVariant };
