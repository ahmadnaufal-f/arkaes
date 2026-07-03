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
const PROJECTS_DIR = join(CONTENT_DIR, "projects");

const args = process.argv.slice(2);
const shouldClear = args.includes("--clear");
const dryRun = args.includes("--dry-run");

type FrontmatterValue = string | string[];

interface Frontmatter {
  data: Record<string, FrontmatterValue>;
  body: string;
}

const unquote = (value: string): string => value.trim().replace(/^["']|["']$/g, "");

// Minimal frontmatter reader: handles scalar `key: value` lines and
// `key:` followed by indented `- item` lines as a string array. Sufficient
// for this script's needs (title/role/category/stack/challenges) — it
// doesn't need to understand nested list-of-maps fields like `links`.
const parseFrontmatter = (raw: string): Frontmatter => {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data: Record<string, FrontmatterValue> = {};
  const lines = match[1]?.split("\n") ?? [];
  let currentListKey: string | null = null;

  for (const line of lines) {
    const listItem = /^\s*-\s+(.*)$/.exec(line);
    if (listItem && currentListKey) {
      const existing = data[currentListKey];
      const list = Array.isArray(existing) ? existing : [];
      list.push(unquote(listItem[1]));
      data[currentListKey] = list;
      continue;
    }

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = unquote(line.slice(idx + 1));
    if (!key) continue;

    if (value === "") {
      // Could start a list (`key:` followed by `- item` lines); track it
      // and only keep it once list items actually show up.
      currentListKey = key;
      continue;
    }
    currentListKey = null;
    data[key] = value;
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

const asString = (value: FrontmatterValue | undefined): string | undefined =>
  typeof value === "string" ? value : undefined;

const asStringArray = (value: FrontmatterValue | undefined): string[] =>
  Array.isArray(value) ? value : [];

const toProjectDocument = (raw: string, file: string): IngestDocument => {
  const { data, body } = parseFrontmatter(raw);
  const id = basename(file, extname(file));
  const category = asString(data.category);
  const stack = asStringArray(data.stack);
  const content = [
    data.title ? `# ${asString(data.title)}` : "",
    data.role ? `Role: ${asString(data.role)}` : "",
    category ? `Category: ${category}` : "",
    stack.length ? `Stack: ${stack.join(", ")}` : "",
    data.challenges ? `Challenges: ${asString(data.challenges)}` : "",
    body,
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    content,
    source: `project:${id}`,
    metadata: {
      type: "project",
      projectName: asString(data.projectName) ?? null,
      category: category ?? null,
    },
  };
};

const toCaseStudyDocument = (raw: string, file: string): IngestDocument => {
  const { data, body } = parseFrontmatter(raw);
  const id = basename(file, extname(file));
  const content = [
    data.title ? `# ${asString(data.title)}` : "",
    asString(data.shortDesc) ?? "",
    body,
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    content,
    source: `case-study:${id}`,
    metadata: {
      type: "case-study",
      projectName: asString(data.projectName) ?? null,
    },
  };
};

const collectDocuments = async (): Promise<IngestDocument[]> => {
  const files = await walk(CONTENT_DIR);
  const documents: IngestDocument[] = [];
  for (const file of files) {
    if (extname(file) !== ".md") continue;
    const raw = await readFile(file, "utf8");
    documents.push(
      file.startsWith(PROJECTS_DIR)
        ? toProjectDocument(raw, file)
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
