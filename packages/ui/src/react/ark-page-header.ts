import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkPageHeader as ArkPageHeaderElement, defineArkPageHeader } from "@arkaes/ui";

defineArkPageHeader();

export const ArkPageHeader = createComponent({
  react: React,
  tagName: "ark-page-header",
  elementClass: ArkPageHeaderElement,
});
