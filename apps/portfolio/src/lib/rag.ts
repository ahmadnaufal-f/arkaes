// Shared RAG wiring for the portfolio's server routes. Reads server-only env
// and builds an ingestor / retriever, or returns null when Supabase isn't
// configured (so chat falls back to the static knowledge base, and the admin
// UI reports "not configured" instead of crashing).
import {
  createJobDescriptionExtractor,
  createSupabaseIngestor,
  createSupabaseRetriever,
  type Extractor,
  type Ingestor,
  type Retriever,
} from "@arkaes/chatbot/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY ?? "";

// Extraction reuses the chat model (default gpt-5.4-nano), overridable via
// OPENAI_MODEL to stay in lockstep with the chatbot endpoint.
const openaiModel = process.env.OPENAI_MODEL || undefined;

export const ragConfigured = Boolean(supabaseUrl && supabaseKey && openaiApiKey);

export const getIngestor = (): Ingestor | null => {
  if (!supabaseUrl || !supabaseKey || !openaiApiKey) return null;
  return createSupabaseIngestor({ supabaseUrl, supabaseKey, openaiApiKey });
};

export const getRetriever = (): Retriever | null => {
  if (!supabaseUrl || !supabaseKey || !openaiApiKey) return null;
  return createSupabaseRetriever({ supabaseUrl, supabaseKey, openaiApiKey });
};

// Only needs the OpenAI key (no Supabase) — but the CV-retrieval route that
// uses it also needs a retriever, so it gates on `ragConfigured` anyway.
export const getExtractor = (): Extractor | null => {
  if (!openaiApiKey) return null;
  return createJobDescriptionExtractor({
    apiKey: openaiApiKey,
    model: openaiModel,
  });
};
