// Lightweight retrieval types + formatting, free of any openai/supabase imports
// so `knowledge.ts` (and thus the prompt builder) can use them without pulling
// in the heavy server SDKs.

import type { SourceCitation } from "../shared/types";

export interface RetrievedChunk {
  content: string;
  /** Where the chunk came from, e.g. "project:treely-app". */
  source?: string;
  /** Cosine similarity in [0, 1]; higher is closer. */
  similarity?: number;
  metadata?: Record<string, unknown>;
}

/** Human-facing identity of a source: what to show, and where it links. */
export interface CitationInfo {
  /** Display name, e.g. "Treely case study". */
  label: string;
  /** Link to the source's page, when it has one. */
  url?: string;
}

/**
 * Map a retrieved chunk to how it should be cited. Injected by the host app so
 * this package stays free of any site-specific URL scheme. The default just
 * echoes the raw source id.
 */
export type ResolveCitation = (chunk: RetrievedChunk) => CitationInfo;

export const defaultResolveCitation: ResolveCitation = (chunk) => ({
  label: chunk.source ?? "source",
});

/** A numbered, deduplicated source the assistant can cite as `[number]`. */
export interface Citation extends CitationInfo {
  number: number;
  source: string;
}

export interface BuiltCitations {
  /** Distinct cited sources in first-seen order, numbered from 1. */
  citations: Citation[];
  /**
   * Citation number for each input chunk, aligned by index. `undefined` when a
   * chunk has no source and so cannot be cited.
   */
  numbers: (number | undefined)[];
}

/**
 * Assign citation numbers to retrieved chunks. Chunks that share a `source`
 * collapse to a single citation, so several excerpts from one document are all
 * cited with the same number.
 */
export const buildCitations = (
  chunks: RetrievedChunk[],
  resolve: ResolveCitation = defaultResolveCitation,
): BuiltCitations => {
  const bySource = new Map<string, Citation>();
  const citations: Citation[] = [];

  const numbers = chunks.map((chunk) => {
    if (!chunk.source) return undefined;
    const existing = bySource.get(chunk.source);
    if (existing) return existing.number;
    const info = resolve(chunk);
    const citation: Citation = {
      number: citations.length + 1,
      source: chunk.source,
      label: info.label,
      url: info.url,
    };
    bySource.set(chunk.source, citation);
    citations.push(citation);
    return citation.number;
  });

  return { citations, numbers };
};

/**
 * Render retrieved chunks into a numbered, source-attributed block. Each chunk
 * is tagged with its citation number and label so the model can cite it as
 * `[number]`. Chunks with no citation fall back to their raw source id.
 */
export const formatRetrievedKnowledge = (
  chunks: RetrievedChunk[],
  numbers: (number | undefined)[] = [],
  citations: Citation[] = [],
): string =>
  chunks
    .map((chunk, index) => {
      const number = numbers[index];
      const citation = citations.find((entry) => entry.number === number);
      const tag = citation
        ? `[${citation.number}] ${citation.label}`
        : chunk.source
          ? `[source: ${chunk.source}]`
          : `[${index + 1}]`;
      return `${tag}\n${chunk.content}`;
    })
    .join("\n\n");

/** All distinct citation numbers referenced as `[n]` (or `[1, 2]`) in `text`. */
const citedNumbers = (text: string): Set<number> => {
  const found = new Set<number>();
  const pattern = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
  for (const match of text.matchAll(pattern)) {
    for (const part of (match[1] ?? "").split(",")) {
      const value = Number.parseInt(part.trim(), 10);
      if (Number.isFinite(value)) found.add(value);
    }
  }
  return found;
};

/**
 * Pick the sources the assistant actually cited in `text`, in citation order,
 * as the payload the widget renders. Sources that were retrieved but never
 * referenced are dropped, so the "Sources" list only shows what informed the
 * answer.
 */
export const selectCitedSources = (
  text: string,
  citations: Citation[],
): SourceCitation[] => {
  const used = citedNumbers(text);
  return citations
    .filter((citation) => used.has(citation.number))
    .map((citation) => ({
      n: citation.number,
      label: citation.label,
      ...(citation.url ? { url: citation.url } : {}),
    }));
};
