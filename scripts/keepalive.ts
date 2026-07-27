/**
 * Keep the Supabase project awake.
 *
 *   pnpm keepalive
 *
 * Free-tier Supabase projects pause after 7 days of inactivity, and read-only
 * queries do not reliably reset that timer — only a write does. This upserts the
 * single `keepalive_heartbeat` row (see
 * supabase/migrations/0003_keepalive_heartbeat.sql), which is a real write on
 * every run. Scheduled every 3 days by .github/workflows/keepalive.yml.
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. The table has RLS enabled
 * with no public policy, so the service-role key is what makes the write land —
 * keep it secret (repo secret in CI, never client-side).
 */
import { createClient } from "@supabase/supabase-js";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
};

const main = async (): Promise<void> => {
  const supabase = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  );

  // Equivalent to:
  //   insert into keepalive_heartbeat (id, pinged_at) values (1, now())
  //   on conflict (id) do update set pinged_at = now();
  // PostgREST has no way to call now() in the payload, so the timestamp is
  // generated here. The write itself is what matters, not its source of truth.
  const { data, error } = await supabase
    .from("keepalive_heartbeat")
    .upsert({ id: 1, pinged_at: new Date().toISOString() }, { onConflict: "id" })
    .select("id, pinged_at")
    .single();

  if (error) throw new Error(`Heartbeat write failed: ${error.message}`);

  console.log(`[keepalive] wrote heartbeat: id=${data.id} pinged_at=${data.pinged_at}`);
};

main().catch((error: unknown) => {
  console.error("[keepalive]", error instanceof Error ? error.message : error);
  process.exit(1);
});
