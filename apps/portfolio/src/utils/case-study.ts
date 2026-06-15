export interface CaseStudySection {
  heading: string;
  content: string;
}

export function parseSections(body: string): CaseStudySection[] {
  // Prepend newline so every ## heading is preceded by \n for consistent splitting
  const text = "\n" + body.trim();
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderSectionHtml(
  markdown: string,
  diagrams: Record<string, string> = {},
): string {
  const parts: string[] = [];

  // Extract code blocks first to avoid processing their internals
  const codeBlocks: string[] = [];
  const withPlaceholders = markdown.replace(
    /```[\w]*\n([\s\S]*?)```/g,
    (_, code: string) => {
      const idx = codeBlocks.length;
      codeBlocks.push(code.trimEnd());
      return `%%CB_${idx}%%`;
    },
  );

  // Split into paragraph blocks
  const blocks = withPlaceholders.split(/\n\n+/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Code block placeholder
    const cbMatch = trimmed.match(/^%%CB_(\d+)%%$/);
    if (cbMatch) {
      const idx = parseInt(cbMatch[1]);
      parts.push(
        `<pre class="cs-code"><code>${escapeHtml(codeBlocks[idx] ?? "")}</code></pre>`,
      );
      continue;
    }

    // Image block — one or more ![alt](src) lines (consecutive lines render
    // together, e.g. a row of phone screenshots)
    const blockLines = trimmed.split("\n").filter((l) => l.trim());
    const imgRe = /^!\[([^\]]*)\]\(([^)]+)\)$/;
    if (blockLines.length > 0 && blockLines.every((l) => imgRe.test(l.trim()))) {
      let hasScreenshot = false;
      const figures = blockLines.map((line) => {
        const [, rawAlt, src] = line.trim().match(imgRe)!;
        const alt = escapeHtml(rawAlt);
        if (src.endsWith(".svg")) {
          const key = src.split("/").pop()?.replace(".svg", "") ?? "";
          if (key && diagrams[key]) {
            // Inline the SVG so the page's loaded fonts apply inside it
            return `<figure class="cs-figure" role="img" aria-label="${alt}">${diagrams[key]}</figure>`;
          }
          return `<figure class="cs-figure"><img src="${escapeHtml(src)}" alt="${alt}" class="cs-diagram" /></figure>`;
        }
        // Raster image (screenshot) — constrained, framed, with a caption
        hasScreenshot = true;
        return `<figure class="cs-shot"><img src="${escapeHtml(src)}" alt="${alt}" class="cs-screenshot" loading="lazy" />${alt ? `<figcaption>${alt}</figcaption>` : ""}</figure>`;
      });

      if (hasScreenshot) {
        parts.push(
          `<div class="cs-shots" data-count="${figures.length}">${figures.join("")}</div>`,
        );
      } else {
        parts.push(figures.join(""));
      }
      continue;
    }

    // ### Subheading
    if (trimmed.startsWith("### ")) {
      parts.push(`<h4 class="cs-subheading">${trimmed.substring(4)}</h4>`);
      continue;
    }

    // Bullet list — block where at least one line starts with •
    const lines = trimmed.split("\n");
    if (lines.some((l) => l.trim().startsWith("•"))) {
      const items = lines
        .filter((l) => l.trim())
        .map((l) => {
          const t = l.trim();
          return t.startsWith("•")
            ? `<li>${t.substring(1).trim()}</li>`
            : `<p>${t}</p>`;
        });
      parts.push(`<ul class="cs-list">${items.join("")}</ul>`);
      continue;
    }

    // Regular paragraph — supports inline [text](url) links
    const rendered = trimmed
      .replace(/\n/g, " ")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        (_, text, href) =>
          `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`,
      );
    parts.push(`<p>${rendered}</p>`);
  }

  return parts.join("");
}
