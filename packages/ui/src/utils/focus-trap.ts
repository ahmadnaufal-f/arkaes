import { deepActiveElement } from "./keyboard-focus";

/**
 * Anything that can hold focus without help. `[tabindex]` is matched broadly and
 * the negative values are filtered out below, so a `tabindex="-1"` panel stays a
 * focus *target* without becoming a tab stop.
 */
const FOCUSABLE_SELECTOR = [
  "button",
  "[href]",
  "input",
  "select",
  "textarea",
  "[contenteditable]",
  "[tabindex]",
].join(",");

/** Whether `element` is present in the tree but unable to take focus right now. */
const isUnavailable = (element: HTMLElement): boolean => {
  if (
    element.hidden ||
    element.closest("[hidden], [inert], [aria-hidden='true']")
  ) {
    return true;
  }

  const disabled = "disabled" in element && Boolean(element.disabled);
  const tabIndex = element.getAttribute("tabindex");
  if (disabled || (tabIndex !== null && Number(tabIndex) < 0)) {
    return true;
  }

  const styles = getComputedStyle(element);
  return styles.display === "none" || styles.visibility === "hidden";
};

/**
 * Focusable descendants of `roots`, in DOM order, descending through shadow
 * boundaries. A plain `querySelectorAll` stops at the first shadow root, which
 * would miss every control this library renders.
 */
export const collectFocusable = (
  roots: readonly (Element | ShadowRoot)[],
): HTMLElement[] => {
  const results: HTMLElement[] = [];

  const visit = (root: Element | ShadowRoot) => {
    if (root instanceof Element) {
      // A root can be focusable itself, and can be a shadow host whose control
      // lives in its own shadow root. `querySelectorAll` below sees neither.
      if (root instanceof HTMLElement && root.matches(FOCUSABLE_SELECTOR) && !isUnavailable(root)) {
        results.push(root);
      }
      if (root.shadowRoot) visit(root.shadowRoot);
    }

    for (const el of Array.from(root.querySelectorAll("*")) as HTMLElement[]) {
      if (el.matches(FOCUSABLE_SELECTOR) && !isUnavailable(el)) {
        results.push(el);
      }
      if (el.shadowRoot) visit(el.shadowRoot);
    }
  };

  roots.forEach(visit);
  return results;
};

/**
 * True when `child` sits inside `container`, crossing shadow boundaries.
 * `Node.contains` only sees one tree, so it answers "no" for anything focused
 * inside a nested custom element.
 */
export const deepContains = (container: Node, child: Node | null): boolean => {
  let node: Node | null = child;
  while (node) {
    if (node === container) return true;
    const parent: Node | null = node.parentNode;
    node = parent instanceof ShadowRoot ? parent.host : parent;
  }
  return false;
};

/**
 * Moves focus to the first focusable element inside `roots`, falling back to
 * `fallback` when there is nothing tabbable to land on. Returns the element that
 * ended up focused.
 */
export const focusFirstWithin = (
  roots: readonly (Element | ShadowRoot)[],
  fallback?: HTMLElement | null,
): HTMLElement | null => {
  const target = collectFocusable(roots)[0] ?? fallback ?? null;
  target?.focus();
  return target;
};

/**
 * Keeps <kbd>Tab</kbd> inside `roots` by wrapping at either end. Call it from a
 * keydown handler that has already established the trap should be active.
 *
 * Returns true when the event was handled, so a caller can tell "wrapped" from
 * "let the browser move focus normally".
 */
export const trapTabKey = (
  event: KeyboardEvent,
  roots: readonly (Element | ShadowRoot)[],
): boolean => {
  const focusables = collectFocusable(roots);

  // Nothing to focus: swallow Tab rather than let it escape the trap.
  if (focusables.length === 0) {
    event.preventDefault();
    return true;
  }

  const first = focusables[0]!;
  const last = focusables[focusables.length - 1]!;
  const active = deepActiveElement();
  // Focus sitting outside the trap (a stray blur, or the page behind) is pulled
  // back to whichever end the user was heading towards.
  const inside = roots.some((root) => deepContains(root, active));

  if (event.shiftKey) {
    if (active === first || !inside) {
      last.focus();
      event.preventDefault();
      return true;
    }
    return false;
  }

  if (active === last || !inside) {
    first.focus();
    event.preventDefault();
    return true;
  }
  return false;
};
