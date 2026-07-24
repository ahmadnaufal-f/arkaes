import { existsSync } from "node:fs";
import { join } from "node:path";
import { readFile, usageDir } from "./paths";

const cache = new Map<string, string | null>();

/**
 * Load the authored usage snippet for a tag, if one exists. Snippets live in
 * `usage/<tag>.md` and are the canonical source for idiomatic composition —
 * especially slot arrangements, which the manifest represents poorly.
 */
export function loadUsage(tagName: string): string | null {
  if (cache.has(tagName)) return cache.get(tagName) as string | null;
  const path = join(usageDir(), `${tagName}.md`);
  const content = existsSync(path) ? readFile(path).trim() : null;
  cache.set(tagName, content);
  return content;
}
