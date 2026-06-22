import { afterEach, describe, expect, it, vi } from "vitest";
// Side-effect import: registers all ark-dialog custom elements
import "../../register/ark-dialog";
import {
  ArkDialogContent,
  ArkDialogOverlay,
  ArkDialogPortal,
  ArkDialogRoot,
  ArkDialogTrigger,
} from "../ark-dialog";

let wrapper: HTMLDivElement | null = null;

afterEach(() => {
  wrapper?.remove();
  wrapper = null;
  document.body.style.overflow = "";
  // Guard against portal containers that leaked when a test failed before unmount.
  document.querySelectorAll("[data-ark-dialog-portal]").forEach((el) => el.remove());
});

function mount(): HTMLDivElement {
  wrapper = document.createElement("div");
  document.body.appendChild(wrapper);
  return wrapper;
}

// ---------------------------------------------------------------------------
// ArkDialogPortal
// ---------------------------------------------------------------------------

describe("ArkDialogPortal", () => {
  it("creates a portal container on document.body when connected", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    const portal = document.createElement("ark-dialog-portal") as ArkDialogPortal;
    root.appendChild(portal);
    w.appendChild(root);

    const container = document.querySelector("[data-ark-dialog-portal]");
    expect(container).not.toBeNull();
    expect(container!.parentElement).toBe(document.body);
  });

  it("moves all light-DOM children into the body-mounted container", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    const portal = document.createElement("ark-dialog-portal") as ArkDialogPortal;
    const overlay = document.createElement("ark-dialog-overlay") as ArkDialogOverlay;
    const content = document.createElement("ark-dialog-content") as ArkDialogContent;
    portal.appendChild(overlay);
    portal.appendChild(content);
    root.appendChild(portal);
    w.appendChild(root);

    const container = document.querySelector("[data-ark-dialog-portal]")!;
    expect(container.querySelector("ark-dialog-overlay")).not.toBeNull();
    expect(container.querySelector("ark-dialog-content")).not.toBeNull();
  });

  it("leaves the ark-dialog-portal element itself empty after teleporting children", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    const portal = document.createElement("ark-dialog-portal") as ArkDialogPortal;
    const overlay = document.createElement("ark-dialog-overlay") as ArkDialogOverlay;
    portal.appendChild(overlay);
    root.appendChild(portal);
    w.appendChild(root);

    expect(portal.childElementCount).toBe(0);
  });

  it("removes the portal container and restores children to the portal element on disconnect", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    const portal = document.createElement("ark-dialog-portal") as ArkDialogPortal;
    const overlay = document.createElement("ark-dialog-overlay") as ArkDialogOverlay;
    portal.appendChild(overlay);
    root.appendChild(portal);
    w.appendChild(root);

    expect(document.querySelector("[data-ark-dialog-portal]")).not.toBeNull();

    w.remove();
    wrapper = null; // prevent double-remove in afterEach

    expect(document.querySelector("[data-ark-dialog-portal]")).toBeNull();
    expect(portal.querySelector("ark-dialog-overlay")).not.toBeNull();
  });

  it("registers with ArkDialogRoot so open state propagates through the portal container", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    const portal = document.createElement("ark-dialog-portal") as ArkDialogPortal;
    const overlay = document.createElement("ark-dialog-overlay") as ArkDialogOverlay;
    const content = document.createElement("ark-dialog-content") as ArkDialogContent;
    portal.appendChild(overlay);
    portal.appendChild(content);
    root.appendChild(portal);
    w.appendChild(root);

    root.open = true;

    const container = document.querySelector("[data-ark-dialog-portal]")!;
    expect(
      (container.querySelector("ark-dialog-overlay") as ArkDialogOverlay).open,
    ).toBe(true);
    expect(
      (container.querySelector("ark-dialog-content") as ArkDialogContent).open,
    ).toBe(true);
  });

  it("forwards ark-dialog:close from the portal container to ArkDialogRoot", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    const portal = document.createElement("ark-dialog-portal") as ArkDialogPortal;
    const overlay = document.createElement("ark-dialog-overlay") as ArkDialogOverlay;
    portal.appendChild(overlay);
    root.appendChild(portal);
    w.appendChild(root);

    root.open = true;
    expect(root.open).toBe(true);

    // Dispatch close from inside the portal container (simulates overlay click)
    const portalOverlay = document.querySelector(
      "[data-ark-dialog-portal] ark-dialog-overlay",
    )!;
    portalOverlay.dispatchEvent(
      new CustomEvent("ark-dialog:close", { bubbles: true, composed: true }),
    );

    expect(root.open).toBe(false);
  });

  it("does not leave a stale portal container after disconnect and reconnect", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    const portal = document.createElement("ark-dialog-portal") as ArkDialogPortal;
    const overlay = document.createElement("ark-dialog-overlay") as ArkDialogOverlay;
    portal.appendChild(overlay);
    root.appendChild(portal);
    w.appendChild(root);

    expect(document.querySelectorAll("[data-ark-dialog-portal]")).toHaveLength(1);

    // Disconnect and reconnect
    w.remove();
    wrapper = null;
    const w2 = mount();
    w2.appendChild(root);

    expect(document.querySelectorAll("[data-ark-dialog-portal]")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// ArkDialogRoot
// ---------------------------------------------------------------------------

describe("ArkDialogRoot", () => {
  it("reflects open as a boolean attribute", async () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    w.appendChild(root);

    root.open = true;
    await root.updateComplete;
    expect(root.hasAttribute("open")).toBe(true);

    root.open = false;
    await root.updateComplete;
    expect(root.hasAttribute("open")).toBe(false);
  });

  it("propagates open=true to direct ark-dialog-overlay and ark-dialog-content children", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    const overlay = document.createElement("ark-dialog-overlay") as ArkDialogOverlay;
    const content = document.createElement("ark-dialog-content") as ArkDialogContent;
    root.appendChild(overlay);
    root.appendChild(content);
    w.appendChild(root);

    root.open = true;

    expect(overlay.open).toBe(true);
    expect(content.open).toBe(true);
  });

  it("propagates open=false to direct children when the dialog is closed", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    const overlay = document.createElement("ark-dialog-overlay") as ArkDialogOverlay;
    root.appendChild(overlay);
    w.appendChild(root);

    root.open = true;
    expect(overlay.open).toBe(true);

    root.open = false;
    expect(overlay.open).toBe(false);
  });

  it("sets open=true when ark-dialog:open is dispatched on it", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    w.appendChild(root);

    root.dispatchEvent(
      new CustomEvent("ark-dialog:open", { bubbles: true, composed: true }),
    );

    expect(root.open).toBe(true);
  });

  it("sets open=false when ark-dialog:close is dispatched on it", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    w.appendChild(root);

    root.open = true;
    root.dispatchEvent(
      new CustomEvent("ark-dialog:close", { bubbles: true, composed: true }),
    );

    expect(root.open).toBe(false);
  });

  it("locks body scroll when open is set to true", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    w.appendChild(root);

    root.open = true;

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("unlocks body scroll when open is set to false", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    w.appendChild(root);

    root.open = true;
    expect(document.body.style.overflow).toBe("hidden");

    root.open = false;
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("unlocks body scroll on disconnectedCallback when open is true", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    w.appendChild(root);

    root.open = true;
    expect(document.body.style.overflow).toBe("hidden");

    w.remove();
    wrapper = null;

    expect(document.body.style.overflow).not.toBe("hidden");
  });
});

// ---------------------------------------------------------------------------
// ArkDialogTrigger
// ---------------------------------------------------------------------------

describe("ArkDialogTrigger", () => {
  it("dispatches ark-dialog:open (bubbles) when its shadow wrapper is clicked", async () => {
    const w = mount();
    const trigger = document.createElement("ark-dialog-trigger") as ArkDialogTrigger;
    w.appendChild(trigger);
    await trigger.updateComplete;

    const fired = vi.fn();
    w.addEventListener("ark-dialog:open", fired);

    trigger.shadowRoot!.querySelector(".trigger-wrapper")!.dispatchEvent(
      new MouseEvent("click", { bubbles: true, composed: true }),
    );

    expect(fired).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// ArkDialogOverlay
// ---------------------------------------------------------------------------

describe("ArkDialogOverlay", () => {
  it("dispatches ark-dialog:close (bubbles) when clicked", () => {
    const w = mount();
    const overlay = document.createElement("ark-dialog-overlay") as ArkDialogOverlay;
    w.appendChild(overlay);

    const fired = vi.fn();
    w.addEventListener("ark-dialog:close", fired);

    overlay.click();

    expect(fired).toHaveBeenCalledOnce();
  });

  it("syncs open from the nearest ark-dialog-root when connected", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    root.open = true; // set before the overlay connects
    const overlay = document.createElement("ark-dialog-overlay") as ArkDialogOverlay;
    root.appendChild(overlay);
    w.appendChild(root);

    expect(overlay.open).toBe(true);
  });

  it("starts closed when connected under a closed root", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    const overlay = document.createElement("ark-dialog-overlay") as ArkDialogOverlay;
    root.appendChild(overlay);
    w.appendChild(root);

    expect(overlay.open).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ArkDialogContent
// ---------------------------------------------------------------------------

describe("ArkDialogContent", () => {
  it("has role=dialog and aria-modal=true set from the constructor", () => {
    // These attributes must exist before the element is even connected.
    const content = document.createElement("ark-dialog-content");
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.getAttribute("aria-modal")).toBe("true");
  });

  it("dispatches ark-dialog:close when Escape is pressed and open is true", () => {
    const w = mount();
    const content = document.createElement("ark-dialog-content") as ArkDialogContent;
    w.appendChild(content);
    content.open = true;

    const fired = vi.fn();
    w.addEventListener("ark-dialog:close", fired);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(fired).toHaveBeenCalledOnce();
  });

  it("does not dispatch ark-dialog:close on Escape when open is false", () => {
    const w = mount();
    const content = document.createElement("ark-dialog-content") as ArkDialogContent;
    w.appendChild(content);
    // open is false by default

    const fired = vi.fn();
    w.addEventListener("ark-dialog:close", fired);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(fired).not.toHaveBeenCalled();
  });

  it("removes the window keydown listener after disconnect", () => {
    const w = mount();
    const content = document.createElement("ark-dialog-content") as ArkDialogContent;
    w.appendChild(content);
    content.open = true;

    w.remove();
    wrapper = null;

    // After disconnect, Escape must not trigger the handler anymore.
    const fired = vi.fn();
    content.addEventListener("ark-dialog:close", fired);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    content.removeEventListener("ark-dialog:close", fired);

    expect(fired).not.toHaveBeenCalled();
  });

  it("syncs open from the nearest ark-dialog-root when connected", () => {
    const w = mount();
    const root = document.createElement("ark-dialog-root") as ArkDialogRoot;
    root.open = true;
    const content = document.createElement("ark-dialog-content") as ArkDialogContent;
    root.appendChild(content);
    w.appendChild(root);

    expect(content.open).toBe(true);
  });
});
