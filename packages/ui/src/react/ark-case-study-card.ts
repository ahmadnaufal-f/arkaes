import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkCaseStudyCard as ArkCaseStudyCardElement, defineArkCaseStudyCard } from "@arkaes/ui";

defineArkCaseStudyCard();

export const ArkCaseStudyCard = createComponent({
  react: React,
  tagName: "ark-case-study-card",
  elementClass: ArkCaseStudyCardElement,
});
