import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Side-effect import: registers ark-floating-action-container
import "../../register/ark-floating-action-container";
import { ArkFloatingActionContainer } from "../ark-floating-action-container";

let wrapper: HTMLDivElement | null = null;

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", {
    value: y,
    configurable: true,
    writable: true,
  });
  window.dispatchEvent(new Event("scroll"));
}

function mount(): ArkFloatingActionContainer {
  wrapper = document.createElement("div");
  document.body.appendChild(wrapper);
  const dock = document.createElement(
    "ark-floating-action-container",
  ) as ArkFloatingActionContainer;
  wrapper.appendChild(dock);
  return dock;
}

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
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Scrim
// ---------------------------------------------------------------------------

describe("ArkFloatingActionContainer scrim", () => {
  it("starts unscrolled at the top of the page", () => {
    const dock = mount();

    expect(dock.scrolled).toBe(false);
  });

  it("marks itself scrolled as soon as the page moves at all", () => {
    const dock = mount();

    scrollTo(1);

    expect(dock.scrolled).toBe(true);
  });

  it("clears scrolled when the page returns to the top", () => {
    const dock = mount();

    scrollTo(400);
    expect(dock.scrolled).toBe(true);

    scrollTo(0);
    expect(dock.scrolled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Hide while scrolling / settle back
// ---------------------------------------------------------------------------

describe("ArkFloatingActionContainer scroll rule", () => {
  it("hides the actions while the page is moving", () => {
    vi.useFakeTimers();
    const dock = mount();

    scrollTo(400);

    expect(dock.actionsHidden).toBe(true);
  });

  it("settles the actions back in once scrolling stops", () => {
    vi.useFakeTimers();
    const dock = mount();

    scrollTo(400);
    vi.advanceTimersByTime(199);
    expect(dock.actionsHidden).toBe(true);

    vi.advanceTimersByTime(1);
    expect(dock.actionsHidden).toBe(false);
  });

  it("keeps the actions hidden while scroll events keep arriving", () => {
    vi.useFakeTimers();
    const dock = mount();

    scrollTo(400);
    vi.advanceTimersByTime(150);
    scrollTo(800);
    vi.advanceTimersByTime(150);

    expect(dock.actionsHidden).toBe(true);
  });

  it("hides the actions when scrolling in either direction", () => {
    vi.useFakeTimers();
    const dock = mount();

    scrollTo(800);
    vi.advanceTimersByTime(200);
    expect(dock.actionsHidden).toBe(false);

    scrollTo(400);
    expect(dock.actionsHidden).toBe(true);
  });

  it("does not hide the actions when a scroll event carries no movement", () => {
    vi.useFakeTimers();
    const dock = mount();

    scrollTo(400);
    vi.advanceTimersByTime(200);
    expect(dock.actionsHidden).toBe(false);

    window.dispatchEvent(new Event("scroll"));

    expect(dock.actionsHidden).toBe(false);
  });

  it("does not hide the actions while one of them is open", () => {
    vi.useFakeTimers();
    const dock = mount();
    const action = document.createElement("div");
    action.setAttribute("open", "");
    dock.appendChild(action);

    scrollTo(400);

    expect(dock.actionsHidden).toBe(false);
  });

  it("resumes hiding once the open action closes", () => {
    vi.useFakeTimers();
    const dock = mount();
    const action = document.createElement("div");
    action.setAttribute("open", "");
    dock.appendChild(action);

    scrollTo(400);
    expect(dock.actionsHidden).toBe(false);

    action.removeAttribute("open");
    scrollTo(800);

    expect(dock.actionsHidden).toBe(true);
  });

  it("mirrors an action's open state onto itself for the stylesheet", async () => {
    const dock = mount();
    const action = document.createElement("div");
    dock.appendChild(action);
    await dock.updateComplete;
    expect(dock.hasAttribute("has-open-action")).toBe(false);

    action.setAttribute("open", "");
    // The observer runs on a microtask; the reflection lands on the next update.
    await Promise.resolve();
    await dock.updateComplete;

    expect(dock.hasAttribute("has-open-action")).toBe(true);

    action.removeAttribute("open");
    await Promise.resolve();
    await dock.updateComplete;

    expect(dock.hasAttribute("has-open-action")).toBe(false);
  });

  it("clears the open mirror when the open action is removed entirely", async () => {
    const dock = mount();
    const action = document.createElement("div");
    action.setAttribute("open", "");
    dock.appendChild(action);
    await Promise.resolve();
    await dock.updateComplete;
    expect(dock.hasOpenAction).toBe(true);

    action.remove();
    await Promise.resolve();
    await dock.updateComplete;

    expect(dock.hasOpenAction).toBe(false);
  });

  it("stops the settle timer on disconnect", () => {
    vi.useFakeTimers();
    const dock = mount();

    scrollTo(400);
    expect(dock.actionsHidden).toBe(true);

    wrapper?.remove();
    wrapper = null;

    vi.advanceTimersByTime(500);

    // The timer was cleared, so the hidden flag is left exactly as it was.
    expect(dock.actionsHidden).toBe(true);
  });

  it("removes the scroll listener on disconnect", () => {
    const dock = mount();

    wrapper?.remove();
    wrapper = null;

    scrollTo(400);

    expect(dock.scrolled).toBe(false);
  });
});
