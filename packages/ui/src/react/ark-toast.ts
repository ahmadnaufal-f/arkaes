import * as React from "react";
import { createComponent } from "@lit/react";
import {
  ArkToast as ArkToastElement,
  ArkToaster as ArkToasterElement,
  ToastVariant,
  defineArkToast,
} from "@arkaes/ui";

defineArkToast();

export const ArkToast = createComponent({
  react: React,
  tagName: "ark-toast",
  elementClass: ArkToastElement,
  events: {
    onDismiss: "ark-toast:dismiss",
  },
});

export const ArkToaster = createComponent({
  react: React,
  tagName: "ark-toaster",
  elementClass: ArkToasterElement,
});

export { ToastVariant };
