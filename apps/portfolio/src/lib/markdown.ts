// Server-side markdown rendering for blog post bodies. Uses Astro's own
// processor (@astrojs/markdown-remark) so blog markdown behaves exactly like
// the framework's: GFM (tables, task lists, strikethrough, autolinks) plus
// Shiki syntax highlighting. Blog bodies come from Contentful at request time,
// outside the build-time content pipeline, which is why pages can't use
// <Content /> and render through this instead.
//
// Shiki's `css-variables` theme emits colors as var(--astro-code-*) so the
// palette is defined from --ark-* tokens in the blog CSS instead of being
// hardcoded here.
import { createMarkdownProcessor } from "@astrojs/markdown-remark";

type Processor = Awaited<ReturnType<typeof createMarkdownProcessor>>;

let processorPromise: Promise<Processor> | null = null;

const getProcessor = (): Promise<Processor> => {
  processorPromise ??= createMarkdownProcessor({
    gfm: true,
    syntaxHighlight: "shiki",
    shikiConfig: { theme: "css-variables" },
  });
  return processorPromise;
};

/**
 * Render a post's markdown body to HTML. The author is the only writer in
 * Contentful, so the body is trusted content (same trust model as the repo's
 * own .md files).
 */
export async function renderPostBody(markdown: string): Promise<string> {
  const processor = await getProcessor();
  const result = await processor.render(markdown);
  return result.code;
}
