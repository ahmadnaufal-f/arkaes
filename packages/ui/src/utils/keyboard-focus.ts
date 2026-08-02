/**
 * The innermost focused element, following focus down through shadow roots.
 * `document.activeElement` only ever reports the outermost host on the path, so
 * anything asking "what exactly is focused?" has to walk it.
 */
export const deepActiveElement = (): Element | null => {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
};

/**
 * True when `el` contains focus the browser is actually drawing a ring for.
 *
 * Chrome that hides itself on scroll (ark-navigation's immersive pills,
 * ark-floating-action-container's dock) has to make an exception for the
 * keyboard: tabbing scrolls the page, and hiding the control the focus ring is
 * on would leave the user with nothing to look at. Testing plain `:focus-within`
 * is not enough — a pointer tap leaves focus sitting on the button it hit, so
 * that would latch on after the first tap and suppress the hiding from then on.
 */
export const hasKeyboardFocusWithin = (el: Element): boolean => {
  try {
    if (!el.matches(":focus-within")) return false;
    return deepActiveElement()?.matches(":focus-visible") ?? false;
  } catch {
    // A DOM shim may not know either selector. This only gates cosmetic
    // chrome, so the safe answer is "no focus to protect".
    return false;
  }
};
