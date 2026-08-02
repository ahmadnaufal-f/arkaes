// Site-level SEO constants and schema.org builders.
//
// Every page's <head> is assembled in BaseLayout.astro, which always emits the
// Person + WebSite nodes below; pages add their own nodes (BlogPosting,
// BreadcrumbList, …) through the `jsonLd` prop. Emitting them as a single
// `@graph` — rather than several sibling <script> tags — lets nodes reference
// each other by `@id` instead of repeating the same Person object on every page.

/** Display name for the site/brand — used for og:site_name and WebSite.name. */
export const SITE_NAME = "Arkaes";

/** The person the portfolio is about. Titles lead with this, not the brand. */
export const AUTHOR_NAME = "Ahmad Naufal";
export const AUTHOR_JOB_TITLE = "Frontend Engineer";

/**
 * Profile URLs for Person.sameAs — the strongest signal tying this site to an
 * existing identity. Only profiles that represent the professional identity
 * belong here; a personal account would tie the two together in search results.
 */
export const AUTHOR_PROFILES: readonly string[] = [
  "https://github.com/ahmadnaufal-f",
  "https://linkedin.com/in/ahmad-naufal-f",
];

/** Fallback social share image; see scripts/generate-og-image.ts. */
export const DEFAULT_OG_IMAGE = "/og-default.png";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

/** A schema.org node. Loose by design — the shapes vary per @type. */
export type SchemaNode = Record<string, unknown>;

const idFor = (site: URL, fragment: string) => new URL(`/#${fragment}`, site).href;

export const PERSON_ID = (site: URL) => idFor(site, "person");
export const WEBSITE_ID = (site: URL) => idFor(site, "website");

export const personSchema = (site: URL): SchemaNode => ({
  "@type": "Person",
  "@id": PERSON_ID(site),
  name: AUTHOR_NAME,
  jobTitle: AUTHOR_JOB_TITLE,
  url: new URL("/", site).href,
  ...(AUTHOR_PROFILES.length > 0 ? { sameAs: [...AUTHOR_PROFILES] } : {}),
});

export const websiteSchema = (site: URL): SchemaNode => ({
  "@type": "WebSite",
  "@id": WEBSITE_ID(site),
  name: SITE_NAME,
  url: new URL("/", site).href,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID(site) },
});

/**
 * Trail from the site root to the current page. Pass the intermediate crumbs
 * only — the "Home" entry is prepended here so every trail starts the same way.
 */
export const breadcrumbSchema = (
  site: URL,
  crumbs: readonly { name: string; path: string }[],
): SchemaNode => ({
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map(
    (crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: new URL(crumb.path, site).href,
    }),
  ),
});

export const blogPostingSchema = (
  site: URL,
  post: {
    title: string;
    excerpt: string;
    slug: string;
    publishDate: Date;
    tags: readonly string[];
    cover: { src: string } | null;
  },
): SchemaNode => {
  const url = new URL(`/blog/${post.slug}`, site).href;
  return {
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: url,
    datePublished: post.publishDate.toISOString(),
    inLanguage: "en",
    author: { "@id": PERSON_ID(site) },
    publisher: { "@id": PERSON_ID(site) },
    isPartOf: { "@id": WEBSITE_ID(site) },
    ...(post.tags.length > 0 ? { keywords: [...post.tags] } : {}),
    ...(post.cover ? { image: post.cover.src } : {}),
  };
};

/** Case studies and projects: authored work, not articles. */
export const creativeWorkSchema = (
  site: URL,
  work: {
    name: string;
    description: string;
    path: string;
    keywords?: readonly string[];
    datePublished?: Date;
  },
): SchemaNode => {
  const url = new URL(work.path, site).href;
  return {
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    name: work.name,
    description: work.description,
    url,
    inLanguage: "en",
    author: { "@id": PERSON_ID(site) },
    isPartOf: { "@id": WEBSITE_ID(site) },
    ...(work.keywords?.length ? { keywords: [...work.keywords] } : {}),
    ...(work.datePublished
      ? { datePublished: work.datePublished.toISOString() }
      : {}),
  };
};

export const collectionPageSchema = (
  site: URL,
  page: { name: string; description: string; path: string },
): SchemaNode => {
  const url = new URL(page.path, site).href;
  return {
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    name: page.name,
    description: page.description,
    url,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID(site) },
  };
};

/**
 * Serialize a JSON-LD graph for inlining with `set:html`.
 *
 * `<` is escaped so a stray "</script>" inside CMS-authored text (a post title,
 * an excerpt) can't terminate the <script> block early and inject markup.
 * JSON-LD is parsed as JSON, where < is just "<", so escaping is lossless.
 */
export const serializeJsonLd = (nodes: readonly SchemaNode[]): string =>
  JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  }).replace(/</g, "\\u003c");
