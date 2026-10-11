import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../../register/ark-hero";
import { ArkHero } from "../ark-hero";

let wrapper: HTMLDivElement | null = null;
let realMatchMedia: typeof window.matchMedia;

type MediaListener = (event: MediaQueryListEvent) => void;

type FakeQuery = {
  media: string;
  matches: boolean;
  listenerCount: () => number;
  setMatches: (matches: boolean) => void;
};

function stubMatchMedia(matches: boolean) {
  const queries: FakeQuery[] = [];
  window.matchMedia = ((media: string) => {
    const listeners = new Set<MediaListener>();
    const query: FakeQuery = {
      media,
      matches,
      listenerCount: () => listeners.size,
      setMatches: (value) => {
        query.matches = value;
        listeners.forEach((listener) =>
          listener({ media, matches: value } as MediaQueryListEvent),
        );
      },
    };
    queries.push(query);

    return {
      media,
      get matches() {
        return query.matches;
      },
      addEventListener: (_type: string, listener: MediaListener) => {
        listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: MediaListener) => {
        listeners.delete(listener);
      },
    } as unknown as MediaQueryList;
  }) as typeof window.matchMedia;

  return queries;
}

function pointerMove(pointerType: string, clientX = 100, clientY = 100) {
  const event = new Event("pointermove", { bubbles: true }) as PointerEvent;
  Object.defineProperties(event, {
    pointerType: { value: pointerType },
    clientX: { value: clientX },
    clientY: { value: clientY },
  });
  return event;
}

async function mount(): Promise<ArkHero> {
  wrapper = document.createElement("div");
  document.body.appendChild(wrapper);
  const el = document.createElement("ark-hero") as ArkHero;
  wrapper.appendChild(el);
  await el.updateComplete;
  return el;
}

function heroAndVisual(el: ArkHero) {
  const hero = el.shadowRoot!.querySelector<HTMLElement>(".hero")!;
  const visual = el.shadowRoot!.querySelector<HTMLElement>(".visual")!;
  vi.spyOn(hero, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
  } as DOMRect);
  return { hero, visual };
}

beforeEach(() => {
  realMatchMedia = window.matchMedia;
});

afterEach(() => {
  window.matchMedia = realMatchMedia;
  wrapper?.remove();
  wrapper = null;
  vi.restoreAllMocks();
});

describe("ArkHero parallax", () => {
  it("only tracks large fine-pointer hover devices without reduced motion", async () => {
    const queries = stubMatchMedia(false);
    const el = await mount();
    const { hero, visual } = heroAndVisual(el);
    const query = queries[0]!;

    expect(query.media).toContain("min-width: 901px");
    expect(query.media).toContain("any-pointer: fine");
    expect(query.media).toContain("prefers-reduced-motion: no-preference");
    hero.dispatchEvent(pointerMove("mouse"));
    expect(visual.style.transform).toBe("");

    query.setMatches(true);
    hero.dispatchEvent(pointerMove("mouse"));
    expect(visual.style.transform).toBe("translate(7px, 4.5px)");

    hero.dispatchEvent(pointerMove("touch", 25, 25));
    expect(visual.style.transform).toBe("");

    hero.dispatchEvent(pointerMove("mouse"));
    query.setMatches(false);
    expect(visual.style.transform).toBe("");
  });

  it("reacts to the disable-parallax property and attribute", async () => {
    stubMatchMedia(true);
    const el = await mount();
    const { hero, visual } = heroAndVisual(el);

    expect(el.disableParallax).toBe(false);
    expect(el.hasAttribute("disable-parallax")).toBe(false);

    hero.dispatchEvent(pointerMove("mouse"));
    expect(visual.style.transform).not.toBe("");

    el.disableParallax = true;
    await el.updateComplete;
    expect(el.hasAttribute("disable-parallax")).toBe(true);
    expect(visual.style.transform).toBe("");
    hero.dispatchEvent(pointerMove("mouse"));
    expect(visual.style.transform).toBe("");

    el.removeAttribute("disable-parallax");
    await el.updateComplete;
    expect(el.disableParallax).toBe(false);
    hero.dispatchEvent(pointerMove("mouse"));
    expect(visual.style.transform).not.toBe("");
  });

  it("cleans up the media listener on disconnect and restores it on reconnect", async () => {
    const queries = stubMatchMedia(true);
    const el = await mount();
    const { hero, visual } = heroAndVisual(el);
    el.disableParallax = true;
    await el.updateComplete;
    const initialQuery = queries[0]!;
    expect(initialQuery.listenerCount()).toBe(1);

    wrapper!.remove();
    wrapper = null;
    expect(initialQuery.listenerCount()).toBe(0);

    wrapper = document.createElement("div");
    document.body.appendChild(wrapper);
    wrapper.appendChild(el);

    expect(queries).toHaveLength(2);
    expect(queries[1]!.listenerCount()).toBe(1);
    expect(el.disableParallax).toBe(true);
    expect(el.hasAttribute("disable-parallax")).toBe(true);
    hero.dispatchEvent(pointerMove("mouse"));
    expect(visual.style.transform).toBe("");

    el.disableParallax = false;
    await el.updateComplete;
    hero.dispatchEvent(pointerMove("mouse"));
    expect(visual.style.transform).not.toBe("");
  });
});
