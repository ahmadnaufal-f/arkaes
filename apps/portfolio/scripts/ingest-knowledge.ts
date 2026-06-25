/**
 * Ingest the portfolio's own content into the Supabase RAG store.
 *
 *   pnpm --filter @arkaes/portfolio ingest            # ingest site content
 *   pnpm --filter @arkaes/portfolio ingest --clear    # wipe first, then ingest
 *   pnpm --filter @arkaes/portfolio ingest --dry-run  # preview, no writes
 *
 * Requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and OPENAI_API_KEY (loaded
 * from apps/portfolio/.env). The service-role key bypasses RLS — keep it secret.
 */
import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import {
  createSupabaseIngestor,
  type IngestDocument,
} from "@arkaes/chatbot/server";

loadEnv();

const APP_ROOT = fileURLToPath(new URL("..", import.meta.url));
const CONTENT_DIR = join(APP_ROOT, "src", "content");

const args = process.argv.slice(2);
const shouldClear = args.includes("--clear");
const dryRun = args.includes("--dry-run");

interface ProjectJson {
  slug: string;
  title: string;
  projectName: string;
  role?: string;
  challenges?: string;
  body?: string;
  category?: string;
  stack?: string[];
}

interface Frontmatter {
  data: Record<string, string>;
  body: string;
}

const parseFrontmatter = (raw: string): Frontmatter => {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of match[1]?.split("\n") ?? []) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line
      .slice(idx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key) data[key] = value;
  }
  return { data, body: raw.slice(match[0].length).trim() };
};

const walk = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : Promise.resolve([full]);
    }),
  );
  return files.flat();
};

const toProjectDocument = (raw: string): IngestDocument => {
  const project = JSON.parse(raw) as ProjectJson;
  const content = [
    `# ${project.title}`,
    project.role ? `Role: ${project.role}` : "",
    project.category ? `Category: ${project.category}` : "",
    project.stack?.length ? `Stack: ${project.stack.join(", ")}` : "",
    project.challenges ? `Challenges: ${project.challenges}` : "",
    project.body ?? "",
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    content,
    source: `project:${project.slug}`,
    metadata: {
      type: "project",
      projectName: project.projectName,
      category: project.category ?? null,
    },
  };
};

const toCaseStudyDocument = (raw: string, file: string): IngestDocument => {
  const { data, body } = parseFrontmatter(raw);
  const id = basename(file, extname(file));
  const content = [
    data.title ? `# ${data.title}` : "",
    data.shortDesc ?? "",
    body,
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    content,
    source: `case-study:${id}`,
    metadata: {
      type: "case-study",
      projectName: data.projectName ?? null,
    },
  };
};

const collectDocuments = async (): Promise<IngestDocument[]> => {
  const files = await walk(CONTENT_DIR);
  const documents: IngestDocument[] = [];
  for (const file of files) {
    const ext = extname(file);
    if (ext !== ".json" && ext !== ".md") continue;
    const raw = await readFile(file, "utf8");
    documents.push(
      ext === ".json"
        ? toProjectDocument(raw)
        : toCaseStudyDocument(raw, file),
    );
  }
  return documents;
};

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
};

const main = async () => {
  const documents = await collectDocuments();
  console.log(`Found ${documents.length} documents in ${CONTENT_DIR}`);

  if (dryRun) {
    for (const document of documents) {
      console.log(`  • ${document.source} (${document.content.length} chars)`);
    }
    console.log("Dry run — nothing written.");
    return;
  }

  const ingestor = createSupabaseIngestor({
    supabaseUrl: requireEnv("SUPABASE_URL"),
    supabaseKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    openaiApiKey: requireEnv("OPENAI_API_KEY"),
  });

  if (shouldClear) {
    const removed = await ingestor.clearAll();
    console.log(`Cleared ${removed} existing rows.`);
  }

  const result = await ingestor.ingest(documents);
  console.log(
    `Ingested ${result.documents} documents → ${result.chunks} chunks.`,
  );
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
