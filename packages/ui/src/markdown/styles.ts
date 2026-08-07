import { css } from "lit";

/**
 * The prose stylesheet for rendered markdown — the single source of truth.
 *
 * Authored here rather than as a plain `.css` file so `scripts/token-lint.mjs`
 * checks it (it scans `.ts` under `packages/ui/src` and fails on raw colors and
 * hardcoded spacing). `scripts/emit-markdown-css.ts` writes `cssText` out to
 * `src/styles/markdown.css` for the server-rendered path, where the markup lives
 * in the light DOM and needs an ordinary stylesheet.
 *
 * Two selector shapes throughout: the `.ark-md*` classes, for HTML rendered by
 * `renderMarkdown()` into a plain element, and `ark-markdown[heading-style=...]`,
 * so a server-rendered element is styled before any JavaScript runs.
 *
 * Descends from the `.ark-readable` utility in `@arkaes/tokens`, restated here
 * because a shadow root (the chat bubble) inherits neither it nor `reset.css`.
 */
export const markdownStyles = css`
  .ark-md,
  ark-markdown {
    display: block;
    max-width: var(--ark-measure-md);
    color: var(--ark-color-text-soft);
    font-family: var(--ark-font-sans);
    font-size: var(--ark-text-md);
    line-height: var(--ark-leading-normal);
  }

  /* Shadow roots do not inherit the global reset, so the box model is restated
     rather than assumed, and flow spacing is applied on top of it. */
  :is(.ark-md, ark-markdown) :is(p, h1, h2, h3, h4, h5, h6, ul, ol, pre,
    blockquote, figure, table, hr) {
    margin: 0;
  }

  :is(.ark-md, ark-markdown) > * + * {
    margin-block-start: 1em;
  }

  :is(.ark-md, ark-markdown) :is(p, li) {
    color: var(--ark-color-text-soft);
    line-height: var(--ark-leading-normal);
  }

  /* ── Headings ──────────────────────────────────────────────
     Structure (level shift, slug ids) is the renderer's job; this is the look. */

  :is(.ark-md, ark-markdown) .ark-md-heading {
    color: var(--ark-color-text);
    text-wrap: balance;
  }

  :is(.ark-md, ark-markdown) h2.ark-md-heading {
    margin-block-start: 2em;
  }

  /* Article — the blog treatment. Every level in the display face at a single
     regular weight, so the levels are stepped by size instead of by weight. */
  :is(.ark-md-headings-article, ark-markdown[heading-style="article"],
    ark-markdown:not([heading-style]))
    .ark-md-heading {
    font-family: var(--ark-font-display);
    font-weight: var(--ark-weight-regular);
  }

  :is(.ark-md-headings-article, ark-markdown[heading-style="article"],
    ark-markdown:not([heading-style]))
    h1.ark-md-heading {
    font-size: var(--ark-text-3xl);
    line-height: var(--ark-leading-tight);
  }

  :is(.ark-md-headings-article, ark-markdown[heading-style="article"],
    ark-markdown:not([heading-style]))
    h2.ark-md-heading {
    font-size: var(--ark-text-2xl);
    line-height: var(--ark-leading-snug);
  }

  :is(.ark-md-headings-article, ark-markdown[heading-style="article"],
    ark-markdown:not([heading-style]))
    h3.ark-md-heading {
    font-size: var(--ark-text-xl);
    line-height: var(--ark-leading-snug);
  }

  :is(.ark-md-headings-article, ark-markdown[heading-style="article"],
    ark-markdown:not([heading-style]))
    :is(h4, h5, h6).ark-md-heading {
    font-size: var(--ark-text-lg);
    line-height: var(--ark-leading-snug);
  }

  /* Section — case studies, projects, about. A quiet sans subheading: the
     document's own H2 titles are carried by the accordion above it, so these
     sit close to body copy rather than competing with it. */
  :is(.ark-md-headings-section, ark-markdown[heading-style="section"])
    .ark-md-heading {
    color: var(--ark-color-text);
    font-family: var(--ark-font-sans);
    font-size: var(--ark-text-md);
    font-weight: var(--ark-weight-medium);
    letter-spacing: var(--ark-tracking-wide);
    line-height: var(--ark-leading-snug);
  }

  :is(.ark-md-headings-section, ark-markdown[heading-style="section"])
    .ark-md-heading:not(:first-child) {
    margin-block-start: 1.6em;
  }

  :is(.ark-md-headings-section, ark-markdown[heading-style="section"])
    h2.ark-md-heading {
    font-family: var(--ark-font-display);
    font-size: var(--ark-text-xl);
    font-weight: var(--ark-weight-thin);
    letter-spacing: var(--ark-tracking-tight);
  }

  /* Flat — chat replies. One weight for every level; a reply is too short for a
     hierarchy to mean anything. */
  :is(.ark-md-headings-flat, ark-markdown[heading-style="flat"])
    .ark-md-heading {
    font-family: var(--ark-font-sans);
    font-size: var(--ark-text-md);
    font-weight: var(--ark-weight-semibold);
    line-height: var(--ark-leading-snug);
  }

  /* ── Inline ────────────────────────────────────────────── */

  :is(.ark-md, ark-markdown) a {
    color: var(--ark-color-accent-strong);
    font-weight: var(--ark-weight-medium);
    text-decoration: underline;
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.18em;
    transition: text-decoration-thickness var(--ark-duration-fast)
      var(--ark-ease-standard);
  }

  :is(.ark-md, ark-markdown) a:hover {
    text-decoration-thickness: 0.14em;
  }

  :is(.ark-md, ark-markdown) code {
    background: var(--ark-color-surface-soft);
    border-radius: var(--ark-radius-xs);
    font-family: var(--ark-font-mono);
    font-size: 0.92em;
    padding: 0.12em 0.35em;
  }

  :is(.ark-md, ark-markdown) strong {
    color: var(--ark-color-text);
    font-weight: var(--ark-weight-semibold);
  }

  /* ── Lists ─────────────────────────────────────────────── */

  :is(.ark-md, ark-markdown) :is(ul, ol) {
    padding-inline-start: 1.4em;
  }

  :is(.ark-md, ark-markdown) li + li {
    margin-block-start: 0.4em;
  }

  :is(.ark-md, ark-markdown) li > :is(ul, ol) {
    margin-block-start: 0.4em;
  }

  /* Glyph-bullet lists carry their own accent marker instead of the browser's. */
  :is(.ark-md, ark-markdown) .ark-md-list {
    list-style: none;
    padding-inline-start: 0;
  }

  :is(.ark-md, ark-markdown) .ark-md-list li {
    padding-inline-start: var(--ark-space-5);
    position: relative;
  }

  :is(.ark-md, ark-markdown) .ark-md-list li::before {
    color: var(--ark-color-accent);
    content: "•";
    inset-inline-start: 0;
    position: absolute;
  }

  /* ── Blocks ────────────────────────────────────────────── */

  :is(.ark-md, ark-markdown) blockquote {
    border-inline-start: 2px solid var(--ark-color-accent);
    color: var(--ark-color-text-muted);
    font-style: italic;
    padding-inline-start: var(--ark-space-4);
  }

  :is(.ark-md, ark-markdown) :is(pre, .ark-md-code) {
    background: var(--ark-color-surface-soft);
    border: 1px solid var(--ark-color-border);
    border-radius: var(--ark-radius-sm);
    line-height: var(--ark-leading-normal);
    overflow-x: auto;
    padding: var(--ark-space-4);
  }

  /* Inside a block, the inline-code chrome would double up on the pre's own. */
  :is(.ark-md, ark-markdown) pre code {
    background: none;
    border-radius: 0;
    font-size: var(--ark-text-sm);
    padding: 0;
  }

  :is(.ark-md, ark-markdown) hr {
    border: 0;
    border-top: 1px solid var(--ark-color-border);
    margin-block: 2em;
  }

  :is(.ark-md, ark-markdown) :is(img, .ark-md-image) {
    border-radius: var(--ark-radius-sm);
    display: block;
    height: auto;
    max-width: 100%;
  }

  /* ── Tables ────────────────────────────────────────────── */

  :is(.ark-md, ark-markdown) table {
    border-collapse: collapse;
    display: block;
    font-size: var(--ark-text-sm);
    overflow-x: auto;
    width: 100%;
  }

  :is(.ark-md, ark-markdown) :is(th, td) {
    border: 1px solid var(--ark-color-border);
    color: var(--ark-color-text-soft);
    padding: var(--ark-space-2) var(--ark-space-3);
    text-align: start;
  }

  :is(.ark-md, ark-markdown) th {
    background: var(--ark-color-surface-soft);
    color: var(--ark-color-text);
    font-weight: var(--ark-weight-semibold);
  }

  /* ── Figures ───────────────────────────────────────────── */

  :is(.ark-md, ark-markdown) .ark-md-figure {
    margin-block: 1.8em;
  }

  :is(.ark-md, ark-markdown) :is(.ark-md-figure svg, .ark-md-diagram) {
    display: block;
    height: auto;
    max-width: 100%;
    width: 100%;
  }

  /* Phone screenshots — constrained, framed, in a centered row. */
  :is(.ark-md, ark-markdown) .ark-md-shots {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ark-space-5);
    justify-content: center;
    margin-block: 1.8em;
  }

  :is(.ark-md, ark-markdown) .ark-md-shot {
    flex: 0 1 200px;
    margin: 0;
    max-width: 220px;
  }

  :is(.ark-md, ark-markdown) .ark-md-screenshot {
    border: 1px solid
      color-mix(in srgb, var(--ark-color-accent) 24%, transparent);
    border-radius: var(--ark-radius-lg);
    box-shadow: var(--ark-shadow-lg);
    display: block;
    height: auto;
    width: 100%;
  }

  :is(.ark-md, ark-markdown) .ark-md-shot figcaption {
    color: var(--ark-color-text-subtle);
    font-family: var(--ark-font-mono);
    font-size: var(--ark-text-xs);
    letter-spacing: var(--ark-tracking-wide);
    line-height: var(--ark-leading-snug);
    margin-block-start: var(--ark-space-3);
    text-align: center;
  }

  /* ── Proof cards ───────────────────────────────────────── */

  :is(.ark-md, ark-markdown) .ark-md-proofs {
    display: grid;
    gap: var(--ark-space-3);
    list-style: none;
    padding-inline-start: 0;
  }

  :is(.ark-md, ark-markdown) .ark-md-proof {
    margin: 0;
  }

  :is(.ark-md, ark-markdown) :is(.ark-md-proof, .ark-md-proof-link) {
    border: 1px solid var(--ark-color-border);
    border-radius: var(--ark-radius-sm);
    display: grid;
    gap: var(--ark-space-1);
    padding: var(--ark-space-4);
  }

  /* The border belongs to the anchor when there is one, so the whole card is
     the hit target rather than only its text. */
  :is(.ark-md, ark-markdown) .ark-md-proof:has(.ark-md-proof-link) {
    border: 0;
    padding: 0;
  }

  :is(.ark-md, ark-markdown) .ark-md-proof-link {
    color: inherit;
    font-weight: inherit;
    text-decoration: none;
    transition: border-color var(--ark-duration-normal) var(--ark-ease-standard);
  }

  :is(.ark-md, ark-markdown) .ark-md-proof-link:hover {
    border-color: var(--ark-color-border-strong);
  }

  :is(.ark-md, ark-markdown) .ark-md-proof-metric {
    color: var(--ark-color-accent-strong);
    font-family: var(--ark-font-display);
    font-size: var(--ark-text-xl);
    font-weight: var(--ark-weight-thin);
    line-height: var(--ark-leading-tight);
  }

  :is(.ark-md, ark-markdown) .ark-md-proof-title {
    color: var(--ark-color-text);
    font-size: var(--ark-text-sm);
    font-weight: var(--ark-weight-medium);
  }

  :is(.ark-md, ark-markdown) .ark-md-proof-link .ark-md-proof-title::after {
    content: " →";
    opacity: 0;
    transition: opacity var(--ark-duration-normal) var(--ark-ease-standard);
  }

  :is(.ark-md, ark-markdown) .ark-md-proof-link:hover .ark-md-proof-title::after {
    opacity: 1;
  }

  :is(.ark-md, ark-markdown) .ark-md-proof-desc {
    color: var(--ark-color-text-muted);
    font-size: var(--ark-text-sm);
  }

  /* ── Citation badges ───────────────────────────────────── */

  :is(.ark-md, ark-markdown) .ark-md-cites {
    display: inline-flex;
    gap: var(--ark-space-1);
    margin-inline-start: var(--ark-space-1);
    vertical-align: super;
  }

  :is(.ark-md, ark-markdown) .ark-md-cite {
    background: var(--ark-color-accent-soft);
    border-radius: var(--ark-radius-full);
    color: var(--ark-color-accent-strong);
    font-family: var(--ark-font-mono);
    font-size: var(--ark-text-xs);
    line-height: 1.6;
    min-width: 1.6em;
    text-align: center;
  }

  /* ── Syntax highlighting ───────────────────────────────────
     Shiki's css-variables theme emits var(--astro-code-*), mapped onto the
     design tokens so code follows the site theme instead of a fixed scheme. */

  :is(.ark-md, ark-markdown) {
    --ark-md-code-surface: color-mix(
      in srgb,
      var(--ark-color-surface-soft) 92%,
      var(--ark-color-neutral-900) 8%
    );

    --astro-code-foreground: var(--ark-color-text);
    --astro-code-background: var(--ark-md-code-surface);
    --astro-code-token-constant: var(--ark-color-blush-deep);
    --astro-code-token-string: var(--ark-color-sage);
    --astro-code-token-comment: var(--ark-color-text-subtle);
    --astro-code-token-keyword: var(--ark-color-blush);
    --astro-code-token-parameter: var(--ark-color-text-soft);
    --astro-code-token-function: var(--ark-color-accent-strong);
    --astro-code-token-string-expression: var(--ark-color-sage);
    --astro-code-token-punctuation: var(--ark-color-text-muted);
    --astro-code-token-link: var(--ark-color-accent-strong);
  }

  :is(.ark-md, ark-markdown) pre {
    background: var(--ark-md-code-surface);
  }

  @media (prefers-reduced-motion: reduce) {
    :is(.ark-md, ark-markdown) :is(a, .ark-md-proof-link,
      .ark-md-proof-title::after) {
      transition: none;
    }
  }
`;
