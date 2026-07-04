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

  // Citation markers — [3] or [3, 5] — become circular number badges. Runs
  // after code/link stashing so bracketed digits inside code spans or link
  // labels are left untouched, and the result is stashed so it survives the
  // emphasis passes below.
  out = out.replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (_m, group: string) => {
    const badges = group
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((num) => `<span class="md-cite">${num}</span>`)
      .join("");
    return keep(`<span class="md-cites">${badges}</span>`);
  });

  out = out.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
  out = out.replace(/(^|[^\w])_([^_\n]+?)_(?=[^\w]|$)/g, "$1<em>$2</em>");

  return out.replace(markPattern, (_m, index: string) => stash[Number(index)] ?? "");
};

const UNORDERED = /^\s*[-*+]\s+/;
const ORDERED = /^\s*\d+\.\s+/;
// A single list item: leading indent, marker (bullet or `N.`), then content.
const LIST_ITEM = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const QUOTE = /^&gt;\s?/; // '>' is escaped to &gt; before block parsing
const FENCE = /^```/;

/**
 * Visual indent width of a line's leading whitespace. Tabs count as two spaces
 * so tab- and space-indented nesting compare consistently (the model may emit
 * either).
 */
const indentOf = (line: string): number => {
  let width = 0;
  for (const ch of line) {
    if (ch === " ") width += 1;
    else if (ch === "\t") width += 2;
    else break;
  }
  return width;
};

/**
 * Render one list level from `region` starting at `start`. Consumes every
 * sibling item whose indent matches the first item's; deeper-indented items
 * recurse into a nested list attached to the current item, and shallower items
 * (or a marker-type switch) end this list. Returns the list HTML and the index
 * one past the last consumed line.
 */
const parseListLevel = (region: string[], start: number): [string, number] => {
  const first = LIST_ITEM.exec(region[start] ?? "");
  // Callers only enter here on a list item, so `first` is always present.
  const baseIndent = indentOf(region[start] ?? "");
  const ordered = /^\d+\./.test(first?.[2] ?? "");
  const startNum = ordered ? parseInt(first?.[2] ?? "1", 10) : 1;
  const items: string[] = [];
  let pos = start;

  while (pos < region.length) {
    const line = region[pos] ?? "";
    const match = LIST_ITEM.exec(line);

    if (!match) {
      // A wrapped continuation line for the current item (e.g. text that
      // spilled onto the next line). Join it onto the item so the run isn't
      // broken. If it dedents past this level it belongs to an outer list.
      if (indentOf(line) < baseIndent || items.length === 0) break;
      items[items.length - 1] += ` ${renderInline(line.trim())}`;
      pos += 1;
      continue;
    }

    const indent = indentOf(line);
    if (indent < baseIndent) break; // belongs to an enclosing list
    if (indent > baseIndent) {
      // Deeper indent: a nested list under the previous item.
      const [nested, next] = parseListLevel(region, pos);
      if (items.length > 0) items[items.length - 1] += nested;
      pos = next;
      continue;
    }

    // Same level: a marker-type switch starts a separate sibling list.
    if (/^\d+\./.test(match[2] ?? "") !== ordered) break;
    items.push(renderInline(match[3] ?? ""));
    pos += 1;
  }

  const tag = ordered ? "ol" : "ul";
  const startAttr = ordered && startNum !== 1 ? ` start="${startNum}"` : "";
  const lis = items.map((inner) => `<li>${inner}</li>`).join("");
  return [`<${tag}${startAttr}>${lis}</${tag}>`, pos];
};

/** Render a collected list region (possibly several sibling lists) to HTML. */
const renderListRegion = (region: string[]): string => {
  const out: string[] = [];
  let pos = 0;
  while (pos < region.length) {
    if (!LIST_ITEM.test(region[pos] ?? "")) {
      pos += 1;
      continue;
    }
    const [html, next] = parseListLevel(region, pos);
    out.push(html);
    pos = next;
  }
  return out.join("");
};

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

    if (LIST_ITEM.test(line)) {
      // Collect the whole list region — items at any indent (for nesting) plus
      // wrapped continuation lines, and blank lines only when another item
      // follows (a "loose" list). Then parse indentation into nested lists.
      const region: string[] = [];
      while (i < lines.length) {
        const current = at(i);
        if (LIST_ITEM.test(current)) {
          region.push(current);
          i += 1;
          continue;
        }
        // Indented, non-blank line: a wrapped continuation of the current item.
        if (!isBlank(current) && /^\s/.test(current) && region.length > 0) {
          region.push(current);
          i += 1;
          continue;
        }
        // Blank line: stay in the list only if a further item follows.
        if (isBlank(current)) {
          let j = i + 1;
          while (j < lines.length && isBlank(at(j))) j += 1;
          if (j < lines.length && LIST_ITEM.test(at(j))) {
            i = j;
            continue;
          }
        }
        break;
      }
      blocks.push(renderListRegion(region));
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
