/**
 * Coordinated FOUCE (Flash Of Undefined Custom Elements) reveal.
 *
 * The zero-JS half of FOUCE prevention lives in `@arkaes/tokens/cloak.css`,
 * which hides each undefined Arkaes element (`:not(:defined)`) until it
 * upgrades. This helper implements the coordinated half: hide a whole region
 * with the `ark-cloak` class, then reveal it in a single paint once *all* of
 * its custom elements are registered — instead of letting them pop in one by
 * one.
 *
 * @see https://webawesome.com/docs/utilities/fouce/
 */
export interface UncloakOptions {
  /** Class the region is cloaked with (see `@arkaes/tokens/cloak.css`). */
  cloakClass?: string;
  /**
   * Maximum time, in milliseconds, to stay cloaked before revealing anyway.
   * Guarantees the region is never left hidden if an element never registers.
   */
  timeout?: number;
}

/**
 * Reveal a coordinated cloak region once its custom elements have upgraded.
 *
 * Scans `root` for undefined custom elements, waits for every distinct one to
 * be defined (`customElements.whenDefined`), and removes the cloak class. A
 * timeout races the wait so a missing registration can never leave the region
 * hidden. Safe to call before the elements' registration scripts have run —
 * that is the point — and a no-op in non-DOM environments.
 *
 * @example
 * ```html
 * <body class="ark-cloak">…</body>
 * <script type="module">
 *   import "@arkaes/ui/register";
 *   import { uncloak } from "@arkaes/ui";
 *   uncloak(); // reveal <body> once every ark-* element is defined
 * </script>
 * ```
 */
export const uncloak = async (
  root: Element | undefined = typeof document !== "undefined"
    ? document.documentElement
    : undefined,
  { cloakClass = "ark-cloak", timeout = 2000 }: UncloakOptions = {},
): Promise<void> => {
  if (!root || typeof customElements === "undefined") {
    root?.classList.remove(cloakClass);
    return;
  }

  const reveal = () => root.classList.remove(cloakClass);

  // Distinct undefined custom-element tags in the region. A tag name is a
  // custom element only when it contains a hyphen.
  const tags = new Set<string>();
  root.querySelectorAll(":not(:defined)").forEach((el) => {
    if (el.localName.includes("-")) tags.add(el.localName);
  });

  if (tags.size === 0) {
    reveal();
    return;
  }

  const allDefined = Promise.allSettled(
    [...tags].map((tag) => customElements.whenDefined(tag)),
  );
  const timedOut = new Promise<void>((resolve) => {
    setTimeout(resolve, timeout);
  });

  await Promise.race([allDefined, timedOut]);
  reveal();
};
