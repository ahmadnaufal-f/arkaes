import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import {
  createChatHandler,
  type PortfolioKnowledge,
} from "@arkaes/chatbot/server";
import { EXPERTISE, categoryLabel } from "@/data/expertise";
import { techGroups } from "@/data/techstack";
import { getRetriever } from "@/lib/rag";

// On-demand (server-rendered) so the OpenAI key stays on the server. Every
// other route in the site remains statically prerendered.
export const prerender = false;

const PROFILE = {
  name: "Ahmad Naufal",
  headline:
    "Frontend engineer at Samsung R&D Institute Indonesia, creator of ARKÆS.",
  bio:
    "Ahmad Naufal is a frontend engineer based in Indonesia who has worked " +
    "professionally since 2021. His work sits between product, design, and " +
    "engineering: turning complex requirements into clear user flows, reusable " +
    "UI systems, and frontend architectures other engineers can build on. At " +
    "Samsung Research Indonesia he has worked on web-based product experiences " +
    "across mobile, TV, and connected-device interfaces, often modernizing " +
    "legacy systems, improving performance, and building reusable foundations. " +
    "Outside of work he ships side projects to explore product design, " +
    "cross-platform development, and AI integration. ARKÆS — Architecture meets " +
    "aesthetics — is his personal brand and design-system project.",
  links: [
    { label: "Portfolio", url: "https://arkaes.dev" },
    { label: "Email", url: "mailto:me@arkaes.dev" },
  ],
};

/** Build the knowledge base from the site's own content collections + data. */
const buildKnowledge = async (): Promise<PortfolioKnowledge> => {
  const projects = await getCollection("projects");
  const caseStudies = await getCollection("caseStudies");

  return {
    profile: PROFILE,
    expertise: EXPERTISE.map((area) => ({
      label: area.label,
      description: area.description,
    })),
    techStack: techGroups.flatMap((group) =>
      group.items.map((item) => item.name),
    ),
    projects: [
      ...projects.map((entry) => ({
        name: entry.data.projectName,
        role: entry.data.role,
        category: categoryLabel(entry.data.category),
        stack: entry.data.stack,
        summary: entry.data.challenges,
        url: entry.data["github-url"],
      })),
      ...caseStudies.map((entry) => ({
        name: entry.data.projectName,
        category: categoryLabel(entry.data.category),
        stack: entry.data.tags,
        summary: entry.data.shortDesc,
      })),
    ],
  };
};

// Optional origin allowlist (comma-separated), e.g.
// CHAT_ALLOWED_ORIGINS="https://arkaes.dev,https://www.arkaes.dev". Leave unset
// to rely on the built-in cross-site rejection (which also allows previews and
// local dev).
const allowedOrigins = (process.env.CHAT_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// RAG retriever — only when Supabase is configured. Without it the handler
// falls back to the static knowledge base built above.
const handler = createChatHandler({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  knowledge: buildKnowledge,
  retriever: getRetriever() ?? undefined,
  allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : undefined,
  // 15 requests / minute / client (in-memory, best-effort per instance).
  rateLimit: { windowMs: 60_000, max: 15 },
});

export const POST: APIRoute = ({ request }) => handler(request);
