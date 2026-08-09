import { afterEach, describe, expect, it } from "vitest";
import { hideBackgroundFrom, restoreBackground } from "../background-inert";

const owners: object[] = [];
const added: HTMLElement[] = [];

/** Registers an owner so a failing test cannot leave the page inert. */
function owner(): object {
  const token = {};
  owners.push(token);
  return token;
}

function bodyChild(html: string): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = html;
  document.body.appendChild(el);
  added.push(el);
  return el;
}

afterEach(() => {
  owners.splice(0).forEach(restoreBackground);
  added.splice(0).forEach((el) => el.remove());
});

describe("hideBackgroundFrom", () => {
  it("marks body-level siblings inert and aria-hidden", () => {
    const background = bodyChild("<button>behind</button>");
    const surface = bodyChild("<button>dialog</button>");

    hideBackgroundFrom(owner(), [surface]);

    expect(background.hasAttribute("inert")).toBe(true);
    expect(background.getAttribute("aria-hidden")).toBe("true");
  });

  it("leaves the surface, and any ancestor of it, alone", () => {
    const host = bodyChild("<div id='inner'></div>");
    const surface = host.querySelector<HTMLElement>("#inner")!;

    hideBackgroundFrom(owner(), [surface]);

    expect(host.hasAttribute("inert")).toBe(false);
    expect(host.hasAttribute("aria-hidden")).toBe(false);
  });

  it("restores the page when the owner lets go", () => {
    const background = bodyChild("<button>behind</button>");
    const surface = bodyChild("");
    const token = owner();

    hideBackgroundFrom(token, [surface]);
    restoreBackground(token);

    expect(background.hasAttribute("inert")).toBe(false);
    expect(background.hasAttribute("aria-hidden")).toBe(false);
  });

  it("preserves an author's own inert and aria-hidden values", () => {
    const background = bodyChild("");
    background.setAttribute("inert", "");
    background.setAttribute("aria-hidden", "false");
    const surface = bodyChild("");
    const token = owner();

    hideBackgroundFrom(token, [surface]);
    expect(background.getAttribute("aria-hidden")).toBe("true");

    restoreBackground(token);
    expect(background.hasAttribute("inert")).toBe(true);
    expect(background.getAttribute("aria-hidden")).toBe("false");
  });

  it("keeps the page hidden until the last owner releases it", () => {
    const background = bodyChild("");
    const surface = bodyChild("");
    const first = owner();
    const second = owner();

    hideBackgroundFrom(first, [surface]);
    hideBackgroundFrom(second, [surface]);

    restoreBackground(first);
    expect(background.hasAttribute("inert")).toBe(true);

    restoreBackground(second);
    expect(background.hasAttribute("inert")).toBe(false);
  });

  it("ignores a repeated claim from the same owner", () => {
    const background = bodyChild("");
    const surface = bodyChild("");
    const token = owner();

    hideBackgroundFrom(token, [surface]);
    hideBackgroundFrom(token, [surface]);
    restoreBackground(token);

    expect(background.hasAttribute("inert")).toBe(false);
  });

  it("does not hide a surface mounted after the first owner's pass", () => {
    const surface = bodyChild("");
    hideBackgroundFrom(owner(), [surface]);

    const nested = bodyChild("<button>nested dialog</button>");

    expect(nested.hasAttribute("inert")).toBe(false);
  });
});
