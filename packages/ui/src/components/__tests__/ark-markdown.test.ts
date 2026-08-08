import { afterEach, describe, expect, it } from "vitest";
// Side-effect import: registers ark-markdown
import "../../register/ark-markdown";
import type { ArkMarkdown } from "../ark-markdown";

let wrapper: HTMLDivElement | undefined;

const mount = async (markup: string): Promise<ArkMarkdown> => {
  wrapper = document.createElement("div");
  wrapper.innerHTML = markup;
  document.body.append(wrapper);
  const element = wrapper.querySelector("ark-markdown") as ArkMarkdown;
  await element.updateComplete;
  return element;
};

afterEach(() => {
  wrapper?.remove();
  wrapper = undefined;
});

describe("ArkMarkdown rendering root", () => {
  it("renders into the light DOM, never a shadow root", async () => {
    const element = await mount("<ark-markdown source=\"# Hi\"></ark-markdown>");
    expect(element.shadowRoot).toBeNull();
  });

  it("renders its source markdown as prose", async () => {
    const element = await mount("<ark-markdown source=\"## Two\"></ark-markdown>");
    const heading = element.querySelector("h2");
    expect(heading?.textContent).toBe("Two");
    expect(heading?.id).toBe("two");
  });

  it("re-renders when source changes", async () => {
    const element = await mount("<ark-markdown source=\"first\"></ark-markdown>");
    element.source = "**second**";
    await element.updateComplete;
    expect(element.textContent).toContain("second");
    expect(element.querySelector("strong")).not.toBeNull();
  });
});

describe("ArkMarkdown server-rendered content", () => {
  it("leaves pre-rendered children alone when no source is set", async () => {
    const element = await mount(
      "<ark-markdown heading-style=\"section\"><p id=\"ssr\">from the server</p></ark-markdown>",
    );
    expect(element.querySelector("#ssr")?.textContent).toBe("from the server");
  });

  it("does not re-render over server content on a later update", async () => {
    const element = await mount(
      "<ark-markdown><p id=\"ssr\">from the server</p></ark-markdown>",
    );
    element.trust = "trusted";
    await element.updateComplete;
    expect(element.querySelector("#ssr")).not.toBeNull();
  });
});

describe("ArkMarkdown props", () => {
  it("reflects heading-style and applies it to the output", async () => {
    const element = await mount(
      "<ark-markdown heading-style=\"section\" source=\"### Three\"></ark-markdown>",
    );
    expect(element.getAttribute("heading-style")).toBe("section");
    // section shifts one level down: ### becomes an h4.
    expect(element.querySelector("h4")).not.toBeNull();
  });

  it("falls back to article for an unknown heading-style", async () => {
    const element = await mount(
      "<ark-markdown heading-style=\"nope\" source=\"# One\"></ark-markdown>",
    );
    expect(element.headingStyle).toBe("article");
    expect(element.getAttribute("heading-style")).toBe("article");
  });

  it("defaults to untrusted, escaping raw HTML", async () => {
    const element = await mount(
      "<ark-markdown source=\"&lt;script&gt;alert(1)&lt;/script&gt;\"></ark-markdown>",
    );
    expect(element.querySelector("script")).toBeNull();
    expect(element.textContent).toContain("<script>");
  });

  it("accepts features as a comma-separated attribute", async () => {
    const element = await mount(
      "<ark-markdown features=\"citations, glyph-bullets\" source=\"a [1]\"></ark-markdown>",
    );
    expect(element.features).toEqual(["citations", "glyph-bullets"]);
    expect(element.querySelector(".ark-md-cite")?.textContent).toBe("1");
  });

  it("drops unknown feature names", async () => {
    const element = await mount(
      "<ark-markdown features=\"citations,bogus\" source=\"x\"></ark-markdown>",
    );
    expect(element.features).toEqual(["citations"]);
  });
});
