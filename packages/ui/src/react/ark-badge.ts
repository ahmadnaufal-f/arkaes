import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkBadge as ArkBadgeElement, BadgeVariant, defineArkBadge } from "@arkaes/ui";

defineArkBadge();

export const ArkBadge = createComponent({
  react: React,
  tagName: "ark-badge",
  elementClass: ArkBadgeElement,
});

export { BadgeVariant };
