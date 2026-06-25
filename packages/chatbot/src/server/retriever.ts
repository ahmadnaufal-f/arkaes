import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  createEmbedder,
  DEFAULT_EMBEDDING_MODEL,
  type Embedder,
} from "./embeddings";
import type { RetrievedChunk } from "./retrieval";

export interface RetrieveOptions {
  /** How many chunks to fetch. Default 5. */
  matchCount?: number;
  /** Drop chunks below this cosine similarity. Default 0.3. */
  minSimilarity?: number;
  /** Restrict to rows whose metadata contains this object. */
  filter?: Record<string, unknown>;
}

export interface Retriever {
  retrieve(query: string, options?: RetrieveOptions): Promise<RetrievedChunk[]>;
}

export interface SupabaseRetrieverOptions {
  supabaseUrl: string;
  supabaseKey: string;
  openaiApiKey: string;
  /** Reuse an embedder instead of constructing one from `openaiApiKey`. */
  embedder?: Embedder;
  embeddingModel?: string;
  /** Reuse a Supabase client. */
  client?: SupabaseClient;
  /** RPC function name. Default "match_documents". */
  matchFunction?: string;
  matchCount?: number;
  minSimilarity?: number;
}

interface MatchRow {
  content: string;
  source: string | null;
  similarity: number;
  metadata: Record<string, unknown> | null;
}

/**
 * Create a retriever backed by Supabase pgvector. It embeds the query with
 * OpenAI and calls the `match_documents` RPC for nearest-neighbour chunks.
 */
export const createSupabaseRetriever = (
  options: SupabaseRetrieverOptions,
): Retriever => {
  const matchFunction = options.matchFunction ?? "match_documents";
  const defaultMatchCount = options.matchCount ?? 5;
  const defaultMinSimilarity = options.minSimilarity ?? 0.3;

  const client =
    options.client ??
    createClient(options.supabaseUrl, options.supabaseKey, {
      auth: { persistSession: false },
    });

  const embedder =
    options.embedder ??
    createEmbedder({
      apiKey: options.openaiApiKey,
      model: options.embeddingModel ?? DEFAULT_EMBEDDING_MODEL,
    });

  return {
    async retrieve(query, retrieveOptions = {}) {
      const trimmed = query.trim();
      if (!trimmed) return [];

      const matchCount = retrieveOptions.matchCount ?? defaultMatchCount;
      const minSimilarity =
        retrieveOptions.minSimilarity ?? defaultMinSimilarity;

      const embedding = await embedder.embed(trimmed);
      const { data, error } = await client.rpc(matchFunction, {
        query_embedding: embedding,
        match_count: matchCount,
        filter: retrieveOptions.filter ?? {},
      });
      if (error) throw new Error(`Retrieval failed: ${error.message}`);

      const rows = (data ?? []) as MatchRow[];
      return rows
        .filter((row) => row.similarity >= minSimilarity)
        .map((row) => ({
          content: row.content,
          source: row.source ?? undefined,
          similarity: row.similarity,
          metadata: row.metadata ?? undefined,
        }));
    },
  };
};
