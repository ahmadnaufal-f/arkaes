import * as React from "react";
import { createComponent } from "@lit/react";
import {
  ArkMarkdown as ArkMarkdownElement,
  MarkdownFeature,
  MarkdownHeadingStyle,
  MarkdownTrust,
  defineArkMarkdown,
} from "@arkaes/ui";

defineArkMarkdown();

export const ArkMarkdown = createComponent({
  react: React,
  tagName: "ark-markdown",
  elementClass: ArkMarkdownElement,
});

export { MarkdownFeature, MarkdownHeadingStyle, MarkdownTrust };
