import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Side-effect import: registers ark-carousel
import "../../register/ark-carousel";
import { ArkCarousel } from "../ark-carousel";

let wrapper: HTMLDivElement | null = null;
let realMatchMedia: typeof window.matchMedia;

type MediaListener = (e: MediaQueryListEvent) => void;

type FakeQuery = {
  media: string;
  matches: boolean;
  addEventListener: (type: string, fn: MediaListener) => void;
  removeEventListener: (type: string, fn: MediaListener) => void;
  /** Flips the query and notifies listeners, as a viewport resize would. */
  setMatches: (value: boolean) => void;
};

/**
 * Deterministic matchMedia: every query created is recorded so a test can flip
 * it and fire the `change` event the component listens to, without depending on
 * the DOM shim's media-query evaluation.
 */
function stubMatchMedia(matches: boolean): FakeQuery[] {
  const queries: FakeQuery[] = [];
  window.matchMedia = ((media: string) => {
    const listeners = new Set<MediaListener>();
    const query: FakeQuery = {
      media,
      matches: media.includes("prefers-reduced-motion") ? false : matches,
      addEventListener: (_type, fn) => {
        listeners.add(fn);
      },
      removeEventListener: (_type, fn) => {
        listeners.delete(fn);
      },
      setMatches: (value) => {
        query.matches = value;
        listeners.forEach((fn) =>
          fn({ matches: value, media } as MediaQueryListEvent),
        );
      },
    };
    queries.push(query);
    return query as unknown as MediaQueryList;
  }) as typeof window.matchMedia;
  return queries;
}

/** The live viewport query is the most recent one built from `breakpoint`. */
const viewportQuery = (queries: FakeQuery[]) =>
  [...queries].reverse().find((q) => q.media.includes("max-width"))!;

beforeEach(() => {
  realMatchMedia = window.matchMedia;
});

afterEach(() => {
  window.matchMedia = realMatchMedia;
  wrapper?.remove();
  wrapper = null;
  vi.useRealTimers();
});

function mount(): HTMLDivElement {
  wrapper = document.createElement("div");
  document.body.appendChild(wrapper);
  return wrapper;
}

/** Mounts a carousel with `count` slotted slides. */
async function mountCarousel(
  count = 3,
  attrs: Record<string, string> = {},
): Promise<ArkCarousel> {
  const w = mount();
  const el = document.createElement("ark-carousel") as ArkCarousel;
  Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
  for (let i = 0; i < count; i += 1) {
    const slide = document.createElement("div");
    slide.textContent = `slide ${i + 1}`;
    el.appendChild(slide);
  }
  w.appendChild(el);
  await el.updateComplete;
  // Reading the slides back re-renders the nav with the slide count.
  await el.updateComplete;
  return el;
}

/**
 * happy-dom assigns slotted nodes but never fires `slotchange`, so changes to
 * the light DOM are announced by hand.
 */
async function announceSlotChange(el: ArkCarousel) {
  el.shadowRoot!.querySelector("slot")!.dispatchEvent(new Event("slotchange"));
  await el.updateComplete;
}

const nav = (el: ArkCarousel) => ({
  prev: el.shadowRoot!.querySelector<HTMLButtonElement>("[part~='control-prev']"),
  next: el.shadowRoot!.querySelector<HTMLButtonElement>("[part~='control-next']"),
  counter: el.shadowRoot!.querySelector<HTMLElement>("[part~='counter']"),
});

// ---------------------------------------------------------------------------
// Breakpoint gating
// ---------------------------------------------------------------------------

describe("ArkCarousel breakpoint", () => {
  it("is always active when no breakpoint is set", async () => {
    stubMatchMedia(false);
    const el = await mountCarousel();

    expect(el.active).toBe(true);
    expect(el.hasAttribute("active")).toBe(true);
  });

  it("stays inactive above the breakpoint", async () => {
    stubMatchMedia(false);
    const el = await mountCarousel(3, { breakpoint: "900" });

    expect(el.active).toBe(false);
    expect(el.hasAttribute("active")).toBe(false);
  });

  it("activates at or below the breakpoint", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(3, { breakpoint: "900" });

    expect(el.active).toBe(true);
  });

  it("follows the viewport query when it changes", async () => {
    const queries = stubMatchMedia(false);
    const el = await mountCarousel(3, { breakpoint: "900" });
    expect(el.active).toBe(false);

    viewportQuery(queries).setMatches(true);
    await el.updateComplete;
    expect(el.active).toBe(true);

    viewportQuery(queries).setMatches(false);
    await el.updateComplete;
    expect(el.active).toBe(false);
  });

  it("rebuilds the query when the breakpoint changes", async () => {
    const queries = stubMatchMedia(false);
    const el = await mountCarousel(3, { breakpoint: "900" });

    el.breakpoint = 600;
    await el.updateComplete;

    expect(viewportQuery(queries).media).toContain("600px");
  });
});

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

describe("ArkCarousel navigation", () => {
  it("renders arrows and a counter while active", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(3);
    const { next, counter } = nav(el);

    expect(next).not.toBeNull();
    expect(counter!.textContent!.replace(/\s+/g, " ").trim()).toBe("01 / 03");
  });

  it("renders no navigation while inactive", async () => {
    stubMatchMedia(false);
    const el = await mountCarousel(3, { breakpoint: "900" });

    expect(nav(el).next).toBeNull();
  });

  it("renders no navigation for a single slide", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(1);

    expect(nav(el).next).toBeNull();
  });

  it("renders no navigation with hide-controls", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(3, { "hide-controls": "" });

    expect(nav(el).next).toBeNull();
  });

  it("drops only the counter with hide-counter", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(3, { "hide-counter": "" });

    expect(nav(el).next).not.toBeNull();
    expect(nav(el).counter).toBeNull();
  });

  it("advances the index and the counter on next", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(3);

    nav(el).next!.click();
    await el.updateComplete;

    expect(el.index).toBe(1);
    expect(nav(el).counter!.textContent!.replace(/\s+/g, " ").trim()).toBe("02 / 03");
  });

  it("disables prev on the first slide and next on the last", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(2);

    expect(nav(el).prev!.disabled).toBe(true);
    expect(nav(el).next!.disabled).toBe(false);

    nav(el).next!.click();
    await el.updateComplete;

    expect(nav(el).prev!.disabled).toBe(false);
    expect(nav(el).next!.disabled).toBe(true);
  });

  it("clamps goTo to the available slides", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(3);

    el.goTo(99);
    expect(el.index).toBe(2);

    el.goTo(-5);
    expect(el.index).toBe(0);
  });

  it("emits ark-carousel:change with the new position", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(3);
    const details: unknown[] = [];
    el.addEventListener("ark-carousel:change", (e) => {
      details.push((e as CustomEvent).detail);
    });

    el.next();

    expect(details).toEqual([{ index: 1, total: 3 }]);
  });

  it("does not emit when the position is unchanged", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(3);
    const onChange = vi.fn();
    el.addEventListener("ark-carousel:change", onChange);

    el.prev(); // already at 0

    expect(onChange).not.toHaveBeenCalled();
  });

  it("resets to the first slide when the mode flips", async () => {
    const queries = stubMatchMedia(true);
    const el = await mountCarousel(3, { breakpoint: "900" });
    el.next();
    expect(el.index).toBe(1);

    viewportQuery(queries).setMatches(false);
    await el.updateComplete;

    expect(el.index).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Slides and semantics
// ---------------------------------------------------------------------------

describe("ArkCarousel slides", () => {
  it("tracks slotted children as slides", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(3);

    expect(el.items).toHaveLength(3);
  });

  it("clamps the index when slides are removed", async () => {
    stubMatchMedia(true);
    const el = await mountCarousel(3);
    el.goTo(2);
    expect(el.index).toBe(2);

    el.removeChild(el.lastElementChild!);
    await announceSlotChange(el);

    expect(el.items).toHaveLength(2);
    expect(el.index).toBe(1);
  });

  it("carries carousel semantics only while active", async () => {
    const queries = stubMatchMedia(true);
    const el = await mountCarousel(3, { breakpoint: "900", label: "Case studies" });

    expect(el.getAttribute("role")).toBe("group");
    expect(el.getAttribute("aria-roledescription")).toBe("carousel");
    expect(el.getAttribute("aria-label")).toBe("Case studies");

    viewportQuery(queries).setMatches(false);
    await el.updateComplete;

    expect(el.hasAttribute("role")).toBe(false);
    expect(el.hasAttribute("aria-roledescription")).toBe(false);
    expect(el.hasAttribute("aria-label")).toBe(false);
  });

  it("makes the scroll track keyboard reachable only while active", async () => {
    const queries = stubMatchMedia(true);
    const el = await mountCarousel(3, { breakpoint: "900" });
    const track = el.shadowRoot!.querySelector("[part~='track']")!;

    expect(track.getAttribute("tabindex")).toBe("0");

    viewportQuery(queries).setMatches(false);
    await el.updateComplete;

    expect(track.hasAttribute("tabindex")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------

/** Sends a keydown to the focusable scroll track. */
function pressOnTrack(el: ArkCarousel, key: string, init: KeyboardEventInit = {}) {
  const track = el.shadowRoot!.querySelector<HTMLElement>("[part~='track']")!;
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  track.dispatchEvent(event);
  return event;
}

describe("keyboard navigation", () => {
  it("advances one slide on ArrowRight", async () => {
    const el = await mountCarousel(3);

    const event = pressOnTrack(el, "ArrowRight");

    expect(el.index).toBe(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("goes back one slide on ArrowLeft", async () => {
    const el = await mountCarousel(3);
    el.goTo(2);

    pressOnTrack(el, "ArrowLeft");

    expect(el.index).toBe(1);
  });

  it("jumps to the first slide on Home and the last on End", async () => {
    const el = await mountCarousel(4);

    pressOnTrack(el, "End");
    expect(el.index).toBe(3);

    pressOnTrack(el, "Home");
    expect(el.index).toBe(0);
  });

  it("stops at the ends rather than wrapping", async () => {
    const el = await mountCarousel(2);

    pressOnTrack(el, "ArrowLeft");
    expect(el.index).toBe(0);

    pressOnTrack(el, "ArrowRight");
    pressOnTrack(el, "ArrowRight");
    expect(el.index).toBe(1);
  });

  it("emits ark-carousel:change for a keyboard move", async () => {
    const el = await mountCarousel(3);
    const seen = vi.fn();
    el.addEventListener("ark-carousel:change", seen);

    pressOnTrack(el, "ArrowRight");

    expect(seen).toHaveBeenCalledTimes(1);
  });

  it("ignores keys it does not handle", async () => {
    const el = await mountCarousel(3);

    const event = pressOnTrack(el, "ArrowDown");

    expect(el.index).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it("leaves modified arrow presses to the browser", async () => {
    const el = await mountCarousel(3);

    const event = pressOnTrack(el, "ArrowRight", { metaKey: true });

    expect(el.index).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it("does nothing while the carousel is inactive", async () => {
    const queries = stubMatchMedia(false);
    const el = await mountCarousel(3, { breakpoint: "600" });
    expect(el.active).toBe(false);

    // The track still renders in grid mode, it just is not a carousel.
    pressOnTrack(el, "ArrowRight");

    expect(el.index).toBe(0);
    expect(viewportQuery(queries).matches).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Slide semantics
// ---------------------------------------------------------------------------

describe("slide semantics", () => {
  const slides = (el: ArkCarousel) => Array.from(el.children) as HTMLElement[];

  it("names each slide with its position while active", async () => {
    const el = await mountCarousel(3);

    expect(slides(el).map((s) => s.getAttribute("aria-label"))).toEqual([
      "1 of 3",
      "2 of 3",
      "3 of 3",
    ]);
  });

  it("marks each slide as a slide", async () => {
    const el = await mountCarousel(2);

    for (const slide of slides(el)) {
      expect(slide.getAttribute("role")).toBe("group");
      expect(slide.getAttribute("aria-roledescription")).toBe("slide");
    }
  });

  it("renumbers when the slide count changes", async () => {
    const el = await mountCarousel(2);
    const extra = document.createElement("div");
    extra.textContent = "slide 3";
    el.appendChild(extra);
    await announceSlotChange(el);

    expect(slides(el).map((s) => s.getAttribute("aria-label"))).toEqual([
      "1 of 3",
      "2 of 3",
      "3 of 3",
    ]);
  });

  it("keeps an author's own aria-label", async () => {
    const w = mount();
    const el = document.createElement("ark-carousel") as ArkCarousel;
    const named = document.createElement("div");
    named.setAttribute("aria-label", "Featured project");
    const plain = document.createElement("div");
    el.append(named, plain);
    w.appendChild(el);
    await el.updateComplete;
    await el.updateComplete;

    expect(named.getAttribute("aria-label")).toBe("Featured project");
    expect(plain.getAttribute("aria-label")).toBe("2 of 2");
  });

  it("keeps an author's own aria-labelledby", async () => {
    const w = mount();
    const el = document.createElement("ark-carousel") as ArkCarousel;
    const named = document.createElement("div");
    named.setAttribute("aria-labelledby", "heading-1");
    el.append(named, document.createElement("div"));
    w.appendChild(el);
    await el.updateComplete;
    await el.updateComplete;

    expect(named.hasAttribute("aria-label")).toBe(false);
    expect(named.getAttribute("aria-labelledby")).toBe("heading-1");
  });

  it("strips the semantics it added when the carousel goes inactive", async () => {
    const queries = stubMatchMedia(true);
    const el = await mountCarousel(2, { breakpoint: "600" });
    expect(slides(el)[0]!.getAttribute("role")).toBe("group");

    viewportQuery(queries).setMatches(false);
    await el.updateComplete;

    for (const slide of slides(el)) {
      expect(slide.hasAttribute("role")).toBe(false);
      expect(slide.hasAttribute("aria-roledescription")).toBe(false);
      expect(slide.hasAttribute("aria-label")).toBe(false);
    }
  });

  it("strips the semantics it added when disconnected", async () => {
    const el = await mountCarousel(2);
    const kept = slides(el);
    expect(kept[0]!.hasAttribute("role")).toBe(true);

    el.remove();

    for (const slide of kept) {
      expect(slide.hasAttribute("role")).toBe(false);
      expect(slide.hasAttribute("aria-label")).toBe(false);
    }
  });
});
