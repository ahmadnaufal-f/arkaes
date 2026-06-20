import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkHero as ArkHeroElement, defineArkHero } from "@arkaes/ui";

defineArkHero();

export const ArkHero = createComponent({
  react: React,
  tagName: "ark-hero",
  elementClass: ArkHeroElement,
});
