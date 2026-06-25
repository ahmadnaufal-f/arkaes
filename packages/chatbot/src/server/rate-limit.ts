// Rate limiting for the chat endpoint, with a pluggable store.
//
// The default store keeps counters in memory. Serverless instances are
// ephemeral and may run in parallel, so in-memory limiting is best-effort *per
// warm instance* — enough to blunt casual abuse from a single client. For a
// strict global limit, pass a distributed `RateLimitStore` backed by Upstash,
// Vercel KV, Redis, etc.

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Epoch millis when the current window resets. */
  resetAt: number;
  /** Seconds until the window resets (for a `Retry-After` header). */
  retryAfterSeconds: number;
}

export interface RateLimitStore {
  /**
   * Record one hit for `key` inside a `windowMs` window and return the running
   * count plus the window's reset time.
   */
  increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetAt: number }>;
}

export interface RateLimitOptions {
  /** Counter store. Defaults to an in-memory store. */
  store?: RateLimitStore;
  /** Window length in milliseconds. Defaults to 60_000 (1 minute). */
  windowMs?: number;
  /** Max requests allowed per window per client. Defaults to 15. */
  max?: number;
}

interface MemoryEntry {
  count: number;
  resetAt: number;
}

// Bound memory use: once we exceed this many tracked keys, expired entries are
// swept on the next increment.
const MAX_TRACKED_KEYS = 10_000;

/** Create an in-memory fixed-window rate limit store. */
export const createMemoryRateLimitStore = (): RateLimitStore => {
  const buckets = new Map<string, MemoryEntry>();

  const sweep = (now: number) => {
    for (const [key, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(key);
    }
  };

  return {
    increment(key, windowMs) {
      const now = Date.now();
      let entry = buckets.get(key);
      if (!entry || entry.resetAt <= now) {
        entry = { count: 0, resetAt: now + windowMs };
        buckets.set(key, entry);
      }
      entry.count += 1;
      if (buckets.size > MAX_TRACKED_KEYS) sweep(now);
      return Promise.resolve({ count: entry.count, resetAt: entry.resetAt });
    },
  };
};

/** Record a hit and evaluate it against `max` for the given window. */
export const checkRateLimit = async (
  store: RateLimitStore,
  key: string,
  windowMs: number,
  max: number,
): Promise<RateLimitResult> => {
  const { count, resetAt } = await store.increment(key, windowMs);
  return {
    allowed: count <= max,
    limit: max,
    remaining: Math.max(0, max - count),
    resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)),
  };
};

/** Standard rate-limit response headers. */
export const rateLimitHeaders = (
  result: RateLimitResult,
): Record<string, string> => ({
  "x-ratelimit-limit": String(result.limit),
  "x-ratelimit-remaining": String(result.remaining),
  "x-ratelimit-reset": String(Math.ceil(result.resetAt / 1000)),
});
