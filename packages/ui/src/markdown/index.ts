export { renderMarkdown, renderMarkdownAsync } from "./render";
export { markdownStyles } from "./styles";
export {
  MarkdownFeature,
  MarkdownHeadingStyle,
  MarkdownTrust,
  normalizeMarkdownFeatures,
  normalizeMarkdownHeadingStyle,
  normalizeMarkdownTrust,
  resolveMarkdownOptions,
} from "./options";

export type {
  MarkdownAsyncHighlighter,
  MarkdownAsyncOptions,
  MarkdownFeatureValue,
  MarkdownHeadingStyleValue,
  MarkdownHighlighter,
  MarkdownOptions,
  MarkdownTrustValue,
  ResolvedMarkdownOptions,
} from "./options";
