import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getAllPosts } from "../lib/contentful";

// Hand-rolled rather than @astrojs/sitemap: that integration enumerates routes
// at `astro:build:done`, which only sees *prerendered* pages. The blog lives in
// Contentful behind `prerender = false` (see astro.config.mjs), so its posts
// would never appear. Rendering the sitemap as an on-demand route instead means
// it is generated from the same data as the pages themselves, and a publish
// refreshes it through the existing ISR path — /api/revalidate re-requests
// /sitemap.xml alongside the post, so a new URL is listed within seconds of
// publishing instead of waiting for the next deploy.
export const prerender = false;

/** Static, always-present routes. Listing pages first, then the flat pages. */
const STATIC_PATHS = ["/", "/case-studies", "/projects", "/blog", "/about"];

const escapeXml = (value: string): string =>
  value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });

interface SitemapEntry {
  path: string;
  lastmod?: Date;
}

const toUrlElement = (site: URL, entry: SitemapEntry): string => {
  const loc = escapeXml(new URL(entry.path, site).href);
  const lastmod = entry.lastmod
    ? `\n    <lastmod>${entry.lastmod.toISOString()}</lastmod>`
    : "";
  return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
};

export const GET: APIRoute = async ({ site, url }) => {
  // `site` comes from astro.config.mjs; fall back to the request origin so
  // preview deployments emit their own URLs rather than production ones.
  const origin = site ?? new URL(url.origin);

  const [caseStudies, projects, posts] = await Promise.all([
    getCollection("caseStudies"),
    getCollection("projects"),
    // A Contentful outage must not take the sitemap down with it — the static
    // routes and content-collection entries are still worth serving.
    getAllPosts().catch((error) => {
      console.error("[sitemap] failed to load blog posts", error);
      return [];
    }),
  ]);

  const entries: SitemapEntry[] = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...caseStudies.map((study) => ({ path: `/case-studies/${study.id}` })),
    ...projects.map((project) => ({
      path: `/projects/${project.id}`,
      lastmod: project.data.shippedDate,
    })),
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      lastmod: post.publishDate,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => toUrlElement(origin, entry)).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
};
