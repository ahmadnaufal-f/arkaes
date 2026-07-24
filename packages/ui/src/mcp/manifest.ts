import { manifestPath, readFile } from "./paths";

// ── Minimal shape of the Custom Elements Manifest we rely on ──────────────
interface CemType {
  text?: string;
}
interface CemAttribute {
  name: string;
  fieldName?: string;
  type?: CemType;
  default?: string;
  description?: string;
}
interface CemMember {
  kind: string;
  name: string;
  privacy?: string;
  static?: boolean;
  attribute?: string;
  reflects?: boolean;
  type?: CemType;
  default?: string;
  description?: string;
}
interface CemEvent {
  name: string;
  type?: CemType;
  description?: string;
}
interface CemSlot {
  name: string;
  description?: string;
}
interface CemCssProperty {
  name: string;
  default?: string;
  description?: string;
}
interface CemCssPart {
  name: string;
  description?: string;
}
interface CemDeclaration {
  kind: string;
  name: string;
  tagName?: string;
  customElement?: boolean;
  summary?: string;
  description?: string;
  attributes?: CemAttribute[];
  members?: CemMember[];
  events?: CemEvent[];
  slots?: CemSlot[];
  cssProperties?: CemCssProperty[];
  cssParts?: CemCssPart[];
}
interface CemModule {
  path: string;
  declarations?: CemDeclaration[];
}
interface CemManifest {
  modules?: CemModule[];
}

// ── Normalized, agent-facing shapes ───────────────────────────────────────
export interface PropApi {
  name: string;
  attribute: string | null;
  type: string;
  options: string[];
  default: string | null;
  required: boolean;
  reflects: boolean;
  description: string | null;
}
export interface EventApi {
  name: string;
  type: string | null;
  description: string | null;
}
export interface SlotApi {
  name: string;
  description: string | null;
}
export interface CssPropApi {
  name: string;
  default: string | null;
  description: string | null;
}
export interface CssPartApi {
  name: string;
  description: string | null;
}
export interface ComponentApi {
  tagName: string;
  className: string;
  layer: "primitive" | "component" | "pattern";
  summary: string | null;
  description: string | null;
  variants: string[];
  props: PropApi[];
  events: EventApi[];
  slots: SlotApi[];
  cssProperties: CssPropApi[];
  cssParts: CssPartApi[];
  notes: string[];
}

const DEFAULT_SLOT = "(default)";

function cleanDefault(raw: string | undefined): string | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "undefined") return null;
  // CEM serializes string defaults with their surrounding quotes.
  const unquoted = trimmed.match(/^["'](.*)["']$/);
  return unquoted?.[1] ?? trimmed;
}

/** Pull the string-literal members out of a union type such as `"a" | "b" | string`. */
function parseOptions(typeText: string | undefined): string[] {
  if (!typeText || !typeText.includes("|") && !/^["']/.test(typeText)) return [];
  const options: string[] = [];
  for (const part of typeText.split("|")) {
    const match = part.trim().match(/^["'](.*)["']$/);
    if (match?.[1] !== undefined) options.push(match[1]);
  }
  return options;
}

/**
 * Web components accept every attribute as optional at the platform level, so
 * "required" is a heuristic: a typed attribute with no default and whose type
 * does not admit `undefined` is the closest signal that a value is expected.
 */
function inferRequired(type: string | undefined, def: string | null, options: string[]): boolean {
  if (def !== null) return false;
  if (options.length > 0) return false; // enumerated props always resolve to a variant
  if (!type) return false;
  if (type === "boolean") return false;
  return !/\bundefined\b/.test(type);
}

function layerFromPath(path: string): ComponentApi["layer"] {
  if (path.includes("/patterns/")) return "pattern";
  if (path.includes("/components/")) return "component";
  return "primitive";
}

function normalizeDeclaration(decl: CemDeclaration, modulePath: string): ComponentApi {
  const notes: string[] = [];

  const props: PropApi[] = (decl.attributes ?? []).map((attr) => {
    let type = attr.type?.text ?? "string";
    const def = cleanDefault(attr.default);
    const options = parseOptions(attr.type?.text);
    // Base variants/sizes live on the bare `:host`, so their default value is
    // never an attribute selector the CSS scan can see — fold it back in.
    if (options.length > 0 && def && !options.includes(def)) options.unshift(def);
    // Keep the displayed type in sync with the (now complete) option set so
    // an agent never sees a union that is missing its own default value.
    if (options.length > 0) type = options.map((option) => JSON.stringify(option)).join(" | ");
    return {
      name: attr.fieldName ?? attr.name,
      attribute: attr.name,
      type,
      options,
      default: def,
      required: inferRequired(type, def, options),
      reflects: Boolean(
        (decl.members ?? []).find((m) => m.name === (attr.fieldName ?? attr.name))?.reflects,
      ),
      description: attr.description ?? null,
    };
  });

  const events: EventApi[] = (decl.events ?? []).map((event) => ({
    name: event.name,
    type: event.type?.text ?? null,
    description: event.description ?? null,
  }));

  const slots: SlotApi[] = (decl.slots ?? []).map((slot) => ({
    name: slot.name === "" ? DEFAULT_SLOT : slot.name,
    description: slot.description ?? null,
  }));

  const cssProperties: CssPropApi[] = (decl.cssProperties ?? []).map((prop) => ({
    name: prop.name,
    default: prop.default ?? null,
    description: prop.description ?? null,
  }));

  const cssParts: CssPartApi[] = (decl.cssParts ?? []).map((part) => ({
    name: part.name,
    description: part.description ?? null,
  }));

  // Variants: the `variant` attribute's option set, folding in its default
  // (base variants live on the bare `:host` with no attribute selector, so the
  // CSS scan never sees them).
  const variantProp = props.find((prop) => prop.attribute === "variant");
  let variants: string[] = [];
  if (variantProp) {
    variants = [...variantProp.options];
    if (variantProp.default && !variants.includes(variantProp.default)) {
      variants.unshift(variantProp.default);
    }
  }

  // Surface the manifest's known-weak spots instead of silently dropping them.
  if (slots.length === 0) {
    notes.push("No slots are declared in the manifest for this element.");
  }
  if (cssProperties.length === 0) {
    notes.push(
      "No CSS custom properties are declared for this element. It is still themeable "
        + "through the global --ark-* design tokens.",
    );
  }

  return {
    tagName: decl.tagName as string,
    className: decl.name,
    layer: layerFromPath(modulePath),
    summary: decl.summary ?? null,
    description: decl.description ? (decl.description.split("\n")[0] ?? "").trim() : null,
    variants,
    props,
    events,
    slots,
    cssProperties,
    cssParts,
    notes,
  };
}

let cache: Map<string, ComponentApi> | null = null;

/** Load and normalize the manifest once, keyed by tag name. */
export function loadComponents(): Map<string, ComponentApi> {
  if (cache) return cache;
  const manifest = JSON.parse(readFile(manifestPath())) as CemManifest;
  const map = new Map<string, ComponentApi>();
  for (const mod of manifest.modules ?? []) {
    for (const decl of mod.declarations ?? []) {
      if (decl.customElement && decl.tagName) {
        map.set(decl.tagName, normalizeDeclaration(decl, mod.path));
      }
    }
  }
  cache = new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
  return cache;
}
