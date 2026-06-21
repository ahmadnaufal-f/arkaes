import * as React from "react";
import { createComponent } from "@lit/react";
import {
  ArkCard as ArkCardElement,
  ArkCardHeader as ArkCardHeaderElement,
  ArkCardTitle as ArkCardTitleElement,
  ArkCardDescription as ArkCardDescriptionElement,
  ArkCardAction as ArkCardActionElement,
  ArkCardContent as ArkCardContentElement,
  ArkCardFooter as ArkCardFooterElement,
  defineArkCard,
} from "@arkaes/ui";

defineArkCard();

export const ArkCard = createComponent({
  react: React,
  tagName: "ark-card",
  elementClass: ArkCardElement,
});

export const ArkCardHeader = createComponent({
  react: React,
  tagName: "ark-card-header",
  elementClass: ArkCardHeaderElement,
});

export const ArkCardTitle = createComponent({
  react: React,
  tagName: "ark-card-title",
  elementClass: ArkCardTitleElement,
});

export const ArkCardDescription = createComponent({
  react: React,
  tagName: "ark-card-description",
  elementClass: ArkCardDescriptionElement,
});

export const ArkCardAction = createComponent({
  react: React,
  tagName: "ark-card-action",
  elementClass: ArkCardActionElement,
});

export const ArkCardContent = createComponent({
  react: React,
  tagName: "ark-card-content",
  elementClass: ArkCardContentElement,
});

export const ArkCardFooter = createComponent({
  react: React,
  tagName: "ark-card-footer",
  elementClass: ArkCardFooterElement,
});
