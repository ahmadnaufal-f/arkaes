import { describe, expect, it } from "vitest";
import {
  buildCitations,
  formatRetrievedKnowledge,
  selectCitedSources,
  type RetrievedChunk,
} from "../retrieval";

const chunk = (
  content: string,
  source?: string,
  metadata?: Record<string, unknown>,
): RetrievedChunk => ({ content, source, metadata });

describe("buildCitations", () => {
  it("numbers distinct sources in first-seen order", () => {
    const { citations, numbers } = buildCitations([
      chunk("a", "project:treely"),
      chunk("b", "case-study:milk"),
    ]);
    expect(numbers).toEqual([1, 2]);
    expect(citations.map((entry) => entry.number)).toEqual([1, 2]);
    expect(citations.map((entry) => entry.source)).toEqual([
      "project:treely",
      "case-study:milk",
    ]);
  });

  it("collapses repeated sources onto one citation number", () => {
    const { citations, numbers } = buildCitations([
      chunk("a1", "project:treely"),
      chunk("b1", "case-study:milk"),
      chunk("a2", "project:treely"),
    ]);
    expect(numbers).toEqual([1, 2, 1]);
    expect(citations).toHaveLength(2);
  });

  it("leaves source-less chunks uncited", () => {
    const { citations, numbers } = buildCitations([
      chunk("no source"),
      chunk("a", "project:treely"),
    ]);
    expect(numbers).toEqual([undefined, 1]);
    expect(citations).toHaveLength(1);
  });

  it("applies the resolver for label and url", () => {
    const { citations } = buildCitations(
      [chunk("a", "project:treely")],
      (input) => ({ label: `Label for ${input.source}`, url: "/x" }),
    );
    expect(citations[0]).toMatchObject({
      label: "Label for project:treely",
      url: "/x",
    });
  });
});

describe("formatRetrievedKnowledge", () => {
  it("tags each excerpt with its citation number and label", () => {
    const chunks = [chunk("Treely is a plant app", "project:treely")];
    const { citations, numbers } = buildCitations(chunks, () => ({
      label: "Treely",
    }));
    expect(formatRetrievedKnowledge(chunks, numbers, citations)).toBe(
      "[1] Treely\nTreely is a plant app",
    );
  });
});

describe("selectCitedSources", () => {
  const chunks = [
    chunk("a", "project:treely"),
    chunk("b", "case-study:milk"),
  ];
  const { citations } = buildCitations(chunks, (input) => ({
    label: input.source ?? "",
    url: `/${input.source}`,
  }));

  it("returns only the sources referenced by [n] markers, in order", () => {
    const cited = selectCitedSources("Uses Firebase [2] and Lit [1].", citations);
    expect(cited.map((entry) => entry.n)).toEqual([1, 2]);
  });

  it("handles combined markers like [1, 2]", () => {
    const cited = selectCitedSources("Both apply [1, 2].", citations);
    expect(cited.map((entry) => entry.n)).toEqual([1, 2]);
  });

  it("drops uncited sources and ignores out-of-range markers", () => {
    const cited = selectCitedSources("Only one [1] and a stray [9].", citations);
    expect(cited).toEqual([{ n: 1, label: "project:treely", url: "/project:treely" }]);
  });

  it("returns nothing when the reply cites no sources", () => {
    expect(selectCitedSources("No citations here.", citations)).toEqual([]);
  });

  it("omits url when a source has none", () => {
    const { citations: noUrl } = buildCitations(
      [chunk("a", "note:hobbies")],
      (input) => ({ label: input.source ?? "" }),
    );
    expect(selectCitedSources("A hobby [1].", noUrl)).toEqual([
      { n: 1, label: "note:hobbies" },
    ]);
  });
});
