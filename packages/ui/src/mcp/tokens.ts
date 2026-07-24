import { readFile, tokensCssPath } from "./paths";

export interface TokenApi {
  /** Token name without the `--ark-` / `--` noise, e.g. `color-accent`. */
  name: string;
  /** The full CSS custom property, e.g. `--ark-color-accent`. */
  cssProperty: string;
  /** The value exactly as declared in the source. */
  value: string;
  /** Value with `var(--token)` references substituted where resolvable. */
  resolvedValue: string;
  category: string;
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

let cache: TokenApi[] | null = null;

export function loadTokens(): TokenApi[] {
  if (cache) return cache;
  const css = readFile(tokensCssPath());
  const raw = new Map<string, string>();
  const order: string[] = [];
  const declRe = /(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match: RegExpExecArray | null;
  while ((match = declRe.exec(css)) !== null) {
    const prop = match[1];
    const value = match[2];
    if (prop === undefined || value === undefined) continue;
    // First declaration wins — later blocks (e.g. `:root[data-custom-cursor]`)
    // are conditional overrides, not the default value of the token.
    if (!raw.has(prop)) {
      raw.set(prop, value.trim());
      order.push(prop);
    }
  }

  cache = order.map((prop) => {
    const value = raw.get(prop) as string;
    return {
      name: friendlyName(prop),
      cssProperty: prop,
      value,
      resolvedValue: resolveValue(value, raw),
      category: categoryOf(prop),
    };
  });
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
