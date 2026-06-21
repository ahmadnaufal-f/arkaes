import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkBrandLogo as ArkBrandLogoElement, defineArkBrandLogo } from "@arkaes/ui";

defineArkBrandLogo();

export const ArkBrandLogo = createComponent({
  react: React,
  tagName: "ark-brand-logo",
  elementClass: ArkBrandLogoElement,
});
