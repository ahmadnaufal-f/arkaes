// Contentful data layer for the blog. Content lives in Contentful (not in the
// repo) so publishing never touches git history; the blog routes fetch at
// request time and rely on Vercel ISR for caching + on-demand revalidation
// (see /api/revalidate). Mirrors rag.ts: reads server-only env and degrades to
// "not configured" instead of crashing when the space/token are absent.
import { createClient, type Entry, type EntryFieldTypes } from "contentful";

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const deliveryToken = process.env.CONTENTFUL_DELIVERY_TOKEN;
const environment = process.env.CONTENTFUL_ENVIRONMENT ?? "master";

export const contentfulConfigured = Boolean(spaceId && deliveryToken);

interface BlogPostSkeleton {
  contentTypeId: "blogPost";
  fields: {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    excerpt: EntryFieldTypes.Symbol;
    category: EntryFieldTypes.Symbol;
    tags: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    publishDate: EntryFieldTypes.Date;
    coverImage: EntryFieldTypes.AssetLink;
    body: EntryFieldTypes.Text;
    featured: EntryFieldTypes.Boolean;
  };
}

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishDate: Date;
  cover: { src: string; alt: string } | null;
  /** Raw markdown body — render with renderPostBody() from lib/markdown. */
  body: string;
  featured: boolean;
}

// `withoutUnresolvableLinks` so a deleted cover asset comes back undefined
// instead of as a dangling link object.
const getClient = () => {
  if (!spaceId || !deliveryToken) return null;
  return createClient({
    space: spaceId,
    accessToken: deliveryToken,
    environment,
  }).withoutUnresolvableLinks;
};

type BlogPostEntry = Entry<BlogPostSkeleton, "WITHOUT_UNRESOLVABLE_LINKS">;

const toPost = (entry: BlogPostEntry): BlogPost => {
  const { title, slug, excerpt, category, tags, publishDate, coverImage, body, featured } =
    entry.fields;
  const coverFile = coverImage?.fields.file;
  return {
    title: title ?? "",
    slug: slug ?? "",
    excerpt: excerpt ?? "",
    category: category ?? "",
    tags: tags?.filter((tag): tag is string => Boolean(tag)) ?? [],
    publishDate: new Date(publishDate ?? entry.sys.createdAt),
    cover: coverFile?.url
      ? {
        // Contentful asset URLs are protocol-relative.
        src: `https:${coverFile.url}`,
        alt: coverImage?.fields.description ?? title ?? "",
      }
      : null,
    body: body ?? "",
    featured: featured ?? false,
  };
};

/** All published posts, newest first. Empty when Contentful isn't configured. */
export async function getAllPosts(): Promise<BlogPost[]> {
  const client = getClient();
  if (!client) return [];
  const entries = await client.getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    order: ["-fields.publishDate"],
    limit: 1000,
  });
  return entries.items.map(toPost).filter((post) => post.slug);
}

/** A single post by slug, or null when missing/not configured. */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const client = getClient();
  if (!client) return null;
  const entries = await client.getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    "fields.slug": slug,
    limit: 1,
  });
  const entry = entries.items[0];
  return entry ? toPost(entry) : null;
}

/** Distinct categories across the given posts, in first-seen order. */
export const categoriesOf = (posts: BlogPost[]): string[] => [
  ...new Set(posts.map((post) => post.category).filter(Boolean)),
];

/** Distinct tags across the given posts, in first-seen order. */
export const tagsOf = (posts: BlogPost[]): string[] => [
  ...new Set(posts.flatMap((post) => post.tags)),
];
