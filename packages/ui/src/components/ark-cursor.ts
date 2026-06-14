import { css, html, LitElement } from "lit";
import { defineElement } from "../define-element";

const POINTER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const CURSOR_ATTR = "data-custom-cursor";

/**
 * Elements that enlarge the cursor on hover. The set is matched against the
 * full composed path of each pointer event, so it also catches interactive
 * elements rendered inside component shadow roots (e.g. the <button> in
 * <ark-button> or the <a> links in <ark-navigation>).
 */
const DEFAULT_INTERACTIVE_SELECTOR =
  'a[href], button, [role="button"], ark-button, ark-card, ark-case-study-card';

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
 * ArkCursor renders a custom cursor (a dot that tracks the pointer and a ring
 * that trails it) and owns all of its behavior: capability gating, native
 * cursor hiding, and hover-state detection across shadow boundaries.
 *
 * It activates only on devices with a hover-capable, fine pointer. While
 * active it sets `data-custom-cursor` on <html>, which both reveals the dot/
 * ring and flips `--ark-cursor-interactive` to `none` inside every @arkaes/ui
 * component (see @arkaes/tokens).
 *
 * Apps should mount it via {@link enableArkCursor} rather than by hand. Visuals
 * are themeable through the `--ark-cursor-*` custom properties.
 */
export class ArkCursor extends LitElement {
  static override properties = {
    interactive: { type: String },
    active: { type: Boolean, reflect: true },
    hovering: { type: Boolean, reflect: true },
  };

  /** Selector for elements that enlarge the cursor on hover. */
  interactive = DEFAULT_INTERACTIVE_SELECTOR;
  /** Whether the custom cursor is currently running (reflected for styling). */
  active = false;
  /** Whether the pointer is over an interactive element (reflected). */
  hovering = false;

  private _pointerMedia: MediaQueryList | null = null;
  private _motionMedia: MediaQueryList | null = null;
  private _dot: HTMLElement | null = null;
  private _ring: HTMLElement | null = null;
  private _mouseX = 0;
  private _mouseY = 0;
  private _ringX = 0;
  private _ringY = 0;
  private _rafId = 0;

  private _onPointerMove = (event: PointerEvent) => {
    this._mouseX = event.clientX;
    this._mouseY = event.clientY;
    if (this._dot) {
      this._dot.style.left = `${this._mouseX}px`;
      this._dot.style.top = `${this._mouseY}px`;
    }
  };

  private _onPointerOver = (event: PointerEvent) => {
    const next = event
      .composedPath()
      .some(
        (node) => node instanceof Element && node.matches(this.interactive),
      );
    // Lit no-ops when the value is unchanged, so frequent events are cheap.
    this.hovering = next;
  };

  private _animateRing = () => {
    // Ring trails the dot; reduced-motion users get an instant follow.
    const lerp = this._motionMedia?.matches ? 1 : 0.12;
    this._ringX += (this._mouseX - this._ringX) * lerp;
    this._ringY += (this._mouseY - this._ringY) * lerp;
    if (this._ring) {
      this._ring.style.left = `${this._ringX}px`;
      this._ring.style.top = `${this._ringY}px`;
    }
    this._rafId = requestAnimationFrame(this._animateRing);
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
    this._rafId = requestAnimationFrame(this._animateRing);
  }

  private _deactivate() {
    if (!this.active) return;
    this.active = false;
    this.hovering = false;
    document.documentElement.removeAttribute(CURSOR_ATTR);
    document.removeEventListener("pointermove", this._onPointerMove);
    document.removeEventListener("pointerover", this._onPointerOver);
    cancelAnimationFrame(this._rafId);
  }

  override connectedCallback() {
    super.connectedCallback();
    this._pointerMedia = window.matchMedia(POINTER_QUERY);
    this._motionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    this._pointerMedia.addEventListener("change", this._evaluate);
    this._evaluate();
  }

  protected override firstUpdated() {
    this._dot = this.renderRoot.querySelector<HTMLElement>(".dot");
    this._ring = this.renderRoot.querySelector<HTMLElement>(".ring");
  }

  override disconnectedCallback() {
    this._deactivate();
    this._pointerMedia?.removeEventListener("change", this._evaluate);
    this._pointerMedia = null;
    this._motionMedia = null;
    this._dot = null;
    this._ring = null;
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

    .dot,
    .ring {
      border-radius: 50%;
      left: 0;
      pointer-events: none;
      position: fixed;
      top: 0;
      transform: translate(-50%, -50%);
    }

    .dot {
      background: var(--ark-cursor-color, var(--ark-color-accent));
      height: var(--ark-cursor-size, 8px);
      transition:
        background var(--ark-duration-normal),
        height var(--ark-duration-normal),
        width var(--ark-duration-normal);
      width: var(--ark-cursor-size, 8px);
      z-index: var(--ark-cursor-dot-z, 9999);
    }

    .ring {
      border: 1px solid
        var(--ark-cursor-ring-color, var(--ark-color-blush-light));
      height: var(--ark-cursor-ring-size, 32px);
      transition:
        border-color 400ms,
        height 400ms,
        width 400ms;
      width: var(--ark-cursor-ring-size, 32px);
      z-index: var(--ark-cursor-ring-z, 9998);
    }

    :host([hovering]) .dot {
      background: var(--ark-cursor-hover-color, var(--ark-color-counterpoint));
      height: var(--ark-cursor-hover-size, 12px);
      width: var(--ark-cursor-hover-size, 12px);
    }

    :host([hovering]) .ring {
      border-color: var(
        --ark-cursor-ring-hover-color,
        var(--ark-color-sage-light)
      );
      height: var(--ark-cursor-ring-hover-size, 48px);
      width: var(--ark-cursor-ring-hover-size, 48px);
    }

    @media (prefers-reduced-motion: reduce) {
      .dot,
      .ring {
        transition: none;
      }
    }
  `;

  override render() {
    return html`
      <div class="ring" aria-hidden="true"></div>
      <div class="dot" aria-hidden="true"></div>
    `;
  }
}

export const defineArkCursor = () => {
  defineElement("ark-cursor", ArkCursor);
};

export interface EnableArkCursorOptions {
  /**
   * Extra selectors (beyond the built-in interactive set) that should enlarge
   * the cursor on hover — e.g. decorative cards: `['.swatch', '.pillar']`.
   */
  interactiveSelectors?: string[];
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

  const ensure = () => {
    let element = document.querySelector<ArkCursor>("ark-cursor");
    if (!element) {
      element = document.createElement("ark-cursor") as ArkCursor;
      document.body.appendChild(element);
    }
    element.interactive = selector;
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
