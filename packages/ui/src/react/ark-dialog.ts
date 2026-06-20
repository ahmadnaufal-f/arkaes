import * as React from "react";
import { createComponent } from "@lit/react";
import {
  ArkDialogRoot as ArkDialogRootElement,
  ArkDialogTrigger as ArkDialogTriggerElement,
  ArkDialogPortal as ArkDialogPortalElement,
  ArkDialogOverlay as ArkDialogOverlayElement,
  ArkDialogContent as ArkDialogContentElement,
  ArkDialogTitle as ArkDialogTitleElement,
  ArkDialogDescription as ArkDialogDescriptionElement,
  ArkDialogClose as ArkDialogCloseElement,
  defineArkDialog,
} from "@arkaes/ui";

defineArkDialog();

// The dialog open/close CustomEvents bubble up to the root, so they are exposed
// on ArkDialogRoot.
export const ArkDialogRoot = createComponent({
  react: React,
  tagName: "ark-dialog-root",
  elementClass: ArkDialogRootElement,
  events: {
    onOpen: "ark-dialog:open",
    onClose: "ark-dialog:close",
  },
});

export const ArkDialogTrigger = createComponent({
  react: React,
  tagName: "ark-dialog-trigger",
  elementClass: ArkDialogTriggerElement,
});

export const ArkDialogPortal = createComponent({
  react: React,
  tagName: "ark-dialog-portal",
  elementClass: ArkDialogPortalElement,
});

export const ArkDialogOverlay = createComponent({
  react: React,
  tagName: "ark-dialog-overlay",
  elementClass: ArkDialogOverlayElement,
});

export const ArkDialogContent = createComponent({
  react: React,
  tagName: "ark-dialog-content",
  elementClass: ArkDialogContentElement,
});

export const ArkDialogTitle = createComponent({
  react: React,
  tagName: "ark-dialog-title",
  elementClass: ArkDialogTitleElement,
});

export const ArkDialogDescription = createComponent({
  react: React,
  tagName: "ark-dialog-description",
  elementClass: ArkDialogDescriptionElement,
});

export const ArkDialogClose = createComponent({
  react: React,
  tagName: "ark-dialog-close",
  elementClass: ArkDialogCloseElement,
});
