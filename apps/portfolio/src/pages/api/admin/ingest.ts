import type { APIRoute } from "astro";
import { getIngestor } from "@/lib/rag";

// Server-rendered + protected by the Basic Auth middleware (see src/middleware).
export const prerender = false;

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const readBody = async (
  request: Request,
): Promise<Record<string, unknown>> => {
  try {
    const parsed: unknown = await request.json();
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const asTrimmed = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

// List loaded sources with their chunk counts.
export const GET: APIRoute = async () => {
  const ingestor = getIngestor();
  if (!ingestor) return json({ error: "RAG is not configured." }, 503);
  const sources = await ingestor.listSources();
  return json({ sources });
};

// Ingest one document. Body: { content, source?, metadata?, replaceSource? }.
export const POST: APIRoute = async ({ request }) => {
  const ingestor = getIngestor();
  if (!ingestor) return json({ error: "RAG is not configured." }, 503);

  const body = await readBody(request);
  const content = asTrimmed(body.content);
  if (!content) return json({ error: "content is required." }, 400);

  const source = asTrimmed(body.source) || undefined;

  let metadata: Record<string, unknown> | undefined;
  if (typeof body.metadata === "object" && body.metadata !== null) {
    metadata = body.metadata as Record<string, unknown>;
  }

  if (body.replaceSource === true && source) {
    await ingestor.clearSource(source);
  }

  const result = await ingestor.ingest([{ content, source, metadata }]);
  return json({ ok: true, ...result });
};

// Clear a source ({ source }) or everything ({ all: true }).
export const DELETE: APIRoute = async ({ request }) => {
  const ingestor = getIngestor();
  if (!ingestor) return json({ error: "RAG is not configured." }, 503);

  const body = await readBody(request);
  if (body.all === true) {
    const removed = await ingestor.clearAll();
    return json({ ok: true, removed });
  }

  const source = asTrimmed(body.source);
  if (!source) return json({ error: "source or all:true is required." }, 400);

  const removed = await ingestor.clearSource(source);
  return json({ ok: true, removed });
};
