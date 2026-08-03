import { css, html, LitElement } from "lit";
import { defineElement } from "../define-element";
import { hasKeyboardFocusWithin } from "../utils/keyboard-focus";
import { isStoryPreview } from "../utils/story-preview";

/**
 * Quiet time (ms) after the last scroll event before the actions settle back
 * in. Kept in step with ark-navigation's immersive header so the two edges of
 * the screen move together.
 */
const SETTLE_MS = 200;

/**
 * ArkFloatingActionContainer docks a row of floating actions to the bottom edge
 * of the viewport, centred over a gradient scrim.
 *
 * It is the bottom-edge counterpart to ark-navigation's immersive header and
 * follows the same scroll rule: the actions step out of the way while the page
 * is moving and settle back in once it stops. The scrim fades in only once the
 * page has scrolled, so a page sitting at its top is left clean.
 *
 * The container has no opinion about what the actions are — it centres whatever
 * is slotted into it. An action that collapses itself (see ark-scroll-top) can
 * cancel the gap it leaves behind with `--ark-floating-action-gap`, which is
 * published here and inherits into slotted children, so the remaining actions
 * stay exactly centred.
 *
 * An action carrying the `open` attribute (an expanded ark-chatbot panel, say)
 * takes the dock: hiding on scroll is suspended, and its neighbours step aside
 * so they do not compete with whatever it put on screen. `open` is the
 * convention across the system (ark-chatbot, ark-dialog, ark-accordion-item);
 * the container mirrors it as `has-open-action` on itself. Hiding is also
 * suspended while the keyboard focus ring is inside the dock.
 *
 * @summary Bottom-docked row of floating actions over a gradient scrim.
 * @slot - The actions to dock. Rendered in a centred row.
 * @csspart scrim - The gradient fill behind the actions.
 * @cssprop [--ark-floating-action-gap=var(--ark-space-3)] - Space between
 *   actions; also what a self-collapsing action subtracts to stay centred.
 * @cssprop [--ark-floating-action-margin-block=var(--ark-space-4)] - Space above
 *   and below the row; the scrim is the row height plus these margins.
 * @cssprop [--ark-floating-action-scrim] - The gradient fill under the actions.
 * @cssprop [--ark-floating-action-hidden-shift=8px] - How far the actions travel
 *   while hidden mid-scroll.
 */
export class ArkFloatingActionContainer extends LitElement {
  static override properties = {
    scrolled: { type: Boolean, reflect: true },
    actionsHidden: {
      type: Boolean,
      reflect: true,
      attribute: "actions-hidden",
    },
    hasOpenAction: {
      type: Boolean,
      reflect: true,
      attribute: "has-open-action",
    },
  };

  private _scrolled = false;
  private _actionsHidden = false;
  private _hasOpenAction = false;
  private _lastScrollY = 0;
  private _settleTimer: number | null = null;
  private _actionObserver: MutationObserver | null = null;

  /** True once the page has scrolled at all — what fades the scrim in. */
  get scrolled(): boolean {
    return this._scrolled;
  }

  set scrolled(val: boolean) {
    const oldVal = this._scrolled;
    if (oldVal !== val) {
      this._scrolled = val;
      this.requestUpdate("scrolled", oldVal);
    }
  }

  /** True while the actions are tucked away mid-scroll. */
  get actionsHidden(): boolean {
    return this._actionsHidden;
  }

  set actionsHidden(val: boolean) {
    const oldVal = this._actionsHidden;
    if (oldVal !== val) {
      this._actionsHidden = val;
      this.requestUpdate("actionsHidden", oldVal);
    }
  }

  /** True while one of the actions carries `open`. Maintained by the container. */
  get hasOpenAction(): boolean {
    return this._hasOpenAction;
  }

  set hasOpenAction(val: boolean) {
    const oldVal = this._hasOpenAction;
    if (oldVal !== val) {
      this._hasOpenAction = val;
      this.requestUpdate("hasOpenAction", oldVal);
    }
  }

  static override styles = css`
    :host {
      --ark-floating-action-gap: var(--ark-space-3);
      --ark-floating-action-margin-block: var(--ark-space-4);
      --ark-floating-action-scrim: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.38),
        rgba(0, 0, 0, 0)
      );
      --ark-floating-action-hidden-shift: 8px;

      align-items: center;
      bottom: 0;
      display: flex;
      gap: var(--ark-floating-action-gap);
      inset-inline: 0;
      justify-content: center;
      padding-block-start: var(--ark-floating-action-margin-block);
      /* Clear the home indicator on phones without eating the space elsewhere. */
      padding-block-end: max(
        var(--ark-floating-action-margin-block),
        env(safe-area-inset-bottom, 0px)
      );
      /* The dock is mostly empty space, so it must not swallow taps meant for
         the page underneath it. The actions opt back in below. */
      pointer-events: none;
      position: fixed;
      z-index: 100;
    }

    /* Sized to the host box — the row height plus both block margins — and
       painted behind the actions on a negative z-index inside the host's own
       stacking context. */
    .scrim {
      background: var(--ark-floating-action-scrim);
      inset: 0;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      transition: opacity var(--ark-duration-normal) var(--ark-ease-standard);
      z-index: -1;
    }

    :host([scrolled]) .scrim {
      opacity: 1;
    }

    ::slotted(*) {
      pointer-events: auto;
      transition:
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-standard);
    }

    /* Mid-scroll only the actions step aside; the scrim stays, since it is what
       keeps the content legible as it travels under the dock. */
    :host([actions-hidden]) ::slotted(*) {
      opacity: 0;
      pointer-events: none;
      transform: translateY(var(--ark-floating-action-hidden-shift));
    }

    /* An action that has opened something takes the dock: whatever it put on
       screen is the task now, and its neighbours would otherwise sit in the
       margin beside it competing for attention. No transform here — an open
       action may be anchoring a fixed panel, and transforming it would become
       that panel's containing block. */
    :host([has-open-action]) ::slotted(*:not([open])) {
      opacity: 0;
      pointer-events: none;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener("scroll", this._handleScroll, { passive: true });
    this.addEventListener("focusin", this._handleFocusIn);
    this._observeActions();
    // Seed the baseline so a page restored mid-document doesn't read as a scroll.
    this._lastScrollY = window.scrollY;
    this._handleScroll();
  }

  override disconnectedCallback() {
    window.removeEventListener("scroll", this._handleScroll);
    this.removeEventListener("focusin", this._handleFocusIn);
    this._actionObserver?.disconnect();
    this._actionObserver = null;
    this._clearSettleTimer();
    super.disconnectedCallback();
  }

  /**
   * An action opens and closes on its own schedule, and CSS cannot see it from
   * in here: `:host(:has([open]))` is evaluated against the shadow tree, where
   * the light-DOM actions are not visible, so it never matches. Watching the
   * attribute and mirroring it onto the host is what gives the stylesheet
   * something to select on.
   */
  private _observeActions() {
    this._syncOpenAction();
    if (typeof MutationObserver === "undefined") return;
    this._actionObserver = new MutationObserver(() => this._syncOpenAction());
    this._actionObserver.observe(this, {
      attributeFilter: ["open"],
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  private _syncOpenAction() {
    this.hasOpenAction = this.querySelector(":scope > [open]") !== null;
  }

  private _handleScroll = () => {
    // The story canvas never scrolls, so a reading there would just overwrite
    // whatever state the story pinned.
    if (isStoryPreview()) return;

    const y = window.scrollY;
    this.scrolled = y > 0;

    const moved = y !== this._lastScrollY;
    this._lastScrollY = y;

    // The observer runs on a microtask, so read the DOM directly rather than
    // trust the mirrored flag on the very frame an action opened.
    this._syncOpenAction();

    // An open action owns the screen — an expanded chat panel must not fade out
    // from under the reader — and a keyboard focus ring must stay visible.
    if (!moved || this.hasOpenAction || hasKeyboardFocusWithin(this)) {
      return;
    }

    this.actionsHidden = true;
    this._restartSettleTimer();
  };

  /** Focus arriving by keyboard brings the actions straight back. */
  private _handleFocusIn = () => {
    if (hasKeyboardFocusWithin(this)) this.actionsHidden = false;
  };

  private _restartSettleTimer() {
    this._clearSettleTimer();
    this._settleTimer = window.setTimeout(() => {
      this._settleTimer = null;
      this.actionsHidden = false;
    }, SETTLE_MS);
  }

  private _clearSettleTimer() {
    if (this._settleTimer !== null) {
      window.clearTimeout(this._settleTimer);
      this._settleTimer = null;
    }
  }

  override render() {
    return html`
      <div class="scrim" part="scrim" aria-hidden="true"></div>
      <slot></slot>
    `;
  }
}

export const defineArkFloatingActionContainer = () => {
  defineElement("ark-floating-action-container", ArkFloatingActionContainer);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-floating-action-container": ArkFloatingActionContainer;
  }
}
