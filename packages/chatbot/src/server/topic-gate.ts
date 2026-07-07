// A pre-generation topic gate backed by the RAG retrieval that already runs on
// every message — so it costs no extra model call. An off-topic question
// ("what is te amo?", "sqrt(5^2+12^2)") resembles nothing in Ahmad's portfolio,
// so retrieval comes back empty or weak; a real question about his work pulls
// chunks with genuine similarity. Gating on the top chunk's score lets us
// decline off-topic messages before spending a generation.
//
// This is deliberately a cheaper, weaker filter than an LLM classifier, with
// two known blind spots:
//   - it can miss off-topic asks that happen to share portfolio vocabulary
//     ("write me some React code" — React is in the stack); the persona's own
//     scope rules stay the backstop for those.
//   - it can over-decline genuinely on-topic messages that retrieve poorly —
//     terse follow-ups ("tell me more"), bare greetings, or meta-questions.
//     `minTopSimilarity` is the knob for that; tune it against real traffic.

import type { RetrievedChunk } from "./retrieval";
import { ARKHE_CONTACT_EMAIL } from "./persona";

/**
 * Warm, on-brand declines used when the gate blocks a message. A small rotation
 * (rather than one fixed string) keeps repeated off-topic probes from feeling
 * canned. Each points back to what Arkhe *can* do and to Ahmad directly.
 */
export const OFF_TOPIC_REPLIES = [
  `That's a little outside what I cover — I'm here to talk about Ahmad and his work, not as a general assistant. I'd happily walk you through his projects or the way he approaches frontend engineering instead. For anything else, you can reach Ahmad at ${ARKHE_CONTACT_EMAIL}.`,
  "I'll have to pass on that one — my world is Ahmad and his work rather than general questions. If it helps, I can tell you about his projects, his background, or how he thinks about building for the web. Otherwise arkaes.dev is a good place to explore.",
  `That's beyond what I do here — I stick to Ahmad and his work. Ask me about his projects, his experience, or his engineering approach and I'm glad to dig in. For anything further, Ahmad himself is the best person to reach at ${ARKHE_CONTACT_EMAIL}.`,
] as const;

export interface TopicGateOptions {
  /** Turn the gate on. Defaults to `false` so the handler opts in explicitly. */
  enabled?: boolean;
  /**
   * Minimum top-chunk cosine similarity for a message to count as on-topic.
   * When the best retrieved chunk scores below this (or nothing was retrieved),
   * the message is declined. Default 0.35 — just above the retriever's own 0.3
   * inclusion floor, and tuned toward letting borderline questions through: a
   * wrongly-blocked real visitor costs more than a leaked off-topic answer.
   * Raise it to decline more aggressively, lower it to be more permissive.
   */
  minTopSimilarity?: number;
  /** Pool of decline replies; one is chosen at random. Defaults to the rotation above. */
  declineReplies?: readonly string[];
}

/** Pick a decline reply at random from the pool. */
export const pickOffTopicReply = (
  replies: readonly string[] = OFF_TOPIC_REPLIES,
): string =>
  replies[Math.floor(Math.random() * replies.length)] ?? OFF_TOPIC_REPLIES[0];

/** Highest cosine similarity among retrieved chunks (0 when there are none). */
const topSimilarity = (retrieved: RetrievedChunk[]): number =>
  retrieved.reduce((max, chunk) => Math.max(max, chunk.similarity ?? 0), 0);

/**
 * Decide whether a message is on-topic from its retrieval result. Returns
 * `true` when the best retrieved chunk clears `minTopSimilarity`, `false` when
 * retrieval came back empty or weak — i.e. nothing in the portfolio resembles
 * the query.
 *
 * Only meaningful when retrieval actually ran and *succeeded*: a retrieval
 * failure must fail open (answer from static knowledge), so the handler only
 * calls this on the success path and never treats an error as "off-topic".
 */
export const isOnTopicByRetrieval = (
  retrieved: RetrievedChunk[],
  minTopSimilarity: number,
): boolean => topSimilarity(retrieved) >= minTopSimilarity;
