import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { chunkText, type ChunkOptions } from "./chunk";
import {
  createEmbedder,
  DEFAULT_EMBEDDING_MODEL,
  type Embedder,
} from "./embeddings";

export interface IngestDocument {
  content: string;
  /** Stable identifier for the document, e.g. "project:treely-app". */
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface IngestResult {
  documents: number;
  chunks: number;
}

export interface SupabaseIngestorOptions {
  supabaseUrl: string;
  supabaseKey: string;
  openaiApiKey: string;
  embedder?: Embedder;
  embeddingModel?: string;
  client?: SupabaseClient;
  /** Table name. Default "documents". */
  table?: string;
  /** Chunking options applied to every document. */
  chunk?: ChunkOptions;
  /** Embeddings + inserts are batched at this size. Default 96. */
  batchSize?: number;
}

export interface Ingestor {
  /** Chunk, embed, and insert documents. Returns counts. */
  ingest(documents: IngestDocument[]): Promise<IngestResult>;
  /** Delete every row in the table. Returns rows removed. */
  clearAll(): Promise<number>;
  /** Delete rows for one source (for idempotent re-ingest). */
  clearSource(source: string): Promise<number>;
}

interface PendingChunk {
  content: string;
  source: string | null;
  metadata: Record<string, unknown>;
  chunkIndex: number;
}

interface DocumentRow {
  content: string;
  source: string | null;
  metadata: Record<string, unknown>;
  chunk_index: number;
  embedding: number[];
}

/** Create an ingestor that writes embedded chunks into Supabase pgvector. */
export const createSupabaseIngestor = (
  options: SupabaseIngestorOptions,
): Ingestor => {
  const table = options.table ?? "documents";
  const batchSize = options.batchSize ?? 96;

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
    async ingest(documents) {
      const pending: PendingChunk[] = [];
      for (const document of documents) {
        chunkText(document.content, options.chunk).forEach(
          (content, chunkIndex) => {
            pending.push({
              content,
              source: document.source ?? null,
              metadata: document.metadata ?? {},
              chunkIndex,
            });
          },
        );
      }
      if (pending.length === 0) {
        return { documents: documents.length, chunks: 0 };
      }

      for (let i = 0; i < pending.length; i += batchSize) {
        const batch = pending.slice(i, i + batchSize);
        const embeddings = await embedder.embedBatch(
          batch.map((row) => row.content),
        );
        const rows: DocumentRow[] = batch.map((row, index) => ({
          content: row.content,
          source: row.source,
          metadata: row.metadata,
          chunk_index: row.chunkIndex,
          embedding: embeddings[index] ?? [],
        }));
        const { error } = await client.from(table).insert(rows);
        if (error) throw new Error(`Insert failed: ${error.message}`);
      }
      return { documents: documents.length, chunks: pending.length };
    },

    async clearAll() {
      const { error, count } = await client
        .from(table)
        .delete({ count: "exact" })
        .not("id", "is", null);
      if (error) throw new Error(`Clear failed: ${error.message}`);
      return count ?? 0;
    },

    async clearSource(source) {
      const { error, count } = await client
        .from(table)
        .delete({ count: "exact" })
        .eq("source", source);
      if (error) throw new Error(`Clear failed: ${error.message}`);
      return count ?? 0;
    },
  };
};
