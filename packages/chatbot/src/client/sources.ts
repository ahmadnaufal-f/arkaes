// Splits an assistant reply into its visible answer and the trailing sources
// payload the handler appends after SOURCES_DELIMITER. Kept separate from the
// widget so it can be unit-tested and reused.

import { SOURCES_DELIMITER, type SourceCitation } from "../shared/types";

export interface SplitReply {
  /** The answer text to render (never contains the delimiter). */
  body: string;
  /** Cited sources, or empty until the payload has fully streamed in. */
  sources: SourceCitation[];
}

const isSourceCitation = (value: unknown): value is SourceCitation => {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.n === "number" &&
    typeof candidate.label === "string" &&
    (candidate.url === undefined || typeof candidate.url === "string")
  );
};

/**
 * Trim a partially-streamed delimiter off the end of `text`, so a half-arrived
 * sentinel is never shown while the sources payload is still in flight. The
 * delimiter opens with a newline, so at worst this hides a trailing blank line
 * (which markdown would collapse anyway).
 */
const trimPartialDelimiter = (text: string): string => {
  const max = Math.min(text.length, SOURCES_DELIMITER.length - 1);
  for (let length = max; length > 0; length -= 1) {
    if (text.endsWith(SOURCES_DELIMITER.slice(0, length))) {
      return text.slice(0, text.length - length);
    }
  }
  return text;
};

/** Separate the rendered answer from its appended sources payload. */
export const splitReply = (content: string): SplitReply => {
  const index = content.indexOf(SOURCES_DELIMITER);
  if (index === -1) {
    return { body: trimPartialDelimiter(content), sources: [] };
  }

  const body = content.slice(0, index);
  const raw = content.slice(index + SOURCES_DELIMITER.length);
  try {
    const parsed: unknown = JSON.parse(raw);
    const sources = Array.isArray(parsed) ? parsed.filter(isSourceCitation) : [];
    return { body, sources };
  } catch {
    // Payload still streaming in (incomplete JSON): show the answer, hold the
    // sources until the closing bracket arrives.
    return { body, sources: [] };
  }
};
