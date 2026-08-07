import GithubSlugger from "github-slugger";
import type { ResolvedMarkdownOptions } from "./options";
import { escapeAttribute } from "./safety";

export interface HeadingRenderer {
  /** Renders one heading. `plain` is the text-only form, used for the slug id. */
  render(depth: number, inner: string, plain: string): string;
  /** Clears slug bookkeeping so a reused renderer does not emit `-1` suffixes. */
  reset(): void;
}

/**
 * Applies the mode's structural rules: the level shift (`section` renders `###`
 * as an `<h4>`), the fixed level (`flat`), and whether slug ids are emitted.
 * The visual treatment is CSS — see the `.ark-md-headings-*` blocks in styles.ts.
 */
export const createHeadingRenderer = (
  options: ResolvedMarkdownOptions,
): HeadingRenderer => {
  const slugger = new GithubSlugger();

  return {
    reset: () => slugger.reset(),
    render(depth: number, inner: string, plain: string): string {
      const level =
        options.headingFixedLevel ??
        Math.min(6, Math.max(1, depth + options.headingOffset));

      const id = options.headingIds
        ? ` id="${escapeAttribute(options.headingIdPrefix + slugger.slug(plain))}"`
        : "";

      return `<h${level}${id} class="ark-md-heading">${inner}</h${level}>\n`;
    },
  };
};
