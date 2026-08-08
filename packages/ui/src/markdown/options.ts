/**
 * Option types for the shared markdown renderer.
 *
 * The enums follow the same normalize-through-a-Set pattern the elements use for
 * their variant props, so an unknown attribute value degrades to a sane default
 * instead of throwing.
 */

/** How markdown headings are turned into HTML. */
export enum MarkdownHeadingStyle {
  /** Blog bodies: real `<h1>`–`<h6>` with slug ids, display face, stepped sizes. */
  Article = "article",
  /** Case studies, projects, about: level shifted by one, sans face at body size. */
  Section = "section",
  /** Chat replies: every level renders as one flat `<h4>`. */
  Flat = "flat",
}

/** Whether the source is authored by us or by something we do not control. */
export enum MarkdownTrust {
  /** Raw HTML passes through and the `diagrams` map may inline SVG source. */
  Trusted = "trusted",
  /** Raw HTML is escaped to literal text and urls are allowlisted. */
  Untrusted = "untrusted",
}

/** Opt-in block and inline syntaxes beyond CommonMark + GFM. */
export enum MarkdownFeature {
  /** `[3]` / `[3, 5]` reference badges. */
  Citations = "citations",
  /** Blocks of `![alt](src)` lines as diagram or screenshot figures. */
  Figures = "figures",
  /** `•` (U+2022) accepted as a list marker. */
  GlyphBullets = "glyph-bullets",
  /** `→ metric | [Work](/href) | description` evidence cards. */
  ProofCards = "proof-cards",
}

export type MarkdownHeadingStyleValue = `${MarkdownHeadingStyle}`;
export type MarkdownTrustValue = `${MarkdownTrust}`;
export type MarkdownFeatureValue = `${MarkdownFeature}`;

/** Turns fenced code into HTML. Return the complete `<pre>` element. */
export type MarkdownHighlighter = (code: string, lang: string) => string;

/** As {@link MarkdownHighlighter}, but may resolve asynchronously (e.g. Shiki). */
export type MarkdownAsyncHighlighter = (
  code: string,
  lang: string,
) => string | Promise<string>;

export interface MarkdownOptions {
  /** Heading treatment. Default `"article"`. */
  headings?: MarkdownHeadingStyleValue | MarkdownHeadingStyle | string;
  /**
   * Extra level shift applied on top of the mode's own, clamped to h1–h6. Use it
   * when a body sits under a page title that already owns the `<h1>`.
   */
  headingOffset?: number;
  /** Prefix for generated slug ids, so several bodies on one page stay unique. */
  headingIdPrefix?: string;
  /** Default `"untrusted"`. */
  trust?: MarkdownTrustValue | MarkdownTrust | string;
  /** Opt-in syntaxes. Default none. */
  features?: readonly (MarkdownFeatureValue | MarkdownFeature | string)[];
  /**
   * SVG basename (without extension) to raw SVG source. `![alt](/x/foo.svg)` is
   * inlined from this map so the page's loaded fonts apply inside the diagram.
   * Requires `trust: "trusted"` and the `figures` feature.
   */
  diagrams?: Record<string, string>;
  /**
   * Turn a single newline inside a paragraph into a `<br>`. Off by default,
   * which is standard markdown; chat replies want it on, because a model writes
   * short lines and means them.
   */
  softBreaks?: boolean;
  /** Synchronous syntax highlighter for fenced code. */
  highlight?: MarkdownHighlighter;
}

export interface MarkdownAsyncOptions extends Omit<MarkdownOptions, "highlight"> {
  /** Highlighter that may return a promise — e.g. Shiki's `codeToHtml`. */
  highlight?: MarkdownAsyncHighlighter;
}

const headingStyles = new Set<string>(Object.values(MarkdownHeadingStyle));
const trustLevels = new Set<string>(Object.values(MarkdownTrust));
const featureNames = new Set<string>(Object.values(MarkdownFeature));

export const normalizeMarkdownHeadingStyle = (
  value: string,
): MarkdownHeadingStyleValue =>
  (headingStyles.has(value)
    ? value
    : MarkdownHeadingStyle.Article) as MarkdownHeadingStyleValue;

export const normalizeMarkdownTrust = (value: string): MarkdownTrustValue =>
  (trustLevels.has(value) ? value : MarkdownTrust.Untrusted) as MarkdownTrustValue;

export const normalizeMarkdownFeatures = (
  values: readonly string[] | undefined,
): MarkdownFeatureValue[] =>
  (values ?? []).filter((value): value is MarkdownFeatureValue =>
    featureNames.has(value));

/**
 * Per-mode heading behaviour. `section` shifts one level down because the case
 * study path renders `###` as an `<h4>`; `flat` pins every level to a single tag.
 */
const headingRules: Record<
  MarkdownHeadingStyleValue,
  { baseOffset: number; fixedLevel: number | null; ids: boolean }
> = {
  [MarkdownHeadingStyle.Article]: { baseOffset: 0, fixedLevel: null, ids: true },
  [MarkdownHeadingStyle.Section]: { baseOffset: 1, fixedLevel: null, ids: false },
  [MarkdownHeadingStyle.Flat]: { baseOffset: 0, fixedLevel: 4, ids: false },
};

/** Options after defaulting and normalization — what the renderer actually reads. */
export interface ResolvedMarkdownOptions {
  headings: MarkdownHeadingStyleValue;
  headingOffset: number;
  headingIds: boolean;
  headingIdPrefix: string;
  headingFixedLevel: number | null;
  trust: MarkdownTrustValue;
  features: Set<MarkdownFeatureValue>;
  diagrams: Record<string, string>;
  softBreaks: boolean;
  highlight?: MarkdownHighlighter;
}

export const resolveMarkdownOptions = (
  options: MarkdownOptions = {},
): ResolvedMarkdownOptions => {
  const headings = normalizeMarkdownHeadingStyle(String(options.headings ?? ""));
  const rule = headingRules[headings];
  const trust = normalizeMarkdownTrust(String(options.trust ?? ""));
  const features = new Set(normalizeMarkdownFeatures(options.features as string[]));

  return {
    headings,
    headingOffset: rule.baseOffset + (options.headingOffset ?? 0),
    headingIds: rule.ids,
    headingIdPrefix: options.headingIdPrefix ?? "",
    headingFixedLevel: rule.fixedLevel,
    trust,
    features,
    // Inlining raw SVG is a trusted-content capability; an untrusted source must
    // never be able to reach the map even if a caller passes one by mistake.
    diagrams: trust === MarkdownTrust.Trusted ? (options.diagrams ?? {}) : {},
    softBreaks: options.softBreaks ?? false,
    highlight: options.highlight,
  };
};
