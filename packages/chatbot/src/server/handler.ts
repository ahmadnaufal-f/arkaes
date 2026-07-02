import OpenAI from "openai";
import type { ChatMessage, ChatRequestBody } from "../shared/types";
import { buildSystemPrompt, type PortfolioKnowledge } from "./knowledge";

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
  /** Cap on how many trailing user/assistant turns are forwarded. */
  maxMessages?: number;
}

/** A web-standard request handler: `(Request) => Promise<Response>`. */
export type ChatRequestHandler = (request: Request) => Promise<Response>;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
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

const sanitizeMessages = (input: unknown, max: number): ChatMessage[] => {
  if (!Array.isArray(input)) return [];
  const valid = input.filter(isChatMessage).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 4000),
  }));
  return valid.slice(-max);
};

/**
 * Build a web-standard chat handler backed by OpenAI. It validates the request,
 * grounds the model with `buildSystemPrompt`, and streams the reply back as a
 * plain-text body the ark-chatbot widget reads chunk by chunk.
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
  } = options;

  // Constructed lazily: the OpenAI client throws when given an empty key, and
  // it must not take down the whole handler module before the guard below can
  // answer with a clean 500.
  let client: OpenAI | undefined;

  return async function handleChatRequest(request) {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }
    if (!apiKey) {
      return json({ error: "Chat is not configured (missing API key)." }, 500);
    }
    client ??= new OpenAI({ apiKey });

    let body: ChatRequestBody;
    try {
      body = (await request.json()) as ChatRequestBody;
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const messages = sanitizeMessages(body?.messages, maxMessages);
    if (messages.length === 0) {
      return json({ error: "No messages provided" }, 400);
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
        },
      });
    } catch {
      return json({ error: "Failed to reach the model. Try again." }, 502);
    }
  };
};
