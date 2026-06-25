import OpenAI from "openai";

// text-embedding-3-small produces 1536-dim vectors. Keep this in sync with the
// `vector(1536)` column and `match_documents` signature in the SQL migration.
export const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

export interface Embedder {
  /** Embedding model id in use. */
  model: string;
  /** Embed a single string. */
  embed(text: string): Promise<number[]>;
  /** Embed many strings in one request, preserving input order. */
  embedBatch(texts: string[]): Promise<number[][]>;
}

export interface EmbedderOptions {
  apiKey: string;
  /** Defaults to text-embedding-3-small. */
  model?: string;
  /** Provide a pre-built OpenAI client instead of an apiKey. */
  client?: OpenAI;
}

/** Create an OpenAI-backed embedder. */
export const createEmbedder = (options: EmbedderOptions): Embedder => {
  const model = options.model ?? DEFAULT_EMBEDDING_MODEL;
  const client = options.client ?? new OpenAI({ apiKey: options.apiKey });

  const embedBatch = async (texts: string[]): Promise<number[][]> => {
    if (texts.length === 0) return [];
    const response = await client.embeddings.create({ model, input: texts });
    return [...response.data]
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);
  };

  return {
    model,
    embedBatch,
    async embed(text) {
      const [vector] = await embedBatch([text]);
      if (!vector) throw new Error("Embedding failed: empty response");
      return vector;
    },
  };
};
