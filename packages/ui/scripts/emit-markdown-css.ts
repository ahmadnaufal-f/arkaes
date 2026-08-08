// Writes the markdown prose stylesheet out as a plain .css file.
//
// `src/markdown/styles.ts` is the source of truth — authored as a Lit `css`
// template so the chat bubble's shadow root can adopt it directly, and so
// scripts/token-lint.mjs (which scans .ts under packages/ui/src) checks it.
//
// The server-rendered path has no shadow root and no JavaScript: Astro emits the
// markup into the light DOM, which needs an ordinary stylesheet. This emits it.
// Both targets are written when present — src/ for workspace consumers that
// resolve to source, dist/ for the published package.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { markdownStyles } from "../src/markdown/styles";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const banner = [
  "/* Generated from src/markdown/styles.ts — do not edit.",
  "   Regenerate with: pnpm --filter @arkaes/ui emit-css */",
].join("\n");

const targets = [
  join(packageRoot, "src", "styles", "markdown.css"),
  join(packageRoot, "dist", "styles", "markdown.css"),
];

for (const target of targets) {
  // dist/ only exists after a build; src/ is always written.
  if (target.includes(`${"dist"}/`) && !existsSync(join(packageRoot, "dist"))) {
    continue;
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${banner}\n${markdownStyles.cssText}\n`, "utf8");
  console.log(`✔︎ ${relative(packageRoot, target)}`);
}
