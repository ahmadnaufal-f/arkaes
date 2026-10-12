import { getEntry } from "astro:content";
import { contentfulConfigured, getPostBySlug } from "./contentful";
import {
  isValidContentSlug,
  type InternalContentKind,
} from "./internal-content-link";

export interface LinkPreviewMetadata {
  kind: "case-studies" | "projects" | "blog";
  href: string;
  title: string;
  description: string;
  cover?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } | null;
  visual?: string;
}

/** Resolve preview data only from the site's own content stores. */
export async function resolveLinkPreview(
  kind: InternalContentKind,
  slug: string,
): Promise<LinkPreviewMetadata | null> {
  if (!isValidContentSlug(slug)) return null;

  if (kind === "case-studies") {
    const entry = await getEntry("caseStudies", slug);
    if (!entry) return null;

    return {
      kind,
      href: `/case-studies/${entry.id}`,
      title: entry.data.title,
      description: entry.data.shortDesc,
      visual: entry.data.visual,
    };
  }

  if (kind === "projects") {
    const entry = await getEntry("projects", slug);
    if (!entry) return null;

    return {
      kind,
      href: `/projects/${entry.id}`,
      title: entry.data.title,
      description: entry.data.challenges,
      visual: entry.id,
    };
  }

  // An absent Contentful configuration is a service failure, not evidence that
  // a requested post does not exist. The API route turns this into a safe 503.
  if (!contentfulConfigured) {
    throw new Error("Contentful is not configured");
  }

  const post = await getPostBySlug(slug);
  if (!post) return null;

  return {
    kind,
    href: `/blog/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    cover: post.cover,
  };
}
