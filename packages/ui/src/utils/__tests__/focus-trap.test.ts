import { afterEach, describe, expect, it } from "vitest";
import {
  collectFocusable,
  deepContains,
  focusFirstWithin,
  trapTabKey,
} from "../focus-trap";

let wrapper: HTMLDivElement | null = null;

afterEach(() => {
  wrapper?.remove();
  wrapper = null;
});

function mount(html: string): HTMLDivElement {
  wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  return wrapper;
}

/** A host whose shadow root holds `html`, for the shadow-piercing cases. */
function mountShadowHost(html: string): HTMLElement {
  const w = mount("<div id='host'></div>");
  const host = w.querySelector<HTMLElement>("#host")!;
  host.attachShadow({ mode: "open" }).innerHTML = html;
  return host;
}

function tab(shiftKey = false): KeyboardEvent {
  return new KeyboardEvent("keydown", { key: "Tab", shiftKey, cancelable: true });
}

describe("collectFocusable", () => {
  it("returns focusable descendants in DOM order", () => {
    const w = mount(`
      <button>a</button>
      <span>not focusable</span>
      <a href="#x">b</a>
      <input />
    `);

    expect(collectFocusable([w]).map((el) => el.tagName)).toEqual([
      "BUTTON",
      "A",
      "INPUT",
    ]);
  });

  it("descends into shadow roots", () => {
    const host = mountShadowHost("<button>inner</button>");

    expect(collectFocusable([wrapper!]).map((el) => el.textContent)).toEqual([
      "inner",
    ]);
    expect(host.shadowRoot).not.toBeNull();
  });

  it("skips disabled controls", () => {
    const w = mount("<button disabled>a</button><button>b</button>");

    expect(collectFocusable([w]).map((el) => el.textContent)).toEqual(["b"]);
  });

  it("skips negative tabindex", () => {
    const w = mount("<button tabindex=\"-1\">a</button><button>b</button>");

    expect(collectFocusable([w]).map((el) => el.textContent)).toEqual(["b"]);
  });

  it("skips anything inside an inert or aria-hidden subtree", () => {
    const w = mount(`
      <div inert><button>hidden by inert</button></div>
      <div aria-hidden="true"><button>hidden by aria</button></div>
      <button>visible</button>
    `);

    expect(collectFocusable([w]).map((el) => el.textContent)).toEqual([
      "visible",
    ]);
  });

  it("collects across several roots, in the order the roots are given", () => {
    const w = mount(`
      <div id="one"><button>1</button></div>
      <div id="two"><button>2</button></div>
    `);
    const one = w.querySelector("#one")!;
    const two = w.querySelector("#two")!;

    expect(collectFocusable([two, one]).map((el) => el.textContent)).toEqual([
      "2",
      "1",
    ]);
  });
});

describe("deepContains", () => {
  it("finds a descendant in the same tree", () => {
    const w = mount("<button>a</button>");

    expect(deepContains(w, w.querySelector("button"))).toBe(true);
  });

  it("crosses a shadow boundary, where Node.contains cannot", () => {
    const host = mountShadowHost("<button>inner</button>");
    const inner = host.shadowRoot!.querySelector("button")!;

    expect(host.contains(inner)).toBe(false);
    expect(deepContains(host, inner)).toBe(true);
    expect(deepContains(wrapper!, inner)).toBe(true);
  });

  it("returns false for an unrelated node and for null", () => {
    const w = mount("<button>a</button>");
    const outside = document.createElement("button");

    expect(deepContains(w, outside)).toBe(false);
    expect(deepContains(w, null)).toBe(false);
  });
});

describe("focusFirstWithin", () => {
  it("focuses the first focusable element", () => {
    const w = mount("<button>a</button><button>b</button>");

    expect(focusFirstWithin([w])?.textContent).toBe("a");
    expect(document.activeElement?.textContent).toBe("a");
  });

  it("falls back when there is nothing focusable", () => {
    const w = mount("<p>nothing here</p>");
    const fallback = document.createElement("div");
    fallback.tabIndex = -1;
    w.appendChild(fallback);

    expect(focusFirstWithin([w], fallback)).toBe(fallback);
    expect(document.activeElement).toBe(fallback);
  });
});

describe("trapTabKey", () => {
  it("wraps forward from the last element to the first", () => {
    const w = mount("<button>a</button><button>b</button>");
    const [first, last] = Array.from(w.querySelectorAll("button"));
    last!.focus();

    const event = tab();
    expect(trapTabKey(event, [w])).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);
  });

  it("wraps backward from the first element to the last", () => {
    const w = mount("<button>a</button><button>b</button>");
    const [first, last] = Array.from(w.querySelectorAll("button"));
    first!.focus();

    const event = tab(true);
    expect(trapTabKey(event, [w])).toBe(true);
    expect(document.activeElement).toBe(last);
  });

  it("leaves a mid-list Tab to the browser", () => {
    const w = mount("<button>a</button><button>b</button><button>c</button>");
    w.querySelectorAll("button")[1]!.focus();

    const event = tab();
    expect(trapTabKey(event, [w])).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it("pulls focus back in when it is outside the trap", () => {
    const w = mount(`
      <div id="trap"><button>in</button></div>
      <button id="out">out</button>
    `);
    const trap = w.querySelector("#trap")!;
    w.querySelector<HTMLButtonElement>("#out")!.focus();

    const event = tab();
    expect(trapTabKey(event, [trap])).toBe(true);
    expect(document.activeElement?.textContent).toBe("in");
  });

  it("swallows Tab when the trap holds nothing focusable", () => {
    const w = mount("<p>empty</p>");

    const event = tab();
    expect(trapTabKey(event, [w])).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });
});
