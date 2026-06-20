import * as React from "react";
import { createComponent } from "@lit/react";
import { ArkCursor as ArkCursorElement, defineArkCursor } from "@arkaes/ui";

defineArkCursor();

export const ArkCursor = createComponent({
  react: React,
  tagName: "ark-cursor",
  elementClass: ArkCursorElement,
});
