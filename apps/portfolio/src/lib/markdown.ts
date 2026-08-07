// Blog bodies come from Contentful at request time, outside the build-time
// content pipeline, which is why pages can't use <Content /> and render through
// this instead.
//
// The parsing is @arkaes/ui's shared renderer — the same one the case studies,
// the about page and the chatbot use — so the whole site agrees on what
// markdown means. This module only owns the app-specific part: the Shiki
// highlighter.
//
// The highlighter comes from @astrojs/markdown-remark rather than Shiki
// directly, so code blocks keep the exact <pre class="astro-code"> shape the
// stylesheet's --astro-code-* palette targets. Shiki's `css-variables` theme
// emits colors as var(--astro-code-*), and those are mapped onto --ark-* tokens
// in @arkaes/ui/markdown.css instead of being hardcoded here.
import { createShikiHighlighter } from "@astrojs/markdown-remark/shiki";
import { renderMarkdownAsync } from "@arkaes/ui/markdown";

type Highlighter = Awaited<ReturnType<typeof createShikiHighlighter>>;

let highlighterPromise: Promise<Highlighter> | null = null;

const getHighlighter = (): Promise<Highlighter> => {
  highlighterPromise ??= createShikiHighlighter({ theme: "css-variables" });
  return highlighterPromise;
};

/**
 * Render a post's markdown body to HTML. The author is the only writer in
 * Contentful, so the body is trusted content (same trust model as the repo's
 * own .md files).
 */
export async function renderPostBody(markdown: string): Promise<string> {
  const highlighter = await getHighlighter();

  return renderMarkdownAsync(markdown, {
    headings: "article",
    trust: "trusted",
    highlight: (code, lang) => highlighter.codeToHtml(code, lang || "plaintext"),
  });
}
