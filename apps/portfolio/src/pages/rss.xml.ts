import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getAllPosts } from "../lib/contentful";
import { AUTHOR_NAME, SITE_NAME } from "../lib/seo";

// On-demand for the same reason as the sitemap: posts live in Contentful, so a
// build-time feed would go stale on every publish. /api/revalidate refreshes
// this alongside the post, so subscribers see a new entry within seconds.
export const prerender = false;

export const GET: APIRoute = async ({ site, url }) => {
  // `site` comes from astro.config.mjs; fall back to the request origin so
  // preview deployments emit their own URLs rather than production ones.
  const origin = site ?? new URL(url.origin);

  // A Contentful outage should degrade to an empty feed, not a 500 — readers
  // poll this on a schedule and a hard error looks like the feed is gone.
  const posts = await getAllPosts().catch((error) => {
    console.error("[rss] failed to load blog posts", error);
    return [];
  });

  return rss({
    title: `${AUTHOR_NAME} — ${SITE_NAME}`,
    description:
      "Writing on frontend engineering, design systems, and product craft.",
    site: origin,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt,
      link: `/blog/${post.slug}`,
      pubDate: post.publishDate,
      categories: [post.category, ...post.tags].filter(Boolean),
    })),
    // `managingEditor`/`webMaster` are conventionally email addresses, which
    // this feed deliberately omits; `atom:link` is what readers actually need
    // to know the feed's canonical location.
    xmlns: { atom: "http://www.w3.org/2005/Atom" },
    customData: [
      "<language>en</language>",
      `<atom:link href="${new URL("/rss.xml", origin).href}" rel="self" type="application/rss+xml"/>`,
    ].join(""),
  });
};
