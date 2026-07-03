-- Raw pre-chunk text for the Arkhe RAG store. The `documents` table holds the
-- embedded chunks used for retrieval; chunking is lossy (whitespace is
-- normalized and oversized paragraphs are hard-split with overlap), so the
-- chunks cannot faithfully reconstruct the original. This table keeps the exact
-- text that was ingested, keyed by `source`, so the admin UI can load a document
-- back for editing and so everything can be re-chunked/re-embedded later.

create table if not exists document_sources (
  source     text primary key,
  content    text not null,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: same posture as `documents` — enabled with no public
-- policy, so only the service-role key (server + ingest CLI) can read or write.
alter table document_sources enable row level security;
