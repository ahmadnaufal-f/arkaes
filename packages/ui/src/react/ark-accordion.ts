import * as React from "react";
import { createComponent } from "@lit/react";
import {
  ArkAccordion as ArkAccordionElement,
  ArkAccordionItem as ArkAccordionItemElement,
  defineArkAccordion,
} from "@arkaes/ui";

defineArkAccordion();

export const ArkAccordion = createComponent({
  react: React,
  tagName: "ark-accordion",
  elementClass: ArkAccordionElement,
});

export const ArkAccordionItem = createComponent({
  react: React,
  tagName: "ark-accordion-item",
  elementClass: ArkAccordionItemElement,
  events: {
    onToggle: "ark-accordion:toggle",
  },
});
