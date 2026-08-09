/**
 * Hides everything outside a modal surface from assistive technology and from
 * the tab order.
 *
 * `aria-modal="true"` alone is a hint: screen readers that do not honour it keep
 * reading the page behind the dialog, and a Tab trap does nothing for a virtual
 * cursor that never moves focus in the first place. Marking the siblings `inert`
 * removes them from both, which is what actually makes the surface modal.
 */

type HiddenSibling = {
  element: HTMLElement;
  hadInert: boolean;
  /** The author's own value, restored verbatim so we never invent one. */
  ariaHidden: string | null;
};

const owners = new Set<object>();
let hidden: HiddenSibling[] = [];

/**
 * Marks every body-level sibling that does not contain one of `keep` as inert.
 *
 * Only the first owner establishes the hidden set. A dialog opened on top of
 * another mounts its portal container after that pass and so stays reachable,
 * which is the behaviour a nested dialog needs.
 */
export const hideBackgroundFrom = (owner: object, keep: readonly Node[]) => {
  if (owners.has(owner)) return;

  if (owners.size === 0) {
    for (const element of Array.from(document.body.children) as HTMLElement[]) {
      // An ancestor of the surface cannot be hidden without hiding the surface.
      if (keep.some((node) => element === node || element.contains(node))) {
        continue;
      }

      hidden.push({
        element,
        hadInert: element.hasAttribute("inert"),
        ariaHidden: element.getAttribute("aria-hidden"),
      });
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    }
  }

  owners.add(owner);
};

/** Releases `owner`'s claim, restoring the page once the last one lets go. */
export const restoreBackground = (owner: object) => {
  if (!owners.delete(owner) || owners.size > 0) return;

  for (const { element, hadInert, ariaHidden } of hidden) {
    if (!hadInert) element.removeAttribute("inert");
    if (ariaHidden === null) element.removeAttribute("aria-hidden");
    else element.setAttribute("aria-hidden", ariaHidden);
  }
  hidden = [];
};
