import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkCarousel as ArkCarouselElement, defineArkCarousel } from "@arkaes/ui";

defineArkCarousel();

export const ArkCarousel = createComponent({
  react: React,
  tagName: "ark-carousel",
  elementClass: ArkCarouselElement,
  events: {
    onChange: "ark-carousel:change",
  },
});
