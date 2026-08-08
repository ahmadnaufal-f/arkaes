import type { Token, TokenizerAndRendererExtension } from "marked";
import type { ResolvedMarkdownOptions } from "../options";
import { escapeAttribute, escapeHtml, isSafeUrl } from "../safety";

/**
 * A block of one or more `![alt](src)` lines. Consecutive lines render together,
 * e.g. a row of phone screenshots.
 *
 * An `.svg` whose basename is present in the `diagrams` map is inlined so the
 * page's loaded fonts apply inside it; everything else renders as an `<img>`.
 * Raster images are treated as screenshots — constrained, framed, captioned.
 */
const IMAGE_BLOCK = /^(?:[ \t]*!\[[^\]]*\]\([^)\s]+\)[ \t]*(?:\n|$))+/;
const IMAGE_LINE = /^[ \t]*!\[([^\]]*)\]\(([^)\s]+)\)[ \t]*$/;

interface FigureRow {
  alt: string;
  src: string;
}

interface FiguresToken {
  type: "figures";
  raw: string;
  rows: FigureRow[];
}

const diagramKey = (src: string): string =>
  src.split("/").pop()?.replace(/\.svg$/i, "") ?? "";

export const figuresExtension = (
  options: ResolvedMarkdownOptions,
): TokenizerAndRendererExtension => ({
  name: "figures",
  level: "block",
  start: (src: string) => src.match(/^[ \t]*!\[/m)?.index,

  tokenizer(src: string) {
    const match = IMAGE_BLOCK.exec(src);
    if (!match) return undefined;

    const rows: FigureRow[] = [];
    for (const line of match[0].split("\n")) {
      const parsed = IMAGE_LINE.exec(line);
      if (parsed) rows.push({ alt: parsed[1] ?? "", src: parsed[2] ?? "" });
    }
    if (!rows.length) return undefined;

    const token: FiguresToken = { type: "figures", raw: match[0], rows };
    return token as unknown as Token;
  },

  renderer(token) {
    const { rows } = token as unknown as FiguresToken;
    let hasScreenshot = false;

    const figures = rows.map((row) => {
      const alt = escapeHtml(row.alt);
      if (!isSafeUrl(row.src)) return "";
      const src = escapeAttribute(row.src);

      if (/\.svg$/i.test(row.src)) {
        const inline = options.diagrams[diagramKey(row.src)];
        if (inline) {
          return (
            `<figure class="ark-md-figure" role="img" aria-label="${alt}">` +
            `${inline}</figure>`
          );
        }
        return (
          "<figure class=\"ark-md-figure\">" +
          `<img src="${src}" alt="${alt}" class="ark-md-diagram" /></figure>`
        );
      }

      hasScreenshot = true;
      const caption = alt ? `<figcaption>${alt}</figcaption>` : "";
      return (
        "<figure class=\"ark-md-shot\">" +
        `<img src="${src}" alt="${alt}" class="ark-md-screenshot" loading="lazy" />` +
        `${caption}</figure>`
      );
    });

    if (hasScreenshot) {
      return (
        `<div class="ark-md-shots" data-count="${figures.length}">` +
        `${figures.join("")}</div>\n`
      );
    }
    return `${figures.join("")}\n`;
  },
});
