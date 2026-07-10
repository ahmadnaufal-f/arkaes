import type { APIRoute } from "astro";
import {
  checkRateLimit,
  createMemoryRateLimitStore,
  rateLimitHeaders,
} from "@arkaes/chatbot/server";
import {
  getCvDataComposer,
  getExtractor,
  getRetriever,
  ragConfigured,
} from "@/lib/rag";
import { htmlToText } from "@/lib/html-to-text";

// Server-rendered + protected by the Basic Auth middleware (see src/middleware).
// This route fetches an external URL and burns paid OpenAI (extraction +
// embedding) calls, so it must never be reachable unauthenticated.
export const prerender = false;

// Defaults tuned for CV material: retrieve broadly (job postings are noisy, and
// this is for comprehensive coverage, not a single chat answer) and match on a
// lower similarity floor than the chatbot's 0.3. Both are env-overridable and
// can be tightened per-request from the UI.
const DEFAULT_MATCH_COUNT = Number(process.env.CV_RETRIEVAL_MATCH_COUNT) || 18;
const DEFAULT_MATCH_THRESHOLD =
  Number(process.env.CV_RETRIEVAL_MATCH_THRESHOLD) || 0.15;

// Below this, the extraction almost certainly failed to find a real posting.
const MIN_JD_WORDS = 100;
// Below this the fetched/pasted page had no usable text at all.
const MIN_PAGE_CHARS = 200;
const FETCH_TIMEOUT_MS = 12_000;

// A browser-like UA gets past some naive server-side bot filters. Sites with
// real bot protection (LinkedIn, some Workday tenants) will still 403 — the
// route surfaces that clearly so the admin can fall back to pasting text.
const FETCH_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/122.0 Safari/537.36";

// One shared limiter for the process. Single-user admin tool, so this is purely
// a guard against accidental double-clicks / runaway loops burning credits.
const limiter = createMemoryRateLimitStore();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;

const json = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

const clientId = (request: Request): string => {
  const forwarded =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "";
  return forwarded.split(",")[0]?.trim() || "admin";
};

const asTrimmed = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const wordCount = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

/** Fetch a URL server-side and reduce it to plain text, or throw a clear error. */
const fetchPageText = async (url: string): Promise<string> => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http(s) URLs are supported.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(parsed, {
      headers: {
        "user-agent": FETCH_USER_AGENT,
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The site took too long to respond (timed out).");
    }
    throw new Error("Could not reach that URL from the server.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(
      `The site returned ${response.status} ${response.statusText}. ` +
        "It likely blocks server-side fetches — paste the text manually below.",
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType && !/text\/|html|xml/i.test(contentType)) {
    throw new Error(
      `Unsupported content type (${contentType}). Paste the text manually below.`,
    );
  }

  const html = await response.text();
  return htmlToText(html);
};

interface Chunk {
  content: string;
  source?: string;
  similarity?: number;
  metadata?: Record<string, unknown>;
}

export const POST: APIRoute = async ({ request }) => {
  // Rate limit before any fetch / paid call.
  const rate = await checkRateLimit(
    limiter,
    clientId(request),
    RATE_WINDOW_MS,
    RATE_MAX,
  );
  const headers = rateLimitHeaders(rate);
  if (!rate.allowed) {
    return json({ error: "Too many requests. Slow down." }, 429, {
      "retry-after": String(rate.retryAfterSeconds),
      ...headers,
    });
  }

  if (!ragConfigured) {
    return json({ error: "RAG is not configured." }, 503, headers);
  }
  const retriever = getRetriever();
  const extractor = getExtractor();
  const composer = getCvDataComposer();
  if (!retriever || !extractor || !composer) {
    return json({ error: "RAG is not configured." }, 503, headers);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    body =
      typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {};
  } catch {
    return json({ error: "Invalid JSON body." }, 400, headers);
  }

  const url = asTrimmed(body.url);
  const pastedText = asTrimmed(body.text);
  const companyOverride = asTrimmed(body.company);
  if (!url && !pastedText) {
    return json({ error: "Provide a job posting URL or paste text." }, 400, headers);
  }

  const matchCount = clamp(
    Math.round(Number(body.matchCount) || DEFAULT_MATCH_COUNT),
    1,
    50,
  );
  const rawThreshold = Number(body.matchThreshold);
  const matchThreshold = clamp(
    Number.isFinite(rawThreshold) ? rawThreshold : DEFAULT_MATCH_THRESHOLD,
    0,
    1,
  );

  // 1. Get raw page text — fetched from the URL, or from the manual paste.
  let pageText: string;
  try {
    // A pasted body may itself be HTML (copied from view-source) or plain text;
    // htmlToText handles both and just collapses whitespace on plain text.
    pageText = url ? await fetchPageText(url) : htmlToText(pastedText);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch the page.";
    return json({ error: message }, 502, headers);
  }

  if (pageText.length < MIN_PAGE_CHARS) {
    return json(
      {
        error:
          "The page had almost no readable text. It may require JavaScript " +
          "or block fetching — paste the job description manually below.",
      },
      422,
      headers,
    );
  }

  // 2. Isolate the company, role, and job-description text with the extractor.
  let extractedText: string;
  let extractedCompany: string;
  let extractedRole: string;
  try {
    const job = await extractor.extractJob(pageText);
    extractedText = job.jobDescription;
    extractedCompany = job.company;
    extractedRole = job.roleTitle;
  } catch (error) {
    // Admin-only tool — surface the underlying reason so failures are
    // diagnosable instead of a blank "try again".
    const detail = error instanceof Error ? error.message : String(error);
    console.error("cv-retrieval extraction failed:", error);
    return json({ error: `Extraction failed: ${detail}` }, 502, headers);
  }
  if (!extractedText) {
    return json(
      {
        error:
          "No job description could be extracted from that content. " +
          "Paste the posting text manually below.",
      },
      422,
      headers,
    );
  }

  // Best available company name: manual override wins, then the extracted name,
  // then the URL host (the client falls back to "company" for the filename).
  const hostName = (() => {
    if (!url) return "";
    try {
      return new URL(url).hostname.replace(/^www\./, "").split(".")[0] ?? "";
    } catch {
      return "";
    }
  })();
  const company = companyOverride || extractedCompany || hostName;

  const words = wordCount(extractedText);
  const warning =
    words < MIN_JD_WORDS
      ? `Extracted text is very short (${words} words) — the fetch or ` +
        "extraction may have missed the real posting. Check it below."
      : undefined;

  // 3. Embed + retrieve against the existing pgvector store (reuses the same
  // text-embedding-3-small model and match_documents RPC as the chatbot).
  let chunks: Chunk[];
  try {
    chunks = await retriever.retrieve(extractedText, {
      matchCount,
      minSimilarity: matchThreshold,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("cv-retrieval retrieval failed:", error);
    return json(
      { error: `Retrieval from the knowledge base failed: ${detail}` },
      502,
      headers,
    );
  }

  // 4. Compose a CV_DATA markdown file from the retrieved chunks, tailored to
  // the posting. This is the primary deliverable the admin downloads and feeds
  // (with the CV skill) into a CV-writing conversation. Only facts present in
  // the chunks are used. A retrieval that returned nothing yields no file.
  let cvData = "";
  if (chunks.length > 0) {
    try {
      cvData = await composer.compose({
        jobDescription: extractedText,
        company,
        roleTitle: extractedRole,
        chunks,
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error("cv-retrieval CV_DATA composition failed:", error);
      return json({ error: `CV_DATA composition failed: ${detail}` }, 502, headers);
    }
  }

  return json(
    {
      ok: true,
      extractedText,
      cvData,
      warning,
      chunks,
      meta: {
        sourceUrl: url || null,
        company,
        roleTitle: extractedRole,
        model: extractor.model,
        matchCount,
        matchThreshold,
        wordCount: words,
        returned: chunks.length,
      },
    },
    200,
    headers,
  );
};
