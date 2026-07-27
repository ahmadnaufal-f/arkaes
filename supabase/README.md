# Supabase — Arkhe RAG store

Vector store for the chatbot's retrieval-augmented generation. The schema lives
in `migrations/` and the retrieval/ingest code is in `@arkaes/chatbot/server`.

## Setup

1. Create a Supabase project (or run the local stack with the Supabase CLI).
2. Apply the migrations (in order):
   - **Dashboard:** paste each file in `migrations/` into the SQL editor and run
     it.
   - **CLI:** `supabase db push` (with this repo linked to your project).
3. Grab these from Project Settings → API and put them in
   `apps/portfolio/.env` (server-only — never expose the service-role key):

   ```sh
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   OPENAI_API_KEY=<openai-key>
   ```

## What the migrations create

- `documents` (`0001`) — `content`, `source`, `chunk_index`, `metadata` (jsonb),
  and a `vector(1536)` `embedding`, with an HNSW cosine index. One row per chunk.
- `match_documents(query_embedding, match_count, filter)` (`0001`) —
  nearest-neighbour search returning cosine `similarity` in `[0, 1]`.
- `document_sources` (`0002`) — the exact pre-chunk text keyed by `source`
  (`content`, `metadata`, timestamps). Chunking is lossy, so this preserves the
  original for editing in the admin UI and for future re-chunking/re-embedding.
- `keepalive_heartbeat` (`0003`) — a single row (`id = 1`) whose `pinged_at` is
  rewritten by the keep-alive job. See below.
- RLS is **enabled with no public policy** on all three tables: only the
  service-role key (used by the server, the ingest CLI, and the keep-alive
  script) can read or write.

## Keeping the project awake

Free-tier Supabase projects pause after 7 days of inactivity, and read-only
queries don't reliably reset that timer — only a write does. `scripts/keepalive.ts`
upserts the `keepalive_heartbeat` row, and
`.github/workflows/keepalive.yml` runs it every 3 days (plus on-demand via
**workflow_dispatch**).

Set these two **repository secrets** (Settings → Secrets and variables →
Actions) to the same values used locally:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Run it by hand with `pnpm keepalive` (it exits non-zero if the write fails).

> GitHub disables scheduled workflows in repos with no activity for 60 days. If
> the repo goes quiet, re-enable the workflow from the Actions tab.

## Loading knowledge

From the portfolio app:

```sh
pnpm --filter @arkaes/portfolio ingest            # ingest site content
pnpm --filter @arkaes/portfolio ingest --clear    # wipe, then re-ingest
pnpm --filter @arkaes/portfolio ingest --dry-run  # preview, no writes
```

Or use the admin UI at **`/admin/knowledge`** to paste documents, see what's
loaded, edit a source's original text, and clear sources. It's gated by HTTP
Basic Auth — set `ADMIN_PASSWORD`
(and optionally `ADMIN_USER`, default `admin`) to enable it. Without
`ADMIN_PASSWORD` the admin routes return `503`.

> Embedding model and vector size must match between the SQL (`vector(1536)`)
> and `packages/chatbot/src/server/embeddings.ts` (`EMBEDDING_DIMENSIONS`).
