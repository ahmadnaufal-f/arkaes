import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../render";

/**
 * The element injects this renderer's output with `unsafeHTML`, so the renderer
 * is the only thing between untrusted text and script execution. These tests
 * assert on the parsed DOM rather than on the HTML string: a payload that
 * survives as inert text is fine, one that becomes a live element or an
 * event-handler attribute is not.
 */
const dangers = (html: string): string[] => {
  const host = document.createElement("div");
  host.innerHTML = html;
  const problems: string[] = [];

  if (host.querySelector("script, iframe, object, embed, style, link, meta")) {
    problems.push("live dangerous element");
  }

  for (const element of host.querySelectorAll("*")) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      // Strip whitespace before matching: "java\tscript:" is a live url once the
      // parser has decoded it, and so is "&#106;avascript:".
      const value = String(attribute.value).replace(/\s/g, "").toLowerCase();

      if (name.startsWith("on")) {
        problems.push(`event handler ${name}="${attribute.value}"`);
      }
      if (
        ["href", "src", "srcdoc", "xlink:href"].includes(name) &&
        /^(?:javascript|vbscript|data):/.test(value)
      ) {
        problems.push(`${name}="${attribute.value}"`);
      }
    }
  }

  return problems;
};

const UNTRUSTED_PAYLOADS: [string, string][] = [
  ["a raw script tag", "<script>alert(1)</script>"],
  ["an inline img with onerror", "hi <img src=x onerror=alert(1)> there"],
  ["an svg with onload", "<svg/onload=alert(1)>"],
  ["an iframe with srcdoc", "<iframe srcdoc=\"<script>alert(1)</script>\"></iframe>"],
  ["a style tag", "<style>body{display:none}</style>"],
  ["a javascript: link", "[x](javascript:alert(1))"],
  ["a mixed-case javascript: link", "[x](JaVaScRiPt:alert(1))"],
  ["a javascript: link with leading space", "[x]( javascript:alert(1))"],
  ["a tab inside the scheme", "[x](java\tscript:alert(1))"],
  ["a newline inside the scheme", "[x](java\nscript:alert(1))"],
  ["an entity-encoded scheme", "[x](&#106;avascript:alert(1))"],
  ["an entity-encoded colon", "[x](javascript&colon;alert(1))"],
  ["a vbscript: link", "[x](vbscript:msgbox(1))"],
  ["a data:text/html link", "[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)"],
  ["a protocol-relative url", "[x](//evil.example/a)"],
  ["an angle-bracket javascript autolink", "<javascript:alert(1)>"],
  ["a title-attribute breakout", "[x](/a \"onmouseover=alert(1)\")"],
  ["a quoted title breakout", "[x](/a \"\\\" onmouseover=\\\"alert(1)\")"],
  ["a javascript: image src", "![a](javascript:alert(1))"],
  ["an image title breakout", "![a](/a.png \"\\\" onerror=\\\"alert(1)\")"],
  ["an image alt breakout", "![\" onerror=\"alert(1)](/a.png)"],
  ["a fence language breakout", "```js\" onmouseover=\"alert(1)\nx\n```"],
  ["html inside a code span", "`<img src=x onerror=alert(1)>`"],
  ["html inside emphasis", "**<img src=x onerror=alert(1)>**"],
  ["html inside a table cell", "| a |\n|---|\n| <img src=x onerror=alert(1)> |"],
  ["html inside a blockquote", "> <script>alert(1)</script>"],
  ["html inside a list item", "- <script>alert(1)</script>"],
  ["html inside a heading", "# <img src=x onerror=alert(1)>"],
  ["html inside link text", "[<img src=x onerror=alert(1)>](/a)"],
  ["a javascript: reference link", "[x][r]\n\n[r]: javascript:alert(1)"],
];

const EXTENSION_PAYLOADS: [string, string, Parameters<typeof renderMarkdown>[1]][] = [
  ["a javascript: proof-card href", "→ m | [x](javascript:alert(1)) | d", {
    features: ["proof-cards"],
  }],
  ["html in a proof-card label", "→ m | [<img src=x onerror=alert(1)>](/a) | d", {
    features: ["proof-cards"],
  }],
  ["html in a proof-card metric", "→ <img src=x onerror=alert(1)> | [x](/a) | d", {
    features: ["proof-cards"],
  }],
  ["html in a proof-card description", "→ m | [x](/a) | <script>alert(1)</script>", {
    features: ["proof-cards"],
  }],
  ["a javascript: figure src", "![a](javascript:alert(1))", { features: ["figures"] }],
  ["a figure alt breakout", "![\" onerror=\"alert(1)](/a.png)", { features: ["figures"] }],
  ["html in a glyph bullet", "• <script>alert(1)</script>", { features: ["glyph-bullets"] }],
  ["a javascript: link in a glyph bullet", "• [x](javascript:alert(1))", {
    features: ["glyph-bullets"],
  }],
];

describe("renderMarkdown — the detector itself", () => {
  // Without this, a `dangers()` that silently stopped matching would make every
  // test below pass vacuously. Trusted mode passes raw HTML through by design,
  // so it is the known-bad control.
  it("catches live markup, so a clean result below means something", () => {
    expect(dangers(renderMarkdown("<script>alert(1)</script>", { trust: "trusted" })))
      .not.toHaveLength(0);
    expect(dangers(renderMarkdown("<img src=x onerror=alert(1)>", { trust: "trusted" })))
      .not.toHaveLength(0);
    expect(dangers("<a href=\"javascript:alert(1)\">x</a>")).not.toHaveLength(0);
  });
});

describe("renderMarkdown — untrusted source (the default)", () => {
  it.each(UNTRUSTED_PAYLOADS)("neutralises %s", (_label, source) => {
    expect(dangers(renderMarkdown(source))).toEqual([]);
  });

  it("keeps a blocked url visible as text rather than dropping it silently", () => {
    expect(renderMarkdown("[x](javascript:alert(1))")).toContain("[x]");
  });
});

describe("renderMarkdown — untrusted source through the extensions", () => {
  it.each(EXTENSION_PAYLOADS)("neutralises %s", (_label, source, options) => {
    expect(dangers(renderMarkdown(source, options))).toEqual([]);
  });
});

describe("renderMarkdown — the trust boundary", () => {
  it("only inlines diagram svg for a trusted source", () => {
    const options = { features: ["figures"] as const, diagrams: { flow: "<svg id=\"leak\"/>" } };
    expect(renderMarkdown("![Flow](/a/flow.svg)", options)).not.toContain("leak");
    expect(renderMarkdown("![Flow](/a/flow.svg)", { ...options, trust: "trusted" }))
      .toContain("leak");
  });

  it("treats an unknown trust value as untrusted", () => {
    expect(dangers(renderMarkdown("<script>alert(1)</script>", { trust: "sure-why-not" })))
      .toEqual([]);
  });
});
