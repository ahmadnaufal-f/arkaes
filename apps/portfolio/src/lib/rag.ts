// Shared RAG wiring for the portfolio's server routes. Reads server-only env
// and builds an ingestor / retriever, or returns null when Supabase isn't
// configured (so chat falls back to the static knowledge base, and the admin
// UI reports "not configured" instead of crashing).
import {
  createSupabaseIngestor,
  createSupabaseRetriever,
  type Ingestor,
  type Retriever,
} from "@arkaes/chatbot/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY ?? "";

export const ragConfigured = Boolean(supabaseUrl && supabaseKey && openaiApiKey);

export const getIngestor = (): Ingestor | null => {
  if (!supabaseUrl || !supabaseKey || !openaiApiKey) return null;
  return createSupabaseIngestor({ supabaseUrl, supabaseKey, openaiApiKey });
};

export const getRetriever = (): Retriever | null => {
  if (!supabaseUrl || !supabaseKey || !openaiApiKey) return null;
  return createSupabaseRetriever({ supabaseUrl, supabaseKey, openaiApiKey });
};
