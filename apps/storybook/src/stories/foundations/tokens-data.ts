// Data layer shared by the Foundations stories. Everything here is agnostic of
// which DTCG `$type` is being documented, so a future Foundations/Spacing story
// is `tokensOfType("dimension")` plus its own row renderer — nothing
// color-specific belongs in this file.
import tokens from "@arkaes/tokens/tokens.json";

export interface TokenRow {
  /** DTCG dot-path, e.g. `color.accent`. */
  path: string;
  /** CSS custom property, e.g. `--ark-color-accent`. */
  cssProperty: string;
  /** Fully dereferenced value from the generated JSON. */
  value: string;
  /** Value as authored, when it still contains an `{alias}`; undefined for literals. */
  reference: string | undefined;
  description: string | undefined;
  /** Authoring tier — the directory under `packages/tokens/tokens/`. */
  tier: string;
}

export interface TierGroup {
  tier: string;
  rows: TokenRow[];
}

export interface TokenDrift {
  /** Declared in the generated CSS but absent from the JSON (e.g. hand-authored). */
  missingInJson: string[];
  /** Present in the JSON but never declared in CSS — a stale generated stylesheet. */
  missingInCss: string[];
}

/** Preferred display order. Any tier not listed sorts after these, alphabetically. */
const TIER_ORDER = ["primitive", "semantic", "component"];

/**
 * DTCG dot-path -> CSS custom property. Mirrors `dtcgKeyToCssProperty` in
 * packages/ui/src/mcp/tokens.ts; the `name/kebab` transform with `prefix: "ark"`
 * in packages/tokens/scripts/build-tokens.mjs produces exactly this shape.
 */
export function cssPropertyFor(path: string): string {
  return `--ark-${path.replace(/\./g, "-")}`;
}

/**
 * Every token of a given DTCG `$type`, in authored order — deliberate, because
 * the ramps read `blush-50` through `blush-600` in the source and alphabetical
 * sorting would scramble them (`-100` before `-50`).
 *
 * Driven entirely by the generated artifact, so a token added under
 * packages/tokens/tokens/ appears here without this file being touched.
 */
export function tokensOfType(type: string): TokenRow[] {
  return Object.entries(tokens)
    .filter(([, entry]) => entry.type === type)
    .map(([path, entry]) => ({
      path,
      cssProperty: cssPropertyFor(path),
      value: entry.value,
      reference: entry.reference,
      description: entry.description,
      tier: entry.tier,
    }));
}

/**
 * Group rows by tier, TIER_ORDER first and authored order preserved within each
 * group. Keyed on whatever tier strings actually arrive rather than on a fixed
 * list, so a new `tokens/<tier>/` directory shows up at the bottom of the page
 * instead of vanishing.
 */
export function groupByTier(rows: TokenRow[]): TierGroup[] {
  const groups = new Map<string, TokenRow[]>();
  for (const row of rows) {
    const existing = groups.get(row.tier);
    if (existing) existing.push(row);
    else groups.set(row.tier, [row]);
  }

  const rank = (tier: string) => {
    const index = TIER_ORDER.indexOf(tier);
    return index === -1 ? TIER_ORDER.length : index;
  };

  return [...groups.entries()]
    .map(([tier, tierRows]) => ({ tier, rows: tierRows }))
    .sort((a, b) => rank(a.tier) - rank(b.tier) || a.tier.localeCompare(b.tier));
}

/**
 * Every `--ark-<prefix>-*` custom property declared on a `:root` rule in the
 * loaded stylesheets. Returns null when the sheets cannot be read — a
 * cross-origin stylesheet throws on `.cssRules` — so callers can degrade rather
 * than crash.
 */
function declaredCssProperties(prefix: string): Set<string> | null {
  const declared = new Set<string>();
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      for (const rule of Array.from(sheet.cssRules)) {
        if (!(rule instanceof CSSStyleRule) || !rule.selectorText.includes(":root")) continue;
        for (const property of Array.from(rule.style)) {
          if (property.startsWith(`--ark-${prefix}-`)) declared.add(property);
        }
      }
    }
  } catch {
    return null;
  }
  return declared;
}

/**
 * Diff the generated CSS against the generated JSON, both directions. This is
 * what makes it impossible for a token to be quietly missing from a Foundations
 * story: the row list is derived from the JSON, so `missingInJson` catches
 * anything hand-authored straight into tokens.css that the JSON never sees.
 */
export function findDrift(rows: TokenRow[], prefix: string): TokenDrift | null {
  const declared = declaredCssProperties(prefix);
  if (declared === null) return null;

  const known = new Set(rows.map((row) => row.cssProperty));
  return {
    missingInJson: [...declared].filter((property) => !known.has(property)).sort(),
    missingInCss: rows
      .filter((row) => !declared.has(row.cssProperty))
      .map((row) => row.cssProperty)
      .sort(),
  };
}
