import { css, html, LitElement } from "lit";
import { defineElement } from "../define-element";

const POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const CURSOR_ATTR = "data-custom-cursor";
const LABEL_ATTR = "data-cursor-label";

/**
 * Elements that tint the arrow on hover. The set is matched against the
 * full composed path of each pointer event, so it also catches interactive
 * elements rendered inside component shadow roots (e.g. the <button> in
 * <ark-button> or the <a> links in <ark-navigation>).
 */
const DEFAULT_INTERACTIVE_SELECTOR =
  'a[href], button, [role="button"], ark-button, ark-card, ark-case-study-card';

/**
 * Default chip wording per selector. Elements can override with a
 * `data-cursor-label` attribute; apps can override via the `labels` option of
 * {@link enableArkCursor}. Buttons get no default — they describe themselves.
 */
const DEFAULT_LABELS: Record<string, string> = {
  "ark-case-study-card": "View",
  "a[href]": "Open",
};

/**
 * Document-level rule that hides the native cursor everywhere while the custom
 * cursor is active. Shadow-DOM components hide their own pointer via the
 * --ark-cursor-interactive token (see @arkaes/tokens); this covers light DOM.
 * Installed once, lazily, the first time a cursor activates.
 */
const GLOBAL_CSS = `:root[${CURSOR_ATTR}], :root[${CURSOR_ATTR}] * { cursor: none; }`;
let globalStylesInstalled = false;

const installGlobalCursorStyles = () => {
  if (globalStylesInstalled || typeof document === "undefined") return;
  globalStylesInstalled = true;
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(GLOBAL_CSS);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  } catch {
    // Older engines without constructable stylesheets.
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
  }
};

/**
 * ArkCursor renders a custom cursor — a high-contrast arrow pointer that
 * tracks the pointer 1:1, plus a contextual label chip ("View", "Open", …)
 * that unfolds beside it over labeled interactive elements — and owns all of
 * its behavior: capability gating, native cursor hiding, and hover-state
 * detection across shadow boundaries.
 *
 * It activates only on devices with a hover-capable, fine pointer. While
 * active it sets `data-custom-cursor` on <html>, which both reveals the
 * cursor and flips `--ark-cursor-interactive` to `none` inside every
 * @arkaes/ui component (see @arkaes/tokens).
 *
 * Chip text resolves per hovered element: a `data-cursor-label` attribute
 * wins (empty string suppresses the chip), otherwise the first match in the
 * `labels` selector map. Apps should mount it via {@link enableArkCursor}
 * rather than by hand. Visuals are themeable through the `--ark-cursor-*`
 * custom properties.
 */
export class ArkCursor extends LitElement {
  static override properties = {
    interactive: { type: String },
    labels: { attribute: false },
    active: { type: Boolean, reflect: true },
    hovering: { type: Boolean, reflect: true },
    label: { attribute: false },
  };

  /** Selector for elements that tint the arrow on hover. */
  interactive = DEFAULT_INTERACTIVE_SELECTOR;
  /** Map of CSS selector → chip text; entry order sets match priority. */
  labels: Record<string, string> = DEFAULT_LABELS;
  /** Whether the custom cursor is currently running (reflected for styling). */
  active = false;
  /** Whether the pointer is over an interactive element (reflected). */
  hovering = false;
  /** Chip text for the hovered element; "" hides the chip. */
  label = "";

  private _pointerMedia: MediaQueryList | null = null;
  private _mover: HTMLElement | null = null;

  private _onPointerMove = (event: PointerEvent) => {
    if (this._mover) {
      this._mover.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    }
  };

  private _onPointerOver = (event: PointerEvent) => {
    const path = event
      .composedPath()
      .filter((node): node is Element => node instanceof Element);
    // A data-cursor-label attribute wins, innermost element first. Otherwise
    // the label map applies in entry order against the whole path, so earlier
    // entries take priority — e.g. ark-case-study-card ("View") beats the
    // a[href] ("Open") inside its shadow DOM.
    let label = path
      .find((node) => node.hasAttribute(LABEL_ATTR))
      ?.getAttribute(LABEL_ATTR);
    if (label == null) {
      for (const [selector, text] of Object.entries(this.labels)) {
        if (path.some((node) => node.matches(selector))) {
          label = text;
          break;
        }
      }
    }
    // Lit no-ops when the values are unchanged, so frequent events are cheap.
    this.hovering = path.some((node) => node.matches(this.interactive));
    this.label = label ?? "";
  };

  private _evaluate = () => {
    if (this._pointerMedia?.matches) {
      this._activate();
    } else {
      this._deactivate();
    }
  };

  private _activate() {
    if (this.active) return;
    this.active = true;
    installGlobalCursorStyles();
    document.documentElement.setAttribute(CURSOR_ATTR, "");
    document.addEventListener("pointermove", this._onPointerMove, {
      passive: true,
    });
    document.addEventListener("pointerover", this._onPointerOver, {
      passive: true,
    });
  }

  private _deactivate() {
    if (!this.active) return;
    this.active = false;
    this.hovering = false;
    this.label = "";
    document.documentElement.removeAttribute(CURSOR_ATTR);
    document.removeEventListener("pointermove", this._onPointerMove);
    document.removeEventListener("pointerover", this._onPointerOver);
  }

  override connectedCallback() {
    super.connectedCallback();
    this._pointerMedia = window.matchMedia(POINTER_QUERY);
    this._pointerMedia.addEventListener("change", this._evaluate);
    this._evaluate();
  }

  protected override firstUpdated() {
    this._mover = this.renderRoot.querySelector<HTMLElement>(".mover");
  }

  override disconnectedCallback() {
    this._deactivate();
    this._pointerMedia?.removeEventListener("change", this._evaluate);
    this._pointerMedia = null;
    this._mover = null;
    super.disconnectedCallback();
  }

  static override styles = css`
    :host {
      display: none;
      pointer-events: none;
    }

    :host([active]) {
      display: block;
    }

    .mover {
      left: 0;
      pointer-events: none;
      position: fixed;
      top: 0;
      z-index: var(--ark-cursor-z, 9999);
    }

    /* The path's tip sits at (3,2) of the 24-unit viewBox; the individual
       \`translate\` property shifts it onto the pointer without fighting the
       hover \`transform: scale()\`. \`paint-order\` keeps the outline behind
       the fill so it reads as a halo on dark surfaces. */
    .arrow {
      display: block;
      fill: var(--ark-cursor-color, var(--ark-color-ink));
      height: var(--ark-cursor-size, 20px);
      paint-order: stroke;
      stroke: var(--ark-cursor-outline-color, var(--ark-color-neutral-0));
      stroke-linejoin: round;
      stroke-width: 2;
      transform-origin: 12.5% 8.4%;
      transition:
        fill var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-spring);
      translate: -12.5% -8.4%;
      width: var(--ark-cursor-size, 20px);
    }

    :host([hovering]) .arrow {
      fill: var(--ark-cursor-hover-color, var(--ark-color-accent));
      transform: scale(1.12);
    }

    .chip {
      background: var(--ark-cursor-label-bg, var(--ark-color-surface));
      border: 1px solid var(--ark-cursor-label-border, var(--ark-color-border));
      border-radius: var(--ark-radius-full);
      box-shadow: var(--ark-shadow-sm);
      color: var(--ark-cursor-label-color, var(--ark-color-ink));
      font-family: var(--ark-font-sans);
      font-size: var(--ark-text-xs);
      left: var(--ark-cursor-size, 20px);
      letter-spacing: var(--ark-tracking-label);
      line-height: 1;
      opacity: 0;
      padding: 0.375em 0.875em;
      position: absolute;
      text-transform: uppercase;
      top: var(--ark-cursor-size, 20px);
      transform: translateY(4px);
      transition:
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-standard);
      white-space: nowrap;
    }

    .chip[data-visible] {
      opacity: 1;
      transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
      .arrow,
      .chip {
        transition: none;
      }
    }
  `;

  override render() {
    return html`
      <div class="mover" aria-hidden="true">
        <svg class="arrow" viewBox="0 0 24 24">
          <path d="M3 2l7.07 16.97 2.51-7.39 7.39-2.51L3 2z" />
        </svg>
        <div class="chip" ?data-visible=${this.label !== ""}>${this.label}</div>
      </div>
    `;
  }
}

export const defineArkCursor = () => {
  defineElement("ark-cursor", ArkCursor);
};

export interface EnableArkCursorOptions {
  /**
   * Extra selectors (beyond the built-in interactive set) that should tint
   * the arrow on hover — e.g. decorative cards: `['.swatch', '.pillar']`.
   */
  interactiveSelectors?: string[];
  /**
   * Chip wording per CSS selector, spread over the built-in defaults
   * (`ark-case-study-card` → "View", `a[href]` → "Open"), so app entries win
   * on conflict; map a selector to `""` to suppress its default chip. Entry
   * order sets match priority; new selectors are checked after the built-ins.
   */
  labels?: Record<string, string>;
}

/**
 * Enable the Arkaes custom cursor for the whole document with a single call.
 *
 * Registers <ark-cursor>, mounts one instance, and keeps it alive across Astro
 * View Transitions (which swap <body>). The element itself decides whether to
 * activate based on pointer capabilities, so calling this on a touch device is
 * a no-op beyond mounting an inert element.
 *
 * @returns a handle whose `destroy()` removes the cursor and its listeners.
 */
export const enableArkCursor = (options: EnableArkCursorOptions = {}) => {
  if (typeof document === "undefined") {
    return { destroy: () => {} };
  }

  defineArkCursor();

  const selector = [
    DEFAULT_INTERACTIVE_SELECTOR,
    ...(options.interactiveSelectors ?? []),
  ].join(", ");
  const labels = { ...DEFAULT_LABELS, ...options.labels };

  const ensure = () => {
    let element = document.querySelector<ArkCursor>("ark-cursor");
    if (!element) {
      element = document.createElement("ark-cursor") as ArkCursor;
      document.body.appendChild(element);
    }
    element.interactive = selector;
    element.labels = labels;
  };

  ensure();
  // Astro View Transitions swap <body> (dropping the element) and reset the
  // root element's attributes; re-ensure after every navigation. The listener
  // is inert in non-Astro apps, where the event never fires.
  document.addEventListener("astro:page-load", ensure);

  return {
    destroy: () => {
      document.removeEventListener("astro:page-load", ensure);
      document.querySelector("ark-cursor")?.remove();
    },
  };
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-cursor": ArkCursor;
  }
}
