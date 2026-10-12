/** Public content destinations that can have a Markdown preview. */
export type InternalContentKind = "case-studies" | "projects" | "blog";

export interface InternalContentLink {
  kind: InternalContentKind;
  slug: string;
  /** Same-site navigation, retaining the author's query and fragment. */
  href: string;
  /** Metadata identity: query strings and fragments do not change the page. */
  key: string;
  endpoint: string;
}

export const isInternalContentKind = (value: unknown): value is InternalContentKind =>
  value === "case-studies" || value === "projects" || value === "blog";

/** Slugs are a single content ID, never a filesystem path or another URL. */
export const isValidContentSlug = (slug: unknown): slug is string =>
  typeof slug === "string" &&
  slug.length <= 200 && /^[\p{L}\p{N}_-][\p{L}\p{N}_.-]*$/u.test(slug);

/**
 * Resolve authored links to our public detail pages. This module is shared by
 * the browser and server and deliberately has no CMS or Astro dependencies.
 */
export function resolveInternalContentLink(
  href: string,
  baseUrl: string | URL,
): InternalContentLink | null {
  const source = href.trim();
  if (!source || source.startsWith("#") || source.startsWith("?")) return null;
  // Reject ambiguous URL spelling before URL() normalizes it. In particular,
  // encoded traversal must not turn an unrelated path into a content link.
  if ([...source].some((char) =>
    char === "\\" || char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127)) return null;
  const rawPath = source.split(/[?#]/, 1)[0];
  if (/(?:^|\/)(?:\.|%2e){1,2}(?:\/|$)/i.test(rawPath)) return null;

  try {
    const base = new URL(baseUrl);
    const url = new URL(source, base);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    const canonicalHost =
      (url.hostname === "arkaes.dev" || url.hostname === "www.arkaes.dev") && !url.port;
    if (url.origin !== base.origin && !canonicalHost) return null;

    const match = /^\/([^/]+)\/([^/]+)\/?$/.exec(url.pathname);
    if (!match || !isInternalContentKind(match[1])) return null;
    const slug = decodeURIComponent(match[2]);
    if (!isValidContentSlug(slug)) return null;
    const kind = match[1];
    const key = `/${kind}/${encodeURIComponent(slug)}`;
    return {
      kind,
      slug,
      href: `${key}${url.search}${url.hash}`,
      key,
      endpoint: `/api/link-preview/${kind}/${encodeURIComponent(slug)}`,
    };
  } catch {
    return null;
  }
}
