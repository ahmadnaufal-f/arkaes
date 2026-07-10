// Single-shot text extraction backed by OpenAI. Used by the admin CV-retrieval
// tool to distil a raw, boilerplate-heavy job-posting page down to just the
// role's description before it is embedded and matched against the knowledge
// base. Lives here (rather than in the portfolio app) so the `openai` import
// stays inside the package that declares it as a dependency, mirroring how the
// embedder and chat handler are wired.

import OpenAI from "openai";

/** Default model for extraction — the same GPT-5-class model the chat uses. */
export const DEFAULT_EXTRACTION_MODEL = "gpt-5.4-nano";

const EXTRACTION_INSTRUCTIONS =
  "You extract the job posting from raw web-page text. Return only the job " +
  "title, role summary, responsibilities, requirements, and qualifications " +
  "for this specific role. Exclude navigation, footers, related-jobs widgets, " +
  "cookie/legal/privacy text, application forms, and company boilerplate that " +
  "is not part of this role's description. Preserve the original wording — do " +
  "not summarise, rephrase, or add commentary. If the input contains no job " +
  "posting, return an empty string.";

export interface Extractor {
  /** Extraction model id in use. */
  model: string;
  /**
   * Pull the job-description text out of the (already tag-stripped) page text.
   * Returns the extracted text, or an empty string when no posting is found.
   */
  extractJobDescription(pageText: string): Promise<string>;
}

export interface ExtractorOptions {
  /** OpenAI API key. Read this from a server-only env var. */
  apiKey: string;
  /** Provide a pre-built OpenAI client instead of an apiKey. */
  client?: OpenAI;
  /** Defaults to gpt-5.4-nano. */
  model?: string;
  /** Reasoning budget. Defaults to "minimal" — this is a copy-out task. */
  reasoningEffort?: "minimal" | "low" | "medium" | "high";
  /** Hard ceiling on generated tokens. Defaults to 4000. */
  maxOutputTokens?: number;
  /**
   * Cap on how many characters of page text are forwarded to the model, to keep
   * a pathological page from blowing past the context window / burning tokens.
   * Defaults to 48000 (~12k tokens of stripped text).
   */
  maxInputChars?: number;
}

/** Create an OpenAI-backed job-description extractor. */
export const createJobDescriptionExtractor = (
  options: ExtractorOptions,
): Extractor => {
  const model = options.model ?? DEFAULT_EXTRACTION_MODEL;
  const reasoningEffort = options.reasoningEffort ?? "minimal";
  const maxOutputTokens = options.maxOutputTokens ?? 4000;
  const maxInputChars = options.maxInputChars ?? 48_000;
  const client = options.client ?? new OpenAI({ apiKey: options.apiKey });

  return {
    model,
    async extractJobDescription(pageText) {
      const trimmed = pageText.trim();
      if (!trimmed) return "";

      const input = trimmed.slice(0, maxInputChars);
      const completion = await client.chat.completions.create({
        model,
        reasoning_effort: reasoningEffort,
        max_completion_tokens: maxOutputTokens,
        messages: [
          { role: "system", content: EXTRACTION_INSTRUCTIONS },
          { role: "user", content: input },
        ],
      });

      return completion.choices[0]?.message?.content?.trim() ?? "";
    },
  };
};
