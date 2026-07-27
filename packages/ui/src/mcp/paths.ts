import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

/**
 * Walk up from this module until the directory holding the generated
 * `custom-elements.json` is found. That directory is the package root both in
 * this monorepo (after `pnpm build`) and in the published npm package, where
 * the manifest and `usage/` folder ship alongside `dist/`.
 */
export function findPackageRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 8; depth += 1) {
    if (existsSync(join(dir, "custom-elements.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    "arkaes-mcp: could not locate custom-elements.json. Run `pnpm build` in @arkaes/ui first.",
  );
}

export function manifestPath(root = findPackageRoot()): string {
  return join(root, "custom-elements.json");
}

export function usageDir(root = findPackageRoot()): string {
  return join(root, "usage");
}

/**
 * Resolve the hand-authored token CSS. `@arkaes/tokens` exports the CSS file
 * directly, so we resolve it through Node rather than guessing a path — this
 * works against both the workspace source and the published dist. As of the
 * DTCG migration this file holds only typography, radius, shadow, motion, and
 * layout tokens; color and spacing are generated (see `tokensJsonPath`).
 */
export function tokensCssPath(): string {
  return require.resolve("@arkaes/tokens/tokens.css");
}

/**
 * Resolve the DTCG flat token JSON (`{ "color.accent": { value, type,
 * description }, … }`) that Style Dictionary generates from the token sources.
 * It is the machine-readable source of truth for color and spacing, with
 * references already dereferenced. Returns null if the installed
 * `@arkaes/tokens` predates the DTCG migration.
 */
export function tokensJsonPath(): string | null {
  try {
    return require.resolve("@arkaes/tokens/tokens.json");
  } catch {
    return null;
  }
}

export function readFile(path: string): string {
  return readFileSync(path, "utf8");
}
