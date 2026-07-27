-- Keep-alive heartbeat for the Arkhe RAG store. Free-tier Supabase projects
-- pause after 7 days of inactivity, and read-only queries do not reliably reset
-- that timer — only a write does. `scripts/keepalive.ts` (driven by
-- .github/workflows/keepalive.yml every 3 days) upserts the single row here so
-- the project always has a recent write.
--
-- Deliberately one row: the `singleton` check constraint pins `id` to 1, so the
-- table can never grow and the upsert is always a no-op-sized update.

create table if not exists keepalive_heartbeat (
  id         int primary key default 1,
  pinged_at  timestamptz not null default now(),
  constraint singleton check (id = 1)
);

insert into keepalive_heartbeat (id) values (1)
  on conflict (id) do nothing;

-- Row Level Security: same posture as `documents` and `document_sources` —
-- enabled with no public policy, so only the service-role key (used by the
-- keep-alive script) can read or write. Without this the anon key could rewrite
-- the heartbeat.
alter table keepalive_heartbeat enable row level security;
