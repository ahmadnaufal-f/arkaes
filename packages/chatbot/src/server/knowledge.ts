// The "knowledge base" the assistant is grounded in. The portfolio builds this
// object from its own content collections and data files at request time and
// hands it to `createChatHandler`, keeping this package free of any portfolio
// specific imports. `buildSystemPrompt` appends a serialised version of it to
// the static Arkhe persona (see ./persona).

import { ARKHE_SYSTEM_PROMPT } from "./persona";

export interface KnowledgeLink {
  label: string;
  url: string;
}

export interface KnowledgeProfile {
  /** Person the assistant represents, e.g. "Ahmad Naufal". */
  name: string;
  /** One-line positioning, e.g. "Frontend engineer at Samsung Research". */
  headline: string;
  /** Long-form bio paragraphs. */
  bio: string;
  links?: KnowledgeLink[];
}

export interface KnowledgeExpertise {
  label: string;
  description: string;
}

export interface KnowledgeProject {
  name: string;
  role?: string;
  category?: string;
  stack?: string[];
  summary: string;
  url?: string;
}

export interface PortfolioKnowledge {
  profile: KnowledgeProfile;
  expertise?: KnowledgeExpertise[];
  techStack?: string[];
  projects?: KnowledgeProject[];
}

const bullet = (line: string): string => `- ${line}`;

const renderProjects = (projects: KnowledgeProject[]): string =>
  projects
    .map((project) => {
      const meta = [project.role, project.category].filter(Boolean).join(" · ");
      const stack = project.stack?.length
        ? `\n  Stack: ${project.stack.join(", ")}`
        : "";
      const link = project.url ? `\n  Link: ${project.url}` : "";
      const header = meta ? `${project.name} (${meta})` : project.name;
      return `### ${header}\n  ${project.summary}${stack}${link}`;
    })
    .join("\n\n");

export interface BuildSystemPromptOptions {
  /** Override the static persona. Defaults to the Arkhe persona. */
  persona?: string;
}

/** Serialise the knowledge base into the "Retrieved portfolio knowledge" block. */
const renderKnowledge = (knowledge: PortfolioKnowledge): string => {
  const { profile, expertise = [], techStack = [], projects = [] } = knowledge;

  const sections: string[] = [
    `### Profile\n${profile.name} — ${profile.headline}\n\n${profile.bio}`,
  ];

  if (expertise.length) {
    sections.push(
      `### Areas of expertise\n${expertise
        .map((area) => bullet(`${area.label}: ${area.description}`))
        .join("\n")}`,
    );
  }

  if (techStack.length) {
    sections.push(`### Technologies\n${techStack.join(", ")}`);
  }

  if (projects.length) {
    sections.push(`### Selected work\n${renderProjects(projects)}`);
  }

  if (profile.links?.length) {
    sections.push(
      `### Links\n${profile.links
        .map((link) => bullet(`${link.label}: ${link.url}`))
        .join("\n")}`,
    );
  }

  return sections.join("\n\n");
};

/**
 * Compose the full system prompt: the static Arkhe persona followed by the
 * per-request "Retrieved portfolio knowledge" block built from `knowledge`.
 */
export const buildSystemPrompt = (
  knowledge: PortfolioKnowledge,
  options: BuildSystemPromptOptions = {},
): string => {
  const persona = options.persona ?? ARKHE_SYSTEM_PROMPT;
  return `${persona}

---

# Retrieved portfolio knowledge

This is the retrieved knowledge for the current conversation. Treat it as the \
highest-priority source per the Knowledge Usage rules above.

${renderKnowledge(knowledge)}`;
};
