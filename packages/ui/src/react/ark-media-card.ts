import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkMediaCard as ArkMediaCardElement, defineArkMediaCard } from "@arkaes/ui";

defineArkMediaCard();

export const ArkMediaCard = createComponent({
  react: React,
  tagName: "ark-media-card",
  elementClass: ArkMediaCardElement,
});
