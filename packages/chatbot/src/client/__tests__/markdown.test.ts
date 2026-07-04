import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../markdown";

describe("renderMarkdown — inline formatting", () => {
  it("wraps a bare line in a paragraph", () => {
    expect(renderMarkdown("Hello there")).toBe("<p>Hello there</p>");
  });

  it("renders bold, italic (* and _), and inline code", () => {
    expect(renderMarkdown("**bold**")).toBe("<p><strong>bold</strong></p>");
    expect(renderMarkdown("*em*")).toBe("<p><em>em</em></p>");
    expect(renderMarkdown("_em_")).toBe("<p><em>em</em></p>");
    expect(renderMarkdown("`code`")).toBe("<p><code>code</code></p>");
  });

  it("does not treat underscores inside a word as emphasis", () => {
    expect(renderMarkdown("a_b_c")).toBe("<p>a_b_c</p>");
  });

  it("joins soft-wrapped paragraph lines with <br>", () => {
    expect(renderMarkdown("line one\nline two")).toBe("<p>line one<br>line two</p>");
  });
});

describe("renderMarkdown — links and safety", () => {
  it("renders safe http/mailto links with target and rel", () => {
    expect(renderMarkdown("[site](https://example.com)")).toBe(
      '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a></p>',
    );
  });

  it("leaves javascript: links inert (not turned into anchors)", () => {
    const html = renderMarkdown("[x](javascript:alert(1))");
    expect(html).not.toContain("<a ");
    expect(html).toContain("[x]");
  });

  it("escapes raw HTML so it cannot execute", () => {
    const html = renderMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("renderMarkdown — citation markers", () => {
  it("renders a single [n] marker as a circular badge", () => {
    expect(renderMarkdown("Ahmad uses Lit [1].")).toBe(
      '<p>Ahmad uses Lit <span class="md-cites"><span class="md-cite">1</span></span>.</p>',
    );
  });

  it("splits a combined [3, 5] marker into one badge per number", () => {
    expect(renderMarkdown("Both apply [3, 5].")).toBe(
      '<p>Both apply <span class="md-cites"><span class="md-cite">3</span><span class="md-cite">5</span></span>.</p>',
    );
  });

  it("leaves bracketed digits inside code spans alone", () => {
    expect(renderMarkdown("`arr[3]`")).toBe(
      "<p><code>arr[3]</code></p>",
    );
  });

  it("ignores non-numeric bracketed text", () => {
    expect(renderMarkdown("see [note] here")).toBe("<p>see [note] here</p>");
  });
});

describe("renderMarkdown — block elements", () => {
  it("renders headings as styled paragraphs", () => {
    expect(renderMarkdown("## Title")).toBe('<p class="md-h">Title</p>');
  });

  it("merges consecutive blockquote lines", () => {
    expect(renderMarkdown("> one\n> two")).toBe("<blockquote>one two</blockquote>");
  });

  it("renders fenced code blocks verbatim (no inline parsing inside)", () => {
    expect(renderMarkdown("```\nconst x = **1**\n```")).toBe(
      "<pre><code>const x = **1**</code></pre>",
    );
  });

  it("separates a preceding paragraph from a list", () => {
    expect(renderMarkdown("Steps:\n1. one\n2. two")).toBe(
      "<p>Steps:</p><ol><li>one</li><li>two</li></ol>",
    );
  });

  it("returns an empty string for empty or blank input", () => {
    expect(renderMarkdown("")).toBe("");
    expect(renderMarkdown("\n\n")).toBe("");
  });
});

describe("renderMarkdown — unordered lists", () => {
  it("renders a flat unordered list", () => {
    expect(renderMarkdown("- a\n- b\n- c")).toBe(
      "<ul><li>a</li><li>b</li><li>c</li></ul>",
    );
  });

  it("accepts *, +, and - as bullet markers", () => {
    expect(renderMarkdown("* a\n+ b\n- c")).toBe(
      "<ul><li>a</li><li>b</li><li>c</li></ul>",
    );
  });

  it("applies inline formatting inside list items", () => {
    expect(renderMarkdown("- **bold** and `code`")).toBe(
      "<ul><li><strong>bold</strong> and <code>code</code></li></ul>",
    );
  });
});

describe("renderMarkdown — ordered lists (numbering must not restart at 1)", () => {
  it("numbers a tight ordered list natively in a single <ol>", () => {
    expect(renderMarkdown("1. one\n2. two\n3. three")).toBe(
      "<ol><li>one</li><li>two</li><li>three</li></ol>",
    );
  });

  it("keeps a loose ordered list (blank lines between items) in one <ol>", () => {
    // Regression: previously each item became its own <ol>, so every item
    // rendered as "1.".
    expect(renderMarkdown("1. one\n\n2. two\n\n3. three")).toBe(
      "<ol><li>one</li><li>two</li><li>three</li></ol>",
    );
  });

  it("keeps a wrapped continuation line inside its ordered item", () => {
    // Regression: the continuation line used to break the run and restart <ol>.
    expect(renderMarkdown("1. first item that wraps\n   onto a second line\n2. second")).toBe(
      "<ol><li>first item that wraps onto a second line</li><li>second</li></ol>",
    );
  });

  it("preserves a non-1 starting number via the start attribute", () => {
    expect(renderMarkdown("3. three\n4. four")).toBe(
      '<ol start="3"><li>three</li><li>four</li></ol>',
    );
  });
});

describe("renderMarkdown — nested lists (nesting must not be flattened)", () => {
  it("nests bullets by indentation instead of flattening them", () => {
    expect(renderMarkdown("- Parent\n  - Child A\n  - Child B\n- Parent 2")).toBe(
      "<ul><li>Parent<ul><li>Child A</li><li>Child B</li></ul></li><li>Parent 2</li></ul>",
    );
  });

  it("nests an ordered list under a bullet", () => {
    expect(renderMarkdown("- Parent\n  1. Step one\n  2. Step two")).toBe(
      "<ul><li>Parent<ol><li>Step one</li><li>Step two</li></ol></li></ul>",
    );
  });

  it("nests a bullet list under an ordered item", () => {
    expect(renderMarkdown("1. Top\n   - sub a\n   - sub b\n2. Top two")).toBe(
      "<ol><li>Top<ul><li>sub a</li><li>sub b</li></ul></li><li>Top two</li></ol>",
    );
  });

  it("handles three levels of nesting", () => {
    expect(renderMarkdown("- a\n  - b\n    - c\n- d")).toBe(
      "<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li><li>d</li></ul>",
    );
  });

  it("splits sibling lists of different type at the same level", () => {
    expect(renderMarkdown("- bullet\n1. number")).toBe(
      "<ul><li>bullet</li></ul><ol><li>number</li></ol>",
    );
  });
});
