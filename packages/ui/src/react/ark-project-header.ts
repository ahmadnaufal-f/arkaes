import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkProjectHeader as ArkProjectHeaderElement, defineArkProjectHeader } from "@arkaes/ui";

defineArkProjectHeader();

export const ArkProjectHeader = createComponent({
  react: React,
  tagName: "ark-project-header",
  elementClass: ArkProjectHeaderElement,
});
