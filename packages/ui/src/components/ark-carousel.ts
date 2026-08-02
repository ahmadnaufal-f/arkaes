import { css, html, LitElement, nothing } from "lit";
import { defineElement } from "../define-element";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** How long the track has to sit still before its scroll position is read back. */
const SCROLL_SETTLE_MS = 80;

const arrow = (d: string) => html`
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    aria-hidden="true"
  >
    <path d=${d} stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`;

/**
 * ArkCarousel — a scroll-snapped, button-driven strip that can be scoped to
 * small viewports only.
 *
 * The element owns *carousel* behaviour, not layout. Its track renders as
 * `display: contents` while the carousel is inactive, so slotted children
 * become direct children of the host box for layout purposes: whatever grid or
 * flex rules the consumer puts on `ark-carousel` itself apply to the items
 * untouched, and — because that layout is plain CSS on light DOM — it is
 * already correct in the server-rendered HTML, before the element upgrades.
 * Set `breakpoint` and the element only becomes a carousel at or below that
 * viewport width; leave it off and it is always a carousel.
 *
 * Attributes:
 *   breakpoint (number)   — max viewport width, in px, at which the carousel
 *                           engages. `0`/unset means always.
 *   label (string)        — accessible name, applied while the carousel is active.
 *   prev-label / next-label (string) — accessible names for the arrow buttons.
 *   hide-controls (boolean) — render no navigation row.
 *   hide-counter (boolean)  — keep the arrows, drop the "01 / 04" readout.
 *   active (boolean)        — reflected, read-only: true while in carousel mode.
 *
 * Slots:
 *   (default)  — the carousel items; each direct child is one slide.
 *   prev-icon / next-icon — replace the default arrow glyphs.
 *
 * Events:
 *   ark-carousel:change — bubbles, composed. detail: { index: number, total: number }
 *
 * CSS custom properties (item width is measured against the track's content box
 * and clamped to it, so every slide stays a snap target):
 *   --ark-carousel-item-width     (default: calc(100% - var(--ark-space-8)))
 *   --ark-carousel-gap            (default: var(--ark-space-3))
 *   --ark-carousel-padding-inline (default: var(--ark-space-5))
 *   --ark-carousel-padding-block  (default: var(--ark-space-1))
 *   --ark-carousel-nav-gap        (default: var(--ark-space-5))
 *   --ark-carousel-nav-size       (default: 36px)
 *
 * CSS parts: track, nav, control, control-prev, control-next, counter.
 *
 * @summary A scroll-snapped carousel that can be limited to small screens.
 * @slot - The carousel items; each direct child is one slide.
 * @slot prev-icon - Replaces the previous-arrow glyph.
 * @slot next-icon - Replaces the next-arrow glyph.
 * @fires ark-carousel:change - Bubbles, composed. detail: `{ index: number, total: number }`.
 * @cssprop [--ark-carousel-item-width=calc(100% - var(--ark-space-8))] - Slide width while active.
 * @cssprop [--ark-carousel-gap=var(--ark-space-3)] - Gap between slides.
 * @cssprop [--ark-carousel-padding-inline=var(--ark-space-5)] - Inline padding of the scroll track.
 * @cssprop [--ark-carousel-padding-block=var(--ark-space-1)] - Block padding of the scroll track.
 * @cssprop [--ark-carousel-nav-gap=var(--ark-space-5)] - Gap between the navigation controls.
 * @cssprop [--ark-carousel-nav-size=36px] - Diameter of the arrow buttons.
 * @csspart track - The scroll container (`display: contents` while inactive).
 * @csspart nav - The navigation row.
 * @csspart control - Both arrow buttons.
 * @csspart control-prev - The previous-slide button.
 * @csspart control-next - The next-slide button.
 * @csspart counter - The "01 / 04" position readout.
 */
export class ArkCarousel extends LitElement {
  static override properties = {
    breakpoint: { type: Number, reflect: true },
    label: { type: String },
    prevLabel: { type: String, attribute: "prev-label" },
    nextLabel: { type: String, attribute: "next-label" },
    hideControls: { type: Boolean, reflect: true, attribute: "hide-controls" },
    hideCounter: { type: Boolean, reflect: true, attribute: "hide-counter" },
    active: { type: Boolean, reflect: true },
    // Position is runtime state, not markup: an `index` attribute would be
    // applied before the slot has assigned anything and silently clamp to 0.
    index: { attribute: false },
  };

  breakpoint = 0;
  label = "";
  prevLabel = "Previous slide";
  nextLabel = "Next slide";
  hideControls = false;
  hideCounter = false;

  private _active = false;
  private _index = 0;
  private _items: HTMLElement[] = [];
  private _viewportQuery: MediaQueryList | null = null;
  private _viewportMedia: string | null | undefined;
  private _motionQuery: MediaQueryList | null = null;
  private _scrollTimer?: ReturnType<typeof setTimeout>;

  /**
   * True while the element behaves as a carousel. Derived from `breakpoint`;
   * assigning it directly is overwritten the next time the viewport query
   * fires.
   */
  get active(): boolean {
    return this._active;
  }

  set active(val: boolean) {
    const oldVal = this._active;
    if (oldVal === val) return;
    this._active = val;
    this.requestUpdate("active", oldVal);
    // The track is a different box in each mode, so its scroll offset does not
    // survive the switch — start from the first item rather than reporting a
    // position the strip is not actually at.
    this._setIndex(0);
    void this.updateComplete.then(() => {
      if (this._active) this._scrollToIndex(0, "auto");
    });
  }

  /** Index of the slide currently aligned to the start of the track. */
  get index(): number {
    return this._index;
  }

  set index(val: number) {
    this.goTo(val);
  }

  /** The slotted elements, in DOM order. */
  get items(): HTMLElement[] {
    return this._items;
  }

  static override styles = css`
    :host {
      display: block;
    }

    /*
     * Inactive: the track disappears from the box tree so slotted items are
     * laid out by whatever rules the consumer sets on the host — the desktop
     * grid keeps working, and it works before this element upgrades too.
     */
    .track {
      display: contents;
    }

    :host([active]) .track {
      display: flex;
      gap: var(--ark-carousel-gap, var(--ark-space-3));
      overflow-x: auto;
      overscroll-behavior-x: contain;
      padding-block: var(--ark-carousel-padding-block, var(--ark-space-1));
      padding-inline: var(--ark-carousel-padding-inline, var(--ark-space-5));
      scroll-behavior: smooth;
      scroll-padding-inline-start: var(
        --ark-carousel-padding-inline,
        var(--ark-space-5)
      );
      scroll-snap-type: x mandatory;
      scrollbar-width: none;

      /*
       * Swiping is the native scroll of this box — the arrows are the
       * keyboard/desktop path to the same thing. pan-x pan-y hands horizontal
       * drags to the strip while leaving vertical drags to the page; a bare
       * pan-x would trap the page scroll whenever a finger landed on a slide.
       */
      touch-action: pan-x pan-y;

      /* Chromium/WebKit still need the pseudo-element to hide the bar. */
      &::-webkit-scrollbar {
        display: none;
      }

      &:focus-visible {
        outline: 2px solid var(--ark-color-focus);
        outline-offset: 2px;
      }
    }

    :host([active]) ::slotted(*) {
      flex: 0 0 var(--ark-carousel-item-width, calc(100% - var(--ark-space-8)));
      scroll-snap-align: start;

      /*
       * A snap area wider than the snapport stops being a snap *position* and
       * becomes a snap *range* (CSS Scroll Snap §4.1): every offset where the
       * slide covers the snapport counts as snapped, so a swipe rests wherever
       * the finger lifts instead of landing on the slide edge. Percentages here
       * resolve against the track's content box, which is narrower than the
       * snapport, so this clamp keeps every slide a real snap target however
       * --ark-carousel-item-width is set.
       */
      max-width: 100%;

      /* One swipe, one slide — matching what the arrows do. */
      scroll-snap-stop: always;
    }

    .nav {
      align-items: center;
      display: flex;
      gap: var(--ark-carousel-nav-gap, var(--ark-space-5));
      justify-content: center;
      padding-top: var(--ark-space-5);
    }

    .control {
      align-items: center;
      background: transparent;
      border: 1px solid var(--ark-color-border);
      border-radius: var(--ark-radius-full);
      color: var(--ark-color-text-muted);
      cursor: var(--ark-cursor-interactive, pointer);
      display: flex;
      height: var(--ark-carousel-nav-size, 36px);
      justify-content: center;
      padding: 0;
      transition:
        border-color var(--ark-duration-fast) var(--ark-ease-standard),
        color var(--ark-duration-fast) var(--ark-ease-standard);
      width: var(--ark-carousel-nav-size, 36px);

      &:hover:not(:disabled) {
        border-color: var(--ark-color-accent);
        color: var(--ark-color-accent-strong);
      }

      &:disabled {
        cursor: default;
        opacity: 0.3;
      }

      &:focus-visible {
        outline: 2px solid var(--ark-color-focus);
        outline-offset: 2px;
      }
    }

    .counter {
      color: var(--ark-color-text-subtle);
      font-family: var(--ark-font-mono);
      font-size: var(--ark-text-xs);
      letter-spacing: var(--ark-letter-spacing-mono);
      min-width: 48px;
      text-align: center;
    }

    @media (prefers-reduced-motion: reduce) {
      :host([active]) .track {
        scroll-behavior: auto;
      }

      .control {
        transition: none;
      }
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this._syncViewportQuery();
  }

  override disconnectedCallback() {
    this._teardownViewportQuery();
    this._motionQuery = null;
    clearTimeout(this._scrollTimer);
    super.disconnectedCallback();
  }

  protected override willUpdate() {
    this._syncItems();
  }

  protected override updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has("breakpoint")) this._syncViewportQuery();
    if (changed.has("active") || changed.has("label")) this._syncAria();
  }

  /** Scroll to `index`, clamped to the available slides. */
  goTo(index: number) {
    const total = this._items.length;
    if (total === 0) return;
    const next = Math.min(total - 1, Math.max(0, Math.trunc(index) || 0));
    this._setIndex(next);
    if (this._active) this._scrollToIndex(next);
  }

  /** Scroll to the next slide, if there is one. */
  next() {
    this.goTo(this._index + 1);
  }

  /** Scroll to the previous slide, if there is one. */
  prev() {
    this.goTo(this._index - 1);
  }

  private get _track(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".track");
  }

  private _syncViewportQuery() {
    // No matchMedia (SSR, or a DOM shim without it) means no way to scope the
    // behaviour, so the element falls back to being a plain carousel.
    const scoped =
      typeof window !== "undefined" && !!window.matchMedia && this.breakpoint > 0;
    const media = scoped ? `(max-width: ${this.breakpoint}px)` : null;
    if (media === this._viewportMedia) return;

    this._teardownViewportQuery();
    this._viewportMedia = media;

    if (media === null) {
      this.active = true;
      return;
    }

    this._viewportQuery = window.matchMedia(media);
    this._viewportQuery.addEventListener("change", this._handleViewportChange);
    this.active = this._viewportQuery.matches;
  }

  private _teardownViewportQuery() {
    this._viewportQuery?.removeEventListener(
      "change",
      this._handleViewportChange,
    );
    this._viewportQuery = null;
    this._viewportMedia = undefined;
  }

  private _handleViewportChange = (e: MediaQueryListEvent) => {
    this.active = e.matches;
  };

  /**
   * The carousel semantics only hold while the strip is actually a strip — in
   * grid mode the host is an ordinary layout box, so the role comes off again.
   */
  private _syncAria() {
    if (this._active) {
      this.setAttribute("role", "group");
      this.setAttribute("aria-roledescription", "carousel");
      if (this.label) this.setAttribute("aria-label", this.label);
      else this.removeAttribute("aria-label");
      return;
    }
    this.removeAttribute("role");
    this.removeAttribute("aria-roledescription");
    this.removeAttribute("aria-label");
  }

  private _handleSlotChange = () => {
    // The slide list is recomputed in willUpdate, so a re-render is all this
    // has to ask for.
    this.requestUpdate();
  };

  /**
   * Reads the slides from the default slot. Before the first render there is no
   * slot yet, so the light-DOM children stand in — that keeps the nav correct on
   * the very first paint instead of costing a second render to fix it.
   */
  private _syncItems() {
    const slot =
      this.renderRoot?.querySelector<HTMLSlotElement>("slot:not([name])") ?? null;
    const items = (
      slot
        ? slot.assignedElements({ flatten: true })
        : Array.from(this.children).filter((el) => !el.hasAttribute("slot"))
    ).filter((el): el is HTMLElement => el instanceof HTMLElement);

    if (
      items.length === this._items.length &&
      items.every((item, i) => item === this._items[i])
    ) {
      return;
    }

    this._items = items;
    if (this._index > items.length - 1) {
      this._setIndex(Math.max(0, items.length - 1));
    }
  }

  private _setIndex(next: number) {
    const oldVal = this._index;
    if (oldVal === next) return;
    this._index = next;
    this.requestUpdate("index", oldVal);
    this.dispatchEvent(
      new CustomEvent("ark-carousel:change", {
        bubbles: true,
        composed: true,
        detail: { index: next, total: this._items.length },
      }),
    );
  }

  private _prefersReducedMotion(): boolean {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    this._motionQuery ??= window.matchMedia(REDUCED_MOTION_QUERY);
    return this._motionQuery.matches;
  }

  /**
   * Distance from the track's border-box start edge to the start edge of the
   * snapport — the border, plus the scroll padding the browser aligns
   * `scroll-snap-align: start` against. Targeting this rather than the track's
   * own padding is what makes a button land exactly where a swipe settles, even
   * if a consumer sets scroll-padding independently of padding.
   */
  private _snapportOffset(track: HTMLElement): number {
    const style = getComputedStyle(track);
    const border = parseFloat(style.borderInlineStartWidth) || 0;
    // `auto` (the initial value) means the snapport is the whole scrollport.
    const scrollPadding = parseFloat(style.scrollPaddingInlineStart);
    return border + (Number.isNaN(scrollPadding) ? 0 : scrollPadding);
  }

  /**
   * Scrolls the track itself rather than calling scrollIntoView on the item,
   * which would also scroll every ancestor — including the page — to bring the
   * strip into view.
   */
  private _scrollToIndex(index: number, behavior?: ScrollBehavior) {
    const track = this._track;
    const item = this._items[index];
    if (!track || !item) return;

    const left =
      item.getBoundingClientRect().left -
      track.getBoundingClientRect().left +
      track.scrollLeft -
      this._snapportOffset(track);

    const mode =
      behavior ?? (this._prefersReducedMotion() ? "auto" : "smooth");
    if (typeof track.scrollTo === "function") track.scrollTo({ left, behavior: mode });
    else track.scrollLeft = left;
  }

  /**
   * Swipes and trackpad scrolls move the strip without going through goTo(),
   * so the counter is reconciled from the resting scroll position.
   */
  private _handleScroll = () => {
    if (!this._active) return;
    clearTimeout(this._scrollTimer);
    this._scrollTimer = setTimeout(() => {
      const track = this._track;
      if (!track) return;
      const origin =
        track.getBoundingClientRect().left + this._snapportOffset(track);

      let closest = 0;
      let closestDistance = Infinity;
      this._items.forEach((item, i) => {
        const distance = Math.abs(item.getBoundingClientRect().left - origin);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = i;
        }
      });
      this._setIndex(closest);
    }, SCROLL_SETTLE_MS);
  };

  private _renderNav(total: number) {
    const width = Math.max(2, String(total).length);
    const pad = (n: number) => String(n).padStart(width, "0");

    return html`
      <div class="nav" part="nav">
        <button
          class="control"
          part="control control-prev"
          type="button"
          aria-label=${this.prevLabel}
          ?disabled=${this._index <= 0}
          @click=${this.prev}
        >
          <slot name="prev-icon">${arrow("M10 3 5 8l5 5")}</slot>
        </button>
        ${this.hideCounter
          ? nothing
          : html`
              <span class="counter" part="counter" aria-live="polite">
                ${pad(this._index + 1)} / ${pad(total)}
              </span>
            `}
        <button
          class="control"
          part="control control-next"
          type="button"
          aria-label=${this.nextLabel}
          ?disabled=${this._index >= total - 1}
          @click=${this.next}
        >
          <slot name="next-icon">${arrow("M6 3l5 5-5 5")}</slot>
        </button>
      </div>
    `;
  }

  override render() {
    const total = this._items.length;
    const showNav = this._active && !this.hideControls && total > 1;

    return html`
      <div
        class="track"
        part="track"
        tabindex=${this._active && total > 0 ? "0" : nothing}
        @scroll=${this._handleScroll}
      >
        <slot @slotchange=${this._handleSlotChange}></slot>
      </div>
      ${showNav ? this._renderNav(total) : nothing}
    `;
  }
}

export const defineArkCarousel = () => {
  defineElement("ark-carousel", ArkCarousel);
};

declare global {
  interface HTMLElementTagNameMap {
    "ark-carousel": ArkCarousel;
  }
}
