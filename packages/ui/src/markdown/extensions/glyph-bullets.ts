import type { Token, TokenizerAndRendererExtension } from "marked";

/**
 * `•` (U+2022) as a list marker, which the case-study and about content uses in
 * place of `-`.
 *
 * A line that does not start with `•` continues the previous item rather than
 * becoming a sibling — the renderer this replaces emitted such lines as `<p>`
 * *inside* the `<ul>`, which is invalid HTML.
 */
const GLYPH_BLOCK = /^[ \t]*•[^\n]*(?:\n[ \t]*[^\s][^\n]*)*(?:\n|$)/;
const GLYPH_LINE = /^[ \t]*•[ \t]*(.*)$/;

interface GlyphBulletsToken {
  type: "glyphBullets";
  raw: string;
  items: Token[][];
}

export const glyphBulletsExtension = (): TokenizerAndRendererExtension => ({
  name: "glyphBullets",
  level: "block",
  start: (src: string) => src.match(/^[ \t]*•/m)?.index,

  tokenizer(src: string) {
    const match = GLYPH_BLOCK.exec(src);
    if (!match) return undefined;

    const texts: string[] = [];
    for (const line of match[0].split("\n")) {
      if (!line.trim()) continue;
      const bullet = GLYPH_LINE.exec(line);
      if (bullet) {
        texts.push(bullet[1] ?? "");
        continue;
      }
      if (!texts.length) return undefined;
      texts[texts.length - 1] += ` ${line.trim()}`;
    }
    if (!texts.length) return undefined;

    const token: GlyphBulletsToken = {
      type: "glyphBullets",
      raw: match[0],
      items: texts.map((text) => this.lexer.inlineTokens(text)),
    };
    return token as unknown as Token;
  },

  renderer(token) {
    const { items } = token as unknown as GlyphBulletsToken;
    const listItems = items
      .map((tokens) => `<li>${this.parser.parseInline(tokens)}</li>`)
      .join("");
    return `<ul class="ark-md-list">${listItems}</ul>\n`;
  },
});
