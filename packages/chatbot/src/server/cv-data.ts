// Assembles a CV_DATA markdown file from retrieved knowledge-base chunks,
// tailored to a target job description. The output is the "single source of
// truth" a downstream CV-writing skill reads: it must carry exactly five
// sections (Profile, What I Bring, Work Experience, Selected Projects,
// Technical Skills), populated only from the supplied chunks. Backed by OpenAI;
// lives in this package so the `openai` import stays where it is declared.

import OpenAI from "openai";
import type { RetrievedChunk } from "./retrieval";

/** Default model — the same GPT-5-class model the chat + extraction use. */
export const DEFAULT_CV_DATA_MODEL = "gpt-5.4-nano";

const COMPOSE_INSTRUCTIONS = [
  "You assemble a CV_DATA markdown file. This file is the single source of",
  "truth that a separate CV-writing skill reads to build a tailored CV for the",
  "candidate Ahmad Naufal. You are given a target job description and a set of",
  "retrieved source chunks from Ahmad's own knowledge base (portfolio projects,",
  "case studies, about page). Reorganise the material in those chunks into a",
  "CV_DATA file tailored to the target role.",
  "",
  "Output rules:",
  "- Output ONLY the markdown file. No preamble, no commentary, no code fences.",
  "- First line: a level-1 title `# CV_DATA` followed by the company or role.",
  "- Then EXACTLY these five level-2 sections, in this order, with these exact",
  "  headings:",
  "  ## Profile",
  "  ## What I Bring",
  "  ## Work Experience",
  "  ## Selected Projects",
  "  ## Technical Skills",
  "- Populate every section using ONLY facts found in the provided chunks.",
  "  Reorder and re-emphasise to fit the target role, leading with the most",
  "  relevant material.",
  "- Never invent employers, dates, metrics, technologies, project names, or",
  "  statuses. If the chunks contain no material for a section, write exactly:",
  "  `_No material retrieved for this section; supply from the master CV_DATA.md._`",
  "- Profile: 4 to 6 sentences positioning the candidate for this role.",
  "- What I Bring: 4 to 5 bullets, each a bold lead-in phrase then a sentence,",
  "  mapped to the job's top requirements and supported by the chunks.",
  "- Work Experience: roles and projects with any dates and metrics present in",
  "  the chunks. Add an italic role tag when a chunk gives one.",
  "- Selected Projects: side projects with `Tech · Status` subtitles when the",
  "  chunk provides them.",
  "- Technical Skills: grouped by category (Languages, Frameworks, Tooling,",
  "  etc.) using only technologies named in the chunks.",
  "- Writing style: no em dashes or en dashes, no semicolons, plain and direct.",
].join("\n");

export interface CvDataInput {
  /** The tailored-for job description text. */
  jobDescription: string;
  /** Hiring company name, used in the title. Optional. */
  company?: string;
  /** Target role title, used to steer emphasis. Optional. */
  roleTitle?: string;
  /** Retrieved knowledge-base chunks — the only permitted source of facts. */
  chunks: RetrievedChunk[];
}

export interface CvDataComposer {
  /** Model id in use. */
  model: string;
  /** Compose the CV_DATA markdown, or "" when there is nothing to work from. */
  compose(input: CvDataInput): Promise<string>;
}

export interface CvDataComposerOptions {
  apiKey: string;
  client?: OpenAI;
  model?: string;
  reasoningEffort?: "minimal" | "low" | "medium" | "high";
  /** Hard ceiling on generated tokens. Defaults to 6000 (a full data file). */
  maxOutputTokens?: number;
}

/** Render the chunks into a numbered, source-attributed block for the prompt. */
const formatChunks = (chunks: RetrievedChunk[]): string =>
  chunks
    .map((chunk, index) => {
      const tag = chunk.source ? ` (source: ${chunk.source})` : "";
      return `--- chunk ${index + 1}${tag} ---\n${chunk.content}`;
    })
    .join("\n\n");

/** Create an OpenAI-backed CV_DATA composer. */
export const createCvDataComposer = (
  options: CvDataComposerOptions,
): CvDataComposer => {
  const model = options.model ?? DEFAULT_CV_DATA_MODEL;
  const reasoningEffort = options.reasoningEffort ?? "low";
  const maxOutputTokens = options.maxOutputTokens ?? 6000;
  const client = options.client ?? new OpenAI({ apiKey: options.apiKey });

  return {
    model,
    async compose(input) {
      if (input.chunks.length === 0) return "";

      const target = [
        input.company ? `Company: ${input.company}` : "",
        input.roleTitle ? `Role: ${input.roleTitle}` : "",
        "",
        "Job description:",
        input.jobDescription.trim() || "(none provided)",
      ]
        .filter((line) => line !== undefined)
        .join("\n");

      const user = [
        "TARGET ROLE",
        target,
        "",
        "SOURCE CHUNKS (the only permitted source of facts)",
        formatChunks(input.chunks),
      ].join("\n");

      const completion = await client.chat.completions.create({
        model,
        reasoning_effort: reasoningEffort,
        max_completion_tokens: maxOutputTokens,
        messages: [
          { role: "system", content: COMPOSE_INSTRUCTIONS },
          { role: "user", content: user },
        ],
      });

      return completion.choices[0]?.message?.content?.trim() ?? "";
    },
  };
};
