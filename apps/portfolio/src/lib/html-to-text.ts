// Cheap, dependency-free HTML → plain-text reduction. This is *not* a real
// parser — it only needs to shrink a fetched page enough that the LLM
// extraction step (which does the actual job-description isolation) gets clean,
// affordable input. It drops whole non-content element blocks (script, style,
// nav, footer, …), converts the rest to text, and collapses whitespace.

// Element blocks whose *contents* are never body copy — removed wholesale.
const DROPPED_BLOCKS = [
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "nav",
  "footer",
  "header",
  "aside",
  "form",
];

const decodeEntities = (text: string): string =>
  text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );

/** Reduce an HTML document to collapsed plain text. */
export const htmlToText = (html: string): string => {
  let text = html;

  // Strip the <head> entirely — title/meta aside, it is all machinery.
  text = text.replace(/<head[\s\S]*?<\/head>/gi, " ");

  // Remove dropped element blocks, including their content.
  for (const tag of DROPPED_BLOCKS) {
    const block = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, "gi");
    text = text.replace(block, " ");
    // Self-closing / unclosed variants (e.g. a stray <svg .../>).
    text = text.replace(new RegExp(`<${tag}[^>]*\\/?>`, "gi"), " ");
  }

  // HTML comments.
  text = text.replace(/<!--[\s\S]*?-->/g, " ");

  // Turn block-level boundaries into newlines so text doesn't run together.
  text = text.replace(
    /<\/(p|div|section|article|li|ul|ol|h[1-6]|tr|table|br)[^>]*>/gi,
    "\n",
  );
  text = text.replace(/<br[^>]*>/gi, "\n");

  // Drop all remaining tags.
  text = text.replace(/<[^>]+>/g, " ");

  text = decodeEntities(text);

  // Collapse runs of horizontal whitespace (spaces, tabs, NBSP, …) to a single
  // space, then squeeze blank lines down to at most one.
  return text
    .replace(/[^\S\n]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
