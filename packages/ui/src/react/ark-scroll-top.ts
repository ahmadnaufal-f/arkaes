import * as React from "react";
import { createComponent } from "@lit/react";
import {
  ArkScrollTop as ArkScrollTopElement,
  defineArkScrollTop,
} from "@arkaes/ui";

defineArkScrollTop();

export const ArkScrollTop = createComponent({
  react: React,
  tagName: "ark-scroll-top",
  elementClass: ArkScrollTopElement,
  events: {
    onActivate: "ark-scroll-top:activate",
  },
});
