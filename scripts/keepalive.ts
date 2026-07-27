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

/**
 * Best-effort read of the Postgres role a Supabase API key maps to.
 *
 * Legacy keys are unsigned-readable JWTs carrying a `role` claim ("anon" or
 * "service_role"); newer keys are opaque and only tell you apart by prefix.
 * Returns null when the format isn't recognised — this is a diagnostic, so it
 * must never block a key it simply doesn't understand.
 *
 * Worth the few lines because the anon and service-role keys look alike in the
 * dashboard, and swapping them surfaces as an opaque "violates row-level
 * security policy" from Postgres rather than anything mentioning the key.
 */
const readKeyRole = (key: string): string | null => {
  if (key.startsWith("sb_secret_")) return "service_role";
  if (key.startsWith("sb_publishable_")) return "anon";

  const payload = key.split(".")[1];
  if (!payload) return null;

  try {
    const claims: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof claims !== "object" || claims === null) return null;
    const role = (claims as { role?: unknown }).role;
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
};

const WRONG_KEY_HINT =
  "`keepalive_heartbeat` has RLS enabled with no public policy, so only the "
  + "service-role key can write to it. Copy it from Project Settings → API "
  + "(labelled `service_role` `secret`, not `anon` `public`).";

const main = async (): Promise<void> => {
  const supabaseKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const role = readKeyRole(supabaseKey);
  if (role !== null && role !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY holds a "${role}" key, not the service-role key. `
      + WRONG_KEY_HINT,
    );
  }

  const supabase = createClient(
    requireEnv("SUPABASE_URL"),
    supabaseKey,
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

  if (error) {
    // An RLS rejection means the key authenticated but did not bypass RLS, so
    // it is not the service-role key — say so, since Postgres won't.
    const hint = /row-level security/i.test(error.message) ? ` ${WRONG_KEY_HINT}` : "";
    throw new Error(`Heartbeat write failed: ${error.message}.${hint}`);
  }

  console.log(`[keepalive] wrote heartbeat: id=${data.id} pinged_at=${data.pinged_at}`);
};

main().catch((error: unknown) => {
  console.error("[keepalive]", error instanceof Error ? error.message : error);
  process.exit(1);
});
