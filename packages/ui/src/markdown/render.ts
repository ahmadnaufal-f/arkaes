import { Marked, type RendererObject, type Token, type Tokens } from "marked";
import { citationsExtension } from "./extensions/citations";
import { figuresExtension } from "./extensions/figures";
import { glyphBulletsExtension } from "./extensions/glyph-bullets";
import { proofCardsExtension } from "./extensions/proof-cards";
import { createHeadingRenderer } from "./headings";
import {
  MarkdownFeature,
  MarkdownTrust,
  type MarkdownAsyncOptions,
  type MarkdownOptions,
  type ResolvedMarkdownOptions,
  resolveMarkdownOptions,
} from "./options";
import { escapeAttribute, escapeHtml, isSafeUrl, linkTargetAttributes } from "./safety";

/** A code token carrying output from an async highlighter run in walkTokens. */
interface HighlightedCode extends Tokens.Code {
  arkHighlighted?: string;
}

const buildExtensions = (options: ResolvedMarkdownOptions) => {
  const extensions = [];
  // Proof cards are matched before glyph bullets: a proof line is a list item
  // with structure rather than free prose, and both start the same way.
  if (options.features.has(MarkdownFeature.ProofCards)) {
    extensions.push(proofCardsExtension());
  }
  if (options.features.has(MarkdownFeature.Figures)) {
    extensions.push(figuresExtension(options));
  }
  if (options.features.has(MarkdownFeature.GlyphBullets)) {
    extensions.push(glyphBulletsExtension());
  }
  if (options.features.has(MarkdownFeature.Citations)) {
    extensions.push(citationsExtension());
  }
  return extensions;
};

const buildRenderer = (options: ResolvedMarkdownOptions): RendererObject => {
  const headings = createHeadingRenderer(options);
  const trusted = options.trust === MarkdownTrust.Trusted;

  return {
    heading({ tokens, depth }: Tokens.Heading) {
      const inner = this.parser.parseInline(tokens);
      const plain = this.parser.parseInline(tokens, this.parser.textRenderer);
      return headings.render(depth, inner, plain);
    },

    code(token: Tokens.Code) {
      const highlighted = (token as HighlightedCode).arkHighlighted;
      if (highlighted) return `${highlighted}\n`;
      if (options.highlight) return `${options.highlight(token.text, token.lang ?? "")}\n`;

      const lang = token.lang ? ` class="language-${escapeAttribute(token.lang)}"` : "";
      return `<pre class="ark-md-code"><code${lang}>${escapeHtml(token.text)}</code></pre>\n`;
    },

    // Untrusted source: raw HTML becomes literal text rather than markup, so a
    // <script> in model output is inert instead of merely unlikely.
    html({ text }: Tokens.HTML | Tokens.Tag) {
      return trusted ? text : escapeHtml(text);
    },

    link({ href, title, tokens, raw }: Tokens.Link) {
      if (!isSafeUrl(href)) return escapeHtml(raw);
      const label = this.parser.parseInline(tokens);
      const titleAttr = title ? ` title="${escapeAttribute(title)}"` : "";
      return (
        `<a href="${escapeAttribute(href)}"${titleAttr}` +
        `${linkTargetAttributes(href)}>${label}</a>`
      );
    },

    image({ href, title, text }: Tokens.Image) {
      if (!isSafeUrl(href)) return escapeHtml(text);
      const titleAttr = title ? ` title="${escapeAttribute(title)}"` : "";
      return (
        `<img src="${escapeAttribute(href)}" alt="${escapeHtml(text)}"` +
        `${titleAttr} class="ark-md-image" loading="lazy" />`
      );
    },
  };
};

/**
 * A fresh instance per call: the slug bookkeeping and the diagrams map are
 * per-render state, and marked instances are cheap to construct.
 */
const buildMarked = (options: ResolvedMarkdownOptions): Marked => {
  const marked = new Marked();
  marked.use({
    gfm: true,
    breaks: options.softBreaks,
    extensions: buildExtensions(options),
    renderer: buildRenderer(options),
  });
  return marked;
};

/**
 * Renders markdown to HTML, synchronously.
 *
 * Defaults to `trust: "untrusted"` — raw HTML is escaped to literal text and
 * every href/src goes through an allowlist. Pass `trust: "trusted"` for content
 * you author yourself.
 */
export const renderMarkdown = (
  source: string,
  options: MarkdownOptions = {},
): string => {
  if (!source) return "";
  const resolved = resolveMarkdownOptions(options);
  return buildMarked(resolved).parse(source, { async: false }) as string;
};

/**
 * As {@link renderMarkdown}, but awaits an asynchronous highlighter — Shiki's
 * `codeToHtml` is async, while the streaming chat path needs the sync form.
 */
export const renderMarkdownAsync = async (
  source: string,
  options: MarkdownAsyncOptions = {},
): Promise<string> => {
  if (!source) return "";
  const { highlight, ...rest } = options;
  const resolved = resolveMarkdownOptions(rest);
  const marked = buildMarked(resolved);

  if (highlight) {
    marked.use({
      async: true,
      walkTokens: async (token: Token) => {
        if (token.type !== "code") return;
        const code = token as HighlightedCode;
        const output = await highlight(code.text, code.lang ?? "");
        if (typeof output === "string") code.arkHighlighted = output;
      },
    });
  }

  return String(await marked.parse(source, { async: true }));
};
