import OpenAI from "openai";
import type { ChatMessage, ChatRequestBody } from "../shared/types";
import { buildSystemPrompt, type PortfolioKnowledge } from "./knowledge";
import {
  checkRateLimit,
  createMemoryRateLimitStore,
  rateLimitHeaders,
  type RateLimitOptions,
  type RateLimitStore,
} from "./rate-limit";

/** A knowledge base, or a (possibly async) factory that produces one. */
export type KnowledgeSource =
  | PortfolioKnowledge
  | (() => PortfolioKnowledge | Promise<PortfolioKnowledge>);

export interface ChatHandlerOptions {
  /** OpenAI API key. Read this from a server-only env var. */
  apiKey: string;
  /** Facts the assistant is allowed to talk about. */
  knowledge: KnowledgeSource;
  /** Chat model. Defaults to "gpt-4o-mini". */
  model?: string;
  /** Sampling temperature. Defaults to 0.4 for grounded answers. */
  temperature?: number;
  /** Cap on how many trailing user/assistant turns are forwarded. Default 12. */
  maxMessages?: number;
  /** Max characters kept per message. Default 4000. */
  maxMessageLength?: number;
  /** Max request body size in bytes; larger bodies get a 413. Default 16000. */
  maxBodyBytes?: number;
  /**
   * Rate limit config, or `false` to disable. Defaults to 15 requests per
   * minute per client, counted in an in-memory store.
   */
  rateLimit?: RateLimitOptions | false;
  /**
   * Allowed request origins. When set and the request carries an `Origin`
   * header, it must match one of these. Requests the browser marks as
   * cross-site (`Sec-Fetch-Site: cross-site`) are always rejected.
   */
  allowedOrigins?: string[];
  /** Derive a stable client id for rate limiting. Defaults to forwarded IP. */
  getClientId?: (request: Request) => string;
}

/** A web-standard request handler: `(Request) => Promise<Response>`. */
export type ChatRequestHandler = (request: Request) => Promise<Response>;

const json = (
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string" &&
    candidate.content.trim().length > 0
  );
};

const sanitizeMessages = (
  input: unknown,
  max: number,
  maxLength: number,
): ChatMessage[] => {
  if (!Array.isArray(input)) return [];
  const valid = input.filter(isChatMessage).map((message) => ({
    role: message.role,
    content: message.content.slice(0, maxLength),
  }));
  return valid.slice(-max);
};

/** Default client id: first forwarded IP, else a shared fallback bucket. */
const defaultClientId = (request: Request): string => {
  const forwarded =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "";
  const ip = forwarded.split(",")[0]?.trim();
  return ip && ip.length > 0 ? ip : "anonymous";
};

/** Block obvious cross-site calls and enforce an optional origin allowlist. */
const isOriginAllowed = (
  request: Request,
  allowedOrigins?: string[],
): boolean => {
  // Modern browsers tag embeds and other-site requests as "cross-site".
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  if (!allowedOrigins || allowedOrigins.length === 0) return true;
  const origin = request.headers.get("origin");
  // No Origin header → same-origin navigation or a non-browser client.
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};

/**
 * Build a web-standard chat handler backed by OpenAI. It rate-limits and
 * validates the request, grounds the model with `buildSystemPrompt`, and
 * streams the reply back as a plain-text body the ark-chatbot widget reads
 * chunk by chunk.
 */
export const createChatHandler = (
  options: ChatHandlerOptions,
): ChatRequestHandler => {
  const {
    apiKey,
    knowledge,
    model = "gpt-4o-mini",
    temperature = 0.4,
    maxMessages = 12,
    maxMessageLength = 4000,
    maxBodyBytes = 16_000,
    allowedOrigins,
    getClientId = defaultClientId,
  } = options;

  const client = new OpenAI({ apiKey });

  const limiter =
    options.rateLimit === false
      ? null
      : {
        store: options.rateLimit?.store ?? createMemoryRateLimitStore(),
        windowMs: options.rateLimit?.windowMs ?? 60_000,
        max: options.rateLimit?.max ?? 15,
      };

  return async function handleChatRequest(request) {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }
    if (!apiKey) {
      return json({ error: "Chat is not configured (missing API key)." }, 500);
    }
    if (!isOriginAllowed(request, allowedOrigins)) {
      return json({ error: "Origin not allowed" }, 403);
    }

    // Rate limit before doing any real work.
    let successHeaders: Record<string, string> = {};
    if (limiter) {
      const result = await checkRateLimit(
        limiter.store,
        getClientId(request),
        limiter.windowMs,
        limiter.max,
      );
      successHeaders = rateLimitHeaders(result);
      if (!result.allowed) {
        return json(
          { error: "Too many requests. Please slow down and try again." },
          429,
          {
            "retry-after": String(result.retryAfterSeconds),
            ...successHeaders,
          },
        );
      }
    }

    // Reject oversized bodies before buffering/parsing them.
    const declaredLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
      return json({ error: "Request body too large" }, 413, successHeaders);
    }

    let raw: string;
    try {
      raw = await request.text();
    } catch {
      return json({ error: "Could not read request body" }, 400, successHeaders);
    }
    if (new TextEncoder().encode(raw).length > maxBodyBytes) {
      return json({ error: "Request body too large" }, 413, successHeaders);
    }

    let body: ChatRequestBody;
    try {
      body = JSON.parse(raw) as ChatRequestBody;
    } catch {
      return json({ error: "Invalid JSON body" }, 400, successHeaders);
    }

    const messages = sanitizeMessages(
      body?.messages,
      maxMessages,
      maxMessageLength,
    );
    if (messages.length === 0) {
      return json({ error: "No messages provided" }, 400, successHeaders);
    }

    const resolved =
      typeof knowledge === "function" ? await knowledge() : knowledge;
    const systemPrompt = buildSystemPrompt(resolved);

    try {
      const completion = await client.chat.completions.create({
        model,
        temperature,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const text = chunk.choices[0]?.delta?.content;
              if (text) controller.enqueue(encoder.encode(text));
            }
          } catch {
            controller.enqueue(
              encoder.encode("\n\n[The reply was interrupted. Please retry.]"),
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
          ...successHeaders,
        },
      });
    } catch {
      return json(
        { error: "Failed to reach the model. Try again." },
        502,
        successHeaders,
      );
    }
  };
};

export type { RateLimitOptions, RateLimitStore };
