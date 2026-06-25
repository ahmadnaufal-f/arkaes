-- RAG store for the Arkhe chatbot: pgvector documents table + match function.
-- Embeddings are OpenAI text-embedding-3-small (1536 dims). If you change the
-- model/dimensions, update the vector() size here AND EMBEDDING_DIMENSIONS in
-- packages/chatbot/src/server/embeddings.ts.

create extension if not exists vector;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  source text,
  chunk_index int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

-- Approximate-nearest-neighbour index for cosine distance.
create index if not exists documents_embedding_idx
  on documents using hnsw (embedding vector_cosine_ops);

-- Helps the ingestor's per-source delete on re-ingest.
create index if not exists documents_source_idx on documents (source);

-- Nearest-neighbour search. Returns cosine similarity in [0, 1] (higher =
-- closer) and supports an optional jsonb metadata `filter` (containment).
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 5,
  filter jsonb default '{}'::jsonb
)
returns table (
  id uuid,
  content text,
  source text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    documents.source,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where documents.metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

-- Row Level Security: keep the table private. The chatbot reads and the CLI
-- writes using the service-role key, which bypasses RLS. Enabling RLS with no
-- public policy means the anon key cannot read or write.
alter table documents enable row level security;
