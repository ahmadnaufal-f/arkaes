import type { Token, TokenizerAndRendererExtension } from "marked";
import { escapeAttribute, escapeHtml, isSafeUrl, linkTargetAttributes } from "../safety";

/**
 * A proof line: `→ metric | [Linked work](/href) | supporting sentence`.
 *
 * The metric is optional (two fields = link + sentence), so a claim backed by a
 * shipped thing rather than a number still renders as a card. Registered ahead
 * of the built-in list tokenizer, since a proof line is a list item with
 * structure rather than free prose.
 */
const PROOF_BLOCK = /^(?:[ \t]*→[^\n]*(?:\n|$))+/;
const PROOF_LINE = /^[ \t]*→[ \t]*(.*)$/;
const PROOF_LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

interface ProofRow {
  metric: Token[];
  label: string;
  href: string;
  description: Token[];
}

interface ProofCardsToken {
  type: "proofCards";
  raw: string;
  rows: ProofRow[];
}

export const proofCardsExtension = (): TokenizerAndRendererExtension => ({
  name: "proofCards",
  level: "block",
  start: (src: string) => src.match(/^[ \t]*→/m)?.index,

  tokenizer(src: string) {
    const match = PROOF_BLOCK.exec(src);
    if (!match) return undefined;

    const rows = match[0]
      .split("\n")
      .filter((line) => line.trim())
      .map((line): ProofRow => {
        const fields = line
          .replace(PROOF_LINE, "$1")
          .split("|")
          .map((field) => field.trim());

        const metric = fields.length >= 3 ? (fields.shift() ?? "") : "";
        const [linkField = "", ...rest] = fields;
        // Re-join so a description may itself contain a pipe.
        const description = rest.join(" | ");
        const link = PROOF_LINK.exec(linkField);

        return {
          metric: this.lexer.inlineTokens(metric),
          label: link ? (link[1] ?? "") : linkField,
          href: link?.[2] ?? "",
          description: this.lexer.inlineTokens(description),
        };
      });

    const token: ProofCardsToken = { type: "proofCards", raw: match[0], rows };
    return token as unknown as Token;
  },

  renderer(token) {
    const { rows } = token as unknown as ProofCardsToken;

    const cards = rows.map((row) => {
      const metric = row.metric.length
        ? `<span class="ark-md-proof-metric">${this.parser.parseInline(row.metric)}</span>`
        : "";
      const description = row.description.length
        ? `<span class="ark-md-proof-desc">${this.parser.parseInline(row.description)}</span>`
        : "";
      const body =
        metric +
        `<span class="ark-md-proof-title">${escapeHtml(row.label)}</span>` +
        description;

      // Without a usable link the evidence still reads — it just is not
      // clickable — rather than collapsing into a broken anchor.
      if (!row.href || !isSafeUrl(row.href)) {
        return `<li class="ark-md-proof">${body}</li>`;
      }

      const href = escapeAttribute(row.href);
      const attrs = linkTargetAttributes(row.href);
      return (
        "<li class=\"ark-md-proof\">" +
        `<a class="ark-md-proof-link" href="${href}"${attrs}>${body}</a>` +
        "</li>"
      );
    });

    return `<ul class="ark-md-proofs">${cards.join("")}</ul>\n`;
  },
});
