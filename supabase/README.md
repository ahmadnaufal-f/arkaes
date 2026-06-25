# Supabase — Arkhe RAG store

Vector store for the chatbot's retrieval-augmented generation. The schema lives
in `migrations/` and the retrieval/ingest code is in `@arkaes/chatbot/server`.

## Setup

1. Create a Supabase project (or run the local stack with the Supabase CLI).
2. Apply the migration:
   - **Dashboard:** paste `migrations/0001_init_rag.sql` into the SQL editor and
     run it.
   - **CLI:** `supabase db push` (with this repo linked to your project).
3. Grab these from Project Settings → API and put them in
   `apps/portfolio/.env` (server-only — never expose the service-role key):

   ```sh
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   OPENAI_API_KEY=<openai-key>
   ```

## What the migration creates

- `documents` — `content`, `source`, `chunk_index`, `metadata` (jsonb), and a
  `vector(1536)` `embedding`, with an HNSW cosine index.
- `match_documents(query_embedding, match_count, filter)` — nearest-neighbour
  search returning cosine `similarity` in `[0, 1]`.
- RLS is **enabled with no public policy**: only the service-role key (used by
  the server and the ingest CLI) can read or write.

## Loading knowledge

From the portfolio app:

```sh
pnpm --filter @arkaes/portfolio ingest            # ingest site content
pnpm --filter @arkaes/portfolio ingest --clear    # wipe, then re-ingest
pnpm --filter @arkaes/portfolio ingest --dry-run  # preview, no writes
```

> Embedding model and vector size must match between the SQL (`vector(1536)`)
> and `packages/chatbot/src/server/embeddings.ts` (`EMBEDDING_DIMENSIONS`).
