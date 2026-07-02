// Minimal, safe Markdown renderer for assistant messages.
//
// Arkhe replies in Markdown (links, bold, lists, code). This turns a known
// subset into HTML for Lit's `unsafeHTML`. It is safe by construction: the
// source is HTML-escaped FIRST, so any raw HTML or <script> in the model's
// output is inert, and we only ever re-introduce a fixed set of tags. Links are
// restricted to http(s)/mailto to block `javascript:` URLs.

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SAFE_URL = /^(https?:|mailto:)/i;

// Private-use sentinel (never a control char, so it passes no-control-regex)
// used to shield code spans and links from later inline passes.
const MARK = "";
const markPattern = new RegExp(`${MARK}(\\d+)${MARK}`, "g");

/** Render inline Markdown on already-HTML-escaped text. */
const renderInline = (escaped: string): string => {
  const stash: string[] = [];
  const keep = (fragment: string): string => {
    stash.push(fragment);
    return `${MARK}${stash.length - 1}${MARK}`;
  };

  let out = escaped;

  // Code spans and links are protected from bold/italic (their contents may
  // contain * or _, e.g. URLs with underscores).
  out = out.replace(/`([^`]+)`/g, (_m, code: string) => keep(`<code>${code}</code>`));
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (match, label: string, url: string) => {
      if (!SAFE_URL.test(url)) return match;
      const href = url.replace(/"/g, "&quot;");
      return keep(
        `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`,
      );
    },
  );

  out = out.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
  out = out.replace(/(^|[^\w])_([^_\n]+?)_(?=[^\w]|$)/g, "$1<em>$2</em>");

  return out.replace(markPattern, (_m, index: string) => stash[Number(index)] ?? "");
};

const UNORDERED = /^\s*[-*+]\s+/;
const ORDERED = /^\s*\d+\.\s+/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const QUOTE = /^&gt;\s?/; // '>' is escaped to &gt; before block parsing
const FENCE = /^```/;

/** Render a Markdown string to a safe HTML string. */
export const renderMarkdown = (source: string): string => {
  const lines = escapeHtml(source.replace(/\r\n/g, "\n")).split("\n");
  const blocks: string[] = [];
  let i = 0;
  const at = (index: number): string => lines[index] ?? "";
  const isBlank = (line: string): boolean => line.trim() === "";
  const isSpecial = (line: string): boolean =>
    FENCE.test(line) ||
    HEADING.test(line) ||
    QUOTE.test(line) ||
    UNORDERED.test(line) ||
    ORDERED.test(line);

  while (i < lines.length) {
    const line = at(i);

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    if (FENCE.test(line)) {
      i += 1;
      const code: string[] = [];
      while (i < lines.length && !FENCE.test(at(i))) {
        code.push(at(i));
        i += 1;
      }
      i += 1; // closing fence
      blocks.push(`<pre><code>${code.join("\n")}</code></pre>`);
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push(`<p class="md-h">${renderInline(heading[2] ?? "")}</p>`);
      i += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && QUOTE.test(at(i))) {
        quote.push(at(i).replace(QUOTE, ""));
        i += 1;
      }
      blocks.push(`<blockquote>${renderInline(quote.join(" "))}</blockquote>`);
      continue;
    }

    if (UNORDERED.test(line)) {
      const items: string[] = [];
      while (i < lines.length && UNORDERED.test(at(i))) {
        items.push(`<li>${renderInline(at(i).replace(UNORDERED, ""))}</li>`);
        i += 1;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (ORDERED.test(line)) {
      const items: string[] = [];
      while (i < lines.length && ORDERED.test(at(i))) {
        items.push(`<li>${renderInline(at(i).replace(ORDERED, ""))}</li>`);
        i += 1;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && !isBlank(at(i)) && !isSpecial(at(i))) {
      paragraph.push(at(i));
      i += 1;
    }
    blocks.push(`<p>${paragraph.map(renderInline).join("<br>")}</p>`);
  }

  return blocks.join("");
};
