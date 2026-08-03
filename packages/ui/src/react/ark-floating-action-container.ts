import * as React from "react";
import { createComponent } from "@lit/react";
import {
  ArkFloatingActionContainer as ArkFloatingActionContainerElement,
  defineArkFloatingActionContainer,
} from "@arkaes/ui";

defineArkFloatingActionContainer();

export const ArkFloatingActionContainer = createComponent({
  react: React,
  tagName: "ark-floating-action-container",
  elementClass: ArkFloatingActionContainerElement,
});
