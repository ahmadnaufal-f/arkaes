import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Side-effect import: registers all ark-navigation custom elements
import "../../register/ark-navigation";
import {
  ArkNavLink,
  ArkNavigationMobileMenu,
  ArkNavigationMobileToggle,
  ArkNavigationRoot,
} from "../ark-navigation";

let wrapper: HTMLDivElement | null = null;

/** Moves the page without dispatching, for tests that drive another event. */
function setScrollY(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true, writable: true });
}

function scrollTo(y: number) {
  setScrollY(y);
  window.dispatchEvent(new Event("scroll"));
}

beforeEach(() => {
  // Ensure scrollY starts at 0 for each test
  setScrollY(0);
});

afterEach(() => {
  wrapper?.remove();
  wrapper = null;
  document.body.style.overflow = "";
  document.documentElement.style.removeProperty("--ark-nav-chrome-away");
  vi.useRealTimers();
});

function mount(): HTMLDivElement {
  wrapper = document.createElement("div");
  document.body.appendChild(wrapper);
  return wrapper;
}

// ---------------------------------------------------------------------------
// ArkNavigationRoot — scroll detection
// ---------------------------------------------------------------------------

describe("ArkNavigationRoot scroll detection", () => {
  it("sets scrolled=true when window.scrollY > 40 on a scroll event", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);

    Object.defineProperty(window, "scrollY", { value: 50, configurable: true, writable: true });
    window.dispatchEvent(new Event("scroll"));

    expect(root.scrolled).toBe(true);
  });

  it("sets scrolled=false when window.scrollY drops back to <= 40", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);

    Object.defineProperty(window, "scrollY", { value: 50, configurable: true, writable: true });
    window.dispatchEvent(new Event("scroll"));
    expect(root.scrolled).toBe(true);

    Object.defineProperty(window, "scrollY", { value: 10, configurable: true, writable: true });
    window.dispatchEvent(new Event("scroll"));
    expect(root.scrolled).toBe(false);
  });

  it("starts with scrolled=false when scrollY is 0 on mount", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);

    expect(root.scrolled).toBe(false);
  });

  it("removes the scroll listener on disconnect", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);

    w.remove();
    wrapper = null;

    Object.defineProperty(window, "scrollY", { value: 50, configurable: true, writable: true });
    window.dispatchEvent(new Event("scroll"));

    // root is no longer connected so _handleScroll should not run
    expect(root.scrolled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ArkNavigationRoot — immersive mode
// ---------------------------------------------------------------------------

describe("ArkNavigationRoot immersive mode", () => {
  /**
   * happy-dom reports offsetHeight 0, so the root keeps its 80px fallback for
   * the resting bar height — the depth the page must scroll past.
   */
  const NAV_HEIGHT = 80;

  function mountRoot() {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);
    return { root };
  }

  it("enters immersive mode once scrolled past the bar height", () => {
    const { root } = mountRoot();

    scrollTo(NAV_HEIGHT + 1);

    expect(root.immersive).toBe(true);
  });

  it("stays out of immersive mode while the scroll depth is within the bar height", () => {
    const { root } = mountRoot();

    scrollTo(NAV_HEIGHT);

    expect(root.immersive).toBe(false);
  });

  it("leaves immersive mode when scrolling back up to the top", () => {
    const { root } = mountRoot();

    scrollTo(NAV_HEIGHT + 200);
    expect(root.immersive).toBe(true);

    scrollTo(0);
    expect(root.immersive).toBe(false);
  });

  it("hides the floating elements while scrolling and shows them once it settles", () => {
    vi.useFakeTimers();
    const { root } = mountRoot();

    scrollTo(NAV_HEIGHT + 200);
    expect(root.immersiveHidden).toBe(true);

    vi.advanceTimersByTime(199);
    expect(root.immersiveHidden).toBe(true);

    vi.advanceTimersByTime(1);
    expect(root.immersiveHidden).toBe(false);
  });

  it("keeps the floating elements hidden while scroll events keep arriving", () => {
    vi.useFakeTimers();
    const { root } = mountRoot();

    scrollTo(NAV_HEIGHT + 200);
    vi.advanceTimersByTime(150);
    scrollTo(NAV_HEIGHT + 400);
    vi.advanceTimersByTime(150);

    expect(root.immersiveHidden).toBe(true);

    vi.advanceTimersByTime(200);
    expect(root.immersiveHidden).toBe(false);
  });

  it("hides the floating elements when scrolling in either direction", () => {
    vi.useFakeTimers();
    const { root } = mountRoot();

    scrollTo(NAV_HEIGHT + 400);
    vi.advanceTimersByTime(200);
    expect(root.immersiveHidden).toBe(false);

    scrollTo(NAV_HEIGHT + 200);
    expect(root.immersiveHidden).toBe(true);
  });

  it("does not hide the floating elements when a scroll event carries no movement", () => {
    vi.useFakeTimers();
    const { root } = mountRoot();

    scrollTo(NAV_HEIGHT + 200);
    vi.advanceTimersByTime(200);
    expect(root.immersiveHidden).toBe(false);

    window.dispatchEvent(new Event("scroll"));
    expect(root.immersiveHidden).toBe(false);
  });

  it("shows the floating elements again when the mobile menu opens mid-scroll", () => {
    vi.useFakeTimers();
    const { root } = mountRoot();

    scrollTo(NAV_HEIGHT + 200);
    expect(root.immersiveHidden).toBe(true);

    root.menuOpen = true;

    expect(root.immersiveHidden).toBe(false);
  });

  it("does not hide the floating elements while the mobile menu is open", () => {
    vi.useFakeTimers();
    const { root } = mountRoot();

    scrollTo(NAV_HEIGHT + 200);
    root.menuOpen = true;
    scrollTo(NAV_HEIGHT + 400);

    expect(root.immersiveHidden).toBe(false);
  });

  it("still hides the floating elements after a menu open/close round trip", () => {
    vi.useFakeTimers();
    const { root } = mountRoot();
    const toggle =
      document.createElement("ark-navigation-mobile-toggle") as ArkNavigationMobileToggle;
    root.appendChild(toggle);

    scrollTo(NAV_HEIGHT + 200);
    vi.advanceTimersByTime(200);

    // Toggling through the mobile menu leaves focus on the button that was hit,
    // which used to latch the header into a permanently-visible state.
    toggle.dispatchEvent(
      new CustomEvent("ark-nav:menu-toggle", { bubbles: true, composed: true }),
    );
    expect(root.menuOpen).toBe(true);
    toggle.dispatchEvent(
      new CustomEvent("ark-nav:menu-toggle", { bubbles: true, composed: true }),
    );
    expect(root.menuOpen).toBe(false);

    scrollTo(NAV_HEIGHT + 400);

    expect(root.immersiveHidden).toBe(true);
  });

  it("re-syncs on a resize, since the bar height it compares against can change", () => {
    const { root } = mountRoot();

    // Moved without a scroll event, so only the resize can carry it through.
    setScrollY(NAV_HEIGHT + 200);
    expect(root.immersive).toBe(false);

    window.dispatchEvent(new Event("resize"));

    expect(root.immersive).toBe(true);
  });

  it("removes the resize listener on disconnect", () => {
    const { root } = mountRoot();

    wrapper?.remove();
    wrapper = null;

    setScrollY(NAV_HEIGHT + 200);
    window.dispatchEvent(new Event("resize"));

    expect(root.immersive).toBe(false);
  });

  it("stops the settle timer on disconnect", () => {
    vi.useFakeTimers();
    const { root } = mountRoot();

    scrollTo(NAV_HEIGHT + 200);
    expect(root.immersiveHidden).toBe(true);

    wrapper?.remove();
    wrapper = null;

    vi.advanceTimersByTime(500);

    // The timer was cleared, so the hidden flag is left exactly as it was.
    expect(root.immersiveHidden).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ArkNavigationRoot — chrome-away flag
// ---------------------------------------------------------------------------

describe("ArkNavigationRoot chrome-away flag", () => {
  const NAV_HEIGHT = 80;
  const flag = () =>
    document.documentElement.style.getPropertyValue("--ark-nav-chrome-away");

  async function mountRoot() {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);
    await root.updateComplete;
    return root;
  }

  it("publishes 0 while the pills are on screen", async () => {
    await mountRoot();

    expect(flag()).toBe("0");
  });

  it("publishes 1 while the pills are tucked away, and 0 once they settle", async () => {
    vi.useFakeTimers();
    const root = await mountRoot();

    scrollTo(NAV_HEIGHT + 200);
    await root.updateComplete;
    expect(flag()).toBe("1");

    vi.advanceTimersByTime(200);
    await root.updateComplete;
    expect(flag()).toBe("0");
  });

  it("publishes 0 while the mobile menu is open, which suspends the treatment", async () => {
    vi.useFakeTimers();
    const root = await mountRoot();

    scrollTo(NAV_HEIGHT + 200);
    await root.updateComplete;
    expect(flag()).toBe("1");

    root.menuOpen = true;
    await root.updateComplete;

    expect(flag()).toBe("0");
  });

  it("clears the flag on disconnect", async () => {
    vi.useFakeTimers();
    const root = await mountRoot();

    scrollTo(NAV_HEIGHT + 200);
    await root.updateComplete;
    expect(flag()).toBe("1");

    wrapper?.remove();
    wrapper = null;

    expect(flag()).toBe("");
  });

  it("leaves a replacement header's flag alone when the outgoing one tears down", async () => {
    // Two headers overlap during a ClientRouter navigation: the incoming one
    // publishes while the outgoing one is still mounted.
    const outgoing = await mountRoot();
    const incoming = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    wrapper?.appendChild(incoming);
    await incoming.updateComplete;

    outgoing.remove();

    expect(flag()).toBe("0");
  });
});

// ---------------------------------------------------------------------------
// ArkNavigationRoot — menu toggle
// ---------------------------------------------------------------------------

describe("ArkNavigationRoot menu toggle", () => {
  it("sets menuOpen=true on the first ark-nav:menu-toggle event", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);

    root.dispatchEvent(
      new CustomEvent("ark-nav:menu-toggle", { bubbles: true, composed: true }),
    );

    expect(root.menuOpen).toBe(true);
  });

  it("toggles menuOpen on each ark-nav:menu-toggle event", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);

    root.dispatchEvent(
      new CustomEvent("ark-nav:menu-toggle", { bubbles: true, composed: true }),
    );
    expect(root.menuOpen).toBe(true);

    root.dispatchEvent(
      new CustomEvent("ark-nav:menu-toggle", { bubbles: true, composed: true }),
    );
    expect(root.menuOpen).toBe(false);
  });

  it("removes the ark-nav:menu-toggle listener on disconnect", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);

    w.remove();
    wrapper = null;

    root.dispatchEvent(
      new CustomEvent("ark-nav:menu-toggle", { bubbles: true, composed: true }),
    );
    expect(root.menuOpen).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ArkNavigationRoot — body scroll lock
// ---------------------------------------------------------------------------

describe("ArkNavigationRoot body scroll lock", () => {
  it("locks body scroll when menuOpen is set to true", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);

    root.menuOpen = true;

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("unlocks body scroll when menuOpen is set back to false", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);

    root.menuOpen = true;
    expect(document.body.style.overflow).toBe("hidden");

    root.menuOpen = false;
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("unlocks body scroll on disconnect when menuOpen is true", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    w.appendChild(root);

    root.menuOpen = true;
    expect(document.body.style.overflow).toBe("hidden");

    w.remove();
    wrapper = null;

    expect(document.body.style.overflow).not.toBe("hidden");
  });
});

// ---------------------------------------------------------------------------
// ArkNavigationRoot — child sync
// ---------------------------------------------------------------------------

describe("ArkNavigationRoot child sync", () => {
  it("propagates menuOpen to ark-navigation-mobile-toggle children", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    const toggle =
      document.createElement("ark-navigation-mobile-toggle") as ArkNavigationMobileToggle;
    root.appendChild(toggle);
    w.appendChild(root);

    root.menuOpen = true;

    expect(toggle.menuOpen).toBe(true);
  });

  it("propagates menuOpen=false back to toggle children", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    const toggle =
      document.createElement("ark-navigation-mobile-toggle") as ArkNavigationMobileToggle;
    root.appendChild(toggle);
    w.appendChild(root);

    root.menuOpen = true;
    expect(toggle.menuOpen).toBe(true);

    root.menuOpen = false;
    expect(toggle.menuOpen).toBe(false);
  });

  it("propagates menuOpen to ark-navigation-mobile-menu children", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    const menu =
      document.createElement("ark-navigation-mobile-menu") as ArkNavigationMobileMenu;
    root.appendChild(menu);
    w.appendChild(root);

    root.menuOpen = true;

    expect(menu.menuOpen).toBe(true);
  });

  it("sets menuControls on toggle to the mobile menu's id", () => {
    const w = mount();
    const root = document.createElement("ark-navigation-root") as ArkNavigationRoot;
    const toggle =
      document.createElement("ark-navigation-mobile-toggle") as ArkNavigationMobileToggle;
    const menu =
      document.createElement("ark-navigation-mobile-menu") as ArkNavigationMobileMenu;
    root.appendChild(toggle);
    root.appendChild(menu);
    w.appendChild(root);

    // menuOpen change triggers _syncChildren which sets menuControls
    root.menuOpen = true;

    expect(toggle.menuControls).toBe(menu.id);
    expect(menu.id).not.toBe("");
  });
});

// ---------------------------------------------------------------------------
// ArkNavLink — auto-active
// ---------------------------------------------------------------------------

describe("ArkNavLink auto-active", () => {
  it("sets active=false when autoActive is false regardless of href", () => {
    const w = mount();
    const link = document.createElement("ark-nav-link") as ArkNavLink;
    link.href = window.location.pathname; // same path as current
    link.autoActive = false;
    w.appendChild(link);

    expect(link.active).toBe(false);
  });

  it("leaves active=false when href is empty and autoActive is true", () => {
    const w = mount();
    const link = document.createElement("ark-nav-link") as ArkNavLink;
    link.href = "";
    link.autoActive = true;
    w.appendChild(link);

    expect(link.active).toBe(false);
  });

  it("sets active=true when autoActive is true and href matches current pathname", () => {
    const w = mount();
    const link = document.createElement("ark-nav-link") as ArkNavLink;
    // Use window.location.pathname so the test adapts to whichever URL the test
    // runner sets (Vitest's happy-dom defaults to http://localhost:3000/).
    link.href = window.location.pathname;
    link.autoActive = true;
    w.appendChild(link);

    expect(link.active).toBe(true);
  });

  it("leaves active=false when href points to a different path", () => {
    const w = mount();
    const link = document.createElement("ark-nav-link") as ArkNavLink;
    link.href = "/this-path-definitely-does-not-exist-xyzzy";
    link.autoActive = true;
    w.appendChild(link);

    expect(link.active).toBe(false);
  });

  it("rechecks active when href changes", async () => {
    const w = mount();
    const link = document.createElement("ark-nav-link") as ArkNavLink;
    link.href = "/this-path-definitely-does-not-exist-xyzzy";
    link.autoActive = true;
    w.appendChild(link);
    expect(link.active).toBe(false);

    link.href = window.location.pathname;
    await link.updateComplete; // triggers updated() → _checkActive

    expect(link.active).toBe(true);
  });

  it("removes hashchange and popstate listeners on disconnect", () => {
    const w = mount();
    const link = document.createElement("ark-nav-link") as ArkNavLink;
    link.href = window.location.pathname;
    link.autoActive = true;
    w.appendChild(link);

    const removeEventListener = vi.spyOn(window, "removeEventListener");
    w.remove();
    wrapper = null;

    expect(removeEventListener).toHaveBeenCalledWith("hashchange", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("popstate", expect.any(Function));
    removeEventListener.mockRestore();
  });
});
