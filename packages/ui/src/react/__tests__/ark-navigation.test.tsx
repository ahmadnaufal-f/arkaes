import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { ArkNavigationMobileToggle, ArkNavigationRoot } from "../ark-navigation";

afterEach(() => {
  // Reset body overflow in case a test failed before the component could unmount
  // and call unlockBodyScroll.
  document.body.style.overflow = "";
});

describe("ArkNavigationRoot body scroll lock", () => {
  it("locks body scroll when menuOpen is set to true", () => {
    const { rerender } = render(<ArkNavigationRoot />);

    rerender(<ArkNavigationRoot menuOpen={true} />);

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("unlocks body scroll when menuOpen is set back to false", () => {
    const { rerender } = render(<ArkNavigationRoot menuOpen={true} />);

    expect(document.body.style.overflow).toBe("hidden");

    rerender(<ArkNavigationRoot menuOpen={false} />);

    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("unlocks body scroll when the component unmounts while menuOpen is true", () => {
    // Verifies that disconnectedCallback calls unlockBodyScroll so a React
    // unmount (e.g. route change) does not leave the page permanently locked.
    const { unmount } = render(<ArkNavigationRoot menuOpen={true} />);

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).not.toBe("hidden");
  });
});

describe("ArkNavigationMobileToggle event mapping", () => {
  it("calls onMenuToggle when ark-nav:menu-toggle fires on the toggle element", () => {
    const onMenuToggle = vi.fn();
    const { container } = render(
      <ArkNavigationMobileToggle onMenuToggle={onMenuToggle} />,
    );

    container.querySelector("ark-navigation-mobile-toggle")!.dispatchEvent(
      new CustomEvent("ark-nav:menu-toggle", { bubbles: true, composed: true }),
    );

    expect(onMenuToggle).toHaveBeenCalledOnce();
  });
});
