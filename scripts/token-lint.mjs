#!/usr/bin/env node
// Token-compliance check for the @arkaes/ui component library.
//
// Fails if component source contains design values that should come from the
// generated tokens (packages/tokens) instead of being hard-authored:
//   1. Raw hex colors            (#rgb / #rrggbb / #rrggbbaa) — always flagged.
//   2. Raw px/rem spacing values that duplicate a `--ark-space-*` token, when
//      used in a spacing property (padding / margin / gap / inset).
//
// Layout dimensions and font-sizes that are NOT part of the spacing scale are
// intentionally NOT flagged — only values that have a token equivalent.
//
// Escape hatch: append `token-lint-disable-line` (ideally with a reason) in a
// comment on the offending line for a genuine one-off, e.g.
//   width: 3px; /* token-lint-disable-line: hairline, no token for 3px */
//
// Baseline: pre-existing occurrences recorded in token-lint-baseline.json are
// ignored so the check is green on today's tree while failing on ANY new
// violation. Regenerate after an intentional change with:
//   node scripts/token-lint.mjs --update-baseline
// The baseline is tech debt — burn it down by migrating those values to tokens.
import { readFileSync, writeFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE_PATH = join(REPO_ROOT, "scripts", "token-lint-baseline.json");

// Component source roots to scan. Add more package src dirs here to extend
// coverage (e.g. "packages/chatbot/src").
const SCAN_ROOTS = ["packages/ui/src"];

const DISABLE_MARKER = "token-lint-disable-line";

// Spacing-scale values that have a `--ark-space-*` token, in the units authors
// write. px equivalents assume the 16px root the system is designed around.
const REM_STEPS = new Set(["0.25", "0.5", "0.75", "1", "1.25", "1.5", "2", "2.5", "3", "4", "5", "6"]);
const PX_STEPS = new Set(["4", "8", "12", "16", "20", "24", "32", "40", "48", "64", "80", "96"]);

const SPACING_PROP =
  /\b(padding|padding-(?:top|right|bottom|left|block|inline)|margin|margin-(?:top|right|bottom|left|block|inline)|gap|row-gap|column-gap|inset|inset-block|inset-inline)\s*:\s*([^;{}\n]+)/gi;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const NUM_UNIT = /(\d*\.?\d+)(px|rem)\b/g;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

// Blank out comments (both /* */ and //) so values inside comments are not
// flagged, while preserving offsets and line count.
function stripComments(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  let mode = "code"; // code | block | line
  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];
    if (mode === "code") {
      if (c === "/" && c2 === "*") { out += "  "; i += 2; mode = "block"; continue; }
      if (c === "/" && c2 === "/") { out += "  "; i += 2; mode = "line"; continue; }
      out += c; i += 1;
    } else if (mode === "block") {
      if (c === "*" && c2 === "/") { out += "  "; i += 2; mode = "code"; continue; }
      out += c === "\n" ? "\n" : " "; i += 1;
    } else {
      if (c === "\n") { out += "\n"; i += 1; mode = "code"; continue; }
      out += " "; i += 1;
    }
  }
  return out;
}

function findings() {
  const results = [];
  for (const root of SCAN_ROOTS) {
    const abs = join(REPO_ROOT, root);
    for (const file of walk(abs)) {
      const rel = relative(REPO_ROOT, file);
      const raw = readFileSync(file, "utf8");
      const scan = stripComments(raw);
      const rawLines = raw.split("\n");
      const scanLines = scan.split("\n");
      scanLines.forEach((line, idx) => {
        const rawLine = rawLines[idx] ?? "";
        if (rawLine.includes(DISABLE_MARKER)) return;
        const lineNo = idx + 1;
        const text = rawLine.trim().replace(/\s+/g, " ");

        // 1. Raw hex colors anywhere.
        for (const m of line.matchAll(HEX)) {
          results.push({ file: rel, line: lineNo, kind: "color", value: m[0], text });
        }

        // 2. Spacing-scale px/rem inside spacing properties.
        SPACING_PROP.lastIndex = 0;
        let pm;
        while ((pm = SPACING_PROP.exec(line))) {
          const prop = pm[1];
          for (const nm of pm[2].matchAll(NUM_UNIT)) {
            const [tok, num, unit] = nm;
            const isStep = (unit === "rem" && REM_STEPS.has(num)) || (unit === "px" && PX_STEPS.has(num));
            if (isStep) {
              results.push({ file: rel, line: lineNo, kind: "spacing", value: `${prop}: ${tok}`, text });
            }
          }
        }
      });
    }
  }
  return results;
}

// Baseline key ignores line number so entries survive edits elsewhere in the
// file; editing the offending line itself changes `text` and re-flags it.
const keyOf = (f) => `${f.file}::${f.kind}::${f.value}::${f.text}`;

function loadBaseline() {
  try {
    return new Set(JSON.parse(readFileSync(BASELINE_PATH, "utf8")).map(keyOf));
  } catch {
    return new Set();
  }
}

const all = findings();

if (process.argv.includes("--update-baseline")) {
  const sorted = [...all].sort((a, b) =>
    a.file.localeCompare(b.file) || a.line - b.line || a.value.localeCompare(b.value),
  );
  writeFileSync(BASELINE_PATH, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`Wrote ${sorted.length} baseline entries to ${relative(REPO_ROOT, BASELINE_PATH)}`);
  process.exit(0);
}

const baseline = loadBaseline();
const violations = all.filter((f) => !baseline.has(keyOf(f)));

if (violations.length === 0) {
  console.log(`✓ token-lint: no new raw color/spacing values in ${SCAN_ROOTS.join(", ")}`);
  process.exit(0);
}

console.error(`✗ token-lint: ${violations.length} raw value(s) that should use design tokens:\n`);
for (const v of violations) {
  const hint =
    v.kind === "color"
      ? "use a --ark-color-* token (see packages/tokens/tokens/)"
      : "use a --ark-space-* token (see packages/tokens/tokens/primitive/dimension.json)";
  console.error(`  ${v.file}:${v.line}  [${v.kind}] ${v.value}`);
  console.error(`      → ${hint}`);
  console.error(`      ${v.text}`);
}
console.error(
  `\nFix by referencing the token, or add \`${DISABLE_MARKER}: <reason>\` in a comment on the line for a genuine one-off.`,
);
process.exit(1);
