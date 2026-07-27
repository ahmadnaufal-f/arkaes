import { readFile, tokensCssPath, tokensJsonPath } from "./paths";

export interface TokenApi {
  /** Token name without the `--ark-` / `--` noise, e.g. `color-accent`. */
  name: string;
  /** The full CSS custom property, e.g. `--ark-color-accent`. */
  cssProperty: string;
  /** The value as authored (DTCG values arrive with references dereferenced). */
  value: string;
  /** Value with any `var(--token)` references substituted where resolvable. */
  resolvedValue: string;
  category: string;
  /** DTCG `$type` (color, dimension) for generated tokens; null for CSS-only. */
  type: string | null;
  /** DTCG `$description` for generated tokens; null for CSS-only. */
  description: string | null;
}

interface DtcgEntry {
  value: string;
  type?: string;
  description?: string;
}

const CATEGORY_ORDER = [
  "color",
  "spacing",
  "radius",
  "typography",
  "shadow",
  "motion",
  "layout",
  "other",
];

function categoryOf(cssProperty: string): string {
  const name = cssProperty.replace(/^--/, "");
  if (name.includes("color")) return "color";
  if (name.startsWith("ark-space")) return "spacing";
  if (name.includes("radius")) return "radius";
  if (name.includes("shadow")) return "shadow";
  if (name.includes("duration") || name.includes("ease")) return "motion";
  if (
    /(font|text|leading|tracking|weight|measure|letter-spacing|line-height)/.test(name)
  ) {
    return "typography";
  }
  if (name.includes("container") || name.startsWith("site-") || name.includes("cursor")) {
    return "layout";
  }
  return "other";
}

function friendlyName(cssProperty: string): string {
  return cssProperty.replace(/^--ark-/, "").replace(/^--/, "");
}

/** Substitute resolvable `var(--x)` references so agents see a concrete value. */
function resolveValue(value: string, raw: Map<string, string>, seen = new Set<string>()): string {
  return value.replace(/var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^)]*))?\)/gi, (match, ref, fallback) => {
    if (seen.has(ref)) return match;
    const target = raw.get(ref);
    if (target === undefined) return fallback !== undefined ? fallback.trim() : match;
    return resolveValue(target, raw, new Set([...seen, ref]));
  });
}

/** DTCG dot-path (`color.accent`) -> CSS custom property (`--ark-color-accent`). */
function dtcgKeyToCssProperty(key: string): string {
  return `--ark-${key.replace(/\./g, "-")}`;
}

/** Parse the hand-authored token CSS into ordered `--prop -> value` pairs. */
function parseCss(): { order: string[]; values: Map<string, string> } {
  const css = readFile(tokensCssPath());
  const values = new Map<string, string>();
  const order: string[] = [];
  const declRe = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match: RegExpExecArray | null;
  while ((match = declRe.exec(css)) !== null) {
    const prop = match[1];
    const value = match[2];
    if (prop === undefined || value === undefined) continue;
    // First declaration wins — later blocks (e.g. `:root[data-custom-cursor]`)
    // are conditional overrides, not the default value of the token.
    if (!values.has(prop)) {
      values.set(prop, value.trim());
      order.push(prop);
    }
  }
  return { order, values };
}

/** Load the DTCG flat JSON into ordered `--prop -> entry` pairs (if present). */
function parseDtcg(): { order: string[]; entries: Map<string, DtcgEntry> } {
  const path = tokensJsonPath();
  const entries = new Map<string, DtcgEntry>();
  const order: string[] = [];
  if (!path) return { order, entries };
  const parsed = JSON.parse(readFile(path)) as Record<string, DtcgEntry>;
  for (const [key, entry] of Object.entries(parsed)) {
    const cssProperty = dtcgKeyToCssProperty(key);
    entries.set(cssProperty, entry);
    order.push(cssProperty);
  }
  return { order, entries };
}

let cache: TokenApi[] | null = null;

export function loadTokens(): TokenApi[] {
  if (cache) return cache;

  // Color + spacing come from the generated DTCG JSON (with type/description and
  // references already resolved); everything else is still hand-authored CSS.
  const dtcg = parseDtcg();
  const css = parseCss();

  // A shared value map so CSS tokens that reference generated colors (e.g.
  // `--ark-shadow-sm` -> `var(--ark-color-neutral-900)`) still resolve.
  const resolveMap = new Map<string, string>();
  for (const [prop, entry] of dtcg.entries) resolveMap.set(prop, entry.value);
  for (const [prop, value] of css.values) if (!resolveMap.has(prop)) resolveMap.set(prop, value);

  const tokens: TokenApi[] = [];

  for (const cssProperty of dtcg.order) {
    const entry = dtcg.entries.get(cssProperty);
    if (!entry) continue;
    tokens.push({
      name: friendlyName(cssProperty),
      cssProperty,
      value: entry.value,
      resolvedValue: resolveValue(entry.value, resolveMap),
      category: categoryOf(cssProperty),
      type: entry.type ?? null,
      description: entry.description ?? null,
    });
  }

  for (const cssProperty of css.order) {
    // The DTCG JSON is authoritative for anything it defines (color/spacing).
    if (dtcg.entries.has(cssProperty)) continue;
    const value = css.values.get(cssProperty);
    if (value === undefined) continue;
    tokens.push({
      name: friendlyName(cssProperty),
      cssProperty,
      value,
      resolvedValue: resolveValue(value, resolveMap),
      category: categoryOf(cssProperty),
      type: null,
      description: null,
    });
  }

  cache = tokens;
  return cache;
}

export function tokenCategories(): { category: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const token of loadTokens()) {
    counts.set(token.category, (counts.get(token.category) ?? 0) + 1);
  }
  return CATEGORY_ORDER.filter((category) => counts.has(category)).map((category) => ({
    category,
    count: counts.get(category) as number,
  }));
}
