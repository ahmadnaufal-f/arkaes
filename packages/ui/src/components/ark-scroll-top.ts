import { css, html, LitElement } from "lit";
import { defineElement } from "../define-element";
import { isStoryPreview } from "../utils/story-preview";

/**
 * ArkScrollTop is a round button that returns the page to the top and takes
 * itself out of the layout while the page is already there.
 *
 * Collapsing rather than merely fading is what lets it live in
 * ark-floating-action-container: it animates its own width — and subtracts the
 * dock's `--ark-floating-action-gap` from its margins so the gap it leaves goes
 * with it — so the actions beside it slide back to true centre instead of
 * sitting off by half a gap.
 *
 * @summary Back-to-top button that collapses when the page is at the top.
 * @fires ark-scroll-top:activate - Bubbles, composed. Fired after the scroll is
 *   requested, for consumers that want to track the interaction.
 * @csspart button - The button element.
 * @cssprop [--ark-scroll-top-size=3.25rem] - Diameter of the button.
 * @cssprop [--ark-scroll-top-bg=var(--ark-color-surface)] - Button background.
 * @cssprop [--ark-scroll-top-color=var(--ark-color-text)] - Icon colour.
 */
export class ArkScrollTop extends LitElement {
  static override properties = {
    label: { type: String },
    atTop: { type: Boolean, reflect: true, attribute: "at-top" },
  };

  /** Accessible label for the button. */
  label = "Back to top";

  private _atTop = true;

  /**
   * True while the page is at the very top — the state in which the button has
   * nothing to do and collapses away. Set by the element itself; reflected so a
   * parent can style around it.
   */
  get atTop(): boolean {
    return this._atTop;
  }

  set atTop(val: boolean) {
    const oldVal = this._atTop;
    if (oldVal !== val) {
      this._atTop = val;
      this.requestUpdate("atTop", oldVal);
    }
  }

  static override styles = css`
    :host {
      --ark-scroll-top-size: 3.25rem;

      display: inline-flex;
      transition:
        margin var(--ark-duration-normal) var(--ark-ease-standard),
        opacity var(--ark-duration-normal) var(--ark-ease-standard),
        width var(--ark-duration-normal) var(--ark-ease-standard);
      width: var(--ark-scroll-top-size);
    }

    /* Collapsed: zero width, and half the dock's gap taken off each side so the
       gap the browser still draws around this item nets out to nothing and the
       remaining actions stay centred. Works wherever the button sits in the row.
       Outside a dock the gap resolves to 0px and the margins are simply absent.

       The button scales away with the host rather than being clipped by it. The
       host used to carry overflow: hidden to keep the full-width button from
       spilling out of the narrowing box, but that clip cut the button's own drop
       shadow off square at the host edge — a hard grey ledge under a round
       button. A transform takes the button out of the layout question entirely,
       so nothing spills and there is nothing to clip.

       Keyboard focus holds it open: activating with Enter scrolls to the top,
       which is exactly when this rule would otherwise collapse the button out
       from under the focus ring. A pointer press blurs instead (see
       _handleClick), so :focus-within cannot latch on from a tap. */
    :host([at-top]:not(:focus-within)) {
      margin-inline: calc(var(--ark-floating-action-gap, 0px) / -2);
      opacity: 0;
      pointer-events: none;
      width: 0;

      & .button {
        transform: scale(0);
      }
    }

    .button {
      align-items: center;
      aspect-ratio: 1;
      background: var(--ark-scroll-top-bg, var(--ark-color-surface));
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-full);
      box-shadow: var(--ark-shadow-float);
      color: var(--ark-scroll-top-color, var(--ark-color-text));
      cursor: var(--ark-cursor-interactive, pointer);
      display: flex;
      flex: none;
      justify-content: center;
      padding: 0;
      transition:
        background var(--ark-duration-fast) var(--ark-ease-standard),
        box-shadow var(--ark-duration-normal) var(--ark-ease-standard),
        color var(--ark-duration-fast) var(--ark-ease-standard),
        transform var(--ark-duration-normal) var(--ark-ease-spring);
      width: var(--ark-scroll-top-size);

      &:hover {
        background: var(--ark-color-accent-soft);
        color: var(--ark-color-accent-strong);
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0) scale(0.97);
      }

      &:focus-visible {
        outline: 2px solid var(--ark-color-focus);
        outline-offset: 3px;
      }
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener("scroll", this._handleScroll, { passive: true });
    this._handleScroll();
  }

  override disconnectedCallback() {
    window.removeEventListener("scroll", this._handleScroll);
    super.disconnectedCallback();
  }

  private _handleScroll = () => {
    // The story canvas never scrolls, so reading it there would just pin the
    // button collapsed and hide it from its own documentation.
    if (isStoryPreview()) return;
    // `<= 0` rather than `=== 0` so an elastic overscroll past the top, which
    // reports a negative offset, still counts as being at the top.
    this.atTop = window.scrollY <= 0;
  };

  private _handleClick = (e: MouseEvent) => {
    const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    window.scrollTo({ top: 0, behavior });

    // A pointer press leaves focus on a button that is about to collapse to
    // nothing, so hand it back rather than strand the ring on a zero-width box.
    // Keyboard activation (detail 0) keeps focus — that ring is the user's place
    // in the page, and the collapse waits for them to tab away.
    if (e.detail !== 0) {
      this.renderRoot.querySelector<HTMLButtonElement>(".button")?.blur();
    }

    this.dispatchEvent(
      new CustomEvent("ark-scroll-top:activate", {
        bubbles: true,
        composed: true,
      }),
    );
  };

  override render() {
    return html`
      <button
        class="button"
        part="button"
        type="button"
        aria-label=${this.label}
        data-cursor-label="Top"
        tabindex=${this.atTop ? -1 : 0}
        @click=${this._handleClick}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M10 16V5" />
          <path d="M5 10l5-5 5 5" />
        </svg>
      </button>
    `;
  }
}

export const defineArkScrollTop = () => {
  defineElement("ark-scroll-top", ArkScrollTop);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-scroll-top": ArkScrollTop;
  }
}
