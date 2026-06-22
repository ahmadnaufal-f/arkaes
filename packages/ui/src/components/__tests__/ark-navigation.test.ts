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

beforeEach(() => {
  // Ensure scrollY starts at 0 for each test
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true, writable: true });
});

afterEach(() => {
  wrapper?.remove();
  wrapper = null;
  document.body.style.overflow = "";
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
