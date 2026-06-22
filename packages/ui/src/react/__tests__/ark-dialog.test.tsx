import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import {
  ArkDialogContent,
  ArkDialogOverlay,
  ArkDialogPortal,
  ArkDialogRoot,
} from "../ark-dialog";

afterEach(() => {
  // Guard against portal containers that leaked when a test failed before unmount.
  document.querySelectorAll("[data-ark-dialog-portal]").forEach((el) => el.remove());
});

describe("ArkDialogPortal", () => {
  it("teleports its children to document.body on mount", () => {
    render(
      <ArkDialogRoot>
        <ArkDialogPortal>
          <ArkDialogOverlay />
          <ArkDialogContent />
        </ArkDialogPortal>
      </ArkDialogRoot>,
    );

    const portal = document.querySelector("[data-ark-dialog-portal]");
    expect(portal).not.toBeNull();
    expect(portal!.parentElement).toBe(document.body);
    expect(portal!.querySelector("ark-dialog-overlay")).not.toBeNull();
    expect(portal!.querySelector("ark-dialog-content")).not.toBeNull();
  });

  it("leaves the ark-dialog-portal element itself empty after teleport", () => {
    const { container } = render(
      <ArkDialogRoot>
        <ArkDialogPortal>
          <ArkDialogOverlay />
          <ArkDialogContent />
        </ArkDialogPortal>
      </ArkDialogRoot>,
    );

    // React's fiber still models the children as inside the portal element, but
    // the actual DOM nodes have been moved out by connectedCallback.
    const portalEl = container.querySelector("ark-dialog-portal")!;
    expect(portalEl.childElementCount).toBe(0);
  });

  it("removes the portal container from document.body when the React tree unmounts", () => {
    const { unmount } = render(
      <ArkDialogRoot>
        <ArkDialogPortal>
          <ArkDialogOverlay />
        </ArkDialogPortal>
      </ArkDialogRoot>,
    );

    expect(document.querySelector("[data-ark-dialog-portal]")).not.toBeNull();

    unmount();

    expect(document.querySelector("[data-ark-dialog-portal]")).toBeNull();
  });

  it("creates exactly one portal container in React StrictMode", () => {
    // React 18+ StrictMode simulates mount → unmount → remount in development.
    // disconnectedCallback must restore children and remove the container so
    // connectedCallback can re-teleport them cleanly on the second mount.
    render(
      <React.StrictMode>
        <ArkDialogRoot>
          <ArkDialogPortal>
            <ArkDialogOverlay />
            <ArkDialogContent />
          </ArkDialogPortal>
        </ArkDialogRoot>
      </React.StrictMode>,
    );

    expect(document.querySelectorAll("[data-ark-dialog-portal]")).toHaveLength(1);
  });

  it("cleans up the portal container in React StrictMode on unmount", () => {
    const { unmount } = render(
      <React.StrictMode>
        <ArkDialogRoot>
          <ArkDialogPortal>
            <ArkDialogOverlay />
          </ArkDialogPortal>
        </ArkDialogRoot>
      </React.StrictMode>,
    );

    unmount();

    expect(document.querySelector("[data-ark-dialog-portal]")).toBeNull();
  });

  // REGRESSION: ArkDialogPortal.connectedCallback() physically moves
  // React-managed DOM nodes from ark-dialog-portal into a container on
  // document.body. React's fiber tree still models those nodes as children of
  // ark-dialog-portal, so when React reconciles a conditional child away it
  // calls ark-dialog-portal.removeChild(child) on a node that has moved. The
  // portal's overridden insertBefore/appendChild/removeChild redirect those
  // light-DOM mutations to the container, so React stays in sync and no
  // DOMException is thrown.
  it("does not throw when React reconciles away a conditional child inside the portal", () => {
    function TestDialog({ showContent }: { showContent: boolean }) {
      return (
        <ArkDialogRoot>
          <ArkDialogPortal>
            <ArkDialogOverlay />
            {showContent && <ArkDialogContent />}
          </ArkDialogPortal>
        </ArkDialogRoot>
      );
    }

    const { rerender } = render(<TestDialog showContent={true} />);

    expect(() => rerender(<TestDialog showContent={false} />)).not.toThrow();

    expect(
      document.querySelector("[data-ark-dialog-portal] ark-dialog-content"),
    ).toBeNull();
  });

  it("re-adds a conditional child into the portal container when React reconciles it back", () => {
    function TestDialog({ showContent }: { showContent: boolean }) {
      return (
        <ArkDialogRoot>
          <ArkDialogPortal>
            <ArkDialogOverlay />
            {showContent && <ArkDialogContent />}
          </ArkDialogPortal>
        </ArkDialogRoot>
      );
    }

    const { rerender } = render(<TestDialog showContent={false} />);
    expect(
      document.querySelector("[data-ark-dialog-portal] ark-dialog-content"),
    ).toBeNull();

    expect(() => rerender(<TestDialog showContent={true} />)).not.toThrow();

    const container = document.querySelector("[data-ark-dialog-portal]")!;
    expect(container.querySelector("ark-dialog-overlay")).not.toBeNull();
    expect(container.querySelector("ark-dialog-content")).not.toBeNull();
  });
});

describe("ArkDialogRoot event mapping", () => {
  it("calls onOpen when ark-dialog:open is dispatched on the root element", () => {
    const onOpen = vi.fn();
    const { container } = render(<ArkDialogRoot onOpen={onOpen} />);

    container.querySelector("ark-dialog-root")!.dispatchEvent(
      new CustomEvent("ark-dialog:open", { bubbles: true, composed: true }),
    );

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("calls onClose when ark-dialog:close is dispatched on the root element", () => {
    const onClose = vi.fn();
    const { container } = render(<ArkDialogRoot onClose={onClose} />);

    container.querySelector("ark-dialog-root")!.dispatchEvent(
      new CustomEvent("ark-dialog:close", { bubbles: true, composed: true }),
    );

    expect(onClose).toHaveBeenCalledOnce();
  });
});
