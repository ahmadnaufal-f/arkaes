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

export function renderSectionHtml(markdown: string): string {
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

    // Image: ![alt](src)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const alt = escapeHtml(imgMatch[1]);
      const src = escapeHtml(imgMatch[2]);
      parts.push(
        `<figure class="cs-figure"><img src="${src}" alt="${alt}" class="cs-diagram" /></figure>`,
      );
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

    // Regular paragraph
    parts.push(`<p>${trimmed.replace(/\n/g, " ")}</p>`);
  }

  return parts.join("");
}
