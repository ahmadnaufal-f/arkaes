/**
 * URL and HTML safety helpers.
 *
 * The renderer's default trust level is "untrusted": raw HTML is escaped to
 * literal text and every href/src is checked against an allowlist, so a
 * `javascript:` url or a `<script>` tag in model output is inert rather than
 * merely unlikely. Trusted callers opt out explicitly.
 */

/** Absolute schemes we are willing to link to. */
const SAFE_SCHEME = /^(?:https?:|mailto:)/i;

/** Same-document and same-origin references: `/x`, `#x`, `./x`, `../x`. */
const RELATIVE_URL = /^(?:\/(?!\/)|#|\.{1,2}\/)/;

/** Schemeless hosts and bare paths (`foo.md`, `images/a.png`) are same-origin too. */
const BARE_PATH = /^[\w.-]+(?:[/?#][^\s]*)?$/;

export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Escapes a value destined for a double-quoted attribute. */
export const escapeAttribute = (value: string): string => escapeHtml(value);

export const isExternalUrl = (url: string): boolean => /^https?:\/\//i.test(url.trim());

/**
 * True when the url is safe to emit as an href or src. Protocol-relative urls
 * (`//host`) are rejected along with every scheme outside the allowlist.
 */
export const isSafeUrl = (url: string): boolean => {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (RELATIVE_URL.test(trimmed)) return true;
  if (SAFE_SCHEME.test(trimmed)) return true;
  // A colon before the first slash means an unrecognised scheme, not a path.
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return false;
  return BARE_PATH.test(trimmed);
};

/** External links open in a new tab; same-origin links stay in place. */
export const linkTargetAttributes = (href: string): string =>
  isExternalUrl(href) ? " target=\"_blank\" rel=\"noopener noreferrer\"" : "";
