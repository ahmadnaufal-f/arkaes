import { describe, expect, it } from "vitest";
import { splitReply } from "../sources";
import { SOURCES_DELIMITER, type SourceCitation } from "../../shared/types";

const withSources = (body: string, sources: SourceCitation[]): string =>
  body + SOURCES_DELIMITER + JSON.stringify(sources);

describe("splitReply", () => {
  it("returns the whole text as body when there is no payload", () => {
    expect(splitReply("Just an answer.")).toEqual({
      body: "Just an answer.",
      sources: [],
    });
  });

  it("splits the answer from a complete sources payload", () => {
    const content = withSources("Ahmad uses Lit [1].", [
      { n: 1, label: "Treely", url: "/projects/treely" },
    ]);
    expect(splitReply(content)).toEqual({
      body: "Ahmad uses Lit [1].",
      sources: [{ n: 1, label: "Treely", url: "/projects/treely" }],
    });
  });

  it("holds sources back while the payload JSON is incomplete", () => {
    const content = "Answer [1]." + SOURCES_DELIMITER + '[{"n":1,"label":"Tre';
    expect(splitReply(content)).toEqual({ body: "Answer [1].", sources: [] });
  });

  it("hides a partially-streamed delimiter from the body", () => {
    // The delimiter opens with "\n\x1e\x1e"; a half-arrived prefix must not show.
    const content = "Answer." + SOURCES_DELIMITER.slice(0, 3);
    expect(splitReply(content).body).toBe("Answer.");
  });

  it("filters out malformed source entries", () => {
    const content =
      "Answer [1]." +
      SOURCES_DELIMITER +
      JSON.stringify([{ n: 1, label: "Ok" }, { label: "no number" }, 42]);
    expect(splitReply(content).sources).toEqual([{ n: 1, label: "Ok" }]);
  });
});
