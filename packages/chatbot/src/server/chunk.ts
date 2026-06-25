export interface ChunkOptions {
  /** Target maximum characters per chunk. Default 1200. */
  maxChars?: number;
  /** Character overlap when hard-splitting an oversized paragraph. Default 150. */
  overlap?: number;
}

/**
 * Split text into embedding-sized chunks. Packs whole paragraphs up to
 * `maxChars`; any single paragraph longer than `maxChars` is hard-split with a
 * small overlap so context isn't lost across the seam.
 */
export const chunkText = (text: string, options: ChunkOptions = {}): string[] => {
  const maxChars = options.maxChars ?? 1200;
  const overlap = options.overlap ?? 150;
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (normalized.length === 0) return [];
  if (normalized.length <= maxChars) return [normalized];

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    const trimmed = current.trim();
    if (trimmed) chunks.push(trimmed);
    current = "";
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      flush();
      const step = Math.max(1, maxChars - overlap);
      for (let i = 0; i < paragraph.length; i += step) {
        chunks.push(paragraph.slice(i, i + maxChars));
      }
      continue;
    }
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > maxChars) {
      flush();
      current = paragraph;
    } else {
      current = candidate;
    }
  }
  flush();
  return chunks;
};
