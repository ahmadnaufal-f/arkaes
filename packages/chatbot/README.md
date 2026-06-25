# @arkaes/chatbot

The portfolio AI chatbot — **Arkhe**. Two halves, deliberately split so the
OpenAI SDK never reaches the browser bundle:

- **Client** — `ark-chatbot`, a self-contained floating chat widget (Lit custom
  element) themed entirely with `@arkaes/tokens` CSS custom properties.
- **Server** — `createChatHandler`, a framework-agnostic
  `(Request) => Promise<Response>` that grounds the model in a portfolio
  knowledge base and streams the reply back as plain text.

## Entry points

| Import | Side effects | Use for |
| --- | --- | --- |
| `@arkaes/chatbot` | none | `ArkChatbot` class + wire types (for typing) |
| `@arkaes/chatbot/register` | registers `ark-chatbot` | one import that defines the element |
| `@arkaes/chatbot/register/ark-chatbot` | registers `ark-chatbot` | single-element registration |
| `@arkaes/chatbot/client` | none | widget class + `defineArkChatbot` |
| `@arkaes/chatbot/server` | none (pulls in `openai`) | `createChatHandler`, `buildSystemPrompt`, knowledge types — **server only** |

## Client usage

```ts
import "@arkaes/chatbot/register"; // defines <ark-chatbot>
```

```html
<ark-chatbot heading="Ask about me" endpoint="/api/chat"></ark-chatbot>
```

Attributes: `endpoint` (default `/api/chat`), `heading`, `placeholder`,
`greeting`, `launcher-label`, and the boolean `open`.

## Server usage

Mount the handler in any web-standard route (here, an Astro endpoint):

```ts
import { createChatHandler, type PortfolioKnowledge } from "@arkaes/chatbot/server";

const handler = createChatHandler({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  model: "gpt-4o-mini",
  knowledge: async (): Promise<PortfolioKnowledge> => ({
    profile: { name: "Ahmad Naufal", headline: "...", bio: "..." },
    expertise: [],
    techStack: [],
    projects: [],
  }),
});

export const POST = ({ request }: { request: Request }) => handler(request);
```

The system prompt is the static **Arkhe** persona (`./src/server/persona.ts`)
with the per-request knowledge appended by `buildSystemPrompt`. Edit
`persona.ts` to change the assistant's voice, scope, and safety rules.

> Set `OPENAI_API_KEY` as a server-only environment variable. It must never be
> exposed to the client.

## Abuse protection

`createChatHandler` applies these guards before calling the model:

- **Rate limiting** — 15 requests/minute/client by default (`rateLimit`),
  counted by forwarded IP. Returns `429` with `Retry-After` and
  `X-RateLimit-*` headers. Pass `rateLimit: false` to disable, or tune
  `{ windowMs, max }`.
- **Origin checks** — browser-tagged `Sec-Fetch-Site: cross-site` requests are
  rejected (`403`). Set `allowedOrigins` to enforce a strict allowlist.
- **Body limits** — bodies over `maxBodyBytes` (16 KB) get a `413`; messages
  are capped at `maxMessages` (12) turns and `maxMessageLength` (4000) chars.
- **Method check** — non-`POST` requests get a `405`.

## RAG (Supabase pgvector)

Retrieval is optional and **degrades gracefully** — if no retriever is passed,
or a lookup fails, the handler falls back to the static `knowledge` base.

Server primitives (all from `@arkaes/chatbot/server`):

- `createEmbedder` — OpenAI embeddings (`text-embedding-3-small`, 1536 dims).
- `chunkText` — paragraph-aware chunking for ingestion.
- `createSupabaseIngestor` — chunk + embed + insert (`ingest`, `clearAll`,
  `clearSource`).
- `createSupabaseRetriever` — embed the query and call the `match_documents`
  RPC for nearest-neighbour chunks.

```ts
import { createChatHandler, createSupabaseRetriever } from "@arkaes/chatbot/server";

const retriever = createSupabaseRetriever({
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  openaiApiKey: process.env.OPENAI_API_KEY!,
});

createChatHandler({ apiKey, knowledge, retriever });
```

The handler retrieves on the latest user message and injects the chunks into
the prompt's "Retrieved portfolio knowledge" block, ranked above the static
profile. SQL schema + setup live in `supabase/` at the repo root; ingest with
`pnpm --filter @arkaes/portfolio ingest`.

### Distributed rate limiting

The default store is **in-memory**, so on serverless it limits per warm
instance (best-effort). For a strict global limit, implement `RateLimitStore`
against a shared backend and pass it in:

```ts
const store: RateLimitStore = {
  async increment(key, windowMs) {
    // e.g. Upstash/Vercel KV: INCR + PEXPIRE, return { count, resetAt }
  },
};

createChatHandler({ /* … */, rateLimit: { store, windowMs: 60_000, max: 15 } });
```
