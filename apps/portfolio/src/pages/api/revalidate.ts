import type { APIRoute } from "astro";

// Contentful → Vercel ISR bridge. Contentful's webhook POSTs here on
// publish/unpublish of a blog post; this endpoint re-requests the affected
// blog paths with Vercel's bypass token, which makes the edge cache re-render
// and store fresh HTML. Runs on every request (excluded from ISR in
// astro.config.mjs) so the invalidation itself is never served from cache.
export const prerender = false;

const webhookSecret = process.env.CONTENTFUL_WEBHOOK_SECRET;
const bypassToken = process.env.VERCEL_ISR_BYPASS_TOKEN;

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

  // The index always changes with any publish/unpublish; the detail page only
  // exists when we can derive a slug (unpublish payloads omit fields).
  const slug = slugFromPayload(payload);
  const paths = ["/blog", ...(slug ? [`/blog/${slug}`] : [])];

  // Re-request each path with the bypass token so Vercel bypasses the ISR
  // cache, renders fresh, and stores the result for subsequent visitors.
  const origin = new URL(request.url).origin;
  const results = await Promise.all(
    paths.map(async (path) => {
      try {
        const response = await fetch(`${origin}${path}`, {
          headers: { "x-prerender-revalidate": bypassToken },
        });
        return { path, status: response.status };
      } catch {
        return { path, status: 0 };
      }
    }),
  );

  return new Response(JSON.stringify({ revalidated: results }), {
    headers: { "content-type": "application/json" },
  });
};
