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

/**
 * One cited source, as streamed to the widget. `n` is the bracketed number the
 * assistant uses inline (e.g. `[1]`); `url` is present only when the source maps
 * to a page on the site.
 */
export interface SourceCitation {
  n: number;
  label: string;
  url?: string;
}

/**
 * Separates the assistant's reply from the trailing JSON array of
 * `SourceCitation`s the handler appends to the stream. Uses ASCII Record
 * Separator control characters so it never collides with model prose; the
 * widget splits on it and never renders it. Keep client and server in sync by
 * importing this constant on both sides.
 */
export const SOURCES_DELIMITER = "\n\x1e\x1eARKHE_SOURCES\x1e\x1e\n";
