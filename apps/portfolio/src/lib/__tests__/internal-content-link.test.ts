import assert from "node:assert/strict";
import test from "node:test";

import {
  isInternalContentKind,
  isValidContentSlug,
  resolveInternalContentLink,
} from "../internal-content-link.ts";

const BASE_URL = "https://preview-123.arkaes.dev";

test("recognizes only supported content kinds", () => {
  assert.equal(isInternalContentKind("case-studies"), true);
  assert.equal(isInternalContentKind("projects"), true);
  assert.equal(isInternalContentKind("blog"), true);

  for (const value of ["", "case-study", "articles", "api", "Case-Studies", null, 1]) {
    assert.equal(isInternalContentKind(value), false, `unexpected content kind: ${String(value)}`);
  }
});

test("accepts safe slugs and rejects path-like or empty values", () => {
  for (const slug of ["find-ios", "the-ui-looked-simple-the-engineering-wasnt", "2025-design-systems", "café", "a..b"]) {
    assert.equal(isValidContentSlug(slug), true, `expected safe slug: ${slug}`);
  }

  for (const slug of ["", ".", "..", "../find-ios", "find/ios", "find%2Fios", "find\\ios", "find ios", "%2e%2e"]) {
    assert.equal(isValidContentSlug(slug), false, `expected unsafe slug: ${slug}`);
  }
});

test("resolves root-relative links and preserves query and fragment", () => {
  const result = resolveInternalContentLink("/case-studies/find-ios/?from=article#results", BASE_URL);

  assert.deepEqual(result, {
    kind: "case-studies",
    slug: "find-ios",
    href: "/case-studies/find-ios?from=article#results",
    key: "/case-studies/find-ios",
    endpoint: "/api/link-preview/case-studies/find-ios",
  });
});

test("resolves canonical and www production hosts as internal", () => {
  for (const host of ["https://arkaes.dev", "https://www.arkaes.dev"]) {
    const result = resolveInternalContentLink(`${host}/projects/oneux-lab-design-system`, BASE_URL);

    assert.equal(result?.kind, "projects");
    assert.equal(result?.slug, "oneux-lab-design-system");
    assert.equal(result?.href, "/projects/oneux-lab-design-system");
    assert.equal(result?.key, "/projects/oneux-lab-design-system");
    assert.equal(result?.endpoint, "/api/link-preview/projects/oneux-lab-design-system");
  }
});

test("resolves links on the current preview origin", () => {
  const result = resolveInternalContentLink(`${BASE_URL}/blog/designing-map-integrations-for-change`, BASE_URL);

  assert.equal(result?.kind, "blog");
  assert.equal(result?.slug, "designing-map-integrations-for-change");
  assert.equal(result?.href, "/blog/designing-map-integrations-for-change");
});

test("normalizes a trailing slash in the href and identity while preserving query and fragment", () => {
  const result = resolveInternalContentLink("/blog/a-useful-article/?q=1#section", BASE_URL);

  assert.equal(result?.href, "/blog/a-useful-article?q=1#section");
  assert.equal(result?.key, "/blog/a-useful-article");
});

test("encodes Unicode slugs consistently in canonical paths and endpoint URLs", () => {
  const result = resolveInternalContentLink("/blog/caf%C3%A9", BASE_URL);

  assert.equal(result?.slug, "café");
  assert.equal(result?.key, "/blog/caf%C3%A9");
  assert.equal(result?.href, "/blog/caf%C3%A9");
  assert.equal(result?.endpoint, "/api/link-preview/blog/caf%C3%A9");
});

test("returns null for external, deceptive, credentialed, and unsafe-scheme links", () => {
  const unsupported = [
    "https://example.com/case-studies/find-ios",
    "https://arkaes.dev.example.com/case-studies/find-ios",
    "https://notarkaes.dev/case-studies/find-ios",
    "https://arkaes.dev@evil.example/case-studies/find-ios",
    "https://user:pass@arkaes.dev/case-studies/find-ios",
    "javascript:alert(1)",
    "data:text/html,hi",
    "mailto:hello@arkaes.dev",
    "//evil.example/case-studies/find-ios",
  ];

  for (const href of unsupported) {
    assert.equal(resolveInternalContentLink(href, BASE_URL), null, `expected external/unsafe URL: ${href}`);
  }
});

test("rejects traversal, encoded separators, and malformed target paths", () => {
  const unsupported = [
    "/case-studies/../find-ios",
    "/case-studies/%2e%2e",
    "/case-studies/find%2Fios",
    "/case-studies/find%5Cios",
    "/case-studies/find%252Fios",
    "/case-studies/%",
    "/case-studies/find-ios/extra",
    "/case-studies/",
    "/case-studies",
    "/projects/oneux-lab-design-system/edit",
  ];

  for (const href of unsupported) {
    assert.equal(resolveInternalContentLink(href, BASE_URL), null, `expected invalid target path: ${href}`);
  }
});

test("ignores fragment-only links and listing pages", () => {
  for (const href of [
    "#section",
    "/",
    "/case-studies",
    "/case-studies/",
    "/projects",
    "/projects/",
    "/blog",
    "/blog/",
  ]) {
    assert.equal(resolveInternalContentLink(href, BASE_URL), null, `expected non-content URL: ${href}`);
  }
});
