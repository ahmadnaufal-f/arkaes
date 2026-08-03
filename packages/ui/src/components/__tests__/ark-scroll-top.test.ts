import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Side-effect import: registers ark-scroll-top
import "../../register/ark-scroll-top";
import { ArkScrollTop } from "../ark-scroll-top";

let wrapper: HTMLDivElement | null = null;

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", {
    value: y,
    configurable: true,
    writable: true,
  });
  window.dispatchEvent(new Event("scroll"));
}

async function mount(): Promise<ArkScrollTop> {
  wrapper = document.createElement("div");
  document.body.appendChild(wrapper);
  const el = document.createElement("ark-scroll-top") as ArkScrollTop;
  wrapper.appendChild(el);
  await el.updateComplete;
  return el;
}

const buttonOf = (el: ArkScrollTop) =>
  el.shadowRoot!.querySelector("button.button")!;

beforeEach(() => {
  Object.defineProperty(window, "scrollY", {
    value: 0,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  wrapper?.remove();
  wrapper = null;
  vi.restoreAllMocks();
});

describe("ArkScrollTop visibility", () => {
  it("starts collapsed at the top of the page", async () => {
    const el = await mount();

    expect(el.atTop).toBe(true);
  });

  it("expands as soon as the page has scrolled at all", async () => {
    const el = await mount();

    scrollTo(1);

    expect(el.atTop).toBe(false);
  });

  it("collapses again when the page returns to the top", async () => {
    const el = await mount();

    scrollTo(400);
    expect(el.atTop).toBe(false);

    scrollTo(0);
    expect(el.atTop).toBe(true);
  });

  it("counts an elastic overscroll past the top as being at the top", async () => {
    const el = await mount();

    scrollTo(400);
    scrollTo(-30);

    expect(el.atTop).toBe(true);
  });

  it("reflects at-top as an attribute so a parent can style around it", async () => {
    const el = await mount();
    expect(el.hasAttribute("at-top")).toBe(true);

    scrollTo(400);
    await el.updateComplete;

    expect(el.hasAttribute("at-top")).toBe(false);
  });

  it("takes the collapsed button out of the tab order", async () => {
    const el = await mount();
    expect(buttonOf(el).getAttribute("tabindex")).toBe("-1");

    scrollTo(400);
    await el.updateComplete;

    expect(buttonOf(el).getAttribute("tabindex")).toBe("0");
  });

  it("removes the scroll listener on disconnect", async () => {
    const el = await mount();

    wrapper?.remove();
    wrapper = null;

    scrollTo(400);

    expect(el.atTop).toBe(true);
  });
});

describe("ArkScrollTop activation", () => {
  it("scrolls the window back to the top on click", async () => {
    const el = await mount();
    const scrollSpy = vi.fn();
    window.scrollTo = scrollSpy as unknown as typeof window.scrollTo;

    scrollTo(400);
    await el.updateComplete;
    (buttonOf(el) as HTMLButtonElement).click();

    expect(scrollSpy).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0 }),
    );
  });

  it("fires ark-scroll-top:activate when clicked", async () => {
    const el = await mount();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    const onActivate = vi.fn();
    el.addEventListener("ark-scroll-top:activate", onActivate);

    scrollTo(400);
    await el.updateComplete;
    (buttonOf(el) as HTMLButtonElement).click();

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("uses the accessible label from the label property", async () => {
    const el = await mount();
    el.label = "Return to top";
    await el.updateComplete;

    expect(buttonOf(el).getAttribute("aria-label")).toBe("Return to top");
  });
});
