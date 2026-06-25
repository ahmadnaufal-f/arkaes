// Wire types shared between the ark-chatbot widget (client) and the chat
// handler (server). Keep this module dependency-free so it can be imported
// from either side without pulling in lit or openai.

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Body the widget POSTs to the chat endpoint. */
export interface ChatRequestBody {
  messages: ChatMessage[];
}

/** Shape returned by the endpoint when something goes wrong. */
export interface ChatErrorResponse {
  error: string;
}
