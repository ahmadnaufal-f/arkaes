import type { APIRoute } from "astro";

// Contentful → Vercel ISR bridge. Contentful's webhook POSTs here on
// publish/unpublish of a blog post; this endpoint re-requests the affected
// blog paths with Vercel's bypass token, which makes the edge cache re-render
// and store fresh HTML. Runs on every request (excluded from ISR in
// astro.config.mjs) so the invalidation itself is never served from cache.
export const prerender = false;

const webhookSecret = process.env.CONTENTFUL_WEBHOOK_SECRET;
const bypassToken = process.env.VERCEL_ISR_BYPASS_TOKEN;
// Deployment Protection is a separate feature from the firewall: it 401s
// automated requests on protected (e.g. preview) deployments. Optional — unset
// in production, where the deployment isn't protected.
const protectionBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

// Constant-time string comparison, same as src/middleware.ts.
const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
};

// Contentful entry fields are keyed by locale (e.g. { "en-US": "my-slug" });
// the site is single-locale so the first value is the one.
const slugFromPayload = (payload: unknown): string | null => {
  if (typeof payload !== "object" || payload === null) return null;
  const fields = (payload as { fields?: { slug?: Record<string, unknown> } }).fields;
  const localized = fields?.slug;
  if (typeof localized !== "object" || localized === null) return null;
  const value = Object.values(localized)[0];
  return typeof value === "string" && value ? value : null;
};

export const POST: APIRoute = async ({ request }) => {
  if (!webhookSecret || !bypassToken) {
    return new Response("Revalidation is not configured.", { status: 503 });
  }

  const provided = request.headers.get("x-webhook-secret") ?? "";
  if (!safeEqual(provided, webhookSecret)) {
    return new Response("Invalid webhook secret.", { status: 401 });
  }

  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    // Tolerate an empty/non-JSON body — we can still refresh the index.
  }

  // The blog index and the homepage's "Latest Writing" strip both always change
  // with any publish/unpublish; the detail page only exists when we can derive a
  // slug (unpublish payloads omit fields).
  const slug = slugFromPayload(payload);
  const paths = ["/", "/blog", ...(slug ? [`/blog/${slug}`] : [])];

  // Re-request each path with the bypass token so Vercel bypasses the ISR
  // cache, renders fresh, and stores the result for subsequent visitors. These
  // self-requests go back through the edge, so they are subject to the same
  // firewall as any other traffic — a mitigation here means nothing was
  // revalidated, even though the request "succeeded".
  const origin = new URL(request.url).origin;
  const headers: Record<string, string> = {
    "x-prerender-revalidate": bypassToken,
  };
  if (protectionBypass) headers["x-vercel-protection-bypass"] = protectionBypass;

  const results = await Promise.all(
    paths.map(async (path) => {
      try {
        const response = await fetch(`${origin}${path}`, { headers });
        // `x-vercel-mitigated` is set when the firewall intercepted the request
        // (e.g. `challenge` under Attack Challenge Mode). Treat it as a failure
        // regardless of the status the mitigation itself returned.
        const mitigated = response.headers.get("x-vercel-mitigated");
        return {
          path,
          ok: response.ok && !mitigated,
          status: response.status,
          ...(mitigated ? { mitigated } : {}),
        };
      } catch (error) {
        return { path, ok: false, status: 0, error: String(error) };
      }
    }),
  );

  // Report the truth: a blanket 200 would show green in Contentful's webhook log
  // while nothing actually refreshed. Contentful retries non-2xx, so a transient
  // failure self-heals and a persistent one stays visible.
  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error("[revalidate] failed paths", JSON.stringify(failed));
  }

  return new Response(JSON.stringify({ revalidated: results }), {
    status: failed.length > 0 ? 502 : 200,
    headers: { "content-type": "application/json" },
  });
};
