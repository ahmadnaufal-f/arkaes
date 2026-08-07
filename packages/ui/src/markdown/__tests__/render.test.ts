import { describe, expect, it } from "vitest";
import { renderMarkdown, renderMarkdownAsync } from "../render";

/**
 * marked emits newlines between block elements where the renderers this replaces
 * emitted none. Structural assertions compare on collapsed whitespace so they
 * describe the markup rather than the formatting; anything security-relevant is
 * asserted on the raw output.
 */
const tight = (source: string, options?: Parameters<typeof renderMarkdown>[1]) =>
  renderMarkdown(source, options).replace(/\n+/g, "").trim();

describe("renderMarkdown — inline formatting", () => {
  it("wraps a bare line in a paragraph", () => {
    expect(tight("Hello there")).toBe("<p>Hello there</p>");
  });

  it("renders bold, italic (* and _), and inline code", () => {
    expect(tight("**bold**")).toBe("<p><strong>bold</strong></p>");
    expect(tight("*em*")).toBe("<p><em>em</em></p>");
    expect(tight("_em_")).toBe("<p><em>em</em></p>");
    expect(tight("`code`")).toBe("<p><code>code</code></p>");
  });

  it("does not treat underscores inside a word as emphasis", () => {
    expect(tight("a_b_c")).toBe("<p>a_b_c</p>");
  });

  it("keeps soft-wrapped lines in one paragraph, unbroken, by default", () => {
    const html = renderMarkdown("line one\nline two");
    expect(html).not.toContain("<br>");
    expect(html.match(/<p>/g)).toHaveLength(1);
  });

  it("joins soft-wrapped lines with <br> when softBreaks is on", () => {
    expect(tight("line one\nline two", { softBreaks: true })).toContain("<br>");
  });

  it("returns an empty string for empty or blank input", () => {
    expect(renderMarkdown("")).toBe("");
    expect(tight("\n\n")).toBe("");
  });
});

describe("renderMarkdown — links and safety", () => {
  it("renders external links with target and rel", () => {
    expect(tight("[site](https://example.com)")).toBe(
      "<p><a href=\"https://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">site</a></p>",
    );
  });

  it("keeps same-origin links in place", () => {
    expect(tight("[work](/case-studies/x)")).toBe(
      "<p><a href=\"/case-studies/x\">work</a></p>",
    );
  });

  it("leaves javascript: links inert (not turned into anchors)", () => {
    const html = renderMarkdown("[x](javascript:alert(1))");
    expect(html).not.toContain("<a ");
    expect(html).toContain("[x]");
  });

  it("rejects protocol-relative urls", () => {
    expect(renderMarkdown("[x](//evil.example)")).not.toContain("<a ");
  });

  it("escapes raw HTML so it cannot execute", () => {
    const html = renderMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes inline raw HTML inside a paragraph", () => {
    const html = renderMarkdown("hello <img src=x onerror=alert(1)> there");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("lets raw HTML through only when the source is trusted", () => {
    expect(renderMarkdown("<div>ok</div>", { trust: "trusted" })).toContain("<div>ok</div>");
  });

  it("blocks a javascript: image src", () => {
    expect(renderMarkdown("![x](javascript:alert(1))")).not.toContain("<img");
  });

  it("ignores a diagrams map when the source is untrusted", () => {
    const html = renderMarkdown("![Flow](/a/flow.svg)", {
      features: ["figures"],
      diagrams: { flow: "<svg id=\"leak\"/>" },
    });
    expect(html).not.toContain("leak");
  });
});

describe("renderMarkdown — heading styles", () => {
  it("article: emits real levels with slug ids", () => {
    expect(tight("# One\n\n## Two\n\n### Three", { headings: "article" })).toBe(
      "<h1 id=\"one\" class=\"ark-md-heading\">One</h1>" +
        "<h2 id=\"two\" class=\"ark-md-heading\">Two</h2>" +
        "<h3 id=\"three\" class=\"ark-md-heading\">Three</h3>",
    );
  });

  it("article: de-duplicates repeated slugs", () => {
    const html = renderMarkdown("## Same\n\n## Same", { headings: "article" });
    expect(html).toContain("id=\"same\"");
    expect(html).toContain("id=\"same-1\"");
  });

  it("article: prefixes ids when asked", () => {
    expect(renderMarkdown("## Two", { headings: "article", headingIdPrefix: "post-" }))
      .toContain("id=\"post-two\"");
  });

  it("section: shifts every level down by one and emits no ids", () => {
    expect(tight("## Two\n\n### Three", { headings: "section" })).toBe(
      "<h3 class=\"ark-md-heading\">Two</h3><h4 class=\"ark-md-heading\">Three</h4>",
    );
  });

  it("section: reproduces the case-study h4 for a ### subheading", () => {
    expect(tight("### Subheading", { headings: "section" })).toBe(
      "<h4 class=\"ark-md-heading\">Subheading</h4>",
    );
  });

  it("flat: pins every level to one tag", () => {
    expect(tight("# One\n\n###### Six", { headings: "flat" })).toBe(
      "<h4 class=\"ark-md-heading\">One</h4><h4 class=\"ark-md-heading\">Six</h4>",
    );
  });

  it("clamps a shifted level at h6", () => {
    expect(tight("###### Six", { headings: "section" })).toBe(
      "<h6 class=\"ark-md-heading\">Six</h6>",
    );
  });

  it("applies headingOffset on top of the mode", () => {
    expect(tight("# One", { headings: "article", headingOffset: 1 })).toBe(
      "<h2 id=\"one\" class=\"ark-md-heading\">One</h2>",
    );
  });

  it("slugs from the text, not the markup, of a formatted heading", () => {
    expect(renderMarkdown("## A **bold** title", { headings: "article" }))
      .toContain("id=\"a-bold-title\"");
  });
});

describe("renderMarkdown — lists", () => {
  it("renders a flat unordered list", () => {
    expect(tight("- a\n- b\n- c")).toBe("<ul><li>a</li><li>b</li><li>c</li></ul>");
  });

  it("numbers a tight ordered list in a single <ol>", () => {
    expect(tight("1. one\n2. two\n3. three")).toBe(
      "<ol><li>one</li><li>two</li><li>three</li></ol>",
    );
  });

  it("keeps a loose ordered list in one <ol>", () => {
    expect(tight("1. one\n\n2. two\n\n3. three")).toContain("<ol>");
    expect(tight("1. one\n\n2. two\n\n3. three").match(/<ol/g)).toHaveLength(1);
  });

  it("preserves a non-1 starting number via the start attribute", () => {
    expect(tight("3. three\n4. four")).toBe(
      "<ol start=\"3\"><li>three</li><li>four</li></ol>",
    );
  });

  it("nests bullets by indentation instead of flattening them", () => {
    expect(tight("- Parent\n  - Child A\n  - Child B\n- Parent 2")).toBe(
      "<ul><li>Parent<ul><li>Child A</li><li>Child B</li></ul></li><li>Parent 2</li></ul>",
    );
  });

  it("handles three levels of nesting", () => {
    expect(tight("- a\n  - b\n    - c\n- d")).toBe(
      "<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li><li>d</li></ul>",
    );
  });
});

describe("renderMarkdown — GFM", () => {
  it("renders tables", () => {
    const html = tight("| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<th>a</th>");
    expect(html).toContain("<td>1</td>");
  });

  it("renders strikethrough", () => {
    expect(tight("~~gone~~")).toBe("<p><del>gone</del></p>");
  });

  it("renders task lists", () => {
    expect(tight("- [ ] todo")).toContain("type=\"checkbox\"");
  });
});

describe("renderMarkdown — code", () => {
  it("emits a language class and escapes the body", () => {
    expect(tight("```ts\nconst a = 1 < 2;\n```")).toBe(
      "<pre class=\"ark-md-code\"><code class=\"language-ts\">const a = 1 &lt; 2;</code></pre>",
    );
  });

  it("does not parse markdown inside a fence", () => {
    expect(tight("```\nconst x = **1**\n```")).toContain("**1**");
  });

  it("hands fenced code to a synchronous highlighter", () => {
    const html = renderMarkdown("```ts\nx\n```", {
      highlight: (code, lang) => `<pre data-lang="${lang}">${code}</pre>`,
    });
    expect(html).toContain("<pre data-lang=\"ts\">x</pre>");
  });

  it("awaits an asynchronous highlighter", async () => {
    const html = await renderMarkdownAsync("```ts\nx\n```", {
      highlight: async (code, lang) => `<pre class="astro-code" data-lang="${lang}">${code}</pre>`,
    });
    expect(html).toContain("<pre class=\"astro-code\" data-lang=\"ts\">x</pre>");
  });
});

describe("renderMarkdown — citations", () => {
  it("renders a single [n] marker as a badge", () => {
    expect(tight("Ahmad uses Lit [1].", { features: ["citations"] })).toBe(
      "<p>Ahmad uses Lit <span class=\"ark-md-cites\">" +
        "<span class=\"ark-md-cite\">1</span></span>.</p>",
    );
  });

  it("splits a combined [3, 5] marker into one badge per number", () => {
    expect(tight("Both apply [3, 5].", { features: ["citations"] })).toContain(
      "<span class=\"ark-md-cite\">3</span><span class=\"ark-md-cite\">5</span>",
    );
  });

  it("leaves bracketed digits inside code spans alone", () => {
    expect(tight("`arr[3]`", { features: ["citations"] })).toBe("<p><code>arr[3]</code></p>");
  });

  it("ignores non-numeric bracketed text", () => {
    expect(tight("see [note] here", { features: ["citations"] })).toBe(
      "<p>see [note] here</p>",
    );
  });

  it("does not swallow a real link that starts with digits", () => {
    expect(tight("[3](/three)", { features: ["citations"] })).toBe(
      "<p><a href=\"/three\">3</a></p>",
    );
  });

  it("stays inert when the feature is off", () => {
    expect(tight("Lit [1].")).not.toContain("ark-md-cite");
  });
});

describe("renderMarkdown — proof cards", () => {
  const options = { features: ["proof-cards"], trust: "trusted" } as const;

  it("renders metric, link and description", () => {
    expect(tight("→ ±87% shared | [Virtual Home](/vh) | Tech lead", options)).toBe(
      "<ul class=\"ark-md-proofs\"><li class=\"ark-md-proof\">" +
        "<a class=\"ark-md-proof-link\" href=\"/vh\">" +
        "<span class=\"ark-md-proof-metric\">±87% shared</span>" +
        "<span class=\"ark-md-proof-title\">Virtual Home</span>" +
        "<span class=\"ark-md-proof-desc\">Tech lead</span></a></li></ul>",
    );
  });

  it("omits the metric when only two fields are given", () => {
    const html = tight("→ [Just a link](/x) | a sentence", options);
    expect(html).not.toContain("ark-md-proof-metric");
    expect(html).toContain("<span class=\"ark-md-proof-title\">Just a link</span>");
  });

  it("still renders evidence that has no parseable link", () => {
    const html = tight("→ 12 shipped | not a link | a sentence", options);
    expect(html).toContain("<li class=\"ark-md-proof\">");
    expect(html).not.toContain("<a ");
  });

  it("groups consecutive proof lines into one list", () => {
    const html = tight("→ a | [x](/x) | one\n→ b | [y](/y) | two", options);
    expect(html.match(/<ul class="ark-md-proofs">/g)).toHaveLength(1);
    expect(html.match(/<li class="ark-md-proof">/g)).toHaveLength(2);
  });

  it("keeps a pipe inside the description", () => {
    // Four fields: the extra pipe belongs to the sentence, not to the schema.
    expect(tight("→ 12 shipped | [x](/x) | a | b", options)).toContain(
      "<span class=\"ark-md-proof-desc\">a | b</span>",
    );
  });

  it("stays inert when the feature is off", () => {
    expect(tight("→ a | [x](/x) | one")).not.toContain("ark-md-proofs");
  });
});

describe("renderMarkdown — glyph bullets", () => {
  const options = { features: ["glyph-bullets"] } as const;

  it("renders • lines as a list", () => {
    expect(tight("• first\n• second", options)).toBe(
      "<ul class=\"ark-md-list\"><li>first</li><li>second</li></ul>",
    );
  });

  it("folds a continuation line into the previous item, not a stray <p>", () => {
    const html = tight("• first item\ncontinued here\n• second", options);
    expect(html).toBe(
      "<ul class=\"ark-md-list\"><li>first item continued here</li><li>second</li></ul>",
    );
    expect(html).not.toContain("<p>");
  });

  it("applies inline formatting inside items", () => {
    expect(tight("• **bold** and `code`", options)).toContain(
      "<li><strong>bold</strong> and <code>code</code></li>",
    );
  });

  it("stays inert when the feature is off", () => {
    expect(tight("• first")).not.toContain("ark-md-list");
  });
});

describe("renderMarkdown — figures", () => {
  const options = {
    features: ["figures"],
    trust: "trusted",
    diagrams: { flow: "<svg id=\"F\"/>" },
  } as const;

  it("inlines an svg present in the diagrams map", () => {
    expect(tight("![Flow](/a/flow.svg)", options)).toBe(
      "<figure class=\"ark-md-figure\" role=\"img\" aria-label=\"Flow\"><svg id=\"F\"/></figure>",
    );
  });

  it("falls back to an img for an svg that is not in the map", () => {
    expect(tight("![Other](/a/other.svg)", options)).toContain("class=\"ark-md-diagram\"");
  });

  it("groups raster images into a captioned screenshot row", () => {
    const html = tight("![One](/a/one.png)\n![Two](/a/two.png)", options);
    expect(html).toContain("<div class=\"ark-md-shots\" data-count=\"2\">");
    expect(html).toContain("<figcaption>One</figcaption>");
    expect(html.match(/ark-md-shot"/g)).toHaveLength(2);
  });

  it("renders a plain image when the feature is off", () => {
    const html = tight("![One](/a/one.png)");
    expect(html).toContain("class=\"ark-md-image\"");
    expect(html).not.toContain("ark-md-shots");
  });
});
