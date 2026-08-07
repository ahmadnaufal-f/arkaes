// Section splitting and plain-text extraction for the long-form pages (case
// studies, projects, about). The markdown rendering itself is @arkaes/ui's
// shared renderer — see renderSectionHtml at the bottom.
import { renderMarkdown } from "@arkaes/ui/markdown";

export interface Section {
  heading: string;
  content: string;
}

export function parseSections(body: string): Section[] {
  // Normalize line endings to LF for consistent splitting
  const text = "\n" + body.replace(/\r\n/g, "\n").trim();
  const rawSections = text.split(/\n## /);

  return rawSections
    .filter((s) => s.trim())
    .map((s) => {
      const nl = s.indexOf("\n");
      if (nl === -1) return { heading: s.trim(), content: "" };
      return {
        heading: s.substring(0, nl).trim(),
        content: s.substring(nl + 1).trim(),
      };
    });
}

/** Strip inline markdown emphasis/links, for plain-text teasers (e.g. card summaries). */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)/g, "$1");
}

/**
 * Render one section's markdown to HTML.
 *
 * Delegates to the design system's renderer in "section" heading mode: every
 * heading level is shifted down one, because a section's own `##` title is
 * already carried by the accordion trigger above the body, so a `###` in the
 * source is an `<h4>` in the DOM.
 *
 * These pages are written by the repo's own .md files, so the content is
 * trusted — which is also what lets `diagrams` inline SVG source.
 */
export function renderSectionHtml(
  markdown: string,
  diagrams: Record<string, string> = {},
): string {
  return renderMarkdown(markdown, {
    diagrams,
    features: ["proof-cards", "figures", "glyph-bullets"],
    headings: "section",
    trust: "trusted",
  });
}
