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
<ark-chatbot heading="Arkhe" endpoint="/api/chat"></ark-chatbot>
```

Attributes: `endpoint` (default `/api/chat`), `heading` (the assistant's
name, shown in the panel header), `tagline` (small line under the name),
`placeholder`, `greeting`, `launcher-label` (the launcher's visible text and
accessible label), and the boolean `open`. The `suggestions` property (a
`string[]`, settable as a JSON attribute) drives the empty-state starter
prompts; set it to `[]` to hide them.

The launcher's breathing halo is a first-visit attention cue: once the panel
has been opened, the widget stores `ark-chatbot:opened` in `localStorage` and
the halo stays off on later visits. Clear that key to bring it back.

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
