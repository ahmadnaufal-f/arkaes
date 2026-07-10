// Single-shot job-posting extraction backed by OpenAI. Used by the admin
// CV-retrieval tool to distil a raw, boilerplate-heavy job-posting page down to
// the hiring company, the role title, and just the role's description, before
// that description is embedded and matched against the knowledge base. Lives
// here (rather than in the portfolio app) so the `openai` import stays inside
// the package that declares it as a dependency, mirroring how the embedder and
// chat handler are wired.

import OpenAI from "openai";

/** Default model for extraction — the same GPT-5-class model the chat uses. */
export const DEFAULT_EXTRACTION_MODEL = "gpt-5.4-nano";

const EXTRACTION_INSTRUCTIONS =
  "You extract structured data about a job posting from raw web-page text. " +
  "Respond with a single JSON object with exactly these keys:\n" +
  '- "company": the hiring company\'s name, or "" if it is unclear.\n' +
  '- "roleTitle": the job title, or "" if it is unclear.\n' +
  '- "jobDescription": only the role summary, responsibilities, requirements, ' +
  "and qualifications for this specific role. Exclude navigation, footers, " +
  "related-jobs widgets, cookie/legal/privacy text, application forms, and " +
  "company boilerplate unrelated to the role. Preserve the original wording " +
  "(do not summarise or add commentary). Use \"\" if no posting is present.\n" +
  "Return only the JSON object, nothing else.";

export interface ExtractedJob {
  /** Hiring company name, or "" when the model could not determine it. */
  company: string;
  /** Job title, or "" when unclear. */
  roleTitle: string;
  /** The isolated job-description text, or "" when no posting was found. */
  jobDescription: string;
}

export interface Extractor {
  /** Extraction model id in use. */
  model: string;
  /**
   * Pull the company, role title, and job-description text out of the (already
   * tag-stripped) page text.
   */
  extractJob(pageText: string): Promise<ExtractedJob>;
}

export interface ExtractorOptions {
  /** OpenAI API key. Read this from a server-only env var. */
  apiKey: string;
  /** Provide a pre-built OpenAI client instead of an apiKey. */
  client?: OpenAI;
  /** Defaults to gpt-5.4-nano. */
  model?: string;
  /**
   * Reasoning budget. Defaults to "low" — matching the chat handler's proven
   * config. (Not every GPT-5-class deployment accepts "minimal".)
   */
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

const asString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/** Parse the model's reply into an ExtractedJob, tolerating stray formatting. */
const parseExtraction = (reply: string): ExtractedJob => {
  const empty: ExtractedJob = { company: "", roleTitle: "", jobDescription: "" };
  const trimmed = reply.trim();
  if (!trimmed) return empty;

  // Strip a ```json … ``` fence if the model wrapped its answer in one.
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(unfenced) as Record<string, unknown>;
    return {
      company: asString(parsed.company),
      roleTitle: asString(parsed.roleTitle),
      jobDescription: asString(parsed.jobDescription),
    };
  } catch {
    // Fall back to treating the whole reply as the description so a
    // non-JSON answer still yields usable retrieval input.
    return { ...empty, jobDescription: trimmed };
  }
};

/** Create an OpenAI-backed job-posting extractor. */
export const createJobDescriptionExtractor = (
  options: ExtractorOptions,
): Extractor => {
  const model = options.model ?? DEFAULT_EXTRACTION_MODEL;
  const reasoningEffort = options.reasoningEffort ?? "low";
  const maxOutputTokens = options.maxOutputTokens ?? 4000;
  const maxInputChars = options.maxInputChars ?? 48_000;
  const client = options.client ?? new OpenAI({ apiKey: options.apiKey });

  return {
    model,
    async extractJob(pageText) {
      const trimmed = pageText.trim();
      if (!trimmed) return { company: "", roleTitle: "", jobDescription: "" };

      const input = trimmed.slice(0, maxInputChars);
      const completion = await client.chat.completions.create({
        model,
        reasoning_effort: reasoningEffort,
        max_completion_tokens: maxOutputTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: EXTRACTION_INSTRUCTIONS },
          { role: "user", content: input },
        ],
      });

      return parseExtraction(completion.choices[0]?.message?.content ?? "");
    },
  };
};
