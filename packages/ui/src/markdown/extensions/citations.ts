import type { Token, TokenizerAndRendererExtension } from "marked";

/**
 * Reference badges: `[3]` or `[3, 5]`, as emitted by the assistant when it cites
 * knowledge-base sources.
 *
 * The negative lookahead on `(` keeps a real markdown link (`[3](/x)`) out of
 * this tokenizer, and only digits and separators are accepted inside the
 * brackets, so ordinary bracketed prose is left alone.
 */
const CITATION = /^\[(\d+(?:[ \t]*,[ \t]*\d+)*)\](?!\()/;

interface CitationsToken {
  type: "citations";
  raw: string;
  numbers: string[];
}

export const citationsExtension = (): TokenizerAndRendererExtension => ({
  name: "citations",
  level: "inline",
  start: (src: string) => src.indexOf("["),

  tokenizer(src: string) {
    const match = CITATION.exec(src);
    if (!match) return undefined;

    const token: CitationsToken = {
      type: "citations",
      raw: match[0],
      numbers: (match[1] ?? "").split(",").map((value) => value.trim()),
    };
    return token as unknown as Token;
  },

  renderer(token) {
    const { numbers } = token as unknown as CitationsToken;
    const badges = numbers
      .map((number) => `<span class="ark-md-cite">${number}</span>`)
      .join("");
    return `<span class="ark-md-cites">${badges}</span>`;
  },
});
