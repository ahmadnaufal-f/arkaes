// Lightweight retrieval types + formatting, free of any openai/supabase imports
// so `knowledge.ts` (and thus the prompt builder) can use them without pulling
// in the heavy server SDKs.

export interface RetrievedChunk {
  content: string;
  /** Where the chunk came from, e.g. "project:treely-app". */
  source?: string;
  /** Cosine similarity in [0, 1]; higher is closer. */
  similarity?: number;
  metadata?: Record<string, unknown>;
}

/** Render retrieved chunks into a numbered, source-attributed block. */
export const formatRetrievedKnowledge = (chunks: RetrievedChunk[]): string =>
  chunks
    .map((chunk, index) => {
      const source = chunk.source ? ` — source: ${chunk.source}` : "";
      return `[${index + 1}${source}]\n${chunk.content}`;
    })
    .join("\n\n");
